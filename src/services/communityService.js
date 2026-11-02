import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  updateDoc,
  writeBatch
} from 'firebase/firestore';
import { calculateMeetingScoreForMember } from '../core/communityRules';
import {
  INITIAL_COMMUNITY_CONFIG,
  INITIAL_MEETINGS,
  INITIAL_MEMBERS,
  INITIAL_SCORE_LOGS
} from '../core/initialData';
import { db, isFirebaseConfigured } from './firebase';

const STORAGE_KEYS = {
  members: 'heal_community_v1_members',
  meetings: 'heal_community_v1_meetings',
  scoreLogs: 'heal_community_v1_score_logs',
  config: 'heal_community_v1_config',
  currentUserUid: 'heal_community_v1_current_uid'
};

const localListeners = new Set();

const readLocalJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeLocalJson = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('LocalStorage write failed:', err);
  }
};

const getLocalState = () => ({
  members: readLocalJson(STORAGE_KEYS.members, INITIAL_MEMBERS),
  meetings: readLocalJson(STORAGE_KEYS.meetings, INITIAL_MEETINGS),
  scoreLogs: readLocalJson(STORAGE_KEYS.scoreLogs, INITIAL_SCORE_LOGS),
  communityConfig: readLocalJson(STORAGE_KEYS.config, INITIAL_COMMUNITY_CONFIG)
});

const notifyLocalListeners = () => {
  const snapshot = getLocalState();
  for (const listener of localListeners) {
    listener(snapshot);
  }
};

/**
 * Persists selected currentUserUid in localStorage for session continuity across page reloads.
 */
export const getSavedCurrentUserUid = () => {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.currentUserUid);
    if (val === '__NONE__') return null;
    return val || 'kakao:1001';
  } catch {
    return 'kakao:1001';
  }
};

export const saveCurrentUserUid = (uid) => {
  try {
    localStorage.setItem(STORAGE_KEYS.currentUserUid, uid || '__NONE__');
  } catch {
    // ignore storage errors
  }
};

/**
 * Seeds initial demo data into Firestore if the 'members' collection is completely empty.
 */
const ensureFirestoreSeeded = async () => {
  if (!isFirebaseConfigured || !db) return;
  try {
    const existingMembers = await getDocs(collection(db, 'members'));
    if (!existingMembers.empty) return;

    const batch = writeBatch(db);
    for (const m of INITIAL_MEMBERS) {
      batch.set(doc(db, 'members', m.uid), m);
    }
    for (const mtg of INITIAL_MEETINGS) {
      batch.set(doc(db, 'meetings', mtg.id), mtg);
    }
    for (const log of INITIAL_SCORE_LOGS) {
      batch.set(doc(db, 'scoreLogs', log.id), log);
    }
    batch.set(doc(db, 'settings', 'community'), INITIAL_COMMUNITY_CONFIG);
    await batch.commit();
  } catch (err) {
    console.warn('Firestore initial seed skipped:', err);
  }
};

/**
 * Subscribes to community data in real-time (Firestore onSnapshot or LocalStorage fallback).
 */
export const subscribeCommunityData = (onUpdate) => {
  if (!isFirebaseConfigured || !db) {
    // Ensure initial local state is saved once
    if (!localStorage.getItem(STORAGE_KEYS.members)) {
      writeLocalJson(STORAGE_KEYS.members, INITIAL_MEMBERS);
      writeLocalJson(STORAGE_KEYS.meetings, INITIAL_MEETINGS);
      writeLocalJson(STORAGE_KEYS.scoreLogs, INITIAL_SCORE_LOGS);
      writeLocalJson(STORAGE_KEYS.config, INITIAL_COMMUNITY_CONFIG);
    }
    localListeners.add(onUpdate);
    onUpdate(getLocalState());
    return () => {
      localListeners.delete(onUpdate);
    };
  }

  let currentData = {
    members: INITIAL_MEMBERS,
    meetings: INITIAL_MEETINGS,
    scoreLogs: INITIAL_SCORE_LOGS,
    communityConfig: INITIAL_COMMUNITY_CONFIG
  };

  ensureFirestoreSeeded();

  const unsubMembers = onSnapshot(collection(db, 'members'), (snap) => {
    if (!snap.empty) {
      currentData = {
        ...currentData,
        members: snap.docs.map((d) => d.data())
      };
      onUpdate(currentData);
    }
  });

  const unsubMeetings = onSnapshot(collection(db, 'meetings'), (snap) => {
    if (!snap.empty) {
      currentData = {
        ...currentData,
        meetings: snap.docs.map((d) => d.data())
      };
      onUpdate(currentData);
    }
  });

  const unsubLogs = onSnapshot(collection(db, 'scoreLogs'), (snap) => {
    if (!snap.empty) {
      currentData = {
        ...currentData,
        scoreLogs: snap.docs.map((d) => d.data())
      };
      onUpdate(currentData);
    }
  });

  const unsubConfig = onSnapshot(doc(db, 'settings', 'community'), (snap) => {
    if (snap.exists()) {
      currentData = {
        ...currentData,
        communityConfig: snap.data()
      };
      onUpdate(currentData);
    }
  });

  return () => {
    unsubMembers();
    unsubMeetings();
    unsubLogs();
    unsubConfig();
  };
};

/**
 * Registers a new member from Onboarding and returns the created member object.
 */
export const registerOnboardingMember = async (form) => {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const newUid = `kakao:${Date.now()}`;

  const newMember = {
    uid: newUid,
    realName: form.realName.trim(),
    city: form.city.trim(),
    homeCity: (form.homeCity || form.city).trim(),
    maritalStatus: form.maritalStatus,
    gender: form.gender,
    role: 'Member',
    entryBadge: `${mm}${dd}`,
    customBadge: '',
    attendanceCount: 0,
    baseScore: 0,
    expeditionScore: 0,
    eventScore: 0,
    totalScore: 0,
    monthlyScore: 0
  };

  if (isFirebaseConfigured && db) {
    await setDoc(doc(db, 'members', newUid), newMember);
  } else {
    const { members } = getLocalState();
    writeLocalJson(STORAGE_KEYS.members, [...members, newMember]);
    notifyLocalListeners();
  }

  return newMember;
};

/**
 * Updates a member's own profile fields.
 */
export const updateMemberProfile = async (uid, updatedFields) => {
  if (isFirebaseConfigured && db) {
    await updateDoc(doc(db, 'members', uid), updatedFields);
    return;
  }

  const { members } = getLocalState();
  const nextMembers = members.map((m) =>
    m.uid === uid ? { ...m, ...updatedFields } : m
  );
  writeLocalJson(STORAGE_KEYS.members, nextMembers);
  notifyLocalListeners();
};

/**
 * Toggles meeting attendance application for a member.
 */
export const toggleMeetingApplicant = async (meetingId, uid) => {
  const { meetings } = getLocalState();
  const target = meetings.find((m) => m.id === meetingId);
  if (!target || target.status !== 'open') return;

  const exists = target.applicants.includes(uid);
  const nextApplicants = exists
    ? target.applicants.filter((id) => id !== uid)
    : [...target.applicants, uid];

  if (isFirebaseConfigured && db) {
    await updateDoc(doc(db, 'meetings', meetingId), {
      applicants: nextApplicants
    });
    return;
  }

  const nextMeetings = meetings.map((m) =>
    m.id === meetingId ? { ...m, applicants: nextApplicants } : m
  );
  writeLocalJson(STORAGE_KEYS.meetings, nextMeetings);
  notifyLocalListeners();
};

/**
 * Creates a new meeting (벙).
 */
export const createMeeting = async (hostUid, meetingInput) => {
  const created = {
    id: `mtg-${Date.now()}`,
    title: meetingInput.title,
    date: meetingInput.date,
    location: meetingInput.location,
    placeDetail: meetingInput.placeDetail,
    hostUid,
    type: meetingInput.type,
    status: 'open',
    applicants: [hostUid],
    confirmedParticipants: [],
    description: meetingInput.description
  };

  if (isFirebaseConfigured && db) {
    await setDoc(doc(db, 'meetings', created.id), created);
    return created;
  }

  const { meetings } = getLocalState();
  writeLocalJson(STORAGE_KEYS.meetings, [created, ...meetings]);
  notifyLocalListeners();
  return created;
};

/**
 * Settles an open meeting: updates meeting status to 'settled', awards points (+1 base, +2 expedition),
 * increments attendanceCount, and records score logs atomically.
 */
export const settleMeetingWithScores = async (
  meetingId,
  confirmedUids,
  currentMembers,
  currentMeetings
) => {
  const targetMeeting = currentMeetings.find((m) => m.id === meetingId);
  if (!targetMeeting || targetMeeting.status === 'settled') return;

  const todayStr = new Date().toISOString().slice(0, 10);
  const newLogs = [];

  const updatedMembers = currentMembers.map((member) => {
    if (!confirmedUids.includes(member.uid)) return member;
    const calc = calculateMeetingScoreForMember(
      member,
      targetMeeting.location
    );

    newLogs.push({
      id: `log-${Date.now()}-${member.uid}`,
      uid: member.uid,
      type: 'meeting',
      title: `${targetMeeting.title} 참석 확정${
        calc.isExpedition
          ? ` (${member.homeCity}→${targetMeeting.location} 원정)`
          : ''
      }`,
      baseDelta: calc.base,
      expeditionDelta: calc.expedition,
      eventDelta: 0,
      totalDelta: calc.total,
      date: todayStr
    });

    return {
      ...member,
      attendanceCount: member.attendanceCount + 1,
      baseScore: member.baseScore + calc.base,
      expeditionScore: member.expeditionScore + calc.expedition,
      totalScore: member.totalScore + calc.total,
      monthlyScore: (member.monthlyScore || 0) + calc.total
    };
  });

  if (isFirebaseConfigured && db) {
    const batch = writeBatch(db);
    batch.update(doc(db, 'meetings', meetingId), {
      status: 'settled',
      confirmedParticipants: confirmedUids
    });

    for (const member of updatedMembers) {
      if (confirmedUids.includes(member.uid)) {
        batch.set(doc(db, 'members', member.uid), member);
      }
    }

    for (const log of newLogs) {
      batch.set(doc(db, 'scoreLogs', log.id), log);
    }

    await batch.commit();
    return;
  }

  const nextMeetings = currentMeetings.map((m) =>
    m.id === meetingId
      ? { ...m, status: 'settled', confirmedParticipants: confirmedUids }
      : m
  );
  const { scoreLogs } = getLocalState();

  writeLocalJson(STORAGE_KEYS.members, updatedMembers);
  writeLocalJson(STORAGE_KEYS.meetings, nextMeetings);
  writeLocalJson(STORAGE_KEYS.scoreLogs, [...newLogs, ...scoreLogs]);
  notifyLocalListeners();
};

/**
 * Admin: updates member role or customBadge.
 */
export const adminUpdateMember = async (targetUid, patch) => {
  if (isFirebaseConfigured && db) {
    await updateDoc(doc(db, 'members', targetUid), patch);
    return;
  }

  const { members } = getLocalState();
  const nextMembers = members.map((m) =>
    m.uid === targetUid ? { ...m, ...patch } : m
  );
  writeLocalJson(STORAGE_KEYS.members, nextMembers);
  notifyLocalListeners();
};

/**
 * Admin: manually grants or deducts event score and logs the reason.
 */
export const adminAdjustEventScore = async (
  targetUid,
  delta,
  reason,
  currentMembers
) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const logEntry = {
    id: `log-${Date.now()}`,
    uid: targetUid,
    type: 'event',
    title: `[운영진 이벤트] ${reason}`,
    baseDelta: 0,
    expeditionDelta: 0,
    eventDelta: delta,
    totalDelta: delta,
    date: todayStr
  };

  const targetMember = currentMembers.find((m) => m.uid === targetUid);
  if (!targetMember) return;

  const updatedMember = {
    ...targetMember,
    eventScore: targetMember.eventScore + delta,
    totalScore: targetMember.totalScore + delta,
    monthlyScore: (targetMember.monthlyScore || 0) + delta
  };

  if (isFirebaseConfigured && db) {
    const batch = writeBatch(db);
    batch.set(doc(db, 'members', targetUid), updatedMember);
    batch.set(doc(db, 'scoreLogs', logEntry.id), logEntry);
    await batch.commit();
    return;
  }

  const nextMembers = currentMembers.map((m) =>
    m.uid === targetUid ? updatedMember : m
  );
  const { scoreLogs } = getLocalState();

  writeLocalJson(STORAGE_KEYS.members, nextMembers);
  writeLocalJson(STORAGE_KEYS.scoreLogs, [logEntry, ...scoreLogs]);
  notifyLocalListeners();
};

/**
 * Admin: updates community notice and rules config.
 */
export const updateCommunityConfig = async (nextConfig) => {
  if (isFirebaseConfigured && db) {
    await setDoc(doc(db, 'settings', 'community'), nextConfig, { merge: true });
    return;
  }

  writeLocalJson(STORAGE_KEYS.config, nextConfig);
  notifyLocalListeners();
};

/**
 * Resets local storage back to initial clean demo data.
 */
export const resetToInitialDemoData = () => {
  writeLocalJson(STORAGE_KEYS.members, INITIAL_MEMBERS);
  writeLocalJson(STORAGE_KEYS.meetings, INITIAL_MEETINGS);
  writeLocalJson(STORAGE_KEYS.scoreLogs, INITIAL_SCORE_LOGS);
  writeLocalJson(STORAGE_KEYS.config, INITIAL_COMMUNITY_CONFIG);
  saveCurrentUserUid('kakao:1001');
  notifyLocalListeners();
};

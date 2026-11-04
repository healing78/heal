import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  updateDoc,
  writeBatch
} from 'firebase/firestore';
import {
  calculateMeetingScoreForMember,
  generateMeetingId,
  REGION_GROUPS
} from '../core/communityRules';
import {
  INITIAL_COMMUNITY_CONFIG,
  INITIAL_MEETINGS,
  INITIAL_MEMBERS,
  INITIAL_SCORE_LOGS
} from '../core/initialData';
import { db, isFirebaseConfigured } from './firebase';

const STORAGE_KEYS = {
  members: 'heal_community_v2_members',
  meetings: 'heal_community_v2_meetings',
  scoreLogs: 'heal_community_v2_score_logs',
  config: 'heal_community_v2_config',
  currentUserUid: 'heal_community_v2_current_uid'
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

const sanitizeBungText = (str) =>
  typeof str === 'string'
    ? str
        .replace(/\s*\(공식벙\)/g, '')
        .replace(/\s*\(벙\)/g, '')
        .replace(/벙 규칙/g, '모임 규칙')
    : str;

const sanitizeMeetingItem = (mtg) =>
  mtg ? { ...mtg, title: sanitizeBungText(mtg.title) } : mtg;

const sanitizeConfig = (cfg) => {
  if (!cfg) return INITIAL_COMMUNITY_CONFIG;
  return {
    ...INITIAL_COMMUNITY_CONFIG,
    ...cfg,
    homeSummary: sanitizeBungText(
      cfg.homeSummary || INITIAL_COMMUNITY_CONFIG.homeSummary
    ),
    noticeTitle: sanitizeBungText(
      cfg.noticeTitle || INITIAL_COMMUNITY_CONFIG.noticeTitle
    ),
    noticeBody: sanitizeBungText(
      cfg.noticeBody || INITIAL_COMMUNITY_CONFIG.noticeBody
    )
  };
};

const getLocalState = () => ({
  members: readLocalJson(STORAGE_KEYS.members, INITIAL_MEMBERS),
  meetings: readLocalJson(STORAGE_KEYS.meetings, INITIAL_MEETINGS).map(
    sanitizeMeetingItem
  ),
  scoreLogs: readLocalJson(STORAGE_KEYS.scoreLogs, INITIAL_SCORE_LOGS),
  communityConfig: sanitizeConfig(
    readLocalJson(STORAGE_KEYS.config, INITIAL_COMMUNITY_CONFIG)
  )
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
 * Seeds initial demo data into Firestore if the 'members' collection is completely empty,
 * or migrates legacy 'mtg-*' demo meetings to the v2 YYMMDD01 schema.
 */
const ensureFirestoreSeeded = async () => {
  if (!isFirebaseConfigured || !db) return;
  try {
    const existingMeetings = await getDocs(collection(db, 'meetings'));
    const hasV2Meeting = existingMeetings.docs.some((d) =>
      /^\d{8}$/.test(String(d.id))
    );

    if (existingMeetings.empty || !hasV2Meeting) {
      const batch = writeBatch(db);
      for (const m of INITIAL_MEMBERS) {
        batch.set(doc(db, 'members', m.uid), m, { merge: true });
      }
      for (const oldDoc of existingMeetings.docs) {
        if (String(oldDoc.id).startsWith('mtg-')) {
          batch.delete(doc(db, 'meetings', oldDoc.id));
        }
      }
      for (const mtg of INITIAL_MEETINGS) {
        batch.set(doc(db, 'meetings', mtg.id), mtg);
      }
      for (const log of INITIAL_SCORE_LOGS) {
        batch.set(doc(db, 'scoreLogs', log.id), log, { merge: true });
      }
      batch.set(doc(db, 'settings', 'community'), INITIAL_COMMUNITY_CONFIG, {
        merge: true
      });
      await batch.commit();
    }
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

  const handleSnapshotError = (err) => {
    console.warn('Firestore snapshot fallback to LocalStorage:', err.code);
    onUpdate(getLocalState());
  };

  const unsubMembers = onSnapshot(
    collection(db, 'members'),
    (snap) => {
      if (!snap.empty) {
        currentData = {
          ...currentData,
          members: snap.docs.map((d) => d.data())
        };
        writeLocalJson(STORAGE_KEYS.members, currentData.members);
        onUpdate(currentData);
      }
    },
    handleSnapshotError
  );

  const unsubMeetings = onSnapshot(
    collection(db, 'meetings'),
    (snap) => {
      if (!snap.empty) {
        currentData = {
          ...currentData,
          meetings: snap.docs.map((d) => sanitizeMeetingItem(d.data()))
        };
        writeLocalJson(STORAGE_KEYS.meetings, currentData.meetings);
        onUpdate(currentData);
      }
    },
    handleSnapshotError
  );

  const unsubLogs = onSnapshot(
    collection(db, 'scoreLogs'),
    (snap) => {
      if (!snap.empty) {
        currentData = {
          ...currentData,
          scoreLogs: snap.docs.map((d) => d.data())
        };
        writeLocalJson(STORAGE_KEYS.scoreLogs, currentData.scoreLogs);
        onUpdate(currentData);
      }
    },
    handleSnapshotError
  );

  const unsubConfig = onSnapshot(
    doc(db, 'settings', 'community'),
    (snap) => {
      if (snap.exists()) {
        currentData = {
          ...currentData,
          communityConfig: sanitizeConfig(snap.data())
        };
        writeLocalJson(STORAGE_KEYS.config, currentData.communityConfig);
        onUpdate(currentData);
      }
    },
    handleSnapshotError
  );

  return () => {
    unsubMembers();
    unsubMeetings();
    unsubLogs();
    unsubConfig();
  };
};

/**
 * Registers a new member from Onboarding and returns the created member object.
 * @param {Object} form - Onboarding form values
 * @param {string} [customUid] - Optional pre-verified Kakao UID (e.g. 'kakao:12345678')
 */
export const registerOnboardingMember = async (form, customUid) => {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const newUid = customUid || `kakao:${Date.now()}`;

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
    bankAccount: (form.bankAccount || '').trim(),
    attendanceCount: 0,
    baseScore: 0,
    expeditionScore: 0,
    eventScore: 0,
    totalScore: 0,
    monthlyScore: 0
  };

  const { members } = getLocalState();
  writeLocalJson(STORAGE_KEYS.members, [...members, newMember]);
  notifyLocalListeners();

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'members', newUid), newMember);
    } catch (err) {
      console.warn('Firestore write fallback (registerOnboardingMember):', err.code);
    }
  }

  return newMember;
};

/**
 * Updates a member's own profile fields.
 */
export const updateMemberProfile = async (uid, updatedFields) => {
  const { members } = getLocalState();
  const nextMembers = members.map((m) =>
    m.uid === uid ? { ...m, ...updatedFields } : m
  );
  writeLocalJson(STORAGE_KEYS.members, nextMembers);
  notifyLocalListeners();

  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'members', uid), updatedFields);
    } catch (err) {
      console.warn('Firestore write fallback (updateMemberProfile):', err.code);
    }
  }
};

/**
 * Toggles meeting attendance application for a member (and syncs 1차 round participation).
 */
export const toggleMeetingApplicant = async (meetingId, uid) => {
  const { meetings } = getLocalState();
  const target = meetings.find((m) => String(m.id) === String(meetingId));
  if (!target || target.status !== 'open') return;

  const exists = (target.applicants || []).includes(uid);
  const nextApplicants = exists
    ? target.applicants.filter((id) => id !== uid)
    : [...(target.applicants || []), uid];

  // Also sync 1st round participants by default when applying/cancelling
  const currentRounds = Array.isArray(target.rounds) ? target.rounds : [];
  const nextRounds = currentRounds.map((r, idx) => {
    const rParts = Array.isArray(r.participants) ? r.participants : [];
    if (exists) {
      return { ...r, participants: rParts.filter((id) => id !== uid) };
    }
    if (idx === 0 && !rParts.includes(uid)) {
      return { ...r, participants: [...rParts, uid] };
    }
    return r;
  });

  const patch = {
    applicants: nextApplicants,
    rounds: nextRounds
  };

  const nextMeetings = meetings.map((m) =>
    String(m.id) === String(meetingId) ? { ...m, ...patch } : m
  );
  writeLocalJson(STORAGE_KEYS.meetings, nextMeetings);
  notifyLocalListeners();

  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'meetings', String(meetingId)), patch);
    } catch (err) {
      console.warn('Firestore write fallback (toggleMeetingApplicant):', err.code);
    }
  }
};

/**
 * Extracts a short city/region keyword from a free-form location string for 7-region expedition scoring.
 */
const extractRegionFromLocationInput = (rawInput, fallbackCity = '서울') => {
  const clean = String(rawInput || '').trim();
  if (!clean) return fallbackCity || '서울';

  for (const group of REGION_GROUPS) {
    const matched = group.keywords.find((kw) => clean.includes(kw));
    if (matched) return matched;
  }
  return clean.split(/\s+/)[0] || fallbackCity || '서울';
};

/**
 * Creates a new schedule/meeting with YYMMDD + 01 ID format and multi-round structure.
 */
export const createMeeting = async (hostUid, meetingInput) => {
  const { meetings, members } = getLocalState();
  const hostMember = members.find((m) => m.uid === hostUid);
  const dateOnly = meetingInput.dateOnly || '2026-11-04';
  const endDateOnly = meetingInput.endDateOnly || dateOnly;
  const allDay = Boolean(meetingInput.allDay);
  const startTime = allDay ? '00:00' : meetingInput.startTime || '12:00';
  const endTime = allDay ? '23:59' : meetingInput.endTime || '13:00';
  const combinedDate = `${dateOnly} ${startTime}`;
  const newId = generateMeetingId(dateOnly, meetings);

  const rawPlaceInput = (
    meetingInput.placeDetail ??
    meetingInput.location ??
    ''
  ).trim();
  const resolvedLocation = extractRegionFromLocationInput(
    rawPlaceInput,
    hostMember?.city || '서울'
  );

  const inputRounds =
    Array.isArray(meetingInput.rounds) && meetingInput.rounds.length > 0
      ? meetingInput.rounds.map((r, idx) => ({
          id: r.id || `r-${idx + 1}`,
          label: `${idx + 1}차`,
          placeName: (r.placeName || rawPlaceInput).trim(),
          mapUrl: (r.mapUrl || '').trim(),
          participants: Array.isArray(r.participants)
            ? r.participants
            : idx === 0
              ? [hostUid]
              : [],
          payerUid: r.payerUid || meetingInput.treasurerUid || hostUid,
          cost: Number(r.cost) || 0,
          receiptUrl: r.receiptUrl || '',
          isGoldenBell: Boolean(r.isGoldenBell),
          goldenBellUid: r.goldenBellUid || ''
        }))
      : [
          {
            id: 'r-1',
            label: '1차',
            placeName: rawPlaceInput,
            mapUrl: '',
            participants: [hostUid],
            payerUid: meetingInput.treasurerUid || hostUid,
            cost: 0,
            receiptUrl: '',
            isGoldenBell: false,
            goldenBellUid: ''
          }
        ];

  const created = {
    id: newId,
    title: sanitizeBungText(meetingInput.title.trim()),
    dateOnly,
    endDateOnly,
    startTime,
    endTime,
    allDay,
    reminder: meetingInput.reminder || '15분 전',
    requestAttendance:
      meetingInput.requestAttendance !== undefined
        ? Boolean(meetingInput.requestAttendance)
        : true,
    date: combinedDate,
    location: resolvedLocation,
    placeDetail: inputRounds[0]?.placeName || rawPlaceInput,
    hostUid,
    treasurerUid: meetingInput.treasurerUid || hostUid,
    type: meetingInput.type || 'Casual',
    status: 'open',
    applicants: [hostUid],
    confirmedParticipants: [],
    description: (meetingInput.description || '').trim(),
    roundingRule: 'floor100',
    rounds: inputRounds,
    sponsorships: [],
    manualAmounts: {},
    paymentStatuses: {},
    safeReturns: {},
    likes: [],
    comments: [],
    album: [],
    randomBoxConfig: meetingInput.randomBoxConfig || {
      enabled: true,
      requiredBoxes: 1,
      quizQuestion: meetingInput.quizQuestion || '',
      quizAnswer: meetingInput.quizAnswer || '',
      minMetCount: 3,
      minAttendanceCount: 10
    }
  };

  writeLocalJson(STORAGE_KEYS.meetings, [created, ...meetings]);
  notifyLocalListeners();

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'meetings', created.id), created);
    } catch (err) {
      console.warn('Firestore write fallback (createMeeting):', err.code);
    }
  }
  return created;
};

/**
 * Updates any field of a meeting (info, rounds, sponsorships, manualAmounts, paymentStatuses, safeReturns).
 */
export const updateMeetingDetails = async (meetingId, patch) => {
  const { meetings } = getLocalState();
  const nextMeetings = meetings.map((m) =>
    String(m.id) === String(meetingId) ? { ...m, ...patch } : m
  );
  writeLocalJson(STORAGE_KEYS.meetings, nextMeetings);
  notifyLocalListeners();

  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'meetings', String(meetingId)), patch);
    } catch (err) {
      console.warn('Firestore write fallback (updateMeetingDetails):', err.code);
    }
  }
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
        calc.isOverseas
          ? ' (해외 원정 +2점)'
          : calc.isExpedition
            ? ` (${calc.label})`
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

  if (isFirebaseConfigured && db) {
    try {
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
    } catch (err) {
      console.warn('Firestore write fallback (settleMeetingWithScores):', err.code);
    }
  }
};

/**
 * Admin: updates member role or customBadge.
 */
export const adminUpdateMember = async (targetUid, patch) => {
  const { members } = getLocalState();
  const nextMembers = members.map((m) =>
    m.uid === targetUid ? { ...m, ...patch } : m
  );
  writeLocalJson(STORAGE_KEYS.members, nextMembers);
  notifyLocalListeners();

  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'members', targetUid), patch);
    } catch (err) {
      console.warn('Firestore write fallback (adminUpdateMember):', err.code);
    }
  }
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

  const nextMembers = currentMembers.map((m) =>
    m.uid === targetUid ? updatedMember : m
  );
  const { scoreLogs } = getLocalState();

  writeLocalJson(STORAGE_KEYS.members, nextMembers);
  writeLocalJson(STORAGE_KEYS.scoreLogs, [logEntry, ...scoreLogs]);
  notifyLocalListeners();

  if (isFirebaseConfigured && db) {
    try {
      const batch = writeBatch(db);
      batch.set(doc(db, 'members', targetUid), updatedMember);
      batch.set(doc(db, 'scoreLogs', logEntry.id), logEntry);
      await batch.commit();
    } catch (err) {
      console.warn('Firestore write fallback (adminAdjustEventScore):', err.code);
    }
  }
};

/**
 * Admin: updates community notice and rules config.
 */
export const updateCommunityConfig = async (nextConfig) => {
  writeLocalJson(STORAGE_KEYS.config, nextConfig);
  notifyLocalListeners();

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'settings', 'community'), nextConfig, { merge: true });
    } catch (err) {
      console.warn('Firestore write fallback (updateCommunityConfig):', err.code);
    }
  }
};

/**
 * Adds a media item (photo or video) to a meeting's album.
 */
export const addMeetingMediaItem = async (meetingId, mediaItem) => {
  const { meetings } = getLocalState();
  const target = meetings.find((m) => String(m.id) === String(meetingId));
  if (!target) return;

  const currentAlbum = Array.isArray(target.album) ? target.album : [];
  const nextAlbum = [mediaItem, ...currentAlbum];

  const nextMeetings = meetings.map((m) =>
    String(m.id) === String(meetingId) ? { ...m, album: nextAlbum } : m
  );
  writeLocalJson(STORAGE_KEYS.meetings, nextMeetings);
  notifyLocalListeners();

  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'meetings', String(meetingId)), { album: nextAlbum });
    } catch (err) {
      console.warn('Firestore write fallback (addMeetingMediaItem):', err.code);
    }
  }
};

/**
 * Removes a media item from a meeting's album.
 */
export const deleteMeetingMediaItem = async (meetingId, mediaId) => {
  const { meetings } = getLocalState();
  const target = meetings.find((m) => String(m.id) === String(meetingId));
  if (!target) return;

  const currentAlbum = Array.isArray(target.album) ? target.album : [];
  const nextAlbum = currentAlbum.filter((item) => item.id !== mediaId);

  const nextMeetings = meetings.map((m) =>
    String(m.id) === String(meetingId) ? { ...m, album: nextAlbum } : m
  );
  writeLocalJson(STORAGE_KEYS.meetings, nextMeetings);
  notifyLocalListeners();

  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'meetings', String(meetingId)), { album: nextAlbum });
    } catch (err) {
      console.warn('Firestore write fallback (deleteMeetingMediaItem):', err.code);
    }
  }
};

/**
 * Unlocks a meeting's album for a user via Random Box.
 */
export const unlockMeetingAlbumForUser = async (userUid, meetingId) => {
  const { members } = getLocalState();
  const member = members.find((m) => m.uid === userUid);
  if (!member) return;

  const currentUnlocked = Array.isArray(member.unlockedAlbums)
    ? member.unlockedAlbums
    : [];
  if (currentUnlocked.includes(meetingId)) return;

  const nextUnlocked = [...currentUnlocked, meetingId];
  const nextMembers = members.map((m) =>
    m.uid === userUid ? { ...m, unlockedAlbums: nextUnlocked } : m
  );

  writeLocalJson(STORAGE_KEYS.members, nextMembers);
  notifyLocalListeners();

  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'members', userUid), {
        unlockedAlbums: nextUnlocked
      });
    } catch (err) {
      console.warn('Firestore write fallback (unlockMeetingAlbumForUser):', err.code);
    }
  }
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

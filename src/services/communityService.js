import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  updateDoc,
  writeBatch
} from 'firebase/firestore';
import {
  calculateMeetingScoreForMember,
  cleanScheduleLocation,
  detectMeetingRegion,
  detectRegionFromText,
  generateMeetingId,
  getMemberTotalScore,
  REGION_GROUPS,
  resolveMemberBadge
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
  currentUserUid: 'heal_community_v2_current_uid',
  loginLogs: 'heal_community_v2_login_logs',
  deletedMeetingIds: 'heal_community_v2_deleted_meetings'
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

const sanitizeMeetingItem = (mtg) => {
  if (!mtg) return mtg;
  const r1Place = (mtg.rounds && mtg.rounds[0]?.placeName) || '';
  const cleanLoc = cleanScheduleLocation(mtg.location, r1Place);
  const cleanPlace = cleanScheduleLocation(mtg.placeDetail, r1Place);
  return {
    ...mtg,
    title: sanitizeBungText(mtg.title),
    location: cleanLoc || (mtg.location === r1Place ? '' : mtg.location) || '',
    placeDetail: cleanPlace || (mtg.placeDetail === r1Place ? '' : mtg.placeDetail) || ''
  };
};

const sanitizeMember = (m) => {
  if (!m) return m;
  // '잔치' 회원의 경우 원천 텍스트 데이터의 오타("잔치(0)")로 인해 attendanceCount: 0으로 파싱되었던 이력 자동 보정
  if (
    (m.uid === 'kakao:1121' || m.realName === '잔치') &&
    (m.attendanceCount === 0 || m.baseScore === 0)
  ) {
    return {
      ...m,
      attendanceCount: 1,
      baseScore: 1,
      expeditionScore: 1,
      totalScore: 2
    };
  }
  // '다온' 회원의 경우 이전 대화 로그 매핑 오차로 인한 프로필(전주 / 돌 / 여) 자동 보정
  if (
    (m.uid === 'kakao:1013' || m.realName === '다온') &&
    (m.city !== '전주' || m.maritalStatus !== 'divorced' || m.gender !== '여')
  ) {
    return {
      ...m,
      city: '전주',
      homeCity: '전주',
      maritalStatus: 'divorced',
      gender: '여'
    };
  }
  // '써니' 회원의 경우 원천 데이터 매핑 오차로 인한 프로필(목포 / 돌 / 남) 자동 보정
  if (
    (m.uid === 'kakao:1050' || m.realName === '써니') &&
    (m.city !== '목포' || m.maritalStatus !== 'divorced' || m.gender !== '남')
  ) {
    return {
      ...m,
      city: '목포',
      homeCity: '목포',
      maritalStatus: 'divorced',
      gender: '남'
    };
  }
  // '모찌' 회원의 경우 프로필(은평 / 돌 / 남) 자동 보정
  if (
    (m.uid === 'kakao:2000' || m.realName === '모찌') &&
    (m.city !== '은평' || m.maritalStatus !== 'divorced' || m.gender !== '남')
  ) {
    return {
      ...m,
      city: '은평',
      homeCity: '은평',
      maritalStatus: 'divorced',
      gender: '남'
    };
  }
  // 벙 참석 0회 회원의 role이 Member로 오분류되어 있는 경우 커뮤니티 규칙에 따라 Rookie(신입)로 자동 보정
  const isSpecial = [
    'Leader',
    'Deputy',
    'VIP',
    'OnLeave',
    'Withdrawn',
    'Wanderer',
    'Expelled'
  ].includes(m.role);
  if (!isSpecial && (m.attendanceCount === 0 || !m.attendanceCount) && m.role === 'Member') {
    return {
      ...m,
      role: 'Rookie'
    };
  }
  return m;
};

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

const getDeletedMeetingIdSet = () => {
  const arr = readLocalJson(STORAGE_KEYS.deletedMeetingIds, []);
  return new Set(Array.isArray(arr) ? arr.map(String) : []);
};

const getLocalState = () => {
  const deletedSet = getDeletedMeetingIdSet();
  return {
    members: readLocalJson(STORAGE_KEYS.members, INITIAL_MEMBERS).map(
      sanitizeMember
    ),
    meetings: readLocalJson(STORAGE_KEYS.meetings, INITIAL_MEETINGS)
      .map(sanitizeMeetingItem)
      .filter((m) => m && !deletedSet.has(String(m.id))),
    scoreLogs: readLocalJson(STORAGE_KEYS.scoreLogs, INITIAL_SCORE_LOGS),
    communityConfig: sanitizeConfig(
      readLocalJson(STORAGE_KEYS.config, INITIAL_COMMUNITY_CONFIG)
    ),
    loginLogs: readLocalJson(STORAGE_KEYS.loginLogs, [])
  };
};

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
    if (!val || val === '__NONE__') return null;
    return val;
  } catch {
    return null;
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
      const ops = [];
      for (const m of INITIAL_MEMBERS) {
        ops.push({ col: 'members', id: m.uid, data: m });
      }
      for (const oldDoc of existingMeetings.docs) {
        if (String(oldDoc.id).startsWith('mtg-')) {
          ops.push({ col: 'meetings', id: oldDoc.id, isDelete: true });
        }
      }
      for (const mtg of INITIAL_MEETINGS) {
        ops.push({ col: 'meetings', id: mtg.id, data: mtg });
      }
      for (const log of INITIAL_SCORE_LOGS) {
        ops.push({ col: 'scoreLogs', id: log.id, data: log });
      }
      ops.push({ col: 'settings', id: 'community', data: INITIAL_COMMUNITY_CONFIG });

      const CHUNK_SIZE = 350;
      for (let i = 0; i < ops.length; i += CHUNK_SIZE) {
        const chunk = ops.slice(i, i + CHUNK_SIZE);
        const batch = writeBatch(db);
        for (const op of chunk) {
          if (op.isDelete) {
            batch.delete(doc(db, op.col, op.id));
          } else {
            batch.set(doc(db, op.col, op.id), op.data, { merge: true });
          }
        }
        await batch.commit();
      }
    }

    // Auto-patch Janchi & Daon in Firestore if needed
    try {
      const janchiDoc = doc(db, 'members', 'kakao:1121');
      await setDoc(
        janchiDoc,
        {
          attendanceCount: 1,
          baseScore: 1,
          expeditionScore: 1,
          totalScore: 2
        },
        { merge: true }
      );
      const daonDoc = doc(db, 'members', 'kakao:1013');
      await setDoc(
        daonDoc,
        {
          city: '전주',
          homeCity: '전주',
          maritalStatus: 'divorced',
          gender: '여'
        },
        { merge: true }
      );
      const maeulDoc = doc(db, 'members', 'kakao:1003');
      await setDoc(
        maeulDoc,
        {
          city: '용인',
          homeCity: '용인',
          role: 'Member'
        },
        { merge: true }
      );
    } catch {
      // ignore
    }
  } catch (err) {
    console.warn('Firestore initial seed skipped:', err);
  }
};

/**
 * Subscribes to community data in real-time (Firestore onSnapshot or LocalStorage fallback).
 */
export const subscribeCommunityData = (onUpdate) => {
  // Always register localListener so that local state changes (create/update) immediately update React UI!
  localListeners.add(onUpdate);

  // Immediately notify listener with current local state
  onUpdate(getLocalState());

  if (!isFirebaseConfigured || !db) {
    // Ensure initial local state is saved once
    if (!localStorage.getItem(STORAGE_KEYS.members)) {
      writeLocalJson(STORAGE_KEYS.members, INITIAL_MEMBERS);
      writeLocalJson(STORAGE_KEYS.meetings, INITIAL_MEETINGS);
      writeLocalJson(STORAGE_KEYS.scoreLogs, INITIAL_SCORE_LOGS);
      writeLocalJson(STORAGE_KEYS.config, INITIAL_COMMUNITY_CONFIG);
      writeLocalJson(STORAGE_KEYS.loginLogs, []);
    }
    return () => {
      localListeners.delete(onUpdate);
    };
  }

  let currentData = getLocalState();

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
          members: snap.docs.map((d) => sanitizeMember(d.data()))
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
        const deletedSet = getDeletedMeetingIdSet();
        currentData = {
          ...currentData,
          meetings: snap.docs
            .map((d) => {
              const raw = d.data();
              return sanitizeMeetingItem({
                ...raw,
                id: raw.id || d.id,
                _docId: d.id
              });
            })
            .filter((m) => m && !deletedSet.has(String(m.id)))
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

  const unsubLoginLogs = onSnapshot(
    collection(db, 'loginLogs'),
    (snap) => {
      currentData = {
        ...currentData,
        loginLogs: snap.docs.map((d) => {
          const item = d.data();
          return {
            ...item,
            uid: item.uid || d.id
          };
        })
      };
      writeLocalJson(STORAGE_KEYS.loginLogs, currentData.loginLogs);
      onUpdate(currentData);
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
    localListeners.delete(onUpdate);
    unsubMembers();
    unsubMeetings();
    unsubLogs();
    unsubLoginLogs();
    unsubConfig();
  };
};

/**
 * Records or updates a Kakao login event (tracks date, uid, name, login count).
 * @param {string} uid - Kakao UID (e.g. 'kakao:12345678')
 * @param {string} [kakaoNickname] - Kakao profile nickname
 */
export const recordKakaoLogin = async (uid, kakaoNickname = '') => {
  if (!uid) return null;
  const nowIso = new Date().toISOString();
  const { loginLogs = [] } = getLocalState();

  const logsCopy = [...loginLogs];
  const existingIndex = logsCopy.findIndex((log) => log.uid === uid);
  let updatedLog;

  if (existingIndex >= 0) {
    const existing = logsCopy[existingIndex];
    updatedLog = {
      ...existing,
      uid,
      kakaoNickname: kakaoNickname || existing.kakaoNickname || '',
      lastLoginAt: nowIso,
      loginCount: (existing.loginCount || 1) + 1
    };
    logsCopy[existingIndex] = updatedLog;
  } else {
    updatedLog = {
      uid,
      kakaoNickname: kakaoNickname || '',
      firstLoginAt: nowIso,
      lastLoginAt: nowIso,
      loginCount: 1
    };
    logsCopy.unshift(updatedLog);
  }

  writeLocalJson(STORAGE_KEYS.loginLogs, logsCopy);
  notifyLocalListeners();

  if (isFirebaseConfigured && db) {
    try {
      const docId = uid.replace(/[/\\#?]/g, '_');
      await setDoc(doc(db, 'loginLogs', docId), updatedLog, { merge: true });
    } catch (err) {
      console.warn('Failed to record login log in Firestore:', err);
    }
  }

  return updatedLog;
};

/**
 * Registers a new member from Onboarding and returns the created member object.
 * @param {Object} form - Onboarding form values
 * @param {string} [customUid] - Optional pre-verified Kakao UID (e.g. 'kakao:12345678')
 */
export const registerOnboardingMember = async (form, customUid) => {
  const now = new Date();
  const year = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const newUid = customUid || `kakao:${Date.now()}`;

  const { members } = getLocalState();
  const linkReqName = form.linkRequestRealName?.trim() || '';
  const linkSourceUid = form.linkSourceUid || '';
  const isRequestingLink = Boolean(linkSourceUid || linkReqName);

  const newMember = {
    uid: newUid,
    realName: form.realName.trim(),
    legalName: (form.legalName || '').trim(),
    city: form.city.trim(),
    homeCity: (form.homeCity || form.city).trim(),
    maritalStatus: form.maritalStatus,
    gender: form.gender,
    role: 'Rookie',
    entryBadge: `${mm}${dd}`,
    joinedAt: `${year}-${mm}-${dd}`,
    customBadge: '',
    bankAccount: (form.bankAccount || '').trim(),
    isSimulation: Boolean(form.isSimulation),
    attendanceCount: 0,
    baseScore: 0,
    expeditionScore: 0,
    eventScore: 0,
    totalScore: 0,
    monthlyScore: 0,
    linkRequestRealName: linkReqName,
    linkRequestSourceUid: linkSourceUid,
    linkRequestType: form.linkRequestType || (linkSourceUid ? 'historical' : ''),
    linkRequestSubName: (form.linkRequestSubName || '').trim(),
    linkRequestStatus: isRequestingLink ? 'pending' : '',
    subUids: [],
    aliases: [],
    subCities: [],
    unlockedAlbums: []
  };

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
  const resolvedLocation = rawPlaceInput
    ? extractRegionFromLocationInput(rawPlaceInput, '')
    : '';

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

  const placeDetection = detectRegionFromText(rawPlaceInput);
  const titleDetection = detectRegionFromText(meetingInput.title);
  const round1Detection = detectRegionFromText(inputRounds[0]?.placeName);
  const bestDetection = placeDetection.recognized
    ? placeDetection
    : titleDetection.recognized
    ? titleDetection
    : round1Detection;
  const autoDetectedRegion = bestDetection.recognized ? bestDetection.group.name : '';
  const finalRegion = (meetingInput.region || autoDetectedRegion || resolvedLocation || '').trim();

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
    placeDetail: rawPlaceInput,
    region: finalRegion,
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

  const deletedSetForCreate = getDeletedMeetingIdSet();
  if (deletedSetForCreate.has(String(created.id))) {
    deletedSetForCreate.delete(String(created.id));
    writeLocalJson(STORAGE_KEYS.deletedMeetingIds, Array.from(deletedSetForCreate));
  }

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
 * Deletes a meeting from Firestore and local storage.
 */
export const deleteMeeting = async (meetingId) => {
  const targetStr = String(meetingId);
  const { meetings } = getLocalState();
  const targetObj = meetings.find((m) => String(m.id) === targetStr);
  const deletedSet = getDeletedMeetingIdSet();
  deletedSet.add(targetStr);
  writeLocalJson(STORAGE_KEYS.deletedMeetingIds, Array.from(deletedSet));

  const nextMeetings = meetings.filter(
    (m) => String(m.id) !== targetStr
  );
  writeLocalJson(STORAGE_KEYS.meetings, nextMeetings);
  notifyLocalListeners();

  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, 'meetings', targetStr));
      if (targetObj?._docId && String(targetObj._docId) !== targetStr) {
        await deleteDoc(doc(db, 'meetings', String(targetObj._docId)));
      }
    } catch (err) {
      console.warn('Firestore write fallback (deleteMeeting):', err.code);
    }
  }
};

/**
 * Admin: Full creation or comprehensive edit of any meeting data.
 * Supports title, dates, times, location, placeDetail, hostUid, treasurerUid,
 * status, applicants, confirmedParticipants, rounds, and settlement.
 */
export const adminSaveFullMeeting = async (meetingInput) => {
  const { meetings } = getLocalState();
  const isEditing = Boolean(
    meetingInput.id && meetings.some((m) => String(m.id) === String(meetingInput.id))
  );
  const dateOnly = meetingInput.dateOnly || new Date().toISOString().slice(0, 10);
  const targetId = isEditing ? String(meetingInput.id) : generateMeetingId(dateOnly, meetings);

  const deletedSet = getDeletedMeetingIdSet();
  if (deletedSet.has(String(targetId))) {
    deletedSet.delete(String(targetId));
    writeLocalJson(STORAGE_KEYS.deletedMeetingIds, Array.from(deletedSet));
  }
  const existing = isEditing ? meetings.find((m) => String(m.id) === String(meetingInput.id)) : null;

  const resolvedRounds =
    Array.isArray(meetingInput.rounds) && meetingInput.rounds.length > 0
      ? meetingInput.rounds.map((r, idx) => ({
          id: r.id || `r-${idx + 1}`,
          label: r.label || `${idx + 1}차`,
          placeName: (r.placeName || '').trim(),
          mapUrl: (r.mapUrl || '').trim(),
          participants: Array.isArray(r.participants) ? r.participants : [],
          payerUid: r.payerUid || meetingInput.treasurerUid || meetingInput.hostUid || '',
          cost: Number(r.cost) || 0,
          receiptUrl: r.receiptUrl || '',
          isGoldenBell: Boolean(r.isGoldenBell),
          goldenBellUid: r.goldenBellUid || ''
        }))
      : existing?.rounds || [
          {
            id: 'r-1',
            label: '1차',
            placeName: (meetingInput.placeDetail || '').trim(),
            mapUrl: '',
            participants: meetingInput.applicants || [],
            payerUid: meetingInput.treasurerUid || meetingInput.hostUid || '',
            cost: 0,
            receiptUrl: '',
            isGoldenBell: false,
            goldenBellUid: ''
          }
        ];

  const sanitized = {
    ...(existing || {}),
    id: targetId,
    title: sanitizeBungText((meetingInput.title || '벙 모임').trim()),
    dateOnly,
    endDateOnly: meetingInput.endDateOnly || dateOnly,
    startTime: meetingInput.startTime || '19:00',
    endTime: meetingInput.endTime || '23:00',
    allDay: Boolean(meetingInput.allDay),
    date: `${dateOnly} ${meetingInput.allDay ? '00:00' : meetingInput.startTime || '19:00'}`,
    location: (meetingInput.location || '서울').trim(),
    placeDetail: (meetingInput.placeDetail || '').trim(),
    region: (meetingInput.region || existing?.region || '').trim(),
    hostUid: meetingInput.hostUid || existing?.hostUid || '',
    treasurerUid:
      meetingInput.treasurerUid !== undefined
        ? meetingInput.treasurerUid
        : existing?.treasurerUid || '',
    status: meetingInput.status || existing?.status || 'open',
    type: meetingInput.type || existing?.type || 'Casual',
    description: (
      meetingInput.description !== undefined
        ? meetingInput.description
        : existing?.description || ''
    ).trim(),
    applicants: Array.isArray(meetingInput.applicants)
      ? meetingInput.applicants
      : existing?.applicants || [],
    confirmedParticipants: Array.isArray(meetingInput.confirmedParticipants)
      ? meetingInput.confirmedParticipants
      : existing?.confirmedParticipants || (meetingInput.status === 'settled' ? meetingInput.applicants : []),
    rounds: resolvedRounds,
    settlement: meetingInput.settlement || existing?.settlement || null,
    likes: existing?.likes || [],
    comments: existing?.comments || [],
    album: existing?.album || []
  };

  const nextMeetings = isEditing
    ? meetings.map((m) => (String(m.id) === String(targetId) ? sanitized : m))
    : [sanitized, ...meetings];

  writeLocalJson(STORAGE_KEYS.meetings, nextMeetings);
  notifyLocalListeners();

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'meetings', String(targetId)), sanitized, { merge: true });
    } catch (err) {
      console.warn('Firestore write fallback (adminSaveFullMeeting):', err.code);
    }
  }

  return sanitized;
};

/**
 * Settles an open meeting: updates meeting status to 'settled', awards points (+1 base, +2 expedition),
 * increments attendanceCount, and records score logs atomically.
 */
export const settleMeetingWithScores = async (
  meetingId,
  confirmedUids,
  currentMembers,
  currentMeetings,
  overrideLocation = ''
) => {
  const targetMeeting = currentMeetings.find((m) => m.id === meetingId);
  if (!targetMeeting || targetMeeting.status === 'settled') return;

  const detected = detectMeetingRegion(targetMeeting);
  const resolvedLocation =
    (overrideLocation || '').trim() ||
    detected.matchedKeyword ||
    (targetMeeting.location || '').trim() ||
    (targetMeeting.placeDetail || '').trim();

  const todayStr = new Date().toISOString().slice(0, 10);
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const returnTimeStr = `${hh}:${mm} 귀가완료`;

  const newLogs = [];

  // 1. 미입금자 일괄 완료 처리 (귀가완료 시간은 본인이 직접 입력한 기록만 보존)
  const nextSafeReturns = { ...(targetMeeting.safeReturns || {}) };
  const nextPaymentStatuses = { ...(targetMeeting.paymentStatuses || {}) };
  const nextDepositStatuses = { ...(targetMeeting.depositStatuses || {}) };

  confirmedUids.forEach((uid) => {
    nextPaymentStatuses[uid] = { paid: true, confirmed: true };
    nextDepositStatuses[uid] = { paid: true, confirmed: true };
  });

  const updatedMembers = currentMembers.map((member) => {
    if (!confirmedUids.includes(member.uid)) return member;
    const calc = calculateMeetingScoreForMember(
      member,
      resolvedLocation
    );

    newLogs.push({
      id: `log-${Date.now()}-${member.uid}`,
      meetingId: meetingId,
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

    const isSpecialRole = [
      'Leader',
      'Deputy',
      'VIP',
      'OnLeave',
      'Withdrawn',
      'Wanderer',
      'Expelled'
    ].includes(member.role);
    const isRookie =
      !isSpecialRole &&
      (member.role === 'Rookie' || (member.attendanceCount || 0) === 0);
    const nextRole = isRookie ? 'Member' : member.role;
    return {
      ...member,
      role: nextRole,
      attendanceCount: member.attendanceCount + 1,
      baseScore: member.baseScore + calc.base,
      expeditionScore: member.expeditionScore + calc.expedition,
      totalScore: member.totalScore + calc.total,
      monthlyScore: (member.monthlyScore || 0) + calc.total
    };
  });

  const memberScoreSnapshots = {};
  for (const uid of confirmedUids) {
    const mem = currentMembers.find((m) => m.uid === uid);
    if (!mem) continue;
    const calc = calculateMeetingScoreForMember(mem, resolvedLocation);
    const earned = Number(calc.total || calc.score || 1);
    const beforeScore = getMemberTotalScore(mem);
    const afterScore = beforeScore + earned;
    const isSpecial = ['Leader', 'Deputy', 'VIP', 'OnLeave', 'Withdrawn', 'Wanderer', 'Expelled'].includes(mem.role);
    const isRookie = !isSpecial && (mem.role === 'Rookie' || (mem.attendanceCount || 0) === 0);
    memberScoreSnapshots[uid] = {
      beforeScore,
      afterScore,
      earned,
      isRookiePromotion: isRookie
    };
  }

  const rookiePromotedUids = confirmedUids.filter((uid) => {
    const mem = currentMembers.find((m) => m.uid === uid);
    if (!mem) return false;
    const isSpecial = [
      'Leader',
      'Deputy',
      'VIP',
      'OnLeave',
      'Withdrawn',
      'Wanderer',
      'Expelled'
    ].includes(mem.role);
    return !isSpecial && (mem.role === 'Rookie' || (mem.attendanceCount || 0) === 0);
  });

  const numRounds = Math.max(1, (targetMeeting.rounds || []).length);
  const endMetroStep = numRounds + 1;
  const endedRounds = (targetMeeting.rounds || []).map((r) => ({
    ...r,
    status: 'ended'
  }));

  const nextMeetings = currentMeetings.map((m) =>
    m.id === meetingId
      ? {
          ...m,
          status: 'settled',
          metroStep: endMetroStep,
          rounds: endedRounds,
          confirmedParticipants: confirmedUids,
          rookiePromotedUids,
          memberScoreSnapshots,
          safeReturns: nextSafeReturns,
          paymentStatuses: nextPaymentStatuses,
          depositStatuses: nextDepositStatuses,
          ...(resolvedLocation ? { location: resolvedLocation } : {})
        }
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
        metroStep: endMetroStep,
        rounds: endedRounds,
        confirmedParticipants: confirmedUids,
        rookiePromotedUids,
        memberScoreSnapshots,
        safeReturns: nextSafeReturns,
        paymentStatuses: nextPaymentStatuses,
        depositStatuses: nextDepositStatuses,
        ...(resolvedLocation ? { location: resolvedLocation } : {})
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
 * Rollback settled meeting to open status (Admin: Re-open for edit)
 * Safely reverts points, attendanceCount, and removes meeting score logs.
 */
export const rollbackMeetingSettlement = async (
  meetingId,
  currentMembers,
  currentMeetings
) => {
  const targetMeeting = currentMeetings.find((m) => m.id === meetingId);
  if (!targetMeeting || targetMeeting.status !== 'settled') return;

  const { scoreLogs } = getLocalState();
  const confirmedUids = targetMeeting.confirmedParticipants || [];

  // Find logs generated by this meeting settlement
  const meetingLogs = scoreLogs.filter(
    (l) => l.meetingId === meetingId || (l.type === 'meeting' && l.title && l.title.includes(targetMeeting.title))
  );

  // Map delta per member to revert
  const memberDeltas = {};
  meetingLogs.forEach((l) => {
    if (!memberDeltas[l.uid]) {
      memberDeltas[l.uid] = { base: 0, expedition: 0, total: 0 };
    }
    memberDeltas[l.uid].base += (l.baseDelta || 0);
    memberDeltas[l.uid].expedition += (l.expeditionDelta || 0);
    memberDeltas[l.uid].total += (l.totalDelta || 0);
  });

  const updatedMembers = currentMembers.map((member) => {
    if (!confirmedUids.includes(member.uid)) return member;
    const delta = memberDeltas[member.uid] || { base: 1, expedition: 0, total: 1 };
    const nextAttCount = Math.max(0, member.attendanceCount - 1);
    // If attendee was promoted from Rookie and now has 0 attendance, revert to Rookie
    const nextRole = (nextAttCount === 0 && member.role === 'Member') ? 'Rookie' : member.role;

    return {
      ...member,
      role: nextRole,
      attendanceCount: nextAttCount,
      baseScore: Math.max(0, member.baseScore - delta.base),
      expeditionScore: Math.max(0, member.expeditionScore - delta.expedition),
      totalScore: Math.max(0, member.totalScore - delta.total),
      monthlyScore: Math.max(0, (member.monthlyScore || 0) - delta.total)
    };
  });

  const remainingLogs = scoreLogs.filter(
    (l) => !(l.meetingId === meetingId || (l.type === 'meeting' && l.title && l.title.includes(targetMeeting.title)))
  );

  const nextMeetings = currentMeetings.map((m) =>
    m.id === meetingId
      ? {
          ...m,
          status: 'open'
        }
      : m
  );

  writeLocalJson(STORAGE_KEYS.members, updatedMembers);
  writeLocalJson(STORAGE_KEYS.meetings, nextMeetings);
  writeLocalJson(STORAGE_KEYS.scoreLogs, remainingLogs);
  notifyLocalListeners();

  if (isFirebaseConfigured && db) {
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, 'meetings', meetingId), {
        status: 'open'
      });

      for (const member of updatedMembers) {
        if (confirmedUids.includes(member.uid)) {
          batch.set(doc(db, 'members', member.uid), member);
        }
      }

      for (const log of meetingLogs) {
        batch.delete(doc(db, 'scoreLogs', log.id));
      }

      await batch.commit();
    } catch (err) {
      console.warn('Firestore write fallback (rollbackMeetingSettlement):', err.code);
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
 * Permanently deletes a member (e.g. duplicate account removal).
 */
export const deleteMember = async (targetUid) => {
  const { members } = getLocalState();
  const nextMembers = members.filter((m) => m.uid !== targetUid);
  writeLocalJson(STORAGE_KEYS.members, nextMembers);
  notifyLocalListeners();

  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, 'members', targetUid));
    } catch (err) {
      console.warn('Firestore deleteMember error:', err);
    }
  }
};

/**
 * Reassigns an existing member's data to a new Kakao UID (account transfer / merge).
 */
export const reassignMemberUid = async (oldUid, newUid) => {
  if (!oldUid || !newUid) {
    throw new Error('원본 계정과 이전받을 새 계정을 모두 선택해 주세요.');
  }
  const cleanOldUid = String(oldUid).trim();
  const cleanNewUid = String(newUid).trim();
  if (cleanOldUid === cleanNewUid) {
    throw new Error('원본 계정과 이전받을 새 계정의 UID가 동일합니다.');
  }

  const { members, meetings, communityConfig, scoreLogs } = getLocalState();
  const target = members.find((m) => m.uid === cleanOldUid);
  if (!target) {
    throw new Error(`원본 회원 (${cleanOldUid}) 데이터를 찾을 수 없습니다.`);
  }
  const destination = members.find((m) => m.uid === cleanNewUid);

  const combinedTotalScore = (target.totalScore || 0) + (destination?.totalScore || 0);
  const combinedAttendance = (target.attendanceCount || 0) + (destination?.attendanceCount || 0);
  const combinedHostCount = (target.hostCount || 0) + (destination?.hostCount || 0);
  const combinedBaseScore = (target.baseScore || 0) + (destination?.baseScore || 0);
  const combinedExpeditionScore = (target.expeditionScore || 0) + (destination?.expeditionScore || 0);
  const combinedEventScore = (target.eventScore || 0) + (destination?.eventScore || 0);

  // Role resolution
  let resolvedRole = target.role;
  if (target.role === 'Leader' || destination?.role === 'Leader') {
    resolvedRole = 'Leader';
  } else if (target.role === 'Admin' || destination?.role === 'Admin') {
    resolvedRole = 'Admin';
  } else if (combinedTotalScore >= 100 || target.role === 'VIP' || destination?.role === 'VIP') {
    resolvedRole = 'VIP';
  } else if (target.role && !['Rookie', 'Withdrawn', 'Wanderer'].includes(target.role)) {
    resolvedRole = target.role;
  } else {
    resolvedRole = destination?.role || 'Member';
  }

  // Pick the earlier joined date
  let resolvedJoinedAt = target.joinedAt || destination?.joinedAt || '2024-01-26';
  if (target.joinedAt && destination?.joinedAt) {
    resolvedJoinedAt = target.joinedAt < destination.joinedAt ? target.joinedAt : destination.joinedAt;
  }

  const updatedTarget = {
    ...target,
    ...(destination || {}),
    uid: cleanNewUid,
    realName: target.realName || destination?.realName || '',
    role: resolvedRole,
    totalScore: combinedTotalScore,
    attendanceCount: combinedAttendance,
    hostCount: combinedHostCount,
    baseScore: combinedBaseScore,
    expeditionScore: combinedExpeditionScore,
    eventScore: combinedEventScore,
    joinedAt: resolvedJoinedAt,
    entryBadge: target.entryBadge || destination?.entryBadge || '',
    customBadge: destination?.customBadge || target.customBadge || '',
    homeCity: (destination?.homeCity && destination.homeCity !== '경기') ? destination.homeCity : (target.homeCity || destination?.homeCity || '수원'),
    city: (destination?.city && destination.city !== '경기') ? destination.city : (target.city || destination?.city || '수원'),
    gender: destination?.gender || target.gender || '남',
    maritalStatus: destination?.maritalStatus || target.maritalStatus || 'single',
    legalName: destination?.legalName || target.legalName || '',
    phone: destination?.phone || target.phone || '',
    bankAccount: destination?.bankAccount || target.bankAccount || '',
    photoURL: destination?.photoURL || target.photoURL || '',
    profileImageUrl: destination?.profileImageUrl || target.profileImageUrl || '',
    linkRequestRealName: '',
    linkRequestSourceUid: '',
    linkRequestStatus: '',
    subUids: Array.from(new Set([
      ...(target.subUids || []),
      ...(destination?.subUids || []),
      cleanOldUid
    ]))
  };

  const nextMembers = members
    .filter((m) => m.uid !== cleanOldUid && m.uid !== cleanNewUid)
    .concat(updatedTarget);

  const changedMeetings = [];
  const nextMeetings = meetings.map((mtg) => {
    let changed = false;
    let nextMtg = { ...mtg };
    if (nextMtg.hostUid === cleanOldUid) {
      nextMtg.hostUid = cleanNewUid;
      changed = true;
    }
    if (nextMtg.treasurerUid === cleanOldUid) {
      nextMtg.treasurerUid = cleanNewUid;
      changed = true;
    }
    if (Array.isArray(nextMtg.applicants) && nextMtg.applicants.includes(cleanOldUid)) {
      nextMtg.applicants = nextMtg.applicants.map((u) => (u === cleanOldUid ? cleanNewUid : u));
      changed = true;
    }
    if (Array.isArray(nextMtg.confirmedParticipants) && nextMtg.confirmedParticipants.includes(cleanOldUid)) {
      nextMtg.confirmedParticipants = nextMtg.confirmedParticipants.map((u) =>
        u === cleanOldUid ? cleanNewUid : u
      );
      changed = true;
    }
    if (Array.isArray(nextMtg.attendeeUids) && nextMtg.attendeeUids.includes(cleanOldUid)) {
      nextMtg.attendeeUids = nextMtg.attendeeUids.map((u) => (u === cleanOldUid ? cleanNewUid : u));
      changed = true;
    }
    if (Array.isArray(nextMtg.likes) && nextMtg.likes.includes(cleanOldUid)) {
      nextMtg.likes = nextMtg.likes.map((u) => (u === cleanOldUid ? cleanNewUid : u));
      changed = true;
    }
    if (Array.isArray(nextMtg.rounds)) {
      let roundsChanged = false;
      const nextRounds = nextMtg.rounds.map((r) => {
        let rChanged = false;
        let nextR = { ...r };
        if (Array.isArray(nextR.participants) && nextR.participants.includes(cleanOldUid)) {
          nextR.participants = nextR.participants.map((u) => (u === cleanOldUid ? cleanNewUid : u));
          rChanged = true;
        }
        if (nextR.payerUid === cleanOldUid) {
          nextR.payerUid = cleanNewUid;
          rChanged = true;
        }
        if (nextR.goldenBellUid === cleanOldUid) {
          nextR.goldenBellUid = cleanNewUid;
          rChanged = true;
        }
        if (rChanged) roundsChanged = true;
        return rChanged ? nextR : r;
      });
      if (roundsChanged) {
        nextMtg.rounds = nextRounds;
        changed = true;
      }
    }
    if (nextMtg.paymentStatuses && cleanOldUid in nextMtg.paymentStatuses) {
      const nextPaymentStatuses = { ...nextMtg.paymentStatuses };
      nextPaymentStatuses[cleanNewUid] = nextPaymentStatuses[cleanOldUid];
      delete nextPaymentStatuses[cleanOldUid];
      nextMtg.paymentStatuses = nextPaymentStatuses;
      changed = true;
    }
    if (nextMtg.memberScoreSnapshots && cleanOldUid in nextMtg.memberScoreSnapshots) {
      const nextSnapshots = { ...nextMtg.memberScoreSnapshots };
      nextSnapshots[cleanNewUid] = nextSnapshots[cleanOldUid];
      delete nextSnapshots[cleanOldUid];
      nextMtg.memberScoreSnapshots = nextSnapshots;
      changed = true;
    }
    if (changed) {
      changedMeetings.push(nextMtg);
    }
    return changed ? nextMtg : mtg;
  });

  // Also update any scoreLogs referencing the oldUid
  const changedLogs = [];
  const nextScoreLogs = (scoreLogs || []).map((log) => {
    if (log.memberUid === cleanOldUid) {
      const nextLog = { ...log, memberUid: cleanNewUid };
      changedLogs.push(nextLog);
      return nextLog;
    }
    return log;
  });

  // Preserve superAdmin whitelist if either account was super admin
  let nextSuperAdminUids = Array.isArray(communityConfig.superAdminUids) ? [...communityConfig.superAdminUids] : [];
  let configChanged = false;
  if (nextSuperAdminUids.includes(cleanOldUid) || nextSuperAdminUids.includes(cleanNewUid)) {
    const deduped = Array.from(new Set(
      nextSuperAdminUids.filter((u) => u !== cleanOldUid).concat(cleanNewUid)
    ));
    if (JSON.stringify(deduped) !== JSON.stringify(nextSuperAdminUids)) {
      nextSuperAdminUids = deduped;
      configChanged = true;
    }
  }

  writeLocalJson(STORAGE_KEYS.members, nextMembers);
  writeLocalJson(STORAGE_KEYS.meetings, nextMeetings);
  if (changedLogs.length > 0) {
    writeLocalJson(STORAGE_KEYS.scoreLogs, nextScoreLogs);
  }
  if (configChanged) {
    writeLocalJson(STORAGE_KEYS.config, { ...communityConfig, superAdminUids: nextSuperAdminUids });
  }
  notifyLocalListeners();

  if (isFirebaseConfigured && db) {
    try {
      // 1. Delete old member doc and save new member doc
      await deleteDoc(doc(db, 'members', cleanOldUid));
      await setDoc(doc(db, 'members', cleanNewUid), updatedTarget);

      // 2. Batch update changed meetings in chunks of 50
      const CHUNK_SIZE = 50;
      for (let i = 0; i < changedMeetings.length; i += CHUNK_SIZE) {
        const chunk = changedMeetings.slice(i, i + CHUNK_SIZE);
        const batch = writeBatch(db);
        for (const mtg of chunk) {
          batch.set(doc(db, 'meetings', String(mtg.id)), mtg, { merge: true });
        }
        await batch.commit();
      }

      // 3. Batch update changed score logs in chunks of 50
      for (let i = 0; i < changedLogs.length; i += CHUNK_SIZE) {
        const chunk = changedLogs.slice(i, i + CHUNK_SIZE);
        const batch = writeBatch(db);
        for (const log of chunk) {
          batch.set(doc(db, 'scoreLogs', String(log.id)), log, { merge: true });
        }
        await batch.commit();
      }

      // 4. Update super admin config if needed
      if (configChanged) {
        await setDoc(doc(db, 'settings', 'community'), { superAdminUids: nextSuperAdminUids }, { merge: true });
      }
    } catch (err) {
      console.error('Firestore reassignMemberUid error:', err);
      throw err;
    }
  }
};

/**
 * Admin: Approves an account link request, transferring historical data (score, joinedAt, role) to the new UID.
 */
export const approveAccountLinkRequest = async (applicantUid, sourceUid) => {
  const { members } = getLocalState();
  const source = members.find((m) => m.uid === sourceUid);
  const applicant = members.find((m) => m.uid === applicantUid);
  if (!source || !applicant) return;

  // Restore role if source was Withdrawn or Wanderer
  let nextRole = source.role;
  if (nextRole === 'Withdrawn' || nextRole === 'Wanderer' || nextRole === 'Expelled' || nextRole === 'Rookie') {
    nextRole = (source.totalScore >= 100) ? 'VIP' : 'Member';
  }

  // Reassign historical account to applicant's Kakao UID
  await reassignMemberUid(sourceUid, applicantUid);

  const finalProfile = {
    ...source,
    uid: applicantUid,
    role: nextRole,
    legalName: applicant.legalName || source.legalName || '',
    linkRequestRealName: '',
    linkRequestSourceUid: '',
    linkRequestStatus: ''
  };

  await updateMemberProfile(applicantUid, finalProfile);
};

/**
 * Admin: Rejects an account link request.
 */
export const rejectAccountLinkRequest = async (applicantUid) => {
  await updateMemberProfile(applicantUid, {
    linkRequestRealName: '',
    linkRequestSourceUid: '',
    linkRequestType: '',
    linkRequestSubName: '',
    linkRequestStatus: 'rejected'
  });
};

/**
 * Admin: Approves a sub-phone link request, adding applicant's Kakao UID to primary member's subUids
 * and optional alias to aliases.
 */
export const approveSubPhoneRequest = async (applicantUid, primaryUid, subName = '') => {
  const { members } = getLocalState();
  const primary = members.find((m) => m.uid === primaryUid);
  const applicant = members.find((m) => m.uid === applicantUid);
  if (!primary || !applicant) return;

  const nextSubUids = Array.from(new Set([...(primary.subUids || []), applicantUid]));
  const cleanSubName = (subName || applicant.linkRequestSubName || applicant.realName || '').trim();
  const nextAliases =
    cleanSubName && cleanSubName !== primary.realName
      ? Array.from(new Set([...(primary.aliases || []), cleanSubName]))
      : primary.aliases || [];

  const cleanSubCity = (applicant.city || '').trim();
  const nextSubCities =
    cleanSubCity && cleanSubCity !== primary.city
      ? Array.from(new Set([...(primary.subCities || []), cleanSubCity]))
      : primary.subCities || [];

  const updatedPrimary = {
    ...primary,
    subUids: nextSubUids,
    aliases: nextAliases,
    subCities: nextSubCities
  };

  // Remove the temporary applicant document from members list
  const nextMembers = members
    .filter((m) => m.uid !== applicantUid)
    .map((m) => (m.uid === primaryUid ? updatedPrimary : m));

  writeLocalJson(STORAGE_KEYS.members, nextMembers);
  notifyLocalListeners();

  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, 'members', applicantUid));
      await updateDoc(doc(db, 'members', primaryUid), {
        subUids: nextSubUids,
        aliases: nextAliases,
        subCities: nextSubCities
      });
    } catch (err) {
      console.warn('Firestore write fallback (approveSubPhoneRequest):', err.code);
    }
  }
};

/**
 * Disconnects a sub-phone Kakao UID from a primary member.
 */
export const disconnectSubPhone = async (primaryUid, subUidToRemove) => {
  const { members } = getLocalState();
  const primary = members.find((m) => m.uid === primaryUid);
  if (!primary || !Array.isArray(primary.subUids)) return;

  const nextSubUids = primary.subUids.filter((u) => u !== subUidToRemove);
  const updatedPrimary = { ...primary, subUids: nextSubUids };
  const nextMembers = members.map((m) => (m.uid === primaryUid ? updatedPrimary : m));

  writeLocalJson(STORAGE_KEYS.members, nextMembers);
  notifyLocalListeners();

  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'members', primaryUid), { subUids: nextSubUids });
    } catch (err) {
      console.warn('Firestore write fallback (disconnectSubPhone):', err.code);
    }
  }
};

/**
 * Admin: Cleans up any test/simulation members (uid starting with 'kakao:sim-' or isSimulation=true)
 * and purges simulation UIDs from any member's subUids array.
 */
export const cleanupSimulationMembers = async () => {
  const { members } = getLocalState();
  const simUids = members
    .filter((m) => (m.uid && m.uid.startsWith('kakao:sim-')) || m.isSimulation)
    .map((m) => m.uid);

  const nextMembers = members
    .filter((m) => !((m.uid && m.uid.startsWith('kakao:sim-')) || m.isSimulation))
    .map((m) => {
      if (Array.isArray(m.subUids) && m.subUids.some((u) => u.startsWith('kakao:sim-'))) {
        return {
          ...m,
          subUids: m.subUids.filter((u) => !u.startsWith('kakao:sim-'))
        };
      }
      return m;
    });

  writeLocalJson(STORAGE_KEYS.members, nextMembers);
  notifyLocalListeners();

  if (isFirebaseConfigured && db) {
    try {
      for (const uid of simUids) {
        await deleteDoc(doc(db, 'members', uid));
      }
      for (const m of nextMembers) {
        if (Array.isArray(m.subUids) && m.subUids.some((u) => u.startsWith('kakao:sim-'))) {
          await updateDoc(doc(db, 'members', m.uid), {
            subUids: m.subUids.filter((u) => !u.startsWith('kakao:sim-'))
          });
        }
      }
    } catch (err) {
      console.warn('Firestore write fallback (cleanupSimulationMembers):', err.code);
    }
  }

  return simUids.length;
};

/**
 * Admin: updates community notice and rules config.
 */
export const updateCommunityConfig = async (patch) => {
  const { communityConfig } = getLocalState();
  const nextConfig = { ...communityConfig, ...patch };
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
 * Batch synchronizes members, meetings, and configuration to both LocalStorage and Firestore.
 * Handles Firestore batch limits by chunking operations into sets of 350.
 */
export const batchSyncCommunityData = async (
  targetMembers = INITIAL_MEMBERS,
  targetMeetings = INITIAL_MEETINGS,
  targetConfig = INITIAL_COMMUNITY_CONFIG
) => {
  // 1. Write to LocalStorage immediately
  writeLocalJson(STORAGE_KEYS.members, targetMembers);
  writeLocalJson(STORAGE_KEYS.meetings, targetMeetings);
  writeLocalJson(STORAGE_KEYS.config, targetConfig);
  if (!getSavedCurrentUserUid()) {
    saveCurrentUserUid('kakao:1001');
  }
  notifyLocalListeners();

  // 2. Write to Firestore in safe chunks if configured
  if (isFirebaseConfigured && db) {
    try {
      const ops = [];
      for (const m of targetMembers) {
        ops.push({ col: 'members', id: m.uid, data: m });
      }
      for (const mtg of targetMeetings) {
        ops.push({ col: 'meetings', id: String(mtg.id), data: mtg });
      }
      ops.push({ col: 'settings', id: 'community', data: targetConfig });

      const CHUNK_SIZE = 350;
      for (let i = 0; i < ops.length; i += CHUNK_SIZE) {
        const chunk = ops.slice(i, i + CHUNK_SIZE);
        const batch = writeBatch(db);
        for (const op of chunk) {
          batch.set(doc(db, op.col, op.id), op.data, { merge: true });
        }
        await batch.commit();
      }
    } catch (err) {
      console.warn('Firestore batchSyncCommunityData fallback/error:', err);
      throw err;
    }
  }
};

/**
 * Resets local storage and Firestore back to initial clean official bung records data.
 */
export const resetToInitialDemoData = async () => {
  await batchSyncCommunityData(INITIAL_MEMBERS, INITIAL_MEETINGS, INITIAL_COMMUNITY_CONFIG);
};

/**
 * 벙점수 무결성 검증 및 시뮬레이션 분석 (Dry-Run Audit)
 * 모든 마감된 모임(meetings) 원천 데이터를 기반으로 회원의 참석/원정/출석을 재계산하고,
 * 현재 회원 데이터와의 차이(Drift) 및 원천 데이터의 이상치(Anomaly)를 분석합니다.
 */
export const validateAndAuditBungScores = ({ meetings = [], members = [] }) => {
  const settledMeetings = meetings.filter((m) => m.status === 'settled');

  // 1. 원천 데이터 이상치(Anomaly) 검출
  const unrecognizedRegionMeetings = [];
  const emptyAttendeeMeetings = [];
  settledMeetings.forEach((mtg) => {
    const regionInfo = detectMeetingRegion(mtg);
    if (!regionInfo.recognized && !mtg.region) {
      unrecognizedRegionMeetings.push({
        id: mtg.id,
        title: mtg.title,
        date: mtg.date,
        location: mtg.location
      });
    }
    const attendees =
      mtg.confirmedParticipants && mtg.confirmedParticipants.length > 0
        ? mtg.confirmedParticipants
        : mtg.applicants || [];
    if (!attendees || attendees.length === 0) {
      emptyAttendeeMeetings.push({
        id: mtg.id,
        title: mtg.title,
        date: mtg.date
      });
    }
  });

  const missingHomeCityMembers = members
    .filter(
      (m) =>
        !m.homeCity && !m.city && m.role !== 'Withdrawn' && m.role !== 'Expelled'
    )
    .map((m) => ({ uid: m.uid, name: m.realName, role: m.role }));

  // 2. 멱등 누적 재계산 시뮬레이션
  const statsMap = {};
  members.forEach((m) => {
    statsMap[m.uid] = {
      baseScore: 0,
      expeditionScore: 0,
      attendanceCount: 0,
      hostCount: 0,
      attendedMeetings: []
    };
  });

  settledMeetings.forEach((mtg) => {
    if (mtg.hostUid && statsMap[mtg.hostUid]) {
      statsMap[mtg.hostUid].hostCount += 1;
    }
    const attendees =
      mtg.confirmedParticipants && mtg.confirmedParticipants.length > 0
        ? mtg.confirmedParticipants
        : mtg.applicants || [];

    const uniqueUids = Array.from(new Set(attendees));
    uniqueUids.forEach((uid) => {
      const m = members.find((mem) => mem.uid === uid);
      if (!m || !statsMap[uid]) return;
      const scoreCalc = calculateMeetingScoreForMember(
        m,
        mtg.region || mtg.location
      );
      statsMap[uid].baseScore += scoreCalc.base || 1;
      statsMap[uid].expeditionScore += scoreCalc.expedition || 0;
      statsMap[uid].attendanceCount += 1;
      statsMap[uid].attendedMeetings.push({
        id: mtg.id,
        title: mtg.title,
        date: mtg.date,
        scoreEarned: scoreCalc.total || 1,
        isExpedition: scoreCalc.isExpedition
      });
    });
  });

  // 3. 현재 점수와의 불일치(Drift) 분석
  const drifts = [];
  members.forEach((m) => {
    const stats = statsMap[m.uid] || {
      baseScore: 0,
      expeditionScore: 0,
      attendanceCount: 0,
      hostCount: 0
    };
    const eventScore = Number(m.eventScore || 0);
    const calculatedTotal = stats.baseScore + stats.expeditionScore + eventScore;
    const currentTotal = getMemberTotalScore(m);
    const currentAtt = Number(m.attendanceCount || 0);
    const currentHost = Number(m.hostCount || 0);
    const currentBase = Number(m.baseScore || 0);
    const currentExp = Number(m.expeditionScore || 0);

    const hasScoreDiff = calculatedTotal !== currentTotal;
    const hasAttDiff = stats.attendanceCount !== currentAtt;
    const hasHostDiff = stats.hostCount !== currentHost;

    if (hasScoreDiff || hasAttDiff || hasHostDiff) {
      drifts.push({
        uid: m.uid,
        realName: m.realName,
        nickname: m.nickname,
        role: m.role,
        current: {
          total: currentTotal,
          base: currentBase,
          expedition: currentExp,
          attendance: currentAtt,
          host: currentHost,
          event: eventScore
        },
        calculated: {
          total: calculatedTotal,
          base: stats.baseScore,
          expedition: stats.expeditionScore,
          attendance: stats.attendanceCount,
          host: stats.hostCount,
          event: eventScore
        },
        diffTotal: calculatedTotal - currentTotal,
        diffAtt: stats.attendanceCount - currentAtt,
        diffHost: stats.hostCount - currentHost,
        attendedMeetingsCount: stats.attendedMeetings.length
      });
    }
  });

  return {
    anomalies: {
      unrecognizedRegionMeetings,
      emptyAttendeeMeetings,
      missingHomeCityMembers
    },
    drifts,
    totalSettledMeetings: settledMeetings.length,
    totalMembers: members.length,
    statsMap
  };
};

/**
 * 원천 모임 기록 기준 모든 회원의 벙점수 일괄 재계산 및 영구 동기화 실행
 */
export const recalculateAndApplyAllBungScores = async () => {
  const { meetings, members } = getLocalState();
  const auditResult = validateAndAuditBungScores({ meetings, members });
  const { statsMap } = auditResult;

  const updatedMembers = members.map((m) => {
    const stats = statsMap[m.uid] || {
      baseScore: 0,
      expeditionScore: 0,
      attendanceCount: 0,
      hostCount: 0
    };
    const eventScore = Number(m.eventScore || 0);
    const newTotalScore = stats.baseScore + stats.expeditionScore + eventScore;

    const nextMember = {
      ...m,
      baseScore: stats.baseScore,
      expeditionScore: stats.expeditionScore,
      attendanceCount: stats.attendanceCount,
      hostCount: stats.hostCount,
      totalScore: newTotalScore
    };

    nextMember.customBadge = m.customBadge || '';
    return nextMember;
  });

  // LocalStorage에 반영
  writeLocalJson(STORAGE_KEYS.members, updatedMembers);
  notifyLocalListeners();

  // Firestore 일괄 반영 (배치)
  if (isFirebaseConfigured && db) {
    try {
      const CHUNK_SIZE = 350;
      for (let i = 0; i < updatedMembers.length; i += CHUNK_SIZE) {
        const chunk = updatedMembers.slice(i, i + CHUNK_SIZE);
        const batch = writeBatch(db);
        chunk.forEach((mem) => {
          batch.set(doc(db, 'members', mem.uid), mem, { merge: true });
        });
        await batch.commit();
      }
    } catch (err) {
      console.warn(
        'Firestore write fallback (recalculateAndApplyAllBungScores):',
        err
      );
    }
  }

  return {
    updatedMembersCount: updatedMembers.length,
    driftsCount: auditResult.drifts.length,
    auditResult
  };
};

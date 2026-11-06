import fs from 'fs';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCewV3FYN7rLI7XlgnA1xq6MKS-mjLyiKE',
  projectId: 'healing78'
};

const OLD_UID = 'kakao:2001'; // 가을 (시흥, 기, 남)
const NEW_UID = 'kakao:2128'; // 가을 (아산, 돌, 여)

async function run() {
  console.log('--- 1. Updating src/core/initialData.js ---');
  const initialDataPath = path.resolve('src/core/initialData.js');
  let fileContent = fs.readFileSync(initialDataPath, 'utf8');

  // Load existing module
  const { INITIAL_MEMBERS, INITIAL_MEETINGS, INITIAL_SCORE_LOGS, INITIAL_COMMUNITY_CONFIG } = await import('../src/core/initialData.js');

  // 1. Update kakao:2001
  const m2001 = INITIAL_MEMBERS.find((m) => m.uid === OLD_UID);
  if (m2001) {
    m2001.maritalStatus = 'married';
    m2001.attendanceCount = 0;
    m2001.baseScore = 0;
    m2001.expeditionScore = 0;
    m2001.eventScore = 0;
    m2001.totalScore = 0;
    m2001.monthlyScore = 0;
    m2001.hostCount = 0;
  }

  // 2. Add or update kakao:2128
  let m2128 = INITIAL_MEMBERS.find((m) => m.uid === NEW_UID);
  if (!m2128) {
    m2128 = {
      uid: NEW_UID,
      realName: '가을',
      city: '아산',
      homeCity: '아산',
      maritalStatus: 'divorced',
      gender: '여',
      role: 'Member',
      entryBadge: '0820',
      customBadge: '',
      bankAccount: '',
      attendanceCount: 2,
      baseScore: 2,
      expeditionScore: 2,
      eventScore: 0,
      totalScore: 4,
      monthlyScore: 0,
      hostCount: 0,
      joinedAt: '2025-08-20',
      unlockedAlbums: []
    };
    INITIAL_MEMBERS.push(m2128);
  } else {
    m2128.realName = '가을';
    m2128.city = '아산';
    m2128.homeCity = '아산';
    m2128.maritalStatus = 'divorced';
    m2128.gender = '여';
    m2128.role = 'Member';
    m2128.entryBadge = '0820';
    m2128.attendanceCount = 2;
    m2128.totalScore = 4;
    m2128.joinedAt = '2025-08-20';
  }

  // 3. Update meetings 26101501 and 26092501
  const targetMeetingIds = ['26101501', '26092501'];
  for (const mtg of INITIAL_MEETINGS) {
    if (targetMeetingIds.includes(String(mtg.id))) {
      mtg.applicants = (mtg.applicants || []).map((u) => (u === OLD_UID ? NEW_UID : u));
      mtg.confirmedParticipants = (mtg.confirmedParticipants || []).map((u) => (u === OLD_UID ? NEW_UID : u));
      if (Array.isArray(mtg.rounds)) {
        for (const r of mtg.rounds) {
          r.participants = (r.participants || []).map((u) => (u === OLD_UID ? NEW_UID : u));
        }
      }
      if (mtg.paymentStatuses && mtg.paymentStatuses[OLD_UID]) {
        mtg.paymentStatuses[NEW_UID] = mtg.paymentStatuses[OLD_UID];
        delete mtg.paymentStatuses[OLD_UID];
      }
    }
  }

  // Write back to src/core/initialData.js
  const newJsContent = `// Auto-generated & enriched community data
export const INITIAL_MEMBERS = ${JSON.stringify(INITIAL_MEMBERS, null, 2)};

export const INITIAL_MEETINGS = ${JSON.stringify(INITIAL_MEETINGS, null, 2)};

export const INITIAL_SCORE_LOGS = ${JSON.stringify(INITIAL_SCORE_LOGS, null, 2)};

export const INITIAL_COMMUNITY_CONFIG = ${JSON.stringify(INITIAL_COMMUNITY_CONFIG, null, 2)};
`;
  fs.writeFileSync(initialDataPath, newJsContent, 'utf8');
  console.log('✅ Updated src/core/initialData.js with kakao:2001 and kakao:2128');

  // --- 2. Update live Firestore ---
  console.log('--- 2. Updating Firestore ---');
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  // Update kakao:2001 in Firestore
  await setDoc(
    doc(db, 'members', OLD_UID),
    {
      realName: '가을',
      city: '시흥',
      homeCity: '시흥',
      maritalStatus: 'married',
      gender: '남',
      attendanceCount: 0,
      baseScore: 0,
      expeditionScore: 0,
      eventScore: 0,
      totalScore: 0,
      monthlyScore: 0,
      hostCount: 0
    },
    { merge: true }
  );
  console.log(`✅ Updated Firestore doc members/${OLD_UID} to 0 points / married`);

  // Write kakao:2128 in Firestore
  await setDoc(doc(db, 'members', NEW_UID), m2128, { merge: true });
  console.log(`✅ Written Firestore doc members/${NEW_UID} (가을 아산 돌 여, 4점 / 2출석)`);

  // Update meetings in Firestore
  for (const mtgId of targetMeetingIds) {
    const mtgDoc = await getDoc(doc(db, 'meetings', mtgId));
    if (mtgDoc.exists()) {
      const data = mtgDoc.data();
      const nextApplicants = (data.applicants || []).map((u) => (u === OLD_UID ? NEW_UID : u));
      const nextConfirmed = (data.confirmedParticipants || []).map((u) => (u === OLD_UID ? NEW_UID : u));
      const nextRounds = (data.rounds || []).map((r) => ({
        ...r,
        participants: (r.participants || []).map((u) => (u === OLD_UID ? NEW_UID : u))
      }));
      const nextPayments = { ...(data.paymentStatuses || {}) };
      if (nextPayments[OLD_UID]) {
        nextPayments[NEW_UID] = nextPayments[OLD_UID];
        delete nextPayments[OLD_UID];
      }

      await updateDoc(doc(db, 'meetings', mtgId), {
        applicants: nextApplicants,
        confirmedParticipants: nextConfirmed,
        rounds: nextRounds,
        paymentStatuses: nextPayments
      });
      console.log(`✅ Updated Firestore meeting ${mtgId} participants: ${OLD_UID} -> ${NEW_UID}`);
    } else {
      console.warn(`Meeting doc ${mtgId} not found in Firestore`);
    }
  }

  console.log('🎉 All updates completed successfully!');
  process.exit(0);
}

run().catch((err) => {
  console.error('Error during execution:', err);
  process.exit(1);
});

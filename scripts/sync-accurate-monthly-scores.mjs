import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { calculateMeetingScoreForMember } from '../src/core/communityRules.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '../.env');
const env = fs.readFileSync(envPath, 'utf8');
const envVars = Object.fromEntries(
  env
    .split(/\r?\n/)
    .filter((l) => l.includes('='))
    .map((l) => {
      const idx = l.indexOf('=');
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    })
);

const firebaseConfig = {
  apiKey: envVars.VITE_FIREBASE_API_KEY,
  authDomain: envVars.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: envVars.VITE_FIREBASE_PROJECT_ID,
  storageBucket: envVars.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: envVars.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: envVars.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  console.log('=== 11월 벙점수 원천 데이터(5건 벙) 기반 Firestore 동기화 시작 ===\n');

  const membersSnap = await getDocs(collection(db, 'members'));
  const members = [];
  membersSnap.forEach(d => members.push({ uid: d.id, ...d.data() }));

  const meetingsSnap = await getDocs(collection(db, 'meetings'));
  const meetings = [];
  meetingsSnap.forEach(d => meetings.push({ id: d.id, ...d.data() }));

  // 1. Settled meetings in November 2026
  const novMeetings = meetings.filter(m => {
    const d = String(m.dateOnly || m.date || '');
    return (d.startsWith('2026-11') || d.startsWith('2611')) && m.status === 'settled';
  });

  console.log(`정산 완료된 11월 벙: ${novMeetings.length}건`);

  // 2. Compute exact November scores for all members
  const memberNovScores = {};
  for (const m of members) {
    memberNovScores[m.uid] = 0;
  }

  for (const mtg of novMeetings) {
    const attendees = mtg.confirmedParticipants || mtg.applicants || [];
    for (const uid of attendees) {
      const mem = members.find(m => m.uid === uid);
      if (!mem) continue;
      const calc = calculateMeetingScoreForMember(mem, mtg.location);
      const earned = mtg.memberScoreSnapshots?.[uid]?.earned || calc.total;
      memberNovScores[uid] = (memberNovScores[uid] || 0) + earned;
    }
  }

  // 3. Batch update members in Firestore
  const batch = writeBatch(db);
  let updatedCount = 0;

  for (const m of members) {
    const accurateScore = memberNovScores[m.uid] || 0;
    if ((m.monthlyScore || 0) !== accurateScore) {
      batch.update(doc(db, 'members', m.uid), {
        monthlyScore: accurateScore
      });
      updatedCount += 1;
      console.log(`[정정] ${m.realName} (${m.uid}): ${m.monthlyScore || 0}점 -> ${accurateScore}점`);
    }
  }

  if (updatedCount > 0) {
    await batch.commit();
    console.log(`\n총 ${updatedCount}명의 monthlyScore가 정상 업데이트되었습니다.`);
  } else {
    console.log('\n모든 회원의 monthlyScore가 이미 정확합니다.');
  }

  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, getDocs, writeBatch } from 'firebase/firestore';
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

async function main() {
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

  console.log(`Settled November meetings (${novMeetings.length}건):`);
  novMeetings.forEach(m => console.log(` - [${m.id}] ${m.dateOnly} ${m.title} (${m.location}): ${m.confirmedParticipants?.length || 0}명`));

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

  const activeNovScorers = Object.entries(memberNovScores)
    .filter(([uid, score]) => score > 0)
    .map(([uid, score]) => {
      const mem = members.find(m => m.uid === uid);
      return {
        uid,
        name: mem?.realName,
        city: mem?.city,
        score,
        storedMonthly: mem?.monthlyScore || 0
      };
    })
    .sort((a, b) => b.score - a.score);

  console.log(`\n총 11월 실제 벙점수 획득 회원: ${activeNovScorers.length}명`);
  console.log(activeNovScorers);

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

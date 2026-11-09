import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
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

  const octMeetings = meetings.filter(m => {
    const d = String(m.dateOnly || m.date || '');
    return d.startsWith('2026-10') || d.startsWith('2610');
  });

  console.log('October meetings count:', octMeetings.length);

  const octScores = {};
  for (const mtg of octMeetings) {
    const attendees = mtg.confirmedParticipants || mtg.applicants || [];
    for (const uid of attendees) {
      const mem = members.find(m => m.uid === uid);
      if (!mem) continue;
      const calc = calculateMeetingScoreForMember(mem, mtg.location);
      const earned = mtg.memberScoreSnapshots?.[uid]?.earned || calc.total;

      if (!octScores[uid]) {
        octScores[uid] = { name: mem.realName, octScore: 0, storedMonthly: mem.monthlyScore || 0 };
      }
      octScores[uid].octScore += earned;
    }
  }

  const checkNames = ['레시', '쭈', '봄날', '가든', '콩', '소리', '다온', '스캇', '현빈'];
  for (const uid of Object.keys(octScores)) {
    const it = octScores[uid];
    if (checkNames.includes(it.name)) {
      console.log(`${it.name}: octScore=${it.octScore}, storedMonthly=${it.storedMonthly}`);
    }
  }

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

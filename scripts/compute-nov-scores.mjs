import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, getDocs } from 'firebase/firestore';
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

  // Filter settled meetings in November 2026
  const novMeetings = meetings.filter(m => {
    const d = String(m.dateOnly || m.date || '');
    return (d.startsWith('2026-11') || d.startsWith('2611')) && m.status === 'settled';
  });

  console.log('Settled November meetings count:', novMeetings.length);

  // Calculate actual November score for each member
  const calculatedNovScores = {};
  for (const mtg of novMeetings) {
    const attendees = mtg.confirmedParticipants || mtg.applicants || [];
    console.log(`\nMeeting: ${mtg.id} (${mtg.title}, ${mtg.location}) - Attendees count: ${attendees.length}`);
    for (const uid of attendees) {
      const mem = members.find(m => m.uid === uid);
      if (!mem) continue;
      const calc = calculateMeetingScoreForMember(mem, mtg.location);
      const earned = mtg.memberScoreSnapshots?.[uid]?.earned || calc.total;

      if (!calculatedNovScores[uid]) {
        calculatedNovScores[uid] = {
          uid,
          name: mem.realName,
          city: mem.city,
          storedMonthlyScore: mem.monthlyScore || 0,
          calculatedMonthlyScore: 0,
          meetings: []
        };
      }
      calculatedNovScores[uid].calculatedMonthlyScore += earned;
      calculatedNovScores[uid].meetings.push({
        id: mtg.id,
        title: mtg.title,
        location: mtg.location,
        earned
      });
    }
  }

  console.log('\n=== COMPARISON FOR MEMBERS IN NOV MEETINGS ===');
  for (const uid of Object.keys(calculatedNovScores)) {
    const item = calculatedNovScores[uid];
    console.log(`${item.name} (${item.city}): stored=${item.storedMonthlyScore}, calculated=${item.calculatedMonthlyScore}, diff=${item.storedMonthlyScore - item.calculatedMonthlyScore}`);
    if (item.name === '레시') {
      console.log('레시 details:', JSON.stringify(item, null, 2));
    }
  }

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

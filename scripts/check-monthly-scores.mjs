import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, getDocs } from 'firebase/firestore';

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
  const scoreLogsSnap = await getDocs(collection(db, 'scoreLogs'));
  console.log('Total scoreLogs count:', scoreLogsSnap.size);

  const logs = [];
  scoreLogsSnap.forEach(d => logs.push({ id: d.id, ...d.data() }));

  const resiLogs = logs.filter(l => l.uid === 'kakao:1017' || l.title?.includes('레시'));
  console.log('All logs for kakao:1017:');
  console.log(resiLogs);

  // Check all members who have monthlyScore > 0
  const membersSnap = await getDocs(collection(db, 'members'));
  const monthlyScorers = [];
  membersSnap.forEach(d => {
    const m = d.data();
    if ((m.monthlyScore || 0) > 0) {
      monthlyScorers.push({
        uid: m.uid,
        name: m.realName,
        city: m.city,
        monthlyScore: m.monthlyScore,
        attendanceCount: m.attendanceCount,
        totalScore: m.totalScore
      });
    }
  });

  console.log('\nAll members with monthlyScore > 0 count:', monthlyScorers.length);
  console.log(monthlyScorers.sort((a,b) => b.monthlyScore - a.monthlyScore));

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

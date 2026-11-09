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
  const allLogs = [];
  scoreLogsSnap.forEach(d => allLogs.push({ id: d.id, ...d.data() }));

  const mtg702Logs = allLogs.filter(l => l.meetingId === '26110702');
  const mtg801Logs = allLogs.filter(l => l.meetingId === '26110801');

  console.log('26110702 score logs count:', mtg702Logs.length);
  console.log('26110801 score logs count:', mtg801Logs.length);

  // Check loginLogs or audit if any
  const loginLogsSnap = await getDocs(collection(db, 'loginLogs'));
  console.log('Login logs count:', loginLogsSnap.size);

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

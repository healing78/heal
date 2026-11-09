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
  const meetingsSnap = await getDocs(collection(db, 'meetings'));
  const allMeetings = [];
  meetingsSnap.forEach(d => allMeetings.push({ id: d.id, ...d.data() }));

  const novMeetings = allMeetings.filter(m => {
    const d = String(m.dateOnly || m.date || '');
    return d.startsWith('2026-11') || d.startsWith('2611');
  });

  console.log('November 2026 meetings count:', novMeetings.length);
  for (const m of novMeetings) {
    console.log({
      id: m.id,
      title: m.title,
      location: m.location,
      dateOnly: m.dateOnly,
      status: m.status,
      participantsCount: m.confirmedParticipants?.length || 0,
      hasResi: m.confirmedParticipants?.includes('kakao:1017')
    });
  }

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

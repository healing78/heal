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
  const memberSnap = await getDoc(doc(db, 'members', 'kakao:1017'));
  if (memberSnap.exists()) {
    console.log('=== 레시 MEMBER DOC ===');
    console.log(JSON.stringify(memberSnap.data(), null, 2));
  } else {
    console.log('kakao:1017 doc not found in members collection');
  }

  console.log('\n=== CHECKING ALL MEETINGS FOR 레시 ===');
  const meetingsSnap = await getDocs(collection(db, 'meetings'));
  console.log('Total meetings count:', meetingsSnap.size);

  meetingsSnap.forEach(docSnap => {
    const mtg = docSnap.data();
    const uids = mtg.confirmedParticipants || mtg.applicants || mtg.attendeeUids || mtg.rounds?.[0]?.participants || [];
    const hasResi = uids.includes('kakao:1017') ||
      (mtg.attendeeNames && mtg.attendeeNames.includes('레시')) ||
      (mtg.attendees && mtg.attendees.some(a => (typeof a === 'string' ? a === '레시' : a?.name === '레시')));
    
    if (hasResi) {
      console.log('Meeting:', {
        id: docSnap.id,
        title: mtg.title,
        location: mtg.location,
        dateOnly: mtg.dateOnly,
        date: mtg.date,
        status: mtg.status,
        memberScoreSnapshots: mtg.memberScoreSnapshots?.['kakao:1017'],
        confirmedParticipants: mtg.confirmedParticipants
      });
    }
  });

  console.log('\n=== CHECKING SCORE LOGS FOR 레시 ===');
  const scoreLogsSnap = await getDocs(collection(db, 'scoreLogs'));
  scoreLogsSnap.forEach(docSnap => {
    const log = docSnap.data();
    if (log.uid === 'kakao:1017') {
      console.log('ScoreLog:', {
        id: docSnap.id,
        ...log
      });
    }
  });

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

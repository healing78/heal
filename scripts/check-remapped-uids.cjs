const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const envVars = Object.fromEntries(
  env
    .split(/\r?\n/)
    .filter((l) => l.includes('='))
    .map((l) => {
      const idx = l.indexOf('=');
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    })
);

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

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

const targets = {
  'kakao:5166442426': '카일',
  'kakao:5172630139': '쩡쩡',
  'kakao:5172644939': '루크',
  'kakao:5172677404': '상큼',
  'kakao:5172627322': '연이',
  'kakao:2128': '가을(아산)',
  'kakao:2001': '가을(시흥)'
};

async function check() {
  const snap = await getDocs(collection(db, 'meetings'));
  console.log('Total meetings:', snap.size);
  for (const [uid, name] of Object.entries(targets)) {
    const matched = snap.docs.filter((d) => {
      const data = d.data();
      const p = data.confirmedParticipants || data.applicants || [];
      return p.includes(uid);
    });
    console.log(`${name} (${uid}) -> found in ${matched.length} meetings`);
  }
  process.exit(0);
}
check();

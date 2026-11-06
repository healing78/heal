const fs = require('fs');
const path = require('path');

const fullDataPath = path.resolve(__dirname, 'data/full_bung_data.json');
const fullData = JSON.parse(fs.readFileSync(fullDataPath, 'utf8'));

console.log(`[1] Loaded ${fullData.meetings.length} meetings from full_bung_data.json`);

// 1. Update src/core/initialData.js
const initialDataPath = path.resolve(__dirname, '../src/core/initialData.js');
let initialDataContent = fs.readFileSync(initialDataPath, 'utf8');

const meetingsRegex = /export const INITIAL_MEETINGS = \[[\s\S]*?\n\];\n\nexport const INITIAL_SCORE_LOGS/;
const meetingsJson = JSON.stringify(fullData.meetings, null, 2);
const replacement = `export const INITIAL_MEETINGS = ${meetingsJson};\n\nexport const INITIAL_SCORE_LOGS`;

initialDataContent = initialDataContent.replace(meetingsRegex, replacement);
fs.writeFileSync(initialDataPath, initialDataContent, 'utf8');
console.log(`[2] Successfully updated INITIAL_MEETINGS in src/core/initialData.js (${fullData.meetings.length} meetings)`);

// 2. Upload all 854 meetings to Firestore
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

const { initializeApp } = require('firebase/app');
const { getFirestore, writeBatch, doc } = require('firebase/firestore');

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

async function syncMeetingsToFirestore() {
  console.log('[3] Uploading all 854 meetings to Firestore in batches...');
  const CHUNK_SIZE = 300;
  for (let i = 0; i < fullData.meetings.length; i += CHUNK_SIZE) {
    const chunk = fullData.meetings.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(db);
    for (const mtg of chunk) {
      const docRef = doc(db, 'meetings', String(mtg.id));
      batch.set(docRef, mtg, { merge: true });
    }
    await batch.commit();
    console.log(`  - Uploaded meetings batch ${i + 1} ~ ${Math.min(i + CHUNK_SIZE, fullData.meetings.length)}`);
  }
  console.log('✅ All 854 meetings synced to Firestore successfully!');
  process.exit(0);
}

syncMeetingsToFirestore().catch((err) => {
  console.error('❌ Firestore sync failed:', err);
  process.exit(1);
});

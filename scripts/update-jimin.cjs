const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc } = require('firebase/firestore');

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
  // 1. Update Firestore
  await updateDoc(doc(db, 'members', 'kakao:1023'), {
    homeCity: '멕시코',
    city: '경광'
  });
  console.log('1. Firestore kakao:1023 (지민) updated: homeCity="멕시코", city="경광"');

  // 2. Update full_bung_data.json
  const fullDataPath = path.resolve(__dirname, 'data/full_bung_data.json');
  const fullData = JSON.parse(fs.readFileSync(fullDataPath, 'utf8'));
  fullData.members = fullData.members.map((m) =>
    m.uid === 'kakao:1023' ? { ...m, homeCity: '멕시코', city: '경광' } : m
  );
  fs.writeFileSync(fullDataPath, JSON.stringify(fullData, null, 2), 'utf8');
  console.log('2. full_bung_data.json updated.');

  // 3. Update initialData.js
  const initialDataPath = path.resolve(__dirname, '../src/core/initialData.js');
  let initialContent = fs.readFileSync(initialDataPath, 'utf8');
  const membersRegex = /export const INITIAL_MEMBERS = \[[\s\S]*?\n\];\n\nexport const INITIAL_MEETINGS/;
  initialContent = initialContent.replace(
    membersRegex,
    'export const INITIAL_MEMBERS = ' + JSON.stringify(fullData.members, null, 2) + ';\n\nexport const INITIAL_MEETINGS'
  );
  fs.writeFileSync(initialDataPath, initialContent, 'utf8');
  console.log('3. src/core/initialData.js updated.');
  process.exit(0);
}

run().catch((e) => {
  console.error('Error updating Jimin:', e);
  process.exit(1);
});

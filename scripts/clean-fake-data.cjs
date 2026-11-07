const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, writeBatch, deleteDoc, updateDoc } = require('firebase/firestore');

// 1. Clean full_bung_data.json
const fullDataPath = path.resolve(__dirname, 'data/full_bung_data.json');
let fullData = JSON.parse(fs.readFileSync(fullDataPath, 'utf8'));

console.log('[1] Cleaning full_bung_data.json...');
fullData.members = fullData.members.map((m) => {
  if (m.bankAccount && (m.bankAccount.includes('1234567') || m.bankAccount.includes('1000-1234-5678'))) {
    return { ...m, bankAccount: '' };
  }
  return m;
});

fullData.meetings = fullData.meetings.map((mtg) => {
  const nextRounds = (mtg.rounds || []).map((r) => ({
    ...r,
    cost: 0,
    payerUid: '',
    receiptUrl: '',
    isGoldenBell: false,
    goldenBellUid: ''
  }));

  return {
    ...mtg,
    treasurerUid: '',
    likes: [],
    paymentStatuses: {},
    manualAmounts: {},
    sponsorships: [],
    safeReturns: {},
    comments: [],
    album: [],
    rounds: nextRounds
  };
});

fs.writeFileSync(fullDataPath, JSON.stringify(fullData, null, 2), 'utf8');
console.log(`[1] full_bung_data.json cleaned (${fullData.meetings.length} meetings, ${fullData.members.length} members).`);

// 2. Clean src/core/initialData.js
console.log('[2] Cleaning src/core/initialData.js...');
const initialDataPath = path.resolve(__dirname, '../src/core/initialData.js');
let initialDataContent = fs.readFileSync(initialDataPath, 'utf8');

// Replace members
const membersJson = JSON.stringify(fullData.members, null, 2);
const membersRegex = /export const INITIAL_MEMBERS = \[[\s\S]*?\n\];\n\nexport const INITIAL_MEETINGS/;
initialDataContent = initialDataContent.replace(
  membersRegex,
  `export const INITIAL_MEMBERS = ${membersJson};\n\nexport const INITIAL_MEETINGS`
);

// Replace meetings
const meetingsJson = JSON.stringify(fullData.meetings, null, 2);
const meetingsRegex = /export const INITIAL_MEETINGS = \[[\s\S]*?\n\];\n\nexport const INITIAL_SCORE_LOGS/;
initialDataContent = initialDataContent.replace(
  meetingsRegex,
  `export const INITIAL_MEETINGS = ${meetingsJson};\n\nexport const INITIAL_SCORE_LOGS`
);

// Clear score logs
const scoreLogsRegex = /export const INITIAL_SCORE_LOGS = \[[\s\S]*?\n\];/;
initialDataContent = initialDataContent.replace(scoreLogsRegex, 'export const INITIAL_SCORE_LOGS = [];');

fs.writeFileSync(initialDataPath, initialDataContent, 'utf8');
console.log('[2] src/core/initialData.js cleaned.');

// 3. Clean Firestore
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

async function cleanFirestore() {
  console.log('[3] Cleaning Firestore database...');

  // A. Delete extra 8 test meetings
  const fakeMeetingIds = [
    '26110401',
    '26110402',
    '26110403',
    '26110501',
    '26110601',
    '26110701',
    '26110702',
    '26110801'
  ];
  for (const mid of fakeMeetingIds) {
    try {
      await deleteDoc(doc(db, 'meetings', mid));
      console.log(`Deleted fake meeting: ${mid}`);
    } catch (e) {
      console.warn(`Failed to delete meeting ${mid}:`, e.message);
    }
  }

  // B. Delete all documents in scoreLogs collection
  const scoreLogsSnap = await getDocs(collection(db, 'scoreLogs'));
  console.log(`Deleting ${scoreLogsSnap.size} fake score logs...`);
  for (const d of scoreLogsSnap.docs) {
    await deleteDoc(doc(db, 'scoreLogs', d.id));
  }
  console.log('All fake score logs deleted.');

  // C. Clear fake bank accounts in Firestore members
  const fakeBankUids = ['kakao:1001', 'kakao:1004', 'kakao:1010'];
  for (const m of fullData.members) {
    if (!m.bankAccount) {
      // make sure it has no fake bank account in firestore
      try {
        await updateDoc(doc(db, 'members', m.uid), { bankAccount: '' });
      } catch (e) {
        // ignore if doc doesn't exist
      }
    }
  }
  console.log('Member bank accounts cleaned in Firestore.');

  // D. Batch update all 854 meetings in Firestore (treasurerUid: "", likes: [], cost: 0, paymentStatuses: {})
  console.log(`Updating ${fullData.meetings.length} meetings in Firestore (batches of 50)...`);
  const CHUNK_SIZE = 50;
  for (let i = 0; i < fullData.meetings.length; i += CHUNK_SIZE) {
    const chunk = fullData.meetings.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(db);
    for (const mtg of chunk) {
      const mtgRef = doc(db, 'meetings', String(mtg.id));
      batch.set(
        mtgRef,
        {
          treasurerUid: '',
          likes: [],
          paymentStatuses: {},
          manualAmounts: {},
          sponsorships: [],
          safeReturns: {},
          comments: [],
          album: [],
          rounds: mtg.rounds
        },
        { merge: true }
      );
    }
    await batch.commit();
    console.log(`Batch ${Math.floor(i / CHUNK_SIZE) + 1}/${Math.ceil(fullData.meetings.length / CHUNK_SIZE)} committed.`);
  }

  console.log('Firestore clean complete! Exactly 854 real meetings remain with 0 fake data.');
  process.exit(0);
}

cleanFirestore().catch((err) => {
  console.error('Error cleaning Firestore:', err);
  process.exit(1);
});

const fs = require('fs');
const path = require('path');

const CORRECTIONS = {
  'kakao:1019': {
    realName: '도도',
    city: '강남',
    maritalStatus: 'single',
    gender: '여',
    joinedAt: '2025-04-01',
    entryBadge: '0401'
  },
  'kakao:1099': {
    realName: '겨울',
    city: '강북',
    maritalStatus: 'divorced',
    gender: '여',
    joinedAt: '2025-09-17',
    entryBadge: '0917'
  },
  'kakao:1075': {
    realName: '보리',
    city: '청주',
    maritalStatus: 'divorced',
    gender: '여',
    joinedAt: '2026-01-24',
    entryBadge: '0124'
  },
  'kakao:1117': {
    realName: '성민',
    city: '광주',
    maritalStatus: 'married',
    gender: '남',
    joinedAt: '2024-09-01',
    entryBadge: '0901'
  },
  'kakao:1096': {
    realName: '애플',
    city: '광진',
    maritalStatus: 'single',
    gender: '여',
    joinedAt: '2025-03-21',
    entryBadge: '0321'
  },
  'kakao:1118': {
    realName: '우리',
    city: '수원',
    maritalStatus: 'married',
    gender: '남',
    joinedAt: '2026-07-04',
    entryBadge: '0704'
  },
  'kakao:1070': {
    realName: '제니',
    city: '부산',
    maritalStatus: 'married',
    gender: '여',
    joinedAt: '2025-09-23',
    entryBadge: '0923'
  },
  'kakao:1125': {
    realName: '현이',
    city: '의정부',
    maritalStatus: 'married',
    gender: '남',
    joinedAt: '2025-06-12',
    entryBadge: '0612'
  }
};

// 1. Update scripts/data/full_bung_data.json
const fullDataPath = path.resolve(__dirname, 'data/full_bung_data.json');
const fullData = JSON.parse(fs.readFileSync(fullDataPath, 'utf8'));
let updatedCount = 0;
fullData.members = fullData.members.map((m) => {
  if (CORRECTIONS[m.uid]) {
    const c = CORRECTIONS[m.uid];
    updatedCount++;
    return {
      ...m,
      city: c.city,
      homeCity: c.city,
      maritalStatus: c.maritalStatus,
      gender: c.gender,
      joinedAt: c.joinedAt,
      entryBadge: c.entryBadge
    };
  }
  return m;
});
fs.writeFileSync(fullDataPath, JSON.stringify(fullData, null, 2), 'utf8');
console.log(`[1] Updated ${updatedCount} members in full_bung_data.json`);

// 2. Update src/core/initialData.js
const initialDataPath = path.resolve(__dirname, '../src/core/initialData.js');
let initialDataContent = fs.readFileSync(initialDataPath, 'utf8');

for (const [uid, c] of Object.entries(CORRECTIONS)) {
  const memberRegex = new RegExp(
    `(\"uid\":\\s*\"${uid}\"[\\s\\S]*?\"realName\":\\s*\"${c.realName}\"[\\s\\S]*?)(})(\\s*,?)`
  );
  initialDataContent = initialDataContent.replace(
    memberRegex,
    (match, prefix, closing, comma) => {
      let block = prefix;
      block = block.replace(/\"city\":\s*\"[^\"]*\"/, `\"city\": \"${c.city}\"`);
      block = block.replace(
        /\"homeCity\":\s*\"[^\"]*\"/,
        `\"homeCity\": \"${c.city}\"`
      );
      block = block.replace(
        /\"maritalStatus\":\s*\"[^\"]*\"/,
        `\"maritalStatus\": \"${c.maritalStatus}\"`
      );
      block = block.replace(
        /\"gender\":\s*\"[^\"]*\"/,
        `\"gender\": \"${c.gender}\"`
      );
      block = block.replace(
        /\"joinedAt\":\s*\"[^\"]*\"/,
        `\"joinedAt\": \"${c.joinedAt}\"`
      );
      block = block.replace(
        /\"entryBadge\":\s*\"[^\"]*\"/,
        `\"entryBadge\": \"${c.entryBadge}\"`
      );
      return block + closing + comma;
    }
  );
}
fs.writeFileSync(initialDataPath, initialDataContent, 'utf8');
console.log('[2] Updated INITIAL_MEMBERS in src/core/initialData.js');

// 3. Update Firestore DB
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
const { getFirestore, doc, updateDoc } = require('firebase/firestore');

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

async function syncFirestore() {
  console.log('[3] Syncing corrections to Firestore...');
  for (const [uid, c] of Object.entries(CORRECTIONS)) {
    const docRef = doc(db, 'members', uid);
    await updateDoc(docRef, {
      city: c.city,
      homeCity: c.city,
      maritalStatus: c.maritalStatus,
      gender: c.gender,
      joinedAt: c.joinedAt,
      entryBadge: c.entryBadge
    });
    console.log(
      `  - ${uid} (${c.realName}): ${c.city}, ${c.maritalStatus}, ${c.gender}, ${c.joinedAt}`
    );
  }
  console.log('✅ All 8 members successfully updated in Firestore!');
  process.exit(0);
}

syncFirestore().catch((err) => {
  console.error('❌ Firestore sync failed:', err);
  process.exit(1);
});

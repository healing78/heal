const fs = require('fs');
const path = require('path');

const REPLACEMENTS = {
  'kakao:1016': 'kakao:5166442426', // 카일 (수원, Leader)
  'kakao:1021': 'kakao:5172630139', // 쩡쩡 (노원, Deputy)
  'kakao:1027': 'kakao:5172644939', // 루크 (인천, Deputy)
  'kakao:1035': 'kakao:5172677404', // 상큼 (화성, Deputy)
  'kakao:1040': 'kakao:5172627322', // 연이 (광주, Deputy)
  'kakao:2001': 'kakao:2128'        // 가을 (시흥 -> 아산)
};

const fullDataPath = path.resolve(__dirname, 'data/full_bung_data.json');
const fullData = JSON.parse(fs.readFileSync(fullDataPath, 'utf8'));

// 1. Remap members in full_bung_data.json
for (const m of fullData.members) {
  if (REPLACEMENTS[m.uid] && m.uid !== 'kakao:2001') {
    m.uid = REPLACEMENTS[m.uid];
  }
}

// 2. Remap meetings in full_bung_data.json
function remapUid(uid) {
  return REPLACEMENTS[uid] || uid;
}

let remappedMeetingsCount = 0;
for (const mtg of fullData.meetings) {
  let modified = false;

  if (mtg.hostUid && REPLACEMENTS[mtg.hostUid]) {
    mtg.hostUid = remapUid(mtg.hostUid);
    modified = true;
  }
  if (mtg.treasurerUid && REPLACEMENTS[mtg.treasurerUid]) {
    mtg.treasurerUid = remapUid(mtg.treasurerUid);
    modified = true;
  }

  if (Array.isArray(mtg.applicants)) {
    const next = mtg.applicants.map(remapUid);
    if (JSON.stringify(next) !== JSON.stringify(mtg.applicants)) {
      mtg.applicants = next;
      modified = true;
    }
  }

  if (Array.isArray(mtg.confirmedParticipants)) {
    const next = mtg.confirmedParticipants.map(remapUid);
    if (JSON.stringify(next) !== JSON.stringify(mtg.confirmedParticipants)) {
      mtg.confirmedParticipants = next;
      modified = true;
    }
  }

  if (Array.isArray(mtg.attendeeUids)) {
    const next = mtg.attendeeUids.map(remapUid);
    if (JSON.stringify(next) !== JSON.stringify(mtg.attendeeUids)) {
      mtg.attendeeUids = next;
      modified = true;
    }
  }

  if (Array.isArray(mtg.rounds)) {
    for (const r of mtg.rounds) {
      if (Array.isArray(r.participants)) {
        const next = r.participants.map(remapUid);
        if (JSON.stringify(next) !== JSON.stringify(r.participants)) {
          r.participants = next;
          modified = true;
        }
      }
      if (r.payerUid && REPLACEMENTS[r.payerUid]) {
        r.payerUid = remapUid(r.payerUid);
        modified = true;
      }
      if (r.goldenBellUid && REPLACEMENTS[r.goldenBellUid]) {
        r.goldenBellUid = remapUid(r.goldenBellUid);
        modified = true;
      }
    }
  }

  if (mtg.paymentStatuses) {
    const nextPay = {};
    for (const [k, v] of Object.entries(mtg.paymentStatuses)) {
      nextPay[remapUid(k)] = v;
    }
    mtg.paymentStatuses = nextPay;
  }

  if (modified) {
    remappedMeetingsCount += 1;
  }
}

fs.writeFileSync(fullDataPath, JSON.stringify(fullData, null, 2), 'utf8');
console.log(`[1] Remapped ${remappedMeetingsCount} meetings in full_bung_data.json`);

// 3. Update src/core/initialData.js
const initialDataPath = path.resolve(__dirname, '../src/core/initialData.js');
let initialDataContent = fs.readFileSync(initialDataPath, 'utf8');

// Replace old UIDs in members and meetings
for (const [oldUid, newUid] of Object.entries(REPLACEMENTS)) {
  if (oldUid !== 'kakao:2001') {
    initialDataContent = initialDataContent.replace(
      new RegExp(`"uid":\\s*"${oldUid}"`, 'g'),
      `"uid": "${newUid}"`
    );
  }
  initialDataContent = initialDataContent.replace(
    new RegExp(`"${oldUid}"`, 'g'),
    `"${newUid}"`
  );
}
fs.writeFileSync(initialDataPath, initialDataContent, 'utf8');
console.log('[2] Remapped UIDs in src/core/initialData.js');

// 4. Update Firestore meetings & members
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
const { getFirestore, writeBatch, doc, getDocs, collection, setDoc, deleteDoc } = require('firebase/firestore');

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
  console.log('[3] Fetching and remapping Firestore meetings...');
  const snap = await getDocs(collection(db, 'meetings'));
  console.log(`Total Firestore meetings: ${snap.size}`);

  const meetingsToUpdate = [];
  snap.docs.forEach((d) => {
    const mtg = d.data();
    let needsUpdate = false;
    const mtgStr = JSON.stringify(mtg);

    for (const oldUid of Object.keys(REPLACEMENTS)) {
      if (mtgStr.includes(oldUid)) {
        needsUpdate = true;
        break;
      }
    }

    if (needsUpdate) {
      const updatedMtg = JSON.parse(
        JSON.stringify(mtg, (key, value) => {
          if (typeof value === 'string' && REPLACEMENTS[value]) {
            return REPLACEMENTS[value];
          }
          return value;
        })
      );
      meetingsToUpdate.push({ id: d.id, data: updatedMtg });
    }
  });

  console.log(`Found ${meetingsToUpdate.length} Firestore meetings needing UID remapping.`);

  const CHUNK_SIZE = 300;
  for (let i = 0; i < meetingsToUpdate.length; i += CHUNK_SIZE) {
    const chunk = meetingsToUpdate.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(db);
    for (const item of chunk) {
      batch.set(doc(db, 'meetings', item.id), item.data, { merge: true });
    }
    await batch.commit();
    console.log(`  - Updated batch ${i + 1} ~ ${Math.min(i + CHUNK_SIZE, meetingsToUpdate.length)}`);
  }

  // 5. Ensure Firestore members collection has correct stats and clean up any old duplicate docs
  console.log('[4] Ensuring Firestore members have accurate stats...');
  const ADMIN_PROFILES = [
    { uid: 'kakao:5166442426', realName: '카일', city: '수원', role: 'Leader', totalScore: 107, attendanceCount: 103, hostCount: 44, expeditionScore: 4 },
    { uid: 'kakao:5172630139', realName: '쩡쩡', city: '노원', role: 'Deputy', totalScore: 100, attendanceCount: 93, hostCount: 4, expeditionScore: 7 },
    { uid: 'kakao:5172644939', realName: '루크', city: '인천', role: 'Deputy', totalScore: 85, attendanceCount: 84, hostCount: 3, expeditionScore: 1 },
    { uid: 'kakao:5172677404', realName: '상큼', city: '화성', role: 'Deputy', totalScore: 69, attendanceCount: 59, hostCount: 1, expeditionScore: 10 },
    { uid: 'kakao:5172627322', realName: '연이', city: '광주', role: 'Deputy', totalScore: 56, attendanceCount: 53, hostCount: 33, expeditionScore: 3 },
    { uid: 'kakao:2128', realName: '가을', city: '아산', role: 'Member', totalScore: 4, attendanceCount: 2, hostCount: 0, expeditionScore: 2 }
  ];

  for (const prof of ADMIN_PROFILES) {
    await setDoc(doc(db, 'members', prof.uid), prof, { merge: true });
    console.log(`  - Verified member ${prof.realName} (${prof.uid})`);
  }

  // Clean up old duplicate doc IDs if they exist
  const cleanupOldUids = ['kakao:1016', 'kakao:1021', 'kakao:1027', 'kakao:1035', 'kakao:1040'];
  for (const oldId of cleanupOldUids) {
    try {
      await deleteDoc(doc(db, 'members', oldId));
    } catch {}
  }

  console.log('✅ Successfully remapped all admin & Gaeul UIDs across meetings and members!');
  process.exit(0);
}

syncFirestore().catch((err) => {
  console.error('❌ Sync failed:', err);
  process.exit(1);
});

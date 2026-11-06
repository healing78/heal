import fs from 'fs';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDocs, collection, writeBatch } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCewV3FYN7rLI7XlgnA1xq6MKS-mjLyiKE',
  projectId: 'healing78'
};

const NEW_ACTIVE_MEMBERS = [
  {
    uid: 'kakao:2129',
    realName: '큐큐',
    city: '오산',
    homeCity: '오산',
    maritalStatus: 'divorced',
    gender: '남',
    role: 'Member',
    entryBadge: '0726',
    customBadge: '',
    bankAccount: '',
    attendanceCount: 0,
    baseScore: 0,
    expeditionScore: 0,
    eventScore: 0,
    totalScore: 0,
    monthlyScore: 0,
    hostCount: 0,
    joinedAt: '2024-07-26',
    unlockedAlbums: []
  },
  {
    uid: 'kakao:2130',
    realName: '필수',
    city: '용산',
    homeCity: '용산',
    maritalStatus: 'married',
    gender: '남',
    role: 'Member',
    entryBadge: '0311',
    customBadge: '',
    bankAccount: '',
    attendanceCount: 0,
    baseScore: 0,
    expeditionScore: 0,
    eventScore: 0,
    totalScore: 0,
    monthlyScore: 0,
    hostCount: 0,
    joinedAt: '2025-03-11',
    unlockedAlbums: []
  },
  {
    uid: 'kakao:2131',
    realName: '다크',
    city: '수원',
    homeCity: '수원',
    maritalStatus: 'married',
    gender: '남',
    role: 'Member',
    entryBadge: '0613',
    customBadge: '',
    bankAccount: '',
    attendanceCount: 0,
    baseScore: 0,
    expeditionScore: 0,
    eventScore: 0,
    totalScore: 0,
    monthlyScore: 0,
    hostCount: 0,
    joinedAt: '2026-06-13',
    unlockedAlbums: []
  },
  {
    uid: 'kakao:2132',
    realName: '복숭아',
    city: '대전',
    homeCity: '대전',
    maritalStatus: 'divorced',
    gender: '여',
    role: 'Member',
    entryBadge: '0810',
    customBadge: '',
    bankAccount: '',
    attendanceCount: 0,
    baseScore: 0,
    expeditionScore: 0,
    eventScore: 0,
    totalScore: 0,
    monthlyScore: 0,
    hostCount: 0,
    joinedAt: '2026-08-10',
    unlockedAlbums: []
  },
  {
    uid: 'kakao:2133',
    realName: '정반합',
    city: '광명',
    homeCity: '광명',
    maritalStatus: 'married',
    gender: '남',
    role: 'Member',
    entryBadge: '0912',
    customBadge: '',
    bankAccount: '',
    attendanceCount: 0,
    baseScore: 0,
    expeditionScore: 0,
    eventScore: 0,
    totalScore: 0,
    monthlyScore: 0,
    hostCount: 0,
    joinedAt: '2025-09-12',
    unlockedAlbums: []
  },
  {
    uid: 'kakao:2134',
    realName: '나라',
    city: '대구',
    homeCity: '대구',
    maritalStatus: 'divorced',
    gender: '여',
    role: 'Member',
    entryBadge: '1013',
    customBadge: '',
    bankAccount: '',
    attendanceCount: 0,
    baseScore: 0,
    expeditionScore: 0,
    eventScore: 0,
    totalScore: 0,
    monthlyScore: 0,
    hostCount: 0,
    joinedAt: '2025-10-13',
    unlockedAlbums: []
  },
  {
    uid: 'kakao:2135',
    realName: '나리',
    city: '부천',
    homeCity: '부천',
    maritalStatus: 'married',
    gender: '남',
    role: 'Member',
    entryBadge: '1101',
    customBadge: '',
    bankAccount: '',
    attendanceCount: 0,
    baseScore: 0,
    expeditionScore: 0,
    eventScore: 0,
    totalScore: 0,
    monthlyScore: 0,
    hostCount: 0,
    joinedAt: '2025-11-01',
    unlockedAlbums: []
  },
  {
    uid: 'kakao:2136',
    realName: '해븐',
    city: '화성',
    homeCity: '화성',
    maritalStatus: 'divorced',
    gender: '여',
    role: 'Member',
    entryBadge: '1028',
    customBadge: '',
    bankAccount: '',
    attendanceCount: 0,
    baseScore: 0,
    expeditionScore: 0,
    eventScore: 0,
    totalScore: 0,
    monthlyScore: 0,
    hostCount: 0,
    joinedAt: '2025-10-28',
    unlockedAlbums: []
  },
  {
    uid: 'kakao:2137',
    realName: '황혼',
    city: '춘천',
    homeCity: '춘천',
    maritalStatus: 'single',
    gender: '남',
    role: 'Member',
    entryBadge: '0307',
    customBadge: '',
    bankAccount: '',
    attendanceCount: 0,
    baseScore: 0,
    expeditionScore: 0,
    eventScore: 0,
    totalScore: 0,
    monthlyScore: 0,
    hostCount: 0,
    joinedAt: '2026-03-07',
    unlockedAlbums: []
  },
  {
    uid: 'kakao:2138',
    realName: '카이',
    city: '수원',
    homeCity: '수원',
    maritalStatus: 'married',
    gender: '남',
    role: 'Member',
    entryBadge: '0305',
    customBadge: '',
    bankAccount: '',
    attendanceCount: 0,
    baseScore: 0,
    expeditionScore: 0,
    eventScore: 0,
    totalScore: 0,
    monthlyScore: 0,
    hostCount: 0,
    joinedAt: '2025-03-05',
    unlockedAlbums: []
  }
];

async function run() {
  console.log('--- 1. Loading active members list ---');
  const activeLogPath = 'C:/Users/cntok/.gemini/antigravity-cli/brain/0859836e-35af-45ed-830a-f14357246a76/.user_uploaded/media_1793938641192_b17bed16.log';
  const activeRaw = fs.readFileSync(activeLogPath, 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const activeNames = new Set(activeRaw.map((l) => l.split(/\s+/)[0]));
  console.log(`Active list has ${activeRaw.length} entries (${activeNames.size} distinct names).`);

  // Load INITIAL_MEMBERS from src/core/initialData.js
  const { INITIAL_MEMBERS, INITIAL_MEETINGS, INITIAL_SCORE_LOGS, INITIAL_COMMUNITY_CONFIG } = await import('../src/core/initialData.js');

  // Add the 10 new members to INITIAL_MEMBERS if not present
  for (const newM of NEW_ACTIVE_MEMBERS) {
    const existing = INITIAL_MEMBERS.find((m) => m.realName === newM.realName);
    if (!existing) {
      INITIAL_MEMBERS.push(newM);
    }
  }

  // Update 승소 details
  const seungso = INITIAL_MEMBERS.find((m) => m.realName === '승소');
  if (seungso) {
    seungso.city = '울산';
    seungso.homeCity = '울산';
    seungso.maritalStatus = 'married';
    seungso.entryBadge = '0925';
    seungso.joinedAt = '2025-09-25';
  }

  // Update roles in INITIAL_MEMBERS
  let activeCount = 0;
  let wandererCount = 0;

  for (const m of INITIAL_MEMBERS) {
    let isActive = false;
    if (m.realName === '가을') {
      isActive = (m.uid === 'kakao:2128' || m.city === '아산');
    } else if (activeNames.has(m.realName)) {
      isActive = true;
    }

    if (isActive) {
      activeCount++;
      // Restore role if it was Wanderer or Withdrawn
      if (m.role === 'Wanderer' || m.role === 'Withdrawn') {
        m.role = m.totalScore >= 100 ? 'VIP' : 'Member';
      }
    } else {
      wandererCount++;
      m.role = 'Wanderer';
    }
  }

  console.log(`Updated INITIAL_MEMBERS: ${activeCount} active, ${wandererCount} wanderers.`);

  // Write back to src/core/initialData.js
  const initialDataPath = path.resolve('src/core/initialData.js');
  const newJsContent = `// Auto-generated & enriched community data
export const INITIAL_MEMBERS = ${JSON.stringify(INITIAL_MEMBERS, null, 2)};

export const INITIAL_MEETINGS = ${JSON.stringify(INITIAL_MEETINGS, null, 2)};

export const INITIAL_SCORE_LOGS = ${JSON.stringify(INITIAL_SCORE_LOGS, null, 2)};

export const INITIAL_COMMUNITY_CONFIG = ${JSON.stringify(INITIAL_COMMUNITY_CONFIG, null, 2)};
`;
  fs.writeFileSync(initialDataPath, newJsContent, 'utf8');
  console.log('✅ Successfully updated src/core/initialData.js');

  // --- 2. Update Live Firestore ---
  console.log('--- 2. Updating Live Firestore ---');
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const snap = await getDocs(collection(db, 'members'));
  console.log(`Fetched ${snap.size} members from Firestore.`);

  const firestoreMembersMap = new Map();
  snap.docs.forEach((d) => {
    firestoreMembersMap.set(d.id, { id: d.id, ...d.data() });
  });

  // Collect all batch operations
  const ops = [];

  // 1. Process all existing docs in Firestore
  for (const [uid, m] of firestoreMembersMap.entries()) {
    let isActive = false;
    if (m.realName === '가을') {
      isActive = (m.uid === 'kakao:2128' || m.city === '아산');
    } else if (activeNames.has(m.realName)) {
      isActive = true;
    }

    let nextRole = m.role;
    if (isActive) {
      if (m.role === 'Wanderer' || m.role === 'Withdrawn') {
        nextRole = (m.totalScore || 0) >= 100 ? 'VIP' : 'Member';
      }
    } else {
      nextRole = 'Wanderer';
    }

    const patch = { role: nextRole };
    if (m.realName === '승소') {
      patch.city = '울산';
      patch.homeCity = '울산';
      patch.maritalStatus = 'married';
      patch.entryBadge = '0925';
      patch.joinedAt = '2025-09-25';
    }

    if (m.role !== nextRole || m.realName === '승소') {
      ops.push({ uid, data: patch });
    }
  }

  // 2. Add the 10 new members if missing in Firestore
  for (const newM of NEW_ACTIVE_MEMBERS) {
    if (!firestoreMembersMap.has(newM.uid)) {
      ops.push({ uid: newM.uid, data: newM });
    }
  }

  console.log(`Executing ${ops.length} update operations to Firestore in batches of 300...`);
  const CHUNK_SIZE = 300;
  for (let i = 0; i < ops.length; i += CHUNK_SIZE) {
    const chunk = ops.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(db);
    for (const op of chunk) {
      batch.set(doc(db, 'members', op.uid), op.data, { merge: true });
    }
    await batch.commit();
    console.log(`  Committed batch ${Math.floor(i / CHUNK_SIZE) + 1} (${chunk.length} items)`);
  }

  console.log('🎉 Firestore update completed successfully!');
  process.exit(0);
}

run().catch((err) => {
  console.error('Error during classification:', err);
  process.exit(1);
});

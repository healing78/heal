import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';

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

async function run() {
  console.log('=== 인덕원 벙(26110601) 지하철 노선도 종료 및 차수 상태 정정 시작 ===\n');

  // 1. Firestore 업데이트
  const docRef = doc(db, 'meetings', '26110601');
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    const data = snap.data();
    console.log('1. Firestore 현재 데이터:', {
      status: data.status,
      metroStep: data.metroStep,
      rounds: data.rounds?.map(r => ({ id: r.id, label: r.label, status: r.status }))
    });

    const updatedRounds = (data.rounds || []).map(r => ({ ...r, status: 'ended' }));
    const endStep = (data.rounds?.length || 1) + 1;

    await updateDoc(docRef, {
      metroStep: endStep,
      rounds: updatedRounds
    });
    console.log(`✅ Firestore 26110601 metroStep: ${endStep}, rounds status: all 'ended' 갱신 완료`);
  } else {
    console.warn('⚠️ Firestore에서 26110601 문서를 찾지 못함');
  }

  // 2. full_bung_data.json 업데이트
  const fullPath = path.resolve(__dirname, 'data/full_bung_data.json');
  const full = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  const mIndex = full.meetings.findIndex(x => x.id === '26110601');
  if (mIndex !== -1) {
    const roundsCount = full.meetings[mIndex].rounds?.length || 1;
    full.meetings[mIndex].metroStep = roundsCount + 1;
    full.meetings[mIndex].rounds = (full.meetings[mIndex].rounds || []).map(r => ({ ...r, status: 'ended' }));
    fs.writeFileSync(fullPath, JSON.stringify(full, null, 2), 'utf8');
    console.log('✅ scripts/data/full_bung_data.json 26110601 갱신 완료');
  }

  // 3. initialData.js 업데이트 (build-initial-data.mjs 실행하거나 직접 갱신)
  console.log('\n✅ 작업 완료');
  process.exit(0);
}

run().catch(err => {
  console.error('❌ 에러 발생:', err);
  process.exit(1);
});

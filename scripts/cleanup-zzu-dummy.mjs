import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Firebase config
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
  console.log('=== 쭈 더미 계정(kakao:1001) 삭제 및 실제 계정(kakao:5173773611) 서브UID 통합 시작 ===\n');

  // 1. Firestore update
  console.log('1. Firestore 계정 정리...');
  const realDocRef = doc(db, 'members', 'kakao:5173773611');
  const dummyDocRef = doc(db, 'members', 'kakao:1001');

  const realSnap = await getDoc(realDocRef);
  if (realSnap.exists()) {
    const realData = realSnap.data();
    const subUids = Array.from(new Set([...(realData.subUids || []), 'kakao:1001']));
    await setDoc(realDocRef, { ...realData, subUids }, { merge: true });
    console.log('✅ kakao:5173773611 계정에 subUids: [\"kakao:1001\"] 등록 완료');
  } else {
    console.warn('⚠️ kakao:5173773611 문서를 찾지 못함');
  }

  await deleteDoc(dummyDocRef);
  console.log('✅ Firestore에서 kakao:1001 더미 문서 삭제 완료');

  // 2. Local full_bung_data.json
  console.log('\n2. full_bung_data.json 동기화...');
  const fullDataPath = path.resolve(__dirname, 'data/full_bung_data.json');
  if (fs.existsSync(fullDataPath)) {
    const fullData = JSON.parse(fs.readFileSync(fullDataPath, 'utf8'));
    fullData.members = fullData.members.filter(m => m.uid !== 'kakao:1001');
    const zzu = fullData.members.find(m => m.uid === 'kakao:5173773611');
    if (zzu) {
      zzu.subUids = Array.from(new Set([...(zzu.subUids || []), 'kakao:1001']));
    }
    fullData.memberCount = fullData.members.length;
    fs.writeFileSync(fullDataPath, JSON.stringify(fullData, null, 2), 'utf8');
    console.log(`✅ full_bung_data.json 동기화 완료 (회원 수: ${fullData.memberCount}명)`);
  }

  // 3. Local initialData.js
  console.log('\n3. src/core/initialData.js 동기화...');
  const initialDataPath = path.resolve(__dirname, '../src/core/initialData.js');
  const fullData = JSON.parse(fs.readFileSync(fullDataPath, 'utf8'));

  const initialContent = `// Auto-generated & enriched community data
export const INITIAL_MEMBERS = ${JSON.stringify(fullData.members, null, 2)};

export const INITIAL_MEETINGS = ${JSON.stringify(fullData.meetings, null, 2)};

export const INITIAL_SCORE_LOGS = [];

export const INITIAL_COMMUNITY_CONFIG = {
  "homeSummary": "공지 · 규격 닉네임 및 모임 규칙",
  "noticeTitle": "Healing78 커뮤니티 닉네임 및 마일스톤 뱃지 규칙",
  "noticeBody": "1) 모든 회원은 [이름 지역 결혼여부(미/기/돌) 성별(남/여) 뱃지] 규격 닉네임을 유지합니다.\\n2) 마일스톤 뱃지 체계: 15점 얼룩말(🦓), 30점 달리는 말(🐎), 50점 대왕말(🐴), 78점 유니콘(🦄), 100점 동(🥉), 200점 은(🥈), 300점 금(🥇), 400점 트로피(🏆), 500점 별(⭐️, 500단위 누적 반복 순환)\\n3) 벙점수 부여: 기본 +1점, 타 도 원정 참석 시 +1점(총 2점), 해외 원정 시 +2점(총 3점) 부여\\n4) 모임 개설은 최소 1회 이상 모임에 참석한 회원부터 가능합니다.",
  "newcomerSummary": "신입공지 · 입장 즉시 닉네임 변경",
  "newcomerNoticeBody": "Healing78 오픈채팅방 입장 후 아래 자동 생성기로 규격 닉네임([이름 지역 미/기/돌 남/여 가입일])을 생성하여 프로필을 변경해 주세요.",
  "baseAttendancePoint": 1,
  "expeditionBonusPoint": 1,
  "overseasBonusPoint": 2,
  "minAttendanceForHost": 1,
  "googleDriveBridgeUrl": ""
};
`;
  fs.writeFileSync(initialDataPath, initialContent, 'utf8');
  console.log('✅ src/core/initialData.js 동기화 완료!');

  console.log('\n🎉 쭈 더미 계정 완전 정리 완료!');
  process.exit(0);
}

run().catch(err => {
  console.error('❌ 실행 중 에러 발생:', err);
  process.exit(1);
});

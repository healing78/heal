import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { INITIAL_MEMBERS, INITIAL_MEETINGS } from '../src/core/initialData.js';
import { detectMeetingRegion, calculateMeetingScoreForMember } from '../src/core/communityRules.js';

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
  console.log('=== 원천 벙기록 텍스트(이름=1점, 숫자=해당 점수) 기반 정밀 벙점수 재계산 시작 ===\n');

  // 1. Load latest from Firestore
  console.log('1. Firestore 최신 데이터 로딩...');
  const memSnap = await getDocs(collection(db, 'members'));
  const mtgSnap = await getDocs(collection(db, 'meetings'));

  const membersMap = new Map();
  memSnap.docs.forEach(d => {
    membersMap.set(d.id, { uid: d.id, ...d.data() });
  });
  INITIAL_MEMBERS.forEach(m => {
    if (!membersMap.has(m.uid)) {
      membersMap.set(m.uid, { ...m });
    }
  });

  const meetingsMap = new Map();
  mtgSnap.docs.forEach(d => {
    meetingsMap.set(d.id, { id: d.id, ...d.data() });
  });
  INITIAL_MEETINGS.forEach(m => {
    if (!meetingsMap.has(String(m.id))) {
      meetingsMap.set(String(m.id), { ...m });
    }
  });

  console.log(`- 로드 완료: 회원 ${membersMap.size}명, 모임 ${meetingsMap.size}건`);

  // Ensure Mozzi profile
  const mozzi = membersMap.get('kakao:2000');
  if (mozzi) {
    mozzi.city = '은평';
    mozzi.homeCity = '은평';
    mozzi.maritalStatus = 'divorced';
    mozzi.gender = '남';
    console.log('✅ 모찌 프로필 정정 (은평 / 돌 / 남)');
  }

  // Name to UID mapping table
  const nameToUid = new Map();
  for (const m of membersMap.values()) {
    if (!nameToUid.has(m.realName)) {
      nameToUid.set(m.realName, m.uid);
    }
  }
  // Primary active account overrides
  nameToUid.set('쭈', 'kakao:5173773611');
  nameToUid.set('가을', 'kakao:2128');
  nameToUid.set('모찌', 'kakao:2000');
  nameToUid.set('성민', 'kakao:1117');
  nameToUid.set('잔치', 'kakao:1121');
  nameToUid.set('다온', 'kakao:1013');
  nameToUid.set('써니', 'kakao:1050');

  // 2. Parse raw_bung_doc.txt
  console.log('\n2. raw_bung_doc.txt 파싱 중...');
  const rawDocPath = 'C:/Users/cntok/.gemini/antigravity-cli/brain/0859836e-35af-45ed-830a-f14357246a76/scratch/raw_bung_doc.txt';
  const rawText = fs.readFileSync(rawDocPath, 'utf8');

  const sec3Idx = rawText.indexOf('3️⃣  전체 벙기록');
  const sec3Text = sec3Idx !== -1 ? rawText.slice(sec3Idx) : rawText;

  const lines = sec3Text.split(/\r?\n/);
  const headerRegex = /^\s*(\d{2,4})년\s*(\d{1,2})월\s*(\d{1,2})일\s*(.*)$/;
  const totalRegex = /총\s*(\d+)\s*명|총\s*(\d+)|(\d+)\s*명/;

  const rawMeetings = [];
  let curHeader = null;
  let curAttendees = [];
  let curTotal = 0;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();
    if (!trimmed || trimmed.includes('3️⃣  전체 벙기록')) continue;

    const hMatch = rawLine.match(headerRegex);
    if (hMatch && !rawLine.startsWith(' ') && !rawLine.startsWith('\t')) {
      if (curHeader) {
        rawMeetings.push({
          header: curHeader,
          attendees: curAttendees,
          total: curTotal || curAttendees.length
        });
        curAttendees = [];
        curTotal = 0;
      }
      const yy = parseInt(hMatch[1], 10) % 100;
      const mm = parseInt(hMatch[2], 10);
      const dd = parseInt(hMatch[3], 10);
      const title = hMatch[4].trim() || `${mm}월${dd}일벙`;
      curHeader = { year: yy, month: mm, day: dd, title };
      continue;
    }

    if (trimmed.includes('총') || trimmed.endsWith('명')) {
      const totMatch = trimmed.match(totalRegex);
      if (totMatch) {
        curTotal = parseInt(totMatch[1] || totMatch[2] || totMatch[3], 10);
        continue;
      }
    }

    const tokens = trimmed.split(/\s+/);
    for (const tok of tokens) {
      const c = tok.replace(/[,.]/g, '').trim();
      if (c && c !== '총' && !c.endsWith('명')) {
        curAttendees.push(c);
      }
    }
  }

  if (curHeader) {
    rawMeetings.push({
      header: curHeader,
      attendees: curAttendees,
      total: curTotal || curAttendees.length
    });
  }

  console.log(`- 원천 벙기록 파싱 완료: ${rawMeetings.length}건`);

  // 3. Initialize member stats
  const memberStats = {};
  for (const m of membersMap.values()) {
    memberStats[m.uid] = {
      uid: m.uid,
      name: m.realName,
      attendanceCount: 0,
      baseScore: 0,
      expeditionScore: 0,
      hostCount: 0,
      totalScore: 0
    };
  }

  // 4. Aggregate 854 raw meetings
  for (const mtg of rawMeetings) {
    const isCondolenceOrWedding = ['문', '식'].some(s => mtg.header.title.endsWith(s));
    const isAwardOrEvent = ['상', '트'].some(s => mtg.header.title.endsWith(s));

    if (!isCondolenceOrWedding && !isAwardOrEvent && mtg.attendees.length > 0) {
      const hostRaw = mtg.attendees[0];
      const hostName = hostRaw.replace(/[0-9]/g, '').trim();
      const hostUid = nameToUid.get(hostName);
      if (hostUid && memberStats[hostUid]) {
        memberStats[hostUid].hostCount += 1;
      }
    }

    for (const att of mtg.attendees) {
      const name = att.replace(/[0-9]/g, '').trim();
      const numMatch = att.match(/[0-9]+/);
      // 그냥 이름만 있으면 1점, 뒤에 숫자가 붙으면 그 숫자로 계산!
      const pts = numMatch ? parseInt(numMatch[0], 10) : 1;

      const uid = nameToUid.get(name);
      if (!uid || !memberStats[uid]) continue;

      memberStats[uid].attendanceCount += 1;
      memberStats[uid].baseScore += 1;
      memberStats[uid].expeditionScore += Math.max(0, pts - 1);
      memberStats[uid].totalScore += pts;
    }
  }

  // 5. Aggregate recent post-854 meetings (26110601, 26110701)
  console.log('\n3. 원천 문서 이후 최신 벙 2건 누적 반영...');
  const postMeetings = ['26110601', '26110701'];
  for (const mtgId of postMeetings) {
    const mtg = meetingsMap.get(mtgId);
    if (!mtg || mtg.status !== 'settled') continue;

    if (mtg.hostUid && memberStats[mtg.hostUid]) {
      memberStats[mtg.hostUid].hostCount += 1;
    }

    const attendees = mtg.confirmedParticipants || mtg.applicants || [];
    const regInfo = detectMeetingRegion(mtg);
    const loc = (regInfo.recognized ? (regInfo.matchedKeyword || regInfo.group?.name) : null) || mtg.region || mtg.location;

    for (const uid of attendees) {
      const m = membersMap.get(uid);
      if (!m || !memberStats[uid]) continue;

      let earnedBase = 1;
      let earnedExpedition = 0;

      // Check if snapshot already has earned points
      if (mtg.memberScoreSnapshots && mtg.memberScoreSnapshots[uid]) {
        const sn = mtg.memberScoreSnapshots[uid];
        const earned = sn.earned || 1;
        earnedBase = 1;
        earnedExpedition = Math.max(0, earned - 1);
      } else {
        const calc = calculateMeetingScoreForMember(m, loc);
        earnedBase = calc.base || 1;
        earnedExpedition = calc.expedition || 0;
      }

      memberStats[uid].attendanceCount += 1;
      memberStats[uid].baseScore += earnedBase;
      memberStats[uid].expeditionScore += earnedExpedition;
      memberStats[uid].totalScore += (earnedBase + earnedExpedition);
      console.log(` · 최신 벙(${mtg.title}) 반영: ${m.realName} +${earnedBase + earnedExpedition}점`);
    }
  }

  // 6. Build updated members
  const updatedMembers = [];
  const notableCheck = ['모찌', '성민', '잔치', '다온', '써니', '유하', '콴', '슈슈', '민이'];

  console.log('\n4. 회원 통계 갱신 및 주요 회원 검증:');
  for (const m of membersMap.values()) {
    const st = memberStats[m.uid] || {
      attendanceCount: 0,
      baseScore: 0,
      expeditionScore: 0,
      hostCount: 0,
      totalScore: 0
    };
    const eventScore = Number(m.eventScore || 0);
    const finalTotal = st.totalScore + eventScore;

    const isSpecialRole = ['Leader', 'Deputy', 'VIP', 'OnLeave', 'Withdrawn', 'Wanderer', 'Expelled'].includes(m.role);
    const newRole = (!isSpecialRole && st.attendanceCount >= 1 && m.role === 'Rookie') ? 'Member' : m.role;

    const nextMember = {
      ...m,
      attendanceCount: st.attendanceCount,
      hostCount: st.hostCount,
      baseScore: st.baseScore,
      expeditionScore: st.expeditionScore,
      totalScore: finalTotal,
      role: newRole
    };
    updatedMembers.push(nextMember);

    if (notableCheck.includes(m.realName)) {
      console.log(` ★ ${m.realName} (${m.uid}): 참석 ${st.attendanceCount}회, 주최 ${st.hostCount}회, 기본 ${st.baseScore}점, 원정 ${st.expeditionScore}점, 총점 ${finalTotal}점`);
    }
  }

  // 7. Commit to Firestore
  console.log('\n5. Firestore 배치 업데이트 커밋 중...');
  const CHUNK_SIZE = 300;
  for (let i = 0; i < updatedMembers.length; i += CHUNK_SIZE) {
    const chunk = updatedMembers.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(db);
    for (const mem of chunk) {
      batch.set(doc(db, 'members', mem.uid), mem, { merge: true });
    }
    await batch.commit();
    console.log(` · 회원 배치 커밋 완료 (${i + 1} ~ ${Math.min(i + CHUNK_SIZE, updatedMembers.length)})`);
  }

  // 8. Update local seed files
  console.log('\n6. 로컬 시드 파일 (initialData.js, full_bung_data.json) 동기화 중...');
  const allMeetingsList = Array.from(meetingsMap.values());

  const fullDataPath = path.resolve(__dirname, 'data/full_bung_data.json');
  if (fs.existsSync(fullDataPath)) {
    const fullData = JSON.parse(fs.readFileSync(fullDataPath, 'utf8'));
    fullData.members = updatedMembers;
    fullData.memberCount = updatedMembers.length;
    fullData.meetings = allMeetingsList;
    fullData.meetingCount = allMeetingsList.length;
    fs.writeFileSync(fullDataPath, JSON.stringify(fullData, null, 2), 'utf8');
    console.log('✅ scripts/data/full_bung_data.json 동기화 완료!');
  }

  const initialDataPath = path.resolve(__dirname, '../src/core/initialData.js');
  const initialContent = `// Auto-generated & enriched community data
export const INITIAL_MEMBERS = ${JSON.stringify(updatedMembers, null, 2)};

export const INITIAL_MEETINGS = ${JSON.stringify(allMeetingsList, null, 2)};

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

  console.log('\n🎉 원천 텍스트 기반 정밀 벙점수 재계산 및 정합화 완료!');
  process.exit(0);
}

run().catch(err => {
  console.error('❌ 실행 중 에러 발생:', err);
  process.exit(1);
});

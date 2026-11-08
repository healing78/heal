import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { getTierBadgeByScore, detectMeetingRegion, calculateMeetingScoreForMember } from '../src/core/communityRules.js';

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
  console.log('=== 원천 벙기록 기반 ID 1:1 정밀 매칭 및 전 모임 스냅샷/벙주/총무 전수 재계산 시작 ===\n');

  // 1. Load data
  console.log('1. Firestore 최신 데이터 로딩...');
  const memSnap = await getDocs(collection(db, 'members'));
  const mtgSnap = await getDocs(collection(db, 'meetings'));

  const membersMap = new Map();
  memSnap.docs.forEach(d => {
    membersMap.set(d.id, { uid: d.id, ...d.data() });
  });

  const meetingsMap = new Map();
  mtgSnap.docs.forEach(d => {
    meetingsMap.set(d.id, { id: d.id, ...d.data() });
  });

  const fullDataPath = path.resolve(__dirname, 'data/full_bung_data.json');
  const fullData = JSON.parse(fs.readFileSync(fullDataPath, 'utf8'));

  fullData.members.forEach(m => {
    if (!membersMap.has(m.uid)) {
      membersMap.set(m.uid, { ...m });
    }
  });

  fullData.meetings.forEach(m => {
    if (!meetingsMap.has(String(m.id))) {
      meetingsMap.set(String(m.id), { ...m });
    }
  });

  // Name to UID mapping
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
  nameToUid.set('샤인', 'kakao:2009');
  nameToUid.set('성민', 'kakao:1117');
  nameToUid.set('잔치', 'kakao:1121');
  nameToUid.set('다온', 'kakao:1013');
  nameToUid.set('써니', 'kakao:1050');

  // 2. Parse raw_bung_doc.txt (854 records) with ID sequence
  console.log('\n2. raw_bung_doc.txt 파싱 및 모임 ID 생성...');
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
  const seqMap = {};

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();
    if (!trimmed || trimmed.includes('3️⃣  전체 벙기록')) continue;

    const hMatch = rawLine.match(headerRegex);
    if (hMatch && !rawLine.startsWith(' ') && !rawLine.startsWith('\t')) {
      if (curHeader) {
        rawMeetings.push({
          id: curHeader.id,
          header: curHeader,
          attendees: curAttendees,
          total: curTotal || curAttendees.length
        });
        curAttendees = [];
        curTotal = 0;
      }
      const yy = String(parseInt(hMatch[1], 10) % 100).padStart(2, '0');
      const mm = String(parseInt(hMatch[2], 10)).padStart(2, '0');
      const dd = String(parseInt(hMatch[3], 10)).padStart(2, '0');
      const title = hMatch[4].trim() || `${parseInt(mm, 10)}월${parseInt(dd, 10)}일벙`;
      const yymmdd = `${yy}${mm}${dd}`;
      seqMap[yymmdd] = (seqMap[yymmdd] || 0) + 1;
      const id = `${yymmdd}${String(seqMap[yymmdd]).padStart(2, '0')}`;
      curHeader = { id, year: parseInt(yy, 10), month: parseInt(mm, 10), day: parseInt(dd, 10), title, dateOnly: `20${yy}-${mm}-${dd}` };
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
      id: curHeader.id,
      header: curHeader,
      attendees: curAttendees,
      total: curTotal || curAttendees.length
    });
  }

  console.log(`- 원천 벙기록 파싱 완료: ${rawMeetings.length}건`);

  // Map raw meetings by ID
  const rawMeetingById = new Map();
  for (const rm of rawMeetings) {
    rawMeetingById.set(rm.id, rm);
  }

  // 3. Update all existing meetings by exact ID match
  console.log('\n3. 모임 ID 기준 1:1 참석자, 벙주, 총무 정확 매칭...');
  const allMeetings = Array.from(meetingsMap.values());

  for (const mtg of allMeetings) {
    const rawM = rawMeetingById.get(mtg.id);
    if (rawM) {
      // Parse attendees with scores
      const parsedAttendees = [];
      for (const att of rawM.attendees) {
        const name = att.replace(/[0-9]/g, '').trim();
        const numMatch = att.match(/[0-9]+/);
        const pts = numMatch ? parseInt(numMatch[0], 10) : 1;
        const uid = nameToUid.get(name);
        if (uid) {
          parsedAttendees.push({ name, uid, pts, raw: att });
        }
      }

      // Host & Treasurer: 맨앞에 있는 사람이 벙주이자 총무
      let hostUid = mtg.hostUid;
      let treasurerUid = mtg.treasurerUid;
      if (parsedAttendees.length > 0) {
        hostUid = parsedAttendees[0].uid;
        treasurerUid = hostUid;
      }

      const confirmedParticipants = parsedAttendees.map(a => a.uid);
      mtg.hostUid = hostUid;
      mtg.treasurerUid = treasurerUid;
      mtg.confirmedParticipants = confirmedParticipants;
      mtg.applicants = confirmedParticipants;
      mtg._parsedAttendees = parsedAttendees; // temporary for simulation
    }
  }

  // 4. Sort all meetings chronologically by ID ascending (24012901 -> 26110701)
  console.log('\n4. 시간순(2024년 1월 -> 2026년 11월) 정렬 및 스냅샷 전수 재계산...');
  allMeetings.sort((a, b) => String(a.id).localeCompare(String(b.id)));

  // Cumulative trackers
  const cumulativeScores = {};
  const cumulativeAttendance = {};
  const cumulativeHostCounts = {};

  for (const m of membersMap.values()) {
    cumulativeScores[m.uid] = 0;
    cumulativeAttendance[m.uid] = 0;
    cumulativeHostCounts[m.uid] = 0;
  }

  let totalRookiePromotions = 0;
  let totalBadgePromotions = 0;

  for (const mtg of allMeetings) {
    if (mtg.hostUid) {
      cumulativeHostCounts[mtg.hostUid] = (cumulativeHostCounts[mtg.hostUid] || 0) + 1;
    }

    const regInfo = detectMeetingRegion(mtg);
    const loc = (regInfo.recognized ? (regInfo.matchedKeyword || regInfo.group?.name) : null) || mtg.region || mtg.location;

    const attendees = mtg._parsedAttendees || (mtg.confirmedParticipants || []).map(uid => {
      const m = membersMap.get(uid);
      return { name: m?.realName || '', uid, pts: 1 };
    });

    const memberScoreSnapshots = {};
    const rookiePromotedUids = [];
    const badgePromotedUids = [];

    for (const a of attendees) {
      const uid = a.uid;
      const m = membersMap.get(uid);
      let pts = a.pts || 1;

      // For post-854 meetings without raw parsed points, use meeting points calculation
      if (!a.raw && !rawMeetingById.has(mtg.id)) {
        if (mtg.memberScoreSnapshots && mtg.memberScoreSnapshots[uid]?.earned) {
          pts = mtg.memberScoreSnapshots[uid].earned;
        } else if (m) {
          const calc = calculateMeetingScoreForMember(m, loc);
          pts = (calc.base || 1) + (calc.expedition || 0);
        }
      }

      const beforeScore = cumulativeScores[uid] || 0;
      const afterScore = beforeScore + pts;
      const beforeBadge = getTierBadgeByScore(beforeScore);
      const afterBadge = getTierBadgeByScore(afterScore);

      // 신입 -> 정회원 승급 (최초 1회 참석, beforeScore === 0)
      const isRookiePromotion = (beforeScore === 0);
      if (isRookiePromotion) {
        rookiePromotedUids.push(uid);
        totalRookiePromotions++;
      }

      // 마일스톤 뱃지 승급 (새로운 뱃지 티어 달성)
      const isBadgePromoted = (beforeBadge !== afterBadge && Boolean(afterBadge));
      if (isBadgePromoted) {
        badgePromotedUids.push(uid);
        totalBadgePromotions++;
      }

      memberScoreSnapshots[uid] = {
        beforeScore,
        afterScore,
        earned: pts,
        beforeBadge,
        afterBadge,
        isRookiePromotion,
        isBadgePromoted
      };

      cumulativeScores[uid] = afterScore;
      cumulativeAttendance[uid] = (cumulativeAttendance[uid] || 0) + 1;
    }

    delete mtg._parsedAttendees;
    mtg.status = 'settled';
    mtg.memberScoreSnapshots = memberScoreSnapshots;
    mtg.rookiePromotedUids = rookiePromotedUids;
    mtg.badgePromotedUids = badgePromotedUids;
  }

  console.log(`- 전체 모임 스냅샷 완료! (신입 승급 총 ${totalRookiePromotions}건, 뱃지 승급 총 ${totalBadgePromotions}건)`);

  // 5. Verification: Sep 17 meetings & Shine
  console.log('\n5. 9월 17일 모임 및 샤인 검증:');
  const mtgJeonju = allMeetings.find(m => m.id === '26091701');
  const mtgJeju = allMeetings.find(m => m.id === '26091702');

  console.log('★ 26091701 전주커피벙 검증:', {
    id: mtgJeonju?.id,
    title: mtgJeonju?.title,
    host: membersMap.get(mtgJeonju?.hostUid)?.realName,
    treasurer: membersMap.get(mtgJeonju?.treasurerUid)?.realName,
    attendees: mtgJeonju?.confirmedParticipants?.map(u => membersMap.get(u)?.realName)
  });

  console.log('★ 26091702 제주벙 검증:', {
    id: mtgJeju?.id,
    title: mtgJeju?.title,
    host: membersMap.get(mtgJeju?.hostUid)?.realName,
    treasurer: membersMap.get(mtgJeju?.treasurerUid)?.realName,
    attendees: mtgJeju?.confirmedParticipants?.map(u => membersMap.get(u)?.realName)
  });

  const shineUid = 'kakao:2009';
  const shineFirstMtg = allMeetings.find(m => m.confirmedParticipants?.includes(shineUid));
  console.log('★ 샤인 첫 번째 모임 검증:', {
    id: shineFirstMtg?.id,
    title: shineFirstMtg?.title,
    host: membersMap.get(shineFirstMtg?.hostUid)?.realName,
    shineSnapshot: shineFirstMtg?.memberScoreSnapshots?.[shineUid],
    rookiePromotedUids: shineFirstMtg?.rookiePromotedUids
  });

  // 6. Update member stats
  const updatedMembers = [];
  for (const m of membersMap.values()) {
    const att = cumulativeAttendance[m.uid] || 0;
    const tot = cumulativeScores[m.uid] || 0;
    const host = cumulativeHostCounts[m.uid] || 0;
    const eventScore = Number(m.eventScore || 0);

    const isSpecialRole = ['Leader', 'Deputy', 'VIP', 'OnLeave', 'Withdrawn', 'Wanderer', 'Expelled'].includes(m.role);
    const newRole = (!isSpecialRole && att >= 1 && m.role === 'Rookie') ? 'Member' : m.role;

    updatedMembers.push({
      ...m,
      attendanceCount: att,
      totalScore: tot + eventScore,
      baseScore: att,
      expeditionScore: Math.max(0, tot - att),
      hostCount: host,
      role: newRole
    });
  }

  // 7. Commit to Firestore
  console.log('\n6. Firestore 일괄 커밋 중...');
  const MTG_CHUNK = 200;
  for (let i = 0; i < allMeetings.length; i += MTG_CHUNK) {
    const chunk = allMeetings.slice(i, i + MTG_CHUNK);
    const batch = writeBatch(db);
    for (const mtg of chunk) {
      batch.set(doc(db, 'meetings', String(mtg.id)), mtg, { merge: true });
    }
    await batch.commit();
    console.log(` · 모임 배치 커밋 (${i + 1} ~ ${Math.min(i + MTG_CHUNK, allMeetings.length)})`);
  }

  const MEM_CHUNK = 200;
  for (let i = 0; i < updatedMembers.length; i += MEM_CHUNK) {
    const chunk = updatedMembers.slice(i, i + MEM_CHUNK);
    const batch = writeBatch(db);
    for (const mem of chunk) {
      batch.set(doc(db, 'members', mem.uid), mem, { merge: true });
    }
    await batch.commit();
    console.log(` · 회원 배치 커밋 (${i + 1} ~ ${Math.min(i + MEM_CHUNK, updatedMembers.length)})`);
  }

  // 8. Update local files
  console.log('\n7. 로컬 시드 파일 동기화 중...');
  fullData.members = updatedMembers;
  fullData.memberCount = updatedMembers.length;
  fullData.meetings = allMeetings;
  fullData.meetingCount = allMeetings.length;
  fs.writeFileSync(fullDataPath, JSON.stringify(fullData, null, 2), 'utf8');
  console.log('✅ scripts/data/full_bung_data.json 동기화 완료!');

  const initialDataPath = path.resolve(__dirname, '../src/core/initialData.js');
  const initialContent = `// Auto-generated & enriched community data
export const INITIAL_MEMBERS = ${JSON.stringify(updatedMembers, null, 2)};

export const INITIAL_MEETINGS = ${JSON.stringify(allMeetings, null, 2)};

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

  console.log('\n🎉 전수조사 및 ID 1:1 정밀 매칭/스냅샷 재구축 완료!');
  process.exit(0);
}

run().catch(err => {
  console.error('❌ 실행 중 에러 발생:', err);
  process.exit(1);
});

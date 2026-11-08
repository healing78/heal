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
  console.log('=== 856개 모임 전수 스냅샷, 뱃지변화, 신입승급, 벙주/총무 전면 재생성 시작 ===\n');

  // 1. Load data
  console.log('1. Firestore 최신 데이터 로딩...');
  const memSnap = await getDocs(collection(db, 'members'));
  const mtgSnap = await getDocs(collection(db, 'meetings'));

  const membersMap = new Map();
  memSnap.docs.forEach(d => {
    membersMap.set(d.id, { uid: d.id, ...d.data() });
  });

  const fullDataPath = path.resolve(__dirname, 'data/full_bung_data.json');
  const fullData = JSON.parse(fs.readFileSync(fullDataPath, 'utf8'));

  fullData.members.forEach(m => {
    if (!membersMap.has(m.uid)) {
      membersMap.set(m.uid, { ...m });
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

  // 2. Parse raw_bung_doc.txt (854 records)
  console.log('\n2. raw_bung_doc.txt 파싱 및 시간순(과거->최신) 정렬...');
  const rawDocPath = 'C:/Users/cntok/.gemini/antigravity-cli/brain/0859836e-35af-45ed-830a-f14357246a76/scratch/raw_bung_doc.txt';
  const rawText = fs.readFileSync(rawDocPath, 'utf8');

  const sec3Idx = rawText.indexOf('3️⃣  전체 벙기록');
  const sec3Text = sec3Idx !== -1 ? rawText.slice(sec3Idx) : rawText;

  const lines = sec3Text.split(/\r?\n/);
  const headerRegex = /^\s*(\d{2,4})년\s*(\d{1,2})월\s*(\d{1,2})일\s*(.*)$/;
  const totalRegex = /총\s*(\d+)\s*명|총\s*(\d+)|(\d+)\s*명/;

  const rawMeetingsDesc = [];
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
        rawMeetingsDesc.push({
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
    rawMeetingsDesc.push({
      header: curHeader,
      attendees: curAttendees,
      total: curTotal || curAttendees.length
    });
  }

  console.log(`- 파싱된 원천 벙기록: ${rawMeetingsDesc.length}건 (최신순)`);

  // Reverse to chronological order (oldest to newest: 24.01.29 -> 26.11.01)
  const rawMeetingsAsc = [...rawMeetingsDesc].reverse();

  // 3. Match with existing meetings in fullData.meetings (which are already chronological)
  const existingMeetings = fullData.meetings;
  console.log(`- 기존 모임 데이터: ${existingMeetings.length}건`);

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

  // Process 854 raw meetings
  for (let i = 0; i < rawMeetingsAsc.length; i++) {
    const rawM = rawMeetingsAsc[i];
    const mtg = existingMeetings[i];
    if (!mtg) continue;

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

    // Host & Treasurer: "맨앞에 있는 사람이 벙주이며 총무야"
    let hostUid = mtg.hostUid;
    let treasurerUid = mtg.treasurerUid;
    if (parsedAttendees.length > 0) {
      hostUid = parsedAttendees[0].uid;
      treasurerUid = hostUid;
      cumulativeHostCounts[hostUid] = (cumulativeHostCounts[hostUid] || 0) + 1;
    }

    const confirmedParticipants = parsedAttendees.map(a => a.uid);
    const memberScoreSnapshots = {};
    const rookiePromotedUids = [];
    const badgePromotedUids = [];

    for (const a of parsedAttendees) {
      const uid = a.uid;
      const pts = a.pts;
      const beforeScore = cumulativeScores[uid] || 0;
      const afterScore = beforeScore + pts;
      const beforeBadge = getTierBadgeByScore(beforeScore);
      const afterBadge = getTierBadgeByScore(afterScore);

      // 신입 -> 정회원 승급 판정 (누적 점수 0점 -> 1점 이상 최초 참석)
      const isRookiePromotion = (beforeScore === 0);
      if (isRookiePromotion) {
        rookiePromotedUids.push(uid);
        totalRookiePromotions++;
      }

      // 마일스톤 뱃지 승급 판정 (새로운 뱃지 티어 달성)
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

    mtg.status = 'settled';
    mtg.hostUid = hostUid;
    mtg.treasurerUid = treasurerUid;
    mtg.confirmedParticipants = confirmedParticipants;
    mtg.applicants = confirmedParticipants;
    mtg.memberScoreSnapshots = memberScoreSnapshots;
    mtg.rookiePromotedUids = rookiePromotedUids;
    mtg.badgePromotedUids = badgePromotedUids;
  }

  // 4. Process post-854 meetings (26110601, 26110701)
  console.log('\n3. 최신 벙 2건 누적 스냅샷 처리...');
  for (let i = rawMeetingsAsc.length; i < existingMeetings.length; i++) {
    const mtg = existingMeetings[i];
    const hostUid = mtg.hostUid;
    const treasurerUid = hostUid;
    mtg.treasurerUid = treasurerUid;
    if (hostUid) {
      cumulativeHostCounts[hostUid] = (cumulativeHostCounts[hostUid] || 0) + 1;
    }

    const regInfo = detectMeetingRegion(mtg);
    const loc = (regInfo.recognized ? (regInfo.matchedKeyword || regInfo.group?.name) : null) || mtg.region || mtg.location;

    const attendees = mtg.confirmedParticipants || [];
    const memberScoreSnapshots = {};
    const rookiePromotedUids = [];
    const badgePromotedUids = [];

    for (const uid of attendees) {
      const m = membersMap.get(uid);
      if (!m) continue;

      let earned = 1;
      if (mtg.memberScoreSnapshots && mtg.memberScoreSnapshots[uid]?.earned) {
        earned = mtg.memberScoreSnapshots[uid].earned;
      } else {
        const calc = calculateMeetingScoreForMember(m, loc);
        earned = (calc.base || 1) + (calc.expedition || 0);
      }

      const beforeScore = cumulativeScores[uid] || 0;
      const afterScore = beforeScore + earned;
      const beforeBadge = getTierBadgeByScore(beforeScore);
      const afterBadge = getTierBadgeByScore(afterScore);

      const isRookiePromotion = (beforeScore === 0);
      if (isRookiePromotion) {
        rookiePromotedUids.push(uid);
        totalRookiePromotions++;
      }

      const isBadgePromoted = (beforeBadge !== afterBadge && Boolean(afterBadge));
      if (isBadgePromoted) {
        badgePromotedUids.push(uid);
        totalBadgePromotions++;
      }

      memberScoreSnapshots[uid] = {
        beforeScore,
        afterScore,
        earned,
        beforeBadge,
        afterBadge,
        isRookiePromotion,
        isBadgePromoted
      };

      cumulativeScores[uid] = afterScore;
      cumulativeAttendance[uid] = (cumulativeAttendance[uid] || 0) + 1;
    }

    mtg.status = 'settled';
    mtg.memberScoreSnapshots = memberScoreSnapshots;
    mtg.rookiePromotedUids = rookiePromotedUids;
    mtg.badgePromotedUids = badgePromotedUids;
  }

  console.log(`- 전체 모임 스냅샷 완료! (신입 승급 이벤트 총 ${totalRookiePromotions}건, 뱃지 승급 이벤트 총 ${totalBadgePromotions}건)`);

  // 5. Verification: Shine, Mozzi, Sungmin
  console.log('\n4. 정합성 검증:');
  const shineUid = 'kakao:2009';
  const shineFirstMtg = existingMeetings.find(m => m.confirmedParticipants?.includes(shineUid));
  console.log('★ 샤인 첫 번째 모임 검증:', {
    id: shineFirstMtg?.id,
    title: shineFirstMtg?.title,
    date: shineFirstMtg?.date,
    hostUid: shineFirstMtg?.hostUid,
    treasurerUid: shineFirstMtg?.treasurerUid,
    shineSnapshot: shineFirstMtg?.memberScoreSnapshots?.[shineUid],
    rookiePromotedUids: shineFirstMtg?.rookiePromotedUids
  });

  const mozziUid = 'kakao:2000';
  const mozziMtgs = existingMeetings.filter(m => m.confirmedParticipants?.includes(mozziUid));
  const mozziZebraMtg = mozziMtgs.find(m => m.memberScoreSnapshots?.[mozziUid]?.isBadgePromoted);
  console.log('★ 모찌 첫 얼룩말(🦓) 달성 모임 검증:', {
    id: mozziZebraMtg?.id,
    title: mozziZebraMtg?.title,
    date: mozziZebraMtg?.date,
    mozziSnapshot: mozziZebraMtg?.memberScoreSnapshots?.[mozziUid],
    badgePromotedUids: mozziZebraMtg?.badgePromotedUids
  });

  // 6. Update member final stats to match cumulative exact counts
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
  console.log('\n5. Firestore 배치 업데이트 커밋 중...');
  const MTG_CHUNK = 200;
  for (let i = 0; i < existingMeetings.length; i += MTG_CHUNK) {
    const chunk = existingMeetings.slice(i, i + MTG_CHUNK);
    const batch = writeBatch(db);
    for (const mtg of chunk) {
      batch.set(doc(db, 'meetings', String(mtg.id)), mtg, { merge: true });
    }
    await batch.commit();
    console.log(` · 모임 배치 커밋 (${i + 1} ~ ${Math.min(i + MTG_CHUNK, existingMeetings.length)})`);
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

  // 8. Update local seed files
  console.log('\n6. 로컬 시드 파일 (full_bung_data.json, initialData.js) 동기화 중...');
  fullData.members = updatedMembers;
  fullData.memberCount = updatedMembers.length;
  fullData.meetings = existingMeetings;
  fullData.meetingCount = existingMeetings.length;
  fs.writeFileSync(fullDataPath, JSON.stringify(fullData, null, 2), 'utf8');
  console.log('✅ scripts/data/full_bung_data.json 동기화 완료!');

  const initialDataPath = path.resolve(__dirname, '../src/core/initialData.js');
  const initialContent = `// Auto-generated & enriched community data
export const INITIAL_MEMBERS = ${JSON.stringify(updatedMembers, null, 2)};

export const INITIAL_MEETINGS = ${JSON.stringify(existingMeetings, null, 2)};

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

  console.log('\n🎉 전 모임 스냅샷, 당시 뱃지, 벙주/총무, 승급 이벤트 전수 재구축 완료!');
  process.exit(0);
}

run().catch(err => {
  console.error('❌ 실행 중 에러 발생:', err);
  process.exit(1);
});

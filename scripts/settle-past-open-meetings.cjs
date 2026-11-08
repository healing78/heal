const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, writeBatch, doc } = require('firebase/firestore');

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

// Simple region resolver matching communityRules.js
const REGION_MAP = {
  수원: 1, 화성: 1, 오산: 1, 용인: 1, 평택: 1, 안성: 1, 성남: 1, 분당: 1, 수지: 1, 안양: 1, 군포: 1, 의왕: 1, 과천: 1, 시흥: 1, 안산: 1, 광명: 1, 부천: 1, 인천: 1, 김포: 1, 고양: 1, 일산: 1, 파주: 1, 서울: 1, 영등포: 1, 강남: 1, 서초: 1, 송파: 1, 강동: 1, 마포: 1, 용산: 1, 종로: 1, 중구: 1, 성동: 1, 광진: 1, 동대문: 1, 중랑: 1, 성북: 1, 강북: 1, 도봉: 1, 노원: 1, 은평: 1, 서대문: 1, 양천: 1, 강서: 1, 구로: 1, 금천: 1, 동작: 1, 관악: 1, 하남: 1, 구리: 1, 남양주: 1, 양평: 1, 가평: 1, 포천: 1, 동두천: 1, 연천: 1, 의정부: 1, 양주: 1, 여주: 1, 이천: 1, 광주: 1,
  대전: 2, 세종: 2, 천안: 2, 아산: 2, 청주: 2, 충주: 2, 제천: 2, 공주: 2, 보령: 2, 서산: 2, 논산: 2, 당진: 2, 금산: 2, 부여: 2, 서천: 2, 청양: 2, 홍성: 2, 예산: 2, 태안: 2, 보은: 2, 옥천: 2, 영동: 2, 증평: 2, 진천: 2, 괴산: 2, 음성: 2, 단양: 2,
  대구: 3, 부산: 3, 울산: 3, 포항: 3, 경주: 3, 김천: 3, 안동: 3, 구미: 3, 영주: 3, 영천: 3, 상주: 3, 문경: 3, 경산: 3, 창원: 3, 진주: 3, 통영: 3, 사천: 3, 김해: 3, 밀양: 3, 거제: 3, 양산: 3,
  광주광역시: 4, 전주: 4, 익산: 4, 군산: 4, 정읍: 4, 남원: 4, 김제: 4, 목포: 4, 여수: 4, 순천: 4, 나주: 4, 광양: 4, 담양: 4, 곡성: 4, 구례: 4, 고흥: 4, 보성: 4, 화순: 4, 장흥: 4, 강진: 4, 해남: 4, 영암: 4, 무안: 4, 함평: 4, 영광: 4, 장성: 4, 완도: 4, 진도: 4, 신안: 4,
  춘천: 5, 원주: 5, 강릉: 5, 동해: 5, 태백: 5, 속초: 5, 삼척: 5, 홍천: 5, 횡성: 5, 영월: 5, 평창: 5, 정선: 5, 철원: 5, 화천: 5, 양구: 5, 인제: 5, 고성: 5, 양양: 5,
  제주: 6, 서귀포: 6
};

function resolveRegion(text) {
  if (!text) return null;
  for (const [k, v] of Object.entries(REGION_MAP)) {
    if (text.includes(k)) return v;
  }
  return 1; // default 서울·경기
}

function calcScore(member, meetingLoc) {
  const memberHome = member?.homeCity || member?.city || '';
  const memberReg = resolveRegion(memberHome) || 1;
  const mtgReg = resolveRegion(meetingLoc) || 1;
  const isExpedition = memberReg !== mtgReg;
  return {
    base: 1,
    expedition: isExpedition ? 1 : 0,
    total: isExpedition ? 2 : 1
  };
}

async function run() {
  const isDryRun = process.argv.includes('--dry-run');
  console.log(`=== 과거 미마감 벙 일괄 마감 처리 스크립트 ${isDryRun ? '(DRY-RUN)' : '(실제 DB 반영)'} ===\n`);

  // 1. Fetch from Firestore
  console.log('1. Firestore에서 모임 및 회원 데이터 로딩 중...');
  const mtgSnap = await getDocs(collection(db, 'meetings'));
  const memSnap = await getDocs(collection(db, 'members'));

  const meetings = mtgSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const membersMap = new Map();
  memSnap.docs.forEach(d => {
    membersMap.set(d.id, { uid: d.id, ...d.data() });
  });

  console.log(`- 전체 모임: ${meetings.length}건, 전체 회원: ${membersMap.size}명`);

  // 2. Identify un-settled past meetings (date <= 2026-11-08)
  const nowStr = '2026-11-08 23:59';
  const targetMeetings = meetings
    .filter(m => m.status !== 'settled')
    .filter(m => {
      const dt = m.date || (m.dateOnly ? `${m.dateOnly} ${m.startTime || '19:00'}` : '');
      return dt && dt <= nowStr;
    })
    .sort((a, b) => (a.date || a.dateOnly).localeCompare(b.date || b.dateOnly));

  console.log(`\n2. 마감 대상 과거 미마감 모임: 총 ${targetMeetings.length}건`);
  if (targetMeetings.length === 0) {
    console.log('마감할 과거 모임이 없습니다.');
    process.exit(0);
  }

  const updatedMeetings = [];
  const memberDeltaMap = new Map(); // uid -> { att: 0, base: 0, exp: 0, total: 0, newRole: null }

  for (const mtg of targetMeetings) {
    const rawApplicants = Array.isArray(mtg.applicants) ? mtg.applicants : [];
    const rawConfirmed = Array.isArray(mtg.confirmedParticipants) ? mtg.confirmedParticipants : [];
    // Combine applicants + confirmed
    const finalConfirmed = Array.from(new Set([...rawApplicants, ...rawConfirmed]));

    console.log(`\n--------------------------------------------------`);
    console.log(`[모임 ID: ${mtg.id}] "${mtg.title}"`);
    console.log(`- 날짜: ${mtg.date || mtg.dateOnly}, 장소: ${mtg.location || mtg.placeDetail || '미정'}`);
    console.log(`- 기존 상태: ${mtg.status} (신청 ${rawApplicants.length}명, 확정 ${rawConfirmed.length}명)`);
    console.log(`- 마감 확정 참석자: 총 ${finalConfirmed.length}명`);

    const rookiePromotedUids = [];
    const memberScoreSnapshots = {};

    for (const uid of finalConfirmed) {
      const mem = membersMap.get(uid);
      const memName = mem ? mem.realName : uid;
      const memRole = mem ? mem.role : 'Member';
      const curAtt = mem ? (mem.attendanceCount || 0) : 0;
      const curTotal = mem ? (mem.totalScore || 0) : 0;

      const delta = calcScore(mem, mtg.location || mtg.placeDetail || '');
      const isSpecial = ['Leader', 'Deputy', 'VIP', 'OnLeave', 'Withdrawn', 'Wanderer', 'Expelled'].includes(memRole);
      const isRookie = !isSpecial && (memRole === 'Rookie' || curAtt === 0);

      if (isRookie) {
        rookiePromotedUids.push(uid);
      }

      memberScoreSnapshots[uid] = {
        beforeScore: curTotal,
        afterScore: curTotal + delta.total,
        earned: delta.total,
        isRookiePromotion: isRookie
      };

      // Accumulate member stats delta
      const existingDelta = memberDeltaMap.get(uid) || {
        att: 0,
        base: 0,
        exp: 0,
        total: 0,
        newRole: null
      };
      existingDelta.att += 1;
      existingDelta.base += delta.base;
      existingDelta.exp += delta.expedition;
      existingDelta.total += delta.total;
      if (isRookie) {
        existingDelta.newRole = 'Member';
      }
      memberDeltaMap.set(uid, existingDelta);

      console.log(`  · ${memName}(${memRole}): +${delta.total}점 (누적 ${curTotal} → ${curTotal + delta.total})${isRookie ? ' [🎉 정회원 승급]' : ''}`);
    }

    const updatedMtg = {
      ...mtg,
      status: 'settled',
      confirmedParticipants: finalConfirmed,
      rookiePromotedUids,
      memberScoreSnapshots
    };
    updatedMeetings.push(updatedMtg);
  }

  console.log(`\n==================================================`);
  console.log(`3. 회원 스탯 변동 요약: 총 ${memberDeltaMap.size}명 반영 예정`);
  for (const [uid, delta] of memberDeltaMap.entries()) {
    const mem = membersMap.get(uid);
    const name = mem ? mem.realName : uid;
    console.log(`- ${name}: 참석 +${delta.att}회, 총점 +${delta.total}점${delta.newRole ? ` (승급: ${delta.newRole})` : ''}`);
  }

  if (isDryRun) {
    console.log('\n[Dry-run 완료] 실제 DB에는 변경 사항이 적용되지 않았습니다. 적용하려면 --dry-run 옵션 없이 실행하세요.');
    process.exit(0);
  }

  // 4. Commit to Firestore
  console.log('\n4. Firestore 일괄 커밋 실행 중...');
  const batch = writeBatch(db);

  // Update meetings
  for (const mtg of updatedMeetings) {
    const docRef = doc(db, 'meetings', String(mtg.id));
    batch.set(docRef, mtg, { merge: true });
  }

  // Update members
  for (const [uid, delta] of memberDeltaMap.entries()) {
    const mem = membersMap.get(uid);
    if (!mem) continue;
    const docRef = doc(db, 'members', uid);
    const nextMember = {
      ...mem,
      attendanceCount: (mem.attendanceCount || 0) + delta.att,
      baseScore: (mem.baseScore || 0) + delta.base,
      expeditionScore: (mem.expeditionScore || 0) + delta.exp,
      totalScore: (mem.totalScore || 0) + delta.total,
      monthlyScore: (mem.monthlyScore || 0) + delta.total,
      ...(delta.newRole ? { role: delta.newRole } : {})
    };
    batch.set(docRef, nextMember, { merge: true });
  }

  await batch.commit();
  console.log('✅ Firestore 일괄 마감 및 회원 벙점수/승급 반영 완료!');

  // 5. Update local initialData.js
  const initialDataPath = path.resolve(__dirname, '../src/core/initialData.js');
  let initialContent = fs.readFileSync(initialDataPath, 'utf8');

  // Load current INITIAL_MEETINGS and update
  const matchMeetings = initialContent.match(/export const INITIAL_MEETINGS = (\[[\s\S]*?\]);\n\nexport const INITIAL_SCORE_LOGS/);
  if (matchMeetings) {
    const localMeetings = eval(matchMeetings[1]);
    const updatedLocalMeetings = localMeetings.map(lm => {
      const target = updatedMeetings.find(um => String(um.id) === String(lm.id));
      return target || lm;
    });
    // If some target meetings were only in Firestore (e.g. 26110601), append them!
    for (const um of updatedMeetings) {
      if (!updatedLocalMeetings.some(lm => String(lm.id) === String(um.id))) {
        updatedLocalMeetings.unshift(um);
      }
    }

    const newMeetingsJson = JSON.stringify(updatedLocalMeetings, null, 2);
    initialContent = initialContent.replace(matchMeetings[0], `export const INITIAL_MEETINGS = ${newMeetingsJson};\n\nexport const INITIAL_SCORE_LOGS`);
    fs.writeFileSync(initialDataPath, initialContent, 'utf8');
    console.log('✅ src/core/initialData.js 로컬 시드 데이터 동기화 완료!');
  }

  console.log('\n🎉 모든 과거 벙 마감 및 참석자 승급/점수 처리가 성공적으로 완료되었습니다!');
  process.exit(0);
}

run().catch(err => {
  console.error('❌ 실행 중 에러 발생:', err);
  process.exit(1);
});

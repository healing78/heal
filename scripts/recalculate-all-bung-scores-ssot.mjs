import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { INITIAL_MEMBERS, INITIAL_MEETINGS } from '../src/core/initialData.js';
import {
  detectMeetingRegion,
  calculateMeetingScoreForMember,
  getMemberTotalScore,
  getTierBadgeByScore
} from '../src/core/communityRules.js';

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
  console.log('=== 전체 벙기록 기반 전 회원 벙점수 SSOT 재계산 및 정합화 시작 ===\n');

  // 1. Load latest from Firestore or fallback to initialData
  console.log('1. Firestore 최신 데이터 로딩...');
  const memSnap = await getDocs(collection(db, 'members'));
  const mtgSnap = await getDocs(collection(db, 'meetings'));

  const membersMap = new Map();
  memSnap.docs.forEach(d => {
    membersMap.set(d.id, { uid: d.id, ...d.data() });
  });
  // Ensure any member in INITIAL_MEMBERS is present
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

  // 2. Fix Mozzi profile
  const mozzi = membersMap.get('kakao:2000');
  if (mozzi) {
    mozzi.city = '은평';
    mozzi.homeCity = '은평';
    mozzi.maritalStatus = 'divorced';
    mozzi.gender = '남';
    console.log('✅ 모찌 프로필 정정 (은평 / 돌 / 남)');
  }

  // 3. Fix 26102501 Jeonju meeting snapshot for Sungmin
  const jeonjuMtg = meetingsMap.get('26102501');
  if (jeonjuMtg && jeonjuMtg.memberScoreSnapshots?.['kakao:1117']) {
    jeonjuMtg.memberScoreSnapshots['kakao:1117'] = {
      beforeScore: 1,
      afterScore: 2,
      earned: 1,
      isRookiePromotion: false
    };
    console.log('✅ 26102501 전주벙 성민 스냅샷 정상화 (광주→전주 동일 전라권역: 1점)');
  }

  // 4. Recalculate stats for all members from settled meetings
  const settledMeetings = Array.from(meetingsMap.values()).filter(m => m.status === 'settled');
  console.log(`\n2. 마감된 모임 ${settledMeetings.length}건 기반 점수 멱등 재계산 중...`);

  const statsMap = {};
  for (const m of membersMap.values()) {
    statsMap[m.uid] = {
      baseScore: 0,
      expeditionScore: 0,
      attendanceCount: 0,
      hostCount: 0,
      attendedMeetingsCount: 0
    };
  }

  for (const mtg of settledMeetings) {
    if (mtg.hostUid && statsMap[mtg.hostUid]) {
      statsMap[mtg.hostUid].hostCount += 1;
    }

    const attendees = mtg.confirmedParticipants && mtg.confirmedParticipants.length > 0
      ? mtg.confirmedParticipants
      : mtg.applicants || [];

    const regInfo = detectMeetingRegion(mtg);
    const loc = (regInfo.recognized ? (regInfo.matchedKeyword || regInfo.group?.name) : null) || mtg.region || mtg.location;

    const uniqueUids = Array.from(new Set(attendees));
    for (const uid of uniqueUids) {
      const m = membersMap.get(uid);
      if (!m || !statsMap[uid]) continue;
      const calc = calculateMeetingScoreForMember(m, loc);
      statsMap[uid].baseScore += calc.base || 1;
      statsMap[uid].expeditionScore += calc.expedition || 0;
      statsMap[uid].attendanceCount += 1;
      statsMap[uid].attendedMeetingsCount += 1;
    }
  }

  // 5. Build updated members
  const updatedMembers = [];
  const notableChanges = [];

  for (const m of membersMap.values()) {
    const stats = statsMap[m.uid] || {
      baseScore: 0,
      expeditionScore: 0,
      attendanceCount: 0,
      hostCount: 0
    };
    const eventScore = Number(m.eventScore || 0);
    const newTotal = stats.baseScore + stats.expeditionScore + eventScore;
    const oldTotal = getMemberTotalScore(m);
    const oldAtt = Number(m.attendanceCount || 0);

    const isSpecialRole = ['Leader', 'Deputy', 'VIP', 'OnLeave', 'Withdrawn', 'Wanderer', 'Expelled'].includes(m.role);
    const newRole = (!isSpecialRole && stats.attendanceCount >= 1 && m.role === 'Rookie') ? 'Member' : m.role;

    const nextMember = {
      ...m,
      attendanceCount: stats.attendanceCount,
      hostCount: stats.hostCount,
      baseScore: stats.baseScore,
      expeditionScore: stats.expeditionScore,
      totalScore: newTotal,
      role: newRole
    };

    updatedMembers.push(nextMember);

    if (Math.abs(newTotal - oldTotal) >= 5 || stats.attendanceCount !== oldAtt) {
      notableChanges.push({
        name: m.realName,
        uid: m.uid,
        oldAtt,
        newAtt: stats.attendanceCount,
        oldTotal,
        newTotal,
        diff: newTotal - oldTotal
      });
    }
  }

  console.log(`\n3. 주요 점수/참석 복원 회원 (${notableChanges.length}명 추출):`);
  notableChanges
    .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
    .slice(0, 25)
    .forEach(c => {
      console.log(` · ${c.name} (${c.uid}): 참석 ${c.oldAtt}→${c.newAtt}회, 점수 ${c.oldTotal}→${c.newTotal}점 (${c.diff > 0 ? '+' : ''}${c.diff}점)`);
    });

  // Specifically check Mozzi and Sungmin
  const finalMozzi = updatedMembers.find(m => m.uid === 'kakao:2000');
  console.log('\n★ 모찌 최종 결과:', {
    name: finalMozzi.realName,
    city: finalMozzi.city,
    homeCity: finalMozzi.homeCity,
    attendance: finalMozzi.attendanceCount,
    base: finalMozzi.baseScore,
    expedition: finalMozzi.expeditionScore,
    total: finalMozzi.totalScore
  });

  const finalSungmin = updatedMembers.find(m => m.uid === 'kakao:1117');
  console.log('★ 성민 최종 결과:', {
    name: finalSungmin.realName,
    city: finalSungmin.city,
    attendance: finalSungmin.attendanceCount,
    base: finalSungmin.baseScore,
    expedition: finalSungmin.expeditionScore,
    total: finalSungmin.totalScore
  });

  // 6. Commit to Firestore in chunks of 300
  console.log('\n4. Firestore 일괄 업데이트 커밋 중...');
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

  // Update Jeonju meeting in Firestore
  if (jeonjuMtg) {
    const mtgBatch = writeBatch(db);
    mtgBatch.set(doc(db, 'meetings', '26102501'), jeonjuMtg, { merge: true });
    await mtgBatch.commit();
    console.log(' · 26102501 전주벙 Firestore 커밋 완료');
  }

  // 7. Update initialData.js and full_bung_data.json
  console.log('\n5. 로컬 시드 파일 동기화 중...');
  const initialDataPath = path.resolve(__dirname, '../src/core/initialData.js');
  let initialContent = fs.readFileSync(initialDataPath, 'utf8');

  // Replace INITIAL_MEMBERS
  const membersRegex = /export const INITIAL_MEMBERS = \[[\s\S]*?\n\];\n\nexport const INITIAL_MEETINGS/;
  const membersJson = JSON.stringify(updatedMembers, null, 2);
  initialContent = initialContent.replace(membersRegex, `export const INITIAL_MEMBERS = ${membersJson};\n\nexport const INITIAL_MEETINGS`);

  // Replace INITIAL_MEETINGS with updated meetingsMap
  const meetingsRegex = /export const INITIAL_MEETINGS = \[[\s\S]*?\n\];\n\nexport const INITIAL_SCORE_LOGS/;
  const allMeetingsList = Array.from(meetingsMap.values());
  const meetingsJson = JSON.stringify(allMeetingsList, null, 2);
  initialContent = initialContent.replace(meetingsRegex, `export const INITIAL_MEETINGS = ${meetingsJson};\n\nexport const INITIAL_SCORE_LOGS`);

  fs.writeFileSync(initialDataPath, initialContent, 'utf8');
  console.log('✅ src/core/initialData.js 동기화 완료!');

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

  console.log('\n🎉 전체 벙점수 SSOT 재계산 및 정합화 완료!');
  process.exit(0);
}

run().catch(err => {
  console.error('❌ 실행 중 에러 발생:', err);
  process.exit(1);
});

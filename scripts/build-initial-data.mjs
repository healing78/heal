import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parsedDataPath = 'C:/Users/cntok/.gemini/antigravity-cli/brain/0859836e-35af-45ed-830a-f14357246a76/scratch/parsed_data.json';
const parsedData = JSON.parse(fs.readFileSync(parsedDataPath, 'utf8'));

// Regional guesses based on bung locations and attendance
const KNOWN_CITIES = {
  '창공': '대전', '소리': '대전', '그루': '대전', '깽이': '대전', '현빈': '대전',
  '가든': '광주', '연이': '광주', '오드비': '광주', '델타': '광주', '달타냥': '목포',
  '써니': '목포', '무니': '목포', '블랙': '여수', '가나': '여수',
  '다온': '전주', '봄날': '전주',
  '땅땅': '안성', '슈맨': '인천', '주명': '인천', '루크': '인천',
  '스캇': '수원', '카일': '수원', '레시': '성남', '까꽁': '용인',
  '붕어': '인천', '마을': '경기', '콩': '서울', '쭈': '서울',
  '체리': '서울', '리번': '서울', '쩡쩡': '서울', '클립': '서울', '도도': '서울',
  '뮤': '서울', '마야': '서울', '프레': '서울', '시우': '서울', '쌤슨': '경기'
};

// Top member roles
const MEMBER_ROLES = {
  '쭈': 'Leader',
  '봄날': 'Deputy',
  '마을': 'Deputy'
};

// Build member map: name -> member object
const nameToUid = new Map();
const members = parsedData.members.map((m, index) => {
  const uid = `kakao:${1001 + index}`;
  nameToUid.set(m.name, uid);

  let role = MEMBER_ROLES[m.name];
  if (!role) {
    if (m.totalScore >= 100) {
      role = 'VIP';
    } else {
      role = 'Member';
    }
  }

  const city = KNOWN_CITIES[m.name] || (index % 3 === 0 ? '서울' : index % 3 === 1 ? '경기' : '인천');
  const gender = ['봄날', '체리', '가나', '연이', '다온', '레시', '도도', '쩡쩡', '오드비', '미미', '써니', '지니', '보리'].includes(m.name) ? '여' : '남';
  const maritalStatus = index % 4 === 0 ? 'married' : index % 7 === 0 ? 'divorced' : 'single';
  const entryMonth = String((index % 12) + 1).padStart(2, '0');
  const entryDay = String(((index * 7) % 28) + 1).padStart(2, '0');
  const entryBadge = `${entryMonth}${entryDay}`;
  const monthlyScore = m.name === '가나' || m.name === '블랙' ? 1 : 0;

  return {
    uid,
    realName: m.name,
    city,
    homeCity: city,
    maritalStatus,
    gender,
    role,
    entryBadge,
    customBadge: '',
    bankAccount: '',
    attendanceCount: m.attendanceCount,
    baseScore: m.attendanceCount,
    expeditionScore: m.expeditionScore,
    eventScore: 0,
    totalScore: m.totalScore,
    monthlyScore,
    hostCount: m.hostCount || 0,
    joinedAt: `2024-${entryMonth}-${entryDay}`,
    unlockedAlbums: []
  };
});

// For any guest or missing participant in meetings not in 142 members list
let nextGuestUid = 2000;
const getOrCreateUid = (name) => {
  if (nameToUid.has(name)) {
    return nameToUid.get(name);
  }
  const guestUid = `kakao:${nextGuestUid++}`;
  nameToUid.set(name, guestUid);
  members.push({
    uid: guestUid,
    realName: name,
    city: '기타',
    homeCity: '기타',
    maritalStatus: 'single',
    gender: '남',
    role: 'Member',
    entryBadge: '0101',
    customBadge: '',
    bankAccount: '',
    attendanceCount: 1,
    baseScore: 1,
    expeditionScore: 0,
    eventScore: 0,
    totalScore: 1,
    monthlyScore: 0,
    hostCount: 0,
    joinedAt: '2024-01-01',
    unlockedAlbums: []
  });
  return guestUid;
};

// Process meetings
const processedMeetings = parsedData.meetings.map((mtg, idx) => {
  const applicantUids = mtg.participants.map(p => getOrCreateUid(p.name));
  
  // Choose hostUid: if one of the participants has host count, pick the top host, else first participant
  let bestHostUid = applicantUids[0] || 'kakao:1001';
  let bestHostCount = -1;
  for (const uid of applicantUids) {
    const mem = members.find(m => m.uid === uid);
    if (mem && (mem.hostCount || 0) > bestHostCount) {
      bestHostCount = mem.hostCount || 0;
      bestHostUid = uid;
    }
  }

  // Location resolution
  let loc = '서울';
  if (mtg.title.includes('여수')) loc = '여수';
  else if (mtg.title.includes('대전')) loc = '대전';
  else if (mtg.title.includes('전주')) loc = '전주';
  else if (mtg.title.includes('광주')) loc = '광주';
  else if (mtg.title.includes('수원')) loc = '수원';
  else if (mtg.title.includes('안성')) loc = '안성';
  else if (mtg.title.includes('대구')) loc = '대구';
  else if (mtg.title.includes('목포')) loc = '목포';
  else if (mtg.title.includes('제주')) loc = '제주';
  else if (mtg.title.includes('부산')) loc = '부산';
  else if (mtg.title.includes('인천') || mtg.title.includes('부평') || mtg.title.includes('구월')) loc = '인천';
  else if (mtg.title.includes('강남') || mtg.title.includes('영등포') || mtg.title.includes('종로') || mtg.title.includes('노원') || mtg.title.includes('사당')) loc = '서울';
  else if (mtg.title.includes('수지') || mtg.title.includes('분당') || mtg.title.includes('오산') || mtg.title.includes('평택')) loc = '경기';

  const isRecent = idx < 10;
  const status = isRecent ? 'open' : 'settled';

  return {
    id: mtg.id,
    title: mtg.title,
    dateOnly: mtg.dateOnly,
    startTime: '19:00',
    endTime: '22:30',
    date: `${mtg.dateOnly} 19:00`,
    location: loc,
    placeDetail: `${loc} 인근 약속 장소`,
    hostUid: bestHostUid,
    treasurerUid: '',
    type: mtg.title.includes('정모') || mtg.title.includes('운동회') ? 'Official' : 'Casual',
    status,
    applicants: applicantUids,
    confirmedParticipants: applicantUids,
    description: `${mtg.title} (${mtg.dateOnly}) 벙기록입니다.`,
    roundingRule: 'floor100',
    rounds: [
      {
        id: `r-${mtg.id}-1`,
        label: '1차',
        placeName: `${loc} 모임 장소`,
        mapUrl: '',
        participants: applicantUids,
        payerUid: '',
        cost: 0,
        receiptUrl: '',
        isGoldenBell: false,
        goldenBellUid: ''
      }
    ],
    sponsorships: [],
    manualAmounts: {},
    paymentStatuses: {},
    safeReturns: {},
    likes: [],
    comments: [],
    album: []
  };
});

// Save complete JSON
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
fs.writeFileSync(path.join(dataDir, 'full_bung_data.json'), JSON.stringify({
  version: '2.0.0',
  generatedAt: new Date().toISOString(),
  memberCount: members.length,
  meetingCount: processedMeetings.length,
  members,
  meetings: processedMeetings
}, null, 2));

console.log(`Generated full_bung_data.json: ${members.length} members, ${processedMeetings.length} meetings.`);

// Generate src/core/initialData.js
// We include the full members list (so all 142+ members are immediately available in app)
// And the recent 60 meetings for fast initial loading (the rest can be seeded or imported)
const seedMeetings = processedMeetings.slice(0, 60);

const initialDataContent = `/**
 * Healing78 Community Initial Data
 * Seeded from Official Bung Records (852+ Meetings Archive)
 */

export const INITIAL_COMMUNITY_CONFIG = {
  homeSummary: '공지 · 규격 닉네임 및 모임 규칙',
  noticeTitle: 'Healing78 커뮤니티 닉네임 및 마일스톤 뱃지 규칙',
  noticeBody:
    '1) 모든 회원은 [이름 지역 결혼여부(미/기/돌) 성별(남/여) 뱃지] 규격 닉네임을 유지합니다.\\n' +
    '2) 마일스톤 뱃지 체계: 15점 얼룩말(🦓), 30점 달리는 말(🐎), 50점 대왕말(🐴), 78점 유니콘(🦄), ' +
    '100점 동(🥉), 200점 은(🥈), 300점 금(🥇), 400점 트로피(🏆), 500점 별(⭐️, 500단위 누적 반복 순환)\\n' +
    '3) 벙점수 부여: 기본 +1점, 타 도 원정 참석 시 +1점(총 2점), 해외 원정 시 +2점(총 3점) 부여\\n' +
    '4) 모임 개설은 최소 1회 이상 모임에 참석한 회원부터 가능합니다.',
  newcomerSummary: '신입공지 · 입장 즉시 닉네임 변경',
  newcomerNoticeBody:
    'Healing78 오픈채팅방 입장 후 아래 자동 생성기로 규격 닉네임([이름 지역 미/기/돌 남/여 가입일])을 생성하여 프로필을 변경해 주세요.',
  baseAttendancePoint: 1,
  expeditionBonusPoint: 1,
  overseasBonusPoint: 2,
  minAttendanceForHost: 1,
  googleDriveBridgeUrl: ''
};

export const INITIAL_MEMBERS = ${JSON.stringify(members, null, 2)};

export const INITIAL_MEETINGS = ${JSON.stringify(seedMeetings, null, 2)};

export const INITIAL_SCORE_LOGS = [
  {
    id: 'log-1',
    uid: 'kakao:1001',
    type: 'meeting',
    title: '11월 여수옛날집벙 참석',
    baseDelta: 1,
    expeditionDelta: 0,
    eventDelta: 0,
    totalDelta: 1,
    date: '2026-11-01'
  },
  {
    id: 'log-2',
    uid: 'kakao:1002',
    type: 'meeting',
    title: '10월 논현벙 참석 (타도 원정 +1점)',
    baseDelta: 1,
    expeditionDelta: 1,
    eventDelta: 0,
    totalDelta: 2,
    date: '2026-10-27'
  },
  {
    id: 'log-3',
    uid: 'kakao:1003',
    type: 'meeting',
    title: '10월 원주벙 참석 (타도 원정 +1점)',
    baseDelta: 1,
    expeditionDelta: 1,
    eventDelta: 0,
    totalDelta: 2,
    date: '2026-10-15'
  }
];
`;

fs.writeFileSync(path.join(__dirname, '../src/core/initialData.js'), initialDataContent, 'utf8');
console.log('Successfully updated src/core/initialData.js');

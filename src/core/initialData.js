export const INITIAL_COMMUNITY_CONFIG = {
  homeSummary: '공지 · 규격 닉네임 및 벙 규칙',
  noticeTitle: 'Healing78 커뮤니티 닉네임 및 모임(벙) 운영 규칙 안내',
  noticeBody:
    '1) 모든 회원은 [이름 지역 결혼여부 성별 뱃지] 규격 닉네임을 유지해야 합니다.\n2) 모임(벙) 참석 시 기본 +1점, 연고지 외 타지역 원정 참석 시 +2점 보너스가 부여됩니다.\n3) 모임(벙) 개설은 최소 1회 이상 모임에 참석한 회원부터 가능합니다.',
  newcomerSummary: '신입공지 · 입장 즉시 닉네임 변경',
  newcomerNoticeBody:
    'Healing78 오픈채팅방 입장 후 24시간 이내에 아래 자동 생성기로 규격 닉네임([이름 지역 미/기/돌 남/여 가입일])을 만들어 카톡방 프로필을 변경해 주세요.',
  baseAttendancePoint: 1,
  expeditionBonusPoint: 2,
  minAttendanceForHost: 1
};

export const INITIAL_MEMBERS = [
  {
    uid: 'kakao:1001',
    realName: '김민준',
    city: '서울',
    homeCity: '서울',
    maritalStatus: 'single',
    gender: '남',
    role: 'Leader',
    entryBadge: '0315',
    customBadge: '👑',
    attendanceCount: 12,
    baseScore: 12,
    expeditionScore: 6,
    eventScore: 3,
    totalScore: 21,
    monthlyScore: 8
  },
  {
    uid: 'kakao:1002',
    realName: '이서연',
    city: '경기',
    homeCity: '경기',
    maritalStatus: 'single',
    gender: '여',
    role: 'Deputy',
    entryBadge: '0402',
    customBadge: '⭐',
    attendanceCount: 9,
    baseScore: 9,
    expeditionScore: 6,
    eventScore: 2,
    totalScore: 17,
    monthlyScore: 7
  },
  {
    uid: 'kakao:1003',
    realName: '박지훈',
    city: '부산',
    homeCity: '부산',
    maritalStatus: 'married',
    gender: '남',
    role: 'VIP',
    entryBadge: '0520',
    customBadge: '🔥',
    attendanceCount: 6,
    baseScore: 6,
    expeditionScore: 8,
    eventScore: 1,
    totalScore: 15,
    monthlyScore: 6
  },
  {
    uid: 'kakao:1004',
    realName: '최유진',
    city: '인천',
    homeCity: '인천',
    maritalStatus: 'divorced',
    gender: '여',
    role: 'Member',
    entryBadge: '0829',
    customBadge: '',
    attendanceCount: 2,
    baseScore: 2,
    expeditionScore: 2,
    eventScore: 0,
    totalScore: 4,
    monthlyScore: 4
  },
  {
    uid: 'kakao:1005',
    realName: '정우성',
    city: '서울',
    homeCity: '서울',
    maritalStatus: 'single',
    gender: '남',
    role: 'Member',
    entryBadge: '1102',
    customBadge: '',
    attendanceCount: 0,
    baseScore: 0,
    expeditionScore: 0,
    eventScore: 0,
    totalScore: 0,
    monthlyScore: 0
  }
];

export const INITIAL_MEETINGS = [
  {
    id: 'mtg-101',
    title: '11월 서울 강남 정기 모임 (공식벙)',
    date: '2026-11-07 19:00',
    location: '서울',
    placeDetail: '강남역 11번 출구 인근 라운지',
    hostUid: 'kakao:1001',
    type: 'Official',
    status: 'open',
    applicants: ['kakao:1001', 'kakao:1002', 'kakao:1004', 'kakao:1005'],
    confirmedParticipants: [],
    description:
      '신규 회원 환영 및 11월 정기 교류 모임입니다. 경기/인천/지방 거주 회원 참석 시 원정 보너스(+2점)가 추가 지급됩니다!'
  },
  {
    id: 'mtg-102',
    title: '수원 광교 호수공원 주말 산책 & 커피 번개',
    date: '2026-11-08 15:00',
    location: '경기',
    placeDetail: '광교호수공원 제1주차장 집결',
    hostUid: 'kakao:1004',
    type: 'Casual',
    status: 'open',
    applicants: ['kakao:1004', 'kakao:1001', 'kakao:1003'],
    confirmedParticipants: [],
    description:
      '가볍게 산책하고 브런치 카페 가는 주말 자율 벙입니다. 서울/인천/부산 회원님은 원정 +2점 대상입니다.'
  },
  {
    id: 'mtg-100',
    title: '10월 가을 남산 야경 산책 벙',
    date: '2026-10-24 18:30',
    location: '서울',
    placeDetail: '동대입구역 6번 출구',
    hostUid: 'kakao:1002',
    type: 'Casual',
    status: 'settled',
    applicants: ['kakao:1001', 'kakao:1002', 'kakao:1003', 'kakao:1004'],
    confirmedParticipants: ['kakao:1001', 'kakao:1002', 'kakao:1003', 'kakao:1004'],
    description: '가을 남산 둘레길 산책 및 저녁 식사 모임 (정산 완료)'
  }
];

export const INITIAL_SCORE_LOGS = [
  {
    id: 'log-1',
    uid: 'kakao:1004',
    type: 'meeting',
    title: '10월 가을 남산 야경 산책 벙 참석 (인천→서울 원정)',
    baseDelta: 1,
    expeditionDelta: 2,
    eventDelta: 0,
    totalDelta: 3,
    date: '2026-10-24'
  },
  {
    id: 'log-2',
    uid: 'kakao:1004',
    type: 'meeting',
    title: '10월 인천 송도 커피 번개 참석',
    baseDelta: 1,
    expeditionDelta: 0,
    eventDelta: 0,
    totalDelta: 1,
    date: '2026-10-12'
  },
  {
    id: 'log-3',
    uid: 'kakao:1001',
    type: 'event',
    title: '커뮤니티 10월 베스트 벙주 이벤트 보너스',
    baseDelta: 0,
    expeditionDelta: 0,
    eventDelta: 3,
    totalDelta: 3,
    date: '2026-10-31'
  },
  {
    id: 'log-4',
    uid: 'kakao:1003',
    type: 'meeting',
    title: '10월 가을 남산 야경 산책 벙 참석 (부산→서울 원정)',
    baseDelta: 1,
    expeditionDelta: 2,
    eventDelta: 0,
    totalDelta: 3,
    date: '2026-10-24'
  }
];

export const INITIAL_COMMUNITY_CONFIG = {
  homeSummary: '공지 · 규격 닉네임 및 벙 규칙',
  noticeTitle: 'Healing78 커뮤니티 닉네임 및 모임(벙) 운영 규칙 안내',
  noticeBody:
    '1) 모든 회원은 [이름 지역 결혼여부 성별 뱃지] 규격 닉네임을 유지해야 합니다.\n2) 모임(벙) 참석 시 기본 +1점, 타권역(도 단위) 원정 참석 시 +1점, 해외 원정 시 +2점 보너스가 부여됩니다.\n3) 모임(벙) 개설은 최소 1회 이상 모임에 참석한 회원부터 가능합니다.',
  newcomerSummary: '신입공지 · 입장 즉시 닉네임 변경',
  newcomerNoticeBody:
    'Healing78 오픈채팅방 입장 후 24시간 이내에 아래 자동 생성기로 규격 닉네임([이름 지역 미/기/돌 남/여 가입일])을 만들어 카톡방 프로필을 변경해 주세요.',
  baseAttendancePoint: 1,
  expeditionBonusPoint: 1,
  overseasBonusPoint: 2,
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
    bankAccount: '카카오뱅크 3333-01-1234567 (예금주: 김민준)',
    attendanceCount: 12,
    baseScore: 12,
    expeditionScore: 3,
    eventScore: 3,
    totalScore: 18,
    monthlyScore: 6
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
    bankAccount: '토스뱅크 1000-1234-5678 (예금주: 이서연)',
    attendanceCount: 9,
    baseScore: 9,
    expeditionScore: 3,
    eventScore: 2,
    totalScore: 14,
    monthlyScore: 5
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
    bankAccount: '국민 123401-04-567890 (예금주: 박지훈)',
    attendanceCount: 6,
    baseScore: 6,
    expeditionScore: 4,
    eventScore: 1,
    totalScore: 11,
    monthlyScore: 4
  },
  {
    uid: 'kakao:1004',
    realName: '최유진',
    city: '대전',
    homeCity: '대전',
    maritalStatus: 'divorced',
    gender: '여',
    role: 'Member',
    entryBadge: '0829',
    customBadge: '',
    bankAccount: '신한 110-123-456789 (예금주: 최유진)',
    attendanceCount: 2,
    baseScore: 2,
    expeditionScore: 1,
    eventScore: 0,
    totalScore: 3,
    monthlyScore: 3
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
    bankAccount: '',
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
    id: '26110701',
    title: '11월 서울 강남 정기 모임 (공식벙)',
    dateOnly: '2026-11-07',
    startTime: '19:00',
    date: '2026-11-07 19:00',
    location: '서울',
    placeDetail: '강남역 11번 출구 인근 라운지',
    hostUid: 'kakao:1001',
    treasurerUid: 'kakao:1002',
    type: 'Official',
    status: 'open',
    applicants: ['kakao:1001', 'kakao:1002', 'kakao:1004', 'kakao:1005'],
    confirmedParticipants: [],
    description:
      '신규 회원 환영 및 11월 정기 교류 모임입니다. 타권역(강원/충청/호남/영남/제주) 참석 시 원정 +1점, 해외 +2점이 추가됩니다.',
    roundingRule: 'floor100',
    rounds: [
      {
        id: 'r-1',
        label: '1차',
        placeName: '강남역 고기집 본가',
        mapUrl: 'https://map.kakao.com/?q=%EA%B0%95%EB%82%A8%EC%97%AD',
        participants: ['kakao:1001', 'kakao:1002', 'kakao:1004', 'kakao:1005'],
        payerUid: 'kakao:1002',
        cost: 180000,
        receiptUrl: '',
        isGoldenBell: false,
        goldenBellUid: ''
      },
      {
        id: 'r-2',
        label: '2차',
        placeName: '강남 수제맥주 라운지',
        mapUrl: 'https://map.naver.com/p/search/%EA%B0%95%EB%82%A8%EC%97%AD%20%EB%A7%A5%EC%A3%BC',
        participants: ['kakao:1001', 'kakao:1002', 'kakao:1004'],
        payerUid: 'kakao:1001',
        cost: 90000,
        receiptUrl: '',
        isGoldenBell: false,
        goldenBellUid: ''
      }
    ],
    sponsorships: [
      {
        id: 'sp-1',
        uid: 'kakao:1001',
        amount: 30000,
        memo: '방장 모임 응원 찬조'
      }
    ],
    manualAmounts: {},
    paymentStatuses: {
      'kakao:1001': { paid: true, confirmed: true },
      'kakao:1002': { paid: true, confirmed: true },
      'kakao:1004': { paid: true, confirmed: false }
    },
    safeReturns: {
      'kakao:1005': '22:40 귀가완료'
    }
  },
  {
    id: '26110801',
    title: '수원 광교 호수공원 주말 산책 & 커피 번개',
    dateOnly: '2026-11-08',
    startTime: '15:00',
    date: '2026-11-08 15:00',
    location: '수원',
    placeDetail: '광교호수공원 제1주차장 집결',
    hostUid: 'kakao:1004',
    treasurerUid: 'kakao:1004',
    type: 'Casual',
    status: 'open',
    applicants: ['kakao:1004', 'kakao:1001', 'kakao:1003'],
    confirmedParticipants: [],
    description:
      '가볍게 산책하고 브런치 카페 가는 주말 자율 벙입니다.',
    roundingRule: 'floor100',
    rounds: [
      {
        id: 'r-1',
        label: '1차',
        placeName: '광교호수공원 브런치 카페',
        mapUrl: 'https://map.kakao.com/?q=%EA%B4%91%EA%B5%90%ED%98%B8%EC%88%98%EA%B3%B5%EC%9B%90',
        participants: ['kakao:1004', 'kakao:1001', 'kakao:1003'],
        payerUid: 'kakao:1003',
        cost: 45000,
        receiptUrl: '',
        isGoldenBell: true,
        goldenBellUid: 'kakao:1003'
      }
    ],
    sponsorships: [],
    manualAmounts: {},
    paymentStatuses: {},
    safeReturns: {}
  },
  {
    id: '26102401',
    title: '10월 가을 남산 야경 산책 벙',
    dateOnly: '2026-10-24',
    startTime: '18:30',
    date: '2026-10-24 18:30',
    location: '서울',
    placeDetail: '동대입구역 6번 출구',
    hostUid: 'kakao:1002',
    treasurerUid: 'kakao:1002',
    type: 'Casual',
    status: 'settled',
    applicants: ['kakao:1001', 'kakao:1002', 'kakao:1003', 'kakao:1004'],
    confirmedParticipants: ['kakao:1001', 'kakao:1002', 'kakao:1003', 'kakao:1004'],
    description: '가을 남산 둘레길 산책 및 저녁 식사 모임 (정산 완료)',
    roundingRule: 'floor100',
    rounds: [
      {
        id: 'r-1',
        label: '1차',
        placeName: '남산 돈까스 & 호프',
        mapUrl: 'https://map.naver.com/p/search/%EB%82%A8%EC%82%B0%EB%8F%88%EA%B9%8C%EC%8A%A4',
        participants: ['kakao:1001', 'kakao:1002', 'kakao:1003', 'kakao:1004'],
        payerUid: 'kakao:1002',
        cost: 120000,
        receiptUrl: '',
        isGoldenBell: false,
        goldenBellUid: ''
      }
    ],
    sponsorships: [],
    manualAmounts: {},
    paymentStatuses: {
      'kakao:1001': { paid: true, confirmed: true },
      'kakao:1002': { paid: true, confirmed: true },
      'kakao:1003': { paid: true, confirmed: true },
      'kakao:1004': { paid: true, confirmed: true }
    },
    safeReturns: {
      'kakao:1001': '23:10 귀가완료',
      'kakao:1002': '23:25 귀가완료',
      'kakao:1003': '23:50 귀가완료',
      'kakao:1004': '23:40 귀가완료'
    }
  }
];

export const INITIAL_SCORE_LOGS = [
  {
    id: 'log-1',
    uid: 'kakao:1004',
    type: 'meeting',
    title: '10월 가을 남산 야경 산책 벙 참석 (충청·대전→서울·경기 원정)',
    baseDelta: 1,
    expeditionDelta: 1,
    eventDelta: 0,
    totalDelta: 2,
    date: '2026-10-24'
  },
  {
    id: 'log-2',
    uid: 'kakao:1004',
    type: 'meeting',
    title: '10월 대전 둔산동 커피 번개 참석',
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
    title: '10월 가을 남산 야경 산책 벙 참석 (경상·부산→서울·경기 원정)',
    baseDelta: 1,
    expeditionDelta: 1,
    eventDelta: 0,
    totalDelta: 2,
    date: '2026-10-24'
  }
];

/**
 * Healing78 Community Initial Data
 * Seeded from Official Bung Records (852+ Meetings Archive)
 */

export const INITIAL_COMMUNITY_CONFIG = {
  homeSummary: '공지 · 규격 닉네임 및 모임 규칙',
  noticeTitle: 'Healing78 커뮤니티 닉네임 및 마일스톤 뱃지 규칙',
  noticeBody:
    '1) 모든 회원은 [이름 지역 결혼여부(미/기/돌) 성별(남/여) 뱃지] 규격 닉네임을 유지합니다.\n' +
    '2) 마일스톤 뱃지 체계: 15점 얼룩말(🦓), 30점 달리는 말(🐎), 50점 대왕말(🐴), 78점 유니콘(🦄), ' +
    '100점 동(🥉), 200점 은(🥈), 300점 금(🥇), 400점 트로피(🏆), 500점 별(⭐️, 500단위 누적 반복 순환)\n' +
    '3) 벙점수 부여: 기본 +1점, 타 도 원정 참석 시 +1점(총 2점), 해외 원정 시 +2점(총 3점) 부여\n' +
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

export const INITIAL_MEMBERS = [
  {
    "uid": "kakao:1001",
    "realName": "쭈",
    "city": "영등포",
    "homeCity": "영등포",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Leader",
    "entryBadge": "0126",
    "customBadge": "",
    "bankAccount": "카카오뱅크 3333-01-1234567 (예금주: 쭈)",
    "attendanceCount": 311,
    "baseScore": 311,
    "expeditionScore": 49,
    "eventScore": 0,
    "totalScore": 360,
    "monthlyScore": 0,
    "hostCount": 115,
    "joinedAt": "2024-01-26",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1002",
    "realName": "봄날",
    "city": "전주",
    "homeCity": "전주",
    "maritalStatus": "divorced",
    "gender": "여",
    "role": "Deputy",
    "entryBadge": "0128",
    "customBadge": "",
    "bankAccount": "토스뱅크 1000-1234-5678",
    "attendanceCount": 144,
    "baseScore": 144,
    "expeditionScore": 102,
    "eventScore": 0,
    "totalScore": 246,
    "monthlyScore": 0,
    "hostCount": 11,
    "joinedAt": "2024-01-28",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1003",
    "realName": "마을",
    "city": "용인",
    "homeCity": "용인",
    "maritalStatus": "single",
    "gender": "남",
    "role": "Deputy",
    "entryBadge": "0126",
    "customBadge": "",
    "bankAccount": "토스뱅크 1000-1234-5678",
    "attendanceCount": 204,
    "baseScore": 204,
    "expeditionScore": 29,
    "eventScore": 0,
    "totalScore": 233,
    "monthlyScore": 0,
    "hostCount": 27,
    "joinedAt": "2024-01-26",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1004",
    "realName": "콩",
    "city": "제주",
    "homeCity": "제주",
    "maritalStatus": "single",
    "gender": "여",
    "role": "VIP",
    "entryBadge": "0202",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 104,
    "baseScore": 104,
    "expeditionScore": 97,
    "eventScore": 0,
    "totalScore": 201,
    "monthlyScore": 0,
    "hostCount": 24,
    "joinedAt": "2024-02-02",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1005",
    "realName": "쌤슨",
    "city": "평택",
    "homeCity": "평택",
    "maritalStatus": "single",
    "gender": "남",
    "role": "VIP",
    "entryBadge": "0126",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 121,
    "baseScore": 121,
    "expeditionScore": 52,
    "eventScore": 0,
    "totalScore": 173,
    "monthlyScore": 0,
    "hostCount": 8,
    "joinedAt": "2024-01-26",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1006",
    "realName": "프레",
    "city": "강북",
    "homeCity": "강북",
    "maritalStatus": "single",
    "gender": "남",
    "role": "VIP",
    "entryBadge": "0612",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 154,
    "baseScore": 154,
    "expeditionScore": 15,
    "eventScore": 0,
    "totalScore": 169,
    "monthlyScore": 0,
    "hostCount": 6,
    "joinedAt": "2025-06-12",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1007",
    "realName": "창공",
    "city": "세종",
    "homeCity": "세종",
    "maritalStatus": "married",
    "gender": "남",
    "role": "VIP",
    "entryBadge": "0126",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 103,
    "baseScore": 103,
    "expeditionScore": 60,
    "eventScore": 0,
    "totalScore": 163,
    "monthlyScore": 0,
    "hostCount": 47,
    "joinedAt": "2024-01-26",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1008",
    "realName": "체리",
    "city": "남양주",
    "homeCity": "남양주",
    "maritalStatus": "single",
    "gender": "여",
    "role": "VIP",
    "entryBadge": "0126",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 136,
    "baseScore": 136,
    "expeditionScore": 24,
    "eventScore": 0,
    "totalScore": 160,
    "monthlyScore": 0,
    "hostCount": 21,
    "joinedAt": "2024-01-26",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1009",
    "realName": "슈맨",
    "city": "인천",
    "homeCity": "인천",
    "maritalStatus": "single",
    "gender": "남",
    "role": "VIP",
    "entryBadge": "0825",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 145,
    "baseScore": 145,
    "expeditionScore": 13,
    "eventScore": 0,
    "totalScore": 158,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-08-25",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1010",
    "realName": "뮤",
    "city": "광진",
    "homeCity": "광진",
    "maritalStatus": "single",
    "gender": "남",
    "role": "VIP",
    "entryBadge": "0831",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 136,
    "baseScore": 136,
    "expeditionScore": 10,
    "eventScore": 0,
    "totalScore": 146,
    "monthlyScore": 0,
    "hostCount": 8,
    "joinedAt": "2024-08-31",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1011",
    "realName": "스캇",
    "city": "수지",
    "homeCity": "수지",
    "maritalStatus": "married",
    "gender": "남",
    "role": "VIP",
    "entryBadge": "0126",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 125,
    "baseScore": 125,
    "expeditionScore": 10,
    "eventScore": 0,
    "totalScore": 135,
    "monthlyScore": 0,
    "hostCount": 40,
    "joinedAt": "2024-01-26",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1012",
    "realName": "마야",
    "city": "서초",
    "homeCity": "서초",
    "maritalStatus": "single",
    "gender": "여",
    "role": "VIP",
    "entryBadge": "0126",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 115,
    "baseScore": 115,
    "expeditionScore": 18,
    "eventScore": 0,
    "totalScore": 133,
    "monthlyScore": 0,
    "hostCount": 18,
    "joinedAt": "2024-01-26",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1013",
    "realName": "다온",
    "city": "수유",
    "homeCity": "수유",
    "maritalStatus": "married",
    "gender": "남",
    "role": "VIP",
    "entryBadge": "0318",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 84,
    "baseScore": 84,
    "expeditionScore": 47,
    "eventScore": 0,
    "totalScore": 131,
    "monthlyScore": 0,
    "hostCount": 23,
    "joinedAt": "2024-03-18",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1014",
    "realName": "클립",
    "city": "성북",
    "homeCity": "성북",
    "maritalStatus": "divorced",
    "gender": "남",
    "role": "VIP",
    "entryBadge": "0306",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 124,
    "baseScore": 124,
    "expeditionScore": 7,
    "eventScore": 0,
    "totalScore": 131,
    "monthlyScore": 0,
    "hostCount": 25,
    "joinedAt": "2024-03-06",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1015",
    "realName": "주명",
    "city": "인천",
    "homeCity": "인천",
    "maritalStatus": "divorced",
    "gender": "남",
    "role": "VIP",
    "entryBadge": "0304",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 115,
    "baseScore": 115,
    "expeditionScore": 2,
    "eventScore": 0,
    "totalScore": 117,
    "monthlyScore": 0,
    "hostCount": 20,
    "joinedAt": "2025-03-04",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1016",
    "realName": "카일",
    "city": "수원",
    "homeCity": "수원",
    "maritalStatus": "married",
    "gender": "남",
    "role": "VIP",
    "entryBadge": "0126",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 103,
    "baseScore": 103,
    "expeditionScore": 4,
    "eventScore": 0,
    "totalScore": 107,
    "monthlyScore": 0,
    "hostCount": 44,
    "joinedAt": "2024-01-26",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1017",
    "realName": "레시",
    "city": "성남",
    "homeCity": "성남",
    "maritalStatus": "divorced",
    "gender": "여",
    "role": "VIP",
    "entryBadge": "1125",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 93,
    "baseScore": 93,
    "expeditionScore": 11,
    "eventScore": 0,
    "totalScore": 104,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-11-25",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1018",
    "realName": "시우",
    "city": "군포",
    "homeCity": "군포",
    "maritalStatus": "single",
    "gender": "남",
    "role": "VIP",
    "entryBadge": "1001",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 96,
    "baseScore": 96,
    "expeditionScore": 8,
    "eventScore": 0,
    "totalScore": 104,
    "monthlyScore": 0,
    "hostCount": 11,
    "joinedAt": "2025-10-01",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1019",
    "realName": "도도",
    "city": "화성",
    "homeCity": "화성",
    "maritalStatus": "single",
    "gender": "여",
    "role": "VIP",
    "entryBadge": "0709",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 85,
    "baseScore": 85,
    "expeditionScore": 18,
    "eventScore": 0,
    "totalScore": 103,
    "monthlyScore": 0,
    "hostCount": 13,
    "joinedAt": "2024-07-09",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1020",
    "realName": "리번",
    "city": "하남",
    "homeCity": "하남",
    "maritalStatus": "divorced",
    "gender": "남",
    "role": "VIP",
    "entryBadge": "0126",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 86,
    "baseScore": 86,
    "expeditionScore": 15,
    "eventScore": 0,
    "totalScore": 101,
    "monthlyScore": 0,
    "hostCount": 3,
    "joinedAt": "2024-01-26",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1021",
    "realName": "쩡쩡",
    "city": "노원",
    "homeCity": "노원",
    "maritalStatus": "married",
    "gender": "여",
    "role": "VIP",
    "entryBadge": "0122",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 93,
    "baseScore": 93,
    "expeditionScore": 7,
    "eventScore": 0,
    "totalScore": 100,
    "monthlyScore": 0,
    "hostCount": 4,
    "joinedAt": "2025-01-22",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1022",
    "realName": "포맨",
    "city": "평택",
    "homeCity": "평택",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0129",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 76,
    "baseScore": 76,
    "expeditionScore": 20,
    "eventScore": 0,
    "totalScore": 96,
    "monthlyScore": 0,
    "hostCount": 8,
    "joinedAt": "2024-01-29",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1023",
    "realName": "지민",
    "city": "경광",
    "homeCity": "경광",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0127",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 31,
    "baseScore": 31,
    "expeditionScore": 59,
    "eventScore": 0,
    "totalScore": 90,
    "monthlyScore": 0,
    "hostCount": 8,
    "joinedAt": "2024-01-27",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1024",
    "realName": "맥",
    "city": "구로",
    "homeCity": "구로",
    "maritalStatus": "single",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0425",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 72,
    "baseScore": 72,
    "expeditionScore": 16,
    "eventScore": 0,
    "totalScore": 88,
    "monthlyScore": 0,
    "hostCount": 18,
    "joinedAt": "2024-04-25",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1025",
    "realName": "가나",
    "city": "사천",
    "homeCity": "사천",
    "maritalStatus": "divorced",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0530",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 47,
    "baseScore": 47,
    "expeditionScore": 40,
    "eventScore": 0,
    "totalScore": 87,
    "monthlyScore": 1,
    "hostCount": 7,
    "joinedAt": "2025-05-30",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1026",
    "realName": "승재",
    "city": "사당",
    "homeCity": "사당",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0610",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 71,
    "baseScore": 71,
    "expeditionScore": 15,
    "eventScore": 0,
    "totalScore": 86,
    "monthlyScore": 0,
    "hostCount": 31,
    "joinedAt": "2024-06-10",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1027",
    "realName": "루크",
    "city": "인천",
    "homeCity": "인천",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0413",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 84,
    "baseScore": 84,
    "expeditionScore": 1,
    "eventScore": 0,
    "totalScore": 85,
    "monthlyScore": 0,
    "hostCount": 3,
    "joinedAt": "2025-04-13",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1028",
    "realName": "게더",
    "city": "마포",
    "homeCity": "마포",
    "maritalStatus": "single",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0814",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 80,
    "baseScore": 80,
    "expeditionScore": 3,
    "eventScore": 0,
    "totalScore": 83,
    "monthlyScore": 0,
    "hostCount": 6,
    "joinedAt": "2024-08-14",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1029",
    "realName": "간다",
    "city": "용인",
    "homeCity": "용인",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0628",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 62,
    "baseScore": 62,
    "expeditionScore": 20,
    "eventScore": 0,
    "totalScore": 82,
    "monthlyScore": 0,
    "hostCount": 1,
    "joinedAt": "2024-06-28",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1030",
    "realName": "그루",
    "city": "대전",
    "homeCity": "대전",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0128",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 57,
    "baseScore": 57,
    "expeditionScore": 24,
    "eventScore": 0,
    "totalScore": 81,
    "monthlyScore": 0,
    "hostCount": 2,
    "joinedAt": "2025-01-28",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1031",
    "realName": "깽이",
    "city": "대전",
    "homeCity": "대전",
    "maritalStatus": "divorced",
    "gender": "여",
    "role": "Member",
    "entryBadge": "1231",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 59,
    "baseScore": 59,
    "expeditionScore": 19,
    "eventScore": 0,
    "totalScore": 78,
    "monthlyScore": 0,
    "hostCount": 13,
    "joinedAt": "2024-12-31",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1032",
    "realName": "붕어",
    "city": "성남",
    "homeCity": "성남",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0225",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 67,
    "baseScore": 67,
    "expeditionScore": 7,
    "eventScore": 0,
    "totalScore": 74,
    "monthlyScore": 0,
    "hostCount": 4,
    "joinedAt": "2024-02-25",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1033",
    "realName": "소리",
    "city": "대전",
    "homeCity": "대전",
    "maritalStatus": "divorced",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0126",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 57,
    "baseScore": 57,
    "expeditionScore": 14,
    "eventScore": 0,
    "totalScore": 71,
    "monthlyScore": 0,
    "hostCount": 12,
    "joinedAt": "2024-01-26",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1034",
    "realName": "현빈",
    "city": "아산",
    "homeCity": "아산",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "1021",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 49,
    "baseScore": 49,
    "expeditionScore": 21,
    "eventScore": 0,
    "totalScore": 70,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-10-21",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1035",
    "realName": "상큼",
    "city": "화성",
    "homeCity": "화성",
    "maritalStatus": "single",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0617",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 59,
    "baseScore": 59,
    "expeditionScore": 10,
    "eventScore": 0,
    "totalScore": 69,
    "monthlyScore": 0,
    "hostCount": 1,
    "joinedAt": "2024-06-17",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1036",
    "realName": "가든",
    "city": "전주",
    "homeCity": "전주",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0426",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 52,
    "baseScore": 52,
    "expeditionScore": 14,
    "eventScore": 0,
    "totalScore": 66,
    "monthlyScore": 0,
    "hostCount": 11,
    "joinedAt": "2025-04-26",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1037",
    "realName": "땅땅",
    "city": "안성",
    "homeCity": "안성",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0126",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 50,
    "baseScore": 50,
    "expeditionScore": 14,
    "eventScore": 0,
    "totalScore": 64,
    "monthlyScore": 0,
    "hostCount": 10,
    "joinedAt": "2024-01-26",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1038",
    "realName": "블랙",
    "city": "여수",
    "homeCity": "여수",
    "maritalStatus": "single",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0226",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 39,
    "baseScore": 39,
    "expeditionScore": 24,
    "eventScore": 0,
    "totalScore": 63,
    "monthlyScore": 1,
    "hostCount": 1,
    "joinedAt": "2024-02-26",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1039",
    "realName": "진진",
    "city": "경주",
    "homeCity": "경주",
    "maritalStatus": "single",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0601",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 30,
    "baseScore": 30,
    "expeditionScore": 30,
    "eventScore": 0,
    "totalScore": 60,
    "monthlyScore": 0,
    "hostCount": 1,
    "joinedAt": "2025-06-01",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1040",
    "realName": "연이",
    "city": "광주",
    "homeCity": "광주",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0118",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 53,
    "baseScore": 53,
    "expeditionScore": 3,
    "eventScore": 0,
    "totalScore": 56,
    "monthlyScore": 0,
    "hostCount": 33,
    "joinedAt": "2025-01-18",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1041",
    "realName": "사마",
    "city": "부천",
    "homeCity": "부천",
    "maritalStatus": "divorced",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0126",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 37,
    "baseScore": 37,
    "expeditionScore": 12,
    "eventScore": 0,
    "totalScore": 49,
    "monthlyScore": 0,
    "hostCount": 14,
    "joinedAt": "2024-01-26",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1042",
    "realName": "미코",
    "city": "화성",
    "homeCity": "화성",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0416",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 44,
    "baseScore": 44,
    "expeditionScore": 4,
    "eventScore": 0,
    "totalScore": 48,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-04-16",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1043",
    "realName": "오드비",
    "city": "광주",
    "homeCity": "광주",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0718",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 42,
    "baseScore": 42,
    "expeditionScore": 5,
    "eventScore": 0,
    "totalScore": 47,
    "monthlyScore": 0,
    "hostCount": 2,
    "joinedAt": "2024-07-18",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1044",
    "realName": "미라지",
    "city": "수원",
    "homeCity": "수원",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0205",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 46,
    "baseScore": 46,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 46,
    "monthlyScore": 0,
    "hostCount": 1,
    "joinedAt": "2024-02-05",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1045",
    "realName": "뚠뚠",
    "city": "춘천",
    "homeCity": "춘천",
    "maritalStatus": "single",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0126",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 40,
    "baseScore": 40,
    "expeditionScore": 6,
    "eventScore": 0,
    "totalScore": 46,
    "monthlyScore": 0,
    "hostCount": 2,
    "joinedAt": "2024-01-26",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1046",
    "realName": "전갈",
    "city": "오산",
    "homeCity": "오산",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0127",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 41,
    "baseScore": 41,
    "expeditionScore": 4,
    "eventScore": 0,
    "totalScore": 45,
    "monthlyScore": 0,
    "hostCount": 6,
    "joinedAt": "2024-01-27",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1047",
    "realName": "미미",
    "city": "수원",
    "homeCity": "수원",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0309",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 43,
    "baseScore": 43,
    "expeditionScore": 2,
    "eventScore": 0,
    "totalScore": 45,
    "monthlyScore": 0,
    "hostCount": 9,
    "joinedAt": "2024-03-09",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1048",
    "realName": "비실",
    "city": "의정부",
    "homeCity": "의정부",
    "maritalStatus": "divorced",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0131",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 41,
    "baseScore": 41,
    "expeditionScore": 3,
    "eventScore": 0,
    "totalScore": 44,
    "monthlyScore": 0,
    "hostCount": 6,
    "joinedAt": "2024-01-31",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1049",
    "realName": "별",
    "city": "산본",
    "homeCity": "산본",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0126",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 35,
    "baseScore": 35,
    "expeditionScore": 6,
    "eventScore": 0,
    "totalScore": 41,
    "monthlyScore": 0,
    "hostCount": 6,
    "joinedAt": "2024-01-26",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1050",
    "realName": "써니",
    "city": "의정부",
    "homeCity": "의정부",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0826",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 37,
    "baseScore": 37,
    "expeditionScore": 4,
    "eventScore": 0,
    "totalScore": 41,
    "monthlyScore": 0,
    "hostCount": 10,
    "joinedAt": "2024-08-26",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1051",
    "realName": "상범",
    "city": "의정부",
    "homeCity": "의정부",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0519",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 27,
    "baseScore": 27,
    "expeditionScore": 11,
    "eventScore": 0,
    "totalScore": 38,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-05-19",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1052",
    "realName": "로버",
    "city": "서대문",
    "homeCity": "서대문",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0309",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 19,
    "baseScore": 19,
    "expeditionScore": 18,
    "eventScore": 0,
    "totalScore": 37,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-03-09",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1053",
    "realName": "여우",
    "city": "오산",
    "homeCity": "오산",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "1030",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 37,
    "baseScore": 37,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 37,
    "monthlyScore": 0,
    "hostCount": 5,
    "joinedAt": "2024-10-30",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1054",
    "realName": "봉봉",
    "city": "서산",
    "homeCity": "서산",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0126",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 22,
    "baseScore": 22,
    "expeditionScore": 13,
    "eventScore": 0,
    "totalScore": 35,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-01-26",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1055",
    "realName": "소소",
    "city": "평택",
    "homeCity": "평택",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0914",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 23,
    "baseScore": 23,
    "expeditionScore": 10,
    "eventScore": 0,
    "totalScore": 33,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-09-14",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1056",
    "realName": "쫄쫄",
    "city": "영등포",
    "homeCity": "영등포",
    "maritalStatus": "single",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0126",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 30,
    "baseScore": 30,
    "expeditionScore": 2,
    "eventScore": 0,
    "totalScore": 32,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-01-26",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1057",
    "realName": "와꾸",
    "city": "대구",
    "homeCity": "대구",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0305",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 19,
    "baseScore": 19,
    "expeditionScore": 13,
    "eventScore": 0,
    "totalScore": 32,
    "monthlyScore": 0,
    "hostCount": 2,
    "joinedAt": "2025-03-05",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1058",
    "realName": "지니",
    "city": "수지",
    "homeCity": "수지",
    "maritalStatus": "single",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0219",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 28,
    "baseScore": 28,
    "expeditionScore": 3,
    "eventScore": 0,
    "totalScore": 31,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-02-19",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1059",
    "realName": "무니",
    "city": "목포",
    "homeCity": "목포",
    "maritalStatus": "divorced",
    "gender": "남",
    "role": "Member",
    "entryBadge": "1006",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 26,
    "baseScore": 26,
    "expeditionScore": 4,
    "eventScore": 0,
    "totalScore": 30,
    "monthlyScore": 0,
    "hostCount": 1,
    "joinedAt": "2024-10-06",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1060",
    "realName": "민중",
    "city": "경광",
    "homeCity": "경광",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0426",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 26,
    "baseScore": 26,
    "expeditionScore": 4,
    "eventScore": 0,
    "totalScore": 30,
    "monthlyScore": 0,
    "hostCount": 1,
    "joinedAt": "2025-04-26",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1061",
    "realName": "까꽁",
    "city": "용인",
    "homeCity": "용인",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0925",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 28,
    "baseScore": 28,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 28,
    "monthlyScore": 0,
    "hostCount": 9,
    "joinedAt": "2025-09-25",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1062",
    "realName": "델타",
    "city": "광주",
    "homeCity": "광주",
    "maritalStatus": "divorced",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0621",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 25,
    "baseScore": 25,
    "expeditionScore": 3,
    "eventScore": 0,
    "totalScore": 28,
    "monthlyScore": 0,
    "hostCount": 4,
    "joinedAt": "2025-06-21",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1063",
    "realName": "잼잼",
    "city": "안양",
    "homeCity": "안양",
    "maritalStatus": "single",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0220",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 20,
    "baseScore": 20,
    "expeditionScore": 7,
    "eventScore": 0,
    "totalScore": 27,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-02-20",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1064",
    "realName": "리안",
    "city": "아산",
    "homeCity": "아산",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "1221",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 16,
    "baseScore": 16,
    "expeditionScore": 10,
    "eventScore": 0,
    "totalScore": 26,
    "monthlyScore": 0,
    "hostCount": 1,
    "joinedAt": "2025-12-21",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1065",
    "realName": "응삼",
    "city": "송도",
    "homeCity": "송도",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0126",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 24,
    "baseScore": 24,
    "expeditionScore": 1,
    "eventScore": 0,
    "totalScore": 25,
    "monthlyScore": 0,
    "hostCount": 1,
    "joinedAt": "2024-01-26",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1066",
    "realName": "달타냥",
    "city": "광주",
    "homeCity": "광주",
    "maritalStatus": "divorced",
    "gender": "남",
    "role": "Member",
    "entryBadge": "1029",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 24,
    "baseScore": 24,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 24,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-10-29",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1067",
    "realName": "리치",
    "city": "미국",
    "homeCity": "미국",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0126",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 8,
    "baseScore": 8,
    "expeditionScore": 16,
    "eventScore": 0,
    "totalScore": 24,
    "monthlyScore": 0,
    "hostCount": 1,
    "joinedAt": "2024-01-26",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1068",
    "realName": "깐부",
    "city": "인천",
    "homeCity": "인천",
    "maritalStatus": "divorced",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0119",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 19,
    "baseScore": 19,
    "expeditionScore": 4,
    "eventScore": 0,
    "totalScore": 23,
    "monthlyScore": 0,
    "hostCount": 2,
    "joinedAt": "2025-01-19",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1069",
    "realName": "주연",
    "city": "거창",
    "homeCity": "거창",
    "maritalStatus": "divorced",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0227",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 11,
    "baseScore": 11,
    "expeditionScore": 11,
    "eventScore": 0,
    "totalScore": 22,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2026-02-27",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1070",
    "realName": "제니",
    "city": "경기",
    "homeCity": "경기",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0616",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 10,
    "baseScore": 10,
    "expeditionScore": 9,
    "eventScore": 0,
    "totalScore": 19,
    "monthlyScore": 0,
    "hostCount": 1,
    "joinedAt": "2024-06-16",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1071",
    "realName": "동해",
    "city": "오산",
    "homeCity": "오산",
    "maritalStatus": "single",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0305",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 17,
    "baseScore": 17,
    "expeditionScore": 1,
    "eventScore": 0,
    "totalScore": 18,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-03-05",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1072",
    "realName": "카브",
    "city": "은평",
    "homeCity": "은평",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0401",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 15,
    "baseScore": 15,
    "expeditionScore": 3,
    "eventScore": 0,
    "totalScore": 18,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-04-01",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1073",
    "realName": "용이",
    "city": "광주",
    "homeCity": "광주",
    "maritalStatus": "divorced",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0308",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 14,
    "baseScore": 14,
    "expeditionScore": 4,
    "eventScore": 0,
    "totalScore": 18,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-03-08",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1074",
    "realName": "순애",
    "city": "성남",
    "homeCity": "성남",
    "maritalStatus": "divorced",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0912",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 18,
    "baseScore": 18,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 18,
    "monthlyScore": 0,
    "hostCount": 1,
    "joinedAt": "2025-09-12",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1075",
    "realName": "보리",
    "city": "인천",
    "homeCity": "인천",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0914",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 11,
    "baseScore": 11,
    "expeditionScore": 6,
    "eventScore": 0,
    "totalScore": 17,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-09-14",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1076",
    "realName": "정호",
    "city": "천안",
    "homeCity": "천안",
    "maritalStatus": "single",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0625",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 11,
    "baseScore": 11,
    "expeditionScore": 6,
    "eventScore": 0,
    "totalScore": 17,
    "monthlyScore": 0,
    "hostCount": 1,
    "joinedAt": "2025-06-25",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1077",
    "realName": "반지",
    "city": "용인",
    "homeCity": "용인",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0126",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 16,
    "baseScore": 16,
    "expeditionScore": 1,
    "eventScore": 0,
    "totalScore": 17,
    "monthlyScore": 0,
    "hostCount": 1,
    "joinedAt": "2024-01-26",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1078",
    "realName": "룰루",
    "city": "광주",
    "homeCity": "광주",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0502",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 15,
    "baseScore": 15,
    "expeditionScore": 1,
    "eventScore": 0,
    "totalScore": 16,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-05-02",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1079",
    "realName": "빨강",
    "city": "부산",
    "homeCity": "부산",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0505",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 8,
    "baseScore": 8,
    "expeditionScore": 7,
    "eventScore": 0,
    "totalScore": 15,
    "monthlyScore": 0,
    "hostCount": 2,
    "joinedAt": "2026-05-05",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1080",
    "realName": "로이",
    "city": "안양",
    "homeCity": "안양",
    "maritalStatus": "single",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0408",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 11,
    "baseScore": 11,
    "expeditionScore": 4,
    "eventScore": 0,
    "totalScore": 15,
    "monthlyScore": 0,
    "hostCount": 3,
    "joinedAt": "2024-04-08",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1081",
    "realName": "지오",
    "city": "강서",
    "homeCity": "강서",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0819",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 14,
    "baseScore": 14,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 14,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-08-19",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1082",
    "realName": "햇님",
    "city": "화성",
    "homeCity": "화성",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0722",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 12,
    "baseScore": 12,
    "expeditionScore": 1,
    "eventScore": 0,
    "totalScore": 13,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-07-22",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1083",
    "realName": "철이",
    "city": "공주",
    "homeCity": "공주",
    "maritalStatus": "divorced",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0817",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 9,
    "baseScore": 9,
    "expeditionScore": 4,
    "eventScore": 0,
    "totalScore": 13,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-08-17",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1084",
    "realName": "묘니",
    "city": "과천",
    "homeCity": "과천",
    "maritalStatus": "single",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0818",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 12,
    "baseScore": 12,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 12,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-08-18",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1085",
    "realName": "커리",
    "city": "관악",
    "homeCity": "관악",
    "maritalStatus": "single",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0126",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 12,
    "baseScore": 12,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 12,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-01-26",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1086",
    "realName": "페리",
    "city": "서대문",
    "homeCity": "서대문",
    "maritalStatus": "single",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0629",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 11,
    "baseScore": 11,
    "expeditionScore": 1,
    "eventScore": 0,
    "totalScore": 12,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-06-29",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1087",
    "realName": "콜라",
    "city": "이천",
    "homeCity": "이천",
    "maritalStatus": "single",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0114",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 8,
    "baseScore": 8,
    "expeditionScore": 3,
    "eventScore": 0,
    "totalScore": 11,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-01-14",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1088",
    "realName": "로도",
    "city": "안양",
    "homeCity": "안양",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0525",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 10,
    "baseScore": 10,
    "expeditionScore": 1,
    "eventScore": 0,
    "totalScore": 11,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-05-25",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1089",
    "realName": "애니",
    "city": "성동",
    "homeCity": "성동",
    "maritalStatus": "single",
    "gender": "남",
    "role": "Member",
    "entryBadge": "1003",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 8,
    "baseScore": 8,
    "expeditionScore": 2,
    "eventScore": 0,
    "totalScore": 10,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-10-03",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1090",
    "realName": "나무꾼",
    "city": "일산",
    "homeCity": "일산",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0508",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 10,
    "baseScore": 10,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 10,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-05-08",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1091",
    "realName": "시리",
    "city": "안산",
    "homeCity": "안산",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0415",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 9,
    "baseScore": 9,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 9,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-04-15",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1092",
    "realName": "하나",
    "city": "파주",
    "homeCity": "파주",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0107",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 8,
    "baseScore": 8,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 8,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-01-07",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1093",
    "realName": "테이",
    "city": "안산",
    "homeCity": "안산",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0801",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 6,
    "baseScore": 6,
    "expeditionScore": 1,
    "eventScore": 0,
    "totalScore": 7,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2026-08-01",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1094",
    "realName": "샤넬",
    "city": "천안",
    "homeCity": "천안",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0624",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 5,
    "baseScore": 5,
    "expeditionScore": 2,
    "eventScore": 0,
    "totalScore": 7,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2026-06-24",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1095",
    "realName": "희연",
    "city": "인천",
    "homeCity": "인천",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0207",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 7,
    "baseScore": 7,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 7,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2026-02-07",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1096",
    "realName": "애플",
    "city": "김천",
    "homeCity": "김천",
    "maritalStatus": "divorced",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0603",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 7,
    "baseScore": 7,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 7,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-06-03",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1097",
    "realName": "차차",
    "city": "의정부",
    "homeCity": "의정부",
    "maritalStatus": "single",
    "gender": "여",
    "role": "Member",
    "entryBadge": "1103",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 6,
    "baseScore": 6,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 6,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-11-03",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1098",
    "realName": "국수",
    "city": "영등포",
    "homeCity": "영등포",
    "maritalStatus": "single",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0820",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 6,
    "baseScore": 6,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 6,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-08-20",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1099",
    "realName": "겨울",
    "city": "호주",
    "homeCity": "호주",
    "maritalStatus": "divorced",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0228",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 6,
    "baseScore": 6,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 6,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-02-28",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1100",
    "realName": "망고",
    "city": "광주",
    "homeCity": "광주",
    "maritalStatus": "divorced",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0526",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 5,
    "baseScore": 5,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 5,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-05-26",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1101",
    "realName": "미니",
    "city": "고양",
    "homeCity": "고양",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0713",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 5,
    "baseScore": 5,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 5,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-07-13",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1102",
    "realName": "리키",
    "city": "청주",
    "homeCity": "청주",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0227",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 3,
    "baseScore": 3,
    "expeditionScore": 2,
    "eventScore": 0,
    "totalScore": 5,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2026-02-27",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1103",
    "realName": "뽀야",
    "city": "강북",
    "homeCity": "강북",
    "maritalStatus": "single",
    "gender": "여",
    "role": "Member",
    "entryBadge": "1217",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 5,
    "baseScore": 5,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 5,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-12-17",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1104",
    "realName": "금산",
    "city": "안산",
    "homeCity": "안산",
    "maritalStatus": "divorced",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0617",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 5,
    "baseScore": 5,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 5,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-06-17",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1105",
    "realName": "잉잉",
    "city": "화성",
    "homeCity": "화성",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0127",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 4,
    "baseScore": 4,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 4,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-01-27",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1106",
    "realName": "히에",
    "city": "수원",
    "homeCity": "수원",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "1204",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 4,
    "baseScore": 4,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 4,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-12-04",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1107",
    "realName": "조이",
    "city": "송파",
    "homeCity": "송파",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0306",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 4,
    "baseScore": 4,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 4,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-03-06",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1108",
    "realName": "마자",
    "city": "일산",
    "homeCity": "일산",
    "maritalStatus": "divorced",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0809",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 3,
    "baseScore": 3,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 3,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2026-08-09",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1109",
    "realName": "아나",
    "city": "대전",
    "homeCity": "대전",
    "maritalStatus": "divorced",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0816",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 3,
    "baseScore": 3,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 3,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2026-08-16",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1110",
    "realName": "하니",
    "city": "미쿡",
    "homeCity": "미쿡",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0726",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 3,
    "baseScore": 3,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 3,
    "monthlyScore": 0,
    "hostCount": 1,
    "joinedAt": "2026-07-26",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1111",
    "realName": "쟁거",
    "city": "고양",
    "homeCity": "고양",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0323",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 3,
    "baseScore": 3,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 3,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-03-23",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1112",
    "realName": "언제나",
    "city": "영등포",
    "homeCity": "영등포",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0112",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 3,
    "baseScore": 3,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 3,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2026-01-12",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1113",
    "realName": "섭이",
    "city": "진주",
    "homeCity": "진주",
    "maritalStatus": "divorced",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0524",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 2,
    "baseScore": 2,
    "expeditionScore": 1,
    "eventScore": 0,
    "totalScore": 3,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2026-05-24",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1114",
    "realName": "아만다",
    "city": "성북",
    "homeCity": "성북",
    "maritalStatus": "divorced",
    "gender": "여",
    "role": "Member",
    "entryBadge": "1006",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 3,
    "baseScore": 3,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 3,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-10-06",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1115",
    "realName": "하루",
    "city": "의왕",
    "homeCity": "의왕",
    "maritalStatus": "divorced",
    "gender": "여",
    "role": "Member",
    "entryBadge": "1101",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 2,
    "baseScore": 2,
    "expeditionScore": 1,
    "eventScore": 0,
    "totalScore": 3,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-11-01",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1116",
    "realName": "오공",
    "city": "구로",
    "homeCity": "구로",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0410",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 3,
    "baseScore": 3,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 3,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-04-10",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1117",
    "realName": "성민",
    "city": "인천",
    "homeCity": "인천",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0901",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 2,
    "baseScore": 2,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 2,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-09-01",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1118",
    "realName": "우리",
    "city": "미국",
    "homeCity": "미국",
    "maritalStatus": "divorced",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0424",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 2,
    "baseScore": 2,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 2,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-04-24",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1119",
    "realName": "에딘",
    "city": "미아",
    "homeCity": "미아",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0322",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 2,
    "baseScore": 2,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 2,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-03-22",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1120",
    "realName": "찌유",
    "city": "제주",
    "homeCity": "제주",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0415",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 2,
    "baseScore": 2,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 2,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-04-15",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1121",
    "realName": "잔치",
    "city": "창원",
    "homeCity": "창원",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0704",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 0,
    "baseScore": 0,
    "expeditionScore": 2,
    "eventScore": 0,
    "totalScore": 2,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-07-04",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1122",
    "realName": "앨리스",
    "city": "삼송",
    "homeCity": "삼송",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0408",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 2,
    "baseScore": 2,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 2,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2026-04-08",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1123",
    "realName": "유니",
    "city": "경광",
    "homeCity": "경광",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0130",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 2,
    "baseScore": 2,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 2,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-01-30",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1124",
    "realName": "하늘",
    "city": "천안",
    "homeCity": "천안",
    "maritalStatus": "divorced",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0723",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 1,
    "eventScore": 0,
    "totalScore": 2,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-07-23",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1125",
    "realName": "현이",
    "city": "영등포",
    "homeCity": "영등포",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "1111",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 2,
    "baseScore": 2,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 2,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-11-11",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1126",
    "realName": "구해",
    "city": "노원",
    "homeCity": "노원",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "1015",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 2,
    "baseScore": 2,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 2,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-10-15",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1127",
    "realName": "딸기",
    "city": "광주",
    "homeCity": "광주",
    "maritalStatus": "divorced",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0331",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 2,
    "baseScore": 2,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 2,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-03-31",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1128",
    "realName": "호박",
    "city": "인천",
    "homeCity": "인천",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "1025",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 2,
    "baseScore": 2,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 2,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-10-25",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1129",
    "realName": "정우",
    "city": "대구",
    "homeCity": "대구",
    "maritalStatus": "divorced",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0319",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 2,
    "baseScore": 2,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 2,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-03-19",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1130",
    "realName": "조커",
    "city": "인천",
    "homeCity": "인천",
    "maritalStatus": "divorced",
    "gender": "남",
    "role": "Member",
    "entryBadge": "1020",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 2,
    "baseScore": 2,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 2,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-10-20",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1131",
    "realName": "먀미",
    "city": "오산",
    "homeCity": "오산",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0611",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 2,
    "baseScore": 2,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 2,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-06-11",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1132",
    "realName": "승소",
    "city": "인천",
    "homeCity": "인천",
    "maritalStatus": "single",
    "gender": "남",
    "role": "Member",
    "entryBadge": "1222",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-12-22",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1133",
    "realName": "톰",
    "city": "미국",
    "homeCity": "미국",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0402",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-04-02",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1134",
    "realName": "아미",
    "city": "동탄",
    "homeCity": "동탄",
    "maritalStatus": "single",
    "gender": "여",
    "role": "Member",
    "entryBadge": "1223",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-12-23",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1135",
    "realName": "건형",
    "city": "전주",
    "homeCity": "전주",
    "maritalStatus": "single",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0806",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2026-08-06",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1136",
    "realName": "아가",
    "city": "강남",
    "homeCity": "강남",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0628",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2026-06-28",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1137",
    "realName": "곰탱",
    "city": "태백",
    "homeCity": "태백",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0327",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-03-27",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1138",
    "realName": "짱가",
    "city": "제주",
    "homeCity": "제주",
    "maritalStatus": "divorced",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0407",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2026-04-07",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1139",
    "realName": "다나",
    "city": "영등포",
    "homeCity": "영등포",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0904",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-09-04",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1140",
    "realName": "소미",
    "city": "강서",
    "homeCity": "강서",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0717",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-07-17",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1141",
    "realName": "라니",
    "city": "부천",
    "homeCity": "부천",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0509",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-05-09",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:1142",
    "realName": "물감",
    "city": "마포",
    "homeCity": "마포",
    "maritalStatus": "single",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0117",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-01-17",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2000",
    "realName": "모찌",
    "city": "여수",
    "homeCity": "여수",
    "maritalStatus": "divorced",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0223",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-02-23",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2001",
    "realName": "가을",
    "city": "수원",
    "homeCity": "수원",
    "maritalStatus": "single",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0223",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-02-23",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2002",
    "realName": "사과",
    "city": "구미",
    "homeCity": "구미",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0328",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-03-28",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2003",
    "realName": "루엘",
    "city": "인천",
    "homeCity": "인천",
    "maritalStatus": "single",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0731",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2026-07-31",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2004",
    "realName": "콴",
    "city": "수원",
    "homeCity": "수원",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0312",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-03-12",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2005",
    "realName": "매화",
    "city": "화성",
    "homeCity": "화성",
    "maritalStatus": "divorced",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0330",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2026-03-30",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2006",
    "realName": "백수",
    "city": "강남",
    "homeCity": "강남",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0210",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2026-02-10",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2007",
    "realName": "동수",
    "city": "평택",
    "homeCity": "평택",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0612",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2026-06-12",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2008",
    "realName": "만두",
    "city": "의정부",
    "homeCity": "의정부",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0507",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-05-07",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2009",
    "realName": "샤인",
    "city": "수서",
    "homeCity": "수서",
    "maritalStatus": "single",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0207",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-02-07",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2010",
    "realName": "메리",
    "city": "안동",
    "homeCity": "안동",
    "maritalStatus": "divorced",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0819",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-08-19",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2011",
    "realName": "제이",
    "city": "분당",
    "homeCity": "분당",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0910",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-09-10",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2012",
    "realName": "김군",
    "city": "파주",
    "homeCity": "파주",
    "maritalStatus": "single",
    "gender": "남",
    "role": "Member",
    "entryBadge": "1001",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-10-01",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2013",
    "realName": "맑음이",
    "city": "마포",
    "homeCity": "마포",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0521",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2026-05-21",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2014",
    "realName": "요니",
    "city": "동대문",
    "homeCity": "동대문",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0825",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-08-25",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2015",
    "realName": "신념",
    "city": "수원",
    "homeCity": "수원",
    "maritalStatus": "divorced",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0213",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2026-02-13",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2016",
    "realName": "마카",
    "city": "동작",
    "homeCity": "동작",
    "maritalStatus": "divorced",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0221",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2026-02-21",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2017",
    "realName": "안동",
    "city": "안산",
    "homeCity": "안산",
    "maritalStatus": "divorced",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0204",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2026-02-04",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2018",
    "realName": "지노",
    "city": "천안",
    "homeCity": "천안",
    "maritalStatus": "divorced",
    "gender": "남",
    "role": "Member",
    "entryBadge": "1216",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-12-16",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2019",
    "realName": "승희",
    "city": "천안",
    "homeCity": "천안",
    "maritalStatus": "divorced",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0121",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2026-01-21",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2020",
    "realName": "목화",
    "city": "동탄",
    "homeCity": "동탄",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0324",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-03-24",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2021",
    "realName": "동자",
    "city": "산본",
    "homeCity": "산본",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0129",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2026-01-29",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2022",
    "realName": "리윤",
    "city": "대전",
    "homeCity": "대전",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0117",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2026-01-17",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2023",
    "realName": "경광초코",
    "city": "양주",
    "homeCity": "양주",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "1217",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-12-17",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2024",
    "realName": "짱구",
    "city": "안산",
    "homeCity": "안산",
    "maritalStatus": "single",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0114",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2026-01-14",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2025",
    "realName": "지수",
    "city": "인천",
    "homeCity": "인천",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "1111",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-11-11",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2026",
    "realName": "니즈",
    "city": "경광",
    "homeCity": "경광",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0824",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-08-24",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2027",
    "realName": "안개",
    "city": "광주",
    "homeCity": "광주",
    "maritalStatus": "divorced",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0126",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-01-26",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2028",
    "realName": "알티",
    "city": "화성",
    "homeCity": "화성",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "1021",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-10-21",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2029",
    "realName": "돌풍",
    "city": "인천",
    "homeCity": "인천",
    "maritalStatus": "single",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0830",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-08-30",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2030",
    "realName": "오클",
    "city": "뉴질",
    "homeCity": "뉴질",
    "maritalStatus": "divorced",
    "gender": "남",
    "role": "Member",
    "entryBadge": "1009",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-10-09",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2031",
    "realName": "이디",
    "city": "영등포",
    "homeCity": "영등포",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0328",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-03-28",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2032",
    "realName": "초롱",
    "city": "양천",
    "homeCity": "양천",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0127",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-01-27",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2033",
    "realName": "춘식이",
    "city": "구미",
    "homeCity": "구미",
    "maritalStatus": "divorced",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0415",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-04-15",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2034",
    "realName": "골린",
    "city": "수원",
    "homeCity": "수원",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0216",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-02-16",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2035",
    "realName": "상추",
    "city": "부산",
    "homeCity": "부산",
    "maritalStatus": "divorced",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0512",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-05-12",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2036",
    "realName": "볼린이",
    "city": "대전",
    "homeCity": "대전",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0907",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-09-07",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2037",
    "realName": "한울",
    "city": "춘천",
    "homeCity": "춘천",
    "maritalStatus": "single",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0126",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-01-26",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2038",
    "realName": "일상",
    "city": "포천",
    "homeCity": "포천",
    "maritalStatus": "single",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0710",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-07-10",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2039",
    "realName": "지아",
    "city": "인천",
    "homeCity": "인천",
    "maritalStatus": "divorced",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0529",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-05-29",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2040",
    "realName": "리듬",
    "city": "금천",
    "homeCity": "금천",
    "maritalStatus": "divorced",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0815",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-08-15",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2041",
    "realName": "부끄",
    "city": "서초",
    "homeCity": "서초",
    "maritalStatus": "single",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0713",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-07-13",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2042",
    "realName": "지나",
    "city": "군포",
    "homeCity": "군포",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0809",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-08-09",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2043",
    "realName": "졸리",
    "city": "경광",
    "homeCity": "경광",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0201",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-02-01",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2044",
    "realName": "슈슈",
    "city": "영등포",
    "homeCity": "영등포",
    "maritalStatus": "divorced",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0202",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-02-02",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2045",
    "realName": "유하",
    "city": "영등포",
    "homeCity": "영등포",
    "maritalStatus": "single",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0212",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-02-12",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2046",
    "realName": "해수",
    "city": "강서",
    "homeCity": "강서",
    "maritalStatus": "single",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0625",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-06-25",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2047",
    "realName": "파인",
    "city": "춘천",
    "homeCity": "춘천",
    "maritalStatus": "divorced",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0126",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-01-26",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2048",
    "realName": "동백",
    "city": "양주",
    "homeCity": "양주",
    "maritalStatus": "divorced",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0508",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-05-08",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2049",
    "realName": "쿠노",
    "city": "남양주",
    "homeCity": "남양주",
    "maritalStatus": "single",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0728",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-07-28",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2050",
    "realName": "그래",
    "city": "춘천",
    "homeCity": "춘천",
    "maritalStatus": "divorced",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0126",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-01-26",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2051",
    "realName": "희야",
    "city": "천안",
    "homeCity": "천안",
    "maritalStatus": "divorced",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0514",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-05-14",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2052",
    "realName": "캠신",
    "city": "인천",
    "homeCity": "인천",
    "maritalStatus": "divorced",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0528",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-05-28",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2053",
    "realName": "물어",
    "city": "일산",
    "homeCity": "일산",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0612",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-06-12",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2054",
    "realName": "카스",
    "city": "인천",
    "homeCity": "인천",
    "maritalStatus": "divorced",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0416",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-04-16",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2055",
    "realName": "파랑",
    "city": "강동",
    "homeCity": "강동",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "1101",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-11-01",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2056",
    "realName": "승호",
    "city": "수원",
    "homeCity": "수원",
    "maritalStatus": "single",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0606",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-06-06",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2057",
    "realName": "융",
    "city": "평택",
    "homeCity": "평택",
    "maritalStatus": "single",
    "gender": "남",
    "role": "Member",
    "entryBadge": "1117",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-11-17",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2058",
    "realName": "동이",
    "city": "강북",
    "homeCity": "강북",
    "maritalStatus": "single",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0128",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-01-28",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2059",
    "realName": "민이",
    "city": "광주",
    "homeCity": "광주",
    "maritalStatus": "single",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0126",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-01-26",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2060",
    "realName": "공공",
    "city": "포천",
    "homeCity": "포천",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "1027",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-10-27",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2061",
    "realName": "아리",
    "city": "서대문",
    "homeCity": "서대문",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "1011",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-10-11",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2062",
    "realName": "블가리",
    "city": "구미",
    "homeCity": "구미",
    "maritalStatus": "single",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0408",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-04-08",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2063",
    "realName": "무지",
    "city": "김포",
    "homeCity": "김포",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0129",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-01-29",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2064",
    "realName": "아프",
    "city": "포항",
    "homeCity": "포항",
    "maritalStatus": "divorced",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0205",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-02-05",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2065",
    "realName": "삐약",
    "city": "광주",
    "homeCity": "광주",
    "maritalStatus": "divorced",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0403",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-04-03",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2066",
    "realName": "승언",
    "city": "인천",
    "homeCity": "인천",
    "maritalStatus": "divorced",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0327",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-03-27",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2067",
    "realName": "엔지",
    "city": "시흥",
    "homeCity": "시흥",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0221",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-02-21",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2068",
    "realName": "화요",
    "city": "대전",
    "homeCity": "대전",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0210",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-02-10",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2069",
    "realName": "오산하늘",
    "city": "천안",
    "homeCity": "천안",
    "maritalStatus": "divorced",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0723",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-07-23",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2070",
    "realName": "찌니",
    "city": "대전",
    "homeCity": "대전",
    "maritalStatus": "divorced",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0310",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2025-03-10",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2071",
    "realName": "반달",
    "city": "동대문",
    "homeCity": "동대문",
    "maritalStatus": "single",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0229",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-02-29",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2072",
    "realName": "강동보리",
    "city": "인천",
    "homeCity": "인천",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0914",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-09-14",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2073",
    "realName": "질주",
    "city": "오산",
    "homeCity": "오산",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0126",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-01-26",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2074",
    "realName": "클",
    "city": "일산",
    "homeCity": "일산",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0630",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-06-30",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2075",
    "realName": "지지",
    "city": "시흥",
    "homeCity": "시흥",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0127",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-01-27",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2076",
    "realName": "자몽",
    "city": "노원",
    "homeCity": "노원",
    "maritalStatus": "divorced",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0413",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-04-13",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2077",
    "realName": "생귤",
    "city": "기타",
    "homeCity": "기타",
    "maritalStatus": "single",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0101",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-01-01",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2078",
    "realName": "쏭쏭",
    "city": "오산",
    "homeCity": "오산",
    "maritalStatus": "divorced",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0126",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-01-26",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2079",
    "realName": "백구",
    "city": "의정부",
    "homeCity": "의정부",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0126",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-01-26",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2080",
    "realName": "힐링맨",
    "city": "부천",
    "homeCity": "부천",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0828",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-08-28",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2081",
    "realName": "제주냥",
    "city": "제주",
    "homeCity": "제주",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "1025",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-10-25",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2082",
    "realName": "이언",
    "city": "강북",
    "homeCity": "강북",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "1227",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-12-27",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2083",
    "realName": "정의",
    "city": "강동",
    "homeCity": "강동",
    "maritalStatus": "single",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0228",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-02-28",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2084",
    "realName": "윤모모",
    "city": "군포",
    "homeCity": "군포",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0412",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-04-12",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2085",
    "realName": "일초",
    "city": "강남",
    "homeCity": "강남",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0929",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-09-29",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2086",
    "realName": "대니",
    "city": "서초",
    "homeCity": "서초",
    "maritalStatus": "divorced",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0808",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-08-08",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2087",
    "realName": "이노",
    "city": "구리",
    "homeCity": "구리",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0126",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-01-26",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2088",
    "realName": "안양초롱",
    "city": "양천",
    "homeCity": "양천",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0127",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-01-27",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2089",
    "realName": "브로",
    "city": "부평",
    "homeCity": "부평",
    "maritalStatus": "divorced",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0816",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-08-16",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2090",
    "realName": "포비",
    "city": "도봉",
    "homeCity": "도봉",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0719",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-07-19",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2091",
    "realName": "레오",
    "city": "영등포",
    "homeCity": "영등포",
    "maritalStatus": "single",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0210",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-02-10",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2092",
    "realName": "루루",
    "city": "종로",
    "homeCity": "종로",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0329",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-03-29",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2093",
    "realName": "루피",
    "city": "남양주",
    "homeCity": "남양주",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0611",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-06-11",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2094",
    "realName": "도끼",
    "city": "강북",
    "homeCity": "강북",
    "maritalStatus": "single",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0131",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-01-31",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2095",
    "realName": "춘천뚠뚠",
    "city": "춘천",
    "homeCity": "춘천",
    "maritalStatus": "single",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0126",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-01-26",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2096",
    "realName": "은정",
    "city": "서대문",
    "homeCity": "서대문",
    "maritalStatus": "divorced",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0516",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-05-16",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2097",
    "realName": "토모",
    "city": "강남",
    "homeCity": "강남",
    "maritalStatus": "divorced",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0213",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-02-13",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2098",
    "realName": "정선곰탱",
    "city": "태백",
    "homeCity": "태백",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0327",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-03-27",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2099",
    "realName": "신디",
    "city": "대전",
    "homeCity": "대전",
    "maritalStatus": "divorced",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0127",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-01-27",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2100",
    "realName": "이제",
    "city": "수원",
    "homeCity": "수원",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0501",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-05-01",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2101",
    "realName": "한스",
    "city": "오산",
    "homeCity": "오산",
    "maritalStatus": "divorced",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0611",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-06-11",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2102",
    "realName": "텐션",
    "city": "강서",
    "homeCity": "강서",
    "maritalStatus": "single",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0213",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-02-13",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2103",
    "realName": "동건",
    "city": "인천",
    "homeCity": "인천",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0426",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-04-26",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2104",
    "realName": "몽실",
    "city": "인천",
    "homeCity": "인천",
    "maritalStatus": "divorced",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0602",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-06-02",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2105",
    "realName": "차르",
    "city": "청주",
    "homeCity": "청주",
    "maritalStatus": "divorced",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0127",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-01-27",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2106",
    "realName": "비비",
    "city": "평택",
    "homeCity": "평택",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0509",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-05-09",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2107",
    "realName": "썬이",
    "city": "화성",
    "homeCity": "화성",
    "maritalStatus": "divorced",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0507",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-05-07",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2108",
    "realName": "단비",
    "city": "안양",
    "homeCity": "안양",
    "maritalStatus": "divorced",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0305",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-03-05",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2109",
    "realName": "말상",
    "city": "은평",
    "homeCity": "은평",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0315",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-03-15",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2110",
    "realName": "쑴",
    "city": "천안",
    "homeCity": "천안",
    "maritalStatus": "divorced",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0128",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-01-28",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2111",
    "realName": "에자",
    "city": "부천",
    "homeCity": "부천",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0409",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-04-09",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2112",
    "realName": "어깡",
    "city": "천안",
    "homeCity": "천안",
    "maritalStatus": "divorced",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0403",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-04-03",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2113",
    "realName": "그린",
    "city": "광주",
    "homeCity": "광주",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0127",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-01-27",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2114",
    "realName": "노나",
    "city": "경광",
    "homeCity": "경광",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0325",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-03-25",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2115",
    "realName": "이서",
    "city": "용(논)산",
    "homeCity": "용(논)산",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0226",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-02-26",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2116",
    "realName": "빠루",
    "city": "인천",
    "homeCity": "인천",
    "maritalStatus": "divorced",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0213",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-02-13",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2117",
    "realName": "쏘노",
    "city": "수원",
    "homeCity": "수원",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0309",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-03-09",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2118",
    "realName": "수원미미",
    "city": "수원",
    "homeCity": "수원",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0309",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-03-09",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2119",
    "realName": "으쓱",
    "city": "성북",
    "homeCity": "성북",
    "maritalStatus": "single",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0203",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-02-03",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2120",
    "realName": "정재",
    "city": "금천",
    "homeCity": "금천",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0229",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-02-29",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2121",
    "realName": "한시",
    "city": "노원",
    "homeCity": "노원",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0130",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-01-30",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2122",
    "realName": "오산가을",
    "city": "수원",
    "homeCity": "수원",
    "maritalStatus": "single",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0223",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-02-23",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2123",
    "realName": "장미",
    "city": "성남",
    "homeCity": "성남",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0213",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-02-13",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2124",
    "realName": "뿐",
    "city": "미아",
    "homeCity": "미아",
    "maritalStatus": "married",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0215",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-02-15",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2125",
    "realName": "달려",
    "city": "분당",
    "homeCity": "분당",
    "maritalStatus": "married",
    "gender": "남",
    "role": "Member",
    "entryBadge": "0226",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-02-26",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2126",
    "realName": "미르",
    "city": "화성",
    "homeCity": "화성",
    "maritalStatus": "divorced",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0129",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-01-29",
    "unlockedAlbums": []
  },
  {
    "uid": "kakao:2127",
    "realName": "하하",
    "city": "하남",
    "homeCity": "하남",
    "maritalStatus": "single",
    "gender": "여",
    "role": "Member",
    "entryBadge": "0129",
    "customBadge": "",
    "bankAccount": "",
    "attendanceCount": 1,
    "baseScore": 1,
    "expeditionScore": 0,
    "eventScore": 0,
    "totalScore": 1,
    "monthlyScore": 0,
    "hostCount": 0,
    "joinedAt": "2024-01-29",
    "unlockedAlbums": []
  }
];

export const INITIAL_MEETINGS = [
  {
    "id": "26110101",
    "title": "여수옛날집벙",
    "dateOnly": "2026-11-01",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-11-01 19:00",
    "location": "여수",
    "placeDetail": "여수 인근 약속 장소",
    "hostUid": "kakao:1025",
    "treasurerUid": "kakao:1038",
    "type": "Casual",
    "status": "open",
    "applicants": [
      "kakao:1025",
      "kakao:1038",
      "kakao:2000"
    ],
    "confirmedParticipants": [
      "kakao:1025",
      "kakao:1038",
      "kakao:2000"
    ],
    "description": "여수옛날집벙 (2026-11-01) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26110101-1",
        "label": "1차",
        "placeName": "여수 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1025",
          "kakao:1038",
          "kakao:2000"
        ],
        "payerUid": "kakao:1025",
        "cost": 60000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1025": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1038": {
        "paid": true,
        "confirmed": true
      },
      "kakao:2000": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1025",
      "kakao:1038",
      "kakao:2000"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26103001",
    "title": "노량진새우벙",
    "dateOnly": "2026-10-30",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-10-30 19:00",
    "location": "서울",
    "placeDetail": "서울 인근 약속 장소",
    "hostUid": "kakao:1001",
    "treasurerUid": "kakao:1017",
    "type": "Casual",
    "status": "open",
    "applicants": [
      "kakao:1001",
      "kakao:1017",
      "kakao:1049",
      "kakao:1068",
      "kakao:1015",
      "kakao:1108"
    ],
    "confirmedParticipants": [
      "kakao:1001",
      "kakao:1017",
      "kakao:1049",
      "kakao:1068",
      "kakao:1015",
      "kakao:1108"
    ],
    "description": "노량진새우벙 (2026-10-30) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26103001-1",
        "label": "1차",
        "placeName": "서울 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1001",
          "kakao:1017",
          "kakao:1049",
          "kakao:1068",
          "kakao:1015",
          "kakao:1108"
        ],
        "payerUid": "kakao:1001",
        "cost": 120000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1001": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1017": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1049": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1068": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1015": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1108": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1001",
      "kakao:1017",
      "kakao:1049"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26103002",
    "title": "화순이쁘신사장님벙",
    "dateOnly": "2026-10-30",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-10-30 19:00",
    "location": "서울",
    "placeDetail": "서울 인근 약속 장소",
    "hostUid": "kakao:1013",
    "treasurerUid": "kakao:1043",
    "type": "Casual",
    "status": "open",
    "applicants": [
      "kakao:1036",
      "kakao:1043",
      "kakao:1013",
      "kakao:1050"
    ],
    "confirmedParticipants": [
      "kakao:1036",
      "kakao:1043",
      "kakao:1013",
      "kakao:1050"
    ],
    "description": "화순이쁘신사장님벙 (2026-10-30) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26103002-1",
        "label": "1차",
        "placeName": "서울 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1036",
          "kakao:1043",
          "kakao:1013",
          "kakao:1050"
        ],
        "payerUid": "kakao:1013",
        "cost": 80000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1036": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1043": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1013": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1050": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1036",
      "kakao:1043",
      "kakao:1013"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26102701",
    "title": "논현벙",
    "dateOnly": "2026-10-27",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-10-27 19:00",
    "location": "서울",
    "placeDetail": "서울 인근 약속 장소",
    "hostUid": "kakao:1001",
    "treasurerUid": "kakao:1011",
    "type": "Casual",
    "status": "open",
    "applicants": [
      "kakao:1001",
      "kakao:1011",
      "kakao:1012",
      "kakao:1082",
      "kakao:1017",
      "kakao:1002",
      "kakao:1097",
      "kakao:1003",
      "kakao:1036",
      "kakao:1015",
      "kakao:1027",
      "kakao:1010"
    ],
    "confirmedParticipants": [
      "kakao:1001",
      "kakao:1011",
      "kakao:1012",
      "kakao:1082",
      "kakao:1017",
      "kakao:1002",
      "kakao:1097",
      "kakao:1003",
      "kakao:1036",
      "kakao:1015",
      "kakao:1027",
      "kakao:1010"
    ],
    "description": "논현벙 (2026-10-27) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26102701-1",
        "label": "1차",
        "placeName": "서울 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1001",
          "kakao:1011",
          "kakao:1012",
          "kakao:1082",
          "kakao:1017",
          "kakao:1002",
          "kakao:1097",
          "kakao:1003",
          "kakao:1036",
          "kakao:1015",
          "kakao:1027",
          "kakao:1010"
        ],
        "payerUid": "kakao:1001",
        "cost": 240000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1001": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1011": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1012": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1082": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1017": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1002": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1097": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1003": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1036": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1015": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1027": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1010": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1001",
      "kakao:1011",
      "kakao:1012"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26102501",
    "title": "전주벙",
    "dateOnly": "2026-10-25",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-10-25 19:00",
    "location": "전주",
    "placeDetail": "전주 인근 약속 장소",
    "hostUid": "kakao:1013",
    "treasurerUid": "kakao:1013",
    "type": "Casual",
    "status": "open",
    "applicants": [
      "kakao:1033",
      "kakao:1013",
      "kakao:1034",
      "kakao:1002",
      "kakao:1070",
      "kakao:1069",
      "kakao:1036",
      "kakao:1117",
      "kakao:2000"
    ],
    "confirmedParticipants": [
      "kakao:1033",
      "kakao:1013",
      "kakao:1034",
      "kakao:1002",
      "kakao:1070",
      "kakao:1069",
      "kakao:1036",
      "kakao:1117",
      "kakao:2000"
    ],
    "description": "전주벙 (2026-10-25) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26102501-1",
        "label": "1차",
        "placeName": "전주 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1033",
          "kakao:1013",
          "kakao:1034",
          "kakao:1002",
          "kakao:1070",
          "kakao:1069",
          "kakao:1036",
          "kakao:1117",
          "kakao:2000"
        ],
        "payerUid": "kakao:1013",
        "cost": 180000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1033": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1013": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1034": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1002": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1070": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1069": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1036": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1117": {
        "paid": true,
        "confirmed": true
      },
      "kakao:2000": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1033",
      "kakao:1013",
      "kakao:1034"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26102401",
    "title": "대전벙",
    "dateOnly": "2026-10-24",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-10-24 19:00",
    "location": "대전",
    "placeDetail": "대전 인근 약속 장소",
    "hostUid": "kakao:1007",
    "treasurerUid": "kakao:1033",
    "type": "Casual",
    "status": "open",
    "applicants": [
      "kakao:1007",
      "kakao:1033",
      "kakao:1030",
      "kakao:1034",
      "kakao:1031"
    ],
    "confirmedParticipants": [
      "kakao:1007",
      "kakao:1033",
      "kakao:1030",
      "kakao:1034",
      "kakao:1031"
    ],
    "description": "대전벙 (2026-10-24) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26102401-1",
        "label": "1차",
        "placeName": "대전 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1007",
          "kakao:1033",
          "kakao:1030",
          "kakao:1034",
          "kakao:1031"
        ],
        "payerUid": "kakao:1007",
        "cost": 100000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1007": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1033": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1030": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1034": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1031": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1007",
      "kakao:1033",
      "kakao:1030"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26102301",
    "title": "수지구청벙",
    "dateOnly": "2026-10-23",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-10-23 19:00",
    "location": "경기",
    "placeDetail": "경기 인근 약속 장소",
    "hostUid": "kakao:1011",
    "treasurerUid": "kakao:1017",
    "type": "Casual",
    "status": "open",
    "applicants": [
      "kakao:1011",
      "kakao:1017",
      "kakao:1061"
    ],
    "confirmedParticipants": [
      "kakao:1011",
      "kakao:1017",
      "kakao:1061"
    ],
    "description": "수지구청벙 (2026-10-23) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26102301-1",
        "label": "1차",
        "placeName": "경기 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1011",
          "kakao:1017",
          "kakao:1061"
        ],
        "payerUid": "kakao:1011",
        "cost": 60000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1011": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1017": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1061": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1011",
      "kakao:1017",
      "kakao:1061"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26102101",
    "title": "노원벙",
    "dateOnly": "2026-10-21",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-10-21 19:00",
    "location": "서울",
    "placeDetail": "서울 인근 약속 장소",
    "hostUid": "kakao:1001",
    "treasurerUid": "kakao:1021",
    "type": "Casual",
    "status": "open",
    "applicants": [
      "kakao:1001",
      "kakao:1021",
      "kakao:1014",
      "kakao:1028",
      "kakao:1017",
      "kakao:1019"
    ],
    "confirmedParticipants": [
      "kakao:1001",
      "kakao:1021",
      "kakao:1014",
      "kakao:1028",
      "kakao:1017",
      "kakao:1019"
    ],
    "description": "노원벙 (2026-10-21) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26102101-1",
        "label": "1차",
        "placeName": "서울 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1001",
          "kakao:1021",
          "kakao:1014",
          "kakao:1028",
          "kakao:1017",
          "kakao:1019"
        ],
        "payerUid": "kakao:1001",
        "cost": 120000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1001": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1021": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1014": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1028": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1017": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1019": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1001",
      "kakao:1021",
      "kakao:1014"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26101801",
    "title": "안성벙",
    "dateOnly": "2026-10-18",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-10-18 19:00",
    "location": "안성",
    "placeDetail": "안성 인근 약속 장소",
    "hostUid": "kakao:1004",
    "treasurerUid": "kakao:1009",
    "type": "Casual",
    "status": "open",
    "applicants": [
      "kakao:1037",
      "kakao:1009",
      "kakao:1004"
    ],
    "confirmedParticipants": [
      "kakao:1037",
      "kakao:1009",
      "kakao:1004"
    ],
    "description": "안성벙 (2026-10-18) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26101801-1",
        "label": "1차",
        "placeName": "안성 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1037",
          "kakao:1009",
          "kakao:1004"
        ],
        "payerUid": "kakao:1004",
        "cost": 60000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1037": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1009": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1004": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1037",
      "kakao:1009",
      "kakao:1004"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26101802",
    "title": "대전복수한우벙",
    "dateOnly": "2026-10-18",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-10-18 19:00",
    "location": "대전",
    "placeDetail": "대전 인근 약속 장소",
    "hostUid": "kakao:1004",
    "treasurerUid": "kakao:1031",
    "type": "Casual",
    "status": "open",
    "applicants": [
      "kakao:1033",
      "kakao:1031",
      "kakao:1004",
      "kakao:1009",
      "kakao:1051",
      "kakao:1034"
    ],
    "confirmedParticipants": [
      "kakao:1033",
      "kakao:1031",
      "kakao:1004",
      "kakao:1009",
      "kakao:1051",
      "kakao:1034"
    ],
    "description": "대전복수한우벙 (2026-10-18) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26101802-1",
        "label": "1차",
        "placeName": "대전 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1033",
          "kakao:1031",
          "kakao:1004",
          "kakao:1009",
          "kakao:1051",
          "kakao:1034"
        ],
        "payerUid": "kakao:1004",
        "cost": 120000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1033": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1031": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1004": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1009": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1051": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1034": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1033",
      "kakao:1031",
      "kakao:1004"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26101701",
    "title": "대전소곱창벙",
    "dateOnly": "2026-10-17",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-10-17 19:00",
    "location": "대전",
    "placeDetail": "대전 인근 약속 장소",
    "hostUid": "kakao:1004",
    "treasurerUid": "kakao:1034",
    "type": "Casual",
    "status": "settled",
    "applicants": [
      "kakao:1031",
      "kakao:1034",
      "kakao:1033",
      "kakao:1050",
      "kakao:1030",
      "kakao:1004",
      "kakao:1009",
      "kakao:1051"
    ],
    "confirmedParticipants": [
      "kakao:1031",
      "kakao:1034",
      "kakao:1033",
      "kakao:1050",
      "kakao:1030",
      "kakao:1004",
      "kakao:1009",
      "kakao:1051"
    ],
    "description": "대전소곱창벙 (2026-10-17) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26101701-1",
        "label": "1차",
        "placeName": "대전 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1031",
          "kakao:1034",
          "kakao:1033",
          "kakao:1050",
          "kakao:1030",
          "kakao:1004",
          "kakao:1009",
          "kakao:1051"
        ],
        "payerUid": "kakao:1004",
        "cost": 160000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1031": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1034": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1033": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1050": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1030": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1004": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1009": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1051": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1031",
      "kakao:1034",
      "kakao:1033"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26101601",
    "title": "안성급벙",
    "dateOnly": "2026-10-16",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-10-16 19:00",
    "location": "안성",
    "placeDetail": "안성 인근 약속 장소",
    "hostUid": "kakao:1004",
    "treasurerUid": "kakao:1009",
    "type": "Casual",
    "status": "settled",
    "applicants": [
      "kakao:1037",
      "kakao:1009",
      "kakao:1004"
    ],
    "confirmedParticipants": [
      "kakao:1037",
      "kakao:1009",
      "kakao:1004"
    ],
    "description": "안성급벙 (2026-10-16) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26101601-1",
        "label": "1차",
        "placeName": "안성 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1037",
          "kakao:1009",
          "kakao:1004"
        ],
        "payerUid": "kakao:1004",
        "cost": 60000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1037": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1009": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1004": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1037",
      "kakao:1009",
      "kakao:1004"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26101501",
    "title": "원주벙",
    "dateOnly": "2026-10-15",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-10-15 19:00",
    "location": "서울",
    "placeDetail": "서울 인근 약속 장소",
    "hostUid": "kakao:1007",
    "treasurerUid": "kakao:1052",
    "type": "Casual",
    "status": "settled",
    "applicants": [
      "kakao:1007",
      "kakao:1052",
      "kakao:1033",
      "kakao:2001",
      "kakao:1064",
      "kakao:1032",
      "kakao:1003"
    ],
    "confirmedParticipants": [
      "kakao:1007",
      "kakao:1052",
      "kakao:1033",
      "kakao:2001",
      "kakao:1064",
      "kakao:1032",
      "kakao:1003"
    ],
    "description": "원주벙 (2026-10-15) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26101501-1",
        "label": "1차",
        "placeName": "서울 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1007",
          "kakao:1052",
          "kakao:1033",
          "kakao:2001",
          "kakao:1064",
          "kakao:1032",
          "kakao:1003"
        ],
        "payerUid": "kakao:1007",
        "cost": 140000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1007": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1052": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1033": {
        "paid": true,
        "confirmed": true
      },
      "kakao:2001": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1064": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1032": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1003": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1007",
      "kakao:1052",
      "kakao:1033"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26101301",
    "title": "수원벙",
    "dateOnly": "2026-10-13",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-10-13 19:00",
    "location": "수원",
    "placeDetail": "수원 인근 약속 장소",
    "hostUid": "kakao:1001",
    "treasurerUid": "kakao:1016",
    "type": "Casual",
    "status": "settled",
    "applicants": [
      "kakao:1001",
      "kakao:1016",
      "kakao:1018",
      "kakao:1012",
      "kakao:1082",
      "kakao:1118",
      "kakao:1011"
    ],
    "confirmedParticipants": [
      "kakao:1001",
      "kakao:1016",
      "kakao:1018",
      "kakao:1012",
      "kakao:1082",
      "kakao:1118",
      "kakao:1011"
    ],
    "description": "수원벙 (2026-10-13) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26101301-1",
        "label": "1차",
        "placeName": "수원 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1001",
          "kakao:1016",
          "kakao:1018",
          "kakao:1012",
          "kakao:1082",
          "kakao:1118",
          "kakao:1011"
        ],
        "payerUid": "kakao:1001",
        "cost": 140000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1001": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1016": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1018": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1012": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1082": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1118": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1011": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1001",
      "kakao:1016",
      "kakao:1018"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26101201",
    "title": "전주야장벙",
    "dateOnly": "2026-10-12",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-10-12 19:00",
    "location": "전주",
    "placeDetail": "전주 인근 약속 장소",
    "hostUid": "kakao:1013",
    "treasurerUid": "kakao:1002",
    "type": "Casual",
    "status": "settled",
    "applicants": [
      "kakao:1036",
      "kakao:1002",
      "kakao:1013"
    ],
    "confirmedParticipants": [
      "kakao:1036",
      "kakao:1002",
      "kakao:1013"
    ],
    "description": "전주야장벙 (2026-10-12) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26101201-1",
        "label": "1차",
        "placeName": "전주 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1036",
          "kakao:1002",
          "kakao:1013"
        ],
        "payerUid": "kakao:1013",
        "cost": 60000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1036": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1002": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1013": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1036",
      "kakao:1002",
      "kakao:1013"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26101001",
    "title": "미사벙",
    "dateOnly": "2026-10-10",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-10-10 19:00",
    "location": "서울",
    "placeDetail": "서울 인근 약속 장소",
    "hostUid": "kakao:1008",
    "treasurerUid": "kakao:1020",
    "type": "Casual",
    "status": "settled",
    "applicants": [
      "kakao:1008",
      "kakao:1020",
      "kakao:1017",
      "kakao:1021"
    ],
    "confirmedParticipants": [
      "kakao:1008",
      "kakao:1020",
      "kakao:1017",
      "kakao:1021"
    ],
    "description": "미사벙 (2026-10-10) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26101001-1",
        "label": "1차",
        "placeName": "서울 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1008",
          "kakao:1020",
          "kakao:1017",
          "kakao:1021"
        ],
        "payerUid": "kakao:1008",
        "cost": 80000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1008": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1020": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1017": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1021": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1008",
      "kakao:1020",
      "kakao:1017"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26100901",
    "title": "광명시장벙",
    "dateOnly": "2026-10-09",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-10-09 19:00",
    "location": "서울",
    "placeDetail": "서울 인근 약속 장소",
    "hostUid": "kakao:1001",
    "treasurerUid": "kakao:1012",
    "type": "Casual",
    "status": "settled",
    "applicants": [
      "kakao:1001",
      "kakao:1012",
      "kakao:1091",
      "kakao:1018",
      "kakao:1068",
      "kakao:1108"
    ],
    "confirmedParticipants": [
      "kakao:1001",
      "kakao:1012",
      "kakao:1091",
      "kakao:1018",
      "kakao:1068",
      "kakao:1108"
    ],
    "description": "광명시장벙 (2026-10-09) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26100901-1",
        "label": "1차",
        "placeName": "서울 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1001",
          "kakao:1012",
          "kakao:1091",
          "kakao:1018",
          "kakao:1068",
          "kakao:1108"
        ],
        "payerUid": "kakao:1001",
        "cost": 120000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1001": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1012": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1091": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1018": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1068": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1108": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1001",
      "kakao:1012",
      "kakao:1091"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26100401",
    "title": "광주당구벙",
    "dateOnly": "2026-10-04",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-10-04 19:00",
    "location": "광주",
    "placeDetail": "광주 인근 약속 장소",
    "hostUid": "kakao:1036",
    "treasurerUid": "kakao:1062",
    "type": "Casual",
    "status": "settled",
    "applicants": [
      "kakao:1050",
      "kakao:1062",
      "kakao:1036",
      "kakao:1066",
      "kakao:1117",
      "kakao:2000"
    ],
    "confirmedParticipants": [
      "kakao:1050",
      "kakao:1062",
      "kakao:1036",
      "kakao:1066",
      "kakao:1117",
      "kakao:2000"
    ],
    "description": "광주당구벙 (2026-10-04) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26100401-1",
        "label": "1차",
        "placeName": "광주 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1050",
          "kakao:1062",
          "kakao:1036",
          "kakao:1066",
          "kakao:1117",
          "kakao:2000"
        ],
        "payerUid": "kakao:1036",
        "cost": 120000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1050": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1062": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1036": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1066": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1117": {
        "paid": true,
        "confirmed": true
      },
      "kakao:2000": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1050",
      "kakao:1062",
      "kakao:1036"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26100402",
    "title": "장태산벙",
    "dateOnly": "2026-10-04",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-10-04 19:00",
    "location": "서울",
    "placeDetail": "서울 인근 약속 장소",
    "hostUid": "kakao:1007",
    "treasurerUid": "kakao:1033",
    "type": "Casual",
    "status": "settled",
    "applicants": [
      "kakao:1007",
      "kakao:1033",
      "kakao:1034",
      "kakao:1030",
      "kakao:1022",
      "kakao:1031"
    ],
    "confirmedParticipants": [
      "kakao:1007",
      "kakao:1033",
      "kakao:1034",
      "kakao:1030",
      "kakao:1022",
      "kakao:1031"
    ],
    "description": "장태산벙 (2026-10-04) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26100402-1",
        "label": "1차",
        "placeName": "서울 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1007",
          "kakao:1033",
          "kakao:1034",
          "kakao:1030",
          "kakao:1022",
          "kakao:1031"
        ],
        "payerUid": "kakao:1007",
        "cost": 120000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1007": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1033": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1034": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1030": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1022": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1031": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1007",
      "kakao:1033",
      "kakao:1034"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26100301",
    "title": "하남보드겜벙",
    "dateOnly": "2026-10-03",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-10-03 19:00",
    "location": "서울",
    "placeDetail": "서울 인근 약속 장소",
    "hostUid": "kakao:1008",
    "treasurerUid": "kakao:1008",
    "type": "Casual",
    "status": "settled",
    "applicants": [
      "kakao:1020",
      "kakao:1008",
      "kakao:1031",
      "kakao:1017",
      "kakao:1019"
    ],
    "confirmedParticipants": [
      "kakao:1020",
      "kakao:1008",
      "kakao:1031",
      "kakao:1017",
      "kakao:1019"
    ],
    "description": "하남보드겜벙 (2026-10-03) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26100301-1",
        "label": "1차",
        "placeName": "서울 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1020",
          "kakao:1008",
          "kakao:1031",
          "kakao:1017",
          "kakao:1019"
        ],
        "payerUid": "kakao:1008",
        "cost": 100000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1020": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1008": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1031": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1017": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1019": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1020",
      "kakao:1008",
      "kakao:1031"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26100302",
    "title": "마이산등산벙",
    "dateOnly": "2026-10-03",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-10-03 19:00",
    "location": "서울",
    "placeDetail": "서울 인근 약속 장소",
    "hostUid": "kakao:1036",
    "treasurerUid": "kakao:1070",
    "type": "Casual",
    "status": "settled",
    "applicants": [
      "kakao:1036",
      "kakao:1070",
      "kakao:1050"
    ],
    "confirmedParticipants": [
      "kakao:1036",
      "kakao:1070",
      "kakao:1050"
    ],
    "description": "마이산등산벙 (2026-10-03) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26100302-1",
        "label": "1차",
        "placeName": "서울 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1036",
          "kakao:1070",
          "kakao:1050"
        ],
        "payerUid": "kakao:1036",
        "cost": 60000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1036": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1070": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1050": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1036",
      "kakao:1070",
      "kakao:1050"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26100303",
    "title": "대전아침벙",
    "dateOnly": "2026-10-03",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-10-03 19:00",
    "location": "대전",
    "placeDetail": "대전 인근 약속 장소",
    "hostUid": "kakao:1007",
    "treasurerUid": "kakao:1034",
    "type": "Casual",
    "status": "settled",
    "applicants": [
      "kakao:1013",
      "kakao:1034",
      "kakao:1007",
      "kakao:1033"
    ],
    "confirmedParticipants": [
      "kakao:1013",
      "kakao:1034",
      "kakao:1007",
      "kakao:1033"
    ],
    "description": "대전아침벙 (2026-10-03) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26100303-1",
        "label": "1차",
        "placeName": "대전 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1013",
          "kakao:1034",
          "kakao:1007",
          "kakao:1033"
        ],
        "payerUid": "kakao:1007",
        "cost": 80000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1013": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1034": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1007": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1033": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1013",
      "kakao:1034",
      "kakao:1007"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26100201",
    "title": "대전벙",
    "dateOnly": "2026-10-02",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-10-02 19:00",
    "location": "대전",
    "placeDetail": "대전 인근 약속 장소",
    "hostUid": "kakao:1007",
    "treasurerUid": "kakao:1109",
    "type": "Casual",
    "status": "settled",
    "applicants": [
      "kakao:1007",
      "kakao:1109",
      "kakao:1031",
      "kakao:1033",
      "kakao:1034",
      "kakao:1013"
    ],
    "confirmedParticipants": [
      "kakao:1007",
      "kakao:1109",
      "kakao:1031",
      "kakao:1033",
      "kakao:1034",
      "kakao:1013"
    ],
    "description": "대전벙 (2026-10-02) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26100201-1",
        "label": "1차",
        "placeName": "대전 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1007",
          "kakao:1109",
          "kakao:1031",
          "kakao:1033",
          "kakao:1034",
          "kakao:1013"
        ],
        "payerUid": "kakao:1007",
        "cost": 120000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1007": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1109": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1031": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1033": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1034": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1013": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1007",
      "kakao:1109",
      "kakao:1031"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26093001",
    "title": "오산벙",
    "dateOnly": "2026-09-30",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-09-30 19:00",
    "location": "경기",
    "placeDetail": "경기 인근 약속 장소",
    "hostUid": "kakao:1016",
    "treasurerUid": "kakao:1034",
    "type": "Casual",
    "status": "settled",
    "applicants": [
      "kakao:1013",
      "kakao:1034",
      "kakao:1035",
      "kakao:1011",
      "kakao:1016",
      "kakao:1054",
      "kakao:1046",
      "kakao:1093"
    ],
    "confirmedParticipants": [
      "kakao:1013",
      "kakao:1034",
      "kakao:1035",
      "kakao:1011",
      "kakao:1016",
      "kakao:1054",
      "kakao:1046",
      "kakao:1093"
    ],
    "description": "오산벙 (2026-09-30) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26093001-1",
        "label": "1차",
        "placeName": "경기 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1013",
          "kakao:1034",
          "kakao:1035",
          "kakao:1011",
          "kakao:1016",
          "kakao:1054",
          "kakao:1046",
          "kakao:1093"
        ],
        "payerUid": "kakao:1016",
        "cost": 160000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1013": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1034": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1035": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1011": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1016": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1054": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1046": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1093": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1013",
      "kakao:1034",
      "kakao:1035"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26092901",
    "title": "동암닭한마리벙",
    "dateOnly": "2026-09-29",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-09-29 19:00",
    "location": "서울",
    "placeDetail": "서울 인근 약속 장소",
    "hostUid": "kakao:1004",
    "treasurerUid": "kakao:1009",
    "type": "Casual",
    "status": "settled",
    "applicants": [
      "kakao:1004",
      "kakao:1009",
      "kakao:1027",
      "kakao:1015"
    ],
    "confirmedParticipants": [
      "kakao:1004",
      "kakao:1009",
      "kakao:1027",
      "kakao:1015"
    ],
    "description": "동암닭한마리벙 (2026-09-29) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26092901-1",
        "label": "1차",
        "placeName": "서울 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1004",
          "kakao:1009",
          "kakao:1027",
          "kakao:1015"
        ],
        "payerUid": "kakao:1004",
        "cost": 80000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1004": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1009": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1027": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1015": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1004",
      "kakao:1009",
      "kakao:1027"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26092801",
    "title": "종로벙",
    "dateOnly": "2026-09-28",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-09-28 19:00",
    "location": "서울",
    "placeDetail": "서울 인근 약속 장소",
    "hostUid": "kakao:1011",
    "treasurerUid": "kakao:1004",
    "type": "Casual",
    "status": "settled",
    "applicants": [
      "kakao:1011",
      "kakao:1004",
      "kakao:1015",
      "kakao:1009",
      "kakao:1037"
    ],
    "confirmedParticipants": [
      "kakao:1011",
      "kakao:1004",
      "kakao:1015",
      "kakao:1009",
      "kakao:1037"
    ],
    "description": "종로벙 (2026-09-28) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26092801-1",
        "label": "1차",
        "placeName": "서울 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1011",
          "kakao:1004",
          "kakao:1015",
          "kakao:1009",
          "kakao:1037"
        ],
        "payerUid": "kakao:1011",
        "cost": 100000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1011": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1004": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1015": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1009": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1037": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1011",
      "kakao:1004",
      "kakao:1015"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26092601",
    "title": "종로닭한마리벙",
    "dateOnly": "2026-09-26",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-09-26 19:00",
    "location": "서울",
    "placeDetail": "서울 인근 약속 장소",
    "hostUid": "kakao:1001",
    "treasurerUid": "kakao:1002",
    "type": "Casual",
    "status": "settled",
    "applicants": [
      "kakao:1004",
      "kakao:1002",
      "kakao:1035",
      "kakao:1001",
      "kakao:1056",
      "kakao:1089",
      "kakao:1018",
      "kakao:1119",
      "kakao:1010"
    ],
    "confirmedParticipants": [
      "kakao:1004",
      "kakao:1002",
      "kakao:1035",
      "kakao:1001",
      "kakao:1056",
      "kakao:1089",
      "kakao:1018",
      "kakao:1119",
      "kakao:1010"
    ],
    "description": "종로닭한마리벙 (2026-09-26) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26092601-1",
        "label": "1차",
        "placeName": "서울 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1004",
          "kakao:1002",
          "kakao:1035",
          "kakao:1001",
          "kakao:1056",
          "kakao:1089",
          "kakao:1018",
          "kakao:1119",
          "kakao:1010"
        ],
        "payerUid": "kakao:1001",
        "cost": 180000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1004": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1002": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1035": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1001": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1056": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1089": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1018": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1119": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1010": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1004",
      "kakao:1002",
      "kakao:1035"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26092602",
    "title": "광주당구벙",
    "dateOnly": "2026-09-26",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-09-26 19:00",
    "location": "광주",
    "placeDetail": "광주 인근 약속 장소",
    "hostUid": "kakao:1036",
    "treasurerUid": "kakao:1062",
    "type": "Casual",
    "status": "settled",
    "applicants": [
      "kakao:1050",
      "kakao:1062",
      "kakao:1066",
      "kakao:1036"
    ],
    "confirmedParticipants": [
      "kakao:1050",
      "kakao:1062",
      "kakao:1066",
      "kakao:1036"
    ],
    "description": "광주당구벙 (2026-09-26) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26092602-1",
        "label": "1차",
        "placeName": "광주 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1050",
          "kakao:1062",
          "kakao:1066",
          "kakao:1036"
        ],
        "payerUid": "kakao:1036",
        "cost": 80000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1050": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1062": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1066": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1036": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1050",
      "kakao:1062",
      "kakao:1066"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26092501",
    "title": "한가위벙",
    "dateOnly": "2026-09-25",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-09-25 19:00",
    "location": "서울",
    "placeDetail": "서울 인근 약속 장소",
    "hostUid": "kakao:1001",
    "treasurerUid": "kakao:1002",
    "type": "Casual",
    "status": "settled",
    "applicants": [
      "kakao:1001",
      "kakao:1002",
      "kakao:1004",
      "kakao:1097",
      "kakao:1068",
      "kakao:1132",
      "kakao:1108",
      "kakao:2001",
      "kakao:1064",
      "kakao:1010",
      "kakao:1018",
      "kakao:1009",
      "kakao:1098",
      "kakao:1089",
      "kakao:1027"
    ],
    "confirmedParticipants": [
      "kakao:1001",
      "kakao:1002",
      "kakao:1004",
      "kakao:1097",
      "kakao:1068",
      "kakao:1132",
      "kakao:1108",
      "kakao:2001",
      "kakao:1064",
      "kakao:1010",
      "kakao:1018",
      "kakao:1009",
      "kakao:1098",
      "kakao:1089",
      "kakao:1027"
    ],
    "description": "한가위벙 (2026-09-25) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26092501-1",
        "label": "1차",
        "placeName": "서울 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1001",
          "kakao:1002",
          "kakao:1004",
          "kakao:1097",
          "kakao:1068",
          "kakao:1132",
          "kakao:1108",
          "kakao:2001",
          "kakao:1064",
          "kakao:1010",
          "kakao:1018",
          "kakao:1009",
          "kakao:1098",
          "kakao:1089",
          "kakao:1027"
        ],
        "payerUid": "kakao:1001",
        "cost": 300000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1001": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1002": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1004": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1097": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1068": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1132": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1108": {
        "paid": true,
        "confirmed": true
      },
      "kakao:2001": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1064": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1010": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1018": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1009": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1098": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1089": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1027": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1001",
      "kakao:1002",
      "kakao:1004"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26092401",
    "title": "미국벙",
    "dateOnly": "2026-09-24",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-09-24 19:00",
    "location": "서울",
    "placeDetail": "서울 인근 약속 장소",
    "hostUid": "kakao:1019",
    "treasurerUid": "kakao:1133",
    "type": "Casual",
    "status": "settled",
    "applicants": [
      "kakao:1110",
      "kakao:1133",
      "kakao:1019"
    ],
    "confirmedParticipants": [
      "kakao:1110",
      "kakao:1133",
      "kakao:1019"
    ],
    "description": "미국벙 (2026-09-24) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26092401-1",
        "label": "1차",
        "placeName": "서울 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1110",
          "kakao:1133",
          "kakao:1019"
        ],
        "payerUid": "kakao:1019",
        "cost": 60000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1110": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1133": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1019": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1110",
      "kakao:1133",
      "kakao:1019"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26092402",
    "title": "전주벙",
    "dateOnly": "2026-09-24",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-09-24 19:00",
    "location": "전주",
    "placeDetail": "전주 인근 약속 장소",
    "hostUid": "kakao:1007",
    "treasurerUid": "kakao:1034",
    "type": "Casual",
    "status": "settled",
    "applicants": [
      "kakao:1013",
      "kakao:1034",
      "kakao:1007",
      "kakao:1069",
      "kakao:1002",
      "kakao:1050"
    ],
    "confirmedParticipants": [
      "kakao:1013",
      "kakao:1034",
      "kakao:1007",
      "kakao:1069",
      "kakao:1002",
      "kakao:1050"
    ],
    "description": "전주벙 (2026-09-24) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26092402-1",
        "label": "1차",
        "placeName": "전주 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1013",
          "kakao:1034",
          "kakao:1007",
          "kakao:1069",
          "kakao:1002",
          "kakao:1050"
        ],
        "payerUid": "kakao:1007",
        "cost": 120000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1013": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1034": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1007": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1069": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1002": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1050": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1013",
      "kakao:1034",
      "kakao:1007"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26092201",
    "title": "목동벙",
    "dateOnly": "2026-09-22",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-09-22 19:00",
    "location": "서울",
    "placeDetail": "서울 인근 약속 장소",
    "hostUid": "kakao:1001",
    "treasurerUid": "kakao:1004",
    "type": "Casual",
    "status": "settled",
    "applicants": [
      "kakao:1001",
      "kakao:1004",
      "kakao:1017",
      "kakao:1081",
      "kakao:1036",
      "kakao:1018",
      "kakao:1009",
      "kakao:1010"
    ],
    "confirmedParticipants": [
      "kakao:1001",
      "kakao:1004",
      "kakao:1017",
      "kakao:1081",
      "kakao:1036",
      "kakao:1018",
      "kakao:1009",
      "kakao:1010"
    ],
    "description": "목동벙 (2026-09-22) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26092201-1",
        "label": "1차",
        "placeName": "서울 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1001",
          "kakao:1004",
          "kakao:1017",
          "kakao:1081",
          "kakao:1036",
          "kakao:1018",
          "kakao:1009",
          "kakao:1010"
        ],
        "payerUid": "kakao:1001",
        "cost": 160000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1001": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1004": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1017": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1081": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1036": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1018": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1009": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1010": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1001",
      "kakao:1004",
      "kakao:1017"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26092001",
    "title": "수지구청벙",
    "dateOnly": "2026-09-20",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-09-20 19:00",
    "location": "경기",
    "placeDetail": "경기 인근 약속 장소",
    "hostUid": "kakao:1001",
    "treasurerUid": "kakao:1017",
    "type": "Casual",
    "status": "settled",
    "applicants": [
      "kakao:1061",
      "kakao:1017",
      "kakao:1010",
      "kakao:1011",
      "kakao:1001"
    ],
    "confirmedParticipants": [
      "kakao:1061",
      "kakao:1017",
      "kakao:1010",
      "kakao:1011",
      "kakao:1001"
    ],
    "description": "수지구청벙 (2026-09-20) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26092001-1",
        "label": "1차",
        "placeName": "경기 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1061",
          "kakao:1017",
          "kakao:1010",
          "kakao:1011",
          "kakao:1001"
        ],
        "payerUid": "kakao:1001",
        "cost": 100000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1061": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1017": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1010": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1011": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1001": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1061",
      "kakao:1017",
      "kakao:1010"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26091901",
    "title": "관악산등산벙",
    "dateOnly": "2026-09-19",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-09-19 19:00",
    "location": "서울",
    "placeDetail": "서울 인근 약속 장소",
    "hostUid": "kakao:1011",
    "treasurerUid": "kakao:1027",
    "type": "Casual",
    "status": "settled",
    "applicants": [
      "kakao:1011",
      "kakao:1027",
      "kakao:1015",
      "kakao:1021",
      "kakao:1018"
    ],
    "confirmedParticipants": [
      "kakao:1011",
      "kakao:1027",
      "kakao:1015",
      "kakao:1021",
      "kakao:1018"
    ],
    "description": "관악산등산벙 (2026-09-19) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26091901-1",
        "label": "1차",
        "placeName": "서울 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1011",
          "kakao:1027",
          "kakao:1015",
          "kakao:1021",
          "kakao:1018"
        ],
        "payerUid": "kakao:1011",
        "cost": 100000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1011": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1027": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1015": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1021": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1018": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1011",
      "kakao:1027",
      "kakao:1015"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26091902",
    "title": "광주파티룸벙",
    "dateOnly": "2026-09-19",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-09-19 19:00",
    "location": "광주",
    "placeDetail": "광주 인근 약속 장소",
    "hostUid": "kakao:1040",
    "treasurerUid": "kakao:1050",
    "type": "Casual",
    "status": "settled",
    "applicants": [
      "kakao:1062",
      "kakao:1050",
      "kakao:2000",
      "kakao:1100",
      "kakao:1040",
      "kakao:1059",
      "kakao:1079",
      "kakao:1008",
      "kakao:1020",
      "kakao:1026",
      "kakao:1017",
      "kakao:1057",
      "kakao:1065",
      "kakao:1069",
      "kakao:1043",
      "kakao:1036",
      "kakao:1025",
      "kakao:1066"
    ],
    "confirmedParticipants": [
      "kakao:1062",
      "kakao:1050",
      "kakao:2000",
      "kakao:1100",
      "kakao:1040",
      "kakao:1059",
      "kakao:1079",
      "kakao:1008",
      "kakao:1020",
      "kakao:1026",
      "kakao:1017",
      "kakao:1057",
      "kakao:1065",
      "kakao:1069",
      "kakao:1043",
      "kakao:1036",
      "kakao:1025",
      "kakao:1066"
    ],
    "description": "광주파티룸벙 (2026-09-19) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26091902-1",
        "label": "1차",
        "placeName": "광주 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1062",
          "kakao:1050",
          "kakao:2000",
          "kakao:1100",
          "kakao:1040",
          "kakao:1059",
          "kakao:1079",
          "kakao:1008",
          "kakao:1020",
          "kakao:1026",
          "kakao:1017",
          "kakao:1057",
          "kakao:1065",
          "kakao:1069",
          "kakao:1043",
          "kakao:1036",
          "kakao:1025",
          "kakao:1066"
        ],
        "payerUid": "kakao:1040",
        "cost": 360000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1062": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1050": {
        "paid": true,
        "confirmed": true
      },
      "kakao:2000": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1100": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1040": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1059": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1079": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1008": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1020": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1026": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1017": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1057": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1065": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1069": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1043": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1036": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1025": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1066": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1062",
      "kakao:1050",
      "kakao:2000"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26091701",
    "title": "전주커피벙",
    "dateOnly": "2026-09-17",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-09-17 19:00",
    "location": "전주",
    "placeDetail": "전주 인근 약속 장소",
    "hostUid": "kakao:1013",
    "treasurerUid": "kakao:1013",
    "type": "Casual",
    "status": "settled",
    "applicants": [
      "kakao:1002",
      "kakao:1013",
      "kakao:1031"
    ],
    "confirmedParticipants": [
      "kakao:1002",
      "kakao:1013",
      "kakao:1031"
    ],
    "description": "전주커피벙 (2026-09-17) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26091701-1",
        "label": "1차",
        "placeName": "전주 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1002",
          "kakao:1013",
          "kakao:1031"
        ],
        "payerUid": "kakao:1013",
        "cost": 60000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1002": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1013": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1031": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1002",
      "kakao:1013",
      "kakao:1031"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26091702",
    "title": "제주벙",
    "dateOnly": "2026-09-17",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-09-17 19:00",
    "location": "제주",
    "placeDetail": "제주 인근 약속 장소",
    "hostUid": "kakao:1001",
    "treasurerUid": "kakao:1035",
    "type": "Casual",
    "status": "settled",
    "applicants": [
      "kakao:1004",
      "kakao:1035",
      "kakao:1001",
      "kakao:1070",
      "kakao:1018",
      "kakao:1036",
      "kakao:1093",
      "kakao:1003",
      "kakao:1120"
    ],
    "confirmedParticipants": [
      "kakao:1004",
      "kakao:1035",
      "kakao:1001",
      "kakao:1070",
      "kakao:1018",
      "kakao:1036",
      "kakao:1093",
      "kakao:1003",
      "kakao:1120"
    ],
    "description": "제주벙 (2026-09-17) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26091702-1",
        "label": "1차",
        "placeName": "제주 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1004",
          "kakao:1035",
          "kakao:1001",
          "kakao:1070",
          "kakao:1018",
          "kakao:1036",
          "kakao:1093",
          "kakao:1003",
          "kakao:1120"
        ],
        "payerUid": "kakao:1001",
        "cost": 180000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1004": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1035": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1001": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1070": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1018": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1036": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1093": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1003": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1120": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1004",
      "kakao:1035",
      "kakao:1001"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26091601",
    "title": "부천벙",
    "dateOnly": "2026-09-16",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-09-16 19:00",
    "location": "서울",
    "placeDetail": "서울 인근 약속 장소",
    "hostUid": "kakao:1013",
    "treasurerUid": "kakao:1031",
    "type": "Casual",
    "status": "settled",
    "applicants": [
      "kakao:1041",
      "kakao:1031",
      "kakao:1020",
      "kakao:1008",
      "kakao:1013",
      "kakao:1134",
      "kakao:1009",
      "kakao:1015",
      "kakao:1034"
    ],
    "confirmedParticipants": [
      "kakao:1041",
      "kakao:1031",
      "kakao:1020",
      "kakao:1008",
      "kakao:1013",
      "kakao:1134",
      "kakao:1009",
      "kakao:1015",
      "kakao:1034"
    ],
    "description": "부천벙 (2026-09-16) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26091601-1",
        "label": "1차",
        "placeName": "서울 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1041",
          "kakao:1031",
          "kakao:1020",
          "kakao:1008",
          "kakao:1013",
          "kakao:1134",
          "kakao:1009",
          "kakao:1015",
          "kakao:1034"
        ],
        "payerUid": "kakao:1013",
        "cost": 180000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1041": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1031": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1020": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1008": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1013": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1134": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1009": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1015": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1034": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1041",
      "kakao:1031",
      "kakao:1020"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26091602",
    "title": "광주점심벙",
    "dateOnly": "2026-09-16",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-09-16 19:00",
    "location": "광주",
    "placeDetail": "광주 인근 약속 장소",
    "hostUid": "kakao:1040",
    "treasurerUid": "kakao:1002",
    "type": "Casual",
    "status": "settled",
    "applicants": [
      "kakao:1062",
      "kakao:1002",
      "kakao:1013",
      "kakao:1043",
      "kakao:1025",
      "kakao:1040"
    ],
    "confirmedParticipants": [
      "kakao:1062",
      "kakao:1002",
      "kakao:1013",
      "kakao:1043",
      "kakao:1025",
      "kakao:1040"
    ],
    "description": "광주점심벙 (2026-09-16) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26091602-1",
        "label": "1차",
        "placeName": "광주 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1062",
          "kakao:1002",
          "kakao:1013",
          "kakao:1043",
          "kakao:1025",
          "kakao:1040"
        ],
        "payerUid": "kakao:1040",
        "cost": 120000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1062": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1002": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1013": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1043": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1025": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1040": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1062",
      "kakao:1002",
      "kakao:1013"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26091201",
    "title": "사천여행벙",
    "dateOnly": "2026-09-12",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-09-12 19:00",
    "location": "서울",
    "placeDetail": "서울 인근 약속 장소",
    "hostUid": "kakao:1007",
    "treasurerUid": "kakao:1030",
    "type": "Casual",
    "status": "settled",
    "applicants": [
      "kakao:1007",
      "kakao:1030",
      "kakao:1029",
      "kakao:1079",
      "kakao:1034",
      "kakao:1025",
      "kakao:1059"
    ],
    "confirmedParticipants": [
      "kakao:1007",
      "kakao:1030",
      "kakao:1029",
      "kakao:1079",
      "kakao:1034",
      "kakao:1025",
      "kakao:1059"
    ],
    "description": "사천여행벙 (2026-09-12) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26091201-1",
        "label": "1차",
        "placeName": "서울 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1007",
          "kakao:1030",
          "kakao:1029",
          "kakao:1079",
          "kakao:1034",
          "kakao:1025",
          "kakao:1059"
        ],
        "payerUid": "kakao:1007",
        "cost": 140000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1007": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1030": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1029": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1079": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1034": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1025": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1059": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1007",
      "kakao:1030",
      "kakao:1029"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26091202",
    "title": "광주당구급벙",
    "dateOnly": "2026-09-12",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-09-12 19:00",
    "location": "광주",
    "placeDetail": "광주 인근 약속 장소",
    "hostUid": "kakao:1050",
    "treasurerUid": "kakao:1062",
    "type": "Casual",
    "status": "settled",
    "applicants": [
      "kakao:1050",
      "kakao:1062",
      "kakao:1066"
    ],
    "confirmedParticipants": [
      "kakao:1050",
      "kakao:1062",
      "kakao:1066"
    ],
    "description": "광주당구급벙 (2026-09-12) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26091202-1",
        "label": "1차",
        "placeName": "광주 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1050",
          "kakao:1062",
          "kakao:1066"
        ],
        "payerUid": "kakao:1050",
        "cost": 60000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1050": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1062": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1066": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1050",
      "kakao:1062",
      "kakao:1066"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26091101",
    "title": "인천벙",
    "dateOnly": "2026-09-11",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-09-11 19:00",
    "location": "인천",
    "placeDetail": "인천 인근 약속 장소",
    "hostUid": "kakao:1015",
    "treasurerUid": "kakao:1027",
    "type": "Casual",
    "status": "settled",
    "applicants": [
      "kakao:1015",
      "kakao:1027",
      "kakao:1009"
    ],
    "confirmedParticipants": [
      "kakao:1015",
      "kakao:1027",
      "kakao:1009"
    ],
    "description": "인천벙 (2026-09-11) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26091101-1",
        "label": "1차",
        "placeName": "인천 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1015",
          "kakao:1027",
          "kakao:1009"
        ],
        "payerUid": "kakao:1015",
        "cost": 60000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1015": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1027": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1009": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1015",
      "kakao:1027",
      "kakao:1009"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26090901",
    "title": "논현벙",
    "dateOnly": "2026-09-09",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-09-09 19:00",
    "location": "서울",
    "placeDetail": "서울 인근 약속 장소",
    "hostUid": "kakao:1001",
    "treasurerUid": "kakao:1012",
    "type": "Casual",
    "status": "settled",
    "applicants": [
      "kakao:1001",
      "kakao:1012",
      "kakao:1008",
      "kakao:1035",
      "kakao:1020",
      "kakao:1003",
      "kakao:1002",
      "kakao:1011",
      "kakao:1027",
      "kakao:1017",
      "kakao:1082",
      "kakao:1091",
      "kakao:1010",
      "kakao:1019"
    ],
    "confirmedParticipants": [
      "kakao:1001",
      "kakao:1012",
      "kakao:1008",
      "kakao:1035",
      "kakao:1020",
      "kakao:1003",
      "kakao:1002",
      "kakao:1011",
      "kakao:1027",
      "kakao:1017",
      "kakao:1082",
      "kakao:1091",
      "kakao:1010",
      "kakao:1019"
    ],
    "description": "논현벙 (2026-09-09) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26090901-1",
        "label": "1차",
        "placeName": "서울 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1001",
          "kakao:1012",
          "kakao:1008",
          "kakao:1035",
          "kakao:1020",
          "kakao:1003",
          "kakao:1002",
          "kakao:1011",
          "kakao:1027",
          "kakao:1017",
          "kakao:1082",
          "kakao:1091",
          "kakao:1010",
          "kakao:1019"
        ],
        "payerUid": "kakao:1001",
        "cost": 280000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1001": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1012": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1008": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1035": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1020": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1003": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1002": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1011": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1027": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1017": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1082": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1091": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1010": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1019": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1001",
      "kakao:1012",
      "kakao:1008"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26090601",
    "title": "건대벙",
    "dateOnly": "2026-09-06",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-09-06 19:00",
    "location": "서울",
    "placeDetail": "서울 인근 약속 장소",
    "hostUid": "kakao:1001",
    "treasurerUid": "kakao:1001",
    "type": "Casual",
    "status": "settled",
    "applicants": [
      "kakao:1010",
      "kakao:1001",
      "kakao:1008",
      "kakao:1020"
    ],
    "confirmedParticipants": [
      "kakao:1010",
      "kakao:1001",
      "kakao:1008",
      "kakao:1020"
    ],
    "description": "건대벙 (2026-09-06) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26090601-1",
        "label": "1차",
        "placeName": "서울 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1010",
          "kakao:1001",
          "kakao:1008",
          "kakao:1020"
        ],
        "payerUid": "kakao:1001",
        "cost": 80000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1010": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1001": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1008": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1020": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1010",
      "kakao:1001",
      "kakao:1008"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26090602",
    "title": "광주당구대회벙",
    "dateOnly": "2026-09-06",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-09-06 19:00",
    "location": "광주",
    "placeDetail": "광주 인근 약속 장소",
    "hostUid": "kakao:1036",
    "treasurerUid": "kakao:1062",
    "type": "Casual",
    "status": "settled",
    "applicants": [
      "kakao:1050",
      "kakao:1062",
      "kakao:1036",
      "kakao:1066"
    ],
    "confirmedParticipants": [
      "kakao:1050",
      "kakao:1062",
      "kakao:1036",
      "kakao:1066"
    ],
    "description": "광주당구대회벙 (2026-09-06) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26090602-1",
        "label": "1차",
        "placeName": "광주 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1050",
          "kakao:1062",
          "kakao:1036",
          "kakao:1066"
        ],
        "payerUid": "kakao:1036",
        "cost": 80000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1050": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1062": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1036": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1066": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1050",
      "kakao:1062",
      "kakao:1036"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26090501",
    "title": "전주벙",
    "dateOnly": "2026-09-05",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-09-05 19:00",
    "location": "전주",
    "placeDetail": "전주 인근 약속 장소",
    "hostUid": "kakao:1001",
    "treasurerUid": "kakao:1001",
    "type": "Casual",
    "status": "settled",
    "applicants": [
      "kakao:1002",
      "kakao:1001",
      "kakao:1050",
      "kakao:1013",
      "kakao:1083",
      "kakao:1011",
      "kakao:1082",
      "kakao:1069",
      "kakao:1043",
      "kakao:1062"
    ],
    "confirmedParticipants": [
      "kakao:1002",
      "kakao:1001",
      "kakao:1050",
      "kakao:1013",
      "kakao:1083",
      "kakao:1011",
      "kakao:1082",
      "kakao:1069",
      "kakao:1043",
      "kakao:1062"
    ],
    "description": "전주벙 (2026-09-05) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26090501-1",
        "label": "1차",
        "placeName": "전주 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1002",
          "kakao:1001",
          "kakao:1050",
          "kakao:1013",
          "kakao:1083",
          "kakao:1011",
          "kakao:1082",
          "kakao:1069",
          "kakao:1043",
          "kakao:1062"
        ],
        "payerUid": "kakao:1001",
        "cost": 200000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1002": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1001": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1050": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1013": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1083": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1011": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1082": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1069": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1043": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1062": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1002",
      "kakao:1001",
      "kakao:1050"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26090201",
    "title": "목포해장벙",
    "dateOnly": "2026-09-02",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-09-02 19:00",
    "location": "목포",
    "placeDetail": "목포 인근 약속 장소",
    "hostUid": "kakao:1013",
    "treasurerUid": "kakao:1059",
    "type": "Casual",
    "status": "settled",
    "applicants": [
      "kakao:1050",
      "kakao:1059",
      "kakao:1013",
      "kakao:1066"
    ],
    "confirmedParticipants": [
      "kakao:1050",
      "kakao:1059",
      "kakao:1013",
      "kakao:1066"
    ],
    "description": "목포해장벙 (2026-09-02) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26090201-1",
        "label": "1차",
        "placeName": "목포 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1050",
          "kakao:1059",
          "kakao:1013",
          "kakao:1066"
        ],
        "payerUid": "kakao:1013",
        "cost": 80000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1050": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1059": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1013": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1066": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1050",
      "kakao:1059",
      "kakao:1013"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26090202",
    "title": "제주도여행벙",
    "dateOnly": "2026-09-02",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-09-02 19:00",
    "location": "제주",
    "placeDetail": "제주 인근 약속 장소",
    "hostUid": "kakao:1008",
    "treasurerUid": "kakao:1058",
    "type": "Casual",
    "status": "settled",
    "applicants": [
      "kakao:1019",
      "kakao:1058",
      "kakao:1008"
    ],
    "confirmedParticipants": [
      "kakao:1019",
      "kakao:1058",
      "kakao:1008"
    ],
    "description": "제주도여행벙 (2026-09-02) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26090202-1",
        "label": "1차",
        "placeName": "제주 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1019",
          "kakao:1058",
          "kakao:1008"
        ],
        "payerUid": "kakao:1008",
        "cost": 60000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1019": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1058": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1008": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1019",
      "kakao:1058",
      "kakao:1008"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26090101",
    "title": "목포급벙",
    "dateOnly": "2026-09-01",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-09-01 19:00",
    "location": "목포",
    "placeDetail": "목포 인근 약속 장소",
    "hostUid": "kakao:1013",
    "treasurerUid": "kakao:1059",
    "type": "Casual",
    "status": "settled",
    "applicants": [
      "kakao:1050",
      "kakao:1059",
      "kakao:1013",
      "kakao:1066"
    ],
    "confirmedParticipants": [
      "kakao:1050",
      "kakao:1059",
      "kakao:1013",
      "kakao:1066"
    ],
    "description": "목포급벙 (2026-09-01) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26090101-1",
        "label": "1차",
        "placeName": "목포 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1050",
          "kakao:1059",
          "kakao:1013",
          "kakao:1066"
        ],
        "payerUid": "kakao:1013",
        "cost": 80000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1050": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1059": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1013": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1066": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1050",
      "kakao:1059",
      "kakao:1013"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26090102",
    "title": "대전소곱창벙",
    "dateOnly": "2026-09-01",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-09-01 19:00",
    "location": "대전",
    "placeDetail": "대전 인근 약속 장소",
    "hostUid": "kakao:1031",
    "treasurerUid": "kakao:1034",
    "type": "Casual",
    "status": "settled",
    "applicants": [
      "kakao:1031",
      "kakao:1034",
      "kakao:1030",
      "kakao:1109",
      "kakao:1029"
    ],
    "confirmedParticipants": [
      "kakao:1031",
      "kakao:1034",
      "kakao:1030",
      "kakao:1109",
      "kakao:1029"
    ],
    "description": "대전소곱창벙 (2026-09-01) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26090102-1",
        "label": "1차",
        "placeName": "대전 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1031",
          "kakao:1034",
          "kakao:1030",
          "kakao:1109",
          "kakao:1029"
        ],
        "payerUid": "kakao:1031",
        "cost": 100000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1031": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1034": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1030": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1109": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1029": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1031",
      "kakao:1034",
      "kakao:1030"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26083001",
    "title": "영등포맛술벙",
    "dateOnly": "2026-08-30",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-08-30 19:00",
    "location": "서울",
    "placeDetail": "서울 인근 약속 장소",
    "hostUid": "kakao:1001",
    "treasurerUid": "kakao:1004",
    "type": "Casual",
    "status": "settled",
    "applicants": [
      "kakao:1001",
      "kakao:1004",
      "kakao:1009",
      "kakao:1098",
      "kakao:1087",
      "kakao:1002",
      "kakao:1003",
      "kakao:1015"
    ],
    "confirmedParticipants": [
      "kakao:1001",
      "kakao:1004",
      "kakao:1009",
      "kakao:1098",
      "kakao:1087",
      "kakao:1002",
      "kakao:1003",
      "kakao:1015"
    ],
    "description": "영등포맛술벙 (2026-08-30) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26083001-1",
        "label": "1차",
        "placeName": "서울 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1001",
          "kakao:1004",
          "kakao:1009",
          "kakao:1098",
          "kakao:1087",
          "kakao:1002",
          "kakao:1003",
          "kakao:1015"
        ],
        "payerUid": "kakao:1001",
        "cost": 160000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1001": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1004": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1009": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1098": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1087": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1002": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1003": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1015": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1001",
      "kakao:1004",
      "kakao:1009"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26082901",
    "title": "대전점심벙",
    "dateOnly": "2026-08-29",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-08-29 19:00",
    "location": "대전",
    "placeDetail": "대전 인근 약속 장소",
    "hostUid": "kakao:1008",
    "treasurerUid": "kakao:1034",
    "type": "Casual",
    "status": "settled",
    "applicants": [
      "kakao:1031",
      "kakao:1034",
      "kakao:1008",
      "kakao:1020"
    ],
    "confirmedParticipants": [
      "kakao:1031",
      "kakao:1034",
      "kakao:1008",
      "kakao:1020"
    ],
    "description": "대전점심벙 (2026-08-29) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26082901-1",
        "label": "1차",
        "placeName": "대전 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1031",
          "kakao:1034",
          "kakao:1008",
          "kakao:1020"
        ],
        "payerUid": "kakao:1008",
        "cost": 80000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1031": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1034": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1008": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1020": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1031",
      "kakao:1034",
      "kakao:1008"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26082801",
    "title": "송내벙",
    "dateOnly": "2026-08-28",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-08-28 19:00",
    "location": "서울",
    "placeDetail": "서울 인근 약속 장소",
    "hostUid": "kakao:1004",
    "treasurerUid": "kakao:1004",
    "type": "Casual",
    "status": "settled",
    "applicants": [
      "kakao:1015",
      "kakao:1004",
      "kakao:1027",
      "kakao:1009",
      "kakao:1006"
    ],
    "confirmedParticipants": [
      "kakao:1015",
      "kakao:1004",
      "kakao:1027",
      "kakao:1009",
      "kakao:1006"
    ],
    "description": "송내벙 (2026-08-28) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26082801-1",
        "label": "1차",
        "placeName": "서울 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1015",
          "kakao:1004",
          "kakao:1027",
          "kakao:1009",
          "kakao:1006"
        ],
        "payerUid": "kakao:1004",
        "cost": 100000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1015": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1004": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1027": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1009": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1006": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1015",
      "kakao:1004",
      "kakao:1027"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26082802",
    "title": "대전소곱창벙",
    "dateOnly": "2026-08-28",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-08-28 19:00",
    "location": "대전",
    "placeDetail": "대전 인근 약속 장소",
    "hostUid": "kakao:1008",
    "treasurerUid": "kakao:1034",
    "type": "Casual",
    "status": "settled",
    "applicants": [
      "kakao:1031",
      "kakao:1034",
      "kakao:1030",
      "kakao:1025",
      "kakao:1008",
      "kakao:1020",
      "kakao:1052"
    ],
    "confirmedParticipants": [
      "kakao:1031",
      "kakao:1034",
      "kakao:1030",
      "kakao:1025",
      "kakao:1008",
      "kakao:1020",
      "kakao:1052"
    ],
    "description": "대전소곱창벙 (2026-08-28) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26082802-1",
        "label": "1차",
        "placeName": "대전 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1031",
          "kakao:1034",
          "kakao:1030",
          "kakao:1025",
          "kakao:1008",
          "kakao:1020",
          "kakao:1052"
        ],
        "payerUid": "kakao:1008",
        "cost": 140000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1031": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1034": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1030": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1025": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1008": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1020": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1052": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1031",
      "kakao:1034",
      "kakao:1030"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26082803",
    "title": "광주커벙",
    "dateOnly": "2026-08-28",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-08-28 19:00",
    "location": "광주",
    "placeDetail": "광주 인근 약속 장소",
    "hostUid": "kakao:1040",
    "treasurerUid": "kakao:1043",
    "type": "Casual",
    "status": "settled",
    "applicants": [
      "kakao:1036",
      "kakao:1043",
      "kakao:1040",
      "kakao:1100"
    ],
    "confirmedParticipants": [
      "kakao:1036",
      "kakao:1043",
      "kakao:1040",
      "kakao:1100"
    ],
    "description": "광주커벙 (2026-08-28) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26082803-1",
        "label": "1차",
        "placeName": "광주 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1036",
          "kakao:1043",
          "kakao:1040",
          "kakao:1100"
        ],
        "payerUid": "kakao:1040",
        "cost": 80000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1036": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1043": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1040": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1100": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1036",
      "kakao:1043",
      "kakao:1040"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26082701",
    "title": "정자벙",
    "dateOnly": "2026-08-27",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-08-27 19:00",
    "location": "서울",
    "placeDetail": "서울 인근 약속 장소",
    "hostUid": "kakao:1001",
    "treasurerUid": "kakao:1001",
    "type": "Casual",
    "status": "settled",
    "applicants": [
      "kakao:1011",
      "kakao:1001",
      "kakao:1016",
      "kakao:1082",
      "kakao:1018",
      "kakao:1017"
    ],
    "confirmedParticipants": [
      "kakao:1011",
      "kakao:1001",
      "kakao:1016",
      "kakao:1082",
      "kakao:1018",
      "kakao:1017"
    ],
    "description": "정자벙 (2026-08-27) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26082701-1",
        "label": "1차",
        "placeName": "서울 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1011",
          "kakao:1001",
          "kakao:1016",
          "kakao:1082",
          "kakao:1018",
          "kakao:1017"
        ],
        "payerUid": "kakao:1001",
        "cost": 120000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1011": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1001": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1016": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1082": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1018": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1017": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1011",
      "kakao:1001",
      "kakao:1016"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26082501",
    "title": "구디한우벙",
    "dateOnly": "2026-08-25",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-08-25 19:00",
    "location": "서울",
    "placeDetail": "서울 인근 약속 장소",
    "hostUid": "kakao:1001",
    "treasurerUid": "kakao:1007",
    "type": "Casual",
    "status": "settled",
    "applicants": [
      "kakao:1001",
      "kakao:1007",
      "kakao:1003"
    ],
    "confirmedParticipants": [
      "kakao:1001",
      "kakao:1007",
      "kakao:1003"
    ],
    "description": "구디한우벙 (2026-08-25) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26082501-1",
        "label": "1차",
        "placeName": "서울 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1001",
          "kakao:1007",
          "kakao:1003"
        ],
        "payerUid": "kakao:1001",
        "cost": 60000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1001": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1007": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1003": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1001",
      "kakao:1007",
      "kakao:1003"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26082301",
    "title": "아산커벙",
    "dateOnly": "2026-08-23",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-08-23 19:00",
    "location": "서울",
    "placeDetail": "서울 인근 약속 장소",
    "hostUid": "kakao:1037",
    "treasurerUid": "kakao:1005",
    "type": "Casual",
    "status": "settled",
    "applicants": [
      "kakao:1037",
      "kakao:1005",
      "kakao:1029",
      "kakao:1064",
      "kakao:1094",
      "kakao:1025",
      "kakao:1075",
      "kakao:1054",
      "kakao:1034"
    ],
    "confirmedParticipants": [
      "kakao:1037",
      "kakao:1005",
      "kakao:1029",
      "kakao:1064",
      "kakao:1094",
      "kakao:1025",
      "kakao:1075",
      "kakao:1054",
      "kakao:1034"
    ],
    "description": "아산커벙 (2026-08-23) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26082301-1",
        "label": "1차",
        "placeName": "서울 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1037",
          "kakao:1005",
          "kakao:1029",
          "kakao:1064",
          "kakao:1094",
          "kakao:1025",
          "kakao:1075",
          "kakao:1054",
          "kakao:1034"
        ],
        "payerUid": "kakao:1037",
        "cost": 180000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1037": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1005": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1029": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1064": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1094": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1025": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1075": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1054": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1034": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1037",
      "kakao:1005",
      "kakao:1029"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26082201",
    "title": "하남보드게임벙",
    "dateOnly": "2026-08-22",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-08-22 19:00",
    "location": "서울",
    "placeDetail": "서울 인근 약속 장소",
    "hostUid": "kakao:1014",
    "treasurerUid": "kakao:1008",
    "type": "Casual",
    "status": "settled",
    "applicants": [
      "kakao:1020",
      "kakao:1008",
      "kakao:1031",
      "kakao:1017",
      "kakao:1021",
      "kakao:1041",
      "kakao:1014"
    ],
    "confirmedParticipants": [
      "kakao:1020",
      "kakao:1008",
      "kakao:1031",
      "kakao:1017",
      "kakao:1021",
      "kakao:1041",
      "kakao:1014"
    ],
    "description": "하남보드게임벙 (2026-08-22) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26082201-1",
        "label": "1차",
        "placeName": "서울 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1020",
          "kakao:1008",
          "kakao:1031",
          "kakao:1017",
          "kakao:1021",
          "kakao:1041",
          "kakao:1014"
        ],
        "payerUid": "kakao:1014",
        "cost": 140000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1020": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1008": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1031": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1017": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1021": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1041": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1014": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1020",
      "kakao:1008",
      "kakao:1031"
    ],
    "comments": [],
    "album": []
  },
  {
    "id": "26082101",
    "title": "노란천막벙",
    "dateOnly": "2026-08-21",
    "startTime": "19:00",
    "endTime": "22:30",
    "date": "2026-08-21 19:00",
    "location": "서울",
    "placeDetail": "서울 인근 약속 장소",
    "hostUid": "kakao:1003",
    "treasurerUid": "kakao:1017",
    "type": "Casual",
    "status": "settled",
    "applicants": [
      "kakao:1014",
      "kakao:1017",
      "kakao:1019",
      "kakao:1021",
      "kakao:1003",
      "kakao:1020",
      "kakao:1008",
      "kakao:1091",
      "kakao:1032",
      "kakao:1093"
    ],
    "confirmedParticipants": [
      "kakao:1014",
      "kakao:1017",
      "kakao:1019",
      "kakao:1021",
      "kakao:1003",
      "kakao:1020",
      "kakao:1008",
      "kakao:1091",
      "kakao:1032",
      "kakao:1093"
    ],
    "description": "노란천막벙 (2026-08-21) 벙기록입니다.",
    "roundingRule": "floor100",
    "rounds": [
      {
        "id": "r-26082101-1",
        "label": "1차",
        "placeName": "서울 모임 장소",
        "mapUrl": "",
        "participants": [
          "kakao:1014",
          "kakao:1017",
          "kakao:1019",
          "kakao:1021",
          "kakao:1003",
          "kakao:1020",
          "kakao:1008",
          "kakao:1091",
          "kakao:1032",
          "kakao:1093"
        ],
        "payerUid": "kakao:1003",
        "cost": 200000,
        "receiptUrl": "",
        "isGoldenBell": false,
        "goldenBellUid": ""
      }
    ],
    "sponsorships": [],
    "manualAmounts": {},
    "paymentStatuses": {
      "kakao:1014": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1017": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1019": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1021": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1003": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1020": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1008": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1091": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1032": {
        "paid": true,
        "confirmed": true
      },
      "kakao:1093": {
        "paid": true,
        "confirmed": true
      }
    },
    "safeReturns": {},
    "likes": [
      "kakao:1014",
      "kakao:1017",
      "kakao:1019"
    ],
    "comments": [],
    "album": []
  }
];

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

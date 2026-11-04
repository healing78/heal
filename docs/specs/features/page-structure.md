# Page Structure and Navigation Specification

## Overview
Healing78 커뮤니티 관리 시스템의 전체 화면 흐름과 하위 주소 라우팅(`/`, `/meetings`, `/meetings/YYMMDD01`, `/reports`, `/ranking`, `/nickname`, `/profile`, `/login`, `/admin`), 모바일 상단 20자 내외 핵심 요약 헤더, 그리고 3종 멀티 테마(`mono`, `excel`, `rose`) 기반 리스트형 UI 규격을 정의합니다.

모든 페이지는 단일 React 코드베이스에서 PC 웹(좌측 사이드바)과 모바일 웹/앱(원형 로고 + 20자 핵심 요약 상단 헤더 + 아이콘 하단 탭바 + 구분선 리스트 뷰)에 맞게 적응형(Adaptive)으로 렌더링됩니다.

## Business Rules & Logic

### 1. Sub-Route Navigation, Guest Viewing & Onboarding Flow
- **로그인 전(Before Login) vs 로그인 후(After Login) 분리 정책:**
  - 카카오톡 채팅방에 공유된 하위 주소(`/meetings`, `/meetings/26110701`, `/reports`, `/ranking`, `/nickname` 등)를 클릭했을 때 로그인 전이라도 상단 20자 핵심 요약 헤더와 하단 탭바를 통해 해당 페이지 요약을 즉시 확인할 수 있습니다.
  - 본문(`<main>`)은 회원 개인정보 보호를 위해 로그인 전에는 공통 로그인 화면(`LoginOnboardingPage`)을 표시하고(단, `/nickname`은 비로그인 본문 전체 열람 허용), 로그인 완료 시 접속했던 하위 주소의 본문이 즉시 열립니다.
- **모바일 최상단 20자 요약 헤더 및 페이지 타이틀 동기화 (`src/core/routeMeta.js`):**
  - 각 하위 주소 및 선택된 개별 벙(`/meetings/26110701`)에 따라 브라우저 타이틀(`document.title`)과 모바일 최상단 헤더 문구를 **20자 내외 핵심 정보**(예: `1107 서울, 1108 경기`, `1107 서울 11월 강남 정기…`, `모임·개인 정산 리포트`, `1위 김민준, 2위 이서연`)로 동적 갱신합니다.
  - 상단 헤더 및 각 모임 항목의 `[공유]` 버튼 클릭 시 `20자 핵심 요약 + 하위 주소 링크`가 함께 복사·공유됩니다.
- **신규 회원 온보딩 (`/login`):**
  - 카카오 로그인 완료 후 Firestore `members` 컬렉션에 프로필이 없는 신규 회원은 자동으로 온보딩(프로필 초기 설정) 화면으로 이동합니다.
  - 입력 항목: 실명(`realName`), 거주 지역(`city`), 원정 기준 연고지(`homeCity`), 결혼 여부(`single`/`married`/`divorced`), 성별(`남`/`여`), 정산용 계좌번호(`bankAccount`, 선택).
  - 온보딩 완료 시 가입일(`MMDD`)을 기본 뱃지(`entryBadge`)로 하여 규격 닉네임이 생성되며, 별도 승인 대기 없이 즉시 **`일반회원(Member)`** 자격으로 진입합니다.

### 2. Main Navigation Structure
- **기본 6개 메뉴 (모바일 하단 아이콘 탭바 & PC 사이드바):**
  1. **홈 (`/`, `home`):** 공지/규칙, 내 프로필·닉네임·3열 요약(점수·순위·참석횟수), 진행 예정 모임 빠른 참석 및 개별 모임 상세 진입, TOP 5 랭킹 프리뷰.
  2. **모임 (`/meetings`, `/meetings/YYMMDD01`, `meetings`):** 캘린더 일정형 모임 리스트(연·월 그룹 헤더 + 좌측 요일/일자 + 세로 바 + 우측 모임 제목/오전·오후 시간대/장소 표시, 서브탭 필터 유지) 및 개별 모임 전용 상세 페이지(`/meetings/26110701` 단일 스크롤 화면).
  3. **리포트 (`/reports`, `reports`):** 모임별 정산 리포트(차수별 비용, 찬조금, 1/N 내역) 및 개인별 활동·정산 리포트(참석 모임, 누적 부담금, 총무/결제/골든벨/찬조/귀가완료 이력).
  4. **랭킹·친구 (`/ranking`, `ranking`):** 전체 누적 랭킹, 이번 달 랭킹, 지역별 친구 검색, 내 점수 적립 상세 내역.
  5. **신입닉네임 (`/nickname`, `nickname`):** 신입 회원 이름 변경 및 오픈채팅방 규격 닉네임 자동 생성·원클릭 복사 전용 페이지.
  6. **내 정보 (`/profile`, `profile`):** 프로필 및 정산용 계좌번호(`bankAccount`) 수정, 규격 닉네임 자동 갱신 및 원클릭 복사, 내 참석/뱃지 현황 및 테스트용 계정 전환기.
- **조건부 7번째 메뉴 (운영진 전용):**
  7. **운영 관리 (`/admin`, `admin`):** 로그인한 회원의 역할(`role`)이 `Leader`(방장) 또는 `Deputy`(부방장)일 때만 노출됩니다.

### 3. Page-by-Page Specifications

#### A. Home Page (`홈`)
- **공지 및 커뮤니티 규칙 배너:** 운영진이 설정한 주요 공지사항 및 닉네임/모임 규칙 요약 노출.
- **내 상태 요약 카드:** 현재 규격 닉네임(원클릭 복사 버튼 포함), 회원 등급(`role`), 누적 점수(`totalScore`), 전체 순위, 총 모임 참석 횟수(`attendanceCount`) 표시.
- **다가오는 모임 프리뷰:** 현재 모집 중인 모임 간결 카드 및 `[모임 상세·정산]`, `[참석 신청]` 버튼 제공.
- **TOP 5 랭킹 프리뷰:** 상위 5명의 닉네임과 총점 요약 및 `[랭킹 전체보기]` 이동 링크 제공.

#### B. Meetings List & Individual Meeting Detail Page (`모임`, `/meetings` & `/meetings/YYMMDD01`)
- **고유 모임 번호(`YYMMDD` + `01`) 및 전용 URL:**
  - 모임 개설 시 선택한 모임 날짜(`dateOnly`)를 기준으로 **`YYMMDD01`**(예: `26110701`, 같은 날 두 번째 모임은 `26110702`) 형식의 고유 ID가 자동 부여되며, 고유 주소 `/meetings/26110701`로 접근·공유됩니다.
- **캘린더 일정형 모임 리스트 (`/meetings`):**
  - 기존 상단 서브탭(`진행 예정`, `정산 완료`, `내 모임`)을 유지하면서 리스트를 **연·월 헤더(`2026년 10월`, `2026년 11월`)** 단위로 그룹화합니다.
  - 각 항목은 **좌측 요일·일자(`토 31`, 동일 날짜 중복 시 생략) + 중앙 세로 바(`.schedule-bar`) + 우측 모임 제목·오전/오후 시간대(`오후 7:00 - 오후 11:00`)·장소** 3열 구조로 표시하며, 정산 완료된 모임 제목은 회색(`--color-text-muted`)으로 구분합니다.
  - 항목 클릭 시 해당 모임의 전용 상세·정산 페이지(`/meetings/YYMMDD01`)로 즉시 이동합니다.
- **모임 개설 및 벙주 전체 수정 권한:**
  - 일시는 달력 날짜 선택(`type="date"`)과 시작 시간 선택(`type="time"`)으로 분리하여 입력합니다.
  - 총무(`treasurerUid`, 기본값=벙주)를 지정할 수 있으며, 장소는 **1차·2차·3차 등 차수별로 동적 추가/삭제/변경**하고 **네이버 지도·카카오맵 링크(`mapUrl`)**를 등록할 수 있습니다.
  - **벙주(`hostUid`), 총무(`treasurerUid`), 운영진(`Leader`, `Deputy`)**은 개별 벙 상세 페이지에서 모임 제목, 날짜, 시작 시간, 지역 권역, 총무, 안내글, 차수별 장소·지도 링크·비용 등 **벙에 관련된 모든 사항을 언제든 수정**할 수 있습니다.
- **7대 권역 분리 및 원정/해외 점수 규칙 (`src/core/communityRules.js`):**
  1. `서울, 경기` (인천 등 수도권 포함)
  2. `강원도`
  3. `충청남북도, 대전` (세종 포함)
  4. `전라남북도, 광주`
  5. `경상남북도, 부산` (대구, 울산 포함)
  6. `제주도`
  7. `해외`
  - **점수 산정:** 참석 기본 **`+1점`**, 회원의 연고지(`homeCity`) 권역과 모임 지역(`location`) 권역이 서로 다른 국내 타 권역(`1~6`) 이동 시 **원정 보너스 `+1점`**(총 `+2점`), 모임 권역이 **`해외(7)`**인 경우 **해외 보너스 `+2점`**(총 `+3점`)을 부여합니다.
- **개별 벙 상세 페이지 (`/meetings/YYMMDD01`) — 단일 스크롤 구성:**
  1. **상단 요약 & 전체 정보 수정 & 안심 귀가:** 일시·벙제목 강조, 벙주·총무 안내, 참석 신청 토글, 그리고 참석자가 모임 종료 후 귀가 시 누르는 **`[귀가완료 🏠]` 버튼**(`safeReturns` 실시간 시간 기록).
  2. **차수별(`1차`, `2차`, `3차`...) 장소 · 참석자 · 결제자 · 영수증/비용 관리:**
     - **차수별 참석자 체크:** 참석자 본인이 직접 각 차수 참석 여부를 선택/해제할 수 있으며, 벙주/총무가 전체 참석자의 차수별 참석 여부를 수정할 수 있습니다.
     - **차수별 결제자(`payerUid`) 및 비용/영수증 등록:** 각 차수마다 실제 결제자를 선택할 수 있으며, **결제자가 해당 차수를 선택해 직접 결제 금액(`cost`)을 입력하고 영수증 사진(`receiptUrl`, 클라이언트 자동 압축)을 첨부**할 수 있습니다 (사진 없이 금액만 입력해도 정산 정상 동작).
     - **차수별 골든벨(`isGoldenBell`, `goldenBellUid`):** 특정 회원이 해당 차수를 전액 쏜 경우 골든벨로 지정하면 해당 차수 비용은 1/N 정산 대상에서 자동 제외됩니다.
  3. **찬조금(`sponsorships`) 관리:** 현금 찬조자 및 찬조 금액을 등록하면 전체 정산 대상 총액에서 찬조금이 차감되어 참석자들의 1/N 부담금이 줄어듭니다.
  4. **정산 계좌번호 & 차수별 자동 1/N 정산표 (`calculateMeetingSettlement`):**
     - 총무(`treasurerUid`)의 입금 계좌번호 원클릭 복사 및 내 계좌번호 즉시 등록/수정란 제공.
     - 끝전 처리 방식(`100원 단위 버림`, `100원 단위 올림`, `1원 단위 반올림`) 선택 및 **벙주/총무의 개인별 금액 직접 수정(수동 오버라이드, `manualAmounts`)** 지원.
     - 총무가 아닌 결제자가 차수 비용을 선결제한 경우 해당 선결제 금액(`paidOutOfPocket`)을 자동 차감하여 **최종 송금할 금액(또는 환급받을 금액)**을 계산합니다.
     - 각 참석자는 송금 후 **`[입금 완료]`** 버튼을 누르고, 벙주/총무가 **`[입금 컨펌]`** 버튼을 눌러 정산을 마무리합니다.
  5. **최종 모임 마감 및 점수 정산:** 벙주/총무/운영진이 실참석자를 최종 확인하고 `[모임 최종 마감 · 점수 정산 완료]`를 실행하면 기본점수(`+1`)와 원정(`+1`)/해외(`+2`) 점수가 일괄 부여됩니다.

#### C. Reports Page (`리포트`, `/reports`)
- **서브 탭 구성:** `[모임별 정산 리포트 | 개인별 활동·정산 리포트]` 2개 탭으로 구성합니다.
- **모임별 정산 리포트:** 각 모임(`YYMMDD01`)의 총 지출액, 1/N 정산 대상 총액, 골든벨/찬조금 내역, 입금 컨펌 및 귀가완료 현황, 차수별 장소·결제자·비용·영수증 유무, 개인별 최종 부담금을 한눈에 조회하고 해당 벙 상세 페이지로 바로 이동할 수 있습니다.
- **개인별 활동·정산 리포트:** 선택한 회원(기본값: 로그인 본인)의 총 참석 벙 수, 누적 부담 금액, 선결제 금액, 총무/골든벨/찬조 횟수 및 모임별 참여 차수·입금 상태·귀가완료 여부를 표 형태로 제공합니다.

#### D. Ranking & Score Page (`랭킹·점수`)
- **서브 탭 구성:** `[전체 누적 랭킹 | 이번 달 랭킹 | 지역별 친구 | 내 점수 내역]` 탭으로 구성합니다.
- **점수 구성 표시:** 각 회원의 총점(`totalScore`)과 기본 참석 점수, 원정 보너스 점수, 이벤트 수동 점수 세부 내역을 표시합니다.

#### E. My Profile & Nickname Page (`내 정보`, `/profile`)
- **프로필 및 정산 계좌번호(`bankAccount`) 수정:**
  - 실명, 거주 지역, 연고지, 결혼 여부, 성별과 함께 **정산용 은행·계좌번호(`bankAccount`)**를 등록·수정할 수 있습니다.
  - **`[닉네임 원클릭 복사]`** 버튼을 제공하여 카카오톡 오픈채팅방 프로필에 바로 붙여넣을 수 있도록 지원합니다.

#### F. Admin Management Page (`운영 관리` - 방장/부방장 전용)
- 회원 역할·커스텀 뱃지 관리, 수동 이벤트 점수 부여/차감, 홈/신입 20자 공지 요약 및 커뮤니티 규칙 수정 기능을 제공합니다.

## Data Schema & API

### Updated Member Schema (`members`)
- `uid`: string (Firebase Auth / Kakao UID)
- `realName`: string (실명)
- `city`: string (거주 지역 - 닉네임 표시용)
- `homeCity`: string (연고지 - 7대 권역 원정 보너스 판별용)
- `maritalStatus`: `'single' | 'married' | 'divorced'` (미혼 `'미'`, 기혼 `'기'`, 돌싱 `'돌'`)
- `gender`: `'남' | '여'`
- `role`: `'Leader' | 'Deputy' | 'VIP' | 'Member' | 'Wanderer' | 'Withdrawn' | 'Expelled'`
- `entryBadge`: string (가입일 `'MMDD'`)
- `customBadge`: string (운영진 부여 커스텀 뱃지)
- `bankAccount`: string (개인별 정산용 은행 및 계좌번호)
- `attendanceCount`: number (정산 완료된 누적 모임 참석 횟수)
- `baseScore`: number (누적 기본 참석 점수)
- `expeditionScore`: number (누적 원정/해외 보너스 점수)
- `eventScore`: number (누적 운영진 수동 이벤트 점수)
- `totalScore`: number (`baseScore + expeditionScore + eventScore`)

### Updated Meeting Schema (`meetings`)
- `id`: string (`YYMMDD` + `01` 포맷, 예: `'26110701'`)
- `title`: string (모임 제목)
- `dateOnly`: string (`'YYYY-MM-DD'`, 달력 선택 날짜)
- `startTime`: string (`'HH:mm'`, 시작 시간)
- `date`: string (`'YYYY-MM-DD HH:mm'`)
- `location`: string (7대 권역 기준 모임 지역)
- `placeDetail`: string (1차 대표 장소명 요약)
- `hostUid`: string (벙주 UID)
- `treasurerUid`: string (총무 UID - 참석자 전원이 입금할 계좌의 주인)
- `type`: `'Official' | 'Casual'`
- `status`: `'open' | 'settled'`
- `applicants`: array of string (참석 신청자 UID 목록)
- `confirmedParticipants`: array of string (마감 확정된 실참석자 UID 목록)
- `roundingRule`: `'floor100' | 'ceil100' | 'exact'`
- `rounds`: array of Round objects (`{ id, label, placeName, mapUrl, participants, payerUid, cost, receiptUrl, isGoldenBell, goldenBellUid }`)
- `sponsorships`: array of Sponsorship objects (`{ id, uid, sponsorName, amount, note }`)
- `manualAmounts`: object (`{ [uid]: number }` - 벙주/총무 수동 금액 조정값)
- `paymentStatuses`: object (`{ [uid]: 'unpaid' | 'paid_reported' | 'confirmed' }`)
- `safeReturns`: object (`{ [uid]: 'HH:mm 완료' }`)

## Edge Cases & Validation
- **0회 참석 회원의 벙 개설 시도:** `member.attendanceCount < 1`이면서 운영진(`Leader`, `Deputy`)이 아닌 경우, UI에서 개설 모달 진입을 차단하고 안내 배너/토스트를 노출합니다.
- **중복 정산 방지:** 이미 `status === 'settled'` 상태인 모임은 재정산 버튼을 비활성화하여 점수와 참석 횟수가 중복 가산되지 않도록 보장합니다.
- **강퇴/탈퇴 회원의 접근 제어:** `role`이 `'Withdrawn'`(탈퇴자) 또는 `'Expelled'`(강퇴자)인 경우 메인 기능(참석 신청, 개설) 버튼을 비활성화하고 안내 문구를 표시합니다.

## Test Scenarios
1. **신규 가입 및 온보딩 흐름 검증:**
   - 미등록 상태로 로그인 시 온보딩 화면이 표시되고, 프로필 저장 즉시 `일반회원(Member, 참석 0회)`으로 홈 화면에 진입하는지 확인.
2. **모임 개설 자격 검증 (1회 참석 조건):**
   - 참석 횟수가 `0회`인 일반 회원이 `[+ 벙 개설]` 클릭 시 안내 문구가 뜨며 제한되고, 모임 1회 참석 정산 완료(`attendanceCount: 1`) 후에는 정상적으로 자율벙 개설 모달이 열리는지 확인.
3. **모임 마감 및 원정 점수 정산 검증:**
   - 연고지(`homeCity`)가 `'서울'`인 회원이 `'부산'` 모임에 참석 후 벙주가 `[모임 마감 · 점수 정산]`을 실행하면 기본 `+1점` + 원정 `+2점` = 총 `+3점`과 참석 횟수 `+1회`가 즉시 반영되는지 확인.
4. **운영진 조건부 메뉴 및 권한 검증:**
   - 일반 회원일 때는 하단 탭이 4개(`홈`, `모임(벙)`, `랭킹·점수`, `내 정보`)이고, `방장(Leader)` 또는 `부방장(Deputy)`일 때 5번째 `[운영 관리]` 탭이 활성화되어 역할 변경 및 수동 점수 부여가 동작하는지 확인.

# Community Management System (Heal) Specification

## Background & Motivation
힐(Heal) 커뮤니티 관리 시스템은 회원, 고유 닉네임 포맷, 역할(권한), 그리고 모임(벙) 참석 점수를 효율적으로 관리하기 위한 플랫폼입니다. 백엔드 서비스로 Firebase를 활용하며, 카카오톡을 통해 사용자 인증을 처리합니다.

## Scope & Impact
- **Member Management (회원 관리):** 역할 관리(방장, 부방장, VIP, 일반회원, 탈퇴자, 강퇴자, 방랑자 등), 커스텀 역할 설정, 엄격한 닉네임 포맷 규칙 적용.
- **Meeting Management (모임/벙 관리):** 정기 모임(공식) 및 번개 모임(자율), 참석자 추적 및 점수 부여(지역 보너스 점수 및 수동 이벤트 점수 포함).
- **Authentication (인증):** 카카오톡 OAuth 연동 (웹 및 모바일 앱 환경 통합 지원).
- **Backend (백엔드):** Firebase 생태계 활용 (데이터 저장은 Firestore, 카카오 인증은 Firebase Auth, 프론트엔드 호스팅은 Firebase Hosting, 커스텀 토큰 발급은 Firebase Cloud Functions).
- **Multi-Platform Support (멀티플랫폼 지원):** 단일 React 코드베이스를 기반으로 **PC 웹, 모바일 웹(PWA), Android, iOS** 4개 환경을 동시에 지원.

## Proposed Solution

### Data Models (Firestore)
- **members (회원)**:
  - `uid`: string (Firebase Auth UID)
  - `realName`: string (실명)
  - `city`: string (거주 도시/지역)
  - `maritalStatus`: string (결혼 여부: `'single'` = 미혼, `'married'` = 기혼, `'divorced'` = 돌싱)
  - `gender`: string (성별: `'남'` = 남성, `'여'` = 여성)
  - `role`: string (회원 등급: `Leader`, `Deputy`, `VIP`, `Member`, `Wanderer`, `Withdrawn`, `Expelled`)
  - `entryBadge`: string (가입일 기반 4자리 뱃지, 예: `'0829'`)
  - `customBadge`: string (운영진 부여 커스텀 뱃지)
  - `bankAccount`: string (개인별 정산용 은행 및 계좌번호)
  - `homeCity`: string (홈 지역/연고지 - 7대 권역 원정 보너스 계산용)
  - `attendanceCount`: number (정산 완료된 누적 모임 참석 횟수 - 1회 이상 참석 시 자율벙 개설 자격 부여)
  - `totalScore`: number (누적 점수 = 기본 참석 점수 + 원정/해외 보너스 점수 + 수동 이벤트 점수)
- **meetings (모임/벙)**:
  - `id`: string (모임 고유 ID - `YYMMDD` + `01` 형식, 예: `'26110701'`)
  - `title`: string (모임 제목)
  - `dateOnly`: string (모임 날짜 `'YYYY-MM-DD'`)
  - `startTime`: string (모임 시작 시간 `'HH:mm'`)
  - `date`: string (`'YYYY-MM-DD HH:mm'`)
  - `location`: string (7대 권역 기준 모임 지역)
  - `hostUid`: string (주최자/벙주 UID)
  - `treasurerUid`: string (총무 UID - 참석자 입금 계좌 기준)
  - `applicants`: array of uids (사전 참석 신청자 UID 목록)
  - `confirmedParticipants`: array of uids (모임 종료 후 정산 확정된 실참석자 UID 목록)
  - `rounds`: array of objects (`1차`, `2차`, `3차` 등 차수별 장소명, 네이버/카카오 지도 링크, 참석자, 결제자, 비용, 영수증 사진, 골든벨 여부)
  - `sponsorships`: array of objects (찬조자 및 찬조 금액 내역)
  - `manualAmounts`: object (벙주/총무 수동 조정 개인별 정산 금액)
  - `paymentStatuses`: object (참석자별 `'unpaid' | 'paid_reported' | 'confirmed'` 입금 상태)
  - `safeReturns`: object (참석자별 귀가완료 체크 시간)
  - `status`: string (`'open'` = 모집/진행중, `'settled'` = 마감 및 점수 정산 완료)
  - `type`: string (모임 유형: `'Official'` = 공식 모임, `'Casual'` = 자율/번개 모임)
  - `description`: string (모임 설명 및 상세 정보)

### Key Features
- **Nickname Generator (닉네임 생성기):** `이름 지역 결혼여부 성별 뱃지` 형태의 규칙화된 닉네임 생성, 원클릭 복사 및 검증 로직.
- **Individual Meeting Pages, Multi-Round Settlement & Role-Based Reports (개별 벙 전용 페이지, 다차수 1/N 정산 및 역할별 리포트 분리):**
  - 모임 개설 시 `YYMMDD01` 고유 번호와 `/meetings/YYMMDD01` 전용 페이지가 생성되며, 모임 리스트에서는 일시·벙제목과 참석자 닉네임만 간결하게 표시.
  - 차수별(`1차`, `2차`...) 동적 장소 추가 및 네이버·카카오 지도 링크 연결, 참석자 본인 체크, 결제자 직접 비용·영수증 등록, 골든벨(1/N 제외) 및 찬조금 차감, 총무 계좌 안내, `[입금 완료]` → `[입금 컨펌]`, `[귀가완료]` 기능 제공.
  - **리포트 화면 분리 및 간소화:** 기존 독립 리포트 탭을 분리하여 모임별 정산·운영 현황은 운영진 전용 `[운영 관리]` 탭 내의 **`모임 관리`** 서브탭(최신순 일시·제목·참석자 인라인 아코디언 컴팩트 카드)으로 이동하고, 개인별 정산 및 활동 내역은 `[내 정보]` 탭 내의 **`내 활동 리포트`** 서브탭으로 이동하여 개인 정보 보호 및 모바일 탭 동선을 최적화.
- **Attendance & 7-Region Scoring Logic (7대 권역 분리 및 점수 산정 로직):**
  - 7대 권역: ① `서울, 경기` ② `강원도` ③ `충청남북도, 대전` ④ `전라남북도, 광주` ⑤ `경상남북도, 부산` ⑥ `제주도` ⑦ `해외`.
  - 기본 점수: 모임 실참석 확정 시 **`+1점`** 부여.
  - 원정 및 해외 보너스 점수: 회원의 연고지(`member.homeCity`) 권역과 다른 국내 타 권역(`1~6`) 모임 참석 시 **원정 `+1점`**(총 `+2점`), **`해외(7)`** 모임 참석 시 **해외 `+2점`**(총 `+3점`) 부여.
  - 이벤트 점수: 운영진이 `[운영 관리]` 페이지에서 사유와 함께 수동으로 가감 가능.
- **Role & Page Management (역할 및 페이지 구조):** 기본 5개 메뉴(`홈`, `일정`, `랭킹·친구`, `신입닉네임`, `내 정보`)와 운영진 전용 조건부 메뉴(`운영 관리`)로 구성. 상세 화면 설계는 `docs/specs/features/page-structure.md` 문서를 참조합니다.

### Tech Stack
- **Frontend & Build:** React 18, Vite (빠른 HMR 및 PWA/Capacitor 플러그인 호환성을 위한 모던 번들러).
- **Multi-Platform & Packaging:**
  - **PC & Mobile Web:** 반응형 웹(Responsive Web) 및 PWA(Progressive Web App).
  - **Android & iOS:** Capacitor(`@capacitor/core`, `@capacitor/cli`) 기반 하이브리드 네이티브 패키징.
- **Backend & Database:** Firebase Firestore, Firebase Cloud Functions, Firebase Hosting.
- **Authentication:** Firebase Auth + Kakao Custom Auth (Cloud Functions를 통한 커스텀 토큰 발급).
- **Styling:** Vanilla CSS (CSS Variables, Media Queries, Safe Area Insets 적용).

### Multi-Platform Strategy
- **Single Codebase Approach:** 반응형 React 웹 + Capacitor 하이브리드 패키징 방식을 채택하여, 1벌의 UI/비즈니스 코드로 PC 웹, 모바일 웹, Android(Google Play), iOS(App Store)를 동시에 대응합니다.
- **Adaptive UX by User Role:**
  - **PC Web (운영진/관리 중심):** 좌측 사이드바 네비게이션과 다중 컬럼 테이블 뷰를 제공하여 전체 회원 명단, 닉네임 규격 준수 여부, 점수 가감을 한눈에 관리합니다.
  - **Mobile Web & Native App (일반 회원/참여 중심):** 상단 헤더 + 하단 고정 탭바(Bottom Navigation)와 카드형 리스트를 제공하여 카카오톡 링크 진입이나 앱 실행 시 빠른 모임 참석 및 내 점수 확인을 지원합니다.
- **Headless Business Layer:** 닉네임 생성/검증(`src/nicknameUtils.js`) 및 점수 계산 로직은 UI 프레임워크나 플랫폼에 종속되지 않는 순수 모듈로 분리합니다.
- 상세 설계는 `docs/specs/features/multi-platform-architecture.md` 문서를 참조합니다.

## Roadmap & Implementation Phases

### Phase 1: Environment & Multi-Platform Foundation
1. Vite 기반 React 빌드 환경 및 PWA/Capacitor 멀티플랫폼 설정 초기화.
2. PC(사이드바) / 모바일(하단 탭바 + Safe Area) 적응형 `AppLayout` 구축.
3. Firebase 프로젝트 초기화 및 카카오 로그인 커스텀 토큰 연동 환경 구성.
4. Firestore 보안 규칙(Security Rules) 정의.

### Phase 2: Member & Nickname Logic
1. Member 데이터 스키마 구현.
2. 닉네임 포맷 제안 및 검증 유틸리티 구현.
3. 역할(Role) 관리 UI 구축 (PC 테이블 뷰 및 모바일 카드 뷰 대응).

### Phase 3: Meeting Management & Native Packaging
1. 모임(벙) 개설 및 기록 시스템 구현.
2. 점수 계산 로직 구현 (Cloud Functions 트리거 또는 클라이언트 서비스).
3. 참석 이력 및 랭킹 조회 화면 구축.
4. Capacitor 기반 Android/iOS 네이티브 빌드 및 푸시 알림(FCM) 연동.

## Verification & Testing
- 닉네임 포맷 생성 및 유효성 검사 단위 테스트(Unit Tests).
- 지역 보너스를 포함한 점수 산정 로직 통합 테스트(Integration Tests).
- 카카오 로그인 및 커스텀 토큰 발급 플로우 검증.

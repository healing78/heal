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
  - `maritalStatus`: string (결혼 여부: 'M' = 기혼, 'S' = 미혼, 'D' = 돌싱)
  - `gender`: string (성별: 'M' = 남성, 'F' = 여성)
  - `role`: string (회원 등급: Leader, Deputy, VIP, Member 등)
  - `badge`: string (참석 횟수 또는 가입일 기반 뱃지/이모지, 예: '0829')
  - `entryDate`: timestamp (가입일자)
  - `homeCity`: string (홈 지역/연고지 - 원정/지역 보너스 계산용)
  - `attendanceCount`: number (정산 완료된 누적 모임 참석 횟수 - 1회 이상 참석 시 자율벙 개설 자격 부여)
  - `totalScore`: number (누적 점수 = 기본 참석 점수 + 원정 보너스 점수 + 수동 이벤트 점수)
- **meetings (모임/벙)**:
  - `id`: string (모임 고유 ID)
  - `title`: string (모임 제목)
  - `date`: timestamp (모임 일시)
  - `location`: string (모임 장소/지역)
  - `hostUid`: string (주최자/벙주 Firebase UID)
  - `applicants`: array of uids (사전 참석 신청자 UID 목록)
  - `confirmedParticipants`: array of uids (모임 종료 후 정산 확정된 실참석자 UID 목록)
  - `status`: string (`'open'` = 모집/진행중, `'settled'` = 마감 및 점수 정산 완료)
  - `type`: string (모임 유형: `'Official'` = 공식 모임, `'Casual'` = 자율/번개 모임)
  - `description`: string (모임 설명 및 상세 정보)

### Key Features
- **Nickname Generator (닉네임 생성기):** `이름 지역 결혼여부 성별 뱃지` 형태의 규칙화된 닉네임 생성, 원클릭 복사 및 검증 로직.
- **Meeting Creation & Attendance Settlement (모임 개설 및 2단계 정산 로직):**
  - 모임 개설 자격: **모임(벙)에 1회 이상 참석한 회원(`attendanceCount >= 1`)** 또는 운영진(`Leader`, `Deputy`)만 모임 개설 가능 (공식 모임은 운영진 전용).
  - 2단계 정산: 회원들이 먼저 `[참석 신청]`을 하고, 모임 종료 후 벙주(개설자) 또는 운영진이 실참석자를 체크하여 `[모임 마감 · 점수 정산]`을 실행하면 점수와 참석 횟수가 일괄 반영됨.
- **Attendance & Scoring Logic (참석 및 점수 산정 로직):**
  - 기본 점수: 모임 실참석 확정 시 1점 부여.
  - 지역 보너스 점수: 모임 장소(`meeting.location`)가 회원의 연고지(`member.homeCity`)와 다를 경우 원정 보너스 +2점 부여.
  - 이벤트 점수: 운영진이 `[운영 관리]` 페이지에서 사유와 함께 수동으로 가감 가능.
- **Role & Page Management (역할 및 페이지 구조):** 기본 4개 메뉴(`홈`, `모임(벙)`, `랭킹·점수`, `내 정보`)와 운영진 전용 조건부 메뉴(`운영 관리`)로 구성. 상세 화면 설계는 `docs/specs/features/page-structure.md` 문서를 참조합니다.

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

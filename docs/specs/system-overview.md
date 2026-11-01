# Community Management System (Heal) Specification

## Background & Motivation
힐(Heal) 커뮤니티 관리 시스템은 회원, 고유 닉네임 포맷, 역할(권한), 그리고 모임(벙) 참석 점수를 효율적으로 관리하기 위한 플랫폼입니다. 백엔드 서비스로 Firebase를 활용하며, 카카오톡을 통해 사용자 인증을 처리합니다.

## Scope & Impact
- **Member Management (회원 관리):** 역할 관리(방장, 부방장, VIP, 일반회원, 탈퇴자, 강퇴자, 방랑자 등), 커스텀 역할 설정, 엄격한 닉네임 포맷 규칙 적용.
- **Meeting Management (모임/벙 관리):** 정기 모임(공식) 및 번개 모임(자율), 참석자 추적 및 점수 부여(지역 보너스 점수 및 수동 이벤트 점수 포함).
- **Authentication (인증):** 카카오톡 OAuth 연동.
- **Backend (백엔드):** Firebase 생태계 활용 (데이터 저장은 Firestore, 카카오 인증은 Firebase Auth, 프론트엔드 호스팅은 Firebase Hosting, 커스텀 토큰 발급은 Firebase Cloud Functions).

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
  - `totalScore`: number (누적 점수)
- **meetings (모임/벙)**:
  - `id`: string (모임 고유 ID)
  - `date`: timestamp (모임 일시)
  - `location`: string (모임 장소/지역)
  - `hostUid`: string (주최자/벙주 Firebase UID)
  - `participants`: array of uids (참석자 UID 목록)
  - `type`: string (모임 유형: 'Official' = 공식 모임, 'Casual' = 자율/번개 모임)
  - `description`: string (모임 설명 및 상세 정보)

### Key Features
- **Nickname Generator (닉네임 생성기):** `이름 지역 결혼여부 성별 뱃지` 형태의 규칙화된 닉네임 생성 및 검증 로직.
- **Attendance & Scoring Logic (참석 및 점수 산정 로직):**
  - 기본 점수: 모임 참석당 1점 부여.
  - 지역 보너스 점수: 모임 장소(`meeting.location`)가 회원의 연고지(`member.homeCity`)와 다를 경우 원정 보너스 +2점 부여.
  - 이벤트 점수: 운영진이 수동으로 가감 가능.
- **Role Management (역할 관리):** 동적 역할 목록 및 권한 설정.

### Tech Stack
- **Frontend:** React (풍부한 생태계와 컴포넌트 재사용성을 위한 메인 프레임워크).
- **Backend & Database:** Firebase Firestore, Firebase Cloud Functions.
- **Authentication:** Firebase Auth + Kakao Custom Auth (Cloud Functions를 통한 커스텀 토큰 발급).
- **Styling:** Vanilla CSS.

## Roadmap & Implementation Phases

### Phase 1: Environment Setup
1. Firebase 프로젝트 초기화.
2. 카카오 로그인을 위한 Firebase Auth 커스텀 토큰 연동 환경 구성.
3. Firestore 보안 규칙(Security Rules) 정의.

### Phase 2: Member & Nickname Logic
1. Member 데이터 스키마 구현.
2. 닉네임 포맷 제안 및 검증 유틸리티 구현.
3. 역할(Role) 관리 UI 구축.

### Phase 3: Meeting Management
1. 모임(벙) 개설 및 기록 시스템 구현.
2. 점수 계산 로직 구현 (Cloud Functions 트리거 또는 클라이언트 서비스).
3. 참석 이력 및 랭킹 조회 화면 구축.

## Verification & Testing
- 닉네임 포맷 생성 및 유효성 검사 단위 테스트(Unit Tests).
- 지역 보너스를 포함한 점수 산정 로직 통합 테스트(Integration Tests).
- 카카오 로그인 및 커스텀 토큰 발급 플로우 검증.

# Kakao OAuth Authentication Specification

## Overview
힐(Heal) 커뮤니티 관리 시스템의 **카카오 로그인(Kakao OAuth) 인증 흐름**, **기존 회원 자동 로그인 및 미등록 신규 회원 온보딩 분기 처리**, 그리고 **Kakao Developers 콘솔 설정 규격**을 정의합니다.

Firebase 무료 플랜(Spark)과 유료 플랜(Blaze + Cloud Functions) 모두에서 중단 없이 동작하도록 **Kakao JavaScript SDK 클라이언트 인증 + 선택적 Firebase Custom Token 발급 하이브리드 구조**를 채택합니다.

## Business Rules & Logic

### 1. Kakao Login & Onboarding Routing Flow
1. **기본 세션 정책 (Unauthenticated by Default):**
   - 브라우저 로컬 스토리지에 유효한 회원 UID가 저장되어 있지 않은 첫 접속자는 **비로그인(Guest) 상태(`currentUser = null`)**로 시작합니다.
   - 첫 진입 시 임의의 데모 계정으로 자동 로그인되지 않으며, 공통 로그인/온보딩 화면(`LoginOnboardingPage`)으로 진입합니다.
2. **카카오 인증 단일 진입로 (`Single Login CTA`):**
   - 첫 화면의 별도 '신입 등록' 버튼을 제거하고 **`[카카오 로그인]` 단일 진입로**로 통일합니다.
   - 사용자가 `[카카오 로그인]`을 누르면 Kakao JS SDK(`Kakao.Auth.login`)를 통해 카카오 고유 식별자(`kakao:${id}`)와 닉네임을 조회합니다.
3. **선택적 Cloud Functions 커스텀 토큰 연동:**
   - Firebase Cloud Functions(`kakaoCustomAuth`)가 배포된 환경에서는 카카오 액세스 토큰을 전달해 Firebase Custom Token으로 `signInWithCustomToken`을 수행합니다.
   - 무료(Spark) 플랜 환경에서는 Cloud Functions 호출 실패 시에도 에러 없이 카카오 고유 UID(`kakao:${id}`) 세션으로 즉시 폴백하여 동작합니다.
4. **기존 회원 vs 신규 회원 자동 분기:**
   - Firestore `members` 컬렉션에 `uid === "kakao:${id}"` 문서가 **이미 존재하는 경우**: 즉시 해당 회원으로 로그인 완료 처리하고 `[홈]` 화면으로 이동합니다.
   - Firestore `members` 컬렉션에 해당 `uid` 문서가 **없는 경우(미등록 신규 회원)**: 카카오 인증 정보를 유지한 채 자동으로 **신규 회원 프로필 등록(`step = 'onboarding'`)** 폼으로 전환됩니다.
5. **기존회원 감지(승계 제안) vs 기존회원 경고(동일명 차단):**
   - **이름 규칙 검증:** 활동 닉네임은 **한글 1자 이상 3자 이하**여야 합니다 (정규식: `/^[가-힣]{1,3}$/`).
   - **기존회원 감지 (이력 승계 제안):**
     - 카카오 미연동 상태의 과거 활동 이력 회원(`kakao:10*` 가계정)과 이름이 일치하면 닉네임 필드 아래에 승계 카드(`💡 혹시 이전에 활동하셨던 [이름] 님이신가요? 과거 벙 활동 기록(총 N점, 참석 N회)을 이 카카오 계정으로 연결 신청하시겠습니까?`)가 표시됩니다.
     - 사용자가 `[⚡ 네, 기존 활동 이력 연결 신청하기]`를 누르면 기존 점수/참석 이력이 해당 카카오 계정으로 연결 신청됩니다 (본인 계정 승계로 인정되어 중복 제한 예외).
   - **기존회원 경고 (가입 차단):**
     - 승계 신청을 하지 않은 순수 신규 가입자인데 모임에 이미 존재하는 이름이거나, 이미 다른 실사용자가 사용 중인 이름인 경우 동명이인 불가 원칙에 따라 `⚠️ 이미 등록된 이름이므로 다른 이름(한글 1~3자)을 사용해 주세요` 경고와 함께 `[저장 후 입장]`이 엄격히 차단됩니다.
6. **필수 입력값 검증:**
   - 한글 1~3자의 유일한 이름, 거주 지역(기본값 수원), 결혼 여부, 성별이 모두 유효하게 입력되지 않으면 `[저장 후 입장]` 버튼이 비활성화(`disabled`)됩니다.

### 2. Kakao Developers Console Required Settings (필수 콘솔 설정 3가지)
발급받은 JavaScript 키(`VITE_KAKAO_JS_KEY`)로 브라우저에서 카카오 로그인이 정상 동작하려면 [Kakao Developers](https://developers.kakao.com/) 내 애플리케이션 설정에서 아래 3가지가 반드시 설정되어 있어야 합니다.

1. **웹 플랫폼 도메인 등록:**
   - 좌측 메뉴 **`[앱 설정] → [플랫폼]`** (또는 **`[앱] → [플랫폼 키] / [일반]`** 하위 Web 플랫폼 등록) 이동
   - **[Web 플랫폼 등록]** 클릭 → 사이트 도메인에 아래 주소 등록:
     - `http://localhost:3000`
     - `http://172.30.1.29:3000` (동일 Wi-Fi 모바일 테스트용)
     - `https://healing78.web.app` (추후 Firebase Hosting 배포 도메인)
2. **카카오 로그인 활성화 설정 ON:**
   - 좌측 메뉴 **`[제품 설정] → [카카오 로그인]`** 이동
   - **활성화 설정**의 상태를 **`ON`**으로 변경
   - 하단 **Redirect URI**에 `http://localhost:3000` 추가 등록
3. **동의항목 설정:**
   - 좌측 메뉴 **`[제품 설정] → [카카오 로그인] → [동의항목]`** 이동
   - `닉네임 (profile_nickname)` 항목을 **선택 동의**(또는 필수 동의)로 설정

## Data Schema & API

### Kakao Auth Profile Response (`src/services/kakaoAuthService.js`)
```javascript
/**
 * @typedef {Object} KakaoAuthResult
 * @property {string} uid - Firebase/Firestore 표준 회원 UID (예: 'kakao:381920391')
 * @property {string} kakaoId - 카카오 원본 숫자 ID 문자열
 * @property {string} nickname - 카카오톡 프로필 닉네임
 * @property {string} accessToken - 카카오 OAuth 액세스 토큰
 */
```

## Edge Cases & Validation
- **도메인 미등록(`KOE006` / `KOE101`) 또는 카카오 로그인 미활성화(`KOE004`) 에러:**
  - 사용자가 Kakao Developers 콘솔에서 아직 `http://localhost:3000` 도메인 등록이나 활성화 `ON` 스위치를 켜지 않은 상태에서 로그인을 시도할 경우, 화면에 구체적인 해결 방법을 안내 배너로 표시합니다.
- **팝업 차단 브라우저 대응:**
  - 모바일 인앱 브라우저 등에서 팝업이 차단된 경우 사용자에게 팝업 허용 안내를 표시하거나 온보딩 체험 모드로 즉시 진입할 수 있는 보조 버튼을 함께 제공합니다.

## Test Scenarios
1. **신규 카카오 계정 최초 로그인 검증:**
   - `[카카오 계정으로 로그인]` 클릭 → 카카오 인증 완료 → `members`에 없는 신규 `kakao:${id}`인 경우 자동으로 온보딩(프로필 설정) 폼으로 이동하는지 확인.
   - 온보딩 폼 입력 완료 후 저장 시 Firestore `members` 컬렉션에 `kakao:${id}` 문서가 생성되고 `일반회원(Member)`으로 입장하는지 확인.
2. **재로그인 시 즉시 입장 검증:**
   - 이미 온보딩을 마친 동일 카카오 계정으로 다시 로그인했을 때 온보딩 화면을 건너뛰고 바로 `[홈]` 화면으로 진입하는지 확인.

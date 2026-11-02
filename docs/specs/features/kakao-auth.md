# Kakao OAuth Authentication Specification

## Overview
힐(Heal) 커뮤니티 관리 시스템의 **카카오 로그인(Kakao OAuth) 인증 흐름**, **기존 회원 자동 로그인 및 미등록 신규 회원 온보딩 분기 처리**, 그리고 **Kakao Developers 콘솔 설정 규격**을 정의합니다.

Firebase 무료 플랜(Spark)과 유료 플랜(Blaze + Cloud Functions) 모두에서 중단 없이 동작하도록 **Kakao JavaScript SDK 클라이언트 인증 + 선택적 Firebase Custom Token 발급 하이브리드 구조**를 채택합니다.

## Business Rules & Logic

### 1. Kakao Login & Onboarding Routing Flow
1. **카카오 인증 요청 (`loginWithKakao`):**
   - 사용자가 로그인 화면에서 `[카카오 계정으로 로그인]` 버튼을 클릭하면 Kakao JS SDK(`Kakao.Auth.login`) 팝업을 통해 카카오 계정 인증을 수행합니다.
   - 인증 성공 후 `Kakao.API.request({ url: '/v2/user/me' })`를 호출하여 카카오 고유 ID(`id`)와 기본 프로필 닉네임을 조회합니다.
   - 회원의 시스템 고유 식별자(`uid`)는 **`kakao:${id}`** 형식으로 생성합니다.
2. **선택적 Cloud Functions 커스텀 토큰 연동:**
   - Firebase Cloud Functions(`kakaoCustomAuth`)가 배포된 환경에서는 카카오 액세스 토큰을 전달해 Firebase Custom Token으로 `signInWithCustomToken`을 수행합니다.
   - 무료(Spark) 플랜 환경에서는 Cloud Functions 호출 실패 시에도 에러 없이 카카오 고유 UID(`kakao:${id}`) 세션으로 즉시 폴백하여 동작합니다.
3. **기존 회원 vs 신규 회원 자동 분기:**
   - Firestore `members` 컬렉션에 `uid === "kakao:${id}"` 문서가 **이미 존재하는 경우**: 즉시 해당 회원으로 로그인 완료 처리하고 `[홈]` 화면으로 이동합니다.
   - Firestore `members` 컬렉션에 해당 `uid` 문서가 **없는 경우(미등록 신규 회원)**: 자동으로 **신규 회원 온보딩(`/onboarding`)** 화면으로 전환하며, 카카오 프로필 이름을 기본값으로 채워주고 온보딩 완료 시 `members/kakao:${id}` 문서를 생성합니다.

### 2. Kakao Developers Console Required Settings (필수 콘솔 설정 3가지)
발급받은 JavaScript 키(`VITE_KAKAO_JS_KEY`)로 브라우저에서 카카오 로그인이 정상 동작하려면 [Kakao Developers](https://developers.kakao.com/) 내 애플리케이션 설정에서 아래 3가지가 반드시 설정되어 있어야 합니다.

1. **웹 플랫폼 도메인 등록:**
   - 좌측 메뉴 **`[앱 설정] → [플랫폼]`** (또는 **`[앱] → [플랫폼 키] / [일반]`** 하위 Web 플랫폼 등록) 이동
   - **[Web 플랫폼 등록]** 클릭 → 사이트 도메인에 아래 주소 등록:
     - `http://localhost:3000`
     - `http://172.30.1.29:3000` (동일 Wi-Fi 모바일 테스트용)
     - `https://heal-community-d09d7.web.app` (추후 Firebase Hosting 배포 도메인)
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

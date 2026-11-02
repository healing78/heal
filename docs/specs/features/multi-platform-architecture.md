# Multi-Platform Architecture Specification

## Overview
힐(Heal) 커뮤니티 관리 시스템을 **PC 웹, 모바일 웹(PWA), Android, iOS** 4개 플랫폼에서 단일 코드베이스로 운영하기 위한 멀티플랫폼 아키텍처 명세서입니다.

본 프로젝트는 고사양 그래픽이나 하드웨어 센서 제어보다 **회원/닉네임 관리, 모임(벙) 개설 및 참석, 점수 산정/랭킹 조회, 카카오톡 인증 연동**이 핵심이므로, **반응형 React 웹(Vite) + PWA + Capacitor 하이브리드 패키징(방식 1)** 구조를 채택합니다.

## Architecture Comparison & Decision Rationale

### Candidate Approaches
| 항목 | ① 반응형 React 웹 + Capacitor (채택 ⭐) | ② React Native (Expo) 통합 빌드 | ③ Monorepo (Web / App 분리) |
| :--- | :--- | :--- | :--- |
| **핵심 개념** | 하나의 React 웹을 반응형으로 구축 후 Capacitor로 Android/iOS 앱 패키징 | Expo로 앱을 개발하고 `react-native-web`으로 웹 동시 추출 | 비즈니스 로직만 공유하고 Web과 App UI를 각각 별도 개발 |
| **기존 스택 호환성** | **100% 유지** (React + Vanilla CSS 그대로 사용) | **변경 필요** (RN 컴포넌트 및 StyleSheet 문법 필요) | **일부 유지** (공통 유틸만 재사용) |
| **PC / 모바일 웹 완성도** | **매우 높음** (운영진용 테이블/대시보드 구현 용이) | 보통 (PC 대화면 및 웹 전용 레이아웃 구성이 번거로움) | 매우 높음 |
| **네이티브 앱 체감** | 양호 (모바일 전용 하단 탭/Safe Area 적용 시 앱과 유사) | 매우 높음 | 매우 높음 |
| **개발 및 유지보수 비용** | **가장 낮음 (단일 UI 코드베이스)** | 낮음~보통 | 높음 (UI 이중 개발) |

### Reasons for Selecting Approach 1
1. **운영진(PC)과 일반 회원(모바일)의 사용성 동시 충족:**
   - **운영진(방장/부방장):** PC 웹 대화면에서 전체 회원 명단, 닉네임 규격 위반 여부, 수동 이벤트 점수 가감을 테이블(Table) 형태로 관리하기에 표준 HTML/CSS가 가장 유리합니다.
   - **일반 회원:** 카카오톡 단톡방 링크를 통한 모바일 웹 즉시 접속(무설치)과 스토어 앱 설치(Android/iOS) 환경을 모두 동일한 화면으로 제공할 수 있습니다.
2. **점진적 배포 및 유지보수 효율성:**
   - 초기에는 PC/모바일 웹 및 PWA로 즉시 배포하여 사용성을 검증하고, 동일한 빌드 산출물(`dist/`)을 Capacitor로 감싸 Google Play(Android) 및 App Store(iOS)에 출시할 수 있습니다.
   - UI 수정이나 기능 추가 시 웹 배포만으로 PC/모바일 웹에 즉시 반영되며, 스토어 앱과도 100% 동일한 코드가 유지됩니다.

## Business Rules & Logic

### 1. Headless Business Logic Separation
- UI 컴포넌트(`src/components/`, `src/pages/`)와 도메인 비즈니스 로직(`src/nicknameUtils.js`, `src/core/`, `src/services/`)을 엄격히 분리합니다.
- 닉네임 생성/검증, 지역 원정 보너스(+2점) 계산, 역할 권한 판별 로직은 DOM이나 브라우저 API에 의존하지 않는 순수 JavaScript 함수로 작성합니다.

### 2. Adaptive Layout System (PC vs Mobile)
- **Viewport Breakpoint:** `768px`을 기준으로 데스크톱(PC)과 모바일(Mobile Web / Android / iOS) 레이아웃을 분기합니다.
- **PC Layout (`>= 768px`):**
  - 좌측 고정 사이드바(`Sidebar Navigation`) + 우측 메인 콘텐츠 영역.
  - 회원 목록 및 점수 이력을 다중 컬럼 테이블(Table)과 필터 바 형태로 표시.
- **Mobile & App Layout (`< 768px`):**
  - 상단 고정 앱 바(`Top Header`) + 중앙 스크롤 영역 + 하단 고정 탭바(`Bottom Navigation`: 홈/랭킹, 모임(벙), 닉네임 도구, 회원/관리).
  - 테이블 대신 터치 친화적인 카드 리스트(Card View) 형태로 데이터를 표시.
- **Native App Safe Area & Touch UX:**
  - iOS 노치(Notch), 다이내믹 아일랜드 및 하단 홈 인디케이터 영역 침범을 방지하기 위해 `viewport-fit=cover`와 CSS `env(safe-area-inset-top)`, `env(safe-area-inset-bottom)` 여백을 기본 적용합니다.
  - 모바일 앱 환경에서 불필요한 텍스트 드래그 선택(`user-select: none`) 및 탭 하이라이트(`-webkit-tap-highlight-color: transparent`)를 제어하여 네이티브 앱과 유사한 조작감을 제공합니다.

### 3. Platform-Aware Authentication & Native Capabilities
- **Environment Detection:** `Capacitor.isNativePlatform()`을 통해 현재 실행 환경이 웹 브라우저(`web`)인지 네이티브 앱(`android`, `ios`)인지 판별합니다.
- **Kakao OAuth Flow:**
  - **Web (PC & Mobile Web):** Kakao JavaScript SDK(또는 OAuth Redirect)를 통해 인가 코드 및 액세스 토큰을 획득한 뒤 Firebase Cloud Functions(`kakaoCustomAuth`)를 호출합니다.
  - **Native App (Android & iOS):** Capacitor 인앱 브라우저 또는 카카오톡 네이티브 로그인 플러그인을 통해 액세스 토큰을 획득한 뒤 동일한 `kakaoCustomAuth` 함수를 호출하여 Firebase Custom Token으로 로그인합니다.
- **Push Notifications:**
  - 모바일 웹/PC는 Firebase Cloud Messaging(FCM) Web Push를 사용하고, Android/iOS 앱은 `@capacitor/push-notifications` 플러그인을 통해 기기 토큰을 등록합니다.

### 4. Build Tooling Modernization (CRA to Vite)
- 지원이 종료된 `react-scripts`(Create React App) 대신 **Vite**를 메인 번들러로 사용하여 빠른 개발 서버 구동(HMR)과 Capacitor/PWA 정적 빌드(`dist/`) 호환성을 확보합니다.

## Data Schema & API

### Capacitor Configuration (`capacitor.config.json`)
- `appId`: `com.heal.community`
- `appName`: `Heal`
- `webDir`: `dist` (Vite 빌드 출력 디렉토리와 일치)
- `server.androidScheme`: `https` (Firebase Auth 및 쿠키/스토리지 정책 호환성 보장)

### Client Platform Context Interface
```javascript
/**
 * 플랫폼 실행 환경 정보 규격
 * @typedef {Object} PlatformInfo
 * @property {'web' | 'android' | 'ios'} platform - 현재 실행 플랫폼
 * @property {boolean} isNative - Capacitor 네이티브 앱 실행 여부
 * @property {boolean} isMobileViewport - 화면 너비 768px 미만 여부
 */
```

## Edge Cases & Validation
- **iOS WebView 쿠키/스토리지 초기화 문제:** iOS WKWebView 환경에서 Firebase Auth 세션이 유지되도록 `indexedDBLocalPersistence`를 우선 사용하고, Capacitor `androidScheme`/`iosScheme` 설정을 표준으로 유지합니다.
- **카카오톡 인앱 브라우저 진입 대응:** 사용자가 카카오톡 채팅방에서 링크를 클릭해 진입한 경우(KakaoTalk In-App Browser), 상단/하단 브라우저 툴바로 인한 높이 변화를 고려하여 `100vh` 대신 `100dvh`(Dynamic Viewport Height)를 기본 높이 단위로 사용합니다.
- **화면 회전 및 창 크기 변경:** 태블릿이나 PC 브라우저 창 크기를 실시간으로 조절할 때도 `matchMedia('(max-width: 767px)')` 리스너를 통해 레이아웃과 데이터가 유실 없이 즉시 전환되어야 합니다.

## Test Scenarios
1. **반응형 레이아웃 전환 검증:**
   - 브라우저 폭이 `1024px`일 때 좌측 사이드바가 표시되고 하단 탭바는 숨겨지는지 확인.
   - 브라우저 폭이 `375px`(모바일 규격)일 때 좌측 사이드바가 숨겨지고 상단 헤더와 하단 고정 탭바가 표시되는지 확인.
2. **비즈니스 로직 독립성 검증:**
   - `src/nicknameUtils.js`의 `generateNickname` 및 `suggestNewMemberNickname` 함수가 플랫폼에 관계없이 동일한 결과를 반환하는지 확인.
3. **빌드 및 Capacitor 동기화 검증:**
   - `npm run build` 실행 시 `dist/` 디렉토리에 정적 에셋과 `manifest.json`이 정상 생성되며, `npx cap sync` 실행 시 `webDir: "dist"`를 참조할 수 있는지 확인.

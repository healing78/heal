# Development Workflow and Local Verification Guide

## Overview
힐(Heal) 커뮤니티 관리 시스템의 **일상적인 기능 개발 프로세스**, **전체 마일스톤 로드맵**, 그리고 **Step 2(로컬 구동 및 권한/기능별 검증·튜닝) 실행 가이드**를 정의한 문서입니다.

## Business Rules & Logic

### 1. Daily 4-Step Development Cycle
모든 기능 추가 및 수정은 아래 4단계 사이클을 반복하며 진행합니다.

1. **Step 1 — Specification First (`docs/specs/`):**
   - 새로운 규칙이나 화면을 추가하기 전에 대화(`/grill-me`, `/plan`)를 통해 정책을 확정하고 `docs/specs/features/` 하위의 명세서를 먼저 업데이트합니다.
2. **Step 2 — Headless Core & Adaptive UI Implementation (`src/`):**
   - 비즈니스 규칙(점수 계산, 자격 검증 등)은 `src/core/communityRules.js`에 순수 함수로 구현하고, 화면 컴포넌트(`src/pages/`)에서 호출합니다.
3. **Step 3 — Local Multi-Viewport Verification (`npm run dev`):**
   - 로컬 개발 서버(`http://localhost:3000`)에서 PC 뷰(`>= 768px`)와 모바일 뷰(`< 768px`)를 모두 확인합니다.
4. **Step 4 — Trunk-Based Atomic Commit & Push (`main`):**
   - 단일 `main` 브랜치에 동작 가능한 단위로 커밋(영문 Conventional Commits)하고 원격 저장소에 푸시합니다.

### 2. Project Milestone Roadmap
| 단계 | 마일스톤 | 핵심 작업 내용 |
| :--- | :--- | :--- |
| **Step 1** | **기반 설계 및 프로토타입** | Vite + Capacitor 멀티플랫폼 설정, 5대 페이지 및 온보딩/정산 플로우 구현 |
| **Step 2** | **로컬 구동 및 UI/규칙 튜닝** | 로컬 서버(`npm run dev`) 구동, 권한별/화면별 시나리오 검증 및 세부 UX 보완 |
| **Step 3** | **Firebase DB 실연동** | Firestore 실시간 데이터 연동(`src/services/firebase.js`) 및 `firestore.rules` 보안 규칙 적용 |
| **Step 4** | **카카오 로그인(OAuth) 연동** | Kakao SDK 인가 및 `functions/index.js`(`kakaoCustomAuth`) 커스텀 토큰 로그인 연결 |
| **Step 5** | **PC / 모바일 웹 배포** | Firebase Hosting 배포 및 카카오톡 단톡방 링크 공유 / PWA 홈 화면 추가 오픈 |
| **Step 6** | **Android / iOS 앱 패키징** | Capacitor 네이티브 프로젝트(`android/`, `ios/`) 동기화, 푸시 알림(FCM) 및 스토어 출시 |

### 3. Step 2 Execution Guide (Local Setup & Verification)

#### A. Commands Reference
```powershell
# 1. 프로젝트 폴더로 이동
cd C:\Users\cntok\works\heal

# 2. 의존성 패키지 설치 (최초 1회 또는 package.json 변경 시)
npm install

# 3. 로컬 개발 서버 실행 (기본 주소: http://localhost:3000)
npm run dev

# 4. 배포용 정적 빌드 검증 (dist/ 폴더 생성 확인)
npm run build
```

#### B. How to Test PC Web vs Mobile Web/App Layouts
1. 브라우저에서 `http://localhost:3000`에 접속합니다.
2. **PC 웹 화면 확인 (`>= 768px`):**
   - 브라우저 창을 넓게 유지하면 **좌측 고정 사이드바(`PC Web` 뱃지)**와 넓은 2열/3열 카드 및 리스트 레이아웃이 표시됩니다.
3. **모바일 웹 / 앱 화면 확인 (`< 768px`):**
   - 브라우저에서 `F12`(개발자 도구)를 누르고 상단의 **기기 툴바 토글 아이콘(`Ctrl + Shift + M`)**을 클릭하여 기기를 `iPhone 14 Pro` 또는 `Galaxy S20`으로 선택합니다.
   - 좌측 사이드바가 사라지고 **상단 모바일 헤더(`Mobile Web` 뱃지)**와 **하단 고정 탭바**로 즉시 전환되는지 확인합니다.

## Data Schema & API

### Role Switcher Presets for Step 2 Testing
로컬 환경에서 카카오 실연동 전에도 모든 권한을 즉시 검증할 수 있도록 사이드바 하단(PC) 및 상단 헤더(모바일)에 **계정/권한 스위처**가 제공됩니다.

- `김민준 (방장 Leader, 참석 12회)`: `[운영 관리]` 5번째 탭 노출, 공식/자율 모임 개설 가능, 모든 모임 마감·정산 가능.
- `최유진 (일반회원 Member, 참석 2회)`: 기본 4개 탭 노출, 1회 이상 참석 조건 충족으로 자율/번개 모임 개설 가능, 본인 개설 모임 마감·정산 가능.
- `정우성 (신규 일반회원 Member, 참석 0회)`: 기본 4개 탭 노출, `[+ 벙 개설하기]` 클릭 시 1회 참석 필요 안내 배너 노출 및 개설 제한.
- `→ 로그인 / 신규 온보딩 화면`: 비로그인 상태의 빠른 닉네임 생성기 및 신규 회원 온보딩(프로필 등록 후 즉시 일반회원 진입) 체험 가능.

## Edge Cases & Validation
- **포트 충돌 대응:** `3000`번 포트가 이미 사용 중일 경우 Vite가 자동으로 `3001`번 등 다음 포트를 할당하며 터미널에 접속 URL을 출력합니다.
- **패키지 버전 호환성:** Node.js 18 이상 환경에서 Vite 5 및 Capacitor 6가 정상 동작합니다.

## Test Scenarios
1. **권한별 메뉴 및 벙 개설 자격 확인:**
   - 계정 스위처에서 `정우성(참석 0회)` 선택 → `[모임(벙)]` 탭에서 `[+ 벙 개설하기]` 클릭 시 경고 문구가 표시되는지 확인.
   - 계정 스위처에서 `최유진(참석 2회)` 선택 → `[+ 벙 개설하기]` 클릭 시 정상적으로 자율/번개 모임 등록 폼이 열리는지 확인.
2. **모임 마감 및 원정 보너스 정산 확인:**
   - `김민준(방장)` 상태에서 `[모임(벙)]` 탭의 `11월 서울 강남 정기 모임` 카드의 `[모임 마감 · 점수 정산]` 클릭 → `정우성(0회 참석)` 및 타지역 회원 체크 후 정산 확정.
   - 정산 직후 `정우성`의 참석 횟수가 `1회`로 증가하여 이제 직접 벙을 개설할 수 있게 되는지 확인하고, 타지역(`경기`/`인천`) 회원에게 `+3점(기본 1 + 원정 2)`이 반영되었는지 `[랭킹·점수]` 탭에서 확인.
3. **프로필 수정 및 원클릭 닉네임 복사 확인:**
   - `[내 정보]` 탭에서 거주 지역이나 결혼 여부를 변경했을 때 규격 닉네임이 실시간으로 갱신되고 `[닉네임 원클릭 복사]`가 동작하는지 확인.
4. **운영진 관리 기능 확인:**
   - `김민준(방장)` 상태에서 `[운영 관리]` 탭 진입 → 회원 등급 변경, 커스텀 뱃지 입력, 수동 이벤트 점수 부여(`+`/`-`), 홈 공지 배너 수정이 즉시 홈/랭킹 화면에 반영되는지 확인.

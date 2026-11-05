# Heal - Community Management System

## Project Overview
힐(Heal) 커뮤니티 관리 시스템은 회원의 프로필, 고유 닉네임 규격, 역할/권한 체계, 모임 참석 및 활동 점수를 관리하기 위한 웹 애플리케이션입니다.

## Technology Stack
- **Target Platforms:** PC Web, Mobile Web (PWA), Android, iOS (Single Codebase)
- **Frontend & Build:** React 18, Vite, Vanilla CSS (Responsive & Adaptive UI)
- **Mobile Packaging:** Capacitor (`@capacitor/core`, `@capacitor/cli`) + PWA Web App Manifest
- **Backend & Database:** Firebase Firestore, Firebase Cloud Functions, Firebase Hosting
- **Auth:** Firebase Auth + Kakao OAuth (Custom Token via Functions, Web SDK & Native App Bridge)

## Multi-Platform Architecture Principles
- **Headless Business Logic:** 닉네임 생성/검증, 점수 산정, Firebase 통신 등 핵심 비즈니스 로직은 UI 컴포넌트와 분리하여 `src/core/` 또는 `src/services/` 하위에 순수 JS 모듈로 유지합니다.
- **Adaptive Layout System:** 단일 React 코드베이스에서 뷰포트 크기(`768px` 기준)에 따라 **PC 웹(좌측 사이드바 + 테이블/대시보드 뷰)**과 **모바일 웹/앱(상단 헤더 + 하단 고정 탭바 + 카드 뷰)** 레이아웃이 자동 전환되도록 구성합니다.
- **Mobile Safe Area & WebView Optimization:** Android/iOS 네이티브 앱 패키징 환경을 고려하여 `viewport-fit=cover` 및 CSS `env(safe-area-inset-*)` 변수를 기본 레이아웃에 적용합니다.
- **Platform-Aware Authentication:** 웹 환경에서는 Kakao JS SDK 리다이렉트 방식을 사용하고, Capacitor 네이티브 앱 환경에서는 카카오톡 인앱/네이티브 인증 후 동일한 Firebase Cloud Functions(`kakaoCustomAuth`)를 통해 Firebase 커스텀 토큰을 발급받습니다.

## UI & Theme Design Guidelines (Mandatory)
- **3-Way Theme System Preservation (`mono` / `excel` / `rose`):**
  - 디자인을 추가하거나 수정할 때 항상 3종 테마(`mono` 무채색 화이트 기본값, `excel` 스프레드시트 업무 모드, `rose` 힐링 로즈 테마)가 모두 깨짐 없이 동작해야 합니다.
  - 컴포넌트 내부에 특정 원색을 하드코딩하지 않고 반드시 `src/styles/global.css`의 CSS 변수(`var(--color-primary)`, `var(--color-subtle-bg)`, `var(--color-divider)`, `var(--role-*)`, `var(--radius-base)`)를 사용합니다.
- **Office Stealth Compliance (`mono` & `excel` Themes):**
  - 회사나 공공장소에서 열람할 때 화면이 화려하게 튀지 않도록 기본 테마(`mono`)와 엑셀 테마(`excel`)에서는 화려한 배너 이미지나 장식용 이모지를 노출하지 않습니다.
  - 대표 이미지나 장식 요소는 반드시 `.rose-only` 클래스 또는 `theme === 'rose'` 조건으로 감싸 `rose` 테마에서만 표시되도록 유지합니다.
- **Mobile Divider-List & Sub-Route Summary Rule:**
  - 모바일 화면(`< 768px`)은 순백색(`#FFFFFF`) 배경 위의 구분선(Divider) 리스트 구조를 기본으로 유지합니다.
  - 새로운 페이지나 하위 주소를 추가할 때는 `src/core/routeMeta.js` 및 `scripts/generate-route-meta.mjs`에 **20자 내외의 최상단 핵심 요약 문구(`headerSummary`)**와 카카오톡 공유용 Open Graph 메타데이터를 반드시 함께 등록합니다.
- **Korean Cultural Name Color Policy (사람 이름 빨간색 표기 절대 금지):**
  - 한국 문화에서는 사람의 이름(실명, 규격 닉네임)을 빨간색으로 표기하는 것을 강하게 금기시합니다.
  - `rose` 테마의 포인트 색상(`--color-primary: #e11d48`)이 닉네임 생성기(`.nickname-preview-box .preview-value`), 프로필, 랭킹 리스트, 참석자 명단, 토글 칩(`.member-chip-btn`) 등 회원 이름/닉네임 텍스트에 적용되지 않도록 보장해야 합니다.
  - 사람의 이름 및 닉네임 텍스트는 모든 테마(mono, excel, rose)에서 항상 짙은 기본 텍스트 색상(`var(--color-text-primary, #0f172a)`)을 유지해야 합니다.
- **Zero-Explanation / Data-Only UI Rule (불필요한 설명 문구 절대 금지):**
  - 페이지를 생성하거나 수정할 때 화면 안에 기능 소개, 사용 방법 안내, 규칙 부연 설명, 가이드 박스(`.muted-text` 설명 줄글, `.rules-list`, 괄호 안의 장황한 부연 라벨 등)를 넣지 않습니다.
  - 모든 화면은 오직 **간결한 섹션 제목, 핵심 데이터, 짧은 입력 라벨(2~6자), 액션 버튼**만 남기고 직관적으로 구성합니다 (유일한 예외: 홈 화면 상단의 운영진 공지 본문).
- **No Native Dialog Rule (브라우저 기본 알림창 사용 금지):**
  - `window.alert`, `window.confirm`, `window.prompt` 등 브라우저 기본 알림창을 새로 사용하지 않습니다 (디자인이 테마와 맞지 않음).
  - 액션 결과는 카드/버튼의 상태 변화(예: `사용 요청` → `사용 요청 완료`)나 인라인 상태 표시로 전달하고, 실패 시에는 `console.error` 기록 후 상태를 유지합니다.
  - 반려·삭제 등 되돌리기 어려운 액션은 확인창 대신 **2단계 탭**(첫 탭 시 버튼 라벨이 `반려 확인` 등으로 바뀌고 3초 내 재탭 시 실행)으로 보호합니다. 공통 훅 `src/utils/useArmedAction.js`(`isArmed`, `runArmed`)를 사용합니다.
  - 기존 코드를 수정할 때 해당 영역의 `alert`/`confirm`도 함께 제거합니다.

## Documentation Standards
- **Directory Structure:** 모든 시스템 및 기능 명세서는 `docs/specs/` 디렉토리 아래에 관리합니다.
  - 시스템/아키텍처 전반: `docs/specs/system-overview.md`
  - 멀티플랫폼 설계: `docs/specs/features/multi-platform-architecture.md`
  - 페이지 구조 및 네비게이션: `docs/specs/features/page-structure.md`
  - 모바일 웹 디자인 및 하위 주소 공유 명세: `docs/specs/features/mobile-design-and-routing.md`
  - 개발 프로세스 및 로컬 검증 가이드: `docs/specs/features/development-workflow.md`
  - Firebase 및 Firestore 연동 명세: `docs/specs/features/firebase-integration.md`
  - 카카오 OAuth 인증 연동 명세: `docs/specs/features/kakao-auth.md`
  - 웹 배포 및 PWA 명세: `docs/specs/features/web-deployment.md`
  - 세부 비즈니스 로직/기능별 명세: `docs/specs/features/<feature-name>.md` (파일명은 영문 `kebab-case` 사용)
- **Language & Heading Rules:**
  - **Headings (Titles & Section Headers):** 문서 제목과 모든 섹션 헤더(`#`, `##`, `###` 등)는 **영문(English)**으로 작성합니다.
  - **Body Content:** 본문 내용은 **한국어(Korean)**로 작성합니다.
  - 기술 용어 및 고유명사(예: Member, Meeting, Firebase Auth 등)는 영문 표기를 병행하거나 영문 그대로 사용 가능합니다.
- **Feature Spec Template:** `docs/specs/features/<feature-name>.md` 작성 시 아래 기본 섹션 구조를 권장합니다.
  1. `# <Feature Name> Specification`
  2. `## Overview` (기능 목적 및 배경)
  3. `## Business Rules & Logic` (상세 비즈니스 규칙 및 계산식)
  4. `## Data Schema & API` (Firestore 필드 구조 및 입출력 명세)
  5. `## Edge Cases & Validation` (예외 처리 및 유효성 검증 규칙)
  6. `## Test Scenarios` (핵심 검증 시나리오)
- **Spec-Code Synchronization:** 비즈니스 로직을 추가하거나 변경할 때는 `docs/specs/` 내 명세서를 먼저 확인 및 업데이트하고, 코드 변경과 함께 최신 상태로 유지합니다.

## Git & File Conventions
- **Branch Strategy (Single Main Branch):**
  - 별도의 기능 브랜치를 나누지 않고 메인 브랜치(단일 브랜치) 하나만 운영하는 **Trunk-Based Development** 방식을 따릅니다.
  - 각 커밋은 동작 가능한 단위로 작게(Atomic Commit) 유지합니다.
- **Commit & Push Ownership (User Managed & "고고고" Shortcut):**
  - `git commit`과 `git push`는 기본적으로 **사용자가 직접 수행**합니다 (AI 에이전트가 임의로 커밋하거나 푸시하지 않음). 단, **원격으로 접속한 환경에서 요청할 시에는 에이전트를 통한 커밋 및 푸시가 가능**합니다.
  - **원클릭 통합 실행 명령어 (`"고고고"`):** 사용자가 채팅창에 **"고고고"**(또는 **"풀배포"**, **"원샷"**)라고 입력하면 에이전트는 추가 확인 없이 **① 문서(`docs/specs/`) 동기화 확인 → ② `git add & git commit` → ③ `git push` → ④ Firebase 실서버 배포(`npm run deploy:hosting`)** 3단계(Commit · Push · Deploy)를 연속으로 즉시 수행합니다.
  - 작업 완료 후 결과 리포트를 작성할 때, 변경 사항에 맞는 **추천 Git 커밋 메시지(영문)를 별도 블록으로 함께 제시**합니다.
- **Commit Message Rules:**
  - 모든 커밋 메시지는 **영문(English)**으로 작성하며 **Conventional Commits** 규격을 따릅니다.
  - 형식: `<type>(<optional scope>): <subject>` (예: `feat(score): add expedition bonus logic`, `docs(spec): update nickname validation rules`)
  - 주요 Type:
    - `feat`: 새로운 기능 추가
    - `fix`: 버그 수정
    - `docs`: 문서(`docs/`, `GEMINI.md` 등) 추가 및 수정
    - `refactor`: 기능 변경 없는 코드 리팩토링
    - `test`: 테스트 코드 추가 및 수정
    - `chore`: 빌드 설정, 패키지, 환경 구성 변경
- **Line Endings & Encoding:**
  - 모든 텍스트 및 소스 파일은 운영체제와 무관하게 **Unix 스타일 개행 문자(`LF`, `\n`)**만 사용합니다 (`CRLF` 사용 금지).
  - 파일 인코딩은 **UTF-8 (BOM 없음)**을 기본으로 합니다.

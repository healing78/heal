# Heal - Community Management System

## Project Overview
힐(Heal) 커뮤니티 관리 시스템은 회원의 프로필, 고유 닉네임 규격, 역할/권한 체계, 모임 참석 및 활동 점수를 관리하기 위한 웹 애플리케이션입니다.

## Autonomous Execution & Confirmation Boundary Directive (자율 실행 및 컨펌 원칙)
> **[상시 유지 지침] 사용자의 명시적인 변경 요청 전까지 항구적으로 유지됩니다.**
- **기본 원칙: 사용자 추가 컨펌 없이 자율 연속 진행 (Proceed Autonomously by Default)**
  - 에이전트는 사용자의 별도 요청이 있을 때까지, 아래 명시된 **2가지 예외 상황을 제외한 모든 작업(코드 작성 및 수정, 빌드, 로컬 검증, 문서화, 깃 커밋 및 푸시, 배포 등)을 사용자에게 일일이 확인을 구하지 않고 즉시 자율적으로 진행**합니다.
- **사용자 사전 컨펌이 반드시 필요한 2대 예외 상황 (Strict Exceptions Requiring Explicit Confirmation):**
  1. **현재 운영 중인 실데이터를 수정하거나 삭제하는 경우 (Modifying/Deleting Live Production Data):**
     - Firestore의 실제 회원 문서(`members`), 실제 모임 기록(`meetings`), 결제/점수 로그(`scoreLogs`) 등 프로덕션 환경에서 실시간 운영 중인 원천 데이터를 직접 수정하거나 삭제하는 작업.
  2. **워킹 폴더(`heal`) 또는 `.gemini` 디렉토리 외의 외부 경로 사용이 필요한 경우 (Accessing Outside Working Directory):**
     - 현재 프로젝트 워킹 디렉토리(`C:\Users\cntok\works\heal`) 및 시스템 디렉토리(`C:\Users\cntok\.gemini`) 범위를 벗어난 로컬 파일 시스템 경로(바탕화면, 내문서, 다른 드라이브 등)를 읽기/쓰기/참조해야 하는 작업.
- **유지 기간:** 사용자가 명시적으로 지침 변경이나 중단을 요청하기 전까지 계속 유지됩니다.

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
- **Operator Edit UI Theme Palette (운영자 전용 편집 UI 테마 팔레트 규칙):**
  - 운영자(`Leader`, `Deputy`, `Stealth SuperAdmin`)에게만 노출되는 인라인 편집 카드 및 아코디언(`.admin-edit-accordion*`)은 일반 회원 화면과 시각적으로 명확히 구분되면서도 각 테마와 조화를 이루도록 `src/styles/global.css`의 `--admin-edit-*` CSS 변수를 일관되게 사용합니다:
    - **`mono` (Cool Slate):** 배경 `--admin-edit-bg: #f1f5f9`, 테두리 `--admin-edit-border: #cbd5e1`, 강조 `--admin-edit-accent: #334155`, 칩 배경 `--admin-edit-chip-bg: #e2e8f0`
    - **`excel` (Mint Green):** 배경 `--admin-edit-bg: #ecfdf5`, 테두리 `--admin-edit-border: #a7f3d0`, 강조 `--admin-edit-accent: #0f766e`, 칩 배경 `--admin-edit-chip-bg: #d1fae5`
    - **`rose` (Soft Lavender & Purple):** 배경 `--admin-edit-bg: #f5f3ff`, 테두리 `--admin-edit-border: #ddd6fe`, 강조 `--admin-edit-accent: #6d28d9`, 칩 배경 `--admin-edit-chip-bg: #ede9fe` (일반 핑크 영역과 구분되면서 한국 문화 이름 빨간색 금기를 완벽히 준수하는 보라/라벤더 톤)
- **Terminology & Badge Cleanliness Rule (용어 통일 및 불필요한 캡슐 배지 금지):**
  - 모임 주최자 명칭은 모든 화면에서 **`벙주`**로 단일 통일합니다 (`벙주(주최자)`, `주최자`, `주최` 표기 금지).
  - 화면을 복잡하게 만드는 `[기본값]`, `[운영진 참관]` 등의 부연 캡슐 알림 배지는 사용하지 않습니다.
- **Zero-Explanation / Data-Only UI Rule (불필요한 설명 문구 절대 금지):**
  - 페이지를 생성하거나 수정할 때 화면 안에 기능 소개, 사용 방법 안내, 규칙 부연 설명, 가이드 박스(`.muted-text` 설명 줄글, `.rules-list`, 괄호 안의 장황한 부연 라벨 등)를 넣지 않습니다.
  - 모든 화면은 오직 **간결한 섹션 제목, 핵심 데이터, 짧은 입력 라벨(2~6자), 액션 버튼**만 남기고 직관적으로 구성합니다 (유일한 예외: 홈 화면 상단의 운영진 공지 본문).
- **No Native Dialog Rule (브라우저 기본 알림창 사용 금지):**
  - `window.alert`, `window.confirm`, `window.prompt` 등 브라우저 기본 알림창을 새로 사용하지 않습니다 (디자인이 테마와 맞지 않음).
  - 액션 결과는 카드/버튼의 상태 변화(예: `사용 요청` → `사용 요청 완료`)나 인라인 상태 표시로 전달하고, 실패 시에는 `console.error` 기록 후 상태를 유지합니다.
  - 반려·삭제 등 되돌리기 어려운 액션은 확인창 대신 **2단계 탭**(첫 탭 시 버튼 라벨이 `반려 확인` 등으로 바뀌고 3초 내 재탭 시 실행)으로 보호합니다. 공통 훅 `src/utils/useArmedAction.js`(`isArmed`, `runArmed`)를 사용합니다.
  - 기존 코드를 수정할 때 해당 영역의 `alert`/`confirm`도 함께 제거합니다.

## Strict Real-Data Integrity Principle (가상/임의 데이터 생성 절대 금지)
- **오직 실제 데이터만 취급:**
  - 실제 벙(모임) 원천 텍스트나 사용자가 제공한 실제 데이터 외에, 개발 편의·데모·테스트 목적의 가상(Dummy/Mock) 데이터를 생성하거나 시스템에 임의 삽입하는 것을 엄격히 금지합니다.
- **벙기록(Meeting) 생성 및 파싱 시 필드 무결성 규칙:**
  1. **총무(`treasurerUid`):** 원천 기록에 총무가 명시되지 않은 경우, 임의의 참석자나 기본 관리자 UID를 무작위로 지정하지 않고 반드시 빈 문자열(`""`)로 둡니다.
  2. **좋아요(`likes`):** 시스템이 임의로 생성한 가상의 좋아요를 넣지 않으며, 항상 실제 사용자 인터랙션 전에는 빈 배열(`[]`)로 유지합니다.
  3. **회비/비용(`cost`):** 원천 기록에 실제 회계/영수증 정산 내역이 없는 경우, 임의의 일괄 금액(예: `인원수 * 20,000원`, `20,000원` 등)을 기입하지 않고 `0`으로 처리합니다.
  4. **결제 내역(`paymentStatuses`):** 가상의 결제 확인 데이터를 넣지 않고 빈 객체(`{}`)로 둡니다.
  5. **주최자/결제자(`payerUid`):** 원천에 결제자가 없는 경우 `""`로 둡니다.
- **초기 데이터(`initialData.js` 및 Firestore) 정결성:**
  - `INITIAL_MEETINGS`: 854건의 실제 벙 데이터만 유지하며, 가상 테스트 모임(`생일 테스트`, `ㅂㅂㅂ`, `수원벙 테스트` 등)은 절대 포함하지 않습니다.
  - `INITIAL_MEMBERS`: 실제 활동 회원 281명 데이터만 유지하며, 가상의 계좌번호(`3333-01-1234567` 등)나 임의의 개인정보를 삽입하지 않습니다.
  - `INITIAL_SCORE_LOGS`: 실제 운영 중 발생한 점수 로그 외에 가상 데모용 로그(`log-1`, `log-2` 등)는 포함하지 않고 빈 배열(`[]`)로 시작합니다.

## Sub-Phone & Multi-Account Architecture Principles
- **Strict Single-Name Policy (동명이인 절대 불가):**
  - 모든 회원의 활동명(`realName`)은 커뮤니티 내에서 유일해야 합니다 (한글 1~3자).
  - 중복된 이름으로 신규 가입할 수 없으며, 기존 회원과 동일한 이름으로 접속한 경우 오직 기기변경(계정 완전 승계) 또는 서브폰(세컨폰) 연동 신청만 가능합니다.
- **Dual Choice on Existing Account Detection (기기변경 vs 서브폰 등록 이원화):**
  - 기존 활동 회원과 동일한 이름으로 새 카카오 UID 접속 시 사용자의 실제 기기 사용 방식에 따라 2가지 선택지를 제공합니다:
    1. **기기변경 (계정 완전 승계):** 휴대폰 교체/카톡 재가입으로 기존 폰을 안 쓰는 경우. 승인 시 기존 UID의 모든 점수, 출석, 주최, 벙참석, 권한이 새 UID로 완전 인계(`reassignMemberUid`)되고 옛 UID는 대체 삭제됩니다.
    2. **서브폰 등록 (복수 기기 연동):** 기존 폰도 쓰고 새 폰도 함께 쓰는 경우. 승인 시 본계정의 `subUids` 배열에 추가되어 양쪽 기기 모두에서 동시 로그인 및 활동이 가능합니다.
- **Sub-Phone Registration & Admin Confirmation Flow:**
  - 동일 회원의 세컨폰/보조 카카오 계정은 본계정의 `subUids` 배열에 저장됩니다.
  - 서브폰 등록은 보안과 데이터 신뢰성을 위해 반드시 **운영진(방장/부방장/최고관리자)의 승인(`approveSubPhoneRequest`)**을 거쳐야 합니다.
  - 승인 완료 즉시 신청자의 임시 문서는 정리 삭제되며, 이후 해당 서브폰 기기로 로그인 시 온보딩을 건너뛰고 본계정으로 즉시 매핑됩니다 (`m.uid === uid || m.subUids.includes(uid)`).
- **Secondary Nicknames (Aliases) & Region Preservation:**
  - 본계정과 서브폰의 닉네임이 다른 경우(예: 카일 - 카이) `aliases` 배열에 보조 닉네임을 보존하여 벙 기록 파서 및 출석부에서 본계정으로 자동 통합 집계됩니다.
  - 해외 거주 및 국내 임시 체류(예: 지민 멕시코 - 경광)와 같이 복수 생활권인 경우 본계정 거주지(`homeCity`)와 서브 거주지(`subCities`/`city`)를 모두 원정 점수 산정에 반영합니다.
- **Sub-Phone Management & Disconnect:**
  - 회원은 내 정보(`ProfilePage`)에서 본인 계정에 연동된 서브폰 목록을 상시 조회하고 언제든 안전하게 연결 해제(`disconnectSubPhone`)할 수 있습니다.
- **Onboarding Simulator Sandbox & Safe Test Cleanup:**
  - 최고관리자의 온보딩/서브폰 화면 디버깅을 위해 가상 사용자(`kakao:sim-*`, `isSimulation: true`) 샌드박스를 제공합니다.
  - 시뮬레이터로 생성된 모든 테스트 데이터는 `AdminPage > 요청`에서 `[반려]` 시 즉시 영구 삭제되며, 승인된 경우에도 마스터 센터의 `[🧹 테스트 데이터 정리]`(`cleanupSimulationMembers`)를 통해 DB 및 본계정에서 원클릭으로 일괄 영구 삭제하여 실제 데이터 무결성을 엄격히 보호합니다.

## Documentation Standards
- **"문서화" Directive & Shortcut (문서화 실행 규칙):**
  - 사용자가 채팅창에 **"문서화"**(또는 "문서화해줘", "문서화 부탁해")라고 요청하면, 에이전트는 최근 구현된 내용이나 제안·합의된 시스템 구조를 바탕으로 `docs/specs/` 내 기존 문서를 검토하여 **가장 적절한 위치에 내용을 업데이트하거나 필요한 경우 새로운 명세 문서를 생성**합니다.
  - **이미 충분히 설명된 경우:** 기존 문서에 해당 내용이 이미 충실하게 작성되어 중복 작성이 불필요한 경우, 불필요한 중복 텍스트를 덧붙이지 않고 사용자에게 기존 문서의 해당 섹션과 핵심 내용을 간결히 안내합니다.
  - 문서 업데이트 후에는 변경된 문서 파일 목록과 요약을 간결하게 보고합니다.
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
- **Commit & Push Ownership (Autonomous with "고고고" Shortcut):**
  - **자율 실행 원칙 적용:** 사용자의 컨펌 생략 지침에 따라, 워킹 폴더(`heal`) 내부의 개발·수정·빌드·문서화 작업 완료 시 별도의 추가 컨펌 대기 없이 즉시 `git commit` 및 `git push`, Firebase 배포를 연속으로 자율 수행합니다.
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

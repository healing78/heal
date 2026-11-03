# Mobile Web Design and Sub-Route Sharing Specification

## Overview
Healing78 커뮤니티 관리 시스템의 **화이트(`#FFFFFF`) 배경 + 로즈 핑크·바이올렛 테마**, **구분선(Divider) 중심 모바일 리스트 레이아웃**, 그리고 카카오톡 오픈채팅방 링크 공유에 최적화된 **하위 주소 라우팅 및 최상단 20자 요약 헤더 규격**을 정의합니다.

## Business Rules & Logic

### 1. Visual Identity & Color System (`src/styles/global.css`)
- **배경 및 표면 컬러:**
  - 기본 배경색(`--color-bg`) 및 섹션 표면(`--color-surface`)을 순백색(`#FFFFFF`)으로 통일하여 모바일 웹에서의 가독성과 개방감을 극대화합니다.
- **브랜드 포인트 컬러 (`Healing78` 대표 이미지 기반):**
  - **Primary (Rose Pink):** `#e11d48` ~ `#db2777` (주요 액션 버튼, 활성 탭, 강조 텍스트, 핵심 배지).
  - **Accent (Violet Purple):** `#8b5cf6` (공식 모임 배지, 정산 액션, 가이드 포인트).
  - **Subtle Tint:** `#fff1f2`(연핑크), `#f3e8ff`(연보라) 배경을 닉네임 프리뷰 박스와 공지 배너에 적용합니다.
- **대표 이미지(`/healing78-logo.jpg`) 노출 원칙:**
  - **로그인/온보딩 화면 (`/login`):** 상단에 대형 히어로 배너 이미지로 노출하여 커뮤니티 아이덴티티(`Healing78 since 2024`)를 강조합니다.
  - **앱 내부 화면:** 상단 헤더 좌측에 `30px` 원형 썸네일 아이콘으로만 심플하게 표시합니다.
  - **카카오톡 공유 미리보기 (`og:image`):** `https://healing78.web.app/healing78-logo.jpg`를 기본 오픈그래프 이미지로 제공합니다.

### 2. Mobile Divider-List Layout & Adaptive Desktop Sidebar
- **모바일 웹 (`< 768px`):**
  - 카드 외곽선 박스를 중첩하는 대신 인스타그램/카카오톡 피드와 같은 **구분선(Divider, `1px solid #f1f5f9`) 중심의 리스트형 스타일**로 항목을 나열합니다.
  - 내 활동 요약(누적 점수 · 전체 순위 · 참석 횟수)은 모바일에서도 세로로 길어지지 않도록 **한 줄 3열 가로 그리드(`grid-template-columns: repeat(3, 1fr)`)**로 컴팩트하게 배치합니다.
  - 하단 고정 탭바(`mobile-tabbar`)에 직관적인 아이콘과 라벨(`🏠 홈`, `📅 모임(벙)`, `🏆 랭킹·친구`, `🏷️ 신입닉네임`, `👤 내 정보`, 조건부 `⚙️ 운영`)을 배치합니다.
- **데스크톱 웹 (`>= 768px`):**
  - 기존과 동일하게 좌측 고정 사이드바(`pc-sidebar`)와 우측 본문 레이아웃을 유지합니다.

### 3. Sub-Route Architecture & 20-Character Top Summary Header (`src/core/routeMeta.js`)
- **지원 하위 주소 목록:**
  - `/` (또는 `/home`): 커뮤니티 홈 (공지, 내 요약, 모집중 벙, TOP 5 랭킹)
  - `/meetings`: 모임(벙) 전체 목록 및 개설·정산
  - `/meetings?id=<meetingId>`: 특정 모임(벙) 포커스 조회 및 개별 공유
  - `/ranking`: 전체·월간 활동 점수 랭킹 및 지역별 친구 검색
  - `/nickname`: 신입 회원 이름 변경 및 오픈채팅방 규격 닉네임 자동 생성기
  - `/profile`: 내 프로필 수정, 규격 닉네임 원클릭 복사, 권한 체험용 계정 전환기
  - `/login`: 카카오 로그인 및 신입 온보딩 등록
  - `/admin`: 운영진(방장·부방장) 전용 관리 센터
- **최상단 20자 내외 핵심 요약 및 브라우저 타이틀 동기화:**
  - 각 하위 주소 및 선택된 모임(`?id=`)에 맞춰 브라우저 `<title>`과 모바일 최상단 헤더 텍스트(`.header-summary-title`)를 **20자 내외의 핵심 정보**로 즉시 갱신합니다.
    - 예 (개별 모임): `[11/08 서울] 주말 성수동…`
    - 예 (모임 목록): `모집벙 2건·서울 등`
    - 예 (랭킹): `활동랭킹 1위 김힐링(14점)`
    - 예 (신입 닉네임): `신입 규격 닉네임 생성·변경`
- **비로그인(게스트) 열람 허용 정책:**
  - 카카오톡 오픈채팅방에서 공유된 하위 주소(`/meetings`, `/meetings?id=...`, `/ranking`, `/nickname` 등)를 클릭했을 때 로그인 화면에 가로막히지 않고 즉시 해당 정보를 열람할 수 있습니다.
  - 비로그인 상태에서 `[참석 신청하기]`, `[+ 벙 개설]` 등 회원 전용 액션을 클릭할 때만 `/login` 화면으로 이동합니다.
- **원클릭 카톡 공유 포맷 (`shareRouteInfo`):**
  - 모바일 상단 헤더의 `[🔗 공유]` 버튼 또는 개별 모임의 `[🔗 이 벙 카톡 공유]` 버튼을 누르면 **`[Healing78] <20자 핵심 요약>\n<상세 설명>\n<하위 주소 URL>`** 문구가 클립보드에 복사되고 모바일 네이티브 공유 시트(`navigator.share`)가 호출됩니다.

### 4. Build-Time Sub-Route Open Graph Generation (`scripts/generate-route-meta.mjs`)
- 카카오톡 미리보기 스크래퍼 봇은 JavaScript를 실행하지 않고 정적 HTML의 `<meta property="og:*">` 태그를 읽습니다.
- 이를 위해 `npm run build` 시점에 `scripts/generate-route-meta.mjs`가 실행되어 `dist/meetings/index.html`, `dist/ranking/index.html`, `dist/nickname/index.html`, `dist/profile/index.html`, `dist/login/index.html`, `dist/admin/index.html` 파일을 각각 생성하고 하위 주소별 맞춤 `<title>`, `og:title`, `og:description`, `og:image`를 주입합니다.

## Data Schema & API

### Route Meta Helper Interface (`src/core/routeMeta.js`)
- `parseCurrentRoute()`: 현재 URL 경로(`pathname`)와 쿼리(`?id=`, `?q=`)를 분석하여 `{ tab, meetingId, memberQuery }` 반환.
- `pushRouteUrl(tab, params)`: 브라우저 History API(`pushState`)로 하위 주소 URL 전환.
- `buildRouteMeta({ tab, meetingId, meetings, members, currentUser })`: 현재 화면 상태에 맞는 `{ headerSummary, pageTitle, description, sharePath }` 생성 (`headerSummary`는 20자 내외 자동 축약).
- `syncDocumentMeta(meta)`: `document.title` 및 DOM 내 Open Graph 메타 태그 동기화.
- `shareRouteInfo(meta)`: 20자 요약 문구 + 하위 주소 링크 클립보드 복사 및 모바일 Web Share API 실행.

## Edge Cases & Validation
- **존재하지 않는 모임 ID(`?id=invalid`) 접근 시:** 에러 없이 전체 모임 목록(`/meetings`)으로 안전하게 폴백하며 `[선택 해제]` 버튼으로 언제든 전체 목록으로 복귀할 수 있습니다.
- **20자 초과 제목 처리:** `toShortSummary(text, 20)` 유틸리티를 통해 20자를 초과하는 긴 모임 제목도 모바일 상단 헤더에서 줄바꿈 없이 깔끔하게 말줄임(`…`) 처리됩니다.

## Test Scenarios
1. **비로그인 상태 하위 주소 직접 접속 검증:**
   - 로그아웃 상태에서 `/meetings`, `/nickname`, `/ranking` 접속 시 로그인 창으로 튕기지 않고 해당 페이지 내용과 상단 20자 요약이 즉시 표시되는지 확인.
2. **개별 모임(벙) 공유 및 포커스 검증:**
   - 모임 목록에서 특정 벙의 `[🔗 이 벙 카톡 공유]` 클릭 시 주소가 `/meetings?id=<id>`로 바뀌고 상단 헤더가 `[MM/DD 지역] 모임명`으로 변경되며 클립보드에 요약+링크가 복사되는지 확인.
3. **하위 주소 정적 빌드 산출물 검증:**
   - `npm run build` 실행 후 `dist/meetings/index.html`, `dist/nickname/index.html` 등에 각각 고유한 `og:title`과 `og:image`(`https://healing78.web.app/healing78-logo.jpg`)가 포함되어 생성되는지 확인.

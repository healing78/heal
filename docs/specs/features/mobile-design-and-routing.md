# Mobile Web Design and Sub-Route Sharing Specification

## Overview
Healing78 커뮤니티 관리 시스템의 **3종 멀티 테마 시스템(① 오피스 모노 무채색 기본, ② 엑셀 시트 업무용 스텔스 모드, ③ 힐링 로즈 테마)**, **구분선(Divider) 및 시트 중심 모바일 리스트 레이아웃**, 그리고 카카오톡 오픈채팅방 링크 공유에 최적화된 **하위 주소 라우팅 및 최상단 20자 요약 헤더 규격**을 정의합니다.

## Business Rules & Logic

### 1. 3-Way Theme System & Office Stealth Mode (`src/core/theme.js`, `src/styles/global.css`)
- **기본 테마 (`mono`: 오피스 모노 — 무채색 화이트):**
  - 최초 접속 시 기본 적용되는 테마로, 순백색(`#FFFFFF`) 배경과 차콜 슬레이트(`#1e293b` ~ `#334155`) 무채색 포인트만 사용하여 회사나 공공장소에서도 부담 없이 열람할 수 있습니다.
  - 상단 원형 꽃/유니콘 로고, 로그인 화면 대형 대표 이미지, 화려한 이모지를 모두 숨기고 깔끔한 텍스트 중심으로 렌더링합니다.
- **엑셀 시트 테마 (`excel`: 스프레드시트 업무 모드):**
  - MS Excel 시그니처 딥 그린(`#107c41`)과 직각 셀 격자 테두리(`1px solid #d1d5db`), 짝수 행 교차 배경(`#f9fafb`), 상단 `fx` 수식 표시줄 및 `A | B | C` 열 헤더, 하단 시트 탭 디자인을 적용하여 업무용 스프레드시트 화면처럼 보이게 합니다.
- **힐링 로즈 테마 (`rose`: 대표 이미지 화사한 테마):**
  - `Healing78` 대표 이미지의 로즈 핑크(`#e11d48`) & 바이올렛(`#8b5cf6`) 컬러와 로그인 대형 히어로 이미지, 상단 원형 썸네일 아이콘을 모두 표시합니다.
- **상단 원터치 테마 전환기 (`.mobile-theme-toggle`, `.theme-switcher-group`):**
  - 모바일 상단 헤더 우측과 PC 좌측 사이드바 상단에 `[무채색 | 엑셀 | 로즈]` 3단 토글 스위치 제공.
  - 선택된 테마는 `localStorage`(`healing78_ui_theme_v1`)에 영구 저장되며 `<html data-theme="...">` 속성과 `<meta name="theme-color">`에 즉시 반영됩니다.

### 2. Mobile Divider-List Layout & Zero-Explanation UI Principle
- **모바일 웹 (`< 768px`):**
  - 카드 외곽선 박스를 중첩하는 대신 인스타그램/카카오톡 피드와 같은 **구분선(Divider, `1px solid #f1f5f9`) 중심의 리스트형 스타일**로 항목을 나열합니다.
  - **Zero-Explanation UI 원칙:** 화면 내에 불필요한 기능 설명 문구, 사용법 안내 줄글, 하단 규칙 요약 박스를 배치하지 않고 오직 **간결한 제목 · 핵심 데이터 · 짧은 입력 라벨 · 액션 버튼**만 표시합니다 (홈 상단 운영진 공지 본문만 예외).
  - 내 활동 요약(누적 점수 · 전체 순위 · 참석 횟수)은 모바일에서도 세로로 길어지지 않도록 **한 줄 3열 가로 그리드(`grid-template-columns: repeat(3, 1fr)`)**로 컴팩트하게 배치합니다.
  - 하단 고정 탭바(`mobile-tabbar`)에 직관적인 아이콘과 라벨(`홈`, `일정`, `리포트`, `랭킹·친구`, `신입닉네임`, `내 정보`, 조건부 `운영`)을 배치합니다.
- **데스크톱 웹 (`>= 768px`):**
  - 기존과 동일하게 좌측 고정 사이드바(`pc-sidebar`)와 우측 본문 레이아웃을 유지합니다.

### 3. Sub-Route Architecture & 20-Character Top Summary Header (`src/core/routeMeta.js`)
- **지원 하위 주소 목록:**
  - `/` (또는 `/home`): 커뮤니티 홈 (공지, 내 요약, 모집중 모임, TOP 5 랭킹)
  - `/meetings`: 캘린더 일정 목록 (연·월 그룹 + 좌측 요일·일자 + 세로 바 + 제목/시간/장소) 및 캘린더 스타일 일정 등록 카드
  - `/meetings/YYMMDD01` (예: `/meetings/26110701`, 구형 `?id=` 호환): 개별 일정 전용 단일 스크롤 상세·정산 페이지
  - `/reports`: 모임별·개인별 정산 및 참석 리포트
  - `/ranking`: 전체·월간 활동 점수 랭킹 및 지역별 친구 검색
  - `/nickname`: 신입 회원 이름 변경 및 오픈채팅방 규격 닉네임 자동 생성기
  - `/profile`: 내 프로필 및 정산 계좌번호 수정, 규격 닉네임 원클릭 복사, 권한 체험용 계정 전환기
  - `/login`: 카카오 로그인 및 신입 온보딩 등록
  - `/admin`: 운영진(방장·부방장) 전용 관리 센터
- **최상단 20자 내외 핵심 요약 및 브라우저 타이틀 동기화 (로그인 전·후 공통 유지):**
  - 각 하위 주소 및 선택된 모임(`?id=`)에 맞춰 로그인 전과 로그인 후 모두 브라우저 `<title>`과 모바일 최상단 헤더 텍스트(`.header-summary-title`)를 **페이지별 20자 내외 핵심 정보**로 표시합니다.
    - **홈 (`/`):** 홈 공지 요약 (`communityConfig.homeSummary`, 예: `공지 · 규격 닉네임 및 벙 규칙`)
    - **모임 (`/meetings`):** 모집 중인 벙들의 날짜(4자리 `MMDD`) + 지역 나열 형식 (예: `1107 서울, 1108 경기`, 개별 모임 선택 시 `1107 서울 11월 강남 정기…`)
    - **신입 닉네임 (`/nickname`):** 신입 공지 요약 (`communityConfig.newcomerSummary`, 예: `신입공지 · 입장 즉시 닉네임 변경`)
    - **랭킹 (`/ranking`):** 상위 랭커 요약 형식 (예: `1위 김민준, 2위 이서연`)
    - **내 정보 (`/profile`):** 로그인 전 `회원 전용 프로필 관리` / 로그인 후 내 규격 닉네임 요약
- **로그인 전(Before Login) vs 로그인 후(After Login) 본문 분리 정책:**
  - **로그인 전 (`!currentUser`):**
    - 모든 하위 주소에서 **상단 20자 요약 헤더와 하단 탭바는 페이지별로 그대로 동작**하여 로그인 전에도 각 페이지 요약 확인 및 카톡 공유가 가능합니다.
    - 단, 본문(`<main>`) 영역은 회원 개인정보(실명, 상세 모임 장소 등) 보호를 위해 **공통 로그인 화면(`LoginOnboardingPage`)**만 노출합니다 (유일한 예외로 `/nickname` 신입 닉네임 생성기는 로그인 전에도 본문 전체 노출).
    - 특정 하위 주소(예: `/meetings`, `/ranking`)에서 로그인을 완료하면 홈으로 튕기지 않고 **접속해 있던 해당 하위 주소의 '로그인 후 본문'이 즉시 열립니다.**
  - **로그인 후 (`currentUser` 존재):**
    - 각 하위 주소의 전체 상세 본문(`HomePage`, `MeetingsPage`, `RankingPage`, `NicknamePage`, `ProfilePage`, `AdminPage`)을 표시합니다.
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

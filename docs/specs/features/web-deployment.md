# Web Deployment and PWA Specification

## Overview
힐(Heal) 커뮤니티 관리 시스템을 **Firebase Hosting**을 통해 실제 인터넷 도메인(`https://heal-community-d09d7.web.app` 및 `https://heal-community-d09d7.firebaseapp.com`)으로 배포하고, 카카오톡 오픈채팅방 링크 공유 미리보기(Open Graph) 및 스마트폰 홈 화면 추가(PWA) 환경을 제공하는 명세서입니다.

## Business Rules & Logic

### 1. Firebase Hosting SPA Routing Architecture
- Vite 프로덕션 빌드(`npm run build`)가 생성하는 정적 에셋 디렉토리(`dist/`)를 Firebase Hosting의 `public` 루트로 배포합니다.
- 모든 경로 요청(`**`)을 `/index.html`로 리라이트(`rewrites`)하여 클라이언트 사이드 라우팅 및 새로고침 시 404 에러가 발생하지 않도록 보장합니다.
- 모든 트래픽은 Firebase Hosting이 기본 제공하는 무료 SSL 인증서를 통해 **HTTPS**로 서비스됩니다.

### 2. KakaoTalk Link Preview (Open Graph Metadata)
- 카카오톡 오픈채팅방(단톡방) 공지나 대화창에 배포 URL(`https://heal-community-d09d7.web.app`)을 공유했을 때 신뢰감 있는 미리보기 카드가 표시되도록 `index.html`에 다음 Open Graph 메타 태그를 포함합니다.
  - `og:title`: `Heal - 힐 커뮤니티 관리 시스템`
  - `og:description`: `규격 닉네임 생성, 모임(벙) 참석 신청 및 활동 점수·랭킹을 한곳에서 확인하세요.`
  - `og:type`: `website`
  - `og:locale`: `ko_KR`

### 3. Progressive Web App (PWA) Support for Mobile Web
- 모바일 브라우저(iOS Safari, Android Chrome)에서 별도 앱 스토어 설치 전에도 **'홈 화면에 추가(Add to Home Screen)'**를 통해 전체 화면 독립 실행(`display: "standalone"`)이 가능하도록 `public/manifest.json`과 벡터 앱 아이콘(`public/icon.svg`)을 제공합니다.

### 4. Step-by-Step Deployment & Post-Deployment Checklist (사용자 배포 가이드)

#### A. 최초 1회 Firebase CLI 로그인 및 배포 명령어
로컬 PC 터미널(PowerShell)에서 아래 명령어를 순서대로 실행합니다:

```powershell
# 1. 프로젝트 폴더로 이동
cd C:\Users\cntok\works\heal

# 2. Firebase 구글 계정 로그인 (최초 1회 — 브라우저가 열리면 구글 계정으로 로그인)
npm run firebase:login

# 3. 프로덕션 빌드 및 Firebase Hosting 실서버 배포
npm run deploy:hosting
```

배포가 완료되면 터미널에 아래와 같이 실제 접속 주소가 출력됩니다:
- **Hosting URL:** `https://heal-community-d09d7.web.app`

#### B. 배포 후 Kakao Developers 도메인 추가 (필수)
실서버 주소(`https://heal-community-d09d7.web.app`)에서도 카카오 로그인이 동작하려면 [Kakao Developers](https://developers.kakao.com/) 콘솔에서 배포 도메인을 추가해야 합니다:
1. **`[앱 설정] → [플랫폼] → [Web 플랫폼 수정]`**의 사이트 도메인에 아래 두 주소 추가:
   - `https://heal-community-d09d7.web.app`
   - `https://heal-community-d09d7.firebaseapp.com`
2. **`[제품 설정] → [카카오 로그인] → [Redirect URI]`**에도 `https://heal-community-d09d7.web.app` 추가.

## Data Schema & API

### NPM Deployment Scripts (`package.json`)
- `npm run firebase:login`: Firebase CLI 구글 계정 인증(`npx firebase-tools login`).
- `npm run deploy:hosting`: Vite 프로덕션 빌드(`npm run build`) 후 Firebase Hosting 업로드(`npx firebase-tools deploy --only hosting`).
- `npm run deploy:rules`: 로컬 `firestore.rules` 보안 규칙을 Firebase 서버에 배포(`npx firebase-tools deploy --only firestore:rules`).
- `npm run deploy:all`: 호스팅과 Firestore 보안 규칙을 동시 배포.

## Edge Cases & Validation
- **환경변수(`.env`) 빌드 타임 주입:** Vite는 `npm run build` 시점에 루트의 `.env` 파일(`VITE_FIREBASE_*`, `VITE_KAKAO_JS_KEY`)을 정적 번들에 포함시킵니다. 따라서 `.env`가 설정된 상태에서 `npm run deploy:hosting`을 실행하면 배포된 웹에서도 즉시 동일한 Firebase 및 Kakao 설정이 적용됩니다.
- **카카오톡 캐시 갱신:** 오픈그래프(`og:*`) 제목이나 설명을 변경한 뒤 카카오톡 공유 미리보기가 즉시 바뀌지 않을 경우, [카카오 공유 디버거](https://developers.kakao.com/tool/debugger/sharing)에서 URL 캐시 초기화를 실행합니다.

## Test Scenarios
1. **정적 빌드 산출물 검증:**
   - `npm run build` 실행 후 `dist/index.html`, `dist/manifest.json`, `dist/icon.svg` 파일이 모두 정상 생성되는지 확인.
2. **실서버 접속 및 모바일 반응형 검증:**
   - 배포 완료 후 스마트폰 카카오톡 채팅방에 `https://heal-community-d09d7.web.app` 링크를 전송하여 미리보기 카드와 모바일 웹 레이아웃(하단 탭바), 실시간 Firestore 데이터 조회가 정상 동작하는지 확인.

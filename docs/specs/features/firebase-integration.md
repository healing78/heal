# Firebase and Firestore Integration Specification

## Overview
힐(Heal) 커뮤니티 관리 시스템의 데이터를 영구 저장하고 실시간으로 동기화하기 위한 **Firebase(Firestore, Auth, Hosting, Cloud Functions) 연동 아키텍처**, **보안 규칙(`firestore.rules`)**, 그리고 **Firebase 콘솔 설정 절차**를 정의합니다.

또한 Firebase 환경변수(`.env`) 설정 전후 모두 중단 없이 개발 및 테스트할 수 있도록 **Firestore 실시간 모드 ↔ LocalStorage 영구 저장 폴백(Fallback) 이중 모드**를 지원합니다.

## Business Rules & Logic

### 1. Dual-Mode Data Persistence (Firestore + LocalStorage Fallback)
- **Firestore Real-Time Mode (`isFirebaseConfigured === true`):**
  - `.env` 파일에 `VITE_FIREBASE_API_KEY` 및 `VITE_FIREBASE_PROJECT_ID`가 설정되어 있으면 자동으로 Firebase Firestore와 연결됩니다.
  - `onSnapshot` 리스너를 통해 회원(`members`), 모임(`meetings`), 점수 로그(`scoreLogs`), 공지 설정(`settings/community`) 변경 사항이 모든 접속 기기에 실시간으로 반영됩니다.
  - DB가 비어 있는 최초 연결 시 초기 시드 데이터(`INITIAL_MEMBERS`, `INITIAL_MEETINGS` 등)를 자동으로 초기화할 수 있는 부트스트랩 로직을 포함합니다.
- **LocalStorage Persistent Fallback Mode (`isFirebaseConfigured === false`):**
  - 아직 `.env` 파일을 생성하지 않은 로컬 개발 단계에서는 브라우저 `localStorage`(`heal_community_v1_*`)에 모든 상태 변경을 자동 저장합니다.
  - 브라우저를 새로고침(`F5`)하더라도 온보딩으로 가입한 회원, 개설한 모임, 정산된 점수가 초기화되지 않고 그대로 유지됩니다.

### 2. Atomic Batch Settlement for Meetings (`writeBatch`)
- 모임 마감 및 점수 정산(`settleMeetingWithScores`) 실행 시 데이터 정합성을 보장하기 위해 단일 원자적 배치(`writeBatch`)로 다음 작업을 동시 처리합니다.
  1. 대상 모임(`meetings/{meetingId}`)의 `status`를 `'settled'`로 변경하고 `confirmedParticipants` 목록을 확정합니다.
  2. 실참석 확정된 각 회원(`members/{uid}`)의 `attendanceCount`를 `+1` 증가시키고, `baseScore`(`+1`), `expeditionScore`(타지역 원정 시 `+2`), `totalScore`, `monthlyScore`를 가산합니다.
  3. 각 참석자별 점수 획득 이력을 `scoreLogs/{logId}` 컬렉션에 생성합니다.

### 3. Firestore Security Rules (`firestore.rules`)
클라이언트 UI 우회 시도를 방지하기 위해 DB 레벨에서 다음 권한 규칙을 강제합니다.
- **신규 회원 온보딩 (`members` 생성):** 본인 UID 문서만 생성 가능하며, 초기 `role`은 반드시 `'Member'`, 초기 점수(`totalScore`)와 참석 횟수(`attendanceCount`)는 `0`이어야 합니다.
- **프로필 수정 (`members` 수정):** 일반 회원은 본인의 프로필 기본 항목(`realName`, `city`, `homeCity`, `maritalStatus`, `gender`)만 수정할 수 있으며, `role`(등급)이나 `customBadge`는 운영진(`Leader`, `Deputy`)만 변경할 수 있습니다.
- **모임 개설 (`meetings` 생성):** `attendanceCount >= 1`인 정식 회원 또는 운영진(`Leader`, `Deputy`)만 생성 가능하며, 공식 모임(`type == 'Official'`)은 운영진만 생성할 수 있습니다.
- **공지 및 설정 변경 (`settings/community`):** 운영진(`Leader`, `Deputy`)만 쓰기 권한을 가집니다.

### 4. Step-by-Step Firebase Console Setup Guide (사용자 설정 가이드)
실제 Firebase 서버와 연결하려면 아래 순서를 따라 `.env` 파일을 생성합니다.

1. **Firebase 프로젝트 생성:**
   - [Firebase Console](https://console.firebase.google.com/)에 접속하여 **[프로젝트 추가]**를 클릭하고 프로젝트(예: `heal-community`)를 생성합니다.
2. **Firestore Database 활성화:**
   - 좌측 메뉴 **[빌드] → [Firestore Database] → [데이터베이스 만들기]**를 클릭합니다.
   - 위치는 `asia-northeast3 (서울)`을 선택하고 생성합니다.
3. **웹 앱 등록 및 설정 키 복사:**
   - 프로젝트 개요 화면 상단에서 **웹 아이콘(`</>`)**을 클릭해 앱 닉네임(`heal-web`)을 등록합니다.
   - 출력되는 `firebaseConfig` 객체의 값들을 확인합니다.
4. **환경변수 파일(`.env`) 생성:**
   - 프로젝트 루트의 `.env.example` 파일을 복사하여 `.env` 파일을 만들고 복사한 키를 입력한 뒤 개발 서버(`npm run dev`)를 재시작하면 즉시 좌측 상단 상태 뱃지가 **`Firestore DB`**로 전환됩니다.

## Data Schema & API

### Firestore Collections Structure
- `members/{uid}`: 회원 프로필, 등급(`role`), 참석 횟수(`attendanceCount`), 점수(`baseScore`, `expeditionScore`, `eventScore`, `totalScore`, `monthlyScore`) 문서.
- `meetings/{meetingId}`: 모임 정보, 벙주(`hostUid`), 상태(`open` | `settled`), 신청자(`applicants`), 실참석자(`confirmedParticipants`) 문서.
- `scoreLogs/{logId}`: 회원별 점수 가감 상세 이력 문서.
- `settings/community`: 공지사항 제목(`noticeTitle`), 본문(`noticeBody`) 및 커뮤니티 기본 설정 단일 문서.

### Community Service Interface (`src/services/communityService.js`)
- `subscribeCommunityData(callbacks)`: 실시간 데이터 구독 (Firestore `onSnapshot` 또는 LocalStorage 이벤트 연결).
- `registerOnboardingMember(form)`: 신규 회원 온보딩 등록.
- `updateMemberProfile(uid, fields)`: 내 정보 프로필 업데이트.
- `toggleMeetingApplicant(meetingId, uid)`: 모임 참석 신청/취소 토글.
- `createMeeting(hostMember, meetingInput)`: 신규 모임(벙) 등록.
- `settleMeetingWithScores(meetingId, confirmedUids)`: 모임 마감 및 실참석자 점수·참석횟수 일괄 정산.
- `adminUpdateMember(targetUid, patch)`: 운영진 회원 등급/커스텀 뱃지 수정.
- `adminAdjustEventScore(targetUid, delta, reason)`: 운영진 수동 이벤트 점수 부여/차감.
- `updateCommunityConfig(configPatch)`: 운영진 공지사항/규칙 설정 저장.
- `resetToInitialDemoData()`: 테스트용 초기 데모 데이터로 리셋.

## Edge Cases & Validation
- **환경변수 누락 시 안전한 폴백:** `.env` 파일이 없거나 일부 키가 비어 있어도 앱이 크래시되지 않고 자동으로 `LocalStorage` 영구 저장 모드로 동작합니다.
- **중복 정산 방지:** `settleMeetingWithScores` 호출 시 대상 모임의 `status`가 이미 `'settled'`이면 즉시 실행을 중단하여 점수 중복 지급을 방지합니다.

## Test Scenarios
1. **브라우저 새로고침 영속성 검증:**
   - 모임 참석 신청, 신규 회원 온보딩, 또는 점수 정산을 수행한 뒤 브라우저를 새로고침(`F5`)했을 때 변경된 데이터와 로그인 계정이 그대로 유지되는지 확인.
2. **초기 데이터 리셋 검증:**
   - 테스트 도중 사이드바 하단의 `[데모 데이터 초기화]` 버튼을 클릭하면 초기 5명의 회원과 3개의 샘플 모임 상태로 깨끗하게 복원되는지 확인.
3. **Firebase 설정 전환 검증:**
   - `.env`에 유효한 Firebase 키 입력 시 `isFirebaseConfigured`가 `true`가 되고 Firestore 컬렉션과 동기화되는지 확인.

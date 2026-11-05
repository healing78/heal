# Bung Badge System & Historical Data Seeding Specification

## Overview
본 문서는 Healing78 커뮤니티의 공식 벙기록 아카이브(852회 이상)를 바탕으로 확립된 **마일스톤 뱃지 체계(Milestone Badge Tier)** 및 **역사적 벙기록 초기 데이터 주입(Seeding)과 실시간 동기화 환경**에 관한 기술 명세입니다.

## Business Rules & Logic

### 1. Distance & Expedition Scoring Rules (거리 가산점 규격)
- **기본 참석 점수**: 모임 참석 확정 시 **+1점**
- **타 권역 원정 점수**: 회원의 거주 도/권역과 다른 도의 모임 참석 시 **+1점 (총 2점)**
  - 서울·경기는 단일 권역으로 취급 (서울, 경기, 인천)
  - 충청권은 남도/북도 및 대전·세종 통합 취급
  - 전라권은 남도/북도 및 광주 통합 취급
  - 경상권은 남도/북도 및 부산·대구·울산 통합 취급
  - 강원도, 제주도 각각 독립 권역
- **해외 친구/원정 점수**: 해외 거주자 참석 또는 해외 모임 1회 참석 시 **+2점 (총 3점)**

### 2. Milestone Badge Tier Rules (금은동 및 동물 뱃지 체계)
회원의 누적 벙점수(`totalScore`)에 따라 아래 마일스톤 뱃지가 자동 산정되어 규격 닉네임 뒷자리에 부여됩니다.
500점 단위로 별(`⭐️`)이 누적되며, 메달과 동물이 순환 결합됩니다.

| 최소 점수 | 뱃지 | 설명 |
| :--- | :--- | :--- |
| **15점** | 🦓 | 멈춰있는 얼룩말 |
| **30점** | 🐎 | 달리는 말 |
| **50점** | 🐴 | 대왕말 |
| **78점** | 🦄 | 유니콘 |
| **100점** | 🥉 | 동메달 |
| **200점** | 🥈 | 은메달 |
| **300점** | 🥇 | 금메달 |
| **400점** | 🏆 | 트로피 |
| **500점** | ⭐️ | 별 (1개) |
| **600점** | ⭐️🥉 | 별 1개 + 동메달 (500단위 반복 순환) |

#### 결합 계산식:
- `starCount = Math.floor(totalScore / 500)`
- `rem500 = totalScore % 500`
- 메달: `rem500 >= 400 ? '🏆' : rem500 >= 300 ? '🥇' : rem500 >= 200 ? '🥈' : rem500 >= 100 ? '🥉' : ''`
- 동물: `rem100 = rem500 % 100` 기준 `>= 78 ? '🦄' : >= 50 ? '🐴' : >= 30 ? '🐎' : >= 15 ? '🦓' : ''`
- 결합 예시:
  - 115점: `🥉🦓` (동메달 + 얼룩말)
  - 278점: `🥈🦄` (은메달 + 유니콘)
  - 360점: `🥇🐴` (금메달 + 대왕말)
  - 450점: `🏆🐴` (트로피 + 대왕말)
  - 600점: `⭐️🥉` (별 1개 + 동메달)
  - 15점 미만: 기본 가입일 뱃지(`entryBadge`, 예: `0829`) 또는 기본값 노출

## Data Schema & API

### 1. Seeding Data Files
- **`src/core/initialData.js`**:
  - `INITIAL_MEMBERS`: 142명 이상의 실제 벙기록 회원 데이터 (누적 점수, 참석 횟수, 원정 점수, 주최 횟수 등 정밀 반영)
  - `INITIAL_MEETINGS`: 최근 60개 모임의 참석자, 차수, 정산 상태가 복원된 모임 목록
  - `INITIAL_COMMUNITY_CONFIG`: 뱃지 체계 및 거리 가산점 안내 문구가 반영된 기본 설정
- **`scripts/data/full_bung_data.json`**:
  - 총 852회 전체 벙기록과 270명 전체 참여 인원이 포함된 완전 백업 아카이브 JSON

### 2. Synchronization APIs & Tools
- **CLI Script**: `npm run seed:bung` (`scripts/seed-bung-records.mjs`)
- **Service API**: `batchSyncCommunityData(members, meetings, config)`
  - Firestore의 500건 writeBatch 제한을 방지하기 위해 350건 단위로 청크 분할 커밋
  - LocalStorage 및 Firestore 동시 업데이트
- **SuperAdmin UI Console** (`SuperAdminPage.jsx`):
  - **원클릭 시드 동기화**: `⚡ 공식 벙기록 표준 시드 즉시 동기화`
  - **텍스트 파서 동기화**: `📋 벙기록 텍스트 직접 입력 / 파싱 동기화` (정규표현식 기반 실시간 클라이언트 파싱)

## Edge Cases & Validation
1. **Firestore Batch Limit**: 대량의 회원 및 모임 데이터 저장 시 `350`건 단위로 청크 분할하여 `Transaction too big` 에러 방지.
2. **이름 색상 표기 준수**: 한국 문화 정책에 따라 회원의 실명/닉네임은 `rose` 테마에서도 빨간색으로 표기되지 않고 기본 텍스트 색상을 유지.
3. **15점 미만 신규 회원**: 마일스톤 동물이 부여되지 않으므로 기존 가입일(`entryBadge`, MMDD) 뱃지로 폴백 처리.

## Test Scenarios
1. **뱃지 계산 검증**:
   - 360점(쭈) -> `🥇🐴`
   - 246점(봄날) -> `🥈🐎`
   - 117점(주명) -> `🥉🦓`
   - 96점(포맨) -> `🦄`
   - 74점(붕어) -> `🐴`
   - 49점(사마) -> `🐎`
   - 28점(까꽁) -> `🦓`
   - 14점(지오) -> 기본 가입일 뱃지
2. **빌드 및 런타임 검증**:
   - `npm run build` 정상 통과 확인
   - `SuperAdminPage`에서 표준 시드 반영 및 텍스트 파싱 정상 동작 확인

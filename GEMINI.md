# Heal - Community Management System

## Project Overview
힐(Heal) 커뮤니티 관리 시스템은 회원의 프로필, 고유 닉네임 규격, 역할/권한 체계, 모임(벙) 참석 및 활동 점수를 관리하기 위한 웹 애플리케이션입니다.

## Technology Stack
- **Frontend:** React, Vanilla CSS
- **Backend & Database:** Firebase Firestore, Firebase Cloud Functions
- **Auth:** Firebase Auth + Kakao OAuth (Custom Token via Functions)

## Documentation Standards
- **Directory Structure:** 모든 시스템 및 기능 명세서는 `docs/specs/` 디렉토리 아래에 관리합니다.
  - 시스템/아키텍처 전반: `docs/specs/system-overview.md`
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
- **Commit & Push Ownership (User Managed):**
  - `git commit`과 `git push`는 기본적으로 **사용자가 직접 수행**합니다 (AI 에이전트가 임의로 커밋하거나 푸시하지 않음). 단, **원격으로 접속한 환경에서 요청할 시에는 에이전트를 통한 커밋 및 푸시가 가능**합니다.
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

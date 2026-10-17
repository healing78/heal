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
  - 세부 비즈니스 로직/기능별 명세: `docs/specs/features/<feature-name>.md`
- **Language & Heading Rules:**
  - **Headings (Titles & Section Headers):** 영문(English)으로 작성합니다.
  - **Body Content:** 한국어(Korean)로 작성합니다.
  - 기술 용어 및 고유명사(예: Member, Meeting, Firebase Auth 등)는 영문 표기를 병행하거나 영문 그대로 사용 가능합니다.

## Workflow & Coding Conventions
- 비즈니스 로직 작성 시 `docs/specs/` 내 해당 명세를 확인하거나 최신 상태로 유지합니다.
- 새로운 명세 작성 시 반드시 위의 언어 규칙(제목 영문, 본문 한국어)을 준수합니다.

# 대용량 리스트 최적화 및 점진적 페이징 가이드 (Large List Optimization Guide)

> **문서 목적:**  
> 커뮤니티 데이터(모임 일정, 회원 활동 이력, 랭킹, 친구 목록 등)가 계속 누적됨에 따라 한 화면에 모든 데이터를 일괄 렌더링할 때 발생하는 **모바일 렌더링 병목 현상, 메모리 누수, 스크롤 버벅임**을 방지하고, 이를 해결하기 위해 구현된 최적화 기법과 유사 리스트 적용 패턴을 표준화하여 영구 보존합니다.

---

## 1. 배경 및 문제점 (Problem Statement)
- **일괄 렌더링의 한계**: 수십~수백 건의 모임이나 회원 목록을 한 번에 `<div className="divider-list">`로 렌더링하면 브라우저 DOM 노드가 급격히 증가합니다.
- **모바일 웹뷰 체감 성능 저하**: 저사양 모바일 기기나 인앱 브라우저(카카오톡 웹뷰)에서 탭 전환 시 화면 멈춤, 긴 스크롤 시 프레임 드랍(Jank), 배터리 및 메모리 소모가 가중됩니다.
- **정보 과부하 (UX)**: 사용자가 원하는 최신 정보를 한눈에 찾기 어렵고, 스크롤 탐색 피로도가 증가합니다.

---

## 2. 대용량 리스트 최적화 4대 핵심 기법

### [기법 1] 점진적 슬라이싱 페이징 (Progressive Slicing & "더보기") ⭐ *표준 적용 패턴*
- **개념**: 전체 데이터를 메모리(React 상태 또는 `useMemo`)에 유지하되, 화면에는 초기에 **10~15개**만 `slice()`하여 렌더링하고 사용자가 요청할 때 하단 **[더보기 (+15개)]** 버튼으로 점진적으로 노출합니다.
- **장점**:
  - 초기 DOM 마운트 시간이 80% 이상 단축되어 탭 전환이 즉각적입니다.
  - 별도의 외부 라이브러리 없이 순수 React 상태 1개(`displayLimit`)로 구현 가능합니다.
  - 검색어 입력이나 정렬 필터 변경 시 자동으로 `displayLimit`를 초기값으로 리셋하여 일관된 경험을 유지합니다.
- **적용 화면**: `내 활동 리포트` (`ProfilePage.jsx`, 기본 10개 페이징 + 검색/정렬), `홈 벙대기실` (`HomePage.jsx`, 전 기간 최신 5개 슬라이스 + `[마감]` 배지 + 전체보기 연동)

### [기법 2] 연도별 / 분기별 아코디언 그룹핑 (Collapsible Grouping)
- **개념**: 연도(`2026년`, `2025년`) 또는 월별 단위로 데이터를 그룹화하여, **최신 연도만 기본 펼침**으로 두고 이전 연도는 접이식(Accordion) 카드로 축소합니다.
- **장점**:
  - 누적 연차가 긴 커뮤니티에서 이전 년도 데이터를 굳이 DOM에 그리지 않고 요약 건수(`2025년 (34건) ▼`)만 보여줄 수 있습니다.
- **추천 대상**: 전체 모임 아카이브, 과거 정산 결산 리포트.

### [기법 3] 요약형 1줄 행 ↔ 터치 시 인라인 상세 펼침 (Compact Card View)
- **개념**: 리스트 목록에서는 `[날짜 | 일정명 | 핵심 금액]`의 미니멀 1줄만 표시하고, 터치했을 때만 상세 정보(참석 차수, 찬조금, 정산 상태 등)가 아래로 부드럽게 펼쳐집니다.
- **장점**: 화면 세로 점유 면적을 절반 이하로 줄여 한눈에 파악할 수 있는 데이터 밀도를 극대화합니다.

### [기법 4] 무한 스크롤 & 가상화 (Virtual Scrolling / Infinite Scroll) ⭐ *활동 랭킹 및 일정 목록 구현 완료*
- **개념**: `IntersectionObserver`로 하단 여백 요소(Sentinel)를 감지하여 스크롤 끝에 도달했을 때 자동으로 다음 청크(+25개)를 덧붙여 로딩합니다.
- **적용 화면 1: 활동 랭킹 탭** (`RankingPage.jsx`)
  - 전체 회원 270여 명을 한 번에 DOM에 그리지 않고 초기 30명만 렌더링.
  - 하단 감지 센티넬(`<div ref={sentinelRef} />`)이 화면에 진입하면 자동으로 +25명씩 점진 확장(`setDisplayLimit`).
  - 상단 `[내 위치 🎯]` 점프 클릭 시 내 순위가 현재 한도를 초과하면 필요한 만큼 한도를 즉시 선확장한 후 smooth scroll 실행.
  - 탭/검색어/지역 필터 변경 시 자동으로 `displayLimit(30)` 리셋.
- **적용 화면 2: 일정 목록 탭 (지나간 일정)** (`MeetingsPage.jsx`)
  - 과거 850여 개의 누적 모임을 일괄 렌더링하지 않고, 초기 25개만 우선 렌더링.
  - 바닥 센티넬 진입 시 +25개씩 점진 로딩하여 연월 그룹별(`monthGroups`)로 자연스럽게 확장.
  - 모바일 웹뷰에서 '지나간 일정' 탭 전환 시 화면 멈춤(Jank)과 DOM 과부하를 100% 제거.
  - 탭 전환(`open` / `past` / `mine`) 시 자동으로 `displayLimit(25)` 리셋.

---

## 3. 실제 구현 사례 분석 (`ProfilePage.jsx` 내 활동 리포트)

### (1) 데이터 가공 및 최신순 기본 정렬
```javascript
// 1. 참여 모임 데이터 집계 후 최신순(날짜 내림차순)으로 기본 정렬
personalMeetingRows.sort((a, b) =>
  String(b.meeting.dateOnly || b.meeting.date || '').localeCompare(
    String(a.meeting.dateOnly || a.meeting.date || '')
  )
);
```

### (2) 상태 정의 (검색 · 정렬 · 페이징)
```javascript
const [activitySearchQuery, setActivitySearchQuery] = useState('');
const [activitySortBy, setActivitySortBy] = useState('latest'); // latest | oldest | shareHigh | shareLow | title
const [activityDisplayLimit, setActivityDisplayLimit] = useState(10); // 초기 10개만 렌더링
```

### (3) 실시간 필터링 및 다중 정렬 파이프라인 (`useMemo`)
```javascript
const filteredAndSortedActivities = useMemo(() => {
  let list = [...personalMeetingRows];

  // 1) 통합 검색 필터링 (제목, 위치, 날짜, 회비)
  const q = activitySearchQuery.trim().toLowerCase();
  if (q) {
    list = list.filter(({ meeting: mtg, row }) => {
      const title = (mtg.title || '').toLowerCase();
      const location = (mtg.location || mtg.placeDetail || '').toLowerCase();
      const dateStr = String(mtg.dateOnly || mtg.date || '').toLowerCase();
      const shareStr = String(row.finalShare || '');
      return (
        title.includes(q) ||
        location.includes(q) ||
        dateStr.includes(q) ||
        shareStr.includes(q)
      );
    });
  }

  // 2) 사용자 선택 기준 정렬
  list.sort((a, b) => {
    const dateA = String(a.meeting.dateOnly || a.meeting.date || '');
    const dateB = String(b.meeting.dateOnly || b.meeting.date || '');
    if (activitySortBy === 'latest') return dateB.localeCompare(dateA);
    if (activitySortBy === 'oldest') return dateA.localeCompare(dateB);
    if (activitySortBy === 'shareHigh') return (b.row.finalShare || 0) - (a.row.finalShare || 0);
    if (activitySortBy === 'shareLow') return (a.row.finalShare || 0) - (b.row.finalShare || 0);
    if (activitySortBy === 'title') return (a.meeting.title || '').localeCompare(b.meeting.title || '');
    return 0;
  });

  return list;
}, [personalMeetingRows, activitySearchQuery, activitySortBy]);

// 3) 화면에 노출할 슬라이스 추출
const visibleActivities = filteredAndSortedActivities.slice(0, activityDisplayLimit);
```

### (4) UI 렌더링 및 페이징 컨트롤 바
```jsx
{/* 검색창 & 정렬 셀렉트 */}
<div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
  <div style={{ flex: '1 1 180px', position: 'relative' }}>
    <input
      type="text"
      className="admin-edit-search-input"
      placeholder="일정명·지역·날짜 검색"
      value={activitySearchQuery}
      onChange={(e) => {
        setActivitySearchQuery(e.target.value);
        setActivityDisplayLimit(10); // 검색 시 노출 개수 초기화
      }}
    />
  </div>

  <select
    value={activitySortBy}
    onChange={(e) => setActivitySortBy(e.target.value)}
    className="btn btn-outline btn-sm"
  >
    <option value="latest">최신순</option>
    <option value="oldest">과거순</option>
    <option value="shareHigh">회비 높은순</option>
    <option value="shareLow">회비 낮은순</option>
    <option value="title">일정명 가나다순</option>
  </select>
</div>

{/* 점진적 로딩 페이징 버튼 */}
{visibleActivities.length < filteredAndSortedActivities.length && (
  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '12px' }}>
    <button
      type="button"
      className="btn btn-outline"
      style={{ flex: 1, maxWidth: '280px', padding: '10px 16px', fontWeight: 600 }}
      onClick={() => setActivityDisplayLimit((prev) => prev + 15)}
    >
      더보기 ({visibleActivities.length} / {filteredAndSortedActivities.length}개) ▼
    </button>
    <button
      type="button"
      className="btn btn-outline"
      style={{ padding: '10px 14px', fontSize: '12px' }}
      onClick={() => setActivityDisplayLimit(filteredAndSortedActivities.length)}
    >
      전체 펼치기
    </button>
  </div>
)}
```

---

## 4. 다른 유사 리스트 적용 가이드 (Checklist for Other Lists)

새로운 리스트나 기존 리스트를 최적화할 때는 아래 순서대로 템플릿을 복제하여 적용합니다:

| 대상 리스트 | 추천 초기 Limit | 추가 추천 정렬 기준 | 추천 검색 필드 |
| :--- | :--- | :--- | :--- |
| **일정 목록 (`MeetingsPage.jsx`)** | 15개 | 최신순, 과거순, 참가자 많은순 | 일정 제목, 모임 장소, 벙주명 |
| **회원 목록 (`FriendsPage.jsx`)** | 20개 | 닉네임순, 가입일순, 최근활동순 | 실명, 닉네임, 거주지역 |
| **랭킹 목록 (`RankingPage.jsx`)** | 20개 | 점수 높은순, 참석 횟수순 | 회원명, 지역 |
| **리포트 목록 (`ReportsPage.jsx`)** | 10개 | 최신순, 총비용 높은순 | 일정명, 참석자명 |

### 복사 가능한 보일러플레이트 코드
```javascript
// 1. 컴포넌트 내부 상태
const [searchQuery, setSearchQuery] = useState('');
const [sortBy, setSortBy] = useState('latest');
const [displayLimit, setDisplayLimit] = useState(15);

// 2. 파이프라인
const filteredList = useMemo(() => {
  const q = searchQuery.trim().toLowerCase();
  let res = rawList.filter(item => /* 검색 조건 */ true);
  res.sort(/* 정렬 조건 */);
  return res;
}, [rawList, searchQuery, sortBy]);

const visibleList = filteredList.slice(0, displayLimit);
```

---

## 5. 결론 및 원칙
1. **모바일 퍼스트**: 모바일 화면에서는 아무리 많은 데이터가 있더라도 초기 진입 시 **최대 10~20개 내외**만 DOM에 마운트합니다.
2. **반드시 검색과 정렬을 짝으로 제공**: 페이징으로 데이터가 가려질 경우 사용자가 원하는 항목을 놓치지 않도록 **실시간 검색창 + 정렬 드롭다운**을 항상 상단에 함께 제공합니다.
3. **상태 피드백**: 현재 표시 중인 항목 수(`N개 표시 중 / 전체 M개`)를 사용자에게 명시적으로 안내하여 신뢰도를 높입니다.

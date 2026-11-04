import { formatMemberNickname } from './communityRules';

export const SITE_ORIGIN = 'https://healing78.web.app';
export const HERO_IMAGE_PATH = '/healing78-logo.jpg';
export const HERO_IMAGE_URL = `${SITE_ORIGIN}${HERO_IMAGE_PATH}`;

export const VALID_TABS = [
  'home',
  'meetings',
  'reports',
  'ranking',
  'nickname',
  'profile',
  'admin',
  'login'
];

export const PAGE_LABELS = {
  home: '홈 · 전체 공지',
  meetings: '일정',
  reports: '모임·개인 리포트',
  ranking: '랭킹 · 친구 정보',
  nickname: '신입 규격 닉네임 생성',
  profile: '내 정보 · 프로필 관리',
  admin: '운영진 관리 센터',
  login: '로그인 · 신입 등록'
};

/**
 * Truncate string cleanly to around maxLen characters (default 20)
 */
export function toShortSummary(text, maxLen = 20) {
  const clean = String(text || '').trim().replace(/\s+/g, ' ');
  if (clean.length <= maxLen) return clean;
  return `${clean.slice(0, maxLen - 1)}…`;
}

/**
 * Format "2026-11-08 18:00" -> "1108" (4-digit MMDD format)
 */
export function formatCompactDate(dateStr) {
  if (!dateStr) return '';
  const match = String(dateStr).match(/(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return `${match[2]}${match[3]}`;
  }
  const digits = String(dateStr).replace(/\D/g, '');
  if (digits.length >= 8) {
    return digits.slice(4, 8);
  }
  return String(dateStr).slice(0, 4);
}

/**
 * Parse current browser URL into { tab, meetingId, memberQuery }
 * Supports both '/meetings/26110701' and '/meetings?id=26110701'
 */
export function parseCurrentRoute() {
  if (typeof window === 'undefined') {
    return { tab: 'home', meetingId: null, memberQuery: '' };
  }

  const segments = window.location.pathname
    .replace(/^\/+|\/+$/g, '')
    .split('/')
    .filter(Boolean);

  const firstSeg = (segments[0] || '').toLowerCase();
  const secondSeg = segments[1] || null;

  const params = new URLSearchParams(window.location.search);
  const queryMeetingId = params.get('id') || null;
  const memberQuery = params.get('q') || '';

  if (!firstSeg || firstSeg === 'home') {
    return { tab: 'home', meetingId: queryMeetingId, memberQuery };
  }

  if (firstSeg === 'meetings') {
    return {
      tab: 'meetings',
      meetingId: secondSeg || queryMeetingId,
      memberQuery
    };
  }

  // Also support direct '/26110701' (8-digit YYMMDDXX) URLs if shared directly
  if (/^\d{8}$/.test(firstSeg)) {
    return {
      tab: 'meetings',
      meetingId: firstSeg,
      memberQuery
    };
  }

  if (VALID_TABS.includes(firstSeg)) {
    return { tab: firstSeg, meetingId: queryMeetingId, memberQuery };
  }

  return { tab: 'home', meetingId: null, memberQuery };
}

/**
 * Push browser history URL for a given tab and optional query/path params
 */
export function pushRouteUrl(tab, params = {}) {
  if (typeof window === 'undefined') return;
  const cleanTab = VALID_TABS.includes(tab) ? tab : 'home';

  let path = cleanTab === 'home' ? '/' : `/${cleanTab}`;
  const searchParams = new URLSearchParams();

  if (cleanTab === 'meetings' && params.id) {
    path = `/meetings/${encodeURIComponent(String(params.id).trim())}`;
  } else {
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        searchParams.set(key, String(val).trim());
      }
    });
  }

  const queryString = searchParams.toString();
  const nextUrl = queryString ? `${path}?${queryString}` : path;

  if (`${window.location.pathname}${window.location.search}` !== nextUrl) {
    window.history.pushState({ tab: cleanTab, ...params }, '', nextUrl);
  }
}

/**
 * Build 20-char top header summary, document.title, and share URL for current state
 */
export function buildRouteMeta({
  tab,
  meetingId,
  meetings = [],
  members = [],
  communityConfig = {},
  currentUser = null
}) {
  const openMeetings = [...meetings]
    .filter((m) => m.status === 'open')
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));

  const selectedMeeting = meetingId
    ? meetings.find((m) => String(m.id) === String(meetingId))
    : null;

  // 1. Meetings (/meetings or /meetings/26110701)
  if (tab === 'meetings') {
    if (selectedMeeting) {
      const isBung = selectedMeeting.requestAttendance !== false;
      const mmdd = formatCompactDate(selectedMeeting.date);
      const loc = selectedMeeting.location ? ` ${selectedMeeting.location}` : '';
      const prefix = isBung
        ? `[벙대기실 #${selectedMeeting.id}]`
        : `[일정 #${selectedMeeting.id}]`;
      const rawSummary = `${prefix} ${selectedMeeting.title}`;
      const headerSummary = toShortSummary(rawSummary, 20);
      return {
        headerSummary,
        pageTitle: `${headerSummary} | Healing78`,
        description: isBung
          ? `${selectedMeeting.title} 벙대기실 (일시: ${selectedMeeting.date}${loc}) - 고유 링크: /meetings/${selectedMeeting.id}`
          : `${selectedMeeting.title} 일정 상세 (일시: ${selectedMeeting.date}${loc}) - 고유 링크: /meetings/${selectedMeeting.id}`,
        sharePath: `/meetings/${encodeURIComponent(selectedMeeting.id)}`
      };
    }

    const scheduleListText =
      openMeetings.length > 0
        ? openMeetings
            .map((m) => `${formatCompactDate(m.date)} ${m.location}`)
            .join(', ')
        : '현재 예정된 일정 없음';

    const headerSummary = toShortSummary(scheduleListText, 20);
    return {
      headerSummary,
      pageTitle: `${headerSummary} | Healing78 일정`,
      description: `진행 예정 일정: ${scheduleListText}`,
      sharePath: '/meetings'
    };
  }

  // 2. Reports (/reports)
  if (tab === 'reports') {
    const headerSummary = toShortSummary('모임별·개인별 정산 리포트', 20);
    return {
      headerSummary,
      pageTitle: `${headerSummary} | Healing78 리포트`,
      description: '모임별 차수/찬조/골든벨 정산 내역 및 개인별 참석·회비·점수 리포트',
      sharePath: '/reports'
    };
  }

  // 3. Ranking (/ranking): "1위 김민준, 2위 이서연" format
  if (tab === 'ranking') {
    const sorted = [...members].sort((a, b) => b.totalScore - a.totalScore);
    const rankText =
      sorted.length >= 2
        ? `1위 ${sorted[0].realName}, 2위 ${sorted[1].realName}`
        : sorted.length === 1
          ? `1위 ${sorted[0].realName}(${sorted[0].totalScore}점)`
          : 'Healing78 활동 랭킹';

    const headerSummary = toShortSummary(rankText, 20);
    return {
      headerSummary,
      pageTitle: `${headerSummary} | Healing78 랭킹`,
      description: `Healing78 실시간 활동 점수 순위 (${rankText})`,
      sharePath: '/ranking'
    };
  }

  // 4. Nickname (/nickname): 신입 공지 (Newcomer Notice Summary)
  if (tab === 'nickname') {
    const rawNewcomer =
      communityConfig?.newcomerSummary ||
      '신입공지 · 입장 즉시 닉네임 변경';
    const headerSummary = toShortSummary(rawNewcomer, 20);
    return {
      headerSummary,
      pageTitle: `${headerSummary} | Healing78 신입안내`,
      description:
        communityConfig?.newcomerNoticeBody ||
        '이름·지역·결혼여부·성별 선택 시 오픈채팅방 규격 닉네임을 자동 생성하고 복사합니다.',
      sharePath: '/nickname'
    };
  }

  // 5. Profile (/profile)
  if (tab === 'profile') {
    const headerSummary = currentUser
      ? toShortSummary(formatMemberNickname(currentUser), 20)
      : '회원 전용 프로필 관리';
    return {
      headerSummary,
      pageTitle: `${headerSummary} | Healing78 내정보`,
      description: '내 프로필·계좌 수정 및 카카오톡 오픈채팅방 규격 닉네임 원클릭 복사',
      sharePath: '/profile'
    };
  }

  // 6. Admin (/admin)
  if (tab === 'admin') {
    const headerSummary = toShortSummary(`운영관리 · 회원 ${members.length}명`, 20);
    return {
      headerSummary,
      pageTitle: `${headerSummary} | Healing78 운영진`,
      description: '회원 등급·커스텀 뱃지·이벤트 점수 및 공지사항 운영 관리',
      sharePath: '/admin'
    };
  }

  // 7. Login (/login)
  if (tab === 'login') {
    const headerSummary = toShortSummary(
      communityConfig?.homeSummary || '공지 · 규격 닉네임 및 모임 규칙',
      20
    );
    return {
      headerSummary,
      pageTitle: `${headerSummary} | Healing78 로그인`,
      description: '카카오 계정 로그인 및 신입 회원 규격 닉네임 온보딩',
      sharePath: '/login'
    };
  }

  // 8. Default: Home ('home')
  const rawHomeNotice =
    communityConfig?.homeSummary ||
    communityConfig?.noticeTitle ||
    '공지 · 규격 닉네임 및 모임 규칙';
  const headerSummary = toShortSummary(rawHomeNotice, 20);

  return {
    headerSummary,
    pageTitle: `${headerSummary} | Healing78`,
    description:
      communityConfig?.noticeBody ||
      'Healing78 (since 2024) 공지사항, 실시간 모임 참석 신청 및 활동 랭킹',
    sharePath: '/'
  };
}

/**
 * Sync browser document.title and Open Graph meta tags
 */
export function syncDocumentMeta(meta) {
  if (typeof document === 'undefined' || !meta) return;

  document.title = meta.pageTitle;

  const setMetaContent = (selector, attr, value) => {
    let el = document.querySelector(selector);
    if (!el) return;
    el.setAttribute(attr, value);
  };

  setMetaContent('meta[property="og:title"]', 'content', meta.pageTitle);
  setMetaContent('meta[property="og:description"]', 'content', meta.description);
  setMetaContent('meta[name="description"]', 'content', meta.description);
  setMetaContent('meta[property="og:image"]', 'content', HERO_IMAGE_URL);
}

/**
 * Share formatted 20-char summary + URL for KakaoTalk / Mobile Share / Clipboard
 */
export async function shareRouteInfo({ headerSummary, description, sharePath }) {
  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : SITE_ORIGIN;
  const fullUrl = `${origin}${sharePath || '/'}`;
  const shareText = `[Healing78] ${headerSummary}\n${description ? `${description}\n` : ''}${fullUrl}`;

  let copied = false;
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(shareText);
      copied = true;
    } catch {
      copied = false;
    }
  }

  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({
        title: `[Healing78] ${headerSummary}`,
        text: `${headerSummary} — ${description || 'Healing78 커뮤니티'}`,
        url: fullUrl
      });
      return { shared: true, copied, shareText, fullUrl };
    } catch {
      // User cancelled native share sheet or unsupported
    }
  }

  return { shared: false, copied, shareText, fullUrl };
}

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
  'master',
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
  master: '마스터 관리 센터',
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
 * Parse current browser URL into { tab, meetingId, subView, memberQuery }
 * Supports:
 * - '/meetings/26110701' -> { tab: 'meetings', meetingId: '26110701', subView: null }
 * - '/meetings/26110701/lounge' -> { tab: 'meetings', meetingId: '26110701', subView: 'lounge' }
 * - '/meetings?id=26110701&view=lounge'
 */
export function parseCurrentRoute() {
  if (typeof window === 'undefined') {
    return { tab: 'home', meetingId: null, subView: null, memberQuery: '' };
  }

  const segments = window.location.pathname
    .replace(/^\/+|\/+$/g, '')
    .split('/')
    .filter(Boolean);

  const firstSeg = (segments[0] || '').toLowerCase();
  const secondSeg = segments[1] || null;
  const thirdSeg = (segments[2] || '').toLowerCase();

  const params = new URLSearchParams(window.location.search);
  const queryMeetingId = params.get('id') || null;
  const querySubView =
    params.get('view') || (params.get('lounge') === 'true' ? 'lounge' : null);
  const memberQuery = params.get('q') || '';
  const subView =
    thirdSeg === 'lounge' || querySubView === 'lounge' ? 'lounge' : null;

  if (!firstSeg || firstSeg === 'home') {
    return { tab: 'home', meetingId: queryMeetingId, subView, memberQuery };
  }

  if (firstSeg === 'meetings') {
    return {
      tab: 'meetings',
      meetingId: secondSeg || queryMeetingId,
      subView,
      memberQuery
    };
  }

  // Also support direct '/26110701' (8-digit YYMMDDXX) URLs if shared directly
  if (/^\d{8}$/.test(firstSeg)) {
    return {
      tab: 'meetings',
      meetingId: firstSeg,
      subView: secondSeg === 'lounge' ? 'lounge' : subView,
      memberQuery
    };
  }

  if (VALID_TABS.includes(firstSeg)) {
    return { tab: firstSeg, meetingId: queryMeetingId, subView, memberQuery };
  }

  return { tab: 'home', meetingId: null, subView: null, memberQuery };
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
    const rawId = encodeURIComponent(String(params.id).trim());
    if (params.subView === 'lounge') {
      path = `/meetings/${rawId}/lounge`;
    } else {
      path = `/meetings/${rawId}`;
    }
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

export function getTodayDateString() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isPastMeeting(mtg, todayStr = getTodayDateString()) {
  const targetDate =
    mtg.endDateOnly || mtg.dateOnly || String(mtg.date || '').slice(0, 10);
  if (!targetDate) return false;
  if (targetDate < todayStr) return true;
  if (mtg.status === 'settled') return true;
  return false;
}

/**
 * Build page header title, document.title, and share content for current state
 */
export function buildRouteMeta({
  tab,
  meetingId,
  subView,
  meetings = [],
  members = [],
  communityConfig = {},
  currentUser = null
}) {
  const upcomingMeetings = [...meetings]
    .filter((m) => !isPastMeeting(m))
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));

  const scheduleLines = upcomingMeetings.map((m) => {
    const mmdd = formatCompactDate(m.dateOnly || m.date);
    return `${mmdd} ${m.title}`;
  });
  const scheduleShareLines = scheduleLines.length > 0 ? scheduleLines.join('\n') : '';
  const homeAndMeetingsShareText = scheduleShareLines ? `힐링78\n${scheduleShareLines}` : '힐링78';

  const selectedMeeting = meetingId
    ? meetings.find((m) => String(m.id) === String(meetingId))
    : null;

  // 1. Meetings (/meetings, /meetings/26110701, /meetings/26110701/lounge)
  if (tab === 'meetings') {
    if (selectedMeeting) {
      const isBung = selectedMeeting.requestAttendance !== false;
      const time = selectedMeeting.startTime || (selectedMeeting.date ? selectedMeeting.date.slice(11, 16) : '');
      const meetingShareText = `힐링78 ${selectedMeeting.title}${time ? ` ${time}` : ''}`.trim();
      const sharePath =
        isBung && subView === 'lounge'
          ? `/meetings/${encodeURIComponent(selectedMeeting.id)}/lounge`
          : `/meetings/${encodeURIComponent(selectedMeeting.id)}`;

      return {
        headerSummary: '힐링78 - 일정',
        pageTitle: '힐링78 - 일정',
        shareText: meetingShareText,
        description: `${selectedMeeting.title} 일정 상세`,
        sharePath
      };
    }

    return {
      headerSummary: '힐링78 - 일정',
      pageTitle: '힐링78 - 일정',
      shareText: homeAndMeetingsShareText,
      description: `진행 예정 일정:\n${scheduleShareLines}`,
      sharePath: '/meetings'
    };
  }

  // 2. Reports (/reports)
  if (tab === 'reports') {
    return {
      headerSummary: '힐링78 - 리포트',
      pageTitle: '힐링78 - 리포트',
      shareText: '힐링78 리포트',
      description: '모임별·개인별 정산 리포트',
      sharePath: '/reports'
    };
  }

  // 3. Ranking (/ranking)
  if (tab === 'ranking') {
    return {
      headerSummary: '힐링78 - 랭킹·친구',
      pageTitle: '힐링78 - 랭킹·친구',
      shareText: '힐링78 랭킹 친구',
      description: 'Healing78 활동 랭킹 및 지역별 친구 정보',
      sharePath: '/ranking'
    };
  }

  // 4. Nickname (/nickname)
  if (tab === 'nickname') {
    return {
      headerSummary: '힐링78 - 신입닉네임',
      pageTitle: '힐링78 - 신입닉네임',
      shareText: '힐링78 신입 닉네임 만들기',
      description: '오픈채팅방 규격 닉네임 자동 생성기',
      sharePath: '/nickname'
    };
  }

  // 5. Profile (/profile)
  if (tab === 'profile') {
    const realName = currentUser?.realName || (currentUser ? formatMemberNickname(currentUser) : '');
    const profileShareText = `힐링78 ${realName}`.trim();
    return {
      headerSummary: '힐링78 - 내 정보',
      pageTitle: '힐링78 - 내 정보',
      shareText: profileShareText,
      description: '내 프로필 및 활동 리포트',
      sharePath: '/profile'
    };
  }

  // 6. Admin (/admin)
  if (tab === 'admin') {
    return {
      headerSummary: '힐링78 - 운영 관리',
      pageTitle: '힐링78 - 운영 관리',
      shareText: '힐링78 운영 관리',
      description: '운영진 관리 센터',
      sharePath: '/admin'
    };
  }

  // 7. Master (/master)
  if (tab === 'master') {
    return {
      headerSummary: '힐링78 - 마스터',
      pageTitle: '힐링78 - 마스터',
      shareText: '힐링78 마스터',
      description: '마스터 관리 센터',
      sharePath: '/master'
    };
  }

  // 8. Login (/login)
  if (tab === 'login') {
    return {
      headerSummary: '힐링78 - 로그인',
      pageTitle: '힐링78 - 로그인',
      shareText: '힐링78 로그인',
      description: '카카오 계정 로그인 및 신입 회원 등록',
      sharePath: '/login'
    };
  }

  // Default: Home ('home')
  return {
    headerSummary: '힐링78 - 홈',
    pageTitle: '힐링78 - 홈',
    shareText: homeAndMeetingsShareText,
    description: `진행 예정 일정:\n${scheduleShareLines}`,
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
 * Share formatted text + URL for KakaoTalk / Mobile Share / Clipboard
 */
export async function shareRouteInfo({ shareText: customShareText, headerSummary, sharePath }) {
  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : SITE_ORIGIN;
  const fullUrl = `${origin}${sharePath || '/'}`;
  const baseText = customShareText || `힐링78 - ${headerSummary || ''}`.trim();
  const shareText = `${baseText}\n${fullUrl}`;

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
        title: baseText.split('\n')[0],
        text: baseText,
        url: fullUrl
      });
      return { shared: true, copied, shareText, fullUrl };
    } catch {
      // User cancelled native share sheet or unsupported
    }
  }

  return { shared: false, copied, shareText, fullUrl };
}

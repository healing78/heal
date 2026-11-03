export const SITE_ORIGIN = 'https://healing78.web.app';
export const HERO_IMAGE_PATH = '/healing78-logo.jpg';
export const HERO_IMAGE_URL = `${SITE_ORIGIN}${HERO_IMAGE_PATH}`;

export const VALID_TABS = [
  'home',
  'meetings',
  'ranking',
  'nickname',
  'profile',
  'admin',
  'login'
];

/**
 * Truncate string cleanly to around maxLen characters (default 20)
 */
export function toShortSummary(text, maxLen = 20) {
  const clean = String(text || '').trim().replace(/\s+/g, ' ');
  if (clean.length <= maxLen) return clean;
  return `${clean.slice(0, maxLen - 1)}…`;
}

/**
 * Format "2026-11-08 18:00" -> "11/08"
 */
export function formatShortDate(dateStr) {
  if (!dateStr) return '';
  const match = String(dateStr).match(/(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return `${match[2]}/${match[3]}`;
  }
  return String(dateStr).slice(0, 5);
}

/**
 * Parse current browser URL into { tab, meetingId, memberQuery }
 */
export function parseCurrentRoute() {
  if (typeof window === 'undefined') {
    return { tab: 'home', meetingId: null, memberQuery: '' };
  }

  const rawPath = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  const params = new URLSearchParams(window.location.search);
  const meetingId = params.get('id') || null;
  const memberQuery = params.get('q') || '';

  if (!rawPath || rawPath === 'home') {
    return { tab: 'home', meetingId, memberQuery };
  }

  if (VALID_TABS.includes(rawPath)) {
    return { tab: rawPath, meetingId, memberQuery };
  }

  return { tab: 'home', meetingId, memberQuery };
}

/**
 * Push browser history URL for a given tab and optional query params
 */
export function pushRouteUrl(tab, params = {}) {
  if (typeof window === 'undefined') return;
  const cleanTab = VALID_TABS.includes(tab) ? tab : 'home';
  const path = cleanTab === 'home' ? '/' : `/${cleanTab}`;
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      searchParams.set(key, String(val).trim());
    }
  });

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
  currentUser = null
}) {
  const openMeetings = meetings.filter((m) => m.status === 'open');
  const selectedMeeting = meetingId
    ? meetings.find((m) => m.id === meetingId)
    : null;

  if (tab === 'meetings') {
    if (selectedMeeting) {
      const shortDate = formatShortDate(selectedMeeting.date);
      const rawSummary = `[${shortDate} ${selectedMeeting.location}] ${selectedMeeting.title}`;
      const headerSummary = toShortSummary(rawSummary, 20);
      return {
        headerSummary,
        pageTitle: `${headerSummary} | Healing78 벙 안내`,
        description: `일시: ${selectedMeeting.date} · 장소: ${selectedMeeting.placeDetail} (현재 참석 신청 ${selectedMeeting.applicants.length}명)`,
        sharePath: `/meetings?id=${encodeURIComponent(selectedMeeting.id)}`
      };
    }

    const firstOpen = openMeetings[0];
    const headerSummary = firstOpen
      ? toShortSummary(
          `모집벙 ${openMeetings.length}건·${firstOpen.location} 등`,
          20
        )
      : 'Healing78 모임(벙) 일정';

    return {
      headerSummary,
      pageTitle: `${headerSummary} | Healing78 모임정보`,
      description: `현재 모집 중인 모임 ${openMeetings.length}건 · 참석 기본 +1점, 타지역 원정 +2점`,
      sharePath: '/meetings'
    };
  }

  if (tab === 'ranking') {
    const topMember = [...members].sort((a, b) => b.totalScore - a.totalScore)[0];
    const headerSummary = topMember
      ? toShortSummary(`활동랭킹 1위 ${topMember.realName}(${topMember.totalScore}점)`, 20)
      : 'Healing78 회원·활동 랭킹';

    return {
      headerSummary,
      pageTitle: `${headerSummary} | Healing78 친구·랭킹`,
      description: `Healing78 전체 회원 ${members.length}명 실시간 활동 점수 및 지역별 친구 정보`,
      sharePath: '/ranking'
    };
  }

  if (tab === 'nickname') {
    const headerSummary = '신입 규격 닉네임 생성·변경';
    return {
      headerSummary: toShortSummary(headerSummary, 20),
      pageTitle: '신입 규격 닉네임 생성·변경 | Healing78',
      description: '이름·지역·결혼여부·성별 선택 시 오픈채팅방 규격 닉네임을 자동 생성하고 복사합니다.',
      sharePath: '/nickname'
    };
  }

  if (tab === 'profile') {
    const headerSummary = currentUser
      ? toShortSummary(`내정보 · ${currentUser.realName}(${currentUser.totalScore}점)`, 20)
      : '내 프로필 · 닉네임 관리';
    return {
      headerSummary,
      pageTitle: `${headerSummary} | Healing78`,
      description: '내 프로필 수정 및 카카오톡 오픈채팅방 규격 닉네임 원클릭 복사',
      sharePath: '/profile'
    };
  }

  if (tab === 'admin') {
    const headerSummary = toShortSummary(`운영관리 · 회원 ${members.length}명`, 20);
    return {
      headerSummary,
      pageTitle: `${headerSummary} | Healing78 운영진`,
      description: '회원 등급·커스텀 뱃지·이벤트 점수 및 공지사항 운영 관리',
      sharePath: '/admin'
    };
  }

  if (tab === 'login') {
    const headerSummary = 'Healing78 로그인·신입 가입';
    return {
      headerSummary: toShortSummary(headerSummary, 20),
      pageTitle: 'Healing78 로그인·신입 가입 | since 2024',
      description: '카카오 계정 로그인 및 신입 회원 규격 닉네임 온보딩',
      sharePath: '/login'
    };
  }

  // Default: 'home'
  const headerSummary =
    openMeetings.length > 0
      ? toShortSummary(`Healing78 · 모집벙 ${openMeetings.length}건`, 20)
      : 'Healing78 커뮤니티 홈';

  return {
    headerSummary,
    pageTitle: `${headerSummary} | Healing78`,
    description: 'Healing78 (since 2024) 공지사항, 실시간 모임(벙) 참석 신청 및 활동 랭킹',
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
      // User cancelled native share sheet or unsupported; fall back to clipboard copy result
    }
  }

  return { shared: false, copied, shareText, fullUrl };
}

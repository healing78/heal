import { formatMemberNickname } from './communityRules';

export const SITE_ORIGIN = 'https://healing78.web.app';
export const HERO_IMAGE_PATH = '/healing78-logo.jpg';
export const HERO_IMAGE_URL = `${SITE_ORIGIN}${HERO_IMAGE_PATH}`;

export const VALID_TABS = [
  'home',
  'meetings',
  'friends',
  'ranking',
  'members',
  'reports',
  'nickname',
  'profile',
  'admin',
  'master',
  'login'
];

export const PAGE_LABELS = {
  home: '홈 · 전체 공지',
  meetings: '일정',
  friends: '친구 · 회원 목록',
  ranking: '랭킹 · 벙점수 순위',
  members: '프로필 · 회원 정보',
  reports: '모임·개인 리포트',
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
    return { tab: 'home', meetingId: null, subView: null, memberQuery: '', friendsFilter: 'ALL' };
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
  const friendsFilter = params.get('filter') || params.get('sub') || 'ALL';
  const subView =
    thirdSeg === 'lounge' || querySubView === 'lounge' ? 'lounge' : null;

  if (!firstSeg || firstSeg === 'home') {
    return { tab: 'home', meetingId: queryMeetingId, subView, memberQuery, friendsFilter };
  }

  if (firstSeg === 'meetings') {
    return {
      tab: 'meetings',
      meetingId: secondSeg || queryMeetingId,
      subView,
      memberQuery,
      friendsFilter
    };
  }

  if (firstSeg === 'members') {
    return {
      tab: 'members',
      memberUid: secondSeg || null,
      meetingId: queryMeetingId,
      subView,
      memberQuery,
      friendsFilter
    };
  }

  // Also support direct '/26110701' (8-digit YYMMDDXX) URLs if shared directly
  if (/^\d{8}$/.test(firstSeg)) {
    return {
      tab: 'meetings',
      meetingId: firstSeg,
      subView: secondSeg === 'lounge' ? 'lounge' : subView,
      memberQuery,
      friendsFilter
    };
  }

  if (VALID_TABS.includes(firstSeg)) {
    return { tab: firstSeg, meetingId: queryMeetingId, subView, memberQuery, friendsFilter };
  }

  return { tab: 'home', meetingId: null, subView: null, memberQuery, friendsFilter };
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
  } else if (cleanTab === 'members' && params.uid) {
    path = `/members/${encodeURIComponent(String(params.uid).trim())}`;
    if (params.filter && params.filter !== 'ALL') {
      searchParams.set('filter', params.filter);
    }
  } else if (cleanTab === 'friends') {
    path = '/friends';
    if (params.filter && params.filter !== 'ALL') {
      searchParams.set('filter', params.filter);
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
 * Check if the meeting's 벙대기실 (lounge) is open.
 * Conditions:
 * 1. Must be a bung meeting (requestAttendance !== false)
 * 2. Either explicitly approved early (loungeStatus === 'approved')
 * 3. OR the meeting date has arrived (meetingDate <= todayStr)
 */
export function isMeetingLoungeOpen(meeting, todayStr = getTodayDateString()) {
  if (!meeting) return false;
  if (meeting.requestAttendance === false) return false;
  if (meeting.loungeStatus === 'approved') return true;
  const meetingDate =
    meeting.dateOnly || (meeting.date ? String(meeting.date).slice(0, 10) : '');
  if (meetingDate && meetingDate <= todayStr) return true;
  return false;
}

const WEEKDAY_SHORT_KO = ['일', '월', '화', '수', '목', '금', '토'];

/**
 * Format meeting to "MM월 DD일 aaa 00시 00분 일정제목"
 * e.g. "11월 05일 목 19시 00분 수원벙"
 */
export function formatScheduleDetailText(m) {
  if (!m) return '';
  const dateStr =
    m.dateOnly || (m.date ? String(m.date).slice(0, 10) : '2026-11-05');
  const parts = dateStr.split('-');
  const year = Number(parts[0]) || 2026;
  const month = Number(parts[1]) || 11;
  const day = Number(parts[2]) || 1;
  const dateObj = new Date(year, month - 1, day);
  const weekday = WEEKDAY_SHORT_KO[dateObj.getDay()] || '';

  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');

  let timeStr = '00시 00분';
  const rawTime =
    m.startTime ||
    (m.date && String(m.date).length >= 16 ? String(m.date).slice(11, 16) : '');
  if (rawTime) {
    const timeParts = rawTime.split(':');
    const hh = String(Number(timeParts[0]) || 0).padStart(2, '0');
    const min = String(Number(timeParts[1]) || 0).padStart(2, '0');
    timeStr = `${hh}시 ${min}분`;
  }

  const title = (m.title || '').trim();
  return `${mm}월 ${dd}일 ${weekday} ${timeStr} ${title}`;
}

/**
 * Build page header title, document.title, and share content for current state
 */
export function buildRouteMeta({
  tab,
  meetingId,
  memberUid,
  subView,
  meetings = [],
  members = [],
  communityConfig = {},
  currentUser = null
}) {
  const upcomingMeetings = [...meetings]
    .filter((m) => !isPastMeeting(m))
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));

  const scheduleLines = upcomingMeetings.map((m) => formatScheduleDetailText(m));
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

  // 3. Friends (/friends)
  if (tab === 'friends') {
    return {
      headerSummary: '힐링78 - 친구',
      pageTitle: '힐링78 - 친구',
      shareText: '힐링78 친구 목록',
      description: '회원 목록 및 등급별 조회',
      sharePath: '/friends'
    };
  }

  // Member Detail (/members/:uid)
  if (tab === 'members') {
    const targetMember = members.find((m) => m.uid === memberUid);
    const targetNick = targetMember ? formatMemberNickname(targetMember) : '회원 프로필';
    return {
      headerSummary: `힐링78 - ${targetNick}`,
      pageTitle: `힐링78 - ${targetNick}`,
      shareText: `힐링78 회원 ${targetNick}`,
      description: `${targetNick} 회원의 활동 벙점수 및 프로필`,
      sharePath: memberUid ? `/members/${encodeURIComponent(memberUid)}` : '/friends'
    };
  }

  // 4. Ranking (/ranking)
  if (tab === 'ranking') {
    return {
      headerSummary: '힐링78 - 랭킹',
      pageTitle: '힐링78 - 랭킹',
      shareText: '힐링78 활동 랭킹',
      description: 'Healing78 활동 랭킹 및 벙참석 순위',
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

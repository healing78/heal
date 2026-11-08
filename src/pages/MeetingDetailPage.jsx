import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  calculateMeetingScoreForMember,
  calculateMeetingSettlement,
  canManageMeeting,
  cleanScheduleLocation,
  detectMeetingRegion,
  detectRegionFromText,
  formatMemberNickname,
  getMemberTotalScore,
  getTierBadgeByScore,
  isAdminUser,
  REGION_GROUPS
} from '../core/communityRules';
import {
  compressImage,
  extractVideoThumbnail,
  MAX_VIDEO_BYTES,
  MAX_VIDEO_DURATION_SEC
} from '../utils/mediaCompressor';
import { useArmedAction } from '../utils/useArmedAction';
import {
  getGoogleDriveBridgeUrl,
  uploadMediaToGoogleDrive
} from '../services/googleDriveBridge';
import {
  RandomBoxQuestRegistry,
  getMetCountWithHost,
  canViewMeetingAlbum,
  canUploadMeetingMedia
} from '../services/randomBoxRegistry';
import {
  addMeetingMediaItem,
  deleteMeetingMediaItem,
  unlockMeetingAlbumForUser
} from '../services/communityService';
import { getTodayDateString, isMeetingLoungeOpen } from '../core/routeMeta';

const WEEKDAY_SHORT_KO = ['일', '월', '화', '수', '목', '금', '토'];
const WEEKDAY_FULL_KO = [
  '일요일',
  '월요일',
  '화요일',
  '수요일',
  '목요일',
  '금요일',
  '토요일'
];


function formatKoreanFullDate(dateStr) {
  const clean = String(dateStr || '2026-11-04').slice(0, 10);
  const parts = clean.split('-');
  const year = Number(parts[0]) || 2026;
  const month = Number(parts[1]) || 11;
  const day = Number(parts[2]) || 4;
  const dateObj = new Date(year, month - 1, day);
  const weekdayFull = WEEKDAY_FULL_KO[dateObj.getDay()] || '';
  return `${year}. ${month}. ${day} ${weekdayFull}`;
}

const openPicker = (e) => {
  if (typeof e.target.showPicker === 'function') {
    try {
      e.target.showPicker();
    } catch {
      // Fallback
    }
  }
};

const AVATAR_BG_PALETTE = [
  '#dbeafe',
  '#fce7f3',
  '#fef3c7',
  '#dcfce7',
  '#ede9fe',
  '#ffedd5'
];

function formatKoreanAmPm(timeStr) {
  if (!timeStr) return '';
  const match = String(timeStr).trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return timeStr;
  const hour24 = Number(match[1]);
  const minute = match[2];
  const period = hour24 < 12 ? '오전' : '오후';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${period} ${hour12}:${minute}`;
}

function addHoursToTime(timeStr, hoursToAdd = 4) {
  const match = String(timeStr || '18:00').trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return '22:00';
  const nextHour = Math.min(23, Number(match[1]) + hoursToAdd);
  return `${String(nextHour).padStart(2, '0')}:${match[2]}`;
}

function formatDetailDateTime(meeting) {
  const rawDate =
    meeting.dateOnly || String(meeting.date || '').slice(0, 10) || '2026-11-06';
  const parts = rawDate.split('-');
  const year = Number(parts[0]) || 2026;
  const month = Number(parts[1]) || 11;
  const day = Number(parts[2]) || 6;
  const dateObj = new Date(year, month - 1, day);
  const weekday = WEEKDAY_SHORT_KO[dateObj.getDay()] || '';

  if (meeting.allDay) {
    return `${year}년 ${month}월 ${day}일 (${weekday}) 하루 종일`;
  }

  const startTime =
    meeting.startTime || String(meeting.date || '').slice(11, 16) || '18:00';
  const endTime = meeting.endTime || addHoursToTime(startTime, 4);
  return `${year}년 ${month}월 ${day}일 (${weekday}) ${formatKoreanAmPm(
    startTime
  )} ~ ${formatKoreanAmPm(endTime)}`;
}

function getDdayBannerText(meeting) {
  if (meeting.status === 'settled') {
    return '종료 및 정산 완료된 일정입니다.';
  }
  const rawDate =
    meeting.dateOnly || String(meeting.date || '').slice(0, 10) || '';
  const parts = rawDate.split('-');
  if (parts.length < 3) return '예정된 일정입니다.';

  const target = new Date(
    Number(parts[0]),
    Number(parts[1]) - 1,
    Number(parts[2])
  );
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));

  if (diffDays > 0) return `일정까지 ${diffDays}일 남았습니다.`;
  if (diffDays === 0) return '오늘 진행되는 일정입니다.';
  return `일정일로부터 ${Math.abs(diffDays)}일 지났습니다.`;
}

export function parsePlaceSummary(rawText = '') {
  const text = String(rawText || '').trim();
  if (!text) return { placeName: '', address: '', mapUrl: '' };

  // 1. Extract URL if present
  const urlMatch = text.match(/https?:\/\/[^\s]+/i);
  const mapUrl = urlMatch ? urlMatch[0] : '';
  const textWithoutUrl = text.replace(/https?:\/\/[^\s]+/gi, '').trim();

  // 2. Check for [네이버지도] or [카카오맵] marker
  let placeName = '';
  let address = '';

  const markerMatch = textWithoutUrl.match(/\[(네이버지도|카카오맵)\]\s*(.+)/i);
  if (markerMatch) {
    const afterMarker = markerMatch[2].trim();
    const addrPrefixRegex = /\s+(서울|경기|인천|충남|충북|전남|전북|경남|경북|강원|대전|대구|부산|울산|광주|세종|제주|[가-힣]+(?:시|군|구))\s+/;
    const addrSplit = afterMarker.search(addrPrefixRegex);
    if (addrSplit !== -1) {
      placeName = afterMarker.slice(0, addrSplit).trim();
      address = afterMarker.slice(addrSplit).trim();
    } else {
      const tokens = afterMarker.split(/\s+/);
      if (tokens.length > 1) {
        placeName = tokens[0];
        address = tokens.slice(1).join(' ');
      } else {
        placeName = afterMarker;
      }
    }
  } else {
    placeName = textWithoutUrl || text;
  }

  return {
    placeName: placeName.trim(),
    address: address.trim(),
    mapUrl,
    textWithoutUrl
  };
}

function getAvatarBg(uid) {
  const str = String(uid || '');
  let sum = 0;
  for (let i = 0; i < str.length; i += 1) {
    sum += str.charCodeAt(i);
  }
  return AVATAR_BG_PALETTE[sum % AVATAR_BG_PALETTE.length];
}

/**
 * Compress uploaded receipt image to a compact JPEG DataURL (max 720px)
 */
function compressReceiptImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 720;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.72));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function getOptimizedMediaUrl(item) {
  if (!item) return '';
  const fileId =
    item.driveFileId ||
    (item.url && item.url.includes('drive.google.com')
      ? item.url.match(/id=([a-zA-Z0-9_-]+)/)?.[1]
      : '');
  if (fileId) {
    // Google official CDN thumbnail endpoint renders full high-res images in <img> tags without 302 login redirects
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`;
  }
  return item.url || item.thumbUrl || '';
}

export default function MeetingDetailPage({
  meeting,
  allMeetings = [],
  currentUser,
  members,
  communityConfig,
  initialSubView = null,
  onUpdateSubView,
  onBackToList,
  onShareMeeting,
  onToggleApplyMeeting,
  onUpdateMeeting,
  onAdminSaveMeeting,
  onDeleteMeeting,
  onUpdateMemberProfile,
  onSettleMeeting,
  onRollbackMeeting,
  onNavigateTab
}) {
  const isBungMeeting = meeting.requestAttendance !== false;
  const [viewMode, setViewMode] = useState(() =>
    initialSubView === 'lounge' && isBungMeeting ? 'lounge' : 'detail'
  );

  useEffect(() => {
    if (initialSubView === 'lounge' && isBungMeeting) {
      setViewMode('lounge');
    } else if (!initialSubView) {
      setViewMode('detail');
    }
  }, [initialSubView, isBungMeeting]);

  const handleNavigateView = (nextView) => {
    setViewMode(nextView);
    if (nextView === 'lounge' && currentUser?.uid && onUpdateMeeting && meeting?.id) {
      const currentVisitors = meeting.loungeVisitors || [];
      if (!currentVisitors.includes(currentUser.uid)) {
        onUpdateMeeting(meeting.id, {
          loungeVisitors: [...currentVisitors, currentUser.uid]
        });
      }
    }
    if (onUpdateSubView) {
      onUpdateSubView(nextView === 'lounge' ? 'lounge' : null);
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Auto-record lounge visitor when in lounge view
  const hasAutoRecordedLoungeRef = useRef(false);
  useEffect(() => {
    if (viewMode === 'lounge' && currentUser?.uid && onUpdateMeeting && meeting?.id) {
      if (!hasAutoRecordedLoungeRef.current) {
        hasAutoRecordedLoungeRef.current = true;
        const currentVisitors = meeting.loungeVisitors || [];
        if (!currentVisitors.includes(currentUser.uid)) {
          onUpdateMeeting(meeting.id, {
            loungeVisitors: [...currentVisitors, currentUser.uid]
          });
        }
      }
    } else if (viewMode !== 'lounge') {
      hasAutoRecordedLoungeRef.current = false;
    }
  }, [viewMode, currentUser?.uid, meeting?.id]);

  const handleDeleteThisMeeting = async () => {
    if (!onDeleteMeeting) return;
    await onDeleteMeeting(meeting.id);
    if (onBackToList) {
      onBackToList();
    }
  };

  const { isArmed, runArmed } = useArmedAction();
  const [loungeTab, setLoungeTab] = useState('chat'); // 'chat' | 'rounds' | 'settlement' | 'returns' | 'album'
  const [showAttendeeDrawer, setShowAttendeeDrawer] = useState(false);
  const [editingRoundIdx, setEditingRoundIdx] = useState(null);
  const [collapsedRoundIndices, setCollapsedRoundIndices] = useState({});
  const [showManagerTools, setShowManagerTools] = useState(false);
  const [editingInfo, setEditingInfo] = useState(false);

  // Admin Accordion States ("벙주 변경", "참석자 변경")
  const [isHostAccordionOpen, setIsHostAccordionOpen] = useState(false);
  const [isAttendeeAccordionOpen, setIsAttendeeAccordionOpen] = useState(false);
  const [isHostSearchOpen, setIsHostSearchOpen] = useState(false);
  const [hostSearchQuery, setHostSearchQuery] = useState('');
  const [isTreasurerSearchOpen, setIsTreasurerSearchOpen] = useState(false);
  const [treasurerSearchQuery, setTreasurerSearchQuery] = useState('');
  const [attendeeSearchQuery, setAttendeeSearchQuery] = useState('');
  const [settleFallbackRegion, setSettleFallbackRegion] = useState('');
  const [showRegionRequiredMsg, setShowRegionRequiredMsg] = useState(false);

  // Chat & Subway Route Progress states
  const [showChatUsersAccordion, setShowChatUsersAccordion] = useState(false);
  const [isEditingChatUsers, setIsEditingChatUsers] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const chatTextInputRef = useRef(null);
  const chatPhotoInputRef = useRef(null);
  const chatMessagesEndRef = useRef(null);
  const [isLoungeHeaderCollapsed, setIsLoungeHeaderCollapsed] = useState(false);

  const isLoungeActive = viewMode === 'lounge' && isBungMeeting;
  const isChatActive = isLoungeActive && loungeTab === 'chat';

  useEffect(() => {
    if (isLoungeActive) {
      document.body.classList.add('lounge-active');
      if (isChatActive) {
        document.body.classList.add('lounge-chat-active');
      } else {
        document.body.classList.remove('lounge-chat-active');
      }
    } else {
      document.body.classList.remove('lounge-active');
      document.body.classList.remove('lounge-chat-active');
    }
    return () => {
      document.body.classList.remove('lounge-active');
      document.body.classList.remove('lounge-chat-active');
    };
  }, [isLoungeActive, isChatActive]);

  // Album & Random Box states
  const album = Array.isArray(meeting.album) ? meeting.album : [];
  const canViewAlbum = canViewMeetingAlbum(currentUser, meeting);
  const canUpload = canUploadMeetingMedia(currentUser, meeting);

  const [activeLightboxItem, setActiveLightboxItem] = useState(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [quizInput, setQuizInput] = useState('');
  const [quizMessage, setQuizMessage] = useState({ text: '', type: '' });
  const fileInputRef = useRef(null);

  const [infoForm, setInfoForm] = useState({
    title: meeting.title || '',
    dateOnly:
      meeting.dateOnly ||
      String(meeting.date || '').slice(0, 10) ||
      '2026-11-04',
    endDateOnly:
      meeting.endDateOnly ||
      meeting.dateOnly ||
      String(meeting.date || '').slice(0, 10) ||
      '2026-11-04',
    startTime:
      meeting.startTime || String(meeting.date || '').slice(11, 16) || '12:00',
    endTime: meeting.endTime || '13:00',
    allDay: Boolean(meeting.allDay),
    placeDetail:
      cleanScheduleLocation(meeting.location, meeting.rounds?.[0]?.placeName) ||
      cleanScheduleLocation(meeting.placeDetail, meeting.rounds?.[0]?.placeName) ||
      '',
    region: meeting.region || '',
    advanceDeposit: meeting.advanceDeposit !== undefined ? meeting.advanceDeposit : '',
    requestAttendance: meeting.requestAttendance !== false,
    treasurerUid: meeting.treasurerUid || meeting.hostUid,
    type: meeting.type || 'Casual',
    description: meeting.description || ''
  });

  const editRegionDetected = detectRegionFromText(infoForm.placeDetail);

  // Settlement Tab 3대 아코디언 카드 상태 (기본값: 모두 접힌 상태)
  const [isMyCostAccordionOpen, setIsMyCostAccordionOpen] = useState(false);
  const [isSettleOverviewAccordionOpen, setIsSettleOverviewAccordionOpen] = useState(false);
  const [isPersonalListAccordionOpen, setIsPersonalListAccordionOpen] = useState(false);

  // 개인별 내역의 개인별 개별 아코디언 카드 열림 상태 (기본: 모두 접힘)
  const [openPersonalUids, setOpenPersonalUids] = useState(() => new Set());

  // 수동 조정 상태 (Q4-A: 1행 산출식, 2행 일괄적용, 3행 금액+적용)
  const [adjustingUid, setAdjustingUid] = useState(null);
  const [manualAdjInput, setManualAdjInput] = useState('');
  const [applySameAmountToAll, setApplySameAmountToAll] = useState(true);

  // 정산 내역 정렬 모드 ('default', 'amountDesc', 'participantsDesc')
  const [settleSortMode, setSettleSortMode] = useState('default');

  // 개인별 내역 검색 & 정렬 모드 ('default', 'unconfirmedFirst', 'amountDesc', 'nameAsc')
  const [personalSearchQuery, setPersonalSearchQuery] = useState('');
  const [personalSortMode, setPersonalSortMode] = useState('default');

  // 정산 내역 참석자 팝오버 열림 상태 (차수번호 또는 사전지출ID 등)
  const [openAttendeePopoverRound, setOpenAttendeePopoverRound] = useState(null);

  // 찬조 추가 인라인 폼 & 검색
  const [showSponsorInlineForm, setShowSponsorInlineForm] = useState(false);
  const [inlineSponsorUid, setInlineSponsorUid] = useState('');
  const [inlineSponsorAmount, setInlineSponsorAmount] = useState('');
  const [inlineSponsorMemo, setInlineSponsorMemo] = useState('');
  const [isInlineSponsorSearchOpen, setIsInlineSponsorSearchOpen] = useState(false);
  const [inlineSponsorSearchQuery, setInlineSponsorSearchQuery] = useState('');

  // 사전 지출(Pre-Expense) 인라인 폼 & 결제자 검색
  const [showPreExpenseForm, setShowPreExpenseForm] = useState(false);
  const [preExpenseTitle, setPreExpenseTitle] = useState('');
  const [preExpenseAmount, setPreExpenseAmount] = useState('');
  const [preExpensePayerUid, setPreExpensePayerUid] = useState('');
  const [preExpenseMemo, setPreExpenseMemo] = useState('');
  const [isPreExpensePayerSearchOpen, setIsPreExpensePayerSearchOpen] = useState(false);
  const [preExpensePayerSearchQuery, setPreExpensePayerSearchQuery] = useState('');

  const [myBankInput, setMyBankInput] = useState(
    currentUser?.bankAccount || ''
  );
  const [editingBank, setEditingBank] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);
  const [sponsorForm, setSponsorForm] = useState({
    uid: currentUser?.uid || meeting.hostUid,
    amount: '',
    memo: ''
  });
  const [isSponsorSearchOpen, setIsSponsorSearchOpen] = useState(false);
  const [sponsorSearchQuery, setSponsorSearchQuery] = useState('');
  const [previewReceiptUrl, setPreviewReceiptUrl] = useState('');
  const [commentInput, setCommentInput] = useState('');

  const [copiedLink, setCopiedLink] = useState(false);
  const [loungeRequestPending, setLoungeRequestPending] = useState(false);

  const handleCopyDirectLink = async () => {
    const origin =
      typeof window !== 'undefined' && window.location?.origin
        ? window.location.origin
        : 'https://healing78.web.app';
    const directUrl = `${origin}/meetings/${meeting.id}/lounge`;
    const shareText = `[Healing78 벙대기실 #${meeting.id}] ${meeting.title}\n일시: ${meeting.date}\n${directUrl}`;

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
    } catch (err) {
      console.warn('Copy failed:', err);
    }
  };

  const adminUser = isAdminUser(currentUser, communityConfig);
  // 방장만 일정 삭제 권한 소유 (부방장은 삭제 불가, 수정만 가능)
  const isLeader = Boolean(
    currentUser && (currentUser.role === 'Leader' || currentUser.uid === communityConfig?.leaderUid)
  );
  const isMeetingSettled = meeting.status === 'settled';
  // 마감(settled) 시 벙주는 수정/삭제 불가 및 버튼 제거, 오직 운영진(adminUser)만 관리 가능
  const canManage = isMeetingSettled
    ? adminUser
    : canManageMeeting(currentUser, meeting, communityConfig);

  // 마감된 벙대기실에서 운영진이 [운영진 수정]을 눌렀을 때 마감 롤백 후 재마감 가능 상태로 전환 (A2 결정 사항)
  const handleAdminReopenForEdit = async () => {
    if (!adminUser || !isMeetingSettled || !onRollbackMeeting) return;
    if (
      !window.confirm(
        '마감된 벙을 다시 오픈하여 수정하시겠습니까?\n\n(참석자들에게 이미 지급된 점수가 회수/롤백되며, 운영진이 수정한 후 다시 최종 마감할 수 있습니다.)'
      )
    ) {
      return;
    }
    await onRollbackMeeting(meeting.id);
  };
  const applicants = meeting.applicants || [];
  const confirmedList = meeting.confirmedParticipants || [];
  const isApplied = applicants.includes(currentUser?.uid);
  const isConfirmedParticipant = confirmedList.includes(currentUser?.uid);

  // Only attendees, host/treasurer, or admin can view the 벙대기실 (rounds, settlement, safe return)
  const canAccessLounge =
    isApplied || isConfirmedParticipant || canManage || adminUser;

  const todayStr = getTodayDateString();
  const loungeOpen = isMeetingLoungeOpen(meeting, todayStr) || adminUser;

  const isLoungeRequested = meeting.loungeStatus === 'requested';
  const isMyLoungeRequest =
    isLoungeRequested &&
    meeting.loungeRequest?.requestedByUid === currentUser?.uid;
  // Only the requester or an admin may cancel a pending lounge request
  const canCancelLoungeRequest = isMyLoungeRequest || adminUser;

  const handleRequestLounge = async () => {
    if (!onUpdateMeeting || !currentUser || loungeRequestPending) return;
    setLoungeRequestPending(true);
    try {
      await onUpdateMeeting(meeting.id, {
        loungeStatus: 'requested',
        loungeRequest: {
          requestedByUid: currentUser.uid,
          requestedByName:
            currentUser.name ||
            currentUser.realName ||
            currentUser.nickname ||
            '참석자',
          requestedAt: new Date().toISOString()
        }
      });
    } catch (err) {
      console.error('Failed to request lounge:', err);
    } finally {
      setLoungeRequestPending(false);
    }
  };

  const handleCancelLoungeRequest = async () => {
    if (!onUpdateMeeting || !canCancelLoungeRequest || loungeRequestPending)
      return;
    setLoungeRequestPending(true);
    try {
      await onUpdateMeeting(meeting.id, {
        loungeStatus: null,
        loungeRequest: null
      });
    } catch (err) {
      console.error('Failed to cancel lounge request:', err);
    } finally {
      setLoungeRequestPending(false);
    }
  };

  const handleApproveLounge = async () => {
    if (!onUpdateMeeting || !adminUser) return;
    try {
      await onUpdateMeeting(meeting.id, {
        loungeStatus: 'approved',
        loungeApprovedByUid: currentUser?.uid || '',
        loungeApprovedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to approve lounge:', err);
    }
  };

  const hostMember = members.find((m) => m.uid === meeting.hostUid);
  const treasurerUid = meeting.treasurerUid || meeting.hostUid;
  const treasurerMember =
    members.find((m) => m.uid === treasurerUid) || hostMember;

  const rounds = Array.isArray(meeting.rounds) ? meeting.rounds : [];
  const sponsorships = Array.isArray(meeting.sponsorships)
    ? meeting.sponsorships
    : [];
  const safeReturns = meeting.safeReturns || {};
  const mySafeReturn = safeReturns[currentUser?.uid] || '';
  const likes = Array.isArray(meeting.likes) ? meeting.likes : [];
  const comments = Array.isArray(meeting.comments) ? meeting.comments : [];
  const isLiked = currentUser ? likes.includes(currentUser.uid) : false;

  const settlement = calculateMeetingSettlement(meeting);
  const mySettlementRow = settlement.participantRows.find(
    (r) => r.uid === currentUser?.uid
  );

  // Detail card displays strictly the basic location input; 1차·2차 placeName is shown inside 벙대기실 [장소] tab
  const r1Place = (rounds && rounds[0]?.placeName) || '';
  let cleanLocation = cleanScheduleLocation(meeting.location, r1Place);
  if (!cleanLocation && meeting.placeDetail) {
    cleanLocation = cleanScheduleLocation(meeting.placeDetail, r1Place);
  }
  const primaryPlaceText = cleanLocation;
  const regionDetection = detectMeetingRegion(meeting);

  const sortedMembers = useMemo(() => {
    return [...(members || [])]
      .filter((m) => m && typeof m === 'object')
      .sort((a, b) => (a.realName || '').localeCompare(b.realName || '', 'ko'));
  }, [members]);

  const filteredHostCandidates = useMemo(() => {
    const q = hostSearchQuery.trim().toLowerCase();
    if (!q) return sortedMembers.slice(0, 20);
    return sortedMembers
      .filter((m) => {
        const real = (m.realName || '').toLowerCase();
        const nick = (m.nickname || '').toLowerCase();
        const city = (m.city || m.homeCity || '').toLowerCase();
        return real.includes(q) || nick.includes(q) || city.includes(q);
      })
      .slice(0, 20);
  }, [sortedMembers, hostSearchQuery]);

  const filteredTreasurerCandidates = useMemo(() => {
    const q = treasurerSearchQuery.trim().toLowerCase();
    if (!q) return sortedMembers.slice(0, 20);
    return sortedMembers
      .filter((m) => {
        const real = (m.realName || '').toLowerCase();
        const nick = (m.nickname || '').toLowerCase();
        const city = (m.city || m.homeCity || '').toLowerCase();
        return real.includes(q) || nick.includes(q) || city.includes(q);
      })
      .slice(0, 20);
  }, [sortedMembers, treasurerSearchQuery]);

  // Admin: Change 벙주 (auto-adds new 벙주 to attendees & auto-removes proxy-registered old 벙주)
  const handleAdminChangeHost = async (newHostUid) => {
    if (!onUpdateMeeting || !adminUser || !newHostUid) return;
    const oldHostUid = meeting.hostUid;
    const baseApplicants = (meeting.applicants || []).filter(
      (uid) => uid !== oldHostUid
    );
    const nextApplicants = baseApplicants.includes(newHostUid)
      ? baseApplicants
      : [newHostUid, ...baseApplicants];

    const baseConfirmed = (meeting.confirmedParticipants || []).filter(
      (uid) => uid !== oldHostUid
    );
    const nextConfirmed =
      meeting.status === 'settled' || baseConfirmed.length > 0
        ? baseConfirmed.includes(newHostUid)
          ? baseConfirmed
          : [newHostUid, ...baseConfirmed]
        : baseConfirmed;

    const nextTreasurerUid =
      !meeting.treasurerUid || meeting.treasurerUid === oldHostUid
        ? newHostUid
        : meeting.treasurerUid;

    const nextRounds = rounds.map((r, idx) => {
      const filteredParts = (Array.isArray(r.participants) ? r.participants : []).filter(
        (uid) => uid !== oldHostUid
      );
      const nextParts =
        idx === 0 && !filteredParts.includes(newHostUid)
          ? [newHostUid, ...filteredParts]
          : filteredParts;
      const nextPayer =
        !r.payerUid || r.payerUid === oldHostUid ? newHostUid : r.payerUid;
      return {
        ...r,
        participants: nextParts,
        payerUid: nextPayer
      };
    });

    await onUpdateMeeting(meeting.id, {
      hostUid: newHostUid,
      treasurerUid: nextTreasurerUid,
      applicants: nextApplicants,
      confirmedParticipants: nextConfirmed,
      rounds: nextRounds
    });
    setIsHostSearchOpen(false);
    setHostSearchQuery('');
  };

  // Admin: Change 총무 (defaults to 벙주 when empty)
  const handleAdminChangeTreasurer = async (newTreasurerUid) => {
    if (!onUpdateMeeting || !adminUser) return;
    const resolvedTreasurer = newTreasurerUid || meeting.hostUid;
    await onUpdateMeeting(meeting.id, {
      treasurerUid: resolvedTreasurer
    });
    setIsTreasurerSearchOpen(false);
    setTreasurerSearchQuery('');
  };

  // Admin: Toggle Attendee (참석 / 미참석; 벙주는 항상 참석 고정)
  const handleAdminToggleAttendee = async (targetUid) => {
    if (!onUpdateMeeting || !adminUser || !targetUid) return;
    if (targetUid === meeting.hostUid) return; // 벙주는 항상 참석 고정

    const currentList = Array.from(
      new Set([
        meeting.hostUid,
        ...(meeting.status === 'settled' && confirmedList.length > 0
          ? confirmedList
          : applicants)
      ].filter(Boolean))
    );
    const isCurrentlyAttending = currentList.includes(targetUid);

    const nextApplicants = isCurrentlyAttending
      ? currentList.filter((uid) => uid !== targetUid)
      : [...currentList, targetUid];

    const nextConfirmed =
      meeting.status === 'settled' || confirmedList.length > 0
        ? nextApplicants
        : confirmedList;

    const nextRounds = rounds.map((r, idx) => {
      const parts = Array.isArray(r.participants) ? r.participants : [];
      if (isCurrentlyAttending) {
        return {
          ...r,
          participants: parts.filter((uid) => uid !== targetUid)
        };
      }
      if (idx === 0 && !parts.includes(targetUid)) {
        return {
          ...r,
          participants: [...parts, targetUid]
        };
      }
      return r;
    });

    await onUpdateMeeting(meeting.id, {
      applicants: nextApplicants,
      confirmedParticipants: nextConfirmed,
      rounds: nextRounds
    });
  };

  // Attendee & Absentee Lists for Chat Accordion (Scoped strictly to this meeting's attendees!)
  const allMeetingAttendeeUids = Array.from(
    new Set(
      [
        meeting.hostUid,
        treasurerUid,
        ...(meeting.confirmedParticipants || []),
        ...(meeting.applicants || [])
      ].filter(Boolean)
    )
  );
  const loungeVisitorUids = meeting.loungeVisitors || [];
  // 1. 참석자 중 벙대기실을 누른 사람 (대기실 입장한 참석자)
  const enteredAttendeeUids = allMeetingAttendeeUids.filter((uid) =>
    loungeVisitorUids.includes(uid)
  );
  // 2. 참석자 중 벙대기실을 아직 누르지 않은 사람 (대기실 미입장 참석자)
  const notEnteredAttendeeUids = allMeetingAttendeeUids.filter(
    (uid) => !enteredAttendeeUids.includes(uid)
  );

  // Admin: Toggle 벙대기실 입장 / 미입장 for an attendee
  const handleToggleLoungeVisitor = async (targetUid) => {
    if (!adminUser || !onUpdateMeeting || !meeting?.id || !targetUid) return;
    const currentVisitors = meeting.loungeVisitors || [];
    const isEntered = currentVisitors.includes(targetUid);
    const nextVisitors = isEntered
      ? currentVisitors.filter((id) => id !== targetUid)
      : [...currentVisitors, targetUid];
    await onUpdateMeeting(meeting.id, {
      loungeVisitors: nextVisitors
    });
  };

  // Subway Route Map Stages & Unified Single Driver Button Cycle
  const metroStages = [{ key: 'start', label: '시작' }];
  if (rounds.length > 0) {
    rounds.forEach((r, idx) => {
      metroStages.push({
        key: `round-${idx}`,
        label: `${idx + 1}차`
      });
    });
  } else {
    metroStages.push({ key: 'round-0', label: '1차' });
  }
  metroStages.push({ key: 'end', label: '종료' });

  const numRounds = Math.max(1, rounds.length);
  const maxMetroStep = numRounds + 1; // 0 (시작), 1..numRounds (각 차수), numRounds+1 (종료)

  // Current metroStep from meeting.metroStep or fallback from round statuses
  let currentMetroStep = 0;
  if (meeting.metroStep !== undefined && meeting.metroStep !== null) {
    currentMetroStep = Number(meeting.metroStep) % (maxMetroStep + 1);
  } else if (meeting.status === 'settled') {
    currentMetroStep = maxMetroStep;
  } else {
    const activeRoundIdx = rounds.findIndex((r) => r.status === 'in_progress');
    if (activeRoundIdx !== -1) {
      currentMetroStep = activeRoundIdx + 1;
    } else if (rounds.length > 0 && rounds.every((r) => r.status === 'ended')) {
      currentMetroStep = maxMetroStep;
    } else {
      currentMetroStep = 0;
    }
  }

  // Active subway node and line fill
  const metroActiveIdx = Math.min(currentMetroStep, metroStages.length - 1);
  const metroFillPercent =
    metroStages.length > 1
      ? (metroActiveIdx / (metroStages.length - 1)) * 100
      : 0;

  // Single Driver Button Presentation:
  // Step 0: 녹색 '시작'
  // Step 1..N: 로즈색 '1차', '2차', ...
  // Step N+1: 다크 '종료'
  let metroBtnLabel = '시작';
  let metroBtnClass = 'is-green';
  if (currentMetroStep === 0) {
    metroBtnLabel = '시작';
    metroBtnClass = 'is-green';
  } else if (currentMetroStep >= 1 && currentMetroStep <= numRounds) {
    metroBtnLabel = `${currentMetroStep}차`;
    metroBtnClass = 'is-rose';
  } else {
    metroBtnLabel = '종료';
    metroBtnClass = 'is-dark';
  }

  const handleCycleMetroProgress = async () => {
    if (!canManage) return;
    const nextStep = (currentMetroStep + 1) % (maxMetroStep + 1);

    const nextRounds = rounds.map((r, idx) => {
      if (nextStep === 0) {
        return { ...r, status: 'ready' };
      }
      if (nextStep >= 1 && nextStep <= numRounds) {
        const roundNum = idx + 1;
        if (roundNum === nextStep) {
          return { ...r, status: 'in_progress' };
        } else if (roundNum < nextStep) {
          return { ...r, status: 'ended' };
        } else {
          return { ...r, status: 'ready' };
        }
      }
      // nextStep === maxMetroStep (종료)
      return { ...r, status: 'ended' };
    });

    await onUpdateMeeting(meeting.id, {
      metroStep: nextStep,
      rounds: nextRounds
    });
  };

  // Save edited basic schedule info (Host / Treasurer / Admin)
  const handleSaveBasicInfo = async (e) => {
    e.preventDefault();
    if (!infoForm.title.trim()) return;
    const combinedDate = `${infoForm.dateOnly} ${
      infoForm.allDay ? '00:00' : infoForm.startTime
    }`;
    const cleanPlace = (infoForm.placeDetail || '').trim();
    await onUpdateMeeting(meeting.id, {
      title: infoForm.title.trim(),
      dateOnly: infoForm.dateOnly,
      endDateOnly: infoForm.endDateOnly || infoForm.dateOnly,
      startTime: infoForm.allDay ? '00:00' : infoForm.startTime,
      endTime: infoForm.allDay ? '23:59' : (infoForm.endTime || '13:00'),
      allDay: infoForm.allDay,
      date: combinedDate,
      location: cleanPlace,
      placeDetail: cleanPlace,
      region: editRegionDetected.recognized
        ? editRegionDetected.group.name
        : (infoForm.region || meeting.region || ''),
      advanceDeposit: Number(infoForm.advanceDeposit) || 0,
      requestAttendance: infoForm.requestAttendance,
      treasurerUid: infoForm.treasurerUid,
      type: adminUser ? infoForm.type : meeting.type,
      description: infoForm.description.trim()
    });
    setEditingInfo(false);
  };

  // Toggle Safe Return Home (귀가완료 버튼)
  const handleToggleSafeReturn = async () => {
    if (!currentUser) return;
    const nextReturns = { ...safeReturns };
    if (nextReturns[currentUser.uid]) {
      delete nextReturns[currentUser.uid];
    } else {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      nextReturns[currentUser.uid] = `${hh}:${mm} 귀가완료`;
    }
    await onUpdateMeeting(meeting.id, { safeReturns: nextReturns });
  };

  // Save current user's bank account
  const handleSaveMyBank = async (e) => {
    e.preventDefault();
    if (!currentUser || !onUpdateMemberProfile) return;
    await onUpdateMemberProfile({ bankAccount: myBankInput.trim() });
    setEditingBank(false);
  };

  const handleCopyAccount = async (text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    } catch {
      setCopiedAccount(false);
    }
  };

  // Round management (Add / Remove / Update Round)
  const handleAddRound = async () => {
    const nextNum = rounds.length + 1;
    const nextRound = {
      id: `r-${Date.now()}`,
      label: `${nextNum}차`,
      placeName: '',
      mapUrl: '',
      participants: [...applicants],
      payerUid: currentUser?.uid || treasurerUid,
      cost: 0,
      receiptUrl: '',
      isGoldenBell: false,
      goldenBellUid: ''
    };
    const nextIdx = rounds.length;
    await onUpdateMeeting(meeting.id, {
      rounds: [...rounds, nextRound]
    });
    setEditingRoundIdx(nextIdx);
  };

  const handleRemoveRound = async (roundIdx) => {
    if (rounds.length <= 1) return;
    const nextRounds = rounds
      .filter((_, idx) => idx !== roundIdx)
      .map((r, idx) => ({ ...r, label: `${idx + 1}차` }));
    await onUpdateMeeting(meeting.id, { rounds: nextRounds });
    setEditingRoundIdx(null);
  };

  const handleUpdateRoundField = async (roundIdx, fieldPatch) => {
    const nextRounds = rounds.map((r, idx) =>
      idx === roundIdx ? { ...r, ...fieldPatch } : r
    );
    await onUpdateMeeting(meeting.id, {
      rounds: nextRounds
    });
  };

  const handleToggleRoundParticipant = async (roundIdx, targetUid) => {
    if (targetUid !== currentUser?.uid && !canManage) return;
    const targetRound = rounds[roundIdx];
    if (!targetRound) return;

    const currentList = Array.isArray(targetRound.participants)
      ? targetRound.participants
      : [];
    const exists = currentList.includes(targetUid);
    const nextParticipants = exists
      ? currentList.filter((id) => id !== targetUid)
      : [...currentList, targetUid];

    const nextApplicants = applicants.includes(targetUid)
      ? applicants
      : [...applicants, targetUid];

    const nextRounds = rounds.map((r, idx) =>
      idx === roundIdx ? { ...r, participants: nextParticipants } : r
    );

    await onUpdateMeeting(meeting.id, {
      applicants: nextApplicants,
      rounds: nextRounds
    });
  };

  const handleReceiptUpload = async (roundIdx, file) => {
    if (!file) return;
    try {
      const dataUrl = await compressReceiptImage(file);
      await handleUpdateRoundField(roundIdx, { receiptUrl: dataUrl });
    } catch (err) {
      console.error('Receipt image compression failed:', err);
    }
  };

  // Sponsorship management (찬조금)
  const handleAddSponsorship = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const numericAmount = Number(sponsorForm.amount);
    if (!sponsorForm.uid || !numericAmount || numericAmount <= 0) return;
    const entry = {
      id: `sp-${Date.now()}`,
      uid: sponsorForm.uid,
      amount: numericAmount,
      memo: sponsorForm.memo.trim() || '찬조금'
    };
    await onUpdateMeeting(meeting.id, {
      sponsorships: [...sponsorships, entry]
    });
    setSponsorForm({
      uid: currentUser?.uid || meeting.hostUid,
      amount: '',
      memo: ''
    });
    setIsSponsorSearchOpen(false);
    setSponsorSearchQuery('');
  };

  const handleDeleteSponsorship = async (spId) => {
    await onUpdateMeeting(meeting.id, {
      sponsorships: sponsorships.filter((s) => s.id !== spId)
    });
  };

  // Rounding rule & Manual override
  const handleChangeRounding = async (nextRule) => {
    await onUpdateMeeting(meeting.id, { roundingRule: nextRule });
  };

  const handleManualOverrideChange = async (uid, valueStr) => {
    if (!canManage) return;
    const nextManual = { ...(meeting.manualAmounts || {}) };
    if (valueStr === '' || valueStr === null) {
      delete nextManual[uid];
    } else {
      nextManual[uid] = Number(valueStr) || 0;
    }
    await onUpdateMeeting(meeting.id, { manualAmounts: nextManual });
  };

  // Participant clicks [입금 완료]
  const handleTogglePaid = async (uid) => {
    if (uid !== currentUser?.uid && !canManage) return;
    const currentStatuses = meeting.paymentStatuses || {};
    const prev = currentStatuses[uid] || { paid: false, confirmed: false };
    const nextPaid = !prev.paid;
    const nextStatuses = {
      ...currentStatuses,
      [uid]: {
        paid: nextPaid,
        confirmed: nextPaid ? prev.confirmed : false
      }
    };
    await onUpdateMeeting(meeting.id, { paymentStatuses: nextStatuses });
  };

  // Host/Treasurer clicks [입금 컨펌]
  const handleToggleConfirmPayment = async (uid) => {
    if (!canManage) return;
    const currentStatuses = meeting.paymentStatuses || {};
    const prev = currentStatuses[uid] || { paid: false, confirmed: false };
    const nextConfirmed = !prev.confirmed;
    const nextStatuses = {
      ...currentStatuses,
      [uid]: {
        paid: nextConfirmed ? true : prev.paid,
        confirmed: nextConfirmed
      }
    };
    await onUpdateMeeting(meeting.id, { paymentStatuses: nextStatuses });
  };

  // Attendee/Host toggles [선입금 입금 완료]
  const handleToggleDepositPaid = async (uid) => {
    const currentStatuses = meeting.depositStatuses || {};
    const prev = currentStatuses[uid] || { paid: false, confirmed: false };
    const nextPaid = !prev.paid;
    const nextStatuses = {
      ...currentStatuses,
      [uid]: {
        paid: nextPaid,
        confirmed: nextPaid ? prev.confirmed : false
      }
    };
    await onUpdateMeeting(meeting.id, { depositStatuses: nextStatuses });
  };

  // Host/Treasurer toggles [선입금 컨펌] (Q2-A 독립 컨펌)
  const handleToggleDepositConfirm = async (uid) => {
    if (!canManage) return;
    const currentStatuses = meeting.depositStatuses || {};
    const prev = currentStatuses[uid] || { paid: false, confirmed: false };
    const nextConfirmed = !prev.confirmed;
    const nextStatuses = {
      ...currentStatuses,
      [uid]: {
        paid: nextConfirmed ? true : prev.paid,
        confirmed: nextConfirmed
      }
    };
    await onUpdateMeeting(meeting.id, { depositStatuses: nextStatuses });
  };

  // Update settlement note/remark in real-time (Q3-A)
  const handleUpdateSettlementNote = async (key, noteText) => {
    if (!canManage) return;
    const currentNotes = meeting.settlementNotes || {};
    await onUpdateMeeting(meeting.id, {
      settlementNotes: {
        ...currentNotes,
        [key]: noteText
      }
    });
  };

  // Save/Update Advance Deposit amount
  const handleSaveAdvanceDeposit = async (newAmount) => {
    if (!canManage) return;
    const numeric = Number(newAmount);
    if (isNaN(numeric) || numeric < 0) return;
    await onUpdateMeeting(meeting.id, {
      advanceDeposit: numeric
    });
    setShowAdvanceDepositModal(false);
  };

  // Apply Manual Adjustment (Q4-A: 동일 금액 대상자 일괄 적용 옵션)
  const handleApplyManualAdjustment = async (targetUid) => {
    if (!canManage) return;
    const adj = Number(manualAdjInput);
    if (isNaN(adj) || adj === 0) {
      alert('유효한 조정 금액을 입력해 주세요.');
      return;
    }

    const targetRow = settlement.participantRows.find((r) => r.uid === targetUid);
    if (!targetRow) return;

    const curBase = targetRow.calculatedShare;
    const newBase = Math.max(0, curBase - adj);

    let uidsToApply = [targetUid];
    if (applySameAmountToAll) {
      // Q4-A: 현재 회비(calculatedShare)가 같은 모든 참가자에게 일괄 적용
      uidsToApply = settlement.participantRows
        .filter((r) => r.calculatedShare === curBase)
        .map((r) => r.uid);
    }

    const isDiscount = adj > 0;
    const confirmMsg =
      applySameAmountToAll && uidsToApply.length > 1
        ? `현재 금액(${curBase.toLocaleString()}원)이 같은 참석자 ${uidsToApply.length}명에게 일괄로 ${
            isDiscount ? `${adj.toLocaleString()}원 할인` : `${Math.abs(adj).toLocaleString()}원 추가`
          }을 적용하시겠습니까?\n\n(적용 후 부담금: ${newBase.toLocaleString()}원)`
        : `조정 금액(${isDiscount ? `-${adj.toLocaleString()}원` : `+${Math.abs(adj).toLocaleString()}원`})을 적용하시겠습니까?\n\n(적용 후 부담금: ${newBase.toLocaleString()}원)`;

    if (!window.confirm(confirmMsg)) return;

    const nextManuals = { ...(meeting.manualAmounts || {}) };
    uidsToApply.forEach((u) => {
      nextManuals[u] = newBase;
    });

    await onUpdateMeeting(meeting.id, { manualAmounts: nextManuals });
    setAdjustingUid(null);
    setManualAdjInput('');
  };

  // Add 1-line compact sponsorship
  const handleAddInlineSponsorship = async () => {
    const numeric = Number(inlineSponsorAmount);
    if (!inlineSponsorUid || !numeric || numeric <= 0) {
      alert('찬조자와 찬조 금액을 올바르게 입력해 주세요.');
      return;
    }
    const entry = {
      id: `sp-${Date.now()}`,
      uid: inlineSponsorUid,
      amount: numeric,
      memo: inlineSponsorMemo.trim() || '찬조금'
    };
    await onUpdateMeeting(meeting.id, {
      sponsorships: [...sponsorships, entry]
    });
    setInlineSponsorUid('');
    setInlineSponsorAmount('');
    setInlineSponsorMemo('');
    setShowSponsorInlineForm(false);
    setIsInlineSponsorSearchOpen(false);
    setInlineSponsorSearchQuery('');
  };

  // Pre-Expense management (사전 지출: 대관비, 예약금, 물품 구매 등)
  const handleAddPreExpense = async () => {
    const numeric = Number(preExpenseAmount);
    if (!preExpenseTitle.trim() || !preExpensePayerUid || !numeric || numeric <= 0) {
      alert('항목명, 결제자, 지출 금액을 올바르게 입력해 주세요.');
      return;
    }
    const entry = {
      id: `pe-${Date.now()}`,
      title: preExpenseTitle.trim(),
      amount: numeric,
      payerUid: preExpensePayerUid,
      memo: preExpenseMemo.trim() || '',
      createdAt: new Date().toISOString()
    };
    const nextPre = [...(meeting.preExpenses || []), entry];
    await onUpdateMeeting(meeting.id, { preExpenses: nextPre });
    setPreExpenseTitle('');
    setPreExpenseAmount('');
    setPreExpensePayerUid('');
    setPreExpenseMemo('');
    setShowPreExpenseForm(false);
    setIsPreExpensePayerSearchOpen(false);
    setPreExpensePayerSearchQuery('');
  };

  const handleDeletePreExpense = async (peId) => {
    if (!canManage) return;
    if (!window.confirm('해당 사전 지출 항목을 삭제하시겠습니까?')) return;
    const nextPre = (meeting.preExpenses || []).filter((p) => p.id !== peId);
    await onUpdateMeeting(meeting.id, { preExpenses: nextPre });
  };

  // Finalize meeting & grant attendance/expedition scores
  const handleFinalizeSettlement = async () => {
    if (!canManage || meeting.status === 'settled') return;
    if (!regionDetection.recognized && !settleFallbackRegion) {
      setShowRegionRequiredMsg(true);
      return;
    }
    const confirmedUids = settlement.participantRows
      .filter((row) => row.attendedRounds.length > 0)
      .map((row) => row.uid);
    const finalUids = Array.from(
      new Set(
        [
          meeting.hostUid,
          ...(confirmedUids.length > 0 ? confirmedUids : applicants)
        ].filter(Boolean)
      )
    );
    const resolvedLoc = regionDetection.recognized
      ? regionDetection.matchedKeyword
      : settleFallbackRegion;
    await onSettleMeeting(meeting.id, finalUids, resolvedLoc);
  };

  // Copy meeting settlement summary report text for KakaoTalk
  const handleCopySettlementReport = async () => {
    const lines = [
      `[Healing78 정산 리포트 #${meeting.id}]`,
      `■ 일정명: ${meeting.title}`,
      `■ 일시/지역: ${meeting.date} (${meeting.location})`,
      `■ 벙주: ${hostMember ? formatMemberNickname(hostMember) : meeting.hostUid}`,
      `■ 총무(입금계좌): ${
        treasurerMember ? formatMemberNickname(treasurerMember) : treasurerUid
      } / ${treasurerMember?.bankAccount || '계좌 미등록'}`,
      `■ 총 비용: ${settlement.totalGrossCost.toLocaleString()}원 (골든벨 ${settlement.totalGoldenBellCost.toLocaleString()}원 / 찬조금 ${settlement.totalSponsorship.toLocaleString()}원)`,
      `--- 개인별 정산 내역 ---`,
      ...settlement.participantRows.map((row) => {
        const m = members.find((mem) => mem.uid === row.uid);
        const nick = m ? m.realName : row.uid;
        const statusText = row.confirmed
          ? '컨펌완료'
          : row.paid
            ? '입금완료(대기)'
            : '미입금';
        const netLabel =
          row.netToPay >= 0
            ? `입금할 금액 ${row.netToPay.toLocaleString()}원`
            : `받을 정산금 ${Math.abs(row.netToPay).toLocaleString()}원`;
        return `· ${nick} (${row.attendedRounds.join(',') || '미참석'}): 부담 ${row.finalShare.toLocaleString()}원 / ${netLabel} [${statusText}]`;
      }),
      `상세 보기: https://healing78.web.app/meetings/${meeting.id}`
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopiedReport(true);
      setTimeout(() => setCopiedReport(false), 2000);
    } catch {
      setCopiedReport(false);
    }
  };

  // Toggle Like (❤️)
  const handleToggleLike = async () => {
    if (!currentUser) return;
    const nextLikes = isLiked
      ? likes.filter((id) => id !== currentUser.uid)
      : [...likes, currentUser.uid];
    await onUpdateMeeting(meeting.id, { likes: nextLikes });
  };

  // Add Comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!currentUser || !commentInput.trim()) return;
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const newComment = {
      id: `cmt-${Date.now()}`,
      uid: currentUser.uid,
      text: commentInput.trim(),
      createdAt: `${hh}:${mm}`
    };
    await onUpdateMeeting(meeting.id, {
      comments: [...comments, newComment]
    });
    setCommentInput('');
  };

  const handleDeleteComment = async (commentId) => {
    await onUpdateMeeting(meeting.id, {
      comments: comments.filter((c) => c.id !== commentId)
    });
  };

  // Handle Media File Selection & Upload (Image Compression & Video Thumbnail & GAS Bridge)
  const handleMediaUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !currentUser) return;

    setUploadingMedia(true);
    setUploadError('');
    setUploadStatus(`총 ${files.length}개 파일 준비 중...`);

    const bridgeUrl = getGoogleDriveBridgeUrl(communityConfig);
    const newItems = [];
    const uploadErrors = [];

    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      setUploadStatus(`${i + 1}/${files.length} 처리 중: ${file.name}`);

      try {
        const isVideo = file.type.startsWith('video');

        if (isVideo) {
          const videoThumb = await extractVideoThumbnail(file);
          const base64Data = await new Promise((res, rej) => {
            const reader = new FileReader();
            reader.onload = () => res(reader.result);
            reader.onerror = rej;
            reader.readAsDataURL(file);
          });

          let driveRes = null;
          if (bridgeUrl) {
            driveRes = await uploadMediaToGoogleDrive({
              bridgeUrl,
              meetingId: meeting.id,
              meetingTitle: meeting.title,
              uploaderName: currentUser.realName || '회원',
              mimeType: file.type,
              base64Data
            });
          }

          const mediaItem = {
            id: `media-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            meetingId: meeting.id,
            uploaderUid: currentUser.uid,
            uploaderName: currentUser.realName || '회원',
            mediaType: 'video',
            url: driveRes?.viewUrl || base64Data,
            thumbUrl: videoThumb.thumbUrl,
            driveFileId: driveRes?.fileId || '',
            driveDownloadUrl: driveRes?.downloadUrl || '',
            durationSec: videoThumb.duration || 0,
            caption: '',
            likes: [],
            createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
          };
          newItems.push(mediaItem);
        } else {
          const compressed = await compressImage(file, 1280, 0.78);
          let driveRes = null;
          if (bridgeUrl) {
            driveRes = await uploadMediaToGoogleDrive({
              bridgeUrl,
              meetingId: meeting.id,
              meetingTitle: meeting.title,
              uploaderName: currentUser.realName || '회원',
              mimeType: compressed.mimeType,
              base64Data: compressed.dataUrl
            });
          }

          const driveFileId = driveRes?.fileId || '';
          const driveViewUrl = driveFileId
            ? `https://drive.google.com/thumbnail?id=${driveFileId}&sz=w1600`
            : driveRes?.viewUrl || '';

          const mediaItem = {
            id: `media-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            meetingId: meeting.id,
            uploaderUid: currentUser.uid,
            uploaderName: currentUser.realName || '회원',
            mediaType: 'image',
            url: driveViewUrl || compressed.dataUrl,
            thumbUrl: compressed.thumbUrl,
            driveFileId,
            driveDownloadUrl:
              driveRes?.downloadUrl ||
              (driveFileId
                ? `https://drive.google.com/uc?export=download&id=${driveFileId}`
                : ''),
            durationSec: 0,
            caption: '',
            likes: [],
            createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
          };
          newItems.push(mediaItem);
        }
      } catch (err) {
        console.error('File upload error:', err);
        uploadErrors.push(err.message || '업로드 실패');
      }
    }

    if (newItems.length > 0) {
      const nextAlbum = [...newItems, ...album];
      await onUpdateMeeting(meeting.id, { album: nextAlbum });
    }

    setUploadingMedia(false);
    setUploadStatus('');
    if (uploadErrors.length > 0) {
      setUploadError(
        uploadErrors.length > 1
          ? `${uploadErrors[0]} 외 ${uploadErrors.length - 1}건`
          : uploadErrors[0]
      );
      setTimeout(() => setUploadError(''), 4000);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteMedia = async (mediaId) => {
    const nextAlbum = album.filter((item) => item.id !== mediaId);
    await onUpdateMeeting(meeting.id, { album: nextAlbum });
    setActiveLightboxItem(null);
  };

  const handleToggleMediaLike = async (mediaId) => {
    if (!currentUser) return;
    const nextAlbum = album.map((item) => {
      if (item.id !== mediaId) return item;
      const currentLikes = Array.isArray(item.likes) ? item.likes : [];
      const hasLiked = currentLikes.includes(currentUser.uid);
      const nextLikes = hasLiked
        ? currentLikes.filter((uid) => uid !== currentUser.uid)
        : [...currentLikes, currentUser.uid];
      return { ...item, likes: nextLikes };
    });
    await onUpdateMeeting(meeting.id, { album: nextAlbum });
    if (activeLightboxItem && activeLightboxItem.id === mediaId) {
      setActiveLightboxItem((prev) =>
        prev
          ? {
              ...prev,
              likes: (prev.likes || []).includes(currentUser.uid)
                ? prev.likes.filter((uid) => uid !== currentUser.uid)
                : [...(prev.likes || []), currentUser.uid]
            }
          : null
      );
    }
  };

  // Chat Handlers (KakaoTalk Style with Album Sync)
  const chatMessages = Array.isArray(meeting.chatMessages)
    ? meeting.chatMessages
    : [];

  useEffect(() => {
    if (loungeTab === 'chat' && chatMessagesEndRef.current) {
      chatMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages.length, loungeTab]);

  const handleSendChatMessage = async (textToSend, photoItem = null) => {
    if ((!textToSend?.trim() && !photoItem) || !currentUser || !onUpdateMeeting)
      return;
    const cleanText = (textToSend || '').trim();
    const newMsg = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      senderUid: currentUser.uid,
      senderName:
        currentUser.realName ||
        currentUser.nickname ||
        '참석자',
      text: cleanText,
      imageUrl: photoItem?.url || '',
      thumbUrl: photoItem?.thumbUrl || photoItem?.url || '',
      createdAt: new Date().toISOString()
    };
    const nextChats = [...chatMessages, newMsg];
    setChatInput('');
    if (chatTextInputRef.current) {
      chatTextInputRef.current.focus();
      requestAnimationFrame(() => {
        chatTextInputRef.current?.focus();
      });
    }
    await onUpdateMeeting(meeting.id, { chatMessages: nextChats });
  };

  const handleChatPhotoUpload = async (file) => {
    if (!file || !currentUser || !onUpdateMeeting) return;
    try {
      const compressed = await compressImage(file);
      const mediaItem = {
        id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        uploaderUid: currentUser.uid,
        uploaderName: currentUser.realName || '회원',
        mediaType: 'image',
        url: compressed.dataUrl,
        thumbUrl: compressed.thumbUrl,
        durationSec: 0,
        caption: '대화방 공유 사진',
        likes: [],
        createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
      };
      const newMsg = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        senderUid: currentUser.uid,
        senderName:
          currentUser.realName ||
          currentUser.nickname ||
          '참석자',
        text: '',
        imageUrl: compressed.dataUrl,
        thumbUrl: compressed.thumbUrl,
        createdAt: new Date().toISOString()
      };
      const nextAlbum = [mediaItem, ...album];
      const nextChats = [...chatMessages, newMsg];
      await onUpdateMeeting(meeting.id, {
        album: nextAlbum,
        chatMessages: nextChats
      });
    } catch (err) {
      console.error('Failed to upload chat photo:', err);
    }
  };

  // Random Box Unlock Handlers
  const handleUnlockRandomBox = async (questType) => {
    if (!currentUser) {
      if (onNavigateTab) onNavigateTab('login');
      return;
    }
    await unlockMeetingAlbumForUser(currentUser.uid, meeting.id);
    if (onUpdateMemberProfile) {
      const currentUnlocked = currentUser.unlockedAlbums || [];
      if (!currentUnlocked.includes(meeting.id)) {
        await onUpdateMemberProfile({
          unlockedAlbums: [...currentUnlocked, meeting.id]
        });
      }
    }
  };

  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      if (onNavigateTab) onNavigateTab('login');
      return;
    }
    const isCorrect = RandomBoxQuestRegistry.MEETING_QUIZ.verifyAnswer(
      quizInput,
      meeting
    );
    if (isCorrect) {
      await unlockMeetingAlbumForUser(currentUser.uid, meeting.id);
      if (onUpdateMemberProfile) {
        const currentUnlocked = currentUser.unlockedAlbums || [];
        if (!currentUnlocked.includes(meeting.id)) {
          await onUpdateMemberProfile({
            unlockedAlbums: [...currentUnlocked, meeting.id]
          });
        }
      }
      setQuizMessage({
        text: '정답입니다! 앨범 열람 권한이 부여되었습니다 🎉',
        type: 'success'
      });
      setQuizInput('');
    } else {
      setQuizMessage({
        text: '정답이 일치하지 않습니다. 다시 시도해 주세요!',
        type: 'error'
      });
    }
  };

  const displayAttendeeUids = Array.from(
    new Set(
      [
        meeting.hostUid,
        ...(meeting.status === 'settled' && confirmedList.length > 0
          ? confirmedList
          : applicants)
      ].filter(Boolean)
    )
  );

  // 마감탭 전용 정렬: 1순위 본인, 2순위 운영진, 3순위 가나다순
  const sortedClosingAttendeeUids = useMemo(() => {
    return [...displayAttendeeUids].sort((a, b) => {
      if (a === currentUser?.uid) return -1;
      if (b === currentUser?.uid) return 1;
      const ma = members.find((m) => m.uid === a);
      const mb = members.find((m) => m.uid === b);
      const isOpA =
        ma?.role === 'Leader' ||
        ma?.role === 'Deputy' ||
        ma?.uid === communityConfig?.leaderUid;
      const isOpB =
        mb?.role === 'Leader' ||
        mb?.role === 'Deputy' ||
        mb?.uid === communityConfig?.leaderUid;
      if (isOpA && !isOpB) return -1;
      if (!isOpA && isOpB) return 1;
      const nameA = ma?.realName || '';
      const nameB = mb?.realName || '';
      return nameA.localeCompare(nameB, 'ko');
    });
  }, [displayAttendeeUids, currentUser?.uid, members, communityConfig]);

  // 마감탭 승급 및 뱃지 변경 감지 (신입 -> 정회원 승급 또는 마일스톤 티어 뱃지 획득 시에만 축하 섹션 노출)
  const closingCelebrations = useMemo(() => {
    const list = [];
    displayAttendeeUids.forEach((uid) => {
      const m = members.find((mem) => mem.uid === uid);
      if (!m) return;
      const scoreInfo = calculateMeetingScoreForMember(
        m,
        regionDetection.region || meeting.location
      );
      const earned = Number(scoreInfo.score || 1);
      const isSettled = meeting.status === 'settled';
      const currentScore = getMemberTotalScore(m);
      const beforeScore = isSettled
        ? Math.max(0, currentScore - earned)
        : currentScore;
      const afterScore = beforeScore + earned;

      const beforeBadge = getTierBadgeByScore(beforeScore);
      const afterBadge = getTierBadgeByScore(afterScore);
      const isBadgePromoted = Boolean(
        beforeBadge?.name && afterBadge?.name && beforeBadge.name !== afterBadge.name
      );
      const isRookiePromotion = Boolean(m.role === 'Rookie' && afterScore >= 1);

      if (isRookiePromotion || isBadgePromoted) {
        list.push({
          uid: m.uid,
          name: m.realName,
          nickname: m.nickname,
          isRookiePromotion,
          isBadgePromoted,
          beforeBadge,
          afterBadge,
          beforeScore,
          afterScore
        });
      }
    });
    return list;
  }, [
    displayAttendeeUids,
    members,
    regionDetection.region,
    meeting.location,
    meeting.status
  ]);

  // Attendees list strictly for round payer & golden bell selects
  const attendeeMembers = useMemo(() => {
    const list = displayAttendeeUids
      .map((uid) => sortedMembers.find((m) => m.uid === uid))
      .filter(Boolean);
    return list.length > 0 ? list : sortedMembers;
  }, [displayAttendeeUids, sortedMembers]);

  const filteredAttendeeCandidates = useMemo(() => {
    const q = attendeeSearchQuery.trim().toLowerCase();
    const nonAttendees = sortedMembers.filter(
      (m) => !displayAttendeeUids.includes(m.uid)
    );
    if (!q) return nonAttendees.slice(0, 15);
    return nonAttendees
      .filter((m) => {
        const real = (m.realName || '').toLowerCase();
        const nick = (m.nickname || '').toLowerCase();
        const city = (m.city || m.homeCity || '').toLowerCase();
        return real.includes(q) || nick.includes(q) || city.includes(q);
      })
      .slice(0, 20);
  }, [sortedMembers, displayAttendeeUids, attendeeSearchQuery]);

  const filteredSponsorCandidates = useMemo(() => {
    const q = sponsorSearchQuery.trim().toLowerCase();
    if (!q) {
      const nonAttendees = sortedMembers.filter(
        (m) => !displayAttendeeUids.includes(m.uid)
      );
      return [...attendeeMembers, ...nonAttendees].slice(0, 25);
    }
    return sortedMembers
      .filter((m) => {
        const real = (m.realName || '').toLowerCase();
        const nick = (m.nickname || '').toLowerCase();
        const city = (m.city || m.homeCity || '').toLowerCase();
        return real.includes(q) || nick.includes(q) || city.includes(q);
      })
      .slice(0, 25);
  }, [sortedMembers, attendeeMembers, displayAttendeeUids, sponsorSearchQuery]);

  const filteredInlineSponsorCandidates = useMemo(() => {
    const q = inlineSponsorSearchQuery.trim().toLowerCase();
    if (!q) return sortedMembers.slice(0, 15);
    return sortedMembers
      .filter((m) => {
        const real = (m.realName || '').toLowerCase();
        const nick = (m.nickname || '').toLowerCase();
        const city = (m.city || m.homeCity || '').toLowerCase();
        return real.includes(q) || nick.includes(q) || city.includes(q);
      })
      .slice(0, 20);
  }, [sortedMembers, inlineSponsorSearchQuery]);

  const filteredPreExpensePayerCandidates = useMemo(() => {
    const q = preExpensePayerSearchQuery.trim().toLowerCase();
    if (!q) return sortedMembers.slice(0, 15);
    return sortedMembers
      .filter((m) => {
        const real = (m.realName || '').toLowerCase();
        const nick = (m.nickname || '').toLowerCase();
        const city = (m.city || m.homeCity || '').toLowerCase();
        return real.includes(q) || nick.includes(q) || city.includes(q);
      })
      .slice(0, 20);
  }, [sortedMembers, preExpensePayerSearchQuery]);

  return (
    <div
      className={`list-container ${
        isLoungeActive ? 'is-lounge-mode' : ''
      } ${isChatActive ? 'is-lounge-chat-mode' : ''}`}
    >
      {/* 1. Schedule Detail View */}
      {viewMode === 'detail' && (
        <section className="list-section">
            <div className="detail-top-bar">
              <button
                type="button"
                className="detail-back-btn"
                onClick={onBackToList}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="22"
                  height="22"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                <span>일정 목록</span>
              </button>

          <div className="badge-group">
            {canManage && (
              <>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setEditingInfo((prev) => !prev)}
                >
                  {editingInfo
                    ? '수정 닫기'
                    : adminUser
                    ? '운영진 일정 수정'
                    : '일정 수정'}
                </button>
                {isLeader && (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ color: '#ef4444', borderColor: '#ef4444' }}
                    onClick={() =>
                      runArmed('delete-meeting-top', handleDeleteThisMeeting)
                    }
                  >
                    {isArmed('delete-meeting-top') ? '삭제 확인' : '삭제'}
                  </button>
                )}
              </>
            )}
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => onShareMeeting(meeting)}
            >
              공유
            </button>
          </div>
        </div>

        {/* Schedule Detail Card */}
        <div className="schedule-detail-card">
          <div className="detail-dday-banner">
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="9" />
              <polyline points="12 7 12 12 15 12" />
            </svg>
            <span>{getDdayBannerText(meeting)}</span>
          </div>

          <div className="detail-card-body">
            <h2 className="detail-card-title">
              {Number(meeting.advanceDeposit) > 0 && (
                <span
                  className="status-pill open"
                  style={{
                    marginRight: '6px',
                    fontSize: '12px',
                    padding: '2px 8px',
                    fontWeight: 700,
                    verticalAlign: 'middle'
                  }}
                >
                  선입금 {Number(meeting.advanceDeposit).toLocaleString()}원
                </span>
              )}
              {meeting.title}
            </h2>
            <div className="detail-card-datetime">
              {formatDetailDateTime(meeting)}
            </div>
            {primaryPlaceText && (
              <div className="detail-card-place">{primaryPlaceText}</div>
            )}
            {meeting.description && (
              <div className="detail-card-desc">{meeting.description}</div>
            )}

            <div className="detail-card-actions">
              {isBungMeeting ? (
                <>
                  <div>
                    {meeting.status === 'open' && (
                      <button
                        type="button"
                        className={`detail-attend-pill ${
                          isApplied ? 'is-attending' : ''
                        }`}
                        onClick={() => onToggleApplyMeeting(meeting.id)}
                      >
                        {isApplied ? '참석 ✓' : '참석'}
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    className="detail-attendee-count-btn"
                    onClick={() => setShowAttendeeDrawer((prev) => !prev)}
                  >
                    <span>{displayAttendeeUids.length} 명 참석</span>
                    <span aria-hidden="true">&gt;</span>
                  </button>
                </>
              ) : (
                <span className="sub-meta">참석 응답 미요청 일정</span>
              )}
            </div>
          </div>

          {/* Expandable Attendee List when clicking '3 명 참석 >' */}
          {showAttendeeDrawer && (
            <div className="detail-attendee-drawer">
              <div className="detail-attendee-drawer-header">
                <strong>참석 명단 ({displayAttendeeUids.length}명)</strong>
                <button
                  type="button"
                  className="btn-link"
                  onClick={() => setShowAttendeeDrawer(false)}
                >
                  닫기
                </button>
              </div>
              {displayAttendeeUids.length === 0 ? (
                <p className="muted-text">아직 참석 신청자가 없습니다.</p>
              ) : (
                <div className="detail-attendee-grid">
                  {displayAttendeeUids.map((uid) => {
                    const mem = members.find((m) => m.uid === uid);
                    if (!mem) return null;
                    const isHost = uid === meeting.hostUid;
                    const isTreasurer = uid === treasurerUid;
                    return (
                      <div key={uid} className="detail-attendee-item">
                        <span
                          className="feed-avatar-circle sm"
                          style={{ backgroundColor: getAvatarBg(uid) }}
                        >
                          {mem.realName.slice(0, 1)}
                        </span>
                        <span className="detail-attendee-nick">
                          {formatMemberNickname(mem)}
                        </span>
                        {isHost && (
                          <span className="platform-badge">벙주</span>
                        )}
                        {!isHost && isTreasurer && (
                          <span className="location-pill">총무</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Host / Treasurer / Admin Basic Info Edit Form (Matches Calendar Card Style) */}
        {editingInfo && canManage && (
          <form
            onSubmit={handleSaveBasicInfo}
            style={{
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px solid var(--color-divider)'
            }}
          >
            <div className="calendar-create-card">
              {/* Row 1: Schedule Title */}
              <div className="calendar-title-row">
                <input
                  type="text"
                  className="calendar-title-input"
                  placeholder="일정 제목"
                  aria-label="일정 제목"
                  required
                  value={infoForm.title}
                  onChange={(e) =>
                    setInfoForm({ ...infoForm, title: e.target.value })
                  }
                />
              </div>

              {/* Row 2: Start Date & Time with Clock Icon */}
              <div className="calendar-field-row">
                <div className="calendar-icon-col" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    className="calendar-line-icon"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <polyline points="12 7 12 12 15.5 12" />
                  </svg>
                </div>
                <div className="calendar-body-col has-divider">
                  <div className="calendar-datetime-inline">
                    <label className="calendar-picker-label">
                      <span>{formatKoreanFullDate(infoForm.dateOnly)}</span>
                      <input
                        type="date"
                        className="calendar-hidden-picker"
                        value={infoForm.dateOnly}
                        onClick={openPicker}
                        onChange={(e) => {
                          const val = e.target.value;
                          setInfoForm((prev) => ({
                            ...prev,
                            dateOnly: val,
                            endDateOnly:
                              prev.endDateOnly < val ? val : prev.endDateOnly
                          }));
                        }}
                      />
                    </label>

                    {!infoForm.allDay && (
                      <label className="calendar-picker-label">
                        <span>{formatKoreanAmPm(infoForm.startTime)}</span>
                        <input
                          type="time"
                          className="calendar-hidden-picker"
                          value={infoForm.startTime}
                          onClick={openPicker}
                          onChange={(e) => {
                            const val = e.target.value;
                            setInfoForm((prev) => ({
                              ...prev,
                              startTime: val,
                              endTime: addHoursToTime(val, 1)
                            }));
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 3: End Date & Time (Indented) */}
              <div className="calendar-field-row">
                <div className="calendar-icon-col" aria-hidden="true" />
                <div className="calendar-body-col has-divider">
                  <div className="calendar-datetime-inline">
                    <label className="calendar-picker-label">
                      <span>{formatKoreanFullDate(infoForm.endDateOnly)}</span>
                      <input
                        type="date"
                        className="calendar-hidden-picker"
                        min={infoForm.dateOnly}
                        value={infoForm.endDateOnly}
                        onClick={openPicker}
                        onChange={(e) =>
                          setInfoForm({
                            ...infoForm,
                            endDateOnly: e.target.value
                          })
                        }
                      />
                    </label>

                    {!infoForm.allDay && (
                      <label className="calendar-picker-label">
                        <span>{formatKoreanAmPm(infoForm.endTime)}</span>
                        <input
                          type="time"
                          className="calendar-hidden-picker"
                          value={infoForm.endTime}
                          onClick={openPicker}
                          onChange={(e) =>
                            setInfoForm({
                              ...infoForm,
                              endTime: e.target.value
                            })
                          }
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 4: All-Day Toggle (Indented) */}
              <div className="calendar-field-row">
                <div className="calendar-icon-col" aria-hidden="true" />
                <div className="calendar-body-col has-divider calendar-toggle-row">
                  <span className="calendar-row-text">하루 종일</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={infoForm.allDay}
                    aria-label="하루 종일"
                    className={`calendar-switch ${
                      infoForm.allDay ? 'is-on' : ''
                    }`}
                    onClick={() =>
                      setInfoForm((prev) => ({
                        ...prev,
                        allDay: !prev.allDay
                      }))
                    }
                  >
                    <span className="calendar-switch-thumb">
                      <span className="calendar-switch-dash" />
                    </span>
                  </button>
                </div>
              </div>

              {/* Row 5: Location Input (Optional) */}
              <div className="calendar-field-row">
                <div className="calendar-icon-col" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    className="calendar-line-icon"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 21s-6-5.2-6-10a6 6 0 1 1 12 0c0 4.8-6 10-6 10z" />
                    <circle cx="12" cy="11" r="2.2" />
                  </svg>
                </div>
                <div className="calendar-body-col has-divider">
                  <input
                    type="text"
                    list="edit-schedule-region-list"
                    className="calendar-plain-input"
                    placeholder="위치 입력(선택)"
                    aria-label="위치 입력(선택)"
                    value={infoForm.placeDetail}
                    onChange={(e) =>
                      setInfoForm({
                        ...infoForm,
                        placeDetail: e.target.value
                      })
                    }
                  />
                  <datalist id="edit-schedule-region-list">
                    {REGION_GROUPS.map((g) => (
                      <option key={g.id} value={g.keywords[0]}>
                        {g.name}
                      </option>
                    ))}
                  </datalist>

                  {/* Smart Region Detection / Fallback Dropdown */}
                  {infoForm.placeDetail.trim() && (
                    <div style={{ marginTop: '4px', fontSize: '11px' }}>
                      {editRegionDetected.recognized ? (
                        <span style={{ color: '#059669', fontWeight: 600 }}>
                          ✓ {editRegionDetected.group.name} (권역 자동 감지)
                        </span>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          <span style={{ color: '#d97706', fontWeight: 600, whiteSpace: 'nowrap' }}>
                            권역 설정:
                          </span>
                          <select
                            style={{
                              fontSize: '11px',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              background: 'var(--color-surface, #ffffff)',
                              color: 'var(--color-text, #1e293b)'
                            }}
                            value={infoForm.region || ''}
                            onChange={(e) =>
                              setInfoForm((prev) => ({
                                ...prev,
                                region: e.target.value
                              }))
                            }
                          >
                            <option value="">권역을 선택해주세요 (점수 산정용)</option>
                            {REGION_GROUPS.map((g) => (
                              <option key={g.id} value={g.name}>
                                {g.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 6: Advance Deposit Input (선입금 입력) */}
              <div className="calendar-field-row">
                <div className="calendar-icon-col" aria-hidden="true">
                  <span style={{ fontSize: '15px' }}>💰</span>
                </div>
                <div className="calendar-body-col has-divider">
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    className="calendar-plain-input"
                    placeholder="선입금 금액(원, 선택)"
                    aria-label="선입금 금액"
                    value={infoForm.advanceDeposit || ''}
                    onChange={(e) =>
                      setInfoForm({
                        ...infoForm,
                        advanceDeposit: e.target.value
                      })
                    }
                  />
                </div>
              </div>

              {/* Row 7: Attendance Response Request Toggle */}
              <div className="calendar-field-row">
                <div className="calendar-icon-col" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    className="calendar-line-icon"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div className="calendar-body-col calendar-toggle-row">
                  <span className="calendar-row-text">
                    참석 여부 응답 요청
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={infoForm.requestAttendance}
                    aria-label="참석 여부 응답 요청"
                    className={`calendar-switch ${
                      infoForm.requestAttendance ? 'is-on' : ''
                    }`}
                    onClick={() =>
                      setInfoForm((prev) => ({
                        ...prev,
                        requestAttendance: !prev.requestAttendance
                      }))
                    }
                  >
                    <span className="calendar-switch-thumb">
                      <span className="calendar-switch-dash" />
                    </span>
                  </button>
                </div>
              </div>

              {/* Row 8: Description / Memo (Optional) */}
              <div className="calendar-field-row">
                <div className="calendar-icon-col" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    className="calendar-line-icon"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </div>
                <div className="calendar-body-col">
                  <input
                    type="text"
                    className="calendar-plain-input"
                    placeholder="안내 메모(선택)"
                    aria-label="안내 메모(선택)"
                    value={infoForm.description}
                    onChange={(e) =>
                      setInfoForm({
                        ...infoForm,
                        description: e.target.value
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div
              className="btn-row"
              style={{
                marginTop: '12px',
                justifyContent: 'space-between'
              }}
            >
              {isLeader ? (
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{ color: '#ef4444', borderColor: '#ef4444' }}
                  onClick={() =>
                    runArmed('delete-meeting-form', handleDeleteThisMeeting)
                  }
                >
                  {isArmed('delete-meeting-form') ? '삭제 확인' : '일정 삭제'}
                </button>
              ) : (
                <div />
              )}

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setEditingInfo(false)}
                >
                  취소
                </button>
                <button type="submit" className="btn btn-primary">
                  일정 수정 완료
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Admin-Only Collapsible Accordions: "벙주 변경" & "참석자 변경" (일정 수정 시에만 노출) */}
        {editingInfo && adminUser && (
          <div className="admin-edit-accordion-group">
            {/* Accordion 1: 벙주 변경 */}
            <div className="admin-edit-accordion">
              <button
                type="button"
                className="admin-edit-accordion-header"
                onClick={() => setIsHostAccordionOpen((prev) => !prev)}
              >
                <span className="admin-edit-accordion-title">벙주 변경</span>
                <div className="admin-edit-accordion-meta">
                  <span>
                    {hostMember
                      ? formatMemberNickname(hostMember)
                      : meeting.hostUid}
                    {treasurerUid &&
                    treasurerUid !== meeting.hostUid &&
                    treasurerMember
                      ? ` · 총무 ${treasurerMember.realName}`
                      : ''}
                  </span>
                  <span className="admin-edit-accordion-arrow">
                    {isHostAccordionOpen ? '▲' : '▼'}
                  </span>
                </div>
              </button>

              {isHostAccordionOpen && (
                <div className="admin-edit-accordion-body">
                  {/* Row 1: 벙주 */}
                  <div className="admin-edit-row-card">
                    <span className="admin-edit-row-label">벙주</span>
                    <span className="admin-edit-row-value">
                      {hostMember
                        ? formatMemberNickname(hostMember)
                        : meeting.hostUid}
                    </span>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => setIsHostSearchOpen((prev) => !prev)}
                    >
                      {isHostSearchOpen ? '닫기' : '변경'}
                    </button>
                  </div>

                  {isHostSearchOpen && (
                    <div className="admin-edit-search-box">
                      <input
                        type="text"
                        className="admin-edit-search-input"
                        placeholder="벙주 이름·닉네임·지역 검색"
                        value={hostSearchQuery}
                        onChange={(e) => setHostSearchQuery(e.target.value)}
                      />
                      <div className="admin-edit-search-list">
                        {filteredHostCandidates.map((m) => (
                          <button
                            key={m.uid}
                            type="button"
                            className={`admin-edit-search-item ${
                              m.uid === meeting.hostUid ? 'is-selected' : ''
                            }`}
                            onClick={() => handleAdminChangeHost(m.uid)}
                          >
                            <span>{formatMemberNickname(m)}</span>
                            <span className="sub-meta">{m.city || ''}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Row 2: 총무 (기본: 벙주) */}
                  <div className="admin-edit-row-card">
                    <span className="admin-edit-row-label">총무</span>
                    <span className="admin-edit-row-value">
                      {!meeting.treasurerUid ||
                      meeting.treasurerUid === meeting.hostUid
                        ? hostMember
                          ? formatMemberNickname(hostMember)
                          : '벙주'
                        : treasurerMember
                          ? formatMemberNickname(treasurerMember)
                          : meeting.treasurerUid}
                    </span>
                    <div className="btn-row">
                      {meeting.treasurerUid &&
                        meeting.treasurerUid !== meeting.hostUid && (
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() =>
                              handleAdminChangeTreasurer(meeting.hostUid)
                            }
                          >
                            벙주로
                          </button>
                        )}
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() =>
                          setIsTreasurerSearchOpen((prev) => !prev)
                        }
                      >
                        {isTreasurerSearchOpen ? '닫기' : '변경'}
                      </button>
                    </div>
                  </div>

                  {isTreasurerSearchOpen && (
                    <div className="admin-edit-search-box">
                      <input
                        type="text"
                        className="admin-edit-search-input"
                        placeholder="총무 이름·닉네임·지역 검색"
                        value={treasurerSearchQuery}
                        onChange={(e) =>
                          setTreasurerSearchQuery(e.target.value)
                        }
                      />
                      <div className="admin-edit-search-list">
                        {filteredTreasurerCandidates.map((m) => (
                          <button
                            key={m.uid}
                            type="button"
                            className={`admin-edit-search-item ${
                              m.uid === treasurerUid ? 'is-selected' : ''
                            }`}
                            onClick={() => handleAdminChangeTreasurer(m.uid)}
                          >
                            <span>{formatMemberNickname(m)}</span>
                            <span className="sub-meta">
                              {m.bankAccount ? '계좌등록' : m.city || ''}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Accordion 2: 참석자 변경 */}
            <div className="admin-edit-accordion">
              <button
                type="button"
                className="admin-edit-accordion-header"
                onClick={() => setIsAttendeeAccordionOpen((prev) => !prev)}
              >
                <span className="admin-edit-accordion-title">참석자 변경</span>
                <div className="admin-edit-accordion-meta">
                  <span>{displayAttendeeUids.length}명 참석</span>
                  <span className="admin-edit-accordion-arrow">
                    {isAttendeeAccordionOpen ? '▲' : '▼'}
                  </span>
                </div>
              </button>

              {isAttendeeAccordionOpen && (
                <div className="admin-edit-accordion-body">
                  {/* Current Attendees (벙주는 참석 고정, 일반 참석자는 터치 시 미참석 전환) */}
                  <div className="admin-edit-chip-wrap">
                    {displayAttendeeUids.map((uid) => {
                      const mem = members.find((m) => m.uid === uid);
                      if (!mem) return null;
                      const isHost = uid === meeting.hostUid;
                      return (
                        <button
                          key={uid}
                          type="button"
                          disabled={isHost}
                          className={`admin-edit-member-chip ${
                            isHost ? 'is-host' : ''
                          }`}
                          onClick={() => handleAdminToggleAttendee(uid)}
                        >
                          <span>{formatMemberNickname(mem)}</span>
                          {isHost ? (
                            <span className="admin-edit-role-tag">벙주</span>
                          ) : (
                            <span className="admin-edit-role-tag">미참석 ✕</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Add Attendee Search Box */}
                  <div className="admin-edit-search-box">
                    <input
                      type="text"
                      className="admin-edit-search-input"
                      placeholder="참석자 추가 검색 (이름·닉네임·지역)"
                      value={attendeeSearchQuery}
                      onChange={(e) => setAttendeeSearchQuery(e.target.value)}
                    />
                    <div className="admin-edit-search-list">
                      {filteredAttendeeCandidates.map((m) => (
                        <button
                          key={m.uid}
                          type="button"
                          className="admin-edit-search-item"
                          onClick={() => {
                            handleAdminToggleAttendee(m.uid);
                            setAttendeeSearchQuery('');
                          }}
                        >
                          <span>{formatMemberNickname(m)}</span>
                          <span className="admin-edit-role-tag">+ 참석</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Prominent 벙대기실 Entry Card (Only rendered to attendees & admins when requestAttendance !== false) */}
        {isBungMeeting && canAccessLounge && (
          loungeOpen ? (
            <div
              role="button"
              tabIndex={0}
              className="lounge-entry-card"
              onClick={() => handleNavigateView('lounge')}
              onKeyDown={(e) =>
                e.key === 'Enter' && handleNavigateView('lounge')
              }
            >
              <div className="lounge-entry-body">
                <div className="lounge-entry-title">
                  <strong>벙대기실 입장하기</strong>
                  {(isApplied || isConfirmedParticipant) && (
                    <span className="lounge-attend-badge">참석 중</span>
                  )}
                </div>
              </div>
              <span className="lounge-entry-arrow" aria-hidden="true">
                &gt;
              </span>
            </div>
          ) : isLoungeRequested ? (
            <div
              role={canCancelLoungeRequest ? 'button' : undefined}
              tabIndex={canCancelLoungeRequest ? 0 : undefined}
              aria-disabled={loungeRequestPending || undefined}
              className={`lounge-entry-card${
                canCancelLoungeRequest ? '' : ' is-static'
              }`}
              onClick={
                canCancelLoungeRequest ? handleCancelLoungeRequest : undefined
              }
              onKeyDown={(e) =>
                canCancelLoungeRequest &&
                e.key === 'Enter' &&
                handleCancelLoungeRequest()
              }
            >
              <div className="lounge-entry-body">
                <div className="lounge-entry-title">
                  <strong>벙대기실 사용 요청 완료</strong>
                  <span className="lounge-waiting-badge">승인 대기 중</span>
                </div>
              </div>
              {adminUser && (
                <div className="badge-group" style={{ flexShrink: 0 }}>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApproveLounge();
                    }}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    운영진 승인
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div
              role="button"
              tabIndex={0}
              aria-disabled={loungeRequestPending || undefined}
              className="lounge-entry-card"
              onClick={handleRequestLounge}
              onKeyDown={(e) => e.key === 'Enter' && handleRequestLounge()}
            >
              <div className="lounge-entry-body">
                <div className="lounge-entry-title">
                  <strong>벙대기실 사용 요청</strong>
                  <span className="lounge-dday-badge">당일 자동 오픈</span>
                </div>
              </div>
              {adminUser && (
                <div className="badge-group" style={{ flexShrink: 0 }}>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApproveLounge();
                    }}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    즉시 오픈
                  </button>
                </div>
              )}
            </div>
          )
        )}
      </section>
      )}

      {/* 2. Dedicated "벙대기실" View */}
      {viewMode === 'lounge' && isBungMeeting && (
        !canAccessLounge || (!loungeOpen && !adminUser) ? (
          <section className="list-section">
            <div className="detail-top-bar">
              <button
                type="button"
                className="detail-back-btn"
                onClick={() => handleNavigateView('detail')}
              >
                <span>← 일정 상세로 돌아가기</span>
              </button>
            </div>
            <div className="card-box" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <h3 style={{ margin: 0, fontSize: '17px' }}>벙대기실 입장 불가</h3>
              <p className="muted-text" style={{ marginTop: '10px', fontSize: '14px' }}>
                {!canAccessLounge
                  ? '모임 참석 신청자 또는 운영진만 벙대기실에 입장할 수 있습니다.'
                  : '벙대기실은 모임 당일(00:00)에 자동 오픈되거나 운영진 사전 승인 후 입장할 수 있습니다.'}
              </p>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                style={{ marginTop: '16px' }}
                onClick={() => handleNavigateView('detail')}
              >
                일정 상세 보기
              </button>
            </div>
          </section>
        ) : (
        <section
          className={`list-section bung-lounge-section ${
            isLoungeActive ? 'is-lounge-mode' : ''
          } ${isChatActive ? 'is-lounge-chat-mode' : ''}`}
          id="bung-lounge"
        >
          {/* Accordion Header: Minimized Bar vs Full Title Banner */}
          {isLoungeHeaderCollapsed ? (
            <div
              className="lounge-minimized-bar"
              onClick={() => setIsLoungeHeaderCollapsed(false)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) =>
                e.key === 'Enter' && setIsLoungeHeaderCollapsed(false)
              }
              title="클릭 시 벙제목 펼치기"
            >
              <div className="lounge-minimized-left">
                <span className={`lounge-minimized-badge ${isMeetingSettled ? 'is-settled' : ''}`}>
                  {isMeetingSettled ? '종료' : (metroStages[metroActiveIdx]?.label || '진행')}
                </span>
                <span className="lounge-minimized-title">
                  {Number(meeting.advanceDeposit) > 0 && (
                    <span
                      className="status-pill open"
                      style={{
                        marginRight: '6px',
                        fontSize: '11px',
                        padding: '1px 5px',
                        fontWeight: 700
                      }}
                    >
                      선입금 {Number(meeting.advanceDeposit).toLocaleString()}원
                    </span>
                  )}
                  {meeting.title}
                </span>
              </div>
              <button
                type="button"
                className="lounge-collapse-btn minimized"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLoungeHeaderCollapsed(false);
                }}
                title="벙제목 펼치기"
              >
                <span>펼치기</span>
                <span className="collapse-arrow">▼</span>
              </button>
            </div>
          ) : (
            <div
              className="lounge-meeting-summary"
              role="button"
              tabIndex={0}
              onClick={() => setIsLoungeHeaderCollapsed(true)}
              onKeyDown={(e) =>
                e.key === 'Enter' && setIsLoungeHeaderCollapsed(true)
              }
              title="클릭 시 벙제목 최소화 (접기)"
            >
              <div className="lounge-summary-header-row">
                <div>
                  <div className="lounge-summary-title">
                    {Number(meeting.advanceDeposit) > 0 && (
                      <span
                        className="status-pill open"
                        style={{
                          marginRight: '6px',
                          fontSize: '12px',
                          padding: '2px 6px',
                          fontWeight: 700
                        }}
                      >
                        선입금 {Number(meeting.advanceDeposit).toLocaleString()}원
                      </span>
                    )}
                    {meeting.title}
                  </div>
                  <div className="lounge-summary-meta">
                    <span>{meeting.date}</span>
                    {meeting.location && <span> · {meeting.location}</span>}
                    <span>
                      {' '}· 벙주:{' '}
                      {hostMember ? hostMember.realName : meeting.hostUid} ·
                      총무:{' '}
                      {treasurerMember
                        ? treasurerMember.realName
                        : treasurerUid}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="lounge-collapse-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLoungeHeaderCollapsed(true);
                  }}
                  title="벙제목 최소화 (접기)"
                >
                  <span>접기</span>
                  <span className="collapse-arrow">▲</span>
                </button>
              </div>

              {/* Subway Route Map Progress Bar & Driver Button */}
              <div
                className="lounge-metro-row"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="lounge-metro-track">
                  <div className="lounge-metro-line">
                    <div
                      className="lounge-metro-line-fill"
                      style={{ width: `${metroFillPercent}%` }}
                    />
                  </div>
                  {metroStages.map((stage, sIdx) => {
                    const isPassed = sIdx < metroActiveIdx;
                    const isActive = sIdx === metroActiveIdx;
                    return (
                      <div
                        key={stage.key}
                        className={`lounge-metro-node ${
                          isActive ? 'is-active' : isPassed ? 'is-passed' : ''
                        }`}
                      >
                        <span className="lounge-metro-circle" />
                        <span className="lounge-metro-label">
                          {stage.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Single Progress Driver Button */}
                {isMeetingSettled ? (
                  adminUser ? (
                    <button
                      type="button"
                      className="lounge-metro-btn is-rose"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAdminReopenForEdit();
                      }}
                      title="클릭 시 마감을 롤백하고 모임을 다시 오픈하여 수정합니다"
                    >
                      운영진 수정
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="lounge-metro-btn is-dark"
                      disabled
                      title="마감된 모임입니다"
                    >
                      종료
                    </button>
                  )
                ) : (
                  <button
                    type="button"
                    className={`lounge-metro-btn ${metroBtnClass}`}
                    disabled={!canManage}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCycleMetroProgress();
                    }}
                    title={canManage ? '진행 상태 변경' : '진행 상태 (호스트/운영진)'}
                  >
                    {metroBtnLabel}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 5-Tab Segmented Navigation inside 벙대기실 (Always visible) */}
          <div className="lounge-tab-bar" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={loungeTab === 'chat'}
              className={`lounge-tab-btn ${
                loungeTab === 'chat' ? 'active' : ''
              }`}
              onClick={() => {
                if (loungeTab === 'chat') {
                  setShowChatUsersAccordion((prev) => !prev);
                  setIsEditingChatUsers(false);
                } else {
                  setLoungeTab('chat');
                }
              }}
            >
              {loungeTab === 'chat'
                ? showChatUsersAccordion
                  ? '친구닫기'
                  : '친구보기'
                : '대화'}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={loungeTab === 'rounds'}
              className={`lounge-tab-btn ${
                loungeTab === 'rounds' ? 'active' : ''
              }`}
              onClick={() => {
                if (loungeTab === 'rounds') {
                  // Toggle collapse / expand all round cards
                  const allCollapsed =
                    rounds.length > 0 &&
                    rounds.every((_, idx) => Boolean(collapsedRoundIndices[idx]));
                  const nextCollapsed = !allCollapsed;
                  const nextMap = {};
                  rounds.forEach((_, idx) => {
                    nextMap[idx] = nextCollapsed;
                  });
                  setCollapsedRoundIndices(nextMap);
                } else {
                  setLoungeTab('rounds');
                  setShowChatUsersAccordion(false);
                }
              }}
            >
              장소
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={loungeTab === 'settlement'}
              className={`lounge-tab-btn ${
                loungeTab === 'settlement' ? 'active' : ''
              }`}
              onClick={() => {
                if (loungeTab === 'settlement') {
                  const allOpen =
                    isMyCostAccordionOpen &&
                    isSettleOverviewAccordionOpen &&
                    isPersonalListAccordionOpen;
                  const nextState = !allOpen;
                  setIsMyCostAccordionOpen(nextState);
                  setIsSettleOverviewAccordionOpen(nextState);
                  setIsPersonalListAccordionOpen(nextState);
                } else {
                  setLoungeTab('settlement');
                  setShowChatUsersAccordion(false);
                }
              }}
            >
              정산
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={loungeTab === 'returns'}
              className={`lounge-tab-btn ${
                loungeTab === 'returns' ? 'active' : ''
              }`}
              onClick={() => {
                setLoungeTab('returns');
                setShowChatUsersAccordion(false);
              }}
            >
              마감
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={loungeTab === 'album'}
              className={`lounge-tab-btn ${
                loungeTab === 'album' ? 'active' : ''
              }`}
              onClick={() => {
                setLoungeTab('album');
                setShowChatUsersAccordion(false);
              }}
            >
              앨범 ({album.length})
            </button>
          </div>

          <div className="lounge-body">
            {!canAccessLounge && loungeTab !== 'album' ? (
            <div className="lounge-locked-box">
              <strong>🔒 참석자 및 운영진 전용 공간입니다</strong>
              <p className="muted-text">
                상단 카드에서 [참석] 버튼을 누르면 1·2차 장소 코스, 회비 정산, 귀가
                현황을 확인할 수 있습니다.
                (사진은 [앨범] 탭에서 랜덤 박스를 통해 열람하실 수 있습니다.)
              </p>
            </div>
          ) : (
            <>

            {/* TAB 0: 대화 (카카오톡 스타일 에메랄드 대화방) */}
            {loungeTab === 'chat' && (
              <div className="lounge-chat-container">
                {/* Accordion: Attendees inside lounge vs Attendees not in lounge */}
                {showChatUsersAccordion && (
                  <div
                    className="lounge-chat-accordion"
                    role="region"
                    aria-label="대기실 참석자 목록"
                    onClick={() => {
                      if (!isEditingChatUsers) {
                        setShowChatUsersAccordion(false);
                      }
                    }}
                    style={{ cursor: !isEditingChatUsers ? 'pointer' : 'default' }}
                    title={!isEditingChatUsers ? '클릭 시 접기' : undefined}
                  >
                    <div
                      className="lounge-chat-accordion-title"
                      onClick={() => {
                        if (isEditingChatUsers) {
                          setShowChatUsersAccordion(false);
                          setIsEditingChatUsers(false);
                        }
                      }}
                    >
                      <span>대기실 입장한 참석자 ({enteredAttendeeUids.length}명)</span>
                      <div
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {adminUser && (
                          <button
                            type="button"
                            className={`btn btn-xs ${isEditingChatUsers ? 'btn-primary' : 'btn-outline'}`}
                            style={{
                              padding: '4px 10px',
                              fontSize: '12px',
                              borderRadius: 'var(--radius-base)',
                              fontWeight: 600,
                              lineHeight: '1.2'
                            }}
                            onClick={() => setIsEditingChatUsers((prev) => !prev)}
                          >
                            {isEditingChatUsers ? '완료 ✓' : '편집 ✏️'}
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn-link"
                          style={{
                            fontSize: '12px',
                            padding: '4px 6px',
                            minHeight: '28px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            color: 'var(--color-text-muted)'
                          }}
                          onClick={() => {
                            setShowChatUsersAccordion(false);
                            setIsEditingChatUsers(false);
                          }}
                        >
                          닫기 ✕
                        </button>
                      </div>
                    </div>
                    <div className="lounge-chat-accordion-list">
                      {enteredAttendeeUids.length === 0 ? (
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                          아직 대기실에 입장한 참석자가 없습니다.
                        </span>
                      ) : (
                        enteredAttendeeUids.map((uid) => {
                          const m = members.find((mem) => mem.uid === uid);
                          if (!m) return null;
                          const isHost = uid === meeting.hostUid;
                          return (
                            <button
                              type="button"
                              key={uid}
                              disabled={!isEditingChatUsers}
                              className={`member-chip-btn active ${isEditingChatUsers ? 'is-editable' : ''}`}
                              onClick={
                                isEditingChatUsers
                                  ? (e) => {
                                      e.stopPropagation();
                                      handleToggleLoungeVisitor(uid);
                                    }
                                  : undefined
                              }
                              style={{
                                fontSize: '11.5px',
                                padding: '3px 8px',
                                cursor: isEditingChatUsers ? 'pointer' : 'default',
                                border: isEditingChatUsers ? '1px dashed var(--admin-edit-accent, #334155)' : undefined
                              }}
                              title={isEditingChatUsers ? '클릭 시 미입장으로 변경' : undefined}
                            >
                              {isHost ? '👑 ' : ''}
                              {m.realName}
                              {isEditingChatUsers && <span style={{ marginLeft: '4px', opacity: 0.6 }}>✕</span>}
                            </button>
                          );
                        })
                      )}
                    </div>

                    <div
                      className="lounge-chat-accordion-title"
                      style={{ marginTop: '8px' }}
                      onClick={() => {
                        if (isEditingChatUsers) {
                          setShowChatUsersAccordion(false);
                          setIsEditingChatUsers(false);
                        }
                      }}
                    >
                      <span>대기실 미입장 참석자 ({notEnteredAttendeeUids.length}명)</span>
                    </div>
                    <div className="lounge-chat-accordion-list">
                      {notEnteredAttendeeUids.length === 0 ? (
                        <span style={{ fontSize: '12px', color: '#10b981' }}>
                          참석자 전원이 대기실에 입장했습니다! 🎉
                        </span>
                      ) : (
                        notEnteredAttendeeUids.map((uid) => {
                          const m = members.find((mem) => mem.uid === uid);
                          if (!m) return null;
                          return (
                            <button
                              type="button"
                              key={uid}
                              disabled={!isEditingChatUsers}
                              className={`member-chip-btn inactive ${isEditingChatUsers ? 'is-editable' : ''}`}
                              onClick={
                                isEditingChatUsers
                                  ? (e) => {
                                      e.stopPropagation();
                                      handleToggleLoungeVisitor(uid);
                                    }
                                  : undefined
                              }
                              style={{
                                fontSize: '11.5px',
                                padding: '3px 8px',
                                opacity: isEditingChatUsers ? 0.95 : 0.65,
                                cursor: isEditingChatUsers ? 'pointer' : 'default',
                                border: isEditingChatUsers ? '1px dashed var(--admin-edit-accent, #334155)' : undefined
                              }}
                              title={isEditingChatUsers ? '클릭 시 입장 완료로 변경' : undefined}
                            >
                              {m.realName}
                              {isEditingChatUsers && <span style={{ marginLeft: '4px', opacity: 0.6 }}>+</span>}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* Messages Feed */}
                <div className="lounge-chat-messages">
                  {chatMessages.length === 0 ? (
                    <div
                      style={{
                        margin: 'auto',
                        textAlign: 'center',
                        color: '#64748b',
                        fontSize: '13px'
                      }}
                    >
                      👋 벙대기실 대화방에 오신 것을 환영합니다!<br />
                      메시지를 남기거나 📷 사진을 공유해 보세요.
                    </div>
                  ) : (
                    chatMessages.map((msg) => {
                      const isMe = msg.senderUid === currentUser?.uid;
                      const senderMember = members.find(
                        (m) => m.uid === msg.senderUid
                      );
                      const timeStr = msg.createdAt
                        ? new Date(msg.createdAt).toLocaleTimeString('ko-KR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : '';

                      return (
                        <div
                          key={msg.id}
                          className={`lounge-chat-bubble-row ${
                            isMe ? 'is-me' : 'is-other'
                          }`}
                        >
                          {!isMe && (
                            <div
                              className="lounge-chat-avatar"
                              style={{
                                backgroundColor: getAvatarBg(msg.senderUid)
                              }}
                            >
                              {(msg.senderName || '참').slice(0, 1)}
                            </div>
                          )}

                          <div className="lounge-chat-content-wrap">
                            {!isMe && (
                              <span className="lounge-chat-sender-name">
                                {senderMember
                                  ? formatMemberNickname(senderMember)
                                  : msg.senderName}
                              </span>
                            )}

                            <div className="lounge-chat-bubble-time-group">
                              <div
                                className={`lounge-chat-bubble ${
                                  isMe ? 'is-me' : 'is-other'
                                }`}
                              >
                                {msg.imageUrl && (
                                  <img
                                    src={msg.thumbUrl || msg.imageUrl}
                                    alt="공유 사진"
                                    onClick={() =>
                                      setActiveLightboxItem({
                                        id: msg.id,
                                        url: msg.imageUrl,
                                        uploaderUid: msg.senderUid,
                                        uploaderName: msg.senderName,
                                        likes: []
                                      })
                                    }
                                  />
                                )}
                                {msg.text && <div>{msg.text}</div>}
                              </div>
                              <span className="lounge-chat-time">{timeStr}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatMessagesEndRef} />
                </div>

                {/* Chat Input Bar */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (isMeetingSettled || !chatInput.trim()) return;
                    handleSendChatMessage(chatInput);
                    chatTextInputRef.current?.focus();
                  }}
                  className="lounge-chat-input-bar"
                  style={{ opacity: isMeetingSettled ? 0.65 : 1 }}
                >
                  <button
                    type="button"
                    className="lounge-chat-photo-btn"
                    disabled={isMeetingSettled}
                    title={isMeetingSettled ? '마감된 모임입니다' : '사진 첨부 (앨범 자동 등록)'}
                    onClick={() => {
                      if (!isMeetingSettled) chatPhotoInputRef.current?.click();
                    }}
                  >
                    📷
                  </button>
                  <input
                    type="file"
                    ref={chatPhotoInputRef}
                    accept="image/*"
                    style={{ display: 'none' }}
                    disabled={isMeetingSettled}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleChatPhotoUpload(file);
                      e.target.value = '';
                    }}
                  />

                  <input
                    ref={chatTextInputRef}
                    type="text"
                    disabled={isMeetingSettled}
                    placeholder={isMeetingSettled ? '마감된 모임입니다. (대화 비활성화)' : '메시지 입력...'}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onFocus={() => {
                      setTimeout(() => {
                        chatMessagesEndRef.current?.scrollIntoView({
                          behavior: 'smooth'
                        });
                      }, 160);
                    }}
                    autoComplete="off"
                  />

                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={isMeetingSettled || !chatInput.trim()}
                    onMouseDown={(e) => e.preventDefault()}
                    onTouchEnd={(e) => {
                      if (!isMeetingSettled && chatInput.trim()) {
                        e.preventDefault();
                        handleSendChatMessage(chatInput);
                        chatTextInputRef.current?.focus();
                      }
                    }}
                  >
                    전송
                  </button>
                </form>
              </div>
            )}

            {/* TAB 1: 장소 (Accordion Cards on Chat Room #AFC1CF Background) */}
            {loungeTab === 'rounds' && (
              <div className="lounge-tab-content-wrap lounge-rounds-wrap lounge-unified-stack">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {rounds.map((r, idx) => {
                    const rSummary = settlement.roundSummaries[idx] || {};
                    const rParticipants = Array.isArray(r.participants)
                      ? r.participants
                      : [];
                    const isEditingThisRound = editingRoundIdx === idx;
                    const isCollapsed = Boolean(collapsedRoundIndices[idx]);
                    const payerMember = members.find(
                      (m) => m.uid === (r.payerUid || treasurerUid)
                    );
                    const placeSummary = parsePlaceSummary(r.placeName || r.mapUrl);

                    const myMember = members.find((mem) => mem.uid === currentUser?.uid);
                    const isMyChecked = rParticipants.includes(currentUser?.uid);
                    const otherAttendeeUids = displayAttendeeUids.filter(
                      (uid) => uid !== currentUser?.uid
                    );
                    const isBungAttendee = isApplied || isConfirmedParticipant;

                    return (
                      <div key={r.id || idx} className="lounge-round-accordion-card">
                        {/* Accordion Title Header */}
                        <div
                          className="lounge-round-accordion-header"
                          onClick={() => {
                            setCollapsedRoundIndices((prev) => ({
                              ...prev,
                              [idx]: !isCollapsed
                            }));
                          }}
                        >
                          <div className="lounge-round-header-left">
                            <span className="platform-badge">{idx + 1}차</span>
                            <span
                              className="lounge-round-place-text"
                              title={placeSummary.placeName || r.placeName}
                            >
                              {placeSummary.placeName || r.placeName || `${idx + 1}차 장소`}
                            </span>
                          </div>

                          <div
                            className="lounge-round-header-right"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {canManage && !isMeetingSettled && (
                              <button
                                type="button"
                                className={`btn btn-xs ${
                                  isEditingThisRound ? 'btn-primary' : 'btn-outline'
                                }`}
                                style={{
                                  padding: '4px 8px',
                                  fontSize: '11.5px',
                                  borderRadius: 'var(--radius-base)',
                                  fontWeight: 600
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (isEditingThisRound) {
                                    // Finish editing -> collapse round as requested
                                    setEditingRoundIdx(null);
                                    setCollapsedRoundIndices((prev) => ({
                                      ...prev,
                                      [idx]: true
                                    }));
                                  } else {
                                    // Open editing -> unfold round
                                    setEditingRoundIdx(idx);
                                    setCollapsedRoundIndices((prev) => ({
                                      ...prev,
                                      [idx]: false
                                    }));
                                  }
                                }}
                              >
                                {isEditingThisRound ? '완료' : '편집'}
                              </button>
                            )}
                            <button
                              type="button"
                              className="btn-link lounge-round-accordion-arrow"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCollapsedRoundIndices((prev) => ({
                                  ...prev,
                                  [idx]: !isCollapsed
                                }));
                              }}
                              aria-label={isCollapsed ? '펼치기' : '접기'}
                            >
                              {isCollapsed ? '▼' : '▲'}
                            </button>
                          </div>
                        </div>

                        {/* Collapsible Round Body */}
                        {!isCollapsed && (
                          <div className="lounge-round-accordion-body">
                            {/* 장소 상세 내용 (Title 아래, 참석자 수 위) */}
                            {(placeSummary.address || placeSummary.mapUrl || (r.placeName && r.placeName !== placeSummary.placeName)) && (
                              <div className="lounge-round-detail-row">
                                <div className="lounge-round-detail-text">
                                  {placeSummary.address || placeSummary.textWithoutUrl || r.placeName}
                                </div>
                                {placeSummary.mapUrl && (
                                  <a
                                    href={placeSummary.mapUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-xs btn-outline lounge-round-map-btn"
                                    title="지도 새 탭 열기"
                                  >
                                    지도 바로가기 ↗
                                  </a>
                                )}
                              </div>
                            )}

                            {/* Round Meta: Attendee count, cost, and golden bell */}
                            <div className="lounge-round-body-meta">
                              <span className="lounge-round-meta-stat">
                                참석 <strong>{rParticipants.length}</strong>명 · 비용{' '}
                                <strong>{(Number(r.cost) || 0).toLocaleString()}</strong>원
                              </span>
                              {r.isGoldenBell && (
                                <span
                                  className="expedition-pill"
                                  style={{ fontSize: '11px', padding: '1px 6px' }}
                                >
                                  골든벨 (
                                  {members.find((m) => m.uid === r.goldenBellUid)
                                    ?.realName || '찬조'}
                                  )
                                </span>
                              )}
                            </div>

                            {/* Receipt View Button if receiptUrl exists */}
                            {r.receiptUrl && (
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <button
                                  type="button"
                                  className="btn btn-outline btn-xs"
                                  onClick={() =>
                                    setPreviewReceiptUrl(
                                      previewReceiptUrl === r.receiptUrl
                                        ? ''
                                        : r.receiptUrl
                                    )
                                  }
                                >
                                  영수증 보기 {previewReceiptUrl === r.receiptUrl ? '▲' : '▼'}
                                </button>
                              </div>
                            )}

                            {r.receiptUrl && previewReceiptUrl === r.receiptUrl && (
                              <div className="receipt-preview-box">
                                <img
                                  src={r.receiptUrl}
                                  alt={`${idx + 1}차 영수증`}
                                  className="receipt-preview-img"
                                />
                              </div>
                            )}

                            {/* Participant Chips Row: Others on left, my big badge on right */}
                            <div className="round-participants-row">
                              <div className="round-other-chips">
                                {otherAttendeeUids.map((uid) => {
                                  const m = members.find((mem) => mem.uid === uid);
                                  if (!m) return null;
                                  const checked = rParticipants.includes(uid);
                                  const canClick = canManage && !isMeetingSettled;
                                  const isHost = uid === meeting.hostUid;
                                  return (
                                    <button
                                      key={uid}
                                      type="button"
                                      disabled={!canClick}
                                      className={`member-chip-btn ${
                                        checked ? 'active' : 'inactive'
                                      }`}
                                      onClick={() =>
                                        handleToggleRoundParticipant(idx, uid)
                                      }
                                      title={
                                        canClick
                                          ? checked
                                            ? '미참석으로 변경'
                                            : '참석으로 변경'
                                          : undefined
                                      }
                                    >
                                      {isHost ? '👑 ' : ''}
                                      {m.realName}
                                    </button>
                                  );
                                })}
                              </div>

                              {isBungAttendee && myMember && (
                                <button
                                  type="button"
                                  disabled={isMeetingSettled}
                                  className={`my-round-badge ${
                                    isMyChecked ? 'is-active' : 'is-inactive'
                                  }`}
                                  onClick={
                                    !isMeetingSettled
                                      ? () =>
                                          handleToggleRoundParticipant(
                                            idx,
                                            currentUser.uid
                                          )
                                      : undefined
                                  }
                                  title={isMeetingSettled ? '마감된 모임입니다' : '내 참석 여부 변경'}
                                >
                                  <span>
                                    {myMember.uid === meeting.hostUid ? '👑 ' : ''}
                                    {myMember.realName}
                                  </span>
                                  <span className="my-round-badge-status">
                                    {isMyChecked ? '참석' : '미참석'}
                                  </span>
                                </button>
                              )}
                            </div>

                            {/* Collapsible Edit Form for this Round */}
                            {isEditingThisRound && (
                              <div className="round-finance-box">
                                <div className="form-grid">
                                  <div
                                    className="form-field"
                                    style={{ gridColumn: '1 / -1' }}
                                  >
                                    <label>장소 상세</label>
                                    <textarea
                                      rows={6}
                                      className="round-place-textarea"
                                      placeholder={`${
                                        idx + 1
                                      }차 상호명, 상세 주소 또는 지도 URL 입력`}
                                      value={r.placeName || ''}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        const isUrl = /^https?:\/\//i.test(
                                          val.trim()
                                        );
                                        const detected = idx === 0 ? detectRegionFromText(val) : null;
                                        handleUpdateRoundField(idx, {
                                          placeName: val,
                                          ...(isUrl ? { mapUrl: val.trim() } : {})
                                        });
                                        if (detected && detected.recognized) {
                                          onUpdateMeeting(meeting.id, {
                                            region: detected.group.name
                                          });
                                        }
                                      }}
                                    />

                                    {/* Smart Region Detection / Fallback Dropdown for 1차 장소 */}
                                    {idx === 0 && (r.placeName || '').trim() && (
                                      <div style={{ marginTop: '4px', fontSize: '11px' }}>
                                        {detectRegionFromText(r.placeName).recognized ? (
                                          <span style={{ color: '#059669', fontWeight: 600 }}>
                                            ✓ {detectRegionFromText(r.placeName).group.name} (권역 자동 감지)
                                          </span>
                                        ) : (
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                            <span style={{ color: '#d97706', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                              권역 설정:
                                            </span>
                                            <select
                                              style={{
                                                fontSize: '11px',
                                                padding: '2px 8px',
                                                borderRadius: '6px',
                                                border: '1px solid #cbd5e1',
                                                background: 'var(--color-surface, #ffffff)',
                                                color: 'var(--color-text, #1e293b)'
                                              }}
                                              value={meeting.region || ''}
                                              onChange={(e) =>
                                                onUpdateMeeting(meeting.id, {
                                                  region: e.target.value
                                                })
                                              }
                                            >
                                              <option value="">권역을 선택해주세요 (점수 산정용)</option>
                                              {REGION_GROUPS.map((g) => (
                                                <option key={g.id} value={g.name}>
                                                  {g.name}
                                                </option>
                                              ))}
                                            </select>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <div className="form-field">
                                    <label>{idx + 1}차 결제자</label>
                                    <select
                                      value={r.payerUid || treasurerUid}
                                      onChange={(e) =>
                                        handleUpdateRoundField(idx, {
                                          payerUid: e.target.value
                                        })
                                      }
                                    >
                                      {attendeeMembers.map((m) => (
                                        <option key={m.uid} value={m.uid}>
                                          {formatMemberNickname(m)}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="form-field">
                                    <label>{idx + 1}차 비용 (원)</label>
                                    <input
                                      type="number"
                                      min="0"
                                      step="100"
                                      placeholder="0"
                                      value={r.cost || ''}
                                      onChange={(e) =>
                                        handleUpdateRoundField(idx, {
                                          cost: Number(e.target.value) || 0
                                        })
                                      }
                                    />
                                  </div>
                                </div>

                                <div className="round-extra-row">
                                  <div className="control-inline">
                                    <label className="check-item">
                                      <input
                                        type="checkbox"
                                        checked={Boolean(r.isGoldenBell)}
                                        onChange={(e) =>
                                          handleUpdateRoundField(idx, {
                                            isGoldenBell: e.target.checked,
                                            goldenBellUid: e.target.checked
                                              ? r.goldenBellUid ||
                                                r.payerUid ||
                                                currentUser?.uid
                                              : ''
                                          })
                                        }
                                      />
                                      <span>골든벨</span>
                                    </label>
                                    {r.isGoldenBell && (
                                      <select
                                        value={
                                          r.goldenBellUid || r.payerUid || ''
                                        }
                                        onChange={(e) =>
                                          handleUpdateRoundField(idx, {
                                            goldenBellUid: e.target.value
                                          })
                                        }
                                      >
                                        {attendeeMembers.map((m) => (
                                          <option key={m.uid} value={m.uid}>
                                            {formatMemberNickname(m)}
                                          </option>
                                        ))}
                                      </select>
                                    )}
                                  </div>

                                  <div className="control-inline">
                                    <label
                                      className="btn btn-outline btn-sm"
                                      style={{ cursor: 'pointer' }}
                                    >
                                      {r.receiptUrl
                                        ? '영수증 변경'
                                        : '영수증 첨부'}
                                      <input
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={(e) =>
                                          handleReceiptUpload(
                                            idx,
                                            e.target.files?.[0]
                                          )
                                        }
                                      />
                                    </label>
                                    {rounds.length > 1 && canManage && !isMeetingSettled && (
                                      <button
                                        type="button"
                                        className="btn btn-outline btn-sm"
                                        onClick={() => handleRemoveRound(idx)}
                                      >
                                        차수 삭제
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* + N차 추가 button below rounds section */}
                {!isMeetingSettled && canManage && (
                  <div className="lounge-add-round-row">
                    <button
                      type="button"
                      className="btn btn-sm lounge-add-round-btn"
                      onClick={handleAddRound}
                    >
                      + {rounds.length + 1}차 추가
                    </button>
                  </div>
                )}
              </div>
            )}


            {/* TAB 2: 정산·회비 (3대 아코디언 카드: 나의 회비 / 정산 내역 / 개인별 내역) */}
            {loungeTab === 'settlement' && (
              <div className="lounge-tab-content-wrap lounge-unified-stack">
                {/* ========================================================
                    [섹션 1] 나의 회비 아코디언 카드
                   ======================================================== */}
                <div className="settle-accordion-card">
                  <div
                    className="settle-accordion-header"
                    onClick={() => setIsMyCostAccordionOpen(!isMyCostAccordionOpen)}
                  >
                    <div className="settle-accordion-header-left">
                      <span className="settle-chevron">
                        {isMyCostAccordionOpen ? '▼' : '▶'}
                      </span>
                      <strong style={{ fontSize: '15px' }}>나의 회비</strong>
                    </div>

                    <div
                      className="settle-accordion-header-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {mySettlementRow ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'nowrap' }}>
                          {/* 선입금 정보 */}
                          {mySettlementRow.depositAmount > 0 && (
                            <span className="settle-title-deposit">
                              선입금 {mySettlementRow.depositAmount.toLocaleString()}원
                              {mySettlementRow.depositConfirmed ? (
                                <span className="deposit-tag confirmed">컨펌완료</span>
                              ) : mySettlementRow.depositPaid ? (
                                <span className="deposit-tag paid">입금완료</span>
                              ) : (
                                <button
                                  type="button"
                                  className="btn btn-xs btn-outline"
                                  disabled={isMeetingSettled}
                                  style={{ marginLeft: '4px', padding: '0 6px', height: '26px', fontSize: '11px', opacity: isMeetingSettled ? 0.6 : 1 }}
                                  onClick={() => handleToggleDepositPaid(currentUser.uid)}
                                >
                                  {isMeetingSettled ? '마감됨' : '선입금완료'}
                                </button>
                              )}
                            </span>
                          )}

                          {/* 최종 회비 & 입금 완료 버튼 */}
                          <span className="settle-title-share">
                            회비 {Math.abs(mySettlementRow.netToPay).toLocaleString()}원
                          </span>

                          <button
                            type="button"
                            disabled={isMeetingSettled}
                            className={`btn btn-xs ${
                              mySettlementRow.confirmed
                                ? 'btn-outline'
                                : mySettlementRow.paid
                                ? 'btn-outline'
                                : 'btn-primary'
                            }`}
                            style={{ height: '28px', minHeight: '28px', padding: '0 8px', fontSize: '11.5px', fontWeight: 600, opacity: isMeetingSettled ? 0.8 : 1 }}
                            onClick={() => handleTogglePaid(currentUser.uid)}
                          >
                            {isMeetingSettled
                              ? '정산 마감 ✓'
                              : mySettlementRow.confirmed
                              ? '컨펌됨 ✓'
                              : mySettlementRow.paid
                              ? '입금완료 해제'
                              : '입금 완료'}
                          </button>
                        </div>
                      ) : (
                        <span className="sub-meta">참석자 미등록</span>
                      )}
                    </div>
                  </div>

                  {isMyCostAccordionOpen && (
                    <div className="settle-accordion-body">
                      {mySettlementRow ? (
                        <div className="settle-table-wrap">
                          <table className="settle-data-table">
                            <thead>
                              <tr>
                                <th style={{ width: '52%' }}>내역</th>
                                <th style={{ width: '28%', textAlign: 'right' }}>금액</th>
                                <th style={{ width: '20%', textAlign: 'center' }}>상태</th>
                              </tr>
                            </thead>
                            <tbody>
                              {/* 선입금 행 (선입금이 있는 모임/인원만 조건부 렌더링) */}
                              {((mySettlementRow.depositAmount || 0) > 0 || (Number(meeting.advanceDeposit) || 0) > 0) && (
                                <tr style={{ background: '#f8fafc' }}>
                                  <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <span
                                        className="platform-badge"
                                        style={{
                                          fontSize: '10px',
                                          padding: '1px 6px',
                                          background: '#e0f2fe',
                                          color: '#0369a1',
                                          borderColor: '#bae6fd',
                                          whiteSpace: 'nowrap',
                                          flexShrink: 0
                                        }}
                                      >
                                        선입금
                                      </span>
                                      <span style={{ fontWeight: 600, color: '#0369a1', fontSize: '12.5px' }}>모임 선입금</span>
                                    </div>
                                  </td>
                                  <td style={{ color: '#0284c7', fontWeight: 700, textAlign: 'right' }}>
                                    -{(mySettlementRow.depositAmount || 0).toLocaleString()}원
                                  </td>
                                  <td style={{ textAlign: 'center' }}>
                                    {mySettlementRow.depositConfirmed ? (
                                      <span className="deposit-tag confirmed">컨펌완료 ✓</span>
                                    ) : mySettlementRow.depositPaid ? (
                                      <span className="deposit-tag paid">입금확인중</span>
                                    ) : (
                                      <button
                                        type="button"
                                        className="btn btn-xs btn-outline"
                                        style={{ padding: '2px 8px', fontSize: '11px', height: '24px' }}
                                        onClick={() => handleToggleDepositPaid(currentUser.uid)}
                                      >
                                        입금완료
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              )}

                              {/* 차수별 참석 행 (순수 상호명만 추출 & 한 줄 고정 & 뱃지 찌그러짐 방지) */}
                              {(mySettlementRow.roundBreakdown || []).map((rb) => {
                                const pSummary = parsePlaceSummary(rb.placeName || rb.title);
                                const cleanPlaceName = pSummary.placeName || rb.title || `${rb.roundNumber}차 장소`;
                                return (
                                  <tr key={rb.roundNumber}>
                                    <td style={{ minWidth: 0, overflow: 'hidden' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, overflow: 'hidden' }}>
                                        <span
                                          className="platform-badge"
                                          style={{
                                            fontSize: '10px',
                                            padding: '1px 6px',
                                            whiteSpace: 'nowrap',
                                            flexShrink: 0,
                                            minWidth: '34px',
                                            height: '22px',
                                            boxSizing: 'border-box',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                          }}
                                        >
                                          {rb.roundNumber}차
                                        </span>
                                        <span
                                          style={{
                                            fontWeight: 600,
                                            color: '#1e293b',
                                            fontSize: '12.5px',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            flex: 1,
                                            minWidth: 0
                                          }}
                                          title={pSummary.address || cleanPlaceName}
                                        >
                                          {cleanPlaceName}
                                        </span>
                                      </div>
                                    </td>
                                    <td style={{ textAlign: 'right', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                      {(rb.share ?? rb.perPerson ?? 0).toLocaleString()}원
                                    </td>
                                    <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                                      <span className="deposit-tag confirmed" style={{ fontSize: '10.5px' }}>참석</span>
                                    </td>
                                  </tr>
                                );
                              })}

                              {/* 찬조/스폰서 할인 */}
                              {(mySettlementRow.sponsorDiscount || 0) > 0 && (
                                <tr style={{ background: '#f0fdf4' }}>
                                  <td>
                                    <span style={{ color: '#16a34a', fontWeight: 600 }}>찬조/골든벨 할인</span>
                                  </td>
                                  <td style={{ color: '#16a34a', fontWeight: 700, textAlign: 'right' }}>
                                    -{(mySettlementRow.sponsorDiscount || 0).toLocaleString()}원
                                  </td>
                                  <td style={{ textAlign: 'center' }}>
                                    <span className="sub-meta">적용됨</span>
                                  </td>
                                </tr>
                              )}

                              {/* 수동 조정 */}
                              {(mySettlementRow.manualAdjustment || 0) !== 0 && (
                                <tr>
                                  <td>
                                    <span style={{ color: (mySettlementRow.manualAdjustment || 0) > 0 ? '#ef4444' : '#16a34a', fontWeight: 600 }}>
                                      수동 조정
                                    </span>
                                  </td>
                                  <td style={{ color: (mySettlementRow.manualAdjustment || 0) > 0 ? '#ef4444' : '#16a34a', fontWeight: 700, textAlign: 'right' }}>
                                    {(mySettlementRow.manualAdjustment || 0) > 0 ? '+' : ''}
                                    {(mySettlementRow.manualAdjustment || 0).toLocaleString()}원
                                  </td>
                                  <td style={{ textAlign: 'center' }}>
                                    <span className="sub-meta">반영됨</span>
                                  </td>
                                </tr>
                              )}

                              {/* 총합계 행 */}
                              <tr style={{ background: '#f1f5f9', fontWeight: 700 }}>
                                <td>
                                  <strong style={{ color: '#0f172a' }}>
                                    {(mySettlementRow.netToPay || 0) >= 0 ? '최종 보낼 회비' : '총무에게 환급받을 금액'}
                                  </strong>
                                </td>
                                <td style={{ color: '#0f172a', fontSize: '14px', fontWeight: 800, textAlign: 'right' }}>
                                  {Math.abs(mySettlementRow.netToPay || 0).toLocaleString()}원
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                  {mySettlementRow.confirmed ? (
                                    <span className="deposit-tag confirmed">정산 완료 ✓</span>
                                  ) : mySettlementRow.paid ? (
                                    <span className="deposit-tag paid">확인 대기중</span>
                                  ) : (
                                    <button
                                      type="button"
                                      className="btn btn-xs btn-primary"
                                      style={{ padding: '2px 8px', fontSize: '11px', height: '24px' }}
                                      onClick={() => handleTogglePaid(currentUser.uid)}
                                    >
                                      입금 완료
                                    </button>
                                  )}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="empty-helper-text" style={{ padding: '16px' }}>
                          현재 모임의 참석자 목록에 포함되어 있지 않습니다.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* ========================================================
                    [섹션 2] 정산 내역 아코디언 카드
                   ======================================================== */}
                <div className="settle-accordion-card">
                  <div
                    className="settle-accordion-header"
                    onClick={() => setIsSettleOverviewAccordionOpen(!isSettleOverviewAccordionOpen)}
                  >
                    <div className="settle-accordion-header-left">
                      <span className="settle-chevron">
                        {isSettleOverviewAccordionOpen ? '▼' : '▶'}
                      </span>
                      <strong style={{ fontSize: '15px' }}>정산 내역</strong>
                    </div>

                    <div
                      className="settle-accordion-header-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="settle-bank-wrap">
                        <span className="settle-bank-label">입금계좌:</span>
                        <span className="settle-bank-val">
                          {treasurerMember?.bankAccount || '총무 계좌 미등록'}
                        </span>
                        {treasurerMember?.bankAccount && (
                          <button
                            type="button"
                            className="btn btn-xs btn-outline"
                            onClick={() => handleCopyAccount(treasurerMember.bankAccount)}
                          >
                            {copiedAccount ? '복사됨' : '계좌 복사'}
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn-xs btn-outline"
                          onClick={() => setEditingBank((prev) => !prev)}
                        >
                          {editingBank ? '닫기' : '내 계좌'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {editingBank && (
                    <form
                      onSubmit={handleSaveMyBank}
                      className="inline-input-row"
                      style={{ padding: '8px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}
                    >
                      <input
                        type="text"
                        placeholder="은행명 계좌번호 (예금주)"
                        value={myBankInput}
                        onChange={(e) => setMyBankInput(e.target.value)}
                        style={{ height: '36px' }}
                      />
                      <button type="submit" className="btn btn-primary btn-sm" style={{ height: '36px' }}>
                        저장
                      </button>
                    </form>
                  )}

                  {isSettleOverviewAccordionOpen && (
                    <div className="settle-accordion-body lounge-unified-stack">
                      {/* [산출식 시각화] 0원 항목 스마트 숨김 & 가로 스크롤 없는 반응형 컴팩트 수식 바 */}
                      {(() => {
                        const roundCost = settlement.totalRoundCost || settlement.totalGrossCost || 0;
                        const preExp = settlement.totalPreExpense || 0;
                        const sponsor = settlement.totalSponsorship || 0;
                        const deposit = settlement.totalDepositAmount || 0;
                        const netTotal = Math.max(0, settlement.totalSharedCost - sponsor - deposit);

                        return (
                          <div className="settle-formula-bar">
                            <div className="settle-formula-card is-rounds">
                              <span className="settle-formula-label">차수 합산</span>
                              <span className="settle-formula-val">{roundCost.toLocaleString()}원</span>
                            </div>

                            {preExp > 0 && (
                              <>
                                <span className="settle-formula-op">+</span>
                                <div className="settle-formula-card is-pre">
                                  <span className="settle-formula-label">사전 지출</span>
                                  <span className="settle-formula-val">{preExp.toLocaleString()}원</span>
                                </div>
                              </>
                            )}

                            {sponsor > 0 && (
                              <>
                                <span className="settle-formula-op">-</span>
                                <div className="settle-formula-card is-sponsor">
                                  <span className="settle-formula-label">찬조금</span>
                                  <span className="settle-formula-val" style={{ color: '#15803d' }}>
                                    -{sponsor.toLocaleString()}원
                                  </span>
                                </div>
                              </>
                            )}

                            {deposit > 0 && (
                              <>
                                <span className="settle-formula-op">-</span>
                                <div className="settle-formula-card is-deposit">
                                  <span className="settle-formula-label">선입금</span>
                                  <span className="settle-formula-val" style={{ color: '#0369a1' }}>
                                    -{deposit.toLocaleString()}원
                                  </span>
                                </div>
                              </>
                            )}

                            <span className="settle-formula-op">=</span>
                            <div className="settle-formula-card is-result">
                              <span className="settle-formula-label">1/N 정산액</span>
                              <span className="settle-formula-val">{netTotal.toLocaleString()}원</span>
                            </div>
                          </div>
                        );
                      })()}

                      {/* 테이블 정렬 툴바 */}
                      <div className="settle-table-toolbar">
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                          모임 정산 상세 (차수 · 지출 · 찬조)
                        </span>
                        <div className="settle-sort-pill-group">
                          <button
                            type="button"
                            className={`settle-sort-pill ${settleSortMode === 'default' ? 'is-active' : ''}`}
                            onClick={() => setSettleSortMode('default')}
                          >
                            차수순
                          </button>
                          <button
                            type="button"
                            className={`settle-sort-pill ${settleSortMode === 'amountDesc' ? 'is-active' : ''}`}
                            onClick={() => setSettleSortMode('amountDesc')}
                          >
                            금액높은순
                          </button>
                          <button
                            type="button"
                            className={`settle-sort-pill ${settleSortMode === 'participantsDesc' ? 'is-active' : ''}`}
                            onClick={() => setSettleSortMode('participantsDesc')}
                          >
                            인원많은순
                          </button>
                        </div>
                      </div>

                      {/* 모임 전체 정산표 (상호명 1줄 고정 & 방안 1: 참석자 1줄 요약 + 원터치 팝오버) */}
                      <div className="settle-table-wrap">
                        <table className="settle-data-table">
                          <thead>
                            <tr>
                              <th style={{ width: '56%' }}>항목 / 장소</th>
                              <th style={{ width: '30%', textAlign: 'right' }}>금액</th>
                              <th style={{ width: '14%', textAlign: 'center' }}>비고</th>
                            </tr>
                          </thead>
                          <tbody>
                            {/* 차수별 2행 구조 (1행: 상호명 1줄 고정 / 2행: 방안 1 참석자 1줄 요약 팝오버) */}
                            {(() => {
                              const baseList = (rounds || []).map((round, idx) => ({
                                round,
                                originalIdx: idx,
                                roundNum: round.roundNumber || idx + 1,
                                attendeeUids: round.participants || round.attendeeUids || [],
                                roundCost: Number(round.cost ?? round.amount ?? 0)
                              }));

                              if (settleSortMode === 'amountDesc') {
                                baseList.sort((a, b) => b.roundCost - a.roundCost);
                              } else if (settleSortMode === 'participantsDesc') {
                                baseList.sort((a, b) => b.attendeeUids.length - a.attendeeUids.length);
                              }

                              return baseList.map(({ round, roundNum, attendeeUids, roundCost }) => {
                                const attendees = members.filter((m) => attendeeUids.includes(m.uid));
                                const noteKey = `round_${roundNum}`;
                                const pSummary = parsePlaceSummary(round.placeName || round.title);
                                const cleanPlaceName = pSummary.placeName || round.title || `${roundNum}차 장소`;
                                const isPopoverOpen = openAttendeePopoverRound === `round_${roundNum}`;

                                return (
                                  <React.Fragment key={`round-frag-${roundNum}`}>
                                    {/* 1행: 차수, 장소(1줄 고정), 금액, 비고 */}
                                    <tr className="settle-row-main" style={{ background: '#ffffff' }}>
                                      <td style={{ minWidth: 0, overflow: 'hidden' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, overflow: 'hidden' }}>
                                          <span
                                            className="platform-badge"
                                            style={{
                                              fontSize: '10px',
                                              padding: '1px 6px',
                                              whiteSpace: 'nowrap',
                                              flexShrink: 0,
                                              minWidth: '32px'
                                            }}
                                          >
                                            {roundNum}차
                                          </span>
                                          <span
                                            style={{
                                              fontWeight: 700,
                                              color: '#1e293b',
                                              fontSize: '13px',
                                              whiteSpace: 'nowrap',
                                              overflow: 'hidden',
                                              textOverflow: 'ellipsis',
                                              wordBreak: 'keep-all'
                                            }}
                                            title={pSummary.address || cleanPlaceName}
                                          >
                                            {cleanPlaceName}
                                          </span>
                                        </div>
                                      </td>
                                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
                                        {roundCost.toLocaleString()}원
                                      </td>
                                      <td style={{ textAlign: 'center' }}>
                                        {canManage ? (
                                          <input
                                            type="text"
                                            className="settle-note-input"
                                            placeholder="비고"
                                            defaultValue={meeting.settlementNotes?.[noteKey] || ''}
                                            onBlur={(e) => handleUpdateSettlementNote(noteKey, e.target.value)}
                                            style={{ width: '100%', fontSize: '10.5px', height: '24px', padding: '1px 4px', textAlign: 'center' }}
                                          />
                                        ) : (
                                          <span className="sub-meta" style={{ fontSize: '10.5px' }}>
                                            {meeting.settlementNotes?.[noteKey] || '-'}
                                          </span>
                                        )}
                                      </td>
                                    </tr>

                                    {/* 2행: 방안 1 적용 (1줄 요약 칩 + 클릭 시 전체 명단 팝오버) */}
                                    <tr className="settle-row-sub" style={{ background: '#ffffff' }}>
                                      <td colSpan={3} style={{ padding: '3px 10px 8px 10px' }}>
                                        <div style={{ position: 'relative' }}>
                                          <div
                                            className="settle-attendee-trigger"
                                            onClick={() => {
                                              if (attendees.length > 0) {
                                                setOpenAttendeePopoverRound(isPopoverOpen ? null : `round_${roundNum}`);
                                              }
                                            }}
                                          >
                                            <span className="settle-attendee-count-chip">
                                              참석 {attendees.length}명
                                            </span>
                                            <span className="settle-attendee-summary-text">
                                              {attendees.length === 0
                                                ? '참석자 없음'
                                                : attendees.length <= 3
                                                ? attendees.map((a) => a.realName).join(', ')
                                                : `${attendees.slice(0, 3).map((a) => a.realName).join(', ')} 외 ${attendees.length - 3}명 ▸`}
                                            </span>
                                          </div>

                                          {/* 참석자 전체 명단 팝오버 */}
                                          {isPopoverOpen && attendees.length > 0 && (
                                            <div className="settle-attendee-popover">
                                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <strong style={{ fontSize: '12px', color: '#1e293b' }}>
                                                  {roundNum}차 참석자 명단 ({attendees.length}명)
                                                </strong>
                                                <button
                                                  type="button"
                                                  className="btn btn-xs btn-outline"
                                                  style={{ height: '20px', padding: '0 6px', fontSize: '10px' }}
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenAttendeePopoverRound(null);
                                                  }}
                                                >
                                                  닫기 ✕
                                                </button>
                                              </div>
                                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxHeight: '180px', overflowY: 'auto' }}>
                                                {attendees.map((att) => (
                                                  <span
                                                    key={att.uid}
                                                    className="settle-name-badge"
                                                    style={{ fontSize: '11px', padding: '2px 8px' }}
                                                  >
                                                    {att.realName}
                                                  </span>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  </React.Fragment>
                                );
                              });
                            })()}

                            {/* 사전 지출(Pre-Expense) 목록 2행 구조 */}
                            {(meeting.preExpenses || []).map((pe) => {
                              const payerMember = members.find((m) => m.uid === pe.payerUid);
                              const noteKey = `pre_${pe.id}`;
                              return (
                                <React.Fragment key={pe.id}>
                                  <tr className="settle-row-main" style={{ background: '#faf5ff' }}>
                                    <td>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span
                                          className="platform-badge"
                                          style={{
                                            fontSize: '10px',
                                            padding: '1px 6px',
                                            background: '#f3e8ff',
                                            color: '#7e22ce',
                                            borderColor: '#d8b4fe'
                                          }}
                                        >
                                          사전지출
                                        </span>
                                        <span style={{ fontWeight: 700, color: '#581c87' }}>
                                          {pe.title}
                                        </span>
                                        {canManage && !isMeetingSettled && (
                                          <button
                                            type="button"
                                            className="btn btn-xs"
                                            style={{
                                              padding: '0 4px',
                                              height: '18px',
                                              fontSize: '10px',
                                              color: '#dc2626',
                                              background: 'transparent',
                                              border: 'none',
                                              cursor: 'pointer'
                                            }}
                                            onClick={() => handleDeletePreExpense(pe.id)}
                                            title="사전지출 삭제"
                                          >
                                            ✕
                                          </button>
                                        )}
                                      </div>
                                    </td>
                                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#7e22ce' }}>
                                      {Number(pe.amount || 0).toLocaleString()}원
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                      {canManage ? (
                                        <input
                                          type="text"
                                          className="settle-note-input"
                                          placeholder="비고 입력"
                                          defaultValue={meeting.settlementNotes?.[noteKey] || pe.memo || ''}
                                          onBlur={(e) => handleUpdateSettlementNote(noteKey, e.target.value)}
                                          style={{ width: '100%', fontSize: '11px', height: '26px' }}
                                        />
                                      ) : (
                                        <span className="sub-meta" style={{ fontSize: '11px' }}>
                                          {meeting.settlementNotes?.[noteKey] || pe.memo || '-'}
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                  <tr className="settle-row-sub" style={{ background: '#faf5ff' }}>
                                    <td colSpan={3}>
                                      <div className="settle-attendee-list-inline">
                                        <span className="sub-meta" style={{ fontSize: '11px' }}>결제자(대납):</span>
                                        <span
                                          className="settle-name-badge"
                                          style={{
                                            fontSize: '10.5px',
                                            padding: '1px 6px',
                                            background: '#ede9fe',
                                            borderColor: '#c4b5fd',
                                            color: '#6b21a8'
                                          }}
                                        >
                                          {payerMember?.realName || '결제자'}
                                        </span>
                                        {pe.memo && <span className="sub-meta" style={{ fontSize: '11px' }}>({pe.memo})</span>}
                                      </div>
                                    </td>
                                  </tr>
                                </React.Fragment>
                              );
                            })}

                            {/* 찬조금 행 (2행 구조) */}
                            {(settlement.sponsors || sponsorships || []).map((sp, idx) => {
                              const spUid = sp.sponsorUid || sp.uid;
                              const spMember = members.find((m) => m.uid === spUid);
                              const noteKey = `sponsor_${idx}`;
                              const spAmount = Number(sp.amount || 0);
                              return (
                                <React.Fragment key={noteKey}>
                                  <tr className="settle-row-main" style={{ background: '#f0fdf4' }}>
                                    <td>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span
                                          className="platform-badge"
                                          style={{
                                            fontSize: '10px',
                                            padding: '1px 6px',
                                            background: '#dcfce7',
                                            color: '#15803d',
                                            borderColor: '#86efac'
                                          }}
                                        >
                                          찬조금
                                        </span>
                                        <span style={{ fontWeight: 700, color: '#166534' }}>
                                          {spMember?.realName || '찬조자'}
                                        </span>
                                        {canManage && !isMeetingSettled && (
                                          <button
                                            type="button"
                                            className="btn btn-xs"
                                            style={{
                                              padding: '0 4px',
                                              height: '18px',
                                              fontSize: '10px',
                                              color: '#dc2626',
                                              background: 'transparent',
                                              border: 'none',
                                              cursor: 'pointer'
                                            }}
                                            onClick={() => handleDeleteSponsorship(sp.id)}
                                            title="찬조 삭제"
                                          >
                                            ✕
                                          </button>
                                        )}
                                      </div>
                                    </td>
                                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>
                                      -{spAmount.toLocaleString()}원
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                      {canManage ? (
                                        <input
                                          type="text"
                                          className="settle-note-input"
                                          placeholder="비고 입력"
                                          defaultValue={meeting.settlementNotes?.[noteKey] || sp.memo || ''}
                                          onBlur={(e) => handleUpdateSettlementNote(noteKey, e.target.value)}
                                          style={{ width: '100%', fontSize: '11px', height: '26px' }}
                                        />
                                      ) : (
                                        <span className="sub-meta" style={{ fontSize: '11px' }}>
                                          {meeting.settlementNotes?.[noteKey] || sp.memo || '-'}
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                  <tr className="settle-row-sub" style={{ background: '#f0fdf4' }}>
                                    <td colSpan={3}>
                                      <div className="settle-attendee-list-inline">
                                        <span className="sub-meta" style={{ fontSize: '11px' }}>찬조 메모:</span>
                                        <span style={{ fontSize: '11.5px', color: '#15803d', fontWeight: 600 }}>
                                          {sp.memo || '모임 찬조'}
                                        </span>
                                      </div>
                                    </td>
                                  </tr>
                                </React.Fragment>
                              );
                            })}

                            {/* 선입금 행 */}
                            {settlement.totalDepositAmount > 0 && (
                              <tr style={{ background: '#f0f9ff' }}>
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span
                                      className="platform-badge"
                                      style={{
                                        fontSize: '10px',
                                        padding: '1px 6px',
                                        background: '#e0f2fe',
                                        color: '#0369a1',
                                        borderColor: '#bae6fd'
                                      }}
                                    >
                                      선입금
                                    </span>
                                    <span style={{ fontWeight: 700, color: '#0369a1' }}>
                                      선입금 총액 ({settlement.totalDepositConfirmedCount || 0}명 컨펌 / 총 {(settlement.participantRows || []).filter(r => (r.depositAmount || 0) > 0).length}명)
                                    </span>
                                  </div>
                                </td>
                                <td style={{ textAlign: 'right', fontWeight: 700, color: '#0284c7' }}>
                                  -{(settlement.totalDepositAmount || 0).toLocaleString()}원
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                  {canManage ? (
                                    <input
                                      type="text"
                                      className="settle-note-input"
                                      placeholder="비고 입력"
                                      defaultValue={meeting.settlementNotes?.['deposit'] || ''}
                                      onBlur={(e) => handleUpdateSettlementNote('deposit', e.target.value)}
                                      style={{ width: '100%', fontSize: '11px', height: '26px' }}
                                    />
                                  ) : (
                                    <span className="sub-meta" style={{ fontSize: '11px' }}>
                                      {meeting.settlementNotes?.['deposit'] || '-'}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            )}

                            {/* 정산표 총합 행 */}
                            <tr style={{ background: '#f1f5f9', fontWeight: 700 }}>
                              <td>
                                <strong style={{ color: '#0f172a' }}>최종 정산 합계</strong>
                              </td>
                              <td style={{ textAlign: 'right', fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                                {settlement.totalSharedCost.toLocaleString()}원
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                {canManage ? (
                                  <input
                                    type="text"
                                    className="settle-note-input"
                                    placeholder="총합 비고"
                                    defaultValue={meeting.settlementNotes?.['total'] || ''}
                                    onBlur={(e) => handleUpdateSettlementNote('total', e.target.value)}
                                    style={{ width: '100%', fontSize: '11px', height: '26px' }}
                                  />
                                ) : (
                                  <span className="sub-meta" style={{ fontSize: '11px' }}>
                                    {meeting.settlementNotes?.['total'] || '-'}
                                  </span>
                                )}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* 하단 제어 버튼: 찬조 추가, 사전지출 추가, 정산서 복사 */}
                      <div className="settle-btn-group">
                        {canManage && !isMeetingSettled && (
                          <>
                            <button
                              type="button"
                              className={`btn btn-sm ${showSponsorInlineForm ? 'btn-primary' : 'btn-outline'}`}
                              onClick={() => {
                                setShowSponsorInlineForm(!showSponsorInlineForm);
                                setShowPreExpenseForm(false);
                              }}
                            >
                              + 찬조 추가
                            </button>
                            <button
                              type="button"
                              className={`btn btn-sm ${showPreExpenseForm ? 'btn-primary' : 'btn-outline'}`}
                              onClick={() => {
                                setShowPreExpenseForm(!showPreExpenseForm);
                                setShowSponsorInlineForm(false);
                              }}
                            >
                              + 사전지출 추가
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={handleCopySettlementReport}
                        >
                          {copiedReport ? '복사됨 ✓' : '정산서 복사'}
                        </button>
                      </div>

                      {/* 찬조 추가 인라인 폼 (회원 검색 컴포넌트 탑재) */}
                      {showSponsorInlineForm && canManage && !isMeetingSettled && (
                        <div className="settle-inline-form stack-gap" style={{ padding: '10px', background: '#f0fdf4', borderColor: '#bbf7d0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            {/* 찬조자 선택 (검색 토글) */}
                            <div style={{ position: 'relative', flex: 1, minWidth: '120px' }}>
                              <button
                                type="button"
                                className="btn btn-outline settle-input-tall"
                                style={{ width: '100%', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                onClick={() => setIsInlineSponsorSearchOpen(!isInlineSponsorSearchOpen)}
                              >
                                <span>
                                  {inlineSponsorUid
                                    ? members.find((m) => m.uid === inlineSponsorUid)?.realName || '찬조자 선택됨'
                                    : '찬조자 검색 선택'}
                                </span>
                                <span style={{ fontSize: '10px' }}>▼</span>
                              </button>

                              {isInlineSponsorSearchOpen && (
                                <div
                                  className="admin-edit-search-box"
                                  style={{
                                    position: 'absolute',
                                    top: '42px',
                                    left: 0,
                                    right: 0,
                                    zIndex: 50,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                    background: '#ffffff'
                                  }}
                                >
                                  <input
                                    type="text"
                                    className="admin-edit-search-input"
                                    placeholder="이름/닉네임 검색"
                                    value={inlineSponsorSearchQuery}
                                    onChange={(e) => setInlineSponsorSearchQuery(e.target.value)}
                                    autoFocus
                                  />
                                  <div className="admin-edit-search-list">
                                    {filteredInlineSponsorCandidates.map((m) => (
                                      <button
                                        key={m.uid}
                                        type="button"
                                        className={`admin-edit-search-item ${inlineSponsorUid === m.uid ? 'is-selected' : ''}`}
                                        onClick={() => {
                                          setInlineSponsorUid(m.uid);
                                          setIsInlineSponsorSearchOpen(false);
                                        }}
                                      >
                                        <span>{m.realName} {m.nickname ? `(${m.nickname})` : ''}</span>
                                        <span className="sub-meta">{m.city || ''}</span>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            <input
                              type="number"
                              step="1000"
                              placeholder="찬조 금액"
                              className="settle-input-tall"
                              style={{ flex: 1, minWidth: '95px' }}
                              value={inlineSponsorAmount}
                              onChange={(e) => setInlineSponsorAmount(e.target.value)}
                            />

                            <input
                              type="text"
                              placeholder="내용 (예: 음료 찬조)"
                              className="settle-input-tall"
                              style={{ flex: 1.5, minWidth: '110px' }}
                              value={inlineSponsorMemo}
                              onChange={(e) => setInlineSponsorMemo(e.target.value)}
                            />

                            <button
                              type="button"
                              className="btn btn-primary settle-input-tall"
                              style={{ padding: '0 14px', whiteSpace: 'nowrap' }}
                              onClick={handleAddInlineSponsorship}
                            >
                              추가
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline settle-input-tall"
                              style={{ padding: '0 10px', whiteSpace: 'nowrap' }}
                              onClick={() => {
                                setShowSponsorInlineForm(false);
                                setIsInlineSponsorSearchOpen(false);
                              }}
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 사전 지출 추가 인라인 폼 (퀵 태그 & 결제자 검색) */}
                      {showPreExpenseForm && canManage && !isMeetingSettled && (
                        <div className="settle-inline-form stack-gap" style={{ padding: '10px', background: '#faf5ff', borderColor: '#e9d5ff' }}>
                          {/* 퀵 태그 버튼 */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '11px', fontWeight: 600, color: '#6b21a8' }}>빠른 선택:</span>
                            {['장소 대관비', '예약금', '물품 구매', '간식·음료', '기타 사전지출'].map((tag) => (
                              <button
                                key={tag}
                                type="button"
                                className="btn btn-xs btn-outline"
                                style={{ fontSize: '10.5px', padding: '1px 6px', height: '22px' }}
                                onClick={() => setPreExpenseTitle(tag)}
                              >
                                {tag}
                              </button>
                            ))}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <input
                              type="text"
                              placeholder="항목명 (예: 볼링장 예약금)"
                              className="settle-input-tall"
                              style={{ flex: 1.2, minWidth: '120px' }}
                              value={preExpenseTitle}
                              onChange={(e) => setPreExpenseTitle(e.target.value)}
                            />

                            {/* 결제자 선택 (회원 검색) */}
                            <div style={{ position: 'relative', flex: 1, minWidth: '120px' }}>
                              <button
                                type="button"
                                className="btn btn-outline settle-input-tall"
                                style={{ width: '100%', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                onClick={() => setIsPreExpensePayerSearchOpen(!isPreExpensePayerSearchOpen)}
                              >
                                <span>
                                  {preExpensePayerUid
                                    ? members.find((m) => m.uid === preExpensePayerUid)?.realName || '결제자 선택됨'
                                    : '결제자 검색 선택'}
                                </span>
                                <span style={{ fontSize: '10px' }}>▼</span>
                              </button>

                              {isPreExpensePayerSearchOpen && (
                                <div
                                  className="admin-edit-search-box"
                                  style={{
                                    position: 'absolute',
                                    top: '42px',
                                    left: 0,
                                    right: 0,
                                    zIndex: 50,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                    background: '#ffffff'
                                  }}
                                >
                                  <input
                                    type="text"
                                    className="admin-edit-search-input"
                                    placeholder="이름/닉네임 검색"
                                    value={preExpensePayerSearchQuery}
                                    onChange={(e) => setPreExpensePayerSearchQuery(e.target.value)}
                                    autoFocus
                                  />
                                  <div className="admin-edit-search-list">
                                    {filteredPreExpensePayerCandidates.map((m) => (
                                      <button
                                        key={m.uid}
                                        type="button"
                                        className={`admin-edit-search-item ${preExpensePayerUid === m.uid ? 'is-selected' : ''}`}
                                        onClick={() => {
                                          setPreExpensePayerUid(m.uid);
                                          setIsPreExpensePayerSearchOpen(false);
                                        }}
                                      >
                                        <span>{m.realName} {m.nickname ? `(${m.nickname})` : ''}</span>
                                        <span className="sub-meta">{m.city || ''}</span>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            <input
                              type="number"
                              step="1000"
                              placeholder="지출 금액"
                              className="settle-input-tall"
                              style={{ flex: 1, minWidth: '95px' }}
                              value={preExpenseAmount}
                              onChange={(e) => setPreExpenseAmount(e.target.value)}
                            />

                            <input
                              type="text"
                              placeholder="메모 (선택)"
                              className="settle-input-tall"
                              style={{ flex: 1.2, minWidth: '100px' }}
                              value={preExpenseMemo}
                              onChange={(e) => setPreExpenseMemo(e.target.value)}
                            />

                            <button
                              type="button"
                              className="btn btn-primary settle-input-tall"
                              style={{ padding: '0 14px', whiteSpace: 'nowrap' }}
                              onClick={handleAddPreExpense}
                            >
                              추가
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline settle-input-tall"
                              style={{ padding: '0 10px', whiteSpace: 'nowrap' }}
                              onClick={() => {
                                setShowPreExpenseForm(false);
                                setIsPreExpensePayerSearchOpen(false);
                              }}
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* ========================================================
                    [섹션 3] 개인별 내역 아코디언 카드 (각 참석자별 개별 아코디언)
                   ======================================================== */}
                <div className="settle-accordion-card">
                  <div
                    className="settle-accordion-header"
                    onClick={() => setIsPersonalListAccordionOpen(!isPersonalListAccordionOpen)}
                  >
                    <div className="settle-accordion-header-left">
                      <span className="settle-chevron">
                        {isPersonalListAccordionOpen ? '▼' : '▶'}
                      </span>
                      <strong style={{ fontSize: '15px' }}>개인별 내역</strong>
                      <span className="sub-meta">({settlement.participantRows.length}명)</span>
                    </div>

                    <div className="settle-accordion-header-right">
                      <span className="sub-meta">
                        {settlement.participantRows.filter(r => r.confirmed).length} / {settlement.participantRows.length}명 컨펌
                      </span>
                    </div>
                  </div>

                  {isPersonalListAccordionOpen && (
                    <div className="settle-accordion-body lounge-unified-stack" style={{ padding: '12px' }}>
                      {/* 개인별 검색 및 정렬 바 */}
                      <div className="settle-table-toolbar">
                        <input
                          type="text"
                          className="admin-edit-search-input"
                          placeholder="참석자 검색 (이름, 닉네임)"
                          style={{ flex: 1, minWidth: '140px', height: '32px', fontSize: '12px' }}
                          value={personalSearchQuery}
                          onChange={(e) => setPersonalSearchQuery(e.target.value)}
                        />
                        <div className="settle-sort-pill-group">
                          <button
                            type="button"
                            className={`settle-sort-pill ${personalSortMode === 'default' ? 'is-active' : ''}`}
                            onClick={() => setPersonalSortMode('default')}
                          >
                            기본
                          </button>
                          <button
                            type="button"
                            className={`settle-sort-pill ${personalSortMode === 'unconfirmedFirst' ? 'is-active' : ''}`}
                            onClick={() => setPersonalSortMode('unconfirmedFirst')}
                          >
                            미컨펌순
                          </button>
                          <button
                            type="button"
                            className={`settle-sort-pill ${personalSortMode === 'amountDesc' ? 'is-active' : ''}`}
                            onClick={() => setPersonalSortMode('amountDesc')}
                          >
                            금액순
                          </button>
                          <button
                            type="button"
                            className={`settle-sort-pill ${personalSortMode === 'nameAsc' ? 'is-active' : ''}`}
                            onClick={() => setPersonalSortMode('nameAsc')}
                          >
                            이름순
                          </button>
                        </div>
                      </div>

                      {/* 필터링 및 정렬된 참석자 카드 목록 */}
                      {(() => {
                        let displayedRows = (settlement.participantRows || []).filter((r) => {
                          if (!personalSearchQuery.trim()) return true;
                          const q = personalSearchQuery.trim().toLowerCase();
                          const m = members.find((mem) => mem.uid === r.uid);
                          const real = (m?.realName || '').toLowerCase();
                          const nick = (m?.nickname || '').toLowerCase();
                          return real.includes(q) || nick.includes(q);
                        });

                        if (personalSortMode === 'unconfirmedFirst') {
                          displayedRows.sort((a, b) => (a.confirmed === b.confirmed ? 0 : a.confirmed ? 1 : -1));
                        } else if (personalSortMode === 'amountDesc') {
                          displayedRows.sort((a, b) => Math.abs(b.netToPay) - Math.abs(a.netToPay));
                        } else if (personalSortMode === 'nameAsc') {
                          displayedRows.sort((a, b) => {
                            const ma = members.find((m) => m.uid === a.uid)?.realName || '';
                            const mb = members.find((m) => m.uid === b.uid)?.realName || '';
                            return ma.localeCompare(mb, 'ko');
                          });
                        }

                        if (displayedRows.length === 0) {
                          return (
                            <div className="empty-helper-box" style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>
                              검색 조건에 맞는 참석자가 없습니다.
                            </div>
                          );
                        }

                        return displayedRows.map((row) => {
                          const m = members.find((mem) => mem.uid === row.uid);
                          if (!m) return null;
                          const isPersonOpen = openPersonalUids instanceof Set ? openPersonalUids.has(row.uid) : false;
                          const isAdjustingThis = adjustingUid === row.uid;

                          // 상태별 파스텔 틴트 클래스
                          const tintClass = row.confirmed
                            ? 'is-confirmed'
                            : row.paid
                            ? 'is-paid'
                            : row.netToPay < 0
                            ? 'is-refund'
                            : '';

                          // 수동 조정 실시간 계산 데이터
                          const adjValue = parseInt(manualAdjInput, 10) || 0;
                          const curNet = row.netToPay || 0;
                          const targetApplied = curNet - adjValue;
                          const sameAmountRows = settlement.participantRows.filter(
                            (r) => r.calculatedShare === row.calculatedShare
                          );
                          const sameAmountNames = sameAmountRows
                            .map((r) => members.find((mem) => mem.uid === r.uid)?.realName)
                            .filter(Boolean);

                          return (
                            <div
                              key={row.uid}
                              className={`settle-person-card ${tintClass}`}
                              style={{
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                overflow: 'hidden'
                              }}
                            >
                              {/* 개인 카드 Header: 뱃지 복원 (선입금, 참석차수, 상태태그) + 실납부액 */}
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '8px 12px',
                                  cursor: 'pointer',
                                  borderBottom: isPersonOpen ? '1px solid #e2e8f0' : 'none',
                                  gap: '8px'
                                }}
                                onClick={() => {
                                  setOpenPersonalUids((prev) => {
                                    const next = prev instanceof Set ? new Set(prev) : new Set();
                                    if (next.has(row.uid)) {
                                      next.delete(row.uid);
                                    } else {
                                      next.add(row.uid);
                                    }
                                    return next;
                                  });
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
                                  <span className="settle-chevron" style={{ fontSize: '10px', color: '#64748b', flexShrink: 0 }}>
                                    {isPersonOpen ? '▼' : '▶'}
                                  </span>
                                  <strong style={{ fontSize: '13.5px', color: '#1e293b', whiteSpace: 'nowrap', flexShrink: 0 }}>
                                    {m.realName}
                                  </strong>

                                  {/* 참석 차수 뱃지들 */}
                                  {(row.attendedRounds || []).map((roundStr) => (
                                    <span key={roundStr} className="settle-person-micro-chip is-round">
                                      {roundStr}
                                    </span>
                                  ))}

                                  {/* 선입금 뱃지 (선입금 존재 시만 노출) */}
                                  {((row.depositAmount || 0) > 0 || (Number(meeting.advanceDeposit) || 0) > 0) && (
                                    <span className="settle-person-micro-chip is-deposit">
                                      선입금 {Number(row.depositAmount || 0).toLocaleString()}원
                                    </span>
                                  )}

                                  {/* 상태 뱃지 */}
                                  {row.confirmed ? (
                                    <span className="settle-person-micro-chip is-status-confirmed">
                                      컨펌완료 ✓
                                    </span>
                                  ) : row.paid ? (
                                    <span className="settle-person-micro-chip is-status-paid">
                                      입금확인중
                                    </span>
                                  ) : row.netToPay < 0 ? (
                                    <span className="settle-person-micro-chip is-status-refund">
                                      환급대상
                                    </span>
                                  ) : (
                                    <span className="settle-person-micro-chip is-status-pending">
                                      미입금
                                    </span>
                                  )}
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                                  <strong style={{ fontSize: '13.5px', color: row.netToPay < 0 ? '#0284c7' : '#0f172a' }}>
                                    {row.netToPay < 0 ? `환급 ` : ''}{Math.abs(row.netToPay).toLocaleString()}원
                                  </strong>
                                </div>
                              </div>

                              {/* 개인 카드 Body: 개인 정산표 형식 (첨부사진 개행 방지 적용) */}
                              {isPersonOpen && (
                                <div style={{ padding: '12px' }} className="stack-gap">
                                  <div className="settle-table-wrap">
                                    <table className="settle-data-table">
                                      <thead>
                                        <tr>
                                          <th style={{ width: '52%' }}>내역</th>
                                          <th style={{ width: '28%', textAlign: 'right' }}>금액</th>
                                          <th style={{ width: '20%', textAlign: 'center' }}>상태/컨펌</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {/* 선입금 행 (조건부 노출) */}
                                        {((row.depositAmount || 0) > 0 || (Number(meeting.advanceDeposit) || 0) > 0) && (
                                          <tr style={{ background: '#f8fafc' }}>
                                            <td>
                                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span
                                                  className="platform-badge"
                                                  style={{
                                                    fontSize: '10px',
                                                    padding: '1px 6px',
                                                    background: '#e0f2fe',
                                                    color: '#0369a1',
                                                    borderColor: '#bae6fd',
                                                    whiteSpace: 'nowrap',
                                                    flexShrink: 0
                                                  }}
                                                >
                                                  선입금
                                                </span>
                                                <span style={{ fontWeight: 600, color: '#0369a1', fontSize: '12.5px' }}>
                                                  모임 선입금
                                                </span>
                                              </div>
                                            </td>
                                            <td style={{ color: '#0284c7', fontWeight: 700, textAlign: 'right' }}>
                                              {row.depositAmount > 0
                                                ? `-${row.depositAmount.toLocaleString()}원`
                                                : '0원'}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                              {row.depositAmount > 0 ? (
                                                canManage && !isMeetingSettled ? (
                                                  <button
                                                    type="button"
                                                    className={`btn btn-xs ${
                                                      row.depositConfirmed ? 'btn-outline' : 'btn-primary'
                                                    }`}
                                                    style={{ padding: '2px 8px', fontSize: '11px', height: '24px' }}
                                                    onClick={() => handleToggleDepositConfirm(row.uid)}
                                                  >
                                                    {row.depositConfirmed ? '선입금 해제' : '선입금 컨펌'}
                                                  </button>
                                                ) : (
                                                  <span className={`deposit-tag ${row.depositConfirmed ? 'confirmed' : 'paid'}`}>
                                                    {row.depositConfirmed ? '컨펌완료 ✓' : row.depositPaid ? '입금확인중' : '미입금'}
                                                  </span>
                                                )
                                              ) : (
                                                <span className="sub-meta">-</span>
                                              )}
                                            </td>
                                          </tr>
                                        )}

                                        {/* 차수별 참석 금액 (순수 상호명 추출 & 한 줄 고정 & 뱃지 찌그러짐 방지) */}
                                        {(row.roundBreakdown || []).map((rb) => {
                                          const pSummary = parsePlaceSummary(rb.placeName || rb.title);
                                          const cleanPlaceName = pSummary.placeName || rb.title || `${rb.roundNumber}차 장소`;
                                          return (
                                            <tr key={rb.roundNumber}>
                                              <td style={{ minWidth: 0, overflow: 'hidden' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, overflow: 'hidden' }}>
                                                  <span
                                                    className="platform-badge"
                                                    style={{
                                                      fontSize: '10px',
                                                      padding: '1px 6px',
                                                      whiteSpace: 'nowrap',
                                                      flexShrink: 0,
                                                      minWidth: '34px',
                                                      height: '22px',
                                                      boxSizing: 'border-box',
                                                      display: 'inline-flex',
                                                      alignItems: 'center',
                                                      justifyContent: 'center'
                                                    }}
                                                  >
                                                    {rb.roundNumber}차
                                                  </span>
                                                  <span
                                                    style={{
                                                      fontWeight: 600,
                                                      color: '#1e293b',
                                                      fontSize: '12.5px',
                                                      whiteSpace: 'nowrap',
                                                      overflow: 'hidden',
                                                      textOverflow: 'ellipsis',
                                                      flex: 1,
                                                      minWidth: 0
                                                    }}
                                                    title={pSummary.address || cleanPlaceName}
                                                  >
                                                    {cleanPlaceName}
                                                  </span>
                                                </div>
                                              </td>
                                              <td style={{ textAlign: 'right', fontWeight: 600 }}>
                                                {(rb.share ?? rb.perPerson ?? 0).toLocaleString()}원
                                              </td>
                                              <td style={{ textAlign: 'center' }}>
                                                <span className="deposit-tag confirmed" style={{ fontSize: '10.5px' }}>참석</span>
                                              </td>
                                            </tr>
                                          );
                                        })}

                                        {/* 찬조 할인 */}
                                        {(row.sponsorDiscount || 0) > 0 && (
                                          <tr style={{ background: '#f0fdf4' }}>
                                            <td>
                                              <span style={{ color: '#16a34a', fontWeight: 600, fontSize: '12.5px' }}>
                                                찬조/골든벨 할인
                                              </span>
                                            </td>
                                            <td style={{ color: '#16a34a', fontWeight: 700, textAlign: 'right' }}>
                                              -{(row.sponsorDiscount || 0).toLocaleString()}원
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                              <span className="sub-meta">적용됨</span>
                                            </td>
                                          </tr>
                                        )}

                                        {/* 수동 조정 */}
                                        {(row.manualAdjustment || 0) !== 0 && (
                                          <tr>
                                            <td>
                                              <span
                                                style={{
                                                  color: (row.manualAdjustment || 0) > 0 ? '#ef4444' : '#16a34a',
                                                  fontWeight: 600,
                                                  fontSize: '12.5px'
                                                }}
                                              >
                                                수동 조정
                                              </span>
                                            </td>
                                            <td
                                              style={{
                                                color: (row.manualAdjustment || 0) > 0 ? '#ef4444' : '#16a34a',
                                                fontWeight: 700,
                                                textAlign: 'right'
                                              }}
                                            >
                                              {(row.manualAdjustment || 0) > 0 ? '+' : ''}
                                              {(row.manualAdjustment || 0).toLocaleString()}원
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                              <span className="sub-meta">반영됨</span>
                                            </td>
                                          </tr>
                                        )}

                                        {/* 총합계 라인: 금액과 컨펌 */}
                                        <tr style={{ background: '#f1f5f9', fontWeight: 700 }}>
                                          <td>
                                            <strong style={{ color: '#0f172a', fontSize: '12.5px' }}>
                                              {(row.netToPay || 0) >= 0 ? '최종 보낼 회비' : '총무에게 환급받을 금액'}
                                            </strong>
                                          </td>
                                          <td style={{ color: '#0f172a', fontSize: '13px', fontWeight: 800, textAlign: 'right' }}>
                                            {Math.abs(row.netToPay || 0).toLocaleString()}원
                                          </td>
                                          <td style={{ textAlign: 'center' }}>
                                            {canManage && !isMeetingSettled ? (
                                              <button
                                                type="button"
                                                className={`btn btn-xs ${
                                                  row.confirmed ? 'btn-outline' : 'btn-primary'
                                                }`}
                                                style={{ padding: '2px 8px', fontSize: '11px', height: '24px' }}
                                                onClick={() => handleToggleConfirmPayment(row.uid)}
                                              >
                                                {row.confirmed ? '컨펌 해제' : '컨펌'}
                                              </button>
                                            ) : (
                                              <span className={`deposit-tag ${row.confirmed ? 'confirmed' : 'paid'}`}>
                                                {row.confirmed ? '컨펌완료 ✓' : row.paid ? '입금확인중' : '대기'}
                                              </span>
                                            )}
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </div>

                                  {/* 수동조정 패널 (3행 구조: 1행 산출식&대상자 / 2행 일괄적용체크 / 3행 금액&적용) */}
                                  {canManage && !isMeetingSettled && (
                                    <div style={{ marginTop: '6px' }}>
                                      <button
                                        type="button"
                                        className="btn btn-xs btn-outline"
                                        onClick={() => {
                                          if (isAdjustingThis) {
                                            setAdjustingUid(null);
                                          } else {
                                            setAdjustingUid(row.uid);
                                            setManualAdjInput('');
                                          }
                                        }}
                                      >
                                        {isAdjustingThis ? '수동조정 닫기' : '수동조정'}
                                      </button>

                                      {isAdjustingThis && (
                                        <div
                                          className="stack-gap"
                                          style={{
                                            marginTop: '8px',
                                            padding: '12px',
                                            background: '#f8fafc',
                                            border: '1px solid #cbd5e1',
                                            borderRadius: '8px'
                                          }}
                                        >
                                          {/* [1행] 실시간 산출식 및 적용 대상자 명단 */}
                                          <div
                                            style={{
                                              padding: '8px 10px',
                                              background: '#ffffff',
                                              border: '1px solid #e2e8f0',
                                              borderRadius: '6px',
                                              fontSize: '12px'
                                            }}
                                          >
                                            <div>
                                              <strong>산출식:</strong> 현재 {curNet.toLocaleString()}원 - 조정{' '}
                                              {adjValue ? `${adjValue.toLocaleString()}원` : '0원'} = 적용{' '}
                                              <strong style={{ color: '#0284c7', fontSize: '13.5px' }}>
                                                {targetApplied.toLocaleString()}원
                                              </strong>
                                            </div>
                                            {applySameAmountToAll && sameAmountNames.length > 1 && (
                                              <div style={{ marginTop: '4px', fontSize: '11px', color: '#475569' }}>
                                                └ <strong>동일 금액 적용 대상 ({sameAmountNames.length}명):</strong>{' '}
                                                {sameAmountNames.join(', ')}
                                              </div>
                                            )}
                                          </div>

                                          {/* [2행] 같은 금액 일괄 적용 체크박스 */}
                                          <label
                                            style={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '6px',
                                              fontSize: '12px',
                                              cursor: 'pointer',
                                              fontWeight: 600,
                                              color: '#334155'
                                            }}
                                          >
                                            <input
                                              type="checkbox"
                                              checked={applySameAmountToAll}
                                              onChange={(e) => setApplySameAmountToAll(e.target.checked)}
                                            />
                                            현재 회비({row.calculatedShare.toLocaleString()}원) 동일 참석자 일괄 적용 ({sameAmountRows.length}명)
                                          </label>

                                          {/* [3행] 금액 입력창과 적용 버튼 */}
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <input
                                              type="number"
                                              step="100"
                                              placeholder="조정 금액 입력 (예: 1000 할인 / -1000 추가)"
                                              className="settle-input-tall"
                                              style={{ flex: 1, minWidth: '150px' }}
                                              value={manualAdjInput}
                                              onChange={(e) => setManualAdjInput(e.target.value)}
                                            />
                                            <button
                                              type="button"
                                              className="btn btn-sm btn-primary"
                                              style={{ padding: '0 16px', height: '36px', whiteSpace: 'nowrap' }}
                                              onClick={() => handleApplyManualAdjustment(row.uid)}
                                            >
                                              적용
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: 귀가현황 (One-Click Safe Return Check & Member Status List) */}
            {loungeTab === 'returns' && (
              <div className="lounge-tab-content-wrap lounge-unified-stack">
                <div className="lounge-settle-hero">
                  <div
                    className="meeting-top"
                    style={{ flexWrap: 'wrap', gap: '12px' }}
                  >
                    <div>
                      <div className="preview-caption">
                        내 안심 귀가 상태
                      </div>
                      <div className="preview-value">
                        {adminUser && !isApplied && !isConfirmedParticipant
                          ? '귀가 확인 제외'
                          : mySafeReturn || '귀가 전'}
                      </div>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flexWrap: 'wrap'
                      }}
                    >
                      {(isApplied || isConfirmedParticipant) && (
                        <button
                          type="button"
                          disabled={isMeetingSettled}
                          className={`btn ${
                            mySafeReturn || isMeetingSettled ? 'btn-outline' : 'btn-primary'
                          }`}
                          style={{
                            minHeight: '42px',
                            fontWeight: 600,
                            opacity: isMeetingSettled ? 0.75 : 1
                          }}
                          onClick={!isMeetingSettled ? handleToggleSafeReturn : undefined}
                        >
                          {isMeetingSettled
                            ? '귀가완료 ✓'
                            : mySafeReturn
                            ? '귀가완료 해제'
                            : '귀가완료 체크'}
                        </button>
                      )}

                      {canManage && meeting.status === 'open' && (
                        <button
                          type="button"
                          className="btn btn-settle-blue"
                          disabled={
                            !regionDetection.recognized &&
                            !settleFallbackRegion
                          }
                          onClick={handleFinalizeSettlement}
                        >
                          최종 마감
                        </button>
                      )}

                      {meeting.status === 'settled' && (
                        <span
                          className="status-pill settled"
                          style={{
                            padding: '8px 14px',
                            fontSize: '13px',
                            fontWeight: 700
                          }}
                        >
                          마감 완료 ✓
                        </span>
                      )}
                    </div>
                  </div>

                  {canManage &&
                    meeting.status === 'open' &&
                    !regionDetection.recognized && (
                      <div
                        className="participants-box stack-gap"
                        style={{
                          marginTop: '12px',
                          background: 'rgba(255, 255, 255, 0.7)'
                        }}
                      >
                        <div className="meeting-top">
                          <strong style={{ fontSize: '13px' }}>
                            권역 선택 (필수)
                          </strong>
                          <span className="sub-meta">최종 마감 점수 산정용</span>
                        </div>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns:
                              'repeat(4, minmax(0, 1fr))',
                            gap: '6px'
                          }}
                        >
                          {REGION_GROUPS.map((group) => {
                            const isSelected =
                              settleFallbackRegion === group.keywords[0];
                            return (
                              <button
                                key={group.id}
                                type="button"
                                className={`btn btn-sm ${
                                  isSelected ? 'btn-primary' : 'btn-outline'
                                }`}
                                onClick={() =>
                                  setSettleFallbackRegion(group.keywords[0])
                                }
                              >
                                {group.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                </div>

                {/* [동적 생성 섹션] 신입 승급 & 마일스톤 뱃지 변경 축하 섹션 (내 안심 귀가 상태 섹션 바로 아래) */}
                {closingCelebrations.length > 0 && (
                  <div
                    className="closing-celebration-card"
                    style={{
                      padding: '12px 14px',
                      background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                      border: '1px solid #fde68a',
                      borderRadius: '8px',
                      boxShadow: '0 2px 6px rgba(217, 119, 6, 0.08)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '16px' }}>🎉</span>
                      <strong style={{ fontSize: '13px', color: '#92400e' }}>
                        축하합니다! 승급 & 뱃지 획득 안내 ({closingCelebrations.length}명)
                      </strong>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {closingCelebrations.map((c) => (
                        <div
                          key={c.uid}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '6px 10px',
                            background: '#ffffff',
                            borderRadius: '6px',
                            border: '1px solid #fef08a'
                          }}
                        >
                          <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#1e293b' }}>
                            {c.name} {c.nickname ? `(${c.nickname})` : ''}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {c.isRookiePromotion && (
                              <span
                                className="platform-badge"
                                style={{
                                  fontSize: '10.5px',
                                  padding: '1px 6px',
                                  background: '#dcfce7',
                                  color: '#15803d',
                                  borderColor: '#86efac',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                정회원 승급 🎊
                              </span>
                            )}
                            {c.isBadgePromoted && (
                              <span
                                className="platform-badge"
                                style={{
                                  fontSize: '10.5px',
                                  padding: '1px 6px',
                                  background: '#fef3c7',
                                  color: '#b45309',
                                  borderColor: '#fde047',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {c.afterBadge?.label || c.afterBadge?.name} 달성 ⭐
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 마감 친구 리스트 (1순위 본인, 2순위 운영진, 3순위 가나다순 & 현재점수 -> 바뀐점수 시작위치 고정 수직 정렬) */}
                <div className="divider-list">
                  {sortedClosingAttendeeUids.map((uid) => {
                    const m = members.find((mem) => mem.uid === uid);
                    if (!m) return null;
                    const returnTime = safeReturns[uid];
                    const scoreInfo = calculateMeetingScoreForMember(
                      m,
                      regionDetection.region || meeting.location
                    );
                    const earned = Number(scoreInfo.score || 1);
                    const isSettled = meeting.status === 'settled';
                    const currentScore = getMemberTotalScore(m);
                    const beforeScore = isSettled
                      ? Math.max(0, currentScore - earned)
                      : currentScore;
                    const afterScore = beforeScore + earned;
                    const isMe = uid === currentUser?.uid;
                    const isOp =
                      m.role === 'Leader' ||
                      m.role === 'Deputy' ||
                      m.uid === communityConfig?.leaderUid;

                    return (
                      <div
                        key={uid}
                        className="ranking-row"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          background: isMe ? '#f8fafc' : '#ffffff'
                        }}
                      >
                        <div
                          className="rank-left"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            minWidth: 0,
                            flex: 1
                          }}
                        >
                          <strong
                            style={{
                              fontSize: '13.5px',
                              color: '#1e293b',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {formatMemberNickname(m)}
                          </strong>
                          {isMe && (
                            <span
                              className="platform-badge"
                              style={{
                                fontSize: '10px',
                                padding: '1px 5px',
                                background: '#dbeafe',
                                color: '#1d4ed8',
                                borderColor: '#bfdbfe',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              나
                            </span>
                          )}
                          {isOp && (
                            <span
                              className="platform-badge"
                              style={{
                                fontSize: '10px',
                                padding: '1px 5px',
                                background: '#fef3c7',
                                color: '#b45309',
                                borderColor: '#fde047',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              운영진
                            </span>
                          )}
                          {scoreInfo.isExpedition && (
                            <span
                              className="expedition-pill"
                              style={{ fontSize: '10.5px', whiteSpace: 'nowrap' }}
                            >
                              {scoreInfo.label}
                            </span>
                          )}
                        </div>

                        {/* 점수 변화: 현재점수 -> 바뀐점수 (숫자만, 시작/끝 위치 완벽 일치) */}
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '80px',
                            fontVariantNumeric: 'tabular-nums',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#334155',
                            flexShrink: 0,
                            margin: '0 8px'
                          }}
                          title={`기존 점수 ${beforeScore}점 → 마감 반영 점수 ${afterScore}점`}
                        >
                          <span style={{ width: '30px', textAlign: 'right' }}>
                            {beforeScore}
                          </span>
                          <span
                            style={{
                              margin: '0 3px',
                              color: '#94a3b8',
                              fontSize: '11px'
                            }}
                          >
                            →
                          </span>
                          <span
                            style={{
                              width: '30px',
                              textAlign: 'left',
                              color: '#0284c7',
                              fontWeight: 700
                            }}
                          >
                            {afterScore}
                          </span>
                        </div>

                        {/* 귀가 상태 뱃지 */}
                        <span
                          className={`status-pill ${
                            returnTime || isSettled ? 'open' : 'settled'
                          }`}
                          style={{
                            flexShrink: 0,
                            minWidth: '60px',
                            textAlign: 'center',
                            fontSize: '11.5px',
                            padding: '3px 8px'
                          }}
                        >
                          {returnTime || (isSettled ? '귀가완료' : '귀가 전')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 4: 📸 앨범 (미디어 갤러리 & 랜덤 박스 잠금 해제) */}
            {loungeTab === 'album' && (
              <div className="lounge-tab-content-wrap lounge-unified-stack">
                {canViewAlbum ? (
                  <>
                    <div className="album-header-bar">
                      <span className="album-count-text">
                        전체 미디어 ({album.length}장)
                      </span>
                      {canUpload ? (
                        <div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,video/mp4,video/quicktime,video/webm"
                            multiple
                            style={{ display: 'none' }}
                            onChange={handleMediaUpload}
                          />
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            disabled={uploadingMedia}
                            onClick={() => fileInputRef.current?.click()}
                          >
                            {uploadingMedia
                              ? '업로드 중...'
                              : '+ 사진·동영상 올리기'}
                          </button>
                        </div>
                      ) : (
                        <span className="location-pill">🎁 랜덤 박스 열람 중</span>
                      )}
                    </div>

                    {uploadingMedia && (
                      <div
                        className="lounge-settle-hero"
                        style={{ padding: '10px 14px' }}
                      >
                        <div className="preview-caption">미디어 처리 중</div>
                        <div
                          className="preview-value"
                          style={{ fontSize: '0.9rem' }}
                        >
                          {uploadStatus || '자동 압축 및 저장 중...'}
                        </div>
                      </div>
                    )}

                    {!uploadingMedia && uploadError && (
                      <div
                        className="lounge-settle-hero"
                        style={{ padding: '10px 14px' }}
                        role="status"
                      >
                        <div className="preview-caption">업로드 실패</div>
                        <div
                          className="preview-value"
                          style={{ fontSize: '0.9rem' }}
                        >
                          {uploadError}
                        </div>
                      </div>
                    )}

                    {album.length === 0 ? (
                      <div className="album-empty-box">
                        <svg
                          viewBox="0 0 24 24"
                          width="32"
                          height="32"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect
                            x="3"
                            y="3"
                            width="18"
                            height="18"
                            rx="2"
                            ry="2"
                          />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                        <strong>등록된 사진이나 동영상이 없습니다</strong>
                        <span className="sub-meta">
                          {canUpload
                            ? '첫 번째 사진을 올려 일정을 기록해 보세요!'
                            : '참석자가 미디어를 올리면 바로 확인할 수 있습니다.'}
                        </span>
                      </div>
                    ) : (
                      <div className="album-grid">
                        {album.map((item) => {
                          const isVideo = item.mediaType === 'video';
                          const likesCount = Array.isArray(item.likes)
                            ? item.likes.length
                            : 0;
                          return (
                            <div
                              key={item.id}
                              className="album-item-card"
                              role="button"
                              tabIndex={0}
                              onClick={() => setActiveLightboxItem(item)}
                              onKeyDown={(e) =>
                                e.key === 'Enter' && setActiveLightboxItem(item)
                              }
                            >
                              <img
                                src={item.thumbUrl || item.url}
                                alt={item.caption || '모임 사진'}
                                className="album-item-thumb"
                                loading="lazy"
                              />
                              {isVideo && (
                                <span className="album-video-pill">
                                  ▶{' '}
                                  {item.durationSec
                                    ? `${item.durationSec}s`
                                    : '영상'}
                                </span>
                              )}
                              <div className="album-item-overlay">
                                <span className="album-item-uploader">
                                  {item.uploaderName}
                                </span>
                                {likesCount > 0 && <span>♥ {likesCount}</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  /* Random Box (랜덤 박스) Unlock UI for Non-attendees */
                  <div className="stack-gap">
                    {/* Blurred silhouette preview */}
                    <div
                      style={{
                        position: 'relative',
                        overflow: 'hidden',
                        borderRadius: 'var(--radius-base)'
                      }}
                    >
                      <div
                        className="album-grid"
                        style={{
                          filter: 'blur(8px)',
                          opacity: 0.55,
                          pointerEvents: 'none'
                        }}
                      >
                        {[1, 2, 3].map((n) => (
                          <div
                            key={n}
                            className="album-item-card"
                            style={{ background: '#334155' }}
                          />
                        ))}
                      </div>
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '1rem',
                          background: 'rgba(0, 0, 0, 0.45)',
                          textShadow: '0 1px 3px rgba(0,0,0,0.8)'
                        }}
                      >
                        🔒 비공개 앨범
                      </div>
                    </div>

                    {meeting.randomBoxConfig?.enabled !== false ? (
                      <div className="random-box-panel">
                        <div className="random-box-header">
                          <span className="random-box-badge">랜덤 박스</span>
                          <div>
                            <h3 className="random-box-title">
                              랜덤 박스로 앨범 열기
                            </h3>
                            <p className="random-box-desc">
                              아래 3가지 퀘스트 중 <strong>1개</strong>를
                              해제하면 이 모임의 앨범을 볼 수 있습니다.
                            </p>
                          </div>
                        </div>

                        <div className="random-box-grid">
                          {/* Box 1: 성실 힐러 박스 */}
                          <div className="random-box-card">
                            <div className="random-box-card-top">
                              <span className="random-box-card-title">
                                <span>
                                  {
                                    RandomBoxQuestRegistry.ACTIVITY_ATTENDANCE
                                      .icon
                                  }
                                </span>
                                <span>
                                  {
                                    RandomBoxQuestRegistry.ACTIVITY_ATTENDANCE
                                      .name
                                  }
                                </span>
                              </span>
                              {RandomBoxQuestRegistry.ACTIVITY_ATTENDANCE.checkAutoEligible(
                                currentUser,
                                meeting
                              ) ? (
                                <button
                                  type="button"
                                  className="btn btn-primary btn-sm"
                                  onClick={() =>
                                    handleUnlockRandomBox('ACTIVITY_ATTENDANCE')
                                  }
                                >
                                  🎁 해제하기
                                </button>
                              ) : (
                                <span className="status-pill settled">
                                  미충족
                                </span>
                              )}
                            </div>
                            <div className="random-box-card-desc">
                              {
                                RandomBoxQuestRegistry.ACTIVITY_ATTENDANCE
                                  .description
                              }
                            </div>
                            <div className="random-box-progress">
                              {RandomBoxQuestRegistry.ACTIVITY_ATTENDANCE.getProgressText(
                                currentUser,
                                meeting
                              )}
                            </div>
                          </div>

                          {/* Box 2: 벙주와의 인연 박스 */}
                          <div className="random-box-card">
                            <div className="random-box-card-top">
                              <span className="random-box-card-title">
                                <span>
                                  {RandomBoxQuestRegistry.HOST_RELATIONSHIP.icon}
                                </span>
                                <span>
                                  {RandomBoxQuestRegistry.HOST_RELATIONSHIP.name}
                                </span>
                              </span>
                              {RandomBoxQuestRegistry.HOST_RELATIONSHIP.checkAutoEligible(
                                currentUser,
                                meeting,
                                allMeetings
                              ) ? (
                                <button
                                  type="button"
                                  className="btn btn-primary btn-sm"
                                  onClick={() =>
                                    handleUnlockRandomBox('HOST_RELATIONSHIP')
                                  }
                                >
                                  🎁 해제하기
                                </button>
                              ) : (
                                <span className="status-pill settled">
                                  미충족
                                </span>
                              )}
                            </div>
                            <div className="random-box-card-desc">
                              {
                                RandomBoxQuestRegistry.HOST_RELATIONSHIP
                                  .description
                              }{' '}
                              (벙주:{' '}
                              {hostMember ? hostMember.realName : '벙주'})
                            </div>
                            <div className="random-box-progress">
                              {RandomBoxQuestRegistry.HOST_RELATIONSHIP.getProgressText(
                                currentUser,
                                meeting,
                                allMeetings
                              )}
                            </div>
                          </div>

                          {/* Box 3: 벙주 시크릿 퀴즈 박스 */}
                          <div className="random-box-card">
                            <div className="random-box-card-top">
                              <span className="random-box-card-title">
                                <span>
                                  {RandomBoxQuestRegistry.MEETING_QUIZ.icon}
                                </span>
                                <span>
                                  {RandomBoxQuestRegistry.MEETING_QUIZ.name}
                                </span>
                              </span>
                            </div>
                            <div className="random-box-card-desc">
                              질문:{' '}
                              <strong>
                                {RandomBoxQuestRegistry.MEETING_QUIZ.getQuestion(
                                  meeting
                                )}
                              </strong>
                            </div>
                            <form
                              onSubmit={handleQuizSubmit}
                              className="random-box-quiz-row"
                            >
                              <input
                                type="text"
                                className="random-box-quiz-input"
                                placeholder="정답을 입력하세요"
                                value={quizInput}
                                onChange={(e) => {
                                  setQuizInput(e.target.value);
                                  setQuizMessage({ text: '', type: '' });
                                }}
                              />
                              <button
                                type="submit"
                                className="btn btn-outline btn-sm"
                              >
                                정답 확인
                              </button>
                            </form>
                            {quizMessage.text && (
                              <div
                                style={{
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                  color:
                                    quizMessage.type === 'success'
                                      ? '#10b981'
                                      : '#ef4444'
                                }}
                              >
                                {quizMessage.text}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="lounge-locked-box">
                        <strong>
                          🔒 이 모임의 앨범은 참석자 전용 비공개 앨범입니다
                        </strong>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            </>
          )}
        </div>
      </section>
      )
    )}

      {/* 3. Likes (❤️) & One-Line Comments Feed (Only in detail view) */}
      {viewMode === 'detail' && (
        <section className="list-section">
        {/* Likes Summary Row */}
        <div className="feed-likes-bar">
          <button
            type="button"
            className={`feed-like-count-btn ${isLiked ? 'liked' : ''}`}
            onClick={handleToggleLike}
          >
            <span className="feed-heart-icon">{isLiked ? '♥' : '♡'}</span>
            <span>{likes.length}</span>
          </button>

          {likes.length > 0 && (
            <div className="feed-avatar-stack">
              {likes.slice(0, 6).map((uid) => {
                const m = members.find((mem) => mem.uid === uid);
                return (
                  <span
                    key={uid}
                    className="feed-avatar-circle sm overlap"
                    style={{ backgroundColor: getAvatarBg(uid) }}
                    title={m ? formatMemberNickname(m) : uid}
                  >
                    {m ? m.realName.slice(0, 1) : '회원'}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Comments List */}
        <div className="feed-comments-list">
          {comments.length === 0 ? (
            <p className="muted-text" style={{ padding: '12px 0' }}>
              첫 번째 댓글을 남겨보세요.
            </p>
          ) : (
            comments.map((cmt) => {
              const author = members.find((m) => m.uid === cmt.uid);
              const authorNick = author
                ? formatMemberNickname(author)
                : cmt.uid;
              const canDelete =
                currentUser?.uid === cmt.uid || adminUser || canManage;

              return (
                <div key={cmt.id} className="feed-comment-row">
                  <div
                    className="feed-avatar-circle"
                    style={{ backgroundColor: getAvatarBg(cmt.uid) }}
                  >
                    {author ? author.realName.slice(0, 1) : '회'}
                  </div>
                  <div className="feed-comment-body">
                    <div className="feed-comment-header">
                      <strong className="feed-comment-author">
                        {authorNick}
                      </strong>
                      {canDelete && (
                        <button
                          type="button"
                          className="feed-comment-del"
                          onClick={() => handleDeleteComment(cmt.id)}
                        >
                          삭제
                        </button>
                      )}
                    </div>
                    <div className="feed-comment-time">{cmt.createdAt}</div>
                    <div className="feed-comment-text">{cmt.text}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Comment Input Bar */}
        <form onSubmit={handleAddComment} className="feed-comment-input-bar">
          <button
            type="button"
            aria-label="좋아요"
            className={`feed-bottom-heart-btn ${isLiked ? 'liked' : ''}`}
            onClick={handleToggleLike}
          >
            {isLiked ? '♥' : '♡'}
          </button>
          <input
            type="text"
            className="feed-comment-input"
            placeholder="댓글을 남겨보세요."
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
          />
          <button type="submit" className="feed-comment-submit-btn">
            등록
          </button>
        </form>
      </section>
      )}

      {/* Lightbox Modal for Photo / Video Full View */}
      {activeLightboxItem && (
        <div
          className="lightbox-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setActiveLightboxItem(null)}
        >
          <div
            className="lightbox-top-bar"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <strong>{activeLightboxItem.uploaderName}님의 미디어</strong>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                {activeLightboxItem.createdAt}
              </div>
            </div>
            <button
              type="button"
              className="lightbox-close-btn"
              onClick={() => setActiveLightboxItem(null)}
              aria-label="닫기"
            >
              ×
            </button>
          </div>

          <div
            className="lightbox-main-view"
            onClick={(e) => e.stopPropagation()}
          >
            {activeLightboxItem.mediaType === 'video' ? (
              <video
                src={activeLightboxItem.url}
                controls
                autoPlay
                className="lightbox-video"
              />
            ) : (
              <img
                src={getOptimizedMediaUrl(activeLightboxItem)}
                alt={activeLightboxItem.caption || '모임 사진'}
                className="lightbox-img"
                onError={(e) => {
                  if (
                    activeLightboxItem.thumbUrl &&
                    e.currentTarget.src !== activeLightboxItem.thumbUrl
                  ) {
                    e.currentTarget.src = activeLightboxItem.thumbUrl;
                  }
                }}
              />
            )}
          </div>

          <div
            className="lightbox-bottom-bar"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{
                  color: '#ffffff',
                  borderColor: 'rgba(255,255,255,0.4)'
                }}
                onClick={() => handleToggleMediaLike(activeLightboxItem.id)}
              >
                ♥ {activeLightboxItem.likes?.length || 0}
              </button>
              {activeLightboxItem.caption && (
                <span>{activeLightboxItem.caption}</span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              {activeLightboxItem.driveDownloadUrl && (
                <a
                  href={activeLightboxItem.driveDownloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline btn-sm"
                  style={{
                    color: '#ffffff',
                    borderColor: 'rgba(255,255,255,0.4)'
                  }}
                >
                  드라이브 원본
                </a>
              )}
              {!isMeetingSettled &&
                (currentUser?.uid === activeLightboxItem.uploaderUid ||
                  adminUser) && (
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{ color: '#f87171', borderColor: '#f87171' }}
                  onClick={() =>
                    runArmed(`delete-media:${activeLightboxItem.id}`, () =>
                      handleDeleteMedia(activeLightboxItem.id)
                    )
                  }
                >
                  {isArmed(`delete-media:${activeLightboxItem.id}`)
                    ? '삭제 확인'
                    : '삭제'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

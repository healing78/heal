import React, { useState } from 'react';
import {
  calculateMeetingScoreForMember,
  calculateMeetingSettlement,
  canManageMeeting,
  formatMemberNickname,
  isAdminRole,
  REGION_GROUPS
} from '../core/communityRules';

const WEEKDAY_SHORT_KO = ['일', '월', '화', '수', '목', '금', '토'];
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

export default function MeetingDetailPage({
  meeting,
  currentUser,
  members,
  onBackToList,
  onShareMeeting,
  onToggleApplyMeeting,
  onUpdateMeeting,
  onUpdateMemberProfile,
  onSettleMeeting
}) {
  const [loungeTab, setLoungeTab] = useState('rounds'); // 'rounds' | 'settlement' | 'returns'
  const [showAttendeeDrawer, setShowAttendeeDrawer] = useState(false);
  const [editingRoundIdx, setEditingRoundIdx] = useState(null);
  const [showManagerTools, setShowManagerTools] = useState(false);
  const [editingInfo, setEditingInfo] = useState(false);

  const [infoForm, setInfoForm] = useState({
    title: meeting.title || '',
    dateOnly:
      meeting.dateOnly ||
      String(meeting.date || '').slice(0, 10) ||
      '2026-11-07',
    startTime:
      meeting.startTime || String(meeting.date || '').slice(11, 16) || '19:00',
    endTime: meeting.endTime || '23:00',
    location: meeting.location || '서울',
    treasurerUid: meeting.treasurerUid || meeting.hostUid,
    type: meeting.type || 'Casual',
    description: meeting.description || ''
  });

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
  const [previewReceiptUrl, setPreviewReceiptUrl] = useState('');
  const [commentInput, setCommentInput] = useState('');

  const canManage = canManageMeeting(currentUser, meeting);
  const adminUser = isAdminRole(currentUser?.role);
  const applicants = meeting.applicants || [];
  const confirmedList = meeting.confirmedParticipants || [];
  const isApplied = applicants.includes(currentUser?.uid);
  const isConfirmedParticipant = confirmedList.includes(currentUser?.uid);

  // Only attendees, host/treasurer, or admin can view the 벙대기실 (rounds, settlement, safe return)
  const canAccessLounge =
    isApplied || isConfirmedParticipant || canManage || adminUser;

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

  const primaryPlaceText =
    rounds[0]?.placeName || meeting.placeDetail || meeting.location || '';

  // Save edited basic schedule info (Host / Treasurer / Admin)
  const handleSaveBasicInfo = async (e) => {
    e.preventDefault();
    if (!infoForm.title.trim() || !infoForm.location.trim()) return;
    const combinedDate = `${infoForm.dateOnly} ${infoForm.startTime}`;
    await onUpdateMeeting(meeting.id, {
      title: infoForm.title.trim(),
      dateOnly: infoForm.dateOnly,
      startTime: infoForm.startTime,
      endTime: infoForm.endTime || '23:00',
      date: combinedDate,
      location: infoForm.location.trim(),
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
      rounds: nextRounds,
      placeDetail:
        roundIdx === 0 && fieldPatch.placeName !== undefined
          ? fieldPatch.placeName
          : meeting.placeDetail
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
    e.preventDefault();
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

  // Finalize meeting & grant attendance/expedition scores
  const handleFinalizeSettlement = async () => {
    if (!canManage || meeting.status === 'settled') return;
    const confirmedUids = settlement.participantRows
      .filter((row) => row.attendedRounds.length > 0)
      .map((row) => row.uid);
    const finalUids = confirmedUids.length > 0 ? confirmedUids : applicants;
    await onSettleMeeting(meeting.id, finalUids);
  };

  // Copy meeting settlement summary report text for KakaoTalk
  const handleCopySettlementReport = async () => {
    const lines = [
      `[Healing78 정산 리포트 #${meeting.id}]`,
      `■ 일정명: ${meeting.title}`,
      `■ 일시/지역: ${meeting.date} (${meeting.location})`,
      `■ 주최: ${hostMember ? formatMemberNickname(hostMember) : meeting.hostUid}`,
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

  const displayAttendeeUids =
    meeting.status === 'settled' && confirmedList.length > 0
      ? confirmedList
      : applicants;

  return (
    <div className="list-container">
      {/* 1. Top Bar (`← 상세보기`) & Schedule Detail Card (Matches Uploaded Screenshot) */}
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
            <span>상세보기</span>
          </button>

          <div className="badge-group">
            {canManage && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setEditingInfo((prev) => !prev)}
              >
                {editingInfo ? '수정 닫기' : '일정 수정'}
              </button>
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
            <h2 className="detail-card-title">{meeting.title}</h2>
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
              <div>
                {meeting.status === 'open' &&
                  meeting.requestAttendance !== false && (
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
                          <span className="platform-badge">주최</span>
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

        {/* Host / Treasurer / Admin Basic Info Edit Form */}
        {editingInfo && canManage && (
          <form
            onSubmit={handleSaveBasicInfo}
            className="stack-gap"
            style={{
              marginTop: '14px',
              paddingTop: '14px',
              borderTop: '1px solid var(--color-divider)'
            }}
          >
            <h3>일정 정보 수정</h3>
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="edit-mtg-title">일정 제목</label>
                <input
                  id="edit-mtg-title"
                  type="text"
                  required
                  value={infoForm.title}
                  onChange={(e) =>
                    setInfoForm({ ...infoForm, title: e.target.value })
                  }
                />
              </div>
              <div className="form-field">
                <label htmlFor="edit-mtg-loc">지역</label>
                <input
                  id="edit-mtg-loc"
                  type="text"
                  list="region-suggestions"
                  required
                  value={infoForm.location}
                  onChange={(e) =>
                    setInfoForm({ ...infoForm, location: e.target.value })
                  }
                />
                <datalist id="region-suggestions">
                  {REGION_GROUPS.map((g) => (
                    <option key={g.id} value={g.keywords[0]}>
                      {g.name}
                    </option>
                  ))}
                </datalist>
              </div>
              <div className="form-field">
                <label htmlFor="edit-mtg-date">날짜</label>
                <input
                  id="edit-mtg-date"
                  type="date"
                  required
                  value={infoForm.dateOnly}
                  onChange={(e) =>
                    setInfoForm({ ...infoForm, dateOnly: e.target.value })
                  }
                />
              </div>
              <div className="form-field">
                <label htmlFor="edit-mtg-time">시작 시간</label>
                <input
                  id="edit-mtg-time"
                  type="time"
                  required
                  value={infoForm.startTime}
                  onChange={(e) =>
                    setInfoForm({ ...infoForm, startTime: e.target.value })
                  }
                />
              </div>
              <div className="form-field">
                <label htmlFor="edit-mtg-end-time">종료 시간</label>
                <input
                  id="edit-mtg-end-time"
                  type="time"
                  value={infoForm.endTime}
                  onChange={(e) =>
                    setInfoForm({ ...infoForm, endTime: e.target.value })
                  }
                />
              </div>
              <div className="form-field">
                <label htmlFor="edit-mtg-treasurer">총무</label>
                <select
                  id="edit-mtg-treasurer"
                  value={infoForm.treasurerUid}
                  onChange={(e) =>
                    setInfoForm({ ...infoForm, treasurerUid: e.target.value })
                  }
                >
                  {members.map((m) => (
                    <option key={m.uid} value={m.uid}>
                      {formatMemberNickname(m)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="edit-mtg-desc">안내 메모</label>
                <input
                  id="edit-mtg-desc"
                  type="text"
                  value={infoForm.description}
                  onChange={(e) =>
                    setInfoForm({ ...infoForm, description: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="btn-row">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setEditingInfo(false)}
              >
                취소
              </button>
              <button type="submit" className="btn btn-primary btn-sm">
                저장
              </button>
            </div>
          </form>
        )}
      </section>

      {/* 2. "벙대기실" (Accessible ONLY to Attendees & Admins/Host/Treasurer) */}
      <section className="list-section">
        <div className="section-title-row">
          <div className="badge-group">
            <h2>벙대기실</h2>
            <span className="platform-badge">#{meeting.id}</span>
            {adminUser && !isApplied && (
              <span className="location-pill">운영진 열람</span>
            )}
          </div>
          {canAccessLounge && (
            <span className="sub-meta">
              주최:{' '}
              {hostMember ? hostMember.realName : meeting.hostUid} · 총무:{' '}
              {treasurerMember ? treasurerMember.realName : treasurerUid}
            </span>
          )}
        </div>

        {!canAccessLounge ? (
          <div className="lounge-locked-box">
            <strong>🔒 참석자 및 운영진 전용 공간입니다</strong>
            <p className="muted-text">
              상단 카드에서 [참석] 버튼을 누르면 1·2차 장소 코스, 회비 정산, 귀가
              현황을 확인할 수 있습니다.
            </p>
          </div>
        ) : (
          <div className="lounge-body">
            {/* 3-Tab Segmented Navigation inside 벙대기실 */}
            <div className="lounge-tab-bar" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={loungeTab === 'rounds'}
                className={`lounge-tab-btn ${
                  loungeTab === 'rounds' ? 'active' : ''
                }`}
                onClick={() => setLoungeTab('rounds')}
              >
                장소·코스 ({rounds.length}차)
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={loungeTab === 'settlement'}
                className={`lounge-tab-btn ${
                  loungeTab === 'settlement' ? 'active' : ''
                }`}
                onClick={() => setLoungeTab('settlement')}
              >
                정산·회비
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={loungeTab === 'returns'}
                className={`lounge-tab-btn ${
                  loungeTab === 'returns' ? 'active' : ''
                }`}
                onClick={() => setLoungeTab('returns')}
              >
                귀가현황 ({Object.keys(safeReturns).length}/
                {displayAttendeeUids.length})
              </button>
            </div>

            {/* TAB 1: 장소·코스 (Read-only cards by default, toggle edit per round) */}
            {loungeTab === 'rounds' && (
              <div className="stack-gap">
                <div className="btn-row">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={handleAddRound}
                  >
                    + {rounds.length + 1}차 추가
                  </button>
                </div>

                <div className="divider-list">
                  {rounds.map((r, idx) => {
                    const rSummary = settlement.roundSummaries[idx] || {};
                    const rParticipants = Array.isArray(r.participants)
                      ? r.participants
                      : [];
                    const amIInRound = rParticipants.includes(
                      currentUser?.uid
                    );
                    const isEditingThisRound = editingRoundIdx === idx;
                    const payerMember = members.find(
                      (m) => m.uid === (r.payerUid || treasurerUid)
                    );
                    const naverSearchUrl = r.placeName
                      ? `https://map.naver.com/p/search/${encodeURIComponent(
                          r.placeName
                        )}`
                      : '';
                    const kakaoSearchUrl = r.placeName
                      ? `https://map.kakao.com/?q=${encodeURIComponent(
                          r.placeName
                        )}`
                      : '';

                    return (
                      <div key={r.id || idx} className="lounge-round-card">
                        <div className="meeting-top">
                          <div className="badge-group">
                            <span className="platform-badge">{idx + 1}차</span>
                            <strong className="lounge-round-title">
                              {r.placeName || '장소 미정'}
                            </strong>
                            {r.isGoldenBell && (
                              <span className="expedition-pill">
                                골든벨 (
                                {members.find((m) => m.uid === r.goldenBellUid)
                                  ?.realName || '찬조'}
                                )
                              </span>
                            )}
                          </div>

                          <div className="btn-row">
                            <button
                              type="button"
                              className={`btn btn-sm ${
                                amIInRound ? 'btn-primary' : 'btn-outline'
                              }`}
                              onClick={() =>
                                handleToggleRoundParticipant(
                                  idx,
                                  currentUser?.uid
                                )
                              }
                            >
                              {amIInRound
                                ? `${idx + 1}차 참석 ✓`
                                : `${idx + 1}차 불참`}
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              onClick={() =>
                                setEditingRoundIdx(
                                  isEditingThisRound ? null : idx
                                )
                              }
                            >
                              {isEditingThisRound ? '닫기' : '편집'}
                            </button>
                          </div>
                        </div>

                        {/* Clean Read-Only Summary Meta */}
                        <div className="lounge-round-meta">
                          <span>
                            참석 {rParticipants.length}명 · 비용{' '}
                            <strong>
                              {(Number(r.cost) || 0).toLocaleString()}원
                            </strong>
                            {!r.isGoldenBell &&
                              rSummary.perPersonRounded > 0 && (
                                <>
                                  {' '}
                                  (1인{' '}
                                  {rSummary.perPersonRounded.toLocaleString()}
                                  원)
                                </>
                              )}
                          </span>
                          {payerMember && Number(r.cost) > 0 && (
                            <span> · 결제: {payerMember.realName}</span>
                          )}
                        </div>

                        {/* Quick Map Links & Receipt View */}
                        {(r.placeName || r.mapUrl || r.receiptUrl) && (
                          <div className="badge-group">
                            {r.mapUrl && (
                              <a
                                href={r.mapUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-primary btn-sm"
                                style={{ textDecoration: 'none' }}
                              >
                                지도 열기
                              </a>
                            )}
                            {r.placeName && (
                              <>
                                <a
                                  href={naverSearchUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="btn btn-outline btn-sm"
                                  style={{ textDecoration: 'none' }}
                                >
                                  네이버 지도
                                </a>
                                <a
                                  href={kakaoSearchUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="btn btn-outline btn-sm"
                                  style={{ textDecoration: 'none' }}
                                >
                                  카카오맵
                                </a>
                              </>
                            )}
                            {r.receiptUrl && (
                              <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                onClick={() =>
                                  setPreviewReceiptUrl(
                                    previewReceiptUrl === r.receiptUrl
                                      ? ''
                                      : r.receiptUrl
                                  )
                                }
                              >
                                영수증 보기
                              </button>
                            )}
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

                        {/* Compact Participant Chips */}
                        <div className="chip-list">
                          {applicants.map((uid) => {
                            const m = members.find((mem) => mem.uid === uid);
                            if (!m) return null;
                            const checked = rParticipants.includes(uid);
                            const canClick =
                              uid === currentUser?.uid || canManage;
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
                              >
                                {checked ? '✓ ' : ''}
                                {m.realName}
                              </button>
                            );
                          })}
                        </div>

                        {/* Collapsible Edit Form for this Round */}
                        {isEditingThisRound && (
                          <div className="round-finance-box">
                            <div className="form-grid">
                              <div className="form-field">
                                <label>{idx + 1}차 상호명</label>
                                <input
                                  type="text"
                                  placeholder={`${idx + 1}차 장소 입력`}
                                  value={r.placeName || ''}
                                  onChange={(e) =>
                                    handleUpdateRoundField(idx, {
                                      placeName: e.target.value
                                    })
                                  }
                                />
                              </div>
                              <div className="form-field">
                                <label>지도 링크</label>
                                <input
                                  type="url"
                                  placeholder="네이버/카카오 지도 URL"
                                  value={r.mapUrl || ''}
                                  onChange={(e) =>
                                    handleUpdateRoundField(idx, {
                                      mapUrl: e.target.value
                                    })
                                  }
                                />
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
                                  {members.map((m) => (
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
                                    value={r.goldenBellUid || r.payerUid || ''}
                                    onChange={(e) =>
                                      handleUpdateRoundField(idx, {
                                        goldenBellUid: e.target.value
                                      })
                                    }
                                  >
                                    {members.map((m) => (
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
                                  {r.receiptUrl ? '영수증 변경' : '영수증 첨부'}
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
                                {rounds.length > 1 && canManage && (
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
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: 정산·회비 (Clean My Amount Hero + Member Status List + Collapsible Manager Drawer) */}
            {loungeTab === 'settlement' && (
              <div className="stack-gap">
                {/* My Settlement Summary Hero Box */}
                <div className="lounge-settle-hero">
                  <div className="meeting-top">
                    <div>
                      <div className="preview-caption">
                        {mySettlementRow
                          ? mySettlementRow.netToPay >= 0
                            ? '내가 보낼 회비'
                            : '총무에게 환급받을 정산금'
                          : '1/N 정산 대상 총액'}
                      </div>
                      <div className="preview-value">
                        {mySettlementRow
                          ? `${Math.abs(
                              mySettlementRow.netToPay
                            ).toLocaleString()}원`
                          : `${Math.max(
                              0,
                              settlement.totalSharedCost -
                                settlement.totalSponsorship
                            ).toLocaleString()}원`}
                      </div>
                    </div>

                    <div className="btn-row">
                      {mySettlementRow && (
                        <button
                          type="button"
                          className={`btn btn-sm ${
                            mySettlementRow.paid ? 'btn-outline' : 'btn-primary'
                          }`}
                          onClick={() => handleTogglePaid(currentUser.uid)}
                        >
                          {mySettlementRow.confirmed
                            ? '입금 컨펌됨 ✓'
                            : mySettlementRow.paid
                              ? '입금완료 해제'
                              : '입금 완료'}
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={handleCopySettlementReport}
                      >
                        {copiedReport ? '복사됨' : '정산서 복사'}
                      </button>
                    </div>
                  </div>

                  <div className="lounge-bank-bar">
                    <div className="sub-meta">
                      입금 계좌 ({treasurerMember?.realName || '총무'}):{' '}
                      <strong>
                        {treasurerMember?.bankAccount || '계좌 미등록'}
                      </strong>
                    </div>
                    <div className="btn-row">
                      {treasurerMember?.bankAccount && (
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() =>
                            handleCopyAccount(treasurerMember.bankAccount)
                          }
                        >
                          {copiedAccount ? '복사됨' : '계좌 복사'}
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => setEditingBank((prev) => !prev)}
                      >
                        {editingBank ? '닫기' : '내 계좌'}
                      </button>
                    </div>
                  </div>

                  {editingBank && (
                    <form
                      onSubmit={handleSaveMyBank}
                      className="inline-input-row"
                      style={{ marginTop: '6px' }}
                    >
                      <input
                        type="text"
                        placeholder="은행명 계좌번호 (예금주)"
                        value={myBankInput}
                        onChange={(e) => setMyBankInput(e.target.value)}
                      />
                      <button type="submit" className="btn btn-primary btn-sm">
                        저장
                      </button>
                    </form>
                  )}
                </div>

                {/* Compact 3-Column Total Cost Summary */}
                <div className="stats-grid">
                  <div className="stat-box">
                    <span className="stat-label">총 지출</span>
                    <strong className="stat-value">
                      {settlement.totalGrossCost.toLocaleString()}원
                    </strong>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">찬조·골든벨</span>
                    <strong className="stat-value">
                      {(
                        settlement.totalGoldenBellCost +
                        settlement.totalSponsorship
                      ).toLocaleString()}
                      원
                    </strong>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">1/N 대상액</span>
                    <strong className="stat-value">
                      {Math.max(
                        0,
                        settlement.totalSharedCost - settlement.totalSponsorship
                      ).toLocaleString()}
                      원
                    </strong>
                  </div>
                </div>

                {/* Per-Participant Clean Payment Status List */}
                <div className="divider-list">
                  {settlement.participantRows.map((row) => {
                    const m = members.find((mem) => mem.uid === row.uid);
                    if (!m) return null;
                    const isMe = row.uid === currentUser?.uid;

                    return (
                      <div key={row.uid} className="ranking-row">
                        <div className="rank-left">
                          <strong>{m.realName}</strong>
                          <span className="location-pill">
                            {row.attendedRounds.join(',') || '미참석'}
                          </span>
                          <span
                            className={`status-pill ${
                              row.confirmed ? 'open' : 'settled'
                            }`}
                          >
                            {row.confirmed
                              ? '컨펌완료'
                              : row.paid
                                ? '입금완료'
                                : '미입금'}
                          </span>
                        </div>

                        <div className="badge-group">
                          <div style={{ textAlign: 'right' }}>
                            <strong className="score-highlight">
                              {row.netToPay >= 0
                                ? `${row.netToPay.toLocaleString()}원`
                                : `환급 +${Math.abs(
                                    row.netToPay
                                  ).toLocaleString()}원`}
                            </strong>
                            {row.paidOutOfPocket > 0 && (
                              <div className="sub-meta">
                                선결제 {row.paidOutOfPocket.toLocaleString()}원
                              </div>
                            )}
                          </div>

                          {(isMe || canManage) && !row.confirmed && (
                            <button
                              type="button"
                              className={`btn btn-sm ${
                                row.paid ? 'btn-outline' : 'btn-primary'
                              }`}
                              onClick={() => handleTogglePaid(row.uid)}
                            >
                              {row.paid ? '입금됨' : '입금'}
                            </button>
                          )}

                          {canManage && (
                            <button
                              type="button"
                              className={`btn btn-sm ${
                                row.confirmed ? 'btn-primary' : 'btn-outline'
                              }`}
                              onClick={() => handleToggleConfirmPayment(row.uid)}
                            >
                              {row.confirmed ? '컨펌✓' : '컨펌'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Collapsible Manager Tools (찬조금 / 끝전 / 수동조정 / 마감) */}
                <div className="round-finance-box">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setShowManagerTools((prev) => !prev)}
                  >
                    {showManagerTools
                      ? '정산 상세 설정 닫기 ▲'
                      : '찬조금 · 끝전 · 수동조정 · 마감 열기 ▼'}
                  </button>

                  {showManagerTools && (
                    <div className="stack-gap" style={{ marginTop: '8px' }}>
                      {/* Sponsorships */}
                      <div className="participants-box stack-gap">
                        <strong>찬조금 내역</strong>
                        {sponsorships.map((sp) => {
                          const spMember = members.find(
                            (m) => m.uid === sp.uid
                          );
                          return (
                            <div key={sp.id} className="ranking-row">
                              <span>
                                {spMember ? spMember.realName : sp.uid} (
                                {sp.memo})
                              </span>
                              <div className="badge-group">
                                <strong>{sp.amount.toLocaleString()}원</strong>
                                {canManage && (
                                  <button
                                    type="button"
                                    className="btn btn-outline btn-sm"
                                    onClick={() =>
                                      handleDeleteSponsorship(sp.id)
                                    }
                                  >
                                    삭제
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        <form
                          onSubmit={handleAddSponsorship}
                          className="inline-input-row"
                        >
                          <select
                            value={sponsorForm.uid}
                            onChange={(e) =>
                              setSponsorForm({
                                ...sponsorForm,
                                uid: e.target.value
                              })
                            }
                          >
                            {members.map((m) => (
                              <option key={m.uid} value={m.uid}>
                                {m.realName}
                              </option>
                            ))}
                          </select>
                          <input
                            type="number"
                            min="1000"
                            step="1000"
                            placeholder="찬조 금액"
                            value={sponsorForm.amount}
                            onChange={(e) =>
                              setSponsorForm({
                                ...sponsorForm,
                                amount: e.target.value
                              })
                            }
                          />
                          <button
                            type="submit"
                            className="btn btn-outline btn-sm"
                          >
                            찬조 추가
                          </button>
                        </form>
                      </div>

                      {/* Rounding & Manual Override for Host/Treasurer */}
                      {canManage && (
                        <div className="participants-box stack-gap">
                          <div className="meeting-top">
                            <strong>끝전 단위 & 수동 금액 조정</strong>
                            <div className="badge-group">
                              {[
                                { id: 'floor100', label: '100원 버림' },
                                { id: 'ceil100', label: '100원 올림' },
                                { id: 'exact', label: '1원 단위' }
                              ].map((rule) => (
                                <button
                                  key={rule.id}
                                  type="button"
                                  className={`btn btn-sm ${
                                    (meeting.roundingRule || 'floor100') ===
                                    rule.id
                                      ? 'btn-primary'
                                      : 'btn-outline'
                                  }`}
                                  onClick={() => handleChangeRounding(rule.id)}
                                >
                                  {rule.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {settlement.participantRows.map((row) => {
                            const m = members.find(
                              (mem) => mem.uid === row.uid
                            );
                            if (!m) return null;
                            return (
                              <div key={row.uid} className="inline-input-row">
                                <span style={{ minWidth: '70px' }}>
                                  {m.realName}
                                </span>
                                <input
                                  type="number"
                                  step="100"
                                  placeholder={`자동 (${row.calculatedShare.toLocaleString()}원)`}
                                  value={
                                    meeting.manualAmounts?.[row.uid] !==
                                    undefined
                                      ? meeting.manualAmounts[row.uid]
                                      : ''
                                  }
                                  onChange={(e) =>
                                    handleManualOverrideChange(
                                      row.uid,
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {canManage && meeting.status === 'open' && (
                        <button
                          type="button"
                          className="btn btn-settle"
                          onClick={handleFinalizeSettlement}
                        >
                          최종 마감 · 참석 점수 정산 완료
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: 귀가현황 (One-Click Safe Return Check & Member Status List) */}
            {loungeTab === 'returns' && (
              <div className="stack-gap">
                <div className="lounge-settle-hero">
                  <div className="meeting-top">
                    <div>
                      <div className="preview-caption">내 안심 귀가 상태</div>
                      <div className="preview-value">
                        {mySafeReturn || '귀가 전'}
                      </div>
                    </div>
                    <button
                      type="button"
                      className={`btn ${
                        mySafeReturn ? 'btn-outline' : 'btn-primary'
                      }`}
                      onClick={handleToggleSafeReturn}
                    >
                      {mySafeReturn ? '귀가완료 해제' : '귀가완료 체크'}
                    </button>
                  </div>
                </div>

                <div className="divider-list">
                  {displayAttendeeUids.map((uid) => {
                    const m = members.find((mem) => mem.uid === uid);
                    if (!m) return null;
                    const returnTime = safeReturns[uid];
                    const scoreInfo = calculateMeetingScoreForMember(
                      m,
                      meeting.location
                    );
                    return (
                      <div key={uid} className="ranking-row">
                        <div className="rank-left">
                          <strong>{formatMemberNickname(m)}</strong>
                          {scoreInfo.isExpedition && (
                            <span className="expedition-pill">
                              {scoreInfo.label}
                            </span>
                          )}
                        </div>
                        <span
                          className={`status-pill ${
                            returnTime ? 'open' : 'settled'
                          }`}
                        >
                          {returnTime || '귀가 전'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* 3. Likes (❤️) & One-Line Comments Feed (Matches Uploaded Screenshot Bottom) */}
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
    </div>
  );
}

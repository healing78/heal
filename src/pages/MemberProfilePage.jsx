import React, { useEffect, useMemo, useState } from 'react';
import RegionInput from '../components/RegionInput';
import {
  formatMemberNickname,
  isAdminUser,
  resolveMemberBadge,
  ROLE_KEYS,
  ROLE_META
} from '../core/communityRules';
import { useArmedAction } from '../utils/useArmedAction';
import { buildCoAttendanceIndex } from '../core/bungParser';

const AVATAR_BG_PALETTE = [
  '#f59e0b',
  '#3b82f6',
  '#10b981',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#0284c7'
];

function getAvatarBg(uid) {
  const str = String(uid || '');
  let sum = 0;
  for (let i = 0; i < str.length; i += 1) {
    sum += str.charCodeAt(i);
  }
  return AVATAR_BG_PALETTE[sum % AVATAR_BG_PALETTE.length];
}

export default function MemberProfilePage({
  memberUid,
  memberUidList = [],
  currentUser,
  members = [],
  meetings = [],
  communityConfig = {},
  onSelectMember,
  onAdminUpdateMember,
  onReassignMemberUid,
  onBack,
  onNavigateTab
}) {
  const { isArmed, runArmed } = useArmedAction();
  const isAdmin = isAdminUser(currentUser, communityConfig);

  const [touchStartX, setTouchStartX] = useState(null);
  const [touchDeltaX, setTouchDeltaX] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSwipeEnabled, setIsSwipeEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('heal_swipe_enabled');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });
  const [copiedLink, setCopiedLink] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [newKakaoUidInput, setNewKakaoUidInput] = useState('');
  const [showReassignBox, setShowReassignBox] = useState(false);

  // Find target member with robust URI decoding and realName fallback
  const cleanUid = useMemo(() => {
    if (!memberUid) return '';
    try {
      return decodeURIComponent(String(memberUid).trim());
    } catch {
      return String(memberUid).trim();
    }
  }, [memberUid]);

  const member = useMemo(() => {
    if (!cleanUid) return null;
    return (
      members.find((m) => m.uid === cleanUid || m.uid === memberUid) ||
      members.find(
        (m) => (m.realName || '').trim().toLowerCase() === cleanUid.toLowerCase()
      ) ||
      null
    );
  }, [members, cleanUid, memberUid]);

  // Edit form state
  const [editForm, setEditForm] = useState(() => ({
    realName: member?.realName || '',
    city: member?.city || '',
    homeCity: member?.homeCity || member?.city || '',
    maritalStatus: member?.maritalStatus || 'single',
    gender: member?.gender || '남',
    role: member?.role || 'Member',
    joinedAt: member?.joinedAt || '',
    entryBadge: member?.entryBadge || '',
    customBadge: member?.customBadge || ''
  }));
  const [hasCustomHomeCity, setHasCustomHomeCity] = useState(
    Boolean(
      member?.homeCity &&
      member?.city &&
      member.homeCity.trim() !== member.city.trim()
    )
  );

  // Sync form when member changes
  React.useEffect(() => {
    if (member) {
      setEditForm({
        realName: member.realName || '',
        city: member.city || '',
        homeCity: member.homeCity || member.city || '',
        maritalStatus: member.maritalStatus || 'single',
        gender: member.gender || '남',
        role: member.role || 'Member',
        joinedAt: member.joinedAt || '',
        entryBadge: member.entryBadge || '',
        customBadge: member.customBadge || ''
      });
      setHasCustomHomeCity(
        Boolean(
          member.homeCity &&
          member.city &&
          member.homeCity.trim() !== member.city.trim()
        )
      );
      setIsEditing(false);
      setShowReassignBox(false);
    }
  }, [member?.uid]);

  // Navigation within memberUidList
  const effectiveUidList = memberUidList.length > 0 ? memberUidList : members.map((m) => m.uid);
  const currentIndex = effectiveUidList.findIndex((u) => u === cleanUid || u === memberUid);
  const totalCount = effectiveUidList.length;

  const goToPrev = () => {
    if (currentIndex > 0) {
      onSelectMember(effectiveUidList[currentIndex - 1], effectiveUidList, null, { replace: true });
    }
  };

  const goToNext = () => {
    if (currentIndex < totalCount - 1 && currentIndex !== -1) {
      onSelectMember(effectiveUidList[currentIndex + 1], effectiveUidList, null, { replace: true });
    }
  };

  // Touch Swipe Handlers for Mobile (With Real-time Drag & Smooth Animation)
  const handleTouchStart = (e) => {
    if (!isSwipeEnabled || isAnimating) return;
    setTouchStartX(e.touches[0].clientX);
    setTouchDeltaX(0);
  };

  const handleTouchMove = (e) => {
    if (!isSwipeEnabled || touchStartX === null || isAnimating) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - touchStartX;
    // Limit max visual drag to ±120px to prevent tearing
    const clampedDiff = Math.max(-120, Math.min(120, diff));
    setTouchDeltaX(clampedDiff);
  };

  const handleTouchEnd = () => {
    if (!isSwipeEnabled || touchStartX === null || isAnimating) {
      setTouchStartX(null);
      setTouchDeltaX(0);
      return;
    }

    const threshold = 60;
    if (touchDeltaX > threshold && currentIndex > 0) {
      // Swiped right -> smoothly slide out and navigate to previous friend
      setIsAnimating(true);
      setTouchDeltaX(window.innerWidth || 320);
      setTimeout(() => {
        goToPrev();
        setTouchDeltaX(0);
        setIsAnimating(false);
      }, 200);
    } else if (touchDeltaX < -threshold && currentIndex < totalCount - 1 && currentIndex !== -1) {
      // Swiped left -> smoothly slide out and navigate to next friend
      setIsAnimating(true);
      setTouchDeltaX(-(window.innerWidth || 320));
      setTimeout(() => {
        goToNext();
        setTouchDeltaX(0);
        setIsAnimating(false);
      }, 200);
    } else {
      // Rebound back to origin
      setIsAnimating(true);
      setTouchDeltaX(0);
      setTimeout(() => {
        setIsAnimating(false);
      }, 200);
    }
    setTouchStartX(null);
  };

  // Copy Profile Link
  const handleCopyLink = async () => {
    try {
      const url = `${window.location.origin}/members/${encodeURIComponent(memberUid)}`;
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      setCopiedLink(false);
    }
  };

  // Save Admin Edits
  const handleSaveAdminEdit = async (e) => {
    e.preventDefault();
    if (!member || !onAdminUpdateMember) return;
    try {
      const finalHomeCity = hasCustomHomeCity && editForm.homeCity?.trim()
        ? editForm.homeCity.trim()
        : editForm.city.trim();

      await onAdminUpdateMember(member.uid, {
        realName: editForm.realName.trim(),
        city: editForm.city.trim(),
        homeCity: finalHomeCity,
        maritalStatus: editForm.maritalStatus,
        gender: editForm.gender,
        role: editForm.role,
        joinedAt: editForm.joinedAt.trim(),
        entryBadge: editForm.entryBadge.trim(),
        customBadge: editForm.customBadge.trim()
      });
      setFeedback('✅ 회원 정보가 성공적으로 수정되었습니다.');
      setIsEditing(false);
      setTimeout(() => setFeedback(''), 3000);
    } catch (err) {
      setFeedback(`❌ 수정 실패: ${err.message || err}`);
    }
  };

  // Handle Reassign Kakao UID
  const handleExecuteReassign = async () => {
    const cleanNewUid = newKakaoUidInput.trim();
    if (!cleanNewUid || !onReassignMemberUid) return;
    try {
      await onReassignMemberUid(member.uid, cleanNewUid);
      setFeedback(`✅ ${cleanNewUid} 계정으로 회원 데이터가 성공적으로 인계되었습니다.`);
      setShowReassignBox(false);
      setNewKakaoUidInput('');
      onSelectMember(cleanNewUid, effectiveUidList);
      setTimeout(() => setFeedback(''), 4000);
    } catch (err) {
      setFeedback(`❌ 인계 실패: ${err.message || err}`);
    }
  };

  // Co-attendance (만난 횟수) Index
  const coAttendanceIndex = useMemo(() => {
    return buildCoAttendanceIndex(meetings, members);
  }, [meetings, members]);

  const coAttendanceCount = useMemo(() => {
    if (!currentUser || !member || currentUser.uid === member.uid) return 0;
    return coAttendanceIndex.getCoAttendanceCount(currentUser.uid, member.uid);
  }, [coAttendanceIndex, currentUser, member]);

  const topBuddies = useMemo(() => {
    if (!member) return [];
    return coAttendanceIndex.getTopBuddies(member.uid, 5);
  }, [coAttendanceIndex, member]);

  const [filterSharedOnly, setFilterSharedOnly] = useState(false);

  // Attended Meetings (Checks all participant fields: confirmedParticipants, applicants, attendeeUids, etc.)
  const attendedMeetings = useMemo(() => {
    if (!member) return [];
    return meetings
      .filter((mtg) => {
        const uids =
          mtg.confirmedParticipants ||
          mtg.applicants ||
          mtg.attendeeUids ||
          mtg.rounds?.[0]?.participants ||
          [];
        if (uids.includes(member.uid)) return true;
        if (mtg.attendeeNames && mtg.attendeeNames.includes(member.realName)) return true;
        if (mtg.attendees && mtg.attendees.some((a) => (typeof a === 'string' ? a === member.realName : a?.name === member.realName))) return true;
        return false;
      })
      .sort((a, b) => String(b.dateOnly || b.date).localeCompare(String(a.dateOnly || a.date)));
  }, [meetings, member]);

  // Displayed Meetings: Full or Shared Only
  const displayedMeetings = useMemo(() => {
    if (filterSharedOnly && currentUser && member && currentUser.uid !== member.uid) {
      return coAttendanceIndex.getSharedMeetings(currentUser.uid, member.uid);
    }
    return attendedMeetings;
  }, [filterSharedOnly, currentUser, member, coAttendanceIndex, attendedMeetings]);

  // Auto-recovery: If member is not found after popstate/invalid route, return to friends list
  useEffect(() => {
    if (!member && onBack) {
      const timer = setTimeout(() => {
        onBack();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [member, onBack]);

  if (!member) {
    return (
      <div className="list-container" style={{ textAlign: 'center', padding: '40px 10px' }}>
        <p style={{ color: '#94a3b8', marginBottom: '14px' }}>회원 정보를 불러오는 중입니다...</p>
        <button type="button" className="btn btn-outline" onClick={onBack}>
          ← 친구 목록으로 돌아가기
        </button>
      </div>
    );
  }

  const roleMeta = ROLE_META[member.role] || ROLE_META.Member;
  const formattedNick = formatMemberNickname(member);
  const tierBadge = resolveMemberBadge(member);

  return (
    <div
      className="list-container"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ userSelect: 'none', overflowX: 'hidden' }}
    >
      {/* Top Bar: Back, Swipe Toggle & Link Share */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px',
          gap: '8px'
        }}
      >
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={onBack}
          style={{ fontSize: '13px', padding: '5px 10px' }}
        >
          ← 목록
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Swipe Gesture Toggle Button (Color-indicated ON/OFF) */}
          <button
            type="button"
            className={`btn-swipe-toggle ${isSwipeEnabled ? 'is-active' : ''}`}
            onClick={() => {
              const next = !isSwipeEnabled;
              setIsSwipeEnabled(next);
              try {
                localStorage.setItem('heal_swipe_enabled', JSON.stringify(next));
              } catch (err) {}
            }}
            title={isSwipeEnabled ? '스와이프 켜짐 (탭하여 끄기)' : '스와이프 꺼짐 (탭하여 켜기)'}
          >
            스와이프
          </button>

          {/* Link Share Button */}
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleCopyLink}
            style={{ fontSize: '12px', padding: '5px 10px' }}
          >
            {copiedLink ? '✅ 복사됨!' : '🔗 링크 공유'}
          </button>
        </div>
      </div>

      <div
        className={`swipe-card-wrapper ${isAnimating ? 'is-animating' : ''}`}
        style={{
          transform: `translateX(${touchDeltaX}px)`,
          opacity: 1 - Math.min(0.4, Math.abs(touchDeltaX) / 300)
        }}
      >

      {feedback && (
        <div className="success-banner" style={{ marginBottom: '10px' }}>
          {feedback}
        </div>
      )}

      {/* Main Profile Header Card */}
      <section
        style={{
          background: 'var(--color-bg-primary, #ffffff)',
          border: '1px solid var(--color-border, #e2e8f0)',
          borderRadius: '10px',
          padding: '16px',
          marginBottom: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: getAvatarBg(member.uid),
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '24px',
              flexShrink: 0
            }}
          >
            {(member.realName || 'H').slice(0, 1)}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h2
                style={{
                  fontSize: '18px',
                  fontWeight: 800,
                  margin: 0,
                  color: 'var(--color-text-primary, #0f172a)'
                }}
              >
                {formattedNick}
              </h2>
              <span
                style={{
                  fontSize: '11px',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  background: roleMeta.badgeColor,
                  color: '#ffffff'
                }}
              >
                {roleMeta.label}
              </span>
            </div>

            <div
              style={{
                fontSize: '13px',
                color: 'var(--color-text-secondary, #64748b)',
                marginTop: '4px',
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap'
              }}
            >
              <span>
                지역: <strong>{member.city || '미설정'}</strong>
                {member.homeCity && member.homeCity !== member.city && (
                  <span style={{ fontSize: '11px', color: '#0284c7', marginLeft: '4px', fontWeight: 600 }}>
                    (벙점수 기준: {member.homeCity})
                  </span>
                )}
              </span>
              <span>가입일: <strong>{member.joinedAt || member.entryBadge || '미등록'}</strong></span>
              <span>성별: <strong>{member.gender || '남'}</strong></span>
              <span>결혼: <strong>{member.maritalStatus === 'married' ? '기혼' : member.maritalStatus === 'divorced' ? '돌싱' : '미혼'}</strong></span>
            </div>
          </div>
        </div>

        {/* Admin Quick Action Button */}
        {isAdmin && (
          <div style={{ marginTop: '14px', borderTop: '1px solid var(--color-border, #f1f5f9)', paddingTop: '10px' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ fontSize: '12px', width: '100%' }}
              onClick={() => setIsEditing((prev) => !prev)}
            >
              {isEditing ? '▲ 편집창 닫기' : '✏️ 회원 정보 편집 / 분류 (운영진)'}
            </button>
          </div>
        )}
      </section>

      {/* Admin Inline Edit Console */}
      {isAdmin && isEditing && (
        <form
          onSubmit={handleSaveAdminEdit}
          style={{
            background: 'var(--color-bg-secondary, #f8fafc)',
            border: '1px solid var(--color-border, #cbd5e1)',
            borderRadius: '8px',
            padding: '14px',
            marginBottom: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          <div style={{ fontWeight: 700, fontSize: '13px', color: '#1e293b' }}>
            ✏️ 회원 정보 직접 수정 & 등급 분류
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={{ fontSize: '11px', color: '#64748b' }}>실명 / 닉네임</label>
              <input
                type="text"
                value={editForm.realName}
                onChange={(e) => setEditForm((p) => ({ ...p, realName: e.target.value }))}
                style={{ width: '100%', padding: '6px', fontSize: '13px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', color: '#64748b' }}>회원 등급(Role)</label>
              <select
                value={editForm.role}
                onChange={(e) => setEditForm((p) => ({ ...p, role: e.target.value }))}
                style={{ width: '100%', padding: '6px', fontSize: '13px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
              >
                {ROLE_KEYS.map((rk) => (
                  <option key={rk} value={rk}>
                    {ROLE_META[rk].label} ({rk})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '11px', color: '#64748b' }}>거주 지역</label>
              <RegionInput
                value={editForm.city}
                onChange={(val) =>
                  setEditForm((p) => ({
                    ...p,
                    city: val,
                    ...(!hasCustomHomeCity ? { homeCity: val } : {})
                  }))
                }
              />
              <div style={{ marginTop: '6px' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={hasCustomHomeCity}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setHasCustomHomeCity(checked);
                      if (!checked) {
                        setEditForm((p) => ({ ...p, homeCity: p.city }));
                      }
                    }}
                  />
                  <span>활동 지역과 벙점수 기준 지역이 다릅니다</span>
                </label>
              </div>

              {hasCustomHomeCity && (
                <div style={{ marginTop: '8px', padding: '8px 10px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
                  <label style={{ fontSize: '11px', color: '#1e293b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                    🏠 벙점수 기준 지역 (홈시티)
                  </label>
                  <RegionInput
                    value={editForm.homeCity || editForm.city}
                    onChange={(val) => setEditForm((p) => ({ ...p, homeCity: val }))}
                  />
                  <div style={{ fontSize: '11px', color: '#0284c7', marginTop: '3px' }}>
                    ℹ️ 닉네임: <strong>{editForm.city || '미입력'}</strong> / 벙점수 판정 기준: <strong>{editForm.homeCity || editForm.city}</strong>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label style={{ fontSize: '11px', color: '#64748b' }}>가입일 (YYYY-MM-DD)</label>
              <input
                type="date"
                value={editForm.joinedAt}
                onChange={(e) => setEditForm((p) => ({ ...p, joinedAt: e.target.value }))}
                style={{ width: '100%', padding: '6px', fontSize: '13px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', color: '#64748b' }}>가입 뱃지 (MMDD)</label>
              <input
                type="text"
                maxLength={4}
                value={editForm.entryBadge}
                onChange={(e) => setEditForm((p) => ({ ...p, entryBadge: e.target.value }))}
                placeholder="예: 0814"
                style={{ width: '100%', padding: '6px', fontSize: '13px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', color: '#64748b' }}>성별</label>
              <select
                value={editForm.gender}
                onChange={(e) => setEditForm((p) => ({ ...p, gender: e.target.value }))}
                style={{ width: '100%', padding: '6px', fontSize: '13px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
              >
                <option value="남">남성</option>
                <option value="여">여성</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '11px', color: '#64748b' }}>결혼 여부</label>
              <select
                value={editForm.maritalStatus}
                onChange={(e) => setEditForm((p) => ({ ...p, maritalStatus: e.target.value }))}
                style={{ width: '100%', padding: '6px', fontSize: '13px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
              >
                <option value="single">미혼 (미)</option>
                <option value="married">기혼 (기)</option>
                <option value="divorced">돌싱 (돌)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setShowReassignBox((prev) => !prev)}
              style={{ fontSize: '11px', color: '#475569' }}
            >
              🔄 카카오 UID 인계 / 연결
            </button>

            <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '6px 16px' }}>
              저장하기
            </button>
          </div>

          {/* Reassign UID Sub-Panel */}
          {showReassignBox && (
            <div
              style={{
                marginTop: '8px',
                padding: '10px',
                background: '#ffffff',
                border: '1px solid #fbcfe8',
                borderRadius: '6px'
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#9d174d', marginBottom: '4px' }}>
                카카오 계정 재가입 등으로 UID가 변경된 경우 새 UID를 입력하여 모든 점수와 이력을 이전합니다.
              </div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="새 카카오 UID (예: kakao:12345678)"
                  value={newKakaoUidInput}
                  onChange={(e) => setNewKakaoUidInput(e.target.value)}
                  style={{ flex: 1, padding: '5px', fontSize: '12px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                />
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '11px', color: '#e11d48' }}
                  onClick={() =>
                    runArmed(`reassign:${member.uid}`, () => handleExecuteReassign())
                  }
                >
                  {isArmed(`reassign:${member.uid}`) ? '인계 확인' : '인계 실행'}
                </button>
              </div>
            </div>
          )}
        </form>
      )}

      {/* Activity Stats Cards Grid */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px',
          marginBottom: '12px'
        }}
      >
        <div style={{ background: 'var(--color-bg-primary, #ffffff)', border: '1px solid var(--color-border, #e2e8f0)', borderRadius: '8px', padding: '10px 8px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#64748b' }}>총 벙점수</div>
          <div style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
            {member.totalScore || 0}
          </div>
        </div>

        <div style={{ background: 'var(--color-bg-primary, #ffffff)', border: '1px solid var(--color-border, #e2e8f0)', borderRadius: '8px', padding: '10px 8px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#64748b' }}>참석 횟수</div>
          <div style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
            {member.attendanceCount || 0}회
          </div>
        </div>

        <div style={{ background: 'var(--color-bg-primary, #ffffff)', border: '1px solid var(--color-border, #e2e8f0)', borderRadius: '8px', padding: '10px 8px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#64748b' }}>원정 보너스</div>
          <div style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
            +{member.expeditionScore || 0}
          </div>
        </div>

        <div style={{ background: 'var(--color-bg-primary, #ffffff)', border: '1px solid var(--color-border, #e2e8f0)', borderRadius: '8px', padding: '10px 8px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#64748b' }}>주최 횟수</div>
          <div style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
            {member.hostCount || 0}회
          </div>
        </div>
      </section>

      {/* Co-attendance (나와 함께한 벙) Card */}
      {currentUser && currentUser.uid !== member.uid && (
        <section
          onClick={() => {
            if (coAttendanceCount > 0) {
              setFilterSharedOnly((prev) => !prev);
            }
          }}
          style={{
            background: filterSharedOnly
              ? 'linear-gradient(135deg, #eef2ff, #e0e7ff)'
              : 'var(--color-bg-primary, #ffffff)',
            border: `1px solid ${filterSharedOnly ? '#6366f1' : 'var(--color-border, #e2e8f0)'}`,
            borderRadius: '8px',
            padding: '12px 14px',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            cursor: coAttendanceCount > 0 ? 'pointer' : 'default',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '22px' }}>🤝</span>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                나와 함께한 벙: <span style={{ color: '#4f46e5', fontWeight: 800 }}>{coAttendanceCount}회</span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                {coAttendanceCount > 0
                  ? filterSharedOnly
                    ? '현재 나와 함께 참석한 벙만 필터링되어 있습니다 (클릭 시 전체 보기)'
                    : `${currentUser.realName || '나'}님과 총 ${coAttendanceCount}번의 벙을 함께 즐겼습니다!`
                  : '아직 함께 참석한 벙 기록이 없습니다.'}
              </div>
            </div>
          </div>

          {coAttendanceCount > 0 && (
            <span
              style={{
                fontSize: '11px',
                padding: '4px 10px',
                borderRadius: '12px',
                background: filterSharedOnly ? '#4f46e5' : '#e0e7ff',
                color: filterSharedOnly ? '#ffffff' : '#4338ca',
                fontWeight: 700,
                flexShrink: 0
              }}
            >
              {filterSharedOnly ? '전체 보기' : `함께한 벙 보기`}
            </span>
          )}
        </section>
      )}

      {/* Top 5 Buddies (가장 자주 만난 단짝) */}
      {topBuddies.length > 0 && (
        <section
          style={{
            background: 'var(--color-bg-primary, #ffffff)',
            border: '1px solid var(--color-border, #e2e8f0)',
            borderRadius: '8px',
            padding: '12px 14px',
            marginBottom: '14px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '14px' }}>🏆</span>
              <strong style={{ fontSize: '13px', color: '#0f172a' }}>
                가장 자주 만난 단짝 TOP {topBuddies.length}
              </strong>
            </div>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>함께한 벙 횟수</span>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '4px'
            }}
          >
            {topBuddies.map((buddy, bIdx) => {
              const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
              return (
                <button
                  key={buddy.uid}
                  type="button"
                  onClick={() => onSelectMember && onSelectMember(buddy.uid, effectiveUidList)}
                  style={{
                    flex: '0 0 auto',
                    minWidth: '78px',
                    background: 'var(--color-bg-secondary, #f8fafc)',
                    border: '1px solid var(--color-border, #e2e8f0)',
                    borderRadius: '8px',
                    padding: '8px 6px',
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}
                  title={`${buddy.realName} 프로필 보기`}
                >
                  <div style={{ fontSize: '12px', marginBottom: '2px' }}>{medals[bIdx]}</div>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: 'var(--color-text-primary, #0f172a)',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {buddy.realName}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#4f46e5',
                      fontWeight: 800,
                      marginTop: '2px'
                    }}
                  >
                    {buddy.count}회
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Attended Meetings History */}
      <section className="list-section">
        <div className="section-title-row">
          <h3>
            {filterSharedOnly ? `나와 함께한 벙 기록` : `참석 모임 기록`}
          </h3>
          <span className="count-badge">{displayedMeetings.length}건</span>
        </div>

        {displayedMeetings.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
            {filterSharedOnly ? '함께 참석한 모임이 없습니다.' : '참석한 모임 기록이 아직 없습니다.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
            {displayedMeetings.map((mtg) => (
              <div
                key={mtg.id}
                onClick={() => onNavigateTab && onNavigateTab('meetings', { id: mtg.id })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border, #e2e8f0)',
                  background: 'var(--color-bg-primary, #ffffff)',
                  cursor: 'pointer'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-text-primary, #0f172a)' }}>
                    {mtg.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    {mtg.dateOnly || mtg.date} • {mtg.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Swipe wrapper closing */}
      </div>

      {/* Mobile Swipe Hint */}
      {isSwipeEnabled && (
        <div style={{ textAlign: 'center', marginTop: '16px', color: '#94a3b8', fontSize: '12px' }}>
          좌우로 스와이프하여 이전/다음 친구로 이동할 수 있습니다.
        </div>
      )}
    </div>
  );
}

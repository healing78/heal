import React, { useEffect, useMemo, useState } from 'react';
import {
  formatMemberNickname,
  isAdminUser,
  resolveMemberBadge,
  ROLE_KEYS,
  ROLE_META
} from '../core/communityRules';
import { useArmedAction } from '../utils/useArmedAction';

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
  const [copiedLink, setCopiedLink] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [newKakaoUidInput, setNewKakaoUidInput] = useState('');
  const [showReassignBox, setShowReassignBox] = useState(false);

  // Find target member
  const member = useMemo(() => {
    return members.find((m) => m.uid === memberUid) || null;
  }, [members, memberUid]);

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
      setIsEditing(false);
      setShowReassignBox(false);
    }
  }, [member?.uid]);

  // Navigation within memberUidList
  const effectiveUidList = memberUidList.length > 0 ? memberUidList : members.map((m) => m.uid);
  const currentIndex = effectiveUidList.indexOf(memberUid);
  const totalCount = effectiveUidList.length;

  const goToPrev = () => {
    if (currentIndex > 0) {
      onSelectMember(effectiveUidList[currentIndex - 1], effectiveUidList);
    }
  };

  const goToNext = () => {
    if (currentIndex < totalCount - 1 && currentIndex !== -1) {
      onSelectMember(effectiveUidList[currentIndex + 1], effectiveUidList);
    }
  };

  // Touch Swipe Handlers for Mobile
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX;

    // Minimum swipe threshold: 50px
    if (deltaX > 50) {
      // Swiped right -> go to previous friend
      goToPrev();
    } else if (deltaX < -50) {
      // Swiped left -> go to next friend
      goToNext();
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
      await onAdminUpdateMember(member.uid, {
        realName: editForm.realName.trim(),
        city: editForm.city.trim(),
        homeCity: editForm.homeCity.trim(),
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

  // Attended Meetings
  const attendedMeetings = useMemo(() => {
    if (!member) return [];
    return meetings
      .filter((mtg) => (mtg.applicants || []).includes(member.uid))
      .sort((a, b) => String(b.dateOnly || b.date).localeCompare(String(a.dateOnly || a.date)));
  }, [meetings, member]);

  if (!member) {
    return (
      <div className="list-container" style={{ textAlign: 'center', padding: '40px 10px' }}>
        <p style={{ color: '#94a3b8', marginBottom: '14px' }}>존재하지 않거나 삭제된 회원입니다.</p>
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
      onTouchEnd={handleTouchEnd}
      style={{ userSelect: 'none' }}
    >
      {/* Top Bar: Back & Carousel Controls */}
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

        {/* Carousel / Navigation Counter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={goToPrev}
            disabled={currentIndex <= 0}
            style={{ padding: '4px 8px', fontSize: '12px' }}
            title="이전 친구 (오른쪽 스와이프)"
          >
            ◀
          </button>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
            {currentIndex >= 0 ? `${currentIndex + 1} / ${totalCount}` : ''}
          </span>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={goToNext}
            disabled={currentIndex >= totalCount - 1 || currentIndex === -1}
            style={{ padding: '4px 8px', fontSize: '12px' }}
            title="다음 친구 (왼쪽 스와이프)"
          >
            ▶
          </button>
        </div>

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
              <span>지역: <strong>{member.city || '미설정'}</strong></span>
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
              <input
                type="text"
                value={editForm.city}
                onChange={(e) => setEditForm((p) => ({ ...p, city: e.target.value }))}
                style={{ width: '100%', padding: '6px', fontSize: '13px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', color: '#64748b' }}>연고지 (원정점수 기준)</label>
              <input
                type="text"
                value={editForm.homeCity}
                onChange={(e) => setEditForm((p) => ({ ...p, homeCity: e.target.value }))}
                style={{ width: '100%', padding: '6px', fontSize: '13px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
              />
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
          marginBottom: '14px'
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

      {/* Attended Meetings History */}
      <section className="list-section">
        <div className="section-title-row">
          <h3>참석 모임 기록</h3>
          <span className="count-badge">{attendedMeetings.length}건</span>
        </div>

        {attendedMeetings.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
            참석한 모임 기록이 아직 없습니다.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
            {attendedMeetings.map((mtg) => (
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

                <span style={{ fontSize: '12px', color: '#3b82f6', fontWeight: 600 }}>
                  상세보기 →
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Mobile Swipe Hint */}
      <div style={{ textAlign: 'center', marginTop: '16px', color: '#94a3b8', fontSize: '12px' }}>
        👆 좌우로 스와이프하여 다음/이전 친구로 이동할 수 있습니다.
      </div>
    </div>
  );
}

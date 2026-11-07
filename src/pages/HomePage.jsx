import React, { useState } from 'react';
import {
  canCreateMeeting,
  formatMemberNickname,
  isAdminRole,
  isAdminUser,
  ROLE_META
} from '../core/communityRules';
import {
  formatScheduleDetailText,
  getTodayDateString,
  isMeetingLoungeOpen
} from '../core/routeMeta';
import { isPastMeeting } from './MeetingsPage';
import { useArmedAction } from '../utils/useArmedAction';

export default function HomePage({
  currentUser,
  members,
  meetings,
  communityConfig,
  onAdminUpdateConfig,
  onToggleApplyMeeting,
  onNavigateTab,
  onOpenMeetingDetail,
  onShareMeeting
}) {
  const [copied, setCopied] = useState(false);
  const { isArmed, runArmed } = useArmedAction();

  // Notice accordion & leader editing states
  const isLeader = currentUser?.role === 'Leader';
  const noticeList =
    communityConfig?.notices && communityConfig.notices.length > 0
      ? communityConfig.notices
      : [
          {
            id: 'n-default',
            title: communityConfig?.noticeTitle || 'Healing78 커뮤니티 공지 및 운영 규칙',
            body: communityConfig?.noticeBody || '',
            date: '2026-11-01'
          }
        ];

  const [expandedNoticeId, setExpandedNoticeId] = useState(noticeList[0]?.id || null);
  const [editingNoticeId, setEditingNoticeId] = useState(null); // id of notice being edited, or 'new'
  const [noticeForm, setNoticeForm] = useState({ title: '', body: '' });

  const activeMembers = members.filter(
    (m) => !['OnLeave', 'Wanderer', 'Expelled', 'Withdrawn'].includes(m.role)
  );
  const sortedMembers = [...activeMembers].sort((a, b) => b.totalScore - a.totalScore);
  const myRank = currentUser
    ? sortedMembers.findIndex((m) => m.uid === currentUser.uid) + 1 || '-'
    : '-';
  const top5Members = sortedMembers.slice(0, 5);
  const upcomingMeetings = meetings.filter((m) => !isPastMeeting(m));
  const sortedUpcoming = [...upcomingMeetings].sort((a, b) =>
    String(a.dateOnly || a.date || '').localeCompare(
      String(b.dateOnly || b.date || '')
    )
  );

  const todayStr = getTodayDateString();
  const adminUser =
    isAdminRole(currentUser?.role) || isAdminUser(currentUser, communityConfig);

  const openLoungeMeetings = (meetings || [])
    .filter((m) => {
      // 1. 단순 일정 제외 (참석 응답 받는 벙 모임 대상)
      if (m.requestAttendance === false) return false;

      // 2. 권한 체크 (Q3-A): 운영진은 전체, 일반 회원은 본인이 참석/주최/총무인 모임만
      if (adminUser) return true;
      const applicants = m.applicants || [];
      const confirmed = m.confirmedParticipants || [];
      const isAttendee =
        applicants.includes(currentUser?.uid) ||
        confirmed.includes(currentUser?.uid) ||
        m.hostUid === currentUser?.uid ||
        m.treasurerUid === currentUser?.uid;
      return isAttendee;
    })
    .sort((a, b) =>
      String(b.dateOnly || b.date || '').localeCompare(
        String(a.dateOnly || a.date || '')
      )
    );

  const displayedLoungeMeetings = openLoungeMeetings.slice(0, 5);

  const myNickname = currentUser ? formatMemberNickname(currentUser) : '';
  const hostEligible = currentUser ? canCreateMeeting(currentUser) : false;

  const handleCopyNickname = async () => {
    if (!myNickname) return;
    try {
      await navigator.clipboard.writeText(myNickname);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleStartCreateNotice = () => {
    setNoticeForm({ title: '', body: '' });
    setEditingNoticeId('new');
  };

  const handleStartEditNotice = (n) => {
    setNoticeForm({ title: n.title, body: n.body });
    setEditingNoticeId(n.id);
  };

  const handleSaveNotice = (e) => {
    e.preventDefault();
    if (!noticeForm.title.trim()) return;

    let nextNotices = [...noticeList];
    const today = new Date().toISOString().slice(0, 10);

    if (editingNoticeId === 'new') {
      const newId = `notice-${Date.now()}`;
      nextNotices = [
        {
          id: newId,
          title: noticeForm.title.trim(),
          body: noticeForm.body.trim(),
          date: today
        },
        ...nextNotices
      ];
      setExpandedNoticeId(newId);
    } else {
      nextNotices = nextNotices.map((n) =>
        n.id === editingNoticeId
          ? { ...n, title: noticeForm.title.trim(), body: noticeForm.body.trim(), date: today }
          : n
      );
    }

    if (onAdminUpdateConfig) {
      onAdminUpdateConfig({
        ...communityConfig,
        notices: nextNotices,
        noticeTitle: nextNotices[0]?.title || '',
        noticeBody: nextNotices[0]?.body || ''
      });
    }

    setEditingNoticeId(null);
    setNoticeForm({ title: '', body: '' });
  };

  const handleDeleteNotice = (idToDelete) => {
    const nextNotices = noticeList.filter((n) => n.id !== idToDelete);
    if (onAdminUpdateConfig) {
      onAdminUpdateConfig({
        ...communityConfig,
        notices: nextNotices,
        noticeTitle: nextNotices[0]?.title || '',
        noticeBody: nextNotices[0]?.body || ''
      });
    }
  };

  return (
    <div className="list-container">
      {/* 1. Notice Accordion List (뱃지 제거, 방장 직접 편집 권한) */}
      <section className="list-section notice-accordion-section">
        <div className="section-title-row" style={{ marginBottom: '10px' }}>
          <h3 style={{ margin: 0 }}>공지사항</h3>
          {isLeader && editingNoticeId !== 'new' && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleStartCreateNotice}
            >
              + 공지 작성
            </button>
          )}
        </div>

        {/* Leader Notice Create / Edit Form */}
        {isLeader && editingNoticeId && (
          <form
            onSubmit={handleSaveNotice}
            className="stack-gap"
            style={{
              marginBottom: '16px',
              padding: '14px',
              background: 'var(--bg-subtle, #f8fafc)',
              borderRadius: '8px',
              border: '1px solid var(--border-color, #e2e8f0)'
            }}
          >
            <div style={{ fontWeight: 600, fontSize: '14px' }}>
              {editingNoticeId === 'new' ? '새 공지사항 등록' : '공지사항 수정'}
            </div>
            <div className="form-field">
              <input
                type="text"
                placeholder="공지 제목"
                required
                value={noticeForm.title}
                onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
              />
            </div>
            <div className="form-field">
              <textarea
                rows={4}
                placeholder="공지 내용..."
                required
                value={noticeForm.body}
                onChange={(e) => setNoticeForm({ ...noticeForm, body: e.target.value })}
              />
            </div>
            <div className="btn-row">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setEditingNoticeId(null)}
              >
                취소
              </button>
              <button type="submit" className="btn btn-primary btn-sm">
                저장
              </button>
            </div>
          </form>
        )}

        {/* Notice List Accordion */}
        <div className="divider-list">
          {noticeList.map((n) => {
            const isExpanded = expandedNoticeId === n.id;
            return (
              <div
                key={n.id}
                className="list-item-row"
                style={{
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  padding: '12px 0',
                  borderBottom: '1px solid var(--color-divider, #f1f5f9)'
                }}
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setExpandedNoticeId(isExpanded ? null : n.id)}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && setExpandedNoticeId(isExpanded ? null : n.id)
                  }
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <strong style={{ fontSize: '15px' }}>{n.title}</strong>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {n.date && (
                      <span className="muted-text" style={{ fontSize: '12px' }}>
                        {n.date}
                      </span>
                    )}
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted, #64748b)' }}>
                      {isExpanded ? '▲' : '▼'}
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div
                    style={{
                      marginTop: '10px',
                      padding: '10px 12px',
                      background: 'var(--bg-subtle, rgba(0,0,0,0.02))',
                      borderRadius: '6px',
                      lineHeight: 1.6,
                      fontSize: '14px',
                      whiteSpace: 'pre-line',
                      color: 'var(--color-text, #334155)'
                    }}
                  >
                    <div>{n.body}</div>

                    {isLeader && (
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          gap: '6px',
                          marginTop: '8px',
                          borderTop: '1px dashed var(--color-divider, #e2e8f0)',
                          paddingTop: '6px'
                        }}
                      >
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '11px', padding: '2px 8px' }}
                          onClick={() => handleStartEditNotice(n)}
                        >
                          수정
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '11px', padding: '2px 8px', color: '#ef4444' }}
                          onClick={() =>
                            runArmed(`delete-notice:${n.id}`, () =>
                              handleDeleteNotice(n.id)
                            )
                          }
                        >
                          {isArmed(`delete-notice:${n.id}`) ? '삭제 확인' : '삭제'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. My Profile, Score & Rank Summary (or Guest Quick Actions) */}
      {currentUser ? (
        <section className="list-section">
          <div className="summary-header">
            <div>
              <div className="my-nickname-row">
                <h2>{myNickname}</h2>
                <span
                  className="role-pill"
                  style={{
                    backgroundColor: ROLE_META[currentUser.role]?.badgeColor
                  }}
                >
                  {ROLE_META[currentUser.role]?.label}
                </span>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleCopyNickname}
            >
              {copied ? '복사 완료' : '닉네임 복사'}
            </button>
          </div>

          <div className="stats-grid">
            <div className="stat-box">
              <span className="stat-label">누적 점수</span>
              <strong className="stat-value">{currentUser.totalScore}점</strong>
              <span className="stat-sub">
                기본 {currentUser.baseScore}·원정 {currentUser.expeditionScore}
              </span>
            </div>
            <div className="stat-box">
              <span className="stat-label">전체 순위</span>
              <strong className="stat-value">{myRank}위</strong>
              <span className="stat-sub">총 {members.length}명</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">참석 횟수</span>
              <strong className="stat-value">{currentUser.attendanceCount}회</strong>
              <span className="stat-sub">
                {hostEligible ? '개설 가능' : '개설 대기'}
              </span>
            </div>
          </div>
        </section>
      ) : (
        <section className="list-section">
          <div className="login-sub-actions" style={{ marginTop: 0 }}>
            <button
              type="button"
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={() => onNavigateTab('login')}
            >
              로그인 · 신입 등록
            </button>
            <button
              type="button"
              className="btn btn-outline"
              style={{ flex: 1 }}
              onClick={() => onNavigateTab('nickname')}
            >
              신입 닉네임 생성기
            </button>
          </div>
        </section>
      )}

      {/* 1.5. Open Waiting Rooms (열린 벙대기실) - Only rendered when active open rooms exist */}
      {openLoungeMeetings.length > 0 && (
        <section className="list-section open-lounge-section">
          <div
            className="section-title-row"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <h2>벙대기실 ({openLoungeMeetings.length})</h2>
              <span className="sub-meta">최신 {displayedLoungeMeetings.length}개</span>
            </div>
            <button
              type="button"
              className="btn-link"
              style={{
                fontSize: '13px',
                fontWeight: 600,
                padding: '4px 6px',
                cursor: 'pointer'
              }}
              onClick={() =>
                onNavigateTab && onNavigateTab('profile', { subTab: 'report' })
              }
            >
              전체보기 &gt;
            </button>
          </div>

          <div className="divider-list lounge-divider-list">
            {displayedLoungeMeetings.map((m) => {
              const formattedLine = formatScheduleDetailText(m);
              const applicants = m.applicants || [];
              const confirmed = m.confirmedParticipants || [];
              const isAttendee =
                applicants.includes(currentUser?.uid) ||
                confirmed.includes(currentUser?.uid) ||
                m.hostUid === currentUser?.uid ||
                m.treasurerUid === currentUser?.uid;

              return (
                <div
                  key={m.id}
                  role="button"
                  tabIndex={0}
                  className="list-item-row open-lounge-item-row"
                  onClick={() =>
                    onOpenMeetingDetail
                      ? onOpenMeetingDetail(m.id, 'lounge')
                      : onNavigateTab('meetings', { id: m.id, subView: 'lounge' })
                  }
                  onKeyDown={(e) =>
                    e.key === 'Enter' &&
                    (onOpenMeetingDetail
                      ? onOpenMeetingDetail(m.id, 'lounge')
                      : onNavigateTab('meetings', { id: m.id, subView: 'lounge' }))
                  }
                >
                  <div className="schedule-bullet-indicator" aria-hidden="true">
                    <span className="schedule-bullet-square" />
                    <span className="schedule-bullet-emoji">📅</span>
                  </div>
                  <strong className="open-lounge-item-title">
                    {formattedLine}
                  </strong>
                  <div className="open-lounge-badge-group">
                    {m.status === 'settled' && (
                      <span
                        className="status-pill settled"
                        style={{ fontSize: '11px', padding: '2px 6px' }}
                      >
                        마감
                      </span>
                    )}
                    {isAttendee && (
                      <span className="lounge-attend-badge">참석 중</span>
                    )}
                    <span className="lounge-action-label" aria-hidden="true">
                      입장 &gt;
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 2. Upcoming Schedule List ("MM월 DD일 aaa 00시 00분 일정제목") */}
      <section className="list-section schedule-list-section">
        <div className="section-title-row">
          <h2>진행 예정 일정 ({sortedUpcoming.length})</h2>
          <button
            type="button"
            className="btn-link"
            onClick={() => onNavigateTab('meetings')}
          >
            전체보기 →
          </button>
        </div>

        {sortedUpcoming.length === 0 ? (
          <p className="muted-text">현재 예정된 일정이 없습니다.</p>
        ) : (
          <div className="divider-list">
            {sortedUpcoming.map((m) => {
              const formattedLine = formatScheduleDetailText(m);
              return (
                <div
                  key={m.id}
                  role="button"
                  tabIndex={0}
                  className="list-item-row"
                  onClick={() =>
                    onOpenMeetingDetail
                      ? onOpenMeetingDetail(m.id)
                      : onNavigateTab('meetings', { id: m.id })
                  }
                  onKeyDown={(e) =>
                    e.key === 'Enter' &&
                    (onOpenMeetingDetail
                      ? onOpenMeetingDetail(m.id)
                      : onNavigateTab('meetings', { id: m.id }))
                  }
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 6px',
                    gap: '10px'
                  }}
                >
                  <div className="schedule-bullet-indicator" aria-hidden="true">
                    <span className="schedule-bullet-square" />
                    <span className="schedule-bullet-emoji">📅</span>
                  </div>
                  <strong
                    style={{
                      fontSize: '14px',
                      color: 'var(--color-text-primary, #0f172a)',
                      wordBreak: 'keep-all',
                      lineHeight: 1.4,
                      flex: 1
                    }}
                  >
                    {formattedLine}
                  </strong>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. TOP 5 Ranking Preview */}
      <section className="list-section">
        <div className="section-title-row">
          <h2>실시간 활동 랭킹 TOP 5</h2>
          <button
            type="button"
            className="btn-link"
            onClick={() => onNavigateTab('ranking')}
          >
            전체 랭킹 →
          </button>
        </div>

        <div className="divider-list">
          {top5Members.map((member, index) => (
            <div
              key={member.uid}
              className={`ranking-row ${
                currentUser && member.uid === currentUser.uid
                  ? 'highlight-me'
                  : ''
              }`}
            >
              <div className="rank-left">
                <span className="rank-num">{index + 1}위</span>
                <strong>{formatMemberNickname(member)}</strong>
                <span
                  className="role-pill"
                  style={{
                    backgroundColor: ROLE_META[member.role]?.badgeColor
                  }}
                >
                  {ROLE_META[member.role]?.label}
                </span>
              </div>
              <div className="rank-right">
                <strong className="score-highlight">{member.totalScore}점</strong>
                <span className="sub-meta"> ({member.attendanceCount}회)</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

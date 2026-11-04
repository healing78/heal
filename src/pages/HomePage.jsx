import React, { useState } from 'react';
import {
  calculateMeetingScoreForMember,
  canCreateMeeting,
  formatMemberNickname,
  ROLE_META
} from '../core/communityRules';

export default function HomePage({
  currentUser,
  members,
  meetings,
  communityConfig,
  onToggleApplyMeeting,
  onNavigateTab,
  onOpenMeetingDetail,
  onShareMeeting
}) {
  const [copied, setCopied] = useState(false);

  const sortedMembers = [...members].sort((a, b) => b.totalScore - a.totalScore);
  const myRank = currentUser
    ? sortedMembers.findIndex((m) => m.uid === currentUser.uid) + 1 || '-'
    : '-';
  const top5Members = sortedMembers.slice(0, 5);
  const upcomingMeetings = meetings.filter((m) => m.status === 'open');
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

  return (
    <div className="list-container">
      {/* 1. Notice & Rules Section */}
      <section className="list-section notice-section">
        <div className="notice-header">
          <span className="platform-badge">공지 · 규칙</span>
          <h3>{communityConfig.noticeTitle}</h3>
        </div>
        <p className="notice-body">{communityConfig.noticeBody}</p>
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

      {/* 3. Upcoming Meetings Quick Attendance */}
      <section className="list-section">
        <div className="section-title-row">
          <h2>진행 예정 모임 ({upcomingMeetings.length})</h2>
          <button
            type="button"
            className="btn-link"
            onClick={() => onNavigateTab('meetings')}
          >
            전체보기 →
          </button>
        </div>

        {upcomingMeetings.length === 0 ? (
          <p className="muted-text">현재 모집 중인 모임이 없습니다.</p>
        ) : (
          <div className="divider-list">
            {upcomingMeetings.map((mtg) => {
              const isApplied = currentUser
                ? mtg.applicants.includes(currentUser.uid)
                : false;
              const scorePreview = currentUser
                ? calculateMeetingScoreForMember(currentUser, mtg.location)
                : { isExpedition: false, total: 1 };
              const hostMember = members.find((m) => m.uid === mtg.hostUid);

              return (
                <div key={mtg.id} className="list-item-row meeting-item">
                  <div className="meeting-top">
                    <div className="badge-group">
                      <span className="platform-badge">#{mtg.id}</span>
                      <span
                        className={`type-pill ${
                          mtg.type === 'Official' ? 'official' : 'casual'
                        }`}
                      >
                        {mtg.type === 'Official' ? '공식' : '자율'}
                      </span>
                      <span className="location-pill">{mtg.location}</span>
                      {scorePreview.isExpedition && (
                        <span className="expedition-pill">
                          {scorePreview.label}
                        </span>
                      )}
                    </div>
                    <strong className="concise-datetime">{mtg.date}</strong>
                  </div>

                  <div
                    role="button"
                    tabIndex={0}
                    className="concise-title-box"
                    onClick={() =>
                      onOpenMeetingDetail
                        ? onOpenMeetingDetail(mtg.id)
                        : onNavigateTab('meetings', { id: mtg.id })
                    }
                    onKeyDown={(e) =>
                      e.key === 'Enter' &&
                      (onOpenMeetingDetail
                        ? onOpenMeetingDetail(mtg.id)
                        : onNavigateTab('meetings', { id: mtg.id }))
                    }
                  >
                    <h3 className="concise-title">{mtg.title}</h3>
                  </div>
                  <p className="muted-text">
                    주최: {hostMember ? formatMemberNickname(hostMember) : mtg.hostUid}
                  </p>

                  <div className="meeting-footer">
                    <button
                      type="button"
                      className="btn-link"
                      onClick={() =>
                        onOpenMeetingDetail
                          ? onOpenMeetingDetail(mtg.id)
                          : onNavigateTab('meetings', { id: mtg.id })
                      }
                    >
                      모임 상세·정산 (#{mtg.id}) →
                    </button>
                    <div className="btn-row">
                      {onShareMeeting && (
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => onShareMeeting(mtg)}
                        >
                          공유
                        </button>
                      )}
                      <button
                        type="button"
                        className={`btn btn-sm ${
                          isApplied ? 'btn-outline' : 'btn-primary'
                        }`}
                        onClick={() => onToggleApplyMeeting(mtg.id)}
                      >
                        {isApplied
                          ? '신청 취소'
                          : currentUser
                            ? `참석 신청 (${(mtg.applicants || []).length}명)`
                            : '로그인 후 신청'}
                      </button>
                    </div>
                  </div>
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

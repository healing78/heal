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
  onNavigateTab
}) {
  const [copied, setCopied] = useState(false);

  const sortedMembers = [...members].sort((a, b) => b.totalScore - a.totalScore);
  const myRank =
    sortedMembers.findIndex((m) => m.uid === currentUser.uid) + 1 || '-';
  const top5Members = sortedMembers.slice(0, 5);
  const upcomingMeetings = meetings.filter((m) => m.status === 'open');
  const myNickname = formatMemberNickname(currentUser);
  const hostEligible = canCreateMeeting(currentUser);

  const handleCopyNickname = async () => {
    try {
      await navigator.clipboard.writeText(myNickname);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="stack-gap">
      {/* 1. Notice & Rules Banner */}
      <section className="card notice-banner">
        <div className="notice-header">
          <span className="platform-badge">공지 · 커뮤니티 규칙</span>
          <h3>{communityConfig.noticeTitle}</h3>
        </div>
        <p className="notice-body">{communityConfig.noticeBody}</p>
      </section>

      {/* 2. My Profile, Score & Rank Summary Card */}
      <section className="card">
        <div className="summary-header">
          <div>
            <span className="muted-text">내 규격 닉네임</span>
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
            className="btn btn-outline"
            onClick={handleCopyNickname}
          >
            {copied ? '복사 완료!' : '닉네임 복사'}
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-box">
            <span className="stat-label">누적 점수</span>
            <strong className="stat-value">{currentUser.totalScore}점</strong>
            <span className="stat-sub">
              기본 {currentUser.baseScore} · 원정 {currentUser.expeditionScore} · 이벤트{' '}
              {currentUser.eventScore}
            </span>
          </div>
          <div className="stat-box">
            <span className="stat-label">전체 순위</span>
            <strong className="stat-value">{myRank}위</strong>
            <span className="stat-sub">전체 {members.length}명 중</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">모임 참석 횟수</span>
            <strong className="stat-value">{currentUser.attendanceCount}회</strong>
            <span className="stat-sub">
              {hostEligible
                ? '벙 개설 가능 자격 보유'
                : '1회 이상 참석 시 벙 개설 가능'}
            </span>
          </div>
        </div>
      </section>

      {/* 3. Upcoming Meetings Quick Attendance */}
      <section className="card">
        <div className="section-title-row">
          <h2>다가오는 모임(벙) 빠른 참석</h2>
          <button
            type="button"
            className="btn-link"
            onClick={() => onNavigateTab('meetings')}
          >
            모임 전체보기 →
          </button>
        </div>

        {upcomingMeetings.length === 0 ? (
          <p className="muted-text">현재 모집 중인 모임이 없습니다.</p>
        ) : (
          <div className="stack-gap">
            {upcomingMeetings.map((mtg) => {
              const isApplied = mtg.applicants.includes(currentUser.uid);
              const scorePreview = calculateMeetingScoreForMember(
                currentUser,
                mtg.location
              );
              const hostMember = members.find((m) => m.uid === mtg.hostUid);

              return (
                <div key={mtg.id} className="sub-card meeting-item">
                  <div className="meeting-top">
                    <div className="badge-group">
                      <span
                        className={`type-pill ${
                          mtg.type === 'Official' ? 'official' : 'casual'
                        }`}
                      >
                        {mtg.type === 'Official' ? '공식 모임' : '자율/번개'}
                      </span>
                      <span className="location-pill">📍 {mtg.location}</span>
                      {scorePreview.isExpedition && (
                        <span className="expedition-pill">
                          🚀 원정 +2점 보너스 대상 (총 +{scorePreview.total}점)
                        </span>
                      )}
                    </div>
                    <span className="muted-text">{mtg.date}</span>
                  </div>

                  <h3>{mtg.title}</h3>
                  <p className="muted-text">
                    장소: {mtg.placeDetail} · 벙주:{' '}
                    {hostMember ? formatMemberNickname(hostMember) : mtg.hostUid}
                  </p>

                  <div className="meeting-footer">
                    <span className="applicant-count">
                      현재 참석 신청 <strong>{mtg.applicants.length}명</strong>
                    </span>
                    <button
                      type="button"
                      className={`btn ${isApplied ? 'btn-outline' : 'btn-primary'}`}
                      onClick={() => onToggleApplyMeeting(mtg.id)}
                    >
                      {isApplied ? '참석 신청 취소' : '빠른 참석 신청'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. TOP 5 Ranking Preview */}
      <section className="card">
        <div className="section-title-row">
          <h2>실시간 활동 점수 TOP 5</h2>
          <button
            type="button"
            className="btn-link"
            onClick={() => onNavigateTab('ranking')}
          >
            전체 랭킹 보기 →
          </button>
        </div>

        <div className="ranking-preview-list">
          {top5Members.map((member, index) => (
            <div
              key={member.uid}
              className={`ranking-row ${
                member.uid === currentUser.uid ? 'highlight-me' : ''
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
                <strong>{member.totalScore}점</strong>
                <span className="sub-meta"> (참석 {member.attendanceCount}회)</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

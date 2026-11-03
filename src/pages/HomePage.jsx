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
              <span className="stat-sub">총 {members.length}명 중</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">참석 횟수</span>
              <strong className="stat-value">{currentUser.attendanceCount}회</strong>
              <span className="stat-sub">
                {hostEligible ? '벙 개설 가능' : '1회 참석 시 개설'}
              </span>
            </div>
          </div>
        </section>
      ) : (
        <section className="list-section">
          <div className="summary-header">
            <div>
              <span className="platform-badge">방문자 열람 모드</span>
              <h2 style={{ marginTop: '4px' }}>Healing78에 오신 것을 환영합니다</h2>
              <p className="muted-text">
                신입 규격 닉네임을 바로 생성하거나 로그인하여 모임(벙)에 참석 신청하세요.
              </p>
            </div>
          </div>
          <div className="login-sub-actions">
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
          <h2>진행 예정 모임(벙) ({upcomingMeetings.length})</h2>
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
                      <span
                        className={`type-pill ${
                          mtg.type === 'Official' ? 'official' : 'casual'
                        }`}
                      >
                        {mtg.type === 'Official' ? '공식 모임' : '자율/번개'}
                      </span>
                      <span className="location-pill">{mtg.location}</span>
                      {scorePreview.isExpedition && (
                        <span className="expedition-pill">
                          원정 +2점 (총 +{scorePreview.total}점)
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
                      참석 신청 <strong>{mtg.applicants.length}명</strong>
                    </span>
                    <div className="btn-row">
                      {onShareMeeting && (
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => onShareMeeting(mtg)}
                        >
                          벙 공유
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
                            ? '빠른 참석 신청'
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

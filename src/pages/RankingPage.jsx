import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  formatMemberNickname,
  ROLE_META,
  calculateMeetingScoreForMember,
  getMemberTotalScore,
  getTierBadgeByScore,
  BUNG_TIER_BADGES
} from '../core/communityRules';

/**
 * Calculates next milestone tier badge & remaining score needed.
 */
function getNextMilestone(score = 0) {
  const pts = Math.max(0, Math.floor(Number(score) || 0));
  for (const tier of BUNG_TIER_BADGES) {
    if (tier.minScore > pts) {
      return {
        nextBadge: tier.badge,
        nextLabel: tier.label,
        targetScore: tier.minScore,
        pointsLeft: tier.minScore - pts
      };
    }
  }
  const nextTarget = Math.floor(pts / 100 + 1) * 100;
  return {
    nextBadge: '⭐️',
    nextLabel: `${nextTarget}점 달성`,
    targetScore: nextTarget,
    pointsLeft: nextTarget - pts
  };
}

export default function RankingPage({
  currentUser,
  members = [],
  meetings = [],
  scoreLogs = [],
  onSelectMember,
  onOpenMeetingDetail
}) {
  const [subTab, setSubTab] = useState('total'); // 'total' | 'monthly' | 'history'
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('ALL');
  const [historyPeriod, setHistoryPeriod] = useState('all'); // 'all' | 'monthly' | 'yearly'
  const [displayLimit, setDisplayLimit] = useState(30);

  const sentinelRef = useRef(null);

  // 외출자(OnLeave), 방랑자(Wanderer), 강퇴자(Expelled), 탈퇴자(Withdrawn) 제외
  const activeMembers = useMemo(() => {
    return members.filter(
      (m) => !['OnLeave', 'Wanderer', 'Expelled', 'Withdrawn'].includes(m.role)
    );
  }, [members]);

  // 이번 달 벙점수 1점 이상 획득한 활동 회원
  const monthlyActiveCount = useMemo(() => {
    return activeMembers.filter((m) => (m.monthlyScore || 0) > 0).length;
  }, [activeMembers]);

  const cities = useMemo(() => {
    return ['ALL', ...new Set(activeMembers.map((m) => m.city).filter(Boolean))];
  }, [activeMembers]);

  // Reset infinite scroll limit when filter or tab changes
  useEffect(() => {
    setDisplayLimit(30);
  }, [subTab, searchQuery, cityFilter]);

  // Filtered & Sorted Members for Ranking
  const filteredMembers = useMemo(() => {
    return activeMembers
      .filter((m) => {
        // 이번 달 랭킹 탭에서는 이번 달 벙점수가 0점인 회원 제외
        if (subTab === 'monthly' && (m.monthlyScore || 0) <= 0) {
          return false;
        }

        const nickname = formatMemberNickname(m);
        const matchesQuery =
          !searchQuery.trim() ||
          nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (m.realName && m.realName.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCity = cityFilter === 'ALL' || m.city === cityFilter;
        return matchesQuery && matchesCity;
      })
      .sort((a, b) => {
        if (subTab === 'monthly') {
          const diff = (b.monthlyScore || 0) - (a.monthlyScore || 0);
          return diff !== 0 ? diff : getMemberTotalScore(b) - getMemberTotalScore(a);
        }
        return getMemberTotalScore(b) - getMemberTotalScore(a);
      });
  }, [activeMembers, subTab, searchQuery, cityFilter]);

  // Slice displayed items for infinite scroll
  const displayedMembers = useMemo(() => {
    return filteredMembers.slice(0, displayLimit);
  }, [filteredMembers, displayLimit]);

  // Infinite Scroll Observer
  useEffect(() => {
    if (subTab === 'history') return;
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDisplayLimit((prev) => {
            if (prev < filteredMembers.length) {
              return prev + 25;
            }
            return prev;
          });
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [subTab, filteredMembers.length]);

  // Current User's Rank in the filtered list
  const myRankIndex = useMemo(() => {
    if (!currentUser) return -1;
    return filteredMembers.findIndex((m) => m.uid === currentUser.uid);
  }, [filteredMembers, currentUser]);

  // Jump to my rank row
  const handleJumpToMyRank = () => {
    if (myRankIndex === -1 || !currentUser) return;

    if (myRankIndex >= displayLimit) {
      setDisplayLimit(Math.max(displayLimit, myRankIndex + 15));
    }

    setTimeout(() => {
      const el = document.getElementById(`rank-row-${currentUser.uid}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 60);
  };

  // Reconstruct Full Past Bung Score History for Current User
  const fullScoreHistory = useMemo(() => {
    if (!currentUser) return [];

    const historyItems = [];
    const recordedMeetingIds = new Set();

    // 1. Gather all attended meetings
    meetings.forEach((mtg) => {
      const uids =
        mtg.confirmedParticipants ||
        mtg.applicants ||
        mtg.attendeeUids ||
        mtg.rounds?.[0]?.participants ||
        [];
      const isAttended =
        uids.includes(currentUser.uid) ||
        (mtg.attendeeNames && mtg.attendeeNames.includes(currentUser.realName)) ||
        (mtg.attendees &&
          mtg.attendees.some((a) =>
            typeof a === 'string' ? a === currentUser.realName : a?.name === currentUser.realName
          ));

      if (isAttended) {
        recordedMeetingIds.add(String(mtg.id));
        const scoreCalc = calculateMeetingScoreForMember(currentUser, mtg.location);
        const isHost =
          mtg.creatorUid === currentUser.uid ||
          mtg.hostUid === currentUser.uid ||
          mtg.creatorName === currentUser.realName;

        const dateStr = String(mtg.dateOnly || mtg.date || mtg.createdAt || '');

        historyItems.push({
          id: `mtg-${mtg.id}`,
          meetingId: mtg.id,
          title: mtg.title || '벙 모임',
          location: mtg.location || '모임 장소',
          date: dateStr,
          baseDelta: scoreCalc.base,
          expeditionDelta: scoreCalc.expedition,
          eventDelta: 0,
          totalDelta: scoreCalc.total,
          isExpedition: scoreCalc.isExpedition,
          isOverseas: scoreCalc.isOverseas,
          isHost,
          label: scoreCalc.label
        });
      }
    });

    // 2. Include standalone scoreLogs (manual bonus, penalty, etc.)
    scoreLogs
      .filter((log) => log.uid === currentUser.uid)
      .forEach((log) => {
        if (!log.meetingId || !recordedMeetingIds.has(String(log.meetingId))) {
          historyItems.push({
            id: `log-${log.id}`,
            meetingId: log.meetingId,
            title: log.title || '벙점수 변동',
            location: '',
            date: String(log.date || ''),
            baseDelta: log.baseDelta || 0,
            expeditionDelta: log.expeditionDelta || 0,
            eventDelta: log.eventDelta || 0,
            totalDelta: log.totalDelta || (log.baseDelta || 0) + (log.expeditionDelta || 0) + (log.eventDelta || 0),
            isExpedition: (log.expeditionDelta || 0) > 0,
            isOverseas: false,
            isHost: false,
            label: '점수 로그'
          });
        }
      });

    return historyItems.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  }, [currentUser, meetings, scoreLogs]);

  // Filter Score History by Period
  const filteredScoreHistory = useMemo(() => {
    if (historyPeriod === 'all') return fullScoreHistory;

    const now = new Date();
    const curYearStr = String(now.getFullYear());
    const curYearShort = curYearStr.slice(2);
    const curMonthStr = String(now.getMonth() + 1).padStart(2, '0');
    const curYmDash = `${curYearStr}-${curMonthStr}`;
    const curYmShort = `${curYearShort}${curMonthStr}`;

    return fullScoreHistory.filter((item) => {
      const d = item.date;
      if (historyPeriod === 'monthly') {
        return d.startsWith(curYmDash) || d.startsWith(curYmShort);
      }
      if (historyPeriod === 'yearly') {
        return d.startsWith(curYearStr) || d.startsWith(curYearShort);
      }
      return true;
    });
  }, [fullScoreHistory, historyPeriod]);

  // Milestone Progress
  const myTotalScore = currentUser ? getMemberTotalScore(currentUser) : 0;
  const myTierBadge = currentUser ? getTierBadgeByScore(myTotalScore) : '';
  const milestone = currentUser ? getNextMilestone(myTotalScore) : null;

  return (
    <div className="list-container">
      <section className="list-section">
        <h2>활동 랭킹</h2>

        <div className="subtab-bar">
          <button
            type="button"
            className={`subtab-btn ${subTab === 'total' ? 'active' : ''}`}
            onClick={() => setSubTab('total')}
          >
            전체 누적 랭킹 ({activeMembers.length})
          </button>
          <button
            type="button"
            className={`subtab-btn ${subTab === 'monthly' ? 'active' : ''}`}
            onClick={() => setSubTab('monthly')}
          >
            이번 달 랭킹 ({monthlyActiveCount}명)
          </button>
          {currentUser && (
            <button
              type="button"
              className={`subtab-btn ${subTab === 'history' ? 'active' : ''}`}
              onClick={() => setSubTab('history')}
            >
              내 벙점수 내역 ({fullScoreHistory.length})
            </button>
          )}
        </div>

        {subTab !== 'history' && (
          <div className="filter-bar">
            <input
              type="text"
              placeholder="친구 이름 또는 닉네임 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
            >
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c === 'ALL' ? '전체 지역' : `${c} 지역`}
                </option>
              ))}
            </select>
          </div>
        )}
      </section>

      {/* 내 랭킹 고정 카드 & 바로가기 점프 (전체/이번달 탭) */}
      {subTab !== 'history' && currentUser && myRankIndex !== -1 && (
        <section className="list-section" style={{ paddingBottom: 0 }}>
          <div className="ranking-my-top-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="my-rank-title">
                  {currentUser.realName || currentUser.nickname}님의{' '}
                  {subTab === 'monthly' ? '이번 달' : '누적'} 순위
                </div>
                <div className="my-rank-stats">
                  <span className="my-rank-number">{myRankIndex + 1}위</span>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    / 총 {filteredMembers.length}명
                  </span>
                  <span className="my-rank-score" style={{ marginLeft: '6px' }}>
                    ({subTab === 'monthly' ? currentUser.monthlyScore || 0 : myTotalScore}점)
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="btn-jump-me"
                onClick={handleJumpToMyRank}
                title="리스트에서 내 위치로 바로 스크롤 이동합니다"
              >
                내 위치 🎯
              </button>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          내 벙점수 탭 (과거 모임 연동 전체 히스토리 & 마일스톤 대시보드)
          ========================================================================= */}
      {subTab === 'history' && currentUser ? (
        <section className="list-section">
          {/* 상단 벙점수 대시보드 */}
          <div className="score-dashboard-grid">
            <div className="score-dash-card primary">
              <span className="dash-label">누적 벙점수</span>
              <span className="dash-value">
                {myTotalScore}점 {myTierBadge && <span style={{ fontSize: '16px' }}>{myTierBadge}</span>}
              </span>
            </div>
            <div className="score-dash-card">
              <span className="dash-label">이번 달 벙점수</span>
              <span className="dash-value">{currentUser.monthlyScore || 0}점</span>
            </div>
            <div className="score-dash-card">
              <span className="dash-label">점수 구성</span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text)' }}>
                기본 {currentUser.baseScore || 0} · 원정 {currentUser.expeditionScore || 0} · 이벤트 {currentUser.eventScore || 0}
              </span>
            </div>
            <div className="score-dash-card">
              <span className="dash-label">활동 횟수</span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text)' }}>
                참석 {currentUser.attendanceCount || fullScoreHistory.length}회 · 주최 {currentUser.hostCount || 0}회
              </span>
            </div>
          </div>

          {/* 다음 마일스톤 뱃지 안내 배너 */}
          {milestone && (
            <div className="score-milestone-banner">
              <div>
                다음 등급 <strong>{milestone.nextBadge} {milestone.nextLabel}</strong>까지{' '}
                <strong style={{ color: 'var(--color-primary)' }}>{milestone.pointsLeft}점</strong> 남았습니다!
              </div>
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                목표 {milestone.targetScore}점
              </span>
            </div>
          )}

          {/* 기간 필터 */}
          <div className="period-filter-bar">
            <button
              type="button"
              className={`period-filter-btn ${historyPeriod === 'all' ? 'active' : ''}`}
              onClick={() => setHistoryPeriod('all')}
            >
              전체 누적 ({fullScoreHistory.length}건)
            </button>
            <button
              type="button"
              className={`period-filter-btn ${historyPeriod === 'monthly' ? 'active' : ''}`}
              onClick={() => setHistoryPeriod('monthly')}
            >
              이번 달
            </button>
            <button
              type="button"
              className={`period-filter-btn ${historyPeriod === 'yearly' ? 'active' : ''}`}
              onClick={() => setHistoryPeriod('yearly')}
            >
              올해
            </button>
          </div>

          {filteredScoreHistory.length === 0 ? (
            <p className="muted-text" style={{ marginTop: '8px' }}>
              해당 기간에 획득한 벙점수 내역이 없습니다.
            </p>
          ) : (
            <div className="divider-list" style={{ marginTop: '8px' }}>
              {filteredScoreHistory.map((item) => (
                <div
                  key={item.id}
                  className="list-item-row score-log-item"
                  style={{
                    cursor: item.meetingId && onOpenMeetingDetail ? 'pointer' : 'default'
                  }}
                  onClick={() => {
                    if (item.meetingId && onOpenMeetingDetail) {
                      onOpenMeetingDetail(item.meetingId);
                    }
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <strong>{item.title}</strong>
                      {item.isHost && (
                        <span
                          className="role-pill"
                          style={{ backgroundColor: 'var(--color-primary, #0f172a)' }}
                        >
                          주최
                        </span>
                      )}
                      {item.isExpedition && (
                        <span
                          className="role-pill"
                          style={{ backgroundColor: '#0284c7' }}
                        >
                          {item.isOverseas ? '해외원정' : '원정'}
                        </span>
                      )}
                    </div>
                    <div className="sub-meta">
                      {item.date && `${item.date} · `}
                      {item.location && `${item.location} · `}
                      {item.label}
                    </div>
                  </div>
                  <span
                    className={`score-delta ${
                      item.totalDelta >= 0 ? 'positive' : 'negative'
                    }`}
                  >
                    {item.totalDelta >= 0
                      ? `+${item.totalDelta}점`
                      : `${item.totalDelta}점`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : (
        /* =========================================================================
            전체 / 이번달 랭킹 리스트 (무한 스크롤 & 친구 프로필 이동)
            ========================================================================= */
        <section className="list-section">
          {displayedMembers.length === 0 ? (
            <p className="muted-text" style={{ padding: '24px 0', textAlign: 'center' }}>
              {subTab === 'monthly'
                ? '이번 달 아직 벙점수를 획득한 회원이 없습니다.'
                : '조건에 해당하는 회원이 없습니다.'}
            </p>
          ) : (
            <div className="divider-list">
              {displayedMembers.map((member, index) => {
                const displayScore =
                  subTab === 'monthly'
                    ? member.monthlyScore || 0
                    : getMemberTotalScore(member);

                const isMe = currentUser && member.uid === currentUser.uid;

                return (
                  <div
                    key={member.uid}
                    id={`rank-row-${member.uid}`}
                    className={`ranking-row ${isMe ? 'highlight-me' : ''}`}
                    onClick={() => {
                      if (onSelectMember) {
                        onSelectMember(
                          member.uid,
                          filteredMembers.map((m) => m.uid)
                        );
                      }
                    }}
                  >
                    <div className="rank-left">
                      <span className="rank-num">
                        {index === 0 && '🥇 '}
                        {index === 1 && '🥈 '}
                        {index === 2 && '🥉 '}
                        {index + 1}위
                      </span>
                      <div>
                        <div className="rank-name-line">
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
                        <div className="sub-meta">
                          참석 {member.attendanceCount || 0}회 · 기본 {member.baseScore || 0}점 · 원정{' '}
                          {member.expeditionScore || 0}점 · 이벤트 {member.eventScore || 0}점
                        </div>
                      </div>
                    </div>
                    <div className="rank-right">
                      <strong className="score-highlight">{displayScore}점</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 무한 스크롤 감지 영역 (Sentinel) */}
          {displayedMembers.length < filteredMembers.length && (
            <div ref={sentinelRef} className="infinite-scroll-sentinel">
              더 불러오는 중... ({displayedMembers.length} / {filteredMembers.length}명)
            </div>
          )}
        </section>
      )}
    </div>
  );
}

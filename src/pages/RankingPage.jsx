import React, { useState } from 'react';
import { formatMemberNickname, ROLE_META } from '../core/communityRules';

export default function RankingPage({ currentUser, members, scoreLogs }) {
  const [subTab, setSubTab] = useState('total'); // 'total' | 'monthly' | 'history'
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('ALL');

  // 외출자(OnLeave), 방랑자(Wanderer), 강퇴자(Expelled), 탈퇴자(Withdrawn) 제외
  const activeMembers = members.filter(
    (m) => !['OnLeave', 'Wanderer', 'Expelled', 'Withdrawn'].includes(m.role)
  );

  const cities = ['ALL', ...new Set(activeMembers.map((m) => m.city).filter(Boolean))];

  const filteredMembers = activeMembers
    .filter((m) => {
      const nickname = formatMemberNickname(m);
      const matchesQuery =
        !searchQuery.trim() ||
        nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.realName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCity = cityFilter === 'ALL' || m.city === cityFilter;
      return matchesQuery && matchesCity;
    })
    .sort((a, b) => {
      if (subTab === 'monthly') {
        return (b.monthlyScore || 0) - (a.monthlyScore || 0);
      }
      return b.totalScore - a.totalScore;
    });

  const myLogs = currentUser
    ? scoreLogs.filter((log) => log.uid === currentUser.uid)
    : [];

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
            이번 달 랭킹
          </button>
          {currentUser && (
            <button
              type="button"
              className={`subtab-btn ${subTab === 'history' ? 'active' : ''}`}
              onClick={() => setSubTab('history')}
            >
              내 점수 내역 ({myLogs.length})
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

      {subTab === 'history' && currentUser ? (
        <section className="list-section">
          <h3>{formatMemberNickname(currentUser)}님의 점수 내역</h3>
          {myLogs.length === 0 ? (
            <p className="muted-text" style={{ marginTop: '8px' }}>
              아직 적립된 점수 내역이 없습니다.
            </p>
          ) : (
            <div className="divider-list" style={{ marginTop: '8px' }}>
              {myLogs.map((log) => (
                <div key={log.id} className="list-item-row score-log-item">
                  <div>
                    <strong>{log.title}</strong>
                    <div className="sub-meta">
                      {log.date} · 기본{' '}
                      {log.baseDelta >= 0 ? `+${log.baseDelta}` : log.baseDelta} · 원정{' '}
                      {log.expeditionDelta >= 0
                        ? `+${log.expeditionDelta}`
                        : log.expeditionDelta}{' '}
                      · 이벤트{' '}
                      {log.eventDelta >= 0
                        ? `+${log.eventDelta}`
                        : log.eventDelta}
                    </div>
                  </div>
                  <span
                    className={`score-delta ${
                      log.totalDelta >= 0 ? 'positive' : 'negative'
                    }`}
                  >
                    {log.totalDelta >= 0
                      ? `+${log.totalDelta}점`
                      : `${log.totalDelta}점`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className="list-section">
          <div className="divider-list">
            {filteredMembers.map((member, index) => {
              const displayScore =
                subTab === 'monthly'
                  ? member.monthlyScore || 0
                  : member.totalScore;

              return (
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
                        참석 {member.attendanceCount}회 · 기본 {member.baseScore}점 · 원정{' '}
                        {member.expeditionScore}점 · 이벤트 {member.eventScore}점
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
        </section>
      )}
    </div>
  );
}

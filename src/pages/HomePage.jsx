import React, { useState } from 'react';
import {
  canCreateMeeting,
  formatMemberNickname,
  ROLE_META
} from '../core/communityRules';
import { isPastMeeting } from './MeetingsPage';

const WEEKDAY_SHORT_KO = ['일', '월', '화', '수', '목', '금', '토'];

function formatKoreanAmPm(timeStr) {
  if (!timeStr) return '';
  const parts = String(timeStr).split(':');
  const h = Number(parts[0]) || 0;
  const m = Number(parts[1]) || 0;
  const mm = String(m).padStart(2, '0');
  if (h === 0) return `오전 12:${mm}`;
  if (h < 12) return `오전 ${h}:${mm}`;
  if (h === 12) return `오후 12:${mm}`;
  return `오후 ${h - 12}:${mm}`;
}

function addHoursToTime(timeStr, hoursToAdd = 4) {
  const match = String(timeStr || '19:00').match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return '23:00';
  const nextHour = Math.min(23, Number(match[1]) + hoursToAdd);
  return `${String(nextHour).padStart(2, '0')}:${match[2]}`;
}

function buildScheduleMeta(mtg) {
  const rawDate =
    mtg.dateOnly || String(mtg.date || '').slice(0, 10) || '2026-11-04';
  const parts = rawDate.split('-');
  const year = Number(parts[0]) || 2026;
  const month = Number(parts[1]) || 11;
  const day = Number(parts[2]) || 4;

  const dateObj = new Date(year, month - 1, day);
  const weekday = WEEKDAY_SHORT_KO[dateObj.getDay()] || '';

  let timeRangeText = '하루 종일';
  if (!mtg.allDay) {
    const startTime =
      mtg.startTime || String(mtg.date || '').slice(11, 16) || '19:00';
    const endTime = mtg.endTime || addHoursToTime(startTime, 4);
    timeRangeText = `${formatKoreanAmPm(startTime)} - ${formatKoreanAmPm(endTime)}`;
  }

  const firstRoundPlace = mtg.rounds?.[0]?.placeName || mtg.placeDetail || '';
  const baseLocation = (mtg.location || '').trim();
  let locationText = baseLocation;
  if (firstRoundPlace) {
    locationText = firstRoundPlace.startsWith(baseLocation)
      ? firstRoundPlace
      : `${baseLocation} ${firstRoundPlace}`.trim();
  }

  return {
    monthKey: `${year}-${String(month).padStart(2, '0')}`,
    monthLabel: `${year}년 ${month}월`,
    dateKey: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    weekday,
    day,
    timeRangeText,
    locationText
  };
}

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
  const upcomingMeetings = meetings.filter((m) => !isPastMeeting(m));
  const sortedUpcoming = [...upcomingMeetings].sort((a, b) =>
    String(a.dateOnly || a.date || '').localeCompare(
      String(b.dateOnly || b.date || '')
    )
  );

  const monthGroups = [];
  for (const mtg of sortedUpcoming) {
    const meta = buildScheduleMeta(mtg);
    let group = monthGroups.find((g) => g.monthKey === meta.monthKey);
    if (!group) {
      group = {
        monthKey: meta.monthKey,
        monthLabel: meta.monthLabel,
        items: []
      };
      monthGroups.push(group);
    }
    group.items.push({ mtg, meta });
  }
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

      {/* 3. Upcoming Schedule Agenda List (Matches MeetingsPage Style) */}
      <section className="list-section schedule-list-section">
        <div className="section-title-row">
          <h2>진행 예정 일정 ({upcomingMeetings.length})</h2>
          <button
            type="button"
            className="btn-link"
            onClick={() => onNavigateTab('meetings')}
          >
            전체보기 →
          </button>
        </div>

        {monthGroups.length === 0 ? (
          <p className="muted-text">현재 예정된 일정이 없습니다.</p>
        ) : (
          <div className="schedule-month-list">
            {monthGroups.map((group) => (
              <div key={group.monthKey} className="schedule-month-group">
                <div className="schedule-month-header">{group.monthLabel}</div>

                <div className="schedule-items-wrap">
                  {group.items.map(({ mtg, meta }, idx) => {
                    const prevMeta = group.items[idx - 1]?.meta;
                    const nextMeta = group.items[idx + 1]?.meta;
                    const isSameDateAsPrev =
                      prevMeta && prevMeta.dateKey === meta.dateKey;
                    const isSameDateAsNext =
                      nextMeta && nextMeta.dateKey === meta.dateKey;

                    return (
                      <article
                        key={mtg.id}
                        role="button"
                        tabIndex={0}
                        className={`schedule-row ${
                          isSameDateAsNext ? 'same-date-next' : ''
                        }`}
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
                        <div className="schedule-date-col">
                          {!isSameDateAsPrev && (
                            <>
                              <span className="schedule-weekday">
                                {meta.weekday}
                              </span>
                              <span className="schedule-day-num">
                                {meta.day}
                              </span>
                            </>
                          )}
                        </div>

                        <div className="schedule-bar-col" aria-hidden="true">
                          <span className="schedule-bar" />
                        </div>

                        <div className="schedule-info-col">
                          <h3 className="schedule-title">{mtg.title}</h3>
                          <div className="schedule-time">
                            {meta.timeRangeText}
                          </div>
                          {meta.locationText && (
                            <div className="schedule-location">
                              {meta.locationText}
                            </div>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            ))}
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

import React, { useState } from 'react';
import {
  canCreateMeeting,
  formatMemberNickname,
  isAdminRole,
  REGION_GROUPS
} from '../core/communityRules';
import MeetingDetailPage from './MeetingDetailPage';

const WEEKDAY_KO = ['일', '월', '화', '수', '목', '금', '토'];

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
  const match = String(timeStr || '19:00').trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return '23:00';
  const nextHour = Math.min(23, Number(match[1]) + hoursToAdd);
  return `${String(nextHour).padStart(2, '0')}:${match[2]}`;
}

function buildScheduleMeta(mtg) {
  const rawDate = mtg.dateOnly || String(mtg.date || '').slice(0, 10) || '2026-11-01';
  const parts = rawDate.split('-');
  const year = Number(parts[0]) || 2026;
  const month = Number(parts[1]) || 11;
  const day = Number(parts[2]) || 1;

  const dateObj = new Date(year, month - 1, day);
  const weekday = WEEKDAY_KO[dateObj.getDay()] || '';

  const startTime =
    mtg.startTime || String(mtg.date || '').slice(11, 16) || '19:00';
  const endTime = mtg.endTime || addHoursToTime(startTime, 4);
  const timeRangeText = `${formatKoreanAmPm(startTime)} - ${formatKoreanAmPm(endTime)}`;

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

export default function MeetingsPage({
  currentUser,
  members,
  meetings,
  selectedMeetingId,
  onSelectMeetingId,
  onShareMeeting,
  onToggleApplyMeeting,
  onCreateMeeting,
  onUpdateMeeting,
  onUpdateMemberProfile,
  onSettleMeeting,
  onNavigateTab
}) {
  const [subTab, setSubTab] = useState('open'); // 'open' | 'settled' | 'mine'
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createWarning, setCreateWarning] = useState('');

  const [newMeeting, setNewMeeting] = useState({
    title: '',
    dateOnly: '2026-11-15',
    startTime: '19:00',
    endTime: '23:00',
    location: currentUser?.city || '서울',
    treasurerUid: currentUser?.uid || '',
    type: 'Casual',
    description: '',
    rounds: [{ id: 'r-1', placeName: '', mapUrl: '' }]
  });

  const adminUser = currentUser ? isAdminRole(currentUser.role) : false;
  const hostEligible = currentUser ? canCreateMeeting(currentUser) : false;

  // If a specific meeting ID is selected (/meetings/26110701), render its dedicated page
  const activeMeeting = selectedMeetingId
    ? meetings.find((m) => String(m.id) === String(selectedMeetingId))
    : null;

  if (activeMeeting) {
    return (
      <MeetingDetailPage
        meeting={activeMeeting}
        currentUser={currentUser}
        members={members}
        onBackToList={() => onSelectMeetingId(null)}
        onShareMeeting={onShareMeeting}
        onToggleApplyMeeting={onToggleApplyMeeting}
        onUpdateMeeting={onUpdateMeeting}
        onUpdateMemberProfile={onUpdateMemberProfile}
        onSettleMeeting={onSettleMeeting}
        onNavigateTab={onNavigateTab}
      />
    );
  }

  const handleOpenCreateModal = () => {
    if (!currentUser) {
      if (onNavigateTab) onNavigateTab('login');
      return;
    }
    if (!hostEligible) {
      setCreateWarning(
        `모임 개설은 최소 1회 이상 모임에 참석한 회원만 가능합니다. (현재 내 참석 횟수: ${currentUser.attendanceCount}회)`
      );
      setShowCreateForm(false);
      return;
    }
    setCreateWarning('');
    setShowCreateForm((prev) => !prev);
  };

  const handleAddCreateRound = () => {
    setNewMeeting((prev) => ({
      ...prev,
      rounds: [
        ...prev.rounds,
        { id: `r-${prev.rounds.length + 1}`, placeName: '', mapUrl: '' }
      ]
    }));
  };

  const handleRemoveCreateRound = (idx) => {
    setNewMeeting((prev) => ({
      ...prev,
      rounds: prev.rounds.filter((_, i) => i !== idx)
    }));
  };

  const handleCreateRoundChange = (idx, patch) => {
    setNewMeeting((prev) => ({
      ...prev,
      rounds: prev.rounds.map((r, i) => (i === idx ? { ...r, ...patch } : r))
    }));
  };

  const handleSubmitNewMeeting = async (e) => {
    e.preventDefault();
    if (!newMeeting.title.trim() || !newMeeting.location.trim()) return;
    const created = await onCreateMeeting({
      ...newMeeting,
      treasurerUid: newMeeting.treasurerUid || currentUser.uid,
      type: adminUser ? newMeeting.type : 'Casual'
    });
    setNewMeeting({
      title: '',
      dateOnly: '2026-11-15',
      startTime: '19:00',
      endTime: '23:00',
      location: currentUser?.city || '서울',
      treasurerUid: currentUser?.uid || '',
      type: 'Casual',
      description: '',
      rounds: [{ id: 'r-1', placeName: '', mapUrl: '' }]
    });
    setShowCreateForm(false);
    if (created?.id && onSelectMeetingId) {
      onSelectMeetingId(created.id);
    }
  };

  const filteredMeetings = meetings.filter((m) => {
    if (subTab === 'open') return m.status === 'open';
    if (subTab === 'settled') return m.status === 'settled';
    if (subTab === 'mine') {
      if (!currentUser) return false;
      return (
        m.hostUid === currentUser.uid ||
        m.treasurerUid === currentUser.uid ||
        (m.applicants || []).includes(currentUser.uid) ||
        (m.confirmedParticipants || []).includes(currentUser.uid)
      );
    }
    return true;
  });

  // Sort chronologically and group by Year-Month (e.g., "2026년 10월", "2026년 11월")
  const sortedMeetings = [...filteredMeetings].sort((a, b) =>
    String(a.date || a.dateOnly || '').localeCompare(
      String(b.date || b.dateOnly || '')
    )
  );

  const monthGroups = [];
  for (const mtg of sortedMeetings) {
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

  return (
    <div className="list-container">
      {/* Page Header & Create Button */}
      <section className="list-section">
        <div className="section-title-row">
          <h2>모임 목록</h2>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleOpenCreateModal}
          >
            {showCreateForm ? '닫기' : '+ 모임 개설'}
          </button>
        </div>

        {createWarning && (
          <div className="warning-banner" role="alert">
            ⚠️ {createWarning}
          </div>
        )}

        {/* Sub-tabs */}
        <div className="subtab-bar">
          <button
            type="button"
            className={`subtab-btn ${subTab === 'open' ? 'active' : ''}`}
            onClick={() => setSubTab('open')}
          >
            진행 예정 ({meetings.filter((m) => m.status === 'open').length})
          </button>
          <button
            type="button"
            className={`subtab-btn ${subTab === 'settled' ? 'active' : ''}`}
            onClick={() => setSubTab('settled')}
          >
            정산 완료 ({meetings.filter((m) => m.status === 'settled').length})
          </button>
          {currentUser && (
            <button
              type="button"
              className={`subtab-btn ${subTab === 'mine' ? 'active' : ''}`}
              onClick={() => setSubTab('mine')}
            >
              내 모임
            </button>
          )}
        </div>
      </section>

      {/* Create Meeting Form */}
      {showCreateForm && (
        <section className="list-section highlight-section">
          <h3>새 모임 개설</h3>
          <form
            onSubmit={handleSubmitNewMeeting}
            className="stack-gap"
            style={{ marginTop: '12px' }}
          >
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="mtg-title">모임 제목</label>
                <input
                  id="mtg-title"
                  type="text"
                  placeholder="모임 제목 입력"
                  required
                  value={newMeeting.title}
                  onChange={(e) =>
                    setNewMeeting({ ...newMeeting, title: e.target.value })
                  }
                />
              </div>

              <div className="form-field">
                <label htmlFor="mtg-loc">모임 지역</label>
                <input
                  id="mtg-loc"
                  type="text"
                  list="create-region-list"
                  placeholder="서울, 경기, 강원, 대전, 광주, 부산, 제주, 해외"
                  required
                  value={newMeeting.location}
                  onChange={(e) =>
                    setNewMeeting({ ...newMeeting, location: e.target.value })
                  }
                />
                <datalist id="create-region-list">
                  {REGION_GROUPS.map((g) => (
                    <option key={g.id} value={g.keywords[0]}>
                      {g.name}
                    </option>
                  ))}
                </datalist>
              </div>

              <div className="form-field">
                <label htmlFor="mtg-date-only">날짜</label>
                <input
                  id="mtg-date-only"
                  type="date"
                  required
                  value={newMeeting.dateOnly}
                  onChange={(e) =>
                    setNewMeeting({ ...newMeeting, dateOnly: e.target.value })
                  }
                />
              </div>

              <div className="form-field">
                <label htmlFor="mtg-start-time">시작 시간</label>
                <input
                  id="mtg-start-time"
                  type="time"
                  required
                  value={newMeeting.startTime}
                  onChange={(e) =>
                    setNewMeeting({ ...newMeeting, startTime: e.target.value })
                  }
                />
              </div>

              <div className="form-field">
                <label htmlFor="mtg-end-time">종료 시간</label>
                <input
                  id="mtg-end-time"
                  type="time"
                  value={newMeeting.endTime}
                  onChange={(e) =>
                    setNewMeeting({ ...newMeeting, endTime: e.target.value })
                  }
                />
              </div>

              <div className="form-field">
                <label htmlFor="mtg-treasurer">총무</label>
                <select
                  id="mtg-treasurer"
                  value={newMeeting.treasurerUid || currentUser?.uid || ''}
                  onChange={(e) =>
                    setNewMeeting({
                      ...newMeeting,
                      treasurerUid: e.target.value
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
                <label htmlFor="mtg-type">모임 유형</label>
                <select
                  id="mtg-type"
                  value={adminUser ? newMeeting.type : 'Casual'}
                  disabled={!adminUser}
                  onChange={(e) =>
                    setNewMeeting({ ...newMeeting, type: e.target.value })
                  }
                >
                  <option value="Casual">자율/번개</option>
                  {adminUser && <option value="Official">공식 모임</option>}
                </select>
              </div>
            </div>

            {/* Dynamic Multi-Round Venues (1차, 2차... Optional) */}
            <div className="round-finance-box">
              <div className="section-title-row" style={{ marginBottom: '8px' }}>
                <strong>차수별 장소 · 지도</strong>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={handleAddCreateRound}
                >
                  + {newMeeting.rounds.length + 1}차 추가
                </button>
              </div>

              <div className="stack-gap">
                {newMeeting.rounds.map((r, idx) => (
                  <div key={r.id || idx} className="form-grid">
                    <div className="form-field">
                      <label>{idx + 1}차 장소</label>
                      <input
                        type="text"
                        placeholder={`${idx + 1}차 상호명`}
                        value={r.placeName}
                        onChange={(e) =>
                          handleCreateRoundChange(idx, {
                            placeName: e.target.value
                          })
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label>지도 링크</label>
                      <div className="inline-input-row">
                        <input
                          type="url"
                          placeholder="네이버/카카오 지도 URL"
                          value={r.mapUrl}
                          onChange={(e) =>
                            handleCreateRoundChange(idx, {
                              mapUrl: e.target.value
                            })
                          }
                        />
                        {newMeeting.rounds.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => handleRemoveCreateRound(idx)}
                          >
                            삭제
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="mtg-desc">안내 메모</label>
              <input
                id="mtg-desc"
                type="text"
                placeholder="안내 사항 (선택)"
                value={newMeeting.description}
                onChange={(e) =>
                  setNewMeeting({ ...newMeeting, description: e.target.value })
                }
              />
            </div>

            <div className="btn-row">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowCreateForm(false)}
              >
                취소
              </button>
              <button type="submit" className="btn btn-primary">
                개설 완료
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Calendar Agenda Schedule List (Month Header + Left Weekday/Day + Vertical Pill + Right Title/Time/Location) */}
      <section className="list-section schedule-list-section">
        {monthGroups.length === 0 ? (
          <p className="muted-text">해당 탭에 표시할 모임이 없습니다.</p>
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
                    const isSettled = mtg.status === 'settled';

                    return (
                      <article
                        key={mtg.id}
                        role="button"
                        tabIndex={0}
                        className={`schedule-row ${
                          isSameDateAsNext ? 'same-date-next' : ''
                        }`}
                        onClick={() => onSelectMeetingId(mtg.id)}
                        onKeyDown={(e) =>
                          e.key === 'Enter' && onSelectMeetingId(mtg.id)
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
                          <h3
                            className={`schedule-title ${
                              isSettled ? 'is-settled' : ''
                            }`}
                          >
                            {mtg.title}
                          </h3>
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
    </div>
  );
}

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  canCreateMeeting,
  REGION_GROUPS,
  isAdminUser,
  cleanScheduleLocation,
  detectRegionFromText
} from '../core/communityRules';
import MeetingDetailPage from './MeetingDetailPage';
import BungRecordsTab from '../components/BungRecordsTab';
import ErrorBoundary from '../components/ErrorBoundary';

const WEEKDAY_SHORT_KO = ['일', '월', '화', '수', '목', '금', '토'];
const WEEKDAY_FULL_KO = [
  '일요일',
  '월요일',
  '화요일',
  '수요일',
  '목요일',
  '금요일',
  '토요일'
];


function formatKoreanFullDate(dateStr) {
  const clean = String(dateStr || '2026-11-04').slice(0, 10);
  const parts = clean.split('-');
  const year = Number(parts[0]) || 2026;
  const month = Number(parts[1]) || 11;
  const day = Number(parts[2]) || 4;
  const dateObj = new Date(year, month - 1, day);
  const weekdayFull = WEEKDAY_FULL_KO[dateObj.getDay()] || '';
  return `${year}. ${month}. ${day} ${weekdayFull}`;
}

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

function addHoursToTime(timeStr, hoursToAdd = 1) {
  const match = String(timeStr || '12:00').trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return '13:00';
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

  // Display strictly the clean schedule location input; exclude 1차/2차 round details
  const r1Place = (mtg.rounds && mtg.rounds[0]?.placeName) || '';
  let locationText = cleanScheduleLocation(mtg.location, r1Place);
  if (!locationText && mtg.placeDetail) {
    locationText = cleanScheduleLocation(mtg.placeDetail, r1Place);
  }
  if (!locationText) {
    locationText = (mtg.location || mtg.placeDetail || r1Place || '').trim();
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

function getTodayDateString() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isPastMeeting(mtg, todayStr = getTodayDateString()) {
  const targetDate =
    mtg.endDateOnly || mtg.dateOnly || String(mtg.date || '').slice(0, 10);
  if (!targetDate) return false;
  if (targetDate < todayStr) return true;
  if (mtg.status === 'settled') return true;
  return false;
}

export default function MeetingsPage({
  currentUser,
  members,
  meetings,
  communityConfig,
  selectedMeetingId,
  selectedMeetingSubView,
  onSelectMeetingId,
  onSelectMeetingSubView,
  onShareMeeting,
  onToggleApplyMeeting,
  onCreateMeeting,
  onUpdateMeeting,
  onAdminSaveMeeting,
  onDeleteMeeting,
  onUpdateMemberProfile,
  onSettleMeeting,
  onRollbackMeeting,
  onNavigateTab
}) {
  const [subTab, setSubTab] = useState('open'); // 'open' | 'past' | 'mine' | 'records'
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createWarning, setCreateWarning] = useState('');

  const adminUser = isAdminUser(currentUser, communityConfig);
  const activeSubTab = !adminUser && subTab === 'records' ? 'open' : subTab;
  const [displayLimit, setDisplayLimit] = useState(25);
  const sentinelRef = useRef(null);

  const defaultDate = getTodayDateString();

  const [newSchedule, setNewSchedule] = useState({
    title: '',
    dateOnly: defaultDate,
    endDateOnly: defaultDate,
    startTime: '12:00',
    endTime: '13:00',
    allDay: false,
    placeDetail: '',
    advanceDeposit: '',
    requestAttendance: true
  });

  const hostEligible = currentUser ? canCreateMeeting(currentUser) : false;

  // If a specific schedule ID is selected (/meetings/26110701), resolve its data
  const activeMeeting = selectedMeetingId
    ? meetings.find((m) => String(m.id) === String(selectedMeetingId))
    : null;

  const handleOpenCreateModal = () => {
    if (!currentUser) {
      if (onNavigateTab) onNavigateTab('login');
      return;
    }
    if (!hostEligible) {
      setCreateWarning(
        `일정 등록은 최소 1회 이상 참석한 회원만 가능합니다. (현재 내 참석 횟수: ${currentUser.attendanceCount}회)`
      );
      setShowCreateForm(false);
      return;
    }
    setCreateWarning('');
    setShowCreateForm((prev) => !prev);
  };

  const handleStartDateChange = (nextDate) => {
    setNewSchedule((prev) => ({
      ...prev,
      dateOnly: nextDate,
      endDateOnly:
        prev.endDateOnly < nextDate ? nextDate : prev.endDateOnly
    }));
  };

  const handleStartTimeChange = (nextStart) => {
    setNewSchedule((prev) => ({
      ...prev,
      startTime: nextStart,
      endTime: addHoursToTime(nextStart, 1)
    }));
  };

  const handleSubmitNewSchedule = async (e) => {
    e.preventDefault();
    if (!newSchedule.title.trim()) return;

    const placeInput = newSchedule.placeDetail.trim();
    const titleInput = newSchedule.title.trim();
    const detectedFromPlace = detectRegionFromText(placeInput);
    const detectedFromTitle = detectRegionFromText(titleInput);
    const detected = detectedFromPlace.recognized ? detectedFromPlace : detectedFromTitle;
    const resolvedRegion = detected.recognized ? detected.group.name : '';

    const created = await onCreateMeeting({
      title: titleInput,
      dateOnly: newSchedule.dateOnly,
      endDateOnly: newSchedule.endDateOnly || newSchedule.dateOnly,
      startTime: newSchedule.allDay ? '00:00' : newSchedule.startTime,
      endTime: newSchedule.allDay ? '23:59' : newSchedule.endTime,
      allDay: newSchedule.allDay,
      location: placeInput,
      placeDetail: placeInput,
      region: resolvedRegion,
      advanceDeposit: Number(newSchedule.advanceDeposit) || 0,
      requestAttendance: newSchedule.requestAttendance,
      treasurerUid: currentUser.uid,
      type: 'Casual',
      rounds: placeInput ? [{ id: 'r-1', placeName: placeInput, mapUrl: '' }] : []
    });

    const resetDate = getTodayDateString();
    setNewSchedule({
      title: '',
      dateOnly: resetDate,
      endDateOnly: resetDate,
      startTime: '12:00',
      endTime: '13:00',
      allDay: false,
      placeDetail: '',
      region: '',
      advanceDeposit: '',
      requestAttendance: true
    });
    setSubTab('open');
    setShowCreateForm(false);
  };

  const todayStr = getTodayDateString();

  // Reset infinite scroll limit when switching tabs
  useEffect(() => {
    setDisplayLimit(25);
  }, [activeSubTab]);

  const openCount = useMemo(() => {
    return meetings.filter((m) => !isPastMeeting(m, todayStr)).length;
  }, [meetings, todayStr]);

  const pastCount = useMemo(() => {
    return meetings.filter((m) => isPastMeeting(m, todayStr)).length;
  }, [meetings, todayStr]);

  const filteredMeetings = useMemo(() => {
    return meetings.filter((m) => {
      const isPast = isPastMeeting(m, todayStr);
      if (activeSubTab === 'open') return !isPast;
      if (activeSubTab === 'past' || activeSubTab === 'settled') return isPast;
      if (activeSubTab === 'mine') {
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
  }, [meetings, activeSubTab, todayStr, currentUser]);

  // Sort chronologically and group by Year-Month
  // For past meetings, sort in descending order (most recent first)
  const isPastTab = subTab === 'past' || subTab === 'settled';
  const sortedMeetings = useMemo(() => {
    return [...filteredMeetings].sort((a, b) => {
      const da = String(a.date || a.dateOnly || '');
      const db = String(b.date || b.dateOnly || '');
      return isPastTab ? db.localeCompare(da) : da.localeCompare(db);
    });
  }, [filteredMeetings, isPastTab]);

  // Infinite Scroll slice
  const displayedMeetings = useMemo(() => {
    return sortedMeetings.slice(0, displayLimit);
  }, [sortedMeetings, displayLimit]);

  // Infinite Scroll Observer
  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDisplayLimit((prev) => {
            if (prev < sortedMeetings.length) {
              return prev + 25;
            }
            return prev;
          });
        }
      },
      { rootMargin: '250px' }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [sortedMeetings.length]);

  const monthGroups = useMemo(() => {
    const groups = [];
    for (const mtg of displayedMeetings) {
      const meta = buildScheduleMeta(mtg);
      let group = groups.find((g) => g.monthKey === meta.monthKey);
      if (!group) {
        group = {
          monthKey: meta.monthKey,
          monthLabel: meta.monthLabel,
          items: []
        };
        groups.push(group);
      }
      group.items.push({ mtg, meta });
    }
    return groups;
  }, [displayedMeetings]);

  const openPicker = (e) => {
    if (typeof e.target.showPicker === 'function') {
      try {
        e.target.showPicker();
      } catch {
        // Fallback to default browser behavior
      }
    }
  };

  // If a specific schedule ID is selected (/meetings/26110701), render its dedicated page
  // IMPORTANT: Placed after all Hook declarations to strictly uphold React Rules of Hooks (Error #300 prevention)
  if (activeMeeting) {
    return (
      <ErrorBoundary onReset={() => onSelectMeetingId(null)}>
        <MeetingDetailPage
          meeting={activeMeeting}
          allMeetings={meetings}
          currentUser={currentUser}
          members={members}
          communityConfig={communityConfig}
          initialSubView={selectedMeetingSubView}
          onUpdateSubView={onSelectMeetingSubView}
          onBackToList={() => onSelectMeetingId(null)}
          onShareMeeting={onShareMeeting}
          onToggleApplyMeeting={onToggleApplyMeeting}
          onUpdateMeeting={onUpdateMeeting}
          onAdminSaveMeeting={onAdminSaveMeeting}
          onDeleteMeeting={onDeleteMeeting}
          onUpdateMemberProfile={onUpdateMemberProfile}
          onSettleMeeting={onSettleMeeting}
          onRollbackMeeting={onRollbackMeeting}
          onNavigateTab={onNavigateTab}
        />
      </ErrorBoundary>
    );
  }

  return (
    <div className="list-container" style={{ paddingBottom: '90px' }}>
      {/* Page Header & Register Schedule Button */}
      <section className="list-section">
        <div className="section-title-row">
          <h2>일정 목록</h2>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleOpenCreateModal}
          >
            {showCreateForm ? '닫기' : '+ 일정 등록'}
          </button>
        </div>

        {createWarning && (
          <div className="warning-banner" role="alert">
            ⚠️ {createWarning}
          </div>
        )}

        {/* Sub-tabs */}
        <div className="meetings-subtab-bar">
          <button
            type="button"
            className={`meetings-subtab-btn ${activeSubTab === 'open' ? 'active' : ''}`}
            onClick={() => setSubTab('open')}
          >
            진행 예정 ({openCount})
          </button>
          <button
            type="button"
            className={`meetings-subtab-btn ${activeSubTab === 'past' || activeSubTab === 'settled' ? 'active' : ''}`}
            onClick={() => setSubTab('past')}
          >
            지나간 일정 ({pastCount})
          </button>
          {currentUser && (
            <button
              type="button"
              className={`meetings-subtab-btn ${activeSubTab === 'mine' ? 'active' : ''}`}
              onClick={() => setSubTab('mine')}
            >
              내 일정
            </button>
          )}
          {adminUser && (
            <button
              type="button"
              className={`meetings-subtab-btn ${activeSubTab === 'records' ? 'active' : ''}`}
              onClick={() => setSubTab('records')}
            >
              🔒 벙기록 ({meetings.length})
            </button>
          )}
        </div>
      </section>

      {/* Calendar-Style Schedule Registration Card */}
      {showCreateForm && (
        <section className="list-section calendar-create-section">
          <form onSubmit={handleSubmitNewSchedule}>
            <div className="calendar-create-card">
              {/* Row 1: Schedule Title */}
              <div className="calendar-title-row">
                <input
                  type="text"
                  className="calendar-title-input"
                  placeholder="일정 제목"
                  aria-label="일정 제목"
                  required
                  autoFocus
                  value={newSchedule.title}
                  onChange={(e) =>
                    setNewSchedule({ ...newSchedule, title: e.target.value })
                  }
                />
              </div>

              {/* Row 2: Start Date & Time with Clock Icon */}
              <div className="calendar-field-row">
                <div className="calendar-icon-col" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    className="calendar-line-icon"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <polyline points="12 7 12 12 15.5 12" />
                  </svg>
                </div>
                <div className="calendar-body-col has-divider">
                  <div className="calendar-datetime-inline">
                    <label className="calendar-picker-label">
                      <span>{formatKoreanFullDate(newSchedule.dateOnly)}</span>
                      <input
                        type="date"
                        className="calendar-hidden-picker"
                        value={newSchedule.dateOnly}
                        onClick={openPicker}
                        onChange={(e) => handleStartDateChange(e.target.value)}
                      />
                    </label>

                    {!newSchedule.allDay && (
                      <label className="calendar-picker-label">
                        <span>{formatKoreanAmPm(newSchedule.startTime)}</span>
                        <input
                          type="time"
                          className="calendar-hidden-picker"
                          value={newSchedule.startTime}
                          onClick={openPicker}
                          onChange={(e) =>
                            handleStartTimeChange(e.target.value)
                          }
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 3: End Date & Time (Indented) */}
              <div className="calendar-field-row">
                <div className="calendar-icon-col" aria-hidden="true" />
                <div className="calendar-body-col has-divider">
                  <div className="calendar-datetime-inline">
                    <label className="calendar-picker-label">
                      <span>
                        {formatKoreanFullDate(newSchedule.endDateOnly)}
                      </span>
                      <input
                        type="date"
                        className="calendar-hidden-picker"
                        min={newSchedule.dateOnly}
                        value={newSchedule.endDateOnly}
                        onClick={openPicker}
                        onChange={(e) =>
                          setNewSchedule({
                            ...newSchedule,
                            endDateOnly: e.target.value
                          })
                        }
                      />
                    </label>

                    {!newSchedule.allDay && (
                      <label className="calendar-picker-label">
                        <span>{formatKoreanAmPm(newSchedule.endTime)}</span>
                        <input
                          type="time"
                          className="calendar-hidden-picker"
                          value={newSchedule.endTime}
                          onClick={openPicker}
                          onChange={(e) =>
                            setNewSchedule({
                              ...newSchedule,
                              endTime: e.target.value
                            })
                          }
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 4: All-Day Toggle (Indented) */}
              <div className="calendar-field-row">
                <div className="calendar-icon-col" aria-hidden="true" />
                <div className="calendar-body-col has-divider calendar-toggle-row">
                  <span className="calendar-row-text">하루 종일</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={newSchedule.allDay}
                    aria-label="하루 종일"
                    className={`calendar-switch ${
                      newSchedule.allDay ? 'is-on' : ''
                    }`}
                    onClick={() =>
                      setNewSchedule((prev) => ({
                        ...prev,
                        allDay: !prev.allDay
                      }))
                    }
                  >
                    <span className="calendar-switch-thumb">
                      <span className="calendar-switch-dash" />
                    </span>
                  </button>
                </div>
              </div>

              {/* Row 5: Location Input (Optional) */}
              <div className="calendar-field-row">
                <div className="calendar-icon-col" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    className="calendar-line-icon"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 21s-6-5.2-6-10a6 6 0 1 1 12 0c0 4.8-6 10-6 10z" />
                    <circle cx="12" cy="11" r="2.2" />
                  </svg>
                </div>
                <div className="calendar-body-col has-divider">
                  <input
                    type="text"
                    list="schedule-region-list"
                    className="calendar-plain-input"
                    placeholder="위치 입력(선택)"
                    aria-label="위치 입력(선택)"
                    value={newSchedule.placeDetail}
                    onChange={(e) =>
                      setNewSchedule({
                        ...newSchedule,
                        placeDetail: e.target.value
                      })
                    }
                  />
                </div>
              </div>

              {/* Row 6: Advance Deposit Input (선입금 입력) */}
              <div className="calendar-field-row">
                <div className="calendar-icon-col" aria-hidden="true">
                  <span style={{ fontSize: '15px' }}>💰</span>
                </div>
                <div className="calendar-body-col has-divider">
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    className="calendar-plain-input"
                    placeholder="선입금 금액(원, 선택)"
                    aria-label="선입금 금액"
                    value={newSchedule.advanceDeposit || ''}
                    onChange={(e) =>
                      setNewSchedule({
                        ...newSchedule,
                        advanceDeposit: e.target.value
                      })
                    }
                  />
                </div>
              </div>

              {/* Row 7: Attendance Response Request Toggle */}
              <div className="calendar-field-row">
                <div className="calendar-icon-col" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    className="calendar-line-icon"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div className="calendar-body-col calendar-toggle-row">
                  <span className="calendar-row-text">
                    참석 여부 응답 요청
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={newSchedule.requestAttendance}
                    aria-label="참석 여부 응답 요청"
                    className={`calendar-switch ${
                      newSchedule.requestAttendance ? 'is-on' : ''
                    }`}
                    onClick={() =>
                      setNewSchedule((prev) => ({
                        ...prev,
                        requestAttendance: !prev.requestAttendance
                      }))
                    }
                  >
                    <span className="calendar-switch-thumb">
                      <span className="calendar-switch-dash" />
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="btn-row" style={{ marginTop: '12px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowCreateForm(false)}
              >
                취소
              </button>
              <button type="submit" className="btn btn-primary">
                일정 등록
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Bung Records Sub-tab View (Admin Only) */}
      {adminUser && activeSubTab === 'records' ? (
        <BungRecordsTab
          meetings={meetings}
          members={members}
          currentUser={currentUser}
          onSelectMeetingId={onSelectMeetingId}
          onCreateMeeting={onCreateMeeting}
          onNavigateTab={onNavigateTab}
        />
      ) : (
        /* Calendar Agenda Schedule List */
        <section className="list-section schedule-list-section">
          {monthGroups.length === 0 ? (
            <p className="muted-text">해당 탭에 표시할 일정이 없습니다.</p>
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
                      const isPast = isPastMeeting(mtg, todayStr);

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
                                isPast ? 'is-settled' : ''
                              }`}
                            >
                              {Number(mtg.advanceDeposit) > 0 && (
                                <span
                                  className="status-pill open"
                                  style={{
                                    marginRight: '6px',
                                    fontSize: '11px',
                                    padding: '2px 6px',
                                    fontWeight: 700
                                  }}
                                >
                                  선입금 {Number(mtg.advanceDeposit).toLocaleString()}원
                                </span>
                              )}
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

          {/* 무한 스크롤 감지 영역 (Sentinel) */}
          {displayedMeetings.length < sortedMeetings.length && (
            <div ref={sentinelRef} className="infinite-scroll-sentinel">
              지나간 일정 더 불러오는 중... ({displayedMeetings.length} / {sortedMeetings.length}개)
            </div>
          )}
        </section>
      )}
    </div>
  );
}

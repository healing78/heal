import React, { useState } from 'react';
import { canCreateMeeting, REGION_GROUPS } from '../core/communityRules';
import MeetingDetailPage from './MeetingDetailPage';
import BungRecordsTab from '../components/BungRecordsTab';

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

const REMINDER_OPTIONS = [
  '15분 전',
  '30분 전',
  '1시간 전',
  '1일 전',
  '정각',
  '알림 없음'
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

  // Display only the registered schedule location ('location'); exclude 1차 round details
  const r1Place = (mtg.rounds && mtg.rounds[0]?.placeName) || '';
  let locationText = (mtg.location || '').trim();
  if (!locationText && mtg.placeDetail && mtg.placeDetail !== r1Place) {
    locationText = mtg.placeDetail.trim();
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
  onNavigateTab
}) {
  const [subTab, setSubTab] = useState('open'); // 'open' | 'past' | 'mine'
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createWarning, setCreateWarning] = useState('');

  const defaultDate = getTodayDateString();

  const [newSchedule, setNewSchedule] = useState({
    title: '',
    dateOnly: defaultDate,
    endDateOnly: defaultDate,
    startTime: '12:00',
    endTime: '13:00',
    allDay: false,
    placeDetail: '',
    reminder: '15분 전',
    requestAttendance: true
  });

  const hostEligible = currentUser ? canCreateMeeting(currentUser) : false;

  // If a specific schedule ID is selected (/meetings/26110701), render its dedicated page
  const activeMeeting = selectedMeetingId
    ? meetings.find((m) => String(m.id) === String(selectedMeetingId))
    : null;

  if (activeMeeting) {
    return (
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
    const created = await onCreateMeeting({
      title: newSchedule.title.trim(),
      dateOnly: newSchedule.dateOnly,
      endDateOnly: newSchedule.endDateOnly || newSchedule.dateOnly,
      startTime: newSchedule.allDay ? '00:00' : newSchedule.startTime,
      endTime: newSchedule.allDay ? '23:59' : newSchedule.endTime,
      allDay: newSchedule.allDay,
      location: placeInput,
      placeDetail: placeInput,
      reminder: newSchedule.reminder,
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
      reminder: '15분 전',
      requestAttendance: true
    });
    setSubTab('open');
    setShowCreateForm(false);
  };

  const todayStr = getTodayDateString();

  const filteredMeetings = meetings.filter((m) => {
    const isPast = isPastMeeting(m, todayStr);
    if (subTab === 'open') return !isPast;
    if (subTab === 'past' || subTab === 'settled') return isPast;
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

  // Sort chronologically and group by Year-Month
  // For past meetings, sort in descending order (most recent first)
  const isPastTab = subTab === 'past' || subTab === 'settled';
  const sortedMeetings = [...filteredMeetings].sort((a, b) => {
    const da = String(a.date || a.dateOnly || '');
    const db = String(b.date || b.dateOnly || '');
    return isPastTab ? db.localeCompare(da) : da.localeCompare(db);
  });

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

  const openPicker = (e) => {
    if (typeof e.target.showPicker === 'function') {
      try {
        e.target.showPicker();
      } catch {
        // Fallback to default browser behavior
      }
    }
  };

  return (
    <div className="list-container">
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
        <div className="subtab-bar">
          <button
            type="button"
            className={`subtab-btn ${subTab === 'open' ? 'active' : ''}`}
            onClick={() => setSubTab('open')}
          >
            진행 예정 ({meetings.filter((m) => !isPastMeeting(m, todayStr)).length})
          </button>
          <button
            type="button"
            className={`subtab-btn ${subTab === 'past' || subTab === 'settled' ? 'active' : ''}`}
            onClick={() => setSubTab('past')}
          >
            지나간 일정 ({meetings.filter((m) => isPastMeeting(m, todayStr)).length})
          </button>
          {currentUser && (
            <button
              type="button"
              className={`subtab-btn ${subTab === 'mine' ? 'active' : ''}`}
              onClick={() => setSubTab('mine')}
            >
              내 일정
            </button>
          )}
          <button
            type="button"
            className={`subtab-btn ${subTab === 'records' ? 'active' : ''}`}
            onClick={() => setSubTab('records')}
          >
            벙기록 ({meetings.length})
          </button>
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
                  <datalist id="schedule-region-list">
                    {REGION_GROUPS.map((g) => (
                      <option key={g.id} value={g.keywords[0]}>
                        {g.name}
                      </option>
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Row 6: Reminder Select */}
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
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </div>
                <div className="calendar-body-col has-divider">
                  <select
                    aria-label="알림 시간"
                    className="calendar-plain-select"
                    value={newSchedule.reminder}
                    onChange={(e) =>
                      setNewSchedule({
                        ...newSchedule,
                        reminder: e.target.value
                      })
                    }
                  >
                    {REMINDER_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
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

      {/* Bung Records Sub-tab View */}
      {subTab === 'records' ? (
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
      )}
    </div>
  );
}

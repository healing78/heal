import React, { useState } from 'react';
import {
  calculateMeetingScoreForMember,
  canCreateMeeting,
  canSettleMeeting,
  formatMemberNickname,
  isAdminRole
} from '../core/communityRules';

export default function MeetingsPage({
  currentUser,
  members,
  meetings,
  onToggleApplyMeeting,
  onCreateMeeting,
  onSettleMeeting
}) {
  const [subTab, setSubTab] = useState('open'); // 'open' | 'settled' | 'mine'
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createWarning, setCreateWarning] = useState('');
  const [settlingMeetingId, setSettlingMeetingId] = useState(null);
  const [selectedParticipantUids, setSelectedParticipantUids] = useState([]);

  const [newMeeting, setNewMeeting] = useState({
    title: '',
    date: '2026-11-15 19:00',
    location: currentUser.city || '서울',
    placeDetail: '',
    type: 'Casual',
    description: ''
  });

  const adminUser = isAdminRole(currentUser.role);
  const hostEligible = canCreateMeeting(currentUser);

  const handleOpenCreateModal = () => {
    if (!hostEligible) {
      setCreateWarning(
        `모임(벙) 개설은 최소 1회 이상 모임에 참석한 회원만 가능합니다. (현재 내 참석 횟수: ${currentUser.attendanceCount}회)`
      );
      setShowCreateForm(false);
      return;
    }
    setCreateWarning('');
    setShowCreateForm((prev) => !prev);
  };

  const handleSubmitNewMeeting = (e) => {
    e.preventDefault();
    if (!newMeeting.title.trim() || !newMeeting.location.trim()) return;
    onCreateMeeting({
      ...newMeeting,
      type: adminUser ? newMeeting.type : 'Casual'
    });
    setNewMeeting({
      title: '',
      date: '2026-11-15 19:00',
      location: currentUser.city || '서울',
      placeDetail: '',
      type: 'Casual',
      description: ''
    });
    setShowCreateForm(false);
  };

  const startSettleMode = (meeting) => {
    setSettlingMeetingId(meeting.id);
    setSelectedParticipantUids([...meeting.applicants]);
  };

  const toggleConfirmedParticipant = (uid) => {
    setSelectedParticipantUids((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  const handleConfirmSettle = (meetingId) => {
    onSettleMeeting(meetingId, selectedParticipantUids);
    setSettlingMeetingId(null);
    setSelectedParticipantUids([]);
  };

  const filteredMeetings = meetings.filter((m) => {
    if (subTab === 'open') return m.status === 'open';
    if (subTab === 'settled') return m.status === 'settled';
    if (subTab === 'mine') {
      return (
        m.hostUid === currentUser.uid ||
        m.applicants.includes(currentUser.uid) ||
        m.confirmedParticipants.includes(currentUser.uid)
      );
    }
    return true;
  });

  return (
    <div className="stack-gap">
      {/* Page Top Header & Create Button */}
      <div className="card">
        <div className="section-title-row">
          <div>
            <h2>모임(벙) 일정 및 참석 관리</h2>
            <p className="muted-text">
              기본 참석 +1점 · 타지역 원정 참석 시 +2점 추가 · 1회 이상 참석 회원 누구나 자율벙 개설 가능
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleOpenCreateModal}
          >
            {showCreateForm ? '개설 창 닫기' : '+ 벙 개설하기'}
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
            종료·정산 완료 ({meetings.filter((m) => m.status === 'settled').length})
          </button>
          <button
            type="button"
            className={`subtab-btn ${subTab === 'mine' ? 'active' : ''}`}
            onClick={() => setSubTab('mine')}
          >
            내 모임
          </button>
        </div>
      </div>

      {/* Create Meeting Form */}
      {showCreateForm && (
        <section className="card highlight-border">
          <h3>새 모임(벙) 개설하기</h3>
          <form onSubmit={handleSubmitNewMeeting} className="stack-gap">
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="mtg-title">모임 제목</label>
                <input
                  id="mtg-title"
                  type="text"
                  placeholder="예: 주말 성수동 카페 & 보드게임 번개"
                  required
                  value={newMeeting.title}
                  onChange={(e) =>
                    setNewMeeting({ ...newMeeting, title: e.target.value })
                  }
                />
              </div>
              <div className="form-field">
                <label htmlFor="mtg-date">일시</label>
                <input
                  id="mtg-date"
                  type="text"
                  placeholder="YYYY-MM-DD HH:mm"
                  required
                  value={newMeeting.date}
                  onChange={(e) =>
                    setNewMeeting({ ...newMeeting, date: e.target.value })
                  }
                />
              </div>
              <div className="form-field">
                <label htmlFor="mtg-loc">모임 지역 (원정 판별 기준 도시)</label>
                <input
                  id="mtg-loc"
                  type="text"
                  placeholder="예: 서울, 경기, 인천, 부산"
                  required
                  value={newMeeting.location}
                  onChange={(e) =>
                    setNewMeeting({ ...newMeeting, location: e.target.value })
                  }
                />
              </div>
              <div className="form-field">
                <label htmlFor="mtg-place">상세 집합 장소</label>
                <input
                  id="mtg-place"
                  type="text"
                  placeholder="예: 성수역 3번 출구 앞"
                  required
                  value={newMeeting.placeDetail}
                  onChange={(e) =>
                    setNewMeeting({ ...newMeeting, placeDetail: e.target.value })
                  }
                />
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
                  <option value="Casual">자율/번개 모임 (Casual)</option>
                  {adminUser && (
                    <option value="Official">공식 정기 모임 (Official - 운영진 전용)</option>
                  )}
                </select>
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="mtg-desc">모임 상세 안내</label>
              <input
                id="mtg-desc"
                type="text"
                placeholder="회비, 준비물, 공지사항 등을 적어주세요."
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
                모임 등록 완료 (내가 벙주)
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Meetings List */}
      {filteredMeetings.length === 0 ? (
        <div className="card">
          <p className="muted-text">해당 탭에 표시할 모임이 없습니다.</p>
        </div>
      ) : (
        filteredMeetings.map((mtg) => {
          const hostMember = members.find((m) => m.uid === mtg.hostUid);
          const isApplied = mtg.applicants.includes(currentUser.uid);
          const canSettle = canSettleMeeting(currentUser, mtg);
          const myScoreInfo = calculateMeetingScoreForMember(
            currentUser,
            mtg.location
          );
          const isSettlingThis = settlingMeetingId === mtg.id;

          return (
            <section key={mtg.id} className="card stack-gap">
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
                  <span
                    className={`status-pill ${
                      mtg.status === 'settled' ? 'settled' : 'open'
                    }`}
                  >
                    {mtg.status === 'settled' ? '정산 완료' : '모집중'}
                  </span>
                  {mtg.status === 'open' && myScoreInfo.isExpedition && (
                    <span className="expedition-pill">
                      🚀 내 연고지({currentUser.homeCity}) 외 원정 +2점 대상
                    </span>
                  )}
                </div>
                <span className="muted-text">{mtg.date}</span>
              </div>

              <div>
                <h3>{mtg.title}</h3>
                <p className="muted-text">
                  집합 장소: {mtg.placeDetail} · 벙주:{' '}
                  <strong>
                    {hostMember ? formatMemberNickname(hostMember) : mtg.hostUid}
                  </strong>
                </p>
                {mtg.description && <p className="mtg-desc">{mtg.description}</p>}
              </div>

              {/* Applicants / Confirmed Participants List */}
              <div className="participants-box">
                <div className="participants-title">
                  {mtg.status === 'settled'
                    ? `최종 참석 확정 인원 (${mtg.confirmedParticipants.length}명)`
                    : `현재 참석 신청자 (${mtg.applicants.length}명)`}
                </div>
                <div className="chip-list">
                  {(mtg.status === 'settled'
                    ? mtg.confirmedParticipants
                    : mtg.applicants
                  ).map((uid) => {
                    const m = members.find((mem) => mem.uid === uid);
                    if (!m) return null;
                    const scoreCalc = calculateMeetingScoreForMember(
                      m,
                      mtg.location
                    );
                    return (
                      <span key={uid} className="member-chip">
                        {formatMemberNickname(m)}
                        {scoreCalc.isExpedition && (
                          <em className="chip-exp"> (원정+2)</em>
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons for Open Meetings */}
              {mtg.status === 'open' && (
                <div className="meeting-footer">
                  <button
                    type="button"
                    className={`btn ${isApplied ? 'btn-outline' : 'btn-primary'}`}
                    onClick={() => onToggleApplyMeeting(mtg.id)}
                  >
                    {isApplied ? '참석 신청 취소' : '참석 신청하기'}
                  </button>

                  {canSettle && !isSettlingThis && (
                    <button
                      type="button"
                      className="btn btn-settle"
                      onClick={() => startSettleMode(mtg)}
                    >
                      모임 마감 · 점수 정산 (벙주/운영진)
                    </button>
                  )}
                </div>
              )}

              {/* 2-Step Settlement Panel for Host / Admin */}
              {isSettlingThis && (
                <div className="settle-panel">
                  <h4>실제 참석자 체크 및 점수 정산</h4>
                  <p className="muted-text">
                    체크된 실참석자에게 기본 +1점(타지역 원정 시 +2점 추가)과 참석 횟수 +1회가 부여됩니다.
                  </p>
                  <div className="settle-checklist">
                    {mtg.applicants.map((uid) => {
                      const m = members.find((mem) => mem.uid === uid);
                      if (!m) return null;
                      const calc = calculateMeetingScoreForMember(m, mtg.location);
                      const checked = selectedParticipantUids.includes(uid);
                      return (
                        <label key={uid} className="check-item">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleConfirmedParticipant(uid)}
                          />
                          <span>
                            <strong>{formatMemberNickname(m)}</strong> — 기본 +{calc.base}점
                            {calc.isExpedition
                              ? ` + 원정 보너스 +${calc.expedition}점 (합계 +${calc.total}점)`
                              : ` (합계 +${calc.total}점)`}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  <div className="btn-row">
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => setSettlingMeetingId(null)}
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => handleConfirmSettle(mtg.id)}
                    >
                      {selectedParticipantUids.length}명 실참석 확정 및 점수 지급
                    </button>
                  </div>
                </div>
              )}
            </section>
          );
        })
      )}
    </div>
  );
}

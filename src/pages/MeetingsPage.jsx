import React, { useState } from 'react';
import {
  calculateMeetingScoreForMember,
  canCreateMeeting,
  formatMemberNickname,
  isAdminRole,
  REGION_GROUPS
} from '../core/communityRules';
import MeetingDetailPage from './MeetingDetailPage';

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
    location: currentUser?.city || '서울',
    treasurerUid: currentUser?.uid || '',
    type: 'Casual',
    description: '',
    rounds: [
      { id: 'r-1', placeName: '', mapUrl: '' }
    ]
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
        `모임(벙) 개설은 최소 1회 이상 모임에 참석한 회원만 가능합니다. (현재 내 참석 횟수: ${currentUser.attendanceCount}회)`
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

  return (
    <div className="list-container">
      {/* Page Header & Create Button */}
      <section className="list-section">
        <div className="section-title-row">
          <div>
            <h2>모임(벙) 목록</h2>
            <p className="muted-text">
              참석 +1점 · 타권역 원정 +1점 · 해외 +2점 · 각 벙을 클릭하면 개별 벙 페이지(정산·장소·귀가)로 이동합니다.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleOpenCreateModal}
          >
            {showCreateForm ? '닫기' : '+ 벙 개설'}
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

      {/* Create Meeting Form (Calendar Date + Separate Time + Multi-Round Venues) */}
      {showCreateForm && (
        <section className="list-section highlight-section">
          <h3>새 모임(벙) 개설하기 (YYMMDD+01 전용 페이지 자동 생성)</h3>
          <form
            onSubmit={handleSubmitNewMeeting}
            className="stack-gap"
            style={{ marginTop: '12px' }}
          >
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="mtg-title">모임 제목 (필수)</label>
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
                <label htmlFor="mtg-loc">
                  모임 지역 (서울·경기 / 강원 / 충청·대전 / 전라·광주 / 경상·부산 / 제주 / 해외)
                </label>
                <input
                  id="mtg-loc"
                  type="text"
                  list="create-region-list"
                  placeholder="예: 서울, 수원, 인천, 대전, 부산, 제주, 해외"
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
                <label htmlFor="mtg-date-only">날짜 선택 (달력)</label>
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
                <label htmlFor="mtg-start-time">시작 시간 선택</label>
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
                <label htmlFor="mtg-treasurer">총무 지정 (입금 계좌 기준)</label>
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
                  <option value="Casual">자율/번개 모임 (Casual)</option>
                  {adminUser && (
                    <option value="Official">
                      공식 정기 모임 (Official - 운영진 전용)
                    </option>
                  )}
                </select>
              </div>
            </div>

            {/* Dynamic Multi-Round Venues (1차, 2차... Optional) */}
            <div className="round-finance-box">
              <div className="section-title-row" style={{ marginBottom: '8px' }}>
                <strong>차수별 장소 및 지도 링크 (선택 입력 · 개설 후 추가/변경 가능)</strong>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={handleAddCreateRound}
                >
                  + {newMeeting.rounds.length + 1}차 장소 추가
                </button>
              </div>

              <div className="stack-gap">
                {newMeeting.rounds.map((r, idx) => (
                  <div key={r.id || idx} className="form-grid">
                    <div className="form-field">
                      <label>{idx + 1}차 장소명 (선택)</label>
                      <input
                        type="text"
                        placeholder={`예: ${idx + 1}차 식당/카페 이름`}
                        value={r.placeName}
                        onChange={(e) =>
                          handleCreateRoundChange(idx, {
                            placeName: e.target.value
                          })
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label>네이버 / 카카오 지도 링크 (선택)</label>
                      <div className="inline-input-row">
                        <input
                          type="url"
                          placeholder="https://map.kakao.com/... 또는 네이버 지도 URL"
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
              <label htmlFor="mtg-desc">모임 간단 안내 (선택)</label>
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
                벙 개설 및 전용 페이지 생성
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Concise Meetings List (Emphasize Title & Date/Time, Show Nicknames Only) */}
      <section className="list-section">
        {filteredMeetings.length === 0 ? (
          <p className="muted-text">해당 탭에 표시할 모임이 없습니다.</p>
        ) : (
          <div className="divider-list">
            {filteredMeetings.map((mtg) => {
              const isApplied = currentUser
                ? (mtg.applicants || []).includes(currentUser.uid)
                : false;
              const myScoreInfo = currentUser
                ? calculateMeetingScoreForMember(currentUser, mtg.location)
                : { isExpedition: false, label: '' };

              const participantUids =
                mtg.status === 'settled'
                  ? mtg.confirmedParticipants || []
                  : mtg.applicants || [];

              return (
                <article
                  key={mtg.id}
                  className="list-item-row concise-meeting-card"
                >
                  {/* Top Row: ID Badge, Location, Date/Time Emphasis */}
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
                      <span
                        className={`status-pill ${
                          mtg.status === 'settled' ? 'settled' : 'open'
                        }`}
                      >
                        {mtg.status === 'settled' ? '마감' : '모집중'}
                      </span>
                      {mtg.status === 'open' && myScoreInfo.isExpedition && (
                        <span className="expedition-pill">
                          {myScoreInfo.label}
                        </span>
                      )}
                    </div>
                    <strong className="concise-datetime">{mtg.date}</strong>
                  </div>

                  {/* Emphasized Title (Clickable to open individual meeting page) */}
                  <div
                    role="button"
                    tabIndex={0}
                    className="concise-title-box"
                    onClick={() => onSelectMeetingId(mtg.id)}
                    onKeyDown={(e) =>
                      e.key === 'Enter' && onSelectMeetingId(mtg.id)
                    }
                  >
                    <h3 className="concise-title">{mtg.title}</h3>
                  </div>

                  {/* Participants by Nickname Only */}
                  <div className="concise-nicknames-box">
                    <span className="sub-meta">
                      참석({participantUids.length}):{' '}
                    </span>
                    <div className="chip-list" style={{ display: 'inline-flex' }}>
                      {participantUids.map((uid) => {
                        const m = members.find((mem) => mem.uid === uid);
                        if (!m) return null;
                        return (
                          <span key={uid} className="member-chip">
                            {formatMemberNickname(m)}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quick Actions: Open Dedicated Page / Share / Apply */}
                  <div className="meeting-footer">
                    <button
                      type="button"
                      className="btn-link"
                      onClick={() => onSelectMeetingId(mtg.id)}
                    >
                      벙 상세·정산 페이지 (#{mtg.id}) 열기 →
                    </button>

                    <div className="btn-row">
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => onShareMeeting && onShareMeeting(mtg)}
                      >
                        공유
                      </button>
                      {mtg.status === 'open' && (
                        <button
                          type="button"
                          className={`btn btn-sm ${
                            isApplied ? 'btn-outline' : 'btn-primary'
                          }`}
                          onClick={() => onToggleApplyMeeting(mtg.id)}
                        >
                          {isApplied ? '신청 취소' : '참석 신청'}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

import React, { useState } from 'react';
import {
  formatMemberNickname,
  isSuperAdmin,
  ROLE_KEYS,
  ROLE_META
} from '../core/communityRules';

const AVATAR_BG_PALETTE = [
  '#f59e0b',
  '#3b82f6',
  '#10b981',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#e11d48'
];

function getAvatarBg(uid) {
  const str = String(uid || '');
  let sum = 0;
  for (let i = 0; i < str.length; i += 1) {
    sum += str.charCodeAt(i);
  }
  return AVATAR_BG_PALETTE[sum % AVATAR_BG_PALETTE.length];
}

export default function AdminPage({
  currentUser,
  members = [],
  meetings = [],
  communityConfig = {},
  onOpenMeetingDetail,
  onDeleteMeeting,
  onAdminUpdateMember,
  onAdminAdjustEventScore,
  onAdminUpdateConfig,
  onImpersonateUser
}) {
  const [subTab, setSubTab] = useState('members'); // 'members' | 'meetings' | 'scores' | 'config'
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedMeetingId, setExpandedMeetingId] = useState(null);

  const isSuper = isSuperAdmin(currentUser, communityConfig);

  const handleDownloadBackup = () => {
    const backupPayload = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      communityConfig,
      members,
      meetings
    };
    const blob = new Blob([JSON.stringify(backupPayload, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `healing78_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleAssignLeader = (targetUid) => {
    const targetMember = members.find((m) => m.uid === targetUid);
    const targetNick = targetMember ? formatMemberNickname(targetMember) : targetUid;
    if (!window.confirm(`${targetNick} 님을 방장(Leader)으로 지정하시겠습니까?`)) {
      return;
    }
    onAdminUpdateMember(targetUid, { role: 'Leader' });
  };

  // Manual event score form state
  const [scoreForm, setScoreForm] = useState({
    targetUid: members[0]?.uid || '',
    delta: 2,
    reason: '월간 이벤트 우수 참여 보너스'
  });
  const [scoreNotice, setScoreNotice] = useState('');

  // Community notice/rules config form state
  const [configForm, setConfigForm] = useState({
    homeSummary:
      communityConfig.homeSummary || '공지 · 규격 닉네임 및 모임 규칙',
    noticeTitle: communityConfig.noticeTitle,
    noticeBody: communityConfig.noticeBody,
    newcomerSummary:
      communityConfig.newcomerSummary || '신입공지 · 입장 즉시 닉네임 변경',
    newcomerNoticeBody:
      communityConfig.newcomerNoticeBody ||
      'Healing78 오픈채팅방 입장 후 24시간 이내에 아래 자동 생성기로 규격 닉네임을 만들어 카톡방 프로필을 변경해 주세요.',
    googleDriveBridgeUrl: communityConfig.googleDriveBridgeUrl || ''
  });
  const [configNotice, setConfigNotice] = useState('');

  const filteredMembers = members.filter((m) => {
    const nick = formatMemberNickname(m);
    return (
      !searchQuery.trim() ||
      nick.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.realName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleAdjustScoreSubmit = (e) => {
    e.preventDefault();
    const numericDelta = Number(scoreForm.delta);
    if (!scoreForm.targetUid || Number.isNaN(numericDelta) || numericDelta === 0) {
      return;
    }
    onAdminAdjustEventScore(
      scoreForm.targetUid,
      numericDelta,
      scoreForm.reason.trim() || '운영진 수동 점수 조정'
    );
    setScoreNotice('점수 반영 및 로그 기록이 완료되었습니다.');
    setTimeout(() => setScoreNotice(''), 2500);
  };

  const handleConfigSubmit = (e) => {
    e.preventDefault();
    onAdminUpdateConfig(configForm);
    setConfigNotice('공지사항 및 커뮤니티 규칙 배너가 업데이트되었습니다.');
    setTimeout(() => setConfigNotice(''), 2500);
  };

  return (
    <div className="list-container">
      <section className="list-section">
        <div className="section-title-row">
          <h2>운영 관리</h2>
          <span className="platform-badge">Admin</span>
        </div>

        <div className="subtab-bar">
          <button
            type="button"
            className={`subtab-btn ${subTab === 'members' ? 'active' : ''}`}
            onClick={() => setSubTab('members')}
          >
            회원·역할 관리 ({members.length})
          </button>
          <button
            type="button"
            className={`subtab-btn ${subTab === 'meetings' ? 'active' : ''}`}
            onClick={() => setSubTab('meetings')}
          >
            모임 관리 ({meetings.length})
          </button>
          <button
            type="button"
            className={`subtab-btn ${subTab === 'scores' ? 'active' : ''}`}
            onClick={() => setSubTab('scores')}
          >
            수동 점수 가감
          </button>
          <button
            type="button"
            className={`subtab-btn ${subTab === 'config' ? 'active' : ''}`}
            onClick={() => setSubTab('config')}
          >
            시스템 설정
          </button>
        </div>
      </section>

      {/* Sub-tab 1: Member & Role Management */}
      {subTab === 'members' && (
        <section className="list-section">
          {/* Super Admin Control Bar */}
          {isSuper && (
            <div
              style={{
                marginBottom: '14px',
                padding: '12px 14px',
                background: 'linear-gradient(135deg, rgba(15,23,42,0.06), rgba(30,41,59,0.03))',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px'
              }}
            >
              <div>
                <strong style={{ fontSize: '14px', color: '#0f172a' }}>
                  👑 슈퍼 어드민 콘솔 (최고 관리자 전용)
                </strong>
                <div className="sub-meta" style={{ fontSize: '12px', marginTop: '2px' }}>
                  전체 DB 백업 다운로드 · 최초 방장 지정 · 회원 시점 열람(Impersonate) 가능
                </div>
              </div>

              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleDownloadBackup}
                title="전체 데이터베이스(회원, 모임, 설정)를 JSON 파일로 다운로드합니다."
              >
                💾 전체 데이터 백업 (JSON 다운로드)
              </button>
            </div>
          )}

          <div className="filter-bar" style={{ marginTop: 0, marginBottom: '12px' }}>
            <input
              type="text"
              placeholder="회원 이름 또는 닉네임 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="divider-list">
            {filteredMembers.map((m) => (
              <div key={m.uid} className="list-item-row admin-member-row">
                <div className="admin-member-info">
                  <div className="rank-name-line">
                    <strong>{formatMemberNickname(m)}</strong>
                    <span
                      className="role-pill"
                      style={{
                        backgroundColor:
                          ROLE_META[m.role]?.badgeColor || 'var(--role-member, #64748b)'
                      }}
                    >
                      {ROLE_META[m.role]?.label || '일반회원'}
                    </span>
                  </div>
                  <div className="sub-meta">
                    연고지: {m.homeCity} · 참석 {m.attendanceCount}회 · 총점 {m.totalScore}점 (기본{' '}
                    {m.baseScore} / 원정 {m.expeditionScore} / 이벤트 {m.eventScore})
                  </div>
                </div>

                <div className="admin-member-controls">
                  {/* Super Admin Special Actions: Impersonate & Assign Leader */}
                  {isSuper && (
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      {m.uid !== currentUser?.uid && onImpersonateUser && (
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '11px', padding: '3px 7px' }}
                          onClick={() => onImpersonateUser(m.uid)}
                          title="해당 회원의 시점으로 화면을 열람합니다."
                        >
                          👁️ 이 회원으로 보기
                        </button>
                      )}
                      {m.role !== 'Leader' && m.role !== 'SuperAdmin' && (
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '11px', padding: '3px 7px', color: '#f59e0b' }}
                          onClick={() => handleAssignLeader(m.uid)}
                          title="해당 회원을 방장(Leader)으로 지정합니다."
                        >
                          👑 방장 지정
                        </button>
                      )}
                    </div>
                  )}

                  <div className="control-inline">
                    <label htmlFor={`role-${m.uid}`}>등급</label>
                    <select
                      id={`role-${m.uid}`}
                      value={m.role}
                      onChange={(e) =>
                        onAdminUpdateMember(m.uid, { role: e.target.value })
                      }
                    >
                      {ROLE_KEYS.map((roleKey) => (
                        <option key={roleKey} value={roleKey}>
                          {ROLE_META[roleKey].label} ({roleKey})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="control-inline">
                    <label htmlFor={`badge-${m.uid}`}>커스텀 뱃지</label>
                    <input
                      id={`badge-${m.uid}`}
                      type="text"
                      placeholder={`기본(${m.entryBadge})`}
                      value={m.customBadge || ''}
                      onChange={(e) =>
                        onAdminUpdateMember(m.uid, {
                          customBadge: e.target.value
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Sub-tab: Meeting Management (확장형 모임 관리) */}
      {subTab === 'meetings' && (
        <section className="list-section">
          <div className="section-title-row" style={{ marginBottom: '12px' }}>
            <div>
              <h3>모임 관리</h3>
              <p className="sub-meta">최신순 전체 모임 목록 · 카드 클릭 시 모임 상세로 이동합니다.</p>
            </div>
            <span className="platform-badge">{meetings.length}건</span>
          </div>

          {meetings.length === 0 ? (
            <p className="muted-text">등록된 모임이 없습니다.</p>
          ) : (
            <div className="divider-list">
              {[...meetings]
                .sort((a, b) => String(b.date || b.id).localeCompare(String(a.date || a.id)))
                .map((m) => {
                  const applicants = m.applicants || [];
                  const isExpanded = expandedMeetingId === m.id;
                  const treasurerUid = m.treasurerUid || m.hostUid;

                  return (
                    <div
                      key={m.id}
                      className="list-item-row admin-meeting-card"
                      onClick={() => onOpenMeetingDetail && onOpenMeetingDetail(m.id)}
                      style={{
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'stretch',
                        gap: '8px'
                      }}
                    >
                      {/* Compact Primary Row: 일시 · 제목 · 00명 참석 */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '10px',
                          flexWrap: 'wrap'
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            flex: 1,
                            minWidth: '200px'
                          }}
                        >
                          <span className="muted-text" style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>
                            {m.date ? String(m.date).slice(5, 16) : '일시 미정'}
                          </span>
                          <strong style={{ fontSize: '15px' }}>{m.title}</strong>
                          <span
                            className={`status-pill ${
                              m.status === 'settled' ? 'settled' : 'open'
                            }`}
                            style={{ fontSize: '11px', padding: '2px 6px' }}
                          >
                            {m.status === 'settled' ? '정산완료' : '진행중'}
                          </span>
                        </div>

                        {/* Interactive Attendees Trigger & Extension Slot */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          <button
                            type="button"
                            className={`btn btn-sm ${isExpanded ? 'btn-primary' : 'btn-outline'}`}
                            style={{
                              padding: '3px 9px',
                              fontSize: '12px',
                              borderRadius: '14px',
                              whiteSpace: 'nowrap'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedMeetingId(isExpanded ? null : m.id);
                            }}
                            title="참석자 명단 펼치기/접기"
                          >
                            👥 {applicants.length}명 참석 {isExpanded ? '▲' : '▼'}
                          </button>

                          {/* Future Extension Action Slot (모임 취소/삭제/벙대기실 승인 등 확장 가능) */}
                          <div
                            className="admin-meeting-actions-slot"
                            onClick={(e) => e.stopPropagation()}
                            style={{ display: 'inline-flex', alignItems: 'center' }}
                          >
                            <span className="sub-meta" style={{ fontSize: '12px' }}>
                              상세 →
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Inline Accordion: Attendees List */}
                      {isExpanded && (
                        <div
                          className="admin-attendee-accordion"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            marginTop: '6px',
                            padding: '10px 12px',
                            background: 'var(--bg-subtle, rgba(0,0,0,0.03))',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color, #e5e7eb)'
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginBottom: '8px'
                            }}
                          >
                            <span className="sub-meta" style={{ fontWeight: 600 }}>
                              참석 신청자 명단 ({applicants.length}명)
                            </span>
                            <span className="muted-text" style={{ fontSize: '11px' }}>
                              장소: {m.location}
                            </span>
                          </div>

                          {applicants.length === 0 ? (
                            <p className="muted-text" style={{ margin: 0, fontSize: '12px' }}>
                              참석 신청자가 없습니다.
                            </p>
                          ) : (
                            <div className="detail-attendee-grid" style={{ marginTop: 0 }}>
                              {applicants.map((uid) => {
                                const mem = members.find((memObj) => memObj.uid === uid);
                                if (!mem) return null;
                                const isHost = uid === m.hostUid;
                                const isTreasurer = uid === treasurerUid;
                                return (
                                  <div key={uid} className="detail-attendee-item">
                                    <span
                                      className="feed-avatar-circle sm"
                                      style={{ backgroundColor: getAvatarBg(uid) }}
                                    >
                                      {mem.realName ? mem.realName.slice(0, 1) : '?'}
                                    </span>
                                    <span className="detail-attendee-nick">
                                      {formatMemberNickname(mem)}
                                    </span>
                                    {isHost && (
                                      <span className="platform-badge" style={{ fontSize: '10px' }}>
                                        주최
                                      </span>
                                    )}
                                    {!isHost && isTreasurer && (
                                      <span className="location-pill" style={{ fontSize: '10px' }}>
                                        총무
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </section>
      )}

      {/* Sub-tab 2: Manual Event Score Grant / Deduct */}
      {subTab === 'scores' && (
        <section className="list-section">
          <h3 style={{ marginBottom: '12px' }}>수동 점수 가감</h3>

          <form onSubmit={handleAdjustScoreSubmit} className="stack-gap">
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="score-target">대상 회원 선택</label>
                <select
                  id="score-target"
                  value={scoreForm.targetUid}
                  onChange={(e) =>
                    setScoreForm({ ...scoreForm, targetUid: e.target.value })
                  }
                >
                  {members.map((m) => (
                    <option key={m.uid} value={m.uid}>
                      {formatMemberNickname(m)} (현재 {m.totalScore}점)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="score-delta">가감 점수 (예: +2 또는 -1)</label>
                <input
                  id="score-delta"
                  type="number"
                  required
                  value={scoreForm.delta}
                  onChange={(e) =>
                    setScoreForm({ ...scoreForm, delta: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="score-reason">지급 / 차감 사유</label>
              <input
                id="score-reason"
                type="text"
                required
                placeholder="예: 11월 우수 모임장 이벤트 보너스"
                value={scoreForm.reason}
                onChange={(e) =>
                  setScoreForm({ ...scoreForm, reason: e.target.value })
                }
              />
            </div>

            {scoreNotice && <div className="success-banner">✅ {scoreNotice}</div>}

            <div className="btn-row">
              <button type="submit" className="btn btn-primary">
                점수 즉시 반영
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Sub-tab 3: Notice & Community Rules Settings */}
      {subTab === 'config' && (
        <section className="list-section">
          <h3 style={{ marginBottom: '12px' }}>
            홈 공지 및 신입 공지 (상단 20자 요약 포함) 설정
          </h3>
          <form onSubmit={handleConfigSubmit} className="stack-gap">
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="cfg-home-summary">
                  홈 상단 20자 요약 공지 (카톡 미리보기 타이틀)
                </label>
                <input
                  id="cfg-home-summary"
                  type="text"
                  maxLength={25}
                  required
                  value={configForm.homeSummary}
                  onChange={(e) =>
                    setConfigForm({
                      ...configForm,
                      homeSummary: e.target.value
                    })
                  }
                />
              </div>

              <div className="form-field">
                <label htmlFor="cfg-newcomer-summary">
                  신입 닉네임 상단 20자 신입 공지 요약
                </label>
                <input
                  id="cfg-newcomer-summary"
                  type="text"
                  maxLength={25}
                  required
                  value={configForm.newcomerSummary}
                  onChange={(e) =>
                    setConfigForm({
                      ...configForm,
                      newcomerSummary: e.target.value
                    })
                  }
                />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="cfg-title">홈 공지 배너 제목</label>
              <input
                id="cfg-title"
                type="text"
                required
                value={configForm.noticeTitle}
                onChange={(e) =>
                  setConfigForm({ ...configForm, noticeTitle: e.target.value })
                }
              />
            </div>

            <div className="form-field">
              <label htmlFor="cfg-body">홈 공지 및 규칙 본문</label>
              <textarea
                id="cfg-body"
                rows={4}
                required
                value={configForm.noticeBody}
                onChange={(e) =>
                  setConfigForm({ ...configForm, noticeBody: e.target.value })
                }
              />
            </div>

            <div className="form-field">
              <label htmlFor="cfg-newcomer-body">
                신입 닉네임 페이지(/nickname) 안내 공지 본문
              </label>
              <textarea
                id="cfg-newcomer-body"
                rows={3}
                required
                value={configForm.newcomerNoticeBody}
                onChange={(e) =>
                  setConfigForm({
                    ...configForm,
                    newcomerNoticeBody: e.target.value
                  })
                }
              />
            </div>

            <div className="form-field">
              <label htmlFor="cfg-drive-url">
                개인 구글 드라이브 앨범 브릿지 URL (Google Apps Script Web App)
              </label>
              <input
                id="cfg-drive-url"
                type="url"
                placeholder="https://script.google.com/macros/s/.../exec"
                value={configForm.googleDriveBridgeUrl || ''}
                onChange={(e) =>
                  setConfigForm({
                    ...configForm,
                    googleDriveBridgeUrl: e.target.value
                  })
                }
              />
            </div>

            {configNotice && <div className="success-banner">✅ {configNotice}</div>}

            <div className="btn-row">
              <button type="submit" className="btn btn-primary">
                공지 설정 저장
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import {
  formatMemberNickname,
  ROLE_KEYS,
  ROLE_META
} from '../core/communityRules';

export default function AdminPage({
  members,
  communityConfig,
  onAdminUpdateMember,
  onAdminAdjustEventScore,
  onAdminUpdateConfig
}) {
  const [subTab, setSubTab] = useState('members'); // 'members' | 'scores' | 'config'
  const [searchQuery, setSearchQuery] = useState('');

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
      communityConfig.homeSummary || '공지 · 규격 닉네임 및 벙 규칙',
    noticeTitle: communityConfig.noticeTitle,
    noticeBody: communityConfig.noticeBody,
    newcomerSummary:
      communityConfig.newcomerSummary || '신입공지 · 입장 즉시 닉네임 변경',
    newcomerNoticeBody:
      communityConfig.newcomerNoticeBody ||
      'Healing78 오픈채팅방 입장 후 24시간 이내에 아래 자동 생성기로 규격 닉네임을 만들어 카톡방 프로필을 변경해 주세요.'
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
            공지·규칙 설정
          </button>
        </div>
      </section>

      {/* Sub-tab 1: Member & Role Management */}
      {subTab === 'members' && (
        <section className="list-section">
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
                      style={{ backgroundColor: ROLE_META[m.role]?.badgeColor }}
                    >
                      {ROLE_META[m.role]?.label}
                    </span>
                  </div>
                  <div className="sub-meta">
                    연고지: {m.homeCity} · 참석 {m.attendanceCount}회 · 총점 {m.totalScore}점 (기본{' '}
                    {m.baseScore} / 원정 {m.expeditionScore} / 이벤트 {m.eventScore})
                  </div>
                </div>

                <div className="admin-member-controls">
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
                placeholder="예: 11월 벙주왕 이벤트 보너스"
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

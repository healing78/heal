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
    noticeTitle: communityConfig.noticeTitle,
    noticeBody: communityConfig.noticeBody
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
    <div className="stack-gap">
      <div className="card">
        <div className="section-title-row">
          <div>
            <h2>운영진 전용 관리 센터 (방장 · 부방장)</h2>
            <p className="muted-text">
              회원 등급/상태(VIP·일반·방랑자·탈퇴·강퇴) 및 커스텀 뱃지 변경, 수동 이벤트 점수 가감, 홈 공지 설정을 관리합니다.
            </p>
          </div>
          <span className="platform-badge">Admin Only</span>
        </div>

        <div className="subtab-bar">
          <button
            type="button"
            className={`subtab-btn ${subTab === 'members' ? 'active' : ''}`}
            onClick={() => setSubTab('members')}
          >
            회원 · 역할 관리 ({members.length})
          </button>
          <button
            type="button"
            className={`subtab-btn ${subTab === 'scores' ? 'active' : ''}`}
            onClick={() => setSubTab('scores')}
          >
            수동 점수 부여 · 차감
          </button>
          <button
            type="button"
            className={`subtab-btn ${subTab === 'config' ? 'active' : ''}`}
            onClick={() => setSubTab('config')}
          >
            공지 및 역할/규칙 설정
          </button>
        </div>
      </div>

      {/* Sub-tab 1: Member & Role Management */}
      {subTab === 'members' && (
        <section className="card stack-gap">
          <div className="filter-bar">
            <input
              type="text"
              placeholder="회원 이름 또는 닉네임 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="admin-member-list">
            {filteredMembers.map((m) => (
              <div key={m.uid} className="sub-card admin-member-row">
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
        <section className="card">
          <h3>이벤트 점수 수동 부여 · 차감</h3>
          <p className="muted-text">
            특정 회원에게 이벤트 가산점(+) 또는 규정 위반 감점(-)을 부여하고 점수 내역에 사유를 기록합니다.
          </p>

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
        <section className="card">
          <h3>홈 공지사항 및 커뮤니티 규칙 설정</h3>
          <form onSubmit={handleConfigSubmit} className="stack-gap">
            <div className="form-field">
              <label htmlFor="cfg-title">공지 배너 제목</label>
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
              <label htmlFor="cfg-body">공지 및 규칙 본문</label>
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

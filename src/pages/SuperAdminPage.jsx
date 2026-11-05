import React, { useState } from 'react';
import {
  formatMemberNickname,
  ROLE_KEYS,
  ROLE_META
} from '../core/communityRules';
import { useArmedAction } from '../utils/useArmedAction';

const AVATAR_BG_PALETTE = [
  '#f59e0b',
  '#3b82f6',
  '#10b981',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#0284c7'
];

function getAvatarBg(uid) {
  const str = String(uid || '');
  let sum = 0;
  for (let i = 0; i < str.length; i += 1) {
    sum += str.charCodeAt(i);
  }
  return AVATAR_BG_PALETTE[sum % AVATAR_BG_PALETTE.length];
}

export default function SuperAdminPage({
  currentUser,
  members = [],
  meetings = [],
  communityConfig = {},
  onAdminUpdateMember,
  onAdminUpdateConfig,
  onToggleMasterTab,
  onNavigateTab,
  onImpersonateUser
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [newSuperUid, setNewSuperUid] = useState('');
  const [copiedUid, setCopiedUid] = useState(false);
  const [actionFeedback, setActionFeedback] = useState('');
  const { isArmed, runArmed } = useArmedAction();
  const [editingBadgeUid, setEditingBadgeUid] = useState(null);
  const [badgeInput, setBadgeInput] = useState('');
  const [driveBridgeUrl, setDriveBridgeUrl] = useState(
    communityConfig.googleDriveBridgeUrl || ''
  );

  const superAdminUids = Array.isArray(communityConfig?.superAdminUids)
    ? communityConfig.superAdminUids
    : [];

  const handleCopyUid = async (uidToCopy) => {
    try {
      await navigator.clipboard.writeText(uidToCopy);
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 2000);
    } catch {
      setCopiedUid(false);
    }
  };

  const handleSaveDriveBridge = (e) => {
    e.preventDefault();
    onAdminUpdateConfig({ googleDriveBridgeUrl: driveBridgeUrl.trim() });
    setActionFeedback('✅ 구글 드라이브 앨범 브릿지 URL이 저장되었습니다.');
    setTimeout(() => setActionFeedback(''), 3000);
  };

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

    setActionFeedback('✅ 전체 데이터 백업(JSON)이 다운로드되었습니다.');
    setTimeout(() => setActionFeedback(''), 3000);
  };

  const handleAssignLeader = (targetUid) => {
    const targetMember = members.find((m) => m.uid === targetUid);
    const targetNick = targetMember ? formatMemberNickname(targetMember) : targetUid;
    onAdminUpdateMember(targetUid, { role: 'Leader' });
    setActionFeedback(`✅ ${targetNick} 님이 방장(Leader)으로 지정되었습니다.`);
    setTimeout(() => setActionFeedback(''), 3000);
  };

  const handleAddSuperUid = (e) => {
    e.preventDefault();
    const clean = newSuperUid.trim();
    if (!clean) return;
    if (superAdminUids.includes(clean)) {
      setActionFeedback('⚠️ 이미 등록된 슈퍼 어드민 UID입니다.');
      setTimeout(() => setActionFeedback(''), 3000);
      return;
    }
    const nextList = [...superAdminUids, clean];
    onAdminUpdateConfig({ superAdminUids: nextList });
    setNewSuperUid('');
    setActionFeedback(`✅ UID (${clean})가 슈퍼 어드민 화이트리스트에 추가되었습니다.`);
    setTimeout(() => setActionFeedback(''), 3000);
  };

  const handleRemoveSuperUid = (targetUid) => {
    const nextList = superAdminUids.filter((u) => u !== targetUid);
    onAdminUpdateConfig({ superAdminUids: nextList });
    setActionFeedback(`✅ UID (${targetUid})가 슈퍼 어드민 목록에서 제거되었습니다.`);
    setTimeout(() => setActionFeedback(''), 3000);
  };

  const handleSaveBadge = (targetUid) => {
    onAdminUpdateMember(targetUid, { customBadge: badgeInput.trim() });
    setEditingBadgeUid(null);
    setBadgeInput('');
    setActionFeedback('✅ 커스텀 뱃지가 업데이트되었습니다.');
    setTimeout(() => setActionFeedback(''), 2500);
  };

  const filteredMembers = members.filter((m) => {
    const nick = formatMemberNickname(m);
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      nick.toLowerCase().includes(q) ||
      m.realName.toLowerCase().includes(q) ||
      m.uid.toLowerCase().includes(q) ||
      m.homeCity.toLowerCase().includes(q)
    );
  });

  return (
    <div className="list-container">
      {/* Header */}
      <section className="list-section">
        <div className="section-title-row">
          <h2>마스터 관리 센터</h2>
          <span className="platform-badge" style={{ background: '#7c3aed', color: '#fff' }}>
            👑 Master
          </span>
        </div>
        <p className="sub-meta" style={{ marginTop: '4px' }}>
          최고관리자(Stealth SuperAdmin) 전용 콘솔입니다. 일반 회원 및 운영진 목록에 노출되지 않으며,
          전체 DB 백업 다운로드, 회원 시점 열람(Impersonate), 최초 방장 지정 및 슈퍼 계정 화이트리스트를 관리합니다.
        </p>

        {actionFeedback && (
          <div className="success-banner" style={{ marginTop: '10px' }}>
            {actionFeedback}
          </div>
        )}
      </section>

      {/* Section 1: Master Account & DB Backup */}
      <section className="list-section">
        <h3 style={{ marginBottom: '12px' }}>마스터 계정 정보 & 전체 데이터 백업</h3>
        <div
          style={{
            padding: '14px',
            background: 'var(--color-bg-secondary, #f8fafc)',
            border: '1px solid var(--color-border, #e2e8f0)',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>현재 접속 마스터 UID:</div>
              <div style={{ fontFamily: 'monospace', fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                {currentUser?.uid || '미확인'}
              </div>
            </div>
            {currentUser?.uid && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => handleCopyUid(currentUser.uid)}
              >
                {copiedUid ? '✅ 복사됨!' : '📋 내 UID 복사'}
              </button>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--color-border, #e2e8f0)', paddingTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleDownloadBackup}
              title="전체 데이터베이스(회원, 모임, 설정)를 JSON 파일로 다운로드합니다."
            >
              💾 전체 DB 데이터 백업 (JSON 다운로드)
            </button>
            {onToggleMasterTab && (
              <button
                type="button"
                className="btn btn-outline"
                style={{ color: '#ef4444', borderColor: '#fca5a5' }}
                onClick={() => {
                  onToggleMasterTab(false);
                  if (onNavigateTab) onNavigateTab('profile');
                }}
                title="마스터 탭을 네비게이션 메뉴에서 숨기고 프로필 화면으로 이동합니다."
              >
                🔒 마스터 탭 숨기기 (비활성화)
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Section 2: Google Drive Album Bridge URL */}
      <section className="list-section">
        <h3 style={{ marginBottom: '8px' }}>구글 드라이브 앨범 브릿지 연동 설정</h3>
        <p className="sub-meta" style={{ marginBottom: '10px' }}>
          개인 구글 드라이브를 모임 사진/동영상 업로드 저장소로 연동하는 Google Apps Script Web App URL입니다. (최고관리자만 수정 가능)
        </p>
        <form onSubmit={handleSaveDriveBridge} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <input
            type="url"
            placeholder="https://script.google.com/macros/s/.../exec"
            value={driveBridgeUrl}
            onChange={(e) => setDriveBridgeUrl(e.target.value)}
            style={{ flex: 1, minWidth: '240px' }}
          />
          <button type="submit" className="btn btn-primary btn-sm">
            저장
          </button>
        </form>
      </section>

      {/* Section 3: Super Admin Whitelist Management */}
      <section className="list-section">
        <h3 style={{ marginBottom: '12px' }}>최고 관리자(슈퍼 계정) 화이트리스트 관리</h3>
        <p className="sub-meta" style={{ marginBottom: '10px' }}>
          여기에 등록된 카카오 UID는 등급(Role)이 일반회원으로 disguise(위장)되어 있어도
          시스템의 모든 슈퍼 관리 권한 및 마스터 탭을 독점적으로 이용할 수 있습니다.
        </p>

        <form onSubmit={handleAddSuperUid} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <input
            type="text"
            placeholder="추가할 회원의 카카오 UID 입력..."
            value={newSuperUid}
            onChange={(e) => setNewSuperUid(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-primary btn-sm">
            ➕ UID 추가
          </button>
        </form>

        <div className="divider-list">
          {superAdminUids.map((uid) => {
            const matchedMember = members.find((m) => m.uid === uid);
            const isMe = uid === currentUser?.uid;
            return (
              <div
                key={uid}
                className="list-item-row"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ fontFamily: 'monospace', fontSize: '13px' }}>{uid}</strong>
                    {isMe && (
                      <span className="role-pill" style={{ background: '#7c3aed', color: '#fff', fontSize: '10px' }}>
                        내 계정
                      </span>
                    )}
                  </div>
                  <div className="sub-meta" style={{ fontSize: '12px', marginTop: '2px' }}>
                    {matchedMember
                      ? `${formatMemberNickname(matchedMember)} (${matchedMember.realName} / ${matchedMember.role})`
                      : '등록된 회원 프로필 없음 (UID 단독 등록)'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '11px', padding: '3px 8px' }}
                    onClick={() => handleCopyUid(uid)}
                  >
                    복사
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '11px', padding: '3px 8px', color: '#ef4444' }}
                    onClick={() =>
                      runArmed(`remove-super:${uid}`, () => handleRemoveSuperUid(uid))
                    }
                  >
                    {isArmed(`remove-super:${uid}`)
                      ? uid === currentUser?.uid
                        ? '본인 해제 확인'
                        : '제거 확인'
                      : '제거'}
                  </button>
                </div>
              </div>
            );
          })}
          {superAdminUids.length === 0 && (
            <div className="empty-notice">등록된 최고관리자 UID가 없습니다.</div>
          )}
        </div>
      </section>

      {/* Section 3: Master Member Management & Impersonation */}
      <section className="list-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ margin: 0 }}>전체 회원 관리 & 시점 열람(Impersonate)</h3>
          <span className="sub-meta">총 {members.length}명 ({filteredMembers.length}명 표시)</span>
        </div>

        <div className="filter-bar" style={{ marginTop: 0, marginBottom: '12px' }}>
          <input
            type="text"
            placeholder="회원 이름, 닉네임, UID, 연고지 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="divider-list">
          {filteredMembers.map((m) => {
            const isMe = m.uid === currentUser?.uid;
            const isEditingBadge = editingBadgeUid === m.uid;

            return (
              <div key={m.uid} className="list-item-row admin-member-row">
                <div className="admin-member-info">
                  <div className="rank-name-line">
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: getAvatarBg(m.uid),
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '12px',
                        marginRight: '6px'
                      }}
                    >
                      {m.realName?.slice(0, 1) || '회'}
                    </span>
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
                    {m.customBadge && (
                      <span className="role-pill" style={{ backgroundColor: '#0284c7' }}>
                        {m.customBadge}
                      </span>
                    )}
                  </div>
                  <div className="sub-meta">
                    UID: <span style={{ fontFamily: 'monospace' }}>{m.uid}</span> · 연고지: {m.homeCity} ·
                    참석 {m.attendanceCount}회 · 총점 {m.totalScore}점 (기본 {m.baseScore} / 원정 {m.expeditionScore} / 이벤트 {m.eventScore})
                  </div>
                </div>

                <div className="admin-member-controls">
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Impersonate Button */}
                    {!isMe && onImpersonateUser && (
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '11px', padding: '4px 8px' }}
                        onClick={() => onImpersonateUser(m.uid)}
                        title="해당 회원의 시점으로 화면을 열람합니다."
                      >
                        👁️ 이 회원으로 보기
                      </button>
                    )}

                    {/* Assign Leader Button */}
                    {m.role !== 'Leader' && (
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '11px', padding: '4px 8px', color: '#f59e0b' }}
                        onClick={() =>
                          runArmed(`assign-leader:${m.uid}`, () =>
                            handleAssignLeader(m.uid)
                          )
                        }
                        title="해당 회원을 방장(Leader)으로 지정합니다."
                      >
                        {isArmed(`assign-leader:${m.uid}`) ? '지정 확인' : '👑 방장 지정'}
                      </button>
                    )}

                    {/* Role Dropdown */}
                    <div className="control-inline">
                      <label htmlFor={`super-role-${m.uid}`}>등급</label>
                      <select
                        id={`super-role-${m.uid}`}
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

                    {/* Custom Badge Edit */}
                    {isEditingBadge ? (
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <input
                          type="text"
                          placeholder="커스텀 뱃지..."
                          value={badgeInput}
                          onChange={(e) => setBadgeInput(e.target.value)}
                          style={{ width: '100px', padding: '2px 6px', fontSize: '12px' }}
                        />
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          style={{ padding: '2px 6px', fontSize: '11px' }}
                          onClick={() => handleSaveBadge(m.uid)}
                        >
                          저장
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ padding: '2px 6px', fontSize: '11px' }}
                          onClick={() => setEditingBadgeUid(null)}
                        >
                          취소
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '11px', padding: '4px 8px' }}
                        onClick={() => {
                          setEditingBadgeUid(m.uid);
                          setBadgeInput(m.customBadge || '');
                        }}
                      >
                        🏷️ 뱃지
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
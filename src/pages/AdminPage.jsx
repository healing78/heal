import React, { useState } from 'react';
import { useArmedAction } from '../utils/useArmedAction';
import {
  formatMemberNickname,
  ROLE_KEYS,
  ROLE_META
} from '../core/communityRules';
import { formatScheduleDetailText } from '../core/routeMeta';

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

export default function AdminPage({
  currentUser,
  members = [],
  meetings = [],
  communityConfig = {},
  onOpenMeetingDetail,
  onUpdateMeeting,
  onDeleteMeeting,
  onAdminUpdateMember,
  onAdminAdjustEventScore,
  onAdminUpdateConfig,
  onApproveAccountLink,
  onRejectAccountLink
}) {
  const [subTab, setSubTab] = useState('members'); // 'members' | 'meetings' | 'requests' | 'scores' | 'config'
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedMeetingId, setExpandedMeetingId] = useState(null);

  // Account link / recovery requests
  const pendingLinkRequests = members.filter(
    (m) => Boolean(m.linkRequestStatus === 'pending' || (m.linkRequestRealName && m.linkRequestStatus !== 'rejected'))
  );

  // Lounge early access requests
  const pendingLoungeRequests = meetings.filter(
    (m) => m.requestAttendance !== false && m.loungeStatus === 'requested'
  );
  const approvedLoungeMeetings = meetings.filter(
    (m) => m.requestAttendance !== false && m.loungeStatus === 'approved'
  );

  const totalRequestsCount = pendingLoungeRequests.length + pendingLinkRequests.length;

  const handleApproveLoungeRequest = async (meetingId) => {
    if (!onUpdateMeeting) return;
    try {
      await onUpdateMeeting(meetingId, {
        loungeStatus: 'approved',
        loungeApprovedByUid: currentUser?.uid || '',
        loungeApprovedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to approve request:', err);
    }
  };

  // Inline two-tap confirm for destructive actions (no native dialogs)
  const { isArmed, runArmed } = useArmedAction();

  const handleRejectLoungeRequest = async (meetingId) => {
    if (!onUpdateMeeting) return;
    try {
      await onUpdateMeeting(meetingId, {
        loungeStatus: null,
        loungeRequest: null
      });
    } catch (err) {
      console.error('Failed to reject request:', err);
    }
  };

  const handleCancelLoungeApproval = async (meetingId) => {
    if (!onUpdateMeeting) return;
    try {
      await onUpdateMeeting(meetingId, {
        loungeStatus: null
      });
    } catch (err) {
      console.error('Failed to cancel approval:', err);
    }
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
    noticeTitle: communityConfig.noticeTitle || '',
    noticeBody: communityConfig.noticeBody || '',
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
    onAdminUpdateConfig({
      ...communityConfig,
      ...configForm
    });
    setConfigNotice('공지사항 및 시스템 연동 설정이 저장되었습니다.');
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
            회원·역할 ({members.length})
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
            className={`subtab-btn ${subTab === 'requests' ? 'active' : ''}`}
            onClick={() => setSubTab('requests')}
          >
            요청
            {totalRequestsCount > 0 && (
              <span className="lounge-waiting-badge" style={{ marginLeft: '6px' }}>
                {totalRequestsCount}
              </span>
            )}
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

      {/* Sub-tab: Requests Management (계정 연동 승인 및 벙대기실 조기 오픈) */}
      {subTab === 'requests' && (
        <>
          {/* Section 1: Account Link / Historical Data Transfer Requests */}
          <section className="list-section" style={{ marginBottom: '16px' }}>
            <div className="section-title-row">
              <h3 style={{ margin: 0 }}>
                회원 계정 연동 및 이전 이력 복구 승인 요청 ({pendingLinkRequests.length})
              </h3>
            </div>
            <p className="sub-meta" style={{ marginTop: '4px', marginBottom: '10px' }}>
              카카오로 가입한 회원이 이전 벙기록/탈퇴자/방랑자 계정으로 연동을 신청한 목록입니다. 단톡방 본인 확인 후 승인 시 이전 최초 가입일, 누적 벙점수, 주최/참석 이력이 새 카카오 계정으로 안전하게 합쳐집니다.
            </p>

            {pendingLinkRequests.length === 0 ? (
              <p className="muted-text" style={{ padding: '12px 0' }}>
                현재 대기 중인 계정 연동 요청이 없습니다.
              </p>
            ) : (
              <div className="divider-list" style={{ marginTop: '10px' }}>
                {pendingLinkRequests.map((applicant) => {
                  const target = members.find(
                    (x) =>
                      x.uid === applicant.linkRequestSourceUid ||
                      (applicant.linkRequestRealName &&
                        x.realName.toLowerCase() === applicant.linkRequestRealName.toLowerCase())
                  );

                  return (
                    <div
                      key={applicant.uid}
                      style={{
                        padding: '12px',
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        marginBottom: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <span style={{ fontSize: '14px', fontWeight: 700 }}>
                            신청자: {formatMemberNickname(applicant)}
                          </span>
                          <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '6px' }}>
                            ({applicant.uid})
                          </span>
                        </div>
                        <span className="lounge-waiting-badge">승인 대기</span>
                      </div>

                      {target ? (
                        <div
                          style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            padding: '8px 10px',
                            fontSize: '12px',
                            lineHeight: 1.6
                          }}
                        >
                          <div>
                            <strong>연계 대상 원본:</strong>{' '}
                            <span style={{ fontWeight: 700, color: '#0f172a' }}>
                              [{ROLE_META[target.role]?.label}] {formatMemberNickname(target)}
                            </span>{' '}
                            (UID: {target.uid})
                          </div>
                          <div>
                            <strong>승계될 이력:</strong> 누적 점수{' '}
                            <span style={{ fontWeight: 700, color: '#e11d48' }}>
                              {target.totalScore}점
                            </span>{' '}
                            (참석 {target.attendanceCount}회, 주최 {target.hostCount}회)
                          </div>
                          <div>
                            <strong>최초 가입일:</strong> {target.joinedAt || '기록 없음'} (뱃지 {target.entryBadge}) · 거주지 {target.city}
                          </div>
                          {target.role === 'Withdrawn' || target.role === 'Wanderer' ? (
                            <div style={{ color: '#b45309', fontWeight: 600 }}>
                              ⚠️ 현재 상태가 [{ROLE_META[target.role]?.label}]입니다. 승인 시 활동 등급({target.totalScore >= 100 ? 'VIP' : '일반회원'})으로 즉시 복원됩니다.
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          신청 닉네임: <strong>{applicant.linkRequestRealName || '미지정'}</strong> (일치하는 원본을 찾을 수 없습니다)
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        {target && onApproveAccountLink && (
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() =>
                              runArmed(`approve-link:${applicant.uid}`, () =>
                                onApproveAccountLink(applicant.uid, target.uid)
                              )
                            }
                          >
                            {isArmed(`approve-link:${applicant.uid}`)
                              ? '확인: 모든 이력 승계 및 합치기'
                              : '✅ 승인 (계정 연동 & 이력 승계)'}
                          </button>
                        )}
                        {onRejectAccountLink && (
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            style={{ color: '#ef4444', borderColor: '#fca5a5' }}
                            onClick={() =>
                              runArmed(`reject-link:${applicant.uid}`, () =>
                                onRejectAccountLink(applicant.uid)
                              )
                            }
                          >
                            {isArmed(`reject-link:${applicant.uid}`) ? '반려 확인' : '❌ 반려'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Section 2: Early Lounge Access Requests */}
          <section className="list-section">
            <div className="section-title-row">
              <h3 style={{ margin: 0 }}>
                벙대기실 조기 오픈 대기 요청 ({pendingLoungeRequests.length})
              </h3>
            </div>

          {pendingLoungeRequests.length === 0 ? (
            <p className="muted-text" style={{ padding: '16px 0' }}>
              현재 대기 중인 벙대기실 조기 오픈 요청이 없습니다.
            </p>
          ) : (
            <div className="divider-list" style={{ marginTop: '12px' }}>
              {pendingLoungeRequests.map((m) => {
                const scheduleText = formatScheduleDetailText(m);
                const req = m.loungeRequest || {};
                const requestedTime = req.requestedAt
                  ? new Date(req.requestedAt).toLocaleString('ko-KR', {
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : '일시 미상';

                return (
                  <div key={m.id} className="admin-request-card">
                    <div className="admin-request-header">
                      <div>
                        <span className="platform-badge" style={{ marginRight: '6px' }}>#{m.id}</span>
                        <strong style={{ fontSize: '15px' }}>{m.title}</strong>
                      </div>
                      <span className="lounge-waiting-badge">승인 대기 중</span>
                    </div>

                    <div className="admin-request-body">
                      <div><strong>일정:</strong> {scheduleText}</div>
                      <div style={{ marginTop: '4px' }}>
                        <strong>요청자:</strong> {req.requestedByName || '참석자'}{' '}
                        <span className="sub-meta">({requestedTime})</span>
                      </div>
                    </div>

                    <div className="admin-request-actions" style={{ marginTop: '8px' }}>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => handleApproveLoungeRequest(m.id)}
                      >
                        승인 (조기 오픈)
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${
                          isArmed(`reject:${m.id}`) ? 'btn-primary' : 'btn-outline'
                        }`}
                        onClick={() =>
                          runArmed(`reject:${m.id}`, () =>
                            handleRejectLoungeRequest(m.id)
                          )
                        }
                      >
                        {isArmed(`reject:${m.id}`) ? '반려 확인' : '반려'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => onOpenMeetingDetail && onOpenMeetingDetail(m.id)}
                      >
                        모임 상세
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Approved Open Meetings */}
          {approvedLoungeMeetings.length > 0 && (
            <div style={{ marginTop: '30px' }}>
              <div className="section-title-row">
                <h3 style={{ margin: 0, fontSize: '15px' }}>
                  사전 승인 완료된 벙대기실 ({approvedLoungeMeetings.length})
                </h3>
              </div>
              <div className="divider-list" style={{ marginTop: '10px' }}>
                {approvedLoungeMeetings.map((m) => (
                  <div
                    key={m.id}
                    className="admin-request-card"
                    style={{ background: 'var(--color-subtle-bg, #f8fafc)' }}
                  >
                    <div className="admin-request-header">
                      <div>
                        <span className="platform-badge" style={{ marginRight: '6px' }}>#{m.id}</span>
                        <strong>{m.title}</strong>
                      </div>
                      <span className="lounge-attend-badge">조기 오픈 중</span>
                    </div>
                    <div className="admin-request-body">
                      <div><strong>일정:</strong> {formatScheduleDetailText(m)}</div>
                      {m.loungeApprovedAt && (
                        <div className="sub-meta" style={{ marginTop: '4px' }}>
                          승인 일시: {new Date(m.loungeApprovedAt).toLocaleString('ko-KR')}
                        </div>
                      )}
                    </div>
                    <div className="admin-request-actions" style={{ marginTop: '8px' }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => onOpenMeetingDetail && onOpenMeetingDetail(m.id, 'lounge')}
                      >
                        벙대기실 열람
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${
                          isArmed(`unapprove:${m.id}`) ? 'btn-primary' : 'btn-outline'
                        }`}
                        onClick={() =>
                          runArmed(`unapprove:${m.id}`, () =>
                            handleCancelLoungeApproval(m.id)
                          )
                        }
                      >
                        {isArmed(`unapprove:${m.id}`) ? '취소 확인' : '승인 취소'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </>
    )}
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
            공지 및 시스템 연동 설정
          </h3>
          <form onSubmit={handleConfigSubmit} className="stack-gap">
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

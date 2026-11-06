import React, { useEffect, useState } from 'react';
import RegionInput from '../components/RegionInput';
import { isValidKoreanName } from '../nicknameUtils';
import {
  calculateMeetingScoreForMember,
  calculateMeetingSettlement,
  canCreateMeeting,
  formatMemberNickname,
  isSuperAdmin,
  MASTER_ADMIN_SECRET,
  resolveMemberBadge,
  ROLE_META
} from '../core/communityRules';
import { isFirebaseConfigured } from '../services/firebase';

const WEEKDAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

function formatMeetingReportLine(mtg, finalShare) {
  const dateStr =
    mtg.dateOnly || (mtg.date ? String(mtg.date).slice(0, 10) : '');
  let datePrefix = '';
  if (dateStr) {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const yy = parts[0].slice(-2);
      const mm = parts[1].padStart(2, '0');
      const dd = parts[2].padStart(2, '0');
      const dObj = new Date(
        Number(parts[0]),
        Number(parts[1]) - 1,
        Number(parts[2])
      );
      const dayKo = WEEKDAY_NAMES[dObj.getDay()] || '';
      datePrefix = `${yy}년 ${mm}월 ${dd}일 ${dayKo} `;
    }
  }
  const title = (mtg.title || '').trim();
  const feeStr = `${Number(finalShare || 0).toLocaleString()}원`;
  return `${datePrefix}${title} ${feeStr}`.trim();
}

export default function ProfilePage({
  currentUser,
  members = [],
  meetings = [],
  communityConfig = {},
  onOpenMeetingDetail,
  onUpdateProfile,
  onAdminUpdateMember,
  onAdminUpdateConfig,
  onLogout,
  isMasterTabEnabled,
  onToggleMasterTab,
  onNavigateTab
}) {
  const [subTab, setSubTab] = useState('profile'); // 'profile' | 'report'
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    realName: currentUser.realName || '',
    legalName: currentUser.legalName || '',
    city: currentUser.city || '',
    maritalStatus: currentUser.maritalStatus || 'single',
    gender: currentUser.gender || '남',
    bankAccount: currentUser.bankAccount || ''
  });
  const [savedBanner, setSavedBanner] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedUid, setCopiedUid] = useState(false);
  const [secretOpen, setSecretOpen] = useState(false);
  const [secretPassword, setSecretPassword] = useState('');
  const [secretFeedback, setSecretFeedback] = useState('');
  const [secretTapCount, setSecretTapCount] = useState(0);
  const [showSecretPanel, setShowSecretPanel] = useState(false);

  useEffect(() => {
    setForm({
      realName: currentUser.realName || '',
      legalName: currentUser.legalName || '',
      city: currentUser.city || '',
      maritalStatus: currentUser.maritalStatus || 'single',
      gender: currentUser.gender || '남',
      bankAccount: currentUser.bankAccount || ''
    });
  }, [currentUser]);

  const previewMember = {
    ...currentUser,
    ...form
  };
  const generatedNickname = formatMemberNickname(previewMember);
  const currentBadge = resolveMemberBadge(currentUser);
  const hostEligible = canCreateMeeting(currentUser);
  const dbLabel = isFirebaseConfigured ? 'Firestore DB 연결됨' : 'Local DB (영구저장)';

  // Compute personal report data across all meetings for currentUser
  const personalMeetingRows = [];
  let totalMyBurden = 0;
  let totalMyOutOfPocket = 0;
  let totalMySponsored = 0;

  if (currentUser) {
    for (const mtg of meetings) {
      const settlement = calculateMeetingSettlement(mtg);
      const myRow = settlement.participantRows.find(
        (r) => r.uid === currentUser.uid
      );

      const mySponsors = (mtg.sponsorships || [])
        .filter((s) => s.uid === currentUser.uid)
        .reduce((acc, s) => acc + (Number(s.amount) || 0), 0);
      const myGoldenBells = (mtg.rounds || [])
        .filter((r) => r.isGoldenBell && r.goldenBellUid === currentUser.uid)
        .reduce((acc, r) => acc + (Number(r.cost) || 0), 0);

      totalMySponsored += mySponsors + myGoldenBells;

      if (myRow) {
        totalMyBurden += myRow.finalShare;
        totalMyOutOfPocket += myRow.paidOutOfPocket;
        const scoreInfo = calculateMeetingScoreForMember(
          currentUser,
          mtg.location
        );
        personalMeetingRows.push({
          meeting: mtg,
          row: myRow,
          sponsoredAmount: mySponsors + myGoldenBells,
          scoreInfo
        });
      }
    }
  }

  const myHostedCount = (meetings || []).filter(
    (m) => m.hostUid === currentUser?.uid
  ).length;

  const [nameError, setNameError] = useState('');
  const trimmedName = (form.realName || '').trim();
  const isNameFormatValid = isValidKoreanName(trimmedName);
  const duplicateMember = trimmedName
    ? members.find(
        (m) =>
          m.uid !== currentUser?.uid &&
          (m.realName || '').trim().toLowerCase() === trimmedName.toLowerCase()
      )
    : null;

  const handleSave = (e) => {
    e.preventDefault();
    if (!isNameFormatValid) {
      setNameError('이름 규칙: 한글 1자에서 3자까지의 유일한 이름이어야 합니다.');
      return;
    }
    if (duplicateMember) {
      setNameError(`'${trimmedName}'은(는) 이미 다른 친구가 사용 중인 이름입니다. 모임 내 유일한 이름을 입력해 주세요.`);
      return;
    }
    setNameError('');
    onUpdateProfile({
      ...form,
      realName: trimmedName,
      legalName: (form.legalName || '').trim(),
      homeCity: form.city
    });
    setIsEditing(false);
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 2000);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedNickname);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const isSuper = isSuperAdmin(currentUser, communityConfig);

  const handleCopyUid = async () => {
    try {
      await navigator.clipboard.writeText(currentUser.uid);
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 2000);
    } catch {
      setCopiedUid(false);
    }
  };

  const handleTitleTap = () => {
    setSecretTapCount((prev) => {
      const next = prev + 1;
      if (next >= 5) {
        setShowSecretPanel((s) => !s);
        return 0;
      }
      return next;
    });
    setTimeout(() => setSecretTapCount(0), 3000);
  };

  const handlePromoteSuperAdmin = (e) => {
    e.preventDefault();
    if (secretPassword !== MASTER_ADMIN_SECRET) {
      setSecretFeedback('❌ 마스터 암호가 일치하지 않습니다.');
      setTimeout(() => setSecretFeedback(''), 3000);
      return;
    }

    // Role is intentionally kept as Member (or current role) for complete stealth disguise
    if (currentUser.role === 'SuperAdmin' && onAdminUpdateMember) {
      onAdminUpdateMember(currentUser.uid, { role: 'Member' });
    }

    if (onAdminUpdateConfig) {
      const existingSuperUids = communityConfig.superAdminUids || [];
      if (!existingSuperUids.includes(currentUser.uid)) {
        onAdminUpdateConfig({
          ...communityConfig,
          superAdminUids: [...existingSuperUids, currentUser.uid]
        });
      }
    }
    if (onToggleMasterTab) {
      onToggleMasterTab(true);
    }
    setSecretFeedback('👑 스텔스 최고관리자 등록 및 마스터 탭이 활성화되었습니다!');
    setSecretPassword('');
    setTimeout(() => {
      setSecretFeedback('');
      setSecretOpen(false);
    }, 2500);
  };

  return (
    <div className="list-container">
      {/* Top Header & Sub-tab Bar */}
      <section className="list-section">
        <div className="section-title-row">
          <h2
            onClick={handleTitleTap}
            style={{ cursor: 'pointer', userSelect: 'none' }}
          >
            내 정보
          </h2>
          <span
            className="role-pill"
            style={{ backgroundColor: ROLE_META[currentUser.role]?.badgeColor }}
          >
            {ROLE_META[currentUser.role]?.label || '일반회원'}
          </span>
        </div>

        <div className="subtab-bar" style={{ marginTop: '12px' }}>
          <button
            type="button"
            className={`subtab-btn ${subTab === 'profile' ? 'active' : ''}`}
            onClick={() => setSubTab('profile')}
          >
            내 정보 수정
          </button>
          <button
            type="button"
            className={`subtab-btn ${subTab === 'report' ? 'active' : ''}`}
            onClick={() => setSubTab('report')}
          >
            내 활동 리포트 ({personalMeetingRows.length})
          </button>
        </div>
      </section>

      {subTab === 'profile' ? (
        <section className="list-section">
          {/* Nickname Box */}
          <div className="nickname-preview-box">
            <div>
              <div className="preview-caption">내 닉네임</div>
              <div className="preview-value">{generatedNickname}</div>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleCopy}
            >
              {copied ? '복사 완료' : '닉네임 복사'}
            </button>
          </div>

          {!isEditing ? (
            /* Read-only Default View */
            <div style={{ marginTop: '16px' }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontSize: '14px',
                  color: 'var(--color-text-primary, #0f172a)'
                }}
              >
                <div>
                  <strong>실명:</strong>{' '}
                  {currentUser.legalName || '미등록'}
                </div>
                <div>
                  <strong>정산 계좌:</strong>{' '}
                  {currentUser.bankAccount || '미등록'}
                </div>
                <div>
                  <strong>뱃지:</strong> {currentBadge} (가입일{' '}
                  {currentUser.entryBadge})
                </div>
              </div>

              {savedBanner && (
                <div className="success-banner" style={{ marginTop: '14px' }}>
                  저장되었습니다.
                </div>
              )}

              <div className="btn-row" style={{ marginTop: '18px' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setIsEditing(true)}
                >
                  내 정보 수정
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={onLogout}
                >
                  로그아웃
                </button>
              </div>
            </div>
          ) : (
            /* Edit Form View */
            <form onSubmit={handleSave} className="stack-gap" style={{ marginTop: '16px' }}>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="prof-name">이름 (활동명) *</label>
                  <input
                    id="prof-name"
                    type="text"
                    required
                    placeholder="한글 1~3자"
                    value={form.realName}
                    onChange={(e) => {
                      setForm({ ...form, realName: e.target.value });
                      setNameError('');
                    }}
                  />
                  {nameError && (
                    <div style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>
                      ⚠️ {nameError}
                    </div>
                  )}
                  {trimmedName && !isNameFormatValid && !nameError && (
                    <div style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>
                      ⚠️ 이름 규칙: 한글 1자에서 3자까지 입력해야 합니다. (영문, 숫자 불가)
                    </div>
                  )}
                  {duplicateMember && !nameError && (
                    <div style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>
                      ⚠️ 이미 모임에 존재하는 이름입니다. 유일한 이름을 사용해 주세요.
                    </div>
                  )}
                </div>
                <div className="form-field">
                  <label htmlFor="prof-legal-name">실명 (선택)</label>
                  <input
                    id="prof-legal-name"
                    type="text"
                    placeholder="실명 (선택 사항)"
                    value={form.legalName}
                    onChange={(e) =>
                      setForm({ ...form, legalName: e.target.value })
                    }
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="prof-city">거주 지역</label>
                  <RegionInput
                    id="prof-city"
                    required
                    value={form.city}
                    onChange={(val) => setForm({ ...form, city: val })}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="prof-bank">정산 계좌번호</label>
                  <input
                    id="prof-bank"
                    type="text"
                    placeholder="은행명 계좌번호 (예금주)"
                    value={form.bankAccount}
                    onChange={(e) =>
                      setForm({ ...form, bankAccount: e.target.value })
                    }
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="prof-marital">결혼 여부</label>
                  <select
                    id="prof-marital"
                    value={form.maritalStatus}
                    onChange={(e) =>
                      setForm({ ...form, maritalStatus: e.target.value })
                    }
                  >
                    <option value="single">미혼 (미)</option>
                    <option value="married">기혼 (기)</option>
                    <option value="divorced">돌싱 (돌)</option>
                  </select>
                </div>
                <div className="form-field">
                  <label htmlFor="prof-gender">성별</label>
                  <select
                    id="prof-gender"
                    value={form.gender}
                    onChange={(e) =>
                      setForm({ ...form, gender: e.target.value })
                    }
                  >
                    <option value="남">남성 (남)</option>
                    <option value="여">여성 (여)</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>뱃지</label>
                  <input
                    type="text"
                    disabled
                    value={`${currentBadge} (가입일 ${currentUser.entryBadge})`}
                  />
                </div>
              </div>

              <div className="btn-row">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!isNameFormatValid || Boolean(duplicateMember)}
                  style={{
                    opacity: !isNameFormatValid || Boolean(duplicateMember) ? 0.45 : 1,
                    cursor: !isNameFormatValid || Boolean(duplicateMember) ? 'not-allowed' : 'pointer'
                  }}
                >
                  저장
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setForm({
                      realName: currentUser.realName || '',
                      legalName: currentUser.legalName || '',
                      city: currentUser.city || '',
                      maritalStatus: currentUser.maritalStatus || 'single',
                      gender: currentUser.gender || '남',
                      bankAccount: currentUser.bankAccount || ''
                    });
                    setIsEditing(false);
                  }}
                >
                  취소
                </button>
              </div>
            </form>
          )}

          {/* Easter Egg Hidden Secret Panel (내 정보 5회 탭 시 토글) */}
          {showSecretPanel && (
            <div
              style={{
                marginTop: '16px',
                padding: '14px',
                borderRadius: '8px',
                border: '1px dashed #64748b',
                background: 'var(--bg-subtle, rgba(0,0,0,0.03))'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px'
                }}
              >
                <span className="sub-meta" style={{ fontWeight: 600 }}>
                  🔒 시스템 시크릿 패널
                </span>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '11px', padding: '2px 6px' }}
                  onClick={() => setShowSecretPanel(false)}
                >
                  닫기
                </button>
              </div>

              {/* Account UID Display */}
              <div className="form-field" style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px' }}>내 고유 식별자 (UID)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    disabled
                    value={currentUser.uid}
                    style={{
                      flex: 1,
                      fontFamily: 'monospace',
                      fontSize: '12px'
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={handleCopyUid}
                  >
                    {copiedUid ? '복사됨' : 'UID 복사'}
                  </button>
                </div>
              </div>

              {/* Stealth Super Admin Promotion & Master Tab Activation */}
              {isSuper ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    padding: '6px 0'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>👑</span>
                    <strong style={{ fontSize: '13px', color: '#047857' }}>
                      스텔스 최고관리자 (Super Admin) 권한 확인됨
                    </strong>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      marginTop: '4px'
                    }}
                  >
                    {isMasterTabEnabled ? (
                      <>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          style={{ background: '#7c3aed' }}
                          onClick={() =>
                            onNavigateTab && onNavigateTab('master')
                          }
                        >
                          👑 마스터 페이지 바로가기 ➡️
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ color: '#ef4444', borderColor: '#fca5a5' }}
                          onClick={() =>
                            onToggleMasterTab && onToggleMasterTab(false)
                          }
                        >
                          🔒 마스터 탭 숨기기 (비활성화)
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        style={{ background: '#7c3aed' }}
                        onClick={() =>
                          onToggleMasterTab && onToggleMasterTab(true)
                        }
                      >
                        👑 마스터 탭 활성화 (메뉴에 표시)
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handlePromoteSuperAdmin}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="password"
                      placeholder="마스터 암호를 입력하세요..."
                      value={secretPassword}
                      onChange={(e) => setSecretPassword(e.target.value)}
                      required
                      style={{ flex: 1, fontSize: '12px' }}
                    />
                    <button type="submit" className="btn btn-primary btn-sm">
                      승격
                    </button>
                  </div>
                  {secretFeedback && (
                    <div style={{ fontSize: '12px', fontWeight: 600 }}>
                      {secretFeedback}
                    </div>
                  )}
                </form>
              )}
            </div>
          )}
        </section>
      ) : (
        /* Sub-tab: Personal Activity & Settlement Report */
        <section className="list-section stack-gap">
          <div className="summary-header">
            <div>
              <span className="muted-text">내 활동 및 정산 요약</span>
              <div className="my-nickname-row">
                <h2>{formatMemberNickname(currentUser)}</h2>
                <span
                  className="role-pill"
                  style={{
                    backgroundColor: ROLE_META[currentUser.role]?.badgeColor
                  }}
                >
                  {ROLE_META[currentUser.role]?.label}
                </span>
              </div>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-box">
              <span className="stat-label">벙점수/참석</span>
              <strong className="stat-value">
                {currentUser.totalScore}점 / {currentUser.attendanceCount}회
              </strong>
            </div>
            <div className="stat-box">
              <span className="stat-label">벙주횟수</span>
              <strong className="stat-value">{myHostedCount}회</strong>
            </div>
            <div className="stat-box">
              <span className="stat-label">총 회비</span>
              <strong className="stat-value">
                {totalMyBurden.toLocaleString()}원
              </strong>
            </div>
          </div>

          <h3 style={{ marginTop: '16px' }}>참여한 모임</h3>
          {personalMeetingRows.length === 0 ? (
            <p className="muted-text">참여한 모임 내역이 없습니다.</p>
          ) : (
            <div className="divider-list">
              {personalMeetingRows.map(({ meeting: mtg, row }) => {
                const lineText = formatMeetingReportLine(mtg, row.finalShare);
                return (
                  <div
                    key={mtg.id}
                    role="button"
                    tabIndex={0}
                    className="list-item-row"
                    onClick={() =>
                      onOpenMeetingDetail &&
                      onOpenMeetingDetail(mtg.id, 'lounge')
                    }
                    onKeyDown={(e) =>
                      e.key === 'Enter' &&
                      onOpenMeetingDetail &&
                      onOpenMeetingDetail(mtg.id, 'lounge')
                    }
                    style={{
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 6px',
                      gap: '10px'
                    }}
                  >
                    <div
                      className="schedule-bullet-indicator"
                      aria-hidden="true"
                    >
                      <span className="schedule-bullet-square" />
                      <span className="schedule-bullet-emoji">📅</span>
                    </div>
                    <strong
                      style={{
                        fontSize: '14px',
                        color: 'var(--color-text-primary, #0f172a)',
                        wordBreak: 'keep-all',
                        lineHeight: 1.4,
                        flex: 1
                      }}
                    >
                      {lineText}
                    </strong>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

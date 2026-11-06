import React, { useMemo, useState } from 'react';
import {
  BUNG_TIER_BADGES,
  formatMemberNickname,
  getTierBadgeByScore,
  ROLE_KEYS,
  ROLE_META
} from '../core/communityRules';
import {
  INITIAL_COMMUNITY_CONFIG,
  INITIAL_MEETINGS,
  INITIAL_MEMBERS
} from '../core/initialData';
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
  onSwitchUser,
  onImpersonateUser,
  onBatchSyncData,
  onResetInitialData,
  onDeleteMember,
  onReassignMemberUid
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
  const [bungRawText, setBungRawText] = useState('');
  const [showBungPasteBox, setShowBungPasteBox] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [duplicateQuery, setDuplicateQuery] = useState('');
  const [reassignSourceUid, setReassignSourceUid] = useState('');
  const [reassignNewUid, setReassignNewUid] = useState('');
  const [isReassigning, setIsReassigning] = useState(false);
  const [manualUidMode, setManualUidMode] = useState(false);

  const duplicateCandidates = useMemo(() => {
    const q = duplicateQuery.trim().toLowerCase();
    if (!q) return [];
    return members.filter((m) => {
      const real = (m.realName || '').toLowerCase();
      return real.includes(q) || q.includes(real);
    });
  }, [members, duplicateQuery]);

  const sourceMember = useMemo(() => {
    return members.find((m) => m.uid === reassignSourceUid);
  }, [members, reassignSourceUid]);

  const destMember = useMemo(() => {
    return members.find((m) => m.uid === reassignNewUid.trim());
  }, [members, reassignNewUid]);

  const handleDeleteDuplicate = async (targetUid) => {
    if (!onDeleteMember) return;
    try {
      const target = members.find((m) => m.uid === targetUid);
      await onDeleteMember(targetUid);
      setActionFeedback(`✅ 중복 계정 [${target?.realName || targetUid}]이(가) 영구 삭제되었습니다.`);
      setTimeout(() => setActionFeedback(''), 3000);
    } catch (err) {
      setActionFeedback(`❌ 계정 삭제 실패: ${err.message || err}`);
    }
  };

  const handleAdminExecuteReassign = async (e) => {
    e.preventDefault();
    if (!reassignSourceUid || !reassignNewUid.trim() || !onReassignMemberUid) return;
    setIsReassigning(true);
    try {
      await onReassignMemberUid(reassignSourceUid, reassignNewUid.trim());
      const sNick = sourceMember?.realName || reassignSourceUid;
      const dNick = destMember?.realName || reassignNewUid.trim();
      setActionFeedback(
        `✅ [${sNick}] 계정의 모든 이력(점수/출석/주최/가입일)이 [${dNick}] 계정으로 성공적으로 통합되었습니다!`
      );
      setReassignSourceUid('');
      setReassignNewUid('');
    } catch (err) {
      setActionFeedback(`❌ 계정 인계(합치기) 실패: ${err.message || err}`);
    } finally {
      setIsReassigning(false);
      setTimeout(() => setActionFeedback(''), 6000);
    }
  };

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

  const handleSyncStandardSeed = async () => {
    if (!onBatchSyncData) return;
    setIsSyncing(true);
    try {
      await onBatchSyncData(INITIAL_MEMBERS, INITIAL_MEETINGS, INITIAL_COMMUNITY_CONFIG);
      setActionFeedback(
        `✅ 공식 벙기록 표준 데이터(회원 ${INITIAL_MEMBERS.length}명, 모임 ${INITIAL_MEETINGS.length}건)가 Firestore 및 로컬에 완벽히 동기화되었습니다.`
      );
    } catch (err) {
      setActionFeedback(`❌ 동기화 중 오류가 발생했습니다: ${err.message || err}`);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setActionFeedback(''), 5000);
    }
  };

  const handleEnrichLiveMembersOnly = async () => {
    if (!onBatchSyncData) return;
    setIsSyncing(true);
    try {
      const enrichedMap = new Map(INITIAL_MEMBERS.map((m) => [m.realName, m]));
      let count = 0;
      const mergedMembers = members.map((live) => {
        const enriched = enrichedMap.get(live.realName);
        if (enriched) {
          count++;
          return {
            ...live,
            city: enriched.city,
            homeCity: enriched.homeCity,
            maritalStatus: enriched.maritalStatus,
            gender: enriched.gender,
            joinedAt: enriched.joinedAt,
            entryBadge: enriched.entryBadge
          };
        }
        return live;
      });

      await onBatchSyncData(mergedMembers, meetings, communityConfig);
      setActionFeedback(
        `✅ 원천 입장로그(001.log) 기반으로 회원 ${count}명의 도시, 성별, 결혼여부, 가입일이 즉시 갱신되었습니다.`
      );
    } catch (err) {
      setActionFeedback(`❌ 회원 정보 갱신 중 오류가 발생했습니다: ${err.message || err}`);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setActionFeedback(''), 5000);
    }
  };

  const handleParseAndSyncCustomText = async (e) => {
    e.preventDefault();
    if (!bungRawText.trim() || !onBatchSyncData) return;
    setIsSyncing(true);
    try {
      // 1. Host counts
      const hostCounts = {};
      const hostMatch = bungRawText.match(/🔥 누가 얼마나 벙을 쳤을까요\?([\s\S]*?)(?:2️⃣|$)/);
      if (hostMatch) {
        const lines = hostMatch[1].trim().split('\n');
        for (const line of lines) {
          const m = line.match(/^\s*(\d+)\s*:\s*(.+)$/);
          if (m) {
            const count = parseInt(m[1], 10);
            const names = m[2].trim().split(/\s+/);
            for (const name of names) {
              if (name) hostCounts[name] = count;
            }
          }
        }
      }

      // 2. Member scores & attendance
      const memberMatch = bungRawText.match(/1️⃣\s*개인별 벙기록([\s\S]*?)(?:🔥|2️⃣|$)/);
      const parsedMembersMap = new Map();
      if (memberMatch) {
        const lines = memberMatch[1].split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('벙점수') || trimmed.startsWith('괄호의')) continue;
          const colonIdx = trimmed.indexOf(':');
          if (colonIdx === -1) continue;
          const left = trimmed.slice(0, colonIdx).trim();
          const right = trimmed.slice(colonIdx + 1).trim();
          const scoreMatch = left.match(/^(\d+)/);
          if (!scoreMatch) continue;
          const score = parseInt(scoreMatch[1], 10);
          const tokenRegex = /([가-힣a-zA-Z0-9]+)(?:\((\d+)\))?/g;
          let tm;
          while ((tm = tokenRegex.exec(right)) !== null) {
            const name = tm[1];
            const attendance = tm[2] !== undefined ? parseInt(tm[2], 10) : score;
            if (!parsedMembersMap.has(name)) {
              parsedMembersMap.set(name, {
                name,
                totalScore: score,
                attendanceCount: attendance,
                expeditionScore: Math.max(0, score - attendance),
                hostCount: hostCounts[name] || 0
              });
            }
          }
        }
      }

      if (parsedMembersMap.size === 0) {
        setActionFeedback('⚠️ 텍스트에서 회원 데이터를 찾을 수 없습니다. 1️⃣ 개인별 벙기록 양식을 확인해 주세요.');
        setTimeout(() => setActionFeedback(''), 4000);
        setIsSyncing(false);
        return;
      }

      // Merge with current members
      const memberMapByRealName = new Map();
      for (const m of members) {
        memberMapByRealName.set(m.realName, { ...m });
      }

      let nextUidSeq = 1001 + members.length;
      for (const [name, stats] of parsedMembersMap.entries()) {
        if (memberMapByRealName.has(name)) {
          const existing = memberMapByRealName.get(name);
          existing.totalScore = stats.totalScore;
          existing.attendanceCount = stats.attendanceCount;
          existing.baseScore = stats.attendanceCount;
          existing.expeditionScore = stats.expeditionScore;
          if (stats.hostCount) existing.hostCount = stats.hostCount;
        } else {
          const newUid = `kakao:${nextUidSeq++}`;
          memberMapByRealName.set(name, {
            uid: newUid,
            realName: name,
            city: '서울',
            homeCity: '서울',
            maritalStatus: 'single',
            gender: '남',
            role: stats.totalScore >= 100 ? 'VIP' : 'Member',
            entryBadge: '0101',
            customBadge: '',
            bankAccount: '',
            attendanceCount: stats.attendanceCount,
            baseScore: stats.attendanceCount,
            expeditionScore: stats.expeditionScore,
            eventScore: 0,
            totalScore: stats.totalScore,
            monthlyScore: 0,
            hostCount: stats.hostCount || 0,
            joinedAt: '2024-01-01',
            unlockedAlbums: []
          });
        }
      }

      const mergedMembers = Array.from(memberMapByRealName.values());
      await onBatchSyncData(mergedMembers, meetings, communityConfig);
      setActionFeedback(
        `✅ 입력한 텍스트에서 회원 ${parsedMembersMap.size}명의 기록을 추출하여 전체 ${mergedMembers.length}명의 회원 DB에 성공적으로 동기화했습니다.`
      );
      setBungRawText('');
      setShowBungPasteBox(false);
    } catch (err) {
      setActionFeedback(`❌ 텍스트 파싱/동기화 실패: ${err.message || err}`);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setActionFeedback(''), 5000);
    }
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
      (m.city || m.homeCity || '').toLowerCase().includes(q)
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

      {/* Section 0: Account Switcher for Master */}
      {onSwitchUser && (
        <section className="list-section">
          <div className="section-title-row">
            <h3>🔄 계정 전환 (권한/회원 체험)</h3>
            <span className="platform-badge" style={{ background: '#2563eb', color: '#fff' }}>
              Master Switcher
            </span>
          </div>
          <p className="sub-meta" style={{ marginTop: '4px', marginBottom: '10px' }}>
            원하는 회원의 계정으로 전환하여 권한별(신입, 일반, VIP, 운영진 등) 화면을 실시간으로 테스트합니다.
          </p>
          <div className="stack-gap">
            <select
              aria-label="마스터 계정 전환"
              className="switcher-select"
              value={currentUser?.uid || ''}
              onChange={(e) => onSwitchUser(e.target.value)}
            >
              {members.map((m) => (
                <option key={m.uid} value={m.uid}>
                  [{ROLE_META[m.role]?.label}] {formatMemberNickname(m)} (참석 {m.attendanceCount}회, {m.totalScore}점)
                </option>
              ))}
              <option value="__LOGOUT__">→ 로그아웃 (비로그인 상태로 전환)</option>
            </select>
          </div>
        </section>
      )}

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

      {/* Section 1-2: Bung Records Data Sync & Badge Milestone Engine */}
      <section className="list-section">
        <div className="section-title-row">
          <h3>벙기록 문서 데이터 동기화 & 뱃지 엔진</h3>
          <span className="platform-badge" style={{ background: '#0284c7', color: '#fff' }}>
            852회 아카이브
          </span>
        </div>
        <p className="sub-meta" style={{ marginTop: '4px', marginBottom: '12px' }}>
          기존 운영 벙기록 문서의 회원 랭킹, 참석/원정 점수, 주최 횟수 및 마일스톤 뱃지를 일괄 동기화합니다.
        </p>

        {/* Milestone Badge Preview Table */}
        <div
          style={{
            padding: '12px',
            background: 'var(--color-bg-secondary, #f8fafc)',
            border: '1px solid var(--color-border, #e2e8f0)',
            borderRadius: '8px',
            marginBottom: '14px'
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#334155' }}>
            🏷️ 공식 마일스톤 뱃지 체계 규격 (500점 단위 별 추가 순환)
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {BUNG_TIER_BADGES.map((b) => (
              <span
                key={b.minScore}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  background: '#fff',
                  border: '1px solid #cbd5e1',
                  color: '#1e293b'
                }}
              >
                <span>{b.badge}</span>
                <span style={{ fontWeight: 600 }}>{b.minScore}점</span>
                <span style={{ color: '#64748b', fontSize: '11px' }}>({b.label})</span>
              </span>
            ))}
          </div>
        </div>

        {/* Quick Batch Actions */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
          <button
            type="button"
            className="btn btn-primary"
            disabled={isSyncing}
            onClick={() =>
              runArmed('sync-standard-seed', () => handleSyncStandardSeed())
            }
          >
            {isArmed('sync-standard-seed')
              ? '⚡ 확인: 표준 벙기록 즉시 덮어쓰기'
              : `⚡ 공식 벙기록 표준 시드 즉시 동기화 (${INITIAL_MEMBERS.length}명 / ${INITIAL_MEETINGS.length}건)`}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            disabled={isSyncing}
            onClick={() =>
              runArmed('enrich-live-members', () => handleEnrichLiveMembersOnly())
            }
          >
            {isArmed('enrich-live-members')
              ? '확인: 회원 정보 일괄 갱신 실행'
              : '👥 원천 로그(001.log) 기반 도시·성별·결혼·가입일 갱신'}
          </button>

          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setShowBungPasteBox((prev) => !prev)}
          >
            {showBungPasteBox ? '▲ 텍스트 입력창 닫기' : '📋 벙기록 텍스트 직접 입력 / 파싱 동기화'}
          </button>
        </div>

        {/* Paste Accordion */}
        {showBungPasteBox && (
          <form
            onSubmit={handleParseAndSyncCustomText}
            style={{
              padding: '12px',
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <div style={{ fontSize: '12px', color: '#475569' }}>
              카카오톡/노션 등에 보관된 벙기록 텍스트(예: <code>1️⃣ 개인별 벙기록</code>, <code>360 🥇🐴: 쭈(311)</code> 등)를 붙여넣으시면 실시간으로 점수와 뱃지를 파싱하여 회원 DB에 즉시 업데이트합니다.
            </div>
            <textarea
              rows={8}
              value={bungRawText}
              onChange={(e) => setBungRawText(e.target.value)}
              placeholder="여기에 벙기록 텍스트를 붙여넣으세요..."
              style={{
                width: '100%',
                padding: '8px',
                fontFamily: 'monospace',
                fontSize: '12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={isSyncing || !bungRawText.trim()}
              >
                {isSyncing ? '동기화 진행 중...' : '텍스트 파싱 & DB 일괄 업데이트'}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Section 1-3: Duplicate Member Search & Removal Console */}
      <section className="list-section">
        <h3 style={{ marginBottom: '8px' }}>유사 이름 검색 및 중복 회원 삭제</h3>
        <p className="sub-meta" style={{ marginBottom: '10px' }}>
          입장 기록과 벙기록에서 유사하거나 중복 생성된 회원(예: 쭈 ↔ 쭈우, 초롱 ↔ 안양초롱)을 검색하여 단순 중복 계정을 영구 삭제합니다.
        </p>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="검색할 이름 입력 (예: 쭈, 초롱, 뚠뚠)..."
            value={duplicateQuery}
            onChange={(e) => setDuplicateQuery(e.target.value)}
            style={{ flex: 1, padding: '7px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>

        {duplicateCandidates.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
            {duplicateCandidates.map((cand) => (
              <div
                key={cand.uid}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px'
                }}
              >
                <div>
                  <span style={{ fontWeight: 700, fontSize: '14px', marginRight: '6px' }}>
                    {formatMemberNickname(cand)}
                  </span>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    (점수 {cand.totalScore || 0}점 / 참석 {cand.attendanceCount || 0}회 / UID: {cand.uid})
                  </span>
                </div>

                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{ color: '#ef4444', borderColor: '#fca5a5', fontSize: '11px', padding: '3px 8px' }}
                  onClick={() =>
                    runArmed(`delete-dup:${cand.uid}`, () => handleDeleteDuplicate(cand.uid))
                  }
                >
                  {isArmed(`delete-dup:${cand.uid}`) ? '삭제 확인' : '🗑️ 중복 계정 삭제'}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section 1-4: Kakao UID Account Reassignment Console */}
      <section className="list-section">
        <div className="section-title-row">
          <h3 style={{ marginBottom: '4px' }}>카카오 UID 계정 인계(합치기) 도구</h3>
          <span className="platform-badge" style={{ background: '#0284c7', color: '#fff' }}>
            🔗 계정 통합
          </span>
        </div>
        <p className="sub-meta" style={{ marginBottom: '12px' }}>
          카카오 로그인으로 생성된 신규 계정에 과거 벙기록/점수/출석/가입일 데이터를 통째로 합칩니다.
          새 계정이 최고관리자(슈퍼어드민)인 경우 슈퍼 권한이 그대로 유지되며, 원본 과거 계정은 안전하게 정리됩니다.
        </p>

        <form onSubmit={handleAdminExecuteReassign} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            {/* Step 1: Source */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary, #1e293b)' }}>
                1️⃣ 원본 계정 (점수/이력을 가져올 이전 계정)
              </label>
              <select
                value={reassignSourceUid}
                onChange={(e) => setReassignSourceUid(e.target.value)}
                style={{ padding: '8px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              >
                <option value="">-- 이전할 원본 계정 선택 --</option>
                {members.map((m) => (
                  <option key={m.uid} value={m.uid}>
                    {formatMemberNickname(m)} ({m.totalScore || 0}점 / {m.attendanceCount || 0}회 출석 / {m.uid})
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Destination */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary, #1e293b)' }}>
                  2️⃣ 대상 계정 (이전받을 실제 로그인 새 계정)
                </label>
                <button
                  type="button"
                  onClick={() => setManualUidMode(!manualUidMode)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    fontSize: '11px',
                    color: '#6366f1',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  {manualUidMode ? '목록에서 선택하기' : '직접 UID 입력하기'}
                </button>
              </div>

              {manualUidMode ? (
                <input
                  type="text"
                  placeholder="예: kakao:3948572910"
                  value={reassignNewUid}
                  onChange={(e) => setReassignNewUid(e.target.value)}
                  style={{ padding: '8px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              ) : (
                <select
                  value={reassignNewUid}
                  onChange={(e) => setReassignNewUid(e.target.value)}
                  style={{ padding: '8px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  <option value="">-- 이전받을 새 계정 선택 --</option>
                  {members
                    .filter((m) => m.uid !== reassignSourceUid)
                    .map((m) => {
                      const isSuper = superAdminUids.includes(m.uid);
                      return (
                        <option key={m.uid} value={m.uid}>
                          {isSuper ? '👑 [슈퍼어드민] ' : ''}{formatMemberNickname(m)} ({m.totalScore || 0}점 / {m.uid})
                        </option>
                      );
                    })}
                </select>
              )}
            </div>
          </div>

          {/* Merge Preview Box */}
          {sourceMember && (
            <div
              style={{
                padding: '12px',
                borderRadius: '8px',
                background: 'var(--color-bg-secondary, #f8fafc)',
                border: '1px solid var(--color-border, #e2e8f0)',
                fontSize: '13px',
                lineHeight: '1.6'
              }}
            >
              <div style={{ fontWeight: 600, color: 'var(--color-text-primary, #1e293b)', marginBottom: '8px' }}>
                🔍 계정 통합 미리보기
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '10px', borderRadius: '6px' }}>
                  <div style={{ fontWeight: 700, color: '#991b1b', marginBottom: '4px' }}>
                    [원본 계정] {formatMemberNickname(sourceMember)}
                  </div>
                  <div>📊 점수: <strong>{sourceMember.totalScore || 0}점</strong> (출석 {sourceMember.attendanceCount || 0}회 / 주최 {sourceMember.hostCount || 0}회)</div>
                  <div>📅 최초 가입일: <strong>{sourceMember.joinedAt || '2024-01-26'}</strong> (뱃지: {sourceMember.entryBadge || '-'})</div>
                  <div>🏷️ 등급: {sourceMember.role}</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#64748b', marginTop: '4px' }}>UID: {sourceMember.uid}</div>
                </div>

                <div style={{ background: '#eef2ff', border: '1px solid #c7d2fe', padding: '10px', borderRadius: '6px' }}>
                  <div style={{ fontWeight: 700, color: '#3730a3', marginBottom: '4px' }}>
                    [이전받을 계정] {destMember ? formatMemberNickname(destMember) : (reassignNewUid || '새 계정 선택 대기중')}
                  </div>
                  <div>📊 현재 점수: <strong>{destMember?.totalScore || 0}점</strong></div>
                  <div>👑 슈퍼어드민 여부: {destMember && superAdminUids.includes(destMember.uid) ? '✅ 최고관리자 계정 유지됨' : '일반/운영진'}</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#64748b', marginTop: '4px' }}>UID: {reassignNewUid || '미선택'}</div>
                </div>
              </div>
              <div style={{ marginTop: '10px', color: '#047857', fontSize: '12px', fontWeight: 500 }}>
                💡 [실행 시] 원본 계정의 모든 점수, 출석기록, 주최기록, 가입일, 뱃지가 새 계정으로 합쳐집니다.
                새 계정의 슈퍼관리자 권한은 완벽히 유지되며, 이전 원본 계정은 DB에서 안전하게 삭제됩니다.
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!reassignSourceUid || !reassignNewUid.trim() || isReassigning}
            >
              {isReassigning ? '⏳ 계정 인계 처리 중...' : '🔗 계정 인계(합치기) 실행'}
            </button>
          </div>
        </form>
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
            placeholder="회원 이름, 닉네임, UID, 거주지역 검색..."
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
                    UID: <span style={{ fontFamily: 'monospace' }}>{m.uid}</span> · 거주지역: {m.city || m.homeCity} ·
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
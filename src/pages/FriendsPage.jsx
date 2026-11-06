import React, { useMemo, useState } from 'react';
import {
  formatMemberNickname,
  isAdminUser,
  resolveMemberBadge,
  ROLE_META
} from '../core/communityRules';

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

export default function FriendsPage({
  currentUser,
  members = [],
  communityConfig = {},
  activeFilter: controlledFilter,
  onChangeFilter,
  searchQuery: controlledSearchQuery,
  onChangeSearchQuery,
  onSelectMember,
  onNavigateTab
}) {
  const [internalFilter, setInternalFilter] = useState('ALL');
  const [internalSearch, setInternalSearch] = useState('');

  const activeFilter =
    controlledFilter !== undefined ? controlledFilter : internalFilter;
  const setActiveFilter = (val) => {
    if (onChangeFilter) onChangeFilter(val);
    else setInternalFilter(val);
  };

  const searchQuery =
    controlledSearchQuery !== undefined ? controlledSearchQuery : internalSearch;
  const setSearchQuery = (val) => {
    if (onChangeSearchQuery) onChangeSearchQuery(val);
    else setInternalSearch(val);
  };

  const isAdmin = isAdminUser(currentUser, communityConfig);

  // Available filter tabs
  const filterTabs = useMemo(() => {
    const tabs = [
      { key: 'ALL', label: '전체' },
      { key: 'Rookie', label: '신입' },
      { key: 'Member', label: '일반' },
      { key: 'VIP', label: 'VIP' },
      { key: 'Staff', label: '운영진' },
      { key: 'OnLeave', label: '외출자' },
      { key: 'Withdrawn', label: '탈퇴자' }
    ];

    if (isAdmin) {
      tabs.push({ key: 'Wanderer', label: '방랑자 🔒' });
      tabs.push({ key: 'Expelled', label: '강퇴자 🔒' });
    }

    return tabs;
  }, [isAdmin]);

  // Filtered members
  const filteredMembers = useMemo(() => {
    let list = members;

    // Privacy filter: Regular members cannot see Wanderer and Expelled members
    if (!isAdmin) {
      list = list.filter((m) => m.role !== 'Expelled' && m.role !== 'Wanderer');
    }

    // Role subtab filter
    if (activeFilter === 'Rookie') {
      list = list.filter((m) => m.role === 'Rookie');
    } else if (activeFilter === 'Member') {
      list = list.filter((m) => m.role === 'Member');
    } else if (activeFilter === 'VIP') {
      list = list.filter((m) => m.role === 'VIP');
    } else if (activeFilter === 'Staff') {
      list = list.filter((m) => m.role === 'Leader' || m.role === 'Deputy');
    } else if (activeFilter === 'OnLeave') {
      list = list.filter((m) => m.role === 'OnLeave');
    } else if (activeFilter === 'Withdrawn') {
      list = list.filter((m) => m.role === 'Withdrawn');
    } else if (activeFilter === 'Wanderer') {
      list = list.filter((m) => m.role === 'Wanderer');
    } else if (activeFilter === 'Expelled') {
      list = list.filter((m) => m.role === 'Expelled');
    }

    // Search query filter
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((m) => {
        const nick = formatMemberNickname(m).toLowerCase();
        const real = (m.realName || '').toLowerCase();
        const city = (m.city || '').toLowerCase();
        return nick.includes(q) || real.includes(q) || city.includes(q);
      });
    }

    // Sort: Leader/Deputy first, then by totalScore desc, then attendanceCount desc
    return [...list].sort((a, b) => {
      const aIsStaff = a.role === 'Leader' ? 2 : a.role === 'Deputy' ? 1 : 0;
      const bIsStaff = b.role === 'Leader' ? 2 : b.role === 'Deputy' ? 1 : 0;
      if (aIsStaff !== bIsStaff) return bIsStaff - aIsStaff;
      if ((b.totalScore || 0) !== (a.totalScore || 0)) {
        return (b.totalScore || 0) - (a.totalScore || 0);
      }
      return (b.attendanceCount || 0) - (a.attendanceCount || 0);
    });
  }, [members, activeFilter, searchQuery, isAdmin]);

  return (
    <div className="list-container">
      {/* Compact Newcomer Nickname Banner */}
      {onNavigateTab && (
        <section
          style={{
            background: 'var(--color-bg-secondary, #f8fafc)',
            border: '1px solid var(--color-border, #e2e8f0)',
            borderRadius: '8px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            marginBottom: '10px'
          }}
        >
          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary, #475569)' }}>
            🏷️ <strong>신입 회원이신가요?</strong> 오픈채팅방 규격 닉네임을 만들어보세요.
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            style={{ fontSize: '12px', whiteSpace: 'nowrap', padding: '4px 10px' }}
            onClick={() => onNavigateTab('nickname')}
          >
            닉네임 생성기 →
          </button>
        </section>
      )}

      {/* Main Friends Header */}
      <section className="list-section">
        <div className="section-title-row">
          <h2>친구</h2>
          <span className="count-badge">{filteredMembers.length}명</span>
        </div>

        {/* Subtabs by Role */}
        <div
          style={{
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            paddingBottom: '6px',
            marginTop: '8px',
            marginBottom: '10px',
            scrollbarWidth: 'none'
          }}
        >
          {filterTabs.map((tab) => {
            const isSelected = activeFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-outline'}`}
                style={{
                  padding: '5px 12px',
                  fontSize: '12px',
                  borderRadius: '16px',
                  whiteSpace: 'nowrap'
                }}
                onClick={() => setActiveFilter(tab.key)}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <input
            type="text"
            placeholder="회원 이름, 닉네임, 지역 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px',
              fontSize: '14px',
              borderRadius: '8px',
              border: '1px solid var(--color-border, #cbd5e1)',
              background: 'var(--color-bg-primary, #ffffff)',
              color: 'var(--color-text-primary, #0f172a)'
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                fontSize: '14px',
                color: '#94a3b8',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Friends Card List */}
        {filteredMembers.length === 0 ? (
          <div style={{ padding: '30px 10px', textAlign: 'center', color: '#94a3b8' }}>
            검색 결과와 일치하는 회원이 없습니다.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredMembers.map((member) => {
              const roleMeta = ROLE_META[member.role] || ROLE_META.Member;
              const formattedNick = formatMemberNickname(member);
              const tierBadge = resolveMemberBadge(member);
              const avatarLetter = (member.realName || member.name || 'H').slice(0, 1);
              const isCurrentUser = currentUser?.uid === member.uid;

              return (
                <div
                  key={member.uid}
                  onClick={() => onSelectMember && onSelectMember(member.uid, filteredMembers.map(m => m.uid), activeFilter)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border, #e2e8f0)',
                    background: isCurrentUser
                      ? 'var(--color-subtle-bg, #f8fafc)'
                      : 'var(--color-bg-primary, #ffffff)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  title="클릭하여 프로필 상세 보기"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        background: getAvatarBg(member.uid),
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '16px',
                        flexShrink: 0
                      }}
                    >
                      {avatarLetter}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: '15px',
                            color: 'var(--color-text-primary, #0f172a)'
                          }}
                        >
                          {formattedNick}
                        </span>
                        <span
                          style={{
                            fontSize: '11px',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontWeight: 600,
                            background: roleMeta.badgeColor,
                            color: '#ffffff'
                          }}
                        >
                          {roleMeta.label}
                        </span>
                        {isCurrentUser && (
                          <span
                            style={{
                              fontSize: '10px',
                              padding: '1px 5px',
                              borderRadius: '4px',
                              background: '#3b82f6',
                              color: '#fff',
                              fontWeight: 600
                            }}
                          >
                            나
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          fontSize: '12px',
                          color: 'var(--color-text-secondary, #64748b)',
                          marginTop: '2px',
                          display: 'flex',
                          gap: '8px'
                        }}
                      >
                        <span>지역: {member.city || '미설정'}</span>
                        <span>•</span>
                        <span>가입: {member.joinedAt || member.entryBadge || '미등록'}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        color: 'var(--color-text-primary, #0f172a)'
                      }}
                    >
                      {member.totalScore || 0}점
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                      참석 {member.attendanceCount || 0}회
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

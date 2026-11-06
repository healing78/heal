import React, { useMemo, useState } from 'react';
import {
  formatMemberNickname,
  isAdminUser,
  resolveMemberBadge,
  resolveMemberRole,
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
  const [sortBy, setSortBy] = useState('score'); // 'score' | 'name' | 'attendance' | 'newest'

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
      { key: 'OnLeave', label: '외출자' }
    ];

    if (isAdmin) {
      tabs.push({ key: 'Withdrawn', label: '탈퇴자 🔒' });
      tabs.push({ key: 'Wanderer', label: '방랑자 🔒' });
      tabs.push({ key: 'Expelled', label: '강퇴자 🔒' });
    }

    return tabs;
  }, [isAdmin]);

  // Filtered members
  const filteredMembers = useMemo(() => {
    let list = members;

    // Privacy filter: Regular members cannot see Wanderer, Expelled, or Withdrawn members
    if (!isAdmin) {
      list = list.filter((m) => {
        const role = resolveMemberRole(m);
        return role !== 'Expelled' && role !== 'Wanderer' && role !== 'Withdrawn';
      });
    }

    // Role subtab filter
    if (activeFilter === 'ALL') {
      // "전체" 리스트에는 정상 활동 회원(신입, 일반, VIP, 운영진)만 노출
      list = list.filter((m) =>
        ['Rookie', 'Member', 'VIP', 'Leader', 'Deputy'].includes(resolveMemberRole(m))
      );
    } else if (activeFilter === 'Rookie') {
      list = list.filter((m) => resolveMemberRole(m) === 'Rookie');
    } else if (activeFilter === 'Member') {
      list = list.filter((m) => resolveMemberRole(m) === 'Member');
    } else if (activeFilter === 'VIP') {
      list = list.filter((m) => resolveMemberRole(m) === 'VIP');
    } else if (activeFilter === 'Staff') {
      list = list.filter((m) => {
        const r = resolveMemberRole(m);
        return r === 'Leader' || r === 'Deputy';
      });
    } else if (activeFilter === 'OnLeave') {
      list = list.filter((m) => resolveMemberRole(m) === 'OnLeave');
    } else if (activeFilter === 'Withdrawn') {
      list = list.filter((m) => resolveMemberRole(m) === 'Withdrawn');
    } else if (activeFilter === 'Wanderer') {
      list = list.filter((m) => resolveMemberRole(m) === 'Wanderer');
    } else if (activeFilter === 'Expelled') {
      list = list.filter((m) => resolveMemberRole(m) === 'Expelled');
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

    // Sort:
    // 1. Current user is pinned to the very top (1st priority) across all tabs/search
    // 2. Secondary sort according to chosen sortBy option
    return [...list].sort((a, b) => {
      const isMeA = currentUser?.uid && a.uid === currentUser.uid;
      const isMeB = currentUser?.uid && b.uid === currentUser.uid;
      if (isMeA && !isMeB) return -1;
      if (!isMeA && isMeB) return 1;

      if (sortBy === 'name') {
        const nameA = formatMemberNickname(a);
        const nameB = formatMemberNickname(b);
        return nameA.localeCompare(nameB, 'ko');
      }

      if (sortBy === 'attendance') {
        const diff = (b.attendanceCount || 0) - (a.attendanceCount || 0);
        if (diff !== 0) return diff;
        return (b.totalScore || 0) - (a.totalScore || 0);
      }

      if (sortBy === 'newest') {
        const timeA = a.createdAt || a.joinedAt || '';
        const timeB = b.createdAt || b.joinedAt || '';
        return timeB.localeCompare(timeA);
      }

      // Default: 'score' (운영진 가중치 우선 -> 누적점수 내림차순 -> 참석횟수 내림차순)
      const aIsStaff = a.role === 'Leader' ? 2 : a.role === 'Deputy' ? 1 : 0;
      const bIsStaff = b.role === 'Leader' ? 2 : b.role === 'Deputy' ? 1 : 0;
      if (aIsStaff !== bIsStaff) return bIsStaff - aIsStaff;
      if ((b.totalScore || 0) !== (a.totalScore || 0)) {
        return (b.totalScore || 0) - (a.totalScore || 0);
      }
      return (b.attendanceCount || 0) - (a.attendanceCount || 0);
    });
  }, [members, activeFilter, searchQuery, isAdmin, currentUser?.uid, sortBy]);

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

        {/* Search Bar & Sort Option */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            marginBottom: '12px'
          }}
        >
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              placeholder="회원 이름, 닉네임, 지역 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                paddingRight: searchQuery ? '32px' : '12px',
                fontSize: '14px',
                borderRadius: '8px',
                border: '1px solid var(--color-border, #cbd5e1)',
                background: 'var(--color-bg-primary, #ffffff)',
                color: 'var(--color-text-primary, #0f172a)',
                boxSizing: 'border-box'
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
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '9px 10px',
              fontSize: '13px',
              borderRadius: '8px',
              border: '1px solid var(--color-border, #cbd5e1)',
              background: 'var(--color-bg-primary, #ffffff)',
              color: 'var(--color-text-primary, #0f172a)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
            title="친구 정렬 기준 선택"
          >
            <option value="score">점수순</option>
            <option value="name">이름순 (가나다)</option>
            <option value="attendance">참석순</option>
            <option value="newest">가입순</option>
          </select>
        </div>

        {/* Friends Card List */}
        {filteredMembers.length === 0 ? (
          <div style={{ padding: '30px 10px', textAlign: 'center', color: '#94a3b8' }}>
            검색 결과와 일치하는 회원이 없습니다.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredMembers.map((member) => {
              const effectiveRole = resolveMemberRole(member);
              const roleMeta = ROLE_META[effectiveRole] || ROLE_META.Member;
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

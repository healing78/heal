import React, { useEffect, useState } from 'react';
import { getPlatformInfo, MOBILE_BREAKPOINT } from '../../core/platform';
import {
  formatMemberNickname,
  isAdminRole,
  ROLE_META
} from '../../core/communityRules';

const BASE_NAV_ITEMS = [
  { id: 'home', label: '홈' },
  { id: 'meetings', label: '모임(벙)' },
  { id: 'ranking', label: '랭킹·점수' },
  { id: 'profile', label: '내 정보' }
];

export default function AppLayout({
  activeTab,
  onChangeTab,
  currentUser,
  members,
  onSwitchUser,
  children
}) {
  const [platformInfo, setPlatformInfo] = useState(() => getPlatformInfo());

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      `(max-width: ${MOBILE_BREAKPOINT - 1}px)`
    );
    const handleChange = () => setPlatformInfo(getPlatformInfo());

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const showAdminMenu = currentUser && isAdminRole(currentUser.role);
  const navItems = showAdminMenu
    ? [...BASE_NAV_ITEMS, { id: 'admin', label: '운영 관리' }]
    : BASE_NAV_ITEMS;

  const envLabel = platformInfo.isNative
    ? `App (${platformInfo.platform.toUpperCase()})`
    : platformInfo.isMobileViewport
      ? 'Mobile Web'
      : 'PC Web';

  return (
    <div className="app-shell">
      {/* PC Left Sidebar */}
      <aside className="pc-sidebar">
        <div className="brand-title">
          <span>Heal</span>
          <span className="platform-badge">{envLabel}</span>
        </div>

        <ul className="nav-list">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={`nav-btn ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => onChangeTab(item.id)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Quick Account / Role Switcher for testing permissions */}
        <div className="sidebar-footer">
          <label htmlFor="pc-user-switch" className="switcher-label">
            현재 로그인 계정 (권한 체험)
          </label>
          <select
            id="pc-user-switch"
            className="switcher-select"
            value={currentUser?.uid || ''}
            onChange={(e) => onSwitchUser(e.target.value)}
          >
            {members.map((m) => (
              <option key={m.uid} value={m.uid}>
                [{ROLE_META[m.role]?.label}] {formatMemberNickname(m)} (참석{' '}
                {m.attendanceCount}회)
              </option>
            ))}
            <option value="__LOGOUT__">→ 로그인 / 신규 온보딩 화면</option>
          </select>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="main-container">
        {/* Mobile Top Header */}
        <header className="mobile-header">
          <div className="brand-title">
            <span>Heal</span>
            <span className="platform-badge">{envLabel}</span>
          </div>
          <select
            aria-label="계정 전환"
            className="mobile-switcher"
            value={currentUser?.uid || ''}
            onChange={(e) => onSwitchUser(e.target.value)}
          >
            {members.map((m) => (
              <option key={m.uid} value={m.uid}>
                [{ROLE_META[m.role]?.label}] {m.realName} ({m.attendanceCount}회)
              </option>
            ))}
            <option value="__LOGOUT__">로그인/온보딩 화면</option>
          </select>
        </header>

        <main className="content-body">{children}</main>

        {/* Mobile & Native App Bottom Tab Bar */}
        <nav
          className="mobile-tabbar"
          style={{
            gridTemplateColumns: `repeat(${navItems.length}, 1fr)`
          }}
          aria-label="모바일 하단 메뉴"
        >
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`tab-btn ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => onChangeTab(item.id)}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

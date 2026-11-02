import React, { useEffect, useState } from 'react';
import { getPlatformInfo, MOBILE_BREAKPOINT } from '../../core/platform';

const NAV_ITEMS = [
  { id: 'dashboard', label: '홈 · 랭킹' },
  { id: 'meetings', label: '모임(벙)' },
  { id: 'nickname', label: '닉네임 도구' },
  { id: 'members', label: '회원 관리' }
];

export default function AppLayout({ activeTab, onChangeTab, children }) {
  const [platformInfo, setPlatformInfo] = useState(() => getPlatformInfo());

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const handleChange = () => setPlatformInfo(getPlatformInfo());

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

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
          {NAV_ITEMS.map((item) => (
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
      </aside>

      {/* Main Content Wrapper */}
      <div className="main-container">
        {/* Mobile Top Header */}
        <header className="mobile-header">
          <div className="brand-title">
            <span>Heal</span>
          </div>
          <span className="platform-badge">{envLabel}</span>
        </header>

        <main className="content-body">{children}</main>

        {/* Mobile & Native App Bottom Tab Bar */}
        <nav className="mobile-tabbar" aria-label="모바일 하단 메뉴">
          {NAV_ITEMS.map((item) => (
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

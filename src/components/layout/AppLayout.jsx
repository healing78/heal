import React, { useEffect, useState } from 'react';
import { getPlatformInfo, MOBILE_BREAKPOINT } from '../../core/platform';
import {
  formatMemberNickname,
  isAdminRole,
  ROLE_META
} from '../../core/communityRules';
import { HERO_IMAGE_PATH } from '../../core/routeMeta';
import { isFirebaseConfigured } from '../../services/firebase';

const BASE_NAV_ITEMS = [
  { id: 'home', label: '홈', icon: '🏠' },
  { id: 'meetings', label: '모임(벙)', icon: '📅' },
  { id: 'ranking', label: '랭킹·친구', icon: '🏆' },
  { id: 'nickname', label: '신입닉네임', icon: '🏷️' },
  { id: 'profile', label: '내 정보', icon: '👤' }
];

export default function AppLayout({
  activeTab,
  onChangeTab,
  currentUser,
  members,
  onSwitchUser,
  onResetDemoData,
  headerSummary,
  onShareCurrentRoute,
  shareToast,
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
    ? [...BASE_NAV_ITEMS, { id: 'admin', label: '운영', icon: '⚙️' }]
    : BASE_NAV_ITEMS;

  const envLabel = platformInfo.isNative
    ? `App (${platformInfo.platform.toUpperCase()})`
    : platformInfo.isMobileViewport
      ? 'Mobile Web'
      : 'PC Web';

  const dbLabel = isFirebaseConfigured ? 'Firestore DB' : 'Local DB';

  return (
    <div className="app-shell">
      {/* PC Left Sidebar (Visible >= 768px) */}
      <aside className="pc-sidebar">
        <div className="pc-brand-box">
          <div
            className="brand-title"
            role="button"
            tabIndex={0}
            onClick={() => onChangeTab('home')}
            onKeyDown={(e) => e.key === 'Enter' && onChangeTab('home')}
            style={{ cursor: 'pointer' }}
          >
            <img
              src={HERO_IMAGE_PATH}
              alt="Healing78"
              className="brand-avatar"
            />
            <div>
              <div className="brand-name-row">
                <span>Healing78</span>
                <span className="platform-badge">{envLabel}</span>
              </div>
              <div className="sub-meta">since 2024 · {dbLabel}</div>
            </div>
          </div>

          <div className="pc-summary-pill" title={headerSummary}>
            {headerSummary}
          </div>
        </div>

        <ul className="nav-list">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={`nav-btn ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => onChangeTab(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>

        {/* Quick Account / Role Switcher on PC Sidebar */}
        <div className="sidebar-footer">
          <button
            type="button"
            className="btn btn-outline"
            style={{ width: '100%', marginBottom: '8px' }}
            onClick={onShareCurrentRoute}
          >
            🔗 현재 페이지 카톡 공유
          </button>

          <label htmlFor="pc-user-switch" className="switcher-label">
            현재 로그인 계정 (권한 체험)
          </label>
          <select
            id="pc-user-switch"
            className="switcher-select"
            value={currentUser?.uid || '__LOGOUT__'}
            onChange={(e) => onSwitchUser(e.target.value)}
          >
            <option value="__LOGOUT__">비로그인 (게스트 열람 상태)</option>
            {members.map((m) => (
              <option key={m.uid} value={m.uid}>
                [{ROLE_META[m.role]?.label}] {formatMemberNickname(m)} (참석{' '}
                {m.attendanceCount}회)
              </option>
            ))}
          </select>

          {!isFirebaseConfigured && (
            <button
              type="button"
              className="btn btn-outline"
              style={{ marginTop: '6px', fontSize: '0.78rem', padding: '6px 10px' }}
              onClick={onResetDemoData}
            >
              데모 데이터 초기화
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="main-container">
        {/* Mobile Top Header: Small circular logo + 20-char key info summary + Share button */}
        <header className="mobile-header">
          <div
            className="mobile-header-left"
            role="button"
            tabIndex={0}
            onClick={() => onChangeTab('home')}
            onKeyDown={(e) => e.key === 'Enter' && onChangeTab('home')}
          >
            <img
              src={HERO_IMAGE_PATH}
              alt="Healing78 로고"
              className="header-logo-thumb"
            />
            <h1 className="header-summary-title">{headerSummary}</h1>
          </div>

          <div className="mobile-header-actions">
            {!currentUser && activeTab !== 'login' && (
              <button
                type="button"
                className="header-login-btn"
                onClick={() => onChangeTab('login')}
              >
                로그인
              </button>
            )}
            <button
              type="button"
              className="header-share-btn"
              onClick={onShareCurrentRoute}
              aria-label="현재 주소 및 요약 공유"
            >
              🔗 공유
            </button>
          </div>
        </header>

        {shareToast && (
          <div className="share-toast" role="status">
            {shareToast}
          </div>
        )}

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
              <span className="tab-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span className="tab-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

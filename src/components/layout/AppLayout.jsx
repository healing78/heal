import React, { useEffect, useState } from 'react';
import { getPlatformInfo, MOBILE_BREAKPOINT } from '../../core/platform';
import {
  formatMemberNickname,
  isAdminRole,
  ROLE_META
} from '../../core/communityRules';
import { HERO_IMAGE_PATH } from '../../core/routeMeta';
import { THEME_OPTIONS } from '../../core/theme';
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
  theme,
  onChangeTheme,
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
  const isRoseTheme = theme === 'rose';
  const isExcelTheme = theme === 'excel';

  return (
    <div className={`app-shell theme-${theme}`}>
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
            {isRoseTheme ? (
              <img
                src={HERO_IMAGE_PATH}
                alt="Healing78"
                className="brand-avatar"
              />
            ) : (
              <span className="brand-mono-badge">
                {isExcelTheme ? 'XLS' : 'H78'}
              </span>
            )}
            <div>
              <div className="brand-name-row">
                <span>Healing78</span>
                <span className="platform-badge">{envLabel}</span>
              </div>
              <div className="sub-meta">since 2024 · {dbLabel}</div>
            </div>
          </div>

          <div className="pc-summary-pill" title={headerSummary}>
            {isExcelTheme ? `fx  ${headerSummary}` : headerSummary}
          </div>

          {/* PC Theme Switcher */}
          <div className="theme-switcher-group" role="group" aria-label="화면 테마 선택">
            {THEME_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`theme-chip-btn ${theme === opt.id ? 'active' : ''}`}
                onClick={() => onChangeTheme(opt.id)}
              >
                {opt.shortLabel}
              </button>
            ))}
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
                {isRoseTheme && <span className="nav-icon">{item.icon}</span>}
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
            {isRoseTheme ? '🔗 현재 페이지 카톡 공유' : '현재 페이지 링크 공유'}
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
        {/* Mobile Top Header: 20-char key info summary + Theme Switcher [무채색/엑셀/로즈] + Share */}
        <header className="mobile-header">
          <div
            className="mobile-header-left"
            role="button"
            tabIndex={0}
            onClick={() => onChangeTab('home')}
            onKeyDown={(e) => e.key === 'Enter' && onChangeTab('home')}
          >
            {isRoseTheme && (
              <img
                src={HERO_IMAGE_PATH}
                alt="Healing78 로고"
                className="header-logo-thumb"
              />
            )}
            {isExcelTheme && (
              <span className="excel-fx-badge" aria-hidden="true">
                fx
              </span>
            )}
            <h1 className="header-summary-title">{headerSummary}</h1>
          </div>

          <div className="mobile-header-actions">
            {/* Compact 3-way Theme Switcher: [무채색 | 엑셀 | 로즈] */}
            <div
              className="mobile-theme-toggle"
              role="group"
              aria-label="테마 전환"
            >
              {THEME_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`mobile-theme-btn ${
                    theme === opt.id ? 'active' : ''
                  }`}
                  onClick={() => onChangeTheme(opt.id)}
                >
                  {opt.shortLabel}
                </button>
              ))}
            </div>

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
              공유
            </button>
          </div>
        </header>

        {/* Optional Excel Column Header Bar (A | B | C | D) when Excel Theme is active */}
        {isExcelTheme && (
          <div className="excel-col-bar" aria-hidden="true">
            <span className="excel-row-num">1</span>
            <span>A (구분/항목)</span>
            <span>B (상세 데이터)</span>
            <span>C (상태/점수)</span>
          </div>
        )}

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
              {isRoseTheme && (
                <span className="tab-icon" aria-hidden="true">
                  {item.icon}
                </span>
              )}
              <span className="tab-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

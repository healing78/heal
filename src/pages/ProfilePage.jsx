import React, { useEffect, useState } from 'react';
import {
  canCreateMeeting,
  formatMemberNickname,
  resolveMemberBadge,
  ROLE_META
} from '../core/communityRules';
import { isFirebaseConfigured } from '../services/firebase';

export default function ProfilePage({
  currentUser,
  members = [],
  onUpdateProfile,
  onSwitchUser,
  onResetDemoData,
  onLogout
}) {
  const [form, setForm] = useState({
    realName: currentUser.realName,
    city: currentUser.city,
    homeCity: currentUser.homeCity,
    maritalStatus: currentUser.maritalStatus,
    gender: currentUser.gender
  });
  const [savedBanner, setSavedBanner] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setForm({
      realName: currentUser.realName,
      city: currentUser.city,
      homeCity: currentUser.homeCity,
      maritalStatus: currentUser.maritalStatus,
      gender: currentUser.gender
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

  const handleSave = (e) => {
    e.preventDefault();
    onUpdateProfile(form);
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

  return (
    <div className="list-container">
      {/* Nickname Auto-Generator & One-Click Copy */}
      <section className="list-section">
        <div className="section-title-row">
          <div>
            <h2>내 정보 및 규격 닉네임 관리</h2>
            <p className="muted-text">
              프로필을 수정하면 규격 닉네임이 자동 생성됩니다. 복사하여 카카오톡 오픈채팅방에 적용하세요.
            </p>
          </div>
          <span
            className="role-pill"
            style={{ backgroundColor: ROLE_META[currentUser.role]?.badgeColor }}
          >
            {ROLE_META[currentUser.role]?.label}
          </span>
        </div>

        <div className="nickname-preview-box">
          <div>
            <div className="preview-caption">
              자동 생성 규격 닉네임 (적용 뱃지: {currentBadge})
            </div>
            <div className="preview-value">{generatedNickname}</div>
          </div>
          <button type="button" className="btn btn-primary btn-sm" onClick={handleCopy}>
            {copied ? '복사 완료' : '닉네임 복사'}
          </button>
        </div>

        <form onSubmit={handleSave} className="stack-gap">
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="prof-name">실명</label>
              <input
                id="prof-name"
                type="text"
                required
                value={form.realName}
                onChange={(e) => setForm({ ...form, realName: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label htmlFor="prof-city">거주 지역 (닉네임 표시)</label>
              <input
                id="prof-city"
                type="text"
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label htmlFor="prof-home">연고지 (원정 보너스 +2점 판별 기준)</label>
              <input
                id="prof-home"
                type="text"
                required
                value={form.homeCity}
                onChange={(e) => setForm({ ...form, homeCity: e.target.value })}
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
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
              >
                <option value="남">남성 (남)</option>
                <option value="여">여성 (여)</option>
              </select>
            </div>
            <div className="form-field">
              <label>뱃지 정보 (가입일 / 등급 자동 반영)</label>
              <input
                type="text"
                disabled
                value={`현재 뱃지: ${currentBadge} (가입일: ${currentUser.entryBadge})`}
              />
            </div>
          </div>

          {savedBanner && (
            <div className="success-banner">
              ✅ 프로필과 규격 닉네임 정보가 저장되었습니다.
            </div>
          )}

          <div className="btn-row">
            <button type="submit" className="btn btn-primary">
              프로필 변경사항 저장
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={onLogout}
            >
              로그아웃
            </button>
          </div>
        </form>
      </section>

      {/* Activity & Eligibility Status */}
      <section className="list-section">
        <h3 style={{ marginBottom: '10px' }}>내 활동 자격 현황</h3>
        <div className="stats-grid">
          <div className="stat-box">
            <span className="stat-label">참석 횟수</span>
            <strong className="stat-value">{currentUser.attendanceCount}회</strong>
            <span className="stat-sub">정산 확정 기준</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">벙 개설 자격</span>
            <strong className="stat-value">
              {hostEligible ? '개설 가능' : '미충족'}
            </strong>
            <span className="stat-sub">1회 이상 참석 시</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">누적 점수</span>
            <strong className="stat-value">{currentUser.totalScore}점</strong>
            <span className="stat-sub">
              기본 {currentUser.baseScore}·원정 {currentUser.expeditionScore}
            </span>
          </div>
        </div>
      </section>

      {/* Bottom Test Account Switcher & System Info (Moved from Mobile Header) */}
      {onSwitchUser && (
        <section className="list-section">
          <div className="section-title-row">
            <div>
              <h3>권한 체험용 계정 전환</h3>
              <p className="muted-text">
                방장·부방장·일반회원·신입 권한을 빠르게 전환하여 테스트할 수 있습니다.
              </p>
            </div>
            <span className="platform-badge">{dbLabel}</span>
          </div>
          <div className="stack-gap">
            <select
              aria-label="계정 전환"
              className="switcher-select"
              value={currentUser.uid}
              onChange={(e) => onSwitchUser(e.target.value)}
            >
              {members.map((m) => (
                <option key={m.uid} value={m.uid}>
                  [{ROLE_META[m.role]?.label}] {formatMemberNickname(m)} (참석{' '}
                  {m.attendanceCount}회)
                </option>
              ))}
              <option value="__LOGOUT__">→ 비로그인 / 신규 온보딩 화면</option>
            </select>

            {!isFirebaseConfigured && onResetDemoData && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={onResetDemoData}
              >
                데모 데이터 초기화
              </button>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

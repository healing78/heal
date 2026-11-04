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
    gender: currentUser.gender,
    bankAccount: currentUser.bankAccount || ''
  });
  const [savedBanner, setSavedBanner] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setForm({
      realName: currentUser.realName,
      city: currentUser.city,
      homeCity: currentUser.homeCity,
      maritalStatus: currentUser.maritalStatus,
      gender: currentUser.gender,
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
          <h2>내 정보</h2>
          <span
            className="role-pill"
            style={{ backgroundColor: ROLE_META[currentUser.role]?.badgeColor }}
          >
            {ROLE_META[currentUser.role]?.label}
          </span>
        </div>

        <div className="nickname-preview-box">
          <div>
            <div className="preview-caption">내 닉네임</div>
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
              <label htmlFor="prof-city">거주 지역</label>
              <input
                id="prof-city"
                type="text"
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label htmlFor="prof-home">연고지</label>
              <input
                id="prof-home"
                type="text"
                required
                value={form.homeCity}
                onChange={(e) => setForm({ ...form, homeCity: e.target.value })}
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
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
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

          {savedBanner && (
            <div className="success-banner">✅ 저장되었습니다.</div>
          )}

          <div className="btn-row">
            <button type="submit" className="btn btn-primary">
              저장
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
        <div className="stats-grid">
          <div className="stat-box">
            <span className="stat-label">참석 횟수</span>
            <strong className="stat-value">{currentUser.attendanceCount}회</strong>
          </div>
          <div className="stat-box">
            <span className="stat-label">모임 개설</span>
            <strong className="stat-value">
              {hostEligible ? '가능' : '대기'}
            </strong>
          </div>
          <div className="stat-box">
            <span className="stat-label">누적 점수</span>
            <strong className="stat-value">{currentUser.totalScore}점</strong>
          </div>
        </div>
      </section>

      {/* Bottom Test Account Switcher */}
      {onSwitchUser && (
        <section className="list-section">
          <div className="section-title-row">
            <h3>계정 전환</h3>
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
              <option value="__LOGOUT__">→ 로그아웃</option>
            </select>

            {!isFirebaseConfigured && onResetDemoData && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={onResetDemoData}
              >
                데이터 초기화
              </button>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { suggestNewMemberNickname } from '../nicknameUtils';
import { formatMemberNickname, ROLE_META } from '../core/communityRules';
import { HERO_IMAGE_PATH } from '../core/routeMeta';
import {
  isKakaoConfigured,
  loginWithKakao
} from '../services/kakaoAuthService';

export default function LoginOnboardingPage({
  members,
  onSelectExistingMember,
  onCompleteOnboarding,
  onNavigateTab
}) {
  const [step, setStep] = useState('login'); // 'login' | 'onboarding'
  const [copied, setCopied] = useState(false);
  const [kakaoLoading, setKakaoLoading] = useState(false);
  const [kakaoError, setKakaoError] = useState('');
  const [pendingKakaoUser, setPendingKakaoUser] = useState(null);

  // New member onboarding form
  const [onboardingForm, setOnboardingForm] = useState({
    realName: '',
    city: '서울',
    homeCity: '서울',
    maritalStatus: 'single',
    gender: '남'
  });

  const onboardingPreview = suggestNewMemberNickname({
    name: onboardingForm.realName || '이름',
    city: onboardingForm.city || '지역',
    maritalStatus: onboardingForm.maritalStatus,
    gender: onboardingForm.gender
  });

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleKakaoLoginClick = async () => {
    setKakaoError('');
    if (!isKakaoConfigured) {
      setStep('onboarding');
      return;
    }

    setKakaoLoading(true);
    try {
      const kakaoUser = await loginWithKakao();
      const existingMember = members.find((m) => m.uid === kakaoUser.uid);

      if (existingMember) {
        onSelectExistingMember(existingMember.uid);
        return;
      }

      setPendingKakaoUser(kakaoUser);
      setOnboardingForm((prev) => ({
        ...prev,
        realName: kakaoUser.nickname || prev.realName
      }));
      setStep('onboarding');
    } catch (err) {
      const detail =
        err?.error_description ||
        err?.message ||
        JSON.stringify(err || '알 수 없는 오류');
      setKakaoError(
        `카카오 로그인 안내: ${detail} (Kakao Developers 콘솔의 [앱 설정 > 플랫폼 > Web]에 현재 주소(${window.location.origin}) 등록 여부를 확인해 주세요.)`
      );
    } finally {
      setKakaoLoading(false);
    }
  };

  const handleOnboardingSubmit = (e) => {
    e.preventDefault();
    if (!onboardingForm.realName.trim()) return;
    onCompleteOnboarding(onboardingForm, pendingKakaoUser?.uid);
  };

  if (step === 'onboarding') {
    return (
      <div className="list-container">
        <section className="list-section">
          <div className="section-header">
            <span className="platform-badge">
              {pendingKakaoUser
                ? `카카오 인증 (${pendingKakaoUser.uid})`
                : '신입 등록'}
            </span>
            <h2>프로필 등록</h2>
          </div>

          <form onSubmit={handleOnboardingSubmit} className="stack-gap">
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="onboard-name">실명</label>
                <input
                  id="onboard-name"
                  type="text"
                  placeholder="김힐링"
                  required
                  value={onboardingForm.realName}
                  onChange={(e) =>
                    setOnboardingForm({
                      ...onboardingForm,
                      realName: e.target.value
                    })
                  }
                />
              </div>
              <div className="form-field">
                <label htmlFor="onboard-city">거주 지역</label>
                <input
                  id="onboard-city"
                  type="text"
                  placeholder="서울, 경기, 부산"
                  required
                  value={onboardingForm.city}
                  onChange={(e) =>
                    setOnboardingForm({
                      ...onboardingForm,
                      city: e.target.value,
                      homeCity: e.target.value
                    })
                  }
                />
              </div>
              <div className="form-field">
                <label htmlFor="onboard-home">연고지</label>
                <input
                  id="onboard-home"
                  type="text"
                  required
                  value={onboardingForm.homeCity}
                  onChange={(e) =>
                    setOnboardingForm({
                      ...onboardingForm,
                      homeCity: e.target.value
                    })
                  }
                />
              </div>
              <div className="form-field">
                <label htmlFor="onboard-marital">결혼 여부</label>
                <select
                  id="onboard-marital"
                  value={onboardingForm.maritalStatus}
                  onChange={(e) =>
                    setOnboardingForm({
                      ...onboardingForm,
                      maritalStatus: e.target.value
                    })
                  }
                >
                  <option value="single">미혼 (미)</option>
                  <option value="married">기혼 (기)</option>
                  <option value="divorced">돌싱 (돌)</option>
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="onboard-gender">성별</label>
                <select
                  id="onboard-gender"
                  value={onboardingForm.gender}
                  onChange={(e) =>
                    setOnboardingForm({
                      ...onboardingForm,
                      gender: e.target.value
                    })
                  }
                >
                  <option value="남">남성 (남)</option>
                  <option value="여">여성 (여)</option>
                </select>
              </div>
            </div>

            <div className="nickname-preview-box">
              <div>
                <div className="preview-caption">생성될 닉네임</div>
                <div className="preview-value">{onboardingPreview}</div>
              </div>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => handleCopy(onboardingPreview)}
              >
                {copied ? '복사 완료' : '복사'}
              </button>
            </div>

            <div className="btn-row">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setPendingKakaoUser(null);
                  setStep('login');
                }}
              >
                이전
              </button>
              <button type="submit" className="btn btn-primary">
                저장 후 입장
              </button>
            </div>
          </form>
        </section>
      </div>
    );
  }

  return (
    <div className="list-container">
      {/* Common Login Section (Hero Image visible only in 'rose' theme) */}
      <section className="login-hero-section">
        <div className="login-hero-image-wrap rose-only">
          <img
            src={HERO_IMAGE_PATH}
            alt="Healing78 since 2024 대표 이미지"
            className="login-hero-image"
          />
        </div>
        <div className="login-hero-text">
          <h2>Healing78 로그인</h2>
        </div>

        <div className="stack-gap" style={{ marginTop: '14px' }}>
          <button
            type="button"
            className="btn btn-kakao"
            disabled={kakaoLoading}
            onClick={handleKakaoLoginClick}
          >
            {kakaoLoading ? '연결 중...' : '카카오 로그인'}
          </button>

          <div className="login-sub-actions">
            <button
              type="button"
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={() => {
                setPendingKakaoUser(null);
                setStep('onboarding');
              }}
            >
              신입 등록
            </button>
            {onNavigateTab && (
              <button
                type="button"
                className="btn btn-outline"
                style={{ flex: 1 }}
                onClick={() => onNavigateTab('nickname')}
              >
                닉네임 생성기
              </button>
            )}
          </div>

          {kakaoError && (
            <div className="warning-banner" role="alert">
              ⚠️ {kakaoError}
            </div>
          )}
        </div>
      </section>

      {/* Quick Demo Member Login List (Always Expanded) */}
      <section className="list-section">
        <div className="divider-label" style={{ textAlign: 'left', marginBottom: '10px' }}>
          계정 선택 로그인
        </div>
        <div className="divider-list">
          {members.map((m) => (
            <button
              key={m.uid}
              type="button"
              className="demo-account-btn"
              onClick={() => onSelectExistingMember(m.uid)}
            >
              <div>
                <strong>{formatMemberNickname(m)}</strong>
                <span className="sub-meta">
                  {' '}
                  · 참석 {m.attendanceCount}회 · {m.totalScore}점
                </span>
              </div>
              <span
                className="role-pill"
                style={{ backgroundColor: ROLE_META[m.role]?.badgeColor }}
              >
                {ROLE_META[m.role]?.label}
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

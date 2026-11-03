import React, { useState } from 'react';
import { suggestNewMemberNickname } from '../nicknameUtils';
import { formatMemberNickname, ROLE_META } from '../core/communityRules';
import { HERO_IMAGE_PATH, PAGE_LABELS } from '../core/routeMeta';
import {
  isKakaoConfigured,
  loginWithKakao
} from '../services/kakaoAuthService';

export default function LoginOnboardingPage({
  activeTab = 'home',
  headerSummary = '',
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

  const currentPageLabel = PAGE_LABELS[activeTab] || PAGE_LABELS.home;

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
                ? `카카오 인증 완료 (${pendingKakaoUser.uid})`
                : '신규 회원 온보딩'}
            </span>
            <h2>프로필 및 규격 닉네임 설정</h2>
            <p className="muted-text">
              입력 완료 즉시 <strong>일반회원(Member)</strong>으로 커뮤니티 모임과 랭킹을 이용할 수 있습니다.
            </p>
          </div>

          <form onSubmit={handleOnboardingSubmit} className="stack-gap">
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="onboard-name">실명 (필수)</label>
                <input
                  id="onboard-name"
                  type="text"
                  placeholder="예: 김힐링"
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
                <label htmlFor="onboard-city">거주 지역 (닉네임 표시)</label>
                <input
                  id="onboard-city"
                  type="text"
                  placeholder="예: 서울, 경기, 부산"
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
                <label htmlFor="onboard-home">연고지 (원정 보너스 +2점 기준)</label>
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
                <div className="preview-caption">생성될 내 규격 닉네임 (가입일 뱃지 자동 부여)</div>
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
                이전으로
              </button>
              <button type="submit" className="btn btn-primary">
                프로필 저장 후 입장하기
              </button>
            </div>
          </form>
        </section>
      </div>
    );
  }

  return (
    <div className="list-container">
      {/* Page-Specific Pre-Login Summary Strip */}
      <section className="list-section notice-section">
        <div className="section-title-row" style={{ marginBottom: '4px' }}>
          <span className="platform-badge">{currentPageLabel} (로그인 전)</span>
          <span className="sub-meta">로그인 즉시 본문 열람</span>
        </div>
        <p className="notice-body">
          상단 요약: <strong>{headerSummary}</strong>
        </p>
      </section>

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
          <div className="badge-group" style={{ justifyContent: 'center' }}>
            <span className="platform-badge">Healing78 · since 2024</span>
            {isKakaoConfigured && (
              <span className="platform-badge">Kakao 로그인 연동</span>
            )}
          </div>
          <h2>Healing78 회원 로그인</h2>
          <p className="muted-text">
            로그인하시면 현재 페이지(<strong>{currentPageLabel}</strong>)의 상세 정보를 바로 확인하실 수 있습니다.
          </p>
        </div>

        <div className="stack-gap" style={{ marginTop: '16px' }}>
          <button
            type="button"
            className="btn btn-kakao"
            disabled={kakaoLoading}
            onClick={handleKakaoLoginClick}
          >
            {kakaoLoading ? '카카오 인증 창 연결 중...' : '카카오 계정으로 로그인'}
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
              신입 회원 프로필 등록
            </button>
            {onNavigateTab && (
              <button
                type="button"
                className="btn btn-outline"
                style={{ flex: 1 }}
                onClick={() => onNavigateTab('nickname')}
              >
                신입 닉네임 생성기 (비로그인 가능)
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
          등록된 회원 계정으로 빠른 로그인 체험 (클릭 시 현재 페이지 즉시 열람)
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

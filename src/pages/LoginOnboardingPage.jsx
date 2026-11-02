import React, { useState } from 'react';
import { suggestNewMemberNickname } from '../nicknameUtils';
import { formatMemberNickname, ROLE_META } from '../core/communityRules';
import {
  isKakaoConfigured,
  loginWithKakao
} from '../services/kakaoAuthService';

export default function LoginOnboardingPage({
  members,
  onSelectExistingMember,
  onCompleteOnboarding
}) {
  const [step, setStep] = useState('login'); // 'login' | 'onboarding'
  const [copied, setCopied] = useState(false);
  const [kakaoLoading, setKakaoLoading] = useState(false);
  const [kakaoError, setKakaoError] = useState('');
  const [pendingKakaoUser, setPendingKakaoUser] = useState(null);

  // Quick nickname generator (available before login)
  const [quickForm, setQuickForm] = useState({
    name: '홍길동',
    city: '서울',
    maritalStatus: 'single',
    gender: '남'
  });

  // New member onboarding form
  const [onboardingForm, setOnboardingForm] = useState({
    realName: '',
    city: '서울',
    homeCity: '서울',
    maritalStatus: 'single',
    gender: '남'
  });

  const quickNickname = suggestNewMemberNickname(quickForm);
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

      // First-time Kakao user -> go to Onboarding with pre-filled name & Kakao UID
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
        `카카오 로그인 안내: ${detail} (Kakao Developers 콘솔의 [앱 설정 > 플랫폼 > Web]에 현재 주소(${window.location.origin}) 등록 및 [카카오 로그인 > 활성화 설정 ON] 여부를 확인해 주세요.)`
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
      <div className="auth-wrapper">
        <div className="card auth-card">
          <div className="section-header">
            <span className="platform-badge">
              {pendingKakaoUser
                ? `카카오 인증 완료 (${pendingKakaoUser.uid})`
                : '신규 회원 온보딩'}
            </span>
            <h2>프로필 및 규격 닉네임 설정</h2>
            <p className="muted-text">
              입력 완료 즉시 <strong>일반회원(Member)</strong>으로 커뮤니티를 이용할 수 있습니다.
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
                <label htmlFor="onboard-home">연고지 (원정 보너스 +2점 판별 기준)</label>
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
                className="btn btn-outline"
                onClick={() => handleCopy(onboardingPreview)}
              >
                {copied ? '복사됨!' : '복사'}
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
                프로필 저장 후 커뮤니티 입장
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrapper">
      {/* Main Kakao Login Card */}
      <div className="card auth-card">
        <div className="section-header">
          <div className="badge-group">
            <span className="platform-badge">Heal Community</span>
            {isKakaoConfigured && (
              <span className="platform-badge">Kakao SDK 연동됨</span>
            )}
          </div>
          <h2>힐(Heal) 커뮤니티 관리 시스템</h2>
          <p className="muted-text">
            카카오 계정으로 로그인하세요. 기존 회원은 즉시 입장하며, 미등록 신규 회원은 프로필/닉네임 설정(온보딩) 화면으로 자동 이동합니다.
          </p>
        </div>

        <div className="stack-gap">
          <button
            type="button"
            className="btn btn-kakao"
            disabled={kakaoLoading}
            onClick={handleKakaoLoginClick}
          >
            {kakaoLoading ? '카카오 인증 창 연결 중...' : '카카오 계정으로 로그인'}
          </button>

          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              setPendingKakaoUser(null);
              setStep('onboarding');
            }}
          >
            신규 회원 온보딩 화면 바로 체험하기
          </button>

          {kakaoError && (
            <div className="warning-banner" role="alert">
              ⚠️ {kakaoError}
            </div>
          )}

          <div className="divider-label">또는 등록된 회원 계정으로 빠른 로그인 체험</div>
          <div className="demo-account-list">
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
        </div>
      </div>

      {/* Quick Nickname Generator available before login */}
      <div className="card auth-card">
        <div className="section-header">
          <h3>로그인 전 빠른 닉네임 생성기</h3>
          <p className="muted-text">
            오픈채팅방 입장 전 규격 닉네임([이름 지역 결혼여부 성별 가입일])을 미리 만들고 복사할 수 있습니다.
          </p>
        </div>
        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="quick-name">이름</label>
            <input
              id="quick-name"
              type="text"
              value={quickForm.name}
              onChange={(e) =>
                setQuickForm({ ...quickForm, name: e.target.value })
              }
            />
          </div>
          <div className="form-field">
            <label htmlFor="quick-city">지역</label>
            <input
              id="quick-city"
              type="text"
              value={quickForm.city}
              onChange={(e) =>
                setQuickForm({ ...quickForm, city: e.target.value })
              }
            />
          </div>
          <div className="form-field">
            <label htmlFor="quick-marital">결혼 여부</label>
            <select
              id="quick-marital"
              value={quickForm.maritalStatus}
              onChange={(e) =>
                setQuickForm({ ...quickForm, maritalStatus: e.target.value })
              }
            >
              <option value="single">미혼 (미)</option>
              <option value="married">기혼 (기)</option>
              <option value="divorced">돌싱 (돌)</option>
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="quick-gender">성별</label>
            <select
              id="quick-gender"
              value={quickForm.gender}
              onChange={(e) =>
                setQuickForm({ ...quickForm, gender: e.target.value })
              }
            >
              <option value="남">남성 (남)</option>
              <option value="여">여성 (여)</option>
            </select>
          </div>
        </div>
        <div className="nickname-preview-box">
          <div>
            <div className="preview-caption">규격 닉네임 미리보기</div>
            <div className="preview-value">{quickNickname}</div>
          </div>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => handleCopy(quickNickname)}
          >
            {copied ? '복사됨!' : '닉네임 복사'}
          </button>
        </div>
      </div>
    </div>
  );
}

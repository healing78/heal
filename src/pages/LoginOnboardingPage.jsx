import React, { useMemo, useState } from 'react';
import RegionInput from '../components/RegionInput';
import { isValidKoreanName, suggestNewMemberNickname } from '../nicknameUtils';
import { formatMemberNickname, ROLE_META } from '../core/communityRules';
import { HERO_IMAGE_PATH } from '../core/routeMeta';
import {
  isKakaoConfigured,
  loginWithKakao
} from '../services/kakaoAuthService';
import { recordKakaoLogin } from '../services/communityService';

export default function LoginOnboardingPage({
  members = [],
  onSelectExistingMember,
  onCompleteOnboarding,
  onNavigateTab,
  isSimulation = false,
  onExitSimulation
}) {
  const isDebugUrl =
    typeof window !== 'undefined' &&
    (window.location.search.includes('debug=onboarding') ||
      window.location.search.includes('mode=onboarding') ||
      window.location.search.includes('onboarding=true'));

  const [isSimulating, setIsSimulating] = useState(() => Boolean(isSimulation || isDebugUrl));
  const [step, setStep] = useState(() => (isSimulation || isDebugUrl ? 'onboarding' : 'login'));
  const [copied, setCopied] = useState(false);
  const [kakaoLoading, setKakaoLoading] = useState(false);
  const [kakaoError, setKakaoError] = useState('');
  const [pendingKakaoUser, setPendingKakaoUser] = useState(() =>
    isSimulation || isDebugUrl
      ? { uid: `kakao:sim-${Date.now().toString().slice(-6)}`, nickname: '' }
      : null
  );
  const [showManualHistoricalPicker, setShowManualHistoricalPicker] = useState(false);

  // New member onboarding form
  const [onboardingForm, setOnboardingForm] = useState({
    realName: '',
    legalName: '',
    city: '수원',
    homeCity: '수원',
    maritalStatus: 'single',
    gender: '남',
    linkRequestRealName: '',
    linkSourceUid: '',
    linkRequestType: '', // 'historical' | 'subPhone'
    linkRequestSubName: ''
  });

  // Past active member candidates for account migration (all historical members with records)
  const historicalCandidates = useMemo(() => {
    return members
      .filter((m) => (m.totalScore > 0 || m.attendanceCount > 0) && !m.uid.startsWith('kakao:5'))
      .sort((a, b) => b.totalScore - a.totalScore);
  }, [members]);

  // Active member candidates for sub-phone link
  const activeCandidates = useMemo(() => {
    return members
      .filter((m) => m.status === 'active' || m.uid.startsWith('kakao:5') || m.role === 'admin' || m.role === 'operator')
      .sort((a, b) => (a.realName || '').localeCompare(b.realName || '', 'ko'));
  }, [members]);

  const rawName = (onboardingForm.realName || '').trim();
  const cleanName = rawName.toLowerCase();
  const isNameFormatValid = isValidKoreanName(rawName);

  // Matched historical member by typed name or explicitly chosen
  const matchedHistorical = useMemo(() => {
    if (onboardingForm.linkSourceUid) {
      return members.find((m) => m.uid === onboardingForm.linkSourceUid) || null;
    }
    if (!cleanName) return null;
    return (
      historicalCandidates.find(
        (m) => (m.realName || '').trim().toLowerCase() === cleanName
      ) || null
    );
  }, [historicalCandidates, members, onboardingForm.linkSourceUid, cleanName]);

  // Check if someone else already has this exact name in community
  // (If linkSourceUid is chosen, that target is myself, so it's not a collision)
  const duplicateMember = useMemo(() => {
    if (!cleanName) return null;
    return (
      members.find(
        (m) =>
          (m.realName || '').trim().toLowerCase() === cleanName &&
          m.uid !== onboardingForm.linkSourceUid
      ) || null
    );
  }, [members, cleanName, onboardingForm.linkSourceUid]);

  const hasDuplicateName = Boolean(duplicateMember);
  const isDuplicateActive = Boolean(
    duplicateMember && !historicalCandidates.some((h) => h.uid === duplicateMember.uid)
  );

  // Apply historical link
  const handleApplyLinkAccount = (target) => {
    if (!target) return;
    setOnboardingForm((prev) => ({
      ...prev,
      realName: target.realName,
      city: target.city || prev.city || '수원',
      homeCity: target.homeCity || target.city || prev.homeCity || '수원',
      maritalStatus: target.maritalStatus || prev.maritalStatus || 'single',
      gender: target.gender || prev.gender || '남',
      linkSourceUid: target.uid,
      linkRequestRealName: target.realName,
      linkRequestType: 'historical',
      linkRequestSubName: ''
    }));
  };

  // Apply sub-phone link
  const handleApplySubPhoneLink = (target, subName = '') => {
    if (!target) return;
    setOnboardingForm((prev) => ({
      ...prev,
      realName: subName || target.realName,
      city: target.city || prev.city || '수원',
      homeCity: target.homeCity || target.city || prev.homeCity || '수원',
      maritalStatus: target.maritalStatus || prev.maritalStatus || 'single',
      gender: target.gender || prev.gender || '남',
      linkSourceUid: target.uid,
      linkRequestRealName: target.realName,
      linkRequestType: 'subPhone',
      linkRequestSubName: subName || (prev.realName !== target.realName ? prev.realName : '')
    }));
  };

  // Cancel historical or subphone link
  const handleCancelLinkAccount = () => {
    setOnboardingForm((prev) => ({
      ...prev,
      linkSourceUid: '',
      linkRequestRealName: '',
      linkRequestType: '',
      linkRequestSubName: ''
    }));
  };

  const isFormValid = Boolean(
    isNameFormatValid &&
      !hasDuplicateName &&
      onboardingForm.city.trim() &&
      onboardingForm.maritalStatus &&
      onboardingForm.gender
  );

  const onboardingPreview = suggestNewMemberNickname({
    name: onboardingForm.realName.trim() || '이름',
    city: onboardingForm.city.trim() || '수원',
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
      // Local/demo fallback: directly enter onboarding with temporary Kakao ID
      const mockKakaoUser = {
        uid: `kakao:new-${Date.now()}`,
        nickname: ''
      };
      await recordKakaoLogin(mockKakaoUser.uid, mockKakaoUser.nickname);
      setPendingKakaoUser(mockKakaoUser);
      setStep('onboarding');
      return;
    }

    setKakaoLoading(true);
    try {
      const kakaoUser = await loginWithKakao();
      // Record Kakao login event immediately upon successful authentication
      await recordKakaoLogin(kakaoUser.uid, kakaoUser.nickname);

      const existingMember = members.find(
        (m) =>
          m.uid === kakaoUser.uid ||
          (Array.isArray(m.subUids) && m.subUids.includes(kakaoUser.uid))
      );

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

  const handleStartSimulation = () => {
    setIsSimulating(true);
    setPendingKakaoUser({
      uid: `kakao:sim-${Date.now().toString().slice(-6)}`,
      nickname: ''
    });
    setStep('onboarding');
  };

  const handleExitSimulation = () => {
    setIsSimulating(false);
    setPendingKakaoUser(null);
    setStep('login');
    if (onExitSimulation) onExitSimulation();
  };

  const handleOnboardingSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    onCompleteOnboarding(
      { ...onboardingForm, isSimulation: isSimulating },
      pendingKakaoUser?.uid
    );
  };

  if (step === 'onboarding') {
    return (
      <div className="list-container">
        <section className="list-section">
          {isSimulating && (
            <div
              style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                padding: '10px 14px',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                flexWrap: 'wrap'
              }}
            >
              <div>
                <div style={{ fontWeight: 700, color: '#1e40af', fontSize: '13px' }}>
                  🧪 온보딩 시뮬레이터 모드 ({pendingKakaoUser?.uid})
                </div>
                <div style={{ fontSize: '11px', color: '#2563eb', marginTop: '2px' }}>
                  중복 이름 경고, 서브폰 연동 신청, 과거 이력 승계 UI를 실시간으로 테스트할 수 있습니다.
                </div>
              </div>
              <button
                type="button"
                className="btn btn-outline btn-xs"
                style={{ fontSize: '11px', padding: '3px 8px', color: '#1e40af', borderColor: '#93c5fd' }}
                onClick={handleExitSimulation}
              >
                시뮬레이션 종료
              </button>
            </div>
          )}

          <div className="section-header">
            <span className="platform-badge">
              {pendingKakaoUser?.uid
                ? isSimulating
                  ? `🧪 시뮬레이션 (${pendingKakaoUser.uid})`
                  : `카카오 인증 (${pendingKakaoUser.uid})`
                : '신입 등록'}
            </span>
            <h2>프로필 등록</h2>
          </div>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', marginBottom: '14px' }}>
            힐링78 활동을 위한 기본 프로필을 작성해 주세요. (가입 후 내 정보에서 언제든 수정 가능합니다)
          </p>

          <form onSubmit={handleOnboardingSubmit} className="stack-gap">
            <div className="form-grid">
              <div className="form-field" style={{ gridColumn: '1 / -1' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label htmlFor="onboard-name">이름 (활동명) *</label>
                  {onNavigateTab && (
                    <button
                      type="button"
                      onClick={() => onNavigateTab('nickname')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-primary, #e11d48)',
                        fontSize: '12px',
                        cursor: 'pointer',
                        padding: 0,
                        textDecoration: 'underline'
                      }}
                    >
                      규격 닉네임 생성기 ↗
                    </button>
                  )}
                </div>
                <input
                  id="onboard-name"
                  type="text"
                  placeholder="예: 가을 (한글 1~3자)"
                  required
                  value={onboardingForm.realName}
                  onChange={(e) =>
                    setOnboardingForm({
                      ...onboardingForm,
                      realName: e.target.value
                    })
                  }
                />

                {/* Name format validation */}
                {rawName && !isNameFormatValid && (
                  <div style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>
                    ⚠️ 이름 규칙: 한글 1자에서 3자까지의 유일한 이름이어야 합니다. (영문, 숫자, 특수문자 불가)
                  </div>
                )}

                {/* 1. Prompt to link account if matched with historical member */}
                {matchedHistorical && !onboardingForm.linkSourceUid && (
                  <div
                    style={{
                      background: '#f0fdf4',
                      border: '1px solid #86efac',
                      borderRadius: '8px',
                      padding: '12px 14px',
                      marginTop: '8px'
                    }}
                  >
                    <div style={{ fontWeight: 700, color: '#166534', fontSize: '13px' }}>
                      💡 혹시 이전에 활동하셨던 <strong>[{formatMemberNickname(matchedHistorical)}]</strong> 님이신가요?
                    </div>
                    <div style={{ fontSize: '12px', color: '#15803d', marginTop: '4px', lineHeight: 1.5 }}>
                      과거 벙 활동 기록(누적 <strong>{matchedHistorical.totalScore}점</strong>, 참석 {matchedHistorical.attendanceCount}회, 최초가입 {matchedHistorical.joinedAt || '2024년'})이 확인되었습니다. 본인의 기록이 맞다면 현재 카카오 계정으로 연결 신청을 진행해 주세요.
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      style={{ marginTop: '8px', fontSize: '12px', padding: '6px 12px' }}
                      onClick={() => handleApplyLinkAccount(matchedHistorical)}
                    >
                      ⚡ 네, 기존 활동 이력 연결 신청하기
                    </button>
                  </div>
                )}

                {/* 2. Prompt for sub-phone link if duplicate active member is detected */}
                {isDuplicateActive && !onboardingForm.linkSourceUid && (
                  <div
                    style={{
                      background: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      borderRadius: '8px',
                      padding: '12px 14px',
                      marginTop: '8px'
                    }}
                  >
                    <div style={{ fontWeight: 700, color: '#1e40af', fontSize: '13px' }}>
                      📱 혹시 <strong>[{duplicateMember.realName}]</strong> 님의 서브폰(세컨폰/보조계정)이신가요?
                    </div>
                    <div style={{ fontSize: '12px', color: '#1d4ed8', marginTop: '4px', lineHeight: 1.5 }}>
                      동일한 회원이 세컨폰 또는 보조 계정으로 로그인하시는 경우, 본계정([<strong>{duplicateMember.realName}</strong>])에 서브폰으로 연결을 신청하실 수 있습니다. (운영진 승인 후 기존 닉네임·점수가 통합 공유됩니다)
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      style={{ marginTop: '8px', fontSize: '12px', padding: '6px 12px', background: '#2563eb', borderColor: '#1d4ed8' }}
                      onClick={() => handleApplySubPhoneLink(duplicateMember)}
                    >
                      📱 네, [{duplicateMember.realName}] 님의 서브폰으로 연결 신청하기
                    </button>
                  </div>
                )}

                {/* 3. Show applied status */}
                {onboardingForm.linkSourceUid && (
                  <div
                    style={{
                      background: onboardingForm.linkRequestType === 'subPhone' ? '#eff6ff' : '#f0fdf4',
                      border: `1px solid ${onboardingForm.linkRequestType === 'subPhone' ? '#bfdbfe' : '#86efac'}`,
                      borderRadius: '8px',
                      padding: '10px 14px',
                      marginTop: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                      flexWrap: 'wrap'
                    }}
                  >
                    <div style={{ fontSize: '13px', color: onboardingForm.linkRequestType === 'subPhone' ? '#1e40af' : '#166534' }}>
                      {onboardingForm.linkRequestType === 'subPhone' ? (
                        <>
                          📱 <strong>[{onboardingForm.linkRequestRealName}]</strong> 님의 서브폰(보조계정)으로 연결 신청됨
                          {onboardingForm.linkRequestSubName ? ` (보조 닉네임: ${onboardingForm.linkRequestSubName})` : ''}
                          <span style={{ fontSize: '12px', display: 'block', color: '#3b82f6', marginTop: '2px' }}>
                            (운영진 승인 후 본계정으로 자동 통합 연동됩니다)
                          </span>
                        </>
                      ) : (
                        <>
                          ✅ <strong>[{onboardingForm.linkRequestRealName}]</strong> 기존 활동 이력 연결 신청됨 (누적 {matchedHistorical?.totalScore || 0}점 / 운영진 승인 후 통합)
                        </>
                      )}
                    </div>
                    <button
                      type="button"
                      className="btn btn-outline btn-xs"
                      style={{ fontSize: '11px', padding: '3px 8px' }}
                      onClick={handleCancelLinkAccount}
                    >
                      신청 취소
                    </button>
                  </div>
                )}

                {/* 4. Duplicate name warning (when not linked to that member and not an active member duplicate prompting sub-phone) */}
                {hasDuplicateName && !isDuplicateActive && !onboardingForm.linkSourceUid && (
                  <div
                    style={{
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      marginTop: '8px',
                      color: '#991b1b',
                      fontSize: '13px',
                      lineHeight: 1.5
                    }}
                  >
                    ⚠️ <strong>[{duplicateMember.realName}]</strong> 님은 이미 힐링78에 등록된 이름입니다.
                    <div style={{ fontSize: '12px', color: '#b91c1c', marginTop: '2px' }}>
                      이름 규칙에 따라 모임 내에서 유일한 이름이어야 하므로, 다른 이름(한글 1~3자)을 입력해 주세요. (중복된 이름으로는 가입할 수 없습니다)
                    </div>
                  </div>
                )}

                {/* Optional manual picker toggle if linking past account or sub-phone */}
                {!onboardingForm.linkSourceUid && (
                  <div style={{ marginTop: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setShowManualHistoricalPicker((prev) => !prev)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        fontSize: '11px',
                        cursor: 'pointer',
                        padding: 0,
                        textDecoration: 'underline'
                      }}
                    >
                      {showManualHistoricalPicker
                        ? '▲ 직접 계정 찾기 닫기'
                        : '과거 활동 계정 또는 서브폰 본계정 직접 찾기 🔍'}
                    </button>

                    {showManualHistoricalPicker && (
                      <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div>
                          <label style={{ fontSize: '11px', color: '#475569', fontWeight: 600 }}>
                            과거 활동 이력 연결 (과거 닉네임에서 승계):
                          </label>
                          <select
                            className="switcher-select"
                            style={{ width: '100%', fontSize: '12px', padding: '7px 10px', marginTop: '3px' }}
                            onChange={(e) => {
                              const found = members.find((m) => m.uid === e.target.value);
                              if (found) handleApplyLinkAccount(found);
                            }}
                            value=""
                          >
                            <option value="">-- 과거 활동했던 닉네임을 선택하세요 --</option>
                            {historicalCandidates.map((m) => (
                              <option key={m.uid} value={m.uid}>
                                {formatMemberNickname(m)} (총 {m.totalScore}점 / 참석 {m.attendanceCount}회)
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label style={{ fontSize: '11px', color: '#1e40af', fontWeight: 600 }}>
                            📱 현재 활동 중인 본계정에 서브폰(세컨폰)으로 연결:
                          </label>
                          <select
                            className="switcher-select"
                            style={{ width: '100%', fontSize: '12px', padding: '7px 10px', marginTop: '3px' }}
                            onChange={(e) => {
                              const found = members.find((m) => m.uid === e.target.value);
                              if (found) handleApplySubPhoneLink(found, rawName);
                            }}
                            value=""
                          >
                            <option value="">-- 본인의 본계정을 선택하세요 --</option>
                            {activeCandidates.map((m) => (
                              <option key={m.uid} value={m.uid}>
                                {formatMemberNickname(m)} (누적 {m.totalScore}점)
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="onboard-city">거주 지역 *</label>
                <RegionInput
                  id="onboard-city"
                  required
                  placeholder="서울 구, 지방 시·군 (예: 수원, 강남)"
                  value={onboardingForm.city}
                  onChange={(val) =>
                    setOnboardingForm({
                      ...onboardingForm,
                      city: val,
                      homeCity: val
                    })
                  }
                />
              </div>

              <div className="form-field">
                <label htmlFor="onboard-marital">결혼 여부 *</label>
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
                <label htmlFor="onboard-gender">성별 *</label>
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

              <div className="form-field">
                <label htmlFor="onboard-legal-name">실명 (선택)</label>
                <input
                  id="onboard-legal-name"
                  type="text"
                  placeholder="실명 (선택 사항)"
                  value={onboardingForm.legalName}
                  onChange={(e) =>
                    setOnboardingForm({
                      ...onboardingForm,
                      legalName: e.target.value
                    })
                  }
                />
              </div>
            </div>

            {/* Generated Nickname Preview */}
            <div className="nickname-preview-box">
              <div>
                <div className="preview-caption">생성될 오픈채팅 닉네임</div>
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

            <div className="btn-row" style={{ marginTop: '10px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setPendingKakaoUser(null);
                  setStep('login');
                }}
              >
                취소
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!isFormValid}
                style={{
                  opacity: isFormValid ? 1 : 0.45,
                  cursor: isFormValid ? 'pointer' : 'not-allowed'
                }}
              >
                저장 후 입장
              </button>
            </div>

            {!isFormValid && (
              <div style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>
                * 한글 1~3자의 유일한 이름과 필수 정보(거주지역, 결혼여부, 성별)를 모두 올바르게 입력해야 입장할 수 있습니다.
              </div>
            )}
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
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>
            카카오 계정으로 간편하게 시작하세요.<br />
            기존 회원은 즉시 로그인되며, 신규 회원은 프로필 등록으로 바로 연결됩니다.
          </p>
        </div>

        <div className="stack-gap" style={{ marginTop: '16px' }}>
          <button
            type="button"
            className="btn btn-kakao"
            disabled={kakaoLoading}
            onClick={handleKakaoLoginClick}
            style={{ width: '100%', padding: '12px', fontSize: '15px' }}
          >
            {kakaoLoading ? '카카오 인증 연결 중...' : '🟡 카카오 로그인'}
          </button>

          {onNavigateTab && (
            <button
              type="button"
              className="btn btn-outline"
              style={{ width: '100%', marginTop: '6px' }}
              onClick={() => onNavigateTab('nickname')}
            >
              🏷️ 신입 규격 닉네임 생성기
            </button>
          )}

          <div style={{ marginTop: '14px', textAlign: 'center' }}>
            <button
              type="button"
              onClick={handleStartSimulation}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                fontSize: '11px',
                cursor: 'pointer',
                padding: '4px',
                textDecoration: 'underline'
              }}
            >
              🧪 신규 가입 & 서브폰 온보딩 시뮬레이터 체험 모드
            </button>
          </div>

          {kakaoError && (
            <div className="warning-banner" role="alert" style={{ marginTop: '10px' }}>
              ⚠️ {kakaoError}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

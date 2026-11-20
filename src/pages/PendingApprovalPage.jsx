import React, { useState } from 'react';
import { formatMemberNickname, ROLE_META } from '../core/communityRules';

export default function PendingApprovalPage({
  currentUser,
  communityConfig = {},
  onLogout,
  onRefresh
}) {
  const [refreshing, setRefreshing] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState('');

  const isRejected = currentUser?.approvalStatus === 'rejected';
  const isPending = !isRejected; // default pending

  const handleRefresh = async () => {
    setRefreshing(true);
    if (onRefresh) {
      await onRefresh();
    }
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  const handleCopyKakaoLink = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopyFeedback('문의 링크가 복사되었습니다!');
      setTimeout(() => setCopyFeedback(''), 2500);
    } catch {
      setCopyFeedback('복사 실패');
      setTimeout(() => setCopyFeedback(''), 2000);
    }
  };

  const kakaoUrl = communityConfig.kakaoChatUrl || 'https://open.kakao.com';

  return (
    <div className="list-container" style={{ maxWidth: '540px', margin: '0 auto', padding: '24px 16px' }}>
      {/* 1. Header Card */}
      <div
        style={{
          background: 'var(--color-bg-primary, #ffffff)',
          border: `1px solid ${isRejected ? '#fca5a5' : '#fde68a'}`,
          borderRadius: '12px',
          padding: '24px 20px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          marginBottom: '16px'
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>
          {isRejected ? '❌' : '⏳'}
        </div>

        <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-primary, #0f172a)', margin: '0 0 8px 0' }}>
          {isRejected ? '가입 승인이 반려되었습니다' : '가입 승인 대기 중입니다'}
        </h2>

        <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--color-text-secondary, #475569)', margin: 0 }}>
          {isRejected
            ? (currentUser?.rejectionReason || '운영진 검토 결과 가입이 반려되었습니다. 문의사항이 있으시면 아래 운영진 1:1 오픈채팅으로 연락 부탁드립니다.')
            : '힐링78 커뮤니티는 쾌적하고 안전한 모임 운영을 위해 운영진의 확인 후 가입이 최종 승인됩니다. 승인이 완료되면 별도의 새로고침 없이 즉시 모든 기능이 활성화됩니다.'}
        </p>
      </div>

      {/* 2. My Submitted Info Card */}
      <div
        style={{
          background: 'var(--color-bg-primary, #ffffff)',
          border: '1px solid var(--color-border, #e2e8f0)',
          borderRadius: '12px',
          padding: '18px 20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          marginBottom: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <strong style={{ fontSize: '15px', color: 'var(--color-text-primary, #0f172a)' }}>
            내가 등록한 프로필 정보
          </strong>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '4px',
              background: isRejected ? '#fee2e2' : '#fef3c7',
              color: isRejected ? '#991b1b' : '#92400e',
              border: `1px solid ${isRejected ? '#fca5a5' : '#fde68a'}`
            }}
          >
            {isRejected ? '반려됨' : '승인 대기 중'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', rowGap: '10px', fontSize: '13px', lineHeight: 1.5 }}>
          <span style={{ color: 'var(--color-text-muted, #64748b)' }}>활동 닉네임:</span>
          <span style={{ fontWeight: 700, color: 'var(--color-text-primary, #0f172a)' }}>
            {currentUser?.realName || '-'} {currentUser?.legalName ? `(${currentUser.legalName})` : ''}
          </span>

          <span style={{ color: 'var(--color-text-muted, #64748b)' }}>거주 지역:</span>
          <span>{currentUser?.city || currentUser?.homeCity || '-'}</span>

          <span style={{ color: 'var(--color-text-muted, #64748b)' }}>성별 / 구분:</span>
          <span>
            {currentUser?.gender === '여' ? '여성' : '남성'} ·{' '}
            {currentUser?.maritalStatus === 'single'
              ? '미혼'
              : currentUser?.maritalStatus === 'married'
                ? '기혼'
                : '돌싱'}
          </span>

          <span style={{ color: 'var(--color-text-muted, #64748b)' }}>가입 신청일:</span>
          <span>{currentUser?.joinedAt || '오늘'}</span>

          {Boolean(currentUser?.linkRequestRealName || currentUser?.linkRequestSourceUid) && (
            <>
              <span style={{ color: 'var(--color-text-muted, #64748b)' }}>이력 연동:</span>
              <span style={{ color: '#2563eb', fontWeight: 600 }}>
                기존 활동 계정({currentUser?.linkRequestRealName || '지정 계정'}) 연계 요청됨
              </span>
            </>
          )}

          <span style={{ color: 'var(--color-text-muted, #64748b)' }}>고유 식별자:</span>
          <code style={{ fontSize: '11px', color: '#64748b', wordBreak: 'break-all' }}>
            {currentUser?.uid}
          </code>
        </div>
      </div>

      {/* 3. Guide & Actions Card */}
      <div
        style={{
          background: 'var(--color-bg-primary, #ffffff)',
          border: '1px solid var(--color-border, #e2e8f0)',
          borderRadius: '12px',
          padding: '18px 20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}
      >
        <strong style={{ fontSize: '14px', color: 'var(--color-text-primary, #0f172a)' }}>
          빠른 승인이 필요하신가요?
        </strong>
        <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary, #475569)', margin: 0, lineHeight: 1.5 }}>
          당일 급벙 참석이나 빠른 이용을 원하시면 카카오톡 오픈채팅방 또는 운영진에게 가입 승인을 요청해 주세요.
        </p>

        <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
          <a
            href={kakaoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{
              flex: 1,
              minWidth: '140px',
              textDecoration: 'none',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <span>💬</span>
            <span>운영진에게 승인 요청</span>
          </a>

          <button
            type="button"
            className="btn btn-outline"
            style={{ minWidth: '100px' }}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? '확인 중...' : '🔄 승인 여부 새로고침'}
          </button>
        </div>

        {copyFeedback && (
          <div style={{ fontSize: '12px', color: '#10b981', textAlign: 'center', marginTop: '4px' }}>
            {copyFeedback}
          </div>
        )}

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border, #e2e8f0)', margin: '10px 0' }} />

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            style={{ color: '#64748b', fontSize: '12px' }}
            onClick={onLogout}
          >
            다른 카카오 계정으로 로그인 / 로그아웃
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { suggestNewMemberNickname } from '../nicknameUtils';
import { formatMemberNickname } from '../core/communityRules';

export default function NicknamePage({
  currentUser,
  onNavigateTab,
  onSharePage
}) {
  const [form, setForm] = useState({
    name: currentUser?.realName || '홍길동',
    city: currentUser?.city || '서울',
    maritalStatus: currentUser?.maritalStatus || 'single',
    gender: currentUser?.gender || '남'
  });
  const [copied, setCopied] = useState(false);

  const generatedNickname = suggestNewMemberNickname({
    name: form.name || '이름',
    city: form.city || '지역',
    maritalStatus: form.maritalStatus,
    gender: form.gender
  });

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
      {/* Top Info Section */}
      <section className="list-section">
        <div className="section-title-row">
          <div>
            <span className="platform-badge">신입 필수 안내</span>
            <h2 style={{ marginTop: '6px' }}>신입 규격 닉네임 자동 생성기</h2>
            <p className="muted-text">
              Healing78 오픈채팅방 입장 후 아래 생성기에서 본인 정보를 입력하고{' '}
              <strong>[닉네임 복사]</strong>를 눌러 카톡방 프로필 이름을 변경해 주세요.
            </p>
          </div>
          {onSharePage && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={onSharePage}
            >
              이 페이지 공유
            </button>
          )}
        </div>

        {/* Live Nickname Preview Box */}
        <div className="nickname-preview-box">
          <div>
            <div className="preview-caption">
              복사할 오픈채팅방 규격 닉네임 ([이름 지역 결혼여부 성별 가입일])
            </div>
            <div className="preview-value">{generatedNickname}</div>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleCopy}
          >
            {copied ? '복사 완료' : '닉네임 복사'}
          </button>
        </div>
      </section>

      {/* Generator Input Form */}
      <section className="list-section">
        <h3>내 정보 입력</h3>
        <div className="form-grid" style={{ marginTop: '12px' }}>
          <div className="form-field">
            <label htmlFor="nick-name">실명 (또는 사용할 이름)</label>
            <input
              id="nick-name"
              type="text"
              placeholder="예: 김힐링"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="form-field">
            <label htmlFor="nick-city">거주 지역 (2글자 권장)</label>
            <input
              id="nick-city"
              type="text"
              placeholder="예: 서울, 경기, 인천, 부산"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          </div>
          <div className="form-field">
            <label htmlFor="nick-marital">결혼 여부</label>
            <select
              id="nick-marital"
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
            <label htmlFor="nick-gender">성별</label>
            <select
              id="nick-gender"
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
            >
              <option value="남">남성 (남)</option>
              <option value="여">여성 (여)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Naming Rules Guide */}
      <section className="list-section">
        <h3>Healing78 닉네임 규격 안내</h3>
        <div className="rules-list" style={{ marginTop: '10px' }}>
          <div className="rule-row">
            <span className="rule-badge">기본 규격</span>
            <span>
              <strong>[이름 지역 미/기/돌 남/여 MMDD]</strong> 형식으로 띄어쓰기를 포함해 작성합니다.
            </span>
          </div>
          <div className="rule-row">
            <span className="rule-badge">가입일(MMDD)</span>
            <span>
              신입 회원은 오늘 날짜(가입일 4자리)가 자동으로 들어가며, 정식 등급(VIP/방장 등) 부여 시 뱃지로 자동 전환됩니다.
            </span>
          </div>
          {currentUser ? (
            <div className="rule-row">
              <span className="rule-badge">내 등록 정보</span>
              <span>
                현재 내 등록 닉네임은 <strong>{formatMemberNickname(currentUser)}</strong> 입니다.{' '}
                <button
                  type="button"
                  className="btn-link"
                  onClick={() => onNavigateTab('profile')}
                >
                  내 정보 수정하러 가기 →
                </button>
              </span>
            </div>
          ) : (
            <div className="rule-row">
              <span className="rule-badge">정식 등록</span>
              <span>
                닉네임 복사 후 모임(벙) 참석 신청과 활동 점수를 기록하려면{' '}
                <button
                  type="button"
                  className="btn-link"
                  onClick={() => onNavigateTab('login')}
                >
                  로그인 · 신입 등록하기 →
                </button>
              </span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

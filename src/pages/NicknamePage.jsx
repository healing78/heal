import React, { useState } from 'react';
import RegionInput from '../components/RegionInput';
import { suggestNewMemberNickname } from '../nicknameUtils';

export default function NicknamePage({
  currentUser,
  communityConfig = {},
  onAdminUpdateConfig,
  onSharePage
}) {
  const [form, setForm] = useState({
    name: currentUser?.realName || '홍길동',
    city: currentUser?.city || '서울',
    maritalStatus: currentUser?.maritalStatus || 'single',
    gender: currentUser?.gender || '남'
  });
  const [copied, setCopied] = useState(false);
  const [isEditingNotice, setIsEditingNotice] = useState(false);
  const [noticeText, setNoticeText] = useState(
    communityConfig?.newcomerNoticeBody ||
      'Healing78 오픈채팅방 입장 후 24시간 이내에 아래 자동 생성기로 규격 닉네임을 만들어 카톡방 프로필을 변경해 주세요.'
  );

  const isLeader = currentUser?.role === 'Leader';

  const handleSaveNotice = (e) => {
    e.preventDefault();
    if (onAdminUpdateConfig) {
      onAdminUpdateConfig({
        ...communityConfig,
        newcomerNoticeBody: noticeText
      });
    }
    setIsEditingNotice(false);
  };

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
      {/* Newcomer Notice Section */}
      <section className="list-section">
        <div className="section-title-row" style={{ marginBottom: '8px' }}>
          <h3>신입 안내 공지</h3>
          {isLeader && !isEditingNotice && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => {
                setNoticeText(communityConfig?.newcomerNoticeBody || noticeText);
                setIsEditingNotice(true);
              }}
            >
              수정
            </button>
          )}
        </div>

        {isLeader && isEditingNotice ? (
          <form onSubmit={handleSaveNotice} className="stack-gap">
            <textarea
              rows={3}
              value={noticeText}
              onChange={(e) => setNoticeText(e.target.value)}
              required
            />
            <div className="btn-row">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setIsEditingNotice(false)}
              >
                취소
              </button>
              <button type="submit" className="btn btn-primary btn-sm">
                저장
              </button>
            </div>
          </form>
        ) : (
          <p
            className="muted-text"
            style={{ margin: 0, lineHeight: 1.6, color: 'var(--color-text, #334155)' }}
          >
            {communityConfig?.newcomerNoticeBody || noticeText}
          </p>
        )}
      </section>

      {/* Nickname Generator Preview & Copy */}
      <section className="list-section">
        <div className="section-title-row">
          <h2>신입 닉네임 생성기</h2>
          {onSharePage && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={onSharePage}
            >
              공유
            </button>
          )}
        </div>

        {/* Live Nickname Preview Box */}
        <div className="nickname-preview-box">
          <div>
            <div className="preview-caption">생성된 닉네임</div>
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
        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="nick-name">이름</label>
            <input
              id="nick-name"
              type="text"
              placeholder="김힐링"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="form-field">
            <label htmlFor="nick-city">거주 지역</label>
            <RegionInput
              id="nick-city"
              required
              placeholder="서울 구, 지방 시·군 입력 (예: 강남, 수원)"
              value={form.city}
              onChange={(val) => setForm({ ...form, city: val })}
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
    </div>
  );
}

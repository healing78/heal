import React, { useState } from 'react';
import { suggestNewMemberNickname } from '../nicknameUtils';

export default function NicknamePage({
  currentUser,
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
            <input
              id="nick-city"
              type="text"
              placeholder="서울, 경기, 부산"
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
    </div>
  );
}

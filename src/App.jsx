import React, { useState } from 'react';
import AppLayout from './components/layout/AppLayout';
import { suggestNewMemberNickname } from './nicknameUtils';

export default function App() {
  const [activeTab, setActiveTab] = useState('nickname');
  const [form, setForm] = useState({
    name: '홍길동',
    city: '서울',
    maritalStatus: 'single',
    gender: '남'
  });

  const previewNickname = suggestNewMemberNickname(form);

  return (
    <AppLayout activeTab={activeTab} onChangeTab={setActiveTab}>
      <section className="card">
        <h2>닉네임 생성 및 규격 검증 도구</h2>
        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="member-name">실명</label>
            <input
              id="member-name"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="form-field">
            <label htmlFor="member-city">거주 지역</label>
            <input
              id="member-city"
              type="text"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          </div>
          <div className="form-field">
            <label htmlFor="member-marital">결혼 여부</label>
            <select
              id="member-marital"
              value={form.maritalStatus}
              onChange={(e) => setForm({ ...form, maritalStatus: e.target.value })}
            >
              <option value="single">미혼 (미)</option>
              <option value="married">기혼 (기)</option>
              <option value="divorced">돌싱 (돌)</option>
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="member-gender">성별</label>
            <select
              id="member-gender"
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
            >
              <option value="남">남성 (남)</option>
              <option value="여">여성 (여)</option>
            </select>
          </div>
        </div>
        <div className="nickname-preview">추천 닉네임: {previewNickname}</div>
      </section>
    </AppLayout>
  );
}

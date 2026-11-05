import React, { useEffect, useState } from 'react';
import {
  calculateMeetingScoreForMember,
  calculateMeetingSettlement,
  canCreateMeeting,
  formatMemberNickname,
  resolveMemberBadge,
  ROLE_META
} from '../core/communityRules';
import { isFirebaseConfigured } from '../services/firebase';

export default function ProfilePage({
  currentUser,
  members = [],
  meetings = [],
  onOpenMeetingDetail,
  onUpdateProfile,
  onSwitchUser,
  onResetDemoData,
  onLogout
}) {
  const [subTab, setSubTab] = useState('profile'); // 'profile' | 'report'
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

  // Compute personal report data across all meetings for currentUser
  const personalMeetingRows = [];
  let totalMyBurden = 0;
  let totalMyOutOfPocket = 0;
  let totalMySponsored = 0;

  if (currentUser) {
    for (const mtg of meetings) {
      const settlement = calculateMeetingSettlement(mtg);
      const myRow = settlement.participantRows.find(
        (r) => r.uid === currentUser.uid
      );

      const mySponsors = (mtg.sponsorships || [])
        .filter((s) => s.uid === currentUser.uid)
        .reduce((acc, s) => acc + (Number(s.amount) || 0), 0);
      const myGoldenBells = (mtg.rounds || [])
        .filter((r) => r.isGoldenBell && r.goldenBellUid === currentUser.uid)
        .reduce((acc, r) => acc + (Number(r.cost) || 0), 0);

      totalMySponsored += mySponsors + myGoldenBells;

      if (myRow) {
        totalMyBurden += myRow.finalShare;
        totalMyOutOfPocket += myRow.paidOutOfPocket;
        const scoreInfo = calculateMeetingScoreForMember(
          currentUser,
          mtg.location
        );
        personalMeetingRows.push({
          meeting: mtg,
          row: myRow,
          sponsoredAmount: mySponsors + myGoldenBells,
          scoreInfo
        });
      }
    }
  }

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
      {/* Top Header & Sub-tab Bar */}
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

        <div className="subtab-bar" style={{ marginTop: '12px' }}>
          <button
            type="button"
            className={`subtab-btn ${subTab === 'profile' ? 'active' : ''}`}
            onClick={() => setSubTab('profile')}
          >
            내 정보 수정
          </button>
          <button
            type="button"
            className={`subtab-btn ${subTab === 'report' ? 'active' : ''}`}
            onClick={() => setSubTab('report')}
          >
            내 활동 리포트 ({personalMeetingRows.length})
          </button>
        </div>
      </section>

      {subTab === 'profile' ? (
        <>
          {/* Nickname Auto-Generator & One-Click Copy */}
          <section className="list-section">
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
        </>
      ) : (
        /* Sub-tab: Personal Activity & Settlement Report */
        <section className="list-section stack-gap">
          <div className="summary-header">
            <div>
              <span className="muted-text">내 활동 및 정산 요약</span>
              <div className="my-nickname-row">
                <h2>{formatMemberNickname(currentUser)}</h2>
                <span
                  className="role-pill"
                  style={{
                    backgroundColor: ROLE_META[currentUser.role]?.badgeColor
                  }}
                >
                  {ROLE_META[currentUser.role]?.label}
                </span>
              </div>
              <div className="sub-meta" style={{ marginTop: '4px' }}>
                등록 계좌: {currentUser.bankAccount || '미등록'} · 연고지: {currentUser.homeCity}
              </div>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-box">
              <span className="stat-label">누적 점수 / 참석</span>
              <strong className="stat-value">
                {currentUser.totalScore}점 ({currentUser.attendanceCount}회)
              </strong>
              <span className="stat-sub">
                기본 {currentUser.baseScore} · 원정 {currentUser.expeditionScore} · 이벤트 {currentUser.eventScore}
              </span>
            </div>
            <div className="stat-box">
              <span className="stat-label">총 부담 회비</span>
              <strong className="stat-value">
                {totalMyBurden.toLocaleString()}원
              </strong>
              <span className="stat-sub">
                참여 모임 {personalMeetingRows.length}건 합계
              </span>
            </div>
            <div className="stat-box">
              <span className="stat-label">총 결제 · 찬조액</span>
              <strong className="stat-value">
                {(totalMyOutOfPocket + totalMySponsored).toLocaleString()}원
              </strong>
              <span className="stat-sub">
                대납 {totalMyOutOfPocket.toLocaleString()} / 찬조·골든벨 {totalMySponsored.toLocaleString()}
              </span>
            </div>
          </div>

          <h3 style={{ marginTop: '8px' }}>참여 모임별 정산·귀가 상세 내역</h3>
          {personalMeetingRows.length === 0 ? (
            <p className="muted-text">참여한 모임 내역이 없습니다.</p>
          ) : (
            <div className="divider-list">
              {personalMeetingRows.map(({ meeting: mtg, row, sponsoredAmount, scoreInfo }) => (
                <div key={mtg.id} className="list-item-row">
                  <div className="meeting-top">
                    <div className="badge-group">
                      <span className="platform-badge">#{mtg.id}</span>
                      <strong>{mtg.title}</strong>
                      <span className="location-pill">{mtg.location}</span>
                      <span className="platform-badge">
                        +{scoreInfo.total}점 ({scoreInfo.label})
                      </span>
                    </div>
                    <span className="muted-text">{mtg.date}</span>
                  </div>

                  <div className="meeting-footer" style={{ marginTop: '6px' }}>
                    <div className="badge-group">
                      <span className="sub-meta">
                        참석: {row.attendedRounds.join(', ') || '미선택'}
                      </span>
                      <span
                        className={`status-pill ${
                          row.confirmed ? 'open' : 'settled'
                        }`}
                      >
                        {row.confirmed
                          ? '컨펌완료'
                          : row.paid
                            ? '입금완료'
                            : '미입금'}
                      </span>
                      {row.safeReturnAt && (
                        <span className="status-pill open">
                          {row.safeReturnAt}
                        </span>
                      )}
                      {sponsoredAmount > 0 && (
                        <span className="expedition-pill">
                          찬조·골든벨 {sponsoredAmount.toLocaleString()}원
                        </span>
                      )}
                    </div>

                    <div className="badge-group">
                      <strong className="score-highlight">
                        부담금 {row.finalShare.toLocaleString()}원
                      </strong>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() =>
                          onOpenMeetingDetail && onOpenMeetingDetail(mtg.id)
                        }
                      >
                        모임 보기
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

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

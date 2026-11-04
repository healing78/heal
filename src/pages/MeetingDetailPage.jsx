import React, { useState } from 'react';
import {
  calculateMeetingScoreForMember,
  calculateMeetingSettlement,
  canManageMeeting,
  formatMemberNickname,
  isAdminRole,
  REGION_GROUPS,
  resolveRegionGroup
} from '../core/communityRules';

/**
 * Compress uploaded receipt image to a compact JPEG DataURL (max 720px)
 */
function compressReceiptImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 720;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.72));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function MeetingDetailPage({
  meeting,
  currentUser,
  members,
  onBackToList,
  onShareMeeting,
  onToggleApplyMeeting,
  onUpdateMeeting,
  onUpdateMemberProfile,
  onSettleMeeting,
  onNavigateTab
}) {
  const [editingInfo, setEditingInfo] = useState(false);
  const [infoForm, setInfoForm] = useState({
    title: meeting.title || '',
    dateOnly:
      meeting.dateOnly || String(meeting.date || '').slice(0, 10) || '2026-11-07',
    startTime:
      meeting.startTime || String(meeting.date || '').slice(11, 16) || '19:00',
    endTime: meeting.endTime || '23:00',
    location: meeting.location || '서울',
    treasurerUid: meeting.treasurerUid || meeting.hostUid,
    type: meeting.type || 'Casual',
    description: meeting.description || ''
  });

  const [myBankInput, setMyBankInput] = useState(
    currentUser?.bankAccount || ''
  );
  const [editingBank, setEditingBank] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);
  const [sponsorForm, setSponsorForm] = useState({
    uid: currentUser?.uid || meeting.hostUid,
    amount: '',
    memo: ''
  });
  const [previewReceiptUrl, setPreviewReceiptUrl] = useState('');

  const canManage = canManageMeeting(currentUser, meeting);
  const adminUser = isAdminRole(currentUser?.role);
  const isApplied = (meeting.applicants || []).includes(currentUser?.uid);

  const hostMember = members.find((m) => m.uid === meeting.hostUid);
  const treasurerUid = meeting.treasurerUid || meeting.hostUid;
  const treasurerMember =
    members.find((m) => m.uid === treasurerUid) || hostMember;

  const rounds = Array.isArray(meeting.rounds) ? meeting.rounds : [];
  const sponsorships = Array.isArray(meeting.sponsorships)
    ? meeting.sponsorships
    : [];
  const safeReturns = meeting.safeReturns || {};
  const mySafeReturn = safeReturns[currentUser?.uid] || '';

  const settlement = calculateMeetingSettlement(meeting);
  const myScorePreview = calculateMeetingScoreForMember(
    currentUser,
    meeting.location
  );
  const regionGroup = resolveRegionGroup(meeting.location);

  // Save edited basic meeting info (Host / Treasurer / Admin)
  const handleSaveBasicInfo = async (e) => {
    e.preventDefault();
    if (!infoForm.title.trim() || !infoForm.location.trim()) return;
    const combinedDate = `${infoForm.dateOnly} ${infoForm.startTime}`;
    await onUpdateMeeting(meeting.id, {
      title: infoForm.title.trim(),
      dateOnly: infoForm.dateOnly,
      startTime: infoForm.startTime,
      endTime: infoForm.endTime || '23:00',
      date: combinedDate,
      location: infoForm.location.trim(),
      treasurerUid: infoForm.treasurerUid,
      type: adminUser ? infoForm.type : meeting.type,
      description: infoForm.description.trim()
    });
    setEditingInfo(false);
  };

  // Toggle Safe Return Home (귀가완료 버튼)
  const handleToggleSafeReturn = async () => {
    if (!currentUser) return;
    const nextReturns = { ...safeReturns };
    if (nextReturns[currentUser.uid]) {
      delete nextReturns[currentUser.uid];
    } else {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      nextReturns[currentUser.uid] = `${hh}:${mm} 귀가완료`;
    }
    await onUpdateMeeting(meeting.id, { safeReturns: nextReturns });
  };

  // Save current user's bank account directly from the meeting page
  const handleSaveMyBank = async (e) => {
    e.preventDefault();
    if (!currentUser || !onUpdateMemberProfile) return;
    await onUpdateMemberProfile({ bankAccount: myBankInput.trim() });
    setEditingBank(false);
  };

  const handleCopyAccount = async (text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    } catch {
      setCopiedAccount(false);
    }
  };

  // Round management (Add / Remove / Update Round)
  const handleAddRound = async () => {
    const nextNum = rounds.length + 1;
    const nextRound = {
      id: `r-${Date.now()}`,
      label: `${nextNum}차`,
      placeName: '',
      mapUrl: '',
      participants: [...(meeting.applicants || [])],
      payerUid: currentUser?.uid || treasurerUid,
      cost: 0,
      receiptUrl: '',
      isGoldenBell: false,
      goldenBellUid: ''
    };
    await onUpdateMeeting(meeting.id, {
      rounds: [...rounds, nextRound]
    });
  };

  const handleRemoveRound = async (roundIdx) => {
    if (rounds.length <= 1) return;
    const nextRounds = rounds
      .filter((_, idx) => idx !== roundIdx)
      .map((r, idx) => ({ ...r, label: `${idx + 1}차` }));
    await onUpdateMeeting(meeting.id, { rounds: nextRounds });
  };

  const handleUpdateRoundField = async (roundIdx, fieldPatch) => {
    const nextRounds = rounds.map((r, idx) =>
      idx === roundIdx ? { ...r, ...fieldPatch } : r
    );
    await onUpdateMeeting(meeting.id, {
      rounds: nextRounds,
      placeDetail:
        roundIdx === 0 && fieldPatch.placeName !== undefined
          ? fieldPatch.placeName
          : meeting.placeDetail
    });
  };

  const handleToggleRoundParticipant = async (roundIdx, targetUid) => {
    // Self can always toggle their own round participation; Host/Treasurer/Admin can toggle anyone
    if (targetUid !== currentUser?.uid && !canManage) return;
    const targetRound = rounds[roundIdx];
    if (!targetRound) return;

    const currentList = Array.isArray(targetRound.participants)
      ? targetRound.participants
      : [];
    const exists = currentList.includes(targetUid);
    const nextParticipants = exists
      ? currentList.filter((id) => id !== targetUid)
      : [...currentList, targetUid];

    // If someone joins a round and wasn't in meeting.applicants yet, include them
    const nextApplicants = (meeting.applicants || []).includes(targetUid)
      ? meeting.applicants
      : [...(meeting.applicants || []), targetUid];

    const nextRounds = rounds.map((r, idx) =>
      idx === roundIdx ? { ...r, participants: nextParticipants } : r
    );

    await onUpdateMeeting(meeting.id, {
      applicants: nextApplicants,
      rounds: nextRounds
    });
  };

  const handleReceiptUpload = async (roundIdx, file) => {
    if (!file) return;
    try {
      const dataUrl = await compressReceiptImage(file);
      await handleUpdateRoundField(roundIdx, { receiptUrl: dataUrl });
    } catch (err) {
      console.error('Receipt image compression failed:', err);
    }
  };

  // Sponsorship management (찬조금)
  const handleAddSponsorship = async (e) => {
    e.preventDefault();
    const numericAmount = Number(sponsorForm.amount);
    if (!sponsorForm.uid || !numericAmount || numericAmount <= 0) return;
    const entry = {
      id: `sp-${Date.now()}`,
      uid: sponsorForm.uid,
      amount: numericAmount,
      memo: sponsorForm.memo.trim() || '찬조금'
    };
    await onUpdateMeeting(meeting.id, {
      sponsorships: [...sponsorships, entry]
    });
    setSponsorForm({
      uid: currentUser?.uid || meeting.hostUid,
      amount: '',
      memo: ''
    });
  };

  const handleDeleteSponsorship = async (spId) => {
    await onUpdateMeeting(meeting.id, {
      sponsorships: sponsorships.filter((s) => s.id !== spId)
    });
  };

  // Rounding rule & Manual override
  const handleChangeRounding = async (nextRule) => {
    await onUpdateMeeting(meeting.id, { roundingRule: nextRule });
  };

  const handleManualOverrideChange = async (uid, valueStr) => {
    if (!canManage) return;
    const nextManual = { ...(meeting.manualAmounts || {}) };
    if (valueStr === '' || valueStr === null) {
      delete nextManual[uid];
    } else {
      nextManual[uid] = Number(valueStr) || 0;
    }
    await onUpdateMeeting(meeting.id, { manualAmounts: nextManual });
  };

  // Participant clicks [입금 완료]
  const handleTogglePaid = async (uid) => {
    if (uid !== currentUser?.uid && !canManage) return;
    const currentStatuses = meeting.paymentStatuses || {};
    const prev = currentStatuses[uid] || { paid: false, confirmed: false };
    const nextPaid = !prev.paid;
    const nextStatuses = {
      ...currentStatuses,
      [uid]: {
        paid: nextPaid,
        confirmed: nextPaid ? prev.confirmed : false
      }
    };
    await onUpdateMeeting(meeting.id, { paymentStatuses: nextStatuses });
  };

  // Host/Treasurer clicks [입금 컨펌]
  const handleToggleConfirmPayment = async (uid) => {
    if (!canManage) return;
    const currentStatuses = meeting.paymentStatuses || {};
    const prev = currentStatuses[uid] || { paid: false, confirmed: false };
    const nextConfirmed = !prev.confirmed;
    const nextStatuses = {
      ...currentStatuses,
      [uid]: {
        paid: nextConfirmed ? true : prev.paid,
        confirmed: nextConfirmed
      }
    };
    await onUpdateMeeting(meeting.id, { paymentStatuses: nextStatuses });
  };

  // Finalize meeting & grant attendance/expedition scores
  const handleFinalizeSettlement = async () => {
    if (!canManage || meeting.status === 'settled') return;
    const confirmedUids = settlement.participantRows
      .filter((row) => row.attendedRounds.length > 0)
      .map((row) => row.uid);
    const finalUids =
      confirmedUids.length > 0 ? confirmedUids : meeting.applicants || [];
    await onSettleMeeting(meeting.id, finalUids);
  };

  // Copy meeting settlement summary report text for KakaoTalk
  const handleCopySettlementReport = async () => {
    const lines = [
      `[Healing78 모임 정산 리포트 #${meeting.id}]`,
      `■ 모임명: ${meeting.title}`,
      `■ 일시/지역: ${meeting.date} (${meeting.location})`,
      `■ 주최: ${hostMember ? formatMemberNickname(hostMember) : meeting.hostUid}`,
      `■ 총무(입금계좌): ${
        treasurerMember ? formatMemberNickname(treasurerMember) : treasurerUid
      } / ${treasurerMember?.bankAccount || '계좌 미등록'}`,
      `■ 총 모임비용: ${settlement.totalGrossCost.toLocaleString()}원 (골든벨 ${settlement.totalGoldenBellCost.toLocaleString()}원 / 찬조금 ${settlement.totalSponsorship.toLocaleString()}원)`,
      `--- 개인별 정산 내역 ---`,
      ...settlement.participantRows.map((row) => {
        const m = members.find((mem) => mem.uid === row.uid);
        const nick = m ? m.realName : row.uid;
        const statusText = row.confirmed
          ? '컨펌완료'
          : row.paid
            ? '입금완료(대기)'
            : '미입금';
        const netLabel =
          row.netToPay >= 0
            ? `입금할 금액 ${row.netToPay.toLocaleString()}원`
            : `총무에게 받을 정산금 ${Math.abs(row.netToPay).toLocaleString()}원`;
        return `· ${nick} (${row.attendedRounds.join(',') || '미참석'}): 부담 ${row.finalShare.toLocaleString()}원 / ${netLabel} [${statusText}]`;
      }),
      `상세 보기: https://healing78.web.app/meetings/${meeting.id}`
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopiedReport(true);
      setTimeout(() => setCopiedReport(false), 2000);
    } catch {
      setCopiedReport(false);
    }
  };

  return (
    <div className="list-container">
      {/* 1. Top Bar & Core Meeting Info */}
      <section className="list-section">
        <div className="section-title-row">
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={onBackToList}
          >
            ← 모임 목록으로
          </button>
          <div className="badge-group">
            <span className="platform-badge">#{meeting.id}</span>
            <span
              className={`status-pill ${
                meeting.status === 'settled' ? 'settled' : 'open'
              }`}
            >
              {meeting.status === 'settled' ? '정산·마감 완료' : '진행·모집중'}
            </span>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => onShareMeeting(meeting)}
            >
              공유
            </button>
          </div>
        </div>

        {/* Highlighted Date/Time & Title */}
        <div className="meeting-detail-hero">
          <div className="badge-group" style={{ marginBottom: '6px' }}>
            <span
              className={`type-pill ${
                meeting.type === 'Official' ? 'official' : 'casual'
              }`}
            >
              {meeting.type === 'Official' ? '공식 모임' : '자율/번개'}
            </span>
            <span className="location-pill">
              {meeting.location} ({regionGroup.name})
            </span>
            {myScorePreview.isExpedition && (
              <span className="expedition-pill">{myScorePreview.label}</span>
            )}
          </div>

          <div className="meeting-datetime-emphasis">{meeting.date}</div>
          <h2 className="meeting-title-emphasis">{meeting.title}</h2>
          {meeting.description && (
            <p className="mtg-desc" style={{ marginTop: '6px' }}>
              {meeting.description}
            </p>
          )}

          <div className="meeting-meta-grid">
            <div>
              <span className="sub-meta">주최: </span>
              <strong>
                {hostMember ? formatMemberNickname(hostMember) : meeting.hostUid}
              </strong>
            </div>
            <div>
              <span className="sub-meta">총무: </span>
              <strong>
                {treasurerMember
                  ? formatMemberNickname(treasurerMember)
                  : treasurerUid}
              </strong>
            </div>
          </div>
        </div>

        {/* Primary User Actions: Attendance Apply + Safe Return Home + Host Edit */}
        <div className="meeting-quick-actions">
          {meeting.status === 'open' && (
            <button
              type="button"
              className={`btn ${isApplied ? 'btn-outline' : 'btn-primary'}`}
              onClick={() => onToggleApplyMeeting(meeting.id)}
            >
              {isApplied ? '참석 신청 취소' : '이 모임 참석 신청'}
            </button>
          )}

          <button
            type="button"
            className={`btn ${mySafeReturn ? 'btn-primary' : 'btn-outline'}`}
            onClick={handleToggleSafeReturn}
          >
            {mySafeReturn ? `귀가완료 (${mySafeReturn})` : '귀가완료'}
          </button>

          {canManage && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setEditingInfo((prev) => !prev)}
            >
              {editingInfo ? '수정 닫기' : '모임 정보 수정'}
            </button>
          )}
        </div>

        {/* Host / Treasurer / Admin Basic Info Edit Form */}
        {editingInfo && canManage && (
          <form
            onSubmit={handleSaveBasicInfo}
            className="stack-gap"
            style={{
              marginTop: '14px',
              paddingTop: '14px',
              borderTop: '1px solid var(--color-divider)'
            }}
          >
            <h3>모임 정보 수정</h3>
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="edit-mtg-title">모임 제목</label>
                <input
                  id="edit-mtg-title"
                  type="text"
                  required
                  value={infoForm.title}
                  onChange={(e) =>
                    setInfoForm({ ...infoForm, title: e.target.value })
                  }
                />
              </div>
              <div className="form-field">
                <label htmlFor="edit-mtg-loc">모임 지역</label>
                <input
                  id="edit-mtg-loc"
                  type="text"
                  list="region-suggestions"
                  required
                  value={infoForm.location}
                  onChange={(e) =>
                    setInfoForm({ ...infoForm, location: e.target.value })
                  }
                />
                <datalist id="region-suggestions">
                  {REGION_GROUPS.map((g) => (
                    <option key={g.id} value={g.keywords[0]}>
                      {g.name}
                    </option>
                  ))}
                </datalist>
              </div>
              <div className="form-field">
                <label htmlFor="edit-mtg-date">날짜</label>
                <input
                  id="edit-mtg-date"
                  type="date"
                  required
                  value={infoForm.dateOnly}
                  onChange={(e) =>
                    setInfoForm({ ...infoForm, dateOnly: e.target.value })
                  }
                />
              </div>
              <div className="form-field">
                <label htmlFor="edit-mtg-time">시작 시간</label>
                <input
                  id="edit-mtg-time"
                  type="time"
                  required
                  value={infoForm.startTime}
                  onChange={(e) =>
                    setInfoForm({ ...infoForm, startTime: e.target.value })
                  }
                />
              </div>
              <div className="form-field">
                <label htmlFor="edit-mtg-end-time">종료 시간</label>
                <input
                  id="edit-mtg-end-time"
                  type="time"
                  value={infoForm.endTime}
                  onChange={(e) =>
                    setInfoForm({ ...infoForm, endTime: e.target.value })
                  }
                />
              </div>
              <div className="form-field">
                <label htmlFor="edit-mtg-treasurer">총무</label>
                <select
                  id="edit-mtg-treasurer"
                  value={infoForm.treasurerUid}
                  onChange={(e) =>
                    setInfoForm({ ...infoForm, treasurerUid: e.target.value })
                  }
                >
                  {members.map((m) => (
                    <option key={m.uid} value={m.uid}>
                      {formatMemberNickname(m)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="edit-mtg-desc">안내 메모</label>
                <input
                  id="edit-mtg-desc"
                  type="text"
                  value={infoForm.description}
                  onChange={(e) =>
                    setInfoForm({ ...infoForm, description: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="btn-row">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setEditingInfo(false)}
              >
                취소
              </button>
              <button type="submit" className="btn btn-primary btn-sm">
                저장
              </button>
            </div>
          </form>
        )}
      </section>

      {/* 2. Multi-Round Venues, Map Links, Payer, Cost & Per-Round Participants */}
      <section className="list-section">
        <div className="section-title-row">
          <h2>차수별 장소 · 참석 · 비용</h2>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleAddRound}
          >
            + {rounds.length + 1}차 추가
          </button>
        </div>

        <div className="divider-list">
          {rounds.map((r, idx) => {
            const rSummary = settlement.roundSummaries[idx] || {};
            const rParticipants = Array.isArray(r.participants)
              ? r.participants
              : [];
            const amIInRound = rParticipants.includes(currentUser?.uid);
            const naverSearchUrl = r.placeName
              ? `https://map.naver.com/p/search/${encodeURIComponent(r.placeName)}`
              : 'https://map.naver.com';
            const kakaoSearchUrl = r.placeName
              ? `https://map.kakao.com/?q=${encodeURIComponent(r.placeName)}`
              : 'https://map.kakao.com';

            return (
              <div key={r.id || idx} className="list-item-row stack-gap">
                <div className="meeting-top">
                  <div className="badge-group">
                    <span className="platform-badge">{idx + 1}차</span>
                    <strong>{r.placeName || '장소 미정'}</strong>
                    {r.isGoldenBell && (
                      <span className="expedition-pill">
                        골든벨 (
                        {members.find((m) => m.uid === r.goldenBellUid)
                          ?.realName || '전액찬조'}
                        )
                      </span>
                    )}
                  </div>
                  <div className="btn-row">
                    <button
                      type="button"
                      className={`btn btn-sm ${
                        amIInRound ? 'btn-primary' : 'btn-outline'
                      }`}
                      onClick={() =>
                        handleToggleRoundParticipant(idx, currentUser?.uid)
                      }
                    >
                      {amIInRound
                        ? `${idx + 1}차 참석 ✓`
                        : `${idx + 1}차 불참`}
                    </button>
                    {rounds.length > 1 && canManage && (
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => handleRemoveRound(idx)}
                      >
                        삭제
                      </button>
                    )}
                  </div>
                </div>

                {/* Place Name & Naver / Kakao Map Links */}
                <div className="form-grid">
                  <div className="form-field">
                    <label>{idx + 1}차 장소</label>
                    <input
                      type="text"
                      placeholder={`${idx + 1}차 상호명`}
                      value={r.placeName || ''}
                      onChange={(e) =>
                        handleUpdateRoundField(idx, {
                          placeName: e.target.value
                        })
                      }
                    />
                  </div>
                  <div className="form-field">
                    <label>지도 링크</label>
                    <div className="inline-input-row">
                      <input
                        type="url"
                        placeholder="네이버/카카오 지도 링크"
                        value={r.mapUrl || ''}
                        onChange={(e) =>
                          handleUpdateRoundField(idx, {
                            mapUrl: e.target.value
                          })
                        }
                      />
                      {r.mapUrl && (
                        <a
                          href={r.mapUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-primary btn-sm"
                          style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}
                        >
                          지도 열기
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Map Search Shortcuts */}
                {r.placeName && (
                  <div className="badge-group">
                    <a
                      href={naverSearchUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline btn-sm"
                      style={{ textDecoration: 'none' }}
                    >
                      네이버 지도
                    </a>
                    <a
                      href={kakaoSearchUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline btn-sm"
                      style={{ textDecoration: 'none' }}
                    >
                      카카오맵
                    </a>
                  </div>
                )}

                {/* Per-Round Payer, Cost, Golden Bell & Optional Receipt Photo */}
                <div className="round-finance-box">
                  <div className="form-grid">
                    <div className="form-field">
                      <label>{idx + 1}차 결제자</label>
                      <select
                        value={r.payerUid || treasurerUid}
                        onChange={(e) =>
                          handleUpdateRoundField(idx, {
                            payerUid: e.target.value
                          })
                        }
                      >
                        {members.map((m) => (
                          <option key={m.uid} value={m.uid}>
                            {formatMemberNickname(m)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-field">
                      <label>{idx + 1}차 비용 (원)</label>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        placeholder="0"
                        value={r.cost || ''}
                        onChange={(e) =>
                          handleUpdateRoundField(idx, {
                            cost: Number(e.target.value) || 0
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Golden Bell & Receipt Upload Row */}
                  <div className="round-extra-row">
                    <div className="control-inline">
                      <label className="check-item">
                        <input
                          type="checkbox"
                          checked={Boolean(r.isGoldenBell)}
                          onChange={(e) =>
                            handleUpdateRoundField(idx, {
                              isGoldenBell: e.target.checked,
                              goldenBellUid: e.target.checked
                                ? r.goldenBellUid || r.payerUid || currentUser?.uid
                                : ''
                            })
                          }
                        />
                        <span>골든벨</span>
                      </label>
                      {r.isGoldenBell && (
                        <select
                          value={r.goldenBellUid || r.payerUid || ''}
                          onChange={(e) =>
                            handleUpdateRoundField(idx, {
                              goldenBellUid: e.target.value
                            })
                          }
                        >
                          {members.map((m) => (
                            <option key={m.uid} value={m.uid}>
                              {formatMemberNickname(m)}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div className="control-inline">
                      <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer' }}>
                        {r.receiptUrl ? '영수증 변경' : '영수증 첨부'}
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) =>
                            handleReceiptUpload(idx, e.target.files?.[0])
                          }
                        />
                      </label>
                      {r.receiptUrl && (
                        <>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => setPreviewReceiptUrl(r.receiptUrl)}
                          >
                            영수증 보기
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() =>
                              handleUpdateRoundField(idx, { receiptUrl: '' })
                            }
                          >
                            삭제
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="sub-meta">
                    {r.isGoldenBell
                      ? `${idx + 1}차 골든벨 (부담금 0원)`
                      : `${idx + 1}차 참석 ${rParticipants.length}명 · 1인 ${(
                          rSummary.perPersonRounded || 0
                        ).toLocaleString()}원`}
                  </div>
                </div>

                {/* Per-Round Participant Nickname Chips */}
                <div className="participants-box">
                  <div className="participants-title">
                    {idx + 1}차 참석자 ({rParticipants.length}명)
                  </div>
                  <div className="chip-list">
                    {(meeting.applicants || []).map((uid) => {
                      const m = members.find((mem) => mem.uid === uid);
                      if (!m) return null;
                      const included = rParticipants.includes(uid);
                      const canToggleThis =
                        canManage || uid === currentUser?.uid;
                      return (
                        <button
                          key={uid}
                          type="button"
                          disabled={!canToggleThis}
                          onClick={() =>
                            handleToggleRoundParticipant(idx, uid)
                          }
                          className={`member-chip-btn ${
                            included ? 'active' : 'inactive'
                          }`}
                        >
                          {formatMemberNickname(m)}{' '}
                          {included ? '✓' : '(불참)'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Receipt Preview Modal */}
      {previewReceiptUrl && (
        <section className="list-section highlight-section">
          <div className="section-title-row">
            <h3>영수증 사진</h3>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setPreviewReceiptUrl('')}
            >
              닫기 ✕
            </button>
          </div>
          <img
            src={previewReceiptUrl}
            alt="영수증 이미지"
            className="receipt-preview-img"
          />
        </section>
      )}

      {/* 3. Treasurer Bank Account & Sponsorships (찬조금) */}
      <section className="list-section">
        <div className="section-title-row">
          <h2>총무 계좌 · 찬조금</h2>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              setMyBankInput(currentUser?.bankAccount || '');
              setEditingBank((prev) => !prev);
            }}
          >
            {editingBank ? '닫기' : '내 계좌 등록'}
          </button>
        </div>

        {/* Treasurer Account Box */}
        <div className="nickname-preview-box">
          <div>
            <div className="preview-caption">
              총무 ({treasurerMember ? formatMemberNickname(treasurerMember) : treasurerUid})
            </div>
            <div className="preview-value">
              {treasurerMember?.bankAccount || '계좌 미등록'}
            </div>
          </div>
          {treasurerMember?.bankAccount && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => handleCopyAccount(treasurerMember.bankAccount)}
            >
              {copiedAccount ? '복사됨' : '계좌 복사'}
            </button>
          )}
        </div>

        {/* Inline My Bank Account Edit Form */}
        {editingBank && (
          <form onSubmit={handleSaveMyBank} className="inline-input-row" style={{ marginBottom: '12px' }}>
            <input
              type="text"
              placeholder="은행명 계좌번호 (예금주)"
              value={myBankInput}
              onChange={(e) => setMyBankInput(e.target.value)}
              style={{ flex: 1, padding: '8px 10px', borderRadius: 'var(--radius-base)', border: '1px solid var(--color-border)' }}
            />
            <button type="submit" className="btn btn-primary btn-sm">
              저장
            </button>
          </form>
        )}

        {/* Sponsorship (찬조금) List & Form */}
        <div className="round-finance-box" style={{ marginTop: '10px' }}>
          <div className="section-title-row" style={{ marginBottom: '8px' }}>
            <strong>찬조금 ({settlement.totalSponsorship.toLocaleString()}원)</strong>
          </div>

          {sponsorships.length > 0 && (
            <div className="divider-list" style={{ marginBottom: '10px' }}>
              {sponsorships.map((sp) => {
                const spMember = members.find((m) => m.uid === sp.uid);
                return (
                  <div key={sp.id} className="ranking-row">
                    <div>
                      <strong>
                        {spMember ? formatMemberNickname(spMember) : sp.uid}
                      </strong>
                      <span className="sub-meta"> · {sp.memo}</span>
                    </div>
                    <div className="badge-group">
                      <strong className="score-highlight">
                        {Number(sp.amount).toLocaleString()}원
                      </strong>
                      {canManage && (
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => handleDeleteSponsorship(sp.id)}
                        >
                          삭제
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <form onSubmit={handleAddSponsorship} className="filter-bar">
            <select
              value={sponsorForm.uid}
              onChange={(e) =>
                setSponsorForm({ ...sponsorForm, uid: e.target.value })
              }
            >
              {members.map((m) => (
                <option key={m.uid} value={m.uid}>
                  {formatMemberNickname(m)}
                </option>
              ))}
            </select>
            <input
              type="number"
              min="1000"
              step="1000"
              placeholder="금액(원)"
              value={sponsorForm.amount}
              onChange={(e) =>
                setSponsorForm({ ...sponsorForm, amount: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="메모"
              value={sponsorForm.memo}
              onChange={(e) =>
                setSponsorForm({ ...sponsorForm, memo: e.target.value })
              }
            />
            <button type="submit" className="btn btn-outline btn-sm">
              + 추가
            </button>
          </form>
        </div>
      </section>

      {/* 4. Personal Burden Table, Payment Complete, Host Confirm & Safe Return Status */}
      <section className="list-section">
        <div className="section-title-row">
          <h2>개인별 정산 · 입금 · 귀가</h2>
          <div className="control-inline">
            <label htmlFor="rounding-select">끝전</label>
            <select
              id="rounding-select"
              value={meeting.roundingRule || 'floor100'}
              disabled={!canManage}
              onChange={(e) => handleChangeRounding(e.target.value)}
            >
              <option value="floor100">100원 버림</option>
              <option value="ceil100">100원 올림</option>
              <option value="round1">1원 반올림</option>
            </select>
          </div>
        </div>

        {/* Summary Stats Grid */}
        <div className="stats-grid" style={{ marginBottom: '12px' }}>
          <div className="stat-box">
            <span className="stat-label">총 발생 비용</span>
            <strong className="stat-value">
              {settlement.totalGrossCost.toLocaleString()}원
            </strong>
            <span className="stat-sub">
              골든벨 {settlement.totalGoldenBellCost.toLocaleString()}원 포함
            </span>
          </div>
          <div className="stat-box">
            <span className="stat-label">찬조금 차감</span>
            <strong className="stat-value">
              -{settlement.totalSponsorship.toLocaleString()}원
            </strong>
            <span className="stat-sub">{sponsorships.length}건 찬조</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">실제 1/N 대상액</span>
            <strong className="stat-value">
              {Math.max(
                0,
                settlement.totalSharedCost - settlement.totalSponsorship
              ).toLocaleString()}
              원
            </strong>
            <span className="stat-sub">
              참석 {settlement.participantRows.length}명
            </span>
          </div>
        </div>

        {/* Participant Settlement Rows */}
        <div className="divider-list">
          {settlement.participantRows.map((row) => {
            const m = members.find((mem) => mem.uid === row.uid);
            if (!m) return null;
            const scoreCalc = calculateMeetingScoreForMember(
              m,
              meeting.location
            );
            const isMe = row.uid === currentUser?.uid;

            return (
              <div
                key={row.uid}
                className={`list-item-row ${isMe ? 'highlight-section' : ''}`}
              >
                <div className="meeting-top">
                  <div className="badge-group">
                    <strong>{formatMemberNickname(m)}</strong>
                    <span className="location-pill">
                      {row.attendedRounds.join(' · ') || '차수 미선택'}
                    </span>
                    <span className="platform-badge">
                      점수 +{scoreCalc.total}점 ({scoreCalc.label})
                    </span>
                    {row.safeReturnAt && (
                      <span className="status-pill open">
                        {row.safeReturnAt}
                      </span>
                    )}
                  </div>

                  {/* Payment & Host Confirm Buttons */}
                  <div className="btn-row">
                    <button
                      type="button"
                      disabled={!isMe && !canManage}
                      className={`btn btn-sm ${
                        row.paid ? 'btn-primary' : 'btn-outline'
                      }`}
                      onClick={() => handleTogglePaid(row.uid)}
                    >
                      {row.paid ? '입금완료 ✓' : '입금완료'}
                    </button>

                    <button
                      type="button"
                      disabled={!canManage}
                      className={`btn btn-sm ${
                        row.confirmed ? 'btn-settle' : 'btn-outline'
                      }`}
                      onClick={() => handleToggleConfirmPayment(row.uid)}
                    >
                      {row.confirmed ? '컨펌완료 ✓' : '컨펌대기'}
                    </button>
                  </div>
                </div>

                {/* Financial Detail Line + Optional Host Manual Override */}
                <div
                  className="meeting-footer"
                  style={{ marginTop: '8px', fontSize: '0.84rem' }}
                >
                  <div>
                    <span className="sub-meta">
                      부담 {row.calculatedShare.toLocaleString()}원
                    </span>
                    {row.paidOutOfPocket > 0 && (
                      <span className="sub-meta">
                        {' '}
                        · 대납 -{row.paidOutOfPocket.toLocaleString()}원
                      </span>
                    )}
                  </div>

                  <div className="badge-group">
                    {canManage && (
                      <div className="control-inline">
                        <label>수동금액</label>
                        <input
                          type="number"
                          step="100"
                          placeholder={String(row.calculatedShare)}
                          value={
                            row.hasManualOverride
                              ? meeting.manualAmounts[row.uid]
                              : ''
                          }
                          onChange={(e) =>
                            handleManualOverrideChange(row.uid, e.target.value)
                          }
                          style={{ width: '96px' }}
                        />
                      </div>
                    )}

                    <strong className="score-highlight">
                      {row.netToPay >= 0
                        ? `입금 ${row.netToPay.toLocaleString()}원`
                        : `환급 +${Math.abs(
                            row.netToPay
                          ).toLocaleString()}원`}
                    </strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Settlement Finalization & Report Actions */}
        <div
          className="meeting-footer"
          style={{
            marginTop: '16px',
            paddingTop: '14px',
            borderTop: '1px solid var(--color-divider)'
          }}
        >
          <div className="btn-row">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleCopySettlementReport}
            >
              {copiedReport ? '복사됨' : '정산 리포트 복사'}
            </button>
            {onNavigateTab && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => onNavigateTab('reports')}
              >
                리포트 →
              </button>
            )}
          </div>

          {canManage && meeting.status === 'open' && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleFinalizeSettlement}
            >
              모임 마감 · 점수 정산
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

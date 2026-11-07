import React, { useMemo, useState } from 'react';
import { formatMemberNickname, REGION_GROUPS } from '../core/communityRules';
import { useArmedAction } from '../utils/useArmedAction';

export default function AdminMeetingEditModal({
  isOpen,
  meeting = null,
  members = [],
  onSave,
  onClose,
  onDelete
}) {
  const { isArmed, runArmed } = useArmedAction();
  const isEditing = Boolean(meeting && meeting.id);

  // Form state
  const [title, setTitle] = useState(() => meeting?.title || '');
  const [dateOnly, setDateOnly] = useState(() =>
    meeting?.dateOnly || (meeting?.date ? String(meeting.date).slice(0, 10) : new Date().toISOString().slice(0, 10))
  );
  const [startTime, setStartTime] = useState(() => meeting?.startTime || '19:00');
  const [endTime, setEndTime] = useState(() => meeting?.endTime || '23:00');
  const [allDay, setAllDay] = useState(() => Boolean(meeting?.allDay));
  const [location, setLocation] = useState(() => meeting?.location || '서울');
  const [placeDetail, setPlaceDetail] = useState(() => meeting?.placeDetail || meeting?.rounds?.[0]?.placeName || '');
  const [hostUid, setHostUid] = useState(() => meeting?.hostUid || (members[0]?.uid || ''));
  const [treasurerUid, setTreasurerUid] = useState(() => meeting?.treasurerUid || '');
  const [status, setStatus] = useState(() => meeting?.status || 'open');
  const [type, setType] = useState(() => meeting?.type || 'Casual');
  const [description, setDescription] = useState(() => meeting?.description || '');

  // Attendees list state (applicants)
  const [applicants, setApplicants] = useState(() =>
    Array.isArray(meeting?.applicants) && meeting.applicants.length > 0
      ? meeting.applicants
      : (meeting?.hostUid ? [meeting.hostUid] : [])
  );
  const [attendeeSearchQuery, setAttendeeSearchQuery] = useState('');

  // Rounds state
  const [rounds, setRounds] = useState(() => {
    if (Array.isArray(meeting?.rounds) && meeting.rounds.length > 0) {
      return meeting.rounds.map((r, idx) => ({
        id: r.id || `r-${idx + 1}`,
        label: r.label || `${idx + 1}차`,
        placeName: r.placeName || '',
        mapUrl: r.mapUrl || '',
        cost: r.cost || 0,
        payerUid: r.payerUid || meeting?.treasurerUid || meeting?.hostUid || '',
        participants: Array.isArray(r.participants) ? r.participants : (meeting?.applicants || []),
        isGoldenBell: Boolean(r.isGoldenBell),
        goldenBellUid: r.goldenBellUid || ''
      }));
    }
    return [
      {
        id: 'r-1',
        label: '1차',
        placeName: meeting?.placeDetail || '',
        mapUrl: '',
        cost: 0,
        payerUid: meeting?.treasurerUid || meeting?.hostUid || '',
        participants: meeting?.applicants || [],
        isGoldenBell: false,
        goldenBellUid: ''
      }
    ];
  });

  const [saving, setSaving] = useState(false);

  // Sorted members for dropdowns
  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => (a.realName || '').localeCompare(b.realName || '', 'ko'));
  }, [members]);

  // Attendees search filter
  const filteredCandidates = useMemo(() => {
    const q = attendeeSearchQuery.trim().toLowerCase();
    if (!q) return [];
    return sortedMembers.filter((m) => {
      const name = (m.realName || '').toLowerCase();
      const city = (m.city || m.homeCity || '').toLowerCase();
      return (name.includes(q) || city.includes(q)) && !applicants.includes(m.uid);
    }).slice(0, 15);
  }, [sortedMembers, attendeeSearchQuery, applicants]);

  if (!isOpen) return null;

  // Toggle member attendance
  const handleToggleAttendee = (uid) => {
    if (applicants.includes(uid)) {
      setApplicants((prev) => prev.filter((id) => id !== uid));
      // Also remove from rounds
      setRounds((prev) =>
        prev.map((r) => ({
          ...r,
          participants: r.participants.filter((id) => id !== uid)
        }))
      );
    } else {
      setApplicants((prev) => [...prev, uid]);
      // Also add to 1st round
      setRounds((prev) =>
        prev.map((r, idx) =>
          idx === 0 ? { ...r, participants: [...r.participants, uid] } : r
        )
      );
    }
  };

  // Add round
  const handleAddRound = () => {
    const nextIdx = rounds.length + 1;
    setRounds((prev) => [
      ...prev,
      {
        id: `r-${nextIdx}`,
        label: `${nextIdx}차`,
        placeName: '',
        mapUrl: '',
        cost: 0,
        payerUid: treasurerUid || hostUid || '',
        participants: [...applicants],
        isGoldenBell: false,
        goldenBellUid: ''
      }
    ]);
  };

  // Remove round
  const handleRemoveRound = (idxToRemove) => {
    if (rounds.length <= 1) return;
    setRounds((prev) => prev.filter((_, idx) => idx !== idxToRemove));
  };

  // Update specific round field
  const handleUpdateRound = (idx, field, value) => {
    setRounds((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r))
    );
  };

  // Toggle participant in a specific round
  const handleToggleRoundParticipant = (roundIdx, uid) => {
    setRounds((prev) =>
      prev.map((r, i) => {
        if (i !== roundIdx) return r;
        const exists = r.participants.includes(uid);
        const nextParts = exists
          ? r.participants.filter((id) => id !== uid)
          : [...r.participants, uid];
        return { ...r, participants: nextParts };
      })
    );
  };

  // Submit full meeting
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    try {
      const payload = {
        ...(meeting || {}),
        id: meeting?.id || null,
        title: title.trim(),
        dateOnly,
        endDateOnly: dateOnly,
        startTime,
        endTime,
        allDay,
        location,
        placeDetail: placeDetail.trim(),
        hostUid,
        treasurerUid: treasurerUid.trim(),
        status,
        type,
        description: description.trim(),
        applicants,
        confirmedParticipants: status === 'settled' ? applicants : (meeting?.confirmedParticipants || []),
        rounds
      };

      await onSave(payload);
      onClose();
    } catch (err) {
      console.error('Failed to save meeting:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backdropFilter: 'blur(3px)'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: 'var(--color-bg-primary, #ffffff)',
          color: 'var(--color-text-primary, #0f172a)',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid var(--color-border, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--color-bg-secondary, #f8fafc)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>🛠️</span>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>
              {isEditing ? `모임 정보 수정 (#${meeting.id})` : '새 모임 개설 (운영진)'}
            </h3>
            {isEditing && (
              <span
                className={`status-pill ${status === 'settled' ? 'settled' : 'open'}`}
                style={{ fontSize: '11px', padding: '2px 8px' }}
              >
                {status === 'settled' ? '정산완료' : '진행중'}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              color: '#64748b',
              padding: '4px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Section 1: 기본 정보 */}
            <div style={{ padding: '12px', background: 'var(--color-bg-secondary, #f8fafc)', borderRadius: '8px', border: '1px solid var(--color-border, #e2e8f0)' }}>
              <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '10px', color: '#1e293b' }}>
                1. 기본 정보 및 일시
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '3px' }}>
                    모임 제목 *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="예: 11월 수원 인계동 번개"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid var(--color-border, #cbd5e1)', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '3px' }}>
                      날짜 *
                    </label>
                    <input
                      type="date"
                      required
                      value={dateOnly}
                      onChange={(e) => setDateOnly(e.target.value)}
                      style={{ width: '100%', padding: '7px 8px', fontSize: '13px', borderRadius: '6px', border: '1px solid var(--color-border, #cbd5e1)', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '3px' }}>
                      시작 시간
                    </label>
                    <input
                      type="time"
                      disabled={allDay}
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      style={{ width: '100%', padding: '7px 8px', fontSize: '13px', borderRadius: '6px', border: '1px solid var(--color-border, #cbd5e1)', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '3px' }}>
                      종료 시간
                    </label>
                    <input
                      type="time"
                      disabled={allDay}
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      style={{ width: '100%', padding: '7px 8px', fontSize: '13px', borderRadius: '6px', border: '1px solid var(--color-border, #cbd5e1)', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={allDay}
                      onChange={(e) => setAllDay(e.target.checked)}
                    />
                    하루 종일 (시간 미지정)
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '3px' }}>
                      모임 권역 *
                    </label>
                    <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      style={{ width: '100%', padding: '8px', fontSize: '13px', borderRadius: '6px', border: '1px solid var(--color-border, #cbd5e1)', boxSizing: 'border-box' }}
                    >
                      {REGION_GROUPS.map((g) => (
                        <option key={g.name} value={g.name}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '3px' }}>
                      대표 장소 요약
                    </label>
                    <input
                      type="text"
                      placeholder="예: 인계동 나혜석거리"
                      value={placeDetail}
                      onChange={(e) => setPlaceDetail(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid var(--color-border, #cbd5e1)', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '3px' }}>
                      진행 상태
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      style={{ width: '100%', padding: '8px', fontSize: '13px', borderRadius: '6px', border: '1px solid var(--color-border, #cbd5e1)', boxSizing: 'border-box' }}
                    >
                      <option value="open">진행중 (open)</option>
                      <option value="settled">정산완료 (settled)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: 벙주(주최자) 및 총무 지정 */}
            <div style={{ padding: '12px', background: 'var(--color-bg-secondary, #f8fafc)', borderRadius: '8px', border: '1px solid var(--color-border, #e2e8f0)' }}>
              <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '10px', color: '#1e293b' }}>
                2. 벙주(주최자) 및 총무 지정
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '3px' }}>
                    👑 벙주 (주최자) *
                  </label>
                  <select
                    required
                    value={hostUid}
                    onChange={(e) => {
                      const newHost = e.target.value;
                      setHostUid(newHost);
                      if (newHost && !applicants.includes(newHost)) {
                        setApplicants((prev) => [...prev, newHost]);
                      }
                    }}
                    style={{ width: '100%', padding: '8px', fontSize: '13px', borderRadius: '6px', border: '1px solid var(--color-border, #cbd5e1)', boxSizing: 'border-box' }}
                  >
                    <option value="">-- 벙주를 선택하세요 --</option>
                    {sortedMembers.map((m) => (
                      <option key={m.uid} value={m.uid}>
                        {formatMemberNickname(m)} ({m.city || '수원'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '3px' }}>
                    💳 총무 (회비 수납 계좌)
                  </label>
                  <select
                    value={treasurerUid}
                    onChange={(e) => setTreasurerUid(e.target.value)}
                    style={{ width: '100%', padding: '8px', fontSize: '13px', borderRadius: '6px', border: '1px solid var(--color-border, #cbd5e1)', boxSizing: 'border-box' }}
                  >
                    <option value="">미지정 (벙주 계좌 또는 공란)</option>
                    {sortedMembers.map((m) => (
                      <option key={m.uid} value={m.uid}>
                        {formatMemberNickname(m)} ({m.bankAccount ? '계좌 등록됨' : '계좌 없음'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: 참석자 명단 실시간 관리 */}
            <div style={{ padding: '12px', background: 'var(--color-bg-secondary, #f8fafc)', borderRadius: '8px', border: '1px solid var(--color-border, #e2e8f0)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '13px', color: '#1e293b' }}>
                  3. 참석자 명단 관리
                </span>
                <span className="platform-badge" style={{ background: '#2563eb', color: '#fff' }}>
                  총 {applicants.length}명 참석
                </span>
              </div>

              {/* Current Attendees Chips */}
              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>
                  현재 참석자 (클릭 시 제외):
                </div>
                {applicants.length === 0 ? (
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0' }}>참석자가 없습니다.</p>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {applicants.map((uid) => {
                      const m = members.find((x) => x.uid === uid);
                      const isHost = uid === hostUid;
                      const isTreasurer = uid === treasurerUid;
                      return (
                        <button
                          key={uid}
                          type="button"
                          onClick={() => handleToggleAttendee(uid)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            borderRadius: '16px',
                            padding: '3px 8px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            color: '#1e40af'
                          }}
                          title="클릭하여 참석 제외"
                        >
                          <span>{m ? formatMemberNickname(m) : uid}</span>
                          {isHost && <span style={{ fontSize: '10px', color: '#e11d48' }}>👑</span>}
                          {isTreasurer && <span style={{ fontSize: '10px', color: '#2563eb' }}>💳</span>}
                          <span style={{ fontSize: '10px', color: '#94a3b8', marginLeft: '2px' }}>✕</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Add Attendee Search */}
              <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '8px' }}>
                <div style={{ fontSize: '11px', color: '#475569', marginBottom: '4px' }}>
                  회원 검색하여 추가 (클릭 시 즉시 참석 등록):
                </div>
                <input
                  type="text"
                  placeholder="추가할 회원 이름 또는 지역 검색..."
                  value={attendeeSearchQuery}
                  onChange={(e) => setAttendeeSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '6px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--color-border, #cbd5e1)', boxSizing: 'border-box' }}
                />

                {filteredCandidates.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '6px' }}>
                    {filteredCandidates.map((m) => (
                      <button
                        key={m.uid}
                        type="button"
                        onClick={() => {
                          handleToggleAttendee(m.uid);
                          setAttendeeSearchQuery('');
                        }}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '14px',
                          padding: '2px 8px',
                          fontSize: '11px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        <span>+ {formatMemberNickname(m)}</span>
                        <span style={{ color: '#64748b', fontSize: '10px' }}>({m.city || '수원'})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Section 4: 차수별(라운드) 장소 및 정산 비용 */}
            <div style={{ padding: '12px', background: 'var(--color-bg-secondary, #f8fafc)', borderRadius: '8px', border: '1px solid var(--color-border, #e2e8f0)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontWeight: 700, fontSize: '13px', color: '#1e293b' }}>
                  4. 차수별(라운드) 장소 및 회비 정산 내역
                </span>
                <button
                  type="button"
                  className="btn btn-outline btn-xs"
                  onClick={handleAddRound}
                  style={{ fontSize: '11px', padding: '3px 8px' }}
                >
                  + 차수 추가
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {rounds.map((round, rIdx) => (
                  <div
                    key={round.id || rIdx}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>
                        📍 {round.label || `${rIdx + 1}차`}
                      </span>
                      {rounds.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRound(rIdx)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            fontSize: '11px',
                            cursor: 'pointer',
                            padding: '2px 6px'
                          }}
                        >
                          차수 삭제
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px' }}>
                      <div>
                        <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '2px' }}>
                          상호명 (장소)
                        </label>
                        <input
                          type="text"
                          placeholder="예: 맛있는 고깃집"
                          value={round.placeName}
                          onChange={(e) => handleUpdateRound(rIdx, 'placeName', e.target.value)}
                          style={{ width: '100%', padding: '6px 8px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '2px' }}>
                          총 결제 금액 (원)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          placeholder="0"
                          value={round.cost || ''}
                          onChange={(e) => handleUpdateRound(rIdx, 'cost', Number(e.target.value) || 0)}
                          style={{ width: '100%', padding: '6px 8px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '2px' }}>
                          결제자
                        </label>
                        <select
                          value={round.payerUid || ''}
                          onChange={(e) => handleUpdateRound(rIdx, 'payerUid', e.target.value)}
                          style={{ width: '100%', padding: '6px 8px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                        >
                          <option value="">-- 결제자 선택 --</option>
                          {sortedMembers.map((m) => (
                            <option key={m.uid} value={m.uid}>
                              {formatMemberNickname(m)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Golden bell toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={round.isGoldenBell}
                          onChange={(e) => handleUpdateRound(rIdx, 'isGoldenBell', e.target.checked)}
                        />
                        🔔 골든벨 (특정 회원이 쏨 - 1/N 정산 제외)
                      </label>
                    </div>

                    {/* Participants in this round */}
                    <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '6px' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                        이 차수 참석자 ({round.participants.length}명):
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {applicants.map((uid) => {
                          const m = members.find((x) => x.uid === uid);
                          const isParticipating = round.participants.includes(uid);
                          return (
                            <button
                              key={uid}
                              type="button"
                              onClick={() => handleToggleRoundParticipant(rIdx, uid)}
                              style={{
                                padding: '2px 6px',
                                fontSize: '11px',
                                borderRadius: '4px',
                                border: '1px solid',
                                cursor: 'pointer',
                                background: isParticipating ? '#2563eb' : '#f1f5f9',
                                color: isParticipating ? '#ffffff' : '#64748b',
                                borderColor: isParticipating ? '#1d4ed8' : '#cbd5e1'
                              }}
                            >
                              {isParticipating ? '✓ ' : '+ '}
                              {m ? m.realName : uid}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Modal Footer */}
          <div
            style={{
              padding: '12px 18px',
              borderTop: '1px solid var(--color-border, #e2e8f0)',
              background: 'var(--color-bg-secondary, #f8fafc)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px'
            }}
          >
            <div>
              {isEditing && onDelete && (
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{ color: '#ef4444', borderColor: '#fca5a5', fontSize: '12px' }}
                  onClick={() =>
                    runArmed(`delete-mtg:${meeting.id}`, () => {
                      onDelete(meeting.id);
                      onClose();
                    })
                  }
                >
                  {isArmed(`delete-mtg:${meeting.id}`) ? '삭제 확인 (영구 삭제)' : '🗑️ 모임 삭제'}
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={onClose}
                disabled={saving}
                style={{ fontSize: '13px' }}
              >
                취소
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
                style={{ fontSize: '13px', minWidth: '80px' }}
              >
                {saving ? '저장 중...' : '저장하기'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

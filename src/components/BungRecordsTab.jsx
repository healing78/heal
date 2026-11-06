import React, { useMemo, useState } from 'react';
import {
  formatMeetingToKakaoNotice,
  formatAllMeetingsToKakaoDocument,
  parseBungDocument
} from '../core/bungParser';

export default function BungRecordsTab({
  meetings = [],
  members = [],
  currentUser,
  onSelectMeetingId,
  onCreateMeeting,
  onNavigateTab
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('ALL'); // 'ALL' | '2026' | '2025' | '2024'
  const [viewMode, setViewMode] = useState('card'); // 'card' | 'raw'
  const [copiedToast, setCopiedToast] = useState('');
  const [displayLimit, setDisplayLimit] = useState(50);
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [quickAddText, setQuickAddText] = useState('');
  const [quickAddFeedback, setQuickAddFeedback] = useState('');

  const membersMap = useMemo(
    () => new Map(members.map((m) => [m.uid, m])),
    [members]
  );

  const nameToMemberMap = useMemo(
    () => new Map(members.map((m) => [m.realName, m])),
    [members]
  );

  // Helper to extract participant realNames from meeting
  const getMeetingParticipantNames = (mtg) => {
    const names = new Set();
    const uids =
      mtg.confirmedParticipants ||
      mtg.attendeeUids ||
      mtg.rounds?.[0]?.participants ||
      [];
    for (const uid of uids) {
      const m = membersMap.get(uid);
      if (m?.realName) names.add(m.realName);
      else if (uid) names.add(uid.replace(/^kakao:/, ''));
    }

    if (mtg.attendees) {
      for (const a of mtg.attendees) {
        if (typeof a === 'string') names.add(a);
        else if (a?.name) names.add(a.name);
      }
    }

    if (mtg.attendeeNames) {
      for (const n of mtg.attendeeNames) {
        if (n) names.add(n);
      }
    }

    return Array.from(names);
  };

  // Sort all meetings descending (newest first)
  const sortedMeetings = useMemo(() => {
    return [...meetings].sort((a, b) => {
      const dateA = a.dateOnly || a.date || '';
      const dateB = b.dateOnly || b.date || '';
      return dateB.localeCompare(dateA);
    });
  }, [meetings]);

  // Year breakdown counts
  const yearCounts = useMemo(() => {
    const counts = { ALL: sortedMeetings.length, '2026': 0, '2025': 0, '2024': 0 };
    for (const mtg of sortedMeetings) {
      const yStr = String(mtg.dateOnly || mtg.date || '').slice(0, 4);
      if (yStr === '2026') counts['2026'] += 1;
      else if (yStr === '2025') counts['2025'] += 1;
      else if (yStr === '2024') counts['2024'] += 1;
    }
    return counts;
  }, [sortedMeetings]);

  // Filtered meetings
  const filteredMeetings = useMemo(() => {
    let list = sortedMeetings;

    if (selectedYear !== 'ALL') {
      list = list.filter((mtg) => {
        const yStr = String(mtg.dateOnly || mtg.date || '').slice(0, 4);
        return yStr === selectedYear;
      });
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((mtg) => {
        const titleMatch = (mtg.title || '').toLowerCase().includes(q);
        const locMatch = (mtg.location || '').toLowerCase().includes(q);
        const dateMatch = (mtg.dateOnly || '').includes(q);
        const participants = getMeetingParticipantNames(mtg);
        const nameMatch = participants.some((name) =>
          name.toLowerCase().includes(q)
        );
        return titleMatch || locMatch || dateMatch || nameMatch;
      });
    }

    return list;
  }, [sortedMeetings, selectedYear, searchQuery, membersMap]);

  // Visible items for performance
  const visibleMeetings = useMemo(() => {
    return filteredMeetings.slice(0, displayLimit);
  }, [filteredMeetings, displayLimit]);

  // Copy Full / Filtered Kakao Document
  const handleCopyKakaoDocument = async () => {
    try {
      const text = formatAllMeetingsToKakaoDocument(filteredMeetings, members);
      await navigator.clipboard.writeText(text);
      setCopiedToast(`📋 벙기록 ${filteredMeetings.length}건이 카톡 공지 포맷으로 복사되었습니다!`);
      setTimeout(() => setCopiedToast(''), 3000);
    } catch {
      setCopiedToast('복사 실패');
      setTimeout(() => setCopiedToast(''), 2000);
    }
  };

  // Copy Single Meeting Notice
  const handleCopySingleNotice = async (e, mtg) => {
    e.stopPropagation();
    try {
      const text = formatMeetingToKakaoNotice(mtg, membersMap);
      await navigator.clipboard.writeText(text);
      setCopiedToast(`✅ [${mtg.title}] 벙기록이 복사되었습니다.`);
      setTimeout(() => setCopiedToast(''), 2500);
    } catch {
      // ignore
    }
  };

  // Preview of quick add text
  const quickAddParsed = useMemo(() => {
    if (!quickAddText.trim()) return [];
    return parseBungDocument(quickAddText);
  }, [quickAddText]);

  // Execute Quick Add
  const handleExecuteQuickAdd = async () => {
    if (quickAddParsed.length === 0 || !onCreateMeeting) return;
    try {
      let addedCount = 0;
      for (const rec of quickAddParsed) {
        const yStr = String(rec.year).padStart(2, '0');
        const mStr = String(rec.month).padStart(2, '0');
        const dStr = String(rec.day).padStart(2, '0');
        const idBase = `${yStr}${mStr}${dStr}`;

        // Find participant UIDs
        const attendeeUids = rec.attendees.map((a) => {
          const m = nameToMemberMap.get(a.name);
          return m ? m.uid : `kakao:guest-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        });

        const newMtg = {
          id: `${idBase}01`,
          title: rec.title,
          dateOnly: rec.dateOnly,
          date: `${rec.dateOnly} 19:00`,
          startTime: '19:00',
          endTime: '22:00',
          location: rec.title.slice(0, 4) || '모임 장소',
          placeDetail: `${rec.title} 모임 장소`,
          hostUid: attendeeUids[0] || currentUser?.uid || 'kakao:1001',
          treasurerUid: attendeeUids[0] || currentUser?.uid || 'kakao:1001',
          type: 'Casual',
          status: 'settled',
          applicants: attendeeUids,
          confirmedParticipants: attendeeUids,
          attendeeNames: rec.attendees.map((a) => a.rawToken || a.name),
          description: `${rec.title} (${rec.dateOnly}) 벙기록입니다.`,
          roundingRule: 'floor100',
          rounds: [
            {
              id: `r-${idBase}01-1`,
              label: '1차',
              placeName: `${rec.title} 장소`,
              mapUrl: '',
              participants: attendeeUids,
              payerUid: attendeeUids[0] || '',
              cost: rec.total * 20000,
              receiptUrl: '',
              isGoldenBell: false,
              goldenBellUid: ''
            }
          ],
          sponsorships: [],
          manualAmounts: {},
          paymentStatuses: Object.fromEntries(
            attendeeUids.map((u) => [u, { paid: true, confirmed: true }])
          ),
          safeReturns: {},
          likes: [],
          comments: [],
          album: []
        };

        await onCreateMeeting(newMtg);
        addedCount += 1;
      }

      setQuickAddFeedback(`✅ 벙기록 ${addedCount}건이 성공적으로 등록되었습니다!`);
      setTimeout(() => {
        setQuickAddFeedback('');
        setShowQuickAddModal(false);
        setQuickAddText('');
      }, 1500);
    } catch (err) {
      setQuickAddFeedback(`❌ 등록 실패: ${err.message || err}`);
    }
  };

  return (
    <div style={{ marginTop: '12px' }}>
      {/* Toast Notification */}
      {copiedToast && (
        <aside
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            bottom: '75px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(15, 23, 42, 0.92)',
            color: '#ffffff',
            padding: '10px 18px',
            borderRadius: '24px',
            fontSize: '13px',
            fontWeight: 600,
            zIndex: 9999,
            boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {copiedToast}
        </aside>
      )}

      {/* Header Info Card */}
      <section
        style={{
          background: 'var(--color-bg-primary, #ffffff)',
          border: '1px solid var(--color-border, #e2e8f0)',
          borderRadius: '10px',
          padding: '14px',
          marginBottom: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px',
            flexWrap: 'wrap',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>📜</span>
            <strong style={{ fontSize: '15px', color: 'var(--color-text-primary, #0f172a)' }}>
              공식 벙기록 아카이브
            </strong>
            <span className="count-badge">총 {sortedMeetings.length}회</span>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleCopyKakaoDocument}
              style={{ fontSize: '12px', padding: '5px 12px', borderRadius: '6px' }}
              title="현재 필터링된 벙기록을 기존 파이썬 프로그램 및 카톡 공지용 포맷으로 복사"
            >
              📋 카톡 공지 복사
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setShowQuickAddModal(true)}
              style={{ fontSize: '12px', padding: '5px 10px', borderRadius: '6px' }}
            >
              + 빠른 등록
            </button>
          </div>
        </div>

        <p
          style={{
            fontSize: '12px',
            color: 'var(--color-text-secondary, #64748b)',
            margin: 0,
            lineHeight: 1.5
          }}
        >
          2024년 1월부터 진행된 모든 벙의 일시, 벙 이름, 참석자 및 원정 가산점 이력을 원천데이터 형식 그대로 열람하고 검색합니다.
        </p>

        {/* View Mode & Year Filter Pills */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '12px',
            flexWrap: 'wrap',
            gap: '8px'
          }}
        >
          {/* Year Filter Buttons */}
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`btn btn-sm ${selectedYear === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '14px' }}
              onClick={() => {
                setSelectedYear('ALL');
                setDisplayLimit(50);
              }}
            >
              전체 ({yearCounts.ALL})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${selectedYear === '2026' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '14px' }}
              onClick={() => {
                setSelectedYear('2026');
                setDisplayLimit(50);
              }}
            >
              2026년 ({yearCounts['2026']})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${selectedYear === '2025' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '14px' }}
              onClick={() => {
                setSelectedYear('2025');
                setDisplayLimit(50);
              }}
            >
              2025년 ({yearCounts['2025']})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${selectedYear === '2024' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '14px' }}
              onClick={() => {
                setSelectedYear('2024');
                setDisplayLimit(50);
              }}
            >
              2024년 ({yearCounts['2024']})
            </button>
          </div>

          {/* Toggle View Mode */}
          <div
            style={{
              display: 'inline-flex',
              background: 'var(--color-bg-secondary, #f1f5f9)',
              padding: '2px',
              borderRadius: '6px'
            }}
          >
            <button
              type="button"
              onClick={() => setViewMode('card')}
              style={{
                border: 'none',
                background: viewMode === 'card' ? '#ffffff' : 'transparent',
                color: viewMode === 'card' ? '#0f172a' : '#64748b',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: viewMode === 'card' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              📱 카드 뷰
            </button>
            <button
              type="button"
              onClick={() => setViewMode('raw')}
              style={{
                border: 'none',
                background: viewMode === 'raw' ? '#ffffff' : 'transparent',
                color: viewMode === 'raw' ? '#0f172a' : '#64748b',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: viewMode === 'raw' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              📝 카톡 원문
            </button>
          </div>
        </div>
      </section>

      {/* Search Input Bar */}
      <div style={{ marginBottom: '12px', position: 'relative' }}>
        <input
          type="text"
          placeholder="회원 이름(예: 카일, 잔치) 또는 벙 이름 검색..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setDisplayLimit(50);
          }}
          style={{
            width: '100%',
            padding: '9px 12px',
            paddingRight: '32px',
            fontSize: '13px',
            borderRadius: '8px',
            border: '1px solid var(--color-border, #cbd5e1)',
            boxSizing: 'border-box',
            background: 'var(--color-bg-primary, #ffffff)'
          }}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Quick Add Modal */}
      {showQuickAddModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '480px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '18px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <strong style={{ fontSize: '16px', color: '#0f172a' }}>➕ 벙기록 빠른 등록 (스마트 파서)</strong>
              <button
                type="button"
                onClick={() => setShowQuickAddModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px', lineHeight: 1.4 }}>
              카카오톡 공지 포맷을 그대로 붙여넣으세요. 제목 끝 글자 제한이나 공백 제약 없이 유연하게 자동 파싱됩니다.
            </p>

            <textarea
              rows={6}
              placeholder={`예시:\n26년11월5일 강남치맥벙\n 카일 쭈2 봄날2 잔치\n 총 4명`}
              value={quickAddText}
              onChange={(e) => setQuickAddText(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '13px',
                fontFamily: 'monospace',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                boxSizing: 'border-box',
                resize: 'vertical'
              }}
            />

            {/* Parsed Preview */}
            {quickAddParsed.length > 0 && (
              <div
                style={{
                  marginTop: '12px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '10px',
                  fontSize: '12px'
                }}
              >
                <div style={{ fontWeight: 700, color: '#10b981', marginBottom: '4px' }}>
                  ✓ 파싱 확인 ({quickAddParsed.length}건 감지됨)
                </div>
                {quickAddParsed.map((rec, idx) => (
                  <div key={idx} style={{ marginTop: idx > 0 ? '6px' : 0, color: '#334155' }}>
                    <strong>{rec.dateOnly} {rec.title}</strong> (총 {rec.total}명)
                    <div style={{ color: '#64748b', marginTop: '2px' }}>
                      참석자: {rec.attendees.map((a) => a.rawToken).join(' ')}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {quickAddFeedback && (
              <div style={{ marginTop: '10px', fontSize: '13px', fontWeight: 600, color: '#059669' }}>
                {quickAddFeedback}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '14px' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setShowQuickAddModal(false)}
              >
                취소
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={quickAddParsed.length === 0}
                onClick={handleExecuteQuickAdd}
              >
                {quickAddParsed.length}건 벙기록 저장하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Raw View Mode */}
      {viewMode === 'raw' ? (
        <section
          style={{
            background: 'var(--color-bg-primary, #ffffff)',
            border: '1px solid var(--color-border, #e2e8f0)',
            borderRadius: '8px',
            padding: '14px'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px'
            }}
          >
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
              3️⃣ 전체 벙기록 (카톡 원문 텍스트 - 총 {filteredMeetings.length}건)
            </span>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleCopyKakaoDocument}
              style={{ fontSize: '11px', padding: '3px 8px' }}
            >
              전체 복사
            </button>
          </div>

          <pre
            style={{
              background: 'var(--color-bg-secondary, #f8fafc)',
              border: '1px solid var(--color-border, #e2e8f0)',
              borderRadius: '6px',
              padding: '12px',
              fontSize: '12px',
              fontFamily: 'monospace',
              lineHeight: 1.6,
              color: '#334155',
              whiteSpace: 'pre-wrap',
              maxHeight: '650px',
              overflowY: 'auto'
            }}
          >
            {formatAllMeetingsToKakaoDocument(filteredMeetings, members)}
          </pre>
        </section>
      ) : (
        /* Card View Mode */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredMeetings.length === 0 ? (
            <div
              style={{
                padding: '40px 10px',
                textAlign: 'center',
                color: '#94a3b8',
                background: 'var(--color-bg-primary, #ffffff)',
                borderRadius: '8px',
                border: '1px dashed var(--color-border, #cbd5e1)',
                fontSize: '13px'
              }}
            >
              검색 및 필터 조건과 일치하는 벙기록이 없습니다.
            </div>
          ) : (
            visibleMeetings.map((mtg, idx) => {
              const dateStr = mtg.dateOnly || String(mtg.date || '').slice(0, 10);
              const pNames = getMeetingParticipantNames(mtg);
              const totalCount = pNames.length;

              return (
                <article
                  key={mtg.id || idx}
                  onClick={() => onSelectMeetingId && onSelectMeetingId(mtg.id)}
                  style={{
                    background: 'var(--color-bg-primary, #ffffff)',
                    border: '1px solid var(--color-border, #e2e8f0)',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    cursor: onSelectMeetingId ? 'pointer' : 'default',
                    transition: 'border-color 0.15s ease'
                  }}
                >
                  {/* Top Row: Date, Title, Total Badge, Copy Single */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                      flexWrap: 'wrap'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          background: '#f1f5f9',
                          color: '#475569',
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 7px',
                          borderRadius: '4px'
                        }}
                      >
                        {dateStr}
                      </span>
                      <strong
                        style={{
                          fontSize: '14px',
                          color: 'var(--color-text-primary, #0f172a)'
                        }}
                      >
                        {mtg.title}
                      </strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          background: '#e0e7ff',
                          color: '#4338ca',
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '12px'
                        }}
                      >
                        총 {totalCount}명
                      </span>

                      <button
                        type="button"
                        onClick={(e) => handleCopySingleNotice(e, mtg)}
                        className="btn btn-outline btn-sm"
                        style={{
                          fontSize: '11px',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}
                        title="이 벙기록만 카톡 공지 포맷으로 복사"
                      >
                        복사
                      </button>
                    </div>
                  </div>

                  {/* Attendees Chips Row */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '6px',
                      alignItems: 'center'
                    }}
                  >
                    <span style={{ fontSize: '12px', color: '#64748b', marginRight: '2px' }}>
                      참석자:
                    </span>
                    {pNames.map((name, pIdx) => {
                      const hasExpedition = name.includes('2') || name.includes('3');
                      const cleanName = name.replace(/[0-9]/g, '');
                      const member = nameToMemberMap.get(cleanName);

                      return (
                        <span
                          key={pIdx}
                          onClick={(e) => {
                            if (member && onNavigateTab) {
                              e.stopPropagation();
                              onNavigateTab('members', { memberUid: member.uid });
                            }
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            background: hasExpedition ? '#fef3c7' : 'var(--color-bg-secondary, #f8fafc)',
                            color: hasExpedition ? '#92400e' : '#334155',
                            border: `1px solid ${hasExpedition ? '#fde68a' : 'var(--color-border, #e2e8f0)'}`,
                            fontSize: '12px',
                            padding: '2px 7px',
                            borderRadius: '4px',
                            fontWeight: hasExpedition ? 700 : 500,
                            cursor: member ? 'pointer' : 'default'
                          }}
                        >
                          {cleanName}
                          {hasExpedition && (
                            <span
                              style={{
                                fontSize: '10px',
                                background: '#f59e0b',
                                color: '#ffffff',
                                borderRadius: '8px',
                                padding: '0 4px',
                                fontWeight: 800
                              }}
                              title="원정 보너스 점수 부여"
                            >
                              +원정
                            </span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                </article>
              );
            })
          )}

          {/* Load More Button for Mobile Performance */}
          {visibleMeetings.length < filteredMeetings.length && (
            <div style={{ textAlign: 'center', marginTop: '10px', marginBottom: '20px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setDisplayLimit((prev) => prev + 50)}
                style={{ fontSize: '13px', padding: '8px 24px', borderRadius: '20px' }}
              >
                더보기 ({filteredMeetings.length - visibleMeetings.length}건 남음) ▼
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import React, { useMemo, useState, useRef, useEffect } from 'react';
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
  const [displayLimit, setDisplayLimit] = useState(25);
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [quickAddText, setQuickAddText] = useState('');
  const [quickAddFeedback, setQuickAddFeedback] = useState('');

  const sentinelRef = useRef(null);

  const membersMap = useMemo(
    () => new Map(members.map((m) => [m.uid, m])),
    [members]
  );

  const nameToMemberMap = useMemo(() => {
    const map = new Map();
    for (const m of members) {
      if (m.realName) map.set(m.realName, m);
      if (Array.isArray(m.aliases)) {
        for (const alias of m.aliases) {
          if (alias) map.set(alias, m);
        }
      }
    }
    return map;
  }, [members]);

  // Extract participant tokens with numbers attached (e.g. '레시2', '쭈2', '다온')
  const getMeetingAttendeeTokens = (mtg) => {
    if (mtg.attendees && mtg.attendees.length > 0 && typeof mtg.attendees[0] === 'object') {
      return mtg.attendees.map(
        (a) => a.rawToken || (a.points > 1 ? `${a.name}${a.points}` : a.name)
      );
    }

    if (mtg.attendeeNames && mtg.attendeeNames.length > 0) {
      return mtg.attendeeNames;
    }

    const uids =
      mtg.confirmedParticipants ||
      mtg.attendeeUids ||
      mtg.rounds?.[0]?.participants ||
      [];

    return uids.map((uid) => {
      const member = membersMap.get(uid);
      const cleanName = member?.realName || String(uid).replace(/^kakao:/, '');
      const earned = mtg.memberScoreSnapshots?.[uid]?.earned;
      if (typeof earned === 'number' && earned > 1) {
        return `${cleanName}${earned}`;
      }
      return cleanName;
    });
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
        const participants = getMeetingAttendeeTokens(mtg);
        const nameMatch = participants.some((name) => {
          const clean = name.replace(/[0-9]/g, '').toLowerCase();
          return clean.includes(q) || name.toLowerCase().includes(q);
        });
        return titleMatch || locMatch || dateMatch || nameMatch;
      });
    }

    return list;
  }, [sortedMeetings, selectedYear, searchQuery, membersMap]);

  // Reset infinite scroll limit when filter changes
  useEffect(() => {
    setDisplayLimit(25);
  }, [selectedYear, searchQuery]);

  // Visible items for performance
  const visibleMeetings = useMemo(() => {
    return filteredMeetings.slice(0, displayLimit);
  }, [filteredMeetings, displayLimit]);

  // Infinite Scroll Observer
  useEffect(() => {
    if (viewMode === 'raw') return;
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDisplayLimit((prev) => {
            if (prev < filteredMeetings.length) {
              return prev + 25;
            }
            return prev;
          });
        }
      },
      { rootMargin: '250px' }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [viewMode, filteredMeetings.length]);

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
          hostUid: attendeeUids[0] || currentUser?.uid || '',
          treasurerUid: '',
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
              payerUid: '',
              cost: 0,
              receiptUrl: '',
              isGoldenBell: false
            }
          ],
          attendees: rec.attendees,
          manualAmounts: {},
          paymentStatuses: {},
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
    <div style={{ marginTop: '10px' }}>
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

      {/* Tidy Header Archive Card */}
      <section className="bung-archive-header">
        <div className="archive-header-top">
          <div className="archive-header-title">
            <span style={{ fontSize: '18px' }}>📜</span>
            <strong>공식 벙기록 아카이브</strong>
            <span className="count-badge">총 {sortedMeetings.length}회</span>
          </div>

          <div className="archive-header-actions">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleCopyKakaoDocument}
              style={{ fontSize: '12px', padding: '5px 11px', borderRadius: '6px' }}
              title="현재 필터링된 벙기록을 카톡 공지용 포맷으로 복사"
            >
              📋 카톡 복사
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

        {/* 1-Row Unified Toolbar: Year Pills & View Mode */}
        <div className="archive-toolbar">
          <div className="year-pills-bar">
            {['ALL', '2026', '2025', '2024'].map((yr) => (
              <button
                key={yr}
                type="button"
                className={`year-pill ${selectedYear === yr ? 'active' : ''}`}
                onClick={() => setSelectedYear(yr)}
              >
                {yr === 'ALL' ? '전체' : `${yr}년`} ({yearCounts[yr]})
              </button>
            ))}
          </div>

          <div className="archive-view-toggle">
            <button
              type="button"
              className={viewMode === 'card' ? 'active' : ''}
              onClick={() => setViewMode('card')}
            >
              카드
            </button>
            <button
              type="button"
              className={viewMode === 'raw' ? 'active' : ''}
              onClick={() => setViewMode('raw')}
            >
              원문
            </button>
          </div>
        </div>
      </section>

      {/* Clean Search Bar */}
      <div className="archive-search-wrap">
        <span className="archive-search-icon">🔍</span>
        <input
          type="text"
          placeholder="회원 이름(예: 카일, 잔치) 또는 벙 이름 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            className="btn-clear-search"
            onClick={() => setSearchQuery('')}
            title="검색어 지우기"
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
              카카오톡 공지 포맷을 그대로 붙여넣으세요. 날짜, 벙 제목, 참석자(점수 포함)가 자동으로 파싱됩니다.
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
              const tokens = getMeetingAttendeeTokens(mtg);
              const totalCount = tokens.length;

              return (
                <article
                  key={mtg.id || idx}
                  className="bung-record-card"
                  onClick={() => onSelectMeetingId && onSelectMeetingId(mtg.id)}
                >
                  {/* Top Row: Date, Title (Ellipsis), Total Count Badge, Copy Button */}
                  <div className="bung-record-header">
                    <div className="bung-record-title-wrap">
                      <span className="bung-record-date">{dateStr}</span>
                      <strong className="bung-record-title" title={mtg.title}>
                        {mtg.title}
                      </strong>
                    </div>

                    <div className="bung-record-actions">
                      <span className="bung-record-count">총 {totalCount}명</span>
                      <button
                        type="button"
                        onClick={(e) => handleCopySingleNotice(e, mtg)}
                        className="btn-copy-mini"
                        title="이 벙기록만 카톡 공지 포맷으로 복사"
                      >
                        복사
                      </button>
                    </div>
                  </div>

                  {/* Attendees Row: Authentic Raw Tokens with numbers attached (e.g. '레시2', '쭈2', '다온') */}
                  <div className="bung-record-attendees">
                    <span className="attendees-label">참석:</span>
                    <div className="attendees-tokens-wrap">
                      {tokens.map((token, tIdx) => {
                        const cleanName = token.replace(/[0-9]/g, '');
                        const numMatch = token.match(/[0-9]+/);
                        const bonusNum = numMatch ? numMatch[0] : '';
                        const member = nameToMemberMap.get(cleanName);

                        return (
                          <React.Fragment key={tIdx}>
                            {tIdx > 0 && <span className="attendee-sep">·</span>}
                            <span
                              className={`attendee-token ${bonusNum ? 'has-bonus' : ''}`}
                              onClick={(e) => {
                                if (member && onNavigateTab) {
                                  e.stopPropagation();
                                  onNavigateTab('members', { memberUid: member.uid });
                                }
                              }}
                              title={member ? `${cleanName}님의 프로필 보기` : cleanName}
                            >
                              {cleanName}
                              {bonusNum && <span className="bonus-num">{bonusNum}</span>}
                            </span>
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                </article>
              );
            })
          )}

          {/* Infinite Scroll Sentinel */}
          {visibleMeetings.length < filteredMeetings.length && (
            <div ref={sentinelRef} className="infinite-scroll-sentinel">
              벙기록 더 불러오는 중... ({visibleMeetings.length} / {filteredMeetings.length}건)
            </div>
          )}
        </div>
      )}
    </div>
  );
}

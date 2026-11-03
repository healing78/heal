import React, { useState } from 'react';
import {
  calculateMeetingScoreForMember,
  calculateMeetingSettlement,
  formatMemberNickname,
  ROLE_META
} from '../core/communityRules';

export default function ReportsPage({
  currentUser,
  members,
  meetings,
  onOpenMeetingDetail
}) {
  const [subTab, setSubTab] = useState('meeting'); // 'meeting' | 'personal'
  const [selectedMeetingFilter, setSelectedMeetingFilter] = useState('ALL');
  const [selectedMemberUid, setSelectedMemberUid] = useState(
    currentUser?.uid || members[0]?.uid || ''
  );
  const [copiedId, setCopiedId] = useState('');

  const targetMember =
    members.find((m) => m.uid === selectedMemberUid) || currentUser || members[0];

  const filteredMeetings =
    selectedMeetingFilter === 'ALL'
      ? meetings
      : meetings.filter((m) => String(m.id) === String(selectedMeetingFilter));

  // Compute personal report data across all meetings for targetMember
  const personalMeetingRows = [];
  let totalMyBurden = 0;
  let totalMyOutOfPocket = 0;
  let totalMySponsored = 0;

  if (targetMember) {
    for (const mtg of meetings) {
      const settlement = calculateMeetingSettlement(mtg);
      const myRow = settlement.participantRows.find(
        (r) => r.uid === targetMember.uid
      );

      // Sum sponsorships & golden bells by this member
      const mySponsors = (mtg.sponsorships || [])
        .filter((s) => s.uid === targetMember.uid)
        .reduce((acc, s) => acc + (Number(s.amount) || 0), 0);
      const myGoldenBells = (mtg.rounds || [])
        .filter((r) => r.isGoldenBell && r.goldenBellUid === targetMember.uid)
        .reduce((acc, r) => acc + (Number(r.cost) || 0), 0);

      totalMySponsored += mySponsors + myGoldenBells;

      if (myRow) {
        totalMyBurden += myRow.finalShare;
        totalMyOutOfPocket += myRow.paidOutOfPocket;
        const scoreInfo = calculateMeetingScoreForMember(
          targetMember,
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

  const handleCopyMeetingReport = async (mtg) => {
    const settlement = calculateMeetingSettlement(mtg);
    const hostMember = members.find((m) => m.uid === mtg.hostUid);
    const treasurerUid = mtg.treasurerUid || mtg.hostUid;
    const treasurerMember =
      members.find((m) => m.uid === treasurerUid) || hostMember;

    const text = [
      `[Healing78 모임 정산 리포트 #${mtg.id}]`,
      `■ 벙 제목: ${mtg.title}`,
      `■ 일시/지역: ${mtg.date} (${mtg.location})`,
      `■ 총무 계좌: ${treasurerMember?.bankAccount || '미등록'} (${
        treasurerMember ? formatMemberNickname(treasurerMember) : treasurerUid
      })`,
      `■ 총 발생비용: ${settlement.totalGrossCost.toLocaleString()}원 / 골든벨: ${settlement.totalGoldenBellCost.toLocaleString()}원 / 찬조금: ${settlement.totalSponsorship.toLocaleString()}원`,
      `--- 개인별 부담 및 입금 현황 ---`,
      ...settlement.participantRows.map((r) => {
        const mem = members.find((m) => m.uid === r.uid);
        const nick = mem ? formatMemberNickname(mem) : r.uid;
        const payState = r.confirmed
          ? '컨펌완료'
          : r.paid
            ? '입금완료'
            : '미입금';
        return `· ${nick} [${r.attendedRounds.join(',') || '-'}]: 부담 ${r.finalShare.toLocaleString()}원 / 실입금 ${r.netToPay.toLocaleString()}원 (${payState}${
          r.safeReturnAt ? ` · ${r.safeReturnAt}` : ''
        })`;
      }),
      `링크: https://healing78.web.app/meetings/${mtg.id}`
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(mtg.id);
      setTimeout(() => setCopiedId(''), 2000);
    } catch {
      setCopiedId('');
    }
  };

  return (
    <div className="list-container">
      {/* Top Sub-Tab Selector */}
      <section className="list-section">
        <h2>모임별 · 개인별 정산 및 활동 리포트</h2>
        <p className="muted-text">
          각 벙의 차수별 비용·골든벨·찬조금·입금·귀가 현황과 회원별 누적 회비·활동 내역을 한곳에서 확인합니다.
        </p>

        <div className="subtab-bar">
          <button
            type="button"
            className={`subtab-btn ${subTab === 'meeting' ? 'active' : ''}`}
            onClick={() => setSubTab('meeting')}
          >
            모임별 정산·귀가 리포트 ({meetings.length})
          </button>
          <button
            type="button"
            className={`subtab-btn ${subTab === 'personal' ? 'active' : ''}`}
            onClick={() => setSubTab('personal')}
          >
            개인별 활동·비용 리포트
          </button>
        </div>

        {subTab === 'meeting' ? (
          <div className="filter-bar">
            <select
              value={selectedMeetingFilter}
              onChange={(e) => setSelectedMeetingFilter(e.target.value)}
              style={{ flex: 1 }}
            >
              <option value="ALL">전체 모임 리포트 보기 ({meetings.length}건)</option>
              {meetings.map((m) => (
                <option key={m.id} value={m.id}>
                  [#{m.id}] {m.date} · {m.title}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="filter-bar">
            <select
              value={selectedMemberUid}
              onChange={(e) => setSelectedMemberUid(e.target.value)}
              style={{ flex: 1 }}
            >
              {members.map((m) => (
                <option key={m.uid} value={m.uid}>
                  [{ROLE_META[m.role]?.label}] {formatMemberNickname(m)} (참석{' '}
                  {m.attendanceCount}회 · {m.totalScore}점)
                </option>
              ))}
            </select>
          </div>
        )}
      </section>

      {/* Sub-Tab 1: Meeting-by-Meeting Report */}
      {subTab === 'meeting' && (
        <div className="list-container">
          {filteredMeetings.map((mtg) => {
            const settlement = calculateMeetingSettlement(mtg);
            const treasurerUid = mtg.treasurerUid || mtg.hostUid;
            const treasurerMember = members.find((m) => m.uid === treasurerUid);

            return (
              <section key={mtg.id} className="list-section stack-gap">
                <div className="meeting-top">
                  <div className="badge-group">
                    <span className="platform-badge">#{mtg.id}</span>
                    <span
                      className={`status-pill ${
                        mtg.status === 'settled' ? 'settled' : 'open'
                      }`}
                    >
                      {mtg.status === 'settled' ? '정산 완료' : '진행중'}
                    </span>
                    <span className="location-pill">{mtg.location}</span>
                    <span className="muted-text">{mtg.date}</span>
                  </div>
                  <div className="btn-row">
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => handleCopyMeetingReport(mtg)}
                    >
                      {copiedId === mtg.id ? '복사 완료' : '리포트 복사'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() =>
                        onOpenMeetingDetail && onOpenMeetingDetail(mtg.id)
                      }
                    >
                      벙 페이지 열기 →
                    </button>
                  </div>
                </div>

                <div>
                  <h3>{mtg.title}</h3>
                  <p className="sub-meta">
                    총무:{' '}
                    <strong>
                      {treasurerMember
                        ? formatMemberNickname(treasurerMember)
                        : treasurerUid}
                    </strong>{' '}
                    ({treasurerMember?.bankAccount || '계좌 미등록'})
                  </p>
                </div>

                <div className="stats-grid">
                  <div className="stat-box">
                    <span className="stat-label">총 모임 비용</span>
                    <strong className="stat-value">
                      {settlement.totalGrossCost.toLocaleString()}원
                    </strong>
                    <span className="stat-sub">
                      총 {(mtg.rounds || []).length}차 진행
                    </span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">골든벨 · 찬조금</span>
                    <strong className="stat-value">
                      {(
                        settlement.totalGoldenBellCost +
                        settlement.totalSponsorship
                      ).toLocaleString()}
                      원
                    </strong>
                    <span className="stat-sub">
                      골든벨 {settlement.totalGoldenBellCost.toLocaleString()} / 찬조{' '}
                      {settlement.totalSponsorship.toLocaleString()}
                    </span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">1/N 정산 대상액</span>
                    <strong className="stat-value">
                      {Math.max(
                        0,
                        settlement.totalSharedCost - settlement.totalSponsorship
                      ).toLocaleString()}
                      원
                    </strong>
                    <span className="stat-sub">
                      대상 {settlement.participantRows.length}명
                    </span>
                  </div>
                </div>

                {/* Round Summary List */}
                <div className="participants-box">
                  <div className="participants-title">차수별 결제 요약</div>
                  <div className="divider-list">
                    {settlement.roundSummaries.map((rs) => {
                      const payer = members.find((m) => m.uid === rs.payerUid);
                      return (
                        <div key={rs.id || rs.roundNumber} className="ranking-row">
                          <div>
                            <strong>
                              {rs.roundNumber}차: {rs.placeName || '장소 미정'}
                            </strong>
                            <span className="sub-meta">
                              {' '}
                              · 결제자:{' '}
                              {payer ? formatMemberNickname(payer) : rs.payerUid} · 참석{' '}
                              {rs.participantCount}명
                            </span>
                          </div>
                          <div>
                            <strong>{rs.cost.toLocaleString()}원</strong>
                            {rs.isGoldenBell ? (
                              <span className="expedition-pill" style={{ marginLeft: '6px' }}>
                                골든벨
                              </span>
                            ) : (
                              <span className="sub-meta">
                                {' '}
                                (1인 {rs.perPersonRounded.toLocaleString()}원)
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Per-Participant Status Table */}
                <div className="divider-list">
                  {settlement.participantRows.map((row) => {
                    const mem = members.find((m) => m.uid === row.uid);
                    if (!mem) return null;
                    return (
                      <div key={row.uid} className="ranking-row">
                        <div className="rank-left">
                          <strong>{formatMemberNickname(mem)}</strong>
                          <span className="location-pill">
                            {row.attendedRounds.join(',') || '미참석'}
                          </span>
                          <span
                            className={`status-pill ${
                              row.confirmed ? 'open' : 'settled'
                            }`}
                          >
                            {row.confirmed
                              ? '컨펌완료'
                              : row.paid
                                ? '입금완료(대기)'
                                : '미입금'}
                          </span>
                          {row.safeReturnAt && (
                            <span className="platform-badge">
                              {row.safeReturnAt}
                            </span>
                          )}
                        </div>
                        <div className="rank-right">
                          <strong className="score-highlight">
                            {row.netToPay >= 0
                              ? `입금 ${row.netToPay.toLocaleString()}원`
                              : `환급 +${Math.abs(
                                  row.netToPay
                                ).toLocaleString()}원`}
                          </strong>
                          <div className="sub-meta">
                            부담 {row.finalShare.toLocaleString()}원
                            {row.paidOutOfPocket > 0
                              ? ` / 대납 ${row.paidOutOfPocket.toLocaleString()}원`
                              : ''}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Sub-Tab 2: Personal Report */}
      {subTab === 'personal' && targetMember && (
        <section className="list-section stack-gap">
          <div className="summary-header">
            <div>
              <span className="muted-text">선택된 회원 리포트</span>
              <div className="my-nickname-row">
                <h2>{formatMemberNickname(targetMember)}</h2>
                <span
                  className="role-pill"
                  style={{
                    backgroundColor: ROLE_META[targetMember.role]?.badgeColor
                  }}
                >
                  {ROLE_META[targetMember.role]?.label}
                </span>
              </div>
              <div className="sub-meta" style={{ marginTop: '4px' }}>
                등록 계좌: {targetMember.bankAccount || '미등록'} · 연고지:{' '}
                {targetMember.homeCity}
              </div>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-box">
              <span className="stat-label">누적 점수 / 참석</span>
              <strong className="stat-value">
                {targetMember.totalScore}점 ({targetMember.attendanceCount}회)
              </strong>
              <span className="stat-sub">
                기본 {targetMember.baseScore} · 원정 {targetMember.expeditionScore} · 이벤트{' '}
                {targetMember.eventScore}
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
                대납 {totalMyOutOfPocket.toLocaleString()} / 찬조·골든벨{' '}
                {totalMySponsored.toLocaleString()}
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
                        벙 보기
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

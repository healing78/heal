import { generateNickname } from '../nicknameUtils';

export const ROLE_META = {
  Leader: { label: '방장', badgeColor: 'var(--role-leader, #1e293b)', isAdmin: true },
  Deputy: { label: '부방장', badgeColor: 'var(--role-deputy, #334155)', isAdmin: true },
  VIP: { label: 'VIP', badgeColor: 'var(--role-vip, #475569)', isAdmin: false },
  Member: { label: '일반회원', badgeColor: 'var(--role-member, #64748b)', isAdmin: false },
  Rookie: { label: '신입', badgeColor: 'var(--role-rookie, #0d9488)', isAdmin: false },
  OnLeave: { label: '외출자', badgeColor: 'var(--role-onleave, #ea580c)', isAdmin: false },
  Wanderer: { label: '방랑자', badgeColor: 'var(--role-wanderer, #78716c)', isAdmin: false },
  Withdrawn: { label: '탈퇴자', badgeColor: '#94a3b8', isAdmin: false },
  Expelled: { label: '강퇴자', badgeColor: '#7f1d1d', isAdmin: false }
};

export const ROLE_KEYS = Object.keys(ROLE_META);

/**
 * 7 Regional Groups for Expedition Score Calculation:
 * 1. 서울, 경기 (수도권: 서울·경기·인천 및 경기도 내 시/군)
 * 2. 강원도
 * 3. 충청남북도, 대전 (세종 포함)
 * 4. 전라남북도, 광주
 * 5. 경상남북도, 부산 (대구·울산 포함)
 * 6. 제주도
 * 7. 해외 (+2점)
 */
export const REGION_GROUPS = [
  {
    id: 1,
    name: '서울·경기',
    keywords: [
      '서울', '경기', '인천', '수도권', '수원', '성남', '분당', '판교', '고양', '일산',
      '용인', '부천', '안산', '안양', '인덕원', '남양주', '화성', '동탄', '평택', '의정부', '시흥',
      '파주', '광명', '김포', '군포', '광주(경기)', '이천', '양주', '오산', '구리', '안성',
      '포천', '의왕', '하남', '여주', '양평', '동두천', '과천', '가평', '연천'
    ]
  },
  {
    id: 2,
    name: '강원도',
    keywords: [
      '강원', '춘천', '원주', '강릉', '동해', '태백', '속초', '삼척', '홍천', '횡성',
      '영월', '평창', '정선', '철원', '화천', '양구', '인제', '고성', '양양'
    ]
  },
  {
    id: 3,
    name: '충청·대전',
    keywords: [
      '충청', '충남', '충북', '대전', '세종', '천안', '공주', '보령', '아산', '서산',
      '논산', '계룡', '당진', '청주', '충주', '제천', '보은', '옥천', '영동', '증평',
      '진천', '괴산', '음성', '단양'
    ]
  },
  {
    id: 4,
    name: '전라·광주',
    keywords: [
      '전라', '전남', '전북', '광주', '전주', '군산', '익산', '정읍', '남원', '김제',
      '목포', '여수', '순천', '나주', '광양', '담양', '곡성', '구례', '고흥', '보성',
      '화순', '장흥', '강진', '해남', '영암', '무안', '함평', '영광', '장성', '완도', '진도', '신안'
    ]
  },
  {
    id: 5,
    name: '경상·부산',
    keywords: [
      '경상', '경남', '경북', '부산', '대구', '울산', '포항', '경주', '김천', '안동',
      '구미', '영주', '영천', '상주', '문경', '경산', '창원', '마산', '진해', '진주',
      '통영', '사천', '김해', '밀양', '거제', '양산'
    ]
  },
  {
    id: 6,
    name: '제주도',
    keywords: ['제주', '서귀포']
  },
  {
    id: 7,
    name: '해외',
    keywords: [
      '해외', '멕시코', '미국', '일본', '중국', '캐나다', '호주', '영국', '독일', '프랑스',
      '베트남', '태국', '싱가포르', '필리핀', '대만', '홍콩', '유럽', '남미', '북미'
    ]
  }
];

/**
 * Resolves a city/location string into one of the 7 region groups.
 */
export const resolveRegionGroup = (locationStr) => {
  const clean = String(locationStr || '').trim();
  if (!clean) return { id: 1, name: '서울·경기' };

  for (const group of REGION_GROUPS) {
    if (
      clean === group.name ||
      group.keywords.some((kw) => clean.includes(kw))
    ) {
      return { id: group.id, name: group.name };
    }
  }
  return { id: 1, name: clean };
};

/**
 * Detects region group from a single piece of text.
 * Returns { recognized: boolean, group: object|null, matchedKeyword: string }
 */
export const detectRegionFromText = (rawText = '') => {
  const text = String(rawText || '').trim();
  if (!text) return { recognized: false, group: null, matchedKeyword: '' };

  for (const group of REGION_GROUPS) {
    if (text === group.name) {
      return {
        recognized: true,
        group: { id: group.id, name: group.name },
        matchedKeyword: group.keywords[0] || group.name
      };
    }
    const matched = group.keywords.find((kw) => text.includes(kw));
    if (matched) {
      return {
        recognized: true,
        group: { id: group.id, name: group.name },
        matchedKeyword: matched
      };
    }
  }
  return { recognized: false, group: null, matchedKeyword: '' };
};

/**
 * Checks if a meeting has a recognizable region keyword in explicit region, placeDetail, location, or rounds (1차, 2차, ...).
 * Returns { recognized: boolean, group: object|null, matchedKeyword: string }
 */
export const detectMeetingRegion = (meeting) => {
  if (!meeting) return { recognized: false, group: null, matchedKeyword: '' };
  const candidates = [
    meeting.region,
    meeting.regionGroup,
    meeting.placeDetail,
    meeting.location,
    ...(Array.isArray(meeting.rounds)
      ? meeting.rounds.map((r) => r?.placeName)
      : [])
  ]
    .map((s) => String(s || '').trim())
    .filter(Boolean);

  for (const text of candidates) {
    const res = detectRegionFromText(text);
    if (res.recognized) return res;
  }
  return { recognized: false, group: null, matchedKeyword: '' };
};

/**
 * Strips out 1차/2차 round detailed markers ([네이버지도], [카카오맵], URLs, addresses)
 * and returns only the clean, original schedule location input.
 */
export const cleanScheduleLocation = (rawText = '', r1Place = '') => {
  let text = String(rawText || '').trim();
  if (!text) return '';

  if (r1Place && text === String(r1Place).trim()) {
    return '';
  }

  // If text contains 1차 map details or markers like [네이버지도], [카카오맵], or http url
  if (/\[(?:네이버|카카오)지도\]/i.test(text) || /https?:\/\//i.test(text)) {
    const match = text.match(/^(.*?)(?:\[(?:네이버|카카오)지도\]|https?:\/\/)/i);
    const prefix = match ? match[1].trim() : '';
    if (prefix) return prefix;
    return '';
  }

  // Multi-line text: take only first line
  if (text.includes('\n')) {
    text = text.split('\n')[0].trim();
  }

  return text;
};

export const MASTER_ADMIN_SECRET =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_MASTER_ADMIN_KEY) ||
  'heal78master!';

/**
 * Checks whether a member has Stealth SuperAdmin (system owner) privileges.
 * Determined purely by UID whitelist in communityConfig, masking role as ordinary member.
 */
export const isSuperAdmin = (member, communityConfig = {}) => {
  if (!member) return false;
  if (
    Array.isArray(communityConfig?.superAdminUids) &&
    communityConfig.superAdminUids.includes(member.uid)
  ) {
    return true;
  }
  // Fallback for legacy role if present
  if (member.role === 'SuperAdmin') return true;
  return false;
};

/**
 * Checks whether a member has administrator privileges (Leader, Deputy, or Stealth SuperAdmin).
 */
export const isAdminUser = (member, communityConfig = {}) => {
  if (!member) return false;
  if (isSuperAdmin(member, communityConfig)) return true;
  return Boolean(ROLE_META[member.role]?.isAdmin);
};

/**
 * Checks whether a role has administrator privileges (Leader or Deputy).
 */
export const isAdminRole = (role) => {
  return Boolean(ROLE_META[role]?.isAdmin);
};

/**
 * Resolves the effective role for a member based on bung attendance:
 * - 벙참석 기록이 0회인 회원은 'Rookie'(신입)로 분류
 * - 벙참석 기록이 1회 이상이면 'Member'(일반회원)로 승급
 * (단, Leader, Deputy, VIP, OnLeave, Withdrawn, Wanderer, Expelled 등 명시적 특수 역할은 유지)
 */
export const resolveMemberRole = (member) => {
  if (!member) return 'Rookie';
  const role = member.role;
  if (
    role === 'Leader' ||
    role === 'Deputy' ||
    role === 'VIP' ||
    role === 'OnLeave' ||
    role === 'Withdrawn' ||
    role === 'Wanderer' ||
    role === 'Expelled'
  ) {
    return role;
  }
  return (member.attendanceCount || 0) >= 1 ? 'Member' : 'Rookie';
};

/**
 * Checks whether a member is eligible to create a meeting (벙).
 */
export const canCreateMeeting = (member) => {
  if (!member) return false;
  if (
    member.role === 'Rookie' ||
    member.role === 'OnLeave' ||
    member.role === 'Wanderer' ||
    member.role === 'Withdrawn' ||
    member.role === 'Expelled'
  ) {
    return false;
  }
  if (isAdminRole(member.role)) return true;
  return (member.attendanceCount || 0) >= 1;
};

/**
 * Checks whether a member can edit/manage/settle a meeting (Host, Treasurer, or Admin).
 */
export const canManageMeeting = (member, meeting, communityConfig = {}) => {
  if (!member || !meeting) return false;
  return (
    member.uid === meeting.hostUid ||
    member.uid === meeting.treasurerUid ||
    isAdminUser(member, communityConfig)
  );
};

export const canSettleMeeting = (member, meeting, communityConfig = {}) => {
  if (!member || !meeting || meeting.status !== 'open') return false;
  return canManageMeeting(member, meeting, communityConfig);
};

/**
 * Calculates base (+1), domestic expedition (+1 if different province group 1~6),
 * and overseas (+2 if either member or meeting is in group 7 '해외').
 */
export const calculateMeetingScoreForMember = (member, meetingLocation) => {
  const base = 1;
  const rawCity = (member?.city || '').trim();
  const rawHomeCity = (member?.homeCity || '').trim();
  const mtgLoc = (meetingLocation || '').trim();

  if ((!rawCity && !rawHomeCity) || !mtgLoc) {
    return {
      base,
      expedition: 0,
      total: base,
      isExpedition: false,
      isOverseas: false,
      label: '기본 참석'
    };
  }

  // Check both homeCity and city for overseas status (e.g. Mexico resident temporarily staying in 경광)
  const cityGroup = rawCity ? resolveRegionGroup(rawCity) : null;
  const homeGroup = rawHomeCity ? resolveRegionGroup(rawHomeCity) : null;
  const isMemberOverseas = cityGroup?.id === 7 || homeGroup?.id === 7;
  const meetingGroup = resolveRegionGroup(mtgLoc);

  if (isMemberOverseas || meetingGroup.id === 7) {
    return {
      base,
      expedition: 2,
      total: base + 2,
      isExpedition: true,
      isOverseas: true,
      label: '해외 원정 +2점'
    };
  }

  const memberGroup = homeGroup || cityGroup || { id: 1, name: '서울·경기' };
  const isDiffRegion = memberGroup.id !== meetingGroup.id;
  const expedition = isDiffRegion ? 1 : 0;

  return {
    base,
    expedition,
    total: base + expedition,
    isExpedition: isDiffRegion,
    isOverseas: false,
    label: isDiffRegion
      ? `원정 +1점 (${memberGroup.name}→${meetingGroup.name})`
      : '기본 참석'
  };
};

/**
 * Generates a YYMMDD + 01 meeting ID (e.g. '26110301', '26110302')
 */
export const generateMeetingId = (dateOnlyStr, existingMeetings = []) => {
  const digits = String(dateOnlyStr || '').replace(/\D/g, '');
  let yymmdd = '261103';
  if (digits.length >= 8) {
    yymmdd = digits.slice(2, 8);
  } else if (digits.length === 6) {
    yymmdd = digits;
  } else {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    yymmdd = `${yy}${mm}${dd}`;
  }

  const existingIds = new Set(existingMeetings.map((m) => String(m.id)));
  let seq = 1;
  while (seq < 100) {
    const candidate = `${yymmdd}${String(seq).padStart(2, '0')}`;
    if (!existingIds.has(candidate)) {
      return candidate;
    }
    seq += 1;
  }
  return `${yymmdd}${Date.now().toString().slice(-2)}`;
};

/**
 * Applies rounding unit to a raw KRW amount.
 */
export const applyUnitRounding = (amount, roundingRule = 'floor100') => {
  const num = Number(amount) || 0;
  if (num <= 0) return 0;
  if (roundingRule === 'floor100') {
    return Math.floor(num / 100) * 100;
  }
  if (roundingRule === 'ceil100') {
    return Math.ceil(num / 100) * 100;
  }
  return Math.round(num);
};

/**
 * Calculates full multi-round expense breakdown, sponsorships, golden bell,
 * payer reimbursements, and per-participant net transfer amounts.
 */
export const calculateMeetingSettlement = (meeting) => {
  if (!meeting) {
    return {
      totalGrossCost: 0,
      totalGoldenBellCost: 0,
      totalSponsorship: 0,
      totalSharedCost: 0,
      roundSummaries: [],
      participantRows: []
    };
  }

  const rounds = Array.isArray(meeting.rounds) ? meeting.rounds : [];
  const sponsorships = Array.isArray(meeting.sponsorships)
    ? meeting.sponsorships
    : [];
  const manualOverrides = meeting.manualAmounts || {};
  const paymentStatuses = meeting.paymentStatuses || {};
  const depositStatuses = meeting.depositStatuses || {};
  const personalDeposits = meeting.deposits || {};
  const baseAdvanceDeposit = Number(meeting.advanceDeposit) || 0;
  const safeReturns = meeting.safeReturns || {};
  const roundingRule = meeting.roundingRule || 'floor100';

  // Collect all unique participant UIDs across meeting.applicants and round.participants
  const participantSet = new Set(meeting.applicants || []);
  for (const r of rounds) {
    for (const uid of r.participants || []) {
      participantSet.add(uid);
    }
  }
  const allParticipantUids = Array.from(participantSet);

  const totalSponsorship = sponsorships.reduce(
    (sum, s) => sum + (Number(s.amount) || 0),
    0
  );

  // Per-round calculation
  let totalGrossCost = 0;
  let totalGoldenBellCost = 0;

  const roundSummaries = rounds.map((r, idx) => {
    const cost = Number(r.cost) || 0;
    const rParticipants = Array.isArray(r.participants) ? r.participants : [];
    const count = rParticipants.length;
    const isGoldenBell = Boolean(r.isGoldenBell);

    totalGrossCost += cost;
    if (isGoldenBell) {
      totalGoldenBellCost += cost;
    }

    const perPersonRaw =
      !isGoldenBell && count > 0 ? cost / count : 0;

    return {
      ...r,
      roundNumber: idx + 1,
      cost,
      participantCount: count,
      isGoldenBell,
      perPersonRaw,
      perPersonRounded: applyUnitRounding(perPersonRaw, roundingRule)
    };
  });

  const totalSharedCost = Math.max(0, totalGrossCost - totalGoldenBellCost);

  // Sponsorship discount per participant (if any sponsorships exist)
  const sponsorshipPerPerson =
    allParticipantUids.length > 0
      ? totalSponsorship / allParticipantUids.length
      : 0;

  // Build per-participant row
  const participantRows = allParticipantUids.map((uid) => {
    const attendedRounds = [];
    const roundBreakdown = [];
    let rawRoundSum = 0;
    let paidOutOfPocket = 0;

    for (const rs of roundSummaries) {
      if ((rs.participants || []).includes(uid)) {
        attendedRounds.push(`${rs.roundNumber}차`);
        roundBreakdown.push({
          roundNumber: rs.roundNumber,
          placeName: rs.placeName || `${rs.roundNumber}차`,
          cost: rs.cost,
          perPerson: rs.perPersonRounded,
          isGoldenBell: rs.isGoldenBell
        });
        if (!rs.isGoldenBell) {
          rawRoundSum += rs.perPersonRaw;
        }
      }
      // If this member paid the bill for this round (and it's not their own Golden Bell)
      if (rs.payerUid === uid && !rs.isGoldenBell) {
        paidOutOfPocket += rs.cost;
      }
    }

    const calculatedShare = applyUnitRounding(
      Math.max(0, rawRoundSum - sponsorshipPerPerson),
      roundingRule
    );

    const hasManualOverride =
      manualOverrides[uid] !== undefined &&
      manualOverrides[uid] !== null &&
      String(manualOverrides[uid]).trim() !== '';

    const finalShare = hasManualOverride
      ? Number(manualOverrides[uid]) || 0
      : calculatedShare;

    // 선입금 금액 (개인별 지정액 우선, 없으면 모임 기본 선입금)
    const depositAmount =
      personalDeposits[uid] !== undefined
        ? Number(personalDeposits[uid]) || 0
        : baseAdvanceDeposit;

    const depositStatusObj = depositStatuses[uid] || {
      paid: false,
      confirmed: false
    };

    // Net amount to send to Treasurer (Q1-A 공식: 최종 회비 - 본인 선결제액 - 선입금)
    const netToPay = finalShare - paidOutOfPocket - depositAmount;

    const statusObj = paymentStatuses[uid] || {
      paid: false,
      confirmed: false
    };

    return {
      uid,
      attendedRounds,
      roundBreakdown,
      calculatedShare,
      hasManualOverride,
      finalShare,
      paidOutOfPocket,
      depositAmount,
      depositPaid: Boolean(depositStatusObj.paid),
      depositConfirmed: Boolean(depositStatusObj.confirmed),
      netToPay,
      paid: Boolean(statusObj.paid),
      confirmed: Boolean(statusObj.confirmed),
      safeReturnAt: safeReturns[uid] || null
    };
  });

  const totalDepositAmount = participantRows.reduce(
    (sum, r) => sum + (r.depositAmount || 0),
    0
  );
  const totalDepositConfirmedCount = participantRows.filter(
    (r) => r.depositConfirmed
  ).length;

  return {
    totalGrossCost,
    totalGoldenBellCost,
    totalSponsorship,
    totalSharedCost,
    totalDepositAmount,
    totalDepositConfirmedCount,
    baseAdvanceDeposit,
    roundSummaries,
    participantRows
  };
};

/**
 * Official Bung Milestone Tier Badges:
 * 15점: 🦓 멈춰있는 얼룩말
 * 30점: 🐎 달리는 말
 * 50점: 🐴 대왕말
 * 78점: 🦄 유니콘
 * 100점: 🥉 동메달
 * 200점: 🥈 은메달
 * 300점: 🥇 금메달
 * 400점: 🏆 트로피
 * 500점: ⭐️ 별 (500단위로 별 추가 누적, 600점 ⭐️🥉 등 반복 순환)
 */
export const BUNG_TIER_BADGES = [
  { minScore: 15, badge: '🦓', label: '얼룩말' },
  { minScore: 30, badge: '🐎', label: '달리는 말' },
  { minScore: 50, badge: '🐴', label: '대왕말' },
  { minScore: 78, badge: '🦄', label: '유니콘' },
  { minScore: 100, badge: '🥉', label: '동메달' },
  { minScore: 200, badge: '🥈', label: '은메달' },
  { minScore: 300, badge: '🥇', label: '금메달' },
  { minScore: 400, badge: '🏆', label: '트로피' },
  { minScore: 500, badge: '⭐️', label: '스타' }
];

/**
 * Calculates official milestone tier badge based on member total score.
 * Example: 115점 🥉🦓, 278점 🥈🦄, 360점 🥇🐴, 450점 🏆🐴, 600점 ⭐️🥉
 */
export const getTierBadgeByScore = (score = 0) => {
  const pts = Math.max(0, Math.floor(Number(score) || 0));
  if (pts < 15) return '';

  const starCount = Math.floor(pts / 500);
  const rem500 = pts % 500;

  let medal = '';
  if (rem500 >= 400) medal = '🏆';
  else if (rem500 >= 300) medal = '🥇';
  else if (rem500 >= 200) medal = '🥈';
  else if (rem500 >= 100) medal = '🥉';

  const rem100 = rem500 % 100;
  let animal = '';
  if (rem100 >= 78) animal = '🦄';
  else if (rem100 >= 50) animal = '🐴';
  else if (rem100 >= 30) animal = '🐎';
  else if (rem100 >= 15) animal = '🦓';

  const stars = starCount > 0 ? '⭐️'.repeat(starCount) : '';
  return `${stars}${medal}${animal}`;
};

/**
 * Computes automatic badge based on score milestones unless a custom override is set.
 * 신입(Rookie) 또는 벙참석 0회인 경우에만 가입일 날짜 뱃지(entryBadge, MMDD)를 붙이고,
 * 1회 이상 벙에 참석한 일반 멤버는 가입일 날짜를 떼고 표시합니다.
 */
export const resolveMemberBadge = (member) => {
  if (!member) return '';
  if (member.customBadge) {
    return member.customBadge;
  }
  const tierBadge = getTierBadgeByScore(member.totalScore);
  if (tierBadge) {
    return tierBadge;
  }
  // 신입(Rookie) 또는 벙참석 기록이 0회인 경우에만 가입일 날짜 뱃지 부착
  const isRookie = member.role === 'Rookie' || (member.attendanceCount || 0) === 0;
  if (isRookie) {
    return member.entryBadge || member.badge || '';
  }
  // 1회 이상 벙에 참석한 일반 멤버는 가입일 날짜를 뗌
  return '';
};

/**
 * Builds the formatted community nickname for a member object.
 */
export const formatMemberNickname = (member) => {
  if (!member) return '';
  const badge = resolveMemberBadge(member);
  return generateNickname({
    name: member.realName,
    city: member.city,
    maritalStatus: member.maritalStatus,
    gender: member.gender,
    badge
  });
};

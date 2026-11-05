import { generateNickname } from '../nicknameUtils';

export const ROLE_META = {
  SuperAdmin: { label: '최고관리자', badgeColor: '#0f172a', isAdmin: true, isSuper: true },
  Leader: { label: '방장', badgeColor: 'var(--role-leader, #1e293b)', isAdmin: true },
  Deputy: { label: '부방장', badgeColor: 'var(--role-deputy, #334155)', isAdmin: true },
  VIP: { label: 'VIP', badgeColor: 'var(--role-vip, #475569)', isAdmin: false },
  Member: { label: '일반회원', badgeColor: 'var(--role-member, #64748b)', isAdmin: false },
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
      '용인', '부천', '안산', '안양', '남양주', '화성', '동탄', '평택', '의정부', '시흥',
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
      '해외', '미국', '일본', '중국', '캐나다', '호주', '영국', '독일', '프랑스',
      '베트남', '태국', '싱가포르', '필리핀', '대만', '홍콩', '유럽'
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
    if (group.keywords.some((kw) => clean.includes(kw))) {
      return { id: group.id, name: group.name };
    }
  }
  return { id: 1, name: clean };
};

export const MASTER_ADMIN_SECRET =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_MASTER_ADMIN_KEY) ||
  'heal78master!';

/**
 * Checks whether a member has SuperAdmin (system owner) privileges.
 */
export const isSuperAdmin = (member, communityConfig = {}) => {
  if (!member) return false;
  if (member.role === 'SuperAdmin') return true;
  if (
    Array.isArray(communityConfig?.superAdminUids) &&
    communityConfig.superAdminUids.includes(member.uid)
  ) {
    return true;
  }
  return false;
};

/**
 * Checks whether a role has administrator privileges (SuperAdmin, Leader or Deputy).
 */
export const isAdminRole = (role) => {
  return Boolean(ROLE_META[role]?.isAdmin);
};

/**
 * Checks whether a member is eligible to create a meeting (벙).
 */
export const canCreateMeeting = (member) => {
  if (!member) return false;
  if (member.role === 'Withdrawn' || member.role === 'Expelled') return false;
  if (isAdminRole(member.role)) return true;
  return (member.attendanceCount || 0) >= 1;
};

/**
 * Checks whether a member can edit/manage/settle a meeting (Host, Treasurer, or Admin).
 */
export const canManageMeeting = (member, meeting) => {
  if (!member || !meeting) return false;
  return (
    member.uid === meeting.hostUid ||
    member.uid === meeting.treasurerUid ||
    isAdminRole(member.role)
  );
};

export const canSettleMeeting = (member, meeting) => {
  if (!member || !meeting || meeting.status !== 'open') return false;
  return canManageMeeting(member, meeting);
};

/**
 * Calculates base (+1), domestic expedition (+1 if different province group 1~6),
 * and overseas (+2 if either member or meeting is in group 7 '해외').
 */
export const calculateMeetingScoreForMember = (member, meetingLocation) => {
  const base = 1;
  const homeLoc = (member?.homeCity || member?.city || '').trim();
  const mtgLoc = (meetingLocation || '').trim();

  if (!homeLoc || !mtgLoc) {
    return {
      base,
      expedition: 0,
      total: base,
      isExpedition: false,
      isOverseas: false,
      label: '기본 참석'
    };
  }

  const memberGroup = resolveRegionGroup(homeLoc);
  const meetingGroup = resolveRegionGroup(mtgLoc);

  if (memberGroup.id === 7 || meetingGroup.id === 7) {
    return {
      base,
      expedition: 2,
      total: base + 2,
      isExpedition: true,
      isOverseas: true,
      label: '해외 원정 +2점'
    };
  }

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
    let rawRoundSum = 0;
    let paidOutOfPocket = 0;

    for (const rs of roundSummaries) {
      if ((rs.participants || []).includes(uid)) {
        attendedRounds.push(`${rs.roundNumber}차`);
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

    // Net amount to send to Treasurer (if negative, Treasurer owes this payer money!)
    const netToPay = finalShare - paidOutOfPocket;

    const statusObj = paymentStatuses[uid] || {
      paid: false,
      confirmed: false
    };

    return {
      uid,
      attendedRounds,
      calculatedShare,
      hasManualOverride,
      finalShare,
      paidOutOfPocket,
      netToPay,
      paid: Boolean(statusObj.paid),
      confirmed: Boolean(statusObj.confirmed),
      safeReturnAt: safeReturns[uid] || null
    };
  });

  return {
    totalGrossCost,
    totalGoldenBellCost,
    totalSponsorship,
    totalSharedCost,
    roundSummaries,
    participantRows
  };
};

/**
 * Computes automatic badge based on attendance milestones and role unless a custom override is set.
 */
export const resolveMemberBadge = (member) => {
  if (member.customBadge) {
    return member.customBadge;
  }
  return member.entryBadge || member.badge || '0101';
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

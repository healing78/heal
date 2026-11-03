import { generateNickname } from '../nicknameUtils';

export const ROLE_META = {
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
 * Checks whether a role has administrator privileges (Leader or Deputy).
 */
export const isAdminRole = (role) => {
  return Boolean(ROLE_META[role]?.isAdmin);
};

/**
 * Checks whether a member is eligible to create a meeting (벙).
 * Rule: Must have attended at least 1 settled meeting (attendanceCount >= 1) OR be an Admin (Leader/Deputy).
 */
export const canCreateMeeting = (member) => {
  if (!member) return false;
  if (member.role === 'Withdrawn' || member.role === 'Expelled') return false;
  if (isAdminRole(member.role)) return true;
  return (member.attendanceCount || 0) >= 1;
};

/**
 * Checks whether a member can settle (close & award points for) a meeting.
 * Rule: Must be the meeting host (벙주) or an Admin (Leader/Deputy), and meeting must still be 'open'.
 */
export const canSettleMeeting = (member, meeting) => {
  if (!member || !meeting || meeting.status !== 'open') return false;
  return member.uid === meeting.hostUid || isAdminRole(member.role);
};

/**
 * Calculates base (+1) and expedition (+2 if meeting.location !== member.homeCity) points.
 */
export const calculateMeetingScoreForMember = (member, meetingLocation) => {
  const base = 1;
  const normalizedHome = (member?.homeCity || member?.city || '').trim();
  const normalizedLoc = (meetingLocation || '').trim();
  const isExpedition = Boolean(
    normalizedHome && normalizedLoc && normalizedHome !== normalizedLoc
  );
  const expedition = isExpedition ? 2 : 0;

  return {
    base,
    expedition,
    total: base + expedition,
    isExpedition
  };
};

/**
 * Computes automatic badge based on attendance milestones and role unless a custom override is set.
 * - New member (0 attendance): entryDate MMDD (e.g. '0829')
 * - VIP or high attendance: automatic milestone indicator if no custom badge override
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

/**
 * Extensible Random Box (랜덤 박스) Quest Registry & Access Control
 * Healing78 Community System
 */

import { isAdminRole } from '../core/communityRules';

/**
 * Calculates the number of times current user and host were in the same meeting.
 */
export function getMetCountWithHost(allMeetings = [], currentUserId, hostId) {
  if (!currentUserId || !hostId || currentUserId === hostId) return 0;

  return allMeetings.filter((m) => {
    const participants = [
      ...(m.confirmedParticipants || []),
      ...(m.applicants || [])
    ];
    const meJoined = participants.includes(currentUserId);
    const hostJoined = m.hostUid === hostId || participants.includes(hostId);
    return meJoined && hostJoined;
  }).length;
}

/**
 * Extensible Registry for Random Box Quest Types
 */
export const RandomBoxQuestRegistry = {
  ACTIVITY_ATTENDANCE: {
    type: 'ACTIVITY_ATTENDANCE',
    name: '성실 힐러 박스',
    icon: '🏆',
    description: '가입 14일 이상 & 누적 벙 10회 이상 참석 시 해제',
    checkAutoEligible: (user, meeting) => {
      if (!user) return false;
      const joinedTimestamp = user.joinedAt
        ? new Date(user.joinedAt).getTime()
        : Date.now() - 30 * 24 * 60 * 60 * 1000; // fallback default to senior
      const daysSinceJoin = (Date.now() - joinedTimestamp) / (1000 * 60 * 60 * 24);
      const minAttendance = meeting?.randomBoxConfig?.minAttendanceCount ?? 10;
      return daysSinceJoin >= 14 && (user.attendanceCount || 0) >= minAttendance;
    },
    getProgressText: (user, meeting) => {
      const minAttendance = meeting?.randomBoxConfig?.minAttendanceCount ?? 10;
      const current = user?.attendanceCount || 0;
      return `현재 참석 ${current}회 / 필요 ${minAttendance}회`;
    }
  },

  HOST_RELATIONSHIP: {
    type: 'HOST_RELATIONSHIP',
    name: '벙주와의 인연 박스',
    icon: '🤝',
    description: '벙주와 함께한 벙 3회 이상 시 해제',
    checkAutoEligible: (user, meeting, allMeetings = []) => {
      if (!user || !meeting?.hostUid) return false;
      const metCount = getMetCountWithHost(allMeetings, user.uid, meeting.hostUid);
      const minMet = meeting?.randomBoxConfig?.minMetCount ?? 3;
      return metCount >= minMet;
    },
    getProgressText: (user, meeting, allMeetings = []) => {
      if (!user || !meeting?.hostUid) return '';
      const metCount = getMetCountWithHost(allMeetings, user.uid, meeting.hostUid);
      const minMet = meeting?.randomBoxConfig?.minMetCount ?? 3;
      return `함께한 벙 ${metCount}회 / 필요 ${minMet}회`;
    }
  },

  MEETING_QUIZ: {
    type: 'MEETING_QUIZ',
    name: '벙주 시크릿 퀴즈 박스',
    icon: '🧩',
    description: '벙주가 낸 수수께끼 정답을 맞추면 해제',
    requiresInput: true,
    getQuestion: (meeting) =>
      meeting?.randomBoxConfig?.quizQuestion || '오늘 2차로 방문한 장소는?',
    verifyAnswer: (userAnswer, meeting) => {
      const target = String(meeting?.randomBoxConfig?.quizAnswer || '수제맥주')
        .replace(/\s+/g, '')
        .toLowerCase();
      const input = String(userAnswer || '')
        .replace(/\s+/g, '')
        .toLowerCase();
      return Boolean(target && input && (input === target || input.includes(target)));
    }
  }
};

/**
 * Checks whether user has permission to view the meeting's album.
 * Base rule: attendees + host + treasurer + admins + users who unlocked via Random Box.
 */
export function canViewMeetingAlbum(user, meeting) {
  if (!user || !meeting) return false;

  const applicants = meeting.applicants || [];
  const confirmed = meeting.confirmedParticipants || [];
  const isApplied = applicants.includes(user.uid);
  const isConfirmed = confirmed.includes(user.uid);
  const isHost = meeting.hostUid === user.uid;
  const isTreasurer = (meeting.treasurerUid || meeting.hostUid) === user.uid;
  const admin = isAdminRole(user.role);

  if (isApplied || isConfirmed || isHost || isTreasurer || admin) {
    return true;
  }

  // Check if unlocked via Random Box
  const unlocked = Array.isArray(user.unlockedAlbums)
    ? user.unlockedAlbums.includes(meeting.id)
    : false;

  return unlocked;
}

/**
 * Checks whether user can upload photos/videos to the album.
 * Restricted to attendees, host, treasurer, and admins.
 */
export function canUploadMeetingMedia(user, meeting) {
  if (!user || !meeting) return false;
  const applicants = meeting.applicants || [];
  const confirmed = meeting.confirmedParticipants || [];
  const isApplied = applicants.includes(user.uid);
  const isConfirmed = confirmed.includes(user.uid);
  const isHost = meeting.hostUid === user.uid;
  const isTreasurer = (meeting.treasurerUid || meeting.hostUid) === user.uid;
  const admin = isAdminRole(user.role);

  return isApplied || isConfirmed || isHost || isTreasurer || admin;
}

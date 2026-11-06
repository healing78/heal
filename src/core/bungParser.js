/**
 * Bung Records Smart Parser & Kakao Notice Formatter
 * - 벙 제목 제약 완전 해제 (끝 글자 무관, 공백 허용, 누락 시 자동 보정)
 * - 총 인원수 제약 완전 해제 (총 20명, 총20명, 20명, 누락 시 자동 산출)
 * - 기존 파이썬 프로그램 및 카카오톡 오픈채팅방 공지와 100% 상호 호환
 */

const HEADER_REGEX = /^\s*(?:(\d{2,4})년\s*)?(\d{1,2})월\s*(\d{1,2})일\s*(.*)$/;
const TOTAL_REGEX = /(?:총\s*)?(\d+)\s*명?/;

/**
 * Parses raw bung document text into structured bung records.
 * @param {string} rawText - Full or partial bung document text
 * @returns {Array<Object>} List of parsed bung records
 */
export function parseBungDocument(rawText) {
  if (!rawText || typeof rawText !== 'string') return [];

  const lines = rawText.split(/\r?\n/);
  let startIdx = 0;
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].includes('전체 벙기록')) {
      startIdx = i + 1;
      break;
    }
  }

  const records = [];
  let currentHeader = null;
  let currentAttendees = [];
  let currentTotal = 0;

  for (let i = startIdx; i < lines.length; i += 1) {
    const rawLine = lines[i].replace(/\r/g, '').trimEnd();
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    const hMatch = rawLine.match(HEADER_REGEX);
    // Header line starts with date and does not have leading indentation
    if (hMatch && !rawLine.startsWith(' ') && !rawLine.startsWith('\t')) {
      if (currentHeader) {
        records.push(finalizeRecord(currentHeader, currentAttendees, currentTotal));
        currentAttendees = [];
        currentTotal = 0;
      }

      const yVal = hMatch[1] ? Number(hMatch[1]) : new Date().getFullYear();
      const year = yVal > 2000 ? yVal - 2000 : yVal % 100;
      const month = Number(hMatch[2]);
      const day = Number(hMatch[3]);
      const title = hMatch[4].trim() || `${month}월${day}일벙`;

      currentHeader = { year, month, day, title };
      continue;
    }

    // Check if line represents headcount (총 10명, 총10명, 10명 등)
    if (trimmed.startsWith('총') || trimmed.endsWith('명') || /^총\s*\d+/.test(trimmed)) {
      const totMatch = trimmed.match(TOTAL_REGEX);
      if (totMatch && totMatch[1]) {
        currentTotal = Number(totMatch[1]);
        continue;
      }
    }

    // Attendee line
    const tokens = trimmed.split(/\s+/);
    for (const tok of tokens) {
      const clean = tok.replace(/[,.]/g, '').trim();
      if (!clean || clean === '총' || clean.endsWith('명')) continue;

      const name = clean.replace(/[0-9]/g, '');
      const ptsStr = clean.replace(/[^0-9]/g, '');
      const points = ptsStr ? Number(ptsStr) : 1;

      if (name) {
        currentAttendees.push({
          rawToken: clean,
          name,
          points,
          isExpedition: points >= 2
        });
      }
    }
  }

  if (currentHeader) {
    records.push(finalizeRecord(currentHeader, currentAttendees, currentTotal));
  }

  return records;
}

function finalizeRecord(header, attendees, specifiedTotal) {
  const yyyy = header.year < 50 ? 2000 + header.year : 1900 + header.year;
  const mm = String(header.month).padStart(2, '0');
  const dd = String(header.day).padStart(2, '0');
  const dateOnly = `${yyyy}-${mm}-${dd}`;
  const total = specifiedTotal || attendees.length;

  return {
    year: header.year,
    month: header.month,
    day: header.day,
    dateOnly,
    title: header.title,
    attendees,
    total,
    rawText: `${header.year}년${header.month}월${header.day}일 ${header.title}\n ${attendees.map((a) => a.rawToken).join(' ')}\n 총 ${total}명`
  };
}

/**
 * Formats a single meeting object to Kakao notice format compatible with the Python script.
 * @param {Object} meeting - Meeting item
 * @param {Map<string, Object>} [membersMap] - Map of UID to member object
 * @returns {string} 3-line Kakao text
 */
export function formatMeetingToKakaoNotice(meeting, membersMap = new Map()) {
  const dateStr = meeting.dateOnly || String(meeting.date || '').slice(0, 10);
  const parts = dateStr.split('-');
  const y = parts[0] ? Number(parts[0]) % 100 : 26;
  const m = parts[1] ? Number(parts[1]) : 11;
  const d = parts[2] ? Number(parts[2]) : 1;
  const title = (meeting.title || `${m}월${d}일벙`).trim();

  const participantUids =
    meeting.confirmedParticipants ||
    meeting.attendeeUids ||
    meeting.rounds?.[0]?.participants ||
    [];

  const attendeeTokens = [];
  if (meeting.attendees && meeting.attendees.length > 0 && typeof meeting.attendees[0] === 'object') {
    for (const a of meeting.attendees) {
      attendeeTokens.push(a.rawToken || (a.points > 1 ? `${a.name}${a.points}` : a.name));
    }
  } else if (meeting.attendeeNames && meeting.attendeeNames.length > 0) {
    for (const name of meeting.attendeeNames) {
      attendeeTokens.push(name);
    }
  } else {
    for (const uid of participantUids) {
      const member = membersMap.get(uid);
      const name = member?.realName || uid;
      attendeeTokens.push(name);
    }
  }

  const total = attendeeTokens.length;
  return `${y}년${m}월${d}일 ${title}\n ${attendeeTokens.join(' ')}\n 총 ${total}명`;
}

/**
 * Formats all meetings to the complete 3️⃣ 전체 벙기록 section or full Kakao notice.
 * @param {Array<Object>} meetings - List of meetings
 * @param {Array<Object>} [members] - List of members
 * @returns {string} Full text
 */
export function formatAllMeetingsToKakaoDocument(meetings = [], members = []) {
  const membersMap = new Map(members.map((m) => [m.uid, m]));
  const sorted = [...meetings].sort((a, b) => {
    const dateA = a.dateOnly || a.date || '';
    const dateB = b.dateOnly || b.date || '';
    return dateB.localeCompare(dateA); // most recent first
  });

  const lines = ['3️⃣  전체 벙기록\n'];
  for (const mtg of sorted) {
    lines.push(formatMeetingToKakaoNotice(mtg, membersMap));
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Calculates Co-attendance Matrix (친구 간 만난 횟수) across all meetings.
 * @param {Array<Object>} meetings - All meetings
 * @param {Array<Object>} members - All members
 * @returns {Object} Co-attendance helper methods
 */
export function buildCoAttendanceIndex(meetings = [], members = []) {
  const nameToUid = new Map(members.map((m) => [m.realName, m.uid]));
  // Map<uidA, Map<uidB, number>>
  const pairCounts = new Map();
  // Map<uidA, Map<uidB, Array<meeting>>>
  const pairMeetings = new Map();

  const getParticipants = (mtg) => {
    const uids = new Set();
    const rawList =
      mtg.confirmedParticipants ||
      mtg.attendeeUids ||
      mtg.rounds?.[0]?.participants ||
      [];
    for (const u of rawList) {
      if (u) uids.add(u);
    }

    if (mtg.attendees) {
      for (const a of mtg.attendees) {
        const name = typeof a === 'string' ? a : a.name;
        const uid = nameToUid.get(name);
        if (uid) uids.add(uid);
      }
    }

    if (mtg.attendeeNames) {
      for (const name of mtg.attendeeNames) {
        const uid = nameToUid.get(name);
        if (uid) uids.add(uid);
      }
    }

    return Array.from(uids);
  };

  for (const mtg of meetings) {
    const participants = getParticipants(mtg);
    if (participants.length < 2) continue;

    for (let i = 0; i < participants.length; i += 1) {
      const uA = participants[i];
      if (!pairCounts.has(uA)) {
        pairCounts.set(uA, new Map());
        pairMeetings.set(uA, new Map());
      }
      const uAMap = pairCounts.get(uA);
      const uAMtgMap = pairMeetings.get(uA);

      for (let j = 0; j < participants.length; j += 1) {
        if (i === j) continue;
        const uB = participants[j];
        const currentCount = uAMap.get(uB) || 0;
        uAMap.set(uB, currentCount + 1);

        if (!uAMtgMap.has(uB)) {
          uAMtgMap.set(uB, []);
        }
        uAMtgMap.get(uB).push(mtg);
      }
    }
  }

  return {
    getCoAttendanceCount: (uidA, uidB) => {
      if (!uidA || !uidB || uidA === uidB) return 0;
      return pairCounts.get(uidA)?.get(uidB) || 0;
    },
    getSharedMeetings: (uidA, uidB) => {
      if (!uidA || !uidB || uidA === uidB) return [];
      return pairMeetings.get(uidA)?.get(uidB) || [];
    },
    getTopBuddies: (targetUid, limit = 5) => {
      if (!targetUid || !pairCounts.has(targetUid)) return [];
      const uMap = pairCounts.get(targetUid);
      const sorted = Array.from(uMap.entries())
        .map(([buddyUid, count]) => {
          const buddyMember = members.find((m) => m.uid === buddyUid);
          return {
            uid: buddyUid,
            count,
            member: buddyMember,
            realName: buddyMember?.realName || buddyUid,
            city: buddyMember?.city || ''
          };
        })
        .filter((item) => item.member) // only registered members
        .sort((a, b) => b.count - a.count);

      return sorted.slice(0, limit);
    }
  };
}

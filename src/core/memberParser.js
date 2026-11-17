import { KOREA_DISTRICTS } from './koreaRegions.js';

// Pre-build set of known region names & aliases for intelligent name/city disambiguation
const REGION_SET = new Set();
for (const d of KOREA_DISTRICTS) {
  if (d.value) REGION_SET.add(d.value);
  if (d.label) REGION_SET.add(d.label);
  if (Array.isArray(d.aliases)) {
    for (const a of d.aliases) {
      if (a) REGION_SET.add(a);
    }
  }
}

/**
 * Derives a 4-digit entry badge (MMDD) from a date string (e.g. '2026-05-21' -> '0521')
 * @param {string} dateStr
 * @returns {string} MMDD or empty string
 */
export function deriveEntryBadge(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return '';
  const clean = dateStr.trim();
  if (/^\d{4}$/.test(clean)) return clean;
  const match = clean.match(/(?:(?:\d{2,4})[-./년\s]+)?(\d{1,2})[-./월\s]+(\d{1,2})/);
  if (match) {
    const mm = String(parseInt(match[1], 10)).padStart(2, '0');
    const dd = String(parseInt(match[2], 10)).padStart(2, '0');
    return `${mm}${dd}`;
  }
  return '';
}

/**
 * Parses KakaoTalk open chat intro / welcome message line into structured member fields.
 * Example inputs:
 *  - "2026년 5월 21일 오전 5:29 맑음이 마포 기 여"
 *  - "2026. 5. 21. 오후 3:10 카일 강남 미 남"
 *  - "2026-05-21 맑음이 마포 돌싱 여성"
 *  - "맑음이 마포 기 여"
 * 
 * @param {string} rawText
 * @returns {Object|null} Parsed member update fields
 */
export function parseMemberQuickInput(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;
  const text = rawText.trim();
  if (!text) return null;

  let joinedAt = '';
  let entryBadge = '';
  let remaining = text;

  // 1. Date & Time match (e.g. '2026년 5월 21일 오전 5:29', '2026. 5. 21. 오후 3:10', '2026-05-21 05:29')
  const dateRegex = /(?:(\d{2,4})[년./-]\s*)?(\d{1,2})[월./-]\s*(\d{1,2})[일.]?(?:\s*(?:오전|오후|AM|PM)?\s*\d{1,2}:\d{2}(?::\d{2})?)?/i;
  const dMatch = remaining.match(dateRegex);
  if (dMatch) {
    const rawYear = dMatch[1] ? parseInt(dMatch[1], 10) : new Date().getFullYear();
    const year = rawYear < 100 ? (rawYear < 50 ? 2000 + rawYear : 1900 + rawYear) : rawYear;
    const month = parseInt(dMatch[2], 10);
    const day = parseInt(dMatch[3], 10);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const mm = String(month).padStart(2, '0');
      const dd = String(day).padStart(2, '0');
      joinedAt = `${year}-${mm}-${dd}`;
      entryBadge = `${mm}${dd}`;
      remaining = remaining.replace(dMatch[0], ' ').trim();
    }
  }

  // 2. Tokenize remaining words, removing punctuation like dots, colons, slashes
  const tokens = remaining
    .replace(/[.,:;/|]+/g, ' ')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);

  let gender = '';
  let maritalStatus = '';
  const leftover = [];

  for (const token of tokens) {
    // Gender identification
    if (!gender && /^(?:여|여성|여자|F|f)$/.test(token)) {
      gender = '여';
      continue;
    }
    if (!gender && /^(?:남|남성|남자|M|m)$/.test(token)) {
      gender = '남';
      continue;
    }

    // Marital status identification
    if (!maritalStatus && /^(?:기|기혼|기혼자)$/.test(token)) {
      maritalStatus = 'married';
      continue;
    }
    if (!maritalStatus && /^(?:미|미혼|미혼자)$/.test(token)) {
      maritalStatus = 'single';
      continue;
    }
    if (!maritalStatus && /^(?:돌|돌싱|이혼)$/.test(token)) {
      maritalStatus = 'divorced';
      continue;
    }

    // Discard lone am/pm words if left over
    if (/^(?:오전|오후|AM|PM)$/i.test(token)) continue;

    leftover.push(token);
  }

  // Disambiguate name and city using REGION_SET
  let realName = '';
  let city = '';

  if (leftover.length >= 2) {
    const [first, second] = leftover;
    if (REGION_SET.has(second) && !REGION_SET.has(first)) {
      realName = first;
      city = second;
    } else if (REGION_SET.has(first) && !REGION_SET.has(second)) {
      city = first;
      realName = second;
    } else {
      realName = first;
      city = second;
    }
  } else if (leftover.length === 1) {
    if (REGION_SET.has(leftover[0])) {
      city = leftover[0];
    } else {
      realName = leftover[0];
    }
  }

  return {
    joinedAt,
    entryBadge: entryBadge || deriveEntryBadge(joinedAt),
    realName,
    city,
    gender,
    maritalStatus,
    rawText: text
  };
}

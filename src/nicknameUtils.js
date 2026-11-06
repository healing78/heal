/**
 * Nickname Utility for Heal Community
 * Format: [Name] [City] [MaritalStatus] [Gender] [Badge/EntryDate]
 */

export const MARITAL_STATUS_MAP = {
  married: '기',
  single: '미',
  divorced: '돌'
};

/**
 * 힐링78 회원 이름 규칙:
 * - 한글 1자 이상 3자 이하 (가-힣 음절만 허용, 영문/숫자/특수문자/공백 불가)
 * - 모임 내에서 완전히 '유일(Unique)'해야 함
 */
export const KOREAN_NAME_REGEX = /^[가-힣]{1,3}$/;

export const isValidKoreanName = (name) => {
  return KOREAN_NAME_REGEX.test(String(name || '').trim());
};

/**
 * Generates a nickname based on user info.
 * @param {Object} user 
 * @param {string} user.name
 * @param {string} user.city
 * @param {string} user.maritalStatus - 'married', 'single', or 'divorced'
 * @param {string} user.gender - '남' or '여'
 * @param {string|number} user.badge - Emoji or entry date string (e.g., '0829')
 */
export const generateNickname = ({ name, city, maritalStatus, gender, badge }) => {
  const ms = MARITAL_STATUS_MAP[maritalStatus] || maritalStatus;
  return `${name} ${city} ${ms} ${gender} ${badge}`;
};

/**
 * Suggests a nickname for a new member based on entry date.
 * @param {Object} user 
 * @param {Date} entryDate 
 */
export const suggestNewMemberNickname = (user, entryDate = new Date()) => {
  const month = String(entryDate.getMonth() + 1).padStart(2, '0');
  const day = String(entryDate.getDate()).padStart(2, '0');
  const entryBadge = `${month}${day}`;
  
  return generateNickname({ ...user, badge: entryBadge });
};

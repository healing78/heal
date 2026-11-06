import fs from 'fs';
import path from 'path';

const logPath = 'C:/Users/cntok/.gemini/antigravity-cli/brain/0859836e-35af-45ed-830a-f14357246a76/.user_uploaded/media_1793927761834_00014d21.log';
const rawLog = fs.readFileSync(logPath, 'utf-8');
const logLines = rawLog.split(/\r?\n/).filter((l) => l.trim().length > 0);

function parseNicknameTokens(rawNick) {
  let clean = rawNick.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, ' ');
  clean = clean.replace(/[\\\/.,]/g, ' ').trim();
  const parts = clean.split(/\s+/).filter(Boolean);

  if (parts.length === 0) return null;
  const name = parts[0];

  let city = null;
  let marital = null;
  let gender = null;

  for (let i = 1; i < parts.length; i++) {
    const p = parts[i];

    if (!marital) {
      if (['기', '기혼'].includes(p)) {
        marital = 'married';
        continue;
      }
      if (['미', '미혼'].includes(p)) {
        marital = 'single';
        continue;
      }
      if (['돌', '돌싱'].includes(p)) {
        marital = 'divorced';
        continue;
      }
    }

    if (!gender) {
      if (['남', 'M', 'm'].includes(p) || /^[남Mm]\d{4}$/.test(p)) {
        gender = '남';
        continue;
      }
      if (['여', 'W', 'w', 'F', 'f'].includes(p) || /^[여WwFf]\d{4}$/.test(p)) {
        gender = '여';
        continue;
      }
    }

    if (!city && !/^\d+$/.test(p) && p.length >= 1) {
      city = p;
    }
  }

  return { name, city, marital, gender };
}

function parseLogLine(line) {
  const commaIdx = line.lastIndexOf(',');
  if (commaIdx === -1) return null;

  const rawNick = line.slice(0, commaIdx).trim();
  const rawDate = line.slice(commaIdx + 1).trim();

  const dateMatch = rawDate.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
  let joinedAt = null;
  let entryBadge = null;
  if (dateMatch) {
    const yyyy = dateMatch[1];
    const mm = String(dateMatch[2]).padStart(2, '0');
    const dd = String(dateMatch[3]).padStart(2, '0');
    joinedAt = `${yyyy}-${mm}-${dd}`;
    entryBadge = `${mm}${dd}`;
  }

  const tokenInfo = parseNicknameTokens(rawNick);
  if (!tokenInfo) return null;

  return {
    rawNick,
    ...tokenInfo,
    joinedAt,
    entryBadge,
    rawDate
  };
}

// Map: name -> FIRST valid entry with city/marital/gender
const firstValidEntryMap = new Map();

for (const line of logLines) {
  const p = parseLogLine(line);
  if (!p) continue;

  if (!firstValidEntryMap.has(p.name)) {
    if (p.city || p.marital || p.gender) {
      firstValidEntryMap.set(p.name, { ...p });
    }
  } else {
    const existing = firstValidEntryMap.get(p.name);
    if (!existing.city && p.city) existing.city = p.city;
    if (!existing.marital && p.marital) existing.marital = p.marital;
    if (!existing.gender && p.gender) existing.gender = p.gender;
  }
}

// Single-identity Aliases (1 person with slight nickname variation)
const ALIASES = {
  '쭈': '쭈우',
  '손오공': '손오공',
  '오공': '손오공',
  '시리': '시리',
  '윤모모': '모모',
  '연이': '연',
  '생귤': '귤'
};

// Explicit Distinct Profiles for Disambiguated Members (Different People!)
const EXPLICIT_DISTINCT_MEMBERS = {
  '경광초코': {
    city: '광주',
    homeCity: '광주',
    maritalStatus: 'single',
    gender: '남',
    joinedAt: '2025-09-08',
    entryBadge: '0908'
  },
  '오산하늘': {
    city: '오산',
    homeCity: '오산',
    maritalStatus: 'married',
    gender: '여',
    joinedAt: '2024-11-14',
    entryBadge: '1114'
  },
  '강동보리': {
    city: '강동',
    homeCity: '강동',
    maritalStatus: 'married',
    gender: '여',
    joinedAt: '2024-11-04',
    entryBadge: '1104'
  },
  '보리': {
    city: '청주',
    homeCity: '청주',
    maritalStatus: 'divorced',
    gender: '여',
    joinedAt: '2026-01-24',
    entryBadge: '0124'
  },
  '다온': {
    city: '전주',
    homeCity: '전주',
    maritalStatus: 'divorced',
    gender: '여',
    joinedAt: '2025-05-18',
    entryBadge: '0518'
  },
  '도도': {
    city: '강남',
    homeCity: '강남',
    maritalStatus: 'single',
    gender: '여',
    joinedAt: '2025-04-01',
    entryBadge: '0401'
  },
  '겨울': {
    city: '강북',
    homeCity: '강북',
    maritalStatus: 'divorced',
    gender: '여',
    joinedAt: '2025-09-17',
    entryBadge: '0917'
  },
  '성민': {
    city: '광주',
    homeCity: '광주',
    maritalStatus: 'married',
    gender: '남',
    joinedAt: '2024-09-01',
    entryBadge: '0901'
  },
  '애플': {
    city: '광진',
    homeCity: '광진',
    maritalStatus: 'single',
    gender: '여',
    joinedAt: '2025-03-21',
    entryBadge: '0321'
  },
  '우리': {
    city: '수원',
    homeCity: '수원',
    maritalStatus: 'married',
    gender: '남',
    joinedAt: '2026-07-04',
    entryBadge: '0704'
  },
  '제니': {
    city: '부산',
    homeCity: '부산',
    maritalStatus: 'married',
    gender: '여',
    joinedAt: '2025-09-23',
    entryBadge: '0923'
  },
  '현이': {
    city: '의정부',
    homeCity: '의정부',
    maritalStatus: 'married',
    gender: '남',
    joinedAt: '2025-06-12',
    entryBadge: '0612'
  },
  '하늘': {
    city: '천안',
    homeCity: '천안',
    maritalStatus: 'divorced',
    gender: '여',
    joinedAt: '2024-07-23',
    entryBadge: '0723'
  },
  '춘천뚠뚠': {
    city: '춘천',
    homeCity: '춘천',
    maritalStatus: 'single',
    gender: '남',
    joinedAt: '2024-01-26',
    entryBadge: '0126'
  },
  '뚠뚠': {
    city: '시흥',
    homeCity: '시흥',
    maritalStatus: 'divorced',
    gender: '남',
    joinedAt: '2025-04-24',
    entryBadge: '0424'
  },
  '정선곰탱': {
    city: '태백',
    homeCity: '태백',
    maritalStatus: 'married',
    gender: '남',
    joinedAt: '2024-03-27',
    entryBadge: '0327'
  },
  '곰탱': {
    city: '광주',
    homeCity: '광주',
    maritalStatus: 'married',
    gender: '여',
    joinedAt: '2026-06-10',
    entryBadge: '0610'
  },
  '수원미미': {
    city: '수원',
    homeCity: '수원',
    maritalStatus: 'married',
    gender: '여',
    joinedAt: '2024-03-09',
    entryBadge: '0309'
  },
  '미미': {
    city: '안양',
    homeCity: '안양',
    maritalStatus: 'divorced',
    gender: '여',
    joinedAt: '2025-09-11',
    entryBadge: '0911'
  },
  '오산가을': {
    city: '오산',
    homeCity: '오산',
    maritalStatus: 'single',
    gender: '남',
    joinedAt: '2024-02-23',
    entryBadge: '0223'
  },
  '가을': {
    city: '시흥',
    homeCity: '시흥',
    maritalStatus: 'married',
    gender: '남',
    joinedAt: '2025-11-08',
    entryBadge: '1108'
  },
  '아산가을': {
    city: '아산',
    homeCity: '아산',
    maritalStatus: 'divorced',
    gender: '여',
    joinedAt: '2025-08-20',
    entryBadge: '0820'
  },
  '안양초롱': {
    city: '안양',
    homeCity: '안양',
    maritalStatus: 'married',
    gender: '여',
    joinedAt: '2024-06-05',
    entryBadge: '0605'
  },
  '초롱': {
    city: '양천',
    homeCity: '양천',
    maritalStatus: 'married',
    gender: '여',
    joinedAt: '2024-01-27',
    entryBadge: '0127'
  }
};

// 1. Update src/core/initialData.js
const initialDataPath = path.resolve('src/core/initialData.js');
let initialDataContent = fs.readFileSync(initialDataPath, 'utf-8');

const membersRegex = /export const INITIAL_MEMBERS = (\[[\s\S]*?\n\];)/;
const match = initialDataContent.match(membersRegex);
if (!match) {
  console.error('INITIAL_MEMBERS not found in initialData.js');
  process.exit(1);
}

const members = eval(match[1].replace(/;\s*$/, ''));
let enrichedCount = 0;

const enrichedMembers = members.map((m) => {
  // 1) Explicit distinct member separation (e.g. 경광초코, 오산하늘, 강동보리, 보리, 하늘, etc.)
  if (EXPLICIT_DISTINCT_MEMBERS[m.realName]) {
    enrichedCount++;
    const distinct = EXPLICIT_DISTINCT_MEMBERS[m.realName];
    return {
      ...m,
      city: distinct.city,
      homeCity: distinct.homeCity,
      maritalStatus: distinct.maritalStatus,
      gender: distinct.gender,
      joinedAt: distinct.joinedAt,
      entryBadge: distinct.entryBadge
    };
  }

  // 2) 게더 special case
  if (m.realName === '게더') {
    return {
      ...m,
      city: '마포',
      homeCity: '마포',
      maritalStatus: 'single',
      gender: '남',
      joinedAt: '2024-08-14',
      entryBadge: '0814'
    };
  }

  // 3) General entrance log matching
  const queryName = ALIASES[m.realName] || m.realName;
  const entry = firstValidEntryMap.get(queryName);

  if (entry) {
    enrichedCount++;
    return {
      ...m,
      city: entry.city || m.city,
      homeCity: entry.city || m.homeCity,
      maritalStatus: entry.marital || m.maritalStatus,
      gender: entry.gender || m.gender,
      joinedAt: entry.joinedAt || m.joinedAt,
      entryBadge: entry.entryBadge || m.entryBadge
    };
  }
  return m;
});

console.log(`Enriched ${enrichedCount} of ${members.length} members.`);

const updatedMembersBlock = `export const INITIAL_MEMBERS = ${JSON.stringify(enrichedMembers, null, 2)};`;
initialDataContent = initialDataContent.replace(membersRegex, updatedMembersBlock);
fs.writeFileSync(initialDataPath, initialDataContent, 'utf-8');
console.log('✅ Updated src/core/initialData.js');

// 2. Update scripts/data/full_bung_data.json
const fullBungDataPath = path.resolve('scripts/data/full_bung_data.json');
if (fs.existsSync(fullBungDataPath)) {
  const fullBungData = JSON.parse(fs.readFileSync(fullBungDataPath, 'utf-8'));
  fullBungData.members = enrichedMembers;
  fullBungData.enrichedFromLogAt = new Date().toISOString();
  fs.writeFileSync(fullBungDataPath, JSON.stringify(fullBungData, null, 2), 'utf-8');
  console.log('✅ Updated scripts/data/full_bung_data.json');
}

console.log('\n--- Specific Disambiguated Check ---');
for (const checkName of ['경광초코', '오산하늘', '하늘', '강동보리', '보리']) {
  const mem = enrichedMembers.find(m => m.realName === checkName);
  console.log(`${checkName}: city=${mem?.city}, marital=${mem?.maritalStatus}, gender=${mem?.gender}, joinedAt=${mem?.joinedAt}, badge=${mem?.entryBadge}`);
}

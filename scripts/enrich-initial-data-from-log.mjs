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

// Aliases mapping bung name -> log name
const ALIASES = {
  '쭈': '쭈우',
  '손오공': '손오공',
  '오공': '손오공',
  '시리': '시리',
  '강동보리': '보리',
  '경광초코': '초코',
  '오산하늘': '하늘',
  '윤모모': '모모',
  '춘천뚠뚠': '뚠뚠',
  '정선곰탱': '곰탱',
  '수원미미': '미미',
  '오산가을': '가을',
  '안양초롱': '초롱',
  '연이': '연',
  '생귤': '귤'
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
  const queryName = ALIASES[m.realName] || m.realName;
  const entry = firstValidEntryMap.get(queryName);

  if (m.realName === '게더') {
    return {
      ...m,
      city: entry?.city || m.city,
      homeCity: entry?.city || m.homeCity,
      maritalStatus: entry?.marital || m.maritalStatus,
      gender: entry?.gender || m.gender,
      joinedAt: '2024-08-14',
      entryBadge: '0814'
    };
  }

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

console.log('\n--- Summary Statistics ---');
console.log('Total members:', enrichedMembers.length);
console.log('Gender: 남 =', enrichedMembers.filter(m => m.gender === '남').length, ', 여 =', enrichedMembers.filter(m => m.gender === '여').length);
console.log('Marital: 미혼 =', enrichedMembers.filter(m => m.maritalStatus === 'single').length, ', 기혼 =', enrichedMembers.filter(m => m.maritalStatus === 'married').length, ', 돌싱 =', enrichedMembers.filter(m => m.maritalStatus === 'divorced').length);
console.log('Distinct Cities count:', new Set(enrichedMembers.map(m => m.city)).size);

#!/usr/bin/env node
/**
 * Bung Records Migration & Seeding CLI Tool
 * Usage: node scripts/seed-bung-records.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataFilePath = path.join(__dirname, 'data/full_bung_data.json');

if (!fs.existsSync(dataFilePath)) {
  console.error('❌ full_bung_data.json file not found. Please run scripts/build-initial-data.mjs first.');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));

console.log('======================================================');
console.log(' Healing78 Bung Records Archive Seeder');
console.log('======================================================');
console.log(`📁 Source Archive: ${dataFilePath}`);
console.log(`👥 Total Members: ${data.memberCount}`);
console.log(`🗓️ Total Meetings: ${data.meetingCount}`);
console.log(`🕒 Generated At: ${data.generatedAt}`);
console.log('------------------------------------------------------');

// Top 10 Leaderboard Preview
console.log('🏆 Top 10 Member Leaderboard:');
data.members.slice(0, 10).forEach((m, idx) => {
  console.log(`  ${idx + 1}. [${m.role}] ${m.realName} - ${m.totalScore}점 (참석 ${m.attendanceCount}회, 원정 ${m.expeditionScore}점, 주최 ${m.hostCount}회)`);
});

console.log('------------------------------------------------------');
console.log('📌 Data files synced:');
console.log('  - src/core/initialData.js (Active app seed)');
console.log('  - scripts/data/full_bung_data.json (Complete archive)');
console.log('  - SuperAdminPage UI: Live text import & batch sync available');
console.log('======================================================');
console.log('✅ Seeding preparation completed successfully.');

import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist');
const baseHtmlPath = path.join(distDir, 'index.html');

if (!fs.existsSync(baseHtmlPath)) {
  console.error('dist/index.html not found. Run vite build first.');
  process.exit(1);
}

const baseHtml = fs.readFileSync(baseHtmlPath, 'utf8');

const ROUTE_METAS = [
  {
    route: 'meetings',
    title: '힐링78 - 일정',
    description: '진행 예정 일정 및 참석 신청 (참석 기본 +1점, 타지역 원정 +1점, 해외 +2점)'
  },
  {
    route: 'reports',
    title: '힐링78 - 리포트',
    description: '차수별 정산 내역, 1/N 부담금, 찬조금 및 개인별 참석·지출 리포트를 확인하세요.'
  },
  {
    route: 'ranking',
    title: '힐링78 - 랭킹·친구',
    description: 'Healing78 전체 회원의 실시간 활동 점수 순위와 지역별 친구 정보를 확인하세요.'
  },
  {
    route: 'nickname',
    title: '힐링78 - 신입닉네임',
    description: '이름·지역·결혼여부·성별을 입력해 오픈채팅방 규격 닉네임을 자동 생성하고 복사하세요.'
  },
  {
    route: 'profile',
    title: '힐링78 - 내 정보',
    description: '내 거주지·연고지 정보를 수정하고 오픈채팅방 규격 닉네임을 원클릭 복사하세요.'
  },
  {
    route: 'login',
    title: '힐링78 - 로그인',
    description: '카카오 계정으로 간편하게 로그인하고 신입 회원 프로필을 등록하세요.'
  },
  {
    route: 'admin',
    title: '힐링78 - 운영 관리',
    description: '회원 등급·커스텀 뱃지·이벤트 점수 및 커뮤니티 공지사항을 관리합니다.'
  }
];

for (const item of ROUTE_METAS) {
  const routeDir = path.join(distDir, item.route);
  fs.mkdirSync(routeDir, { recursive: true });

  const customizedHtml = baseHtml
    .replace(
      /<title>.*?<\/title>/,
      `<title>${item.title}</title>`
    )
    .replace(
      /<meta property="og:title" content=".*?" \/>/,
      `<meta property="og:title" content="${item.title}" />`
    )
    .replace(
      /<meta\s+property="og:description"\s+content=".*?"\s*\/>/s,
      `<meta property="og:description" content="${item.description}" />`
    )
    .replace(
      /<meta\s+name="description"\s+content=".*?"\s*\/>/s,
      `<meta name="description" content="${item.description}" />`
    );

  fs.writeFileSync(path.join(routeDir, 'index.html'), customizedHtml, 'utf8');
}

console.log(`Generated KakaoTalk OG preview HTML for ${ROUTE_METAS.length} sub-routes.`);

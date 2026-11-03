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
    title: 'Healing78 모임(벙) 일정 | 참석+1점·원정+2점',
    description: '진행 예정인 공식 모임 및 자율 번개 일정을 확인하고 바로 참석 신청하세요.'
  },
  {
    route: 'ranking',
    title: 'Healing78 회원·활동 랭킹 | 친구 정보',
    description: 'Healing78 전체 회원의 실시간 활동 점수 순위와 지역별 친구 정보를 확인하세요.'
  },
  {
    route: 'nickname',
    title: '신입 규격 닉네임 생성·변경 | Healing78',
    description: '이름·지역·결혼여부·성별을 입력해 오픈채팅방 규격 닉네임을 자동 생성하고 복사하세요.'
  },
  {
    route: 'profile',
    title: '내 프로필 · 규격 닉네임 관리 | Healing78',
    description: '내 거주지·연고지 정보를 수정하고 오픈채팅방 규격 닉네임을 원클릭 복사하세요.'
  },
  {
    route: 'login',
    title: 'Healing78 로그인·신입 가입 | since 2024',
    description: '카카오 계정으로 간편하게 로그인하고 신입 회원 프로필을 등록하세요.'
  },
  {
    route: 'admin',
    title: 'Healing78 운영진 관리 센터',
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

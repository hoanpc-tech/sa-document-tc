/**
 * split_timeline.js
 * Tách SA_TIMELINE_PRS.html thành 4 file page độc lập
 * trong folder SA_TIMELINE_PRS/ theo cấu trúc SA_3LAYERS_PRS
 */

const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'SA_TIMELINE_PRS.html');
const OUT = path.join(__dirname, 'SA_TIMELINE_PRS');
const ASSET_LOGO = '../../assets/LOGO-TRUNGCHINH.png';
const HOME_LINK  = '../../index.html';
const LAYERS_LINK = '../../SA_3LAYERS_PRS/01_overview/index.html';

// ── Cấu hình từng page ────────────────────────────────────────────────────────
const PAGES = [
  { slug: '01_timeline',  label: '01 Timeline',     title: 'Timeline Gantt — CĐS Trung Chính' },
  { slug: '02_hop_dong',  label: '02 Hợp đồng',     title: 'Tracker Hợp Đồng — CĐS Trung Chính' },
  { slug: '03_ngan_sach', label: '03 Ngân sách',    title: 'Ngân Sách CĐS — Trung Chính' },
  { slug: '04_server',    label: '04 Server',        title: 'Hạ Tầng Server — Trung Chính' },
];

// ── Đọc file gốc ──────────────────────────────────────────────────────────────
const src = fs.readFileSync(SRC, 'utf8');

// ── Trích xuất <style> từ <head> ──────────────────────────────────────────────
const styleMatch = src.match(/<style>([\s\S]*?)<\/style>/);
const sharedCSS  = styleMatch ? styleMatch[1] : '';

// ── Trích xuất từng slide content ─────────────────────────────────────────────
// Slide blocks đều nằm trong div.slide (active hoặc không)
// Dùng regex để bóc from <!-- SLIDE n --> đến trước <!-- SLIDE n+1 --> hoặc <!-- NAVIGATION -->
const slideMarkers = [
  '<!-- ════════════════ SLIDE 1',
  '<!-- ════════════════ SLIDE 2',
  '<!-- ════════════════ SLIDE 3',
  '<!-- ════════════════ SLIDE 4',
  '<!-- NAVIGATION -->',
];

function extractBetween(text, startStr, endStr) {
  const s = text.indexOf(startStr);
  const e = endStr ? text.indexOf(endStr, s) : text.length;
  if (s === -1) return '';
  return text.slice(s, e === -1 ? undefined : e).trim();
}

const slideContents = [];
for (let i = 0; i < 4; i++) {
  const raw = extractBetween(src, slideMarkers[i], slideMarkers[i + 1]);
  // Xóa div.slide wrapper và chỉ lấy nội dung bên trong div.pw
  // Ta lấy toàn bộ raw nhưng bổ sung bỏ class slide active → class chỉ là block
  // Thực ra ta lấy toàn bộ inner content của div.slide > div.pw
  const pwMatch = raw.match(/<div class="pw">([\s\S]*?)<\/div>\s*\n?\s*<\/div>\s*$/);
  slideContents.push(pwMatch ? pwMatch[1].trim() : raw);
}

// ── Build nav bar ──────────────────────────────────────────────────────────────
function buildNav(activeIdx) {
  const prevIdx = activeIdx === 0 ? 3 : activeIdx - 1;
  const nextIdx = activeIdx === 3 ? 0 : activeIdx + 1;
  const prevSlug = PAGES[prevIdx].slug;
  const nextSlug = PAGES[nextIdx].slug;

  const btnLinks = PAGES.map((p, i) => {
    const isActive = i === activeIdx;
    return `    <a href="../${p.slug}/index.html" class="nav-link${isActive ? ' active' : ''}">${p.label}</a>`;
  }).join('\n');

  return `
<nav>
  <a href="../${prevSlug}/index.html" class="nav-arr-link">←</a>
${btnLinks}
  <a href="../${nextSlug}/index.html" class="nav-arr-link">→</a>
</nav>`;
}

// ── Build nav CSS (giống SA_3LAYERS_PRS) ─────────────────────────────────────
const navCSS = `
    /* PAGE NAV */
    nav {
      position: fixed;
      bottom: 22px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 4px;
      background: #fff;
      border: 1px solid #BDD9EF;
      border-radius: 50px;
      padding: 7px 14px;
      box-shadow: 0 4px 28px rgba(0,87,168,.20);
      z-index: 300;
    }
    nav a.nav-link {
      background: none;
      border: none;
      color: var(--gray-txt);
      font-size: 11px;
      cursor: pointer;
      padding: 6px 14px;
      border-radius: 30px;
      font-family: inherit;
      font-weight: 600;
      transition: .2s;
      white-space: nowrap;
      text-decoration: none;
    }
    nav a.nav-link.active,
    nav a.nav-link:hover {
      background: var(--grad-hero);
      color: #fff;
      font-weight: 700;
    }
    nav a.nav-arr-link {
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: 1px solid #BDD9EF;
      color: var(--b-main);
      font-size: 14px;
      cursor: pointer;
      padding: 4px 11px;
      border-radius: 50%;
      transition: .2s;
      text-decoration: none;
    }
    nav a.nav-arr-link:hover { background: var(--b-sky); }

    /* Fix slide padding for multi-page (no bottom scroll needed for nav) */
    .page-body { max-width: 1360px; margin: 0 auto; padding: 28px 28px 110px; }
`;

// ── Build HTML cho từng page ──────────────────────────────────────────────────
function buildPage(pageIdx) {
  const page = PAGES[pageIdx];
  const content = slideContents[pageIdx];
  const nav = buildNav(pageIdx);

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${page.title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
${sharedCSS}
${navCSS}
  </style>
</head>
<body>

  <!-- TOPBAR -->
  <div class="topbar">
    <div class="topbar-inner">
      <img src="${ASSET_LOGO}" alt="Trung Chính" class="topbar-logo">
      <div class="topbar-brand">
        <div class="sub">Timeline &amp; Ngân sách · CĐS 2025–2027</div>
        <div class="name">KẾ HOẠCH TRIỂN KHAI - NGÂN SÁCH — HẠ TẦNG MÁY CHỦ SERVER</div>
      </div>
      <div class="topbar-right">
        <a href="${LAYERS_LINK}" class="topbar-back">← Kiến trúc 3 Tầng</a>
        <a href="${HOME_LINK}" class="topbar-back">🏠 Trang chủ</a>
      </div>
    </div>
  </div>

  <div class="page-body">
${content}
  </div>

${nav}

</body>
</html>`;
}

// ── Tạo thư mục và ghi file ───────────────────────────────────────────────────
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

for (let i = 0; i < 4; i++) {
  const dir = path.join(OUT, PAGES[i].slug);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const html = buildPage(i);
  const outFile = path.join(dir, 'index.html');
  fs.writeFileSync(outFile, html, 'utf8');
  console.log(`✅ Written: ${PAGES[i].slug}/index.html (${html.length} chars)`);
}

console.log('\n🎉 Done! SA_TIMELINE_PRS/ created with 4 pages.');

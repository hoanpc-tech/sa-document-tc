const fs = require('fs');
const path = require('path');

const srcFile = '_ARCHIVE_SA_3TIER_PRS.html';
const outDir = 'SA_3LAYERS_PRS';
const folders = ['01_overview', '02_application_layer', '03_data_layer', '04_operations_layer', '05_core_values'];
const labels = ['01 Tổng quan 3 Tầng', '02 Tầng 3 · Ứng dụng', '03 Tầng 2 · Dữ liệu', '04 Tầng 1 · Quản trị', '05 Giá trị'];

const htmlRaw = fs.readFileSync(srcFile, 'utf8');
const lines = htmlRaw.split('\n');
const total = lines.length;

// Line numbers (1-indexed) pinpointed above
// head: lines 1-1051
// topbar: lines 1055-1067
// slide1: lines 1069-1511
// slide2: lines 1511-1721
// slide3: lines 1721-1841
// slide4: lines 1841-1978
// slide5: lines 1978-2086
// nav starts: 2087

const head    = lines.slice(0, 1051).join('\n');   // <!DOCTYPE> ... </head>
const topbar  = lines.slice(1054, 1068).join('\n'); // topbar block
const slides  = [
  lines.slice(1068, 1511).join('\n'),  // slide 1
  lines.slice(1510, 1721).join('\n'),  // slide 2
  lines.slice(1720, 1841).join('\n'),  // slide 3
  lines.slice(1840, 1978).join('\n'),  // slide 4
  lines.slice(1977, 2087).join('\n'),  // slide 5
];

// Normalize slide divs so all use class="slide active" regardless of original
const NAV_EXTRA_CSS = `
    /* Navigation link styles */
    nav a {
      text-decoration: none;
      display: inline-block;
    }
    nav a.nav-link {
      color: var(--gray-txt);
      font-size: 11px;
      cursor: pointer;
      padding: 6px 14px;
      border-radius: 30px;
      font-family: 'Be Vietnam Pro', sans-serif;
      font-weight: 600;
      transition: .2s;
      white-space: nowrap;
    }
    nav a.nav-link.active,
    nav a.nav-link:hover {
      background: var(--grad-hero);
      color: #fff;
      font-weight: 700;
    }
    nav a.nav-arr-link {
      background: none;
      border: 1px solid #BDD9EF;
      color: var(--b-main);
      font-size: 14px;
      cursor: pointer;
      padding: 4px 11px;
      border-radius: 50%;
      transition: .2s;
      font-family: 'Be Vietnam Pro', sans-serif;
    }
    nav a.nav-arr-link:hover {
      background: var(--b-sky);
    }
    /* Force slide to show since no JS toggle */
    .slide {
      display: block !important;
      min-height: calc(100vh - 58px);
      padding: 28px 28px 110px;
    }
`;

function buildNav(activeIndex) {
  const prev = activeIndex === 0 ? 4 : activeIndex - 1;
  const next = activeIndex === 4 ? 0 : activeIndex + 1;
  let links = '';
  for (let i = 0; i < 5; i++) {
    const cls = i === activeIndex ? 'nav-link active' : 'nav-link';
    links += `    <a href="../${folders[i]}/index.html" class="${cls}">${labels[i]}</a>\n`;
  }
  return `
  <!-- NAVIGATION -->
  <nav>
    <a href="../${folders[prev]}/index.html" class="nav-arr-link">❮</a>
${links}    <a href="../${folders[next]}/index.html" class="nav-arr-link">❯</a>
  </nav>`;
}

// Inject nav CSS into head (before </style>)
const modHead = head.replace('</style>', NAV_EXTRA_CSS + '\n  </style>');

// Fix topbar: back-link 2 levels up, logo path 2 levels up too
const modTopbar = topbar
  .replace('href="index.html"', 'href="../../index.html"')
  .replace('src="../00_DOCS/', 'src="../../00_DOCS/');

// Create output dirs and write files
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

for (let i = 0; i < 5; i++) {
  const dir = path.join(outDir, folders[i]);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // Normalize the slide html: remove active/inactive class variation
  let slideHtml = slides[i]
    .replace(/class="slide active"/g, 'class="slide"')
    .replace(/class="slide"/g, 'class="slide"');  // keep as-is after normalize

  const page = `${modHead}
<body>
${modTopbar}

${slideHtml}
${buildNav(i)}

</body>
</html>`;

  const outPath = path.join(dir, 'index.html');
  fs.writeFileSync(outPath, page, 'utf8');
  console.log(`✓ ${outPath}`);
}

console.log('\n✅ Done! Split into 5 pages under SA_3LAYERS_PRS/');

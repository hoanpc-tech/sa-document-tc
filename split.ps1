$html = Get-Content -Raw -Encoding UTF8 "SA_3TIER_PRS.html"

# Extract TOP part (head + topbar)
$headRegex = '(?s)(<!DOCTYPE html>.*?</head>)\s*<body>\s*(<!-- TOPBAR -->.*?</div>\s*</div>\s*</div>)'
if ($html -match $headRegex) {
    $head = $matches[1]
    $topbar = $matches[2]
} else {
    Write-Host "Could not find head/topbar"
    exit 1
}

$slides = @()
for ($i=1; $i -le 5; $i++) {
    $next = $i + 1
    if ($i -eq 5) {
        $pattern = "(?s)(<!-- [^<]*?SLIDE 5:[^<]*?-->\s*<div class=`"slide[^>]*id=`"slide-5`".*?)(?=<!-- NAVIGATION -->)"
    } else {
        $pattern = "(?s)(<!-- [^<]*?SLIDE ${i}:[^<]*?-->\s*<div class=`"slide[^>]*id=`"slide-${i}`".*?)(?=<!-- [^<]*?SLIDE ${next}:)"
    }
    if ($html -match $pattern) {
        $slides += $matches[1]
    } else {
        Write-Host "Could not find slide $i"
    }
}

if ($slides.Count -ne 5) {
    Write-Host "Error parsing slides! Count is " $slides.Count
    exit 1
}

$folders = @('01_overview', '02_application_layer', '03_data_layer', '04_operations_layer', '05_core_values')

$outDir = "SA_3LAYERS_PRS"
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }

for ($i=0; $i -lt 5; $i++) {
    $targetDir = Join-Path $outDir $folders[$i]
    if (-not (Test-Path $targetDir)) { New-Item -ItemType Directory -Path $targetDir | Out-Null }
    
    $act1 = if ($i -eq 0) {"active"} else {""}
    $act2 = if ($i -eq 1) {"active"} else {""}
    $act3 = if ($i -eq 2) {"active"} else {""}
    $act4 = if ($i -eq 3) {"active"} else {""}
    $act5 = if ($i -eq 4) {"active"} else {""}
    
    $prevIndex = if ($i -eq 0) {4} else {$i - 1}
    $nextIndex = if ($i -eq 4) {0} else {$i + 1}
    
    $prevHref = "../" + $folders[$prevIndex] + "/index.html"
    $nextHref = "../" + $folders[$nextIndex] + "/index.html"
    
    $nav = @"
  <!-- NAVIGATION -->
  <nav style="display:flex; justify-content:center; align-items:center; gap: 4px; padding: 7px 14px; background:#fff; border-radius:50px; border:1px solid #BDD9EF; position:fixed; bottom:22px; left:50%; transform:translateX(-50%); z-index:999; box-shadow:0 4px 12px rgba(36,61,92,0.1);">
    <a href="`$prevHref" class="nav-arr nav-a" style="text-decoration:none;"> ❮ </a>
    <a href="../01_overview/index.html" class="nav-btn nav-a `$act1" style="text-decoration:none;">01 Tổng quan 3 Tầng</a>
    <a href="../02_application_layer/index.html" class="nav-btn nav-a `$act2" style="text-decoration:none;">02 Tầng 3 · Ứng dụng</a>
    <a href="../03_data_layer/index.html" class="nav-btn nav-a `$act3" style="text-decoration:none;">03 Tầng 2 · Dữ liệu</a>
    <a href="../04_operations_layer/index.html" class="nav-btn nav-a `$act4" style="text-decoration:none;">04 Tầng 1 · Quản trị</a>
    <a href="../05_core_values/index.html" class="nav-btn nav-a `$act5" style="text-decoration:none;">05 Giá trị</a>
    <a href="`$nextHref" class="nav-arr nav-a" style="text-decoration:none;"> ❯ </a>
  </nav>
"@

    $modHead = $head -replace '</style>', @"
    nav a.nav-btn {
      color: var(--gray-txt);
      font-size: 11px;
      padding: 6px 14px;
      border-radius: 30px;
      font-weight: 600;
      transition: .2s;
    }
    nav a.nav-btn.active, nav a.nav-btn:hover {
      background: var(--grad-hero);
      color: #fff;
      font-weight: 700;
    }
    nav a.nav-arr {
      border: 1px solid #BDD9EF;
      color: var(--b-main);
      font-size: 14px;
      padding: 4px 11px;
      border-radius: 50%;
      transition: .2s;
    }
    nav a.nav-arr:hover {
      background: var(--b-sky);
    }
    .slide { display: block !important; opacity: 1 !important; visibility: visible !important; position: static !important; }
  </style>
"@
    
    $modTopbar = $topbar -replace 'href="index\.html"', 'href="../../index.html"'
    $modTopbar = $modTopbar -replace 'src="\.\./00_DOCS/', 'src="../../../00_DOCS/'

    $slideData = $slides[$i]
    
    $fileContent = "$modHead`n<body>`n$modTopbar`n$slideData`n$nav`n</body>`n</html>"
    
    $outPath = Join-Path $targetDir "index.html"
    Set-Content -Path $outPath -Value $fileContent -Encoding UTF8
    Write-Host "Generated $outPath"
}
Write-Host "DONE split"

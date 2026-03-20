$ErrorActionPreference = "Stop"

function Escape-PdfText {
    param([string]$Text)
    $escaped = $Text.Replace("\", "\\")
    $escaped = $escaped.Replace("(", "\(")
    $escaped = $escaped.Replace(")", "\)")
    return $escaped
}

function Add-PdfLine {
    param(
        [System.Collections.Generic.List[string]]$Ops,
        [string]$Font,
        [int]$Size,
        [int]$Down,
        [string]$Text
    )
    $Ops.Add("0 -$Down Td")
    $Ops.Add("/$Font $Size Tf")
    $Ops.Add("(" + (Escape-PdfText -Text $Text) + ") Tj")
}

$outputDir = Join-Path (Get-Location) "output/pdf"
New-Item -ItemType Directory -Path $outputDir -Force | Out-Null

$outputPath = Join-Path $outputDir "vsm-store-app-summary.pdf"

$ops = New-Object 'System.Collections.Generic.List[string]'
$ops.Add("BT")
$ops.Add("/F2 16 Tf")
$ops.Add("50 760 Td")
$ops.Add("(" + (Escape-PdfText -Text "VSM Store - One-Page App Summary") + ") Tj")
$ops.Add("0 -18 Td")
$ops.Add("/F1 9 Tf")
$ops.Add("(" + (Escape-PdfText -Text "Evidence: README.md, package.json, src/main.tsx, src/App.tsx, src/hooks/useProducts.ts, src/services/products.service.ts, src/stores/cart.store.ts, src/lib/supabase.ts, .env.example, supabase/functions/.") + ") Tj")

Add-PdfLine -Ops $ops -Font "F2" -Size 12 -Down 22 -Text "What it is"
Add-PdfLine -Ops $ops -Font "F1" -Size 10 -Down 14 -Text "- VSM Store is a React + TypeScript PWA e-commerce app for Vape Store Mexico with a public storefront."
Add-PdfLine -Ops $ops -Font "F1" -Size 10 -Down 13 -Text "- The same SPA also includes a lazy-loaded admin panel routed under /admin."

Add-PdfLine -Ops $ops -Font "F2" -Size 12 -Down 18 -Text "Who it is for"
Add-PdfLine -Ops $ops -Font "F1" -Size 10 -Down 14 -Text "- Primary persona: retail customers in Mexico buying vape and 420 products online."
Add-PdfLine -Ops $ops -Font "F1" -Size 10 -Down 13 -Text "- Formal persona detail docs (age/segment profiles): Not found in repo."

Add-PdfLine -Ops $ops -Font "F2" -Size 12 -Down 18 -Text "What it does"
Add-PdfLine -Ops $ops -Font "F1" -Size 10 -Down 14 -Text "- Section-based catalog browsing for /vape and /420 with slug/category navigation."
Add-PdfLine -Ops $ops -Font "F1" -Size 10 -Down 13 -Text "- Live product discovery via /buscar and service-layer ilike search on name/description."
Add-PdfLine -Ops $ops -Font "F1" -Size 10 -Down 13 -Text "- Cart with local persistence (Zustand key vsm-cart) plus stock/price revalidation."
Add-PdfLine -Ops $ops -Font "F1" -Size 10 -Down 13 -Text "- Authenticated area: profile, addresses, order history/detail, loyalty, and notifications."
Add-PdfLine -Ops $ops -Font "F1" -Size 10 -Down 13 -Text "- Checkout and payment status routes (/checkout, /payment/success|failure|pending)."
Add-PdfLine -Ops $ops -Font "F1" -Size 10 -Down 13 -Text "- Admin console for products, orders, categories, brands, tags, customers, coupons, and settings."

Add-PdfLine -Ops $ops -Font "F2" -Size 12 -Down 18 -Text "How it works (repo-evidence architecture)"
Add-PdfLine -Ops $ops -Font "F1" -Size 10 -Down 14 -Text "- UI shell: React Router + lazy pages in src/App.tsx split storefront and /admin flows."
Add-PdfLine -Ops $ops -Font "F1" -Size 10 -Down 13 -Text "- Root providers in src/main.tsx: Theme, Auth, React Query, Helmet, Safety, ErrorBoundary."
Add-PdfLine -Ops $ops -Font "F1" -Size 10 -Down 13 -Text "- Data flow: components -> hooks (useProducts) -> services (getProducts) -> Supabase client."
Add-PdfLine -Ops $ops -Font "F1" -Size 10 -Down 13 -Text "- Supabase client reads VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from env."
Add-PdfLine -Ops $ops -Font "F1" -Size 10 -Down 13 -Text "- Services query tables such as products; React Query manages caching and stale times."
Add-PdfLine -Ops $ops -Font "F1" -Size 10 -Down 13 -Text "- State and platform: cart persisted in localStorage; /sw.js service worker adds PWA behavior."

Add-PdfLine -Ops $ops -Font "F2" -Size 12 -Down 18 -Text "How to run (minimal)"
Add-PdfLine -Ops $ops -Font "F1" -Size 10 -Down 14 -Text "1. Install dependencies: npm install"
Add-PdfLine -Ops $ops -Font "F1" -Size 10 -Down 13 -Text "2. Copy .env.example to .env and set VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY."
Add-PdfLine -Ops $ops -Font "F1" -Size 10 -Down 13 -Text "3. Apply SQL migrations from supabase/migrations in order (single command: Not found in repo)."
Add-PdfLine -Ops $ops -Font "F1" -Size 10 -Down 13 -Text "4. Start dev server: npm run dev (Vite default URL is http://localhost:5173)."

$ops.Add("ET")
$stream = ($ops -join "`n")
$streamLength = [System.Text.Encoding]::ASCII.GetByteCount($stream)

$obj1 = "1 0 obj`n<< /Type /Catalog /Pages 2 0 R >>`nendobj`n"
$obj2 = "2 0 obj`n<< /Type /Pages /Kids [3 0 R] /Count 1 >>`nendobj`n"
$obj3 = "3 0 obj`n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>`nendobj`n"
$obj4 = "4 0 obj`n<< /Length $streamLength >>`nstream`n$stream`nendstream`nendobj`n"
$obj5 = "5 0 obj`n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`nendobj`n"
$obj6 = "6 0 obj`n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>`nendobj`n"

$pdf = "%PDF-1.4`n"
$offsets = @()

foreach ($obj in @($obj1, $obj2, $obj3, $obj4, $obj5, $obj6)) {
    $offsets += [System.Text.Encoding]::ASCII.GetByteCount($pdf)
    $pdf += $obj
}

$xrefStart = [System.Text.Encoding]::ASCII.GetByteCount($pdf)
$xref = "xref`n0 7`n0000000000 65535 f `n"
foreach ($off in $offsets) {
    $xref += ("{0:D10} 00000 n `n" -f $off)
}

$trailer = "trailer`n<< /Size 7 /Root 1 0 R >>`nstartxref`n$xrefStart`n%%EOF`n"
$pdf += $xref + $trailer

[System.IO.File]::WriteAllBytes($outputPath, [System.Text.Encoding]::ASCII.GetBytes($pdf))
Write-Output $outputPath

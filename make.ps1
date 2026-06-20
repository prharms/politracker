param([string]$Target = "help")

# Runs an npm script, prints PASS/FAIL on one line, shows output only on failure.
# Uses a temp file redirect to avoid PowerShell pipeline buffering hangs on Windows.
function Invoke-Step {
    param([string]$Label, [string]$Script)
    Write-Host ("  {0}" -f $Label.PadRight(46)) -NoNewline
    $tmp = New-TemporaryFile
    npm run $Script *> $tmp.FullName
    $code = $LASTEXITCODE
    if ($code -eq 0) {
        Write-Host "PASS" -ForegroundColor Green
        Remove-Item $tmp.FullName -Force
        return $true
    }
    Write-Host "FAIL" -ForegroundColor Red
    Write-Host ""
    Get-Content $tmp.FullName |
        Where-Object { $_ -notmatch "^> politicket" -and $_ -notmatch "^npm warn" } |
        ForEach-Object { Write-Host "    $_" -ForegroundColor Yellow }
    Write-Host ""
    Remove-Item $tmp.FullName -Force
    return $false
}

function Write-Banner { param([string]$Title)
    Write-Host ""
    Write-Host "  $Title" -ForegroundColor Cyan
    Write-Host ("  " + "-" * 50)
}

function Write-Footer { param([int]$Failed)
    Write-Host ("  " + "-" * 50)
    if ($Failed -eq 0) {
        Write-Host "  All checks passed." -ForegroundColor Green
    } else {
        Write-Host ("  {0} check(s) failed." -f $Failed) -ForegroundColor Red
    }
    Write-Host ""
    if ($Failed -gt 0) { exit 1 }
}

switch ($Target) {
    "lint" {
        Write-Banner "POLITICKET - Lint Suite"
        $n = 0
        if (-not (Invoke-Step "Type check (main + renderer)" "lint:types")) { $n++ }
        if (-not (Invoke-Step "Architecture check" "arch-check")) { $n++ }
        if (-not (Invoke-Step "ESLint" "lint:eslint")) { $n++ }
        if (-not (Invoke-Step "Prettier" "lint:prettier")) { $n++ }
        Write-Footer $n
    }
    "ci" {
        Write-Banner "POLITICKET - CI (lint + test)"
        $n = 0
        if (-not (Invoke-Step "Type check (main + renderer)" "lint:types")) { $n++ }
        if (-not (Invoke-Step "Architecture check" "arch-check")) { $n++ }
        if (-not (Invoke-Step "ESLint" "lint:eslint")) { $n++ }
        if (-not (Invoke-Step "Prettier" "lint:prettier")) { $n++ }
        if (-not (Invoke-Step "Tests (with coverage)" "test")) { $n++ }
        Write-Footer $n
    }
    "test" {
        Write-Banner "POLITICKET - Test Suite"
        Write-Host ""
        npm run test
        if ($LASTEXITCODE -ne 0) { exit 1 }
    }
    "test-fast" {
        Write-Banner "POLITICKET - Test Suite (fast)"
        Write-Host ""
        npm run "test:fast"
        if ($LASTEXITCODE -ne 0) { exit 1 }
    }
    "arch-check"  { npm run "arch-check" }
    "type-check"  { npm run "type-check" }
    "format"      { npm run format }
    "test-e2e"    { npm run "test:e2e" }
    "test-all"    { npm run test; if ($LASTEXITCODE -eq 0) { npm run "test:e2e" } }
    "dev"         { npm run dev }
    "build"       { npm run build }
    "migration"   { npm run rebuild:node; npm run migration }
    "db-upgrade"  { npm run rebuild:node; npm run "db-upgrade" }
    "coverage"    { npx vitest run --coverage --reporter=html }
    "help" {
        Write-Host ""
        Write-Host "  POLITICKET - available targets" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "  dev          Start Electron in development mode (hot reload)"
        Write-Host "  build        Build and package the application"
        Write-Host "  ci           lint + tests in one pass (use before committing)"
        Write-Host "  lint         Lint only - tsc, arch-check, eslint, prettier"
        Write-Host "  arch-check   Hexagonal layer contract enforcement (tsc --build)"
        Write-Host "  type-check   tsc --noEmit only"
        Write-Host "  format       prettier --write + eslint --fix"
        Write-Host "  test         Vitest with coverage (80% threshold enforced)"
        Write-Host "  test-fast    Vitest without coverage"
        Write-Host "  test-e2e     Playwright end-to-end tests"
        Write-Host "  test-all     All test suites in sequence"
        Write-Host "  coverage     Generate HTML coverage report"
        Write-Host "  migration    Generate a new Drizzle migration"
        Write-Host "  db-upgrade   Apply pending Drizzle migrations"
        Write-Host ""
    }
    default {
        Write-Host "  Unknown target: $Target" -ForegroundColor Red
        Write-Host "  Run ./make.ps1 help for available targets."
        exit 1
    }
}

param([string]$target = "help")

switch ($target) {
    "test"        { npm run test }
    "test-fast"   { npm run "test:fast" }
    "test-e2e"    { npm run "test:e2e" }
    "test-all"    { npm run test; if ($LASTEXITCODE -eq 0) { npm run "test:e2e" } }
    "lint"        { npm run lint }
    "arch-check"  { npm run "arch-check" }
    "type-check"  { npm run "type-check" }
    "format"      { npm run format }
    "dev"         { npm run dev }
    "build"       { npm run build }
    "migration"   { npm run migration }
    "db-upgrade"  { npm run "db-upgrade" }
    "coverage"    { npx vitest run --coverage --reporter=html }
    "help" {
        Write-Host ""
        Write-Host "Politicket make targets:"
        Write-Host ""
        Write-Host "  dev          Start Electron in development mode (hot reload)"
        Write-Host "  build        Build and package the application"
        Write-Host "  test         Run Vitest with coverage (80% threshold enforced)"
        Write-Host "  test-fast    Run Vitest without coverage"
        Write-Host "  test-e2e     Run Playwright end-to-end tests"
        Write-Host "  test-all     Run all test suites in sequence"
        Write-Host "  lint         Run tsc + arch-check + eslint + prettier"
        Write-Host "  arch-check   Run tsc --build: enforce hexagonal layer contracts"
        Write-Host "  type-check   Run tsc --noEmit only"
        Write-Host "  format       Run prettier write + eslint fix"
        Write-Host "  coverage     Generate HTML coverage report"
        Write-Host "  migration    Generate a new Drizzle migration"
        Write-Host "  db-upgrade   Apply pending Drizzle migrations"
        Write-Host ""
    }
    default {
        Write-Host "Unknown target: $target"
        Write-Host "Run ./make.ps1 help for available targets."
        exit 1
    }
}

$ErrorActionPreference = "Stop"
$root    = "C:\Users\devpa\.vscode\HRM"
$client  = "$root\client"
$api     = "$root\API\API.csproj"
$out     = "C:\inetpub\wwwroot\HRM"
$appPool = "HRM"

Write-Host "=== STEP 1: npm install + build client ===" -ForegroundColor Cyan
Set-Location $client
npm install
if ($LASTEXITCODE -ne 0) { Write-Host "Client build FAILED" -ForegroundColor Red; exit 1 }
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "Client build FAILED" -ForegroundColor Red; exit 1 }

Write-Host "=== STEP 2: stop app pool (release file locks) ===" -ForegroundColor Cyan
Import-Module WebAdministration -ErrorAction SilentlyContinue
$poolExists = Test-Path "IIS:\AppPools\$appPool"
if ($poolExists) {
    Stop-WebAppPool -Name $appPool -ErrorAction SilentlyContinue
    $timeout = [Diagnostics.Stopwatch]::StartNew()
    while ((Get-WebAppPoolState -Name $appPool).Value -ne "Stopped" -and $timeout.Elapsed.TotalSeconds -lt 30) {
        Start-Sleep -Milliseconds 500
    }
} else {
    Write-Host "App pool '$appPool' not found, skipping stop (first-time deploy?)" -ForegroundColor Yellow
}

Write-Host "=== STEP 3: dotnet publish ===" -ForegroundColor Cyan
Set-Location $root
try {
    dotnet publish $api -c Release -o $out
    if ($LASTEXITCODE -ne 0) { throw "dotnet publish exited with code $LASTEXITCODE" }
} finally {
    if ($poolExists) {
        Write-Host "=== STEP 4: start app pool ===" -ForegroundColor Cyan
        Start-WebAppPool -Name $appPool -ErrorAction SilentlyContinue
    }
}

Write-Host "=== DONE! Output: $out ===" -ForegroundColor Green

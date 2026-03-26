# Run this as Administrator
# ============================

Import-Module WebAdministration

$appPoolName = "MyHrmPool"
$siteName = "MyHrmApp"
$physicalPath = "C:\inetpub\wwwroot\MyHrmApp"
$hostName = "myhrm.local"
$port = 80

# Create App Pool if it doesn't exist
if (-not (Test-Path IIS:\AppPools\$appPoolName)) {
    Write-Host "Creating App Pool: $appPoolName" -ForegroundColor Green
    New-Item IIS:\AppPools\$appPoolName -Force
    Set-ItemProperty IIS:\AppPools\$appPoolName -Name "managedRuntimeVersion" -Value ""   # No Managed Code for .NET Core
    Set-ItemProperty IIS:\AppPools\$appPoolName -Name "startMode" -Value "AlwaysRunning"
} else {
    Write-Host "App Pool $appPoolName already exists" -ForegroundColor Yellow
}

# Create Site if it doesn't exist
if (-not (Test-Path IIS:\Sites\$siteName)) {
    Write-Host "Creating IIS Site: $siteName" -ForegroundColor Green
    $bindingInfo = "*:${port}:${hostName}"
    New-Item IIS:\Sites\$siteName `
        -bindings @{protocol="http"; bindingInformation=$bindingInfo} `
        -physicalPath $physicalPath `
        -Force
    Set-ItemProperty IIS:\Sites\$siteName -Name applicationPool -Value $appPoolName
} else {
    Write-Host "Site $siteName already exists" -ForegroundColor Yellow
}

# Set permissions for IIS_IUSRS
Write-Host "Setting folder permissions..." -ForegroundColor Green
icacls $physicalPath /grant "IIS_IUSRS:(OI)(CI)RX" /T /C /Q

# Create logs folder if it doesn't exist
$logsPath = "$physicalPath\logs"
if (-not (Test-Path $logsPath)) {
    New-Item -ItemType Directory -Path $logsPath -Force | Out-Null
    icacls $logsPath /grant "IIS_IUSRS:(OI)(CI)F" /T /C /Q
}

# Add hosts entry
Write-Host "Adding hosts entry: $hostName" -ForegroundColor Green
$hostsFile = "C:\Windows\System32\drivers\etc\hosts"
$hostEntry = "127.0.0.1       $hostName"
if (-not (Select-String -Path $hostsFile -Pattern $hostName -ErrorAction SilentlyContinue)) {
    Add-Content -Path $hostsFile -Value $hostEntry
    Write-Host "Added: $hostEntry" -ForegroundColor Green
} else {
    Write-Host "Host entry already exists" -ForegroundColor Yellow
}

# Open firewall port if needed (if not 80)
if ($port -ne 80) {
    Write-Host "Opening firewall for port $port..." -ForegroundColor Green
    New-NetFirewallRule -DisplayName "Allow MyHrm App Port $port" `
        -Direction Inbound `
        -Protocol TCP `
        -LocalPort $port `
        -Action Allow `
        -ErrorAction SilentlyContinue | Out-Null
}

Write-Host "====================================" -ForegroundColor Green
Write-Host "IIS Setup Complete!" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host "Site URL: http://$hostName/" -ForegroundColor Cyan
Write-Host "Physical Path: $physicalPath" -ForegroundColor Cyan
Write-Host "App Pool: $appPoolName" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Restart IIS: iisreset" -ForegroundColor Yellow
Write-Host "2. Start the app pool: Start-WebAppPool -Name '$appPoolName'" -ForegroundColor Yellow
Write-Host "3. Open http://$hostName in your browser" -ForegroundColor Yellow

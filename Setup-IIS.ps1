# Run this as Administrator
# ============================
# Sets up:
#   - Parent site "myhrm.local" (binding *:150:, no host-header restriction so it also
#     accepts the Apache-proxied requests which arrive with a different Host header),
#     physical path C:\inetpub\wwwroot.
#   - Virtual Application "/hrm_test" under it, physical path C:\inetpub\wwwroot\HRM,
#     running in its own App Pool ("HRM"). This matches app.UsePathBase("/hrm_test")
#     in API/Program.cs, so the app must be reached at http://myhrm.local:150/hrm_test/
#   - A URL Rewrite rule in the parent site's web.config that re-adds the /hrm_test
#     prefix for requests that arrive without it (the Apache reverse proxy strips the
#     prefix before forwarding: ProxyPass /hrm_test/ -> http://<server>:150/). This
#     keeps direct local access and the Apache-proxied public path both working
#     without needing any change on the Apache side. Requires the IIS URL Rewrite
#     module (https://www.iis.net/downloads/microsoft/url-rewrite).
# Safe to re-run: every step checks whether it already applied before making changes.

$ErrorActionPreference = "Stop"

$appPoolName   = "HRM"
$parentSiteName = "myhrm.local"
$parentPath    = "C:\inetpub\wwwroot"
$appName       = "hrm_test"
$physicalPath  = "C:\inetpub\wwwroot\HRM"
$hostName      = "myhrm.local"
$port          = 150

function Assert-Admin {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
        throw "This script must be run as Administrator. Re-launch PowerShell elevated and try again."
    }
}

function Assert-Prerequisites {
    if (-not (Get-Module -ListAvailable -Name WebAdministration)) {
        throw "The WebAdministration module was not found. Install the IIS Management Console / IIS role (Web-Server, Web-Mgmt-Console Windows features) first."
    }
    Import-Module WebAdministration

    $ancmInstalled = (Get-ChildItem "$env:windir\System32\inetsrv\aspnetcore*.dll" -ErrorAction SilentlyContinue) `
        -or (Get-ChildItem "${env:ProgramFiles}\IIS\Asp.Net Core Module\**\aspnetcorev2.dll" -Recurse -ErrorAction SilentlyContinue)
    if (-not $ancmInstalled) {
        Write-Host "WARNING: could not confirm the ASP.NET Core Module (ANCM) is installed. If the site 500s after deploy, install the .NET Hosting Bundle and run 'net stop was /y; net start w3svc'." -ForegroundColor Yellow
    }

    $rewriteInstalled = Get-ChildItem "$env:windir\System32\inetsrv\rewrite.dll" -ErrorAction SilentlyContinue
    if (-not $rewriteInstalled) {
        throw "The IIS URL Rewrite module is not installed (required to re-prefix /$appName for the Apache reverse-proxy path). Install it from https://www.iis.net/downloads/microsoft/url-rewrite and re-run."
    }
}

try {
    Assert-Admin
    Assert-Prerequisites

    # App Pool
    if (-not (Test-Path "IIS:\AppPools\$appPoolName")) {
        Write-Host "Creating App Pool: $appPoolName" -ForegroundColor Green
        New-Item "IIS:\AppPools\$appPoolName" -Force | Out-Null
        Set-ItemProperty "IIS:\AppPools\$appPoolName" -Name "managedRuntimeVersion" -Value ""   # No Managed Code for .NET
        Set-ItemProperty "IIS:\AppPools\$appPoolName" -Name "startMode" -Value "AlwaysRunning"
    } else {
        Write-Host "App Pool $appPoolName already exists" -ForegroundColor Yellow
        $managedRuntime = (Get-ItemProperty "IIS:\AppPools\$appPoolName" -Name "managedRuntimeVersion").Value
        if ($managedRuntime -ne "") {
            Write-Host "Fixing App Pool $appPoolName to No Managed Code" -ForegroundColor Yellow
            Set-ItemProperty "IIS:\AppPools\$appPoolName" -Name "managedRuntimeVersion" -Value ""
        }
    }

    # Parent site
    # No host-header restriction: the site is reached both directly as myhrm.local:$port
    # (via the hosts entry below) and via the Apache reverse proxy on apps.payrollrs.gr,
    # which forwards a different Host header. Binding on the bare port avoids IIS
    # rejecting the proxied requests with "400 Invalid Hostname".
    $desiredBinding = "*:${port}:"
    if (-not (Test-Path "IIS:\Sites\$parentSiteName")) {
        # Fail fast on a binding conflict instead of a cryptic COM error from New-Item
        $conflict = Get-ChildItem IIS:\Sites | Where-Object {
            $_.bindings.Collection | Where-Object { $_.bindingInformation -eq $desiredBinding }
        }
        if ($conflict) {
            throw "Another site ('$($conflict.Name)') is already bound to $desiredBinding. Resolve the conflict before re-running."
        }

        if (-not (Test-Path $parentPath)) {
            New-Item -ItemType Directory -Path $parentPath -Force | Out-Null
        }

        Write-Host "Creating parent IIS Site: $parentSiteName" -ForegroundColor Green
        New-Item "IIS:\Sites\$parentSiteName" `
            -bindings @{protocol="http"; bindingInformation=$desiredBinding} `
            -physicalPath $parentPath `
            -Force | Out-Null
    } else {
        Write-Host "Parent site $parentSiteName already exists" -ForegroundColor Yellow
        $hasBinding = Get-WebBinding -Name $parentSiteName | Where-Object { $_.bindingInformation -eq $desiredBinding }
        if (-not $hasBinding) {
            $conflict = Get-ChildItem IIS:\Sites | Where-Object { $_.Name -ne $parentSiteName } | Where-Object {
                $_.bindings.Collection | Where-Object { $_.bindingInformation -eq $desiredBinding }
            }
            if ($conflict) {
                throw "Another site ('$($conflict.Name)') is already bound to $desiredBinding. Resolve the conflict before re-running."
            }
            Write-Host "Updating binding for $parentSiteName to $desiredBinding" -ForegroundColor Yellow
            Get-WebBinding -Name $parentSiteName | Remove-WebBinding
            New-WebBinding -Name $parentSiteName -Protocol http -Port $port
        }
    }

    # The parent site's own root application must run in the SAME app pool as the
    # /hrm_test virtual application: IIS URL Rewrite's "Rewrite" action cannot cross
    # application-pool boundaries (it fails with 403.18) when it internally routes a
    # request from the parent site into the child application.
    Set-ItemProperty "IIS:\Sites\$parentSiteName" -Name applicationPool -Value $appPoolName

    # Re-prefix rewrite rule at the parent site root: the Apache reverse proxy
    # (ProxyPass /hrm_test/ -> http://<this-server>:$port/) strips the /hrm_test
    # prefix before forwarding, but the app is hosted as an IIS Virtual Application
    # at /hrm_test and expects the prefix to be present (app.UsePathBase in Program.cs).
    # This rule re-adds the prefix for any request that doesn't already have it, so
    # both the Apache-proxied path and direct local browsing route correctly.
    $parentWebConfig = Join-Path $parentPath "web.config"
    $rewriteXml = @"
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="Reprefix-$appName-ForProxiedRequests" stopProcessing="true">
          <match url="^(?!$appName/).*" />
          <action type="Rewrite" url="$appName/{R:0}" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
"@
    if (-not (Test-Path $parentWebConfig) -or (Get-Content $parentWebConfig -Raw) -ne $rewriteXml) {
        Write-Host "Writing re-prefix rewrite rule to $parentWebConfig" -ForegroundColor Green
        Set-Content -Path $parentWebConfig -Value $rewriteXml -Encoding UTF8
    }

    # Authentication: the Apache reverse proxy forwards requests without Windows
    # credentials, so Anonymous Authentication must be enabled (and Windows
    # Authentication disabled) on the site or IIS returns 403 for the proxied path.
    Write-Host "Ensuring Anonymous Authentication is enabled for $parentSiteName..." -ForegroundColor Green
    Set-WebConfigurationProperty -Filter "/system.webServer/security/authentication/anonymousAuthentication" `
        -Name enabled -Value $true -PSPath "IIS:\Sites\$parentSiteName"
    Set-WebConfigurationProperty -Filter "/system.webServer/security/authentication/windowsAuthentication" `
        -Name enabled -Value $false -PSPath "IIS:\Sites\$parentSiteName" -ErrorAction SilentlyContinue

    # Virtual Application: /hrm_test
    if (-not (Test-Path "IIS:\Sites\$parentSiteName\$appName")) {
        if (-not (Test-Path $physicalPath)) {
            New-Item -ItemType Directory -Path $physicalPath -Force | Out-Null
        }
        Write-Host "Creating virtual application /$appName under $parentSiteName" -ForegroundColor Green
        New-WebApplication -Site $parentSiteName -Name $appName -PhysicalPath $physicalPath -ApplicationPool $appPoolName | Out-Null
    } else {
        Write-Host "Virtual application /$appName already exists" -ForegroundColor Yellow
        Set-ItemProperty "IIS:\Sites\$parentSiteName\$appName" -Name applicationPool -Value $appPoolName

        $currentPhysicalPath = (Get-WebFilePath "IIS:\Sites\$parentSiteName\$appName").FullName
        if ($currentPhysicalPath -ne $physicalPath) {
            Write-Host "Fixing physical path for /$appName ($currentPhysicalPath -> $physicalPath)" -ForegroundColor Yellow
            if (-not (Test-Path $physicalPath)) {
                New-Item -ItemType Directory -Path $physicalPath -Force | Out-Null
            }
            Set-ItemProperty "IIS:\Sites\$parentSiteName\$appName" -Name physicalPath -Value $physicalPath
        }
    }

    # Permissions for IIS_IUSRS
    Write-Host "Setting folder permissions..." -ForegroundColor Green
    icacls $physicalPath /grant "IIS_IUSRS:(OI)(CI)RX" /T /C /Q | Out-Null

    # Logs folder
    $logsPath = "$physicalPath\logs"
    if (-not (Test-Path $logsPath)) {
        New-Item -ItemType Directory -Path $logsPath -Force | Out-Null
    }
    icacls $logsPath /grant "IIS_IUSRS:(OI)(CI)F" /T /C /Q | Out-Null

    # Hosts entry
    Write-Host "Checking hosts entry for: $hostName" -ForegroundColor Green
    $hostsFile = "C:\Windows\System32\drivers\etc\hosts"
    $hostEntry = "127.0.0.1       $hostName"
    if (-not (Select-String -Path $hostsFile -Pattern $hostName -ErrorAction SilentlyContinue)) {
        Add-Content -Path $hostsFile -Value $hostEntry
        Write-Host "Added: $hostEntry" -ForegroundColor Green
    } else {
        Write-Host "Host entry already exists" -ForegroundColor Yellow
    }

    # Firewall port (only needed if not 80)
    if ($port -ne 80) {
        Write-Host "Opening firewall for port $port..." -ForegroundColor Green
        New-NetFirewallRule -DisplayName "Allow HRM App Port $port" `
            -Direction Inbound `
            -Protocol TCP `
            -LocalPort $port `
            -Action Allow `
            -ErrorAction SilentlyContinue | Out-Null
    }

    Write-Host "====================================" -ForegroundColor Green
    Write-Host "IIS Setup Complete!" -ForegroundColor Green
    Write-Host "====================================" -ForegroundColor Green
    Write-Host "Site URL (local):  http://${hostName}:${port}/$appName/" -ForegroundColor Cyan
    Write-Host "Site URL (public): https://apps.payrollrs.gr/$appName/ (via existing Apache proxy)" -ForegroundColor Cyan
    Write-Host "Physical Path: $physicalPath" -ForegroundColor Cyan
    Write-Host "App Pool: $appPoolName" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Publish the app: .\publish-all.ps1" -ForegroundColor Yellow
    Write-Host "2. Restart IIS if needed: iisreset" -ForegroundColor Yellow
    Write-Host "3. Open http://${hostName}:${port}/$appName/ in your browser" -ForegroundColor Yellow
}
catch {
    Write-Host "====================================" -ForegroundColor Red
    Write-Host "IIS Setup FAILED: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "====================================" -ForegroundColor Red
    exit 1
}

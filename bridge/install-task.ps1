<#
.SYNOPSIS
  Registers the COSTERA POS print bridge to start with Windows.

.DESCRIPTION
  Uses a Scheduled Task rather than a real Windows service. A Node script is not
  a service binary, so making one would mean pulling in a wrapper such as nssm;
  a task needs nothing extra, survives reboots, and restarts the bridge if it
  dies mid-service.

  Run this from an elevated PowerShell in the bridge folder, after npm install
  and after filling in .env.

.PARAMETER TaskName
  Name of the scheduled task. Change it only if a till runs two bridges.

.PARAMETER AtStartup
  Start at boot instead of at logon. Needs the till to run the bridge under an
  account that does not require an interactive session.

.EXAMPLE
  .\install-task.ps1
  .\install-task.ps1 -AtStartup
#>
[CmdletBinding()]
param(
  [string]$TaskName = "COSTERA POS Bridge",
  [switch]$AtStartup
)

$ErrorActionPreference = "Stop"

$bridgeDir = $PSScriptRoot
$node = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $node) { throw "Node.js is not on PATH. Install Node 20 or newer first." }
if (-not (Test-Path (Join-Path $bridgeDir ".env"))) {
  throw "No .env in $bridgeDir. Copy .env.example to .env and fill it in first."
}
if (-not (Test-Path (Join-Path $bridgeDir "node_modules"))) {
  throw "Dependencies are missing. Run npm install in $bridgeDir first."
}

# --env-file keeps the token out of the task definition, which is world-readable.
$arguments = '--env-file=.env --import tsx src/index.ts'
$action = New-ScheduledTaskAction -Execute $node -Argument $arguments -WorkingDirectory $bridgeDir

$trigger = if ($AtStartup) { New-ScheduledTaskTrigger -AtStartup } else { New-ScheduledTaskTrigger -AtLogOn }

$settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -StartWhenAvailable `
  -RestartInterval (New-TimeSpan -Minutes 1) `
  -RestartCount 999 `
  -ExecutionTimeLimit ([TimeSpan]::Zero)

if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
  Write-Host "Replacing the existing task '$TaskName'."
  Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
}

Register-ScheduledTask `
  -TaskName $TaskName `
  -Action $action `
  -Trigger $trigger `
  -Settings $settings `
  -Description "Drains the COSTERA print queue onto this till's printer and cash drawer." | Out-Null

Start-ScheduledTask -TaskName $TaskName

Write-Host ""
Write-Host "Registered and started '$TaskName'."
Write-Host "  Status:  Get-ScheduledTask -TaskName '$TaskName'"
Write-Host "  Stop:    Stop-ScheduledTask -TaskName '$TaskName'"
Write-Host "  Remove:  Unregister-ScheduledTask -TaskName '$TaskName' -Confirm:`$false"
Write-Host ""
Write-Host "The bridge writes to stdout. To watch it during setup, stop the task"
Write-Host "and run 'npm start' in $bridgeDir instead."

$ErrorActionPreference = 'Stop'

$RootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$PerfDir = Resolve-Path (Join-Path $RootDir '..')
$ReportsDir = Resolve-Path (Join-Path $PerfDir '..\reports\raw')

if (Test-Path (Join-Path $PerfDir 'local.env')) {
  Get-Content (Join-Path $PerfDir 'local.env') |
    Where-Object { $_ -and -not $_.StartsWith('#') } |
    ForEach-Object {
      $parts = $_ -split '=', 2
      if ($parts.Length -eq 2) {
        [System.Environment]::SetEnvironmentVariable($parts[0], $parts[1])
      }
    }
}

$RunSlug = if ($env:RUN_SLUG) { $env:RUN_SLUG } else { 'jmeter-local' }
$OutDir = if ($env:OUT_DIR) { $env:OUT_DIR } else { Join-Path $ReportsDir.Path "performance\jmeter\$RunSlug" }
$TestPlanPath = if ($env:TEST_PLAN_PATH) { $env:TEST_PLAN_PATH } else { Join-Path $RootDir 'starter-test-plan.jmx' }
$UserPropertiesPath = if ($env:USER_PROPERTIES_PATH) { $env:USER_PROPERTIES_PATH } else { Join-Path $RootDir 'user.properties' }
$ReportPropertiesPath = if ($env:REPORT_PROPERTIES_PATH) { $env:REPORT_PROPERTIES_PATH } else { Join-Path $RootDir 'reportgenerator.properties' }
$ResultsFile = if ($env:RESULTS_FILE) { $env:RESULTS_FILE } else { Join-Path $OutDir 'results.csv' }
$LogFile = if ($env:LOG_FILE) { $env:LOG_FILE } else { Join-Path $OutDir 'jmeter.log' }
$HtmlReportDir = if ($env:HTML_REPORT_DIR) { $env:HTML_REPORT_DIR } else { Join-Path $OutDir 'report-output' }
$DashboardHtml = if ($env:DASHBOARD_HTML) { $env:DASHBOARD_HTML } else { Join-Path $OutDir 'dashboard.html' }
$JMeterBin = if ($env:JMETER_BIN) { $env:JMETER_BIN } else { 'jmeter' }
$RendererScript = if ($env:RENDERER_SCRIPT) { $env:RENDERER_SCRIPT } else { Join-Path $RootDir 'render-jmeter-dashboard.js' }

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

if ($env:SAFE_TO_RUN -ne 'yes') {
  throw "SAFE_TO_RUN is not 'yes'. Refusing to execute JMeter workload."
}

$null = Get-Command $JMeterBin -ErrorAction Stop

& $JMeterBin -n -t $TestPlanPath -q $UserPropertiesPath -q $ReportPropertiesPath -l $ResultsFile -j $LogFile -e -o $HtmlReportDir

if (Test-Path $RendererScript) {
  try {
    node $RendererScript --stats (Join-Path $HtmlReportDir 'statistics.json') --output $DashboardHtml --title 'JMeter Executive Dashboard' --run-label $RunSlug
  }
  catch {
    Write-Warning "Dashboard renderer failed: $($_.Exception.Message)"
  }
}

Write-Host "JMeter raw outputs written to: $OutDir"

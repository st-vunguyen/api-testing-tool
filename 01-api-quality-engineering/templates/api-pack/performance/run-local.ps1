$ErrorActionPreference = 'Stop'

$RootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ReportsDir = Resolve-Path (Join-Path $RootDir '..\reports\raw')

if (Test-Path (Join-Path $RootDir 'local.env')) {
  Get-Content (Join-Path $RootDir 'local.env') |
    Where-Object { $_ -and -not $_.StartsWith('#') } |
    ForEach-Object {
      $parts = $_ -split '=', 2
      if ($parts.Length -eq 2) {
        [System.Environment]::SetEnvironmentVariable($parts[0], $parts[1])
      }
    }
}

$Stack = if ($env:STACK) { $env:STACK } else { 'k6' }
$RunSlug = if ($env:RUN_SLUG) { $env:RUN_SLUG } else { 'baseline-local' }
$OutDir = if ($env:OUT_DIR) { $env:OUT_DIR } else { Join-Path $ReportsDir.Path "performance\$RunSlug" }

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

if ($env:SAFE_TO_RUN -ne 'yes') {
  throw "SAFE_TO_RUN is not 'yes'. Refusing to execute performance workload."
}

switch ($Stack) {
  'k6' {
    $null = Get-Command k6 -ErrorAction Stop
    $ScriptPath = if ($env:SCRIPT_PATH) { $env:SCRIPT_PATH } else { Join-Path $RootDir 'k6-script.js' }
    $env:K6_SUMMARY_EXPORT = Join-Path $OutDir 'k6-summary.json'
    & k6 run --vus ($env:VUS ?? '1') --duration ($env:DURATION ?? '30s') $ScriptPath | Tee-Object -FilePath (Join-Path $OutDir 'k6.log')
  }
  'postman-newman' {
    $null = Get-Command newman -ErrorAction Stop
    $CollectionPath = if ($env:COLLECTION_PATH) { $env:COLLECTION_PATH } else { Join-Path $RootDir 'newman-performance.collection.json' }
    $EnvPath = if ($env:ENV_PATH) { $env:ENV_PATH } else { Join-Path $RootDir 'newman-performance.postman_environment.json.example' }
    & newman run $CollectionPath -e $EnvPath --reporters cli,json,junit --reporter-json-export (Join-Path $OutDir 'newman-summary.json') --reporter-junit-export (Join-Path $OutDir 'newman-junit.xml') | Tee-Object -FilePath (Join-Path $OutDir 'newman.log')
  }
  'jmeter' {
    $JMeterRunner = if ($env:JMETER_RUNNER) { $env:JMETER_RUNNER } else { Join-Path $RootDir 'jmeter\run-jmeter.ps1' }
    if (-not (Test-Path $JMeterRunner)) {
      throw "JMeter runner not found: $JMeterRunner"
    }
    & $JMeterRunner
  }
  default {
    throw "Unsupported STACK: $Stack"
  }
}

Write-Host "Raw outputs written to: $OutDir"
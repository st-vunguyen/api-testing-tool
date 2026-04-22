param(
  [string]$RootDir = (Get-Location).Path
)

$artifactDirs = @(
  'test-results',
  'playwright-report',
  'blob-report',
  'tests/e2e/.auth'
)

foreach ($relativeDir in $artifactDirs) {
  $target = Join-Path $RootDir $relativeDir
  if (Test-Path -Path $target) {
    Remove-Item -Path $target -Recurse -Force
    Write-Host "[clean-artifacts] removed $relativeDir/"
  }
  else {
    Write-Host "[clean-artifacts] skip $relativeDir/ (not found)"
  }
}

$authDir = Join-Path $RootDir 'tests/e2e/.auth'
New-Item -ItemType Directory -Path $authDir -Force | Out-Null
Write-Host '[clean-artifacts] ensured tests/e2e/.auth/ exists'
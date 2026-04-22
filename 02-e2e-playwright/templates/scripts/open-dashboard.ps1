param(
  [string]$File = "playwright-report/dashboard.html"
)

if (-not (Test-Path -Path $File -PathType Leaf)) {
  Write-Error "File not found: $File"
  exit 2
}

Start-Process -FilePath $File

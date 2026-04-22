#!/usr/bin/env bash
set -euo pipefail

# Usage: ./open-dashboard.sh [path-to-dashboard]
# Defaults to `playwright-report/dashboard.html`

FILE="${1:-playwright-report/dashboard.html}"

if [ ! -f "$FILE" ]; then
  echo "File not found: $FILE" >&2
  exit 2
fi

if command -v open >/dev/null 2>&1; then
  open "$FILE"
elif command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$FILE"
else
  echo "No suitable open command found (open/xdg-open)." >&2
  exit 3
fi

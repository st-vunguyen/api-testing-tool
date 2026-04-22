#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${1:-$PWD}"

for dir in \
  "test-results" \
  "playwright-report" \
  "blob-report" \
  "tests/e2e/.auth"
do
  target="${ROOT_DIR%/}/$dir"
  if [[ -d "$target" ]]; then
    rm -rf "$target"
    echo "[clean-artifacts] removed $dir/"
  else
    echo "[clean-artifacts] skip $dir/ (not found)"
  fi
done

mkdir -p "${ROOT_DIR%/}/tests/e2e/.auth"
echo "[clean-artifacts] ensured tests/e2e/.auth/ exists"
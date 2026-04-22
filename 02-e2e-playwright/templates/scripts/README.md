# Scripts

These helper scripts help keep Playwright artifacts tidy and make local report inspection easier.

Files:
- `clean-playwright-artifacts.js` — cross-platform cleanup script. Removes stale generated folders before/after runs: `test-results/`, `playwright-report/`, `blob-report/`, `tests/e2e/.auth/`.
- `open-dashboard.sh` — POSIX shell script (macOS / Linux). Usage: `./open-dashboard.sh [path]`.
- `open-dashboard.js` — Node script, usable in `package.json` npm scripts: `node ./templates/scripts/open-dashboard.js`.
- `open-dashboard.ps1` — PowerShell script for Windows.

Examples (from repository root):

```bash
# clean stale artifacts from previous runs
node e2e-playwright/templates/scripts/clean-playwright-artifacts.js

# open default dashboard path
./e2e-playwright/templates/scripts/open-dashboard.sh

# open specific file
./e2e-playwright/templates/scripts/open-dashboard.sh playwright-report/dashboard.html

# via node (if you prefer npm scripts)
node e2e-playwright/templates/scripts/open-dashboard.js
```

Notes:
- Every test run should already clean old artifacts in `tests/e2e/fixtures/global-setup.ts`; this script is the manual fallback when you want a hard reset.
- Make the shell script executable if needed: `chmod +x e2e-playwright/templates/scripts/open-dashboard.sh`
- The Node script is cross-platform and can be referenced in `package.json` scripts.

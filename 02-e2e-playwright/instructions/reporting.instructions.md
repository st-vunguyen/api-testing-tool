---
applyTo: "**/tests/e2e/**,**/playwright.config.*,**/.github/workflows/e2e*"
description: "Reporting, artifact management, and CI rules for UI/UX E2E automation. MUST read alongside e2e-automation.instructions.md."
---

# UI/UX E2E Reporting & CI — Mandatory Rules

> **Scope**: These rules govern how UI/UX test results are reported, how artifacts (screenshots, visual diffs, traces, accessibility reports) are managed, and how CI pipelines handle reporting. All reporting focuses on **what the user sees and experiences** — visual correctness, layout integrity, accessibility compliance, and responsive behavior.

> **Support-file rule**: `.github/instructions/**`, `.github/prompts/e2e-playwright/**`, `.claude/agents/**`, `.claude/rules/**`, `.claude/prompts/e2e-playwright/**`, and `testing/SKILL.md` are committed support files. They are not runtime artifacts and must not be treated as trash.

---

## 1) Reporter Stack

Every project MUST configure the following reporters in `playwright.config.ts`:

### Local mode

```typescript
reporters: [
  ['list'],                                              // stdout: real-time progress
  ['html', { outputFolder: 'playwright-report', open: 'never' }], // keep HTML report without auto-opening it
  ['./tests/e2e/reporters/dashboard-reporter.ts',        // visual dashboard with screenshots
    { outputFolder: 'playwright-report', openOnEnd: !process.env.CI }],
]
```

> ⚠️ **`openOnEnd` must be `false` (or guarded by `!process.env.CI`)**: setting `openOnEnd: true` unconditionally will cause the Playwright process to **block indefinitely** waiting for a browser to open in environments without a display (headless terminals, Docker, CI-like local runs). Always use `openOnEnd: !process.env.CI` so it only fires in a full desktop session.

> **Local default**: open `playwright-report/dashboard.html` first after the run. The built-in Playwright HTML report remains available at `playwright-report/index.html` for secondary inspection.

### CI mode (lean — JSON only)

```typescript
reporters: [
  ['list'],                                              // stdout: CI log output
  ['json', { outputFile: 'playwright-report/results.json' }], // machine-readable for PR summary
]
```

> **CI produces only `results.json`** — no HTML report, no dashboard. Screenshots, video, and traces are all **OFF** in CI to minimize disk usage and artifact size. The JSON file is tiny (<100KB) and provides all data needed for the PR summary step. If a CI failure needs visual debugging, re-run the failing test locally in Manual mode to get full evidence.

### Dashboard reporter UI/UX metrics

The dashboard reporter (`reporters/dashboard-reporter.ts`) generates an HTML dashboard that should include:

| Metric | Description |
|--------|-------------|
| **Visual regression pass rate** | Percentage of `toHaveScreenshot` assertions that passed without diff |
| **Layout integrity score** | Count of pages verified for overflow, truncation, and alignment issues |
| **Accessibility compliance** | Number of pages scanned, total violations found, violation severity breakdown |
| **Viewport coverage** | Which breakpoints were tested (mobile / tablet / desktop) per spec |
| **Screenshot evidence gallery** | Inline base64 screenshots from `screenshotStep` calls, grouped by test |
| **Visual diff gallery** | Side-by-side comparisons for any visual regression failures (expected / actual / diff) |
| **API failure logs** | `failureApiLogger` output for failed tests — shows API req/res to quickly determine FE vs API root cause |

---

## 2) Screenshot Evidence Rules

### `screenshotStep` fixture (mandatory for UI tests)

Every meaningful step in a UI test MUST use `screenshotStep()`:

```typescript
await screenshotStep('User clicks Submit', async (p) => {
  await p.locator('button[type="submit"]').click();
}, page, { highlightTarget: page.locator('button[type="submit"]') });
```

### Screenshot rules

| Rule | Why |
|------|-----|
| Use `screenshotStep` for every user-facing action | Visual evidence for dashboard report |
| Include `highlightTarget` when targeting a specific element | Red dashed border + label badge makes evidence clear |
| Use `fullPageWithHighlight: true` for form submissions | Captures full form context |
| Never rely on full-page screenshots alone | Cropped screenshots with highlight are more informative |
| Capture before/after for visual state changes | Proves the UI actually changed (e.g., toast appeared, modal opened, row deleted) |
| Capture screenshots at each viewport breakpoint | Demonstrates responsive behavior in evidence trail |

### Visual regression screenshot rules

| Rule | Why |
|------|-----|
| Use `toHaveScreenshot()` with descriptive names | `{page}-{state}-{viewport}.png` makes baselines identifiable |
| Always set `maxDiffPixelRatio` or `maxDiffPixels` | Prevents flaky failures from sub-pixel rendering differences |
| Mask dynamic content with `mask` option | Timestamps, avatars, randomized content cause false positives |
| Disable animations before visual comparison | Set `animations: 'disabled'` in `toHaveScreenshot` options |
| Hide caret in screenshots | Set `caret: 'hide'` to avoid blinking cursor diffs |
| Wait for page stability before comparison | Call `waitForPageReady()`, ensure no pending requests or layout shifts |

### Screenshot configuration in `playwright.config.ts`

```typescript
use: {
  screenshot: isCI ? 'off' : 'on',              // CI: off (lean) / Local: full evidence
  video: isCI ? 'off' : 'retain-on-failure',     // CI: off / Local: keep on failure
  trace: isCI ? 'off' : 'retain-on-failure',     // CI: off / Local: keep on failure
},
except: {
  toHaveScreenshot: {
    maxDiffPixelRatio: 0.01,                     // Default threshold for visual comparisons
    animations: 'disabled',                       // Freeze animations for stable screenshots
    caret: 'hide',                                // Hide blinking cursor
  },
},
```

> **Why CI has everything OFF**: CI is a pass/fail gate — it answers "did tests pass?". When tests fail in CI, developers reproduce locally in Manual mode to get full screenshots, video, and traces. This eliminates ~95% of artifact storage waste while keeping the local debugging experience rich.

---

## 3) Visual Testing Reports

Visual testing generates specific report artifacts that must be managed properly.

### Visual regression results

When `toHaveScreenshot()` fails, Playwright generates three images per failure:

| File | Description |
|------|-------------|
| `*-expected.png` | The committed baseline (what the UI should look like) |
| `*-actual.png` | What the UI actually looks like in this run |
| `*-diff.png` | Pixel-level difference highlighted in magenta |

These files are generated in the `test-results/` directory under each test's folder.

#### Handling visual regression results

```text
test-results/
├── homepage-visual-chromium/
│   ├── homepage-hero-expected.png     ← Baseline
│   ├── homepage-hero-actual.png       ← Current run
│   └── homepage-hero-diff.png         ← Diff overlay (magenta = changed pixels)
```

| Scenario | Action |
|----------|--------|
| Diff is **unintentional** (bug) | Report via issue tracker, attach diff image as evidence |
| Diff is **intentional** (redesign) | Update baseline: `pnpm exec playwright test --update-snapshots` |
| Diff is **flaky** (rendering noise) | Increase `maxDiffPixelRatio`, mask unstable regions, check animation state |

### Layout verification findings

Layout integrity tests produce assertions (pass/fail) for structural properties. Report layout findings in execution reports:

| Finding type | Report format |
|-------------|---------------|
| Horizontal overflow detected | Page URL, viewport size, `body.scrollWidth` vs `viewport.width` |
| Element outside viewport | Element selector, bounding box coordinates, viewport dimensions |
| Elements overlapping | Both element selectors, their bounding boxes, overlap area |
| Text truncation | Element selector, `scrollWidth` vs `clientWidth`, visible text vs full text |

### Accessibility violation reports

Accessibility scans via `@axe-core/playwright` produce structured violation data. Include in reports:

```typescript
// Example: attach accessibility results to test
const results = await new AxeBuilder({ page })
  .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
  .analyze();

if (results.violations.length > 0) {
  await test.info().attach('accessibility-violations', {
    body: JSON.stringify(results.violations, null, 2),
    contentType: 'application/json',
  });
}
```

#### Accessibility report format

For each violation, capture:

| Field | Description |
|-------|-------------|
| `id` | axe rule ID (e.g., `color-contrast`, `label`, `aria-required-attr`) |
| `impact` | `critical`, `serious`, `moderate`, `minor` |
| `description` | Human-readable description of the violation |
| `helpUrl` | Link to Deque's documentation for the rule |
| `nodes` | List of affected DOM elements with selectors and failure summary |
| `wcagTags` | Which WCAG criteria are violated |

#### Accessibility summary in execution reports

Include in `01_test-results-summary.md`:

```markdown
### Accessibility Compliance

| Metric | Value |
|--------|-------|
| Pages scanned | 12 |
| Total violations | 3 |
| Critical | 0 |
| Serious | 1 |
| Moderate | 2 |
| Minor | 0 |
| Compliance rate | 75% (9/12 pages pass with zero violations) |
```

---

## 4) Report Output Structure

All generated reports follow this directory layout:

```text
project-root/
├── playwright-report/           ← Built-in HTML report (gitignored)
│   ├── index.html               ← Built-in Playwright HTML report
│   ├── dashboard.html           ← Preferred local dashboard — auto-open after run
│   └── results.json             ← CI: machine-readable test results
├── test-results/                ← Per-test artifacts (gitignored)
│   ├── test-name-chromium/
│   │   ├── screenshot-1.png
│   │   ├── video.webm
│   │   ├── trace.zip
│   │   ├── *-expected.png       ← Visual regression baseline (on failure)
│   │   ├── *-actual.png         ← Visual regression actual (on failure)
│   │   └── *-diff.png           ← Visual regression diff (on failure)
│   └── ...
├── tests/e2e/
│   ├── **/*.ts-snapshots/       ← Visual regression baselines (COMMITTED)
│   │   ├── homepage-hero-chromium-linux.png
│   │   ├── homepage-hero-chromium-darwin.png
│   │   └── ...
│   └── docs/reports/            ← Human-written execution reports (committed)
│       └── <run-slug>/          ← e.g., myapp-20260330
│           ├── 00_index.md
│           ├── 01_test-results-summary.md   ← Includes visual + a11y summaries
│           ├── 02_system-bugs.md            ← Visual/layout/a11y bugs linked to issues
│           ├── 03_audit-gaps.md
│           ├── 04_framework-fixes.md
│           └── 05_pipeline-summary.md
```

> **Clean-run rule**: before every execution, delete stale `playwright-report/`, `test-results/`, `blob-report/`, and `tests/e2e/.auth/`. After the run, only artifacts generated by that run may remain.

### What gets committed vs gitignored

| Path | Committed? | Why |
|------|-----------|-----|
| `tests/e2e/**/*.ts-snapshots/` | ✅ Yes | Visual regression baselines — required for comparison |
| `tests/e2e/docs/reports/` | ✅ Yes | Human-curated analysis — high value |
| `.github/workflows/e2e.yml` | ✅ Yes | CI workflow definition |
| `playwright-report/` | ❌ No | Generated every run — cleaned before next run; manual mode only |
| `test-results/` | ❌ No | Screenshots, traces, videos, diffs — cleaned before next run |
| `blob-report/` | ❌ No | CI sharding intermediate — cleaned before next run |
| `tests/e2e/.auth/` | ❌ No | Session cookies — security risk |

> **`.gitignore` discipline**: Only add entries that E2E automation actually generates. NEVER add app-level entries (e.g., `/public/uploads/`, `data/`, `logs/`).

> **Visual baselines MUST be committed**: The `*.ts-snapshots/` directories contain the golden screenshots that visual regression tests compare against. Without them, `toHaveScreenshot()` cannot detect regressions.

---

## 5) CI Integration Rules

### GitHub Actions workflow

Use the template at `templates/.github/workflows/e2e.yml`. Key rules:

| Rule | Implementation |
|------|----------------|
| Upload only JSON results | `playwright-report/results.json` — tiny file, all CI needs |
| No HTML/dashboard in CI | Reporters: `list` + `json` only — no heavy HTML generation |
| No screenshots/video/trace in CI | `screenshot: 'off'`, `video: 'off'`, `trace: 'off'` — zero disk waste |
| Use JSON reporter for PR summary | Enables automated PR summary with pass/fail counts |
| Set `CI=true` | Triggers lean mode (JSON only, no artifacts, retries, DROP DB) |
| Store secrets in GitHub | `secrets.E2E_ADMIN_PASSWORD` — never hardcode |
| Set timeout | `timeout-minutes: 30` — prevent runaway jobs |
| Cancel duplicates | `concurrency.cancel-in-progress: true` — save CI minutes |
| Retention policy | JSON results: 14 days |
| Debug CI failures locally | Reproduce with Manual mode to get full evidence |

### CI artifact upload steps

```yaml
# CI uploads ONLY the JSON results — everything else is OFF.
# No HTML report, no test-results/ (screenshots/videos/traces are disabled in CI).
- name: Upload test results (JSON)
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: playwright-results
    path: playwright-report/results.json
    retention-days: 14
    if-no-files-found: warn
```

> **No test-results/ upload**: since `screenshot: 'off'`, `video: 'off'`, and `trace: 'off'` in CI, the `test-results/` directory is either empty or contains only minimal metadata. Uploading it would be wasteful. When a CI failure needs investigation, reproduce locally in Manual mode.

### CI-specific Playwright config behavior

```typescript
const isCI = !!process.env.CI;

// These settings MUST differ between local and CI:
{
  retries: isCI ? 2 : 1,         // CI gets more retries (infra flakiness)
  workers: isCI ? 4 : 2,         // CI has more CPU cores
  screenshot: isCI ? 'off' : 'on',       // CI: off (lean) / Local: full evidence
  video: isCI ? 'off' : 'retain-on-failure',  // CI: off / Local: keep on failure
  trace: isCI ? 'off' : 'retain-on-failure',  // CI: off / Local: keep on failure
  forbidOnly: isCI,              // Prevent .only() from passing CI
}
```

### Visual baseline handling in CI

| Scenario | CI Behavior |
|----------|-------------|
| No baselines committed | `toHaveScreenshot()` fails — developer must generate and commit baselines |
| Baselines exist, UI unchanged | Tests pass silently |
| Baselines exist, unintentional UI change | Tests fail — reproduce locally in Manual mode to see diff images |
| Baselines need update after intentional change | Developer runs `--update-snapshots` locally, commits new baselines |
| Platform mismatch (local macOS, CI Linux) | Maintain separate baselines per platform; generate CI baselines in CI Docker |

> **NEVER auto-update baselines in CI**. Visual changes must be reviewed by a human before baselines are updated.

### Viewing CI reports locally

```bash
# CI only produces results.json — inspect it directly:
cat playwright-report/results.json | jq '.stats'

# To debug a CI failure with full visual evidence, reproduce locally:
pnpm exec playwright test --grep "failing test name"
# This runs in Manual mode → full HTML report + dashboard + screenshots
open playwright-report/dashboard.html
```

---

## 6) Artifact Hygiene — Pre-Completion Checklist

Before marking any task complete:

- [ ] `git status` shows NO files from `playwright-report/`, `test-results/`, `blob-report/`, `.auth/`
- [ ] `global-setup.ts` removes stale `playwright-report/`, `test-results/`, `blob-report/`, and `.auth/` before each run
- [ ] `.gitignore` includes all entries from `templates/.gitignore`
- [ ] `tests/e2e/docs/reports/` contains only markdown execution reports (no binary artifacts)
- [ ] No `.webm`, `.zip` files committed to `tests/e2e/` (screenshots in `*.ts-snapshots/` are the exception)
- [ ] Visual regression baselines (`*.ts-snapshots/`) ARE committed for all `toHaveScreenshot()` calls
- [ ] No generated `playwright-report/` files are committed
- [ ] CI workflow uploads only `results.json` as artifact (no HTML report, no test-results/)
- [ ] Accessibility violation JSON attachments are included in test results (not committed as separate files)
- [ ] No stale baselines: every committed baseline corresponds to an active `toHaveScreenshot()` call

### Baseline hygiene

| Rule | Details |
|------|---------|
| Remove orphaned baselines | If a `toHaveScreenshot()` call is removed, delete its baseline files |
| Review baseline PRs carefully | Baseline changes are visual diffs — review them like UI code review |
| Keep baselines minimal | Only capture baselines for intentional visual regression tests, not every `screenshotStep` |
| Separate evidence from baselines | `screenshotStep` evidence is in `test-results/` (gitignored). Baselines are in `*.ts-snapshots/` (committed). |

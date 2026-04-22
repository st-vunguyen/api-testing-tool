---
applyTo: "**/tests/e2e/**,**/playwright.config.*"
description: "Mandatory rules for UI/UX E2E automation testing. MUST read before modifying any file in tests/e2e/."
---

# UI/UX E2E Automation — Mandatory Rules

> **Scope**: These rules govern end-to-end UI/UX testing — verifying what users see, interact with, and experience in the browser. API calls are used **only** for test data seeding (setup/teardown), never as the subject under test.

---

## 0) Dual-Tool Support Files

When this kit is installed into a real repository, the following support files are part of the intended committed setup — not runtime trash:

- `.github/instructions/**`
- `.github/prompts/e2e-playwright/**`
- `.claude/agents/**`
- `.claude/rules/**`
- `.claude/prompts/e2e-playwright/**`
- `testing/SKILL.md`

Generated runtime artifacts remain disposable and must stay out of git.

---

## 1) NEVER Modify Application Source Code (CRITICAL — NO EXCEPTIONS)

> **Automation testers must NEVER modify any file outside the automation scope.**

### Allowed scope (whitelist)

| Path | File types |
|------|-----------|
| `tests/e2e/**` | Specs, fixtures, pages, config, helpers, reporters, snapshots, docs |
| `playwright.config.ts` | Playwright configuration |

### Forbidden scope (blacklist — absolute)

| Path | Reason |
|------|--------|
| `src/**` | Application source code — owned by DEV |
| `prisma/**` | Database schema / migrations — owned by DEV |
| `vendor/**` | Generated code — owned by build system |
| `package.json` | Dependencies — owned by DEV |
| `next.config.ts` | App config — owned by DEV |
| `docker-compose.yml` | Infra config — owned by DevOps |
| `.env`, `.env.*` | Environment config — owned by DEV |
| `public/**` | Static assets — owned by DEV |

### When a source code bug is found

1. **DO NOT fix it** — not even a single line
2. **Report via issue tracker** (GitHub Issues, Jira, etc.) — NEVER create bug report files in the repo
3. **Apply a workaround in the test** if possible (unique data, retry, skip)
4. **Annotate the test**: `test.info().annotations.push({ type: 'known-bug', description: 'ISSUE-URL' })`
5. Use `test.fixme()` or `test.skip()` if the bug makes the test impossible to pass

### Pre-completion self-check

- [ ] `git diff --name-only` contains only files in the whitelist
- [ ] No files changed in `src/`, `prisma/`, `vendor/`, `.env*`, `public/`, `package.json`
- [ ] If a bug was found → reported via issue tracker, source code NOT modified
- [ ] If the repo supports both Copilot and Claude, `.github/*`, `.claude/*`, and `testing/SKILL.md` are present intentionally

---

## 2) Test Data Isolation

### Unique identifiers

- **Every test** (or test group) must use `generateRunId()` for isolated data
- **Never** use hardcoded slugs/titles that can collide with other tests
- **Every test case** should have a unique prefix (e.g., `ui-a04-public-{runId}`)
- **Always read** the actual response from API when seeding data — the server may uniquify slugs

### Data seeding via API

- API requests for **test data setup and teardown** are allowed and encouraged (e.g., creating users, populating records before a UI test)
- Data seeding happens in `beforeAll` / `beforeEach` hooks or in `global-setup`
- **The API is a tool for setup, not the subject under test** — all assertions target the UI
- Always verify seeded data appears correctly in the UI before proceeding with test steps

### Database state

- `global-setup` TRUNCATES all tables + re-seeds → each run starts from a clean state
- `global-teardown` keeps DB intact in local mode (dev server reuses connection pool)
- Tests **must not assume** execution order — each test seeds its own data if needed

### Caching / SSR workarounds

- SSR frameworks (e.g., Next.js `unstable_cache`) may cache "not found" for previously 404'd slugs
- **Workaround**: Use unique slugs that have never been fetched → no stale cache
- **Workaround**: Retry loop with `page.goto()` each time (each goto = fresh server request)
- **NEVER** fix cache invalidation by modifying source code

---

## 3) Dev Server Management

### Local (dev mode)

- Playwright auto-starts the dev server via `webServer` config if not already running
- If already running: `reuseExistingServer: true` → uses existing server
- **Issue**: If the dev server holds a stale DB connection pool after test drops/recreates DB,
  connections become invalid → TRUNCATE instead of DROP, keep DB intact in local teardown

### CI mode

- Fresh dev server each run → no stale connection issue
- `global-teardown` drops the DB completely in CI

### Detecting stale servers

```typescript
// In global-setup: probe health endpoint
const isHealthy = await fetch(url).then(r => r.ok).catch(() => false);
```

---

## 4) Known Patterns & Pitfalls

### SSR / RSC Caching

| Issue | Test workaround |
|-------|----------------|
| `unstable_cache` retains 404 for new slugs | Use unique slug per-run that was never fetched |
| `revalidateTag` not called after CUD operations | Report bug, use unique data to avoid stale cache |
| RSC pre-render | Retry loop with fresh `goto()` |
| `networkidle` never resolves (SSR keeps connections open) | Use `waitForPageReady()` helper instead |

### Parallel workers

| Issue | Solution |
|-------|----------|
| Same file runs on 2 workers → 2 different `runId` values | Each test case uses its own unique prefix |
| Test A creates data, test B depends on it → race condition | Each test seeds its own data, never depends on another test |
| Slug collision between tests | Slugs include test-ID prefix + runId |

### Form controls

- Always verify what the control actually is (combobox vs native select) before interacting
- Use semantic locators: `getByRole`, `getByLabel`, `getByPlaceholder`
- Wait for element visibility before `fill` / `click`

### Visual testing pitfalls

| Issue | Solution |
|-------|----------|
| Anti-aliasing differences across OS / GPU | Use `maxDiffPixelRatio` threshold (e.g., `0.01`) instead of exact match |
| Dynamic content (timestamps, avatars, ads) | Mask dynamic regions with `mask` option in `toHaveScreenshot` |
| Animation causes non-deterministic screenshots | Disable CSS animations via `page.emulateMedia({ reducedMotion: 'reduce' })` or wait for idle |
| Font rendering differs between CI and local | Use Docker-based CI with identical fonts, or set appropriate `maxDiffPixels` |
| Scrollbar visibility varies by OS | Hide scrollbars via injected CSS in `beforeEach` or use `clip` option |
| Flaky layout shifts on slow CI | Use `waitForPageReady()` and `page.waitForLoadState('domcontentloaded')` before screenshots |

### Responsive testing pitfalls

| Issue | Solution |
|-------|----------|
| Viewport size doesn't account for browser chrome | Use `page.setViewportSize()` explicitly in tests |
| Mobile tests miss touch-specific behavior | Use `hasTouch: true` in device emulation config |
| Media queries not triggered after resize | Navigate after resize or call `page.reload()` |

---

## 5) Bug Reporting — Issue Tracker Only

When a system bug is found during automation:

1. **Report via issue tracker** (GitHub Issues, Jira, Linear, etc.)
2. **NEVER** create bug report files in the repository (`BUG-NNN.md`, etc.)
3. **Include in the issue**: severity, steps to reproduce, expected vs actual, spec reference, test ID
4. **Attach visual evidence**: screenshots, diff images from visual regression, video recordings
5. **Link the issue** from test annotations: `test.info().annotations.push({ type: 'known-bug', description: 'https://...' })`
6. **Document in execution report** `02_system-bugs.md` with a link to the issue

> Bug reports in source code pollute the repository and become stale. The issue tracker is the single source of truth.

### UI/UX-specific bug categories

| Category | Examples |
|----------|---------|
| Visual regression | Layout shifts, font changes, color mismatches, broken alignments |
| Layout integrity | Overlapping elements, truncated text, broken responsive breakpoints |
| Accessibility violation | Missing ARIA labels, insufficient contrast, keyboard trap, missing focus indicators |
| Interaction defect | Button not clickable, form not submitting, dropdown not opening |
| Cross-viewport issue | Content hidden on mobile, touch target too small, horizontal scroll on narrow viewports |

---

## 6) Pre-Completion Checklist (mandatory for every automation task)

Before marking any task as complete, **verify all items**:

1. ✅ `git diff --name-only` contains only files in `tests/e2e/`, `playwright.config.ts`
2. ✅ No changes in `src/`, `prisma/`, `vendor/`, `package.json`, `next.config.ts`, `.env*`, `public/`
3. ✅ If a bug was found → reported via issue tracker, source code NOT modified
4. ✅ No bug report files created in the repo (no `BUG-NNN.md`)
5. ✅ Test data uses unique identifiers (`runId`, test-specific prefix)
6. ✅ Full test suite passes: `pnpm exec playwright test`
7. ✅ Never uses `npm` or `npx` — only `pnpm` / `pnpm exec`
8. ✅ No `waitForLoadState('networkidle')` — use `waitForPageReady()` instead
9. ✅ No hardcoded URLs, ports, or credentials — everything comes from `config`
10. ✅ `.gitignore` changes only add entries that automation actually generates
11. ✅ Visual regression baselines are committed in `tests/e2e/**/*.ts-snapshots/`
12. ✅ `toHaveScreenshot()` calls include meaningful names and appropriate thresholds
13. ✅ Dynamic content is masked in visual comparison screenshots
14. ✅ Accessibility scans run without critical violations (or violations are tracked as known bugs)

---

## 7) Visual Testing & Evidence Capture

### 7.1) Screenshot evidence with `screenshotStep`

Every meaningful step in a UI test **MUST** use `screenshotStep()` to build a visual evidence trail:

```typescript
await screenshotStep('User clicks Submit button', async (p) => {
  await p.locator('button[type="submit"]').click();
}, page, { highlightTarget: page.locator('button[type="submit"]') });
```

#### Screenshot evidence rules

| Rule | Why |
|------|-----|
| Use `screenshotStep` for every user-facing action | Visual evidence for dashboard report |
| Include `highlightTarget` when targeting a specific element | Red dashed border + label badge makes evidence clear |
| Use `fullPageWithHighlight: true` for form submissions | Captures full form context |
| Never rely on full-page screenshots alone | Cropped screenshots with highlight are more informative |
| Capture before/after for state changes | Proves the UI actually changed (e.g., toast appeared, row deleted) |

#### Screenshot configuration in `playwright.config.ts`

```typescript
use: {
  screenshot: isCI ? 'off' : 'on',              // CI: off (lean) / Local: full evidence
  video: isCI ? 'off' : 'retain-on-failure',     // CI: off / Local: keep on failure
  trace: isCI ? 'off' : 'retain-on-failure',     // CI: off / Local: keep on failure
}
```

### 7.2) Failure API logging with `failureApiLogger`

For tests that interact with API-backed features, attach `failureApiLogger` to capture network requests/responses. Logs are recorded silently and attached to test results **ONLY when the test fails** — zero overhead on passing tests.

```typescript
test.describe('Feature Name', { tag: ['@regression'] }, () => {
  test.beforeEach(async ({ adminPage, failureApiLogger }) => {
    failureApiLogger(adminPage);
  });

  test('SCN-001: ...', async ({ adminPage: page }) => {
    // Test code here — if this test fails, API logs are auto-attached
  });
});
```

#### Failure API logging rules

| Rule | Why |
|------|-----|
| Use `failureApiLogger` in `beforeEach` for API-backed features | Captures all `/api/` requests and responses during test |
| Logs attach ONLY on failure | Zero noise on passing tests, maximum signal on failures |
| Includes timestamps, method, URL, status, response body | Quickly determine: FE rendering bug or API response error |
| Status codes: ✅ 2xx/3xx, ❌ 4xx/5xx | Visual signal for API errors |
| Do NOT use for visual-only or accessibility-only tests | Not relevant — those tests don't depend on API responses |

### 7.3) Visual regression testing with `toHaveScreenshot`

Visual regression tests compare the current UI against committed baseline screenshots. They catch unintended visual changes — layout shifts, font changes, color regressions, broken alignments.

#### Writing visual regression assertions

```typescript
// Full page visual comparison
await expect(page).toHaveScreenshot('homepage-hero.png', {
  fullPage: true,
  maxDiffPixelRatio: 0.01,
  mask: [page.locator('[data-testid="dynamic-timestamp"]')],
});

// Component-level visual comparison
const card = page.locator('[data-testid="product-card"]').first();
await expect(card).toHaveScreenshot('product-card-default.png', {
  maxDiffPixelRatio: 0.01,
});

// Responsive visual comparison
for (const viewport of [{ width: 375, height: 812 }, { width: 1440, height: 900 }]) {
  await page.setViewportSize(viewport);
  await expect(page).toHaveScreenshot(`nav-${viewport.width}x${viewport.height}.png`, {
    fullPage: false,
    maxDiffPixelRatio: 0.01,
  });
}
```

#### Visual regression rules

| Rule | Details |
|------|---------|
| **Baseline naming** | Use descriptive names: `{feature}-{state}-{viewport}.png` |
| **Threshold** | Always set `maxDiffPixelRatio` (recommended: `0.01`–`0.02`) or `maxDiffPixels` — never use exact match |
| **Mask dynamic content** | Use `mask` option for timestamps, user avatars, randomized content, ads |
| **Disable animations** | Set `reducedMotion: 'reduce'` in config or call `page.emulateMedia()` before screenshot |
| **Wait for stability** | Call `waitForPageReady()` and ensure no pending network requests before comparison |
| **Baseline commits** | Baselines live in `tests/e2e/**/*.ts-snapshots/` and MUST be committed to the repo |
| **Update baselines intentionally** | Run `pnpm exec playwright test --update-snapshots` only when visual changes are intentional |

#### Baseline file structure

```text
tests/e2e/
├── specs/
│   └── homepage.spec.ts
│       └── homepage.spec.ts-snapshots/
│           ├── homepage-hero-chromium-linux.png
│           ├── homepage-hero-chromium-darwin.png
│           └── homepage-hero-chromium-win32.png
```

> **Platform-specific baselines**: Playwright generates separate baselines per OS due to font rendering differences. CI baselines should be generated in the CI environment.

### 7.4) Layout integrity verification

Layout tests verify structural correctness — element positioning, sizing, overflow, and alignment. These complement visual regression by asserting specific layout properties programmatically.

```typescript
// Verify no horizontal overflow
const body = page.locator('body');
const bodyBox = await body.boundingBox();
const viewportSize = page.viewportSize();
expect(bodyBox!.width).toBeLessThanOrEqual(viewportSize!.width);

// Verify element is within viewport
const cta = page.getByRole('button', { name: 'Get Started' });
const ctaBox = await cta.boundingBox();
expect(ctaBox!.x).toBeGreaterThanOrEqual(0);
expect(ctaBox!.x + ctaBox!.width).toBeLessThanOrEqual(viewportSize!.width);

// Verify elements don't overlap
const header = page.locator('header');
const main = page.locator('main');
const headerBox = await header.boundingBox();
const mainBox = await main.boundingBox();
expect(mainBox!.y).toBeGreaterThanOrEqual(headerBox!.y + headerBox!.height);

// Verify text is not truncated (no unexpected ellipsis)
const title = page.getByRole('heading', { level: 1 });
const isOverflowing = await title.evaluate(
  (el) => el.scrollWidth > el.clientWidth
);
expect(isOverflowing).toBe(false);
```

#### Layout rules

| Rule | Details |
|------|---------|
| Check horizontal overflow on every page | No unintended horizontal scroll bars |
| Verify critical CTAs are visible without scrolling | Above-the-fold placement for primary actions |
| Test text truncation on long content | Use realistic-length test data, check for overflow |
| Verify spacing consistency | Structural elements should not overlap or collapse |
| Test across breakpoints | At minimum: mobile (375px), tablet (768px), desktop (1440px) |

### 7.5) Accessibility testing

Accessibility scans detect violations of WCAG guidelines. Use `@axe-core/playwright` for automated audits integrated into test flows.

```typescript
import AxeBuilder from '@axe-core/playwright';

// Full page accessibility scan
const results = await new AxeBuilder({ page })
  .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
  .analyze();

expect(results.violations).toEqual([]);

// Scoped scan — only a specific component
const dialog = page.getByRole('dialog');
const dialogResults = await new AxeBuilder({ page })
  .include('[role="dialog"]')
  .withTags(['wcag2a', 'wcag2aa'])
  .analyze();

expect(dialogResults.violations).toEqual([]);
```

#### Accessibility rules

| Rule | Details |
|------|---------|
| **Scan every page at least once** | Include a11y scan in the main flow of each page-level test |
| **Scan after dynamic content changes** | Modals, dropdowns, expanded sections — scan after they appear |
| **Use WCAG 2.1 AA as minimum** | Tags: `['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']` |
| **Track known violations** | If a violation is an existing app issue, report it and add to known-bugs annotation |
| **Exclude false positives explicitly** | Use `.exclude()` with a comment explaining why |
| **Test keyboard navigation** | Tab through forms, verify focus order, ensure no keyboard traps |
| **Verify focus indicators** | All interactive elements must have visible focus styles |
| **Check color contrast** | axe-core handles this automatically via WCAG contrast rules |

### 7.6) Responsive & viewport testing

Test the application across multiple viewport sizes to catch responsive design issues.

```typescript
const viewports = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

for (const vp of viewports) {
  test(`navigation renders correctly on ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto('/');
    await waitForPageReady(page);

    // Mobile: hamburger menu visible, desktop nav hidden
    if (vp.width < 768) {
      await expect(page.getByRole('button', { name: /menu/i })).toBeVisible();
      await expect(page.getByRole('navigation')).toBeHidden();
    } else {
      await expect(page.getByRole('navigation')).toBeVisible();
    }

    // Visual regression per viewport
    await expect(page).toHaveScreenshot(`nav-${vp.name}.png`, {
      maxDiffPixelRatio: 0.01,
    });

    // Accessibility scan per viewport
    const a11y = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(a11y.violations).toEqual([]);
  });
}
```

#### Viewport rules

| Rule | Details |
|------|---------|
| **Test at least 3 breakpoints** | Mobile (≤ 480px), Tablet (768px), Desktop (≥ 1280px) |
| **Use `page.setViewportSize()`** | Do not rely on Playwright project config alone for responsive tests |
| **Verify touch targets on mobile** | Minimum 44×44px for interactive elements (WCAG 2.5.5) |
| **Check for content reflow** | Content must reflow without horizontal scrolling at 320px width (WCAG 1.4.10) |
| **Test orientation** | Portrait and landscape where relevant |
| **Use device emulation for mobile tests** | Set `hasTouch: true`, `isMobile: true` when testing mobile-specific interactions |

---

## 8) CI Workflow Rules

### Artifact cleanup before each run

- `global-setup.ts` MUST delete stale generated folders before DB setup or login begins
- Required cleanup targets: `test-results/`, `playwright-report/`, `blob-report/`, `tests/e2e/.auth/`
- After cleanup, recreate `tests/e2e/.auth/` immediately so login state files are always written into a fresh directory
- Keep all generated runtime output under the configured artifact roots; do not write ad-hoc files beside specs/pages/helpers

### Required GitHub Actions steps

1. Checkout → pnpm → Node → `pnpm install --frozen-lockfile`
2. `pnpm exec playwright install --with-deps chromium`
3. (Optional) DB service, migrations, seed
4. `pnpm exec playwright test` with `CI=true`
5. **Upload JSON results** (`if: always()`):
   - `playwright-report/results.json` → retention: 14 days
   - No HTML report, no test-results/ (screenshots/video/trace are OFF in CI)
6. Write PR summary from `results.json`

### Visual baseline handling in CI

| Scenario | Action |
|----------|--------|
| First CI run (no baselines exist) | Fail the visual tests, then generate baselines locally with `pnpm exec playwright test --update-snapshots` and commit them |
| Baselines exist, tests pass | Normal — no action needed |
| Baselines exist, visual diff detected | Test fails → reproduce locally in Manual mode to review diff images |
| Intentional visual change (redesign, new feature) | Update baselines locally: `pnpm exec playwright test --update-snapshots`, then commit |
| Baseline mismatch due to OS font rendering | Generate platform-specific baselines in CI Docker container, commit them |

#### CI baseline workflow

```yaml
# CI does NOT upload visual diff artifacts — screenshots/trace/video are OFF.
# Visual regression failures appear as test failures in results.json.
# To inspect diffs, reproduce the failure locally in Manual mode:
#   pnpm exec playwright test --grep "@visual" --retries 0
#   open playwright-report/dashboard.html
```

> **Important**: Never auto-update baselines in CI. Visual changes must be reviewed and committed by a human.

### CI-specific config behavior

| Setting | Manual (local) | CI (lean) |
|---------|----------------|-----------|
| `retries` | 1 | 2 |
| `workers` | 2 | 4 |
| `screenshot` | `on` | `off` |
| `video` | `retain-on-failure` | `off` |
| `trace` | `retain-on-failure` | `off` |
| `forbidOnly` | false | true |
| `globalTeardown` | Keep DB | DROP DB |
| Reporters | list + html + dashboard | list + json |
| Artifacts | N/A (local) | `results.json` only |

### Visual testing CI additions

```typescript
// playwright.config.ts — CI-specific visual testing settings
const isCI = !!process.env.CI;

export default defineConfig({
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,       // Allow 1% pixel difference
      animations: 'disabled',         // Freeze CSS animations
      caret: 'hide',                  // Hide blinking cursor
    },
  },
  use: {
    reducedMotion: 'reduce',          // Disable motion for stable screenshots
    // CI: lean — no artifacts generated
    screenshot: isCI ? 'off' : 'on',
    video: isCI ? 'off' : 'retain-on-failure',
    trace: isCI ? 'off' : 'retain-on-failure',
  },
});
```

> **Note**: Even with `screenshot: 'off'` in CI, `toHaveScreenshot()` assertions still work — Playwright captures the screenshot internally for comparison but does not persist it as an artifact. Visual regression baselines are still compared correctly.

### Secrets management

- Store credentials in `GitHub Secrets` (e.g., `E2E_ADMIN_PASSWORD`)
- Reference in workflow: `${{ secrets.E2E_ADMIN_PASSWORD }}`
- **NEVER** hardcode passwords in workflow YAML

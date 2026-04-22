---
description: "Create test data, fixtures, visual testing setup, accessibility scanning, global setup/teardown, reporters, and reset strategy for stable UI/UX E2E execution."
agent: "agent"
tools: ['search', 'edit', 'new', 'todos', 'problems', 'changes', 'runCommands', 'runTasks']
---

# Create Test Fixtures & Data

Read scenarios and test code to create the data support layer: fixtures, auth state, visual testing setup, accessibility scanning, global setup/teardown, reporters, and seed/reset strategy.

> **Templates**: Use `../templates/tests/e2e/fixtures/` as reference implementation. Copy and adapt files as needed — search for `TODO:` markers.

## Role

Staff SDET + Test Data Engineer + Playwright Framework Engineer + UI/UX Quality Infrastructure Specialist.

## Input

| Variable | Required | Description |
|----------|----------|-------------|
| `SCENARIO_SOURCE` | Yes | Scenario docs (default: `tests/e2e/docs/scenarios/`) |
| `TEST_CODE_SOURCE` | No | Existing test code in `tests/e2e/specs/` |
| `TARGET_ENV` | No | Default: `local` |
| `DATA_SCOPE` | No | `full` / `auth-only` / `fixtures-only` / `reset-only` / `reporter-only` / `visual-only` / `a11y-only` |

## Output

Create or update files in `tests/e2e/`:

| Path | Content |
|------|---------|
| `fixtures/global-setup.ts` | Clean artifacts, DB isolation, migrations, seed, multi-role login → storageState |
| `fixtures/global-teardown.ts` | Local: keep DB intact / CI: drop database |
| `fixtures/ui.fixture.ts` | Pre-authenticated pages per role + screenshotStep + runId |
| `fixtures/visual.fixture.ts` | Viewport configurations, visual comparison helpers, snapshot config |
| `fixtures/a11y.fixture.ts` | Axe-core integration, WCAG scan fixture, violation report attachment |
| `fixtures/data.fixture.ts` | Test entity create/delete helpers via API (for UI test data setup) |
| `fixtures/index.ts` | Barrel export |
| `reporters/dashboard-reporter.ts` | Visual HTML dashboard with UI quality metrics |
| `config/index.ts` | Update with credentials, routes, viewports if needed |

## Fixture Architecture (reference)

```text
playwright.config.ts
  ├── globalSetup → fixtures/global-setup.ts
  │   ├── Clean previous run artifacts (test-results/, playwright-report/)
  │   ├── Create test database (IF NOT EXISTS)
  │   ├── TRUNCATE all tables (preserve DB for connection pool)
  │   ├── Run prisma migrate deploy
  │   ├── Seed base data (prisma/seed.ts)
  │   ├── Kill stale dev server if DB connection is broken
  │   ├── Register non-admin users via API
  │   └── Login each role → save storageState to tests/e2e/.auth/
  │
  ├── globalTeardown → fixtures/global-teardown.ts
  │   ├── Local: keep DB intact (dev server reuses connection pool)
  │   └── CI: DROP DATABASE completely
  │
  ├── snapshotDir → tests/e2e/specs  (co-located baselines)
  ├── snapshotPathTemplate → {testDir}/{testFileDir}/{testFileName}-snapshots/{arg}{-projectName}{ext}
  │
  └── projects[]
      ├── Desktop Chrome  → viewport: 1280x720
      ├── Mobile Chrome   → viewport: 375x667, isMobile: true
      └── Tablet Chrome   → viewport: 768x1024

fixtures/ui.fixture.ts
  ├── adminPage  → Page with storageState: tests/e2e/.auth/admin.json
  ├── userAPage  → Page with storageState: tests/e2e/.auth/userA.json
  ├── userBPage  → Page with storageState: tests/e2e/.auth/userB.json
  ├── runId      → Unique identifier from generateRunId()
  ├── screenshotStep → Visual evidence capture per step with highlighting
  └── failureApiLogger → Captures API req/res, attaches ONLY on test failure

fixtures/visual.fixture.ts
  ├── Extends ui.fixture.ts
  ├── viewportConfig  → Current project viewport settings
  ├── snapshotConfig  → { maxDiffPixelRatio, threshold, animations }
  ├── compareScreenshot(name, locator?, options?) → wraps toHaveScreenshot with defaults
  └── captureBaseline(name, locator?) → convenience for initial baseline capture

fixtures/a11y.fixture.ts
  ├── Extends ui.fixture.ts
  ├── axeScan(options?)   → Runs AxeBuilder scan, returns results
  ├── assertA11y(options?) → Asserts no critical/serious violations, attaches report
  └── a11yReport          → Formatted violation report attached to test artifacts

fixtures/data.fixture.ts
  ├── createCategory(api, data)
  ├── createArticle(api, data)
  ├── createPage(api, data)
  ├── deleteArticle(api, slug)
  ├── deleteCategory(api, slug)
  ├── seedMinimalDataSet(adminApi, runId) → returns actual slugs
  └── cleanupDataSet(adminApi, data)
  NOTE: These seed test data via API for UI test preconditions — not for API testing
```

## Implementation Rules

### Global Setup (`fixtures/global-setup.ts`)
1. **Clean previous artifacts** — remove `test-results/` and `playwright-report/` directories
2. **Clean snapshot diffs** — remove stale `*-diff.png` and `*-actual.png` from snapshot directories
3. **Create isolated test database** — adapt for your DB (e.g., `docker compose exec db ...`)
4. **TRUNCATE all tables** — preserves DB and connection pool, clears data
5. **Run migrations** — adapt for your ORM (e.g., Prisma, Sequelize, Drizzle)
6. **Seed base data** — adapt for your seeding mechanism
7. **Kill stale dev server** — probe health endpoint, kill port if server returns 500
8. **Ensure `.auth/` directory exists**
9. **Register non-admin users** — via API (idempotent, ignores 400/409/422)
10. **Login each role** — via browser, save `storageState` to `.auth/`
11. All shell commands use `execSync` with timeout and proper error handling

> **⚠️ ALWAYS use the `run()` helper below for every `execSync` call — never call `execSync` directly without a timeout. A bare `execSync` with no timeout will hang the runner indefinitely if the command blocks (e.g., docker-compose waiting for a port, prisma migrate waiting for a DB lock).**

```typescript
import { execSync } from 'child_process';

/**
 * Timeout-safe execSync wrapper.
 * @param cmd  Shell command to execute
 * @param label  Human-readable label for log output
 * @param timeoutMs  Kill the process if it exceeds this duration (milliseconds)
 */
function run(cmd: string, label: string, timeoutMs: number): void {
  console.log(`[setup] ${label}…`);
  try {
    execSync(cmd, { stdio: 'pipe', timeout: timeoutMs });
    console.log(`[setup] ✅ ${label}`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[setup] ❌ ${label} failed: ${message}`);
    process.exit(1);
  }
}

// Usage examples with recommended timeouts:
run('docker compose up -d mysql', 'Start MySQL container', 30_000);        // 30 s
run('pnpm exec prisma migrate deploy', 'Run Prisma migrations', 60_000);   // 60 s
run('pnpm exec prisma db seed', 'Seed base data', 30_000);                 // 30 s
```

**Timeout guidelines**:
| Command category | Recommended timeout |
|-----------------|---------------------|
| `docker compose up` | 30 s |
| `prisma migrate deploy` | 60 s |
| `prisma db seed` | 30 s |
| `psql` / `mysql` one-liner | 15 s |
| `curl` health check | 10 s |

### Global Teardown (`fixtures/global-teardown.ts`)
- **Local mode**: Keep DB intact — dev server reuses its Prisma connection pool across runs. Dropping the DB leaves the running server with a dead connection
- **CI mode**: DROP DATABASE completely — server is ephemeral, no reuse
- Detection: `!!process.env.CI`

### UI Fixture (`fixtures/ui.fixture.ts`)
- **Pre-authenticated pages**: `adminPage`, `userAPage`, `userBPage` via `storageState`
- **`runId`**: unique per-test identifier from `generateRunId()`
- **`screenshotStep(stepName, action, page, options?)`**: wraps `test.step()` with:
  - Element highlighting (dashed red border + badge)
  - Smart cropped or full-page screenshots
  - Base64 attachment to test results for reporter consumption
- Storage state paths must match `global-setup.ts`
- **`failureApiLogger(page)`**: captures all `/api/` requests and responses on a page, but attaches logs to test results **ONLY when the test fails**. Purpose: quickly determine if a failure is FE rendering or API response error.
  - Logs include: timestamp, method, URL, request body (truncated), response status (✅/❌), response body (truncated)
  - Usage: call in `beforeEach` to auto-attach on any page used in the test
  - Logs are grouped under `🔌 API Logs (failure debug)` attachment
  - Zero overhead on passing tests — logs are collected but discarded on success

### Visual Fixture (`fixtures/visual.fixture.ts`)
- **Extends `ui.fixture.ts`** — inherits all page fixtures and screenshotStep
- **`viewportConfig`**: exposes current project viewport settings for assertions
- **`snapshotConfig`**: default comparison settings applied to all visual tests

```typescript
snapshotConfig: {
  maxDiffPixelRatio: 0.01,
  threshold: 0.2,
  animations: 'disabled' as const,
}
```

- **`compareScreenshot(name, locator?, options?)`**: convenience wrapper around `toHaveScreenshot()`:
  - Merges default `snapshotConfig` with per-call options
  - Automatically applies `animations: 'disabled'`
  - Supports element-level or full-page comparison
- **`captureBaseline(name, locator?)`**: saves screenshot with consistent naming for baseline management
- Fixture waits for fonts and images to load before comparisons

### Accessibility Fixture (`fixtures/a11y.fixture.ts`)
- **Extends `ui.fixture.ts`** — inherits all page fixtures
- **`axeScan(options?)`**: runs `AxeBuilder` scan on the current page
  - Default tags: `['wcag2a', 'wcag2aa', 'wcag21aa']`
  - Supports `include`/`exclude` selectors
  - Returns full `AxeResults` object
- **`assertA11y(options?)`**: asserts no violations at or above impact threshold
  - Default threshold: `'serious'` (catches critical + serious)
  - On failure: attaches formatted violation report as test artifact
  - Report includes: violation ID, impact, description, affected nodes, fix suggestion
- **`a11yReport`**: formatted string of all violations from the last scan, for manual review attachment

```typescript
// Example: a11y.fixture.ts structure
import { test as uiTest } from './ui.fixture';
import AxeBuilder from '@axe-core/playwright';

export const a11yTest = uiTest.extend<{
  axeScan: (options?: AxeScanOptions) => Promise<AxeResults>;
  assertA11y: (options?: AssertA11yOptions) => Promise<void>;
}>({
  axeScan: async ({ adminPage }, use) => {
    const scan = async (options?: AxeScanOptions) => {
      let builder = new AxeBuilder({ page: adminPage })
        .withTags(options?.tags ?? ['wcag2a', 'wcag2aa', 'wcag21aa']);
      if (options?.include) builder = builder.include(options.include);
      if (options?.exclude) builder = builder.exclude(options.exclude);
      return builder.analyze();
    };
    await use(scan);
  },
  assertA11y: async ({ adminPage, axeScan }, use, testInfo) => {
    const assert = async (options?: AssertA11yOptions) => {
      const results = await axeScan(options);
      const threshold = options?.impactThreshold ?? 'serious';
      const filtered = filterByImpact(results.violations, threshold);
      if (filtered.length > 0) {
        const report = formatViolations(filtered);
        await testInfo.attach('a11y-violations', {
          body: report,
          contentType: 'text/plain',
        });
        expect(filtered, `Found ${filtered.length} a11y violations`).toHaveLength(0);
      }
    };
    await use(assert);
  },
});
```

### Data Fixture (`fixtures/data.fixture.ts`)
- Create/delete helpers via API calls — used for **seeding UI test preconditions**
- `seedMinimalDataSet()` returns actual slugs from API responses
- `cleanupDataSet()` deletes in reverse order (articles → child categories → root categories)
- Error handling: `catch(() => {})` for cleanup operations (entity may not exist)
- Data fixtures provide test data for UI testing, not for API contract testing

### Dashboard Reporter (`reporters/dashboard-reporter.ts`)
- Generates visual HTML dashboard alongside Playwright's built-in report
- Features: step grouping, speed indicators, inline base64 screenshots, collapsible sections
- **UI quality metrics section**:
  - Visual regression rate: % of visual tests passing vs failing
  - Layout issues found: overflow, cutoff text, clipping counts
  - Accessibility violations: count by severity (critical, serious, moderate, minor)
  - Viewport coverage: matrix showing which viewports were tested per feature
  - Screenshot diff gallery: side-by-side expected vs actual for failed visual tests
- Filters out internal Playwright steps (hooks, fixtures, expect internals)
- **Local only** — do NOT include in CI reporters (large file size from base64 screenshots)
- See `instructions/reporting.instructions.md` for full reporter stack rules

### Reporter Configuration in `playwright.config.ts`

```typescript
const reporters: ReporterDescription[] = [['list']];

if (isCI) {
  reporters.push(
    ['json', { outputFile: 'playwright-report/results.json' }],
  );
} else {
  reporters.push(
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['./tests/e2e/reporters/dashboard-reporter.ts',
      { outputFolder: 'playwright-report', openOnEnd: true }],
  );
}
```

> **⚠️ Always set `open` explicitly on the HTML reporter. Omitting it or using `open: 'always'` blocks the process indefinitely in headless/Docker/CI environments. Use `open: 'never'` locally and omit HTML entirely in CI.**

### Snapshot Configuration in `playwright.config.ts`

```typescript
{
  snapshotDir: './tests/e2e/specs',
  snapshotPathTemplate: '{testDir}/{testFileDir}/{testFileName}-snapshots/{arg}{-projectName}{ext}',
  expect: {
    timeout: 10_000,
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,
      animations: 'disabled',
      threshold: 0.2,
    },
    toMatchSnapshot: {
      maxDiffPixelRatio: 0.01,
    },
  },
}
```

### Multi-Project Configuration for Viewports

```typescript
projects: [
  {
    name: 'Desktop Chrome',
    use: {
      ...devices['Desktop Chrome'],
      viewport: { width: 1280, height: 720 },
    },
  },
  {
    name: 'Mobile Chrome',
    use: {
      ...devices['Pixel 5'],
      viewport: { width: 375, height: 667 },
    },
  },
  {
    name: 'Tablet Chrome',
    use: {
      ...devices['iPad (gen 7)'],
      viewport: { width: 768, height: 1024 },
    },
  },
],
```

### Artifact Hygiene

Files that MUST be gitignored (never committed):

```gitignore
test-results/          # Screenshots, traces, videos per test
playwright-report/     # Built-in HTML report
blob-report/           # CI sharding intermediate
tests/e2e/.auth/       # Session cookies (security risk)
*-actual.png           # Visual regression actual screenshots
*-diff.png             # Visual regression diff images
```

Files that SHOULD be committed:

```gitignore
# DO commit these:
tests/e2e/specs/**/*-snapshots/**/*.png   # Visual regression baselines
```

> **`.gitignore` discipline**: Only add entries that E2E automation actually generates. NEVER add app-level entries.

### General Rules
- Reuse existing fixtures before creating new ones
- Do NOT put business logic in fixtures — keep tests transparent
- Do NOT modify `core/` unless explicitly requested
- `storageState` files in `.auth/` are gitignored
- All paths relative to repo root (Playwright CWD)
- Visual fixture extends UI fixture — do not duplicate page setup logic
- Every run must start by deleting `test-results/`, `playwright-report/`, `blob-report/`, and `tests/e2e/.auth/`
- `playwright.config.ts` must set `outputDir: 'test-results'` so generated files stay in one disposable root
- A11y fixture extends UI fixture — do not duplicate page setup logic

### Validation
1. Run `pnpm exec playwright test --list` to verify fixtures resolve
2. Run targeted tests if environment is available
3. If environment is unavailable, document blocker clearly
4. Verify `@axe-core/playwright` is in `devDependencies`
5. Run `pnpm exec playwright test --update-snapshots` to generate initial baselines

## Playwright Config Reference (`playwright.config.ts`)

Key settings that fixtures must align with:

```typescript
{
  testDir: './tests/e2e/specs',
  timeout: 45_000,
  expect: {
    timeout: 10_000,
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,
      animations: 'disabled',
      threshold: 0.2,
    },
  },
  snapshotPathTemplate: '{testDir}/{testFileDir}/{testFileName}-snapshots/{arg}{-projectName}{ext}',
  outputDir: 'test-results',
  fullyParallel: false,
  retries: isCI ? 2 : 1,
  workers: isCI ? 4 : 2,
  use: {
    baseURL: 'http://localhost:3001',
    trace: isCI ? 'off' : 'retain-on-failure',
    screenshot: isCI ? 'off' : 'on',
    video: isCI ? 'off' : 'retain-on-failure',
    viewport: { width: 1280, height: 720 },
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  globalSetup: './tests/e2e/fixtures/global-setup.ts',
  globalTeardown: './tests/e2e/fixtures/global-teardown.ts',
  projects: [
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 720 } },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'], viewport: { width: 375, height: 667 } },
    },
    {
      name: 'Tablet Chrome',
      use: { ...devices['iPad (gen 7)'], viewport: { width: 768, height: 1024 } },
    },
  ],
  webServer: {
    command: 'pnpm dev --port 3001',
    url: 'http://localhost:3001/auth/signin',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
}
```

## Environment Variables

Credentials and configuration belong in `config/index.ts` with `process.env` fallback defaults.
Do NOT create or modify `.env.test` — it is project-specific and outside automation scope.

```typescript
// config/index.ts — single source of truth
const config = {
  baseUrl: process.env.BASE_URL || "http://localhost:3000",
  credentials: {
    admin: {
      email: process.env.ADMIN_EMAIL || "admin@example.com",
      password: process.env.ADMIN_PASSWORD || "Admin@123!",
    },
  },
  viewports: {
    desktop: { width: 1280, height: 720 },
    tablet: { width: 768, height: 1024 },
    mobileLandscape: { width: 667, height: 375 },
    mobilePortrait: { width: 375, height: 667 },
  },
};
```

## Rules

1. **Evidence-first** — data shapes, auth flows, viewport configs must trace to source/spec
2. **Max 3 assumptions**, clearly labeled
3. **Lightest viable solution** — static data over builders, `beforeAll` over `beforeEach` where safe
4. **No over-engineering** — no custom data framework if simple API calls suffice
5. **Deterministic data** — use bounded randomization with `runId` for traceability
6. **Cache awareness** — account for app cache/revalidation in cleanup/verification
7. **NEVER modify source code** — fixtures NEVER modify files in `src/`, `prisma/schema.prisma`, `vendor/`, `.env*`, `public/`, `package.json`. Fixtures only call API/CLI/DB commands
8. **Dev server connection pooling** — in local mode, the dev server holds the Prisma connection pool. If global-teardown DROPs the database, the pool becomes stale. Solution: TRUNCATE instead of DROP locally, only DROP in CI
9. **Global teardown strategy** — local mode: keep DB intact (dev server reuse). CI mode: drop DB completely
10. **Clean run guarantee** — global-setup removes `test-results/`, `playwright-report/`, and stale snapshot diffs before each run
11. **Auth state management** — global-setup handles all user registration and login, saves `storageState` for each role. Tests consume via fixtures, never perform login themselves
12. **Test data isolation** — each test case uses unique identifiers with `generateRunId()`. NEVER share slugs/titles between test cases. Always read actual slugs from API responses when seeding data, as the server may uniquify them
13. **Cache-aware navigation** — SSR frameworks may cache 404s for previously fetched slugs. Use unique slugs that have never been fetched before to avoid stale cache issues. NEVER fix caching by modifying source code
14. **Use `screenshotStep()`** for every meaningful step in tests to capture visual evidence with consistent formatting and highlighting
15. **Visual baselines** — snapshot baseline images must be committed to version control. Diffs and actuals must be gitignored. Use `--update-snapshots` only for intentional UI changes
16. **Viewport coverage** — multi-project config ensures tests run across desktop, mobile, and tablet. Visual baselines are project-specific (suffixed with project name)
17. **Accessibility scanning** — a11y fixture provides consistent axe-core configuration. Violations are attached to test artifacts for evidence. Default to WCAG 2.1 AA compliance
18. **Test ID prefix** — use `SCN-###` in test titles for traceability to scenario docs
19. **Use config values** — never hardcode URLs, ports, credentials. Always use values from `config`
20. **Validate imports** — after implementation, verify all imports resolve and test discovery works before claiming completion
21. **Run targeted tests** if environment is available to verify stability and correctness
22. **Document blockers** clearly if environment is unavailable or if any assumptions were made during implementation
23. **Output scope** — all fixture and reporter code must be created/modified within `tests/e2e/` only. NEVER modify files outside this scope (e.g., `src/`, `prisma/`, `vendor/`, `.env*`, `public/`, `package.json`)
24. **NEVER modify application source code** — if a bug is found that blocks fixture implementation, report via issue tracker instead of fixing the code. NEVER create bug report files in the repo. Apply workarounds in tests if possible (e.g., unique data, retries, skips) and annotate tests with `test.info().annotations.push({ type: 'known-bug', description: 'ISSUE-URL' })` for visibility. Use `test.fixme()` or `test.skip()` if the bug makes the test impossible to pass. Always run `git diff --name-only` before claiming completion to ensure no files outside `tests/e2e/` were modified.
25. **`.gitignore` discipline** — only add entries that the E2E automation actually generates. NEVER add app-level `.gitignore` entries (e.g., `/public/uploads/`, `data/`, `logs/`)

---
description: "Generate Playwright test code from approved scenarios: page objects, spec files, visual regression tests, layout checks, accessibility tests, and helpers."
agent: "agent"
tools: ['search', 'edit', 'new', 'todos', 'problems', 'changes', 'runCommands', 'runTasks']
---

# Create Playwright Test Code

Read approved scenarios and implement them as Playwright test code following the established framework conventions, with emphasis on UI/UX quality: visual regression, layout integrity, and accessibility.

> **Templates**: Use `../templates/tests/e2e/` as reference implementation. Copy and adapt files as needed — search for `TODO:` markers.

## Role

Staff SDET + Playwright Framework Engineer + TypeScript Engineer + UI/UX Quality Specialist.

## Input

| Variable | Required | Description |
|----------|----------|-------------|
| `SCENARIO_SOURCE` | Yes | Scenario docs (default: `tests/e2e/docs/scenarios/`) |
| `SPEC_SOURCE` | No | Original spec for cross-checking |
| `IMPLEMENT_SCOPE` | No | `full` / `P0-only` / specific feature / specific spec file |
| `TARGET_ENV` | No | Default: `local` |

## Output

Create or update files in `tests/e2e/`:

| Path | Content |
|------|---------|
| `config/index.ts` | Environment config, credentials, routes, viewport presets, `generateRunId()` |
| `core/BasePage.ts` | Base page class (create only if not exists) |
| `core/BaseComponent.ts` | Base component class (create only if not exists) |
| `core/index.ts` | Barrel export |
| `pages/*.page.ts` | Page objects extending `BasePage` |
| `pages/index.ts` | Barrel export for all page objects |
| `helpers/wait-helpers.ts` | `waitForPageReady()` — avoids `networkidle` hang |
| `helpers/visual-helpers.ts` | Layout verification utilities (overflow, cutoff text, bounding box) |
| `helpers/a11y-helpers.ts` | Accessibility scan wrappers using `@axe-core/playwright` |
| `specs/*.spec.ts` | Playwright test specs grouped by feature |

## Framework Structure (reference)

```text
tests/e2e/
├── config/index.ts          ← Config barrel: baseUrl, credentials, routes, viewports, timeouts
├── core/
│   ├── BasePage.ts          ← Abstract base: element registry, navigation, actions, assertions
│   ├── BaseComponent.ts     ← Reusable UI component base with scoped locators
│   └── index.ts
├── fixtures/                ← (handled by prompt 04)
│   ├── global-setup.ts
│   ├── global-teardown.ts
│   ├── ui.fixture.ts        ← adminPage, userAPage, userBPage, screenshotStep, failureApiLogger, runId
│   ├── visual.fixture.ts    ← viewport configurations, visual comparison helpers, snapshot config
│   ├── a11y.fixture.ts      ← axe-core integration, WCAG scan fixture, violation report
│   ├── data.fixture.ts      ← Test data seeding via API for UI test setup
│   └── index.ts
├── helpers/
│   ├── wait-helpers.ts      ← waitForPageReady() — avoids networkidle hang
│   ├── visual-helpers.ts    ← checkOverflow, checkCutoffText, checkElementVisibility, checkBoundingBox
│   └── a11y-helpers.ts      ← runAxeScan, formatViolations, filterByImpact
├── pages/
│   ├── login.page.ts        ← Extends BasePage, registers elements by semantic name
│   ├── admin-dashboard.page.ts
│   ├── article-form.page.ts
│   ├── article-detail.page.ts
│   └── index.ts             ← Barrel export
├── specs/
│   ├── auth-login.spec.ts   ← Domain-grouped spec files
│   ├── admin-dashboard-ui.spec.ts
│   ├── admin-dashboard-visual.spec.ts  ← Visual regression specs
│   ├── admin-dashboard-a11y.spec.ts    ← Accessibility specs
│   └── ...
└── reporters/
    └── dashboard-reporter.ts ← Visual HTML dashboard (local only)
```

## Implementation Rules

### Config (`config/index.ts`)
- Single config object: `baseUrl`, `credentials`, `routes`, `viewports`, `timeouts`
- All values from environment variables with sensible defaults
- Export `generateRunId()` for test data isolation
- Never hardcode URLs, ports, or credentials
- Include viewport presets:

```typescript
viewports: {
  desktop: { width: 1280, height: 720 },
  tablet: { width: 768, height: 1024 },
  mobileLandscape: { width: 667, height: 375 },
  mobilePortrait: { width: 375, height: 667 },
}
```

### Page Objects (`pages/*.page.ts`)
- **Extend `BasePage`** from `../core`
- **Register elements** by semantic name in constructor using `registerElement(name, selector)`
- **Action methods only** (navigate, fill, submit) — NO business assertions in page objects
- **Stable semantic locators**: `getByRole`, `getByLabel`, `getByText`, or CSS selectors as fallback
- **Model custom controls** by actual behavior, not assumed native controls (verify combobox vs native select)
- **Export via** `pages/index.ts` barrel

### Helpers

#### `helpers/wait-helpers.ts`
- `waitForPageReady(page, timeout)` — waits for `domcontentloaded` + network settle
  - **Why**: SSR frameworks (Next.js) keep RSC/HMR connections open → `networkidle` may NEVER resolve
  - **Always** use this instead of `waitForLoadState('networkidle')`
- Keep helpers generic and reusable across specs

#### `helpers/visual-helpers.ts`
Layout verification utilities for detecting UI rendering issues:

```typescript
/**
 * Check if an element overflows its parent container.
 * Returns true if overflow is detected.
 */
export async function checkOverflow(locator: Locator): Promise<{ overflows: boolean; details: string }>;

/**
 * Check if text inside an element is visually cut off (text-overflow: ellipsis or clipping).
 * Compares scrollWidth vs clientWidth and scrollHeight vs clientHeight.
 */
export async function checkCutoffText(locator: Locator): Promise<{ isCutOff: boolean; details: string }>;

/**
 * Verify element is fully visible within the viewport (not clipped by parent or viewport edges).
 */
export async function checkElementVisibility(page: Page, locator: Locator): Promise<{ isFullyVisible: boolean; details: string }>;

/**
 * Verify element bounding box matches expected dimensions within tolerance.
 */
export async function checkBoundingBox(
  locator: Locator,
  expected: { minWidth?: number; maxWidth?: number; minHeight?: number; maxHeight?: number }
): Promise<{ isValid: boolean; actual: BoundingBox; details: string }>;

/**
 * Check that no element in a list overlaps another (e.g., cards in a grid).
 */
export async function checkNoOverlap(locators: Locator[]): Promise<{ hasOverlap: boolean; details: string }>;
```

#### `helpers/a11y-helpers.ts`
Accessibility scan wrappers using `@axe-core/playwright`:

```typescript
import AxeBuilder from '@axe-core/playwright';

/**
 * Run axe accessibility scan on the current page.
 * Returns structured violation results.
 */
export async function runAxeScan(
  page: Page,
  options?: { include?: string[]; exclude?: string[]; tags?: string[] }
): Promise<AxeResults>;

/**
 * Format axe violations into a readable report string.
 */
export function formatViolations(violations: AxeViolation[]): string;

/**
 * Filter violations by impact level: 'critical' | 'serious' | 'moderate' | 'minor'.
 */
export function filterByImpact(violations: AxeViolation[], minImpact: string): AxeViolation[];

/**
 * Assert no critical or serious accessibility violations.
 * Attaches violation report to test results on failure.
 */
export async function assertNoA11yViolations(
  page: Page,
  testInfo: TestInfo,
  options?: { tags?: string[]; impactThreshold?: string }
): Promise<void>;
```

### Spec Files (`specs/*.spec.ts`)
- **Import `test`** from `../fixtures/ui.fixture` (for UI specs), `../fixtures/visual.fixture` (for visual specs), or `../fixtures/a11y.fixture` (for a11y specs)
- **Import `expect`** from `@playwright/test`
- **Import config**: `import { config } from '../config'`
- **Import pages**: `import { LoginPage } from '../pages'`
- **Use `test.describe()`** with tags: `{ tag: ['@regression', '@visual'] }`, `{ tag: ['@a11y'] }`, `{ tag: ['@responsive'] }`
- **Use `test.step()`** with user-action wording (not code-level)
- **Use `screenshotStep()`** fixture for visual evidence at each meaningful step
- **Use `failureApiLogger(page)`** in `beforeEach` for tests that interact with API-backed features — logs appear only on failure, helping quickly distinguish FE rendering bugs from API response errors
- **Test ID prefix**: `SCN-###` for traceability to scenario docs
- **Never hardcode URLs** — use `config.routes.*`
- **Never hardcode credentials** — use `config.credentials.*`

### Visual Regression Testing
- Use `toHaveScreenshot()` for pixel-level comparison against baselines
- Use `toMatchSnapshot()` for structural/text snapshot comparisons
- Baseline images stored in spec-adjacent `*.spec.ts-snapshots/` directories
- Configure `maxDiffPixelRatio` or `maxDiffPixels` for acceptable tolerance
- Always wait for page stability before capturing screenshots (animations complete, fonts loaded)
- Use `{ animations: 'disabled', mask: [...] }` to handle dynamic content (timestamps, avatars, ads)

### Layout Integrity Testing
- Use helpers from `visual-helpers.ts` to detect overflow, cutoff text, and clipping
- Verify critical layouts at multiple viewport sizes
- Check bounding boxes for key elements to catch layout shifts
- Verify no element overlap in grid/list layouts

### Accessibility Testing
- Use `@axe-core/playwright` (`AxeBuilder`) for WCAG 2.1 AA compliance scanning
- Run scans after page is fully loaded and interactive
- Filter by impact level to prioritize critical/serious violations
- Attach violation reports to test results for evidence
- Test keyboard navigation flows in dedicated specs
- Verify focus management after interactions (modal open/close, form submit)

### Responsive/Viewport Testing
- Test critical flows at desktop, tablet, and mobile viewports
- Use `config.viewports.*` for consistent viewport configurations
- Verify layout adaptations (hamburger menu, stacked columns, hidden elements)
- Check touch target sizes on mobile viewports (minimum 44x44 CSS pixels)

### Auth
- **Use pre-authenticated fixtures** (`adminPage`, `userAPage`, `userBPage`) for protected routes
- **ONLY test login UI** in auth-specific specs (`auth-login.spec.ts`)
- `storageState` is saved by `global-setup.ts` and reused across all tests

### Test Data Isolation
- **Every test** must use `runId` from the fixture for unique test data
- **Every test case** should use a prefix: `<test-id>-<purpose>-{runId}` (e.g., `adm-a04-public-{runId}`)
- **Read actual slug/id from API response** — server may uniquify slugs
- **Never share data** between test cases — each test seeds its own data
- **Clean up** in `afterAll` (not `afterEach`) or rely on global-setup TRUNCATE

### Naming Conventions
- Spec files: `<domain>-<type>.spec.ts` (type: `ui`, `visual`, `a11y`, `responsive`)
- Page objects: `<name>.page.ts`
- Helpers: `<name>-helpers.ts` or `<name>.ts`
- All files use **kebab-case**
- Visual regression baselines: auto-generated by Playwright in `*.spec.ts-snapshots/`

### Validation (after implementation)
1. Check all imports resolve correctly
2. Run `pnpm exec playwright test --list` to verify test discovery
3. Run targeted tests if environment is available
4. If environment is unavailable, document the blocker clearly
5. Verify `@axe-core/playwright` is in `devDependencies` — if missing, run `pnpm add -D @axe-core/playwright`
6. Run `pnpm exec playwright test --update-snapshots` to generate initial baselines if needed

> **⛔ HARD GATE — must pass before marking this step complete:**
>
> ```bash
> # Both commands MUST return zero matches. Any match = BLOCK. Fix before proceeding.
> grep -r "networkidle" tests/e2e/
> grep -r "waitForLoadState" tests/e2e/
> ```
>
> If either command returns output:
> 1. Open every matched file
> 2. Replace `waitForLoadState('networkidle')` with `waitForPageReady(page)` from `helpers/wait-helpers.ts`
> 3. Rerun the grep — confirm zero matches before claiming completion
>
> **Why**: SSR/Vite keep HMR/RSC websocket connections open indefinitely. `networkidle` waits for ALL network connections to close — it will NEVER fire, trapping the runner and burning the full test timeout.

## Spec File Templates (reference)

### UI Functional Spec

```typescript
import { config } from '../config';
import { uiTest as test } from '../fixtures/ui.fixture';
import { expect } from '@playwright/test';
import { SomePage } from '../pages';
import { waitForPageReady } from '../helpers/wait-helpers';

test.describe('Feature Name', { tag: ['@regression'] }, () => {
  // Attach API logger to capture req/res — logs appear ONLY on failure
  test.beforeEach(async ({ adminPage, failureApiLogger }) => {
    failureApiLogger(adminPage);
  });

  test('SCN-001: Descriptive test title', async ({ adminPage: page, screenshotStep, runId }) => {
    await screenshotStep('Navigate to target page', async (p) => {
      await p.goto(config.routes.admin.articles);
      await waitForPageReady(p);
    }, page, { highlightTarget: page.locator('h1') });

    await screenshotStep('Verify expected outcome', async (p) => {
      await expect(p.locator('h1')).toContainText('Articles');
    }, page, { highlightTarget: page.locator('h1') });
  });
});
```

### Visual Regression Spec

```typescript
import { config } from '../config';
import { visualTest as test } from '../fixtures/visual.fixture';
import { expect } from '@playwright/test';
import { SomePage } from '../pages';
import { waitForPageReady } from '../helpers/wait-helpers';
import { checkOverflow, checkCutoffText } from '../helpers/visual-helpers';

test.describe('Feature Name — Visual', { tag: ['@visual'] }, () => {
  test('SCN-001-VIS: Page renders consistently', async ({ adminPage: page, screenshotStep }) => {
    await test.step('Navigate and wait for stability', async () => {
      await page.goto(config.routes.admin.dashboard);
      await waitForPageReady(page);
    });

    await test.step('Visual regression check — full page', async () => {
      await expect(page).toHaveScreenshot('dashboard-full.png', {
        fullPage: true,
        animations: 'disabled',
        mask: [page.locator('[data-testid="timestamp"]')],
        maxDiffPixelRatio: 0.01,
      });
    });

    await test.step('Visual regression check — hero section', async () => {
      const hero = page.locator('[data-testid="hero-section"]');
      await expect(hero).toHaveScreenshot('dashboard-hero.png', {
        animations: 'disabled',
      });
    });

    await screenshotStep('Layout integrity — no overflow', async () => {
      const container = page.locator('.main-content');
      const result = await checkOverflow(container);
      expect(result.overflows, `Overflow detected: ${result.details}`).toBe(false);
    }, page);

    await screenshotStep('Layout integrity — no text cutoff', async () => {
      const headings = page.locator('h1, h2, h3');
      const count = await headings.count();
      for (let i = 0; i < count; i++) {
        const result = await checkCutoffText(headings.nth(i));
        expect(result.isCutOff, `Text cutoff at heading ${i}: ${result.details}`).toBe(false);
      }
    }, page);
  });
});
```

### Accessibility Spec

```typescript
import { config } from '../config';
import { a11yTest as test } from '../fixtures/a11y.fixture';
import { expect } from '@playwright/test';
import { waitForPageReady } from '../helpers/wait-helpers';
import { assertNoA11yViolations } from '../helpers/a11y-helpers';

test.describe('Feature Name — Accessibility', { tag: ['@a11y'] }, () => {
  test('SCN-001-A11Y: Page meets WCAG 2.1 AA', async ({ adminPage: page }, testInfo) => {
    await test.step('Navigate to target page', async () => {
      await page.goto(config.routes.admin.dashboard);
      await waitForPageReady(page);
    });

    await test.step('Run accessibility scan', async () => {
      await assertNoA11yViolations(page, testInfo, {
        tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
        impactThreshold: 'serious',
      });
    });

    await test.step('Verify keyboard navigation', async () => {
      await page.keyboard.press('Tab');
      const firstFocused = page.locator(':focus');
      await expect(firstFocused).toBeVisible();
      // Verify focus indicator is visible
      const outline = await firstFocused.evaluate(
        (el) => window.getComputedStyle(el).outlineStyle
      );
      expect(outline).not.toBe('none');
    });
  });
});
```

### Responsive Spec

```typescript
import { config } from '../config';
import { visualTest as test } from '../fixtures/visual.fixture';
import { expect } from '@playwright/test';
import { waitForPageReady } from '../helpers/wait-helpers';
import { checkOverflow, checkElementVisibility } from '../helpers/visual-helpers';

test.describe('Feature Name — Responsive', { tag: ['@responsive'] }, () => {
  const viewports = [
    { name: 'desktop', ...config.viewports.desktop },
    { name: 'tablet', ...config.viewports.tablet },
    { name: 'mobile', ...config.viewports.mobilePortrait },
  ];

  for (const vp of viewports) {
    test(`SCN-001-RSP: Layout at ${vp.name} (${vp.width}x${vp.height})`, async ({ adminPage: page, screenshotStep }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      await test.step('Navigate and verify layout', async () => {
        await page.goto(config.routes.admin.dashboard);
        await waitForPageReady(page);
      });

      await test.step(`Screenshot at ${vp.name}`, async () => {
        await expect(page).toHaveScreenshot(`dashboard-${vp.name}.png`, {
          fullPage: true,
          animations: 'disabled',
        });
      });

      await screenshotStep(`No overflow at ${vp.name}`, async () => {
        const main = page.locator('main');
        const result = await checkOverflow(main);
        expect(result.overflows, `Overflow at ${vp.name}: ${result.details}`).toBe(false);
      }, page);

      if (vp.name === 'mobile') {
        await test.step('Mobile: hamburger menu is visible', async () => {
          await expect(page.getByRole('button', { name: /menu|hamburger/i })).toBeVisible();
        });

        await test.step('Mobile: touch targets meet minimum size', async () => {
          const buttons = page.getByRole('button');
          const count = await buttons.count();
          for (let i = 0; i < count; i++) {
            const box = await buttons.nth(i).boundingBox();
            if (box) {
              expect(box.width, `Button ${i} width too small`).toBeGreaterThanOrEqual(44);
              expect(box.height, `Button ${i} height too small`).toBeGreaterThanOrEqual(44);
            }
          }
        });
      }
    });
  }
});
```

## Rules

1. **Evidence-first** — every selector, route, assertion traces to scenario/spec/source code
2. **No invented selectors** — if selector is unknown, use semantic locator or document blocker
3. **Max 3 assumptions**, clearly labeled
4. **No duplicate login** — use `storageState` fixtures for protected routes
5. **No `core/` changes** unless explicitly requested
6. **Group specs by feature** — don't create one file per test case
7. **NEVER modify source code** — NEVER create/modify files in `src/`, `prisma/`, `vendor/`, `.env*`, `public/`, `package.json`. If app behavior needs to change → report via issue tracker, use workaround in test. NEVER create bug files in repo
8. **Test data isolation** — every test case uses unique slug/title with `generateRunId()` + test-specific prefix. NEVER share slugs between test cases
9. **Read API response** — when seeding data via API, always read actual slug/id from response body. Server may uniquify slugs
10. **Cache-aware navigation** — SSR frameworks may cache 404s. Use unique slugs never previously fetched to avoid stale cache. NEVER fix cache by modifying source code
11. **No `networkidle` — HARD GATE** — NEVER use `waitForLoadState('networkidle')` or any `networkidle` variant anywhere in `tests/e2e/`. SSR/Vite keep HMR websocket connections open indefinitely, causing `networkidle` to block forever and trap the test runner. Always use `waitForPageReady()` from `helpers/wait-helpers.ts`. After implementation, run `grep -r "networkidle" tests/e2e/` — if it returns ANY output, fix immediately before proceeding
12. **Use `screenshotStep()`** for every meaningful step to capture visual evidence
13. **Test ID prefix** — use `SCN-###` in test titles for traceability to scenario docs. Append `-VIS`, `-A11Y`, `-RSP` suffix for visual, accessibility, and responsive variants
14. **Use config values** — never hardcode URLs, ports, or credentials. Always use values from `config`
15. **Validate imports** — after implementation, verify all imports resolve and test discovery works before claiming completion
16. **Run targeted tests** if environment is available to verify stability and correctness
17. **Document blockers** clearly if environment is unavailable or if any assumptions were made during implementation
18. **Output scope** — all test code must be created/modified within `tests/e2e/` only. NEVER modify files outside this scope (e.g., `src/`, `prisma/`, `vendor/`, `.env*`, `public/`, `package.json`)
19. **Visual baselines** — run `--update-snapshots` only when establishing initial baselines or after confirmed intentional UI changes. Never blindly update baselines to make tests pass
20. **Accessibility standards** — default to WCAG 2.1 AA. Scan every page at least once. Attach violation reports to test results
21. **Mask dynamic content** — use `mask` option in `toHaveScreenshot()` for timestamps, avatars, ads, randomized content to avoid false visual regressions
22. **Responsive coverage** — test critical user flows at minimum desktop and mobile viewports. Document which viewports are covered per feature
23. **Layout stability** — wait for fonts, images, and animations to complete before capturing visual snapshots. Use `animations: 'disabled'` where appropriate
24. **NEVER modify application source code** — if a bug is found that blocks test implementation, report via issue tracker instead of fixing the code. NEVER create bug report files in the repo. Apply workarounds in tests if possible (e.g., unique data, retries, skips) and annotate tests with `test.info().annotations.push({ type: 'known-bug', description: 'ISSUE-URL' })` for visibility. Use `test.fixme()` or `test.skip()` if the bug makes the test impossible to pass. Always run `git diff --name-only` before claiming completion to ensure no files outside `tests/e2e/` were modified.

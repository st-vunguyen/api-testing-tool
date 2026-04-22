---
name: e2e-ui-testing
description: 'Write E2E UI/UX tests using Playwright: functional UI, visual regression, layout integrity, accessibility, and responsive design verification'
---

# E2E UI/UX Testing Skill

## Tool Compatibility

This skill is shared between both supported assistant layouts:

- Copilot VS Code → `.github/instructions/` + `.github/prompts/e2e-playwright/` + `testing/SKILL.md`
- Claude Code → `.claude/agents/` + `.claude/rules/` + `.claude/prompts/e2e-playwright/` + `testing/SKILL.md`

`testing/SKILL.md` is a committed support file, not a generated artifact.

## Trigger

Use this skill when asked to:
- Write E2E tests for a page, feature, or user flow
- Add visual regression tests for a component or page
- Verify layout integrity (overflow, cutoff text, element overlap)
- Run accessibility audits (WCAG 2.1 AA compliance)
- Test responsive design across multiple viewports
- Create page objects for UI interactions

## Functional UI Spec Template

```typescript
// tests/e2e/specs/[feature]-ui.spec.ts

import { config } from '../config';
import { uiTest as test } from '../fixtures/ui.fixture';
import { expect } from '@playwright/test';
import { FeaturePage } from '../pages';
import { waitForPageReady } from '../helpers/wait-helpers';

test.describe('Feature Name', { tag: ['@regression'] }, () => {
  // Attach API logger — logs appear ONLY on test failure for FE vs API diagnosis
  test.beforeEach(async ({ adminPage, failureApiLogger }) => {
    failureApiLogger(adminPage);
  });

  test('SCN-001: User completes the primary journey', async ({
    adminPage: page,
    screenshotStep,
    runId,
  }) => {
    const featurePage = new FeaturePage(page);

    await screenshotStep('Navigate to feature page', async (p) => {
      await p.goto(config.routes.feature);
      await waitForPageReady(p);
    }, page, { highlightTarget: page.locator('h1') });

    await screenshotStep('Fill in the form and submit', async (p) => {
      await featurePage.fillForm({ title: `Test Item ${runId}` });
      await featurePage.submit();
    }, page, { highlightTarget: page.locator('button[type="submit"]') });

    await screenshotStep('Verify success state', async (p) => {
      await expect(p.getByText('Successfully created')).toBeVisible();
    }, page);
  });

  test('SCN-002: Validation errors display correctly', async ({
    adminPage: page,
    screenshotStep,
  }) => {
    await page.goto(config.routes.feature);
    await waitForPageReady(page);

    await screenshotStep('Submit empty form', async (p) => {
      await p.locator('button[type="submit"]').click();
    }, page, { highlightTarget: page.locator('button[type="submit"]') });

    await screenshotStep('Verify error messages appear', async (p) => {
      await expect(p.getByText('This field is required')).toBeVisible();
    }, page, { highlightTarget: page.getByText('This field is required') });
  });
});
```

## Visual Regression Spec Template

```typescript
// tests/e2e/specs/[feature]-visual.spec.ts

import { config } from '../config';
import { visualTest as test } from '../fixtures/visual.fixture';
import { expect } from '@playwright/test';
import { waitForPageReady } from '../helpers/wait-helpers';
import { checkOverflow, checkCutoffText } from '../helpers/visual-helpers';

test.describe('Feature — Visual Regression', { tag: ['@visual'] }, () => {
  test('SCN-010-VIS: Page renders consistently at desktop', async ({
    adminPage: page,
    screenshotStep,
  }) => {
    await test.step('Navigate and wait for stability', async () => {
      await page.goto(config.routes.feature);
      await waitForPageReady(page);
    });

    await test.step('Full page visual comparison', async () => {
      await expect(page).toHaveScreenshot('feature-desktop.png', {
        fullPage: true,
        animations: 'disabled',
        mask: [page.locator('[data-testid="timestamp"]')],
        maxDiffPixelRatio: 0.01,
      });
    });

    await screenshotStep('No overflow detected', async () => {
      const container = page.locator('.main-content');
      const result = await checkOverflow(container);
      expect(result.overflows, `Overflow: ${result.details}`).toBe(false);
    }, page);

    await screenshotStep('No text cutoff in headings', async () => {
      const headings = page.locator('h1, h2, h3');
      const count = await headings.count();
      for (let i = 0; i < count; i++) {
        const result = await checkCutoffText(headings.nth(i));
        expect(result.isCutOff, `Cutoff at heading ${i}: ${result.details}`).toBe(false);
      }
    }, page);
  });
});
```

## Accessibility Spec Template

```typescript
// tests/e2e/specs/[feature]-a11y.spec.ts

import { config } from '../config';
import { a11yTest as test } from '../fixtures/a11y.fixture';
import { expect } from '@playwright/test';
import { waitForPageReady } from '../helpers/wait-helpers';
import { assertNoA11yViolations } from '../helpers/a11y-helpers';

test.describe('Feature — Accessibility', { tag: ['@a11y'] }, () => {
  test('SCN-020-A11Y: Page meets WCAG 2.1 AA', async ({
    adminPage: page,
  }, testInfo) => {
    await test.step('Navigate to page', async () => {
      await page.goto(config.routes.feature);
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
      const focused = page.locator(':focus');
      await expect(focused).toBeVisible();
      const outline = await focused.evaluate(
        (el) => window.getComputedStyle(el).outlineStyle
      );
      expect(outline).not.toBe('none');
    });
  });
});
```

## Responsive Spec Template

```typescript
// tests/e2e/specs/[feature]-responsive.spec.ts

import { config } from '../config';
import { visualTest as test } from '../fixtures/visual.fixture';
import { expect } from '@playwright/test';
import { waitForPageReady } from '../helpers/wait-helpers';
import { checkOverflow, checkElementVisibility } from '../helpers/visual-helpers';

test.describe('Feature — Responsive', { tag: ['@responsive'] }, () => {
  const viewports = [
    { name: 'desktop', ...config.viewports.desktop },
    { name: 'tablet', ...config.viewports.tablet },
    { name: 'mobile', ...config.viewports.mobilePortrait },
  ];

  for (const vp of viewports) {
    test(`SCN-030-RSP: Layout at ${vp.name} (${vp.width}x${vp.height})`, async ({
      adminPage: page,
      screenshotStep,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(config.routes.feature);
      await waitForPageReady(page);

      await test.step(`Screenshot at ${vp.name}`, async () => {
        await expect(page).toHaveScreenshot(`feature-${vp.name}.png`, {
          fullPage: true,
          animations: 'disabled',
        });
      });

      await screenshotStep(`No overflow at ${vp.name}`, async () => {
        const result = await checkOverflow(page.locator('main'));
        expect(result.overflows, `Overflow at ${vp.name}: ${result.details}`).toBe(false);
      }, page);

      if (vp.name === 'mobile') {
        await test.step('Touch targets meet 44x44 minimum', async () => {
          const buttons = page.getByRole('button');
          const count = await buttons.count();
          for (let i = 0; i < count; i++) {
            const box = await buttons.nth(i).boundingBox();
            if (box) {
              expect(box.width, `Button ${i} too narrow`).toBeGreaterThanOrEqual(44);
              expect(box.height, `Button ${i} too short`).toBeGreaterThanOrEqual(44);
            }
          }
        });
      }
    });
  }
});
```

## Page Object Template

```typescript
// tests/e2e/pages/[feature].page.ts

import { BasePage } from '../core';

export class FeaturePage extends BasePage {
  constructor(page: import('@playwright/test').Page) {
    super(page);
    this.registerElement('heading', 'h1');
    this.registerElement('form', '[data-testid="feature-form"]');
    this.registerElement('submitBtn', 'button[type="submit"]');
    this.registerElement('titleInput', '[name="title"]');
  }

  async fillForm(data: { title: string }) {
    await this.page.getByLabel('Title').fill(data.title);
  }

  async submit() {
    await this.getElement('submitBtn').click();
  }
}
```

## Test Type Categories

| Type | Tag | What it verifies |
|------|-----|-----------------|
| **Functional UI** | `@regression`, `@smoke` | User interactions, form submissions, navigation, state changes |
| **Visual Regression** | `@visual` | Pixel-level comparison against baseline screenshots |
| **Layout Integrity** | `@layout` | Overflow, cutoff text, element overlap, spacing |
| **Accessibility** | `@a11y` | WCAG 2.1 AA compliance, keyboard nav, ARIA, focus indicators |
| **Responsive Design** | `@responsive` | Multi-viewport layout, touch targets, content reflow |

## Key Patterns

| Pattern | Why |
|---------|-----|
| `screenshotStep()` for every action | Visual evidence in dashboard report |
| `toHaveScreenshot()` with `maxDiffPixelRatio` | Pixel comparison with tolerance for rendering differences |
| `checkOverflow()` / `checkCutoffText()` | Detect layout issues programmatically |
| `@axe-core/playwright` (AxeBuilder) | Automated WCAG violation scanning |
| `page.setViewportSize()` per breakpoint | Responsive design verification |
| `mask` option in screenshots | Exclude dynamic content (timestamps, avatars) |
| `animations: 'disabled'` | Stable screenshots without animation timing issues |
| `failureApiLogger(page)` in `beforeEach` | Captures API req/res, attaches ONLY on failure — FE vs API diagnosis |
| `storageState` for auth | Login once, reuse across all tests |
| `waitForPageReady()` | SSR-safe wait, avoids `networkidle` hang |

## Dependencies

- `@playwright/test` (latest)
- `@axe-core/playwright` (accessibility scanning)
- Fixtures: `tests/e2e/fixtures/`
- Helpers: `tests/e2e/helpers/` (wait-helpers, visual-helpers, a11y-helpers)
- Pages: `tests/e2e/pages/`
- Config: `tests/e2e/config/index.ts`

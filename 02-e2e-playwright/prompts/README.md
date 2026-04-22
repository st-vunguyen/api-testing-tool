# Automation Testing Prompts

A reusable, project-agnostic prompt pipeline for delivering end-to-end test automation — from product spec to executed report.

```text
SPEC → Strategy → Scenarios → Playwright Code + Fixtures → Execution → Report
```

## Templates

Reference implementation code is available in `../templates/`. Use these as a starting point when the prompts generate code for a new project. Search for `TODO:` markers to customize.

## Entry Point

Start with the orchestration prompt to run the full pipeline in one shot:

| Prompt | Purpose |
|--------|---------|
| [`00-run-pipeline.prompt.md`](./00-run-pipeline.prompt.md) | Orchestrates the entire pipeline from spec to report, including bootstrap of missing support files |

Before phase `01`, the orchestration prompt should verify the target repo contains the required support files and copy missing ones from this kit:

- `agents/automation-qc.agent.md`
- `instructions/e2e-automation.instructions.md`
- `instructions/reporting.instructions.md`
- `testing/SKILL.md`

Recommended destinations: install both support layouts when possible — `.claude/*` for Claude, `.github/instructions/` + `.github/prompts/e2e-playwright/` for Copilot, and `testing/SKILL.md` as the shared skill reference.

## Prompt List

| # | File | Phase | Output |
|---|------|-------|--------|
| 00 | `00-run-pipeline.prompt.md` | Orchestration | Full pipeline coordination |
| 01 | `01-create-strategy.prompt.md` | Strategy | `tests/e2e/docs/strategy/` |
| 02 | `02-create-scenarios.prompt.md` | Scenarios | `tests/e2e/docs/scenarios/` |
| 03 | `03-create-test-code.prompt.md` | Implementation | `tests/e2e/specs/`, `pages/`, `config/` |
| 04 | `04-create-fixtures.prompt.md` | Data & Fixtures | `tests/e2e/fixtures/`, `config/` |
| 05 | `05-execute-and-report.prompt.md` | Execution | `tests/e2e/docs/reports/<run-slug>/` |
| 06 | `06-maintenance-e2e.prompt.md` | Maintenance | Refresh impacted E2E assets after source/spec changes and publish a maintenance report |

## Canonical Paths

| Artifact | Path |
|----------|------|
| Strategy docs | `tests/e2e/docs/strategy/` |
| Scenario docs | `tests/e2e/docs/scenarios/` |
| Execution reports | `tests/e2e/docs/reports/<run-slug>/` |
| Spec files | `tests/e2e/specs/` |
| Page objects | `tests/e2e/pages/` |
| Core utilities | `tests/e2e/core/` |
| Fixtures | `tests/e2e/fixtures/` |
| Helpers | `tests/e2e/helpers/` |
| Config | `tests/e2e/config/` |
| Reporters | `tests/e2e/reporters/` |
| Auth state | `tests/e2e/.auth/` (gitignored) |
| Playwright config | `playwright.config.ts` (repo root) |

> **Bug reports**: Report via issue tracker (GitHub Issues, Jira, etc.) — NEVER create `BUG-NNN.md` files in the repo.

## Framework Architecture

```text
playwright.config.ts                       ← Root config
├── globalSetup → fixtures/global-setup.ts
│   ├── Clean previous run artifacts (`test-results/`, `playwright-report/`, `blob-report/`, `.auth/`)
│   ├── Create/reset test DB (TRUNCATE + migrate + seed)
│   ├── Kill stale dev server if DB connection broken
│   ├── Register non-admin users via API
│   └── Login each role → save storageState to .auth/
│
├── globalTeardown → fixtures/global-teardown.ts
│   ├── Local: keep DB intact (dev server reuses connection pool)
│   └── CI: drop DB completely
│
├── Reporters
│   ├── Local: list + html + dashboard (visual evidence)
│   └── CI:    list + json (lean pass/fail gate)
│
├── outputDir → `test-results/` (single disposable artifact root)
└── projects[0] → chromium (Desktop Chrome)

tests/e2e/
├── config/index.ts           ← baseUrl, credentials, routes, api, timeouts, generateRunId()
├── core/
│   ├── BasePage.ts           ← Element registry, navigation, actions, assertions
│   ├── BaseComponent.ts      ← Reusable UI component base with scoped elements
│   └── index.ts
├── fixtures/
│   ├── global-setup.ts       ← Clean artifacts + DB setup + multi-role auth → storageState
│   ├── global-teardown.ts    ← Cleanup (TRUNCATE local / DROP CI)
│   ├── ui.fixture.ts         ← adminPage, userAPage, userBPage, screenshotStep, runId
│   ├── visual.fixture.ts     ← Visual regression helpers + toHaveScreenshot config
│   ├── a11y.fixture.ts       ← Accessibility scanning via @axe-core/playwright
│   ├── data.fixture.ts       ← Test data setup helpers, cleanup
│   └── index.ts              ← Barrel export
├── helpers/
│   ├── wait-helpers.ts       ← waitForPageReady() — avoids networkidle hang
│   ├── visual-helpers.ts     ← checkOverflow(), checkCutoffText(), checkElementVisibility()
│   └── a11y-helpers.ts       ← assertNoA11yViolations(), WCAG 2.1 AA scanning
├── pages/
│   ├── *.page.ts             ← Page objects extending BasePage
│   └── index.ts              ← Barrel export
├── reporters/
│   └── dashboard-reporter.ts ← Visual HTML dashboard with embedded screenshots
├── specs/
│   └── *.spec.ts             ← Test specs grouped by domain
└── docs/
    ├── strategy/             ← Risk-based automation strategy (7 docs)
    ├── scenarios/            ← Implementation-ready scenarios (7 docs)
    └── reports/
        └── <run-slug>/       ← Per-run execution reports (6 files)
```

## Reuse in Other Projects

These prompts are designed to be **project-agnostic**. To adapt for any project:

1. **Copy templates** — start from `../templates/` reference implementation
2. **Let `00-run-pipeline` bootstrap support files** — it should copy missing agent, instruction, and skill files into the target repo before strategy generation
3. **`SPEC_SOURCE`** — point to your product spec folder
4. **`tests/e2e/` paths** — keep as-is or rename to match your project layout
5. **`playwright.config.ts`** — update `baseURL`, `webServer`, browser projects
6. **`config/index.ts`** — update credentials, routes, API endpoints
7. **`.env.test`** — update environment variables for your application
8. **`global-setup.ts`** — adapt DB setup commands to your database/ORM
9. **Search for `TODO:`** — every template file has clear markers for customization
10. **Pipeline structure** — strategy → scenarios → code → fixtures → execution is universal

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| `storageState` for auth | Login once in global-setup, reuse across all tests — fast and stable |
| TRUNCATE over DROP (local) | Dev server holds connection pool; DROP breaks it |
| `waitForPageReady()` over `networkidle` | Next.js/SSR frameworks keep connections open; `networkidle` may never resolve |
| Unique `runId` per test | Prevents slug collisions between parallel workers and across runs |
| `screenshotStep` fixture | Every step produces visual evidence for the dashboard reporter |
| `toHaveScreenshot()` with `maxDiffPixelRatio` | Pixel-level visual regression with tolerance for rendering differences |
| `checkOverflow()` / `checkCutoffText()` helpers | Detect layout issues (broken UI, cutoff text) programmatically |
| `@axe-core/playwright` (AxeBuilder) | Automated WCAG 2.1 AA violation scanning |
| `page.setViewportSize()` per breakpoint | Responsive design verification across viewports |
| Report bugs via issue tracker | Bug files in repo pollute and go stale; issue tracker is the source of truth |
| Evidence-first methodology | Every decision traces to spec, strategy, or runtime observation |

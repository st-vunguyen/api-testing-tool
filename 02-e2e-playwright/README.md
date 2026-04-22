# E2E Playwright Kit

A **project-agnostic, reusable automation testing kit** for delivering end-to-end test automation with Playwright — from product spec to executed report.

```text
SPEC → Strategy → Scenarios → Code + Fixtures → Execution → Report
```

## Kit Structure

```text
e2e-playwright/
│
├── README.md                                    ← You are here
├── TOOL_SUPPORT.md                              ← Exact Copilot + Claude support matrix
│
├── agents/
│   └── automation-qc.agent.md                   ← AI agent persona — Expert QC Automation role
│
├── instructions/
│   ├── e2e-automation.instructions.md           ← Mandatory rules — scope, data isolation, dev server
│   └── reporting.instructions.md                ← Reporting stack, evidence, CI/CD, artifact hygiene
│
├── prompts/
│   ├── README.md                                ← Pipeline overview & reuse guide
│   ├── 00-run-pipeline.prompt.md                ← Orchestrator — runs the full pipeline sequentially
│   ├── 01-create-strategy.prompt.md             ← Risk-based automation strategy from spec
│   ├── 02-create-scenarios.prompt.md            ← Implementation-ready test scenarios
│   ├── 03-create-test-code.prompt.md            ← Playwright specs, page objects, helpers
│   ├── 04-create-fixtures.prompt.md             ← Fixtures, auth state, global setup, reporters
│   ├── 05-execute-and-report.prompt.md          ← Execute, triage failures, report system bugs
│   └── 06-maintenance-e2e.prompt.md             ← Maintain E2E assets after source/spec changes and rerun to completion
│
└── templates/                                   ← Reference implementation (copy & customize)
    ├── playwright.config.ts                     ← Root config — reporters, timeouts, webServer, CI/local
    ├── .env.test.example                        ← Environment variables template (credentials, DB URL)
    ├── .gitignore                               ← Comprehensive gitignore for all generated artifacts
    │
    ├── .github/
    │   └── workflows/
    │       └── e2e.yml                          ← GitHub Actions CI workflow for E2E tests
    │
    └── tests/e2e/
        ├── config/
        │   └── index.ts                         ← Centralized config — baseUrl, credentials, routes, api
        │
        ├── core/
        │   ├── BasePage.ts                      ← Abstract base — element registry, actions, assertions
        │   ├── BaseComponent.ts                 ← Reusable UI component — scoped locators
        │   └── index.ts                         ← Barrel export
        │
        ├── fixtures/
        │   ├── global-setup.ts                  ← Clean artifacts → DB setup → register → storageState
        │   ├── global-teardown.ts               ← Local: keep DB / CI: DROP DB
        │   ├── ui.fixture.ts                    ← Pre-auth pages + screenshotStep + runId
        │   ├── visual.fixture.ts                ← Visual regression helpers + toHaveScreenshot config
        │   ├── a11y.fixture.ts                  ← Accessibility scanning via @axe-core/playwright
        │   ├── data.fixture.ts                  ← Test data setup helpers
        │   └── index.ts                         ← Barrel export
        │
        ├── helpers/
        │   ├── wait-helpers.ts                  ← waitForPageReady() — SSR-safe, never hangs
        │   ├── visual-helpers.ts                ← checkOverflow(), checkCutoffText(), checkElementVisibility()
        │   └── a11y-helpers.ts                  ← assertNoA11yViolations(), WCAG 2.1 AA scanning
        │
        ├── pages/
        │   ├── login.page.ts                    ← Example POM — login form
        │   ├── dashboard.page.ts                ← Example POM — dashboard
        │   └── index.ts                         ← Barrel export
        │
        ├── reporters/
        │   └── dashboard-reporter.ts            ← Visual HTML dashboard with inline screenshots
        │
        └── specs/
            ├── example-ui.spec.ts               ← Example spec — functional UI interactions
            ├── example-visual.spec.ts            ← Example spec — visual regression
            ├── example-a11y.spec.ts              ← Example spec — accessibility audit
            └── example-responsive.spec.ts        ← Example spec — responsive viewport testing
```

## Quick Start

> Prefer the automated recipe? Use `APPLY_RECIPE.md` and `scripts/apply-e2e-kit.js` to bootstrap a real repo in one repeatable step.

> Best practice: keep both `.github/*` and `.claude/*` support trees in the same repo so Copilot and Claude can use the same kit without drift.

### 1. Place Rules & Prompts

| Layer | Claude Code | VS Code / Copilot | Commit? |
|------|-------------|-------------------|---------|
| Agent persona | `.claude/agents/automation-qc.agent.md` | N/A | Yes |
| Instructions | `.claude/rules/*.md` | `.github/instructions/*.md` | Yes |
| Prompts | `.claude/prompts/e2e-playwright/*.md` | `.github/prompts/e2e-playwright/*.md` | Yes |
| Shared skill | `testing/SKILL.md` | `testing/SKILL.md` | Yes |

```bash
# Example: Claude Code
mkdir -p <your-project>/.claude/{agents,rules,prompts/e2e-playwright}
cp agents/*.agent.md <your-project>/.claude/agents/
cp instructions/*.md <your-project>/.claude/rules/
cp prompts/*.md <your-project>/.claude/prompts/e2e-playwright/

# Example: VS Code / GitHub Copilot
mkdir -p <your-project>/.github/instructions <your-project>/.github/prompts/e2e-playwright
cp instructions/*.md <your-project>/.github/instructions/
cp prompts/*.md <your-project>/.github/prompts/e2e-playwright/
```

Then point your AI assistant to the namespaced prompt tree for its tool.

> `00-run-pipeline.prompt.md` performs a bootstrap pass before step `01`: it checks whether the target repo already has the required agent, instructions, and `testing/SKILL.md`, then copies missing files from this kit into the preferred repo paths.

### 2. Copy & Customize Templates

```bash
# Copy templates
cp templates/playwright.config.ts <your-project>/
cp -r templates/tests/ <your-project>/
cp -r templates/.github/ <your-project>/
cp templates/.env.test.example <your-project>/.env.test

# Append gitignore entries
cat templates/.gitignore >> <your-project>/.gitignore

# Install dependencies
cd <your-project>
pnpm add -D @playwright/test @axe-core/playwright dotenv
pnpm exec playwright install chromium
```

Search for `TODO:` markers in copied files and customize for your project.

### 2.1 Apply Automatically

```bash
# preview
node e2e-playwright/scripts/apply-e2e-kit.js \
    --target /absolute/path/to/your-repo \
    --assistant both \
    --dry-run

# apply
node e2e-playwright/scripts/apply-e2e-kit.js \
    --target /absolute/path/to/your-repo \
    --assistant both
```

See `e2e-playwright/APPLY_RECIPE.md` for the full checklist and `e2e-playwright/TOOL_SUPPORT.md` for the exact cross-tool matrix.

### 2.5 Bootstrap Support Files Automatically

When you run `prompts/00-run-pipeline.prompt.md`, the orchestrator should verify these support files before strategy generation starts:

- `agents/automation-qc.agent.md`
- `instructions/e2e-automation.instructions.md`
- `instructions/reporting.instructions.md`
- `testing/SKILL.md`

Recommended destination paths:

| Asset | Preferred destination |
|------|------------------------|
| Agent | `.claude/agents/automation-qc.agent.md` |
| Claude instructions | `.claude/rules/` |
| Copilot instructions | `.github/instructions/` |
| Claude prompts | `.claude/prompts/e2e-playwright/` |
| Copilot prompts | `.github/prompts/e2e-playwright/` |
| Skill | `testing/SKILL.md` |

If an equivalent file already exists in the target repo, the prompt should compare intent first and reuse it unless it is clearly outdated or incomplete.

### 3. Customization Checklist

| File | What to customize |
|------|-------------------|
| `playwright.config.ts` | `baseURL`, `webServer` command, project name |
| `config/index.ts` | Credentials, routes, API endpoints |
| `fixtures/global-setup.ts` | Database setup (migration, seed commands) |
| `fixtures/global-teardown.ts` | CI database cleanup command |
| `fixtures/auth.fixture.ts` | Auth flow (NextAuth, JWT, session, OAuth) |
| `fixtures/data.fixture.ts` | Entity CRUD helpers for your data model |
| `pages/*.page.ts` | Selectors for your UI |
| `.env.test` | Environment variables and secrets |
| `.github/workflows/e2e.yml` | Trigger branches, DB service, env vars, secrets |

## Reporting

### Reporter Stack

| Reporter | Local | CI | Output |
|----------|-------|----|--------|
| `list` | ✅ | ✅ | stdout real-time progress |
| `html` | ✅ | — | `playwright-report/index.html` |
| `json` | — | ✅ | `playwright-report/results.json` (for CI summary) |
| `dashboard-reporter` | ✅ | — | `playwright-report/dashboard.html` (inline screenshots, opens first locally) |

### Clean Run Guarantee

- Every run starts by deleting stale `test-results/`, `playwright-report/`, `blob-report/`, and `tests/e2e/.auth/` in `tests/e2e/fixtures/global-setup.ts`.
- `playwright.config.ts` pins `outputDir` to `test-results/`, so runtime artifacts stay in one disposable root.
- `BasePage.screenshot()` recreates `test-results/` automatically after cleanup, so manual screenshots never leak into ad-hoc folders.
- A manual hard-reset helper is included at `templates/scripts/clean-playwright-artifacts.js` (plus `.sh` / `.ps1` wrappers).

### What's Committed vs Gitignored

| ✅ Committed | ❌ Gitignored |
|---|---|
| `.claude/agents/`, `.claude/rules/`, `.claude/prompts/e2e-playwright/` | `playwright-report/` |
| `.github/instructions/`, `.github/prompts/e2e-playwright/` | `test-results/` |
| `testing/SKILL.md` | `blob-report/` |
| `tests/e2e/docs/reports/` (curated analysis) | `playwright-report/` |
| `.github/workflows/e2e.yml` | `test-results/` |
| | `tests/e2e/.auth/` |

> See [reporting.instructions.md](instructions/reporting.instructions.md) for full rules.

## CI Integration

The kit includes a ready-to-use GitHub Actions workflow (`templates/.github/workflows/e2e.yml`):

1. **Setup**: pnpm, Node 20, Playwright browsers
2. **Database**: PostgreSQL service container (commented, adapt for your DB)
3. **Execute**: `pnpm exec playwright test` with `CI=true`
4. **Upload**: `playwright-report/results.json` only (14 days)
5. **PR Summary**: Test pass/fail counts auto-added to GitHub Step Summary

### CI vs Local Behavior

| Setting | Local | CI |
|---------|-------|----|
| Retries | 1 | 2 |
| Workers | 2 | 4 |
| Screenshots | Every step | Off |
| Video | Retain on failure | Off |
| Trace | Retain on failure | Off |
| DB teardown | TRUNCATE (keep) | DROP |
| Dashboard reporter | ✅ | — |
| HTML reporter | ✅ | — |
| `forbidOnly` | false | true |

## Key Patterns

| Pattern | Why |
|---------|-----|
| `storageState` for auth | Login once → reuse across all tests |
| TRUNCATE over DROP (local) | Dev server connection pool survives |
| `waitForPageReady()` over `networkidle` | SSR keeps connections open forever |
| Unique `runId` per test | No data collisions between workers |
| `screenshotStep` fixture | Visual evidence for dashboard report |
| `toHaveScreenshot()` with `maxDiffPixelRatio` | Pixel-level visual regression |
| `checkOverflow()` / `checkCutoffText()` | Detect layout issues programmatically |
| `@axe-core/playwright` (AxeBuilder) | Automated WCAG 2.1 AA scanning |
| `page.setViewportSize()` per breakpoint | Responsive design verification |
| Report bugs via issue tracker | Never create `BUG-NNN.md` in repo, never fix `src/` |
| `.gitignore` discipline | Only add entries automation actually generates |

## Pipeline Flow

| Step | Prompt | Input | Output |
|------|--------|-------|--------|
| 1 | `01-create-strategy` | Product spec | `tests/e2e/docs/strategy/` |
| 2 | `02-create-scenarios` | Strategy + spec | `tests/e2e/docs/scenarios/` |
| 3 | `03-create-test-code` | Scenarios | `specs/`, `pages/`, `config/` |
| 4 | `04-create-fixtures` | Scenarios + code | `fixtures/`, `reporters/` |
| 5 | `05-execute-and-report` | All above | `tests/e2e/docs/reports/<run-slug>/` |

> Use `00-run-pipeline.prompt.md` to orchestrate all 5 steps with quality gates.

> Use `06-maintenance-e2e.prompt.md` when the app/spec changed and you need to reassess impact, refresh stale artifacts, rerun the suite, and publish a maintenance-focused report.

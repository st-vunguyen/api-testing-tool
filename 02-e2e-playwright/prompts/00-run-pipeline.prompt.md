---
description: "Orchestrates the full UI/UX automation testing pipeline: spec → strategy → scenarios → code → fixtures → execution → report."
agent: "agent"
tools: ['search', 'edit', 'new', 'todos', 'runSubagent', 'problems', 'changes', 'runCommands', 'runTasks']
---

# UI/UX Automation Testing Pipeline Runner

Run the full UI/UX automation testing pipeline from spec to final execution report.

## Context

- Spec source: `spec/` folder (auto-discover `spec/product-spec.md` + subfolders)
- E2E framework: `tests/e2e/`
- Playwright config: `playwright.config.ts`
- Instructions: see `instructions/e2e-automation.instructions.md` (mirror to `.claude/rules/` and `.github/instructions/` for full dual-tool support)
- Kit support files to bootstrap when missing:
  - Agent: `agents/automation-qc.agent.md`
  - Instructions: `instructions/e2e-automation.instructions.md`, `instructions/reporting.instructions.md`
  - Skill reference: `testing/SKILL.md`

## Mission

Execute the UI/UX testing pipeline — from specification analysis through visual regression, layout verification, accessibility validation, and functional UI testing — producing a comprehensive report of visual defects, accessibility violations, and UI/UX issues.

Run the following prompts sequentially until a final report exists:

1. `01-create-strategy.prompt.md` → `tests/e2e/docs/strategy/`
2. `02-create-scenarios.prompt.md` → `tests/e2e/docs/scenarios/`
3. `03-create-test-code.prompt.md` → `tests/e2e/specs/`, `pages/`, `config/`
4. `04-create-fixtures.prompt.md` → `tests/e2e/fixtures/`
5. `05-execute-and-report.prompt.md` → `tests/e2e/docs/reports/<run-slug>/`

## Inputs (infer or receive)

| Input | Default | Notes |
|-------|---------|-------|
| `SPEC_SOURCE` | Auto-discover from `spec/` | Product specification files or folders |
| `TARGET_ENV` | `local` | `local` or `ci` |
| `TARGET_STACK` | `Playwright (UI/UX)` | UI/UX-focused testing stack |
| `PIPELINE_SCOPE` | `full` | `full`, `strategy-only`, `code-only`, `execution-only` |
| `TEST_SCOPE` | `all` | `all`, `smoke`, `regression`, `visual`, `a11y`, specific spec file |
| `VIEWPORT_MATRIX` | `desktop,tablet,mobile` | Responsive breakpoints to test against |
| `VISUAL_BASELINE` | `auto` | `auto` (create if missing), `update`, `compare-only` |

## Orchestration Rules

### Bootstrap support files first

- Before running step `01`, inspect the target repo for the required support files
- If a support file is missing, copy it from this kit into the target repo before continuing
- For best cross-tool compatibility, install both support layouts:
  - `.claude/agents/automation-qc.agent.md`
  - `.claude/rules/e2e-automation.instructions.md`
  - `.claude/rules/reporting.instructions.md`
  - `.claude/prompts/e2e-playwright/*.prompt.md`
  - `.github/instructions/e2e-automation.instructions.md`
  - `.github/instructions/reporting.instructions.md`
  - `.github/prompts/e2e-playwright/*.prompt.md`
  - `testing/SKILL.md`
- If the repo deliberately uses only one tool, document that scope explicitly and still install every required file for that tool
- If an equivalent file already exists, do not overwrite blindly; compare intent and only refresh when the existing file is clearly outdated or incomplete
- Record which support files were reused, copied, refreshed, or skipped with reason
- Do not treat the pipeline as ready until the active tool layout exists and the missing layout, if any, is explained

### Sequential execution with quality gates

- Run steps `01 → 02 → 03 → 04 → 05` in order
- Skip a step **only** when existing artifacts pass the quality gate
- If a step fails the gate, fix or regenerate before proceeding

### Quality gates

| Phase | Gate criteria |
|-------|--------------|
| Strategy | Evidence-based, risk priorities clear, UI/UX scope covers visual regression + layout + accessibility, viewport matrix defined |
| Scenarios | Implementable, traceable to spec, Playwright mapping present, visual/layout/a11y scenario types included |
| Code | Imports resolve, typecheck passes, no duplicate login UI in non-auth specs, visual comparison utilities configured, accessibility matchers present |
| Fixtures | Auth/data/reset sufficient for stable execution, visual baselines initialized, viewport fixtures configured |
| Execution | Failures triaged, visual diffs reviewed, accessibility violations categorized by severity, framework issues fixed/rerun, report contains only confirmed UI/UX issues |

### Reuse existing artifacts

- Do NOT assume existing artifacts are correct just because they exist
- Read and verify traceability, completeness, and fitness for current scope
- Prefer update over recreate when artifacts are mostly valid

### Execution triage

- Fix framework/test-code issues first → rerun targeted scope
- **Visual baseline management**: if baseline images are missing, generate them on first run and mark as "new baseline — requires human review"
- Triage visual diffs: pixel noise vs. genuine layout regressions vs. intentional design changes
- Categorize accessibility violations by WCAG severity (A / AA / AAA)
- Only include confirmed UI/UX issues in the final report
- Inconclusive failures go to blockers section, never to bug report

## Procedure

1. **Bootstrap support files** — inspect the target repo for Claude support files, Copilot support files, and `testing/SKILL.md`; copy missing files from this kit into the correct repo paths before any pipeline step
2. **Discover scope** — read `spec/`, identify modules, UI flows, visual components, and release scope
3. **Inspect existing artifacts** — check `tests/e2e/docs/`, `tests/e2e/specs/`, visual baseline directory, and copied support files
4. **Build run plan** — decide which steps to run/skip/refresh with clear reasoning; note baseline status and bootstrap actions
5. **Execute prompts** — run each step, verify quality gate, proceed or fix
6. **Final report** — generate execution report in `tests/e2e/docs/reports/<run-slug>/`, including visual diff gallery and accessibility audit summary

## Constraints

- Do NOT fabricate expected behavior outside spec/scenario/runtime evidence
- Do NOT report framework issues as UI/UX bugs
- **NEVER modify application source code** — NEVER edit files in `src/`, `prisma/`, `vendor/`, `package.json`, `next.config.ts`, `docker-compose.yml`, `.env*`, `public/`. If a bug is found → report via issue tracker, do NOT fix it, do NOT create bug files in repo
- All output goes into `tests/e2e/` — never outside (except `playwright.config.ts`)
- Use `pnpm exec playwright ...` for all Playwright commands (never `npx`)
- Before completing any step, verify: `git diff --name-only` must only show files in `tests/e2e/`, `playwright.config.ts`
- Visual baselines must be stored under `tests/e2e/` (e.g., `tests/e2e/__screenshots__/`)
- Accessibility checks follow WCAG 2.1 AA as the default conformance level
- See `instructions/e2e-automation.instructions.md` for full automation rules

## Final Response

```markdown
## Pipeline Summary
- **Scope**: [what was covered — features, viewports, a11y level]
- **Bootstrap**: [agent / instructions / skill copied, reused, refreshed, or skipped with reason]
- **Support Paths**: [exact `.github/*`, `.claude/*`, and `testing/SKILL.md` paths created or verified]
- **Steps executed**: [01–05 status]
- **Tests**: [X passed, Y failed, Z skipped]
- **Visual regression**: [X baselines created, Y diffs detected, Z approved]
- **Accessibility**: [X violations found — N critical, M serious, L moderate]
- **Layout issues**: [list]
- **Framework fixes**: [list]
- **UI/UX bugs**: [list]
- **Blockers**: [list]
- **Report**: `tests/e2e/docs/reports/<run-slug>/`
```

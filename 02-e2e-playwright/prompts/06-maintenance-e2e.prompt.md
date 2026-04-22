---
description: "Maintain an existing Playwright UI/UX suite after source or spec changes: detect impact, refresh strategy/scenarios/code/fixtures, rerun until stable, and produce a full maintenance report."
agent: "agent"
tools: ['search', 'edit', 'new', 'todos', 'runSubagent', 'problems', 'changes', 'runCommands', 'runTasks']
---

# Maintain Existing E2E Suite

Use this prompt when the application source code, UI behavior, spec, routes, data flow, layout, or accessibility semantics have changed and the existing Playwright E2E suite must be brought back in sync.

## Role

Staff SDET + E2E Suite Maintainer + Change Impact Analyst + UI/UX QA Lead.

## Goal

Inspect recent changes in the target repo, determine which parts of the E2E suite are now stale, refresh the affected strategy/scenario/test assets, rerun the impacted tests until the suite is stable, and publish a complete maintenance report with traceable evidence.

## When to Use

Use this prompt when one or more of the following happened:

- UI pages, components, routes, layout, or responsive behavior changed
- Product specs, acceptance criteria, or business flows changed
- API payloads or states affecting UI rendering changed
- Auth flow, test data setup, fixtures, or environment setup changed
- Existing E2E tests became flaky, outdated, or no longer reflect the product
- A prior report exists, but the codebase moved forward and the suite must be refreshed

## Inputs (infer or receive)

| Input | Default | Notes |
|-------|---------|-------|
| `TARGET_REPO_ROOT` | Current repo root | Repo whose E2E assets must be maintained |
| `KIT_ROOT` | Parent folder of this prompt file | Must contain `agents/`, `instructions/`, `testing/`, `templates/`, `prompts/` |
| `SPEC_SOURCE` | Auto-discover from `spec/` | Product spec files or folders |
| `BASE_REF` | Merge-base with default branch or previous stable point | Used to detect source code changes |
| `CHANGE_SCOPE` | `auto` | `auto`, `ui-only`, `spec-only`, `fixtures-only`, `full` |
| `TARGET_ENV` | `local` | `local` or `ci` |
| `TEST_SCOPE` | Impacted scope | `all`, `smoke`, `regression`, tags, or specific specs |
| `RERUN_POLICY` | `2` | Max reruns after framework/test fixes |
| `VISUAL_BASELINE` | `auto` | `auto`, `update`, `compare-only` |

## Output

Create or refresh a maintenance report in `tests/e2e/docs/reports/<run-slug>/`:

| File | Content |
|------|---------|
| `00_index.md` | Run metadata, changed area summary, final status |
| `01_change-impact.md` | Source/spec diff analysis, impacted modules, maintenance scope |
| `02_strategy-scenario-delta.md` | What changed in strategy/scenarios and why |
| `03_test-maintenance-actions.md` | Updated specs/pages/helpers/fixtures/reporters and rationale |
| `04_execution-results.md` | Runs, reruns, pass/fail results, viewport coverage |
| `05_system-bugs.md` | Confirmed product bugs only, with evidence |
| `06_framework-fixes.md` | Test/framework maintenance fixes and rerun outcomes |
| `07_final-summary.md` | Completion status, blockers, follow-ups, recommendations |

If the impacted suite changes, also update the relevant files under `tests/e2e/`, `playwright.config.ts`, and the bootstrap support files.

## Orchestration Rules

### Bootstrap support files first

- Follow the same bootstrap behavior as `00-run-pipeline.prompt.md`
- Resolve `KIT_ROOT` and `TARGET_REPO_ROOT` first
- Ensure these files exist before maintenance starts:
	- `.claude/agents/automation-qc.agent.md`
	- `.claude/rules/e2e-automation.instructions.md`
	- `.claude/rules/reporting.instructions.md`
	- `.github/instructions/e2e-automation.instructions.md`
	- `.github/instructions/reporting.instructions.md`
	- `testing/SKILL.md`
- If any file is missing or outdated, create directories and copy/refresh from the kit before continuing

### Change impact analysis is mandatory

- Do not assume existing tests are still valid
- Inspect recent source changes before deciding what to update
- Prefer `git diff --name-only <BASE_REF>...HEAD`; if git history is unavailable, use the user-provided changed files or compare current artifacts against specs/source code
- Classify each changed file into one or more impact buckets:
	- UI flow / route / navigation
	- layout / responsive / visual regression
	- accessibility semantics
	- auth / permissions / role behavior
	- fixture / data / environment setup
	- API-driven rendering / FE vs API contract impact

### Maintenance refresh order

> ⚠️ **HARD RULE — docs-first gate**: You MUST complete steps 1 and 2 (strategy + scenarios) and commit their diffs to the maintenance report **before** writing or editing any code in `tests/e2e/specs/`, `tests/e2e/pages/`, or `tests/e2e/fixtures/`. Skipping or deferring this gate is not allowed regardless of time pressure.

- Refresh affected artifacts in this order:
	1. **strategy** (`tests/e2e/docs/strategy/`) — read ALL four files (`00-index.md`, `01-strategy.md`, `02-scope-matrix.md`, `03-execution-plan.md`), diff them against the current source/spec, and update every stale section before touching any test code
	2. **scenarios** (`tests/e2e/docs/scenarios/00-index.md`) — read the full file, diff the scenario index and detail tables against `pnpm exec playwright test --list` output and the current source code, and update every stale row before touching any test code
	3. **code** (`03-create-test-code.prompt.md`) — only after strategy and scenarios are confirmed current
	4. **fixtures/reporters** (`04-create-fixtures.prompt.md`) — when auth, data, reset logic, failure logging, or reporting changed
	5. **execution/report** (`05-execute-and-report.prompt.md`) — after all maintenance updates are applied
- Skip a phase only when the impact analysis **explicitly proves** the artifact is still correct — write the justification in `01_change-impact.md` before skipping
- Every skipped phase must include a written reason in `01_change-impact.md`

### Maintenance completion gate

- Do not mark maintenance complete until all of the following are true:
	- changed source/spec areas have a traceable test impact assessment
	- **strategy docs (`tests/e2e/docs/strategy/`) have been read, diffed, and updated** — Last updated date, scope, scope matrix, and execution plan all reflect the current codebase
	- **scenario doc (`tests/e2e/docs/scenarios/00-index.md`) has been read, diffed, and updated** — index table and detail tables match the live `playwright --list` output
	- impacted E2E code/fixtures were updated to match the current system behavior
	- targeted reruns completed after each framework/test change
	- the final report exists with all files listed above
	- remaining failures are either confirmed system bugs or documented blockers

## Quality Gates

| Phase | Gate criteria |
|-------|--------------|
| Change impact | All changed files are mapped to impacted features, risks, and test assets |
| Strategy/scenarios | Updated docs match current source/spec behavior and testing scope |
| Code/fixtures | Imports resolve, selectors/helpers are current, fixtures remain stable, failure API logging still works |
| Execution | Impacted tests rerun after maintenance updates; no unresolved framework issues remain in the final status |
| Reporting | Maintenance report clearly separates change impact, framework fixes, system bugs, and blockers |

## Procedure

### A — Bootstrap

1. Resolve `KIT_ROOT` and `TARGET_REPO_ROOT`
2. Create missing bootstrap directories
3. Copy or refresh agent, instructions, and `testing/SKILL.md`
4. Record exact bootstrap paths in the final report

### B — Detect Changes

1. Run or inspect `git diff --name-only <BASE_REF>...HEAD`
2. Group changed files by feature/module and technical impact
3. Read changed spec files, changed UI source files, and changed shared helpers/config
4. Cross-check the current E2E docs/specs/pages/fixtures against those changes
5. Build a maintenance scope: what must be refreshed, what can remain, and why


### C — Audit and Refresh Strategy and Scenarios (MANDATORY BEFORE CODE)

> This step is **not optional**. Every maintenance run must read and diff strategy/scenario docs even if the agent believes tests are still passing.

1. **Read all strategy docs in full**:
   - `tests/e2e/docs/strategy/00-index.md`
   - `tests/e2e/docs/strategy/01-strategy.md` — check: scope, risk priorities, implemented domains, assumptions
   - `tests/e2e/docs/strategy/02-scope-matrix.md` — check: every row's Status/Testable columns, Last updated date, AC coverage list
   - `tests/e2e/docs/strategy/03-execution-plan.md` — check: suite table totals, spec file list, execution order
2. **Read the full scenarios doc**:
   - `tests/e2e/docs/scenarios/00-index.md` — check: index table has entries for every spec file; detail tables match the current `pnpm exec playwright test --list` output (run it to get the live list)
3. **Compare** each doc against: (a) `git diff` of source files, (b) live `playwright --list` output, (c) current `src/` pages and routes
4. **Update every stale section** — do not leave any doc with an outdated date, missing domain, wrong scenario count, or stale AC coverage row
5. Only after all four strategy files and the scenario index are current, proceed to step D (code refresh)

### D — Refresh Test Code and Fixtures

1. Update impacted spec files in `tests/e2e/specs/`
2. Update page objects, helpers, config, and fixtures as needed
3. Keep `failureApiLogger` coverage where API logs help distinguish FE vs API failures
4. Refresh reporters if report structure or attached evidence changed
5. Do not change application source code; only maintain automation assets and reports

### E — Execute and Iterate

1. Run the smallest impacted scope first
2. If a framework/test issue is found, fix it in automation code and rerun the impacted tests
3. Repeat until one of these outcomes is reached:
	 - tests pass
	 - only confirmed system bugs remain
	 - a blocker prevents trustworthy completion
4. Expand to broader regression coverage when the changed area is stabilized
5. Update visual baselines only for intentional UI changes supported by evidence

### F — Publish Full Maintenance Report

1. Summarize change impact and maintenance scope
2. Document every refreshed or reused artifact
3. Separate framework fixes from confirmed system bugs
4. Include rerun history, final stability status, and unresolved blockers
5. Ensure the report is sufficient for a reviewer to understand what changed, what was updated, what was rerun, and what remains open

## Failure Handling Rules

### Framework / Maintenance Issue

- Root cause is stale selectors, stale scenarios, waits, fixtures, baselines, reporters, or other automation-side assumptions
- Action: fix the automation asset, rerun targeted scope, and document in `06_framework-fixes.md`

### System Bug

- Expected behavior is still supported by the latest spec/source evidence
- Failure remains after automation maintenance and rerun
- Action: report in `05_system-bugs.md` with screenshots, diffs, traces, and `failureApiLogger` evidence where available

### Blocker / Inconclusive

- Missing environment access, unstable upstream dependency, insufficient spec clarity, or untrusted runtime state
- Action: document in `07_final-summary.md` with next steps and why maintenance cannot finish cleanly

## Constraints

- Do NOT skip change analysis just because tests already exist
- **Do NOT touch any file in `tests/e2e/specs/`, `tests/e2e/pages/`, or `tests/e2e/fixtures/` before strategy and scenario docs are read, diffed, and updated** — this is the docs-first gate
- Do NOT silently keep stale strategy/scenario docs when source behavior changed
- Do NOT report framework maintenance issues as product bugs
- **NEVER modify application source code** — do not edit `src/`, `prisma/`, `vendor/`, `.env*`, `package.json`, app configs, or production code as part of maintenance
- Limit code changes to automation assets, prompt-support bootstrap files, and maintenance reports
- Use `pnpm exec playwright ...` for Playwright commands
- Before finishing, verify `git diff --name-only` only includes intended automation/report/bootstrap files

## Final Response

```markdown
## Maintenance Summary
- **Change scope**: [modules/files/features that changed]
- **Bootstrap**: [support files copied / reused / refreshed]
- **Maintenance scope**: [strategy / scenarios / code / fixtures / execution refreshed or skipped with reason]
- **Tests rerun**: [what was rerun, how many times, final status]
- **Framework fixes**: [list]
- **System bugs**: [list]
- **Blockers**: [list]
- **Report**: `tests/e2e/docs/reports/<run-slug>/`
```

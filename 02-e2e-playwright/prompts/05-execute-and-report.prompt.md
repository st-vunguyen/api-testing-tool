---
description: "Execute Playwright UI/UX tests, triage failures (framework vs system), fix framework issues, rerun, and report only confirmed system bugs with visual evidence."
agent: "agent"
tools: ['search', 'edit', 'new', 'todos', 'runSubagent', 'problems', 'changes', 'runCommands', 'runTasks']
---

# Execute Tests & Report

Run the Playwright test suite, analyze every failure, fix framework-side issues, and produce a trustworthy execution report containing only confirmed system bugs with visual evidence.

## Role

Staff SDET + Test Execution Lead + Playwright Debugger + QA Analyst + UI/UX Quality Assessor.

## Input

| Variable | Required | Description |
|----------|----------|-------------|
| `TEST_SCOPE` | No | `all` / `smoke` / `regression` / `@visual` / `@a11y` / `@responsive` / specific spec (default: `all`) |
| `TARGET_ENV` | No | Default: `local` |
| `RERUN_POLICY` | No | Max reruns per failure after fix (default: `2`) |
| `SCENARIO_SOURCE` | No | Scenario docs for cross-checking expected behavior |

## Output

Create execution report in `tests/e2e/docs/reports/<run-slug>/`:

| File | Content |
|------|---------|
| `00_index.md` | Run metadata, scope, summary, links |
| `01_test-results-summary.md` | Pass/fail/skip by module, duration, rerun outcomes, viewport coverage |
| `02_system-bugs.md` | Only confirmed system bugs with visual evidence |
| `03_audit-gaps.md` | Spec deviations, missing features (not runtime bugs) |
| `04_framework-fixes.md` | Framework/test issues found and fixed |
| `05_pipeline-summary.md` | Final conclusion, blockers, inconclusive items |

Run slug format: `<project>-<YYYYMMDD>` (e.g., `myapp-20260329`).

If framework fixes are needed, also update code in `tests/e2e/`.

## Procedure

### A — Preflight

1. Read `playwright.config.ts` — confirm `baseURL`, `testDir`, `globalSetup`, reporters, snapshot config, projects (viewports)
2. Confirm `outputDir` is pinned to `test-results/` and `globalSetup` deletes stale `test-results/`, `playwright-report/`, `blob-report/`, and `tests/e2e/.auth/`
3. Verify app target is reachable (`curl` or health check)
4. Run `pnpm exec playwright test --list` — verify test discovery
5. Confirm `tests/e2e/.auth/` will be populated by global-setup
6. Verify `@axe-core/playwright` is installed: `pnpm list @axe-core/playwright`
7. **Visual baseline pre-check** — run this command **before** any full suite execution:

   ```bash
   find tests/e2e -name "*.png" | head -20
   ```

   - If the command returns **no output**: baselines do not exist → visual tests will fail with "missing screenshot" errors (not system bugs)
   - **Action when no baselines found**:
     ```bash
     # Generate initial baselines — commit these files after review
     pnpm exec playwright test --grep @visual --update-snapshots
     git add tests/e2e/**/*-snapshots
     git commit -m "test: add initial visual regression baselines"
     ```
   - Only proceed to full suite execution after baselines exist
   - **NEVER update baselines blindly** to make a failing test pass — only update after confirming the UI change is intentional

7. Ensure database is running: `docker compose up -d mysql` (adapt for your DB)

### B — Execute

> **Use 2-pass execution when the suite contains `@visual` tests. This prevents visual-test false positives from blocking non-visual test results.**
>
> **Pass 1** — non-visual tests (fast feedback):
> ```bash
> pnpm exec playwright test --grep-invert @visual
> ```
>
> **Pass 2** — visual tests only (after baselines confirmed):
> ```bash
> pnpm exec playwright test --grep @visual
> ```
>
> Triage Pass 1 failures first. Only run Pass 2 after confirming baselines exist (Preflight step 6).

```bash
# Default: run all tests headless (2-pass recommended — see above)
pnpm exec playwright test

# Run specific scope by tag
pnpm exec playwright test --grep @smoke
pnpm exec playwright test --grep @visual
pnpm exec playwright test --grep @a11y
pnpm exec playwright test --grep @responsive

# Run specific spec file
pnpm exec playwright test admin-dashboard-visual.spec.ts

# Run specific viewport project only
pnpm exec playwright test --project="Desktop Chrome"
pnpm exec playwright test --project="Mobile Chrome"
pnpm exec playwright test --project="Tablet Chrome"

# Update visual regression baselines (after confirmed UI changes only)
pnpm exec playwright test --grep @visual --update-snapshots

# Run with no retries (for clean failure analysis)
pnpm exec playwright test --retries 0

# Run with verbose reporter
pnpm exec playwright test --reporter=list

# Debug mode (when failure root cause is unclear)
pnpm exec playwright test --debug
HEADLESS=false pnpm exec playwright test
```

### CI-specific execution

Tests run automatically via `.github/workflows/e2e.yml`. Key differences from local:

| Aspect | Local | CI |
|--------|-------|----|
| Reporters | list + html + dashboard | list + json |
| Screenshots | Every step | Off |
| Video | Retain on failure | Off |
| Trace | Retain on failure | Off |
| Retries | 1 | 2 |
| Workers | 2 | 4 |
| DB teardown | TRUNCATE (keep) | DROP |
| Reports | Open in browser | `results.json` only |
| Visual baselines | Generated locally, committed | Compared against committed baselines |
| Viewport projects | All (Desktop, Mobile, Tablet) | All (Desktop, Mobile, Tablet) |
| Snapshot diffs | Viewable in dashboard | Reproduce locally to inspect |

### Viewing CI reports

```bash
# CI only produces results.json — inspect it directly:
cat playwright-report/results.json | jq '.stats'

# To debug a CI failure with full visual evidence, reproduce locally:
pnpm exec playwright test --grep "failing test name"
open playwright-report/dashboard.html
```

Capture: terminal output in all runs; capture HTML report, screenshots, snapshot diffs, and traces only in local Manual mode.

### C — Triage Every Failure

Classify each failure into **exactly one** category:

#### Framework Issue
Root cause is in test code, selectors, waits, page objects, fixtures, config, visual baselines, or data setup.
- **Action**: Fix in `tests/e2e/`
- **Then**: Rerun targeted tests
- **Check `failureApiLogger` output**: if API responses show errors (4xx/5xx), the root cause may be API — not FE
- **Document**: in `04_framework-fixes.md`
- **NOT a system bug**

#### System Bug
Expected behavior is supported by spec, automation path is trustworthy, failure persists after framework fixes.
- **Action**: Report in `02_system-bugs.md`
- **Include**: severity, steps to reproduce, expected vs actual, visual evidence (screenshots, before/after comparisons, diff images)
- **Include API logs**: if `failureApiLogger` captured API responses, include them to clarify whether bug is FE rendering or API response error
- **Report via issue tracker** (GitHub Issues, Jira, etc.) — NEVER create standalone `BUG-NNN.md` files in repo
- **Link issue** in `02_system-bugs.md` and test annotations

#### Inconclusive
Environment unstable, data corrupted, access missing, or evidence insufficient.
- **Action**: Document in `05_pipeline-summary.md`
- **Propose**: next action to resolve
- **NOT a system bug**

### D — Fix Framework Issues
- Fix root cause (not symptoms)
- Rerun targeted scope after fix
- Record before/after in `04_framework-fixes.md` with root cause analysis
- If fix fails after reasonable effort → mark inconclusive

### E — Confirm System Bugs
- Rerun or reproduce at least once
- Verify expected behavior against spec
- Assign severity: Critical / High / Medium / Low
- Group by feature/module
- For visual bugs: capture before/after screenshots and diff images
- For a11y bugs: capture full violation report with affected elements and WCAG criteria

### F — Generate Report
All 6 report files must be created. Report must clearly separate:
- What passed (by module and viewport)
- Framework issues fixed (with root cause)
- Confirmed system bugs (with visual evidence)
- Inconclusive items (with next steps)
- Visual regression summary (baselines updated vs new failures)
- Accessibility compliance summary (violations by severity)
- Viewport coverage matrix (features tested per viewport)

## Failure Classification Heuristics

Before concluding a system bug, verify these common framework issues:

### UI / Functional
- [ ] `waitForURL` regex is properly anchored (no false-positive from negative lookahead)
- [ ] UI control type matches reality (native select vs custom combobox vs radix dropdown)
- [ ] Assertion matches actual source of truth (breadcrumb vs heading vs title tag)
- [ ] App cache/revalidation is accounted for (stale page ≠ system bug if data is correct)
- [ ] `storageState` is valid (not expired or from wrong environment)
- [ ] Test data was properly created/cleaned up (check actual API response)
- [ ] `waitForPageReady()` is used instead of `networkidle` (SSR frameworks keep connections open)
- [ ] Slug collision between tests (check runId uniqueness)
- [ ] Parallel worker interference (tests sharing state)

### Visual Regression
- [ ] Baseline exists for the current project/viewport (missing baseline ≠ system bug)
- [ ] Dynamic content is properly masked (timestamps, avatars, ads, randomized content)
- [ ] Animations were disabled before screenshot capture
- [ ] Font loading completed before comparison (font swap can cause diff)
- [ ] Anti-aliasing differences across environments (CI vs local rendering)
- [ ] `maxDiffPixelRatio` threshold is appropriate for the page complexity
- [ ] OS-level rendering differences (macOS vs Linux in CI — use Docker for consistency)
- [ ] Baseline was generated on the correct viewport project

### Layout Integrity
- [ ] Viewport size was correctly set before layout check
- [ ] Responsive breakpoint was triggered (verify CSS media query activation)
- [ ] Overflow is from scrollable container (intentional) vs content bleeding (bug)
- [ ] Text cutoff is from intentional truncation (`text-overflow: ellipsis`) vs rendering issue
- [ ] Element visibility check accounts for lazy loading and intersection observer

### Accessibility
- [ ] axe-core version is current (outdated rules may produce false positives)
- [ ] Excluded elements are intentional (e.g., third-party widgets outside control)
- [ ] Violation is not from a known-acceptable pattern documented in spec
- [ ] Dynamic content was fully loaded before scan (lazy-loaded content may be missed)
- [ ] Color contrast violations account for background images and gradients

## Reporting Format

### System Bug Report (`02_system-bugs.md`)

```markdown
### BUG-NNN: <Title>

| Field | Value |
|-------|-------|
| **Severity** | Critical / High / Medium / Low |
| **Category** | Visual Regression / Layout / Accessibility / Interaction / Rendering |
| **Component** | `src/path/to/file.ts` |
| **Spec Reference** | `spec/module/feature.md` Section X |
| **Test** | `SCN-###` in `specs/file.spec.ts` |
| **Viewport** | Desktop (1280×720) / Mobile (375×667) / Tablet (768×1024) |
| **WCAG Criteria** | (if a11y) e.g., 4.1.2 Name, Role, Value |

**Expected**: <per spec or design>
**Actual**: <observed behavior>

**Visual Evidence**:
- Screenshot (before): `<path or baseline reference>`
- Screenshot (after): `<path to actual>`
- Diff image: `<path to diff>`
- A11y report: `<path to violation report>` (if applicable)

**Reproduction**: Consistent / Intermittent
**Affected Viewports**: Desktop / Mobile / Tablet / All
```

### Framework Fix Report (`04_framework-fixes.md`)

```markdown
### FIX-NNN: <Title>

**Root cause**: <what was wrong in test code>
**Fix**: <what was changed>
**Files changed**: <list>
**Rerun result**: Pass / Fail
```

## Execution Commands Quick Reference

| Purpose | Command |
|---------|---------|
| Run all tests | `pnpm exec playwright test` |
| Visual tests only | `pnpm exec playwright test --grep @visual` |
| A11y tests only | `pnpm exec playwright test --grep @a11y` |
| Responsive tests only | `pnpm exec playwright test --grep @responsive` |
| Desktop viewport only | `pnpm exec playwright test --project="Desktop Chrome"` |
| Mobile viewport only | `pnpm exec playwright test --project="Mobile Chrome"` |
| Tablet viewport only | `pnpm exec playwright test --project="Tablet Chrome"` |
| Update baselines | `pnpm exec playwright test --grep @visual --update-snapshots` |
| Update specific baseline | `pnpm exec playwright test dashboard-visual.spec.ts --update-snapshots` |
| No retries | `pnpm exec playwright test --retries 0` |
| Debug mode | `pnpm exec playwright test --debug` |
| Headed mode | `HEADLESS=false pnpm exec playwright test` |
| List tests | `pnpm exec playwright test --list` |
| Show report | `pnpm exec playwright show-report ./playwright-report` |

## Rules

1. **Report only system bugs** — framework issues go to `04_framework-fixes.md`
2. **Fix framework first** — rerun before escalating to system bug
3. **Evidence-first** — no bug without spec evidence and runtime proof. Visual bugs require before/after screenshots and diff images
4. **No unrelated changes** — only fix what blocks current execution
5. **Execution completeness** — run as much as possible, document blockers for what couldn't run
6. Use `pnpm exec playwright ...` — never `npx`
7. **NEVER modify source code** — when triaging failures, if root cause is in `src/`, `prisma/`, `vendor/`, `.env*`, `public/`, `package.json`:
   - DO NOT fix — not even a single line
   - Report via issue tracker (GitHub Issues, Jira, etc.) — NEVER create `BUG-NNN.md` files in the repo
   - Apply workaround in test if possible (unique data, retry, skip)
   - Annotate: `test.info().annotations.push({ type: 'known-bug', description: 'ISSUE-URL' })`
   - Use `test.fixme()` or `test.skip()` if no workaround is possible
8. **Self-check before completing**: run `git diff --name-only` and confirm NO files in `src/`, `prisma/`, `vendor/`, `.env*`, `public/`, `package.json`
9. **Visual baselines** — never blindly update baselines to make tests pass. Only update when UI change is confirmed intentional. Document all baseline updates in `04_framework-fixes.md`
10. **Accessibility severity** — critical/serious a11y violations are always system bugs (unless in excluded third-party components). Moderate/minor may be deferred with justification
11. **Viewport-specific bugs** — a bug that appears only on mobile but not desktop is still a system bug. Document which viewports are affected

## Lessons Learned — Common Pitfalls

| Pitfall | Wrong approach | Correct approach |
|---------|---------------|-----------------|
| Visual baseline mismatch after intentional UI change | Mark as system bug | Update baseline: `--update-snapshots`, document in framework fixes |
| Font rendering differs between local and CI | Ignore or increase threshold to 50% | Use Docker for consistent rendering, or set per-environment baselines |
| Dynamic timestamp causes visual diff | Increase `maxDiffPixelRatio` to high value | Mask timestamp element: `{ mask: [page.locator('.timestamp')] }` |
| A11y false positive on third-party widget | Report as system bug | Exclude widget: `axeScan({ exclude: ['.third-party-widget'] })` |
| Layout overflow on mobile only | Test only desktop | Run all viewport projects, check overflow at each breakpoint |
| Cutoff text from CSS ellipsis | Report as bug | Check if truncation is intentional (`text-overflow: ellipsis` in design spec) |
| Baseline missing for new test | Test fails with "missing baseline" error | Run `--update-snapshots` for new tests, commit baselines |
| Anti-aliasing diff across OS | Increase threshold globally | Use `threshold: 0.2` per-test or generate CI-specific baselines |
| App cache bug (e.g., missing `revalidateTag`) | Modify source code to add `revalidateTag` | Report bug, use unique slug per-run to avoid stale cache |
| Slug collision between tests | Share `articleSlug` across test cases | Each test case gets its own prefix: `adm-a04-public-{runId}` |
| Dev server stale connection | DROP DB in teardown → connection pool becomes stale | TRUNCATE locally, DROP only in CI |
| `networkidle` timeout | Increase timeout or add arbitrary sleep | Use `waitForPageReady()` which avoids hanging on SSR connections |
| Focus indicator missing after interaction | Skip keyboard test | Report as a11y system bug — focus management is WCAG requirement |
| Touch target too small on mobile | Test only desktop viewport | Run mobile viewport project, check 44×44 minimum |

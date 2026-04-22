---
description: "Transform automation strategy into implementation-ready UI/UX test scenarios with Playwright mapping."
agent: "agent"
tools: ['search', 'edit', 'new', 'todos']
---

# Create UI/UX Automation Test Scenarios

Read the spec and UI/UX automation strategy to create a complete set of test scenarios — covering functional UI, visual regression, layout verification, responsive design, and accessibility — ready for Playwright implementation.

## Role

Senior SDET + UI/UX Test Designer + Playwright Specialist.

## Input

| Variable | Required | Description |
|----------|----------|-------------|
| `SPEC_SOURCE` | Yes | Spec files or folders |
| `STRATEGY_SOURCE` | Yes | Strategy docs (default: `tests/e2e/docs/strategy/`) |
| `TARGET_PLATFORM` | No | Default: Web (public reader + admin portal) |
| `VIEWPORT_MATRIX` | No | Default: `desktop (1280×720)`, `tablet (768×1024)`, `mobile (375×812)` |
| `A11Y_LEVEL` | No | Default: WCAG 2.1 AA |
| `NON_GOALS` | No | Explicitly out-of-scope items |

## Output

Create markdown files in `tests/e2e/docs/scenarios/`:

| File | Content |
|------|---------|
| `00_index.md` | Scope, inputs, deliverables, how to use with Playwright |
| `01_scenario-overview.md` | Feature summary, risk hotspots, suite distribution, viewport coverage |
| `02_feature-scenarios.md` | Full scenario list by feature/flow |
| `03_playwright-mapping.md` | Scenario → spec file, page objects, visual fixtures, viewport configs, tags |
| `04_test-data-fixtures-and-mocks.md` | Data, fixtures, visual baselines, viewport fixtures, mocks per scenario group |
| `05_assertion-and-oracle-design.md` | UI state assertions, visual comparison strategy, layout checks, a11y audit rules, anti-flaky guidance |
| `06_execution-suites.md` | Suite slicing: `@smoke`, `@regression`, `@critical`, `@visual`, `@a11y`, `@responsive` |
| `07_traceability-gaps-open-questions.md` | Traceability + gaps + open questions |

## Method

### A — Restate Scope from Spec + Strategy
Module, in-scope features, visual/interaction risk hotspots, viewport matrix, accessibility target, what NOT to create scenarios for.

### B — Build Scenario Inventory
Table: `Feature/Flow → Scenario Objective → Scenario Type → Risk → Viewports → Candidate Suite → Evidence`

Scenario types:
- **Functional UI** — user interaction correctness
- **Visual Regression** — screenshot comparison against baseline
- **Layout Verification** — element positioning, spacing, overflow
- **Responsive Design** — behavior across viewport breakpoints
- **Accessibility** — WCAG compliance, keyboard nav, screen reader

### C — Expand into Implementation-Ready Scenarios
Per approved flow, expand across all relevant scenario types:

**Functional UI scenarios**:
- Happy path (core user journey)
- Negative / validation (error states, invalid input display)
- Boundary / data variation (long text, empty states, max items)
- Permission / access control (role-based UI differences)
- State transition (loading → loaded, enabled → disabled)

**Visual regression scenarios**:
- Page-level baseline comparison (per viewport)
- Component-level baseline comparison (cards, modals, forms)
- Theme/dark mode visual comparison (if applicable)
- Dynamic content with masking (timestamps, avatars, counters)

**Layout verification scenarios**:
- Element visibility and positioning assertions
- Overflow and truncation detection
- Spacing and alignment validation
- Z-index and stacking context verification
- Content reflow under different data volumes

**Responsive design scenarios**:
- Viewport-specific layout assertions (desktop / tablet / mobile)
- Navigation pattern changes (hamburger menu, collapsed sidebar)
- Touch target size validation on mobile viewports
- Content priority and reordering across breakpoints
- Image and media scaling behavior

**Accessibility scenarios**:
- Automated WCAG audit per page (axe-core scan)
- Keyboard navigation flow (tab order, focus visible, focus trap)
- Screen reader landmark and heading structure
- Color contrast ratio validation
- Form label association and error announcement
- ARIA attribute correctness on interactive elements

Each scenario must include:
- **Objective** — what is being verified
- **Scenario type** — functional / visual / layout / responsive / a11y
- **Preconditions** — auth state, data setup, navigation state, viewport
- **Steps** — business-level (not code-level)
- **Expected results** — observable UI outcome
- **Assertions** — specific UI state, visual baseline match, layout rule, a11y rule
- **Viewport(s)** — which breakpoints this scenario runs against
- **Data setup** — what entities need to exist, how to create them

### D — Map to Playwright Framework
Per scenario group, define:
- **Spec file grouping** → `tests/e2e/specs/<domain>-<type>.spec.ts` (e.g., `dashboard-visual.spec.ts`, `forms-a11y.spec.ts`)
- **Page object needs** → `tests/e2e/pages/<name>.page.ts`
- **Visual testing fixtures** → screenshot comparison helpers, baseline management utilities, masking configurations
- **Viewport fixtures** → device emulation profiles, responsive test helpers
- **Accessibility fixtures** → axe-core integration, a11y audit helpers, violation formatters
- **Fixture needs** → `tests/e2e/fixtures/`
- **Tags**: `@smoke`, `@regression`, `@critical`, `@visual`, `@a11y`, `@responsive`
- **Auth**: specify `storageState` reuse vs explicit login
- **Test ID**: `SCN-###` prefix for traceability; suffix with type indicator (`-VIS`, `-A11Y`, `-RSP`, `-LAY`, `-FUN`)

### E — Assertion and Oracle Design
Per scenario, define the assertion strategy based on scenario type:

**Functional UI assertions**:
- UI element state (visible, enabled, selected, text content)
- URL and navigation state after interaction
- Notification and toast message content
- Form validation error display and message accuracy

**Visual comparison assertions**:
- Full-page or component screenshot against baseline
- Pixel diff threshold (strict for branding, relaxed for content)
- Masked regions for dynamic content (timestamps, user data, ads)
- Animation-safe comparison (wait for idle, disable animations)

**Layout integrity assertions**:
- Bounding box position and dimension checks
- Element visibility within viewport (no offscreen or hidden overflow)
- CSS computed style assertions (z-index, display, flex alignment)
- Spacing between elements within tolerance

**Accessibility audit assertions**:
- Zero critical (A-level) violations per page
- Violation count thresholds per severity level
- Specific rule assertions (color-contrast, label, aria-required-attr)
- Keyboard focus order matches logical reading order

**Anti-flaky guidance per type**:
- Visual: disable CSS animations, wait for font load, mask volatile regions
- Layout: use relative positioning checks, avoid pixel-exact assertions on text
- A11y: run audit after full page hydration, exclude known third-party widget violations
- Functional: use Playwright auto-waiting, avoid fixed timeouts

What NOT to assert:
- Pixel-exact positions on text content (font rendering varies)
- Third-party widget internals
- Animation intermediate frames
- Server-generated timestamps without masking

### F — Execution Slicing
Assign each scenario to one or more suites:

| Suite | Tag | When to Run | Focus |
|-------|-----|-------------|-------|
| Smoke | `@smoke` | Every PR | Critical user journeys, basic rendering |
| Critical | `@critical` | PR + staging | Core flows, auth, key interactions |
| Visual | `@visual` | Nightly + pre-release | Screenshot comparison across viewports |
| Accessibility | `@a11y` | PR (new pages) + nightly (full) | WCAG audit, keyboard nav |
| Responsive | `@responsive` | Nightly + pre-release | Multi-viewport layout/behavior |
| Regression | `@regression` | Nightly | Full suite including edge cases |

## Rules

1. **Evidence-first** — every scenario traces to spec or strategy. No invented selectors/routes/error texts.
2. **Max 3 assumptions**, clearly labeled.
3. **No over-splitting** — don't create separate scenarios that only differ in data without bug-finding value.
4. **No over-grouping** — don't create mega-scenarios that are hard to debug on failure.
5. **Auth reuse** — describe `storageState`/fixture reuse for protected routes, not per-test login.
6. **Data isolation** — every scenario must specify how it creates unique test data using `generateRunId()`.
7. **Visual scenario discipline** — every visual scenario must specify: viewport, masked regions, diff threshold, baseline update strategy.
8. **Accessibility scenario discipline** — every a11y scenario must specify: target conformance level, known exceptions, audit scope (full page vs component).
9. **Responsive scenario discipline** — every responsive scenario must specify: exact viewports, expected layout behavior per breakpoint, touch target requirements.
10. **Max 5 open questions** in traceability file.
11. **Output scope** — scenario docs go to `tests/e2e/docs/scenarios/` only. NEVER create/modify files outside `tests/e2e/`.
12. **Playwright mapping** — be specific about which page objects, visual fixtures, viewport configs, and tags are needed for each scenario group to guide implementation.
13. **Flaky assertion design** — explicitly call out any assertions that are known to be flaky and provide guidance on how to handle them in implementation (e.g., retry logic, masking, threshold tuning, or potential removal after framework improvements).
14. **NEVER modify source code** — if a bug is found that blocks scenario creation, report via issue tracker instead of fixing the code. NEVER create bug report files in the repo. Use workarounds in scenarios if possible (e.g., unique data, retries, skips) and annotate scenarios with `Known Bug: ISSUE-URL` for visibility. Always run `git diff --name-only` before claiming completion to ensure no files outside `tests/e2e/` were modified.

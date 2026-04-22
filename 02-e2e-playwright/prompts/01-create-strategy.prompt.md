---
description: "Read specs and create a risk-based UI/UX automation test strategy focused on visual quality and user experience."
agent: "agent"
tools: ['search', 'edit', 'new', 'todos']
---

# Create UI/UX Automation Test Strategy

Read the provided spec/documentation and create a complete UI/UX automation test strategy optimized for visual quality, layout integrity, accessibility compliance, and user experience assurance.

## Role

Staff QA Automation Architect specializing in UI/UX testing. Focus on **visual defect detection, accessibility compliance, and layout integrity** over generic checklist coverage.

## Input

| Variable | Required | Description |
|----------|----------|-------------|
| `SPEC_SOURCE` | Yes | Spec files or folders (e.g., `spec/`) |
| `RELEASE_SCOPE` | Yes | `patch` / `MVP` / `major` / `hotfix` |
| `RISK_TOLERANCE` | No | `low` / `medium` / `high` (default: `medium`) |
| `TARGET_STACK` | No | Default: Playwright (UI/UX) |
| `PLATFORMS` | No | Default: Web |
| `VIEWPORT_MATRIX` | No | Default: `desktop (1280×720)`, `tablet (768×1024)`, `mobile (375×812)` |
| `A11Y_LEVEL` | No | Default: WCAG 2.1 AA |
| `NON_GOALS` | No | Explicitly out-of-scope items |

## Output

Create markdown files in `tests/e2e/docs/strategy/`:

| File | Content |
|------|---------|
| `00_index.md` | Scope, inputs, deliverable list, how to use |
| `01_automation-test-strategy.md` | Goals, UI/UX test levels, automation principles, entry/exit criteria |
| `02_automation-scope-matrix.md` | Feature × risk × priority × UI/UX layer × decision matrix |
| `03_automation-candidate-cases.md` | Candidate test cases grouped by P0/P1/P2 |
| `04_defect-detection-design.md` | Visual defects, layout issues, accessibility violations, interaction bugs, oracle strategy |
| `05_data-environment-and-mocking.md` | Test data, environment, viewport config, visual baseline setup, reset strategy |
| `06_execution-plan-and-pipeline.md` | Suite structure, timing, ownership, exit criteria |
| `07_traceability-and-open-questions.md` | Spec → coverage mapping, gaps, open questions |

## Method

### A — Restate Scope (3–5 lines)
Product/module, UI/UX automation objective, in/out of scope, key visual and interaction risks.

### B — Extract UI/UX-Relevant System Model
From spec, extract: actors, UI flows, visual components, form interactions, navigation patterns, responsive breakpoints, accessibility requirements, dynamic content areas.

Output: **UI/UX Flow Inventory** table:
`Flow → UI Components → Visual Checkpoints → Responsive Behavior → A11y Requirements → Failure Risks → Spec Reference`

### C — Risk-Based Prioritization
Score each flow by: Visual Impact, User-Facing Likelihood, Accessibility Severity, Automation Value.

Assign priority:
- `P0` — must automate, release blocker (critical user journeys, WCAG A violations, major layout breaks)
- `P1` — automate this phase (visual regressions, responsive issues, WCAG AA gaps)
- `P2` — automate when capacity allows (minor visual polish, edge-case viewports)
- `Manual-only` — not suitable for automation (subjective design review, animation smoothness)

### D — UI/UX Testing Layers (avoid duplicates)
Each risk gets **1 primary testing layer**, max 2 if cross-check needed.

| Layer | Purpose | When to Use |
|-------|---------|-------------|
| **Functional UI** | Verify user interactions work correctly | Core user journeys, form submissions, navigation flows |
| **Visual Regression** | Detect unintended visual changes via screenshot comparison | Pages/components with stable design, after CSS/layout changes |
| **Layout Integrity** | Assert element positioning, spacing, overflow, z-index | Complex layouts, grid systems, overlapping components |
| **Responsive Design** | Verify behavior across viewport breakpoints | All P0/P1 flows across defined viewport matrix |
| **Accessibility** | Validate WCAG compliance, keyboard navigation, screen reader compatibility | All public-facing pages, forms, interactive elements |

Rules for layer assignment:
- Functional UI tests cover interaction logic — clicks, form fills, navigation, state changes
- Visual regression catches unintended CSS/design drift — use screenshot comparison with configurable thresholds
- Layout tests catch structural breaks — element visibility, overflow, alignment across viewports
- Responsive tests verify adaptive behavior — menu collapse, content reflow, touch targets
- Accessibility tests enforce compliance — ARIA attributes, color contrast, keyboard operability, focus management

### E — Defect-Detection Design
Per critical flow, design detection for:

**Visual defects**:
- Screenshot comparison against approved baselines
- Dynamic content masking (timestamps, avatars, ads)
- Threshold configuration per component (strict for branding, relaxed for user content)

**Layout issues**:
- Element visibility and overflow detection
- Spacing and alignment assertions
- Z-index and stacking context verification
- Content truncation and text wrapping

**Accessibility violations**:
- Automated WCAG audit per page (axe-core or equivalent)
- Keyboard navigation flow verification
- Focus trap and focus order testing
- Color contrast ratio validation
- ARIA attribute correctness

**Interaction bugs**:
- Form validation display and behavior
- Error state rendering
- Loading state and skeleton display
- Transition and animation completion gates

Evidence requirements:
- Identify where `storageState` reuse reduces test time
- Specify screenshot evidence at key visual checkpoints
- Require accessibility audit JSON artifacts per page

### F — Visual Testing Strategy
- **Baseline management**: initial baseline capture, update workflow, approval process
- **Viewport matrix**: define exact breakpoints and device emulation profiles
- **Dynamic content masking**: strategy for dates, user-generated content, animations
- **Threshold tuning**: per-component pixel diff thresholds (strict for logos/brand, relaxed for content areas)
- **CI integration**: baseline storage, diff artifact collection, visual report generation

### G — Execution & Pipeline Fit
- Smoke / PR / nightly / pre-release suites
- Visual regression suite (nightly or PR-gated)
- Accessibility audit suite (PR-gated for new pages, nightly full scan)
- Data ownership and reset strategy
- Mock strategy for external dependencies
- Flaky risk mitigation (animation waits, font loading guards, network idle)

## Rules

1. **Evidence-first** — every feature/rule must trace to `SPEC_SOURCE`. Do not invent.
2. **Facts vs assumptions** — max 3 clearly-labeled assumptions.
3. **Bug-finding over coverage** — prioritize where visual and interaction bugs are likely, not where "tests should exist."
4. **Visual testing rules** — always mask dynamic content, never compare full-page screenshots without excluding known-volatile regions, store baselines in version control.
5. **Accessibility rules** — test against WCAG 2.1 AA minimum, separate critical (A) from enhanced (AA/AAA) violations, always include keyboard navigation tests for interactive elements.
6. **Responsive rules** — test all P0 flows across the full viewport matrix, verify touch target sizes on mobile viewports, check content reflow behavior.
7. **Stop rules** — no generic best practices, no trivial assertions (e.g., "page loads"), no visual tests for pages with entirely dynamic content unless masked properly.
8. **Max 5 open questions** in `07_traceability-and-open-questions.md`.
9. **Output scope** — strategy docs go to `tests/e2e/docs/strategy/` only. NEVER create/modify files outside `tests/e2e/`.
10. **NEVER modify source code** — NEVER create/modify files in `src/`, `prisma/`, `vendor/`, `.env*`, `public/`, `package.json`. If app behavior needs to change → report via issue tracker, use workaround in test. NEVER create bug files in repo.

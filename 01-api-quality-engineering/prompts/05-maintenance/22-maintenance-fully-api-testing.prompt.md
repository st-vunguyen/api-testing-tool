---
description: "Maintain the full API quality engineering kit after a new spec or supporting docs arrive: detect impact, refresh stale assets, rerun impacted packs, and publish a maintenance report."
agent: "agent"
tools: ['search', 'edit', 'new', 'todos', 'runSubagent', 'problems', 'changes', 'runCommands', 'runTasks']
---

# Maintain Full API Quality Engineering Kit

> Compatibility alias: prefer `22-maintenance-fully-api-quality-engineering.prompt.md` for new work.

Use this prompt when the OpenAPI spec, supporting docs, auth model, data model, business flows, or environment assumptions changed and the existing API testing pack must be brought back in sync.

## Role

API Test Maintainer + Change Impact Analyst + Traceability Auditor + Execution Triage Lead.

## Goal

Inspect the new specification and related changes, determine which API testing assets are stale, refresh only the impacted artifacts in the correct order, rerun the impacted packs until they are trustworthy again, and publish a complete maintenance report with traceable evidence.

## When to Use

Use this prompt when one or more of the following happened:

- a new `openapi.yaml` / `openapi.json` version arrived
- endpoints, schemas, auth, headers, or error models changed
- pagination, filtering, sorting, idempotency, or rate-limit behavior changed
- environment variables, tokens, or test-data rules changed
- existing collections or traceability docs no longer match the latest spec
- performance or security assumptions must be revalidated
- a prior API test pack exists, but the spec/docs moved forward and the pack must be refreshed

## Inputs (infer or receive)

| Input | Default | Notes |
|---|---|---|
| `TARGET_REPO_ROOT` | Current repo root | Repo whose API testing assets must be maintained |
| `KIT_ROOT` | Parent folder of this prompt file | Must contain `agents/`, `instructions/`, `testing/`, `templates/`, `prompts/` |
| `API_SPEC_PATH` | Auto-discover from repo docs/spec folders | Latest source-of-truth OpenAPI spec |
| `DOCS_PATHS` | Auto-discover | Supporting business / engineering docs |
| `OUTPUT_SLUG` | Existing API pack slug | Example `billing-api` |
| `BASE_REF` | Merge-base or previous stable point | Used for diffing spec/docs and related artifacts |
| `CHANGE_SCOPE` | `auto` | `auto`, `spec-only`, `core-pack`, `non-functional`, `full` |
| `TARGET_STACK` | Existing stack in use | Example `postman-newman` |
| `TARGET_ENV` | `local` | `local`, `dev`, `staging`, `perf` |
| `RERUN_POLICY` | `2` | Max reruns after asset fixes |
| `INCLUDE_SECURITY_RECHECK` | `auto` | `auto`, `yes`, `no` |
| `INCLUDE_PERF_RECHECK` | `auto` | `auto`, `yes`, `no` |
| `INCLUDE_JMETER_RECHECK` | `auto` | `auto`, `yes`, `no` |

## Output

Create or refresh a maintenance report in `documents/api-quality-engineering/<OUTPUT_SLUG>/reports/<run-slug>/`:

| File | Content |
|---|---|
| `00_index.md` | Run metadata, changed-area summary, final maintenance status |
| `01_spec-change-impact.md` | Spec/doc diff analysis, changed operations, changed schemas, impacted pack areas |
| `02_strategy-and-traceability-delta.md` | What changed in review/strategy/traceability and why |
| `03_core-pack-maintenance.md` | Collection/env/data/helper changes and rationale |
| `04_specialized-pack-maintenance.md` | E2E journeys, contract, integration, regression, performance, security, and JMeter maintenance status |
| `05_execution-and-reruns.md` | What was rerun, execution results, and rerun outcomes |
| `06_confirmed-system-issues.md` | Confirmed product or spec issues only, with evidence |
| `07_asset-fixes.md` | Testing-asset fixes applied during maintenance |
| `08_final-summary.md` | Completion status, blockers, deferred work, recommendations |

If the impacted pack changes, also update the relevant files under:

- `documents/api-quality-engineering/<OUTPUT_SLUG>/`
- `tools/api-quality-engineering/<OUTPUT_SLUG>/`
- `.github/workflows/` when CI assets are impacted
- bootstrap support files when they are missing or outdated

## Orchestration Rules

### Bootstrap support files first

- Follow the same bootstrap behavior as `../00-orchestration/00-run-pipeline.prompt.md`
- Resolve `KIT_ROOT` and `TARGET_REPO_ROOT` first
- Ensure these files exist before maintenance starts:
  - `.claude/agents/api-quality-engineering-qc.agent.md`
  - `.claude/agents/api-testing-qc.agent.md` (compatibility alias)
  - `.claude/rules/api-quality-engineering.instructions.md`
  - `.claude/rules/api-testing.instructions.md`
  - `.claude/rules/reporting.instructions.md`
  - `.github/instructions/api-quality-engineering.instructions.md`
  - `.github/instructions/api-testing.instructions.md`
  - `.github/instructions/reporting.instructions.md`
  - `testing/SKILL.md`
- If any file is missing or outdated, create directories and copy or refresh from the kit before continuing

### Change impact analysis is mandatory

- Do not assume existing collections are still valid
- Inspect recent changes before deciding what to update
- Prefer `git diff --name-only <BASE_REF>...HEAD`; if git history is unavailable, diff the latest spec/docs against the existing generated artifacts
- Classify impact into one or more buckets:
  - OpenAPI path / method changes
  - schema / field / validation changes
  - auth / permission / token-flow changes
  - list semantics / pagination / filtering changes
  - data / environment / helper contract changes
  - contract / integration / regression pack changes
  - performance or security recheck impact
  - JMeter stack, conversion, or dashboard-analysis impact

### Maintenance refresh order

> Hard rule — docs-first gate: you must complete steps 1 and 2 before editing runnable collections or execution helpers.

Refresh affected artifacts in this order:

1. **Review and strategy docs** — prompts `01` to `06`
2. **Traceability and core pack intent** — prompts `07` to `09`
3. **Specialized scenario packs** — prompts `10` to `17` when impacted
4. **Non-functional packs** — prompts `18` to `21` when impacted and safe
4.5. **Advanced JMeter packs** — prompts `23` to `26` when impacted and in scope
5. **Execution / rerun / report** — rerun only the impacted packs after maintenance updates are applied

Skip a phase only when the impact analysis explicitly proves the artifact is still current. Every skipped phase must include a written reason in `01_spec-change-impact.md`.

### Maintenance completion gate

Do not mark maintenance complete until all of the following are true:

- changed spec/doc areas have a traceable testing impact assessment
- review and strategy assets reflect the current spec
- traceability docs match the latest API surface
- impacted collections, env templates, data helpers, and specialized packs were refreshed
- targeted reruns completed after each testing-asset fix
- remaining failures are either confirmed system/spec issues or documented blockers
- the final maintenance report exists with all files listed above

## Quality Gates

| Phase | Gate criteria |
|---|---|
| Change impact | Changed operations, schemas, and docs are mapped to impacted assets |
| Review / strategy | Prompts `01` to `06` outputs reflect the current spec and gaps |
| Core pack | Collection, env, data, and helper assets align with the updated API surface |
| Specialized packs | Contract, integration, regression, performance, security, and JMeter assets are refreshed or explicitly skipped with reason |
| Execution | Impacted packs rerun after fixes; no unresolved testing-asset issues remain in the final status |
| Reporting | Maintenance report clearly separates asset fixes, confirmed system/spec issues, and blockers |

## Procedure

### A — Bootstrap

1. Resolve `KIT_ROOT` and `TARGET_REPO_ROOT`
2. Create missing bootstrap directories
3. Copy or refresh agent, instructions, and `testing/SKILL.md`
4. Record exact bootstrap paths in the final report

### B — Detect spec and documentation changes

1. Diff the latest spec and relevant docs against `BASE_REF` or the previous known-good state
2. Group changed operations and schemas by business domain
3. Cross-check the current API testing outputs against those changes
4. Build a maintenance scope: what must be refreshed, what can remain, and why

### C — Refresh review, strategy, and traceability first

1. Revisit prompts `01` to `06` outputs and update stale sections
2. Refresh request-to-spec and variable traceability before touching runnable packs
3. Ensure changed auth, error, and pagination semantics are captured in docs first

### D — Refresh runnable packs

1. Update the core collection pack, env templates, and data helpers (`07` to `09`)
2. Update specialized packs only where the impact analysis requires it (`10` to `17`)
3. Refresh performance and security assets (`18` to `21`) only when the change scope affects them and the target environment remains safe
4. Refresh advanced JMeter assets (`23` to `26`) when the performance stack, plugin assumptions, report model, or converted workload changed

### E — Execute and iterate

1. Run the smallest impacted pack first
2. If a testing-asset issue is found, fix it in the API testing assets and rerun
3. Repeat until one of these outcomes is reached:
   - impacted packs pass
   - only confirmed system or spec issues remain
   - a blocker prevents trustworthy completion
4. Expand to broader reruns when the changed area is stabilized

### F — Publish full maintenance report

1. Summarize the spec and doc changes
2. Document every refreshed, reused, or skipped artifact
3. Separate testing-asset fixes from confirmed system/spec issues
4. Include rerun history, final readiness status, and unresolved blockers

## Failure Handling Rules

### Testing Asset Issue

- Root cause is in collection scripts, variable capture, environment setup, helper logic, traceability, workload setup, or CI wiring
- Action: fix the testing asset, rerun the impacted scope, and document it in `07_asset-fixes.md`

### System or Spec Issue

- Failure remains after the testing assets are refreshed and rerun
- Action: report it in `06_confirmed-system-issues.md` with evidence and note whether the source of truth is likely the implementation or the specification

### Blocker / Inconclusive

- Missing environment access, forbidden destructive testing, unsupported auth flow, insufficient spec clarity, missing JMeter toolchain, unavailable plugin support, or incomplete standard report artifacts
- Action: document it in `08_final-summary.md` with next steps and why maintenance cannot finish cleanly

## Constraints

- Do not skip change analysis just because artifacts already exist
- Do not edit runnable collections before review, strategy, and traceability are refreshed
- Do not report testing-asset maintenance issues as product bugs
- Do not modify product source code as part of API testing maintenance
- Limit changes to API testing assets, support files, CI workflows in scope, and maintenance reports
- Keep all generated artifacts inside the canonical `documents/`, `tools/`, and approved support paths only

## Final Response

```markdown
## API Testing Maintenance Summary
- **Change scope**: [spec/docs/modules affected]
- **Bootstrap**: [support files copied / reused / refreshed]
- **Maintenance scope**: [review / strategy / core pack / specialized packs / JMeter / execution refreshed or skipped with reason]
- **Reruns**: [what was rerun, how many times, final status]
- **Testing-asset fixes**: [list]
- **System/spec issues**: [list]
- **Blockers**: [list]
- **Report**: `documents/api-quality-engineering/<OUTPUT_SLUG>/reports/<run-slug>/`
```

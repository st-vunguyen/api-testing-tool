MODE=technical

# Run the Full API Quality Engineering Pipeline

Use this prompt as the primary entry point when you want to run the complete API quality engineering pipeline across the grouped prompt layout without silently skipping any required phase.

## Role

You are a **QA Program Orchestrator, API Test Architect, and Test Tooling Coordinator**.
Your job is to:

- run the full prompt sequence in the correct order
- keep handoffs between prompts explicit
- ensure no prompt is omitted from the full pipeline
- allow a prompt to be skipped only when it is genuinely not applicable, with a recorded reason and impact

## Goal

Produce a complete API quality engineering deliverable set covering OpenAPI review, strategy, traceability, scenario documentation, runnable Postman/Newman assets, environment and data helpers, contract/integration/regression/performance packs, security baseline setup, JMeter-grade performance tooling when needed, and fully executed performance evidence where safe and supported.

The pipeline must cover these capability groups:

1. Specification review and normalization
2. Risk and strategy synthesis
3. Runnable API pack generation
4. Environment, data, and helper assets
5. Advanced scenario packs
6. Contract, integration, regression, and performance assets
7. Security baseline add-on
8. Performance execution and reporting
9. Standard JMeter setup, conversion, execution, and executive analysis when requested

## Inputs

- `API_SPEC_PATH`: path to the OpenAPI YAML or JSON file
- `DOCS_PATHS`: one or more supporting documentation folders
- `OUTPUT_SLUG`: example `billing-api`
- `TARGET_STACK`: default `postman-newman`
- `INCLUDE_MERMAID`: `yes` or `no` (default to `yes` only when the evidence is strong enough)
- `BASE_URL`: optional; used for security and performance execution when a permitted target exists
- `AUTH_MODE`: `none | bearer | api-key` (descriptive only; no secrets)
- `RUN_FULL_OPTIONALS`: `yes | no`
- `ADVANCED_PERFORMANCE_STACK`: `none | jmeter` (default `none`)
- `RUN_ADVANCED_PERFORMANCE`: `yes | no`

## Canonical Output Roots

- Human-readable artifacts: `documents/api-quality-engineering/<OUTPUT_SLUG>/...`
- Runnable assets: `tools/api-quality-engineering/<OUTPUT_SLUG>/...`
- CI workflows: `.github/workflows/`

## Bootstrap Support Files First

Before evaluating prompt `01`, inspect the target repo for the required support files.

For best cross-tool compatibility, install both support layouts:

- `.claude/agents/api-quality-engineering-qc.agent.md`
- `.claude/agents/api-testing-qc.agent.md` (compatibility alias)
- `.claude/rules/api-quality-engineering.instructions.md`
- `.claude/rules/api-testing.instructions.md`
- `.claude/rules/reporting.instructions.md`
- `.claude/prompts/api-quality-engineering/**/*.prompt.md`
- `.claude/prompts/api-testing/**/*.prompt.md` (compatibility alias)
- `.github/instructions/api-quality-engineering.instructions.md`
- `.github/instructions/api-testing.instructions.md`
- `.github/instructions/reporting.instructions.md`
- `.github/prompts/api-quality-engineering/**/*.prompt.md`
- `.github/prompts/api-testing/**/*.prompt.md` (compatibility alias)
- `testing/SKILL.md`

If the repo deliberately uses only one tool, document that scope explicitly and still install every required file for that tool.

If an equivalent file already exists, do not overwrite blindly; compare intent and refresh only when the existing file is clearly outdated or incomplete.

Record which support files were reused, copied, refreshed, or skipped with reason.

## Full-Coverage Rule

When running this full pipeline:

- You **must evaluate every prompt from `01` through `21`**.
- If `ADVANCED_PERFORMANCE_STACK=jmeter` or `RUN_ADVANCED_PERFORMANCE=yes`, you **must also evaluate prompts `23` through `26`**.
- You **must not silently omit any prompt**.
- If a prompt does not apply to the target API, you must still:
  - mark it as `Skipped with reason`
  - explain the non-applicability condition
  - state which artifacts were not created
  - describe the impact on coverage or readiness

Examples of controlled skips:

- `10-e2e-journeys-doc` when there is not enough evidence for multi-step journeys
- `11-e2e-collection` when `10` cannot establish runnable journeys
- `14-integration-flows-doc` or `15-integration-collection` when no supported integration flows exist in the spec or docs
- `18-performance-scenarios` or `19-performance-collection` when there is not enough evidence to define workload candidates responsibly
- `20-zap-security-scanning` when there is no permitted HTTP surface or no `BASE_URL`
- `21-fully-performance-testing` when the target environment is unsafe for performance execution, no workload artifact exists yet, or the selected stack only supports planning but not responsible execution
- `23-jmeter-stack-setup` through `26-jmeter-report-analysis` when advanced JMeter coverage is out of scope, no standard JMeter workflow is needed, or the environment/tooling cannot support a trustworthy JMeter path yet

Even when skipped, the prompt must still appear in the final orchestration summary.

## Required Execution Order

### Review and Strategy

1. `../01-review-and-strategy/01-openapi-lint-verify.prompt.md`
   - Output: `documents/api-quality-engineering/<OUTPUT_SLUG>/strategy/openapi-quality/`
   - Purpose: review lint and normalization issues in the spec

2. `../01-review-and-strategy/02-auth-limits-analysis.prompt.md`
   - Output: `documents/api-quality-engineering/<OUTPUT_SLUG>/strategy/auth-and-limits/`
   - Purpose: analyze authentication, authorization, and throttling behavior

3. `../01-review-and-strategy/03-pagination-filtering-review.prompt.md`
   - Output: `documents/api-quality-engineering/<OUTPUT_SLUG>/strategy/pagination-filtering/`
   - Purpose: document list semantics, filtering, search, and sorting behavior

4. `../01-review-and-strategy/04-test-patterns-review.prompt.md`
   - Output: `documents/api-quality-engineering/<OUTPUT_SLUG>/strategy/test-patterns/`
   - Purpose: define naming, assertion, fixture, and cleanup conventions

5. `../01-review-and-strategy/05-oas-snapshot.prompt.md`
   - Output: `documents/api-quality-engineering/<OUTPUT_SLUG>/strategy/oas-snapshot/`
   - Purpose: create a fast-review snapshot and inventory of the OpenAPI spec

6. `../01-review-and-strategy/06-comprehensive-test-strategy.prompt.md`
   - Output: `documents/api-quality-engineering/<OUTPUT_SLUG>/strategy/`
   - Purpose: synthesize the complete API test strategy
   - Dependency: must use the findings from `01` through `05`

### Runnable Packs and Specialized Assets

7. `../02-core-pack/07-full-api-collection.prompt.md`
   - Output roots:
     - `tools/api-quality-engineering/<OUTPUT_SLUG>/postman/`
     - `tools/api-quality-engineering/<OUTPUT_SLUG>/env/`
     - `documents/api-quality-engineering/<OUTPUT_SLUG>/traceability/`
   - Purpose: generate the baseline full API collection pack

8. `../02-core-pack/08-refresh-environment-files.prompt.md`
   - Output roots:
     - `tools/api-quality-engineering/<OUTPUT_SLUG>/env/`
     - `documents/api-quality-engineering/<OUTPUT_SLUG>/traceability/environment-variable-contract.md`
   - Purpose: refresh environment templates and the variable contract

9. `../02-core-pack/09-data-driven-samples.prompt.md`
   - Output roots:
     - `tools/api-quality-engineering/<OUTPUT_SLUG>/data/`
     - `documents/api-quality-engineering/<OUTPUT_SLUG>/traceability/data-driven-samples-mapping.md`
   - Purpose: generate synthetic sample datasets and generator guidance

10. `../03-scenario-packs/10-e2e-journeys-doc.prompt.md`
    - Output roots:
      - `documents/api-quality-engineering/<OUTPUT_SLUG>/scenarios/e2e-journeys.md`
      - `documents/api-quality-engineering/<OUTPUT_SLUG>/scenarios/e2e-journeys-traceability.md`
      - optional Mermaid file
    - Purpose: document evidence-backed E2E journeys

11. `../03-scenario-packs/11-e2e-collection.prompt.md`
    - Output roots:
      - `tools/api-quality-engineering/<OUTPUT_SLUG>/postman/e2e.collection.json`
      - `tools/api-quality-engineering/<OUTPUT_SLUG>/helpers/e2e-runbook.md`
      - `documents/api-quality-engineering/<OUTPUT_SLUG>/traceability/e2e-collection-traceability.md`
    - Dependency: should run after `10`

12. `../03-scenario-packs/12-contract-coverage-plan.prompt.md`
    - Output roots:
      - `documents/api-quality-engineering/<OUTPUT_SLUG>/traceability/contract-coverage-plan.md`
      - `documents/api-quality-engineering/<OUTPUT_SLUG>/traceability/contract-traceability-matrix.md`
    - Purpose: create the contract coverage model across operations and schemas

13. `../03-scenario-packs/13-contract-collection.prompt.md`
    - Output roots:
      - `tools/api-quality-engineering/<OUTPUT_SLUG>/postman/contract.collection.json`
      - `documents/api-quality-engineering/<OUTPUT_SLUG>/traceability/contract-collection-coverage.md`
    - Dependency: should use the output of `12`

14. `../03-scenario-packs/14-integration-flows-doc.prompt.md`
    - Output roots:
      - `documents/api-quality-engineering/<OUTPUT_SLUG>/scenarios/integration-flows.md`
      - `documents/api-quality-engineering/<OUTPUT_SLUG>/scenarios/integration-flows-traceability.md`
      - optional Mermaid file

15. `../03-scenario-packs/15-integration-collection.prompt.md`
    - Output roots:
      - `tools/api-quality-engineering/<OUTPUT_SLUG>/postman/integration.collection.json`
      - `tools/api-quality-engineering/<OUTPUT_SLUG>/helpers/integration-fixtures.md`
      - `tools/api-quality-engineering/<OUTPUT_SLUG>/helpers/integration-runbook.md`
      - `documents/api-quality-engineering/<OUTPUT_SLUG>/traceability/integration-collection-traceability.md`
    - Dependency: should run after `14`

16. `../03-scenario-packs/16-regression-scenarios.prompt.md`
    - Output roots:
      - `documents/api-quality-engineering/<OUTPUT_SLUG>/scenarios/regression-scenarios.md`
      - `documents/api-quality-engineering/<OUTPUT_SLUG>/scenarios/regression-priority-matrix.md`

17. `../03-scenario-packs/17-regression-collection.prompt.md`
    - Output roots:
      - `tools/api-quality-engineering/<OUTPUT_SLUG>/postman/regression.collection.json`
      - `tools/api-quality-engineering/<OUTPUT_SLUG>/helpers/regression-runbook.md`
      - `documents/api-quality-engineering/<OUTPUT_SLUG>/traceability/regression-collection-traceability.md`
    - Dependency: should run after `16`

18. `../04-non-functional/18-performance-scenarios.prompt.md`
    - Output roots:
      - `documents/api-quality-engineering/<OUTPUT_SLUG>/scenarios/performance-scenarios.md`
      - `documents/api-quality-engineering/<OUTPUT_SLUG>/scenarios/performance-thresholds-and-assumptions.md`

19. `../04-non-functional/19-performance-collection.prompt.md`
    - Output roots:
      - `tools/api-quality-engineering/<OUTPUT_SLUG>/performance/README.md`
      - `tools/api-quality-engineering/<OUTPUT_SLUG>/performance/local.env.example`
      - `documents/api-quality-engineering/<OUTPUT_SLUG>/strategy/performance-collection-reporting.md`
    - Dependency: should run after `18`

20. `../04-non-functional/20-zap-security-scanning.prompt.md`
    - Output roots:
      - `.github/workflows/`
      - and/or `documents/api-quality-engineering/<OUTPUT_SLUG>/reports/security-baseline/`
    - Purpose: configure a warn-only security baseline when scanning is permitted

21. `../04-non-functional/21-fully-performance-testing.prompt.md`
    - Output roots:
      - `tools/api-quality-engineering/<OUTPUT_SLUG>/performance/`
      - `tools/api-quality-engineering/<OUTPUT_SLUG>/reports/raw/performance/<run-slug>/`
      - `documents/api-quality-engineering/<OUTPUT_SLUG>/reports/performance/<run-slug>/`
    - Dependency: should run after `18` and `19`
    - Purpose: bootstrap tooling, execute the generated performance workload safely, and publish curated evidence

### Advanced JMeter Extension

Run these prompts only when advanced JMeter coverage is requested or justified.

23. `../04-non-functional/23-jmeter-stack-setup.prompt.md`
    - Output roots:
      - `tools/api-quality-engineering/<OUTPUT_SLUG>/performance/jmeter/`
      - `documents/api-quality-engineering/<OUTPUT_SLUG>/strategy/jmeter-tooling-decision.md`
    - Purpose: establish a standard JMeter stack, plugin guidance, and dashboard tooling baseline

24. `../04-non-functional/24-jmeter-convert-collections.prompt.md`
    - Output roots:
      - `tools/api-quality-engineering/<OUTPUT_SLUG>/performance/jmeter/test-plan.jmx`
      - `documents/api-quality-engineering/<OUTPUT_SLUG>/traceability/jmeter-conversion-traceability.md`
      - `documents/api-quality-engineering/<OUTPUT_SLUG>/scenarios/jmeter-workload-notes.md`
    - Dependency: should use the workload intent from `18`, `19`, and any chosen source collections

25. `../04-non-functional/25-jmeter-execute-and-report.prompt.md`
    - Output roots:
      - `tools/api-quality-engineering/<OUTPUT_SLUG>/reports/raw/performance/jmeter/<run-slug>/`
      - `documents/api-quality-engineering/<OUTPUT_SLUG>/reports/performance/jmeter/<run-slug>/`
    - Dependency: should run after `23` and `24`

26. `../04-non-functional/26-jmeter-report-analysis.prompt.md`
    - Output roots:
      - `documents/api-quality-engineering/<OUTPUT_SLUG>/reports/performance/jmeter/<run-slug>/`
      - `documents/api-quality-engineering/<OUTPUT_SLUG>/reports/performance/jmeter/<run-slug>/dashboard.html`
    - Dependency: should run after `25`

## Orchestration Rules

When coordinating the full pipeline, you must:

1. Bootstrap support files before prompt `01`.
2. Run prompts `01 → 06` in exact order.
3. Move to prompt `07` only after the strategy baseline from `06` exists.
4. Run prompts `07 → 21` in exact order.
5. If advanced JMeter coverage is in scope, run `23 → 26` in exact order after `21` or after the relevant performance baseline exists.
6. Call out each dependency explicitly when one prompt depends on another.
7. Mark unmet dependencies as `Blocked` or `Skipped with reason`.
8. If a prior output is incomplete, perform a reconciliation pass and state it explicitly.

## Quality Gates

### Gate A — After Review and Strategy

This gate passes only if:

- prompts `01` through `05` are completed or formally skipped with reason
- `06-comprehensive-test-strategy` has synthesized:
  - risk profile
  - scope matrix
  - priority lines
  - traceability
  - risks, gaps, and open questions

### Gate B — After Core Pack Generation

This gate passes only if prompts `07` through `09` have produced:

- a baseline collection pack
- environment templates and variable contract
- data-driven samples and mapping

### Gate C — After Specialized Packs and Execution

This gate passes only if prompts `10` through `21` are all classified as one of:

- `Completed`
- `Skipped with reason`
- `Blocked with explicit dependency gap`

### Gate C.5 — Advanced JMeter Gate

If advanced JMeter coverage is in scope, this gate passes only if prompts `23` through `26` are all classified as one of:

- `Completed`
- `Skipped with reason`
- `Blocked with explicit dependency gap`

### Gate D — Final Full-Pipeline Gate

You may only finish when:

- every prompt from `01` through `21` has been evaluated
- prompts `23` through `26` have also been evaluated when advanced JMeter coverage is in scope
- no prompt is missing from the final summary
- the final summary shows completed, skipped, or blocked status for each prompt

## Required Final Summary Format

At the end of the run, produce a structured summary with these sections:

### 1. Prompt Coverage Summary

| Prompt | Status | Output paths | Notes |
|---|---|---|---|
| 01 | Completed / Skipped / Blocked | ... | ... |
| 02 | ... | ... | ... |
| ... | ... | ... | ... |
| 20 | ... | ... | ... |
| 21 | ... | ... | ... |
| 23 | ... | ... | ... |
| 24 | ... | ... | ... |
| 25 | ... | ... | ... |
| 26 | ... | ... | ... |

### 2. Generated Artifact Summary

- Strategy documents created
- Scenario documents created
- Traceability documents created
- Runnable collections created
- Environment, data, helper, performance, security, JMeter, and execution assets created

### 2.5. Support File Summary

- Exact `.github/*`, `.claude/*`, and `testing/SKILL.md` paths created or verified
- Any support files intentionally skipped and why

### 3. Open Questions and Gaps

- unresolved documentation or specification gaps
- prompts skipped or blocked because evidence was insufficient
- manual follow-up items

### 4. Next Recommended Action

- if the full pack is sufficiently complete, recommend execution and reporting next
- if gaps remain, recommend the next prompt or the missing input needed to continue

## Guardrails

- This prompt is an orchestration template and must not store run results inside itself.
- All outputs must be written under the canonical `documents/api-quality-engineering/<OUTPUT_SLUG>/...` and `tools/api-quality-engineering/<OUTPUT_SLUG>/...` roots.
- Do not invent endpoints, parameters, flows, auth behavior, thresholds, performance targets, or topology beyond the evidence.
- Treat `templates/api-pack/` as the canonical generic starter reference, not as the final project output.
- Treat `templates/examples/` as example or reference artifacts only.

## Final Self-Check

- [ ] Every prompt from `01` through `21` was evaluated
- [ ] Prompts `23` through `26` were evaluated when advanced JMeter coverage was in scope
- [ ] No prompt is missing from the final summary
- [ ] Review and strategy outputs were fed into `06`
- [ ] Downstream dependencies were respected before generating or refreshing later phases
- [ ] Every skipped or blocked item has a clear reason
- [ ] Artifacts were written to the canonical roots
- [ ] No unsupported claims were introduced beyond the evidence

## Execute Now

Run the full API quality engineering pipeline in the order described above.

If `RUN_FULL_OPTIONALS=yes`, attempt every optional prompt that has enough evidence to run responsibly.
If a prompt does not apply, do not omit it silently — record it as `Skipped with reason` in the final summary.

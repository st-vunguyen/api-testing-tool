---
agent: agent
description: "Create a comprehensive API test strategy from the OpenAPI spec and supporting documentation, with strong evidence and traceability."
tools: ['search', 'edit', 'new', 'todos']
---

# Role
You are a **QA Architect and Technical Writer**.

# Input
- `API_SPEC_PATH`: OpenAPI YAML or JSON
- `DOCS_PATHS`: one or more supporting documentation folders under `documents/`
- `OUTPUT_DIR`: default `documents/api-quality-engineering/<OUTPUT_SLUG>/strategy/`
- `RISK_TOLERANCE`: `low | medium | high`
- `TIMELINE_WEEKS`: implementation timeline in weeks
- `TEAM_CAPACITY`: `qa automation | manual | dev support`

# Goal
Create a comprehensive API test strategy that helps the team:
- understand scope and test priorities
- map risks to test lines, coverage, and planning
- trace decisions back to the OpenAPI spec and documentation
- close gaps and open questions before tooling or release gates are finalized

# Required Output Files
Create these eight files in `OUTPUT_DIR`:
- `00_index.md`
- `01_test-strategy.md`
- `02_test-scope-matrix.md`
- `03_test-cases-priority.md`
- `04_non-functional.md`
- `05_schedule-and-resourcing.md`
- `06_traceability.md`
- `07_risks-gaps-open-questions.md`

## Guardrail
- This prompt is a template and must not store generated output inside itself.
- Write output only to `OUTPUT_DIR`.
- Do not overwrite prompt files under `.github/prompts/`.
- If evidence is missing, write `Not specified` or `Needs validation` instead of guessing.

# Anti-Hallucination Rules
- The strategy must stay grounded in the OpenAPI spec and `DOCS_PATHS`.
- Every major claim must cite evidence such as YAML lines, paths and methods, or doc headings.
- Do not invent business flows, permissions, SLAs, or operational processes.
- Distinguish clearly between `Observed`, `Assumption`, and `Open question`.

# Output Expectations
1. `00_index.md`
   - executive summary
   - list of all eight files and their purpose
   - anti-hallucination audit

2. `01_test-strategy.md`
   - test goals
   - risk profile
   - test levels and layers
   - entry and exit criteria

3. `02_test-scope-matrix.md`
   - in-scope and out-of-scope areas
   - mapping from capabilities to test depth
   - P0, P1, and P2 rationale

4. `03_test-cases-priority.md`
   - prioritized test lines and scenarios
   - P0, P1, and P2 rationale
   - critical negative lines such as auth, validation, idempotency, isolation, and error handling

5. `04_non-functional.md`
   - candidates for performance, resilience, security baseline, and observability checks
   - thresholds only when evidenced; otherwise mark `Needs validation`

6. `05_schedule-and-resourcing.md`
   - phased implementation guidance based on `TIMELINE_WEEKS`
   - effort allocation based on `TEAM_CAPACITY`
   - automation-first versus manual-first recommendations

7. `06_traceability.md`
   - spec and docs to risk to test line to tooling direction mapping
   - strong evidence for key areas

8. `07_risks-gaps-open-questions.md`
   - spec gaps
   - unresolved unknowns
   - risk register and mitigations
   - contradictions between docs and OpenAPI when present

# Execution Method
1. Read `API_SPEC_PATH` to understand servers, auth, paths, schemas, tags, and common responses.
2. Read `DOCS_PATHS` to extract business flows, data lifecycles, architectural constraints, and integrations.
3. Synthesize the strategy in this order: risks, scope, priorities, non-functional considerations, resourcing, traceability, and open questions.
4. If docs and spec conflict, do not resolve the conflict silently; document it in `07_risks-gaps-open-questions.md`.
5. If earlier phase-1 outputs already exist, align with them and elevate them into strategy decisions instead of duplicating raw findings.

# Self-Check
- [ ] All eight required files exist in `OUTPUT_DIR`
- [ ] Every critical section has evidence or is clearly marked `Not specified` or `Needs validation`
- [ ] Scope, priority, and traceability are consistent across the related files
- [ ] `07_risks-gaps-open-questions.md` reflects the actual gaps and conflicts
- [ ] No test line depends on a flow or field that is not supported by the OpenAPI spec or docs

# Execute Now
If the detailed review outputs already exist, use them as structured inputs, especially:
- `01-openapi-lint-fix.prompt.md`
- `02-auth-limits-analysis.prompt.md`
- `03-pagination-filtering-review.prompt.md`
- `04-test-patterns-review.prompt.md`
- `05-oas-snapshot.prompt.md`

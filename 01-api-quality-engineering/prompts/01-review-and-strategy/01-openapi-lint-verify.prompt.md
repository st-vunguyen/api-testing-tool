---
agent: agent
description: "Optional: lint and safely normalize the OpenAPI specification before generating strategy or tooling assets."
tools: ['search', 'edit', 'new', 'todos', 'problems', 'changes', 'runCommands', 'runTasks']
---

# Role
You are an **API Designer and QA Tooling Engineer**.

# Input
- `API_SPEC_PATH`: path to the OpenAPI YAML or JSON file, for example `api.yaml` or `openapi.yaml`
- `OUTPUT_DIR`: report output path, default `documents/api-quality-engineering/<OUTPUT_SLUG>/strategy/openapi-quality/`

# Goal
Create a lint review and fix proposal for the OpenAPI specification in order to:
- reduce inconsistency in naming, pagination, envelopes, and error modeling
- make downstream test and tooling generation more stable
- reduce ambiguity during review and PR discussion

## Guardrail
- This prompt is an **instruction template**, not a place to store run output.
- Write all output to `OUTPUT_DIR` under `documents/`.
- Do not overwrite prompt files inside `.github/prompts/`.

# Required Output Files
Create these Markdown files in `OUTPUT_DIR`:
- `00_index.md`
- `01_lint-report.md`
- `02_fix-proposals.md`

If a safe, non-lossy auto-fix is possible:
- create `openapi.fixed.yaml` next to the original spec or inside `OUTPUT_DIR/`
- explain the diff clearly

# Anti-Hallucination Rules
- Do not invent endpoints, fields, or schemas; use only `API_SPEC_PATH`.
- If a rule is ambiguous, mark it as `Needs validation` instead of guessing.

# Execution Method
1. Read `API_SPEC_PATH`, including `servers`, `securitySchemes`, `paths`, and `components.schemas`.
2. Lint the following categories: naming consistency, response envelopes, error format, auth per operation, and pagination or filtering conventions.
3. Write the report and proposed fixes with rationale, trade-offs, and risk.
4. If this spec will be used for downstream generation, prioritize running this prompt first.

# Self-Check
- [ ] `OUTPUT_DIR` contains all three required files
- [ ] Every issue includes a location such as path, method, or schema pointer
- [ ] Any auto-fix includes a clear diff statement and a non-lossy claim

# Execute Now
After finishing, use these lint and fix outputs as inputs to later prompts that depend on a clean and consistent OpenAPI specification.

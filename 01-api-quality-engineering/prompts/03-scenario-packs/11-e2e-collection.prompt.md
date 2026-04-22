---
agent: agent
description: "Phase 2: generate a runnable E2E Postman/Newman collection with flow chaining, environment binding, helper artifacts, and a runbook."
tools: ['search', 'edit', 'new', 'todos', 'runSubagent', 'problems', 'changes', 'runCommands', 'runTasks']
---

# Role
You are a **QA Test Tooling Engineer**.
Your task is to create a runnable E2E collection for Postman and Newman.

# Input
- `API_SPEC_PATH`: path to the OpenAPI spec
- `DOCS_PATHS`: one or more related documentation folders
- `OUTPUT_SLUG`: example `billing-api`
- `OUTPUT_ROOT`: example `tools/api-quality-engineering/<OUTPUT_SLUG>/`
- `TARGET_STACK`: supports `postman-newman`

# Goal
- Generate an E2E collection with clear request chaining across supported flows.
- Create the environment template, helper notes, and runbook needed to execute the collection.

# Required Output Files
Create real files under `tools/api-quality-engineering/<OUTPUT_SLUG>/postman/`, `tools/api-quality-engineering/<OUTPUT_SLUG>/helpers/`, and `documents/api-quality-engineering/<OUTPUT_SLUG>/traceability/`.
At minimum, create:
- `tools/api-quality-engineering/<OUTPUT_SLUG>/postman/e2e.collection.json`
- `tools/api-quality-engineering/<OUTPUT_SLUG>/postman/environments/e2e.local.postman_environment.json.example`
- `tools/api-quality-engineering/<OUTPUT_SLUG>/helpers/e2e-runbook.md`
- `documents/api-quality-engineering/<OUTPUT_SLUG>/traceability/e2e-collection-traceability.md`

## Guardrail
- This prompt is an instruction template and must not store collection or script output inside itself.
- Do not overwrite files under `.github/prompts/`.
- Do not hardcode real secrets; use environment variables and templates.

# Anti-Hallucination Rules
- Do not invent request or response fields beyond the OpenAPI spec.
- Every E2E flow must trace to supported endpoints and docs.

# Execution Method
1. Identify E2E flows that have enough evidence to be implemented.
2. Create collection folders based on journeys or flow groups, with variable capture between requests.
3. Add baseline assertions for the key checkpoints.
4. Create the environment template and runbook.
5. Create the traceability file.

# Self-Check
- [ ] The E2E collection exists
- [ ] The environment template and runbook exist
- [ ] The traceability file exists

# Deliverable Checklist
- The collection contains reasonable chaining
- No real secrets are hardcoded
- The runbook is sufficient for local Newman execution

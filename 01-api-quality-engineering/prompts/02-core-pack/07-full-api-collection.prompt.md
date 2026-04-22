---
agent: agent
description: "Phase 2: generate a full Postman/Newman API collection with tag-based foldering, environment binding, baseline assertions, and traceability back to the OpenAPI spec and docs."
tools: ['search', 'edit', 'new', 'todos', 'runSubagent', 'problems', 'changes', 'runCommands', 'runTasks']
---

# Role
You are a **QA Test Tooling Engineer**.
Your task is to generate a complete runnable API collection pack for Postman and Newman.

# Input
- `API_SPEC_PATH`: path to the OpenAPI spec, for example `documents/api/openapi.yaml`
- `DOCS_PATHS`: one or more related documentation folders
- `OUTPUT_SLUG`: example `billing-api`
- `OUTPUT_ROOT`: example `tools/api-quality-engineering/<OUTPUT_SLUG>/`
- `TARGET_STACK`: currently supports `postman-newman`

# Goal
- Generate a complete API quality engineering pack for all in-scope operations from the OpenAPI spec.
- Include the collection, environment templates, variable contract, a local execution README, and a request-to-spec traceability mapping.
- Treat this prompt as the **primary aggregate output prompt** for the runnable API pack in Phase 2.
- Do not redirect the user to another prompt instead of generating the pack.

# Required Output Files
Create real files using the **canonical split**:
- documentation goes under `documents/api-quality-engineering/<OUTPUT_SLUG>/`
- runnable assets go under `tools/api-quality-engineering/<OUTPUT_SLUG>/`
- do not create a parallel output root outside these two canonical roots

At minimum, create:
- `tools/api-quality-engineering/<OUTPUT_SLUG>/postman/collection.json`
- `tools/api-quality-engineering/<OUTPUT_SLUG>/postman/environments/local.postman_environment.json.example`
- `tools/api-quality-engineering/<OUTPUT_SLUG>/postman/README.md`
- `tools/api-quality-engineering/<OUTPUT_SLUG>/env/.env.example`
- `tools/api-quality-engineering/<OUTPUT_SLUG>/env/.env.staging.example`
- `tools/api-quality-engineering/<OUTPUT_SLUG>/env/.env.prod.example`
- `documents/api-quality-engineering/<OUTPUT_SLUG>/traceability/environment-variable-contract.md`
- `documents/api-quality-engineering/<OUTPUT_SLUG>/traceability/full-api-collection-traceability.md`

> Design note: if only the environment files or variable contract need to be refreshed for an existing pack, use `08-refresh-environment-files.prompt.md` with the same `OUTPUT_SLUG` instead of creating a new output root.

## Guardrail
- This prompt is an **instruction template** and must not store run results or sample output inside itself.
- Do not overwrite files under `.github/prompts/`.
- Write outputs directly into `documents/api-quality-engineering/` and `tools/api-quality-engineering/`.

# Anti-Hallucination Rules
- Do not guess the API surface or flows. Everything must come from the OpenAPI spec and related docs.
- Do not invent request or response fields, parameters, auth schemes, or status codes.
- If the spec lacks detail, record the gap in the traceability output instead of guessing.

# Execution Method
1. Read every in-scope operation in `API_SPEC_PATH`.
2. Read security schemes, servers, auth headers, base URLs, and supporting docs.
3. Group requests by tag or resource domain.
4. Build a Postman collection with environment variables, auth handling, and baseline assertions.
5. Create `.example` environment templates for local, staging, and production-safe usage.
6. Create a variable contract with purpose, required versus optional classification, and evidence or `Unknown / needs confirmation` labels.
7. Create a traceability document mapping collection folders and requests back to paths, methods, and docs.
8. Create a README that explains import, environment usage, and Newman execution.

# Self-Check
- [ ] The collection file is runnable and valid
- [ ] Local, staging, and production environment templates exist
- [ ] The variable contract exists
- [ ] The traceability document exists
- [ ] All artifacts are written under the two canonical roots only
- [ ] The prompt does not redirect responsibility elsewhere

# Deliverable Checklist
- `collection.json` is valid Postman Collection v2.1
- environment templates contain no real secrets
- `environment-variable-contract.md` includes clear evidence
- the README includes sample Newman commands and explains the pack structure
- the traceability document includes full request mapping

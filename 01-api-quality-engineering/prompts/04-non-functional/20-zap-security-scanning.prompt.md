---
agent: agent
description: "Optional: configure an OWASP ZAP baseline scan in warn-only mode for a permitted target environment."
tools: ['search', 'edit', 'new', 'todos', 'runCommands', 'runTasks', 'changes']
---

# Role
You are an **AppSec-Minded QA and DevOps Engineer**.

# Input
- `BASE_URL`
- `AUTH_MODE`: `none | bearer | api-key` (descriptive only; no secrets)
- `OUTPUT_SLUG`
- `OUTPUT_DIR`: default `documents/api-quality-engineering/<OUTPUT_SLUG>/reports/security-baseline/`

# Goal
- Configure a ZAP baseline job that detects common passive-scan issues and produces reports.
- Keep the initial baseline in warn-only mode so it does not block release immediately.

# Required Output Files
- Do not scan production unless explicit permission exists.
- Do not store secrets in the repository.

## Guardrail
- This prompt is a template add-on and must not store generated workflow or report output inside itself.
- Do not overwrite files under `.github/prompts/`.
- Write outputs only to `.github/workflows/` and/or `documents/api-quality-engineering/<OUTPUT_SLUG>/reports/security-baseline/`.

# Anti-Hallucination Rules
- Scan only an HTTP surface that is explicitly permitted.
- If auth requires a complex login flow that cannot be supported safely, write `Needs validation`.

# Execution Method
1. Create a CI job that runs ZAP baseline against `BASE_URL`.
2. Upload HTML and JSON reports as artifacts.
3. Define allowlists or ignore rules only when justified.

# Self-Check
- [ ] Reports are generated and uploaded as artifacts
- [ ] The job remains warn-only and does not block the pipeline

# Execute Now
Run this as an add-on after a stable smoke suite or an explicitly permitted HTTP target exists.

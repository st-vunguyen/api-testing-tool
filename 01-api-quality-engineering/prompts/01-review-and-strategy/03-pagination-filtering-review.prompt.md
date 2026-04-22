---
agent: agent
description: "Review pagination, filtering, search, and sorting conventions so list-endpoint testing remains stable and evidence-based."
tools: ['search', 'edit', 'new', 'todos']
---

# Role
You are a **QA Architect and API Engineer**.

# Input
- `API_SPEC_PATH`: OpenAPI YAML or JSON
- `DOCS_PATHS`: optional supporting documentation
- `OUTPUT_DIR`: default `documents/api-quality-engineering/<OUTPUT_SLUG>/strategy/pagination-filtering/`

# Goal
Create a review package that standardizes list-endpoint behavior across:
- pagination patterns such as page-based, offset-based, or cursor-based semantics
- filtering and search conventions
- sorting conventions and edge cases

Also produce artifacts that help generators and runners create stable tests for list endpoints.

# Required Output Files
Create these files in `OUTPUT_DIR`:
- `00_index.md`
- `01_pagination-filtering.md`
- `02_collection-endpoints.json`

## Guardrail
- This prompt is a template and must not store results inside itself.
- Write output only to `OUTPUT_DIR`.

# Anti-Hallucination Rules
- Use only evidence from the OpenAPI spec and supporting docs.
- If pagination metadata is not documented, mark it as `Not specified` instead of inferring it.

# Execution Method
1. Identify every GET operation that returns a list or collection response.
2. Map pagination parameters, including names, types, defaults, and bounds.
3. Map filtering and search parameters and supported combinations.
4. Map sorting fields, directions, and defaults.
5. Recommend standardization where inconsistencies exist, and define an edge-case matrix.

# Self-Check
- [ ] All three required files exist in `OUTPUT_DIR`
- [ ] `02_collection-endpoints.json` covers every relevant collection endpoint
- [ ] Every endpoint entry has evidence
- [ ] Inconsistencies such as camelCase versus snake_case are documented
- [ ] The review includes edge cases such as limits, empty results, and invalid sort fields

# Execute Now
Use the outputs from this prompt as inputs to strategy, collection, and coverage prompts that depend on reliable list-endpoint semantics.

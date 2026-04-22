# E2E Collection — Runbook

> **Purpose:** Explain how to execute advanced chained API flows locally or in CI.
> **Scope:** Starter instructions only. Replace flow names, folders, and environment files to match your project.

---

## Prerequisites

| Tool | Recommended Version |
|---|---|
| Node.js | 18+ |
| Newman | 6+ |
| Postman | Current desktop or web app |
| API environment | Local, staging, or disposable test env |

---

## Suggested Execution Order

1. Prepare environment values
2. Run smoke-ready flows first
3. Run full chained flows
4. Run teardown last
5. Archive raw reports and exported environments

---

## Example Newman Commands

### Smoke-first run

```bash
newman run tools/api-quality-engineering/<output-slug>/postman/collection.json   --environment tools/api-quality-engineering/<output-slug>/postman/environments/e2e.local.postman_environment.json.example   --folder "F-01 Auth and Project Setup"   --folder "F-02 Product Catalog"   --folder "F-07 Secret Key Lifecycle"
```

### Full chained run

```bash
newman run tools/api-quality-engineering/<output-slug>/postman/collection.json   --environment tools/api-quality-engineering/<output-slug>/postman/environments/e2e.local.postman_environment.json.example   --delay-request 150   --reporters cli,json   --reporter-json-export tools/api-quality-engineering/<output-slug>/reports/raw/e2e-run.json
```

### Teardown-only run

```bash
newman run tools/api-quality-engineering/<output-slug>/postman/collection.json   --environment tools/api-quality-engineering/<output-slug>/postman/environments/e2e.local.postman_environment.json.example   --folder "F-10 Full Teardown"
```

---

## Failure Triage

If a flow fails:

- Confirm the environment has all required manual values
- Check which variables should have been captured earlier
- Verify the target environment is clean enough for reruns
- Decide whether the issue is a script defect, test-data defect, or product defect

---

## CI Notes

- Prefer disposable environments for chained runs.
- Export raw reports separately from curated summaries.
- Keep teardown steps explicit, even for failing runs when safe.

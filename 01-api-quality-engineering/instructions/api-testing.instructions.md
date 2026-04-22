---
applyTo: "**/documents/api-quality-engineering/**,**/tools/api-quality-engineering/**,**/postman/**,**/env/**,**/.github/workflows/**"
description: "Mandatory rules for API quality engineering artifacts. Read before creating strategy docs, collections, env templates, helper assets, performance assets, or CI workflows."
---

# API Quality Engineering — Mandatory Rules

> Compatibility note: this legacy filename remains available for repos still referencing `api-testing.instructions.md`.

## 0) Dual-Tool Support Files

When this kit is installed into a real repository, the following support files are part of the intended committed setup — not runtime trash:

- `.github/instructions/**`
- `.github/prompts/api-quality-engineering/**`
- `.github/prompts/api-quality-engineering/**` (compatibility alias)
- `.claude/agents/**`
- `.claude/rules/**`
- `.claude/prompts/api-quality-engineering/**`
- `.claude/prompts/api-quality-engineering/**` (compatibility alias)
- `testing/SKILL.md`

Generated raw outputs, real env overrides, and exported current-value environments remain disposable and must stay out of git.

## 1) Source of Truth First

All generated API testing artifacts must be grounded in one or more of these sources:

1. OpenAPI / Swagger spec
2. Approved product or engineering docs
3. Existing committed API testing artifacts
4. Observed runtime evidence from an actual test run

If a claim is not backed by evidence:

- mark it as `Unknown / needs confirmation`
- capture it in gaps/open questions
- do NOT invent request bodies, fields, auth behavior, or response semantics

## 2) Output Scope Discipline

### Allowed output roots

| Path | Content |
|---|---|
| `documents/api-quality-engineering/**` | Strategy, scenarios, traceability, reports |
| `tools/api-quality-engineering/**` | Collections, env templates, samples, helpers |
| `.github/workflows/**` | API testing CI workflows |
| `performance/**` | k6 scripts only when explicitly requested |

### Forbidden by default

| Path | Reason |
|---|---|
| `src/**`, `app/**` | Product code is not part of API testing artifacts |
| `prisma/**`, `migrations/**`, `db/**` | Schema and migrations are product-owned |
| `.env`, `.env.*` | Real runtime env files must not be overwritten |
| `package.json`, `pyproject.toml`, `requirements.txt` | Dependency changes require explicit scope |
| Infra files | Only edit if the user explicitly asks for CI/infra support |

## 3) Naming and Path Conventions

Use these canonical roots in target projects:

```text
documents/api-quality-engineering/<output-slug>/
tools/api-quality-engineering/<output-slug>/
```

Recommended structure:

```text
documents/api-quality-engineering/<output-slug>/
├── strategy/
├── scenarios/
├── traceability/
└── reports/<run-slug>/

tools/api-quality-engineering/<output-slug>/
├── postman/
├── env/
├── data/
└── helpers/
```

Do not spread one logical pack across unrelated roots unless the artifact type requires it.

## 4) OpenAPI / Collection Discipline

- Keep request names aligned with method + path or business intent
- Group folders by stable domain or business flow, not by temporary priorities alone
- Use collection variables deliberately; document every captured variable in the variable contract
- Treat auth, pagination, sorting, filtering, idempotency, optimistic locking, and rate-limits as explicit test concerns
- If the spec omits response schemas for errors, assert only what is evidenced
- Do not hardcode secrets in collection files or example environments

## 5) Environment and Secrets Rules

- Commit only `.example` environment files
- Keep real secrets in secret stores, CI secrets, or ignored local files
- Distinguish clearly between:
   - static variables set manually
   - dynamic variables captured by scripts
   - derived variables composed during execution
- Production templates must be safe by default and read-only unless explicitly instructed otherwise
- Destructive requests must be tagged or documented with environment restrictions

## 6) Data and Cleanup Rules

- Example datasets must be non-sensitive and synthetic
- Data-driven files must map clearly to endpoints or scenario groups
- If a flow creates state, document cleanup or teardown expectations
- For non-idempotent or destructive operations, define execution order and rollback expectations
- If cleanup order matters because of foreign keys or domain constraints, state it explicitly

## 7) Traceability Rules

Every runnable pack must include traceability for:

- request/folder → OpenAPI path + method
- request/folder → scenario ID
- scenario → source doc or requirement
- variable → where it is set and where it is consumed

If coverage is intentionally partial, say what is excluded and why.

## 8) Safety Rules for Destructive Testing

Before enabling create/update/delete flows, confirm:

- target environment is appropriate for destructive testing
- test account and test data scope are isolated
- teardown steps are available or clearly documented
- prod paths are disabled or explicitly marked read-only when required

Never assume destructive tests are safe in staging or production.

## 9) Pre-Completion Checklist

Before marking an API testing task complete:

- [ ] Outputs are limited to approved roots
- [ ] No real secrets were committed
- [ ] Every endpoint/assertion is evidence-backed
- [ ] Variable contract matches the collection and env templates
- [ ] Traceability files map requests to OpenAPI/docs/scenarios
- [ ] Destructive flows are clearly labeled and environment-safe
- [ ] README/runbook explains how to run, what to configure, and what not to do

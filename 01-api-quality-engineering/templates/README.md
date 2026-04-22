# API Quality Engineering Templates

> Product name: **API Quality Engineering Kit**  
> Canonical source folder in this repository is `api-quality-engineering/`. Legacy compatibility filenames remain available inside this kit where needed.

The `templates/` folder now mirrors the simpler layout used by `e2e-playwright`:

- `api-pack/` is the **canonical runnable starter pack** for API quality engineering.
- `examples/` isolates review/planning examples so the main copy target stays obvious.

This keeps the kit easy to navigate:

```text
templates/
├── README.md                         ← Template map and usage guidance
├── .gitignore                        ← Git hygiene for raw outputs and real env overrides
├── .github/workflows/                ← Newman CI starter workflow
├── api-pack/                         ← Canonical reusable runnable API quality engineering pack
└── examples/
	├── 00-api-test-strategy/
	├── 01-verify-API-document/
	├── 02-auth-and-limits/
	├── 03-pagination-filtering/
	├── 04-test-patterns/
	├── 05-oas-snapshot/
	└── 06-comprehensive-api-test-strategy/
```

## Design Principle

`e2e-playwright/templates/` works well because it has one obvious copy target. This API kit now follows the same idea:

- analysis and planning examples stay available for reference
- runnable assets have one canonical home
- prompts map to the canonical home without ambiguity

## Which Folder to Use

| Need | Use |
|---|---|
| Study an example strategy or review artifact | `examples/` |
| Bootstrap a new runnable API quality engineering pack | `api-pack/` |
| Copy Postman/Newman starter assets | `api-pack/postman/` |
| Copy env templates and variable contract | `api-pack/env/` + `environment-variable-contract.md` |
| Copy CI starter workflow | `.github/workflows/api-quality-engineering-newman.yml` |
| Bootstrap JMeter performance stack | `api-pack/performance/jmeter/` |

## Automated Apply Option

If you want this copy model applied automatically, use `api-quality-engineering/scripts/apply-api-quality-engineering-kit.js` (preferred) or `api-quality-engineering/scripts/apply-api-testing-kit.js` (compatibility alias). It copies the canonical pack into `tools/api-quality-engineering/<output-slug>/`, creates the matching `documents/api-quality-engineering/<output-slug>/` roots, copies AI support files, and merges the kit `.gitignore` rules for raw outputs and real env overrides.

## Canonical Copy Model

Use `api-pack/` as the source when creating a real project pack.

| Template source | Target project path |
|---|---|
| `api-pack/postman/` | `tools/api-quality-engineering/<output-slug>/postman/` |
| `api-pack/env/` | `tools/api-quality-engineering/<output-slug>/env/` |
| `api-pack/data/` | `tools/api-quality-engineering/<output-slug>/data/` |
| `api-pack/helpers/` | `tools/api-quality-engineering/<output-slug>/helpers/` |
| `api-pack/performance/` | `tools/api-quality-engineering/<output-slug>/performance/` |
| `api-pack/performance/jmeter/` | `tools/api-quality-engineering/<output-slug>/performance/jmeter/` |
| `api-pack/reports/raw/` | `tools/api-quality-engineering/<output-slug>/reports/raw/` |
| `api-pack/environment-variable-contract.md` | `documents/api-quality-engineering/<output-slug>/traceability/02_variable-contract.md` |
| `api-pack/performance-collection-reporting.md` | `documents/api-quality-engineering/<output-slug>/strategy/performance-collection-reporting.md` |
| `.github/workflows/api-quality-engineering-newman.yml` | `.github/workflows/api-quality-engineering-newman.yml` |

## Notes on Existing Example Content

- `examples/` holds **generic, project-agnostic example artifacts** meant to show structure and documentation style.
- `api-pack/` is the only **canonical runnable starter pack** intended for direct copying into a real project.
- Some sample datasets under `api-pack/data/` may still act as illustrative starter data and should always be reviewed before reuse in a real API domain.

For new work, start from `api-pack/README.md`, `postman/`, `env/`, `helpers/`, and `.github/workflows/api-quality-engineering-newman.yml`.

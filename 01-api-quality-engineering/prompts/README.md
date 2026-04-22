# API Quality Engineering Prompts

> Product name: **API Quality Engineering Kit**  
> Canonical source folder in this repository is `api-quality-engineering/`. Legacy compatibility filenames remain available inside this kit where needed.

A reusable, project-agnostic prompt pipeline for delivering API quality engineering from specification review to runnable collections, execution evidence, performance execution, JMeter reporting, and maintenance after spec changes.

```text
SPEC → Review → Strategy → Scenarios → Runnable Pack → Execution → Report → Maintenance
```

## Entry Point

Before running the orchestrator in a real project, bootstrap the target repo with `api-quality-engineering/APPLY_RECIPE.md` or `api-quality-engineering/scripts/apply-api-quality-engineering-kit.js` so the canonical `documents/` + `tools/` roots already exist and both Copilot + Claude support trees are present when applicable.

Start with the orchestrator when you want the full API quality engineering lifecycle handled in one flow.

| Prompt | Purpose |
|---|---|
| `00-orchestration/00-run-pipeline.prompt.md` | Orchestrates the full API quality engineering pipeline with quality gates |

## Prompt Groups

| Folder | Purpose | Prompts |
|---|---|---|
| `00-orchestration/` | Primary entrypoint | `00` |
| `01-review-and-strategy/` | OpenAPI review and strategy synthesis | `01`–`06` |
| `02-core-pack/` | Core runnable pack, env templates, sample data | `07`–`09` |
| `03-scenario-packs/` | E2E journey, contract, integration, regression assets | `10`–`17` |
| `04-non-functional/` | Performance planning, performance execution, security baseline, and advanced JMeter workflows | `18`–`21`, `23`–`26` |
| `05-maintenance/` | Full maintenance flow after spec changes | `22` |

## Canonical Prompt List

| # | File | Phase | Primary output |
|---|---|---|---|
| 00 | `00-orchestration/00-run-pipeline.prompt.md` | Orchestration | End-to-end coordination |
| 01 | `01-review-and-strategy/01-openapi-lint-verify.prompt.md` | Spec review | `documents/api-quality-engineering/<output-slug>/strategy/openapi-quality/` |
| 02 | `01-review-and-strategy/02-auth-limits-analysis.prompt.md` | Auth & limits | `documents/api-quality-engineering/<output-slug>/strategy/auth-and-limits/` |
| 03 | `01-review-and-strategy/03-pagination-filtering-review.prompt.md` | List semantics | `documents/api-quality-engineering/<output-slug>/strategy/pagination-filtering/` |
| 04 | `01-review-and-strategy/04-test-patterns-review.prompt.md` | Test patterns | `documents/api-quality-engineering/<output-slug>/strategy/test-patterns/` |
| 05 | `01-review-and-strategy/05-oas-snapshot.prompt.md` | OAS snapshot | `documents/api-quality-engineering/<output-slug>/strategy/oas-snapshot/` |
| 06 | `01-review-and-strategy/06-comprehensive-test-strategy.prompt.md` | Strategy synthesis | `documents/api-quality-engineering/<output-slug>/strategy/` |
| 07 | `02-core-pack/07-full-api-collection.prompt.md` | Runnable pack | `tools/api-quality-engineering/<output-slug>/postman/` + traceability docs |
| 08 | `02-core-pack/08-refresh-environment-files.prompt.md` | Fixtures & support | `tools/api-quality-engineering/<output-slug>/env/`, `data/`, `helpers/`, CI stubs |
| 09 | `02-core-pack/09-data-driven-samples.prompt.md` | Data samples | `tools/api-quality-engineering/<output-slug>/data/` + traceability docs |
| 10 | `03-scenario-packs/10-e2e-journeys-doc.prompt.md` | Advanced journey docs | `documents/api-quality-engineering/<output-slug>/scenarios/` |
| 11 | `03-scenario-packs/11-e2e-collection.prompt.md` | Chained journey pack | `tools/api-quality-engineering/<output-slug>/postman/` + advanced helpers |
| 12 | `03-scenario-packs/12-contract-coverage-plan.prompt.md` | Contract coverage | `documents/api-quality-engineering/<output-slug>/traceability/` |
| 13 | `03-scenario-packs/13-contract-collection.prompt.md` | Contract pack | `tools/api-quality-engineering/<output-slug>/postman/contract.collection.json` |
| 14 | `03-scenario-packs/14-integration-flows-doc.prompt.md` | Integration docs | `documents/api-quality-engineering/<output-slug>/scenarios/` |
| 15 | `03-scenario-packs/15-integration-collection.prompt.md` | Integration pack | `tools/api-quality-engineering/<output-slug>/postman/integration.collection.json` |
| 16 | `03-scenario-packs/16-regression-scenarios.prompt.md` | Regression docs | `documents/api-quality-engineering/<output-slug>/scenarios/` |
| 17 | `03-scenario-packs/17-regression-collection.prompt.md` | Regression pack | `tools/api-quality-engineering/<output-slug>/postman/regression.collection.json` |
| 18 | `04-non-functional/18-performance-scenarios.prompt.md` | Performance docs | `documents/api-quality-engineering/<output-slug>/scenarios/` |
| 19 | `04-non-functional/19-performance-collection.prompt.md` | Performance pack | `tools/api-quality-engineering/<output-slug>/performance/` |
| 20 | `04-non-functional/20-zap-security-scanning.prompt.md` | Security baseline | `.github/workflows/` + `documents/api-quality-engineering/<output-slug>/reports/security-baseline/` |
| 21 | `04-non-functional/21-fully-performance-testing.prompt.md` | Performance execution | `tools/api-quality-engineering/<output-slug>/reports/raw/performance/` + `documents/api-quality-engineering/<output-slug>/reports/performance/` |
| 23 | `04-non-functional/23-jmeter-stack-setup.prompt.md` | JMeter stack setup | `tools/api-quality-engineering/<output-slug>/performance/jmeter/` + strategy notes |
| 24 | `04-non-functional/24-jmeter-convert-collections.prompt.md` | JMeter conversion | `tools/api-quality-engineering/<output-slug>/performance/jmeter/test-plan.jmx` + traceability docs |
| 25 | `04-non-functional/25-jmeter-execute-and-report.prompt.md` | JMeter execution | `tools/api-quality-engineering/<output-slug>/reports/raw/performance/jmeter/` + curated run docs |
| 26 | `04-non-functional/26-jmeter-report-analysis.prompt.md` | JMeter analysis | `documents/api-quality-engineering/<output-slug>/reports/performance/jmeter/` + `dashboard.html` |
| 22 | `05-maintenance/22-maintenance-fully-api-quality-engineering.prompt.md` | Maintenance | Refresh the full API quality engineering kit after spec/docs changes |

## Canonical Paths

| Artifact | Path |
|---|---|
| Strategy docs | `documents/api-quality-engineering/<output-slug>/strategy/` |
| Scenario docs | `documents/api-quality-engineering/<output-slug>/scenarios/` |
| Traceability docs | `documents/api-quality-engineering/<output-slug>/traceability/` |
| Curated execution reports | `documents/api-quality-engineering/<output-slug>/reports/<run-slug>/` |
| Curated performance reports | `documents/api-quality-engineering/<output-slug>/reports/performance/<run-slug>/` |
| Postman/Newman assets | `tools/api-quality-engineering/<output-slug>/postman/` |
| Environment templates | `tools/api-quality-engineering/<output-slug>/env/` |
| Data samples | `tools/api-quality-engineering/<output-slug>/data/` |
| Helper notes/scripts | `tools/api-quality-engineering/<output-slug>/helpers/` |
| Performance runner assets | `tools/api-quality-engineering/<output-slug>/performance/` |
| Raw runner output | `tools/api-quality-engineering/<output-slug>/reports/raw/` |
| CI workflows | `.github/workflows/` |

## Prompt Flow

1. `01-review-and-strategy/06-comprehensive-test-strategy.prompt.md` defines risk, scope, and quality gates.
2. `02-core-pack/07-full-api-collection.prompt.md` builds the runnable Postman/Newman pack and request-level traceability.
3. `02-core-pack/08-refresh-environment-files.prompt.md` adds environment templates, data samples, helper notes, and CI support.
4. `03-scenario-packs/10-e2e-journeys-doc.prompt.md` documents multi-step chained API journeys when needed.
5. `03-scenario-packs/11-e2e-collection.prompt.md` translates those journeys into runnable chained collection guidance.
6. `04-non-functional/18-performance-scenarios.prompt.md` and `19-performance-collection.prompt.md` define the workload plan and runner assets.
7. `04-non-functional/21-fully-performance-testing.prompt.md` executes the generated performance workload when safe and supported.
8. `04-non-functional/23-jmeter-stack-setup.prompt.md` through `26-jmeter-report-analysis.prompt.md` add the standard JMeter path when deeper performance engineering is needed.
9. `05-maintenance/22-maintenance-fully-api-quality-engineering.prompt.md` refreshes the whole API quality engineering pack when a new spec or docs arrive.

## Prompt Layout

- `prompts/00-orchestration/00-run-pipeline.prompt.md` = canonical guided entry point
- `prompts/01-review-and-strategy/` = review and strategy generation
- `prompts/02-core-pack/` = core runnable pack generation
- `prompts/03-scenario-packs/` = specialized journey and coverage packs
- `prompts/04-non-functional/` = performance planning, performance execution, security baseline, and JMeter expansion
- `prompts/05-maintenance/` = maintenance-only prompt for later spec changes

If you need one clean default path, use `00-orchestration/00-run-pipeline.prompt.md` first and then open the grouped prompt family that matches the task.

## Template Relationship

- Use `../templates/README.md` to choose the right template layer.
- Use `../templates/api-pack/` as the canonical runnable reference pack.
- Treat `../templates/examples/` as reference artifacts for earlier review and planning phases.

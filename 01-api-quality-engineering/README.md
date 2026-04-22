# API Quality Engineering Kit

> Product name: **API Quality Engineering Kit**  
> Canonical source folder in this repository is `api-quality-engineering/`. Legacy compatibility filenames remain available inside this kit where needed.

A reusable, project-agnostic prompt kit for delivering API quality engineering from specification review to runnable packs, execution evidence, JMeter-grade performance analysis, and release readiness.

```text
SPEC → Review → Strategy → Runnable Pack → Execution → Report
```

## Kit Structure

```text
api-quality-engineering/
│
├── README.md                                     ← You are here
├── GUIDELINE.md                                  ← Practical purpose, flows, pitfalls, and usage modes
├── APPLY_RECIPE.md                               ← Checklist + bootstrap recipe for real repos
├── TOOL_SUPPORT.md                               ← Exact Copilot + Claude support matrix
│
├── agents/
│   ├── api-testing-qc.agent.md                   ← Compatibility agent filename
│   └── api-quality-engineering-qc.agent.md       ← Preferred branded agent filename
│
├── instructions/
│   ├── api-testing.instructions.md               ← Compatibility instruction filename
│   ├── api-quality-engineering.instructions.md   ← Preferred branded instruction filename
│   └── reporting.instructions.md                 ← Execution evidence, CI/reporting, artifact hygiene
│
├── prompts/
│   ├── README.md                                 ← Canonical pipeline overview + grouped prompt map
│   ├── 00-orchestration/
│   ├── 01-review-and-strategy/
│   ├── 02-core-pack/
│   ├── 03-scenario-packs/
│   ├── 04-non-functional/
│   └── 05-maintenance/
│
├── templates/
│   ├── README.md                                 ← Template map and canonical structure
│   ├── api-pack/                                 ← Canonical runnable API quality engineering pack
│   └── examples/                                 ← Reference outputs isolated from the copy target
│
├── scripts/
│   ├── apply-api-testing-kit.js                  ← Compatibility bootstrap script
│   └── apply-api-quality-engineering-kit.js      ← Preferred bootstrap script alias
│
└── testing/
    └── SKILL.md                                  ← Skill file for building API test assets
```

## Canonical Output Model

Use this split consistently in target projects:

| Artifact type | Canonical path |
|---|---|
| Strategy docs | `documents/api-quality-engineering/<output-slug>/strategy/` |
| Scenario docs | `documents/api-quality-engineering/<output-slug>/scenarios/` |
| Traceability docs | `documents/api-quality-engineering/<output-slug>/traceability/` |
| Execution reports | `documents/api-quality-engineering/<output-slug>/reports/<run-slug>/` |
| Postman/Newman assets | `tools/api-quality-engineering/<output-slug>/postman/` |
| Env templates | `tools/api-quality-engineering/<output-slug>/env/` |
| Sample datasets | `tools/api-quality-engineering/<output-slug>/data/` |
| Helper notes/scripts | `tools/api-quality-engineering/<output-slug>/helpers/` |
| Performance runner assets | `tools/api-quality-engineering/<output-slug>/performance/` |
| CI workflows | `.github/workflows/` |

## Quick Start

> Prefer the automated recipe? Use `APPLY_RECIPE.md` and `scripts/apply-api-quality-engineering-kit.js` to bootstrap a real repo from an OpenAPI/Swagger spec in one repeatable step.

> Best practice: keep both `.github/*` and `.claude/*` support trees in the same repo so Copilot and Claude can use the same kit without drift.

### 1. Place Agent, Instructions, and Prompts

| Layer | Claude Code | VS Code / Copilot | Commit? |
|---|---|---|---|
| Agent persona | `.claude/agents/` | N/A | Yes |
| Instructions | `.claude/rules/` | `.github/instructions/` | Yes |
| Prompts | `.claude/prompts/api-quality-engineering/` | `.github/prompts/api-quality-engineering/` | Yes |
| Shared skill | `testing/SKILL.md` | `testing/SKILL.md` | Yes |

```bash
# Example: VS Code / GitHub Copilot
mkdir -p <your-project>/.github/instructions <your-project>/.github/prompts/api-quality-engineering
cp instructions/*.md <your-project>/.github/instructions/
cp -R prompts/* <your-project>/.github/prompts/api-quality-engineering/
```

Also install the Claude layout when the repo supports both tools.

Start with the grouped namespaced prompt `00-orchestration/00-run-pipeline.prompt.md` for your active tool.

### 2. Copy the Canonical Template Pack

Use `templates/api-pack/` as the runnable reference implementation.

```bash
mkdir -p <your-project>/tools/api-quality-engineering/my-api
cp -R templates/api-pack/* <your-project>/tools/api-quality-engineering/my-api/
mkdir -p <your-project>/.github/workflows
cp templates/.github/workflows/api-quality-engineering-newman.yml <your-project>/.github/workflows/
```

Then customize:

| Path | Customize |
|---|---|
| `postman/collection.json` | Foldering, auth scripts, assertions, request bodies |
| `postman/environments/*.example` | Base URLs, non-secret defaults, variable scopes |
| `env/.env*.example` | CLI-friendly environment placeholders |
| `performance/` | Performance runner baseline, local scripts, execution config |
| `documents/api-quality-engineering/<output-slug>/traceability/environment-variable-contract.md` | Required vs optional variables, evidence, owners |
| `documents/api-quality-engineering/<output-slug>/strategy/performance-collection-reporting.md` | Reporting contract for prompts `19` and `21` |
| `documents/api-quality-engineering/<output-slug>/traceability/full-api-collection-traceability.md` | Request → spec → scenario coverage map |
| `data/samples/` | Iteration data for data-driven coverage |
| `e2e-journeys/` | Multi-step business flows backed by API calls |
| `e2e-collection/` | Chained E2E flow collection notes and env helpers |
| `reports/raw/` | Raw execution output model for Newman/k6/ZAP |

### 2.1 Apply Automatically

```bash
# preview
node api-quality-engineering/scripts/apply-api-quality-engineering-kit.js \
    --target /absolute/path/to/your-repo \
    --slug my-api \
    --spec spec/openapi.yaml \
    --assistant both \
    --dry-run

# apply
node api-quality-engineering/scripts/apply-api-quality-engineering-kit.js \
    --target /absolute/path/to/your-repo \
    --slug my-api \
    --spec spec/openapi.yaml \
    --assistant both
```

See `api-quality-engineering/APPLY_RECIPE.md`, `api-quality-engineering/GUIDELINE.md`, and `api-quality-engineering/TOOL_SUPPORT.md` for the full usage model.

### 3. Choose the Right Prompt Layer

| Need | Start with |
|---|---|
| End-to-end API quality engineering pipeline | `prompts/00-orchestration/00-run-pipeline.prompt.md` |
| Full collection pack only | `prompts/02-core-pack/07-full-api-collection.prompt.md` |
| Refresh env templates only | `prompts/02-core-pack/08-refresh-environment-files.prompt.md` |
| Performance pack design | `prompts/04-non-functional/18-performance-scenarios.prompt.md` + `19-performance-collection.prompt.md` |
| Performance pack execution | `prompts/04-non-functional/21-fully-performance-testing.prompt.md` |
| Standard JMeter stack and reporting | `prompts/04-non-functional/23-jmeter-stack-setup.prompt.md` → `26-jmeter-report-analysis.prompt.md` |
| Security baseline | `prompts/04-non-functional/20-zap-security-scanning.prompt.md` |
| Maintenance after spec changes | `prompts/05-maintenance/22-maintenance-fully-api-quality-engineering.prompt.md` |

## Pipeline Flow

| Step | Prompt | Output |
|---|---|---|
| 1 | `prompts/01-review-and-strategy/06-comprehensive-test-strategy.prompt.md` | `documents/api-quality-engineering/<output-slug>/strategy/` |
| 2 | `prompts/02-core-pack/07-full-api-collection.prompt.md` | `tools/api-quality-engineering/<output-slug>/postman/` + traceability docs |
| 3 | `prompts/02-core-pack/08-refresh-environment-files.prompt.md` | `tools/api-quality-engineering/<output-slug>/env/`, `data/`, `helpers/` |
| 4 | `prompts/03-scenario-packs/10-e2e-journeys-doc.prompt.md` or `11-e2e-collection.prompt.md` | `documents/api-quality-engineering/<output-slug>/scenarios/` + advanced journey assets |
| 5 | `prompts/04-non-functional/21-fully-performance-testing.prompt.md` | Performance raw evidence + curated performance report |
| 6 | `prompts/04-non-functional/23-jmeter-stack-setup.prompt.md` → `26-jmeter-report-analysis.prompt.md` | Standard JMeter setup, conversion, execution, and executive dashboard |
| 7 | `prompts/00-orchestration/00-run-pipeline.prompt.md` | Orchestrated end-to-end handoff across selected steps |

Use `00-orchestration/00-run-pipeline.prompt.md` to orchestrate the initial build flow with quality gates.

## Design Principles

| Principle | Why it matters |
|---|---|
| Evidence-first | Never invent endpoints, schemas, or expected behavior outside OpenAPI/docs/runtime evidence |
| Clean output split | Human-readable docs live in `documents/`; runnable assets live in `tools/` |
| One canonical pack | `templates/api-pack/` is the reference pack; `templates/examples/` holds supporting examples |
| Traceability everywhere | Every request, variable, and report item maps back to spec/docs/scenarios |
| Safe env handling | Example env files only; no secrets or destructive prod defaults |
| Modular depth | Canonical pipeline is simple, while grouped prompts `01`–`21`, `23`–`26`, and maintenance `22` allow focused generation |

## Committed Support Files vs Disposable Outputs

| Committed | Gitignored / disposable |
|---|---|
| `.github/instructions/`, `.github/prompts/api-quality-engineering/`, compatibility alias `.github/prompts/api-testing/` | `tools/api-quality-engineering/**/reports/raw/**` |
| `.claude/agents/`, `.claude/rules/`, `.claude/prompts/api-quality-engineering/`, compatibility alias `.claude/prompts/api-testing/` | real `tools/api-quality-engineering/**/env/.env*` |
| `testing/SKILL.md` | exported current-value Postman environments |
| `documents/api-quality-engineering/**` | one-off Newman / k6 / ZAP raw outputs |
| `tools/api-quality-engineering/**` templates, performance baselines, and collections | runner caches |

## Recommended Usage Pattern

1. Start with `GUIDELINE.md` when you want the rationale, recommended modes, and pitfalls before generating anything.
2. Start with `prompts/00-orchestration/00-run-pipeline.prompt.md` when you want one guided flow.
3. Use `prompts/01-review-and-strategy/` to review the spec and assemble the strategy baseline.
4. Use `prompts/02-core-pack/` and `prompts/03-scenario-packs/` to generate the runnable pack and specialized coverage.
5. Use `prompts/04-non-functional/` for performance planning, performance execution, JMeter expansion, and the security baseline.
6. Use `prompts/05-maintenance/22-maintenance-fully-api-quality-engineering.prompt.md` when a new spec arrives and existing assets must be refreshed.
7. Treat `templates/api-pack/` as the implementation reference while prompts generate project-specific outputs.

## Notes on `templates/`

- `templates/api-pack/` is the only template pack intended to be copied as a runnable baseline.
- `templates/examples/` keeps review/planning examples out of the main copy target so search results stay cleaner.
- If you need a simple entry point, start with `templates/README.md` and `templates/api-pack/README.md`.

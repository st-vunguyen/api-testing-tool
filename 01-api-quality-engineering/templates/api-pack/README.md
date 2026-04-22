# API Pack — Canonical Runnable Pack

This folder is the canonical starter pack for reusable API quality engineering.

Use it the same way `e2e-playwright/templates/` is used: copy the structure into a target project, then customize the collection, variables, sample data, and CI workflow for the real API.

## Canonical Structure

```text
api-pack/
├── README.md
├── environment-variable-contract.md
├── postman/
│   ├── collection.json
│   ├── README.md
│   └── environments/
│       ├── local.postman_environment.json.example
│       ├── staging.postman_environment.json.example
│       ├── prod.postman_environment.json.example
│       └── e2e.local.postman_environment.json.example
├── env/
│   ├── .env.example
│   ├── .env.staging.example
│   └── .env.prod.example
├── data/
│   ├── samples/
│   └── generators/
├── helpers/
│   ├── postman-script-snippets.md
│   └── runbook.md
├── performance/
│   ├── README.md
│   ├── local.env.example
│   ├── execution-config.json
│   ├── run-local.sh
│   ├── run-local.ps1
│   ├── k6-script.js
│   ├── newman-performance.collection.json
│   ├── newman-performance.postman_environment.json.example
│   └── jmeter/
│       ├── starter-test-plan.jmx
│       ├── user.properties
│       ├── reportgenerator.properties
│       ├── plugins-catalog.md
│       ├── run-jmeter.sh
│       ├── run-jmeter.ps1
│       ├── render-jmeter-dashboard.js
│       └── datasets/
├── performance-collection-reporting.md
├── reports/
│   └── raw/
│       ├── README.md
│       └── performance/
│           └── README.md
├── e2e-journeys/
└── e2e-collection/
```

## What Is Canonical vs Example

| Area | Status | Notes |
|---|---|---|
| `postman/`, `env/`, `helpers/`, `performance/`, `reports/raw/`, `performance-collection-reporting.md` | Canonical starter | Copy these first for a new project |
| `data/samples/` | Example starter data | Replace or extend per domain |
| `e2e-journeys/`, `e2e-collection/` | Advanced reference | Use when your API pack needs chained business journeys |

## Recommended Target Layout

Copy these templates into a real project using this split:

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
├── helpers/
├── performance/
└── reports/raw/
```

## Customization Checklist

| Path | Customize |
|---|---|
| `postman/collection.json` | Domain folders, requests, auth, assertions, variable capture |
| `postman/environments/*.example` | Base URLs, placeholder variables, readonly-prod constraints |
| `env/.env*.example` | CLI-friendly placeholders only |
| `environment-variable-contract.md` | Required, optional, captured, and derived variables |
| `data/samples/` | Synthetic iteration data mapped to scenario groups |
| `helpers/` | Shared script snippets, troubleshooting, local runbook |
| `performance/` | Performance runner baseline, local wrappers, JMeter stack, and stack-specific starter assets |
| `performance-collection-reporting.md` | Curated reporting contract for performance runs |
| `reports/raw/README.md` | Raw outputs expected from Newman, k6, or ZAP |

## Safety Rules

- Commit only example env files.
- Keep prod templates read-only by default.
- Use synthetic data only.
- Separate asset issues from system issues in reports.
- Do not treat example data files as authoritative for a new API without review.

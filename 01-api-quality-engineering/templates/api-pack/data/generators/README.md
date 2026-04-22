# Data Generators — Generic API Quality Engineering Starter

> **Purpose:** Explain how to turn the example JSON samples in `data/samples/` into iteration data, seeded fixtures, or larger synthetic datasets.
> **Scope:** Generic starter guidance only. Replace entity names, fields, and constraints with those from your real API.

---

## Overview

The `data/samples/` folder contains small, synthetic example datasets that can be used as:

1. Stable fixtures checked into source control
2. Newman iteration inputs via `--iteration-data`
3. Seed payload references for local or CI test setup

The files in this starter pack are intentionally small and readable. They show structure, not authority.

---

## Recommended Layout

```text
tools/api-quality-engineering/<output-slug>/data/
├── samples/
│   ├── auth.json
│   ├── projects.json
│   ├── apps.json
│   ├── products.json
│   ├── virtual-currencies.json
│   ├── entitlements.json
│   ├── offerings.json
│   ├── customers.json
│   ├── customer-attributes.json
│   ├── secret-api-keys.json
│   └── paywalls.json
└── generators/
    └── README.md
```

---

## Usage Patterns

### Static fixture reference

- Keep a small number of representative happy-path and negative-path records.
- Use `_case` for human-readable scenario names.
- Use `_meta` for endpoint coverage and source references.

### Newman iteration data

If your collection expects flat rows, create a derived file from nested sample JSON.

```bash
newman run tools/api-quality-engineering/<output-slug>/postman/collection.json   --environment tools/api-quality-engineering/<output-slug>/postman/environments/local.postman_environment.json.example   --iteration-data tools/api-quality-engineering/<output-slug>/data/samples/auth.json
```

### Seed data generation

Use the sample files as a contract for what a seeding script should create first, then replace placeholder values with generated IDs from earlier calls.

---

## Minimal Generation Pattern

When you need larger datasets, generate them from the same field contract used by your sample files.

```javascript
import { faker } from '@faker-js/faker';
import { writeFileSync } from 'fs';

const count = Number(process.argv[2] ?? 50);

const rows = Array.from({ length: count }, (_, index) => ({
  _case: `GEN-${index + 1}`,
  name: `Example ${faker.company.name()}`,
  external_id: faker.string.alphanumeric(10).toLowerCase(),
  email: faker.internet.email().toLowerCase()
}));

writeFileSync('generated.json', JSON.stringify(rows, null, 2));
```

Rules:

- Keep generated data synthetic only.
- Avoid hidden coupling to one environment.
- Document fields that must remain unique.
- Separate fixture generation from cleanup logic.

---

## Dependency Ordering

If your API has parent-child entities, seed in dependency order.

Example:

```text
Authenticate → Create project/workspace → Create app/integration → Create product/plan
→ Create access policy/entitlement → Create bundle/offering → Create customer/account
→ Create API keys or publishable surfaces if needed
```

Cleanup usually runs in reverse order.

---

## Customization Checklist

- Replace placeholder endpoint families with your own domains.
- Replace example constraints with spec-backed constraints.
- Add IDs captured from earlier requests instead of hard-coded relationships.
- Split very large datasets into one file per domain or scenario group.
- Keep one README per custom generator folder when logic becomes non-trivial.

---

## Output Expectations

Generated files should be:

- Deterministic when possible
- Small enough for code review when committed
- Named by domain and intent
- Safe to use in local, CI, and disposable test environments

---

## Related Artifacts

- `../samples/` — starter fixture shapes
- `../../environment-variable-contract.md` — variable ownership and capture rules
- `../../postman/README.md` — collection and environment usage
- `../../helpers/runbook.md` — execution and troubleshooting notes

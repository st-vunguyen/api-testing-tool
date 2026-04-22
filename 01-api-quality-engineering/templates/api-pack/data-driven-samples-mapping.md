# Data-Driven Samples Mapping

> **Purpose:** Show how the example files in `data/samples/` map to common API quality engineering domains.
> **Scope:** Starter guidance only. Replace DTO names, endpoints, and test IDs with your project-specific evidence.

---

## How to Use This File

For each sample file:

1. Confirm the real request schema in your OpenAPI spec
2. Map the sample to one or more scenario groups
3. Capture cleanup expectations for created data
4. Link the final collection requests to strategy and traceability docs

---

## Sample Coverage Matrix

| Sample File | Example Domain | Typical Endpoints | Common Assertions |
|---|---|---|---|
| `samples/auth.json` | Authentication | `POST /auth/register`, `POST /auth/login` | Status, token fields, auth failures |
| `samples/projects.json` | Projects / Workspaces | CRUD on `/projects` | Required fields, update behavior, delete behavior |
| `samples/apps.json` | Apps / Integrations | CRUD on `/projects/{id}/apps` | Enum validation, immutable fields |
| `samples/products.json` | Products / Plans | CRUD on `/projects/{id}/products` | Type validation, duration rules, immutable identifiers |
| `samples/virtual-currencies.json` | Credits / Balances | Create, grant mapping, balance adjustment | Positive amounts, string balance format if documented |
| `samples/entitlements.json` | Access policies | Create, attach, detach, delete | Uniqueness, idempotency, relationship integrity |
| `samples/offerings.json` | Bundles / Offerings | Create, read, update, delete | Nested package handling, identifier uniqueness |
| `samples/customers.json` | Customers / Accounts | Create, read, delete | Unique external ID, lookup behavior |
| `samples/customer-attributes.json` | Profile attributes | Create, patch, delete | Duplicate names, null clearing semantics |
| `samples/secret-api-keys.json` | Service credentials | Create, list, read, revoke | Secret returned once, masked later |
| `samples/paywalls.json` | Publishable surfaces | Draft, update, publish, duplicate | Version checks, publish preconditions |

---

## Mapping Template

Use this template when adapting one sample file to a real API:

```markdown
### <Domain Name>

- **Sample file:** `tools/api-quality-engineering/<output-slug>/data/samples/<file>.json`
- **Source spec:** `documents/api-quality-engineering/<output-slug>/source/openapi.yaml`
- **Schema refs:** `<RequestDto>`, `<ResponseDto>`
- **Endpoints:**
  - `POST /...`
  - `GET /...`
  - `PUT /...`
- **Scenario groups:**
  - Happy path
  - Validation failure
  - Duplicate / conflict
  - Update / delete / cleanup
- **Cleanup notes:**
  - Delete created entities in reverse dependency order
  - Clear attached relations before deleting parents
```

---

## Cleanup Guidance

- Treat every sample file as disposable test data only.
- Document parent-child dependencies near the sample that creates them.
- Keep cleanup idempotent where possible.
- Avoid referencing production-like IDs in committed fixtures.

---

## Recommended Traceability Links

- `documents/api-quality-engineering/<output-slug>/strategy/`
- `documents/api-quality-engineering/<output-slug>/scenarios/`
- `documents/api-quality-engineering/<output-slug>/traceability/`
- `tools/api-quality-engineering/<output-slug>/postman/collection.json`

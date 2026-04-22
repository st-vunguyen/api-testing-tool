# E2E Journeys — Traceability Template

> **Purpose:** Link each advanced journey to spec-backed endpoints, risks, and scenario coverage.
> **Scope:** Replace the example rows below with your actual evidence.

---

## Journey Coverage Matrix

| Journey | Example Endpoint Groups | Risk Themes | Evidence Sources |
|---|---|---|---|
| `J-01` Auth → Project Setup | `/auth`, `/projects`, `/apps` | Auth bootstrap, missing parent IDs | OpenAPI auth + project sections |
| `J-02` Product Catalog Setup | `/products` | Invalid enums, immutable identifiers | Product schemas, pricing rules |
| `J-03` Access Policy Assignment | `/entitlements`, `/attach`, `/detach` | Duplicate keys, relation drift | Access policy rules, idempotency notes |
| `J-04` Bundle + Publishable Surface | `/offerings`, `/paywalls`, `/publish` | Invalid draft state, uniqueness conflicts | Bundle rules, publish preconditions |
| `J-05` Customer Lifecycle | `/customers`, `/attributes` | Duplicate identities, delete semantics | Customer model, attribute rules |
| `J-06` Credits / Balances | `/virtual-currencies`, `/balances` | Overdraft, incorrect numeric types | Balance schema, business limits |
| `J-07` Secret Key Lifecycle | `/secret-api-keys` | Secret exposure, revocation gaps | Credential handling contract |
| `J-08` Draft / Publish Concurrency | `/draft`, `/publish` | Lost updates, stale version acceptance | Versioning rules |
| `J-09` Cross-Project Isolation | Mixed secured endpoints | Tenant leakage, auth scope gaps | Security model, ownership rules |
| `J-10` Full Teardown | Mixed delete endpoints | Residual data, rerun instability | Cleanup sequence and delete rules |

---

## Per-Journey Template

```markdown
## J-XX: <Journey Name>

| Step | Request | Scenario IDs | Evidence | Priority |
|---|---|---|---|---|
| 1 | `POST /...` | `TC-...` | OpenAPI `paths...` | P0 |
| 2 | `GET /...` | `TC-...` | Business rule note | P1 |

**Risk coverage:**
- `R-...` — <description>

**Open questions:**
- <question needing confirmation>
```

---

## Risk Checklist

- Does each journey cover at least one meaningful business failure?
- Are authorization and ownership risks represented where relevant?
- Are cleanup and retry behaviors covered for destructive flows?
- Are optimistic-locking or async behaviors called out explicitly?

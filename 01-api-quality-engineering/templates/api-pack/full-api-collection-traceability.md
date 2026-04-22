# Full API Collection — Traceability Template

> **Purpose:** Starter traceability format for mapping Postman requests to OpenAPI operations, scenario IDs, and evidence.
> **Scope:** Replace placeholder folders, request names, and evidence references with those from your target API.

---

## Legend

| Column | Meaning |
|---|---|
| **Folder / Request** | Collection folder and request name |
| **Method + Path** | HTTP operation from spec |
| **operationId** | OpenAPI `operationId` when available |
| **Scenario IDs** | Your scenario or test-case IDs |
| **Priority** | P0 / P1 / P2 or equivalent |
| **Depth** | Smoke / Standard / Full |
| **Evidence** | Spec section, ADR, business rule, or doc link |

---

## Example Coverage Map

| Folder / Request | Method + Path | operationId | Scenario IDs | Priority | Depth | Evidence |
|---|---|---|---|---|---|---|
| Health & Smoke / Readiness Check | `GET /health/ready` | `checkReadiness` | `TC-HLT-01` | P2 | Smoke | OpenAPI `paths./health/ready.get` |
| Authentication / Register — Happy Path | `POST /api/v1/auth/register` | `registerUser` | `TC-AUTH-01` | P0 | Full | `RegisterRequest`, auth rules |
| Authentication / Login — Invalid Password | `POST /api/v1/auth/login` | `loginUser` | `TC-AUTH-04` | P0 | Standard | `401` response contract |
| Projects / Create Project | `POST /api/v1/projects` | `createProject` | `TC-PROJ-01` | P1 | Standard | `CreateProjectRequest` |
| Apps / Create App | `POST /api/v1/projects/{project_id}/apps` | `createApp` | `TC-APP-01` | P1 | Standard | App type enum and platform rules |
| Products / Create Plan | `POST /api/v1/projects/{project_id}/products` | `createProduct` | `TC-PROD-01` | P1 | Full | Product creation contract |
| Entitlements / Attach Product | `POST /api/v1/projects/{project_id}/entitlements/{id}/products/attach` | `attachProducts` | `TC-ENT-03` | P0 | Full | Idempotency rule |
| Offerings / Create Bundle | `POST /api/v1/projects/{project_id}/offerings` | `createOffering` | `TC-OFR-01` | P1 | Full | Nested package schema |
| Customers / Create Customer | `POST /api/v1/projects/{project_id}/customers` | `createCustomer` | `TC-CUST-01` | P0 | Standard | Unique external ID rule |
| Secret Keys / Create Key | `POST /api/v1/projects/{project_id}/secret-api-keys` | `createSecretKey` | `TC-KEY-01` | P0 | Full | Secret returned-once rule |
| Publishable Surfaces / Publish Draft | `POST /api/v1/projects/{project_id}/paywalls/{id}/publish` | `publishSurface` | `TC-PUB-02` | P1 | Full | Publish preconditions and version rule |

---

## Completion Checklist

- Every runnable request in `postman/collection.json` appears in this map.
- Every P0 scenario has at least one linked request.
- Every request references spec-backed evidence.
- Known gaps are called out explicitly instead of hidden.

---

## Known Gaps Template

| Gap | Impact | Action |
|---|---|---|
| Missing response examples | Slower assertion authoring | Add contract examples or annotate assumptions |
| Ambiguous validation status code | Flaky negative tests | Confirm expected code with backend team |
| Undocumented async behavior | Timing-sensitive failures | Add polling or readiness checks |

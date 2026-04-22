# Example Test Scope Matrix

| Domain | Example endpoints | Main risks | Suggested depth | Priority |
|---|---|---|---|---|
| Auth | `/auth/login`, `/auth/refresh`, `/auth/profile` | Invalid token handling, refresh edge cases | Contract + Smoke + Regression | P0 |
| Workspaces | `/workspaces`, `/workspaces/{id}` | Tenancy leakage, duplicate creation, soft delete | Contract + Integration | P0 |
| Members | `/workspaces/{id}/members` | Role escalation, invite lifecycle, removal safeguards | Contract + Integration + Regression | P0 |
| Projects | `/projects`, `/projects/{id}` | Validation, filtering, optimistic concurrency | Contract + Smoke + Regression | P1 |
| Reports | `/reports`, `/reports/{id}/export` | Async readiness, permissions, large payloads | Contract + Integration | P1 |
| API Keys | `/api-keys`, `/api-keys/{id}` | Secret exposure, revoke flow | Contract + Regression | P1 |
| Audit Logs | `/audit-logs` | Pagination, filtering, sort consistency | Contract | P2 |

## Out of Scope Example Items

- Admin UI behavior
- Third-party webhook delivery internals
- Infrastructure failover not documented in the API evidence

## Decision Notes

- Use smoke only for the smallest critical path set.
- Push low-signal read-only endpoints to contract coverage unless risk suggests otherwise.
- Mark undocumented behavior as `Unknown / needs confirmation`, not as expected behavior.

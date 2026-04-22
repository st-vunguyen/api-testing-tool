# Example Test Cases by Priority

## P0

| ID | Scenario line | Why P0 |
|---|---|---|
| `API-P0-001` | Login with valid credentials returns token and profile access works | Entry gate for protected APIs |
| `API-P0-002` | Missing or malformed token returns 401 on protected endpoints | Security baseline |
| `API-P0-003` | User from workspace A cannot read workspace B resources | Tenancy isolation |
| `API-P0-004` | Member without required permission receives 403 on write operation | Privilege enforcement |
| `API-P0-005` | Create core resource then read it back via canonical identifier | Core system viability |

## P1

| ID | Scenario line | Why P1 |
|---|---|---|
| `API-P1-001` | Duplicate create request respects documented conflict or idempotency behavior | Frequent integration issue |
| `API-P1-002` | Pagination and sorting follow documented parameter names and envelopes | Common regression area |
| `API-P1-003` | Report export or async job status flow reaches terminal state correctly | Cross-endpoint dependency |
| `API-P1-004` | Secret/API key creation returns secret only in allowed response | Sensitive data handling |

## P2

| ID | Scenario line | Why P2 |
|---|---|---|
| `API-P2-001` | Read-only audit log filters behave consistently | Useful, lower release risk |
| `API-P2-002` | Non-critical list endpoints handle empty results gracefully | Good hygiene, lower impact |

## Negative / Edge Categories to Include

- validation failures
- permission failures
- duplicate requests
- pagination boundaries
- stale version / optimistic concurrency
- rate limit behavior when evidenced

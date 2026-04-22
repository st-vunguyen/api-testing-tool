# Auth & Rate-Limit Analysis — Generic Example

**Example source spec:** `openapi.yaml`
**Example supporting docs:** `documents/example-domain/security.md`

## Files

| File | Covers |
|---|---|
| `01_auth-model.md` | Auth schemes, token lifecycle, permissions, tenancy notes |
| `02_rate-limit-strategy.md` | 429 behavior, headers, throttling test strategy |

## Example Decision Map

| Risk | Example P0 line |
|---|---|
| Auth bypass | Protected endpoints reject missing token |
| Cross-tenant access | User from tenant A cannot read tenant B resources |
| Role escalation | Valid token without permission returns 403 |
| Auth throttling | Login/register endpoints enforce 429 when documented |

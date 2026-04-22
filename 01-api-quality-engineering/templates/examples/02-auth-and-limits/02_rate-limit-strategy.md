# Example Rate-Limit Strategy

## Example Evidence Table

| Item | Status |
|---|---|
| 429 documented on auth endpoints | Example only |
| `Retry-After` header documented | Unknown / needs confirmation |
| Standard rate-limit headers documented | Unknown / needs confirmation |
| Per-tenant vs global limit behavior | Unknown / needs confirmation |

## Example Test Lines

- Burst login requests until documented 429 threshold behavior appears.
- Verify whether retry guidance is returned in headers or body.
- Keep destructive throttling tests out of production by default.

## Reporting Rule

If values are not specified, document `Not specified` instead of inferring windows or quotas.

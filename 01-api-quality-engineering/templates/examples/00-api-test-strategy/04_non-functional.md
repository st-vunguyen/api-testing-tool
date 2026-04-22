# Example Non-Functional & Operational Risks

## Example Coverage Areas

| Area | Why to test | Example notes |
|---|---|---|
| Auth enforcement | Ensure protected endpoints reject bad tokens | Validate 401 vs 403 behavior only when evidenced |
| Rate limits | Protect auth or expensive flows from abuse | Use only documented 429 behavior |
| Idempotency | Avoid duplicate side effects | Focus on create or retry-sensitive endpoints |
| Optimistic concurrency | Prevent lost updates | Check version or ETag behavior if documented |
| Observability | Confirm health or readiness contracts | Assert only what the spec exposes |
| Performance | Define load candidates and thresholds | Mark unsupported thresholds as assumptions |

## Example Test Lines

- Retry a documented idempotent action and compare resulting state.
- Submit stale version metadata and expect documented conflict behavior.
- Verify health endpoints return their promised shape.
- Confirm sensitive values are not re-exposed in read APIs.

## Guardrails

- Do not invent SLOs or thresholds.
- Do not assume correlation IDs, tracing headers, or metrics unless documented.
- Treat operational behavior as `Unknown / needs confirmation` when missing from spec/docs.

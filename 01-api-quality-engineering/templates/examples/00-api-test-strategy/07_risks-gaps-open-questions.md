# Example Risks, Gaps, and Open Questions

## Example Risks

| ID | Risk | Why it matters | Suggested next step |
|---|---|---|---|
| `R-01` | Error model undocumented | Weakens negative assertion design | Ask API owner for error schema or examples |
| `R-02` | Pagination patterns differ by endpoint family | Runner helpers may become brittle | Document per-endpoint parameter rules |
| `R-03` | Token refresh semantics unclear | Hard to automate session renewal safely | Confirm refresh contract or treat as out of scope |

## Example Gaps

| ID | Gap | Impact |
|---|---|---|
| `G-01` | No standard error DTO in spec | Limit assertions to status and documented fields |
| `G-02` | Rate limit values not specified | Threshold testing cannot be finalized |
| `G-03` | Some list endpoints omit explicit sort guarantees | Sorting assertions must be cautious |

## Open Questions

1. Are destructive tests allowed in staging, or should they stay in local/sandbox only?
2. Which endpoints are officially release-blocking for smoke coverage?
3. Does the API guarantee stable sorting when no sort parameter is sent?
4. Are conflict responses standardized across resources?
5. Is there a documented artifact retention policy for CI raw reports?

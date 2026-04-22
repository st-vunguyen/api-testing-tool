# Pagination & Filtering Analysis — Generic Example

**Example source spec:** `openapi.yaml`

## Files

| File | Covers |
|---|---|
| `01_pagination-filtering.md` | Parameter patterns, envelopes, sorting/filtering rules |
| `02_collection-endpoints.json` | Machine-readable registry for list endpoints |

## Example Findings

- Some APIs use page-based pagination while others use cursor-based pagination.
- Shared helpers should not assume one universal parameter set.
- Search, filtering, and sorting need per-endpoint evidence.

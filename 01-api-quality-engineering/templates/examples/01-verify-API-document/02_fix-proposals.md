# Example Fix Proposals

## Safe Fixes

| Issue | Example fix | Why safe |
|---|---|---|
| Invalid bearer scheme fields | Keep only `type: http`, `scheme: bearer`, `bearerFormat: JWT` | Aligns with OpenAPI spec |
| Missing tags metadata | Add top-level tag objects for referenced tags | Documentation-only improvement |

## Needs Validation

| Issue | Example fix | Why validation is needed |
|---|---|---|
| Mixed pagination parameter names | Standardize on one naming convention | May affect existing clients |
| Error model inconsistencies | Introduce shared error schema | Requires cross-team agreement |
| Undocumented conflict semantics | Add explicit 409 response schema and examples | Requires behavior confirmation |

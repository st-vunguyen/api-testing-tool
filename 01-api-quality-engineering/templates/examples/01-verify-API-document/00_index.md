# OpenAPI Quality Report — Generic Example

- Example source spec: `openapi.yaml`
- Purpose: show the expected shape of a spec review output pack

## Files
- `01_lint-report.md`: issues found with severity and impact
- `02_fix-proposals.md`: safe fixes and validation-required fixes

## Example Summary
1. Operation naming should be stable and tool-friendly.
2. Pagination and error models should be consistent.
3. Security scheme definitions should be valid OpenAPI.
4. Missing response schemas should be called out before test generation.

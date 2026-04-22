# Example Lint Report

| Severity | Area | Example issue | Impact |
|---|---|---|---|
| Blocker | Security scheme | Bearer scheme has invalid extra fields | Breaks generators or validators |
| Major | Error responses | 4xx responses documented without schema | Weakens negative contract coverage |
| Major | Pagination | One endpoint uses `pageSize`, another `page_size` | Causes brittle shared helpers |
| Minor | Metadata | Tags used in paths are missing from top-level tag list | Reduces documentation quality |

## Example Evidence Format

- `openapi.yaml#/components/securitySchemes/bearerAuth`
- `openapi.yaml#/paths/~1projects/get`
- `openapi.yaml#/paths/~1audit-logs/get`

## Notes

This file intentionally avoids real API facts. Replace every row with project-specific findings.

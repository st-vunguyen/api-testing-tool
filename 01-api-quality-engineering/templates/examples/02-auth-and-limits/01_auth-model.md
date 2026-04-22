# Example Auth Model

## Example Auth Surface

| Area | Example expectation |
|---|---|
| Auth scheme | Bearer JWT or equivalent documented scheme |
| Public endpoints | Login, registration, health, docs as evidenced |
| Protected endpoints | Everything else unless explicitly public |
| Permission model | Role/permission behavior must be evidenced per endpoint |
| Tenancy model | Resource access constrained by account/workspace membership |

## Example Token Lifecycle Questions

- Is refresh supported?
- Is logout or revocation documented?
- Does token expiration produce a standardized response?

## Example P0 Checks

- Missing token → 401
- Invalid token → 401
- Valid token, missing permission → 403
- Cross-tenant read/write attempts fail as documented

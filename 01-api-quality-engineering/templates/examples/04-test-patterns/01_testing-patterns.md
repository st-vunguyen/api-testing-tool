# Example Testing Patterns

## Naming

| Item | Example convention |
|---|---|
| Scenario ID | `SCN-AUTH-001` |
| Request name | `POST /auth/login - valid credentials` |
| Folder name | `Auth`, `Workspaces`, `Reports` |
| Report run slug | `<output-slug>-YYYYMMDD` |

## Layering

| Layer | Use when |
|---|---|
| Contract | Validate schema/status behavior broadly |
| Smoke | Protect release-critical paths |
| Integration | Verify multi-request business flows |
| Regression | Lock down known bug-prone areas |

## Assertion Style

- Assert documented status codes first.
- Assert required response fields only when evidenced.
- Avoid undocumented human-readable error message assertions.
- Confirm side effects through follow-up GET requests when possible.

## Data Strategy

- Synthetic only
- Isolated per run or per test slice
- Explicit cleanup for destructive flows
- Read-only defaults for prod templates

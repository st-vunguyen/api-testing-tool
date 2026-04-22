# Example Traceability Model

## Mapping Rules

| From | To | Why |
|---|---|---|
| Requirement / doc statement | Endpoint or workflow | Scope grounding |
| Endpoint or workflow | Scenario ID | Coverage planning |
| Scenario ID | Request / folder in collection | Runnable traceability |
| Variable | Source request + consuming requests | Debuggability |

## Example Traceability Table

| Requirement ID | Evidence source | Domain | Scenario ID | Planned artifact |
|---|---|---|---|---|
| `REQ-AUTH-01` | `openapi.yaml#/paths/~1auth~1login` | Auth | `SCN-AUTH-001` | `contract.collection.json` |
| `REQ-TENANCY-01` | `documents/example-domain/tenancy.md` | Workspaces | `SCN-WS-003` | `integration.collection.json` |
| `REQ-PAGE-01` | `openapi.yaml#/paths/~1audit-logs/get` | Audit Logs | `SCN-LOG-002` | `pagination scenarios` |

## Usage Note

This file is only a model. In a real project, replace placeholder requirement IDs and evidence paths with actual paths, headings, and scenario references.

# E2E Journeys — Mermaid Diagrams

> **Purpose:** Example sequence diagrams for advanced chained API journeys.
> **Scope:** These diagrams are starter references only; adapt names, fields, and endpoints to your real API.

---

## J-01: Auth → Project Setup

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant API as Example API

    User->>API: POST /api/v1/auth/login
    API-->>User: 200 { access_token }
    User->>API: POST /api/v1/projects
    API-->>User: 201 { project_id }
    User->>API: POST /api/v1/projects/{project_id}/apps
    API-->>User: 201 { app_id }
    User->>API: GET /api/v1/projects/{project_id}/apps
    API-->>User: 200 { items: [...] }
```

---

## J-03: Access Policy Assignment

```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant API as Example API

    Admin->>API: POST /api/v1/projects/{project_id}/entitlements
    API-->>Admin: 201 { entitlement_id }
    Admin->>API: POST /api/v1/projects/{project_id}/entitlements/{id}/products/attach
    API-->>Admin: 200 { products: [...] }
    Admin->>API: POST /api/v1/projects/{project_id}/entitlements/{id}/products/attach
    API-->>Admin: 200 { duplicate ignored or handled }
    Admin->>API: DELETE /api/v1/projects/{project_id}/entitlements/{id}
    API-->>Admin: 204
```

---

## J-04: Bundle + Publishable Surface

```mermaid
sequenceDiagram
    autonumber
    actor Operator
    participant API as Example API

    Operator->>API: POST /api/v1/projects/{project_id}/offerings
    API-->>Operator: 201 { offering_id }
    Operator->>API: POST /api/v1/projects/{project_id}/paywalls
    API-->>Operator: 201 { paywall_id }
    Operator->>API: POST /api/v1/projects/{project_id}/paywalls/{paywall_id}/save-draft
    API-->>Operator: 200 { draft_version: 1 }
    Operator->>API: POST /api/v1/projects/{project_id}/paywalls/{paywall_id}/publish
    API-->>Operator: 200 { status: published }
```

---

## J-08: Draft / Publish Concurrency

```mermaid
sequenceDiagram
    autonumber
    actor SessionA
    actor SessionB
    participant API as Example API

    SessionA->>API: GET /api/v1/projects/{project_id}/paywalls/{paywall_id}
    API-->>SessionA: 200 { draft_version: 1 }
    SessionB->>API: GET /api/v1/projects/{project_id}/paywalls/{paywall_id}
    API-->>SessionB: 200 { draft_version: 1 }
    SessionB->>API: POST /api/v1/projects/{project_id}/paywalls/{paywall_id}/save-draft
    API-->>SessionB: 200 { draft_version: 2 }
    SessionA->>API: POST /api/v1/projects/{project_id}/paywalls/{paywall_id}/publish
    API-->>SessionA: 409 { error: stale_version }
```

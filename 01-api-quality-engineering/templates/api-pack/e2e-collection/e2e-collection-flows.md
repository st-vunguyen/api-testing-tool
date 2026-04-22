# E2E Collection — Chained Flow Template

> **Purpose:** Describe how variables move across advanced API quality engineering flows.
> **Scope:** Replace example requests and variables with project-specific ones.

---

## Conventions

| Symbol | Meaning |
|---|---|
| `→ set {{VAR}}` | Capture from response into environment |
| `← use {{VAR}}` | Consume a value set by a previous step |
| `[assert]` | Assertion expected at this step |

---

## Flow Index

| Flow ID | Goal |
|---|---|
| `F-01` | Authenticate and create project |
| `F-02` | Create products or plans |
| `F-03` | Create access policy and attach relations |
| `F-04` | Create offering and publishable surface |
| `F-05` | Create customer and profile attributes |
| `F-06` | Adjust balance-like resources |
| `F-07` | Create and revoke secret keys |
| `F-08` | Validate draft/publish concurrency |
| `F-09` | Verify cross-project isolation |
| `F-10` | Cleanup all created data |

---

## F-01: Authenticate and Create Project

```text
[1] POST /api/v1/auth/login
    → set {{ACCESS_TOKEN}}
    [assert] 200

[2] POST /api/v1/projects
    ← use {{ACCESS_TOKEN}}
    → set {{PROJECT_ID}}
    [assert] 201

[3] POST /api/v1/projects/{{PROJECT_ID}}/apps
    ← use {{PROJECT_ID}}
    → set {{APP_ID_PRIMARY}}
    [assert] 201
```

---

## F-02: Create Products or Plans

```text
[1] POST /api/v1/projects/{{PROJECT_ID}}/products
    → set {{PRODUCT_ID_PRIMARY}}
    [assert] 201

[2] POST /api/v1/projects/{{PROJECT_ID}}/products
    → set {{PRODUCT_ID_SECONDARY}}
    [assert] 201
```

---

## F-03: Create Access Policy and Attach Relations

```text
[1] POST /api/v1/projects/{{PROJECT_ID}}/entitlements
    → set {{ENTITLEMENT_ID}}
    [assert] 201

[2] POST /api/v1/projects/{{PROJECT_ID}}/entitlements/{{ENTITLEMENT_ID}}/products/attach
    ← use {{PRODUCT_ID_PRIMARY}}
    [assert] 200
```

---

## F-04: Create Offering and Publishable Surface

```text
[1] POST /api/v1/projects/{{PROJECT_ID}}/offerings
    → set {{OFFERING_ID}}
    [assert] 201

[2] POST /api/v1/projects/{{PROJECT_ID}}/paywalls
    → set {{PAYWALL_ID}}
    [assert] 201
```

---

## F-05 to F-10

Use the same pattern:

- define preconditions
- capture the minimum variables required downstream
- make cleanup reverse the dependency order
- mark any 409 / 401 / 404 checks explicitly as intentional

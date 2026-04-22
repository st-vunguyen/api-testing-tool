# E2E Journeys — Generic Advanced Reference

> **Purpose:** Provide example multi-step business journeys for APIs that need chained requests, variable capture, and cross-domain validation.
> **Scope:** These are reference flows. Keep, trim, or replace them to fit your actual business model.

---

## Journey Index

| ID | Journey | Focus | Priority |
|---|---|---|---|
| `J-01` | Auth → Project Setup | Bootstrap a usable workspace | P0 |
| `J-02` | Product Catalog Setup | Create plans or catalog items | P0 |
| `J-03` | Access Policy Assignment | Link products to access rules | P0 |
| `J-04` | Bundle + Publishable Surface | Configure offering and publish surface | P1 |
| `J-05` | Customer Lifecycle | Create customer and manage profile data | P1 |
| `J-06` | Credits or Balance Adjustment | Grant and deduct balances | P1 |
| `J-07` | Secret Key Lifecycle | Create, verify masking, revoke | P0 |
| `J-08` | Draft / Publish Concurrency | Validate optimistic locking | P1 |
| `J-09` | Cross-Project Isolation | Verify tenant boundaries | P0 |
| `J-10` | Full Teardown | Cleanup created resources | P1 |

---

## J-01: Auth → Project Setup

**Goal:** Authenticate, create a project or workspace, and attach at least one client app or integration.

**Typical assertions:**
- Login returns a usable token
- Project identifier is captured for downstream steps
- Child resources can be listed after creation

---

## J-02: Product Catalog Setup

**Goal:** Create one or more plans, packages, or catalog entries required by later flows.

**Typical assertions:**
- Required fields and enums validate correctly
- Immutable identifiers do not silently mutate
- Created resources are retrievable and listable

---

## J-03: Access Policy Assignment

**Goal:** Create an access policy or entitlement, then attach products and verify relationship behavior.

**Typical assertions:**
- Unique keys reject duplicates
- Attach is idempotent if documented
- Cleanup detaches relations safely before delete

---

## J-04: Bundle + Publishable Surface

**Goal:** Create a customer-facing bundle, link it to a draft surface, save a draft, and publish.

**Typical assertions:**
- Nested bundle payloads persist correctly
- Publish preconditions are enforced
- Duplicate active surfaces fail when the business rule requires uniqueness

---

## J-05: Customer Lifecycle

**Goal:** Create a customer, add custom attributes, update or clear them, and delete the customer safely.

**Typical assertions:**
- External identity uniqueness works
- Attribute updates preserve documented semantics
- Hard vs soft delete behavior is explicit

---

## J-06: Credits or Balance Adjustment

**Goal:** Configure a balance-like entity and verify grant / deduct behavior.

**Typical assertions:**
- Positive amount validation works
- Insufficient-balance handling is explicit
- Response types match the contract exactly

---

## J-07: Secret Key Lifecycle

**Goal:** Create a secret key, verify the secret is shown only when documented, and revoke it.

**Typical assertions:**
- Create response includes secret material only once
- List / get responses mask or omit secrets
- Revoked keys are no longer active

---

## J-08: Draft / Publish Concurrency

**Goal:** Simulate two sessions editing the same draftable resource.

**Typical assertions:**
- Stale versions are rejected
- Latest version can still be published
- Version capture and update rules stay deterministic

---

## J-09: Cross-Project Isolation

**Goal:** Ensure one actor cannot access another tenant's resources with a valid but unauthorized token.

**Typical assertions:**
- Resource leakage does not occur across tenants
- Access failures use documented status codes
- Tenant-specific identifiers stay scoped to their owner

---

## J-10: Full Teardown

**Goal:** Delete created resources in reverse dependency order and leave the environment reusable.

**Typical assertions:**
- Teardown is safe to rerun
- Child relations are cleared before parent delete
- Final reads return documented not-found behavior

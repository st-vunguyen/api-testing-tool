# E2E Collection — Environment Template

> **Purpose:** Provide a starter environment contract for chained API journeys.
> **Scope:** Fill manual values only; captured values should be written by request scripts.

---

## Example `.env` Template

Save as `tools/api-quality-engineering/<output-slug>/env/.env.e2e.local`:

```dotenv
BASE_URL=http://localhost:3000
USER_EMAIL=tester.a@example.com
USER_PASSWORD=ChangeMe123!
USER_EMAIL_B=tester.b@example.com
USER_PASSWORD_B=ChangeMe123!

ACCESS_TOKEN=
ACCESS_TOKEN_A=
ACCESS_TOKEN_B=

PROJECT_ID=
PROJECT_ID_B=
APP_ID_PRIMARY=
APP_ID_SECONDARY=
PRODUCT_ID_PRIMARY=
PRODUCT_ID_SECONDARY=
ENTITLEMENT_ID=
OFFERING_ID=
PAYWALL_ID=
CUSTOMER_ID=
ATTRIBUTE_ID=
SECRET_KEY_ID=
RUN_SUFFIX=
```

---

## Variable Ownership

| Variable Type | Rule |
|---|---|
| Manual inputs | Fill before the run |
| Captured IDs | Leave blank in committed templates |
| Secrets | Use local-only or CI secret storage |
| Run suffixes | Generate automatically per run |

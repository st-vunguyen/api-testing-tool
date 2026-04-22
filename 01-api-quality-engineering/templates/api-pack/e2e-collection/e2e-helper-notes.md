# E2E Collection — Helper Notes

> **Purpose:** Starter snippets for Postman / Newman pre-request and test scripts used by chained API flows.

---

## Pre-request Patterns

### Attach bearer token when present

```javascript
const token = pm.environment.get("ACCESS_TOKEN");
if (token && !pm.request.headers.get("Authorization")) {
  pm.request.headers.add({ key: "Authorization", value: `Bearer ${token}` });
}
```

### Generate a unique suffix

```javascript
pm.environment.set("RUN_SUFFIX", Date.now().toString());
```

### Capture a draft version for the next request

```javascript
const currentVersion = Number(pm.environment.get("DRAFT_VERSION") || "0");
pm.variables.set("EXPECTED_VERSION", currentVersion);
```

---

## Test Script Patterns

### Basic status assertion

```javascript
pm.test("status is 200", function () {
  pm.response.to.have.status(200);
});
```

### Capture one field from a JSON response

```javascript
const json = pm.response.json();
pm.environment.set("PROJECT_ID", json.project_id);
```

### Assert secret is absent from list responses

```javascript
const json = pm.response.json();
const items = json.items || [];
items.forEach(item => pm.expect(item).to.not.have.property("key"));
```

### Assert optimistic-lock conflict

```javascript
pm.test("stale version returns 409", function () {
  pm.response.to.have.status(409);
});
```

---

## Usage Notes

- Keep helper snippets generic and copy them into request-level scripts as needed.
- Prefer documented response fields over inferred ones.
- Use environment variables for chained IDs, not hidden globals.

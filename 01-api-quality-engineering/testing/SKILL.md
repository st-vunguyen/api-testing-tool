---
name: api-quality-engineering
description: 'Create strategy docs, Postman/Newman collections, env templates, datasets, and execution reports for API quality engineering'
---

# API Quality Engineering Skill

## Tool Compatibility

This skill is shared between both supported assistant layouts:

- Copilot VS Code → `.github/instructions/` + `.github/prompts/api-quality-engineering/` + `testing/SKILL.md`
- Claude Code → `.claude/agents/` + `.claude/rules/` + `.claude/prompts/api-quality-engineering/` + `testing/SKILL.md`

`testing/SKILL.md` is a committed support file, not a generated artifact.

## Trigger

Use this skill when asked to:
- review an OpenAPI spec for testability
- create or update an API test strategy
- generate Postman/Newman collections
- build environment templates or variable contracts
- prepare data-driven sample files
- create API execution reports or CI workflows

## Canonical Output Split

```text
documents/api-quality-engineering/<output-slug>/   # human-readable docs
tools/api-quality-engineering/<output-slug>/       # runnable assets
```

## Collection Folder Template

```json
{
  "name": "Projects",
  "item": [
    {
      "name": "POST /api/v1/projects - create project",
      "request": {
        "method": "POST",
        "header": [
          { "key": "Authorization", "value": "Bearer {{ACCESS_TOKEN}}" },
          { "key": "Content-Type", "value": "application/json" }
        ],
        "url": {
          "raw": "{{BASE_URL}}/api/v1/projects",
          "host": ["{{BASE_URL}}"],
          "path": ["api", "v1", "projects"]
        },
        "body": {
          "mode": "raw",
          "raw": "{\n  \"name\": \"{{PROJECT_NAME}}\"\n}"
        }
      },
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test('status is 201', function () { pm.response.to.have.status(201); });",
              "const data = pm.response.json();",
              "if (data.project_id) pm.environment.set('PROJECT_ID', data.project_id);"
            ]
          }
        }
      ]
    }
  ]
}
```

## Variable Contract Template

```markdown
| Variable | Required | Source | Set by | Used by | Notes |
|---|---|---|---|---|---|
| `BASE_URL` | Yes | OpenAPI `servers` | Manual | All requests | Use placeholder only in `.example` files |
| `ACCESS_TOKEN` | Yes | Login response | Login request script | Protected requests | Never commit real value |
| `PROJECT_ID` | No | Create project response | Project creation script | Downstream resource flows | Clear after teardown |
```

## Environment Template Pattern

```dotenv
BASE_URL=http://localhost:3000
USER_EMAIL=test@example.com
USER_PASSWORD=ChangeMe123!
ACCESS_TOKEN=
PROJECT_ID=
```

Rules:

- commit only `.example` files
- leave dynamic variables blank
- label variables as manual, auto-set, or derived in the contract

## Scenario Coverage Checklist

- [ ] Contract happy paths
- [ ] Validation failures
- [ ] Auth and permission failures
- [ ] Pagination, filtering, sorting, search
- [ ] Idempotency / duplicate handling
- [ ] Concurrency / optimistic locking if applicable
- [ ] Rate-limit / throttling behavior if evidenced
- [ ] Cleanup / teardown expectations
- [ ] Read-only vs destructive environment restrictions

## Execution Report Checklist

- [ ] Scope and environment recorded
- [ ] Input spec and collection versions recorded
- [ ] Pass/fail counts by folder or pack
- [ ] Confirmed issues separated from asset issues
- [ ] Evidence gaps explicitly called out
- [ ] Next actions included

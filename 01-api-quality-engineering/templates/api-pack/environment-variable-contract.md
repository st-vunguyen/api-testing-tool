# Environment Variable Contract

Use this file as the canonical contract between the collection, env templates, helper notes, and execution reports.

## Variable Model

| Variable | Required | Type | Set by | Used by | Notes |
|---|---|---|---|---|---|
| `BASE_URL` | Yes | string | Manual | All requests | Placeholder only in committed env files |
| `USER_EMAIL` | Optional | string | Manual | Login flows | Use a synthetic or dedicated test account |
| `USER_PASSWORD` | Optional | string | Manual/secret store | Login flows | Never commit real passwords |
| `USER_EMAIL_B` | Optional | string | Manual | Multi-user isolation flows | Only for advanced chained journeys |
| `USER_PASSWORD_B` | Optional | string | Manual/secret store | Multi-user isolation flows | Only for advanced chained journeys |
| `ACCESS_TOKEN` | Usually | string | Login/auth capture or manual | Protected requests | Never commit real values |
| `ACCESS_TOKEN_A` | Optional | string | Login/auth capture | Multi-user flows | Use only when two-user scenarios exist |
| `ACCESS_TOKEN_B` | Optional | string | Login/auth capture | Multi-user flows | Use only when two-user scenarios exist |
| `REFRESH_TOKEN` | Optional | string | Auth flow capture | Token refresh flows | Only if the API supports refresh |
| `RESOURCE_ID` | Optional | string | Create response capture | Downstream CRUD requests | Rename per real domain |
| `ETAG` | Optional | string | Response header capture | Conditional update flows | Use only if evidenced |
| `CURSOR` | Optional | string | List response capture | Pagination follow-up requests | Use only if cursor pagination exists |
| `PAGE` | Optional | number/string | Manual | Pagination tests | Useful for page/page_size style APIs |
| `PAGE_SIZE` | Optional | number/string | Manual | Pagination tests | Match the spec naming exactly |
| `SEARCH_TERM` | Optional | string | Manual | Search/filter tests | Synthetic, non-sensitive input |
| `READ_ONLY_MODE` | Optional | boolean/string | Manual | Prod-safe guards | Set when destructive requests must be skipped |
| `RUN_ID` | Optional | string | Manual or helper-generated | Data isolation | Good for unique test data |

## Classification Rules

- **Manual**: set by the tester or CI secret/config
- **Captured**: set from a prior response
- **Derived**: composed from other variables during execution

## Guidance

- Rename generic placeholders like `RESOURCE_ID` to domain-specific names in real projects.
- Add one row per real variable used by the collection.
- Document where each captured variable is produced and where it is consumed.
- Keep prod-safe variables clearly marked when destructive actions are not allowed.

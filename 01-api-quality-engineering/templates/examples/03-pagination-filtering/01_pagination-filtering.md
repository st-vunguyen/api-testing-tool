# Example Pagination, Filtering, and Sorting Review

## Example Patterns

| Pattern | Example params | Example response metadata |
|---|---|---|
| Page-based | `page`, `page_size` | `items`, `page`, `page_size`, `total` |
| Cursor-based | `cursor`, `limit` | `items`, `next_cursor` |
| Offset-based | `offset`, `limit` | `items`, `offset`, `limit`, `total` |

## Example Risks

- Mixed naming conventions (`pageSize` vs `page_size`)
- Search parameter aliases (`q` vs `search`)
- Inconsistent default sort order
- Missing total/count metadata on some list endpoints

## Example Test Angles

- minimum and maximum page size
- empty result set
- invalid sort field
- unsupported filter value
- next-page traversal correctness

# JMeter datasets

Place CSV or JSON-derived tabular files here when the JMeter plan needs data-driven inputs.

## Rules

- Use synthetic or anonymized values only.
- Keep one dataset per scenario family when possible.
- Document which CSV columns feed which samplers.
- If the dataset influences auth, ownership, or rate-limit behavior, mention that in the curated report.

## Typical files

- `users.csv`
- `search-terms.csv`
- `payload-variants.csv`
- `resource-ids.csv`

## Evidence note

If a dataset column exists only because of a test harness convenience, mark it clearly.  
Do not present harness-only columns as part of the product contract.

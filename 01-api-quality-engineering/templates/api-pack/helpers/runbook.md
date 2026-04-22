# API Quality Engineering Runbook

## Local

1. Copy `.example` files to local non-committed working files if needed.
2. Fill in placeholders with safe test values.
3. Run the narrowest useful scope first.
4. Capture raw outputs only when needed for triage.

## CI

1. Use secrets for credentials and tokens.
2. Prefer smoke or read-only packs on pull requests.
3. Publish raw artifacts on failure, ideally on every run.
4. Keep curated markdown reports separate from raw generated outputs.

## Triage Rules

- Fix collection/env/script issues before reporting system issues.
- Escalate only evidence-backed mismatches.
- Record inconclusive outcomes as blockers or evidence gaps.

# Raw Report Outputs

Store machine-readable runner outputs here when needed.

## Suggested files

| Tool | Example outputs |
|---|---|
| Newman | `newman-summary.json`, `newman-junit.xml`, CLI log |
| k6 | `k6-summary.json` |
| ZAP baseline | `zap-report.html`, `zap-report.json` |

Do not commit bulky one-off raw outputs by default. Prefer CI artifact upload unless a curated sample is explicitly needed.

For performance runs, use the nested convention `reports/raw/performance/<run-slug>/` and keep `reports/raw/performance/README.md` committed as the folder contract.

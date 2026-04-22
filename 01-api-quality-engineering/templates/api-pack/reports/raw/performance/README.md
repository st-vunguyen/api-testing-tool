# Raw Performance Outputs

Use this folder for machine-readable performance outputs produced by the selected runner.

## Example outputs

| Tool | Example files |
|---|---|
| `k6` | `k6-summary.json`, `k6.log` |
| `newman` | `newman-summary.json`, `newman-junit.xml`, `newman.log` |

Store one run per subfolder, for example:

```text
reports/raw/performance/<run-slug>/
```

Do not commit one-off bulky raw outputs by default. Keep this `README.md` only as the folder contract.
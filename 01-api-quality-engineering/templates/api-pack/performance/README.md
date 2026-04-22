# Performance Runner Baseline

This folder is the canonical starter baseline for prompts `19-performance-collection` and `21-fully-performance-testing`, with a deeper JMeter extension for prompts `23` to `26`.

It is intentionally conservative:

- `k6` is the preferred runner when real load generation is allowed
- `postman-newman` can be used for constrained API workload checks
- `jmeter/` is available when you need a standard `.jmx` workflow, plugin ecosystem support, and richer dashboard/reporting handoff
- all values are placeholders until validated against the real spec and environment

## Included Files

| File | Purpose |
|---|---|
| `local.env.example` | Local placeholder values for safe execution |
| `execution-config.json` | Shared execution knobs and safety ceilings |
| `run-local.sh` | Local shell runner for macOS/Linux |
| `run-local.ps1` | Local PowerShell runner for Windows |
| `k6-script.js` | Starter k6 workload script using env-driven URL/path values |
| `newman-performance.collection.json` | Starter constrained Newman workload collection |
| `newman-performance.postman_environment.json.example` | Example environment for Newman workload checks |
| `jmeter/` | Standard JMeter plan, properties, runners, plugin guidance, and executive dashboard renderer |

## Safety Defaults

- Keep `SAFE_TO_RUN=no` until the target environment is explicitly approved.
- Prefer `TARGET_ENV=local`, `dev`, or dedicated `perf` environments.
- Never use this baseline for destructive production load.
- Treat the Newman path as **constrained**, not a substitute for full load testing.

## Suggested Local Flow

1. Copy `local.env.example` to a local ignored file such as `local.env`.
2. Set `BASE_URL`, `TARGET_PATH`, auth placeholders, and the chosen stack.
3. Review `execution-config.json` and confirm ceilings.
4. Run `run-local.sh` or `run-local.ps1`.
5. Store raw outputs under `tools/api-quality-engineering/<slug>/reports/raw/performance/<run-slug>/`.
6. Publish curated findings under `documents/api-quality-engineering/<slug>/reports/performance/<run-slug>/`.
7. If the performance scope needs a standard JMeter stack, continue with `performance/jmeter/` and prompts `23` to `26`.

## Runner Notes

### k6

- Best when you need true VU/duration-based load generation.
- Requires the endpoint path to be validated from the real spec.

### Newman

- Useful when the repo already centers around Postman assets.
- Suitable for calibration, constrained iterations, and lightweight response-time sampling.
- Do not describe it as full-scale load testing unless extra evidence and infrastructure support exist.

### JMeter

- Best when the team needs a standard `.jmx` plan and standard JMeter HTML dashboard output.
- Useful when plugin-backed thread groups, throughput shaping, richer listeners, or enterprise handoff conventions matter.
- Start simple, then add plugin-based behavior only when the workload model justifies it.
# Recommended JMeter / Plugin Catalog

Use this catalog as a practical baseline. Validate exact plugin IDs and versions in your current JMeter distribution before locking anything into CI.

## Baseline set

| Plugin / capability | Why it matters | Typical use |
|---|---|---|
| Plugin Manager | Standard way to manage community plugins | First install on every JMeter workstation/runner |
| Custom Thread Groups / Concurrency Thread Group | Better load modeling than a plain thread group | Ramp-up, hold, burst, staged traffic |
| Throughput Shaping Timer | Shape traffic by target throughput | Performance experiments with rate control |
| Dummy Sampler | Test plan structure without calling a real backend | Safe dry-runs |
| JSON/YAML helper plugins | Easier parsing and config handling | APIs with richer payload wiring |
| PerfMon Metrics Collector | Correlate app/server metrics with request stats | Investigation runs |
| Flexible CSV / advanced data helpers | Data-driven scenarios at scale | Correlated users, payload sets |
| Parallel / async helpers | More realistic mixed workloads when justified | Advanced flows only |

## Use with care

- Plugin-heavy plans are powerful but harder to debug.
- Keep the first runnable version as simple as possible.
- Add a plugin only when it solves a specific modeling need.
- Record plugin assumptions in the curated report.

## Practical rule

Start with a standard JMeter plan that can run without exotic components.  
Then add plugin features one at a time with evidence.

# Example Schedule & Resourcing

## Suggested Delivery Phases

| Phase | Focus | Outputs |
|---|---|---|
| Week 1 | Spec review + strategy | Review docs, risk matrix, priority scenarios |
| Week 2 | Runnable pack foundation | Core collection, env templates, variable contract |
| Week 3 | High-risk expansion | Integration flows, regression subset, CI starter |
| Week 4+ | Operational hardening | Perf candidates, security baseline, release review |

## Ownership Model

| Role | Main responsibility |
|---|---|
| QA Architect | Strategy, risk, priority decisions |
| API SDET | Collection, scripts, env/data helpers |
| Dev/API Owner | Clarify undocumented behavior, review gaps |
| DevOps | CI secrets, workflow enablement, artifact retention |

## Resourcing Notes

- Small team: prioritize P0 contract + smoke first.
- Medium team: add integration and regression slices next.
- Larger team: split by domain and add perf/security add-ons earlier.

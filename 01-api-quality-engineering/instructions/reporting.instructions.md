---
applyTo: "**/documents/api-quality-engineering/**,**/tools/api-quality-engineering/**,**/.github/workflows/**"
description: "Execution evidence, report structure, CI rules, and artifact hygiene for API quality engineering packs."
---

# API Quality Engineering Reporting & CI — Mandatory Rules

> **Support-file rule**: `.github/instructions/**`, `.github/prompts/api-quality-engineering/**`, `.claude/agents/**`, `.claude/rules/**`, `.claude/prompts/api-quality-engineering/**`, and `testing/SKILL.md` are committed support files. They are not runtime artifacts and must not be treated as trash.

## 1) Execution Evidence Model

Every serious API quality engineering run should preserve two layers of output:

| Layer | Purpose | Typical location |
|---|---|---|
| Raw runner output | Machine-readable execution details | `tools/api-quality-engineering/<output-slug>/reports/raw/` |
| Curated human report | Findings, decisions, blockers, recommendations | `documents/api-quality-engineering/<output-slug>/reports/<run-slug>/` |

Curated reports are the source of truth for human decisions. Raw outputs support debugging.

## 2) Recommended Report Structure

```text
documents/api-quality-engineering/<output-slug>/reports/<run-slug>/
├── 00_index.md
├── 01_execution-summary.md
├── 02_confirmed-issues.md
├── 03_asset-fixes-and-adjustments.md
├── 04_gaps-and-blockers.md
└── 05_next-actions.md
```

Use a stable structure so release reviews can compare runs over time.

## 3) What a Good Execution Report Must Contain

- environment and config summary
- input artifacts used (spec version, collection version, env template version)
- scope executed and scope skipped
- pass/fail/error counts by pack or folder
- asset issues fixed during the run
- confirmed system issues with evidence
- inconclusive items and the reason they remain inconclusive
- next recommended action

## 4) Raw Artifact Rules

Recommended raw artifacts when relevant:

| Tool | Raw outputs |
|---|---|
| Newman | `junit.xml`, JSON summary, CLI log, HTML report |
| k6 | summary JSON, stdout summary, thresholds result |
| ZAP baseline | HTML report, JSON/XML summary, warnings list |

Do not commit bulky generated artifacts unless they are explicitly curated. Prefer uploading them as CI artifacts.

## 5) CI Workflow Rules

When creating API quality engineering CI workflows:

1. Install only the required tooling (`newman`, reporters, `k6`, or `zap`)
2. Load secrets from CI secret stores, never from committed files
3. Separate read-only smoke runs from destructive full runs
4. Always publish raw artifacts on failure, and ideally on every run
5. Keep workflow names explicit, e.g. `api-quality-engineering-newman.yml`
6. Include a concise job summary with scope, result counts, and artifact links

## 6) Environment-Specific Reporting

Document clearly in every report:

- `local`, `dev`, `staging`, or `prod-readonly`
- whether destructive operations were enabled
- which credentials/account type were used
- any limits or feature flags that influenced results

If execution is read-only in prod, the report must say so explicitly.

## 7) Artifact Hygiene

Commit:

- curated markdown reports
- template env files (`*.example`)
- collection definitions and traceability docs
- CI workflows and helper notes
- `.github/instructions/**`, `.github/prompts/api-quality-engineering/**`, `.claude/agents/**`, `.claude/rules/**`, `.claude/prompts/api-quality-engineering/**`, and `testing/SKILL.md`

Do not commit by default:

- real env files
- runner caches
- bulky generated HTML/XML/JSON outputs from one-off runs
- secrets, access tokens, cookies, API keys, or exported current-value environments

## 8) Pre-Completion Checklist

- [ ] Curated report exists in `documents/api-quality-engineering/<output-slug>/reports/<run-slug>/`
- [ ] Raw artifacts are referenced or attached, not blindly committed
- [ ] Confirmed issues are separated from asset issues and evidence gaps
- [ ] CI workflows use secrets correctly and upload artifacts predictably
- [ ] No real credentials or exported current values were committed

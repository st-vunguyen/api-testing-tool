# API Quality Engineering — Copilot + Claude Support Matrix

> Product name: **API Quality Engineering Kit**  
> Canonical source folder in this repository is `api-quality-engineering/`. Legacy compatibility filenames remain available inside this kit where needed.

This kit is designed to support both **VS Code GitHub Copilot** and **Claude Code** in the same target repository.

## Support model

| Layer | Copilot VS Code | Claude Code | Commit? |
|---|---|---|---|
| Prompt tree | `.github/prompts/api-quality-engineering/` + compatibility alias `.github/prompts/api-testing/` | `.claude/prompts/api-quality-engineering/` + compatibility alias `.claude/prompts/api-testing/` | Yes |
| Instructions / rules | `.github/instructions/` | `.claude/rules/` | Yes |
| Agent persona | N/A | `.claude/agents/api-quality-engineering-qc.agent.md` + compatibility alias | Yes |
| Shared skill reference | `testing/SKILL.md` | `testing/SKILL.md` | Yes |
| Runtime outputs | raw Newman/k6/ZAP output, real env overrides, exported current-value envs | same | No |

## Recommended repository state

For the best cross-tool experience, the target repo should contain both support layouts:

```text
.github/
├── instructions/
└── prompts/api-quality-engineering/
  ├── 00-orchestration/
  ├── 01-review-and-strategy/
  ├── 02-core-pack/
  ├── 03-scenario-packs/
  ├── 04-non-functional/
  └── 05-maintenance/

.claude/
├── agents/
├── rules/
└── prompts/api-quality-engineering/
  ├── 00-orchestration/
  ├── 01-review-and-strategy/
  ├── 02-core-pack/
  ├── 03-scenario-packs/
  ├── 04-non-functional/
  └── 05-maintenance/

testing/
└── SKILL.md
```

These support files are part of the kit contract. They are not trash and should remain versioned.

## Never commit these generated outputs

- `tools/api-quality-engineering/**/reports/raw/**`
- real `tools/api-quality-engineering/**/env/.env*`
- exported current-value Postman environments
- runner caches and one-off raw CLI outputs

## Recommended bootstrap command

```bash
node api-quality-engineering/scripts/apply-api-quality-engineering-kit.js \
  --target /absolute/path/to/your-repo \
  --slug my-api \
  --assistant both
```

If you omit `--assistant`, the script defaults to `both`.

Start with `.github/prompts/api-quality-engineering/00-orchestration/00-run-pipeline.prompt.md` or the Claude equivalent.
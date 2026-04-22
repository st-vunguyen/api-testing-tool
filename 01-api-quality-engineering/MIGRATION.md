# Migration from `api-testing`

`api-quality-engineering/` is now the canonical home of this kit.

The rename reflects the actual scope of the kit:

- OpenAPI/spec review
- strategy and traceability
- runnable Postman/Newman assets
- environment and data contracts
- performance baselines and JMeter workflows
- reporting, CI, and maintenance flows

## What remains compatible

The canonical kit still includes compatibility entrypoints where useful:

- legacy-named bootstrap script: `scripts/apply-api-testing-kit.js`
- legacy-named prompt aliases in copied support trees: `.github/prompts/api-testing/` and `.claude/prompts/api-testing/`
- legacy-named instruction and agent files kept as aliases inside the canonical kit

## Safe usage going forward

- Read docs from `api-quality-engineering/README.md`
- Bootstrap repos with `api-quality-engineering/scripts/apply-api-quality-engineering-kit.js`
- Treat `api-quality-engineering/` as the single source of truth for future edits

If the old top-level `api-testing/` folder has been removed, use the compatibility files inside `api-quality-engineering/` instead of restoring the old copy.
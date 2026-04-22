# API Quality Engineering — Apply Recipe

> Product name: **API Quality Engineering Kit**  
> Canonical source folder in this repository is `api-quality-engineering/`. Legacy compatibility filenames remain available inside this kit where needed.

Use this recipe when you want to bootstrap the API Quality Engineering kit into a real repo that already has an `openapi.yaml`, `openapi.json`, or Swagger file.

Recommended default: install support files for both Copilot and Claude into the same repo.

## What the apply script does

- Copies the canonical runnable pack from `templates/api-pack/`
- Creates the canonical split between `documents/api-quality-engineering/<slug>/` and `tools/api-quality-engineering/<slug>/`
- Copies prompts + instructions into AI-assistant friendly locations for Copilot and/or Claude
- Copies the Claude agent persona when Claude support is enabled
- Copies the Newman CI workflow starter
- Merges kit `.gitignore` rules so raw runner output and real env overrides do not go to git
- Copies the advanced `performance/jmeter/` starter pack for standard JMeter workflows

## Target shape after apply

- `documents/api-quality-engineering/<slug>/strategy/`
- `documents/api-quality-engineering/<slug>/scenarios/`
- `documents/api-quality-engineering/<slug>/traceability/`
- `documents/api-quality-engineering/<slug>/reports/`
- `tools/api-quality-engineering/<slug>/postman/`
- `tools/api-quality-engineering/<slug>/env/`
- `tools/api-quality-engineering/<slug>/data/`
- `tools/api-quality-engineering/<slug>/helpers/`
- `tools/api-quality-engineering/<slug>/performance/`
- `tools/api-quality-engineering/<slug>/performance/jmeter/`
- `.github/workflows/api-quality-engineering-newman.yml`
- `.github/instructions/**`, `.github/prompts/api-quality-engineering/**`, and compatibility alias `.github/prompts/api-testing/**`
- `.claude/agents/**`, `.claude/rules/**`, `.claude/prompts/api-quality-engineering/**`, and compatibility alias `.claude/prompts/api-testing/**`
- `testing/SKILL.md`

## Quick checklist

- [ ] Confirm the target repo contains a real OpenAPI/Swagger spec
- [ ] Choose a stable slug such as `billing-api` or `identity-service`
- [ ] Run the apply script in `--dry-run` mode first
- [ ] Re-run without `--dry-run` after reviewing the copy plan
- [ ] Prefer `--assistant both` or omit `--assistant` to install Copilot + Claude support together
- [ ] Update `collection.json`, env templates, and variable contract using the real spec
- [ ] Review the generated `performance/` baseline and choose `k6`, constrained `postman-newman`, or the deeper `jmeter/` path
- [ ] Keep only `.example` env files committed
- [ ] Review raw-output ignore rules before first Newman run
- [ ] Verify `.github/*`, `.claude/*`, and `testing/SKILL.md` remain committed support files
- [ ] Read `GUIDELINE.md` once before the first real rollout
- [ ] Start with `.github/prompts/api-quality-engineering/00-orchestration/00-run-pipeline.prompt.md`

## Commands

```bash
# preview what will be copied
node api-quality-engineering/scripts/apply-api-quality-engineering-kit.js \
  --target /absolute/path/to/your-repo \
  --slug my-api \
  --spec spec/openapi.yaml \
  --assistant both \
  --dry-run

# actually apply the kit
node api-quality-engineering/scripts/apply-api-quality-engineering-kit.js \
  --target /absolute/path/to/your-repo \
  --slug my-api \
  --spec spec/openapi.yaml \
  --assistant both

# overwrite existing files intentionally
node api-quality-engineering/scripts/apply-api-quality-engineering-kit.js \
  --target /absolute/path/to/your-repo \
  --slug my-api \
  --assistant both \
  --force
```

## Assistant modes

If you omit `--assistant`, the script defaults to `both`.

- `copilot`: copies `.github/instructions/` + `.github/prompts/api-quality-engineering/` and the compatibility alias tree
- `claude`: copies `.claude/agents/`, `.claude/rules/`, `.claude/prompts/api-quality-engineering/` and the compatibility alias tree
- `both`: copies both layouts

## After apply

Run these inside the target repo:

```bash
ls documents/api-quality-engineering/<your-slug>
ls tools/api-quality-engineering/<your-slug>
ls tools/api-quality-engineering/<your-slug>/performance
ls tools/api-quality-engineering/<your-slug>/performance/jmeter
```

Then open the real spec and start with `.github/prompts/api-quality-engineering/00-orchestration/00-run-pipeline.prompt.md` or the Claude equivalent.

See `TOOL_SUPPORT.md` for the exact cross-tool support matrix.
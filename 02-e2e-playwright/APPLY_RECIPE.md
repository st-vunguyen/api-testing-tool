# E2E Playwright — Apply Recipe

Use this recipe when you want to bootstrap the `e2e-playwright` kit into a real Playwright repo with one repeatable command instead of copying pieces by hand.

Recommended default: install support files for both Copilot and Claude into the same repo.

## What the apply script does

- Copies runtime starter files from `templates/` into the target repo
- Copies prompts + instructions into AI-assistant friendly locations for Copilot and/or Claude
- Copies the Claude agent persona when Claude support is enabled
- Merges the kit `.gitignore` rules instead of overwriting the target repo `.gitignore`
- Copies helper scripts for cleanup and report opening
- Leaves existing files untouched unless you pass `--force`

## Target shape after apply

- `playwright.config.ts`
- `tests/e2e/**`
- `.env.test.example`
- `.github/workflows/e2e.yml`
- `.github/instructions/**` and `.github/prompts/e2e-playwright/**`
- `.claude/agents/**`, `.claude/rules/**`, and `.claude/prompts/e2e-playwright/**`
- `testing/SKILL.md`
- `tools/e2e/scripts/**`

## Quick checklist

- [ ] Confirm the target repo is the correct Playwright repo
- [ ] Run the apply script in `--dry-run` mode first
- [ ] Re-run without `--dry-run` when the plan looks correct
- [ ] Prefer `--assistant both` or omit `--assistant` to install Copilot + Claude support together
- [ ] Review all `TODO:` markers copied from the kit
- [ ] Fill `.env.test` from `.env.test.example`
- [ ] Install Playwright dependencies in the target repo
- [ ] Run `pnpm exec playwright test --list`
- [ ] Verify `global-setup.ts` cleans stale artifacts before each run
- [ ] Verify `.github/*`, `.claude/*`, and `testing/SKILL.md` remain committed support files

## Commands

```bash
# preview what will be copied
node e2e-playwright/scripts/apply-e2e-kit.js \
  --target /absolute/path/to/your-repo \
  --assistant both \
  --dry-run

# actually apply the kit
node e2e-playwright/scripts/apply-e2e-kit.js \
  --target /absolute/path/to/your-repo \
  --assistant both

# overwrite existing target files when you intentionally want a refresh
node e2e-playwright/scripts/apply-e2e-kit.js \
  --target /absolute/path/to/your-repo \
  --assistant both \
  --force
```

## Assistant modes

If you omit `--assistant`, the script defaults to `both`.

- `copilot`: copies `.github/instructions/` + `.github/prompts/e2e-playwright/`
- `claude`: copies `.claude/agents/`, `.claude/rules/`, `.claude/prompts/e2e-playwright/`
- `both`: copies both layouts

## After apply

Run these inside the target repo:

```bash
pnpm add -D @playwright/test @axe-core/playwright dotenv
pnpm exec playwright install chromium
cp .env.test.example .env.test
pnpm exec playwright test --list
```

Then start with `.github/prompts/e2e-playwright/00-run-pipeline.prompt.md` or the Claude equivalent.

See `TOOL_SUPPORT.md` for the exact cross-tool support matrix.
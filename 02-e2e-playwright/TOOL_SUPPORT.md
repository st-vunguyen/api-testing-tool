# E2E Playwright — Copilot + Claude Support Matrix

This kit is designed to support both **VS Code GitHub Copilot** and **Claude Code** in the same target repository.

## Support model

| Layer | Copilot VS Code | Claude Code | Commit? |
|---|---|---|---|
| Prompt entrypoint | `.github/prompts/e2e-playwright/` | `.claude/prompts/e2e-playwright/` | Yes |
| Instructions / rules | `.github/instructions/` | `.claude/rules/` | Yes |
| Agent persona | N/A | `.claude/agents/automation-qc.agent.md` | Yes |
| Shared skill reference | `testing/SKILL.md` | `testing/SKILL.md` | Yes |
| Runtime artifacts | `playwright-report/`, `test-results/`, `blob-report/`, `.auth/` | same | No |

## Recommended repository state

For the best cross-tool experience, the target repo should contain both support layouts:

```text
.github/
├── instructions/
└── prompts/e2e-playwright/

.claude/
├── agents/
├── rules/
└── prompts/e2e-playwright/

testing/
└── SKILL.md
```

These support files are part of the kit contract. They are not trash and should remain versioned.

## Never commit these generated outputs

- `playwright-report/`
- `test-results/`
- `blob-report/`
- `tests/e2e/.auth/`
- real `.env.test`

## Recommended bootstrap command

```bash
node e2e-playwright/scripts/apply-e2e-kit.js \
  --target /absolute/path/to/your-repo \
  --assistant both
```

If you omit `--assistant`, the script defaults to `both`.
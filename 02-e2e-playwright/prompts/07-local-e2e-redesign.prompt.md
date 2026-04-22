---
description: "Detects the copied kit folder, bootstraps AI dependencies (agents, instructions, skills), reads the enclosing source code, and redesigns a perfect foundational E2E framework locally."
agent: "agent"
tools: ['search', 'edit', 'new', 'todos', 'runSubagent', 'problems', 'changes', 'runCommands', 'runTasks']
---

# Local E2E Framework Initialization & Arch Redesign

This workflow is executed right after you copy the entire `e2e-playwright` kit folder into a new project's source code. Your mission is to establish the perfect, standardized Playwright framework architecture inside this repository alongside local AI capabilities. 

**IMPORTANT**: Do **NOT** run, write, or generate any business test scenarios or spec files yet. This prompt is strictly for structural architecture, framework initialization, AI agent prep, and strict repository isolation.

## Context

- **Entry point**: You are executing this prompt from a copied `e2e-playwright/prompts/` directory within the target project's source code.
- **Target framework**: Playwright.
- **Goal**: Bootstrap AI toolkit dependencies (skills, instructions, agents) and configure a perfect `tests/e2e/` architecture tailored to the host project.
- **Constraints**: The project might be very restrictive. All copied or generated folders (agents, skills, instructions, the e2e-playwright folder itself) are strictly for *personal AI use* and absolutely MUST NOT pollute the remote repo.

## Mission

1. **Detect & Orient**: Locate this `e2e-playwright/` folder within the broader project.
2. **Bootstrap AI Toolkit**: Identify appropriate directories for the current IDE/Environment (e.g., `.claude/`, `.github/`, `.cursor/`, `.windsurf/`) and copy the relevant agents, instructions, and skills into them so they are usable immediately.
3. **Analyze Context**: Read the project's source code to understand the application type and existing test frameworks.
4. **Design the Standard**: Formulate a perfect Playwright base architecture tailored to the project context.
5. **Execute Architecture**: Initialize/Fix `playwright.config.ts`, standard `tests/e2e/` directories, and base fixtures. 
6. **Isolate Toolkit**: Ensure everything related to AI, instructions, skills, agents, and the prompt-kit is strictly ignored by `.gitignore` so they remain local-only.

## Procedure

1. **Discover & Bootstrap AI Dependencies**
   - Find the `e2e-playwright` folder where you are located.
   - Detect the exact IDE/AI context you are running in and set up the AI support files:
     - **Agents**: Copy agent definitions (e.g., from `e2e-playwright/agents/`) into `.claude/agents/` or `.cursor/rules/`.
     - **Instructions**: Copy `e2e-playwright/instructions/` to `.claude/rules/` or `.github/instructions/`.
     - **Skills**: Copy `e2e-playwright/testing/SKILL.md` to a local skills/tools directory if applicable.

2. **Discover & Analyze the Project Context**
   - Analyze the root `package.json`, tech stack, existing `playwright.config.ts` (if any), and the existing `tests/e2e/` folder.
   - Identify missing framework infrastructure (e.g., base URLs, global setups).

3. **Propose Architecture Revamp**
   - Map out the ideal skeleton: `tests/e2e/fixtures/`, `tests/e2e/utils/`, `tests/e2e/specs/`, `playwright.config.ts`.

4. **Execute Framework Bootstrapping (100% Core Setup)**
   - Create or completely refactor the `playwright.config.ts`.
   - Scaffold the foundational directories (`fixtures/`, `utils/`, `specs/`).
   - Create generic base fixtures (e.g., API wrappers, auth abstractions).
   - **DO NOT write test cases or scenarios.** Stop at the framework layer.

5. **Isolate the Personal WorkSpace (CRITICAL)**
   - You MUST ensure the *entire* `e2e-playwright` folder that you initially copied, **AND** all newly bootstrapped AI dependencies (agents, instructions, skills folders), are ignored from Git.
   - Append tracking paths to the project's `.gitignore` at the root. 
   - **CRITICAL .gitignore rules**:
     - Do NOT ignore common/shared folders (e.g., `tests/e2e/`, `scripts/`) because the actual final E2E framework must be committed later.
     - ONLY add explicit paths corresponding to the personal AI workspace:
       - The copied `e2e-playwright` folder path.
       - The specific `.claude/`, `.github/`, `.cursor/`, or `.windsurf/` folders you injected agents/instructions/skills into.
       - Any internal AI tracking files or logs.

## Final Response

```markdown
## Setup Summary
- **Project Detected**: [Tech stack analyzed & `e2e-playwright` location]
- **AI Bootstrapped**: [Exact list of agents, instructions, skills copied to their respective right places]
- **Framework Initialized**: [List of Playwright config files and directories created]
- **Personal Isolation**: [Specific list of `.gitignore` entries added to protect ALL AI files and the prompt kit]
- **Status**: Framework architecture & AI capabilities are structurally perfect and securely isolated.
```

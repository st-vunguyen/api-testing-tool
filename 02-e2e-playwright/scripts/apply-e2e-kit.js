#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const args = {
    assistant: 'both',
    dryRun: false,
    force: false,
    help: false,
    target: '',
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--dry-run') args.dryRun = true;
    else if (token === '--force') args.force = true;
    else if (token === '--help' || token === '-h') args.help = true;
    else if (token === '--target') args.target = argv[index + 1] || '';
    else if (token.startsWith('--target=')) args.target = token.split('=')[1] || '';
    else if (token === '--assistant') args.assistant = argv[index + 1] || 'both';
    else if (token.startsWith('--assistant=')) args.assistant = token.split('=')[1] || 'both';

    if (token === '--target' || token === '--assistant') {
      index += 1;
    }
  }

  return args;
}

function printHelp() {
  console.log(`Apply the e2e-playwright kit to a target repository.

Usage:
  node e2e-playwright/scripts/apply-e2e-kit.js --target /abs/path [--assistant copilot|claude|both] [--dry-run] [--force]

Default assistant mode: both
`);
}

function ensureDir(dirPath, dryRun) {
  if (dryRun) return;
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyFileSafe(sourcePath, targetPath, options) {
  const { dryRun, force, actions } = options;
  const exists = fs.existsSync(targetPath);
  if (exists && !force) {
    actions.push(`skip  ${path.relative(options.targetRoot, targetPath)} (exists)`);
    return;
  }

  actions.push(`${exists ? 'write ' : 'copy  '} ${path.relative(options.targetRoot, targetPath)}`);
  if (dryRun) return;
  ensureDir(path.dirname(targetPath), dryRun);
  fs.copyFileSync(sourcePath, targetPath);
}

function copyDirRecursive(sourceDir, targetDir, options) {
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });
  ensureDir(targetDir, options.dryRun);

  for (const entry of entries) {
    if (entry.name === '.DS_Store') {
      continue;
    }

    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(sourcePath, targetPath, options);
      continue;
    }

    copyFileSafe(sourcePath, targetPath, options);
  }
}

function mergeGitignore(sourcePath, targetPath, options) {
  const { dryRun, actions } = options;
  const sourceLines = fs.readFileSync(sourcePath, 'utf8').split(/\r?\n/);
  const targetLines = fs.existsSync(targetPath)
    ? fs.readFileSync(targetPath, 'utf8').split(/\r?\n/)
    : [];

  const merged = [...targetLines];
  let changed = false;
  for (const line of sourceLines) {
    if (!merged.includes(line)) {
      merged.push(line);
      changed = true;
    }
  }

  actions.push(`${changed ? 'merge ' : 'keep  '} ${path.relative(options.targetRoot, targetPath) || '.gitignore'}`);
  if (!changed || dryRun) return;
  fs.writeFileSync(targetPath, `${merged.join('\n').replace(/\n+$/u, '')}\n`, 'utf8');
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.target) {
    printHelp();
    process.exit(args.help ? 0 : 1);
  }

  const validAssistants = new Set(['copilot', 'claude', 'both']);
  if (!validAssistants.has(args.assistant)) {
    console.error(`Invalid --assistant value: ${args.assistant}`);
    process.exit(1);
  }

  const kitRoot = path.resolve(__dirname, '..');
  const targetRoot = path.resolve(args.target);
  const actions = [];
  const options = { actions, dryRun: args.dryRun, force: args.force, targetRoot };

  const supportTargets = [];
  if (args.assistant === 'copilot' || args.assistant === 'both') {
    supportTargets.push(
      [path.join(kitRoot, 'instructions'), path.join(targetRoot, '.github', 'instructions')],
      [path.join(kitRoot, 'prompts'), path.join(targetRoot, '.github', 'prompts', 'e2e-playwright')],
    );
  }
  if (args.assistant === 'claude' || args.assistant === 'both') {
    supportTargets.push(
      [path.join(kitRoot, 'agents'), path.join(targetRoot, '.claude', 'agents')],
      [path.join(kitRoot, 'instructions'), path.join(targetRoot, '.claude', 'rules')],
      [path.join(kitRoot, 'prompts'), path.join(targetRoot, '.claude', 'prompts', 'e2e-playwright')],
    );
  }

  for (const [sourceDir, targetDir] of supportTargets) {
    copyDirRecursive(sourceDir, targetDir, options);
  }

  copyFileSafe(
    path.join(kitRoot, 'testing', 'SKILL.md'),
    path.join(targetRoot, 'testing', 'SKILL.md'),
    options,
  );
  copyFileSafe(
    path.join(kitRoot, 'templates', 'playwright.config.ts'),
    path.join(targetRoot, 'playwright.config.ts'),
    options,
  );
  copyDirRecursive(
    path.join(kitRoot, 'templates', 'tests'),
    path.join(targetRoot, 'tests'),
    options,
  );
  copyFileSafe(
    path.join(kitRoot, 'templates', '.github', 'workflows', 'e2e.yml'),
    path.join(targetRoot, '.github', 'workflows', 'e2e.yml'),
    options,
  );
  copyFileSafe(
    path.join(kitRoot, 'templates', '.env.test.example'),
    path.join(targetRoot, '.env.test.example'),
    options,
  );
  copyDirRecursive(
    path.join(kitRoot, 'templates', 'scripts'),
    path.join(targetRoot, 'tools', 'e2e', 'scripts'),
    options,
  );
  mergeGitignore(
    path.join(kitRoot, 'templates', '.gitignore'),
    path.join(targetRoot, '.gitignore'),
    options,
  );

  console.log(`[apply-e2e-kit] target: ${targetRoot}`);
  console.log(`[apply-e2e-kit] mode: ${args.assistant}${args.dryRun ? ' (dry-run)' : ''}${args.force ? ' (force)' : ''}`);
  console.log('');
  for (const action of actions) {
    console.log(action);
  }
  console.log('');
  console.log('[apply-e2e-kit] next checklist:');
  console.log('1. Keep both `.github/*` and `.claude/*` support trees committed when using both tools.');
  console.log('2. Review copied files for TODO markers.');
  console.log('3. Copy `.env.test.example` to `.env.test` and fill values.');
  console.log('4. Install Playwright dependencies in the target repo.');
  console.log('5. Run `pnpm exec playwright test --list`.');
}

main();
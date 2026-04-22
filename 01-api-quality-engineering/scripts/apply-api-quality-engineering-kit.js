#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const args = {
    assistant: 'both',
    dryRun: false,
    force: false,
    help: false,
    slug: '',
    spec: '',
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
    else if (token === '--slug') args.slug = argv[index + 1] || '';
    else if (token.startsWith('--slug=')) args.slug = token.split('=')[1] || '';
    else if (token === '--spec') args.spec = argv[index + 1] || '';
    else if (token.startsWith('--spec=')) args.spec = token.split('=')[1] || '';

    if (['--target', '--assistant', '--slug', '--spec'].includes(token)) {
      index += 1;
    }
  }

  return args;
}

function printHelp() {
  console.log(`Apply the API Quality Engineering kit to a target repository.

Usage:
  node api-quality-engineering/scripts/apply-api-quality-engineering-kit.js --target /abs/path --slug my-api [--spec spec/openapi.yaml] [--assistant copilot|claude|both] [--dry-run] [--force]

Compatibility alias:
  node api-quality-engineering/scripts/apply-api-testing-kit.js --target /abs/path --slug my-api [--spec spec/openapi.yaml] [--assistant copilot|claude|both] [--dry-run] [--force]

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

function writeTextFile(targetPath, body, options) {
  const { dryRun, force, actions } = options;
  const exists = fs.existsSync(targetPath);
  if (exists && !force) {
    actions.push(`skip  ${path.relative(options.targetRoot, targetPath)} (exists)`);
    return;
  }

  actions.push(`${exists ? 'write ' : 'create '} ${path.relative(options.targetRoot, targetPath)}`);
  if (dryRun) return;
  ensureDir(path.dirname(targetPath), dryRun);
  fs.writeFileSync(targetPath, body, 'utf8');
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
  if (args.help || !args.target || !args.slug) {
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
  const outputSlug = args.slug;
  const docsRoot = path.join(targetRoot, 'documents', 'api-quality-engineering', outputSlug);
  const toolsRoot = path.join(targetRoot, 'tools', 'api-quality-engineering', outputSlug);

  const supportTargets = [];
  if (args.assistant === 'copilot' || args.assistant === 'both') {
    supportTargets.push(
      [path.join(kitRoot, 'instructions'), path.join(targetRoot, '.github', 'instructions')],
      [path.join(kitRoot, 'prompts'), path.join(targetRoot, '.github', 'prompts', 'api-quality-engineering')],
      [path.join(kitRoot, 'prompts'), path.join(targetRoot, '.github', 'prompts', 'api-testing')],
    );
  }
  if (args.assistant === 'claude' || args.assistant === 'both') {
    supportTargets.push(
      [path.join(kitRoot, 'agents'), path.join(targetRoot, '.claude', 'agents')],
      [path.join(kitRoot, 'instructions'), path.join(targetRoot, '.claude', 'rules')],
      [path.join(kitRoot, 'prompts'), path.join(targetRoot, '.claude', 'prompts', 'api-quality-engineering')],
      [path.join(kitRoot, 'prompts'), path.join(targetRoot, '.claude', 'prompts', 'api-testing')],
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
    path.join(kitRoot, 'templates', '.github', 'workflows', 'api-quality-engineering-newman.yml'),
    path.join(targetRoot, '.github', 'workflows', 'api-quality-engineering-newman.yml'),
    options,
  );
  copyFileSafe(
    path.join(kitRoot, 'templates', 'api-pack', 'README.md'),
    path.join(toolsRoot, 'README.md'),
    options,
  );
  copyDirRecursive(
    path.join(kitRoot, 'templates', 'api-pack', 'postman'),
    path.join(toolsRoot, 'postman'),
    options,
  );
  copyDirRecursive(
    path.join(kitRoot, 'templates', 'api-pack', 'env'),
    path.join(toolsRoot, 'env'),
    options,
  );
  copyDirRecursive(
    path.join(kitRoot, 'templates', 'api-pack', 'data'),
    path.join(toolsRoot, 'data'),
    options,
  );
  copyDirRecursive(
    path.join(kitRoot, 'templates', 'api-pack', 'helpers'),
    path.join(toolsRoot, 'helpers'),
    options,
  );
  copyDirRecursive(
    path.join(kitRoot, 'templates', 'api-pack', 'performance'),
    path.join(toolsRoot, 'performance'),
    options,
  );
  copyDirRecursive(
    path.join(kitRoot, 'templates', 'api-pack', 'reports', 'raw'),
    path.join(toolsRoot, 'reports', 'raw'),
    options,
  );
  copyDirRecursive(
    path.join(kitRoot, 'templates', 'api-pack', 'e2e-journeys'),
    path.join(toolsRoot, 'e2e-journeys'),
    options,
  );
  copyDirRecursive(
    path.join(kitRoot, 'templates', 'api-pack', 'e2e-collection'),
    path.join(toolsRoot, 'e2e-collection'),
    options,
  );
  copyFileSafe(
    path.join(kitRoot, 'templates', 'api-pack', 'environment-variable-contract.md'),
    path.join(docsRoot, 'traceability', '02_variable-contract.md'),
    options,
  );
  copyFileSafe(
    path.join(kitRoot, 'templates', 'api-pack', 'full-api-collection-traceability.md'),
    path.join(docsRoot, 'traceability', '03_full-api-collection-traceability.md'),
    options,
  );
  copyFileSafe(
    path.join(kitRoot, 'templates', 'api-pack', 'data-driven-samples-mapping.md'),
    path.join(docsRoot, 'traceability', '04_data-driven-samples-mapping.md'),
    options,
  );
  copyFileSafe(
    path.join(kitRoot, 'templates', 'api-pack', 'performance-collection-reporting.md'),
    path.join(docsRoot, 'strategy', 'performance-collection-reporting.md'),
    options,
  );

  for (const section of ['strategy', 'scenarios', 'traceability', 'reports']) {
    const dirPath = path.join(docsRoot, section);
    actions.push(`mkdir ${path.relative(targetRoot, dirPath)}`);
    ensureDir(dirPath, args.dryRun);
  }

  if (args.spec) {
    writeTextFile(
      path.join(docsRoot, 'traceability', '00_spec-source.md'),
      `# Spec Source\n\n- **Provided spec path**: \`${args.spec}\`\n- **Output slug**: \`${outputSlug}\`\n- **Next step**: review the spec and start with the API Quality Engineering pipeline prompt.\n`,
      options,
    );
  }

  mergeGitignore(
    path.join(kitRoot, 'templates', '.gitignore'),
    path.join(targetRoot, '.gitignore'),
    options,
  );

  console.log(`[apply-api-quality-engineering-kit] target: ${targetRoot}`);
  console.log(`[apply-api-quality-engineering-kit] slug: ${outputSlug}`);
  console.log(`[apply-api-quality-engineering-kit] mode: ${args.assistant}${args.dryRun ? ' (dry-run)' : ''}${args.force ? ' (force)' : ''}`);
  console.log('');
  for (const action of actions) {
    console.log(action);
  }
  console.log('');
  console.log('[apply-api-quality-engineering-kit] next checklist:');
  console.log('1. Keep both `.github/*` and `.claude/*` support trees committed when using both tools.');
  console.log('2. Review the real OpenAPI/Swagger spec against the copied pack.');
  console.log('3. Review `tools/api-quality-engineering/<slug>/performance/` and confirm whether you need `k6`, constrained `postman-newman`, or the deeper `jmeter/` stack.');
  console.log('4. Update collection folders, auth, assertions, performance placeholders, and JMeter assets if needed.');
  console.log('5. Keep only `.example` env files committed.');
  console.log('6. Start with `00-orchestration/00-run-pipeline.prompt.md` in `.github/prompts/api-quality-engineering/` or the compatibility alias tree.');
}

main();
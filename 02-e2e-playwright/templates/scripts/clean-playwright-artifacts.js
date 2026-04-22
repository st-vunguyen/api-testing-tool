#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const artifactDirs = [
  'test-results',
  'playwright-report',
  'blob-report',
  path.join('tests', 'e2e', '.auth'),
];

const rootDir = process.cwd();
let removedCount = 0;

for (const relativeDir of artifactDirs) {
  const absoluteDir = path.resolve(rootDir, relativeDir);
  if (!fs.existsSync(absoluteDir)) {
    console.log(`[clean-artifacts] skip ${relativeDir}/ (not found)`);
    continue;
  }

  fs.rmSync(absoluteDir, { recursive: true, force: true });
  console.log(`[clean-artifacts] removed ${relativeDir}/`);
  removedCount += 1;
}

const authDir = path.resolve(rootDir, 'tests', 'e2e', '.auth');
fs.mkdirSync(authDir, { recursive: true });
console.log('[clean-artifacts] ensured tests/e2e/.auth/ exists');

console.log(`[clean-artifacts] done (${removedCount} artifact directories removed)`);
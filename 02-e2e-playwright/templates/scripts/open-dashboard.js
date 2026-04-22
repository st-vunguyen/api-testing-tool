#!/usr/bin/env node
const fs = require('fs');
const { spawn } = require('child_process');

const filePath = process.argv[2] || 'playwright-report/dashboard.html';

if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(2);
}

const platform = process.platform;
let cmd, args, options;

if (platform === 'darwin') {
  cmd = 'open';
  args = [filePath];
  options = { stdio: 'inherit' };
} else if (platform === 'win32') {
  // Use cmd /c start "" <file>
  cmd = 'cmd';
  args = ['/c', 'start', '', filePath];
  options = { stdio: 'inherit', shell: true };
} else {
  // linux / other
  cmd = 'xdg-open';
  args = [filePath];
  options = { stdio: 'inherit' };
}

const p = spawn(cmd, args, options);
p.on('close', code => process.exit(code));

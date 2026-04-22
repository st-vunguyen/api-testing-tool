#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const args = {
    output: '',
    runLabel: '',
    stats: '',
    thresholdErrorPct: 1,
    thresholdP95Ms: 1000,
    title: 'JMeter Executive Dashboard',
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--stats') args.stats = argv[index + 1] || '';
    else if (token.startsWith('--stats=')) args.stats = token.split('=')[1] || '';
    else if (token === '--output') args.output = argv[index + 1] || '';
    else if (token.startsWith('--output=')) args.output = token.split('=')[1] || '';
    else if (token === '--title') args.title = argv[index + 1] || args.title;
    else if (token.startsWith('--title=')) args.title = token.split('=')[1] || args.title;
    else if (token === '--run-label') args.runLabel = argv[index + 1] || '';
    else if (token.startsWith('--run-label=')) args.runLabel = token.split('=')[1] || '';
    else if (token === '--threshold-p95') args.thresholdP95Ms = Number(argv[index + 1] || args.thresholdP95Ms);
    else if (token.startsWith('--threshold-p95=')) args.thresholdP95Ms = Number(token.split('=')[1] || args.thresholdP95Ms);
    else if (token === '--threshold-error-pct') args.thresholdErrorPct = Number(argv[index + 1] || args.thresholdErrorPct);
    else if (token.startsWith('--threshold-error-pct=')) args.thresholdErrorPct = Number(token.split('=')[1] || args.thresholdErrorPct);

    if (['--stats', '--output', '--title', '--run-label', '--threshold-p95', '--threshold-error-pct'].includes(token)) {
      index += 1;
    }
  }

  return args;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function pickNumber(record, keys, fallback = 0) {
  for (const key of keys) {
    const value = record?.[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) return Number(value);
  }
  return fallback;
}

function normalizeStats(data) {
  const entries = [];

  if (Array.isArray(data)) {
    for (const item of data) {
      if (item && typeof item === 'object') entries.push(item);
    }
  } else if (data && typeof data === 'object') {
    for (const [label, value] of Object.entries(data)) {
      if (value && typeof value === 'object') {
        entries.push({ label, ...value });
      }
    }
  }

  const normalized = entries.map((entry) => {
    const label = entry.label || entry.transaction || entry.name || entry.sampleLabel || 'Unnamed';
    const sampleCount = pickNumber(entry, ['sampleCount', 'samplesCount', 'count', 'samples', 'n']);
    const errorCount = pickNumber(entry, ['errorCount', 'errors', 'ko']);
    const errorPct = pickNumber(entry, ['errorPct', 'errorPercentage', 'pctError', 'errorRate'], 0);
    const avg = pickNumber(entry, ['meanResTime', 'avg', 'average', 'mean', 'avgResponseTime']);
    const median = pickNumber(entry, ['medianResTime', 'median', 'med']);
    const p90 = pickNumber(entry, ['pct1ResTime', 'p90', 'perc90', 'percentile90']);
    const p95 = pickNumber(entry, ['pct2ResTime', 'p95', 'perc95', 'percentile95']);
    const p99 = pickNumber(entry, ['pct3ResTime', 'p99', 'perc99', 'percentile99']);
    const max = pickNumber(entry, ['maxResTime', 'max']);
    const min = pickNumber(entry, ['minResTime', 'min']);
    const throughput = pickNumber(entry, ['throughput', 'tps', 'requestsPerSecond']);
    const receivedKbSec = pickNumber(entry, ['receivedKBytesPerSec', 'receivedKbPerSec']);
    const sentKbSec = pickNumber(entry, ['sentKBytesPerSec', 'sentKbPerSec']);

    return {
      label,
      sampleCount,
      errorCount,
      errorPct: errorPct > 0 && errorPct <= 1 ? errorPct * 100 : errorPct,
      avg,
      median,
      p90,
      p95,
      p99,
      max,
      min,
      throughput,
      receivedKbSec,
      sentKbSec,
    };
  }).filter((entry) => entry.sampleCount > 0 || entry.avg > 0 || entry.throughput > 0);

  const overall = normalized.find((entry) => /^(total|all|overall)$/i.test(entry.label)) || normalized[0] || {
    label: 'Total',
    sampleCount: 0,
    errorCount: 0,
    errorPct: 0,
    avg: 0,
    median: 0,
    p90: 0,
    p95: 0,
    p99: 0,
    max: 0,
    min: 0,
    throughput: 0,
    receivedKbSec: 0,
    sentKbSec: 0,
  };

  const transactions = normalized.filter((entry) => entry !== overall && !/^(total|all|overall)$/i.test(entry.label));
  return { overall, transactions };
}

function formatNumber(value, fractionDigits = 0) {
  return Number(value || 0).toLocaleString('en-US', {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  });
}

function badgeClass(ok) {
  return ok ? 'ok' : 'warn';
}

function escapeHtml(input) {
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildHtml({ title, runLabel, overall, transactions, thresholdP95Ms, thresholdErrorPct }) {
  const slowest = [...transactions].sort((a, b) => b.p95 - a.p95).slice(0, 8);
  const noisiest = [...transactions].sort((a, b) => b.errorPct - a.errorPct).slice(0, 8);
  const focusAreas = transactions.filter((entry) => entry.p95 > thresholdP95Ms || entry.errorPct > thresholdErrorPct);
  const generatedAt = new Date().toISOString();

  const tableRows = transactions.map((entry) => {
    const p95Flag = entry.p95 > thresholdP95Ms;
    const errorFlag = entry.errorPct > thresholdErrorPct;
    return `
      <tr>
        <td>${escapeHtml(entry.label)}</td>
        <td>${formatNumber(entry.sampleCount)}</td>
        <td>${formatNumber(entry.avg, 1)} ms</td>
        <td class="${p95Flag ? 'risk' : ''}">${formatNumber(entry.p95, 1)} ms</td>
        <td>${formatNumber(entry.p99, 1)} ms</td>
        <td class="${errorFlag ? 'risk' : ''}">${formatNumber(entry.errorPct, 2)}%</td>
        <td>${formatNumber(entry.throughput, 2)} req/s</td>
      </tr>`;
  }).join('');

  const focusItems = (focusAreas.length ? focusAreas : transactions.slice(0, 3)).map((entry) => `<li><strong>${escapeHtml(entry.label)}</strong>: p95 ${formatNumber(entry.p95, 1)} ms, error ${formatNumber(entry.errorPct, 2)}%</li>`).join('');
  const slowItems = slowest.map((entry) => `<li><strong>${escapeHtml(entry.label)}</strong> — p95 ${formatNumber(entry.p95, 1)} ms, max ${formatNumber(entry.max, 1)} ms</li>`).join('');
  const errorItems = noisiest.map((entry) => `<li><strong>${escapeHtml(entry.label)}</strong> — error ${formatNumber(entry.errorPct, 2)}%, samples ${formatNumber(entry.sampleCount)}</li>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <style>
    :root {
      --bg: #0b1020;
      --panel: #141b34;
      --panel-soft: #1b2445;
      --text: #eef2ff;
      --muted: #aeb8d8;
      --accent: #76a9ff;
      --good: #2ecc71;
      --warn: #f5b942;
      --risk: #ff6b6b;
      --border: rgba(255,255,255,0.08);
      --shadow: 0 16px 40px rgba(0, 0, 0, 0.28);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: radial-gradient(circle at top left, #17234d 0%, var(--bg) 48%);
      color: var(--text);
    }
    .wrap { max-width: 1320px; margin: 0 auto; padding: 32px; }
    .hero {
      background: linear-gradient(135deg, rgba(118,169,255,0.22), rgba(24,34,72,0.94));
      border: 1px solid var(--border);
      box-shadow: var(--shadow);
      border-radius: 24px;
      padding: 28px;
      margin-bottom: 24px;
    }
    h1 { margin: 0 0 8px; font-size: 34px; }
    .sub { color: var(--muted); font-size: 15px; }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin: 24px 0;
    }
    .card {
      background: rgba(20,27,52,0.92);
      border: 1px solid var(--border);
      border-radius: 18px;
      box-shadow: var(--shadow);
      padding: 20px;
    }
    .label { color: var(--muted); font-size: 13px; text-transform: uppercase; letter-spacing: 0.08em; }
    .value { margin-top: 10px; font-size: 30px; font-weight: 700; }
    .badge {
      display: inline-flex;
      padding: 6px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
      margin-top: 10px;
    }
    .badge.ok { background: rgba(46,204,113,0.18); color: #8df0b4; }
    .badge.warn { background: rgba(255,107,107,0.18); color: #ffb0b0; }
    .section {
      background: rgba(20,27,52,0.92);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 22px;
      box-shadow: var(--shadow);
      margin-bottom: 20px;
    }
    .section h2 { margin-top: 0; font-size: 22px; }
    ul { margin: 0; padding-left: 20px; }
    li { margin: 8px 0; color: var(--muted); }
    li strong { color: var(--text); }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 16px;
      overflow: hidden;
      border-radius: 16px;
    }
    th, td {
      padding: 14px 12px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      text-align: left;
      font-size: 14px;
    }
    th { color: #dbe6ff; background: rgba(255,255,255,0.03); }
    td { color: var(--muted); }
    td:first-child { color: var(--text); font-weight: 600; }
    .risk { color: #ffb0b0; font-weight: 700; }
    .footer { color: var(--muted); font-size: 12px; margin-top: 18px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="hero">
      <h1>${escapeHtml(title)}</h1>
      <div class="sub">Run label: <strong>${escapeHtml(runLabel || 'n/a')}</strong> • Generated at ${escapeHtml(generatedAt)}</div>
      <div class="grid">
        <div class="card">
          <div class="label">Samples</div>
          <div class="value">${formatNumber(overall.sampleCount)}</div>
          <div class="badge ${badgeClass(overall.sampleCount > 0)}">${overall.sampleCount > 0 ? 'Data loaded' : 'No samples'}</div>
        </div>
        <div class="card">
          <div class="label">Average</div>
          <div class="value">${formatNumber(overall.avg, 1)} ms</div>
          <div class="badge ${badgeClass(overall.avg > 0)}">Evidence-backed</div>
        </div>
        <div class="card">
          <div class="label">p95</div>
          <div class="value">${formatNumber(overall.p95, 1)} ms</div>
          <div class="badge ${badgeClass(overall.p95 <= thresholdP95Ms)}">Threshold ${formatNumber(thresholdP95Ms)} ms</div>
        </div>
        <div class="card">
          <div class="label">Error Rate</div>
          <div class="value">${formatNumber(overall.errorPct, 2)}%</div>
          <div class="badge ${badgeClass(overall.errorPct <= thresholdErrorPct)}">Threshold ${formatNumber(thresholdErrorPct, 2)}%</div>
        </div>
        <div class="card">
          <div class="label">Throughput</div>
          <div class="value">${formatNumber(overall.throughput, 2)} req/s</div>
          <div class="badge ${badgeClass(overall.throughput > 0)}">Observed</div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>Executive Focus</h2>
      <ul>${focusItems}</ul>
    </div>

    <div class="grid">
      <div class="section">
        <h2>Slowest Transactions</h2>
        <ul>${slowItems || '<li>No transaction data available.</li>'}</ul>
      </div>
      <div class="section">
        <h2>Error Hotspots</h2>
        <ul>${errorItems || '<li>No transaction data available.</li>'}</ul>
      </div>
    </div>

    <div class="section">
      <h2>Transaction Breakdown</h2>
      <table>
        <thead>
          <tr>
            <th>Label</th>
            <th>Samples</th>
            <th>Avg</th>
            <th>p95</th>
            <th>p99</th>
            <th>Error %</th>
            <th>Throughput</th>
          </tr>
        </thead>
        <tbody>${tableRows || '<tr><td colspan="7">No transaction rows found.</td></tr>'}</tbody>
      </table>
      <div class="footer">Thresholds are display aids. Confirm their source in the curated report before treating them as contractual SLAs.</div>
    </div>
  </div>
</body>
</html>`;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.stats || !args.output) {
    console.error('Usage: node render-jmeter-dashboard.js --stats path/to/statistics.json --output path/to/dashboard.html [--title ...] [--run-label ...]');
    process.exit(1);
  }

  const data = readJson(args.stats);
  const { overall, transactions } = normalizeStats(data);
  const html = buildHtml({
    title: args.title,
    runLabel: args.runLabel,
    overall,
    transactions,
    thresholdErrorPct: args.thresholdErrorPct,
    thresholdP95Ms: args.thresholdP95Ms,
  });

  fs.mkdirSync(path.dirname(args.output), { recursive: true });
  fs.writeFileSync(args.output, html, 'utf8');
  console.log(`Dashboard written to ${args.output}`);
}

main();

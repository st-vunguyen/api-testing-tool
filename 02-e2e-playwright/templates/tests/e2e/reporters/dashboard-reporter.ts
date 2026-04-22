import type {
  Reporter,
  FullConfig,
  Suite,
  TestCase,
  TestResult,
  FullResult,
  TestStep,
} from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';

/**
 * E2E Dashboard Reporter — v2
 *
 * Generates a beautiful executive-style HTML dashboard alongside the default
 * Playwright HTML report.
 *
 * v2 improvements:
 *   - Clean steps: filters out hooks, fixtures, internal Playwright noise
 *   - Step grouping: 🌐 Navigation / 🧪 Assertions / ⚙️ Actions
 *   - Speed indicators: 🔴 >1s, 🟡 >300ms per step
 *   - Inline screenshots: base64-embedded thumbnails with lightbox
 *   - Inline API logs: collapsible text blocks
 *   - Correct test ordering: original execution order (#1–#N)
 *   - Collapsible everything: sections + test details
 */

// ─── Interfaces ───────────────────────────────────────────

interface CleanStep {
  title: string;
  duration: number;
  status: 'passed' | 'failed';
  group: string;
  error?: string;
}

interface ScreenshotAttachment {
  name: string;
  base64: string;
}

interface TestEntry {
  orderIndex: number;
  scnNumber: number; // parsed from 'SCN-070' in title — used for sorting
  title: string;
  fullTitle: string;
  status: 'passed' | 'failed' | 'skipped' | 'timedOut' | 'interrupted';
  duration: number;
  retries: number;
  tags: string[];
  file: string;
  steps: CleanStep[];
  errors: string[];
  screenshots: ScreenshotAttachment[];
  /** API request/response logs captured by failureApiLogger — only present on failed tests */
  apiLogs: string | null;
}

interface SuiteMetrics {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  timedOut: number;
  duration: number;
  startTime: number;
  endTime: number;
  passRate: number;
  avgDuration: number;
  slowestTests: TestEntry[];
  fastestTests: TestEntry[];
  tagBreakdown: Record<string, { total: number; passed: number; failed: number }>;
  fileBreakdown: Record<
    string,
    { total: number; passed: number; failed: number; duration: number }
  >;
}

// ─── Step Classification Helpers ──────────────────────────

const SKIP_CATEGORIES = new Set(['hook', 'fixture', 'pw:api', 'expect']);

const SKIP_TITLE_PATTERNS = [
  /^Before Hooks$/i,
  /^After Hooks$/i,
  /^browserContext\./,
  /^page\./,
  /^expect\./i,
  /^Expect /,
  /^locator\./,
  /^route\./,
  /^apiRequestContext\./,
  /^attach /i,
  /^Worker Cleanup$/i,
];

function shouldSkipStep(step: TestStep): boolean {
  if (step.category && SKIP_CATEGORIES.has(step.category)) return true;
  for (const p of SKIP_TITLE_PATTERNS) {
    if (p.test(step.title)) return true;
  }
  return false;
}

function classifyStepGroup(title: string): string {
  const l = title.toLowerCase();
  if (
    l.includes('navigat') ||
    l.includes('go to') ||
    l.includes('goto') ||
    l.includes('opens') ||
    l.includes('clicks') ||
    l.includes('click') ||
    l.includes('presses') ||
    l.includes('fills') ||
    l.includes('types') ||
    l.includes('submits') ||
    l.includes('uploads') ||
    l.includes('drags') ||
    l.includes('drag') ||
    l.includes('closes') ||
    l.includes('reopens') ||
    l.includes('opens search') ||
    l.includes('search and type') ||
    l.includes('toggle') ||
    l.includes('reload') ||
    l.includes('restore')
  ) {
    return '🌐 Navigation';
  }
  if (
    l.includes('verify') ||
    l.includes('assert') ||
    l.includes('check') ||
    l.includes('should') ||
    l.includes('expect') ||
    l.includes('confirm') ||
    l.includes('validate')
  ) {
    return '🧪 Assertions';
  }
  return '⚙️ Actions';
}

function speedIcon(ms: number): string {
  if (ms > 1000) return '🔴';
  if (ms > 300) return '🟡';
  return '';
}

// ─── Reporter ─────────────────────────────────────────────

export default class DashboardReporter implements Reporter {
  private tests: TestEntry[] = [];
  private outputFolder: string;
  private startTime = 0;
  private testCounter = 0;
  private config!: FullConfig;

  constructor(options: { outputFolder?: string } = {}) {
    this.outputFolder = options.outputFolder || 'playwright-report';
  }

  onBegin(config: FullConfig, _suite: Suite): void {
    this.config = config;
    this.startTime = Date.now();
    this.testCounter = 0;
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    this.testCounter++;

    // ── Clean steps: skip hooks / internal noise ──
    const steps: CleanStep[] = [];
    const walk = (list: TestStep[]) => {
      for (const step of list) {
        if (shouldSkipStep(step)) {
          if (step.steps?.length) walk(step.steps);
          continue;
        }
        steps.push({
          title: step.title,
          duration: step.duration,
          status: step.error ? 'failed' : 'passed',
          group: classifyStepGroup(step.title),
          error: step.error?.message,
        });
      }
    };
    walk(result.steps);

    // ── Tags ──
    const tags: string[] = test.tags ? [...test.tags] : [];

    // ── Screenshots (base64) ──
    const screenshots: ScreenshotAttachment[] = [];
    let apiLogs: string | null = null;
    for (const a of result.attachments) {
      // Capture API failure logs from failureApiLogger fixture
      if (a.name.includes('API Logs') && a.contentType === 'text/plain') {
        if (a.body) {
          apiLogs = a.body.toString('utf-8');
        } else if (a.path && fs.existsSync(a.path)) {
          apiLogs = fs.readFileSync(a.path, 'utf-8');
        }
        continue;
      }
      if (!a.contentType.startsWith('image/')) continue;
      let b64 = '';
      if (a.body) {
        b64 = a.body.toString('base64');
      } else if (a.path && fs.existsSync(a.path)) {
        b64 = fs.readFileSync(a.path).toString('base64');
      }
      if (b64) screenshots.push({ name: a.name, base64: b64 });
    }

    // Extract SCN number from title for deterministic ordering
    const scnMatch = test.title.match(/SCN-(\d+)/);
    const scnNumber = scnMatch ? parseInt(scnMatch[1], 10) : 9999;

    this.tests.push({
      orderIndex: this.testCounter,
      scnNumber,
      title: test.title,
      fullTitle: test.titlePath().join(' › '),
      status: result.status,
      duration: result.duration,
      retries: result.retry,
      tags,
      file: path.basename(test.location.file),
      steps,
      errors: result.errors.map((e) => e.message || String(e)),
      screenshots,
      apiLogs,
    });
  }

  async onEnd(result: FullResult): Promise<void> {
    const endTime = Date.now();
    const metrics = this.computeMetrics(endTime);
    const html = this.generateHTML(metrics, result.status);

    const outDir = path.resolve(this.outputFolder);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'dashboard.html'), html, 'utf-8');

    console.log(`\n📊 Dashboard report: ${path.join(outDir, 'dashboard.html')}`);
  }

  // ─── Metrics ──────────────────────────────────────────

  private computeMetrics(endTime: number): SuiteMetrics {
    const total = this.tests.length;
    const passed = this.tests.filter((t) => t.status === 'passed').length;
    const failed = this.tests.filter((t) => t.status === 'failed').length;
    const skipped = this.tests.filter((t) => t.status === 'skipped').length;
    const timedOut = this.tests.filter((t) => t.status === 'timedOut').length;
    const duration = endTime - this.startTime;
    const passRate = total > 0 ? Math.round((passed / total) * 1000) / 10 : 0;
    const avgDuration = total > 0 ? Math.round(duration / total) : 0;

    const sorted = [...this.tests].sort((a, b) => b.duration - a.duration);
    const slowestTests = sorted.slice(0, 5);
    const fastestTests = [...sorted].reverse().slice(0, 5);

    const tagBreakdown: Record<string, { total: number; passed: number; failed: number }> = {};
    for (const t of this.tests) {
      for (const tag of t.tags) {
        if (!tagBreakdown[tag]) tagBreakdown[tag] = { total: 0, passed: 0, failed: 0 };
        tagBreakdown[tag].total++;
        if (t.status === 'passed') tagBreakdown[tag].passed++;
        if (t.status === 'failed') tagBreakdown[tag].failed++;
      }
    }

    const fileBreakdown: Record<
      string,
      { total: number; passed: number; failed: number; duration: number }
    > = {};
    for (const t of this.tests) {
      if (!fileBreakdown[t.file])
        fileBreakdown[t.file] = { total: 0, passed: 0, failed: 0, duration: 0 };
      fileBreakdown[t.file].total++;
      fileBreakdown[t.file].duration += t.duration;
      if (t.status === 'passed') fileBreakdown[t.file].passed++;
      if (t.status === 'failed') fileBreakdown[t.file].failed++;
    }

    return {
      total,
      passed,
      failed,
      skipped,
      timedOut,
      duration,
      startTime: this.startTime,
      endTime,
      passRate,
      avgDuration,
      slowestTests,
      fastestTests,
      tagBreakdown,
      fileBreakdown,
    };
  }

  // ─── HTML Generation ──────────────────────────────────

  private generateHTML(m: SuiteMetrics, overallStatus: string): string {
    const statusEmoji =
      overallStatus === 'passed' ? '✅' : overallStatus === 'failed' ? '❌' : '⚠️';
    const statusColor =
      overallStatus === 'passed'
        ? '#10b981'
        : overallStatus === 'failed'
          ? '#ef4444'
          : '#f59e0b';

    const timelineSorted = [...this.tests].sort((a, b) => b.duration - a.duration);
    const maxDuration = Math.max(...this.tests.map((t) => t.duration), 1);
    // Sort by SCN number for deterministic display order
    const orderedTests = [...this.tests].sort((a, b) => a.scnNumber - b.scnNumber);

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>E2E Test Dashboard</title>
<style>
${this._css()}
</style>
</head>
<body>

<!-- ═══════ HEADER ═══════ -->
<div class="header">
  <div>
    <h1>📊 E2E Test Dashboard</h1>
    <div class="subtitle">Automated E2E Test Execution Report</div>
  </div>
  <div style="text-align: right">
    <div class="status-badge" style="background: ${statusColor}20; color: ${statusColor}; border: 1px solid ${statusColor}40;">
      ${statusEmoji} ${overallStatus.toUpperCase()}
    </div>
    <div class="meta">
      ${new Date(m.startTime).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}<br>
      Duration: ${this.fmt(m.duration)}
    </div>
  </div>
</div>

<!-- ═══════ SUMMARY CARDS ═══════ -->
<div class="cards">
  <div class="card"><div class="label">Total Tests</div><div class="value" style="color:var(--cyan)">${m.total}</div><div class="sub">${Object.keys(m.fileBreakdown).length} spec files</div></div>
  <div class="card"><div class="label">Passed</div><div class="value" style="color:var(--green)">${m.passed}</div><div class="sub">${m.passRate}% pass rate</div></div>
  <div class="card"><div class="label">Failed</div><div class="value" style="color:${m.failed > 0 ? 'var(--red)' : 'var(--text-dim)'}">${m.failed}</div><div class="sub">${m.timedOut > 0 ? m.timedOut + ' timed out' : 'No timeouts'}</div></div>
  <div class="card"><div class="label">Duration</div><div class="value" style="color:var(--blue)">${this.fmt(m.duration)}</div><div class="sub">Avg ${this.fmt(m.avgDuration)} / test</div></div>
  <div class="card"><div class="label">Pass Rate</div><div class="value" style="color:${m.passRate >= 95 ? 'var(--green)' : m.passRate >= 80 ? 'var(--yellow)' : 'var(--red)'}">${m.passRate}%</div><div class="sub">${m.skipped > 0 ? m.skipped + ' skipped' : 'None skipped'}</div></div>
</div>

<!-- ═══════ PROGRESS BAR ═══════ -->
<div class="section">
  <div class="progress-bar">
    <div class="seg" style="width:${(m.passed / m.total * 100).toFixed(1)}%;background:var(--green);"></div>
    <div class="seg" style="width:${(m.failed / m.total * 100).toFixed(1)}%;background:var(--red);"></div>
    <div class="seg" style="width:${(m.skipped / m.total * 100).toFixed(1)}%;background:var(--text-dim);"></div>
    <div class="seg" style="width:${(m.timedOut / m.total * 100).toFixed(1)}%;background:var(--yellow);"></div>
  </div>
  <div class="progress-legend">
    <span><span class="dot" style="background:var(--green)"></span> Passed (${m.passed})</span>
    <span><span class="dot" style="background:var(--red)"></span> Failed (${m.failed})</span>
    <span><span class="dot" style="background:var(--text-dim)"></span> Skipped (${m.skipped})</span>
    <span><span class="dot" style="background:var(--yellow)"></span> Timed Out (${m.timedOut})</span>
  </div>
</div>

<!-- ═══════ EXECUTIVE INSIGHTS ═══════ -->
<div class="section">
  <div class="section-header" onclick="toggleSection(this)">
    <span class="toggle">▼</span> 💡 Executive Insights
  </div>
  <div class="section-content">
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:12px;">
      ${this.generateInsights(m)}
    </div>
  </div>
</div>

<!-- ═══════ TAG BREAKDOWN ═══════ -->
${Object.keys(m.tagBreakdown).length > 0 ? `
<div class="section">
  <div class="section-header" onclick="toggleSection(this)">
    <span class="toggle">▼</span> 🏷️ Test Coverage by Tag
  </div>
  <div class="section-content">
    <table class="data-table">
      <thead><tr><th>Tag</th><th>Total</th><th>Passed</th><th>Failed</th><th>Rate</th></tr></thead>
      <tbody>
        ${Object.entries(m.tagBreakdown)
          .sort(([, a], [, b]) => b.total - a.total)
          .map(
            ([tag, d]) => `
          <tr>
            <td><span class="tag tag-${tag.replace('@', '')}">${tag}</span></td>
            <td>${d.total}</td>
            <td style="color:var(--green)">${d.passed}</td>
            <td style="color:${d.failed > 0 ? 'var(--red)' : 'var(--text-dim)'}">${d.failed}</td>
            <td>${d.total > 0 ? Math.round((d.passed / d.total) * 100) : 0}%</td>
          </tr>`,
          )
          .join('')}
      </tbody>
    </table>
  </div>
</div>` : ''}

<!-- ═══════ FILE PERFORMANCE ═══════ -->
<div class="section">
  <div class="section-header" onclick="toggleSection(this)">
    <span class="toggle">▼</span> 📁 Performance by Spec File
  </div>
  <div class="section-content">
    <table class="data-table">
      <thead><tr><th>File</th><th>Tests</th><th>Passed</th><th>Failed</th><th>Duration</th></tr></thead>
      <tbody>
        ${Object.entries(m.fileBreakdown)
        .sort(([, a], [, b]) => b.duration - a.duration)
        .map(
          ([file, d]) => `
          <tr>
            <td style="font-family:monospace;font-size:12px;">${file}</td>
            <td>${d.total}</td>
            <td style="color:var(--green)">${d.passed}</td>
            <td style="color:${d.failed > 0 ? 'var(--red)' : 'var(--text-dim)'}">${d.failed}</td>
            <td style="font-variant-numeric:tabular-nums;">${this.fmt(d.duration)}</td>
          </tr>`,
        )
        .join('')}
      </tbody>
    </table>
  </div>
</div>

<!-- ═══════ DURATION TIMELINE ═══════ -->
<div class="section">
  <div class="section-header collapsed" onclick="toggleSection(this)">
    <span class="toggle">▼</span> ⏱️ Test Duration Timeline
  </div>
  <div class="section-content collapsed">
    ${timelineSorted
        .map((t) => {
          const pct = Math.max(3, (t.duration / maxDuration) * 100);
          const barColor =
            t.status === 'passed'
              ? 'var(--green)'
              : t.status === 'failed'
                ? 'var(--red)'
                : 'var(--text-dim)';
          const icon =
            t.status === 'passed' ? '✅' : t.status === 'failed' ? '❌' : '⏭️';
          return `
    <div class="timeline-row">
      <div class="timeline-status">${icon}</div>
      <div class="timeline-label" title="${this.esc(t.fullTitle)}">${this.esc(t.title)}</div>
      <div class="timeline-bar-container">
        <div class="timeline-bar" style="width:${pct.toFixed(1)}%;background:${barColor};">${this.fmt(t.duration)}</div>
      </div>
      <div class="timeline-duration">${this.fmt(t.duration)}</div>
    </div>`;
        })
        .join('')}
  </div>
</div>

<!-- ═══════ DETAILED TEST RESULTS ═══════ -->
<div class="section">
  <div class="section-header" onclick="toggleSection(this)" id="detail-header">
    <span class="toggle">▼</span> 🔍 Detailed Test Results (${m.total} tests)
  </div>
  <div class="section-content" id="detail-content">
    <div class="filter-bar">
      <button class="filter-btn active" data-filter="all">All (${m.total})</button>
      <button class="filter-btn" data-filter="passed">✅ Passed (${m.passed})</button>
      ${m.failed > 0 ? `<button class="filter-btn" data-filter="failed">❌ Failed (${m.failed})</button>` : ''}
      ${m.skipped > 0 ? `<button class="filter-btn" data-filter="skipped">⏭️ Skipped (${m.skipped})</button>` : ''}
      <span style="margin-left:auto;"></span>
      <button class="filter-btn" id="btn-expand-all">Expand All</button>
      <button class="filter-btn" id="btn-collapse-all">Collapse All</button>
    </div>
    ${orderedTests.map((t) => this.renderTestCard(t)).join('')}
  </div>
</div>

<!-- ═══════ FOOTER ═══════ -->
<div style="text-align:center;padding:24px;color:var(--text-dim);font-size:12px;border-top:1px solid var(--border);margin-top:32px;">
  <p>E2E Dashboard Reporter v2 · Generated ${new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}</p>
  <p style="margin-top:4px;"><a href="index.html">📋 View Default Playwright Report</a></p>
</div>

<!-- ═══════ LIGHTBOX ═══════ -->
<div id="lightbox" class="lightbox" onclick="this.classList.remove('active')">
  <img id="lightbox-img" src="" alt="Screenshot">
</div>

<script>
${this._js()}
</script>
</body>
</html>`;
  }

  // ─── Render single test card ──────────────────────────

  private renderTestCard(t: TestEntry): string {
    const statusIcon =
      t.status === 'passed'
        ? '✅'
        : t.status === 'failed'
          ? '❌'
          : t.status === 'timedOut'
            ? '⏰'
            : '⏭️';
    const tagHtml = t.tags
      .map((tag) => `<span class="tag tag-${tag.replace('@', '')}">${tag}</span>`)
      .join('');

    // ── Group steps ──
    const groups: Record<string, CleanStep[]> = {};
    for (const s of t.steps) {
      if (!groups[s.group]) groups[s.group] = [];
      groups[s.group].push(s);
    }

    // Preferred order: Navigation → Actions → Assertions
    const groupOrder = ['🌐 Navigation', '⚙️ Actions', '🧪 Assertions'];
    const sortedGroupKeys = Object.keys(groups).sort(
      (a, b) => (groupOrder.indexOf(a) === -1 ? 99 : groupOrder.indexOf(a)) -
        (groupOrder.indexOf(b) === -1 ? 99 : groupOrder.indexOf(b)),
    );

    const stepsHtml =
      t.steps.length > 0
        ? sortedGroupKeys
          .map(
            (group) => `
          <div class="step-group">
            <div class="step-group-header">${group}</div>
            ${groups[group]
                .map(
                  (s) => `
              <div class="step-row${s.status === 'failed' ? ' step-failed' : ''}">
                <span class="step-icon" style="color:${s.status === 'passed' ? 'var(--green)' : 'var(--red)'}">${s.status === 'passed' ? '✔' : '✗'}</span>
                <span class="step-title">${this.esc(s.title)}</span>
                <span class="step-duration">(${this.fmt(s.duration)}) ${speedIcon(s.duration)}</span>
              </div>${s.error ? `\n              <div class="step-error">${this.esc(s.error)}</div>` : ''}`,
                )
                .join('')}
          </div>`,
          )
          .join('')
        : `<div class="step-group">
            <div class="step-group-header">📋 Summary</div>
            <div class="step-row">
              <span class="step-icon" style="color:${t.status === 'passed' ? 'var(--green)' : 'var(--red)'}">${t.status === 'passed' ? '✔' : '✗'}</span>
              <span class="step-title">API test — direct assertions (${t.status})</span>
              <span class="step-duration">(${this.fmt(t.duration)})</span>
            </div>
          </div>`;

    // ── Screenshots ──
    const screenshotsHtml =
      t.screenshots.length > 0
        ? `
          <div class="attachment-section">
            <div class="attachment-header">📸 Screenshots (${t.screenshots.length})</div>
            <div class="screenshot-grid">
              ${t.screenshots
          .map(
            (s) => `
                <div class="screenshot-card" onclick="openLightbox('data:image/png;base64,${s.base64}')">
                  <img src="data:image/png;base64,${s.base64}" alt="${this.esc(s.name)}" loading="lazy">
                  <div class="screenshot-label">${this.esc(s.name.replace(/^📸\s*/, ''))}</div>
                </div>`,
          )
          .join('')}
            </div>
          </div>`
        : '';

    // ── Errors ──
    const errorsHtml =
      t.errors.length > 0
        ? `<div class="error-block">${t.errors.map((e) => this.esc(e)).join('\n\n')}</div>`
        : '';

    // ── Failure API Logs ──
    const apiLogsHtml =
      t.apiLogs && t.status !== 'passed'
        ? `
          <details class="api-log-section" open>
            <summary class="api-log-header">🔌 Failure API Logs</summary>
            <pre class="api-log-content">${this.esc(t.apiLogs)}</pre>
          </details>`
        : '';

    return `
    <details class="test-card" data-status="${t.status}"${t.status === 'failed' ? ' open' : ''}>
      <summary class="test-summary">
        <span class="test-order">${t.scnNumber < 9999 ? '#' + String(t.scnNumber).padStart(3, '0') : '#' + t.orderIndex}</span>
        <span class="test-status-icon">${statusIcon}</span>
        <span class="test-title">${this.esc(t.title)}</span>
        <span class="test-meta-right">
          ${tagHtml}
          ${t.apiLogs && t.status !== 'passed' ? '<span class="badge badge-api-log">🔌 API</span>' : ''}
          ${t.screenshots.length > 0 ? `<span class="badge badge-screenshot">📸 ${t.screenshots.length}</span>` : ''}
          <span class="test-status-label" style="color:${t.status === 'passed' ? 'var(--green)' : t.status === 'failed' ? 'var(--red)' : 'var(--text-dim)'}">${t.status.toUpperCase()}</span>
          <span class="test-duration">${this.fmt(t.duration)}</span>
        </span>
      </summary>
      <div class="test-body">
        <div class="test-file-info">📄 ${this.esc(t.file)} · ${this.fmt(t.duration)} ${t.retries > 0 ? `· 🔄 Retry ${t.retries}` : ''}</div>
        ${stepsHtml}
        ${errorsHtml}
        ${apiLogsHtml}
        ${screenshotsHtml}
      </div>
    </details>`;
  }

  // ─── CSS ──────────────────────────────────────────────

  private _css(): string {
    return `
  :root {
    --bg: #0f172a; --bg-card: #1e293b; --bg-card-hover: #334155;
    --text: #f1f5f9; --text-muted: #94a3b8; --text-dim: #64748b;
    --green: #10b981; --red: #ef4444; --yellow: #f59e0b; --blue: #3b82f6;
    --purple: #8b5cf6; --cyan: #06b6d4;
    --border: #334155; --radius: 12px;
  }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Inter',system-ui,-apple-system,sans-serif; background:var(--bg); color:var(--text); line-height:1.6; padding:24px; max-width:1400px; margin:0 auto; }
  a { color:var(--cyan); text-decoration:none; }
  a:hover { text-decoration:underline; }

  .header { display:flex; align-items:center; justify-content:space-between; margin-bottom:32px; flex-wrap:wrap; gap:16px; }
  .header h1 { font-size:28px; font-weight:700; }
  .header .subtitle { color:var(--text-muted); font-size:14px; margin-top:4px; }
  .header .status-badge { font-size:16px; font-weight:600; padding:8px 20px; border-radius:9999px; display:inline-flex; align-items:center; gap:8px; }
  .header .meta { font-size:12px; color:var(--text-dim); text-align:right; }

  .cards { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:16px; margin-bottom:32px; }
  .card { background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius); padding:20px; transition:all 0.2s ease; }
  .card:hover { background:var(--bg-card-hover); transform:translateY(-2px); }
  .card .label { font-size:12px; text-transform:uppercase; letter-spacing:1px; color:var(--text-muted); margin-bottom:8px; }
  .card .value { font-size:36px; font-weight:800; line-height:1; }
  .card .sub { font-size:12px; color:var(--text-dim); margin-top:8px; }

  .section { margin-bottom:32px; }
  .section-header { font-size:18px; font-weight:700; margin-bottom:16px; display:flex; align-items:center; gap:8px; cursor:pointer; user-select:none; }
  .section-content { overflow:hidden; transition:max-height 0.35s ease,opacity 0.25s ease; max-height:500000px; opacity:1; }
  .section-content.collapsed { max-height:0!important; opacity:0; padding:0; margin:0; pointer-events:none; }
  .section-header .toggle { font-size:10px; transition:transform 0.25s ease; display:inline-block; }
  .section-header.collapsed .toggle { transform:rotate(-90deg); }

  .progress-bar { height:8px; border-radius:4px; background:var(--bg-card); overflow:hidden; display:flex; }
  .progress-bar .seg { height:100%; transition:width 0.5s ease; }
  .progress-legend { display:flex; gap:16px; margin-top:8px; font-size:12px; color:var(--text-muted); }
  .progress-legend .dot { width:8px; height:8px; border-radius:50%; display:inline-block; margin-right:4px; }

  .timeline-row { display:flex; align-items:center; gap:12px; padding:8px 0; border-bottom:1px solid var(--border); }
  .timeline-row:last-child { border-bottom:none; }
  .timeline-label { flex:0 0 360px; font-size:13px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .timeline-bar-container { flex:1; position:relative; }
  .timeline-bar { height:24px; border-radius:4px; display:flex; align-items:center; padding-left:8px; font-size:11px; font-weight:600; color:white; transition:width 0.5s ease; min-width:30px; }
  .timeline-status { flex:0 0 24px; text-align:center; }
  .timeline-duration { flex:0 0 72px; text-align:right; font-size:12px; color:var(--text-muted); font-variant-numeric:tabular-nums; }

  .data-table { width:100%; border-collapse:collapse; }
  .data-table th,.data-table td { padding:10px 14px; text-align:left; border-bottom:1px solid var(--border); }
  .data-table th { font-size:11px; text-transform:uppercase; letter-spacing:1px; color:var(--text-dim); }
  .data-table td { font-size:13px; }
  .data-table tr:hover { background:var(--bg-card-hover); }

  .tag { display:inline-block; padding:2px 10px; border-radius:9999px; font-size:11px; font-weight:600; margin-right:4px; }
  .tag-smoke { background:rgba(59,130,246,0.15); color:var(--blue); }
  .tag-regression { background:rgba(139,92,246,0.15); color:var(--purple); }
  .tag-critical { background:rgba(239,68,68,0.15); color:var(--red); }
  .tag-audit-gap { background:rgba(245,158,11,0.15); color:var(--yellow); }

  .insight-card { background:linear-gradient(135deg,#1e293b,#0f172a); border:1px solid var(--border); border-radius:var(--radius); padding:20px; margin-bottom:12px; }
  .insight-card .insight-icon { font-size:24px; margin-bottom:8px; }
  .insight-card .insight-title { font-size:14px; font-weight:700; margin-bottom:4px; }
  .insight-card .insight-text { font-size:13px; color:var(--text-muted); }

  .error-block { background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.25); border-radius:8px; padding:12px 16px; margin-top:12px; font-family:'JetBrains Mono','Fira Code',monospace; font-size:12px; color:#fca5a5; white-space:pre-wrap; word-break:break-word; max-height:200px; overflow:auto; }

  /* ─── Failure API Logs ─── */
  .api-log-section { margin-top:12px; border:1px solid rgba(139,92,246,0.25); border-radius:8px; overflow:hidden; }
  .api-log-header { cursor:pointer; padding:10px 16px; font-size:12px; font-weight:700; color:var(--purple); background:rgba(139,92,246,0.06); list-style:none; }
  .api-log-header::-webkit-details-marker { display:none; }
  .api-log-content { padding:12px 16px; font-family:'JetBrains Mono','Fira Code',monospace; font-size:11px; color:var(--text-muted); white-space:pre-wrap; word-break:break-word; max-height:320px; overflow:auto; background:rgba(139,92,246,0.03); border-top:1px solid rgba(139,92,246,0.15); margin:0; }
  .badge-api-log { background:rgba(139,92,246,0.12); color:var(--purple); }

  /* ─── Filter Bar ─── */
  .filter-bar { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:16px; padding:12px; background:var(--bg-card); border-radius:8px; }
  .filter-btn { font-size:12px; padding:6px 14px; border-radius:6px; border:1px solid var(--border); background:transparent; color:var(--text-muted); cursor:pointer; transition:all 0.2s; font-family:inherit; }
  .filter-btn:hover { background:var(--bg-card-hover); color:var(--text); }
  .filter-btn.active { background:var(--bg-card-hover); color:var(--text); border-color:var(--cyan); }

  /* ─── Test Card ─── */
  .test-card { margin-bottom:4px; border-radius:8px; border:1px solid var(--border); overflow:hidden; }
  .test-card[data-status="failed"] { border-color:rgba(239,68,68,0.35); }
  .test-summary { cursor:pointer; padding:12px 16px; display:flex; align-items:center; gap:10px; font-size:13px; transition:background 0.2s; list-style:none; background:var(--bg-card); }
  .test-summary::-webkit-details-marker { display:none; }
  .test-summary::before { content:'▶'; font-size:10px; color:var(--text-dim); transition:transform 0.25s ease; display:inline-block; flex-shrink:0; }
  .test-card[open] .test-summary::before { transform:rotate(90deg); }
  .test-summary:hover { background:var(--bg-card-hover); }
  .test-card[open] .test-summary { border-bottom:1px solid var(--border); }

  .test-order { font-size:11px; color:var(--text-dim); font-weight:700; min-width:32px; font-variant-numeric:tabular-nums; }
  .test-status-icon { flex-shrink:0; }
  .test-title { flex:1; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .test-meta-right { display:flex; align-items:center; gap:8px; flex-shrink:0; }
  .test-status-label { font-size:11px; font-weight:700; min-width:52px; text-align:center; }
  .test-duration { font-size:12px; color:var(--text-muted); font-variant-numeric:tabular-nums; min-width:52px; text-align:right; }
  .badge { font-size:10px; padding:2px 8px; border-radius:4px; background:var(--bg-card-hover); color:var(--text-dim); white-space:nowrap; }
  .badge-screenshot { background:rgba(6,182,212,0.12); color:var(--cyan); }

  .test-body { padding:16px; background:var(--bg); animation:slideDown 0.25s ease-out; }
  .test-file-info { font-size:12px; color:var(--text-dim); margin-bottom:12px; }

  /* ─── Step Groups ─── */
  .step-group { margin-bottom:12px; }
  .step-group-header { font-size:13px; font-weight:700; color:var(--text-muted); margin-bottom:6px; padding-bottom:4px; border-bottom:1px solid var(--border); }
  .step-row { display:flex; align-items:flex-start; gap:8px; padding:5px 0 5px 12px; font-size:12px; border-bottom:1px solid rgba(51,65,85,0.4); }
  .step-row:last-of-type { border-bottom:none; }
  .step-failed { background:rgba(239,68,68,0.06); border-radius:4px; }
  .step-icon { flex-shrink:0; font-weight:700; width:16px; }
  .step-title { flex:1; color:var(--text-muted); }
  .step-failed .step-title { color:var(--red); }
  .step-duration { flex-shrink:0; color:var(--text-dim); font-variant-numeric:tabular-nums; white-space:nowrap; }
  .step-error { margin:2px 0 4px 36px; font-size:11px; color:#fca5a5; font-family:'JetBrains Mono',monospace; white-space:pre-wrap; max-height:100px; overflow:auto; }

  /* ─── Screenshots ─── */
  .attachment-section { margin-top:16px; }
  .attachment-header { font-size:12px; font-weight:700; color:var(--text-muted); margin-bottom:8px; }
  .screenshot-grid { display:flex; flex-wrap:wrap; gap:10px; }
  .screenshot-card { width:220px; border-radius:8px; overflow:hidden; border:1px solid var(--border); cursor:pointer; transition:all 0.2s; background:var(--bg-card); }
  .screenshot-card:hover { border-color:var(--cyan); transform:scale(1.03); }
  .screenshot-card img { width:100%; height:140px; object-fit:cover; display:block; }
  .screenshot-label { padding:6px 8px; font-size:10px; color:var(--text-dim); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

  /* ─── Lightbox ─── */
  .lightbox { display:none; position:fixed; inset:0; z-index:99999; background:rgba(0,0,0,0.92); align-items:center; justify-content:center; cursor:zoom-out; padding:24px; }
  .lightbox.active { display:flex; }
  .lightbox img { max-width:95vw; max-height:92vh; border-radius:8px; box-shadow:0 8px 32px rgba(0,0,0,0.5); }

  @media (max-width:768px) {
    .timeline-label { flex:0 0 200px; }
    .cards { grid-template-columns:repeat(2,1fr); }
    body { padding:12px; }
    .screenshot-card { width:160px; }
    .screenshot-card img { height:100px; }
    .test-meta-right .tag,.test-meta-right .badge { display:none; }
  }

  @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
  .card,.section,.insight-card { animation:fadeIn 0.4s ease-out forwards; }
`;
  }

  // ─── JavaScript ───────────────────────────────────────

  private _js(): string {
    return `
function toggleSection(header) {
  header.classList.toggle('collapsed');
  header.nextElementSibling?.classList.toggle('collapsed');
}

function openLightbox(src) {
  var lb = document.getElementById('lightbox');
  document.getElementById('lightbox-img').src = src;
  lb.classList.add('active');
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') document.getElementById('lightbox')?.classList.remove('active');
});

// Filter buttons
document.querySelectorAll('.filter-btn[data-filter]').forEach(function(btn) {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.filter-btn[data-filter]').forEach(function(b){b.classList.remove('active')});
    btn.classList.add('active');
    var filter = btn.dataset.filter;
    document.querySelectorAll('.test-card').forEach(function(card) {
      card.style.display = (filter === 'all' || card.dataset.status === filter) ? '' : 'none';
    });
  });
});

// Expand / Collapse All
document.getElementById('btn-expand-all')?.addEventListener('click', function() {
  document.querySelectorAll('.test-card').forEach(function(d){d.open=true});
});
document.getElementById('btn-collapse-all')?.addEventListener('click', function() {
  document.querySelectorAll('.test-card').forEach(function(d){d.open=false});
});
`;
  }

  // ─── Insights ─────────────────────────────────────────

  private generateInsights(m: SuiteMetrics): string {
    const insights: string[] = [];
    if (m.passRate === 100) {
      insights.push(
        this.insightCard(
          '🎯',
          'Perfect Score',
          'All tests passed! The suite is fully green — safe to deploy.',
        ),
      );
    } else if (m.passRate >= 95) {
      insights.push(
        this.insightCard(
          '👍',
          'High Confidence',
          `${m.passRate}% pass rate. ${m.failed} test(s) failed — review before deploying.`,
        ),
      );
    } else if (m.passRate >= 80) {
      insights.push(
        this.insightCard(
          '⚠️',
          'Needs Attention',
          `${m.passRate}% pass rate is below target. ${m.failed} failures need investigation.`,
        ),
      );
    } else {
      insights.push(
        this.insightCard(
          '🚨',
          'Critical Failures',
          `Only ${m.passRate}% pass rate. ${m.failed} tests failed — deployment NOT recommended.`,
        ),
      );
    }

    const slowest = m.slowestTests[0];
    if (slowest) {
      const s = (slowest.duration / 1000).toFixed(1);
      insights.push(
        this.insightCard(
          '🐌',
          'Slowest Test',
          `"${slowest.title}" took ${s}s — ${slowest.duration > 30000 ? 'consider optimizing' : 'within acceptable range'}.`,
        ),
      );
    }

    const totalMin = (m.duration / 60000).toFixed(1);
    insights.push(
      this.insightCard(
        '⏱️',
        'Execution Time',
        `Full suite completed in ${totalMin} minutes. Avg ${this.fmt(m.avgDuration)} per test.`,
      ),
    );

    const fileCount = Object.keys(m.fileBreakdown).length;
    const tagCount = Object.keys(m.tagBreakdown).length;
    insights.push(
      this.insightCard(
        '📊',
        'Coverage',
        `${m.total} tests across ${fileCount} spec files with ${tagCount} tags. ${m.skipped > 0 ? `⚠️ ${m.skipped} skipped.` : 'No tests skipped.'}`,
      ),
    );

    const retried = this.tests.filter((t) => t.retries > 0);
    if (retried.length > 0) {
      insights.push(
        this.insightCard(
          '🔄',
          'Retries Detected',
          `${retried.length} test(s) required retries — may indicate flaky tests.`,
        ),
      );
    }
    return insights.join('');
  }

  private insightCard(icon: string, title: string, text: string): string {
    return `<div class="insight-card"><div class="insight-icon">${icon}</div><div class="insight-title">${title}</div><div class="insight-text">${this.esc(text)}</div></div>`;
  }

  // ─── Utilities ────────────────────────────────────────

  private fmt(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    const min = Math.floor(ms / 60000);
    const sec = Math.round((ms % 60000) / 1000);
    return `${min}m ${sec}s`;
  }

  private esc(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}

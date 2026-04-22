import { defineConfig, devices } from "@playwright/test";
import type { ReporterDescription } from "@playwright/test";
import path from "path";
import dotenv from "dotenv";

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, ".env.test") });

// TODO: Update baseURL to match your dev server port
const baseURL = "http://localhost:3000";
const isCI = !!process.env.CI;
const testResultsDir = "test-results";
const reportDir = "playwright-report";

// ─── Run Modes ──────────────────────────────────────────────────────────────
//
// ┌─────────────┬─────────────────────────────────────────────────────────────┐
// │   CI        │  Fully automated — lean, fast, JSON-oriented               │
// │             │  • reporters: list + json                                   │
// │             │  • screenshot: off (no screenshots, saves disk)             │
// │             │  • video: off                                               │
// │             │  • trace: off                                               │
// │             │  • artifacts: only playwright-report/results.json           │
// ├─────────────┼─────────────────────────────────────────────────────────────┤
// │   Manual    │  Developer runs locally — rich visual evidence              │
// │  (default)  │  • reporters: list + html + dashboard (auto-open)           │
// │             │  • screenshot: on (every step → feeds dashboard)            │
// │             │  • video: retain-on-failure                                 │
// │             │  • trace: retain-on-failure                                 │
// │             │  • artifacts: full HTML report + screenshots + dashboard    │
// └─────────────┴─────────────────────────────────────────────────────────────┘
//
// Override: set CI=true locally to simulate CI mode, or CI= to force manual.

// ─── Reporters ──────────────────────────────────────────────────────────────
const reporters: ReporterDescription[] = [["list"]];

if (isCI) {
    // CI: machine-readable JSON only — no heavy HTML report.
    // CI pipeline parses results.json for PR summary and pass/fail gates.
    reporters.push(
        ["json", { outputFile: `${reportDir}/results.json` }],
    );
} else {
    // Manual: rich HTML report + dashboard with inline screenshots.
    reporters.push(
        ["html", { outputFolder: reportDir, open: "never" }],
        [
            "./tests/e2e/reporters/dashboard-reporter.ts",
            { outputFolder: reportDir, openOnEnd: true },
        ],
    );
}

export default defineConfig({
    testDir: "./tests/e2e/specs",
    outputDir: testResultsDir,

    // Per-test timeout — keeps tests from hanging forever.
    // Individual actions have their own shorter timeouts below.
    timeout: 45_000,
    expect: { timeout: 10_000 },
    fullyParallel: false,
    forbidOnly: isCI,
    // Retry once locally (catches flaky networkidle / cache races).
    // CI gets 2 retries for infra-level flakiness.
    retries: isCI ? 2 : 1,
    workers: isCI ? 4 : 2,

    reporter: reporters,

    use: {
        baseURL,
        // ── CI: no artifacts at all (lean, fast, JSON-only output) ──
        // ── Manual: full evidence for dashboard reporter ──
        trace: isCI ? "off" : "retain-on-failure",
        screenshot: isCI ? "off" : "on",
        video: isCI ? "off" : "retain-on-failure",
        viewport: { width: 1280, height: 720 },
        // Action timeout — clicks, fills, etc. Fail fast if element missing.
        actionTimeout: 15_000,
        // Navigation timeout — goto(), waitForURL(). Must be < test timeout.
        navigationTimeout: 30_000,
    },

    globalSetup: "./tests/e2e/fixtures/global-setup.ts",
    globalTeardown: "./tests/e2e/fixtures/global-teardown.ts",

    projects: [
        {
            // TODO: Rename project to match your app
            name: "app-chromium",
            use: { ...devices["Desktop Chrome"], channel: "chrome" },
        },
        // TODO: Uncomment to add additional browsers
        // {
        //   name: "app-firefox",
        //   use: { ...devices["Desktop Firefox"] },
        // },
        // {
        //   name: "app-webkit",
        //   use: { ...devices["Desktop Safari"] },
        // },
    ],

    webServer: {
        // TODO: Update the command and URL for your dev server
        command: `pnpm dev --port 3000`,
        url: `${baseURL}`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        env: {
            ...process.env,
            // TODO: Add any environment variables your dev server needs
            NEXT_TELEMETRY_DISABLED: "1",
        },
    },
});

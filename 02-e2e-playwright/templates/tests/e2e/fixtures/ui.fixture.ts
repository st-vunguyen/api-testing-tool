import { test as base, expect, Page, Locator } from "@playwright/test";
import { generateRunId } from "../config";

/**
 * UI Test Fixture
 *
 * Provides pre-authenticated Page instances for UI tests using storageState.
 * Login happens ONCE in global-setup, NOT in every test.
 *
 * Usage:
 *   import { uiTest, expect } from '../fixtures/ui.fixture';
 *
 *   uiTest('my test', async ({ adminPage }) => {
 *     // Already authenticated as admin — no login needed!
 *     await adminPage.goto('/');
 *   });
 */

/** Storage state paths — must match global-setup.ts */
const STORAGE_STATE = {
    admin: "tests/e2e/.auth/admin.json",
    userA: "tests/e2e/.auth/userA.json",
    userB: "tests/e2e/.auth/userB.json",
};

/**
 * Options for screenshotStep
 */
export interface ScreenshotStepOptions {
    highlightTarget?: Locator;
    clipPadding?: number;
    fullPageWithHighlight?: boolean;
}

export interface UIFixtures {
    /** Pre-authenticated page as Admin */
    adminPage: Page;
    /** Pre-authenticated page as User A */
    userAPage: Page;
    /** Pre-authenticated page as User B */
    userBPage: Page;
    /** Unique run ID for test data isolation */
    runId: string;
    /** Create a human-readable step with smart screenshot evidence */
    screenshotStep: (
        stepName: string,
        action: (page: Page) => Promise<void>,
        page: Page,
        options?: ScreenshotStepOptions,
    ) => Promise<void>;
    /**
     * Attach API logger to a page — captures all /api/ requests and responses.
     * Logs are attached to test results ONLY when the test FAILS.
     * Purpose: quickly determine if a failure is FE rendering or API response error.
     *
     * Usage (auto-attach in beforeEach):
     *   test.beforeEach(async ({ adminPage, failureApiLogger }) => {
     *     failureApiLogger(adminPage);
     *   });
     */
    failureApiLogger: (page: Page) => void;
}

export const uiTest = base.extend<UIFixtures>({
    // ─── Pre-authenticated pages ──────────────────────────

    adminPage: async ({ browser }, use) => {
        const context = await browser.newContext({
            storageState: STORAGE_STATE.admin,
        });
        const page = await context.newPage();
        await use(page);
        await context.close();
    },

    userAPage: async ({ browser }, use) => {
        const context = await browser.newContext({
            storageState: STORAGE_STATE.userA,
        });
        const page = await context.newPage();
        await use(page);
        await context.close();
    },

    userBPage: async ({ browser }, use) => {
        const context = await browser.newContext({
            storageState: STORAGE_STATE.userB,
        });
        const page = await context.newPage();
        await use(page);
        await context.close();
    },

    // ─── Unique run ID ───────────────────────────────────

    runId: async ({ }, use) => {
        await use(generateRunId());
    },

    // ─── Screenshot per step ──────────────────────────────

    screenshotStep: async ({ }, use) => {
        const fn = async (
            stepName: string,
            action: (page: Page) => Promise<void>,
            page: Page,
            options?: ScreenshotStepOptions,
        ) => {
            await base.step(stepName, async () => {
                await action(page);

                let screenshotBuffer: Buffer;
                const target = options?.highlightTarget;
                const clipPadding = options?.clipPadding ?? 60;
                const fullPageWithHighlight =
                    options?.fullPageWithHighlight ?? false;

                if (target && (await target.count()) > 0) {
                    try {
                        await target
                            .first()
                            .scrollIntoViewIfNeeded()
                            .catch(() => { });

                        const highlightId = `pw-highlight-${Date.now()}`;
                        await page.evaluate(
                            ({ selector, id, label }) => {
                                const el = document.querySelector(selector) as HTMLElement;
                                if (!el) return;
                                el.dataset.pwOriginalOutline = el.style.outline;
                                el.dataset.pwOriginalOutlineOffset =
                                    el.style.outlineOffset;
                                el.dataset.pwOriginalPosition = el.style.position;
                                el.style.outline = "3px dashed #e11d48";
                                el.style.outlineOffset = "4px";
                                el.id = el.id || id;
                                const badge = document.createElement("div");
                                badge.id = `${id}-badge`;
                                badge.textContent = label;
                                badge.style.cssText = `
                  position: absolute; top: -28px; left: 0; z-index: 99999;
                  background: #e11d48; color: white; font-size: 11px;
                  padding: 2px 8px; border-radius: 4px; font-family: monospace;
                  white-space: nowrap; pointer-events: none;
                `;
                                const pos = getComputedStyle(el).position;
                                if (pos === "static") el.style.position = "relative";
                                el.appendChild(badge);
                            },
                            {
                                selector: await _buildCssSelector(target),
                                id: highlightId,
                                label: `✓ ${stepName.substring(0, 60)}`,
                            },
                        );

                        await page.waitForTimeout(100);

                        if (!fullPageWithHighlight) {
                            const box = await target.first().boundingBox();
                            if (box) {
                                const viewport = page.viewportSize() ?? {
                                    width: 1280,
                                    height: 720,
                                };
                                const clip = {
                                    x: Math.max(0, box.x - clipPadding),
                                    y: Math.max(0, box.y - clipPadding),
                                    width: Math.min(
                                        box.width + clipPadding * 2,
                                        viewport.width,
                                    ),
                                    height: Math.min(
                                        box.height + clipPadding * 2,
                                        viewport.height,
                                    ),
                                };
                                screenshotBuffer = await page.screenshot({ clip });
                            } else {
                                screenshotBuffer = await page.screenshot({
                                    fullPage: false,
                                });
                            }
                        } else {
                            screenshotBuffer = await page.screenshot({
                                fullPage: false,
                            });
                        }

                        await page.evaluate(
                            ({ selector, id }) => {
                                const el = document.querySelector(selector) as HTMLElement;
                                if (!el) return;
                                el.style.outline = el.dataset.pwOriginalOutline ?? "";
                                el.style.outlineOffset =
                                    el.dataset.pwOriginalOutlineOffset ?? "";
                                el.style.position =
                                    el.dataset.pwOriginalPosition ?? "";
                                delete el.dataset.pwOriginalOutline;
                                delete el.dataset.pwOriginalOutlineOffset;
                                delete el.dataset.pwOriginalPosition;
                                const badge = document.getElementById(`${id}-badge`);
                                if (badge) badge.remove();
                            },
                            {
                                selector: await _buildCssSelector(target),
                                id: highlightId,
                            },
                        );
                    } catch {
                        screenshotBuffer = await page.screenshot({ fullPage: false });
                    }
                } else {
                    screenshotBuffer = await _smartViewportScreenshot(page, stepName);
                }

                await base.info().attach(`📸 ${stepName}`, {
                    body: screenshotBuffer,
                    contentType: "image/png",
                });
            });
        };
        await use(fn);
    },

    // ─── Failure API Logger ───────────────────────────────
    // Captures API request/response logs and attaches them ONLY when test fails.
    // Helps quickly determine: FE rendering bug or API response error.

    failureApiLogger: async ({ }, use, testInfo) => {
        const allLogs: Array<{ page: Page; logs: string[] }> = [];

        const attach = (page: Page) => {
            const logs: string[] = [];
            allLogs.push({ page, logs });

            page.on("request", (req) => {
                const url = req.url();
                if (url.includes("/api/")) {
                    const method = req.method();
                    const postData = req.postData();
                    const ts = new Date().toISOString().slice(11, 23);
                    logs.push(
                        `[${ts}] → ${method} ${url}${postData ? `\n  Body: ${postData.substring(0, 500)}` : ""}`,
                    );
                }
            });

            page.on("response", async (res) => {
                const url = res.url();
                if (url.includes("/api/")) {
                    const status = res.status();
                    const ts = new Date().toISOString().slice(11, 23);
                    let body = "";
                    try {
                        body = (await res.text()).substring(0, 1000);
                    } catch {
                        body = "<unable to read body>";
                    }
                    const statusLabel = status >= 400 ? `❌ ${status}` : `✅ ${status}`;
                    logs.push(`[${ts}] ← ${statusLabel} ${url}\n  Response: ${body}`);
                }
            });
        };

        await use(attach);

        // After test completes: attach logs ONLY if test failed
        if (testInfo.status !== testInfo.expectedStatus) {
            const combinedLogs = allLogs
                .flatMap(({ logs }) => logs)
                .join("\n\n───────────────\n\n");
            if (combinedLogs.length > 0) {
                await testInfo.attach("🔌 API Logs (failure debug)", {
                    body: combinedLogs,
                    contentType: "text/plain",
                });
            }
        }
    },
});

export { expect };

// ════════════════════════════════════════════════════════════
// Helper functions for smart screenshots
// ════════════════════════════════════════════════════════════

async function _buildCssSelector(locator: Locator): Promise<string> {
    const uid = `pw-sel-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    try {
        await locator.first().evaluate((el, id) => {
            el.setAttribute("data-pw-highlight", id);
        }, uid);
        return `[data-pw-highlight="${uid}"]`;
    } catch {
        return "body";
    }
}

async function _smartViewportScreenshot(
    page: Page,
    stepName: string,
): Promise<Buffer> {
    const interestingSelectors = [
        '[role="alert"]',
        '[class*="toast"]',
        '[class*="notification"]',
        '[class*="success"]',
        '[role="dialog"]',
        ".fixed.inset-0.z-50",
        "main h1",
        "main h2",
        "[data-testid]",
    ];

    for (const sel of interestingSelectors) {
        const el = page.locator(sel).first();
        if (await el.isVisible().catch(() => false)) {
            const box = await el.boundingBox().catch(() => null);
            if (box && box.width > 10 && box.height > 10) {
                await _addAnnotationBadge(page, stepName);
                const viewport = page.viewportSize() ?? {
                    width: 1280,
                    height: 720,
                };
                const pad = 40;
                const clip = {
                    x: Math.max(0, box.x - pad),
                    y: Math.max(0, box.y - pad),
                    width: Math.min(box.width + pad * 2, viewport.width),
                    height: Math.min(box.height + pad * 2, viewport.height),
                };
                const buf = await page.screenshot({ clip });
                await _removeAnnotationBadge(page);
                return buf;
            }
        }
    }

    await _addAnnotationBadge(page, stepName);
    const buf = await page.screenshot({ fullPage: false });
    await _removeAnnotationBadge(page);
    return buf;
}

async function _addAnnotationBadge(
    page: Page,
    stepName: string,
): Promise<void> {
    await page.evaluate((label) => {
        const existing = document.getElementById("pw-step-badge");
        if (existing) existing.remove();
        const badge = document.createElement("div");
        badge.id = "pw-step-badge";
        badge.textContent = `✓ ${label}`;
        badge.style.cssText = `
      position: fixed; top: 8px; right: 8px; z-index: 999999;
      background: rgba(16, 185, 129, 0.92); color: white;
      font-size: 12px; padding: 4px 12px; border-radius: 6px;
      font-family: system-ui, sans-serif; font-weight: 600;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      max-width: 400px; overflow: hidden; text-overflow: ellipsis;
      white-space: nowrap; pointer-events: none;
    `;
        document.body.appendChild(badge);
    }, stepName.substring(0, 80));
    await page.waitForTimeout(50);
}

async function _removeAnnotationBadge(page: Page): Promise<void> {
    await page.evaluate(() => {
        const badge = document.getElementById("pw-step-badge");
        if (badge) badge.remove();
    });
}

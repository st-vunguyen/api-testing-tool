import { Page } from "@playwright/test";

/**
 * Wait for page to be ready after navigation or action.
 *
 * **Why not `waitForLoadState('networkidle')`?**
 * SSR frameworks (Next.js, Nuxt, SvelteKit) keep RSC/HMR connections open
 * indefinitely, so `networkidle` (= 0 network requests for 500 ms) may
 * NEVER resolve → test hangs until the test timeout.
 *
 * This helper instead waits for:
 *   1. `domcontentloaded` — HTML parsed, all sync scripts executed
 *   2. No pending fetch/XHR for a short settle window (200 ms)
 *
 * It **always** resolves within `timeoutMs` (default 10 s),
 * so tests fail fast instead of hanging.
 */
export async function waitForPageReady(
    page: Page,
    timeoutMs = 10_000,
): Promise<void> {
    // 1. DOM ready — fast, always resolves
    await page.waitForLoadState("domcontentloaded", { timeout: timeoutMs });

    // 2. Settle: wait until no new network requests for 200 ms,
    //    but give up after `timeoutMs` so we never hang.
    await Promise.race([
        settleNetwork(page, 200),
        page.waitForTimeout(timeoutMs),
    ]);
}

/**
 * Resolves when no new network request has been seen for `quietMs`.
 * Used internally — do NOT await this without a timeout guard.
 */
async function settleNetwork(page: Page, quietMs: number): Promise<void> {
    return new Promise<void>((resolve) => {
        let timer: ReturnType<typeof setTimeout> | null = null;

        const reset = () => {
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => {
                page.removeListener("request", reset);
                resolve();
            }, quietMs);
        };

        page.on("request", reset);
        reset(); // start the first timer immediately
    });
}

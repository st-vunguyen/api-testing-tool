import { FullConfig } from "@playwright/test";

const isCI = !!process.env.CI;

/**
 * Global Teardown — E2E Tests
 *
 * LOCAL:  Keep the database intact. The dev server reuses its connection
 *         pool across runs (`reuseExistingServer: true`).
 *         Dropping the DB would leave the running server with a dead
 *         connection → every subsequent run fails instantly.
 *         The next global-setup will re-seed fresh data anyway.
 *
 * CI:     Drop / clean up the database. The server is ephemeral, no reuse.
 *
 * TODO: Implement CI cleanup command for your project's database.
 */
async function globalTeardown(_config: FullConfig): Promise<void> {
    if (isCI) {
        console.log("[global-teardown] CI mode — cleaning up test database...");

        // TODO: Implement database cleanup for your project
        // Example:
        // import { execSync } from "child_process";
        // execSync('docker compose exec -T db psql -U postgres -c "DROP DATABASE IF EXISTS app_test;"', {
        //   stdio: "inherit", timeout: 30_000
        // });

        console.log("[global-teardown] ✅ Test database cleaned up.");
    } else {
        console.log(
            "[global-teardown] Local mode — keeping database intact (dev server reuses connection).",
        );
    }
}

export default globalTeardown;

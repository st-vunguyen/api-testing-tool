import { chromium, FullConfig } from "@playwright/test";
import { rmSync, existsSync, mkdirSync } from "fs";
import path from "path";
import { config } from "../config";

/**
 * Global Setup — E2E Tests
 *
 * Flow:
 *   1. Clean previous run artifacts
 *   2. Set up database (TODO: adapt to your DB/ORM)
 *   3. Kill stale dev server if needed
 *   4. Register non-admin test users
 *   5. Login each role and save storageState
 *
 * TODO: Customize database setup, user registration, and login flows
 *       to match your project's authentication system.
 */

const ARTIFACT_DIRS = [
    "test-results",
    "playwright-report",
    "blob-report",
    "tests/e2e/.auth",
] as const;

const AUTH_DIR = "tests/e2e/.auth";

interface RoleCredentials {
    name: string;
    email: string;
    password: string;
    storageStatePath: string;
}

const roles: RoleCredentials[] = [
    {
        name: "admin",
        email: config.credentials.admin.email,
        password: config.credentials.admin.password,
        storageStatePath: `${AUTH_DIR}/admin.json`,
    },
    {
        name: "userA",
        email: config.credentials.userA.email,
        password: config.credentials.userA.password,
        storageStatePath: `${AUTH_DIR}/userA.json`,
    },
    {
        name: "userB",
        email: config.credentials.userB.email,
        password: config.credentials.userB.password,
        storageStatePath: `${AUTH_DIR}/userB.json`,
    },
];

// ── Step 0: Clean previous run ────────────────────────────

function cleanPreviousRun(fullConfig: FullConfig): void {
    for (const relativeDir of ARTIFACT_DIRS) {
        const absoluteDir = path.resolve(fullConfig.rootDir, relativeDir);
        if (!existsSync(absoluteDir)) {
            continue;
        }

        console.log(`[global-setup] 🧹 Cleaning ${relativeDir}/...`);
        rmSync(absoluteDir, { recursive: true, force: true });
        console.log(`[global-setup] ✅ ${relativeDir}/ removed`);
    }

    const authDir = path.resolve(fullConfig.rootDir, AUTH_DIR);
    mkdirSync(authDir, { recursive: true });
    console.log(`[global-setup] ✅ Fresh ${AUTH_DIR}/ ready`);
}

// ── Step 1–3: Database setup ──────────────────────────────

/**
 * TODO: Implement database setup for your project.
 *
 * Common patterns:
 * - Docker: `docker compose exec db psql -c "TRUNCATE ..."`
 * - Prisma: `prisma migrate deploy && prisma db seed`
 * - Sequelize: `npx sequelize-cli db:migrate && db:seed:all`
 * - Raw SQL: Connect and run migration scripts
 *
 * Key principles:
 * - TRUNCATE instead of DROP in local mode (preserves connection pool)
 * - Always re-seed after truncate for clean state
 * - Use execSync with timeout and error handling
 */
function setupDatabase(): void {
    console.log("[global-setup] Setting up database...");

    // Example (commented out — adapt for your project):
    //
    // import { execSync } from "child_process";
    //
    // // Create test database
    // execSync('docker compose exec -T db psql -U postgres -c "CREATE DATABASE IF NOT EXISTS app_test;"', {
    //   stdio: "inherit", timeout: 60_000
    // });
    //
    // // Run migrations
    // execSync("DATABASE_URL=... pnpm exec prisma migrate deploy", {
    //   stdio: "inherit", timeout: 60_000
    // });
    //
    // // Seed base data
    // execSync("DATABASE_URL=... pnpm exec prisma db seed", {
    //   stdio: "inherit", timeout: 60_000
    // });

    console.log("[global-setup] ✅ Database setup complete (or skipped — implement setupDatabase())");
}

// ── Step 3.5: Kill stale dev server ───────────────────────

async function killStaleDevServer(baseURL: string): Promise<void> {
    try {
        const res = await fetch(`${baseURL}`, {
            signal: AbortSignal.timeout(5_000),
        });
        if (res.ok) {
            console.log("[global-setup] ✅ Existing dev server is healthy, reusing.");
            return;
        }
        if (res.status >= 500) {
            console.warn(
                `[global-setup] ⚠️ Dev server returned ${res.status} — may need restart.`,
            );
            // TODO: Optionally kill the stale server process
        }
    } catch {
        console.log("[global-setup] No existing dev server detected (will start fresh).");
    }
}

// ── Step 4: Register users ────────────────────────────────

/**
 * Register non-admin test users via API.
 * TODO: Adapt the registration endpoint and payload to your project.
 */
async function registerUsers(baseURL: string): Promise<void> {
    const browser = await chromium.launch();
    const ctx = await browser.newContext({ baseURL });

    for (const role of roles) {
        if (role.name === "admin") continue; // admin is seeded by DB setup
        try {
            const res = await ctx.request.post(config.api.register, {
                data: {
                    name: role.name === "userA" ? config.credentials.userA.name : config.credentials.userB.name,
                    email: role.email,
                    password: role.password,
                    // TODO: Add any additional required fields (e.g., confirmPassword)
                },
            });
            const status = res.status();
            if (status === 201) {
                console.log(`[global-setup] Registered ${role.name}`);
            } else if ([400, 409, 422].includes(status)) {
                console.log(`[global-setup] ${role.name} already exists (${status})`);
            } else {
                console.warn(`[global-setup] Unexpected status ${status} registering ${role.name}`);
            }
        } catch (e) {
            console.warn(`[global-setup] Could not register ${role.name}: ${e}`);
        }
    }
    await browser.close();
}

// ── Step 5: Login and save storageState ───────────────────

/**
 * Login via browser and save storageState for reuse across tests.
 * TODO: Adapt selectors and login flow to your project's login page.
 */
async function loginAndSaveState(
    baseURL: string,
    creds: RoleCredentials,
): Promise<void> {
    const browser = await chromium.launch();
    const context = await browser.newContext({ baseURL });
    const page = await context.newPage();

    try {
        console.log(`[global-setup] Logging in as ${creds.name}...`);
        await page.goto(config.routes.login);
        await page.waitForLoadState("domcontentloaded");

        // TODO: Update selectors to match your login form
        await page.locator('input[name="email"], input[type="email"]').fill(creds.email);
        await page.locator('input[name="password"], input[type="password"]').fill(creds.password);
        await page.locator('button[type="submit"]').click({ force: true });

        // Wait for redirect away from login page
        // TODO: Update the URL pattern to match your post-login redirect
        await page.waitForURL(/^(?!.*login)/, { timeout: 30_000 });
        await page.waitForLoadState("domcontentloaded", { timeout: 10_000 });

        await context.storageState({ path: creds.storageStatePath });
        console.log(`[global-setup] ✅ Saved storageState for ${creds.name} → ${creds.storageStatePath}`);
    } catch (error) {
        const currentUrl = page.url();
        console.error(`[global-setup] ❌ Failed to login as ${creds.name}. URL: ${currentUrl}`);
        try {
            const pageText = await page.locator("body").innerText({ timeout: 5_000 });
            console.error(`[global-setup] Page content: ${pageText.slice(0, 500)}`);
        } catch {
            /* ignore */
        }
        throw error;
    } finally {
        await browser.close();
    }
}

// ── Main ──────────────────────────────────────────────────

async function globalSetup(fullConfig: FullConfig): Promise<void> {
    const baseURL = config.baseUrl;
    console.log("[global-setup] Starting E2E setup...");

    // Step 0: Clean previous run artifacts
    cleanPreviousRun(fullConfig);

    // Step 1-3: Database setup
    setupDatabase();

    // Step 3.5: Kill stale dev server if needed
    await killStaleDevServer(baseURL);

    // Step 4: Register non-admin users
    await registerUsers(baseURL);

    // Step 5: Login each role
    for (const role of roles) {
        await loginAndSaveState(baseURL, role);
    }

    console.log("[global-setup] ✅ All setup complete.");
}

export default globalSetup;

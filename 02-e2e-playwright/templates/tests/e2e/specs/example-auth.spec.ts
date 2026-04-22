import { expect } from "@playwright/test";
import { uiTest as test } from "../fixtures/ui.fixture";
import { config } from "../config";
import { LoginPage } from "../pages";
import { waitForPageReady } from "../helpers/wait-helpers";

/**
 * Example Auth Login — UI E2E Spec
 *
 * Demonstrates all framework patterns:
 * - uiTest fixture with pre-authenticated pages
 * - screenshotStep for visual evidence
 * - config-driven credentials and routes
 * - Page Object Model usage
 * - Tags for suite slicing (@smoke, @critical, @regression)
 * - SCN-### IDs for traceability
 *
 * TODO: Replace with your project's actual login test scenarios.
 */

test.describe("Login — Happy Path", { tag: ["@smoke", "@critical"] }, () => {
    test("SCN-001: Login with valid credentials via UI", async ({
        page,
        screenshotStep,
    }) => {
        await screenshotStep(
            "User navigates to login page",
            async (p) => {
                await p.goto(config.routes.login);
                await waitForPageReady(p);
            },
            page,
        );

        await screenshotStep(
            "User fills in email address",
            async (p) => {
                await p
                    .locator('input[name="email"]')
                    .fill(config.credentials.admin.email);
            },
            page,
            { highlightTarget: page.locator('input[name="email"]') },
        );

        await screenshotStep(
            "User fills in password",
            async (p) => {
                await p
                    .locator('input[name="password"]')
                    .fill(config.credentials.admin.password);
            },
            page,
            { highlightTarget: page.locator('input[name="password"]') },
        );

        await screenshotStep(
            'User clicks "Sign in" button',
            async (p) => {
                const submitBtn = p.locator('button[type="submit"]');
                await expect(submitBtn).toBeEnabled();
                await submitBtn.click();
            },
            page,
            { highlightTarget: page.locator('button[type="submit"]') },
        );

        await screenshotStep(
            "Login successful — user redirected to dashboard",
            async (p) => {
                // TODO: Update URL pattern to match your post-login redirect
                await p.waitForURL(/^(?!.*login)/, { timeout: config.timeouts.long });
                await waitForPageReady(p);
                expect(p.url()).not.toContain("/login");
            },
            page,
        );
    });
});

test.describe("Login — Negative", { tag: ["@critical"] }, () => {
    test("SCN-002: Login — wrong password shows error", async ({
        page,
        screenshotStep,
    }) => {
        await screenshotStep(
            "User navigates to login page",
            async (p) => {
                await p.goto(config.routes.login);
                await waitForPageReady(p);
            },
            page,
        );

        await screenshotStep(
            "User enters valid email but wrong password",
            async (p) => {
                await p
                    .locator('input[name="email"]')
                    .fill(config.credentials.admin.email);
                await p.locator('input[name="password"]').fill("WrongPassword!1");
            },
            page,
            { fullPageWithHighlight: true, highlightTarget: page.locator("form") },
        );

        await screenshotStep(
            "User clicks Sign in",
            async (p) => {
                await p.locator('button[type="submit"]').click();
                await p.waitForTimeout(3000);
            },
            page,
            { highlightTarget: page.locator('button[type="submit"]') },
        );

        await screenshotStep(
            "Error message displayed — invalid credentials",
            async (p) => {
                // TODO: Update error selector to match your error display pattern
                const errorMsg = p.locator('.text-destructive, [role="alert"]');
                const hasError = await errorMsg
                    .first()
                    .isVisible({ timeout: 5000 })
                    .catch(() => false);
                const stillOnLogin = p.url().includes("/login");
                expect(
                    hasError || stillOnLogin,
                    "Should show error or remain on login page",
                ).toBeTruthy();
            },
            page,
        );
    });
});

test.describe("Session Management", { tag: ["@regression"] }, () => {
    test("SCN-003: Session persists across page navigation", async ({
        page,
        screenshotStep,
    }) => {
        const loginPage = new LoginPage(page);

        await screenshotStep(
            "User logs in with admin credentials",
            async () => {
                await loginPage.navigate();
                await loginPage.login(
                    config.credentials.admin.email,
                    config.credentials.admin.password,
                );
            },
            page,
        );

        await screenshotStep(
            "User navigates to home page",
            async (p) => {
                await p.goto("/");
                await waitForPageReady(p);
            },
            page,
        );

        await screenshotStep(
            "Session persists — user is still authenticated",
            async (p) => {
                // TODO: Verify authentication indicator (user menu, avatar, etc.)
                expect(p.url()).not.toContain("/login");
            },
            page,
        );
    });
});

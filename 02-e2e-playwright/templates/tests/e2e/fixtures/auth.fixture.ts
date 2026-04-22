import { test as base, expect, APIRequestContext } from "@playwright/test";
import { config, generateRunId } from "../config";

/**
 * Auth Fixture
 *
 * Provides pre-authenticated API request contexts for each role.
 * TODO: Adapt the signIn() function to your project's authentication mechanism
 *       (e.g., NextAuth, JWT, session cookie, OAuth).
 */

export interface AuthContexts {
    adminApi: APIRequestContext;
    userAApi: APIRequestContext;
    userBApi: APIRequestContext;
    adminCookies: string;
    userACookies: string;
    userBCookies: string;
}

/**
 * Sign in via API and return session cookie.
 * TODO: Adapt to your project's auth flow.
 *
 * Examples:
 * - NextAuth: fetch CSRF token, then POST to credentials callback
 * - JWT: POST to /api/auth/login, extract token from response
 * - Session: POST to /api/login, cookies are set automatically
 */
async function signIn(
    request: APIRequestContext,
    email: string,
    password: string,
): Promise<string> {
    // Example: NextAuth credentials flow
    const csrfRes = await request.get(config.api.csrf);
    const csrfBody = await csrfRes.json();
    const csrfToken = csrfBody.csrfToken as string;

    const signInRes = await request.post(config.api.login, {
        form: {
            email,
            password,
            csrfToken,
            json: "true",
        },
    });

    const setCookieHeader = signInRes.headers()["set-cookie"] ?? "";
    return setCookieHeader;
}

/** Register a new user via API. */
export async function registerUser(
    request: APIRequestContext,
    data: { name: string; email: string; password: string },
): Promise<{ id: string; email: string; name: string }> {
    const res = await request.post(config.api.register, {
        data: {
            name: data.name,
            email: data.email,
            password: data.password,
            // TODO: Add any additional required fields (e.g., confirmPassword)
        },
    });
    const body = await res.json();
    const user = body?.data?.user ?? body?.user ?? body;
    return user;
}

/** Ensure a user exists by attempting registration (ignores duplicate errors). */
async function ensureUserExists(
    request: APIRequestContext,
    data: { name: string; email: string; password: string },
): Promise<void> {
    const res = await request.post(config.api.register, {
        data: {
            name: data.name,
            email: data.email,
            password: data.password,
        },
    });
    if (
        res.status() !== 201 &&
        res.status() !== 400 &&
        res.status() !== 409 &&
        res.status() !== 422
    ) {
        console.warn(
            `[auth.fixture] ensureUserExists ${data.email}: unexpected status ${res.status()}`,
        );
    }
}

/**
 * Extended test fixture that provides authenticated API contexts.
 */
export const authTest = base.extend<{
    runId: string;
    adminApi: APIRequestContext;
    userAApi: APIRequestContext;
    userBApi: APIRequestContext;
}>({
    runId: async ({ }, use) => {
        await use(generateRunId());
    },

    adminApi: async ({ playwright }, use) => {
        const ctx = await playwright.request.newContext({
            baseURL: config.baseUrl,
        });
        await signIn(
            ctx,
            config.credentials.admin.email,
            config.credentials.admin.password,
        );
        await use(ctx);
        await ctx.dispose();
    },

    userAApi: async ({ playwright }, use) => {
        const ctx = await playwright.request.newContext({
            baseURL: config.baseUrl,
        });
        await ensureUserExists(ctx, config.credentials.userA);
        await signIn(
            ctx,
            config.credentials.userA.email,
            config.credentials.userA.password,
        );
        await use(ctx);
        await ctx.dispose();
    },

    userBApi: async ({ playwright }, use) => {
        const ctx = await playwright.request.newContext({
            baseURL: config.baseUrl,
        });
        await ensureUserExists(ctx, config.credentials.userB);
        await signIn(
            ctx,
            config.credentials.userB.email,
            config.credentials.userB.password,
        );
        await use(ctx);
        await ctx.dispose();
    },
});

export { expect };

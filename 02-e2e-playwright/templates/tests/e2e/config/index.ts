/**
 * E2E Test Configuration
 *
 * Environment-specific settings for the E2E test suite.
 * Values are read from environment variables with sensible defaults for local dev.
 *
 * TODO: Customize credentials, routes, and API endpoints for your project.
 */

export const config = {
    baseUrl: process.env.BASE_URL || "http://localhost:3000",

    /**
     * Test user credentials.
     * TODO: Update roles, emails, and passwords to match your project's auth system.
     * Store secrets in `.env.test` and reference via process.env.
     */
    credentials: {
        admin: {
            name: process.env.ADMIN_NAME || "Admin User",
            email: process.env.ADMIN_EMAIL || "admin@example.com",
            password: process.env.ADMIN_PASSWORD || "Admin@123!",
        },
        userA: {
            name: process.env.USER_A_NAME || "User A",
            email: process.env.USER_A_EMAIL || "usera@example.com",
            password: process.env.USER_A_PASSWORD || "UserA@123!",
        },
        userB: {
            name: process.env.USER_B_NAME || "User B",
            email: process.env.USER_B_EMAIL || "userb@example.com",
            password: process.env.USER_B_PASSWORD || "UserB@123!",
        },
    },

    /**
     * Application routes used in tests.
     * TODO: Update to match your project's route structure.
     */
    routes: {
        home: "/",
        login: "/login",
        register: "/register",
        dashboard: "/dashboard",
        // TODO: Add project-specific routes
        // adminDashboard: "/admin",
        // adminUsers: "/admin/users",
    },

    /**
     * API endpoints used in tests.
     * TODO: Update to match your project's API structure.
     */
    api: {
        login: "/api/auth/login",
        register: "/api/auth/register",
        session: "/api/auth/session",
        csrf: "/api/auth/csrf",
        // TODO: Add project-specific API endpoints
        // users: "/api/users",
        // items: "/api/items",
    },

    /** Standard timeouts — adjust based on your app's performance profile. */
    timeouts: {
        short: 5_000,
        medium: 10_000,
        long: 30_000,
        navigation: 15_000,
    },
};

/** Generate a unique run identifier for test data isolation. */
export function generateRunId(): string {
    return Date.now().toString(36);
}

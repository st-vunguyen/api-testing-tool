import { BasePage } from "../core";
import { Page } from "@playwright/test";

/**
 * Example Login Page Object
 *
 * TODO: Update selectors to match your project's login page.
 * Use semantic locators (getByRole, getByLabel) when possible.
 */
export class LoginPage extends BasePage {
    constructor(page: Page) {
        super(page, "/login", "Login Page"); // TODO: Update path

        // TODO: Update selectors to match your login form
        this.registerElement(
            "Email",
            'input[name="email"], input[type="email"]',
        );
        this.registerElement(
            "Password",
            'input[name="password"], input[type="password"]',
        );
        this.registerElement("Submit", 'button[type="submit"]');
        this.registerElement(
            "Error Message",
            '[role="alert"], .error-message, .text-red-500',
        );
    }

    async login(email: string, password: string): Promise<void> {
        await this.fill("Email", email);
        await this.fill("Password", password);
        await this.click("Submit");
        // TODO: Update URL pattern to match your post-login redirect
        await this.page.waitForURL(/^(?!.*login)/, { timeout: 30_000 });
        await this.page.waitForLoadState("networkidle", { timeout: 15_000 });
    }
}

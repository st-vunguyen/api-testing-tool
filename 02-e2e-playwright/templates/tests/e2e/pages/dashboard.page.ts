import { BasePage } from "../core";
import { Page } from "@playwright/test";

/**
 * Example Dashboard Page Object
 *
 * TODO: Replace with your project's main authenticated page.
 */
export class DashboardPage extends BasePage {
    constructor(page: Page) {
        super(page, "/dashboard", "Dashboard Page"); // TODO: Update path

        // TODO: Register elements specific to your dashboard
        this.registerElement("Page Title", "h1");
        this.registerElement("User Menu", '[data-testid="user-menu"]');
        this.registerElement("Navigation", "nav");
    }
}

import { Page, Locator, expect } from "@playwright/test";

/**
 * BaseComponent — Reusable UI component base class.
 *
 * Components are self-contained UI elements that can be used across pages.
 * Each component has its own root locator and internal elements.
 */
export abstract class BaseComponent {
    protected page: Page;
    protected rootSelector: string;
    protected name: string;
    protected root: Locator;
    protected elements: Map<string, string> = new Map();

    constructor(page: Page, rootSelector: string, name: string) {
        this.page = page;
        this.rootSelector = rootSelector;
        this.name = name;
        this.root = page.locator(rootSelector);
    }

    // ── Element Registration ──────────────────────────

    protected registerElement(name: string, selector: string): void {
        this.elements.set(name, selector);
    }

    protected getElement(name: string): Locator {
        const selector = this.elements.get(name);
        if (!selector) {
            throw new Error(`Element "${name}" not registered in ${this.name}`);
        }
        return this.root.locator(selector);
    }

    getRoot(): Locator {
        return this.root;
    }

    nth(index: number): BaseComponent {
        this.root = this.page.locator(this.rootSelector).nth(index);
        return this;
    }

    first(): BaseComponent {
        this.root = this.page.locator(this.rootSelector).first();
        return this;
    }

    last(): BaseComponent {
        this.root = this.page.locator(this.rootSelector).last();
        return this;
    }

    // ── Visibility & State ────────────────────────────

    async isVisible(): Promise<boolean> {
        return await this.root.first().isVisible();
    }

    async waitForVisible(timeout = 10_000): Promise<void> {
        await this.root.first().waitFor({ state: "visible", timeout });
    }

    async waitForHidden(timeout = 10_000): Promise<void> {
        await this.root.first().waitFor({ state: "hidden", timeout });
    }

    async count(): Promise<number> {
        return await this.root.count();
    }

    // ── Actions ───────────────────────────────────────

    async click(options?: { force?: boolean }): Promise<void> {
        await this.root.first().click(options);
    }

    async clickElement(
        name: string,
        options?: { force?: boolean },
    ): Promise<void> {
        await this.getElement(name).first().click(options);
    }

    async fill(name: string, value: string): Promise<void> {
        await this.getElement(name).first().fill(value);
    }

    async hover(): Promise<void> {
        await this.root.first().hover();
    }

    // ── Getters ───────────────────────────────────────

    async getText(name: string): Promise<string> {
        return (await this.getElement(name).first().textContent()) || "";
    }

    async getRootText(): Promise<string> {
        return (await this.root.first().textContent()) || "";
    }

    async getValue(name: string): Promise<string> {
        return await this.getElement(name).first().inputValue();
    }

    async getAttribute(
        name: string,
        attribute: string,
    ): Promise<string | null> {
        return await this.getElement(name).first().getAttribute(attribute);
    }

    // ── Assertions ────────────────────────────────────

    async shouldBeVisible(): Promise<void> {
        await expect(this.root.first()).toBeVisible();
    }

    async shouldBeHidden(): Promise<void> {
        await expect(this.root.first()).toBeHidden();
    }

    async shouldContain(name: string, text: string | RegExp): Promise<void> {
        await expect(this.getElement(name).first()).toContainText(text);
    }

    async shouldContainText(text: string | RegExp): Promise<void> {
        await expect(this.root.first()).toContainText(text);
    }

    async shouldHaveCount(count: number): Promise<void> {
        await expect(this.root).toHaveCount(count);
    }

    // ── Utilities ─────────────────────────────────────

    async scrollIntoView(): Promise<void> {
        await this.root.first().scrollIntoViewIfNeeded();
    }

    async highlight(): Promise<void> {
        await this.root.first().evaluate((el) => {
            el.style.border = "3px solid red";
            el.style.backgroundColor = "rgba(255, 0, 0, 0.1)";
        });
    }
}

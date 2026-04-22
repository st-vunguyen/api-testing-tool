import { mkdirSync } from "fs";
import { Page, Locator, expect } from "@playwright/test";

/**
 * BasePage — Generic page object base class.
 *
 * Features:
 * - URL pattern matching
 * - Dynamic element registration
 * - Common page actions (navigate, wait, scroll)
 * - Screenshot and assertions
 */
export abstract class BasePage {
  protected page: Page;
  protected path: string;
  protected name: string;
  protected elements: Map<string, string> = new Map();

  constructor(page: Page, path: string, name: string) {
    this.page = page;
    this.path = path;
    this.name = name;
  }

  // ── Element Registration ──────────────────────────

  protected registerElement(name: string, selector: string): void {
    this.elements.set(name, selector);
  }

  public getElement(name: string): Locator {
    const selector = this.elements.get(name);
    if (!selector)
      throw new Error(`Element "${name}" not registered in ${this.name}`);
    return this.page.locator(selector);
  }

  protected getSelector(name: string): string {
    const selector = this.elements.get(name);
    if (!selector)
      throw new Error(`Element "${name}" not registered in ${this.name}`);
    return selector;
  }

  // ── Navigation ────────────────────────────────────

  async navigate(): Promise<void> {
    await this.page.goto(this.path);
    await this.waitForPageLoad();
  }

  async navigateTo(url: string): Promise<void> {
    await this.page.goto(url);
  }

  async goBack(): Promise<void> {
    await this.page.goBack();
  }

  async reload(): Promise<void> {
    await this.page.reload();
    await this.waitForPageLoad();
  }

  async isOnPage(): Promise<boolean> {
    return this.page.url().includes(this.path);
  }

  // ── Wait Methods ──────────────────────────────────

  async waitForPageLoad(timeout = 30_000): Promise<void> {
    await this.page.waitForLoadState("networkidle", { timeout });
  }

  async waitForElement(name: string, timeout = 10_000): Promise<void> {
    await this.getElement(name)
      .first()
      .waitFor({ state: "visible", timeout });
  }

  async waitForElementHidden(name: string, timeout = 10_000): Promise<void> {
    await this.getElement(name)
      .first()
      .waitFor({ state: "hidden", timeout });
  }

  async waitForUrl(
    pattern: string | RegExp,
    timeout = 10_000,
  ): Promise<void> {
    await this.page.waitForURL(pattern, { timeout });
  }

  // ── Actions ───────────────────────────────────────

  async click(
    name: string,
    options?: { force?: boolean; timeout?: number },
  ): Promise<void> {
    await this.getElement(name).first().click(options);
  }

  async fill(name: string, value: string): Promise<void> {
    await this.getElement(name).first().fill(value);
  }

  async type(name: string, value: string, delay = 50): Promise<void> {
    await this.getElement(name).first().pressSequentially(value, { delay });
  }

  async clear(name: string): Promise<void> {
    await this.getElement(name).first().fill("");
  }

  async select(name: string, value: string): Promise<void> {
    await this.getElement(name).first().selectOption(value);
  }

  async check(name: string): Promise<void> {
    await this.getElement(name).first().check();
  }

  async uncheck(name: string): Promise<void> {
    await this.getElement(name).first().uncheck();
  }

  async hover(name: string): Promise<void> {
    await this.getElement(name).first().hover();
  }

  async press(key: string): Promise<void> {
    await this.page.keyboard.press(key);
  }

  async uploadFile(name: string, filePath: string): Promise<void> {
    await this.getElement(name).first().setInputFiles(filePath);
  }

  // ── Getters ───────────────────────────────────────

  async getText(name: string): Promise<string> {
    return (await this.getElement(name).first().textContent()) || "";
  }

  async getValue(name: string): Promise<string> {
    return await this.getElement(name).first().inputValue();
  }

  async getCount(name: string): Promise<number> {
    return await this.getElement(name).count();
  }

  async isVisible(name: string): Promise<boolean> {
    return await this.getElement(name).first().isVisible();
  }

  async isEnabled(name: string): Promise<boolean> {
    return await this.getElement(name).first().isEnabled();
  }

  // ── Assertions ────────────────────────────────────

  async shouldBeVisible(name: string, message?: string): Promise<void> {
    await expect(this.getElement(name).first(), message).toBeVisible();
  }

  async shouldBeHidden(name: string, message?: string): Promise<void> {
    await expect(this.getElement(name).first(), message).toBeHidden();
  }

  async shouldContain(name: string, text: string | RegExp): Promise<void> {
    await expect(this.getElement(name).first()).toContainText(text);
  }

  async shouldHaveText(name: string, text: string | RegExp): Promise<void> {
    await expect(this.getElement(name).first()).toHaveText(text);
  }

  async shouldBeEnabled(name: string): Promise<void> {
    await expect(this.getElement(name).first()).toBeEnabled();
  }

  async shouldBeDisabled(name: string): Promise<void> {
    await expect(this.getElement(name).first()).toBeDisabled();
  }

  async shouldSee(text: string): Promise<void> {
    await expect(this.page.getByText(text).first()).toBeVisible();
  }

  async shouldHaveUrl(pattern: string | RegExp): Promise<void> {
    await expect(this.page).toHaveURL(pattern);
  }

  // ── Utilities ─────────────────────────────────────

  async screenshot(name?: string): Promise<Buffer> {
    const fileName =
      name || `${this.name.replace(/\s+/g, "_")}_${Date.now()}`;
    mkdirSync("test-results", { recursive: true });
    return await this.page.screenshot({
      path: `test-results/${fileName}.png`,
    });
  }

  async scrollTo(name: string): Promise<void> {
    await this.getElement(name).first().scrollIntoViewIfNeeded();
  }

  async scrollToTop(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, 0));
  }

  async scrollToBottom(): Promise<void> {
    await this.page.evaluate(() =>
      window.scrollTo(0, document.body.scrollHeight),
    );
  }

  getPage(): Page {
    return this.page;
  }

  getName(): string {
    return this.name;
  }

  getPath(): string {
    return this.path;
  }
}

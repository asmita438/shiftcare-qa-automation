import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
  readonly page: Page;
  readonly baseUrl: string;

  constructor(page: Page) {
    this.page = page;
    this.baseUrl = process.env.Base_URL || 'https://shiftcare.com';
  }

  /**
   * Navigate to a specific URL
   */
  async navigate(url: string = ''): Promise<void> {
    const fullUrl = url ? url : process.env.BASE_URL; // If no URL is passed, use the base URL from .env
    if (!fullUrl) {
      throw new Error('BASE_URL is not defined in the environment variables.');
    }
    try {
      await this.page.goto(fullUrl, { waitUntil: 'networkidle' });
    } catch (error) {
      console.error(`Failed to navigate to ${fullUrl}:`, error);
      throw error; // Re-throw the error to be handled by the caller
    }
  }

  /**
   * Wait for network to be idle (helpful for SPA applications)
   */
  async waitForNetworkIdle(timeout = 5000): Promise<void> {
    await this.page.waitForLoadState('networkidle', { timeout });
  }

  /**
   * Get a locator with a smart waiting strategy
   */
  async getLocator(selector: string, timeout = 5000): Promise<Locator> {
    await this.page.waitForSelector(selector, { timeout });
    return this.page.locator(selector);
  }

  /**
   * Fill input field with text after clearing it
   */
  async fillInput(selector: string, text: string): Promise<void> {
    const locator = this.page.locator(selector);
    await locator.clear();
    await locator.fill(text);
  }

  /**
   * Click element with retry logic for flaky elements
   */
  async clickWithRetry(selector: string, maxRetries = 3): Promise<void> {
    let attempts = 0;
    while (attempts < maxRetries) {
      try {
        const locator = this.page.locator(selector);
        await locator.waitFor({ state: 'visible', timeout: 5000 });
        await locator.click();
        return;
      } catch (error) {
        attempts++;
        if (attempts === maxRetries) {
          throw error;
        }
        // Wait before retrying
        await this.page.waitForTimeout(1000);
      }
    }
  }

  /**
   * Check if element is visible
   */
  async isVisible(selector: string, timeout = 5000): Promise<boolean> {
    try {
      await this.page.waitForSelector(selector, { state: 'visible', timeout });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get text from element
   */
  async getText(selector: string): Promise<string> {
    const locator = this.page.locator(selector);
    return await locator.innerText();
  }

  /**
   * Take screenshot
   */
  async takeScreenshot(path: string): Promise<void> {
    await this.page.screenshot({ path });
  }
}
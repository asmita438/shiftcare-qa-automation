import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  // Selectors
  private readonly usernameInput = 'input[name="email"]'; // Replace with actual username input field selector
  private readonly passwordInput = 'input[name="password"]'; // Replace with actual password input field selector
  private readonly loginButton = 'button[type="submit"]'; // Replace with actual login button selector
  private readonly errorMessage = '.error-message'; // Replace with actual error message selector
  private readonly rememberMeCheckbox = 'input[type="checkbox"]'; // Replace with actual "Remember Me" checkbox selector
  private readonly forgotPasswordLink = 'a[href="/forgot-password"]';
  
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to the login page
   */
  async navigate(): Promise<void> {
    const loginUrl = `${process.env.BASE_URL}/users/sign_in`; // Combine BASE_URL with the login path
    await super.navigate(loginUrl);
  }

  /**
   * Login with username and password
   */
  async login(username: string, password: string): Promise<void> {
    await this.fillInput(this.usernameInput, username);
    await this.fillInput(this.passwordInput, password);
    await this.clickWithRetry(this.loginButton);
  }

  /**
   * Check if login was successful
   */
  async isLoggedIn(): Promise<boolean> {
    // Check for dashboard or main page elements that indicate successful login
    return await this.isVisible('[data-testid="sidebar-menu"]', 10000);
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string | null> {
    if (await this.isVisible(this.errorMessage)) {
      return this.getText(this.errorMessage);
    }
    return null;
  }

  /**
   * Toggle "Remember Me" checkbox
   */
  async toggleRememberMe(): Promise<void> {
    await this.clickWithRetry(this.rememberMeCheckbox);
  }

  /**
   * Click "Forgot Password" link
   */
  async clickForgotPassword(): Promise<void> {
    await this.clickWithRetry(this.forgotPasswordLink);
  }

  /**
   * Verify if username is persisted (for session persistence test)
   */
  async isUsernamePersisted(expectedUsername: string): Promise<boolean> {
    const locator = this.page.locator(this.usernameInput);
    const value = await locator.inputValue();
    return value === expectedUsername;
  }

  /**
   * Logout (navigate to logout endpoint)
   */
  async logout(): Promise<void> {
    const logoutUrl = `${process.env.BASE_URL}/users/sign_out`; // Combine BASE_URL with the logout path
    await super.navigate(logoutUrl);
    // Wait for redirect to login page
    await this.isVisible(this.loginButton);
  }
}
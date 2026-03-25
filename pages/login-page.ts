import type { Locator, Page } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly registerButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator("input[type='email']");
    this.passwordInput = page.locator("input[type='password']");
    this.loginButton = page.locator("button[type='submit']");
    this.registerButton = page.getByRole("button", { name: "Registrati" });
  }

  async goto() {
    await this.page.goto("/");
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async goToRegister() {
    await this.registerButton.click();
  }
}

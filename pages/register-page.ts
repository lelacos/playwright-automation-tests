import type { Locator, Page } from "@playwright/test";

export class RegisterPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly displayNameInput: Locator;
  readonly cityInput: Locator;
  readonly roleSelect: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator("input[type='email']");
    this.passwordInput = page.locator("input[type='password']");
    this.displayNameInput = page.locator("input[type='text']");
    this.cityInput = page.locator("input[role='combobox']");
    this.roleSelect = page.locator("select");
    this.submitButton = page.locator("button[type='submit']");
  }

  async enterRegistrationData(params: {
    email: string;
    password: string;
    name: string;
    city: string;
    role?: "PLAYER" | "ORGANIZER";
  }) {
    const { email, password, name, city, role = "PLAYER" } = params;

    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.displayNameInput.fill(name);
    await this.cityInput.fill(city);
    await this.cityInput.press("Enter");
    await this.roleSelect.selectOption(role);
  }

  async submit() {
    await this.submitButton.click();
  }

  async passwordIsValid() {
    return this.passwordInput.evaluate(
      (input) => (input as HTMLInputElement).checkValidity()
    );
  }

  async passwordValidationMessage() {
    return this.passwordInput.evaluate(
      (input) => (input as HTMLInputElement).validationMessage
    );
  }
}

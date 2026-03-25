import { expect, type Page } from "@playwright/test";

import { LoginPage } from "../../pages/login-page";
import { RegisterPage } from "../../pages/register-page";
import {
  LIST_VIEW_HEADER,
  LOGIN_HEADER,
  LOGOUT_BUTTON,
  ORGANIZER_DASHBOARD_BUTTON,
  ORGANIZER_VIEW_HEADER,
  PLAYER_DASHBOARD_BUTTON,
  REGISTER_HEADER,
  errorToast
} from "../selectors/account-selectors";

const apiBase = process.env.API_BASE ?? "http://localhost:8080";

export async function openLoginPage(page: Page) {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await assertLoginPageVisible(page);
}

export async function assertLoginPageVisible(page: Page) {
  await expect(page.locator(`xpath=${LOGIN_HEADER}`)).toBeVisible();
}

export async function openRegisterPage(page: Page) {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.goToRegister();
  await assertRegisterPageVisible(page);
}

export async function assertRegisterPageVisible(page: Page) {
  await expect(page.locator(`xpath=${REGISTER_HEADER}`)).toBeVisible();
}

export async function registerUser(
  page: Page,
  params: {
    email: string;
    password: string;
    displayName: string;
    city: string;
    role: "PLAYER" | "ORGANIZER";
  }
) {
  const registerPage = new RegisterPage(page);

  await registerPage.enterRegistrationData({
    email: params.email,
    password: params.password,
    name: params.displayName,
    city: params.city,
    role: params.role
  });

  await registerPage.submit();
}

export async function loginUser(page: Page, email: string, password: string) {
  const loginPage = new LoginPage(page);
  await loginPage.login(email, password);
}

export async function assertListViewLoaded(page: Page) {
  await expect(page.locator(`xpath=${LIST_VIEW_HEADER}`)).toBeVisible();
}

export async function assertPlayerDashboard(page: Page) {
  await expect(page.locator(`xpath=${PLAYER_DASHBOARD_BUTTON}`)).toBeVisible();
}

export async function assertOrganizerDashboard(page: Page) {
  await expect(page.locator(`xpath=${ORGANIZER_DASHBOARD_BUTTON}`)).toBeVisible();
}

export async function assertOrganizerViewLoaded(page: Page) {
  await expect(page.locator(`xpath=${ORGANIZER_VIEW_HEADER}`)).toBeVisible();
}

export async function logoutUser(page: Page) {
  await page.locator(`xpath=${LOGOUT_BUTTON}`).click();
}

export async function assertErrorToast(page: Page, message: string) {
  await expect(page.locator(`xpath=${errorToast(message)}`)).toBeVisible();
}

export async function assertPasswordRejectedByClient(page: Page) {
  const registerPage = new RegisterPage(page);

  await expect
    .poll(async () => registerPage.passwordIsValid())
    .toBeFalsy();
  await expect
    .poll(async () => registerPage.passwordValidationMessage())
    .not.toBe("");
}

export async function assertAuthenticatedUser(
  page: Page,
  expectedRole: "PLAYER" | "ORGANIZER",
  expectedSkillLevel?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
) {
  const response = await page.evaluate(async (url) => {
    const result = await fetch(url, { credentials: "include" });
    let body: unknown = null;

    try {
      body = await result.json();
    } catch {
      body = null;
    }

    return {
      status: result.status,
      body
    };
  }, `${apiBase}/api/auth/me`);

  expect(response.status).toBe(200);
  expect((response.body as { role: string }).role).toBe(expectedRole);
  if (expectedSkillLevel) {
    expect((response.body as { skillLevel?: string }).skillLevel).toBe(expectedSkillLevel);
  }
}

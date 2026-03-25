import { test } from "@playwright/test";

import { buildAccount, uniqueSuffix } from "./data/account-factory";
import {
  assertErrorToast,
  assertListViewLoaded,
  assertLoginPageVisible,
  assertOrganizerDashboard,
  assertOrganizerViewLoaded,
  assertPasswordRejectedByClient,
  assertPlayerDashboard,
  assertRegisterPageVisible,
  assertAuthenticatedUser,
  loginUser,
  logoutUser,
  openLoginPage,
  openRegisterPage,
  registerUser
} from "./steps/account-steps";

test.describe("account flows", () => {
  test("player can sign up with the default profile", async ({ page }) => {
    await openRegisterPage(page);

    const account = buildAccount({
      role: "PLAYER",
      prefix: "new_player",
      city: "Cagliari"
    });

    await registerUser(page, {
      email: account.email,
      password: account.password,
      displayName: account.displayName,
      city: account.city,
      role: account.role
    });

    await assertPlayerDashboard(page);
    await assertAuthenticatedUser(page, "PLAYER", "INTERMEDIATE");
  });

  test("organizer can sign up", async ({ page }) => {
    await openRegisterPage(page);

    const account = buildAccount({
      role: "ORGANIZER",
      prefix: "new_org",
      city: "Milano"
    });

    await registerUser(page, {
      email: account.email,
      password: account.password,
      displayName: account.displayName,
      city: account.city,
      role: account.role
    });

    await assertOrganizerDashboard(page);
    await assertAuthenticatedUser(page, "ORGANIZER");
  });

  test("duplicate email is rejected", async ({ page }) => {
    await openRegisterPage(page);

    await registerUser(page, {
      email: "player@test.it",
      password: "secret1",
      displayName: `UniqueName${uniqueSuffix()}`,
      city: "Cagliari",
      role: "PLAYER"
    });

    await assertErrorToast(page, "Email gi\u00e0 in uso");
  });

  test("duplicate display name is rejected", async ({ page }) => {
    await openRegisterPage(page);

    await registerUser(page, {
      email: `unique_email_${uniqueSuffix()}@test.it`,
      password: "secret1",
      displayName: "Player Demo",
      city: "Cagliari",
      role: "PLAYER"
    });

    await assertErrorToast(page, "Display name gi\u00e0 in uso");
  });

  test("short password keeps the user on the register page", async ({ page }) => {
    await openRegisterPage(page);

    await registerUser(page, {
      email: `shortpwd_${uniqueSuffix()}@test.it`,
      password: "12345",
      displayName: `ShortPwd${uniqueSuffix()}`,
      city: "Cagliari",
      role: "PLAYER"
    });

    await assertPasswordRejectedByClient(page);
    await assertRegisterPageVisible(page);
  });

  test("player can log in", async ({ page }) => {
    await openLoginPage(page);

    await assertLoginPageVisible(page);
    await loginUser(page, "player@test.it", "password");

    await assertListViewLoaded(page);
  });

  test("organizer can log in", async ({ page }) => {
    await openLoginPage(page);

    await assertLoginPageVisible(page);
    await loginUser(page, "organizer@test.it", "password");

    await assertOrganizerViewLoaded(page);
  });

  test("wrong credentials show an error toast", async ({ page }) => {
    await openLoginPage(page);

    await assertLoginPageVisible(page);
    await loginUser(page, "player@test.it", "wrongpass");

    await assertErrorToast(page, "Credenziali non valide");
    await assertLoginPageVisible(page);
  });

  test("logout sends the user back to login", async ({ page }) => {
    await openLoginPage(page);
    await loginUser(page, "player@test.it", "password");

    await assertListViewLoaded(page);
    await logoutUser(page);

    await assertLoginPageVisible(page);
  });

  test("player stays logged in after refresh", async ({ page }) => {
    await openLoginPage(page);
    await loginUser(page, "player@test.it", "password");

    await assertListViewLoaded(page);
    await page.reload();

    await assertListViewLoaded(page);
  });

  test("organizer stays logged in after refresh", async ({ page }) => {
    await openLoginPage(page);
    await loginUser(page, "organizer@test.it", "password");

    await assertOrganizerViewLoaded(page);
    await page.reload();

    await assertOrganizerViewLoaded(page);
  });
});

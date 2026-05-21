import { expect, type Page } from "@playwright/test";

import { LOGOUT_BUTTON } from "../selectors/account-selectors";
import {
  EDIT_PROFILE_BUTTON,
  PENDING_REVIEWS_HEADER,
  PROFILE_BUTTON,
  PROFILE_HEADER,
  REVIEWS_HEADER,
  SAVE_PROFILE_BUTTON,
  profileField,
  profileSelect
} from "../selectors/profile-selectors";

const apiBase = process.env.API_BASE ?? "http://localhost:8080";

export async function openProfilePage(page: Page) {
  await page.locator(`xpath=${PROFILE_BUTTON}`).click();
  await assertProfilePageVisible(page);
}

export async function assertProfilePageVisible(page: Page) {
  await expect(page.locator(`xpath=${PROFILE_HEADER}`)).toBeVisible();
}

export async function assertProfileIdentity(page: Page, email: string, role: "PLAYER" | "ORGANIZER", skillLevel?: string) {
  await expect(page.locator(`text=Email:`)).toBeVisible();
  await expect(page.locator(`text=${email}`)).toBeVisible();
  await expect(page.locator(`xpath=//p[contains(normalize-space(),'Nome utente:') or contains(normalize-space(),'Nome struttura:')]`)).toBeVisible();
  await expect(page.locator(`xpath=//p[contains(normalize-space(),'Citta:')]`)).toBeVisible();
  await expect(page.locator(`xpath=//p[contains(normalize-space(),'Ruolo:')]`)).toContainText(role);
  if (skillLevel) {
    await expect(page.locator(`xpath=//p[contains(normalize-space(),'Livello:')]`)).toContainText(skillLevel);
  } else {
    await expect(page.locator(`xpath=//p[contains(normalize-space(),'Livello:')]`)).toHaveCount(0);
  }
}

export async function openProfileEditor(page: Page) {
  await page.locator(`xpath=${EDIT_PROFILE_BUTTON}`).click();
  await expect(page.locator(`xpath=${SAVE_PROFILE_BUTTON}`)).toBeVisible();
}

export async function updateProfile(page: Page, params: { email: string; displayName: string; city: string }) {
  await page.locator(`xpath=${profileField("Email")}`).fill(params.email);
  await page.locator(`xpath=${profileField("Nome utente")}`).or(page.locator(`xpath=${profileField("Nome struttura")}`)).fill(params.displayName);
  await page.locator(`xpath=${profileField("Citta")}`).fill(params.city);
  await Promise.all([
    page.waitForResponse((response) => response.url().includes("/api/users/me") && response.request().method() === "PUT"),
    page.locator(`xpath=${SAVE_PROFILE_BUTTON}`).click()
  ]);
}

export async function updateSkillLevel(page: Page, skillLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED") {
  await page.locator(`xpath=${profileSelect("Livello")}`).selectOption(skillLevel);
  await Promise.all([
    page.waitForResponse((response) => response.url().includes("/api/users/me") && response.request().method() === "PUT"),
    page.locator(`xpath=${SAVE_PROFILE_BUTTON}`).click()
  ]);
}

export async function changePassword(page: Page, currentPassword: string, newPassword: string) {
  await page.locator(`xpath=${profileField("Password attuale")}`).fill(currentPassword);
  await page.locator(`xpath=${profileField("Nuova password")}`).fill(newPassword);
  await Promise.all([
    page.waitForResponse((response) => response.url().includes("/api/users/me") && response.request().method() === "PUT"),
    page.locator(`xpath=${SAVE_PROFILE_BUTTON}`).click()
  ]);
}

export async function assertErrorToast(page: Page, message: string) {
  await expect(page.locator("[role='alert']").filter({ hasText: message })).toBeVisible();
}

export async function assertCurrentUser(page: Page, expected: { email?: string; displayName?: string; city?: string; skillLevel?: string; imageUrl?: boolean }) {
  const response = await page.evaluate(async (url) => {
    const result = await fetch(url, { credentials: "include" });
    return { status: result.status, body: await result.json() };
  }, `${apiBase}/api/auth/me`);

  expect(response.status).toBe(200);
  if (expected.email) expect((response.body as { email: string }).email).toBe(expected.email);
  if (expected.displayName) expect((response.body as { displayName: string }).displayName).toBe(expected.displayName);
  if (expected.city) expect((response.body as { city: string }).city).toBe(expected.city);
  if (expected.skillLevel) expect((response.body as { skillLevel: string }).skillLevel).toBe(expected.skillLevel);
  if (expected.imageUrl === true) expect((response.body as { imageUrl?: string }).imageUrl).toBeTruthy();
  if (expected.imageUrl === false) expect((response.body as { imageUrl?: string }).imageUrl).toBeFalsy();
}

export async function attemptOrganizerSkillLevelUpdate(page: Page) {
  const response = await page.evaluate(async (url) => {
    const result = await fetch(url, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skillLevel: "INTERMEDIATE" })
    });
    return { status: result.status, text: await result.text() };
  }, `${apiBase}/api/users/me`);

  expect(response.status).toBe(400);
  expect(response.text).toContain("skill level");
  await assertCurrentUser(page, { imageUrl: false });
}

export async function uploadValidProfileImage(page: Page) {
  await Promise.all([
    page.waitForResponse((response) => response.url().includes("/api/users/me/image") && response.request().method() === "POST"),
    page.locator("input[type='file']").setInputFiles({
      name: "profile.svg",
      mimeType: "image/svg+xml",
      buffer: Buffer.from("<svg xmlns='http://www.w3.org/2000/svg' width='1' height='1'></svg>")
    })
  ]);
  await expect(page.locator("img[src*='/uploads/']").first()).toBeVisible();
}

export async function uploadInvalidProfileFile(page: Page) {
  await page.locator("input[type='file']").setInputFiles({
    name: "profile.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("not an image")
  });
  await assertErrorToast(page, "Seleziona un'immagine valida.");
  await assertCurrentUser(page, { imageUrl: false });
}

export async function assertReviewsSection(page: Page) {
  await expect(page.locator(`xpath=${REVIEWS_HEADER}`)).toBeVisible();
  await expect(page.locator("text=Rating medio:")).toBeVisible();
  await expect(page.locator("text=Da:").first()).toBeVisible();
  await expect(page.locator("text=Ottima partita!").or(page.locator("text=Match equilibrato e divertente.")).first()).toBeVisible();
}

export async function assertPendingReviewsSection(page: Page) {
  await expect(page.locator(`xpath=${PENDING_REVIEWS_HEADER}`)).toBeVisible();
  const pendingSection = page.locator(`xpath=${PENDING_REVIEWS_HEADER}/ancestor::div[contains(@class,'card')][1]`);
  await expect(pendingSection.getByRole("button", { name: "Apri partita" }).first()).toBeVisible();
  await pendingSection.getByRole("button", { name: "Apri partita" }).first().click();
  await expect(page.getByRole("button", { name: "Scrivi una recensione" })).toBeVisible();
  await page.getByRole("button", { name: "Scrivi una recensione" }).click();
  await expect(page.locator("text=Nuova recensione")).toBeVisible();
}

export async function logoutFromProfile(page: Page) {
  await page.locator(`xpath=${LOGOUT_BUTTON}`).click();
}

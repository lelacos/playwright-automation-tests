import { test } from "@playwright/test";

import { buildAccount, uniqueSuffix } from "./data/account-factory";
import { assertLoginPageVisible, loginUser, openLoginPage, openRegisterPage, registerUser } from "./steps/account-steps";
import {
  assertCurrentUser,
  assertErrorToast,
  assertPendingReviewsSection,
  assertProfileIdentity,
  assertReviewsSection,
  attemptOrganizerSkillLevelUpdate,
  changePassword,
  logoutFromProfile,
  openProfileEditor,
  openProfilePage,
  updateProfile,
  updateSkillLevel,
  uploadInvalidProfileFile,
  uploadValidProfileImage
} from "./steps/profile-steps";

test.describe("profile flows", () => {
  test("player can view own profile", async ({ page }) => {
    await openLoginPage(page);
    await loginUser(page, "player@test.it", "password");
    await openProfilePage(page);
    await assertProfileIdentity(page, "player@test.it", "PLAYER", "INTERMEDIATE");
  });

  test("organizer can view own profile", async ({ page }) => {
    await openLoginPage(page);
    await loginUser(page, "organizer@test.it", "password");
    await openProfilePage(page);
    await assertProfileIdentity(page, "organizer@test.it", "ORGANIZER");
  });

  test("user can update profile data", async ({ page }) => {
    await openRegisterPage(page);
    const account = buildAccount({ role: "PLAYER", prefix: "profile_update", city: "Torino" });
    await registerUser(page, account);

    await openProfilePage(page);
    await openProfileEditor(page);

    const suffix = uniqueSuffix();
    const updated = {
      email: `profile_updated_${suffix}@test.it`,
      displayName: `ProfileUpdated${suffix}`,
      city: "Milano"
    };

    await updateProfile(page, updated);
    await assertCurrentUser(page, updated);
  });

  test("player can update skill level", async ({ page }) => {
    await openRegisterPage(page);
    const account = buildAccount({ role: "PLAYER", prefix: "skill_update", city: "Torino" });
    await registerUser(page, account);

    await openProfilePage(page);
    await openProfileEditor(page);
    await updateSkillLevel(page, "ADVANCED");
    await assertCurrentUser(page, { skillLevel: "ADVANCED" });
  });

  test("organizer cannot update skill level", async ({ page }) => {
    await openRegisterPage(page);
    const account = buildAccount({ role: "ORGANIZER", prefix: "org_skill", city: "Milano" });
    await registerUser(page, account);

    await openProfilePage(page);
    await attemptOrganizerSkillLevelUpdate(page);
  });

  test("user can change password", async ({ page }) => {
    await openRegisterPage(page);
    const account = buildAccount({ role: "PLAYER", prefix: "pwd_update", city: "Torino" });
    await registerUser(page, account);

    await openProfilePage(page);
    await openProfileEditor(page);
    await changePassword(page, account.password, "newsecret1");
    await logoutFromProfile(page);
    await page.getByRole("button", { name: "Accedi" }).click();
    await assertLoginPageVisible(page);
    await loginUser(page, account.email, "newsecret1");
    await openProfilePage(page);
    await assertProfileIdentity(page, account.email, "PLAYER", "INTERMEDIATE");
  });

  test("wrong current password is rejected", async ({ page }) => {
    await openRegisterPage(page);
    const account = buildAccount({ role: "PLAYER", prefix: "pwd_wrong", city: "Torino" });
    await registerUser(page, account);

    await openProfilePage(page);
    await openProfileEditor(page);
    await changePassword(page, "wrongpass", "newsecret1");
    await assertErrorToast(page, "Password attuale non corretta");
    await logoutFromProfile(page);
    await page.getByRole("button", { name: "Accedi" }).click();
    await assertLoginPageVisible(page);
    await loginUser(page, account.email, account.password);
    await openProfilePage(page);
    await assertProfileIdentity(page, account.email, "PLAYER", "INTERMEDIATE");
  });

  test("user can upload a valid profile image", async ({ page }) => {
    await openRegisterPage(page);
    const account = buildAccount({ role: "PLAYER", prefix: "image_ok", city: "Torino" });
    await registerUser(page, account);

    await openProfilePage(page);
    await uploadValidProfileImage(page);
    await assertCurrentUser(page, { imageUrl: true });
  });

  test("non-image profile upload is rejected", async ({ page }) => {
    await openRegisterPage(page);
    const account = buildAccount({ role: "PLAYER", prefix: "image_bad", city: "Torino" });
    await registerUser(page, account);

    await openProfilePage(page);
    await uploadInvalidProfileFile(page);
  });

  test("user can view received reviews", async ({ page }) => {
    await openLoginPage(page);
    await loginUser(page, "player@test.it", "password");
    await openProfilePage(page);
    await assertReviewsSection(page);
  });

  test("player can view pending review matches", async ({ page }) => {
    await openLoginPage(page);
    await loginUser(page, "player@test.it", "password");
    await openProfilePage(page);
    await assertPendingReviewsSection(page);
  });
});

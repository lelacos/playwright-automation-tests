import { test } from "@playwright/test";

import { loginUser, openLoginPage } from "./steps/account-steps";
import {
  applyInvalidDateRange,
  assertBadgeResults,
  assertCityResults,
  assertDefaultFilters,
  assertInvalidDateRangeError,
  assertMatchListLoaded,
  filterByAfter,
  filterByBefore,
  filterByCity,
  filterByMatchType,
  filterByOpenStatus,
  filterBySkillLevel,
  openMatchListPage,
  resetFilters
} from "./steps/match-discovery-steps";

test.describe("match discovery flows", () => {
  test.beforeEach(async ({ page }) => {
    await openLoginPage(page);
    await loginUser(page, "player@test.it", "password");
    await openMatchListPage(page);
  });

  test("default match list is loaded", async ({ page }) => {
    await assertMatchListLoaded(page);
  });

  test("matches can be filtered by city", async ({ page }) => {
    await filterByCity(page, "Torino");
    await assertCityResults(page, "Torino");
  });

  test("matches can be filtered by start date", async ({ page }) => {
    await filterByAfter(page, "2030-01-01", "00:00");
    await assertMatchListLoaded(page);
  });

  test("matches can be filtered by end date", async ({ page }) => {
    await filterByBefore(page, "2030-01-01", "23:59");
    await assertMatchListLoaded(page);
  });

  test("invalid date range is rejected", async ({ page }) => {
    await applyInvalidDateRange(page);
    await assertInvalidDateRangeError(page);
  });

  test("matches can be filtered by skill level", async ({ page }) => {
    await filterBySkillLevel(page, "INTERMEDIATE");
    await assertBadgeResults(page, "INTERMEDIATE");
  });

  test("matches can be filtered by match type", async ({ page }) => {
    await filterByMatchType(page, "SINGLES");
    await assertBadgeResults(page, "SINGLES");
  });

  test("matches can be filtered by open status", async ({ page }) => {
    await filterByOpenStatus(page, "OPEN");
    await assertBadgeResults(page, "Aperta");
  });

  test("filters can be reset", async ({ page }) => {
    await filterByCity(page, "Torino");
    await resetFilters(page);
    await assertDefaultFilters(page);
  });
});

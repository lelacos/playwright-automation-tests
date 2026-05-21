import { expect, type Locator, type Page } from "@playwright/test";

import {
  APPLY_FILTERS_BUTTON,
  BRAND_BUTTON,
  EMPTY_MATCH_LIST,
  MATCH_COUNTER,
  MATCH_LIST_HEADER,
  RESET_FILTERS_BUTTON,
  errorToast
} from "../selectors/match-discovery-selectors";

export async function openMatchListPage(page: Page) {
  await page.locator(`xpath=${BRAND_BUTTON}`).click();
  await assertMatchListLoaded(page);
}

export async function assertMatchListLoaded(page: Page) {
  await expect(page.locator(`xpath=${MATCH_LIST_HEADER}`)).toBeVisible();
  await expect(page.locator("text=Caricamento...")).toHaveCount(0);
  await assertMatchListHasContent(page);
}

export async function filterByCity(page: Page, city: string) {
  await page.locator("input[role='combobox']").fill(city);
  await page.locator("input[role='combobox']").press("Enter");
  await applyFilters(page);
}

export async function filterByAfter(page: Page, date: string, time: string) {
  await page.locator("input[type='date']").nth(0).fill(date);
  await page.locator("input[type='time']").nth(0).fill(time);
  await applyFilters(page);
}

export async function filterByBefore(page: Page, date: string, time: string) {
  await page.locator("input[type='date']").nth(1).fill(date);
  await page.locator("input[type='time']").nth(1).fill(time);
  await applyFilters(page);
}

export async function filterBySkillLevel(page: Page, skillLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED") {
  await page.locator("select").nth(0).selectOption(skillLevel);
  await applyFilters(page);
}

export async function filterByMatchType(page: Page, matchType: "SINGLES" | "DOUBLES") {
  await page.locator("select").nth(1).selectOption(matchType);
  await applyFilters(page);
}

export async function filterByOpenStatus(page: Page, status: "OPEN" | "CLOSED") {
  await page.locator("select").nth(2).selectOption(status);
  await applyFilters(page);
}

export async function applyInvalidDateRange(page: Page) {
  await page.locator("input[type='date']").nth(0).fill("2030-01-02");
  await page.locator("input[type='time']").nth(0).fill("10:00");
  await page.locator("input[type='date']").nth(1).fill("2030-01-01");
  await page.locator("input[type='time']").nth(1).fill("09:00");
  await page.locator(`xpath=${APPLY_FILTERS_BUTTON}`).click();
}

export async function resetFilters(page: Page) {
  await page.locator(`xpath=${RESET_FILTERS_BUTTON}`).click();
  await assertResultsLoaded(page);
}

export async function assertCityResults(page: Page, city: string) {
  await assertCardsOrEmpty(page, async (cards) => {
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      await expect(cards.nth(i).locator("h3")).toContainText(city);
    }
  });
}

export async function assertBadgeResults(page: Page, label: string) {
  await assertCardsOrEmpty(page, async (cards) => {
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      await expect(cards.nth(i).locator(`xpath=.//span[normalize-space()='${label}']`)).toBeVisible();
    }
  });
}

export async function assertInvalidDateRangeError(page: Page) {
  await expect(page.locator(`xpath=${errorToast("La data di fine deve essere successiva alla data di inizio.")}`)).toBeVisible();
}

export async function assertDefaultFilters(page: Page) {
  await expect(page.locator("input[role='combobox']")).toHaveValue(/.+/);
  await expect(page.locator("select").nth(2)).toHaveValue("OPEN");
  await assertMatchListHasContent(page);
}

async function applyFilters(page: Page) {
  await Promise.all([
    page.waitForResponse((response) => response.url().includes("/api/matches")),
    page.locator(`xpath=${APPLY_FILTERS_BUTTON}`).click()
  ]);
  await assertResultsLoaded(page);
}

async function assertResultsLoaded(page: Page) {
  await expect(page.locator("text=Caricamento...")).toHaveCount(0);
  await assertMatchListHasContent(page);
}

async function assertMatchListHasContent(page: Page) {
  await expect(page.locator(`xpath=${MATCH_COUNTER}`).or(page.locator(`xpath=${EMPTY_MATCH_LIST}`))).toBeVisible();
}

async function assertCardsOrEmpty(page: Page, assertCards: (cards: Locator) => Promise<void>) {
  const cards = matchCards(page);
  if (await cards.count()) {
    await assertCards(cards);
  } else {
    await expect(page.locator(`xpath=${EMPTY_MATCH_LIST}`)).toBeVisible();
  }
}

function matchCards(page: Page) {
  return page.locator(".card").filter({ has: page.locator("h3") });
}

export const MATCH_LIST_HEADER = "//h2[normalize-space()='Partite']";
export const BRAND_BUTTON = "//button[.//span[normalize-space()='TennisMatch']]";
export const APPLY_FILTERS_BUTTON = "//button[normalize-space()='Applica']";
export const RESET_FILTERS_BUTTON = "//button[normalize-space()='Azzera']";
export const EMPTY_MATCH_LIST = "//p[normalize-space()='Nessuna partita trovata.']";
export const MATCH_COUNTER = "//p[contains(normalize-space(),'match trovati.')]";

export function errorToast(message: string) {
  return `//div[@role='alert' and normalize-space()='${message}']`;
}

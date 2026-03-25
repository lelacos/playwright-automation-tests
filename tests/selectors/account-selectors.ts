export const LOGIN_HEADER = "//h2[normalize-space()='Accedi']";
export const REGISTER_HEADER = "//h2[normalize-space()='Crea account']";
export const LIST_VIEW_HEADER = "//h2[normalize-space()='Partite']";
export const PLAYER_DASHBOARD_BUTTON = "//button[normalize-space()='+ Nuova partita']";
export const ORGANIZER_DASHBOARD_BUTTON = "//button[normalize-space()='Gestione campi']";
export const ORGANIZER_VIEW_HEADER = "//h2[normalize-space()='Gestione campi e partite']";
export const LOGOUT_BUTTON = "//button[normalize-space()='Logout']";

export function errorToast(message: string) {
  return `//div[@role='alert' and normalize-space()='${message}']`;
}

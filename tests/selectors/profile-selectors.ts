export const PROFILE_BUTTON = "//button[normalize-space()='Profilo']";
export const PROFILE_HEADER = "//h1[contains(normalize-space(),'Profilo di')]";
export const EDIT_PROFILE_BUTTON = "//button[normalize-space()='Modifica profilo']";
export const SAVE_PROFILE_BUTTON = "//button[normalize-space()='Salva modifiche']";
export const REVIEWS_HEADER = "//h3[contains(normalize-space(),'Dicono di te')]";
export const PENDING_REVIEWS_HEADER = "//h3[normalize-space()='Recensioni da lasciare']";

export function successToast(message: string) {
  return `//div[@role='alert' and normalize-space()='${message}']`;
}

export function profileField(label: string) {
  return `//label[normalize-space()='${label}']/following-sibling::input`;
}

export function profileSelect(label: string) {
  return `//label[normalize-space()='${label}']/following-sibling::select`;
}

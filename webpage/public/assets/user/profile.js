import { api } from "../shared/api.js";
import { $id } from "../shared/dom.js";
import { setWorkerLanguage, t, updateStaticText, workerLanguage } from "./i18n.js";

const fieldMap = {
  passport_id: "personal-passport",
  car_id: "personal-car",
  card_id: "personal-card",
  phone: "personal-phone",
  email: "personal-email",
};

function setMenuOpen(open) {
  const button = $id("btn-user-settings");
  const menu = $id("user-settings-menu");
  if (!button || !menu) return;
  menu.hidden = !open;
  button.setAttribute("aria-expanded", open ? "true" : "false");
}

function isMenuOpen() {
  return !$id("user-settings-menu")?.hidden;
}

function setPersonalStatus(message) {
  const status = $id("personal-status");
  if (status) status.textContent = message || "";
}

function fillProfile(profile) {
  const personalName = $id("personal-name");
  if (personalName) {
    personalName.textContent = `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim();
  }

  for (const [field, id] of Object.entries(fieldMap)) {
    const input = $id(id);
    if (input) input.value = profile?.[field] || "";
  }
}

function clearPasswordFields() {
  for (const id of ["personal-current-password", "personal-new-password"]) {
    const input = $id(id);
    if (input) input.value = "";
  }
}

function collectProfilePayload() {
  const payload = {};
  for (const [field, id] of Object.entries(fieldMap)) {
    payload[field] = $id(id)?.value || "";
  }

  const currentPassword = $id("personal-current-password")?.value || "";
  const newPassword = $id("personal-new-password")?.value || "";
  if (currentPassword || newPassword) {
    payload.current_password = currentPassword;
    payload.new_password = newPassword;
  }

  return payload;
}

function localizeProfileError(error) {
  if (error?.code === "PROFILE_PASSWORD_FIELDS_REQUIRED") return t("personalPasswordFieldsRequired");
  if (error?.code === "PROFILE_CURRENT_PASSWORD_INVALID") return t("personalCurrentPasswordInvalid");
  return error?.message || t("validationUnknown");
}

async function openPersonalModal() {
  setMenuOpen(false);
  const modal = $id("personal-modal");
  if (!modal) return;
  modal.hidden = false;
  clearPasswordFields();
  setPersonalStatus(t("loading"));
  updateStaticText(modal);

  try {
    const result = await api("/my/profile");
    fillProfile(result.profile || {});
    setPersonalStatus("");
  } catch (error) {
    setPersonalStatus(error?.message || t("personalLoadFailed"));
  }
}

function closePersonalModal() {
  const modal = $id("personal-modal");
  if (!modal) return;
  modal.hidden = true;
  clearPasswordFields();
  setPersonalStatus("");
}

async function savePersonalProfile() {
  const saveButton = $id("btn-personal-save");
  const emailInput = $id("personal-email");
  if (emailInput && !emailInput.validity.valid) {
    setPersonalStatus(t("validationEmailInvalid"));
    return;
  }

  try {
    if (saveButton) saveButton.disabled = true;
    setPersonalStatus(t("saving"));
    const result = await api("/my/profile", {
      method: "PUT",
      body: JSON.stringify(collectProfilePayload()),
    });
    fillProfile(result.profile || {});
    clearPasswordFields();
    setPersonalStatus(t("personalSaved"));
  } catch (error) {
    setPersonalStatus(localizeProfileError(error));
  } finally {
    if (saveButton) saveButton.disabled = false;
  }
}

function setPasswordVisibility(button, input, visible) {
  input.type = visible ? "text" : "password";
  button.classList.toggle("is-visible", visible);
  const label = t(visible ? "hidePassword" : "showPassword");
  button.setAttribute("aria-label", label);
  button.setAttribute("title", label);
}

export function refreshUserSettingsText() {
  document.querySelectorAll("[data-toggle-password]").forEach((button) => {
    const input = $id(button.dataset.togglePassword);
    if (!input) return;
    setPasswordVisibility(button, input, input.type === "text");
  });
}

export function initUserSettings(logout, onLanguageChange) {
  const settingsButton = $id("btn-user-settings");
  const settingsMenu = $id("user-settings-menu");
  if (!settingsButton || !settingsMenu) return;

  settingsButton.addEventListener("click", (event) => {
    event.stopPropagation();
    setMenuOpen(!isMenuOpen());
  });

  settingsMenu.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  $id("btn-open-personal")?.addEventListener("click", () => {
    openPersonalModal().catch((error) => setPersonalStatus(error?.message || t("personalLoadFailed")));
  });

  $id("btn-settings-logout")?.addEventListener("click", () => {
    setMenuOpen(false);
    logout();
  });

  $id("btn-switch-language")?.addEventListener("click", () => {
    setWorkerLanguage(workerLanguage === "he" ? "en" : "he");
    setMenuOpen(false);
    if (typeof onLanguageChange === "function") onLanguageChange();
  });

  $id("btn-personal-close")?.addEventListener("click", closePersonalModal);
  document.querySelectorAll("[data-close-personal]").forEach((element) => {
    element.addEventListener("click", closePersonalModal);
  });
  $id("btn-personal-save")?.addEventListener("click", () => {
    savePersonalProfile().catch((error) => setPersonalStatus(localizeProfileError(error)));
  });

  document.querySelectorAll("[data-toggle-password]").forEach((button) => {
    const input = $id(button.dataset.togglePassword);
    if (!input) return;
    button.addEventListener("click", () => {
      setPasswordVisibility(button, input, input.type === "password");
      input.focus();
    });
  });

  document.addEventListener("click", () => setMenuOpen(false));
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (isMenuOpen()) setMenuOpen(false);
    if (!$id("personal-modal")?.hidden) closePersonalModal();
  });
}

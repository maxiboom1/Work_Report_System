import { api } from "../shared/api.js";
import { $id } from "../shared/dom.js";
import { ADMIN_SETTINGS, setAdminSettings, t, updateStaticText } from "./i18n.js";

export async function loadSettings() {
  const r = await api("/admin/settings");
  setAdminSettings(r.settings || {});
  fillSettingsForm();
  updateStaticText();
}

export function fillSettingsForm() {
  if ($id("setting-language")) $id("setting-language").value = ADMIN_SETTINGS.admin_language || "en";
  if ($id("setting-workday-hours")) $id("setting-workday-hours").value = ADMIN_SETTINGS.workday_hours ?? 9;
}

export async function saveSettings() {
  const payload = {
    admin_language: $id("setting-language").value,
    workday_hours: Number($id("setting-workday-hours").value),
  };
  const r = await api("/admin/settings", { method: "PUT", body: JSON.stringify(payload) });
  setAdminSettings(r.settings || {});
  fillSettingsForm();
  updateStaticText();
  $id("settings-note").textContent = t("settingsSaved");
  $id("stats-table").innerHTML = "";
  $id("stats-summary").textContent = "";
}

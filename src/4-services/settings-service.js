import sqlService from "./sql/settings-sql.js";
import { DEFAULT_SETTINGS, normalizeSettings, round2 } from "./shared/validators.js";

export async function getSettings() {
    const rows = await sqlService.listSettings();
    return { ok: true, settings: normalizeSettings(rows) };
}

export async function updateSettings(payload) {
    const settings = {};

    if (payload?.admin_language !== undefined) {
      const language = String(payload.admin_language || "").trim();
      if (!["en", "he"].includes(language)) {
        return { ok: false, status: 400, message: "Invalid language" };
      }
      settings.admin_language = language;
    }

    if (payload?.workday_hours !== undefined) {
      const hours = Number(payload.workday_hours);
      if (!Number.isFinite(hours) || hours <= 0 || hours > 24) {
        return { ok: false, status: 400, message: "Invalid workday hours" };
      }
      settings.workday_hours = String(round2(hours));
    }

    for (const [key, value] of Object.entries(settings)) {
      await sqlService.setSetting(key, value);
    }

    return getSettings();
  }

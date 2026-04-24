export function toInt(v) {
  const n = Number(v);
  return Number.isInteger(n) ? n : null;
}

export function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

export function parseISODate(d) {
  // expect YYYY-MM-DD
  if (!isNonEmptyString(d)) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return null;
  return d;
}

export function parseTime(t) {
  // accept HH:MM or HH:MM:SS
  if (!isNonEmptyString(t)) return null;
  if (!/^\d{2}:\d{2}(:\d{2})?$/.test(t)) return null;
  return t.length === 5 ? `${t}:00` : t;
}

export function minutesBetween(startTime, endTime) {
  // both HH:MM:SS
  const [sh, sm] = startTime.split(":");
  const [eh, em] = endTime.split(":");
  const s = (Number(sh) * 60) + Number(sm);
  const e = (Number(eh) * 60) + Number(em);
  return e - s;
}

export function round2(value) {
  return Math.round(Number(value) * 100) / 100;
}

export function parseOptionalMoney(value) {
  if (value === undefined || value === null || String(value).trim() === "") return null;
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return NaN;
  return round2(amount);
}

export function monthRange(month) {
  // month: YYYY-MM
  if (!isNonEmptyString(month) || !/^\d{4}-\d{2}$/.test(month)) return null;
  const [yStr, mStr] = month.split("-");
  const y = Number(yStr);
  const m = Number(mStr);
  if (!Number.isInteger(y) || !Number.isInteger(m) || m < 1 || m > 12) return null;
  const from = `${yStr}-${mStr}-01`;
  // naive next month (string)
  const nextY = m === 12 ? y + 1 : y;
  const nextM = m === 12 ? 1 : m + 1;
  const to = `${String(nextY).padStart(4, "0")}-${String(nextM).padStart(2, "0")}-01`;
  return { from, to };
}

export const DEFAULT_SETTINGS = {
  admin_language: "en",
  workday_hours: "9",
};

export function normalizeSettings(rows) {
  const raw = { ...DEFAULT_SETTINGS };
  for (const row of rows || []) {
    raw[row.setting_key] = String(row.setting_value ?? "");
  }

  const language = raw.admin_language === "he" ? "he" : "en";
  const workdayHours = Number(raw.workday_hours);

  return {
    admin_language: language,
    workday_hours: Number.isFinite(workdayHours) && workdayHours > 0 ? workdayHours : Number(DEFAULT_SETTINGS.workday_hours),
  };
}

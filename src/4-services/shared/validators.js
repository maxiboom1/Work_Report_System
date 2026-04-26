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
  const value = t.length === 5 ? `${t}:00` : t;
  const [hour, minute, second] = value.split(":").map(Number);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59 || second < 0 || second > 59) return null;
  return value;
}

export function minutesBetween(startTime, endTime) {
  // both HH:MM:SS
  return timeToMinutes(endTime) - timeToMinutes(startTime);
}

export function timeToMinutes(time) {
  const [hour, minute] = String(time || "").split(":").map(Number);
  return (hour * 60) + minute;
}

export function isFiveMinuteTime(time) {
  const parsed = parseTime(time);
  if (!parsed) return false;
  const [, minute, second] = parsed.split(":").map(Number);
  return minute % 5 === 0 && second === 0;
}

export function localDateISO(date = new Date()) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function localTimeHHMMSS(date = new Date()) {
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

export function floorTimeToFiveMinutes(time) {
  const parsed = parseTime(time);
  if (!parsed) return null;
  const [hour, minute] = parsed.split(":").map(Number);
  const floored = Math.floor(minute / 5) * 5;
  return `${String(hour).padStart(2, "0")}:${String(floored).padStart(2, "0")}:00`;
}

export function isDateTimeInFuture(workDate, time, now = new Date()) {
  const date = parseISODate(workDate);
  const parsed = parseTime(time);
  if (!date || !parsed) return true;
  const today = localDateISO(now);
  if (date > today) return true;
  if (date < today) return false;
  return timeToMinutes(parsed) > timeToMinutes(localTimeHHMMSS(now));
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

import { api } from "../shared/api.js";
import { $id } from "../shared/dom.js";
import { todayMonth } from "../shared/dates.js";
import { t, updateStaticText } from "./i18n.js";
import { setCurrentUser } from "./state.js";

let projects = [];
let activeSession = null;
let serverNow = null;
let serverOffsetMs = 0;
let counterTimer = null;
let editingEntry = null;
let loadedEntries = [];

export function setStatus(msg) {
  const el = $id("status");
  if (el) el.textContent = msg;
}

function timeToMinutes(time) {
  const [hour, minute] = String(time || "00:00").split(":").map(Number);
  return (hour * 60) + minute;
}

function timeToSeconds(time) {
  const [hour, minute, second = 0] = String(time || "00:00:00").split(":").map(Number);
  return (hour * 3600) + (minute * 60) + second;
}

function minutesToTime(total) {
  const hour = Math.floor(total / 60);
  const minute = total % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function durationLabel(totalSeconds) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function floorNowToFive() {
  const d = new Date();
  const total = (d.getHours() * 60) + (Math.floor(d.getMinutes() / 5) * 5);
  return minutesToTime(total);
}

function currentMaxTime() {
  return String(serverNow?.rounded_time || floorNowToFive()).slice(0, 5);
}

function monthFromDate(date) {
  return String(date || "").slice(0, 7);
}

function isFutureDateTime(workDate, time) {
  const today = serverNow?.date || localToday();
  if (!workDate || !time) return true;
  if (workDate > today) return true;
  if (workDate < today) return false;
  return timeToMinutes(time) > timeToMinutes(currentMaxTime());
}

function formatConflict(conflict) {
  if (!conflict) return t("validationUnknown");
  const start = String(conflict.start_time || "").slice(0, 5);
  const end = String(conflict.end_time || "").slice(0, 5);
  const project = conflict.project_name ? `, ${conflict.project_name}` : "";
  return `${t("validationOverlapPrefix")} ${start}-${end}${project}`;
}

function formatStartUnavailable(minimumStartTime) {
  const time = String(minimumStartTime || "").slice(0, 5);
  if (!time) return t("validationUnknown");
  return `${t("validationStartUnavailablePrefix")} ${time}${t("validationStartUnavailableSuffix")}`;
}

function localizeApiError(error) {
  if (error?.code === "WORK_ENTRY_OVERLAP") return formatConflict(error.body?.conflict);
  if (error?.code === "WORK_ENTRY_START_UNAVAILABLE") {
    return formatStartUnavailable(error.body?.minimum_start_time || error.body?.conflict?.end_time);
  }

  const message = String(error?.message || "");
  const known = new Map([
    ["Missing/invalid fields", "validationUnknown"],
    ["Missing/invalid end time", "validationEndTimeRequired"],
    ["Invalid project", "validationProjectRequired"],
    ["Project is disabled", "validationProjectRequired"],
    ["Time must use 5-minute steps", "validationTimeRequired"],
    ["Start time cannot be in the future", "validationFutureTime"],
    ["End time cannot be in the future", "validationFutureTime"],
    ["Work entry cannot use future date/time", "validationFutureTime"],
    ["End time cannot be before start time", "validationEndBeforeStart"],
    ["end_time cannot be before start_time", "validationEndBeforeStart"],
  ]);
  const key = known.get(message);
  return key ? t(key) : (message || t("validationUnknown"));
}

async function getEntriesForDate(workDate) {
  const month = monthFromDate(workDate);
  if (!month) return [];
  if ($id("rep-month")?.value === month) return loadedEntries;
  const r = await api(`/my/work-entries?month=${encodeURIComponent(month)}`);
  return r.entries || [];
}

function findLocalOverlap(entries, { workDate, startTime, endTime, excludeId = null }) {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  if (start === end) return null;
  return (entries || []).find((entry) => {
    if (excludeId && String(entry.id) === String(excludeId)) return false;
    if (entry.work_date !== workDate) return false;
    const entryStart = timeToMinutes(entry.start_time);
    const entryEnd = timeToMinutes(entry.end_time);
    if (entryStart === entryEnd) return false;
    return entryStart < end && entryEnd > start;
  }) || null;
}

function findLocalStartOverlap(entries, { workDate, startTime }) {
  const start = timeToMinutes(startTime);
  return (entries || []).find((entry) => {
    if (entry.work_date !== workDate) return false;
    const entryStart = timeToMinutes(entry.start_time);
    const entryEnd = timeToMinutes(entry.end_time);
    if (entryStart === entryEnd) return false;
    return entryStart <= start && entryEnd > start;
  }) || null;
}

function nextAvailableStartTime(entries, workDate) {
  let latestEnd = -1;
  let latestEndTime = "";

  for (const entry of entries || []) {
    if (entry.work_date !== workDate) continue;
    const entryStart = timeToMinutes(entry.start_time);
    const entryEnd = timeToMinutes(entry.end_time);
    if (entryStart === entryEnd) continue;
    if (entryEnd > latestEnd) {
      latestEnd = entryEnd;
      latestEndTime = String(entry.end_time || "").slice(0, 5);
    }
  }

  return latestEndTime || "00:00";
}

async function validateSessionStart({ projectId, workDate, startTime }) {
  if (!projectId) return t("validationProjectRequired");
  if (!workDate) return t("validationDateRequired");
  if (!startTime) return t("validationStartTimeRequired");
  if (isFutureDateTime(workDate, startTime)) return t("validationFutureTime");

  const entries = await getEntriesForDate(workDate);
  const minimumStart = nextAvailableStartTime(entries, workDate);
  if (timeToMinutes(startTime) < timeToMinutes(minimumStart)) return formatStartUnavailable(minimumStart);

  const conflict = findLocalStartOverlap(entries, { workDate, startTime });
  return conflict ? formatConflict(conflict) : "";
}

async function validateEntryInterval({ workDate, startTime, endTime, excludeId = null }) {
  if (!workDate) return t("validationDateRequired");
  if (!startTime) return t("validationStartTimeRequired");
  if (!endTime) return t("validationEndTimeRequired");
  if (isFutureDateTime(workDate, startTime) || isFutureDateTime(workDate, endTime)) return t("validationFutureTime");
  if (timeToMinutes(endTime) < timeToMinutes(startTime)) return t("validationEndBeforeStart");

  const entries = await getEntriesForDate(workDate);
  const conflict = findLocalOverlap(entries, { workDate, startTime, endTime, excludeId });
  return conflict ? formatConflict(conflict) : "";
}

function fillProjectSelect(select, options = {}) {
  if (!select) return;
  const { placeholder = false } = options;
  select.innerHTML = "";
  if (placeholder) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = t("chooseProject");
    select.appendChild(opt);
  }
  for (const p of projects) {
    if (p.is_active === 0) continue;
    const opt = document.createElement("option");
    opt.value = String(p.id);
    opt.textContent = p.name;
    select.appendChild(opt);
  }
}

function populateTimeSelect(select, selectedValue, options = {}) {
  if (!select) return;
  const { minTime = "00:00", maxTime = "23:55", includeSelected = true } = options;
  const selected = String(selectedValue || "").slice(0, 5);
  const minMinutes = timeToMinutes(minTime);
  const maxMinutes = timeToMinutes(maxTime);
  select.innerHTML = "";

  for (let total = Math.max(0, minMinutes); total < 24 * 60; total += 5) {
    if (total > maxMinutes) break;
    const value = minutesToTime(total);
    const opt = document.createElement("option");
    opt.value = value;
    opt.textContent = value;
    select.appendChild(opt);
  }

  if (includeSelected && selected && !Array.from(select.options).some((opt) => opt.value === selected)) {
    const opt = document.createElement("option");
    opt.value = selected;
    opt.textContent = selected;
    select.appendChild(opt);
  }
  select.value = selected || "";
}

function updatePunchButton() {
  const button = $id("work-punch-button");
  const label = $id("punch-label");
  const project = $id("punch-project");
  const time = $id("punch-time");
  const counter = $id("punch-counter");
  if (!button || !label || !project || !time || !counter) return;

  const isActive = Boolean(activeSession);
  button.classList.toggle("is-active", isActive);
  button.classList.toggle("is-idle", !isActive);

  if (!isActive) {
    label.textContent = t("start");
    project.textContent = "";
    time.textContent = "";
    counter.textContent = "";
    return;
  }

  label.textContent = t("working");
  project.textContent = activeSession.project_name || "Active project";
  time.textContent = `${t("started")} ${String(activeSession.start_time || "").slice(0, 5)}`;
  const displayNow = new Date(Date.now() + serverOffsetMs);
  const elapsed = timeToSeconds(`${String(displayNow.getHours()).padStart(2, "0")}:${String(displayNow.getMinutes()).padStart(2, "0")}:${String(displayNow.getSeconds()).padStart(2, "0")}`) - timeToSeconds(activeSession.start_time);
  counter.textContent = durationLabel(elapsed);
}

function updateStaleRecovery() {
  const modal = $id("stale-session-modal");
  if (!modal) return;
  const isStale = Boolean(activeSession?.is_stale);
  modal.hidden = !isStale;
  if (!isStale) return;

  $id("stale-project-name").textContent = activeSession.project_name || "-";
  $id("stale-started-at").textContent = `${activeSession.work_date} ${String(activeSession.start_time || "").slice(0, 5)}`;
  const startTime = String(activeSession.start_time || "").slice(0, 5);
  const selected = minutesToTime(Math.min(23 * 60 + 55, timeToMinutes(startTime) + 5));
  populateTimeSelect($id("stale-end-time"), selected, { minTime: startTime, maxTime: "23:55" });
  updateStaticText(modal);
}

function startCounter() {
  if (counterTimer) window.clearInterval(counterTimer);
  updatePunchButton();
  if (activeSession) {
    counterTimer = window.setInterval(updatePunchButton, 1000);
  }
}

async function refreshActiveSession() {
  const r = await api("/my/work-session/active");
  activeSession = r.session || null;
  serverNow = r.server_now || null;
  if (serverNow?.date && serverNow?.time) {
    serverOffsetMs = new Date(`${serverNow.date}T${serverNow.time}`).getTime() - Date.now();
  }
  startCounter();
  updateStaleRecovery();
  return activeSession;
}

function setSessionModalStatus(msg) {
  const el = $id("work-session-status");
  if (el) el.textContent = msg || "";
}

function setEditStatus(msg) {
  const el = $id("work-entry-edit-status");
  if (el) el.textContent = msg || "";
}

function closeSessionModal() {
  const modal = $id("work-session-modal");
  if (modal) modal.hidden = true;
}

function closeEditModal() {
  const modal = $id("work-entry-edit-modal");
  if (modal) modal.hidden = true;
  editingEntry = null;
}

function closeEntryActionMenus(exceptMenu = null) {
  document.querySelectorAll(".entry-actions-menu").forEach((menu) => {
    if (menu !== exceptMenu) {
      menu.hidden = true;
      menu.style.removeProperty("visibility");
      menu.style.removeProperty("--entry-menu-top");
      menu.style.removeProperty("--entry-menu-left");
    }
  });
  document.querySelectorAll(".entry-menu-button").forEach((button) => {
    const ownsMenu = exceptMenu && button.parentElement?.contains(exceptMenu);
    button.setAttribute("aria-expanded", ownsMenu && !exceptMenu.hidden ? "true" : "false");
  });
}

function positionEntryActionMenu(button, menu) {
  const gap = 6;
  const margin = 8;
  const buttonRect = button.getBoundingClientRect();
  const menuRect = menu.getBoundingClientRect();
  let left = buttonRect.right - menuRect.width;
  let top = buttonRect.bottom + gap;

  if (left < margin) left = margin;
  if (left + menuRect.width > window.innerWidth - margin) {
    left = Math.max(margin, window.innerWidth - menuRect.width - margin);
  }
  if (top + menuRect.height > window.innerHeight - margin) {
    top = Math.max(margin, buttonRect.top - menuRect.height - gap);
  }

  menu.style.setProperty("--entry-menu-left", `${Math.round(left)}px`);
  menu.style.setProperty("--entry-menu-top", `${Math.round(top)}px`);
}

async function openSessionModal(mode) {
  await refreshActiveSession();
  const isStop = mode === "stop";
  const modal = $id("work-session-modal");
  const title = $id("work-session-title");
  const subtitle = $id("work-session-subtitle");
  const projectRow = $id("work-session-project-row");
  const projectSelect = $id("work-session-project");
  const dateInput = $id("work-session-date");
  const timeSelect = $id("work-session-time");
  const notesRow = $id("work-session-notes-row");
  const notesInput = $id("work-session-notes");
  const saveBtn = $id("btn-work-session-save");

  setSessionModalStatus("");
  modal.dataset.mode = isStop ? "stop" : "start";
  title.textContent = isStop ? "Stop work" : "Start work";
  title.textContent = isStop ? t("stopWork") : t("startWork");
  subtitle.textContent = isStop ? t("stopSubtitle") : t("startSubtitle");
  projectRow.hidden = isStop;
  notesRow.hidden = !isStop;
  saveBtn.textContent = isStop ? t("stop") : t("start");
  saveBtn.disabled = false;
  timeSelect.disabled = false;

  dateInput.value = isStop ? activeSession?.work_date : (serverNow?.date || localToday());
  dateInput.max = serverNow?.date || localToday();
  fillProjectSelect(projectSelect, { placeholder: true });
  projectSelect.value = "";

  const maxTime = currentMaxTime();
  let minTime = isStop ? String(activeSession?.start_time || "").slice(0, 5) : "00:00";
  let selectedTime = maxTime;
  if (!isStop) {
    const entries = await getEntriesForDate(dateInput.value);
    minTime = nextAvailableStartTime(entries, dateInput.value);
    selectedTime = timeToMinutes(maxTime) >= timeToMinutes(minTime) ? maxTime : "";
  }
  populateTimeSelect(timeSelect, selectedTime, { minTime, maxTime, includeSelected: isStop });
  if (!isStop && timeSelect.options.length === 0) {
    timeSelect.disabled = true;
    saveBtn.disabled = true;
    setSessionModalStatus(formatStartUnavailable(minTime));
  }
  if (notesInput) notesInput.value = "";
  modal.hidden = false;
}

async function saveSessionModal() {
  const mode = $id("work-session-modal").dataset.mode;
  const saveBtn = $id("btn-work-session-save");
  const projectId = $id("work-session-project").value;
  const workDate = $id("work-session-date").value;
  const time = $id("work-session-time").value;
  const notes = $id("work-session-notes").value;

  try {
    const validationMessage = mode === "stop"
      ? await validateEntryInterval({ workDate: activeSession?.work_date, startTime: activeSession?.start_time, endTime: time })
      : await validateSessionStart({ projectId, workDate, startTime: time });
    if (validationMessage) {
      setSessionModalStatus(validationMessage);
      return;
    }

    saveBtn.disabled = true;
    setSessionModalStatus(mode === "stop" ? t("stopping") : t("starting"));
    if (mode === "stop") {
      await api("/my/work-session/stop", {
        method: "POST",
        body: JSON.stringify({ end_time: time, notes }),
      });
      setStatus(t("workSaved"));
    } else {
      await api("/my/work-session/start", {
        method: "POST",
        body: JSON.stringify({ project_id: Number(projectId || 0), work_date: workDate, start_time: time }),
      });
      setStatus(t("workStarted"));
    }
    closeSessionModal();
    await refreshActiveSession();
    await loadEntries();
  } catch (e) {
    setSessionModalStatus(localizeApiError(e));
  } finally {
    saveBtn.disabled = false;
  }
}

async function recoverCloseSession() {
  const saveBtn = $id("btn-stale-close");
  try {
    const validationMessage = await validateEntryInterval({
      workDate: activeSession?.work_date,
      startTime: activeSession?.start_time,
      endTime: $id("stale-end-time").value,
    });
    if (validationMessage) {
      $id("stale-session-status").textContent = validationMessage;
      return;
    }

    saveBtn.disabled = true;
    $id("stale-session-status").textContent = t("recovering");
    await api("/my/work-session/recover-close", {
      method: "POST",
      body: JSON.stringify({
        end_time: $id("stale-end-time").value,
        notes: $id("stale-notes").value,
      }),
    });
    $id("stale-notes").value = "";
    setStatus(t("sessionRecovered"));
    await refreshActiveSession();
    await loadEntries();
  } catch (e) {
    $id("stale-session-status").textContent = localizeApiError(e);
  } finally {
    saveBtn.disabled = false;
  }
}

async function discardStaleSession() {
  if (!confirm(t("discardConfirm"))) return;
  const discardBtn = $id("btn-stale-discard");
  try {
    discardBtn.disabled = true;
    $id("stale-session-status").textContent = t("discarding");
    await api("/my/work-session/discard", { method: "POST" });
    $id("stale-notes").value = "";
    setStatus(t("sessionDiscarded"));
    await refreshActiveSession();
    await loadEntries();
  } catch (e) {
    $id("stale-session-status").textContent = localizeApiError(e);
  } finally {
    discardBtn.disabled = false;
  }
}

function makeEntryCard(e) {
  const card = document.createElement("div");
  card.className = "entry-card";

  const meta = document.createElement("div");
  meta.className = "entry-meta";

  const title = document.createElement("div");
  title.className = "entry-title";
  title.textContent = `${e.work_date} - ${e.project_name}`;

  const time = document.createElement("div");
  time.className = "entry-time";
  const st = String(e.start_time || "").slice(0, 5);
  const et = String(e.end_time || "").slice(0, 5);
  time.textContent = `${st} - ${et}`;

  const notes = document.createElement("div");
  notes.className = "entry-notes";
  notes.textContent = String(e.notes || "");

  meta.appendChild(title);
  meta.appendChild(time);
  if (notes.textContent.trim()) meta.appendChild(notes);

  const actions = document.createElement("div");
  actions.className = "entry-actions";

  const menuButton = document.createElement("button");
  menuButton.className = "entry-menu-button";
  menuButton.type = "button";
  menuButton.setAttribute("aria-label", `${t("edit")} / ${t("delete")}`);
  menuButton.setAttribute("aria-haspopup", "menu");
  menuButton.setAttribute("aria-expanded", "false");

  const menu = document.createElement("div");
  menu.className = "entry-actions-menu";
  menu.setAttribute("role", "menu");
  menu.hidden = true;

  const btnEdit = document.createElement("button");
  btnEdit.className = "entry-menu-item";
  btnEdit.type = "button";
  btnEdit.setAttribute("role", "menuitem");
  btnEdit.textContent = t("edit");
  btnEdit.addEventListener("click", () => {
    closeEntryActionMenus();
    refreshActiveSession()
      .catch(() => {})
      .finally(() => openEditModal(e));
  });

  const btnDel = document.createElement("button");
  btnDel.className = "entry-menu-item entry-menu-item-danger";
  btnDel.type = "button";
  btnDel.setAttribute("role", "menuitem");
  btnDel.textContent = t("delete");
  btnDel.addEventListener("click", async () => {
    closeEntryActionMenus();
    if (!confirm(t("deleteEntryConfirm"))) return;
    await api(`/my/work-entries/${e.id}`, { method: "DELETE" });
    await loadEntries();
  });

  menuButton.addEventListener("click", (event) => {
    event.stopPropagation();
    const willOpen = menu.hidden;
    closeEntryActionMenus();
    menuButton.setAttribute("aria-expanded", willOpen ? "true" : "false");
    if (willOpen) {
      menu.style.visibility = "hidden";
      menu.hidden = false;
      window.requestAnimationFrame(() => {
        positionEntryActionMenu(menuButton, menu);
        menu.style.removeProperty("visibility");
      });
    } else {
      menu.hidden = true;
      menu.style.removeProperty("visibility");
    }
  });
  menu.addEventListener("click", (event) => event.stopPropagation());

  menu.append(btnEdit, btnDel);
  actions.append(menuButton, menu);
  card.appendChild(meta);
  card.appendChild(actions);
  return card;
}

function refreshEditTimeOptions() {
  const date = $id("edit-work-date").value;
  const maxTime = date === (serverNow?.date || localToday()) ? currentMaxTime() : "23:55";
  populateTimeSelect($id("edit-start-time"), $id("edit-start-time").value, { maxTime });
  populateTimeSelect($id("edit-end-time"), $id("edit-end-time").value, { maxTime });
}

function openEditModal(entry) {
  editingEntry = entry;
  const modal = $id("work-entry-edit-modal");
  const today = serverNow?.date || localToday();
  fillProjectSelect($id("edit-project"));
  $id("edit-project").value = String(entry.project_id);
  $id("edit-work-date").value = entry.work_date;
  $id("edit-work-date").max = today;
  const maxTime = entry.work_date === today ? currentMaxTime() : "23:55";
  populateTimeSelect($id("edit-start-time"), String(entry.start_time || "").slice(0, 5), { maxTime });
  populateTimeSelect($id("edit-end-time"), String(entry.end_time || "").slice(0, 5), { maxTime });
  $id("edit-notes").value = entry.notes || "";
  setEditStatus("");
  modal.hidden = false;
}

async function saveEditModal() {
  if (!editingEntry) return;
  const saveBtn = $id("btn-work-entry-save");
  const payload = {
    project_id: Number($id("edit-project").value || 0),
    work_date: $id("edit-work-date").value,
    start_time: $id("edit-start-time").value,
    end_time: $id("edit-end-time").value,
    notes: $id("edit-notes").value,
  };

  try {
    const validationMessage = !payload.project_id
      ? t("validationProjectRequired")
      : await validateEntryInterval({
        workDate: payload.work_date,
        startTime: payload.start_time,
        endTime: payload.end_time,
        excludeId: editingEntry.id,
      });
    if (validationMessage) {
      setEditStatus(validationMessage);
      return;
    }

    saveBtn.disabled = true;
    setEditStatus(t("saving"));
    await api(`/my/work-entries/${editingEntry.id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    closeEditModal();
    await loadEntries();
    setStatus(t("entryUpdated"));
  } catch (e) {
    setEditStatus(localizeApiError(e));
  } finally {
    saveBtn.disabled = false;
  }
}

export async function loadProjects() {
  const r = await api("/projects");
  projects = r.projects || [];
  fillProjectSelect($id("work-session-project"), { placeholder: true });
  fillProjectSelect($id("edit-project"));

  const contractorSel = $id("contractor-project");
  if (contractorSel) {
    contractorSel.innerHTML = "";
    for (const p of projects) {
      if (p.is_active === 0) continue;
      const opt = document.createElement("option");
      opt.value = String(p.id);
      opt.textContent = p.name;
      contractorSel.appendChild(opt);
    }
  }
}

export async function loadMe() {
  const r = await api("/auth/me");
  const u = r.user;
  setCurrentUser(u);
  const crumb = $id("crumb");
  crumb.dataset.i18n = "signedIn";
  crumb.textContent = t("signedIn");
  return u;
}

export async function loadEntries() {
  const month = $id("rep-month")?.value || todayMonth();
  const r = await api(`/my/work-entries?month=${encodeURIComponent(month)}`);
  const entries = r.entries || [];
  loadedEntries = entries;

  const holder = $id("rep-entries");
  holder.innerHTML = "";

  if (entries.length === 0) {
    $id("empty").hidden = false;
    return;
  }

  $id("empty").hidden = true;
  for (const e of entries) holder.appendChild(makeEntryCard(e));
}

export async function initWorkReporting() {
  $id("work-punch-button").addEventListener("click", () => {
    openSessionModal(activeSession ? "stop" : "start").catch((e) => setStatus(e.message));
  });
  $id("btn-work-session-close").addEventListener("click", closeSessionModal);
  $id("btn-work-session-save").addEventListener("click", saveSessionModal);
  $id("work-session-modal").addEventListener("click", (e) => {
    if (e.target?.hasAttribute("data-close-work-session")) closeSessionModal();
  });

  $id("btn-work-entry-close").addEventListener("click", closeEditModal);
  $id("btn-work-entry-save").addEventListener("click", saveEditModal);
  $id("work-entry-edit-modal").addEventListener("click", (e) => {
    if (e.target?.hasAttribute("data-close-work-entry")) closeEditModal();
  });
  document.addEventListener("click", () => closeEntryActionMenus());
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeEntryActionMenus();
  });
  document.addEventListener("scroll", () => closeEntryActionMenus(), true);
  window.addEventListener("resize", () => closeEntryActionMenus());
  $id("edit-work-date").addEventListener("change", refreshEditTimeOptions);
  $id("btn-stale-close").addEventListener("click", recoverCloseSession);
  $id("btn-stale-discard").addEventListener("click", discardStaleSession);

  await refreshActiveSession();
}

export function updateWorkReportingText() {
  updatePunchButton();
  fillProjectSelect($id("work-session-project"), { placeholder: true });
  fillProjectSelect($id("edit-project"));
  updateStaleRecovery();
  loadEntries().catch(() => {});
}

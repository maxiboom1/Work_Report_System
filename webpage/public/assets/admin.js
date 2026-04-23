/* =========================================================
   Employee Work Report System — Admin UI
   ========================================================= */

async function api(path, options) {
  const res = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  let body = null;
  try { body = await res.json(); } catch {}
  if (!res.ok) {
    const message = body?.message || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return body;
}

function $id(id) { return document.getElementById(id); }

function todayMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const DEFAULT_ADMIN_SETTINGS = {
  admin_language: "en",
  workday_hours: 9,
};

let ADMIN_SETTINGS = { ...DEFAULT_ADMIN_SETTINGS };

const I18N = {
  en: {
    appTitle: "Work Reports",
    adminPanel: "Admin panel",
    employees: "Employees",
    projects: "Projects",
    stats: "Reports",
    settings: "System settings",
    logout: "Logout",
    employeeTitle: "Employees",
    employeeHint: "Create, edit, and delete employee accounts.",
    employeeList: "Employee list",
    search: "Search...",
    refresh: "Refresh",
    addEmployee: "Add employee",
    editSelected: "Edit selected",
    firstName: "First name",
    lastName: "Last name",
    passport: "Passport ID",
    car: "Car ID",
    card: "Card ID",
    phone: "Phone",
    email: "Email",
    dailyRate: "Daily rate",
    login: "Login",
    password: "Password",
    newPassword: "New password (optional)",
    selected: "Selected",
    none: "None",
    add: "Add",
    save: "Save",
    delete: "Delete",
    optional: "optional",
    keepEmpty: "leave empty to keep",
    projectTitle: "Projects",
    projectHint: "Create, edit, and delete projects.",
    projectList: "Project list",
    addProject: "Add project",
    projectName: "Project name",
    active: "Active",
    activeValue: "active",
    disabledValue: "disabled",
    statsTitle: "Reports",
    statsHint: "Monthly employee or project report.",
    report: "Report",
    type: "Report type",
    month: "Month",
    employee: "Employee",
    project: "Project",
    run: "Show report",
    employeeMonthly: "Employee report",
    projectMonthly: "Project report",
    selectPrompt: "Select...",
    date: "Date",
    start: "Start",
    end: "End",
    notes: "Notes",
    summary: "Summary",
    days: "Days",
    totalDays: "Total days",
    totalHours: "Total hours",
    extraHours: "Extra hours",
    dailyRateHeader: "Daily rate",
    hours: "Hours",
    cost: "Cost",
    employeeCount: "Employees",
    settingsTitle: "System settings",
    settingsHint: "Choose the admin language and workday length.",
    language: "Language",
    workdayHours: "Workday length (hours)",
    saveSettings: "Save settings",
    settingsSaved: "Settings saved",
    ready: "Ready.",
    missingMonth: "Please select month",
    missingEmployee: "Please select employee",
    missingProject: "Please select project",
    deleteEmployeeConfirm: "Delete employee",
    deleteProjectConfirm: "Delete project",
    employeeCreated: "Employee created",
    employeeSaved: "Employee updated",
    employeeDeleted: "Employee deleted",
    projectCreated: "Project created",
    projectSaved: "Project updated",
    projectDeleted: "Project deleted",
  },
  he: {
    appTitle: "דיווחי עבודה",
    adminPanel: "ניהול",
    employees: "עובדים",
    projects: "פרויקטים",
    stats: "דוחות",
    settings: "הגדרות מערכת",
    logout: "יציאה",
    employeeTitle: "עובדים",
    employeeHint: "ניהול עובדים ופרטי התחברות.",
    employeeList: "רשימת עובדים",
    search: "חיפוש...",
    refresh: "רענון",
    addEmployee: "עובד חדש",
    editSelected: "עריכת עובד",
    firstName: "שם פרטי",
    lastName: "שם משפחה",
    passport: "מספר דרכון",
    car: "מספר רכב",
    card: "מספר כרטיס",
    phone: "טלפון",
    email: "אימייל",
    dailyRate: "תעריף יומי",
    login: "שם משתמש",
    password: "סיסמה",
    newPassword: "סיסמה חדשה (לא חובה)",
    selected: "נבחר",
    none: "לא נבחר",
    add: "הוספה",
    save: "שמירה",
    delete: "מחיקה",
    optional: "לא חובה",
    keepEmpty: "להשאיר ריק אם אין שינוי",
    projectTitle: "פרויקטים",
    projectHint: "ניהול רשימת הפרויקטים.",
    projectList: "רשימת פרויקטים",
    addProject: "פרויקט חדש",
    projectName: "שם פרויקט",
    active: "פעיל",
    activeValue: "פעיל",
    disabledValue: "לא פעיל",
    statsTitle: "דוחות",
    statsHint: "דוח חודשי לעובד או לפרויקט.",
    report: "דוח",
    type: "סוג דוח",
    month: "חודש",
    employee: "עובד",
    project: "פרויקט",
    run: "הצג דוח",
    employeeMonthly: "דוח עובד",
    projectMonthly: "דוח פרויקט",
    selectPrompt: "בחירה...",
    date: "תאריך",
    start: "התחלה",
    end: "סיום",
    notes: "הערות",
    summary: "סה״כ",
    days: "ימים",
    totalDays: "סה״כ ימים",
    totalHours: "סה״כ שעות",
    extraHours: "שעות נוספות",
    dailyRateHeader: "תעריף יומי",
    hours: "שעות",
    cost: "עלות",
    employeeCount: "עובדים",
    settingsTitle: "הגדרות מערכת",
    settingsHint: "בחירת שפה ואורך משמרת לחישוב שעות נוספות.",
    language: "שפה",
    workdayHours: "אורך משמרת (בשעות)",
    saveSettings: "שמירת הגדרות",
    settingsSaved: "ההגדרות נשמרו",
    ready: "מוכן.",
    missingMonth: "יש לבחור חודש",
    missingEmployee: "יש לבחור עובד",
    missingProject: "יש לבחור פרויקט",
    deleteEmployeeConfirm: "למחוק עובד",
    deleteProjectConfirm: "למחוק פרויקט",
    employeeCreated: "העובד נוסף",
    employeeSaved: "העובד נשמר",
    employeeDeleted: "העובד נמחק",
    projectCreated: "הפרויקט נוסף",
    projectSaved: "הפרויקט נשמר",
    projectDeleted: "הפרויקט נמחק",
  },
};

function currentLang() {
  return ADMIN_SETTINGS.admin_language === "he" ? "he" : "en";
}

function t(key) {
  return I18N[currentLang()]?.[key] || I18N.en[key] || key;
}

function setText(selector, key) {
  const el = document.querySelector(selector);
  if (el) el.textContent = t(key);
}

function setLabel(forId, key) {
  setText(`label[for="${forId}"]`, key);
}

function setPlaceholder(id, key) {
  const el = $id(id);
  if (el) el.placeholder = t(key);
}

function updateStaticText() {
  document.documentElement.lang = currentLang();
  document.documentElement.dir = currentLang() === "he" ? "rtl" : "ltr";

  setText(".brand-title", "appTitle");
  setText(".brand-sub", "adminPanel");
  setText('.nav-tab[data-tab="employees"]', "employees");
  setText('.nav-tab[data-tab="projects"]', "projects");
  setText('.nav-tab[data-tab="stats"]', "stats");
  setText('.nav-tab[data-tab="settings"]', "settings");
  setText("#btn-logout", "logout");

  setText('.tab-panel[data-panel="employees"] .page-header h1', "employeeTitle");
  setText('.tab-panel[data-panel="employees"] .page-hint', "employeeHint");
  setText('.tab-panel[data-panel="employees"] .pane-title', "employeeList");
  setText("#btn-emp-reload", "refresh");
  setText('.tab-panel[data-panel="employees"] details:nth-of-type(1) summary', "addEmployee");
  setText('.tab-panel[data-panel="employees"] details:nth-of-type(2) summary', "editSelected");

  setLabel("emp-add-first", "firstName");
  setLabel("emp-add-last", "lastName");
  setLabel("emp-add-passport", "passport");
  setLabel("emp-add-car", "car");
  setLabel("emp-add-card", "card");
  setLabel("emp-add-phone", "phone");
  setLabel("emp-add-email", "email");
  setLabel("emp-add-rate", "dailyRate");
  setLabel("emp-add-login", "login");
  setLabel("emp-add-pass", "password");
  setText("#btn-emp-create", "add");

  setLabel("emp-edit-first", "firstName");
  setLabel("emp-edit-last", "lastName");
  setLabel("emp-edit-passport", "passport");
  setLabel("emp-edit-car", "car");
  setLabel("emp-edit-card", "card");
  setLabel("emp-edit-phone", "phone");
  setLabel("emp-edit-email", "email");
  setLabel("emp-edit-rate", "dailyRate");
  setLabel("emp-edit-login", "login");
  setLabel("emp-edit-pass", "newPassword");
  setText("#btn-emp-save", "save");
  setText("#btn-emp-delete", "delete");
  setText('.tab-panel[data-panel="employees"] .form-row .label', "selected");

  setText('.tab-panel[data-panel="projects"] .page-header h1', "projectTitle");
  setText('.tab-panel[data-panel="projects"] .page-hint', "projectHint");
  setText('.tab-panel[data-panel="projects"] .pane-title', "projectList");
  setText("#btn-prj-reload", "refresh");
  setText('.tab-panel[data-panel="projects"] details:nth-of-type(1) summary', "addProject");
  setText('.tab-panel[data-panel="projects"] details:nth-of-type(2) summary', "editSelected");
  setText('.tab-panel[data-panel="projects"] details:nth-of-type(2) .form-row .label', "selected");
  setLabel("prj-add-name", "projectName");
  setLabel("prj-edit-name", "projectName");
  setLabel("prj-edit-active", "active");
  setText("#btn-prj-create", "add");
  setText("#btn-prj-save", "save");
  setText("#btn-prj-delete", "delete");

  setText('.tab-panel[data-panel="stats"] .page-header h1', "statsTitle");
  setText('.tab-panel[data-panel="stats"] .page-hint', "statsHint");
  setText('.tab-panel[data-panel="stats"] .pane-title', "report");
  setLabel("stats-mode", "type");
  setLabel("stats-month", "month");
  setLabel("stats-emp", "employee");
  setLabel("stats-prj", "project");
  setText("#btn-stats-run", "run");

  setText('.tab-panel[data-panel="settings"] .page-header h1', "settingsTitle");
  setText('.tab-panel[data-panel="settings"] .page-hint', "settingsHint");
  setLabel("setting-language", "language");
  setLabel("setting-workday-hours", "workdayHours");
  setText("#btn-settings-save", "saveSettings");

  setText("#admin-status", "ready");

  setPlaceholder("emp-search", "search");
  setPlaceholder("prj-search", "search");
  setPlaceholder("emp-add-passport", "optional");
  setPlaceholder("emp-add-car", "optional");
  setPlaceholder("emp-add-card", "optional");
  setPlaceholder("emp-add-phone", "optional");
  setPlaceholder("emp-add-email", "optional");
  setPlaceholder("emp-edit-passport", "optional");
  setPlaceholder("emp-edit-car", "optional");
  setPlaceholder("emp-edit-card", "optional");
  setPlaceholder("emp-edit-phone", "optional");
  setPlaceholder("emp-edit-email", "optional");
  setPlaceholder("emp-edit-pass", "keepEmpty");

  const statsMode = $id("stats-mode");
  if (statsMode) {
    statsMode.querySelector('option[value="employee"]').textContent = t("employeeMonthly");
    statsMode.querySelector('option[value="project"]').textContent = t("projectMonthly");
  }

  const activeOpt = $id("prj-edit-active");
  if (activeOpt) {
    activeOpt.querySelector('option[value="1"]').textContent = t("activeValue");
    activeOpt.querySelector('option[value="0"]').textContent = t("disabledValue");
  }

  fillStatsPickers();
  fillEmployeeEdit(selectedEmployee);
  fillProjectEdit(selectedProject);
  if ($id("emp-list")) renderEmployeeList($id("emp-search")?.value || "");
  if ($id("prj-list")) renderProjectList($id("prj-search")?.value || "");
}

// =========================
// Tabs
// =========================

function initTabs() {
  const tabs = Array.from(document.querySelectorAll(".nav-tab"));
  const panels = Array.from(document.querySelectorAll(".tab-panel"));

  // Accordion behavior for <details> sections:
  // - only one open at a time per visible panel
  // - start with all closed
  function closeAllDetails(scope = document) {
    scope.querySelectorAll("details").forEach((d) => { d.open = false; });
  }

  function wireAccordion(scope = document) {
    const all = Array.from(scope.querySelectorAll("details"));
    for (const d of all) {
      if (d.dataset.accWired === "1") continue;
      d.dataset.accWired = "1";
      d.addEventListener("toggle", () => {
        if (!d.open) return;
        // Close other details in the same tab-panel (preferred), otherwise in provided scope.
        const panel = d.closest(".tab-panel") || scope;
        panel.querySelectorAll("details").forEach((other) => {
          if (other !== d) other.open = false;
        });
      });
    }
  }

  function show(key) {
    tabs.forEach((t) => t.classList.toggle("active", t.dataset.tab === key));
    panels.forEach((p) => p.classList.toggle("is-active", p.dataset.panel === key));

    // When switching tabs, ensure all <details> are closed.
    closeAllDetails(document);
  }

  tabs.forEach((t) => t.addEventListener("click", () => show(t.dataset.tab)));
  // Wire accordion behavior once, then start from a fully collapsed state.
  wireAccordion(document);
  closeAllDetails(document);
  show("employees");
}

// =========================
// Employees
// =========================

let EMPLOYEES = [];
let selectedEmployee = null;

function renderEmployeeList(filter = "") {
  const list = $id("emp-list");
  list.innerHTML = "";
  const f = filter.toLowerCase();
  const rows = EMPLOYEES.filter((e) => {
    // Admin user is not returned from the API, but keep this filter defensive.
    if (String(e.role || "").toLowerCase() === "admin") return false;
    const s = `${e.first_name} ${e.last_name} ${e.login}`.toLowerCase();
    return !f || s.includes(f);
  });

  for (const e of rows) {
    const item = document.createElement("button");
    item.className = "vitem";
    item.type = "button";
    item.textContent = `${e.last_name}, ${e.first_name}`;
    item.dataset.id = e.id;
    if (selectedEmployee?.id === e.id) item.classList.add("active");
    item.addEventListener("click", () => selectEmployee(e.id));
    list.appendChild(item);
  }
}

function fillEmployeeEdit(e) {
  $id("emp-selected").textContent = e ? `${e.last_name}, ${e.first_name}` : t("none");
  $id("emp-edit-first").value = e?.first_name || "";
  $id("emp-edit-last").value = e?.last_name || "";
  // Optional IDs
  const passportEl = document.getElementById("emp-edit-passport");
  const carEl = document.getElementById("emp-edit-car");
  const cardEl = document.getElementById("emp-edit-card");
  const phoneEl = document.getElementById("emp-edit-phone");
  const emailEl = document.getElementById("emp-edit-email");
  if (passportEl) passportEl.value = e?.passport_id || "";
  if (carEl) carEl.value = e?.car_id || "";
  if (cardEl) cardEl.value = e?.card_id || "";
  if (phoneEl) phoneEl.value = e?.phone || "";
  if (emailEl) emailEl.value = e?.email || "";
  $id("emp-edit-rate").value = (e?.daily_rate ?? "");
  $id("emp-edit-login").value = e?.login || "";
  $id("emp-edit-pass").value = "";
}

function selectEmployee(id) {
  selectedEmployee = EMPLOYEES.find((x) => String(x.id) === String(id)) || null;
  fillEmployeeEdit(selectedEmployee);
  renderEmployeeList($id("emp-search").value);
}

async function loadEmployees() {
  const r = await api("/admin/employees");
  EMPLOYEES = r.employees || [];
  if (selectedEmployee) {
    const still = EMPLOYEES.find((x) => x.id === selectedEmployee.id);
    selectedEmployee = still || null;
  }
  renderEmployeeList($id("emp-search").value);
  fillEmployeeEdit(selectedEmployee);
}

async function createEmployee() {
  const payload = {
    first_name: $id("emp-add-first").value,
    last_name: $id("emp-add-last").value,
    passport_id: ($id("emp-add-passport")?.value || ""),
    car_id: ($id("emp-add-car")?.value || ""),
    card_id: ($id("emp-add-card")?.value || ""),
    phone: ($id("emp-add-phone")?.value || ""),
    email: ($id("emp-add-email")?.value || ""),
    daily_rate: Number($id("emp-add-rate").value),
    login: $id("emp-add-login").value,
    password: $id("emp-add-pass").value,
  };
  const r = await api("/admin/employees", { method: "POST", body: JSON.stringify(payload) });
  $id("emp-add-note").textContent = r.message ? t("employeeCreated") : t("employeeCreated");
  $id("emp-add-pass").value = "";
  await loadEmployees();
}

async function saveEmployee() {
  if (!selectedEmployee) return;
  const payload = {
    first_name: $id("emp-edit-first").value,
    last_name: $id("emp-edit-last").value,
    passport_id: ($id("emp-edit-passport")?.value || ""),
    car_id: ($id("emp-edit-car")?.value || ""),
    card_id: ($id("emp-edit-card")?.value || ""),
    phone: ($id("emp-edit-phone")?.value || ""),
    email: ($id("emp-edit-email")?.value || ""),
    daily_rate: Number($id("emp-edit-rate").value),
    login: $id("emp-edit-login").value,
    password: $id("emp-edit-pass").value,
  };
  const r = await api(`/admin/employees/${selectedEmployee.id}`, { method: "PUT", body: JSON.stringify(payload) });
  $id("emp-edit-note").textContent = r.message ? t("employeeSaved") : t("employeeSaved");
  await loadEmployees();
}

async function deleteEmployee() {
  if (!selectedEmployee) return;
  if (!confirm(`${t("deleteEmployeeConfirm")} ${selectedEmployee.first_name} ${selectedEmployee.last_name}?`)) return;
  const r = await api(`/admin/employees/${selectedEmployee.id}`, { method: "DELETE" });
  $id("emp-edit-note").textContent = r.message ? t("employeeDeleted") : t("employeeDeleted");
  selectedEmployee = null;
  await loadEmployees();
}

// =========================
// Projects
// =========================

let PROJECTS = [];
let selectedProject = null;

function renderProjectList(filter = "") {
  const list = $id("prj-list");
  list.innerHTML = "";
  const f = filter.toLowerCase();
  const rows = PROJECTS.filter((p) => !f || String(p.name || "").toLowerCase().includes(f));

  for (const p of rows) {
    const item = document.createElement("button");
    item.className = "vitem";
    item.type = "button";
    const suffix = p.is_active ? "" : ` (${t("disabledValue")})`;
    item.textContent = `${p.name}${suffix}`;
    if (selectedProject?.id === p.id) item.classList.add("active");
    item.addEventListener("click", () => selectProject(p.id));
    list.appendChild(item);
  }
}

function fillProjectEdit(p) {
  $id("prj-selected").textContent = p ? p.name : t("none");
  $id("prj-edit-name").value = p?.name || "";
  $id("prj-edit-active").value = p?.is_active ? "1" : "0";
}

function selectProject(id) {
  selectedProject = PROJECTS.find((x) => String(x.id) === String(id)) || null;
  fillProjectEdit(selectedProject);
  renderProjectList($id("prj-search").value);
}

async function loadProjects() {
  const r = await api("/admin/projects");
  PROJECTS = r.projects || [];
  if (selectedProject) {
    const still = PROJECTS.find((x) => x.id === selectedProject.id);
    selectedProject = still || null;
  }
  renderProjectList($id("prj-search").value);
  fillProjectEdit(selectedProject);
  fillStatsPickers();
}

async function createProject() {
  const name = $id("prj-add-name").value;
  const r = await api("/admin/projects", { method: "POST", body: JSON.stringify({ name }) });
  $id("prj-add-note").textContent = r.message ? t("projectCreated") : t("projectCreated");
  $id("prj-add-name").value = "";
  await loadProjects();
}

async function saveProject() {
  if (!selectedProject) return;
  const payload = {
    name: $id("prj-edit-name").value,
    is_active: $id("prj-edit-active").value === "1",
  };
  const r = await api(`/admin/projects/${selectedProject.id}`, { method: "PUT", body: JSON.stringify(payload) });
  $id("prj-edit-note").textContent = r.message ? t("projectSaved") : t("projectSaved");
  await loadProjects();
}

async function deleteProject() {
  if (!selectedProject) return;
  if (!confirm(`${t("deleteProjectConfirm")} ${selectedProject.name}?`)) return;
  const r = await api(`/admin/projects/${selectedProject.id}`, { method: "DELETE" });
  $id("prj-edit-note").textContent = r.message ? t("projectDeleted") : t("projectDeleted");
  selectedProject = null;
  await loadProjects();
}

// =========================
// Statistics
// =========================

function fillStatsPickers() {
  const empSel = $id("stats-emp");
  const prjSel = $id("stats-prj");
  if (!empSel || !prjSel) return;
  const selectedEmp = empSel.value;
  const selectedPrj = prjSel.value;

  empSel.innerHTML = "";
  const empPrompt = document.createElement("option");
  empPrompt.value = "";
  empPrompt.textContent = t("selectPrompt");
  empSel.appendChild(empPrompt);
  for (const e of EMPLOYEES) {
    const opt = document.createElement("option");
    opt.value = e.id;
    opt.textContent = `${e.last_name}, ${e.first_name}`;
    empSel.appendChild(opt);
  }
  if (selectedEmp) empSel.value = selectedEmp;

  prjSel.innerHTML = "";
  const prjPrompt = document.createElement("option");
  prjPrompt.value = "";
  prjPrompt.textContent = t("selectPrompt");
  prjSel.appendChild(prjPrompt);
  for (const p of PROJECTS) {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = p.name;
    prjSel.appendChild(opt);
  }
  if (selectedPrj) prjSel.value = selectedPrj;
}

function setStatsMode(mode) {
  const isEmp = mode === "employee";
  $id("stats-emp-row").classList.toggle("is-hidden", !isEmp);
  $id("stats-prj-row").classList.toggle("is-hidden", isEmp);
  $id("stats-table").innerHTML = "";
  $id("stats-summary").textContent = "";
}

function initMonthPickers() {
  document.querySelectorAll("[data-month-picker]").forEach((button) => {
    const input = $id(button.dataset.monthPicker);
    if (!input) return;

    button.addEventListener("click", () => {
      input.focus({ preventScroll: true });
      try {
        if (typeof input.showPicker === "function") {
          input.showPicker();
          return;
        }
      } catch {}
      input.click();
    });
  });
}

function formatHours(value) {
  return Number(value || 0).toFixed(2).replace(/\.00$/, "");
}

function renderTable(headers, rows, options = {}) {
  const { summaryRow = null, rowClassName = null } = options;
  const table = document.createElement("table");
  table.className = "table";

  const thead = document.createElement("thead");
  const trh = document.createElement("tr");
  headers.forEach((h) => {
    const th = document.createElement("th");
    th.textContent = h;
    trh.appendChild(th);
  });
  thead.appendChild(trh);

  const tbody = document.createElement("tbody");

  rows.forEach((r) => {
    const tr = document.createElement("tr");
    if (typeof rowClassName === "function") {
      const className = rowClassName(r);
      if (className) tr.className = className;
    }
    r.cells.forEach((c) => {
      const td = document.createElement("td");
      td.textContent = c;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  if (summaryRow) {
    const tr = document.createElement("tr");
    tr.className = "summary-row";
    summaryRow.forEach((c) => {
      const td = document.createElement("td");
      td.textContent = c;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  }

  table.appendChild(thead);
  table.appendChild(tbody);
  return table;
}

async function runStats() {
  const mode = $id("stats-mode").value;
  const month = $id("stats-month").value;

  if (!month) throw new Error(t("missingMonth"));

  if (mode === "employee") {
    const empId = $id("stats-emp").value;
    if (!empId) throw new Error(t("missingEmployee"));

    const r = await api(`/admin/reports/employee/${empId}?month=${encodeURIComponent(month)}`);

    const rows = (r.rows || []).map((x) => ({
      isExtraHours: Boolean(x.is_extra_hours),
      cells: [
        String(x.work_date).slice(0, 10),
        String(x.start_time).slice(0, 5),
        String(x.end_time).slice(0, 5),
        x.project_name,
        x.notes || "",
      ],
    }));

    const totalDays = r.totals?.days ?? 0;
    const totalHours = r.totals?.hours ?? 0;
    const totalExtraHours = r.totals?.extra_hours ?? 0;

    const summaryRow = [t("summary"), "", "", "", `${t("days")}: ${totalDays} | ${t("extraHours")}: ${formatHours(totalExtraHours)}`];

    const table = renderTable([t("date"), t("start"), t("end"), t("project"), t("notes")], rows, {
      summaryRow,
      rowClassName: (row) => row.isExtraHours ? "overtime-row" : "",
    });
    $id("stats-table").innerHTML = "";
    $id("stats-table").appendChild(table);
    $id("stats-summary").textContent = `${t("totalDays")}: ${totalDays} | ${t("totalHours")}: ${formatHours(totalHours)} | ${t("extraHours")}: ${formatHours(totalExtraHours)}`;
  } else {
    const prjId = $id("stats-prj").value;
    if (!prjId) throw new Error(t("missingProject"));

    const r = await api(`/admin/reports/project/${prjId}?month=${encodeURIComponent(month)}`);

    const rows = (r.employees || []).map((e) => ({
      cells: [
        `${e.last_name}, ${e.first_name}`,
        String(e.daily_rate),
        String(e.days),
        formatHours(e.hours),
        formatHours(e.cost),
      ],
    }));

    const totals = r.totals || {};
    const summaryRow = [
      t("summary"),
      "",
      String(totals.days ?? 0),
      String(totals.hours ?? 0),
      String(totals.cost ?? 0),
    ];

    const table = renderTable([t("employee"), t("dailyRateHeader"), t("days"), t("hours"), t("cost")], rows, { summaryRow });
    $id("stats-table").innerHTML = "";
    $id("stats-table").appendChild(table);

    // Required top line
    $id("stats-summary").textContent = `${t("employeeCount")}: ${totals.employeeCount ?? 0} | ${t("totalHours")}: ${formatHours(totals.hours)} | ${t("cost")}: ${formatHours(totals.cost)}`;
  }
}

// =========================
// Settings
// =========================

async function loadSettings() {
  const r = await api("/admin/settings");
  ADMIN_SETTINGS = { ...DEFAULT_ADMIN_SETTINGS, ...(r.settings || {}) };
  fillSettingsForm();
  updateStaticText();
}

function fillSettingsForm() {
  if ($id("setting-language")) $id("setting-language").value = ADMIN_SETTINGS.admin_language || "en";
  if ($id("setting-workday-hours")) $id("setting-workday-hours").value = ADMIN_SETTINGS.workday_hours ?? 9;
}

async function saveSettings() {
  const payload = {
    admin_language: $id("setting-language").value,
    workday_hours: Number($id("setting-workday-hours").value),
  };
  const r = await api("/admin/settings", { method: "PUT", body: JSON.stringify(payload) });
  ADMIN_SETTINGS = { ...DEFAULT_ADMIN_SETTINGS, ...(r.settings || {}) };
  fillSettingsForm();
  updateStaticText();
  $id("settings-note").textContent = t("settingsSaved");
  $id("stats-table").innerHTML = "";
  $id("stats-summary").textContent = "";
}

// =========================
// Logout
// =========================

async function logout() {
  try { await api("/auth/logout", { method: "POST" }); } catch {}
  window.location.href = "/login.html";
}

// =========================
// Init
// =========================

async function init() {
  await loadSettings();
  initTabs();
  updateStaticText();

  $id("btn-logout").addEventListener("click", logout);

  // Employees
  $id("btn-emp-reload").addEventListener("click", loadEmployees);
  $id("emp-search").addEventListener("input", () => renderEmployeeList($id("emp-search").value));
  $id("btn-emp-create").addEventListener("click", async () => {
    try { await createEmployee(); } catch (e) { $id("emp-add-note").textContent = e.message; }
  });
  $id("btn-emp-save").addEventListener("click", async () => {
    try { await saveEmployee(); } catch (e) { $id("emp-edit-note").textContent = e.message; }
  });
  $id("btn-emp-delete").addEventListener("click", async () => {
    try { await deleteEmployee(); } catch (e) { $id("emp-edit-note").textContent = e.message; }
  });

  // Projects
  $id("btn-prj-reload").addEventListener("click", loadProjects);
  $id("prj-search").addEventListener("input", () => renderProjectList($id("prj-search").value));
  $id("btn-prj-create").addEventListener("click", async () => {
    try { await createProject(); } catch (e) { $id("prj-add-note").textContent = e.message; }
  });
  $id("btn-prj-save").addEventListener("click", async () => {
    try { await saveProject(); } catch (e) { $id("prj-edit-note").textContent = e.message; }
  });
  $id("btn-prj-delete").addEventListener("click", async () => {
    try { await deleteProject(); } catch (e) { $id("prj-edit-note").textContent = e.message; }
  });

  // Settings
  $id("setting-language").addEventListener("change", () => {
    ADMIN_SETTINGS.admin_language = $id("setting-language").value;
    updateStaticText();
  });
  $id("btn-settings-save").addEventListener("click", async () => {
    try { await saveSettings(); } catch (e) { $id("settings-note").textContent = e.message; }
  });

  // Stats
  $id("stats-month").value = todayMonth();
  initMonthPickers();
  $id("stats-mode").addEventListener("change", () => setStatsMode($id("stats-mode").value));
  $id("btn-stats-run").addEventListener("click", async () => {
    try { await runStats(); } catch (e) { $id("stats-summary").textContent = e.message; }
  });
  setStatsMode("employee");

  // Load data
  await loadEmployees();
  await loadProjects();
}

init().catch((e) => {
  console.error(e);
  alert(e?.message || "Failed to load admin page");
});

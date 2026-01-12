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

// =========================
// Tabs
// =========================

function initTabs() {
  const tabs = Array.from(document.querySelectorAll(".nav-tab"));
  const panels = Array.from(document.querySelectorAll(".tab-panel"));

  function show(key) {
    tabs.forEach((t) => t.classList.toggle("active", t.dataset.tab === key));
    panels.forEach((p) => p.classList.toggle("is-active", p.dataset.panel === key));
  }

  tabs.forEach((t) => t.addEventListener("click", () => show(t.dataset.tab)));
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
  $id("emp-selected").textContent = e ? `${e.last_name}, ${e.first_name}` : "None";
  $id("emp-edit-first").value = e?.first_name || "";
  $id("emp-edit-last").value = e?.last_name || "";
  $id("emp-edit-rate").value = (e?.daily_rate ?? "");
  $id("emp-edit-login").value = e?.login || "";
  $id("emp-edit-pass").value = "";
  $id("emp-edit-active").value = (e?.is_active ? "1" : "0");
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
    daily_rate: Number($id("emp-add-rate").value),
    login: $id("emp-add-login").value,
    password: $id("emp-add-pass").value,
  };
  const r = await api("/admin/employees", { method: "POST", body: JSON.stringify(payload) });
  $id("emp-add-note").textContent = r.message || "Created";
  $id("emp-add-pass").value = "";
  await loadEmployees();
}

async function saveEmployee() {
  if (!selectedEmployee) return;
  const payload = {
    first_name: $id("emp-edit-first").value,
    last_name: $id("emp-edit-last").value,
    daily_rate: Number($id("emp-edit-rate").value),
    login: $id("emp-edit-login").value,
    password: $id("emp-edit-pass").value,
    is_active: $id("emp-edit-active").value === "1",
  };
  const r = await api(`/admin/employees/${selectedEmployee.id}`, { method: "PUT", body: JSON.stringify(payload) });
  $id("emp-edit-note").textContent = r.message || "Saved";
  await loadEmployees();
}

async function deleteEmployee() {
  if (!selectedEmployee) return;
  if (!confirm(`Delete employee ${selectedEmployee.first_name} ${selectedEmployee.last_name}?`)) return;
  const r = await api(`/admin/employees/${selectedEmployee.id}`, { method: "DELETE" });
  $id("emp-edit-note").textContent = r.message || "Deleted";
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
    const suffix = p.is_active ? "" : " (disabled)";
    item.textContent = `${p.name}${suffix}`;
    if (selectedProject?.id === p.id) item.classList.add("active");
    item.addEventListener("click", () => selectProject(p.id));
    list.appendChild(item);
  }
}

function fillProjectEdit(p) {
  $id("prj-selected").textContent = p ? p.name : "None";
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
  $id("prj-add-note").textContent = r.message || "Created";
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
  $id("prj-edit-note").textContent = r.message || "Saved";
  await loadProjects();
}

async function deleteProject() {
  if (!selectedProject) return;
  if (!confirm(`Delete project ${selectedProject.name}?`)) return;
  const r = await api(`/admin/projects/${selectedProject.id}`, { method: "DELETE" });
  $id("prj-edit-note").textContent = r.message || "Deleted";
  selectedProject = null;
  await loadProjects();
}

// =========================
// Statistics
// =========================

function fillStatsPickers() {
  const empSel = $id("stats-emp");
  const prjSel = $id("stats-prj");

  empSel.innerHTML = '<option value="">Select...</option>';
  for (const e of EMPLOYEES) {
    const opt = document.createElement("option");
    opt.value = e.id;
    opt.textContent = `${e.last_name}, ${e.first_name}`;
    empSel.appendChild(opt);
  }

  prjSel.innerHTML = '<option value="">Select...</option>';
  for (const p of PROJECTS) {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = p.name;
    prjSel.appendChild(opt);
  }
}

function setStatsMode(mode) {
  const isEmp = mode === "employee";
  $id("stats-emp-row").classList.toggle("is-hidden", !isEmp);
  $id("stats-prj-row").classList.toggle("is-hidden", isEmp);
  $id("stats-table").innerHTML = "";
  $id("stats-summary").textContent = "";
}

function renderTable(headers, rows, summaryRow = null) {
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
    r.forEach((c) => {
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

  if (!month) throw new Error("Please select month");

  if (mode === "employee") {
    const empId = $id("stats-emp").value;
    if (!empId) throw new Error("Please select employee");

    const r = await api(`/admin/reports/employee/${empId}?month=${encodeURIComponent(month)}`);

    const rows = (r.rows || []).map((x) => [
      String(x.work_date).slice(0, 10),
      String(x.start_time).slice(0, 5),
      String(x.end_time).slice(0, 5),
      x.project_name,
      x.notes || "",
    ]);

    const totalDays = r.totals?.days ?? 0;
    const totalHours = r.totals?.hours ?? 0;

    const summaryRow = ["Summary", "", "", "", `Total days: ${totalDays}`];

    const table = renderTable(["Date", "Start", "End", "Project", "Notes"], rows, summaryRow);
    $id("stats-table").innerHTML = "";
    $id("stats-table").appendChild(table);
    $id("stats-summary").textContent = `Total days: ${totalDays} | Total hours: ${totalHours}`;
  } else {
    const prjId = $id("stats-prj").value;
    if (!prjId) throw new Error("Please select project");

    const r = await api(`/admin/reports/project/${prjId}?month=${encodeURIComponent(month)}`);

    const rows = (r.employees || []).map((e) => [
      `${e.last_name}, ${e.first_name}`,
      String(e.daily_rate),
      String(e.days),
      String(e.hours),
      String(e.cost),
    ]);

    const totals = r.totals || {};
    const summaryRow = [
      "Summary",
      "",
      String(totals.days ?? 0),
      String(totals.hours ?? 0),
      String(totals.cost ?? 0),
    ];

    const table = renderTable(["Employee", "Daily rate", "Days", "Hours", "Cost"], rows, summaryRow);
    $id("stats-table").innerHTML = "";
    $id("stats-table").appendChild(table);

    // Required top line
    $id("stats-summary").textContent = `Employees: ${totals.employeeCount ?? 0} | Total hours: ${totals.hours ?? 0} | Total cost: ${totals.cost ?? 0}`;
  }
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
  initTabs();

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

  // Stats
  $id("stats-month").value = todayMonth();
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

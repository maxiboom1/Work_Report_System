import { api } from "../shared/api.js";
import { $id } from "../shared/dom.js";
import { t } from "./i18n.js";

export let EMPLOYEES = [];
export let selectedEmployee = null;

export function renderEmployeeList(filter = "") {
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
    const name = document.createElement("span");
    name.textContent = `${e.last_name}, ${e.first_name}`;
    item.appendChild(name);
    if (e.is_manager) {
      const badge = document.createElement("span");
      badge.className = "muted";
      badge.textContent = ` ${t("manager")}`;
      item.appendChild(badge);
    }
    item.dataset.id = e.id;
    if (selectedEmployee?.id === e.id) item.classList.add("active");
    item.addEventListener("click", () => selectEmployee(e.id));
    list.appendChild(item);
  }
}

export function fillEmployeeEdit(e) {
  $id("emp-selected").textContent = e ? `${e.last_name}, ${e.first_name}` : t("none");
  $id("emp-edit-first").value = e?.first_name || "";
  $id("emp-edit-last").value = e?.last_name || "";
  // Optional IDs
  const passportEl = document.getElementById("emp-edit-passport");
  const carEl = document.getElementById("emp-edit-car");
  const cardEl = document.getElementById("emp-edit-card");
  const phoneEl = document.getElementById("emp-edit-phone");
  const emailEl = document.getElementById("emp-edit-email");
  const managerEl = document.getElementById("emp-edit-manager");
  if (passportEl) passportEl.value = e?.passport_id || "";
  if (carEl) carEl.value = e?.car_id || "";
  if (cardEl) cardEl.value = e?.card_id || "";
  if (phoneEl) phoneEl.value = e?.phone || "";
  if (emailEl) emailEl.value = e?.email || "";
  if (managerEl) managerEl.checked = Boolean(e?.is_manager);
  $id("emp-edit-rate").value = (e?.daily_rate ?? "");
  $id("emp-edit-login").value = e?.login || "";
  $id("emp-edit-pass").value = "";
}

export function selectEmployee(id) {
  selectedEmployee = EMPLOYEES.find((x) => String(x.id) === String(id)) || null;
  fillEmployeeEdit(selectedEmployee);
  renderEmployeeList($id("emp-search").value);
}

export async function loadEmployees() {
  const r = await api("/admin/employees");
  EMPLOYEES = r.employees || [];
  if (selectedEmployee) {
    const still = EMPLOYEES.find((x) => x.id === selectedEmployee.id);
    selectedEmployee = still || null;
  }
  renderEmployeeList($id("emp-search").value);
  fillEmployeeEdit(selectedEmployee);
}

export async function createEmployee() {
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
    is_manager: $id("emp-add-manager")?.checked || false,
  };
  const r = await api("/admin/employees", { method: "POST", body: JSON.stringify(payload) });
  $id("emp-add-note").textContent = r.message ? t("employeeCreated") : t("employeeCreated");
  $id("emp-add-pass").value = "";
  await loadEmployees();
}

export async function saveEmployee() {
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
    is_manager: $id("emp-edit-manager")?.checked || false,
  };
  const r = await api(`/admin/employees/${selectedEmployee.id}`, { method: "PUT", body: JSON.stringify(payload) });
  $id("emp-edit-note").textContent = r.message ? t("employeeSaved") : t("employeeSaved");
  await loadEmployees();
}

export async function deleteEmployee() {
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


import { api } from "../shared/api.js";
import { $id } from "../shared/dom.js";
import { todayMonth } from "../shared/dates.js";
import { updateAdminLanguage, updateStaticText } from "./i18n.js";
import { initTabs } from "./tabs.js";
import { loadSettings, saveSettings } from "./settings.js";
import { createEmployee, deleteEmployee, loadEmployees, renderEmployeeList, saveEmployee } from "./employees.js";
import { createProject, deleteProject, loadProjects, renderProjectList, saveProject } from "./projects.js";
import { closeClientEditModal, loadClients, openClientEditModal, renderClientContactList, renderClientList, renderClientSiteList, saveClientEditModal, selectedClient, selectedClientContact, selectedClientSite, toggleClientEditModal } from "./clients.js";
import { clearFaultFilters, closeFaultDetailModal, initFaults, loadFaults, renderFaultFilterOptions } from "./faults.js";
import { closeFaultEditModal, loadFaultManufacturers, openFaultEditModal, renderFaultCategoryList, renderFaultManufacturerList, renderFaultSubcategoryList, saveFaultEditModal, selectedFaultCategory, selectedFaultManufacturer, selectedFaultSubcategory, toggleFaultEditModal } from "./manufacturers.js";
import { initMonthPickers, refreshStatsIfRendered, runStats, setStatsMode } from "./statistics.js";

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
  initFaults();

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

  // Clients hierarchy
  $id("client-search").addEventListener("input", () => renderClientList($id("client-search").value));
  $id("btn-client-create-open").addEventListener("click", () => openClientEditModal("client", "create"));
  $id("btn-client-edit-open").addEventListener("click", () => openClientEditModal("client", "edit", selectedClient?.id));

  $id("client-site-search").addEventListener("input", () => renderClientSiteList($id("client-site-search").value));
  $id("btn-client-site-create-open").addEventListener("click", () => openClientEditModal("site", "create"));
  $id("btn-client-site-edit-open").addEventListener("click", () => openClientEditModal("site", "edit", selectedClientSite?.id));

  $id("client-contact-search").addEventListener("input", () => renderClientContactList($id("client-contact-search").value));
  $id("btn-client-contact-create-open").addEventListener("click", () => openClientEditModal("contact", "create"));
  $id("btn-client-contact-edit-open").addEventListener("click", () => openClientEditModal("contact", "edit", selectedClientContact?.id));
  $id("btn-client-edit-close").addEventListener("click", closeClientEditModal);
  $id("btn-client-edit-cancel").addEventListener("click", closeClientEditModal);
  $id("btn-client-edit-save").addEventListener("click", async () => {
    try { await saveClientEditModal(); } catch (e) { $id("client-edit-modal-note").textContent = e.message; }
  });
  $id("btn-client-edit-toggle").addEventListener("click", async () => {
    try { await toggleClientEditModal(); } catch (e) { $id("client-edit-modal-note").textContent = e.message; }
  });
  $id("client-edit-modal").addEventListener("click", (event) => {
    if (event.target === $id("client-edit-modal")) closeClientEditModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !$id("client-edit-modal")?.classList.contains("is-hidden")) {
      closeClientEditModal();
    }
    if (event.key === "Escape" && !$id("fault-edit-modal")?.classList.contains("is-hidden")) {
      closeFaultEditModal();
    }
    if (event.key === "Escape" && !$id("fault-detail-modal")?.classList.contains("is-hidden")) {
      closeFaultDetailModal();
    }
  });

  // Fault equipment hierarchy
  $id("fault-mfr-search").addEventListener("input", () => renderFaultManufacturerList($id("fault-mfr-search").value));
  $id("btn-fault-mfr-create-open").addEventListener("click", () => openFaultEditModal("manufacturer", "create"));
  $id("btn-fault-mfr-edit-open").addEventListener("click", () => openFaultEditModal("manufacturer", "edit", selectedFaultManufacturer?.id));
  $id("fault-cat-search").addEventListener("input", () => renderFaultCategoryList($id("fault-cat-search").value));
  $id("btn-fault-cat-create-open").addEventListener("click", () => openFaultEditModal("category", "create"));
  $id("btn-fault-cat-edit-open").addEventListener("click", () => openFaultEditModal("category", "edit", selectedFaultCategory?.id));
  $id("fault-sub-search").addEventListener("input", () => renderFaultSubcategoryList($id("fault-sub-search").value));
  $id("btn-fault-sub-create-open").addEventListener("click", () => openFaultEditModal("subcategory", "create"));
  $id("btn-fault-sub-edit-open").addEventListener("click", () => openFaultEditModal("subcategory", "edit", selectedFaultSubcategory?.id));
  $id("btn-fault-edit-close").addEventListener("click", closeFaultEditModal);
  $id("btn-fault-edit-cancel").addEventListener("click", closeFaultEditModal);
  $id("btn-fault-edit-save").addEventListener("click", async () => {
    try { await saveFaultEditModal(); } catch (e) { $id("fault-edit-modal-note").textContent = e.message; }
  });
  $id("btn-fault-edit-toggle").addEventListener("click", async () => {
    try { await toggleFaultEditModal(); } catch (e) { $id("fault-edit-modal-note").textContent = e.message; }
  });
  $id("fault-edit-modal").addEventListener("click", (event) => {
    if (event.target === $id("fault-edit-modal")) closeFaultEditModal();
  });

  // Faults table
  clearFaultFilters();

  // Settings
  $id("setting-language").addEventListener("change", () => {
    updateAdminLanguage($id("setting-language").value);
    updateStaticText();
    refreshStatsIfRendered();
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
  await loadClients();
  await loadFaultManufacturers();
  renderFaultFilterOptions();
  await loadFaults();
}

init().catch((e) => {
  console.error(e);
  alert(e?.message || "Failed to load admin page");
});

import { api } from "../shared/api.js";
import { $id } from "../shared/dom.js";
import { todayMonth } from "../shared/dates.js";
import { currentUser, managerEmployees } from "./state.js";
import { initWorkerI18n, t, updateStaticText } from "./i18n.js";
import { initFaultRegistration, loadFaultFormLookups, refreshFaultRegistrationLanguage, saveFaultRegistration } from "./fault-registration.js";
import { initWorkReporting, loadEntries, loadMe, loadProjects, setStatus, updateWorkReportingText } from "./work-entries.js";
import { enableManagerTools, loadManagerEmployees, renderManagerEmployees, saveContractorEntry, showManagerTool } from "./manager-tools.js";
import { closeCarList, shareCarList, showCarList } from "./car-list.js";
import { initUserSettings, refreshUserSettingsText } from "./profile.js";

async function logout() {
  try { await api("/auth/logout", { method: "POST" }); } catch {}
  location.href = "/login.html";
}

function populateTimeSelect(id, selectedValue, options = {}) {
  const select = $id(id);
  if (!select) return;

  const { allowEmpty = false } = options;
  select.innerHTML = "";

  if (allowEmpty) {
    const empty = document.createElement("option");
    empty.value = "";
    empty.textContent = "--:--";
    select.appendChild(empty);
  }

  for (let hour = 0; hour < 24; hour += 1) {
    for (const minute of [0, 15, 30, 45]) {
      const value = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    }
  }

  select.value = selectedValue || "";
}

function preventAppZoom() {
  let lastTouchEnd = 0;
  document.addEventListener("gesturestart", (event) => event.preventDefault(), { passive: false });
  document.addEventListener("gesturechange", (event) => event.preventDefault(), { passive: false });
  document.addEventListener("gestureend", (event) => event.preventDefault(), { passive: false });
  document.addEventListener("wheel", (event) => {
    if (event.ctrlKey) event.preventDefault();
  }, { passive: false });
  document.addEventListener("touchend", (event) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 350) event.preventDefault();
    lastTouchEnd = now;
  }, { passive: false });
}

async function init() {
  preventAppZoom();
  $id("rep-month").value = todayMonth();
  populateTimeSelect("contractor-start-time", "", { allowEmpty: true });
  populateTimeSelect("contractor-end-time", "", { allowEmpty: true });
  initFaultRegistration();
  initWorkerI18n(() => {
    updateWorkReportingText();
    renderManagerEmployees();
    refreshFaultRegistrationLanguage();
    updateStaticText();
    refreshUserSettingsText();
  });
  initUserSettings(logout, () => {
    updateWorkReportingText();
    renderManagerEmployees();
    refreshFaultRegistrationLanguage();
    updateStaticText();
    refreshUserSettingsText();
  });

  const tabReg = $id("tab-register");
  const tabRep = $id("tab-reports");
  const tabManager = $id("tab-manager");
  const panelReg = $id("panel-register");
  const panelRep = $id("panel-reports");
  const panelManager = $id("panel-manager");

  function show(which) {
    const isReg = which === "register";
    const isReports = which === "reports";
    const isManager = which === "manager";
    tabReg.classList.toggle("active", isReg);
    tabRep.classList.toggle("active", isReports);
    tabManager.classList.toggle("active", isManager);
    tabReg.setAttribute("aria-selected", isReg ? "true" : "false");
    tabRep.setAttribute("aria-selected", isReports ? "true" : "false");
    tabManager.setAttribute("aria-selected", isManager ? "true" : "false");
    panelReg.hidden = !isReg;
    panelRep.hidden = !isReports;
    panelManager.hidden = !isManager;
    setStatus("");
    if (isManager && currentUser?.capabilities?.managerTools && managerEmployees.length === 0) {
      loadManagerEmployees().catch((e) => {
        $id("manager-status").textContent = e.message;
      });
    }
  }

  tabReg.addEventListener("click", () => show("register"));
  tabRep.addEventListener("click", () => show("reports"));
  tabManager.addEventListener("click", () => show("manager"));
  $id("manager-subtab-cars").addEventListener("click", () => showManagerTool("cars"));
  $id("manager-subtab-contractors").addEventListener("click", () => showManagerTool("contractors"));
  $id("manager-subtab-faults").addEventListener("click", () => showManagerTool("faults"));
  showManagerTool("cars");
  show("register");

  $id("rep-month").addEventListener("change", () => loadEntries().catch(() => {}));
  $id("btn-show-car-list").addEventListener("click", showCarList);
  $id("btn-save-contractor").addEventListener("click", async () => {
    try {
      $id("contractor-status").textContent = t("saving");
      await saveContractorEntry();
    } catch (e) {
      $id("contractor-status").textContent = e.message;
    }
  });
  $id("btn-save-fault").addEventListener("click", async () => {
    try {
      $id("fault-status").textContent = t("saving");
      const result = await saveFaultRegistration();
      $id("fault-status").textContent = result?.fault_ref ? `${t("faultRegistered")} ${result.fault_ref}` : t("faultRegistered");
    } catch (e) {
      $id("fault-status").textContent = e.message;
    }
  });
  $id("btn-close-car-list").addEventListener("click", closeCarList);
  $id("btn-share-car-list").addEventListener("click", () => {
    shareCarList().catch((e) => {
      $id("manager-status").textContent = e.message;
    });
  });
  const u = await loadMe();
  if (u?.capabilities?.managerTools) {
    enableManagerTools();
    await loadFaultFormLookups();
  }
  await loadProjects();
  await initWorkReporting();
  await loadEntries();
}

init().catch((e) => {
  console.error(e);
  alert(e?.message || "Failed to load employee page");
});

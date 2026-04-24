import { api } from "../shared/api.js";
import { $id } from "../shared/dom.js";
import { todayISO, todayMonth } from "../shared/dates.js";
import { currentUser, managerEmployees } from "./state.js";
import { initFaultRegistration, loadFaultFormLookups, saveFaultRegistration } from "./fault-registration.js";
import { addEntry, loadEntries, loadMe, loadProjects, setStatus } from "./work-entries.js";
import { enableManagerTools, loadManagerEmployees, saveContractorEntry, showManagerTool } from "./manager-tools.js";
import { closeCarList, shareCarList, showCarList } from "./car-list.js";

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

async function init() {
  $id("rep-month").value = todayMonth();
  $id("work-date").value = todayISO();
  populateTimeSelect("start-time", "09:00");
  populateTimeSelect("end-time", "17:00");
  populateTimeSelect("contractor-start-time", "", { allowEmpty: true });
  populateTimeSelect("contractor-end-time", "", { allowEmpty: true });
  initFaultRegistration();

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
    if (isManager && currentUser?.isManager && managerEmployees.length === 0) {
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

  $id("btn-add").addEventListener("click", async () => {
    try {
      setStatus("Saving...");
      await addEntry();
    } catch (e) {
      setStatus(e.message);
    }
  });

  $id("rep-month").addEventListener("change", () => loadEntries().catch(() => {}));
  $id("btn-show-car-list").addEventListener("click", showCarList);
  $id("btn-save-contractor").addEventListener("click", async () => {
    try {
      $id("contractor-status").textContent = "Saving...";
      await saveContractorEntry();
    } catch (e) {
      $id("contractor-status").textContent = e.message;
    }
  });
  $id("btn-save-fault").addEventListener("click", async () => {
    try {
      $id("fault-status").textContent = "Saving...";
      const result = await saveFaultRegistration();
      $id("fault-status").textContent = result?.fault_ref ? `Fault ${result.fault_ref} registered.` : "Fault registered.";
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
  $id("btn-logout").addEventListener("click", logout);

  const u = await loadMe();
  if (u?.isManager) {
    enableManagerTools();
    await loadFaultFormLookups();
  }
  await loadProjects();
  await loadEntries();
  setStatus("Ready.");
}

init().catch((e) => {
  console.error(e);
  alert(e?.message || "Failed to load employee page");
});

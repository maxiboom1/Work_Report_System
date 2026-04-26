import { api } from "../shared/api.js";
import { $id } from "../shared/dom.js";
import { t } from "./i18n.js";
import { isManagerWorkerSelected, managerEmployees, setManagerEmployees, toggleManagerWorkerSelection } from "./state.js";

function timeToMinutes(time) {
  const [hour, minute] = String(time || "00:00").split(":").map(Number);
  return (hour * 60) + minute;
}

function localizeApiError(error) {
  const message = String(error?.message || "");
  const known = new Map([
    ["Missing contractor details", "validationUnknown"],
    ["Invalid service cost", "validationContractorCostInvalid"],
    ["Invalid contractor time", "validationTimeRequired"],
    ["Start and end time must be filled together", "validationContractorTimesPair"],
    ["end_time must be after start_time", "validationEndBeforeStart"],
    ["Invalid project", "validationProjectRequired"],
    ["Project is disabled", "validationProjectRequired"],
  ]);
  const key = known.get(message);
  return key ? t(key) : (message || t("validationUnknown"));
}

function validateContractorPayload(payload) {
  if (!payload.project_id) return t("validationProjectRequired");
  if (!String(payload.contractor_name || "").trim()) return t("validationContractorNameRequired");
  if (!String(payload.service_description || "").trim()) return t("validationContractorDescriptionRequired");
  if ((payload.start_time && !payload.end_time) || (!payload.start_time && payload.end_time)) return t("validationContractorTimesPair");
  if (payload.start_time && payload.end_time && timeToMinutes(payload.end_time) <= timeToMinutes(payload.start_time)) return t("validationEndBeforeStart");
  if (String(payload.service_cost || "").trim()) {
    const cost = Number(payload.service_cost);
    if (!Number.isFinite(cost) || cost < 0) return t("validationContractorCostInvalid");
  }
  return "";
}

function makeManagerWorkerRow(worker) {
  const tr = document.createElement("tr");
  tr.className = "manager-worker-row";
  tr.setAttribute("aria-selected", "false");

  const checkCell = document.createElement("td");
  checkCell.className = "manager-check-cell";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.setAttribute("aria-label", `${t("selectWorkers")} ${worker.first_name || ""} ${worker.last_name || ""}`.trim());
  checkCell.appendChild(checkbox);

  const nameCell = document.createElement("td");
  nameCell.className = "manager-name-cell";
  nameCell.textContent = `${worker.first_name || ""} ${worker.last_name || ""}`.trim() || "-";

  function syncSelectedState() {
    const selected = isManagerWorkerSelected(worker.id);
    tr.classList.toggle("is-selected", selected);
    tr.setAttribute("aria-selected", selected ? "true" : "false");
    checkbox.checked = selected;
  }

  function toggleSelectedState() {
    toggleManagerWorkerSelection(worker.id);
    syncSelectedState();
  }

  tr.append(checkCell, nameCell);
  checkbox.addEventListener("change", () => {
    toggleSelectedState();
  });
  syncSelectedState();
  return tr;
}

export function renderManagerEmployees() {
  const holder = $id("manager-workers");
  holder.innerHTML = "";

  if (!managerEmployees.length) {
    holder.innerHTML = `<div class="empty-sub">${t("noWorkers")}</div>`;
    return;
  }

  const table = document.createElement("table");
  table.className = "manager-workers-table";
  table.innerHTML = `<thead><tr><th class="manager-check-cell"></th><th>${t("workerName")}</th></tr></thead>`;
  const tbody = document.createElement("tbody");
  for (const worker of managerEmployees) {
    tbody.appendChild(makeManagerWorkerRow(worker));
  }
  table.appendChild(tbody);
  holder.appendChild(table);
}

export async function loadManagerEmployees() {
  const r = await api("/my/manager/car-list");
  setManagerEmployees(r.employees || []);
  renderManagerEmployees();
}

export async function saveContractorEntry() {
  const payload = {
    project_id: Number($id("contractor-project").value || 0),
    start_time: $id("contractor-start-time").value,
    end_time: $id("contractor-end-time").value,
    contractor_name: $id("contractor-name").value,
    service_description: $id("contractor-description").value,
    service_cost: $id("contractor-cost").value,
  };

  const validationMessage = validateContractorPayload(payload);
  if (validationMessage) {
    $id("contractor-status").textContent = validationMessage;
    return;
  }

  try {
    await api("/my/manager/contractors", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (error) {
    $id("contractor-status").textContent = localizeApiError(error);
    return;
  }

  $id("contractor-name").value = "";
  $id("contractor-description").value = "";
  $id("contractor-start-time").value = "";
  $id("contractor-end-time").value = "";
  $id("contractor-cost").value = "";
  $id("contractor-status").textContent = t("contractorSaved");
}

export function enableManagerTools() {
  const tab = $id("tab-manager");
  if (tab) tab.hidden = false;
}

export function showManagerTool(which) {
  const isCars = which === "cars";
  const isContractors = which === "contractors";
  const isFaults = which === "faults";

  $id("manager-subtab-cars").classList.toggle("active", isCars);
  $id("manager-subtab-contractors").classList.toggle("active", isContractors);
  $id("manager-subtab-faults").classList.toggle("active", isFaults);

  $id("manager-subtab-cars").setAttribute("aria-selected", isCars ? "true" : "false");
  $id("manager-subtab-contractors").setAttribute("aria-selected", isContractors ? "true" : "false");
  $id("manager-subtab-faults").setAttribute("aria-selected", isFaults ? "true" : "false");

  $id("manager-panel-cars").hidden = !isCars;
  $id("manager-panel-contractors").hidden = !isContractors;
  $id("manager-panel-faults").hidden = !isFaults;
}

import { api } from "../shared/api.js";
import { $id } from "../shared/dom.js";
import { managerEmployees, setManagerEmployees } from "./state.js";

function makeManagerWorkerRow(worker) {
  const tr = document.createElement("tr");
  tr.className = "manager-worker-row";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.value = String(worker.id);

  const checkCell = document.createElement("td");
  checkCell.className = "manager-check-cell";
  checkCell.appendChild(checkbox);

  const nameCell = document.createElement("td");
  nameCell.className = "manager-name-cell";
  nameCell.textContent = `${worker.first_name || ""} ${worker.last_name || ""}`.trim() || "-";

  tr.append(checkCell, nameCell);
  tr.addEventListener("click", (event) => {
    if (event.target !== checkbox) checkbox.checked = !checkbox.checked;
    tr.classList.toggle("is-selected", checkbox.checked);
  });
  checkbox.addEventListener("change", () => {
    tr.classList.toggle("is-selected", checkbox.checked);
  });
  return tr;
}

export function renderManagerEmployees() {
  const holder = $id("manager-workers");
  holder.innerHTML = "";

  if (!managerEmployees.length) {
    holder.innerHTML = '<div class="empty-sub">No workers found.</div>';
    return;
  }

  const table = document.createElement("table");
  table.className = "manager-workers-table";
  table.innerHTML = "<thead><tr><th></th><th>שם עובד</th></tr></thead>";
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

  const r = await api("/my/manager/contractors", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  $id("contractor-name").value = "";
  $id("contractor-description").value = "";
  $id("contractor-start-time").value = "";
  $id("contractor-end-time").value = "";
  $id("contractor-cost").value = "";
  $id("contractor-status").textContent = r.message ? "הקבלן נרשם." : "הקבלן נרשם.";
}

export function enableManagerTools() {
  const tab = $id("tab-manager");
  if (tab) tab.hidden = false;
}

export function showManagerTool(which) {
  const isCars = which === "cars";
  $id("manager-subtab-cars").classList.toggle("active", isCars);
  $id("manager-subtab-contractors").classList.toggle("active", !isCars);
  $id("manager-subtab-cars").setAttribute("aria-selected", isCars ? "true" : "false");
  $id("manager-subtab-contractors").setAttribute("aria-selected", !isCars ? "true" : "false");
  $id("manager-panel-cars").hidden = !isCars;
  $id("manager-panel-contractors").hidden = isCars;
}

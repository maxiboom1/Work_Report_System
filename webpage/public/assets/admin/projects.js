import { api } from "../shared/api.js";
import { $id } from "../shared/dom.js";
import { t } from "./i18n.js";
import { fillStatsPickers } from "./statistics.js";

export let PROJECTS = [];
export let selectedProject = null;

export function renderProjectList(filter = "") {
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

export function fillProjectEdit(p) {
  $id("prj-selected").textContent = p ? p.name : t("none");
  $id("prj-edit-name").value = p?.name || "";
  $id("prj-edit-active").value = p?.is_active ? "1" : "0";
}

export function selectProject(id) {
  selectedProject = PROJECTS.find((x) => String(x.id) === String(id)) || null;
  fillProjectEdit(selectedProject);
  renderProjectList($id("prj-search").value);
}

export async function loadProjects() {
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

export async function createProject() {
  const name = $id("prj-add-name").value;
  const r = await api("/admin/projects", { method: "POST", body: JSON.stringify({ name }) });
  $id("prj-add-note").textContent = r.message ? t("projectCreated") : t("projectCreated");
  $id("prj-add-name").value = "";
  await loadProjects();
}

export async function saveProject() {
  if (!selectedProject) return;
  const payload = {
    name: $id("prj-edit-name").value,
    is_active: $id("prj-edit-active").value === "1",
  };
  const r = await api(`/admin/projects/${selectedProject.id}`, { method: "PUT", body: JSON.stringify(payload) });
  $id("prj-edit-note").textContent = r.message ? t("projectSaved") : t("projectSaved");
  await loadProjects();
}

export async function deleteProject() {
  if (!selectedProject) return;
  if (!confirm(`${t("deleteProjectConfirm")} ${selectedProject.name}?`)) return;
  const r = await api(`/admin/projects/${selectedProject.id}`, { method: "DELETE" });
  $id("prj-edit-note").textContent = r.message ? t("projectDeleted") : t("projectDeleted");
  selectedProject = null;
  await loadProjects();
}

// =========================
// Clients hierarchy
// =========================

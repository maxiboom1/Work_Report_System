import { api } from "../shared/api.js";
import { $id } from "../shared/dom.js";
import { todayMonth } from "../shared/dates.js";
import { setCurrentUser } from "./state.js";

export function setStatus(msg) {
  const el = $id("status");
  if (el) el.textContent = msg;
}

function makeEntryCard(e) {
  const card = document.createElement("div");
  card.className = "entry-card";

  const meta = document.createElement("div");
  meta.className = "entry-meta";

  const title = document.createElement("div");
  title.className = "entry-title";
  title.textContent = `${e.work_date} · ${e.project_name}`;

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

  const btnDel = document.createElement("button");
  btnDel.className = "btn";
  btnDel.type = "button";
  btnDel.textContent = "Delete";
  btnDel.addEventListener("click", async () => {
    if (!confirm("Delete this entry?")) return;
    await api(`/my/work-entries/${e.id}`, { method: "DELETE" });
    await loadEntries();
  });

  actions.appendChild(btnDel);
  card.appendChild(meta);
  card.appendChild(actions);
  return card;
}

let projects = [];
let currentUser = null;
let managerEmployees = [];
let currentCarList = [];

export async function loadProjects() {
  const r = await api("/projects");
  projects = r.projects || [];
  const sel = $id("project");
  const contractorSel = $id("contractor-project");
  sel.innerHTML = "";
  if (contractorSel) contractorSel.innerHTML = "";
  for (const p of projects) {
    if (p.is_active === 0) continue;
    const opt = document.createElement("option");
    opt.value = String(p.id);
    opt.textContent = p.name;
    sel.appendChild(opt);

    if (contractorSel) {
      const contractorOpt = document.createElement("option");
      contractorOpt.value = String(p.id);
      contractorOpt.textContent = p.name;
      contractorSel.appendChild(contractorOpt);
    }
  }
}

export async function loadMe() {
  const r = await api("/auth/me");
  const u = r.user;
  setCurrentUser(u);
  $id("crumb").textContent = `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.username;
  return u;
}

export async function loadEntries() {
  const month = $id("rep-month")?.value || todayMonth();
  const r = await api(`/my/work-entries?month=${encodeURIComponent(month)}`);
  const entries = r.entries || [];

  const holder = $id("rep-entries");
  holder.innerHTML = "";

  if (entries.length === 0) {
    $id("empty").hidden = false;
    return;
  }

  $id("empty").hidden = true;
  for (const e of entries) holder.appendChild(makeEntryCard(e));
}

export async function addEntry() {
  const payload = {
    project_id: Number($id("project").value || 0),
    work_date: $id("work-date").value,
    start_time: $id("start-time").value,
    end_time: $id("end-time").value,
    notes: $id("notes").value,
  };

  await api("/my/work-entries", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  $id("notes").value = "";
  await loadEntries();
  setStatus("Entry added.");
}

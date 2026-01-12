/* =========================================================
   Employee Work Report System — Employee UI
   ========================================================= */

async function api(path, options) {
  const res = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  let body = null;
  try { body = await res.json(); } catch {}

  if (!res.ok) {
    throw new Error(body?.message || `Request failed (${res.status})`);
  }
  return body;
}

const $id = (id) => document.getElementById(id);

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function todayMonth() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}`;
}

function setStatus(msg) {
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

async function loadProjects() {
  const r = await api("/projects");
  projects = r.projects || [];
  const sel = $id("project");
  sel.innerHTML = "";
  for (const p of projects) {
    if (p.is_active === 0) continue;
    const opt = document.createElement("option");
    opt.value = String(p.id);
    opt.textContent = p.name;
    sel.appendChild(opt);
  }
}

async function loadMe() {
  const r = await api("/auth/me");
  const u = r.user;
  $id("crumb").textContent = `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.username;
}

async function loadEntries() {
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

async function addEntry() {
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

async function logout() {
  try { await api("/auth/logout", { method: "POST" }); } catch {}
  location.href = "/login.html";
}

async function init() {
  $id("rep-month").value = todayMonth();
  $id("work-date").value = todayISO();
  $id("start-time").value = "09:00";
  $id("end-time").value = "17:00";

  // Tabs
  const tabReg = $id("tab-register");
  const tabRep = $id("tab-reports");
  const panelReg = $id("panel-register");
  const panelRep = $id("panel-reports");

  function show(which) {
    const isReg = which === "register";
    tabReg.classList.toggle("active", isReg);
    tabRep.classList.toggle("active", !isReg);
    tabReg.setAttribute("aria-selected", isReg ? "true" : "false");
    tabRep.setAttribute("aria-selected", !isReg ? "true" : "false");
    panelReg.hidden = !isReg;
    panelRep.hidden = isReg;
  }

  tabReg.addEventListener("click", () => show("register"));
  tabRep.addEventListener("click", () => show("reports"));
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
  $id("btn-logout").addEventListener("click", logout);

  await loadMe();
  await loadProjects();
  await loadEntries();
  setStatus("Ready.");
}

init().catch((e) => {
  console.error(e);
  alert(e?.message || "Failed to load employee page");
});

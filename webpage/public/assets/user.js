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
let currentUser = null;
let managerEmployees = [];
let currentCarList = [];

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
  currentUser = u;
  $id("crumb").textContent = `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.username;
  if (u.isManager) {
    enableManagerTools();
  }
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

function renderManagerEmployees() {
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

async function loadManagerEmployees() {
  const r = await api("/my/manager/car-list");
  managerEmployees = r.employees || [];
  renderManagerEmployees();
}

function showCarList() {
  const selectedIds = Array.from(document.querySelectorAll('#manager-workers input[type="checkbox"]:checked'))
    .map((input) => Number(input.value));
  const selected = managerEmployees.filter((worker) => selectedIds.includes(Number(worker.id)));
  currentCarList = selected;
  const output = $id("car-list-output");
  output.innerHTML = "";

  if (!selected.length) {
    $id("car-list-screen").hidden = true;
    $id("manager-status").textContent = "יש לבחור עובד אחד לפחות.";
    return;
  }

  const generatedAt = new Date().toLocaleDateString("he-IL");
  const title = document.createElement("div");
  title.className = "car-list-title";
  title.id = "car-list-title";
  title.textContent = "רשימת רכבים";

  const meta = document.createElement("div");
  meta.className = "car-list-meta";
  meta.textContent = `${selected.length} עובדים · ${generatedAt}`;

  const table = document.createElement("table");
  table.className = "car-list-table";
  const thead = document.createElement("thead");
  thead.innerHTML = "<tr><th>שם</th><th>דרכון</th><th>רכב</th></tr>";
  const tbody = document.createElement("tbody");

  for (const worker of selected) {
    const tr = document.createElement("tr");
    const name = `${worker.first_name || ""} ${worker.last_name || ""}`.trim();
    [name || "-", worker.passport_id || "-", worker.car_id || "-"].forEach((value) => {
      const td = document.createElement("td");
      td.textContent = value;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  }

  table.append(thead, tbody);
  output.append(title, meta, table);
  $id("car-list-screen").hidden = false;
  $id("manager-status").textContent = `${selected.length} עובדים נבחרו.`;
}

function carListShareText() {
  const separator = "**********";
  const lines = ["רשימת רכבים:"];
  for (const worker of currentCarList) {
    const name = `${worker.first_name || ""} ${worker.last_name || ""}`.trim() || "-";
    lines.push(
      separator,
      `*${name}*`,
      `ת.ז: ${worker.passport_id || "-"}`,
      `מס.רכב: ${worker.car_id || "-"}`
    );
  }
  lines.push(separator);
  return lines.join("\n");
}

function showManualCopyPanel(text, wasCopied) {
  const panel = $id("car-list-copy-panel");
  const textarea = $id("car-list-copy-text");
  textarea.value = text;
  panel.hidden = false;
  textarea.focus();
  textarea.select();
  $id("manager-status").textContent = wasCopied
    ? "הרשימה הועתקה ואפשר להדביק אותה לשליחה."
    : "אם השיתוף לא נפתח, אפשר להעתיק ידנית מהחלון שנפתח.";
}

async function shareCarList() {
  if (!currentCarList.length) return;
  const text = carListShareText();

  if (navigator.share && (!navigator.canShare || navigator.canShare({ title: "רשימת רכבים", text }))) {
    try {
      await navigator.share({ title: "רשימת רכבים", text });
      return;
    } catch (err) {
      if (err?.name === "AbortError") return;
    }
  }

  if (navigator.clipboard?.writeText && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      showManualCopyPanel(text, true);
      return;
    } catch {
      // Fall through to WhatsApp/manual copy for browsers that expose clipboard but deny it.
    }
  }

  const isSmallTouchScreen = window.matchMedia("(max-width: 820px)").matches && navigator.maxTouchPoints > 0;
  if (isSmallTouchScreen) {
    window.location.href = `whatsapp://send?text=${encodeURIComponent(text)}`;
    window.setTimeout(() => showManualCopyPanel(text, false), 800);
    return;
  }

  let copied = false;
  try {
    showManualCopyPanel(text, false);
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }

  showManualCopyPanel(text, copied);
}

function closeCarList() {
  $id("car-list-screen").hidden = true;
  $id("car-list-copy-panel").hidden = true;
}

function enableManagerTools() {
  const tab = $id("tab-manager");
  if (tab) tab.hidden = false;
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
  $id("btn-close-car-list").addEventListener("click", closeCarList);
  $id("btn-share-car-list").addEventListener("click", () => {
    shareCarList().catch((e) => {
      $id("manager-status").textContent = e.message;
    });
  });
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

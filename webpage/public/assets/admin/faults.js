import { api } from "../shared/api.js";
import { $id } from "../shared/dom.js";
import { CLIENTS } from "./clients.js";
import { FAULT_MANUFACTURERS } from "./manufacturers.js";
import { renderTable } from "./table.js";

let faults = [];
let currentFaultDetail = null;

function supportLevelLabel(value) {
  if (value === "layer2_support") return "Under Layer-2 Support";
  if (value === "under_support") return "Under Support";
  if (value === "no_support") return "Not Under Support";
  return value || "-";
}

function makeStatusBadge(status) {
  const badge = document.createElement("span");
  badge.className = `fault-badge ${status === "closed" ? "is-closed" : "is-open"}`;
  badge.textContent = status === "closed" ? "Closed" : "Open";
  return badge;
}

function makeStack(primary, secondary = "") {
  const wrap = document.createElement("div");
  wrap.className = "fault-stack";

  const main = document.createElement("div");
  main.textContent = primary || "-";
  wrap.appendChild(main);

  if (secondary) {
    const meta = document.createElement("div");
    meta.className = "fault-muted";
    meta.textContent = secondary;
    wrap.appendChild(meta);
  }

  return wrap;
}

function formatDateTime(value) {
  return value ? String(value).replace("T", " ") : "-";
}

function faultCategoryLabel(fault) {
  const pieces = [fault.equipment_category_name, fault.equipment_subcategory_name].filter(Boolean);
  return pieces.join(" / ") || "-";
}

export function renderFaultFilterOptions() {
  const clientSelect = $id("fault-filter-client");
  if (clientSelect) {
    clientSelect.innerHTML = '<option value="">All</option>';
    for (const client of CLIENTS) {
      const opt = document.createElement("option");
      opt.value = String(client.id);
      opt.textContent = client.name;
      clientSelect.appendChild(opt);
    }
  }

  const manufacturerSelect = $id("fault-filter-manufacturer");
  if (manufacturerSelect) {
    manufacturerSelect.innerHTML = '<option value="">All</option>';
    for (const manufacturer of FAULT_MANUFACTURERS) {
      const opt = document.createElement("option");
      opt.value = String(manufacturer.id);
      opt.textContent = manufacturer.name;
      manufacturerSelect.appendChild(opt);
    }
  }
}

function renderFaultTable() {
  const holder = $id("faults-table");
  const summary = $id("faults-summary");
  if (!holder || !summary) return;
  holder.innerHTML = "";

  if (!faults.length) {
    holder.innerHTML = '<div class="vitem-empty">No faults found for the current filters.</div>';
    summary.textContent = "0 faults";
    return;
  }

  const rows = faults.map((fault) => ({
    cells: [
      makeStack(fault.fault_ref, formatDateTime(fault.created_at)),
      fault.client_name || "-",
      fault.site_name || "-",
      fault.manufacturer_name || "-",
      faultCategoryLabel(fault),
      supportLevelLabel(fault.support_level),
      fault.manufacturer_ticket_id || "-",
      makeStatusBadge(fault.status),
    ],
  }));

  const table = renderTable(
    ["Ref", "Client", "Site", "Manufacturer", "Category / subcategory", "Support", "Ticket ID", "Status"],
    rows,
    { rowClassName: () => "fault-row" }
  );

  table.querySelectorAll("tbody tr").forEach((row, index) => {
    row.addEventListener("dblclick", () => openFaultDetail(faults[index].id));
  });

  holder.appendChild(table);
  summary.textContent = `${faults.length} fault${faults.length === 1 ? "" : "s"}`;
}

function currentFilters() {
  const params = new URLSearchParams();
  const fields = [
    ["status", $id("fault-filter-status")?.value],
    ["client_id", $id("fault-filter-client")?.value],
    ["manufacturer_id", $id("fault-filter-manufacturer")?.value],
    ["support_level", $id("fault-filter-support")?.value],
    ["date_from", $id("fault-filter-date-from")?.value],
    ["date_to", $id("fault-filter-date-to")?.value],
  ];

  for (const [key, value] of fields) {
    if (value) params.set(key, value);
  }

  return params.toString();
}

export async function loadFaults() {
  const qs = currentFilters();
  const response = await api(`/admin/faults${qs ? `?${qs}` : ""}`);
  faults = response.faults || [];
  renderFaultTable();
}

function setText(id, value) {
  const el = $id(id);
  if (el) el.textContent = value || "-";
}

function renderFaultContacts(contacts) {
  const holder = $id("fault-detail-contacts");
  if (!holder) return;
  holder.innerHTML = "";

  if (!contacts.length) {
    holder.innerHTML = '<div class="fault-detail-card">No contacts linked to this fault.</div>';
    return;
  }

  for (const contact of contacts) {
    const card = document.createElement("div");
    card.className = "fault-detail-card";

    const title = document.createElement("div");
    title.className = "fault-detail-card-title";
    title.textContent = contact.contact_name || "-";

    const meta = document.createElement("div");
    meta.className = "fault-detail-card-meta";
    const parts = [];
    if (contact.contact_email) parts.push(contact.contact_email);
    if (contact.contact_phone) parts.push(contact.contact_phone);
    meta.textContent = parts.join(" | ") || "No email or phone";

    card.append(title, meta);
    holder.appendChild(card);
  }
}

function renderFaultEvents(events) {
  const holder = $id("fault-detail-events");
  if (!holder) return;
  holder.innerHTML = "";

  if (!events.length) {
    holder.innerHTML = '<div class="fault-detail-card">No events yet.</div>';
    return;
  }

  for (const event of events) {
    const card = document.createElement("div");
    card.className = "fault-detail-card";

    const title = document.createElement("div");
    title.className = "fault-detail-card-title";
    title.textContent = event.title || "-";

    const meta = document.createElement("div");
    meta.className = "fault-detail-card-meta";
    const metaParts = [];
    const author = `${event.created_by_first_name || ""} ${event.created_by_last_name || ""}`.trim();
    if (author) metaParts.push(author);
    if (event.created_at) metaParts.push(formatDateTime(event.created_at));
    if (event.order_id) metaParts.push(`Order: ${event.order_id}`);
    meta.textContent = metaParts.join(" | ");

    card.append(title, meta);

    if (event.details) {
      const body = document.createElement("div");
      body.className = "fault-detail-card-body";
      body.textContent = event.details;
      card.appendChild(body);
    }

    holder.appendChild(card);
  }
}

function showFaultDetailModal() {
  $id("fault-detail-modal")?.classList.remove("is-hidden");
  $id("fault-detail-modal")?.setAttribute("aria-hidden", "false");
}

export function closeFaultDetailModal() {
  currentFaultDetail = null;
  $id("fault-detail-note").textContent = "";
  $id("fault-event-title").value = "";
  $id("fault-event-order-id").value = "";
  $id("fault-event-details").value = "";
  $id("fault-detail-modal")?.classList.add("is-hidden");
  $id("fault-detail-modal")?.setAttribute("aria-hidden", "true");
}

async function fillFaultDetailModal(faultId) {
  const response = await api(`/admin/faults/${faultId}`);
  currentFaultDetail = response;
  const fault = response.fault;

  $id("fault-detail-note").textContent = "";
  setText("fault-detail-context", `${fault.fault_ref} | ${fault.client_name || "-"} | ${fault.site_name || "-"}`);
  setText("fault-detail-ref", fault.fault_ref);
  setText("fault-detail-created", formatDateTime(fault.created_at));
  setText("fault-detail-created-by", `${fault.created_by_first_name || ""} ${fault.created_by_last_name || ""}`.trim());
  setText("fault-detail-client", fault.client_name);
  setText("fault-detail-site", fault.site_name);
  setText("fault-detail-manufacturer", fault.manufacturer_name);
  setText("fault-detail-category", faultCategoryLabel(fault));

  const statusHolder = $id("fault-detail-status");
  if (statusHolder) {
    statusHolder.innerHTML = "";
    statusHolder.appendChild(makeStatusBadge(fault.status));
  }

  $id("fault-detail-support").value = fault.support_level || "layer2_support";
  $id("fault-detail-serial").value = fault.serial_number || "";
  $id("fault-detail-ticket").value = fault.manufacturer_ticket_id || "";
  $id("fault-detail-description").value = fault.fault_description || "";
  $id("btn-fault-detail-toggle-status").textContent = fault.status === "closed" ? "Reopen fault" : "Close fault";
  $id("btn-fault-detail-toggle-status").classList.toggle("danger", fault.status !== "closed");

  renderFaultContacts(response.contacts || []);
  renderFaultEvents(response.events || []);
}

export async function openFaultDetail(faultId) {
  await fillFaultDetailModal(faultId);
  showFaultDetailModal();
}

export async function saveFaultDetail() {
  if (!currentFaultDetail?.fault?.id) return;

  await api(`/admin/faults/${currentFaultDetail.fault.id}`, {
    method: "PUT",
    body: JSON.stringify({
      support_level: $id("fault-detail-support").value,
      serial_number: $id("fault-detail-serial").value,
      manufacturer_ticket_id: $id("fault-detail-ticket").value,
      fault_description: $id("fault-detail-description").value,
    }),
  });

  await fillFaultDetailModal(currentFaultDetail.fault.id);
  await loadFaults();
  $id("fault-detail-note").textContent = "Fault saved.";
}

export async function toggleFaultDetailStatus() {
  if (!currentFaultDetail?.fault?.id) return;
  const nextStatus = currentFaultDetail.fault.status === "closed" ? "open" : "closed";

  await api(`/admin/faults/${currentFaultDetail.fault.id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status: nextStatus }),
  });

  await fillFaultDetailModal(currentFaultDetail.fault.id);
  await loadFaults();
  $id("fault-detail-note").textContent = `Fault marked as ${nextStatus}.`;
}

export async function addFaultDetailEvent() {
  if (!currentFaultDetail?.fault?.id) return;

  await api(`/admin/faults/${currentFaultDetail.fault.id}/events`, {
    method: "POST",
    body: JSON.stringify({
      title: $id("fault-event-title").value,
      order_id: $id("fault-event-order-id").value,
      details: $id("fault-event-details").value,
    }),
  });

  $id("fault-event-title").value = "";
  $id("fault-event-order-id").value = "";
  $id("fault-event-details").value = "";
  await fillFaultDetailModal(currentFaultDetail.fault.id);
  await loadFaults();
  $id("fault-detail-note").textContent = "Event added.";
}

export function clearFaultFilters() {
  $id("fault-filter-status").value = "";
  $id("fault-filter-client").value = "";
  $id("fault-filter-manufacturer").value = "";
  $id("fault-filter-support").value = "";
  $id("fault-filter-date-from").value = "";
  $id("fault-filter-date-to").value = "";
}

export function initFaults() {
  $id("btn-faults-run")?.addEventListener("click", () => {
    loadFaults().catch((e) => {
      $id("faults-summary").textContent = e.message;
    });
  });

  $id("btn-faults-clear")?.addEventListener("click", () => {
    clearFaultFilters();
    loadFaults().catch((e) => {
      $id("faults-summary").textContent = e.message;
    });
  });

  $id("btn-fault-detail-close")?.addEventListener("click", closeFaultDetailModal);
  $id("btn-fault-detail-cancel")?.addEventListener("click", closeFaultDetailModal);
  $id("btn-fault-detail-save")?.addEventListener("click", () => {
    saveFaultDetail().catch((e) => {
      $id("fault-detail-note").textContent = e.message;
    });
  });
  $id("btn-fault-detail-toggle-status")?.addEventListener("click", () => {
    toggleFaultDetailStatus().catch((e) => {
      $id("fault-detail-note").textContent = e.message;
    });
  });
  $id("btn-fault-detail-add-event")?.addEventListener("click", () => {
    addFaultDetailEvent().catch((e) => {
      $id("fault-detail-note").textContent = e.message;
    });
  });
  $id("fault-detail-modal")?.addEventListener("click", (event) => {
    if (event.target === $id("fault-detail-modal")) closeFaultDetailModal();
  });
}

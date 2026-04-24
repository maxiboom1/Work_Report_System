import { api } from "../shared/api.js";
import { $id } from "../shared/dom.js";
import { t } from "./i18n.js";

export let CLIENTS = [];
export let CLIENT_SITES = [];
export let CLIENT_CONTACTS = [];
export let selectedClient = null;
export let selectedClientSite = null;
export let selectedClientContact = null;
export let clientEditModalState = null;

function setContext(id, text) {
  const el = $id(id);
  if (el) el.textContent = text;
}

function setText(selector, key) {
  const el = document.querySelector(selector);
  if (el) el.textContent = t(key);
}

function itemLabel(item) {
  if (!item) return "";
  return item.is_active ? item.name : `${item.name} (${t("disabledValue")})`;
}

export function setClientControlsDisabled(ids, disabled) {
  ids.forEach((id) => {
    const el = $id(id);
    if (el) el.disabled = disabled;
  });
}

export function contactLabel(contact) {
  if (!contact) return "";
  const base = `${contact.name || ""} (${contact.email || "-"})`;
  return contact.is_active ? base : `${base} (${t("disabledValue")})`;
}

export function renderEmptyList(list, message) {
  const empty = document.createElement("div");
  empty.className = "vitem-empty";
  empty.textContent = message;
  list.appendChild(empty);
}

export function currentClientEditItem() {
  if (!clientEditModalState) return null;
  if (clientEditModalState.kind === "client") return selectedClient;
  if (clientEditModalState.kind === "site") return selectedClientSite;
  if (clientEditModalState.kind === "contact") return selectedClientContact;
  return null;
}

export function openClientEditModal(kind, mode = "edit", id = null) {
  if (kind === "client") {
    if (mode === "edit") {
      selectedClient = CLIENTS.find((item) => String(item.id) === String(id)) || null;
    }
    if (mode === "edit" && !selectedClient) return;
  } else if (kind === "site") {
    if (!selectedClient && mode === "create") return;
    if (mode === "edit") {
      selectedClientSite = CLIENT_SITES.find((item) => String(item.id) === String(id)) || null;
    }
    if (mode === "edit" && !selectedClientSite) return;
  } else if (kind === "contact") {
    if (!selectedClient && mode === "create") return;
    if (mode === "edit") {
      selectedClientContact = CLIENT_CONTACTS.find((item) => String(item.id) === String(id)) || null;
    }
    if (mode === "edit" && !selectedClientContact) return;
  } else {
    return;
  }

  clientEditModalState = { kind, mode };

  fillClientEditModal();
  $id("client-edit-modal")?.classList.remove("is-hidden");
  $id("client-edit-modal")?.setAttribute("aria-hidden", "false");
  $id("client-edit-modal-name")?.focus();
}

export function closeClientEditModal() {
  clientEditModalState = null;
  $id("client-edit-modal-note").textContent = "";
  $id("client-edit-modal")?.classList.add("is-hidden");
  $id("client-edit-modal")?.setAttribute("aria-hidden", "true");
}

export function fillClientEditModal() {
  const item = currentClientEditItem();
  const kind = clientEditModalState?.kind;
  const mode = clientEditModalState?.mode || "edit";
  const isContact = kind === "contact";
  const context = kind === "client"
    ? mode === "edit" ? item?.name || "" : ""
    : `${selectedClient?.name || ""}${mode === "edit" && item?.name ? ` • ${item.name}` : ""}`;

  setText(
    "#client-edit-modal-title",
    mode === "create"
      ? kind === "client" ? "newClient" : kind === "site" ? "newSite" : "newContact"
      : kind === "client" ? "editClient" : kind === "site" ? "editSite" : kind === "contact" ? "editContact" : "editSelectedItem"
  );
  setContext("client-edit-modal-context", context);

  if ($id("client-edit-modal-name-label")) {
    $id("client-edit-modal-name-label").textContent = t(
      kind === "client" ? "clientName" : kind === "site" ? "clientSiteName" : "clientContactName"
    );
  }

  if ($id("client-edit-modal-name")) $id("client-edit-modal-name").value = mode === "edit" ? item?.name || "" : "";
  if ($id("client-edit-modal-email")) $id("client-edit-modal-email").value = isContact && mode === "edit" ? item?.email || "" : "";
  if ($id("client-edit-modal-phone")) $id("client-edit-modal-phone").value = isContact && mode === "edit" ? item?.phone || "" : "";
  if ($id("client-edit-modal-active")) $id("client-edit-modal-active").value = mode === "edit" && item?.is_active ? "1" : "1";
  $id("btn-client-edit-toggle").textContent = mode === "edit" && item?.is_active ? t("disable") : t("enable");
  $id("client-edit-modal-email-row")?.classList.toggle("is-hidden", !isContact);
  $id("client-edit-modal-phone-row")?.classList.toggle("is-hidden", !isContact);
  $id("client-edit-modal-active-row")?.classList.toggle("is-hidden", mode !== "edit");
  $id("btn-client-edit-toggle")?.classList.toggle("is-hidden", mode !== "edit");
  $id("client-edit-modal-note").textContent = "";
}

export function renderClientList(filter = "") {
  const list = $id("client-list");
  if (!list) return;
  list.innerHTML = "";
  const f = filter.toLowerCase();
  const rows = CLIENTS.filter((item) => !f || String(item.name || "").toLowerCase().includes(f));

  if (rows.length === 0) {
    renderEmptyList(list, t("noClients"));
    return;
  }

  for (const item of rows) {
    const btn = document.createElement("button");
    btn.className = "vitem";
    btn.type = "button";
    btn.textContent = itemLabel(item);
    if (selectedClient?.id === item.id) btn.classList.add("active");
    btn.addEventListener("click", () => selectClient(item.id));
    list.appendChild(btn);
  }
}

export function fillClientEdit(item) {
  setContext("client-site-context", item ? `${t("clientSitesContext")} ${item.name}` : t("clientSitesContextEmpty"));
  setContext("client-contact-context", item ? `${t("clientContactsContext")} ${item.name}` : t("clientContactsContextEmpty"));
  if ($id("btn-client-edit-open")) $id("btn-client-edit-open").disabled = !item;
  if ($id("btn-client-site-create-open")) $id("btn-client-site-create-open").disabled = !item;
  if ($id("btn-client-contact-create-open")) $id("btn-client-contact-create-open").disabled = !item;
}

export async function selectClient(id) {
  selectedClient = CLIENTS.find((item) => String(item.id) === String(id)) || null;
  selectedClientSite = null;
  selectedClientContact = null;
  fillClientEdit(selectedClient);
  renderClientList($id("client-search").value);
  await loadClientSites();
  await loadClientContacts();
}

export async function loadClients() {
  const r = await api("/admin/clients");
  CLIENTS = r.clients || [];
  if (selectedClient) {
    selectedClient = CLIENTS.find((item) => item.id === selectedClient.id) || null;
  }
  renderClientList($id("client-search")?.value || "");
  fillClientEdit(selectedClient);
  await loadClientSites();
  await loadClientContacts();
}

export function renderClientSiteList(filter = "") {
  const list = $id("client-site-list");
  if (!list) return;
  list.innerHTML = "";
  const f = filter.toLowerCase();
  const rows = CLIENT_SITES.filter((item) => !f || String(item.name || "").toLowerCase().includes(f));

  if (rows.length === 0) {
    renderEmptyList(list, selectedClient ? t("noSites") : t("clientSitesContextEmpty"));
    return;
  }

  for (const item of rows) {
    const btn = document.createElement("button");
    btn.className = "vitem";
    btn.type = "button";
    btn.textContent = itemLabel(item);
    if (selectedClientSite?.id === item.id) btn.classList.add("active");
    btn.addEventListener("click", () => selectClientSite(item.id));
    list.appendChild(btn);
  }
}

export function fillClientSiteEdit(item) {
  if ($id("btn-client-site-edit-open")) $id("btn-client-site-edit-open").disabled = !item;
}

export function selectClientSite(id) {
  selectedClientSite = CLIENT_SITES.find((item) => String(item.id) === String(id)) || null;
  fillClientSiteEdit(selectedClientSite);
  renderClientSiteList($id("client-site-search").value);
}

export async function loadClientSites() {
  if (!selectedClient) {
    CLIENT_SITES = [];
    selectedClientSite = null;
    renderClientSiteList("");
    fillClientSiteEdit(null);
    return;
  }

  const r = await api(`/admin/client-sites?client_id=${encodeURIComponent(selectedClient.id)}`);
  CLIENT_SITES = r.sites || [];
  if (selectedClientSite) {
    selectedClientSite = CLIENT_SITES.find((item) => item.id === selectedClientSite.id) || null;
  }
  renderClientSiteList($id("client-site-search")?.value || "");
  fillClientSiteEdit(selectedClientSite);
}

export function renderClientContactList(filter = "") {
  const list = $id("client-contact-list");
  if (!list) return;
  list.innerHTML = "";
  const f = filter.toLowerCase();
  const rows = CLIENT_CONTACTS.filter((item) => {
    const haystack = `${item.name || ""} ${item.email || ""} ${item.phone || ""}`.toLowerCase();
    return !f || haystack.includes(f);
  });

  if (rows.length === 0) {
    renderEmptyList(list, selectedClient ? t("noContacts") : t("clientContactsContextEmpty"));
    return;
  }

  for (const item of rows) {
    const btn = document.createElement("button");
    btn.className = "vitem";
    btn.type = "button";
    btn.textContent = contactLabel(item);
    if (selectedClientContact?.id === item.id) btn.classList.add("active");
    btn.addEventListener("click", () => selectClientContact(item.id));
    list.appendChild(btn);
  }
}

export function fillClientContactEdit(item) {
  if ($id("btn-client-contact-edit-open")) $id("btn-client-contact-edit-open").disabled = !item;
}

export function selectClientContact(id) {
  selectedClientContact = CLIENT_CONTACTS.find((item) => String(item.id) === String(id)) || null;
  fillClientContactEdit(selectedClientContact);
  renderClientContactList($id("client-contact-search").value);
}

export async function loadClientContacts() {
  if (!selectedClient) {
    CLIENT_CONTACTS = [];
    selectedClientContact = null;
    renderClientContactList("");
    fillClientContactEdit(null);
    return;
  }

  const r = await api(`/admin/client-contacts?client_id=${encodeURIComponent(selectedClient.id)}`);
  CLIENT_CONTACTS = r.contacts || [];
  if (selectedClientContact) {
    selectedClientContact = CLIENT_CONTACTS.find((item) => item.id === selectedClientContact.id) || null;
  }
  renderClientContactList($id("client-contact-search")?.value || "");
  fillClientContactEdit(selectedClientContact);
}

export async function saveClientEditModal() {
  const item = currentClientEditItem();
  const kind = clientEditModalState?.kind;
  const mode = clientEditModalState?.mode || "edit";
  if (!kind) return;

  if (kind === "client" && mode === "create") {
    const r = await api("/admin/clients", {
      method: "POST",
      body: JSON.stringify({ name: $id("client-edit-modal-name").value }),
    });
    $id("client-note").textContent = r.message ? t("clientCreated") : t("clientCreated");
    await loadClients();
  } else if (kind === "client" && item) {
    const r = await api(`/admin/clients/${item.id}`, {
      method: "PUT",
      body: JSON.stringify({
        name: $id("client-edit-modal-name").value,
        is_active: $id("client-edit-modal-active").value === "1",
      }),
    });
    $id("client-note").textContent = r.message ? t("clientSaved") : t("clientSaved");
    await loadClients();
  } else if (kind === "site" && mode === "create") {
    const r = await api("/admin/client-sites", {
      method: "POST",
      body: JSON.stringify({
        client_id: selectedClient.id,
        name: $id("client-edit-modal-name").value,
      }),
    });
    $id("client-site-note").textContent = r.message ? t("clientSiteCreated") : t("clientSiteCreated");
    await loadClientSites();
  } else if (kind === "site" && item) {
    const r = await api(`/admin/client-sites/${item.id}`, {
      method: "PUT",
      body: JSON.stringify({
        name: $id("client-edit-modal-name").value,
        is_active: $id("client-edit-modal-active").value === "1",
      }),
    });
    $id("client-site-note").textContent = r.message ? t("clientSiteSaved") : t("clientSiteSaved");
    await loadClientSites();
  } else if (kind === "contact" && mode === "create") {
    const r = await api("/admin/client-contacts", {
      method: "POST",
      body: JSON.stringify({
        client_id: selectedClient.id,
        name: $id("client-edit-modal-name").value,
        email: $id("client-edit-modal-email").value,
        phone: $id("client-edit-modal-phone").value,
      }),
    });
    $id("client-contact-note").textContent = r.message ? t("clientContactCreated") : t("clientContactCreated");
    await loadClientContacts();
  } else if (kind === "contact" && item) {
    const r = await api(`/admin/client-contacts/${item.id}`, {
      method: "PUT",
      body: JSON.stringify({
        name: $id("client-edit-modal-name").value,
        email: $id("client-edit-modal-email").value,
        phone: $id("client-edit-modal-phone").value,
        is_active: $id("client-edit-modal-active").value === "1",
      }),
    });
    $id("client-contact-note").textContent = r.message ? t("clientContactSaved") : t("clientContactSaved");
    await loadClientContacts();
  }

  closeClientEditModal();
}

export async function toggleClientEditModal() {
  const item = currentClientEditItem();
  const kind = clientEditModalState?.kind;
  if (!item || !kind || clientEditModalState?.mode !== "edit") return;
  const nextActive = !item.is_active;

  if (kind === "client") {
    const r = await api(`/admin/clients/${item.id}`, {
      method: "PUT",
      body: JSON.stringify({ is_active: nextActive }),
    });
    $id("client-note").textContent = r.message ? (nextActive ? t("clientEnabled") : t("clientDisabled")) : "";
    await loadClients();
  } else if (kind === "site") {
    const r = await api(`/admin/client-sites/${item.id}`, {
      method: "PUT",
      body: JSON.stringify({ is_active: nextActive }),
    });
    $id("client-site-note").textContent = r.message ? (nextActive ? t("clientSiteEnabled") : t("clientSiteDisabled")) : "";
    await loadClientSites();
  } else if (kind === "contact") {
    const r = await api(`/admin/client-contacts/${item.id}`, {
      method: "PUT",
      body: JSON.stringify({ is_active: nextActive }),
    });
    $id("client-contact-note").textContent = r.message ? (nextActive ? t("clientContactEnabled") : t("clientContactDisabled")) : "";
    await loadClientContacts();
  }

  closeClientEditModal();
}

// =========================
// Fault equipment hierarchy
// =========================

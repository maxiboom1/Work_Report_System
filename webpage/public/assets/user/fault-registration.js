import { api } from "../shared/api.js";
import { $id } from "../shared/dom.js";
import { t, updateStaticText } from "./i18n.js";

let clientTree = [];
let equipmentTree = [];
let customContactCounter = 0;

function option(label, value) {
  const opt = document.createElement("option");
  opt.value = value;
  opt.textContent = label;
  return opt;
}

function findClient() {
  return clientTree.find((item) => String(item.id) === String($id("fault-client")?.value || ""));
}

function findManufacturer() {
  return equipmentTree.find((item) => String(item.id) === String($id("fault-manufacturer")?.value || ""));
}

function findCategory() {
  const manufacturer = findManufacturer();
  if (!manufacturer) return null;
  return (manufacturer.categories || []).find((item) => String(item.id) === String($id("fault-category")?.value || ""));
}

function resetSelect(select, placeholder) {
  if (!select) return;
  select.innerHTML = "";
  select.appendChild(option(placeholder, ""));
}

function toggleHidden(id, hidden) {
  const el = $id(id);
  if (el) el.hidden = hidden;
}

function renderClientOptions() {
  const select = $id("fault-client");
  resetSelect(select, t("selectCustomer"));
  for (const client of clientTree) {
    select.appendChild(option(client.name, String(client.id)));
  }
  select.appendChild(option(t("other"), "other"));
}

function renderSiteOptions() {
  const select = $id("fault-site");
  resetSelect(select, t("selectSite"));

  const clientSelection = $id("fault-client")?.value || "";
  const client = findClient();
  if (client) {
    for (const site of client.sites || []) {
      select.appendChild(option(site.name, String(site.id)));
    }
  }

  select.appendChild(option(t("other"), "other"));

  if (clientSelection === "other") {
    select.value = "other";
  } else if (!client) {
    select.value = "";
  } else if ((client.sites || []).length) {
    select.value = String(client.sites[0].id);
  } else {
    select.value = "other";
  }
  renderSiteMode();
}

function renderSiteMode() {
  toggleHidden("fault-site-other-wrap", $id("fault-site")?.value !== "other");
}

function renderExistingContacts() {
  const list = $id("fault-contacts-existing");
  const empty = $id("fault-contacts-empty");
  if (!list || !empty) return;

  const client = findClient();
  list.innerHTML = "";

  if (!client || !(client.contacts || []).length) {
    empty.hidden = false;
    list.hidden = true;
    return;
  }

  empty.hidden = true;
  list.hidden = false;

  for (const contact of client.contacts || []) {
    const label = document.createElement("label");
    label.className = "fault-contact-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = String(contact.id);

    const copy = document.createElement("div");
    copy.className = "fault-contact-copy";

    const name = document.createElement("div");
    name.className = "fault-contact-name";
    name.textContent = contact.name || t("unnamedContact");

    const meta = document.createElement("div");
    meta.className = "fault-contact-meta";
    const parts = [];
    if (contact.email) parts.push(contact.email);
    if (contact.phone) parts.push(contact.phone);
    meta.textContent = parts.join(" | ") || t("noEmailPhone");

    copy.append(name, meta);
    label.append(checkbox, copy);
    list.appendChild(label);
  }
}

function renderClientMode() {
  const isOther = $id("fault-client")?.value === "other";
  toggleHidden("fault-client-other-wrap", !isOther);
  renderSiteOptions();
  renderExistingContacts();
}

function renderManufacturerOptions() {
  const select = $id("fault-manufacturer");
  resetSelect(select, t("selectManufacturer"));
  for (const manufacturer of equipmentTree) {
    select.appendChild(option(manufacturer.name, String(manufacturer.id)));
  }
  select.appendChild(option(t("other"), "other"));
}

function renderCategoryOptions() {
  const select = $id("fault-category");
  resetSelect(select, t("selectCategory"));
  const manufacturer = findManufacturer();
  if (manufacturer) {
    for (const category of manufacturer.categories || []) {
      select.appendChild(option(category.name, String(category.id)));
    }
  }
  select.appendChild(option(t("other"), "other"));

  if (!manufacturer) {
    select.value = "";
  } else if ((manufacturer.categories || []).length) {
    select.value = String(manufacturer.categories[0].id);
  } else {
    select.value = "other";
  }
  renderCategoryMode();
}

function renderSubcategoryOptions() {
  const select = $id("fault-subcategory");
  resetSelect(select, t("selectSubcategory"));
  const category = findCategory();
  if (category) {
    for (const subcategory of category.subcategories || []) {
      select.appendChild(option(subcategory.name, String(subcategory.id)));
    }
  }
  select.appendChild(option(t("other"), "other"));

  if (!category) {
    select.value = "";
  } else if ((category.subcategories || []).length) {
    select.value = String(category.subcategories[0].id);
  } else {
    select.value = "other";
  }
  renderSubcategoryMode();
}

function renderManufacturerMode() {
  const isOther = $id("fault-manufacturer")?.value === "other";
  toggleHidden("fault-manufacturer-other-wrap", !isOther);

  const categorySelect = $id("fault-category");
  const subcategorySelect = $id("fault-subcategory");
  if (categorySelect) categorySelect.disabled = isOther;
  if (subcategorySelect) subcategorySelect.disabled = isOther;

  toggleHidden("fault-category-other-wrap", !isOther && $id("fault-category")?.value !== "other");
  toggleHidden("fault-subcategory-other-wrap", !isOther && $id("fault-subcategory")?.value !== "other");

  if (isOther) {
    resetSelect(categorySelect, t("otherCategory"));
    resetSelect(subcategorySelect, t("otherSubcategory"));
  } else {
    renderCategoryOptions();
  }
}

function renderCategoryMode() {
  const manufacturerOther = $id("fault-manufacturer")?.value === "other";
  const isOther = manufacturerOther || $id("fault-category")?.value === "other";
  toggleHidden("fault-category-other-wrap", !isOther);

  const subcategorySelect = $id("fault-subcategory");
  if (subcategorySelect) subcategorySelect.disabled = isOther;

  if (isOther) {
    toggleHidden("fault-subcategory-other-wrap", false);
    resetSelect(subcategorySelect, t("otherSubcategory"));
  } else {
    renderSubcategoryOptions();
  }
}

function renderSubcategoryMode() {
  const hidden = !($id("fault-manufacturer")?.value === "other" || $id("fault-category")?.value === "other" || $id("fault-subcategory")?.value === "other");
  toggleHidden("fault-subcategory-other-wrap", hidden);
}

function makeCustomContactRow(rowId) {
  const row = document.createElement("div");
  row.className = "fault-custom-contact";
  row.dataset.contactRowId = String(rowId);

  row.innerHTML = `
    <div class="field">
      <div class="field-label" data-i18n="name">Name</div>
      <input class="select select-md" data-contact-field="name" type="text" />
    </div>
    <div class="field">
      <div class="field-label" data-i18n="email">Email</div>
      <input class="select select-md" data-contact-field="email" type="email" />
    </div>
    <div class="field">
      <div class="field-label" data-i18n="phone">Phone</div>
      <input class="select select-md" data-contact-field="phone" type="text" />
    </div>
    <button class="btn fault-remove-btn" data-remove-contact type="button" data-i18n="remove">Remove</button>
  `;
  updateStaticText(row);

  row.querySelector("[data-remove-contact]")?.addEventListener("click", () => row.remove());
  return row;
}

export function addCustomContactRow() {
  const holder = $id("fault-custom-contacts");
  if (!holder) return;
  customContactCounter += 1;
  holder.appendChild(makeCustomContactRow(customContactCounter));
}

function collectContacts() {
  const contacts = [];

  document.querySelectorAll("#fault-contacts-existing input[type='checkbox']:checked").forEach((checkbox) => {
    contacts.push({
      mode: "existing",
      contact_id: Number(checkbox.value),
    });
  });

  document.querySelectorAll(".fault-custom-contact").forEach((row) => {
    const name = String(row.querySelector("[data-contact-field='name']")?.value || "").trim();
    const email = String(row.querySelector("[data-contact-field='email']")?.value || "").trim();
    const phone = String(row.querySelector("[data-contact-field='phone']")?.value || "").trim();

    if (!name && !email && !phone) return;
    if (!name) throw new Error(t("customContactNameRequired"));

    contacts.push({
      mode: "other",
      name,
      email,
      phone,
    });
  });

  if (!contacts.length) {
    throw new Error(t("selectOrAddContact"));
  }

  return contacts;
}

function buildPayload() {
  const clientValue = $id("fault-client")?.value || "";
  const siteValue = $id("fault-site")?.value || "";
  const manufacturerValue = $id("fault-manufacturer")?.value || "";
  const categoryValue = $id("fault-category")?.value || "";
  const subcategoryValue = $id("fault-subcategory")?.value || "";

  if (!clientValue) throw new Error(t("customerRequired"));
  if (!siteValue) throw new Error(t("siteRequired"));
  if (!manufacturerValue) throw new Error(t("manufacturerRequired"));
  if (!categoryValue && manufacturerValue !== "other") throw new Error(t("categoryRequired"));
  if (!subcategoryValue && manufacturerValue !== "other" && categoryValue !== "other") throw new Error(t("subcategoryRequired"));

  const payload = {
    client_mode: clientValue === "other" ? "other" : "existing",
    client_id: clientValue && clientValue !== "other" ? Number(clientValue) : null,
    client_name: clientValue === "other" ? String($id("fault-client-other")?.value || "").trim() : "",
    site_mode: siteValue === "other" ? "other" : "existing",
    site_id: siteValue && siteValue !== "other" ? Number(siteValue) : null,
    site_name: siteValue === "other" ? String($id("fault-site-other")?.value || "").trim() : "",
    manufacturer_mode: manufacturerValue === "other" ? "other" : "existing",
    manufacturer_id: manufacturerValue && manufacturerValue !== "other" ? Number(manufacturerValue) : null,
    manufacturer_name: manufacturerValue === "other" ? String($id("fault-manufacturer-other")?.value || "").trim() : "",
    equipment_category_mode: manufacturerValue === "other" || categoryValue === "other" ? "other" : "existing",
    equipment_category_id: manufacturerValue !== "other" && categoryValue && categoryValue !== "other" ? Number(categoryValue) : null,
    equipment_category_name: manufacturerValue === "other" || categoryValue === "other" ? String($id("fault-category-other")?.value || "").trim() : "",
    equipment_subcategory_mode: manufacturerValue === "other" || categoryValue === "other" || subcategoryValue === "other" ? "other" : "existing",
    equipment_subcategory_id: manufacturerValue !== "other" && categoryValue !== "other" && subcategoryValue && subcategoryValue !== "other" ? Number(subcategoryValue) : null,
    equipment_subcategory_name: manufacturerValue === "other" || categoryValue === "other" || subcategoryValue === "other"
      ? String($id("fault-subcategory-other")?.value || "").trim()
      : "",
    support_level: $id("fault-support-level")?.value || "",
    serial_number: String($id("fault-serial-number")?.value || "").trim(),
    manufacturer_ticket_id: String($id("fault-ticket-id")?.value || "").trim(),
    fault_description: String($id("fault-description")?.value || "").trim(),
    contacts: collectContacts(),
  };

  if (payload.client_mode === "other" && !payload.client_name) throw new Error(t("otherCustomerRequired"));
  if (payload.site_mode === "other" && !payload.site_name) throw new Error(t("otherSiteRequired"));
  if (payload.manufacturer_mode === "other" && !payload.manufacturer_name) throw new Error(t("otherManufacturerRequired"));
  if (payload.equipment_category_mode === "other" && !payload.equipment_category_name) throw new Error(t("otherCategoryRequired"));
  if (payload.equipment_subcategory_mode === "other" && !payload.equipment_subcategory_name) throw new Error(t("otherSubcategoryRequired"));

  return payload;
}

function resetForm() {
  $id("fault-client-other").value = "";
  $id("fault-site-other").value = "";
  $id("fault-manufacturer-other").value = "";
  $id("fault-category-other").value = "";
  $id("fault-subcategory-other").value = "";
  $id("fault-serial-number").value = "";
  $id("fault-ticket-id").value = "";
  $id("fault-description").value = "";
  $id("fault-support-level").value = "layer2_support";
  $id("fault-custom-contacts").innerHTML = "";
  renderClientOptions();
  renderManufacturerOptions();
  $id("fault-client").value = "";
  $id("fault-manufacturer").value = "";
  renderClientMode();
  renderManufacturerMode();
}

export async function loadFaultFormLookups() {
  const [clientResponse, equipmentResponse] = await Promise.all([
    api("/fault/client-tree"),
    api("/fault/equipment-tree"),
  ]);

  clientTree = clientResponse.clients || [];
  equipmentTree = equipmentResponse.manufacturers || [];
  resetForm();
}

export function refreshFaultRegistrationLanguage() {
  renderClientOptions();
  renderManufacturerOptions();
  renderClientMode();
  renderManufacturerMode();
  document.querySelectorAll(".fault-custom-contact").forEach((row) => updateStaticText(row));
}

export async function saveFaultRegistration() {
  const payload = buildPayload();
  const result = await api("/my/manager/faults", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  resetForm();
  return result;
}

export function initFaultRegistration() {
  $id("fault-client")?.addEventListener("change", renderClientMode);
  $id("fault-site")?.addEventListener("change", renderSiteMode);
  $id("fault-manufacturer")?.addEventListener("change", renderManufacturerMode);
  $id("fault-category")?.addEventListener("change", renderCategoryMode);
  $id("fault-subcategory")?.addEventListener("change", renderSubcategoryMode);
  $id("btn-add-custom-contact")?.addEventListener("click", addCustomContactRow);
}

import { api } from "../shared/api.js";
import { $id } from "../shared/dom.js";
import { t } from "./i18n.js";

export let FAULT_MANUFACTURERS = [];
export let FAULT_CATEGORIES = [];
export let FAULT_SUBCATEGORIES = [];
export let selectedFaultManufacturer = null;
export let selectedFaultCategory = null;
export let selectedFaultSubcategory = null;
export let faultEditModalState = null;

function setContext(id, text) {
  const el = $id(id);
  if (el) el.textContent = text;
}

function setText(selector, key) {
  const el = document.querySelector(selector);
  if (el) el.textContent = t(key);
}

export function itemLabel(item) {
  if (!item) return "";
  return item.is_active ? item.name : `${item.name} (${t("disabledValue")})`;
}

function renderEmptyList(list, message) {
  const empty = document.createElement("div");
  empty.className = "vitem";
  empty.textContent = message;
  list.appendChild(empty);
}

export function setFaultControlsDisabled(prefix, disabled) {
  [`fault-${prefix}-edit-name`, `fault-${prefix}-edit-active`, `btn-fault-${prefix}-save`, `btn-fault-${prefix}-toggle`].forEach((id) => {
    const el = $id(id);
    if (el) el.disabled = disabled;
  });
}

export function currentFaultEditItem() {
  if (!faultEditModalState) return null;
  if (faultEditModalState.kind === "manufacturer") return selectedFaultManufacturer;
  if (faultEditModalState.kind === "category") return selectedFaultCategory;
  if (faultEditModalState.kind === "subcategory") return selectedFaultSubcategory;
  return null;
}

export function openFaultEditModal(kind, mode = "edit", id = null) {
  if (kind === "manufacturer") {
    if (mode === "edit") {
      selectedFaultManufacturer = FAULT_MANUFACTURERS.find((item) => String(item.id) === String(id)) || null;
    }
    if (mode === "edit" && !selectedFaultManufacturer) return;
  } else if (kind === "category") {
    if (!selectedFaultManufacturer && mode === "create") return;
    if (mode === "edit") {
      selectedFaultCategory = FAULT_CATEGORIES.find((item) => String(item.id) === String(id)) || null;
    }
    if (mode === "edit" && !selectedFaultCategory) return;
  } else if (kind === "subcategory") {
    if (!selectedFaultCategory && mode === "create") return;
    if (mode === "edit") {
      selectedFaultSubcategory = FAULT_SUBCATEGORIES.find((item) => String(item.id) === String(id)) || null;
    }
    if (mode === "edit" && !selectedFaultSubcategory) return;
  } else {
    return;
  }

  faultEditModalState = { kind, mode };
  fillFaultEditModal();
  $id("fault-edit-modal")?.classList.remove("is-hidden");
  $id("fault-edit-modal")?.setAttribute("aria-hidden", "false");
  $id("fault-edit-modal-name")?.focus();
}

export function closeFaultEditModal() {
  faultEditModalState = null;
  $id("fault-edit-modal-note").textContent = "";
  $id("fault-edit-modal")?.classList.add("is-hidden");
  $id("fault-edit-modal")?.setAttribute("aria-hidden", "true");
}

export function fillFaultEditModal() {
  const item = currentFaultEditItem();
  const kind = faultEditModalState?.kind;
  const mode = faultEditModalState?.mode || "edit";
  const titleKey = mode === "create"
    ? kind === "manufacturer" ? "newManufacturer" : kind === "category" ? "newCategory" : "newSubcategory"
    : kind === "manufacturer" ? "editManufacturer" : kind === "category" ? "editCategory" : "editSubcategory";
  const context = kind === "manufacturer"
    ? mode === "edit" ? item?.name || "" : ""
    : kind === "category"
      ? `${selectedFaultManufacturer?.name || ""}${mode === "edit" && item?.name ? ` • ${item.name}` : ""}`
      : `${selectedFaultManufacturer?.name || ""}${selectedFaultCategory?.name ? ` • ${selectedFaultCategory.name}` : ""}${mode === "edit" && item?.name ? ` • ${item.name}` : ""}`;

  setText("#fault-edit-modal-title", titleKey);
  setContext("fault-edit-modal-context", context);
  if ($id("fault-edit-modal-name-label")) {
    $id("fault-edit-modal-name-label").textContent = t(
      kind === "manufacturer" ? "manufacturerName" : kind === "category" ? "equipmentCategoryName" : "equipmentSubcategoryName"
    );
  }
  if ($id("fault-edit-modal-name")) $id("fault-edit-modal-name").value = mode === "edit" ? item?.name || "" : "";
  if ($id("fault-edit-modal-active")) $id("fault-edit-modal-active").value = mode === "edit" && item?.is_active ? "1" : "1";
  $id("fault-edit-modal-active-row")?.classList.toggle("is-hidden", mode !== "edit");
  $id("btn-fault-edit-toggle")?.classList.toggle("is-hidden", mode !== "edit");
  $id("btn-fault-edit-toggle").textContent = mode === "edit" && item?.is_active ? t("disable") : t("enable");
  $id("fault-edit-modal-note").textContent = "";
}

export function renderFaultManufacturerList(filter = "") {
  const list = $id("fault-mfr-list");
  if (!list) return;
  list.innerHTML = "";
  const f = filter.toLowerCase();
  const rows = FAULT_MANUFACTURERS.filter((item) => !f || String(item.name || "").toLowerCase().includes(f));

  if (rows.length === 0) {
    renderEmptyList(list, t("noManufacturers"));
    return;
  }

  for (const item of rows) {
    const btn = document.createElement("button");
    btn.className = "vitem";
    btn.type = "button";
    btn.textContent = itemLabel(item);
    if (selectedFaultManufacturer?.id === item.id) btn.classList.add("active");
    btn.addEventListener("click", () => selectFaultManufacturer(item.id));
    list.appendChild(btn);
  }
}

export function fillFaultManufacturerEdit(item) {
  setContext("fault-cat-context", item ? `${t("categoriesContext")} ${item.name}` : t("categoriesContextEmpty"));
  if ($id("btn-fault-mfr-edit-open")) $id("btn-fault-mfr-edit-open").disabled = !item;
  if ($id("btn-fault-cat-create-open")) $id("btn-fault-cat-create-open").disabled = !item;
}

export async function selectFaultManufacturer(id) {
  selectedFaultManufacturer = FAULT_MANUFACTURERS.find((item) => String(item.id) === String(id)) || null;
  selectedFaultCategory = null;
  selectedFaultSubcategory = null;
  fillFaultManufacturerEdit(selectedFaultManufacturer);
  renderFaultManufacturerList($id("fault-mfr-search").value);
  await loadFaultCategories();
}

export async function loadFaultManufacturers() {
  const r = await api("/admin/fault/manufacturers");
  FAULT_MANUFACTURERS = r.manufacturers || [];
  if (selectedFaultManufacturer) {
    selectedFaultManufacturer = FAULT_MANUFACTURERS.find((item) => item.id === selectedFaultManufacturer.id) || null;
  }
  renderFaultManufacturerList($id("fault-mfr-search")?.value || "");
  fillFaultManufacturerEdit(selectedFaultManufacturer);
  await loadFaultCategories();
}

export function renderFaultCategoryList(filter = "") {
  const list = $id("fault-cat-list");
  if (!list) return;
  list.innerHTML = "";
  const f = filter.toLowerCase();
  const rows = FAULT_CATEGORIES.filter((item) => !f || String(item.name || "").toLowerCase().includes(f));

  if (rows.length === 0) {
    renderEmptyList(list, selectedFaultManufacturer ? t("noCategories") : t("categoriesContextEmpty"));
    return;
  }

  for (const item of rows) {
    const btn = document.createElement("button");
    btn.className = "vitem";
    btn.type = "button";
    btn.textContent = itemLabel(item);
    if (selectedFaultCategory?.id === item.id) btn.classList.add("active");
    btn.addEventListener("click", () => selectFaultCategory(item.id));
    list.appendChild(btn);
  }
}

export function fillFaultCategoryEdit(item) {
  setContext("fault-sub-context", item ? `${t("subcategoriesContext")} ${item.name}` : t("subcategoriesContextEmpty"));
  if ($id("btn-fault-cat-edit-open")) $id("btn-fault-cat-edit-open").disabled = !item;
  if ($id("btn-fault-sub-create-open")) $id("btn-fault-sub-create-open").disabled = !item;
}

export async function selectFaultCategory(id) {
  selectedFaultCategory = FAULT_CATEGORIES.find((item) => String(item.id) === String(id)) || null;
  selectedFaultSubcategory = null;
  fillFaultCategoryEdit(selectedFaultCategory);
  renderFaultCategoryList($id("fault-cat-search").value);
  await loadFaultSubcategories();
}

export async function loadFaultCategories() {
  if (!selectedFaultManufacturer) {
    FAULT_CATEGORIES = [];
    selectedFaultCategory = null;
    renderFaultCategoryList("");
    fillFaultCategoryEdit(null);
    await loadFaultSubcategories();
    return;
  }

  const r = await api(`/admin/fault/categories?manufacturer_id=${encodeURIComponent(selectedFaultManufacturer.id)}`);
  FAULT_CATEGORIES = r.categories || [];
  if (selectedFaultCategory) {
    selectedFaultCategory = FAULT_CATEGORIES.find((item) => item.id === selectedFaultCategory.id) || null;
  }
  renderFaultCategoryList($id("fault-cat-search")?.value || "");
  fillFaultCategoryEdit(selectedFaultCategory);
  await loadFaultSubcategories();
}

export function renderFaultSubcategoryList(filter = "") {
  const list = $id("fault-sub-list");
  if (!list) return;
  list.innerHTML = "";
  const f = filter.toLowerCase();
  const rows = FAULT_SUBCATEGORIES.filter((item) => !f || String(item.name || "").toLowerCase().includes(f));

  if (rows.length === 0) {
    renderEmptyList(list, selectedFaultCategory ? t("noSubcategories") : t("subcategoriesContextEmpty"));
    return;
  }

  for (const item of rows) {
    const btn = document.createElement("button");
    btn.className = "vitem";
    btn.type = "button";
    btn.textContent = itemLabel(item);
    if (selectedFaultSubcategory?.id === item.id) btn.classList.add("active");
    btn.addEventListener("click", () => selectFaultSubcategory(item.id));
    list.appendChild(btn);
  }
}

export function fillFaultSubcategoryEdit(item) {
  if ($id("btn-fault-sub-edit-open")) $id("btn-fault-sub-edit-open").disabled = !item;
}

export function selectFaultSubcategory(id) {
  selectedFaultSubcategory = FAULT_SUBCATEGORIES.find((item) => String(item.id) === String(id)) || null;
  fillFaultSubcategoryEdit(selectedFaultSubcategory);
  renderFaultSubcategoryList($id("fault-sub-search").value);
}

export async function loadFaultSubcategories() {
  if (!selectedFaultCategory) {
    FAULT_SUBCATEGORIES = [];
    selectedFaultSubcategory = null;
    renderFaultSubcategoryList("");
    fillFaultSubcategoryEdit(null);
    return;
  }

  const r = await api(`/admin/fault/subcategories?equipment_category_id=${encodeURIComponent(selectedFaultCategory.id)}`);
  FAULT_SUBCATEGORIES = r.subcategories || [];
  if (selectedFaultSubcategory) {
    selectedFaultSubcategory = FAULT_SUBCATEGORIES.find((item) => item.id === selectedFaultSubcategory.id) || null;
  }
  renderFaultSubcategoryList($id("fault-sub-search")?.value || "");
  fillFaultSubcategoryEdit(selectedFaultSubcategory);
}

export async function saveFaultEditModal() {
  const item = currentFaultEditItem();
  const kind = faultEditModalState?.kind;
  const mode = faultEditModalState?.mode || "edit";
  if (!kind) return;

  if (kind === "manufacturer" && mode === "create") {
    const r = await api("/admin/fault/manufacturers", {
      method: "POST",
      body: JSON.stringify({ name: $id("fault-edit-modal-name").value }),
    });
    $id("fault-mfr-note").textContent = r.message ? t("manufacturerCreated") : t("manufacturerCreated");
    await loadFaultManufacturers();
  } else if (kind === "manufacturer" && item) {
    const r = await api(`/admin/fault/manufacturers/${item.id}`, {
      method: "PUT",
      body: JSON.stringify({
        name: $id("fault-edit-modal-name").value,
        is_active: $id("fault-edit-modal-active").value === "1",
      }),
    });
    $id("fault-mfr-note").textContent = r.message ? t("manufacturerSaved") : t("manufacturerSaved");
    await loadFaultManufacturers();
  } else if (kind === "category" && mode === "create") {
    const r = await api("/admin/fault/categories", {
      method: "POST",
      body: JSON.stringify({
        manufacturer_id: selectedFaultManufacturer.id,
        name: $id("fault-edit-modal-name").value,
      }),
    });
    $id("fault-cat-note").textContent = r.message ? t("categoryCreated") : t("categoryCreated");
    await loadFaultCategories();
  } else if (kind === "category" && item) {
    const r = await api(`/admin/fault/categories/${item.id}`, {
      method: "PUT",
      body: JSON.stringify({
        name: $id("fault-edit-modal-name").value,
        is_active: $id("fault-edit-modal-active").value === "1",
      }),
    });
    $id("fault-cat-note").textContent = r.message ? t("categorySaved") : t("categorySaved");
    await loadFaultCategories();
  } else if (kind === "subcategory" && mode === "create") {
    const r = await api("/admin/fault/subcategories", {
      method: "POST",
      body: JSON.stringify({
        equipment_category_id: selectedFaultCategory.id,
        name: $id("fault-edit-modal-name").value,
      }),
    });
    $id("fault-sub-note").textContent = r.message ? t("subcategoryCreated") : t("subcategoryCreated");
    await loadFaultSubcategories();
  } else if (kind === "subcategory" && item) {
    const r = await api(`/admin/fault/subcategories/${item.id}`, {
      method: "PUT",
      body: JSON.stringify({
        name: $id("fault-edit-modal-name").value,
        is_active: $id("fault-edit-modal-active").value === "1",
      }),
    });
    $id("fault-sub-note").textContent = r.message ? t("subcategorySaved") : t("subcategorySaved");
    await loadFaultSubcategories();
  }

  closeFaultEditModal();
}

export async function toggleFaultEditModal() {
  const item = currentFaultEditItem();
  const kind = faultEditModalState?.kind;
  if (!item || !kind || faultEditModalState?.mode !== "edit") return;
  const nextActive = !item.is_active;

  if (kind === "manufacturer") {
    const r = await api(`/admin/fault/manufacturers/${item.id}`, {
      method: "PUT",
      body: JSON.stringify({ is_active: nextActive }),
    });
    $id("fault-mfr-note").textContent = r.message ? (nextActive ? t("manufacturerEnabled") : t("manufacturerDisabled")) : "";
    await loadFaultManufacturers();
  } else if (kind === "category") {
    const r = await api(`/admin/fault/categories/${item.id}`, {
      method: "PUT",
      body: JSON.stringify({ is_active: nextActive }),
    });
    $id("fault-cat-note").textContent = r.message ? (nextActive ? t("categoryEnabled") : t("categoryDisabled")) : "";
    await loadFaultCategories();
  } else if (kind === "subcategory") {
    const r = await api(`/admin/fault/subcategories/${item.id}`, {
      method: "PUT",
      body: JSON.stringify({ is_active: nextActive }),
    });
    $id("fault-sub-note").textContent = r.message ? (nextActive ? t("subcategoryEnabled") : t("subcategoryDisabled")) : "";
    await loadFaultSubcategories();
  }

  closeFaultEditModal();
}

// =========================
// Statistics
// =========================

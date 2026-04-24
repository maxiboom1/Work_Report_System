import sqlService from "./sql/fault-equipment-sql.js";
import { isNonEmptyString, toInt } from "./shared/validators.js";

export async function listFaultManufacturers() {
    const manufacturers = await sqlService.listFaultManufacturers(false);
    return { ok: true, manufacturers };
}

export async function createFaultManufacturer(payload) {
    const name = String(payload?.name || "").trim();
    if (!name) return { ok: false, status: 400, message: "Missing manufacturer name" };

    const id = await sqlService.createFaultManufacturer(name);
    if (!id) return { ok: false, status: 500, message: "Failed to create manufacturer" };
    return { ok: true, id, message: "Manufacturer created" };
}

export async function updateFaultManufacturer(id, payload) {
    const manufacturerId = toInt(id);
    if (!manufacturerId) return { ok: false, status: 400, message: "Invalid manufacturer id" };

    const patch = {};
    if (payload?.name !== undefined) patch.name = String(payload.name || "").trim();
    if (payload?.is_active !== undefined) patch.is_active = payload.is_active ? 1 : 0;
    if (patch.name !== undefined && !patch.name) return { ok: false, status: 400, message: "Missing manufacturer name" };

    const affected = await sqlService.updateFaultManufacturer(manufacturerId, patch);
    if (!affected) return { ok: false, status: 404, message: "Manufacturer not found" };
    return { ok: true, message: "Manufacturer updated" };
}

export async function disableFaultManufacturer(id) {
    return updateFaultManufacturer(id, { is_active: 0 });
}

export async function listFaultEquipmentCategories(manufacturerId) {
    const id = manufacturerId ? toInt(manufacturerId) : null;
    if (manufacturerId && !id) return { ok: false, status: 400, message: "Invalid manufacturer id" };
    const categories = await sqlService.listFaultEquipmentCategories(id, false);
    return { ok: true, categories };
}

export async function createFaultEquipmentCategory(payload) {
    const manufacturerId = toInt(payload?.manufacturer_id);
    const name = String(payload?.name || "").trim();
    if (!manufacturerId || !name) return { ok: false, status: 400, message: "Missing equipment category details" };

    const manufacturer = await sqlService.getFaultManufacturerById(manufacturerId);
    if (!manufacturer) return { ok: false, status: 400, message: "Invalid manufacturer" };
    if (!manufacturer.is_active) return { ok: false, status: 400, message: "Manufacturer is disabled" };

    const id = await sqlService.createFaultEquipmentCategory(manufacturerId, name);
    if (!id) return { ok: false, status: 500, message: "Failed to create equipment category" };
    return { ok: true, id, message: "Equipment category created" };
}

export async function updateFaultEquipmentCategory(id, payload) {
    const categoryId = toInt(id);
    if (!categoryId) return { ok: false, status: 400, message: "Invalid equipment category id" };

    const patch = {};
    if (payload?.name !== undefined) patch.name = String(payload.name || "").trim();
    if (payload?.is_active !== undefined) patch.is_active = payload.is_active ? 1 : 0;
    if (patch.name !== undefined && !patch.name) return { ok: false, status: 400, message: "Missing equipment category name" };

    const affected = await sqlService.updateFaultEquipmentCategory(categoryId, patch);
    if (!affected) return { ok: false, status: 404, message: "Equipment category not found" };
    return { ok: true, message: "Equipment category updated" };
}

export async function disableFaultEquipmentCategory(id) {
    return updateFaultEquipmentCategory(id, { is_active: 0 });
}

export async function listFaultEquipmentSubcategories(categoryId) {
    const id = categoryId ? toInt(categoryId) : null;
    if (categoryId && !id) return { ok: false, status: 400, message: "Invalid equipment category id" };
    const subcategories = await sqlService.listFaultEquipmentSubcategories(id, false);
    return { ok: true, subcategories };
}

export async function createFaultEquipmentSubcategory(payload) {
    const categoryId = toInt(payload?.equipment_category_id);
    const name = String(payload?.name || "").trim();
    if (!categoryId || !name) return { ok: false, status: 400, message: "Missing equipment subcategory details" };

    const category = await sqlService.getFaultEquipmentCategoryById(categoryId);
    if (!category) return { ok: false, status: 400, message: "Invalid equipment category" };
    if (!category.is_active) return { ok: false, status: 400, message: "Equipment category is disabled" };

    const id = await sqlService.createFaultEquipmentSubcategory(categoryId, name);
    if (!id) return { ok: false, status: 500, message: "Failed to create equipment subcategory" };
    return { ok: true, id, message: "Equipment subcategory created" };
}

export async function updateFaultEquipmentSubcategory(id, payload) {
    const subcategoryId = toInt(id);
    if (!subcategoryId) return { ok: false, status: 400, message: "Invalid equipment subcategory id" };

    const patch = {};
    if (payload?.name !== undefined) patch.name = String(payload.name || "").trim();
    if (payload?.is_active !== undefined) patch.is_active = payload.is_active ? 1 : 0;
    if (patch.name !== undefined && !patch.name) return { ok: false, status: 400, message: "Missing equipment subcategory name" };

    const affected = await sqlService.updateFaultEquipmentSubcategory(subcategoryId, patch);
    if (!affected) return { ok: false, status: 404, message: "Equipment subcategory not found" };
    return { ok: true, message: "Equipment subcategory updated" };
}

export async function disableFaultEquipmentSubcategory(id) {
    return updateFaultEquipmentSubcategory(id, { is_active: 0 });
}

export async function getFaultEquipmentTree() {
    const manufacturers = await sqlService.listFaultManufacturers(true);
    const categories = await sqlService.listFaultEquipmentCategories(null, true);
    const subcategories = await sqlService.listFaultEquipmentSubcategories(null, true);

    const categoriesByManufacturer = new Map();
    for (const category of categories) {
      const items = categoriesByManufacturer.get(category.manufacturer_id) || [];
      items.push({ ...category, subcategories: [] });
      categoriesByManufacturer.set(category.manufacturer_id, items);
    }

    const categoriesById = new Map();
    for (const categoryList of categoriesByManufacturer.values()) {
      for (const category of categoryList) categoriesById.set(category.id, category);
    }

    for (const subcategory of subcategories) {
      const category = categoriesById.get(subcategory.equipment_category_id);
      if (category) category.subcategories.push(subcategory);
    }

    return {
      ok: true,
      manufacturers: manufacturers.map((manufacturer) => ({
        ...manufacturer,
        categories: categoriesByManufacturer.get(manufacturer.id) || [],
      })),
    };
}

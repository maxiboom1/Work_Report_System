import db from "../1-dal/sql.js";
import sqlService from "./sql/faults-sql.js";
import { isNonEmptyString, parseISODate, toInt } from "./shared/validators.js";

const SUPPORT_LEVELS = new Set(["layer2_support", "under_support", "no_support"]);

function normalizeText(value) {
  const text = String(value ?? "").trim();
  return text || null;
}

function parseSupportLevel(value) {
  const level = String(value || "").trim();
  return SUPPORT_LEVELS.has(level) ? level : null;
}

function statusToLabel(value) {
  return value ? "open" : "closed";
}

function mapFaultRow(row) {
  if (!row) return null;
  return {
    ...row,
    status: statusToLabel(row.status),
  };
}

async function requireManagerUser(user) {
  const current = await sqlService.getEmployeeById(user?.uid);
  if (!current || String(current.role).toLowerCase() !== "employee" || !current.is_active || !current.is_manager) {
    return null;
  }
  return current;
}

function buildFaultRef(year, sequence) {
  return `FLT-${year}-${String(sequence).padStart(4, "0")}`;
}

async function resolveClient(payload, execute) {
  const mode = String(payload?.client_mode || "").trim();
  if (mode === "existing") {
    const clientId = toInt(payload?.client_id);
    if (!clientId) throw new Error("Invalid client");
    const client = await sqlService.getClientById(clientId);
    if (!client || !client.is_active) throw new Error("Invalid client");
    return { id: client.id, custom: null, name: client.name };
  }

  if (mode === "other") {
    const custom = normalizeText(payload?.client_name);
    if (!custom) throw new Error("Client name is required");
    const existing = await sqlService.findClientByName(custom, execute);
    const id = existing?.id || await sqlService.createClient(custom, execute);
    return { id, custom, name: custom };
  }

  throw new Error("Client is required");
}

async function resolveSite(payload, clientId, execute) {
  const mode = String(payload?.site_mode || "").trim();
  if (mode === "existing") {
    const siteId = toInt(payload?.site_id);
    if (!siteId) throw new Error("Invalid site");
    const site = await sqlService.getClientSiteById(siteId);
    if (!site || !site.is_active || site.client_id !== clientId) throw new Error("Invalid site");
    return { id: site.id, custom: null, name: site.name };
  }

  if (mode === "other") {
    const custom = normalizeText(payload?.site_name);
    if (!custom) throw new Error("Site name is required");
    const existing = await sqlService.findClientSiteByName(clientId, custom, execute);
    const id = existing?.id || await sqlService.createClientSite(clientId, custom, execute);
    return { id, custom, name: custom };
  }

  throw new Error("Site is required");
}

async function resolveContacts(payload, clientId, execute) {
  const contacts = Array.isArray(payload?.contacts) ? payload.contacts : [];
  if (!contacts.length) throw new Error("At least one contact is required");

  const resolved = [];
  for (const item of contacts) {
    const mode = String(item?.mode || "").trim();
    if (mode === "existing") {
      const contactId = toInt(item?.contact_id);
      if (!contactId) throw new Error("Invalid contact");
      const contact = await sqlService.getClientContactById(contactId);
      if (!contact || !contact.is_active || contact.client_id !== clientId) throw new Error("Invalid contact");
      resolved.push({
        contact_id: contact.id,
        contact_name: contact.name,
        contact_email: contact.email ?? null,
        contact_phone: contact.phone ?? null,
      });
      continue;
    }

    if (mode === "other") {
      const name = normalizeText(item?.name);
      const email = normalizeText(item?.email);
      const phone = normalizeText(item?.phone);
      if (!name) throw new Error("Custom contact name is required");
      const existing = await sqlService.findClientContactByName(clientId, name, execute);
      const id = existing?.id || await sqlService.createClientContact(clientId, { name, email, phone }, execute);
      resolved.push({
        contact_id: id,
        contact_name: name,
        contact_email: email,
        contact_phone: phone,
      });
      continue;
    }

    throw new Error("Invalid contact");
  }

  return resolved;
}

async function resolveManufacturer(payload, execute) {
  const mode = String(payload?.manufacturer_mode || "").trim();
  if (mode === "existing") {
    const manufacturerId = toInt(payload?.manufacturer_id);
    if (!manufacturerId) throw new Error("Invalid manufacturer");
    const manufacturer = await sqlService.getFaultManufacturerById(manufacturerId);
    if (!manufacturer || !manufacturer.is_active) throw new Error("Invalid manufacturer");
    return { id: manufacturer.id, custom: null, name: manufacturer.name };
  }

  if (mode === "other") {
    const custom = normalizeText(payload?.manufacturer_name);
    if (!custom) throw new Error("Manufacturer is required");
    const existing = await sqlService.findFaultManufacturerByName(custom, execute);
    const id = existing?.id || await sqlService.createFaultManufacturer(custom, execute);
    return { id, custom, name: custom };
  }

  throw new Error("Manufacturer is required");
}

async function resolveCategory(payload, manufacturerId, execute) {
  const mode = String(payload?.equipment_category_mode || "").trim();
  if (mode === "existing") {
    const categoryId = toInt(payload?.equipment_category_id);
    if (!categoryId) throw new Error("Invalid equipment category");
    const category = await sqlService.getFaultEquipmentCategoryById(categoryId);
    if (!category || !category.is_active || category.manufacturer_id !== manufacturerId) {
      throw new Error("Invalid equipment category");
    }
    return { id: category.id, custom: null, name: category.name };
  }

  if (mode === "other") {
    const custom = normalizeText(payload?.equipment_category_name);
    if (!custom) throw new Error("Equipment category is required");
    const existing = await sqlService.findFaultEquipmentCategoryByName(manufacturerId, custom, execute);
    const id = existing?.id || await sqlService.createFaultEquipmentCategory(manufacturerId, custom, execute);
    return { id, custom, name: custom };
  }

  throw new Error("Equipment category is required");
}

async function resolveSubcategory(payload, categoryId, execute) {
  const mode = String(payload?.equipment_subcategory_mode || "").trim();
  if (mode === "existing") {
    const subcategoryId = toInt(payload?.equipment_subcategory_id);
    if (!subcategoryId) throw new Error("Invalid equipment subcategory");
    const subcategory = await sqlService.getFaultEquipmentSubcategoryById(subcategoryId);
    if (!subcategory || !subcategory.is_active || subcategory.equipment_category_id !== categoryId) {
      throw new Error("Invalid equipment subcategory");
    }
    return { id: subcategory.id, custom: null, name: subcategory.name };
  }

  if (mode === "other") {
    const custom = normalizeText(payload?.equipment_subcategory_name);
    if (!custom) throw new Error("Equipment subcategory is required");
    const existing = await sqlService.findFaultEquipmentSubcategoryByName(categoryId, custom, execute);
    const id = existing?.id || await sqlService.createFaultEquipmentSubcategory(categoryId, custom, execute);
    return { id, custom, name: custom };
  }

  throw new Error("Equipment subcategory is required");
}

export async function createManagerFault(user, payload) {
  const current = await requireManagerUser(user);
  if (!current) {
    return { ok: false, status: 403, message: "Manager access required" };
  }

  const support_level = parseSupportLevel(payload?.support_level);
  if (!support_level) {
    return { ok: false, status: 400, message: "Invalid support level" };
  }

  const serial_number = normalizeText(payload?.serial_number);
  const manufacturer_ticket_id = normalizeText(payload?.manufacturer_ticket_id);
  const fault_description = normalizeText(payload?.fault_description);

  try {
    const fault = await db.executeTransaction(async (execute) => {
      const now = new Date();
      const year = now.getFullYear();
      const count = await sqlService.countFaultsForYear(year, execute);
      const fault_ref = buildFaultRef(year, count + 1);

      const client = await resolveClient(payload, execute);
      const site = await resolveSite(payload, client.id, execute);
      const contacts = await resolveContacts(payload, client.id, execute);
      const manufacturer = await resolveManufacturer(payload, execute);
      const category = await resolveCategory(payload, manufacturer.id, execute);
      const subcategory = await resolveSubcategory(payload, category.id, execute);

      const faultId = await sqlService.createFault({
        fault_ref,
        client_id: client.id,
        client_custom: client.custom,
        site_id: site.id,
        site_custom: site.custom,
        manufacturer_id: manufacturer.id,
        manufacturer_custom: manufacturer.custom,
        equipment_category_id: category.id,
        equipment_category_custom: category.custom,
        equipment_subcategory_id: subcategory.id,
        equipment_subcategory_custom: subcategory.custom,
        support_level,
        serial_number,
        manufacturer_ticket_id,
        fault_description,
        status: 1,
        created_by: current.id,
      }, execute);

      for (const contact of contacts) {
        await sqlService.createFaultContact({
          fault_id: faultId,
          contact_id: contact.contact_id,
          contact_name: contact.contact_name,
          contact_email: contact.contact_email,
          contact_phone: contact.contact_phone,
        }, execute);
      }

      await sqlService.createFaultEvent({
        fault_id: faultId,
        title: "Fault opened",
        details: null,
        order_id: null,
        created_by: current.id,
      }, execute);

      return { id: faultId, fault_ref };
    });

    return { ok: true, id: fault.id, fault_ref: fault.fault_ref, message: "Fault registered" };
  } catch (err) {
    return { ok: false, status: 400, message: err?.message || "Failed to create fault" };
  }
}

export async function listAdminFaults(query) {
  const statusRaw = String(query?.status || "").trim().toLowerCase();
  let status = null;
  if (statusRaw === "open") status = 1;
  if (statusRaw === "closed") status = 0;

  const client_id = query?.client_id ? toInt(query.client_id) : null;
  if (query?.client_id && !client_id) return { ok: false, status: 400, message: "Invalid client filter" };

  const manufacturer_id = query?.manufacturer_id ? toInt(query.manufacturer_id) : null;
  if (query?.manufacturer_id && !manufacturer_id) return { ok: false, status: 400, message: "Invalid manufacturer filter" };

  const support_level = query?.support_level ? parseSupportLevel(query.support_level) : null;
  if (query?.support_level && !support_level) return { ok: false, status: 400, message: "Invalid support level filter" };

  const date_from = query?.date_from ? parseISODate(String(query.date_from)) : null;
  if (query?.date_from && !date_from) return { ok: false, status: 400, message: "Invalid from date" };

  const date_to = query?.date_to ? parseISODate(String(query.date_to)) : null;
  if (query?.date_to && !date_to) return { ok: false, status: 400, message: "Invalid to date" };

  const faults = await sqlService.listFaults({
    status,
    client_id,
    manufacturer_id,
    support_level,
    date_from,
    date_to,
  });

  return {
    ok: true,
    faults: faults.map(mapFaultRow),
  };
}

export async function getAdminFaultDetail(id) {
  const faultId = toInt(id);
  if (!faultId) return { ok: false, status: 400, message: "Invalid fault id" };

  const fault = await sqlService.getFaultById(faultId);
  if (!fault) return { ok: false, status: 404, message: "Fault not found" };

  const [contacts, events] = await Promise.all([
    sqlService.listFaultContactsByFaultId(faultId),
    sqlService.listFaultEventsByFaultId(faultId),
  ]);

  return {
    ok: true,
    fault: mapFaultRow(fault),
    contacts,
    events,
  };
}

export async function updateAdminFault(id, payload) {
  const faultId = toInt(id);
  if (!faultId) return { ok: false, status: 400, message: "Invalid fault id" };

  const patch = {};
  if (payload?.support_level !== undefined) {
    const support_level = parseSupportLevel(payload.support_level);
    if (!support_level) return { ok: false, status: 400, message: "Invalid support level" };
    patch.support_level = support_level;
  }
  if (payload?.serial_number !== undefined) patch.serial_number = normalizeText(payload.serial_number);
  if (payload?.manufacturer_ticket_id !== undefined) patch.manufacturer_ticket_id = normalizeText(payload.manufacturer_ticket_id);
  if (payload?.fault_description !== undefined) patch.fault_description = normalizeText(payload.fault_description);

  if (!Object.keys(patch).length) {
    return { ok: false, status: 400, message: "No fault fields to update" };
  }

  const affected = await sqlService.updateFault(faultId, patch);
  if (!affected) return { ok: false, status: 404, message: "Fault not found" };
  return { ok: true, message: "Fault updated" };
}

export async function updateAdminFaultStatus(user, id, payload) {
  const faultId = toInt(id);
  if (!faultId) return { ok: false, status: 400, message: "Invalid fault id" };

  const statusRaw = String(payload?.status || "").trim().toLowerCase();
  if (statusRaw !== "open" && statusRaw !== "closed") {
    return { ok: false, status: 400, message: "Invalid fault status" };
  }

  const current = await sqlService.getEmployeeById(user?.uid);
  if (!current) return { ok: false, status: 401, message: "Unauthorized" };

  const fault = await sqlService.getFaultById(faultId);
  if (!fault) return { ok: false, status: 404, message: "Fault not found" };

  const status = statusRaw === "open" ? 1 : 0;
  const title = status ? "Fault reopened" : "Fault closed";

  await db.executeTransaction(async (execute) => {
    const affected = await sqlService.updateFaultStatus(faultId, status, execute);
    if (!affected) throw new Error("Fault not found");
    await sqlService.createFaultEvent({
      fault_id: faultId,
      title,
      details: null,
      order_id: null,
      created_by: current.id,
    }, execute);
  });

  return { ok: true, message: "Fault status updated" };
}

export async function addAdminFaultEvent(user, id, payload) {
  const faultId = toInt(id);
  if (!faultId) return { ok: false, status: 400, message: "Invalid fault id" };

  const current = await sqlService.getEmployeeById(user?.uid);
  if (!current) return { ok: false, status: 401, message: "Unauthorized" };

  const fault = await sqlService.getFaultById(faultId);
  if (!fault) return { ok: false, status: 404, message: "Fault not found" };

  const title = normalizeText(payload?.title);
  const details = normalizeText(payload?.details);
  const order_id = normalizeText(payload?.order_id);
  if (!title) return { ok: false, status: 400, message: "Event title is required" };

  const eventId = await sqlService.createFaultEvent({
    fault_id: faultId,
    title,
    details,
    order_id,
    created_by: current.id,
  });

  if (!eventId) return { ok: false, status: 500, message: "Failed to add fault event" };
  return { ok: true, id: eventId, message: "Fault event added" };
}

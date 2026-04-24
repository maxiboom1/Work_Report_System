import sqlService from "./sql/clients-sql.js";
import { isNonEmptyString, toInt } from "./shared/validators.js";

export async function listClients() {
    const clients = await sqlService.listClients(false);
    return { ok: true, clients };
}

export async function createClient(payload) {
    const name = String(payload?.name || "").trim();
    if (!name) return { ok: false, status: 400, message: "Missing client name" };

    const id = await sqlService.createClient(name);
    if (!id) return { ok: false, status: 500, message: "Failed to create client" };
    return { ok: true, id, message: "Client created" };
}

export async function updateClient(id, payload) {
    const clientId = toInt(id);
    if (!clientId) return { ok: false, status: 400, message: "Invalid client id" };

    const patch = {};
    if (payload?.name !== undefined) patch.name = String(payload.name || "").trim();
    if (payload?.is_active !== undefined) patch.is_active = payload.is_active ? 1 : 0;
    if (patch.name !== undefined && !patch.name) return { ok: false, status: 400, message: "Missing client name" };

    const affected = await sqlService.updateClient(clientId, patch);
    if (!affected) return { ok: false, status: 404, message: "Client not found" };
    return { ok: true, message: "Client updated" };
}

export async function disableClient(id) {
    return updateClient(id, { is_active: 0 });
}

export async function listClientSites(clientId) {
    const id = clientId ? toInt(clientId) : null;
    if (clientId && !id) return { ok: false, status: 400, message: "Invalid client id" };
    const sites = await sqlService.listClientSites(id, false);
    return { ok: true, sites };
}

export async function createClientSite(payload) {
    const clientId = toInt(payload?.client_id);
    const name = String(payload?.name || "").trim();
    if (!clientId || !name) return { ok: false, status: 400, message: "Missing client site details" };

    const client = await sqlService.getClientById(clientId);
    if (!client) return { ok: false, status: 400, message: "Invalid client" };
    if (!client.is_active) return { ok: false, status: 400, message: "Client is disabled" };

    const id = await sqlService.createClientSite(clientId, name);
    if (!id) return { ok: false, status: 500, message: "Failed to create client site" };
    return { ok: true, id, message: "Client site created" };
}

export async function updateClientSite(id, payload) {
    const siteId = toInt(id);
    if (!siteId) return { ok: false, status: 400, message: "Invalid client site id" };

    const patch = {};
    if (payload?.name !== undefined) patch.name = String(payload.name || "").trim();
    if (payload?.is_active !== undefined) patch.is_active = payload.is_active ? 1 : 0;
    if (patch.name !== undefined && !patch.name) return { ok: false, status: 400, message: "Missing client site name" };

    const affected = await sqlService.updateClientSite(siteId, patch);
    if (!affected) return { ok: false, status: 404, message: "Client site not found" };
    return { ok: true, message: "Client site updated" };
}

export async function disableClientSite(id) {
    return updateClientSite(id, { is_active: 0 });
}

export async function listClientContacts(clientId) {
    const id = clientId ? toInt(clientId) : null;
    if (clientId && !id) return { ok: false, status: 400, message: "Invalid client id" };
    const contacts = await sqlService.listClientContacts(id, false);
    return { ok: true, contacts };
}

export async function createClientContact(payload) {
    const clientId = toInt(payload?.client_id);
    const name = String(payload?.name || "").trim();
    const email = String(payload?.email || "").trim() || null;
    const phone = String(payload?.phone || "").trim() || null;
    if (!clientId || !name) return { ok: false, status: 400, message: "Missing client contact details" };

    const client = await sqlService.getClientById(clientId);
    if (!client) return { ok: false, status: 400, message: "Invalid client" };
    if (!client.is_active) return { ok: false, status: 400, message: "Client is disabled" };

    const id = await sqlService.createClientContact(clientId, { name, email, phone });
    if (!id) return { ok: false, status: 500, message: "Failed to create client contact" };
    return { ok: true, id, message: "Client contact created" };
}

export async function updateClientContact(id, payload) {
    const contactId = toInt(id);
    if (!contactId) return { ok: false, status: 400, message: "Invalid client contact id" };

    const patch = {};
    if (payload?.name !== undefined) patch.name = String(payload.name || "").trim();
    if (payload?.email !== undefined) patch.email = String(payload.email || "").trim() || null;
    if (payload?.phone !== undefined) patch.phone = String(payload.phone || "").trim() || null;
    if (payload?.is_active !== undefined) patch.is_active = payload.is_active ? 1 : 0;
    if (patch.name !== undefined && !patch.name) return { ok: false, status: 400, message: "Missing client contact name" };

    const affected = await sqlService.updateClientContact(contactId, patch);
    if (!affected) return { ok: false, status: 404, message: "Client contact not found" };
    return { ok: true, message: "Client contact updated" };
}

export async function disableClientContact(id) {
    return updateClientContact(id, { is_active: 0 });
}

export async function getClientContactTree() {
    const clients = await sqlService.listClients(true);
    const sites = await sqlService.listClientSites(null, true);
    const contacts = await sqlService.listClientContacts(null, true);

    const sitesByClient = new Map();
    for (const site of sites) {
      const items = sitesByClient.get(site.client_id) || [];
      items.push(site);
      sitesByClient.set(site.client_id, items);
    }

    const contactsByClient = new Map();
    for (const contact of contacts) {
      const items = contactsByClient.get(contact.client_id) || [];
      items.push(contact);
      contactsByClient.set(contact.client_id, items);
    }

    return {
      ok: true,
      clients: clients.map((client) => ({
        ...client,
        sites: sitesByClient.get(client.id) || [],
        contacts: contactsByClient.get(client.id) || [],
      })),
    };
}

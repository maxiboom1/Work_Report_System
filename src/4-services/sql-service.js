// src/4-services/sql-service.js
// DAL wrapper (pure SQL access, no business logic)

import db from "../1-dal/sql.js";

class SqlService {
  /* =========================
     SETTINGS
     ========================= */

  async listSettings() {
    const q = `
      SELECT setting_key, setting_value
      FROM dbo.[app_settings]
      ORDER BY setting_key;
    `;
    const r = await db.execute(q);
    return r?.recordset || [];
  }

  async setSetting(key, value) {
    const q = `
      UPDATE dbo.[app_settings]
      SET setting_value = @value,
          updated_at = SYSDATETIME()
      WHERE setting_key = @key;

      IF @@ROWCOUNT = 0
      BEGIN
        INSERT INTO dbo.[app_settings] (setting_key, setting_value)
        VALUES (@key, @value);
      END;

      SELECT 1 AS affected;
    `;
    const r = await db.execute(q, { key, value });
    return r?.recordset?.[0]?.affected ?? 0;
  }

  /* =========================
     EMPLOYEES
     ========================= */

  async getEmployeeByLogin(login) {
    const q = `
      SELECT id, first_name, last_name, passport_id, car_id, card_id, phone, email,
             daily_rate, login, password_hash, role, is_manager, is_active
      FROM dbo.[employees]
      WHERE login = @login;
    `;
    const r = await db.execute(q, { login });
    return r?.recordset?.[0] || null;
  }

  async listEmployees() {
    const q = `
      SELECT id, first_name, last_name, passport_id, car_id, card_id, phone, email,
             daily_rate, login, role, is_manager, is_active
      FROM dbo.[employees]
      WHERE role = 'employee'
      ORDER BY last_name, first_name;
    `;
    const r = await db.execute(q);
    return r?.recordset || [];
  }

  async getEmployeeById(id) {
    const q = `
      SELECT id, first_name, last_name, passport_id, car_id, card_id, phone, email,
             daily_rate, login, password_hash, role, is_manager, is_active
      FROM dbo.[employees]
      WHERE id = @id;
    `;
    const r = await db.execute(q, { id });
    return r?.recordset?.[0] || null;
  }

  async createEmployee(e) {
    const q = `
      INSERT INTO dbo.[employees]
        (first_name, last_name, passport_id, car_id, card_id, phone, email, daily_rate, login, password_hash, role, is_manager, is_active)
      OUTPUT inserted.id
      VALUES
        (@first_name, @last_name, @passport_id, @car_id, @card_id, @phone, @email, @daily_rate, @login, @password_hash, @role, @is_manager, @is_active);
    `;
    const r = await db.execute(q, {
      first_name: e.first_name,
      last_name: e.last_name,
      passport_id: e.passport_id ?? null,
      car_id: e.car_id ?? null,
      card_id: e.card_id ?? null,
      phone: e.phone ?? null,
      email: e.email ?? null,
      daily_rate: e.daily_rate,
      login: e.login,
      password_hash: e.password_hash,
      role: e.role,
      is_manager: e.is_manager ?? 0,
      is_active: e.is_active ?? 1,
    });
    return r?.recordset?.[0]?.id ?? null;
  }

  async updateEmployee(id, patch) {
    const allowed = [
      "first_name",
      "last_name",
      "passport_id",
      "car_id",
      "card_id",
      "phone",
      "email",
      "daily_rate",
      "login",
      "password_hash",
      "role",
      "is_manager",
      "is_active",
    ];
    const setFields = allowed.filter((field) => Object.prototype.hasOwnProperty.call(patch, field));
    if (setFields.length === 0) return 0;

    const q = `
      UPDATE dbo.[employees]
      SET ${setFields.map((field) => `${field} = @${field}`).join(",\n          ")}
      WHERE id = @id;

      SELECT @@ROWCOUNT AS affected;
    `;

    const values = { id };
    for (const field of setFields) values[field] = patch[field];

    const r = await db.execute(q, values);
    return r?.recordset?.[0]?.affected ?? 0;
  }

  async listEmployeesForManagerCarList() {
    const q = `
      SELECT id, first_name, last_name, passport_id, car_id, is_manager
      FROM dbo.[employees]
      WHERE role = 'employee'
        AND is_active = 1
      ORDER BY last_name, first_name;
    `;
    const r = await db.execute(q);
    return r?.recordset || [];
  }

  async deleteEmployee(id) {
    // NOTE: Work entries are FK protected. Use soft-delete (is_active=0) if you prefer.
    const q = `
      DELETE FROM dbo.[employees] WHERE id = @id;
      SELECT @@ROWCOUNT AS affected;
    `;
    const r = await db.execute(q, { id });
    return r?.recordset?.[0]?.affected ?? 0;
  }

  /* =========================
     PROJECTS
     ========================= */

  async listProjects() {
    const q = `SELECT id, name, is_active FROM dbo.[projects] ORDER BY name;`;
    const r = await db.execute(q);
    return r?.recordset || [];
  }

  async listActiveProjects() {
    const q = `SELECT id, name, is_active FROM dbo.[projects] WHERE is_active = 1 ORDER BY name;`;
    const r = await db.execute(q);
    return r?.recordset || [];
  }

  async getProjectById(id) {
    const q = `SELECT id, name, is_active FROM dbo.[projects] WHERE id = @id;`;
    const r = await db.execute(q, { id });
    return r?.recordset?.[0] || null;
  }

  async createProject(name) {
    const q = `
      INSERT INTO dbo.[projects] (name, is_active)
      OUTPUT inserted.id
      VALUES (@name, 1);
    `;
    const r = await db.execute(q, { name });
    return r?.recordset?.[0]?.id ?? null;
  }

  async updateProject(id, patch) {
    const q = `
      UPDATE dbo.[projects]
      SET
        name = COALESCE(@name, name),
        is_active = COALESCE(@is_active, is_active)
      WHERE id = @id;

      SELECT @@ROWCOUNT AS affected;
    `;
    const r = await db.execute(q, {
      id,
      name: patch.name ?? null,
      is_active: patch.is_active ?? null,
    });
    return r?.recordset?.[0]?.affected ?? 0;
  }

  async deleteProject(id) {
    const q = `
      DELETE FROM dbo.[projects] WHERE id = @id;
      SELECT @@ROWCOUNT AS affected;
    `;
    const r = await db.execute(q, { id });
    return r?.recordset?.[0]?.affected ?? 0;
  }

  /* =========================
     CLIENTS
     ========================= */

  async listClients(activeOnly = false) {
    const q = `
      SELECT id, name, is_active, created_at, updated_at
      FROM dbo.[clients]
      WHERE (@active_only = 0 OR is_active = 1)
      ORDER BY name;
    `;
    const r = await db.execute(q, { active_only: activeOnly ? 1 : 0 });
    return r?.recordset || [];
  }

  async getClientById(id) {
    const q = `
      SELECT id, name, is_active
      FROM dbo.[clients]
      WHERE id = @id;
    `;
    const r = await db.execute(q, { id });
    return r?.recordset?.[0] || null;
  }

  async findClientByName(name, execute = db.execute) {
    const q = `
      SELECT TOP 1 id, name, is_active
      FROM dbo.[clients]
      WHERE name = @name;
    `;
    const r = await execute(q, { name });
    return r?.recordset?.[0] || null;
  }

  async createClient(name, execute = db.execute) {
    const q = `
      INSERT INTO dbo.[clients] (name, is_active)
      OUTPUT inserted.id
      VALUES (@name, 1);
    `;
    const r = await execute(q, { name });
    return r?.recordset?.[0]?.id ?? null;
  }

  async updateClient(id, patch) {
    const q = `
      UPDATE dbo.[clients]
      SET
        name = COALESCE(@name, name),
        is_active = COALESCE(@is_active, is_active),
        updated_at = SYSDATETIME()
      WHERE id = @id;

      SELECT @@ROWCOUNT AS affected;
    `;
    const r = await db.execute(q, {
      id,
      name: patch.name ?? null,
      is_active: patch.is_active ?? null,
    });
    return r?.recordset?.[0]?.affected ?? 0;
  }

  async listClientSites(clientId = null, activeOnly = false) {
    const q = `
      SELECT id, client_id, name, is_active, created_at, updated_at
      FROM dbo.[client_sites]
      WHERE (@client_id IS NULL OR client_id = @client_id)
        AND (@active_only = 0 OR is_active = 1)
      ORDER BY name;
    `;
    const r = await db.execute(q, {
      client_id: clientId ?? null,
      active_only: activeOnly ? 1 : 0,
    });
    return r?.recordset || [];
  }

  async getClientSiteById(id) {
    const q = `
      SELECT id, client_id, name, is_active
      FROM dbo.[client_sites]
      WHERE id = @id;
    `;
    const r = await db.execute(q, { id });
    return r?.recordset?.[0] || null;
  }

  async findClientSiteByName(clientId, name, execute = db.execute) {
    const q = `
      SELECT TOP 1 id, client_id, name, is_active
      FROM dbo.[client_sites]
      WHERE client_id = @client_id
        AND name = @name;
    `;
    const r = await execute(q, { client_id: clientId, name });
    return r?.recordset?.[0] || null;
  }

  async createClientSite(clientId, name, execute = db.execute) {
    const q = `
      INSERT INTO dbo.[client_sites] (client_id, name, is_active)
      OUTPUT inserted.id
      VALUES (@client_id, @name, 1);
    `;
    const r = await execute(q, { client_id: clientId, name });
    return r?.recordset?.[0]?.id ?? null;
  }

  async updateClientSite(id, patch) {
    const q = `
      UPDATE dbo.[client_sites]
      SET
        name = COALESCE(@name, name),
        is_active = COALESCE(@is_active, is_active),
        updated_at = SYSDATETIME()
      WHERE id = @id;

      SELECT @@ROWCOUNT AS affected;
    `;
    const r = await db.execute(q, {
      id,
      name: patch.name ?? null,
      is_active: patch.is_active ?? null,
    });
    return r?.recordset?.[0]?.affected ?? 0;
  }

  async listClientContacts(clientId = null, activeOnly = false) {
    const q = `
      SELECT id, client_id, name, email, phone, is_active, created_at, updated_at
      FROM dbo.[client_contacts]
      WHERE (@client_id IS NULL OR client_id = @client_id)
        AND (@active_only = 0 OR is_active = 1)
      ORDER BY name, email;
    `;
    const r = await db.execute(q, {
      client_id: clientId ?? null,
      active_only: activeOnly ? 1 : 0,
    });
    return r?.recordset || [];
  }

  async getClientContactById(id) {
    const q = `
      SELECT id, client_id, name, email, phone, is_active
      FROM dbo.[client_contacts]
      WHERE id = @id;
    `;
    const r = await db.execute(q, { id });
    return r?.recordset?.[0] || null;
  }

  async findClientContactByName(clientId, name, execute = db.execute) {
    const q = `
      SELECT TOP 1 id, client_id, name, email, phone, is_active
      FROM dbo.[client_contacts]
      WHERE client_id = @client_id
        AND name = @name
      ORDER BY id DESC;
    `;
    const r = await execute(q, { client_id: clientId, name });
    return r?.recordset?.[0] || null;
  }

  async createClientContact(clientId, contact, execute = db.execute) {
    const q = `
      INSERT INTO dbo.[client_contacts] (client_id, name, email, phone, is_active)
      OUTPUT inserted.id
      VALUES (@client_id, @name, @email, @phone, 1);
    `;
    const r = await execute(q, {
      client_id: clientId,
      name: contact.name,
      email: contact.email ?? null,
      phone: contact.phone ?? null,
    });
    return r?.recordset?.[0]?.id ?? null;
  }

  async updateClientContact(id, patch) {
    const allowed = ["name", "email", "phone", "is_active"];
    const setFields = allowed.filter((field) => Object.prototype.hasOwnProperty.call(patch, field));
    if (setFields.length === 0) return 0;

    const q = `
      UPDATE dbo.[client_contacts]
      SET ${setFields.map((field) => `${field} = @${field}`).join(",\n          ")},
        updated_at = SYSDATETIME()
      WHERE id = @id;

      SELECT @@ROWCOUNT AS affected;
    `;

    const values = { id };
    for (const field of setFields) values[field] = patch[field];

    const r = await db.execute(q, values);
    return r?.recordset?.[0]?.affected ?? 0;
  }

  /* =========================
     FAULT EQUIPMENT HIERARCHY
     ========================= */

  async listFaultManufacturers(activeOnly = false) {
    const q = `
      SELECT id, name, is_active, created_at, updated_at
      FROM dbo.[fault_manufacturers]
      WHERE (@active_only = 0 OR is_active = 1)
      ORDER BY name;
    `;
    const r = await db.execute(q, { active_only: activeOnly ? 1 : 0 });
    return r?.recordset || [];
  }

  async getFaultManufacturerById(id) {
    const q = `
      SELECT id, name, is_active
      FROM dbo.[fault_manufacturers]
      WHERE id = @id;
    `;
    const r = await db.execute(q, { id });
    return r?.recordset?.[0] || null;
  }

  async findFaultManufacturerByName(name, execute = db.execute) {
    const q = `
      SELECT TOP 1 id, name, is_active
      FROM dbo.[fault_manufacturers]
      WHERE name = @name;
    `;
    const r = await execute(q, { name });
    return r?.recordset?.[0] || null;
  }

  async createFaultManufacturer(name, execute = db.execute) {
    const q = `
      INSERT INTO dbo.[fault_manufacturers] (name, is_active)
      OUTPUT inserted.id
      VALUES (@name, 1);
    `;
    const r = await execute(q, { name });
    return r?.recordset?.[0]?.id ?? null;
  }

  async updateFaultManufacturer(id, patch) {
    const q = `
      UPDATE dbo.[fault_manufacturers]
      SET
        name = COALESCE(@name, name),
        is_active = COALESCE(@is_active, is_active),
        updated_at = SYSDATETIME()
      WHERE id = @id;

      SELECT @@ROWCOUNT AS affected;
    `;
    const r = await db.execute(q, {
      id,
      name: patch.name ?? null,
      is_active: patch.is_active ?? null,
    });
    return r?.recordset?.[0]?.affected ?? 0;
  }

  async listFaultEquipmentCategories(manufacturerId = null, activeOnly = false) {
    const q = `
      SELECT id, manufacturer_id, name, is_active, created_at, updated_at
      FROM dbo.[fault_equipment_categories]
      WHERE (@manufacturer_id IS NULL OR manufacturer_id = @manufacturer_id)
        AND (@active_only = 0 OR is_active = 1)
      ORDER BY name;
    `;
    const r = await db.execute(q, {
      manufacturer_id: manufacturerId ?? null,
      active_only: activeOnly ? 1 : 0,
    });
    return r?.recordset || [];
  }

  async getFaultEquipmentCategoryById(id) {
    const q = `
      SELECT id, manufacturer_id, name, is_active
      FROM dbo.[fault_equipment_categories]
      WHERE id = @id;
    `;
    const r = await db.execute(q, { id });
    return r?.recordset?.[0] || null;
  }

  async findFaultEquipmentCategoryByName(manufacturerId, name, execute = db.execute) {
    const q = `
      SELECT TOP 1 id, manufacturer_id, name, is_active
      FROM dbo.[fault_equipment_categories]
      WHERE manufacturer_id = @manufacturer_id
        AND name = @name;
    `;
    const r = await execute(q, { manufacturer_id: manufacturerId, name });
    return r?.recordset?.[0] || null;
  }

  async createFaultEquipmentCategory(manufacturerId, name, execute = db.execute) {
    const q = `
      INSERT INTO dbo.[fault_equipment_categories] (manufacturer_id, name, is_active)
      OUTPUT inserted.id
      VALUES (@manufacturer_id, @name, 1);
    `;
    const r = await execute(q, { manufacturer_id: manufacturerId, name });
    return r?.recordset?.[0]?.id ?? null;
  }

  async updateFaultEquipmentCategory(id, patch) {
    const q = `
      UPDATE dbo.[fault_equipment_categories]
      SET
        name = COALESCE(@name, name),
        is_active = COALESCE(@is_active, is_active),
        updated_at = SYSDATETIME()
      WHERE id = @id;

      SELECT @@ROWCOUNT AS affected;
    `;
    const r = await db.execute(q, {
      id,
      name: patch.name ?? null,
      is_active: patch.is_active ?? null,
    });
    return r?.recordset?.[0]?.affected ?? 0;
  }

  async listFaultEquipmentSubcategories(equipmentCategoryId = null, activeOnly = false) {
    const q = `
      SELECT id, equipment_category_id, name, is_active, created_at, updated_at
      FROM dbo.[fault_equipment_subcategories]
      WHERE (@equipment_category_id IS NULL OR equipment_category_id = @equipment_category_id)
        AND (@active_only = 0 OR is_active = 1)
      ORDER BY name;
    `;
    const r = await db.execute(q, {
      equipment_category_id: equipmentCategoryId ?? null,
      active_only: activeOnly ? 1 : 0,
    });
    return r?.recordset || [];
  }

  async getFaultEquipmentSubcategoryById(id) {
    const q = `
      SELECT id, equipment_category_id, name, is_active
      FROM dbo.[fault_equipment_subcategories]
      WHERE id = @id;
    `;
    const r = await db.execute(q, { id });
    return r?.recordset?.[0] || null;
  }

  async findFaultEquipmentSubcategoryByName(equipmentCategoryId, name, execute = db.execute) {
    const q = `
      SELECT TOP 1 id, equipment_category_id, name, is_active
      FROM dbo.[fault_equipment_subcategories]
      WHERE equipment_category_id = @equipment_category_id
        AND name = @name;
    `;
    const r = await execute(q, { equipment_category_id: equipmentCategoryId, name });
    return r?.recordset?.[0] || null;
  }

  async createFaultEquipmentSubcategory(equipmentCategoryId, name, execute = db.execute) {
    const q = `
      INSERT INTO dbo.[fault_equipment_subcategories] (equipment_category_id, name, is_active)
      OUTPUT inserted.id
      VALUES (@equipment_category_id, @name, 1);
    `;
    const r = await execute(q, { equipment_category_id: equipmentCategoryId, name });
    return r?.recordset?.[0]?.id ?? null;
  }

  async updateFaultEquipmentSubcategory(id, patch) {
    const q = `
      UPDATE dbo.[fault_equipment_subcategories]
      SET
        name = COALESCE(@name, name),
        is_active = COALESCE(@is_active, is_active),
        updated_at = SYSDATETIME()
      WHERE id = @id;

      SELECT @@ROWCOUNT AS affected;
    `;
    const r = await db.execute(q, {
      id,
      name: patch.name ?? null,
      is_active: patch.is_active ?? null,
    });
    return r?.recordset?.[0]?.affected ?? 0;
  }

  /* =========================
     FAULTS
     ========================= */

  async countFaultsForYear(year, execute = db.execute) {
    const q = `
      SELECT COUNT(*) AS total
      FROM dbo.[faults]
      WHERE YEAR(created_at) = @year;
    `;
    const r = await execute(q, { year });
    return Number(r?.recordset?.[0]?.total || 0);
  }

  async createFault(fault, execute = db.execute) {
    const q = `
      INSERT INTO dbo.[faults] (
        fault_ref,
        client_id,
        client_custom,
        site_id,
        site_custom,
        manufacturer_id,
        manufacturer_custom,
        equipment_category_id,
        equipment_category_custom,
        equipment_subcategory_id,
        equipment_subcategory_custom,
        support_level,
        serial_number,
        manufacturer_ticket_id,
        fault_description,
        status,
        created_by
      )
      OUTPUT inserted.id
      VALUES (
        @fault_ref,
        @client_id,
        @client_custom,
        @site_id,
        @site_custom,
        @manufacturer_id,
        @manufacturer_custom,
        @equipment_category_id,
        @equipment_category_custom,
        @equipment_subcategory_id,
        @equipment_subcategory_custom,
        @support_level,
        @serial_number,
        @manufacturer_ticket_id,
        @fault_description,
        @status,
        @created_by
      );
    `;
    const r = await execute(q, {
      fault_ref: fault.fault_ref,
      client_id: fault.client_id ?? null,
      client_custom: fault.client_custom ?? null,
      site_id: fault.site_id ?? null,
      site_custom: fault.site_custom ?? null,
      manufacturer_id: fault.manufacturer_id ?? null,
      manufacturer_custom: fault.manufacturer_custom ?? null,
      equipment_category_id: fault.equipment_category_id ?? null,
      equipment_category_custom: fault.equipment_category_custom ?? null,
      equipment_subcategory_id: fault.equipment_subcategory_id ?? null,
      equipment_subcategory_custom: fault.equipment_subcategory_custom ?? null,
      support_level: fault.support_level,
      serial_number: fault.serial_number ?? null,
      manufacturer_ticket_id: fault.manufacturer_ticket_id ?? null,
      fault_description: fault.fault_description ?? null,
      status: fault.status ?? 1,
      created_by: fault.created_by,
    });
    return r?.recordset?.[0]?.id ?? null;
  }

  async createFaultContact(row, execute = db.execute) {
    const q = `
      INSERT INTO dbo.[fault_contacts] (
        fault_id,
        contact_id,
        contact_name,
        contact_email,
        contact_phone
      )
      OUTPUT inserted.id
      VALUES (
        @fault_id,
        @contact_id,
        @contact_name,
        @contact_email,
        @contact_phone
      );
    `;
    const r = await execute(q, {
      fault_id: row.fault_id,
      contact_id: row.contact_id ?? null,
      contact_name: row.contact_name,
      contact_email: row.contact_email ?? null,
      contact_phone: row.contact_phone ?? null,
    });
    return r?.recordset?.[0]?.id ?? null;
  }

  async createFaultEvent(row, execute = db.execute) {
    const q = `
      INSERT INTO dbo.[fault_events] (
        fault_id,
        title,
        details,
        order_id,
        created_by
      )
      OUTPUT inserted.id
      VALUES (
        @fault_id,
        @title,
        @details,
        @order_id,
        @created_by
      );
    `;
    const r = await execute(q, {
      fault_id: row.fault_id,
      title: row.title,
      details: row.details ?? null,
      order_id: row.order_id ?? null,
      created_by: row.created_by,
    });
    return r?.recordset?.[0]?.id ?? null;
  }

  async listFaults(filters = {}) {
    const q = `
      SELECT
        f.id,
        f.fault_ref,
        CONVERT(varchar(19), f.created_at, 120) AS created_at,
        f.status,
        f.support_level,
        f.serial_number,
        f.manufacturer_ticket_id,
        f.fault_description,
        COALESCE(c.name, f.client_custom) AS client_name,
        COALESCE(s.name, f.site_custom) AS site_name,
        COALESCE(m.name, f.manufacturer_custom) AS manufacturer_name,
        COALESCE(cat.name, f.equipment_category_custom) AS equipment_category_name,
        COALESCE(sub.name, f.equipment_subcategory_custom) AS equipment_subcategory_name,
        last_event.last_event_title,
        last_event.last_event_details,
        last_event.last_event_created_at,
        last_event.event_count AS last_event_count,
        e.first_name AS created_by_first_name,
        e.last_name AS created_by_last_name
      FROM dbo.[faults] f
      LEFT JOIN dbo.[clients] c ON c.id = f.client_id
      LEFT JOIN dbo.[client_sites] s ON s.id = f.site_id
      LEFT JOIN dbo.[fault_manufacturers] m ON m.id = f.manufacturer_id
      LEFT JOIN dbo.[fault_equipment_categories] cat ON cat.id = f.equipment_category_id
      LEFT JOIN dbo.[fault_equipment_subcategories] sub ON sub.id = f.equipment_subcategory_id
      OUTER APPLY (
        SELECT TOP 1
          fe.title AS last_event_title,
          fe.details AS last_event_details,
          CONVERT(varchar(19), fe.created_at, 120) AS last_event_created_at,
          COUNT(*) OVER () AS event_count
        FROM dbo.[fault_events] fe
        WHERE fe.fault_id = f.id
        ORDER BY fe.created_at DESC, fe.id DESC
      ) last_event
      INNER JOIN dbo.[employees] e ON e.id = f.created_by
      WHERE (@status IS NULL OR f.status = @status)
        AND (@client_id IS NULL OR f.client_id = @client_id)
        AND (@manufacturer_id IS NULL OR f.manufacturer_id = @manufacturer_id)
        AND (@support_level IS NULL OR f.support_level = @support_level)
        AND (@date_from IS NULL OR CONVERT(date, f.created_at) >= @date_from)
        AND (@date_to IS NULL OR CONVERT(date, f.created_at) <= @date_to)
      ORDER BY f.created_at DESC, f.id DESC;
    `;
    const r = await db.execute(q, {
      status: filters.status ?? null,
      client_id: filters.client_id ?? null,
      manufacturer_id: filters.manufacturer_id ?? null,
      support_level: filters.support_level ?? null,
      date_from: filters.date_from ?? null,
      date_to: filters.date_to ?? null,
    });
    return r?.recordset || [];
  }

  async getFaultById(id) {
    const q = `
      SELECT
        f.id,
        f.fault_ref,
        f.client_id,
        f.client_custom,
        f.site_id,
        f.site_custom,
        f.manufacturer_id,
        f.manufacturer_custom,
        f.equipment_category_id,
        f.equipment_category_custom,
        f.equipment_subcategory_id,
        f.equipment_subcategory_custom,
        f.support_level,
        f.serial_number,
        f.manufacturer_ticket_id,
        f.fault_description,
        f.status,
        CONVERT(varchar(19), f.created_at, 120) AS created_at,
        CONVERT(varchar(19), f.updated_at, 120) AS updated_at,
        CONVERT(varchar(19), f.closed_at, 120) AS closed_at,
        f.created_by,
        COALESCE(c.name, f.client_custom) AS client_name,
        COALESCE(s.name, f.site_custom) AS site_name,
        COALESCE(m.name, f.manufacturer_custom) AS manufacturer_name,
        COALESCE(cat.name, f.equipment_category_custom) AS equipment_category_name,
        COALESCE(sub.name, f.equipment_subcategory_custom) AS equipment_subcategory_name,
        creator.first_name AS created_by_first_name,
        creator.last_name AS created_by_last_name
      FROM dbo.[faults] f
      LEFT JOIN dbo.[clients] c ON c.id = f.client_id
      LEFT JOIN dbo.[client_sites] s ON s.id = f.site_id
      LEFT JOIN dbo.[fault_manufacturers] m ON m.id = f.manufacturer_id
      LEFT JOIN dbo.[fault_equipment_categories] cat ON cat.id = f.equipment_category_id
      LEFT JOIN dbo.[fault_equipment_subcategories] sub ON sub.id = f.equipment_subcategory_id
      INNER JOIN dbo.[employees] creator ON creator.id = f.created_by
      WHERE f.id = @id;
    `;
    const r = await db.execute(q, { id });
    return r?.recordset?.[0] || null;
  }

  async listFaultContactsByFaultId(faultId) {
    const q = `
      SELECT
        fc.id,
        fc.fault_id,
        fc.contact_id,
        fc.contact_name,
        fc.contact_email,
        fc.contact_phone
      FROM dbo.[fault_contacts] fc
      WHERE fc.fault_id = @fault_id
      ORDER BY fc.id;
    `;
    const r = await db.execute(q, { fault_id: faultId });
    return r?.recordset || [];
  }

  async listFaultEventsByFaultId(faultId) {
    const q = `
      SELECT
        fe.id,
        fe.fault_id,
        fe.title,
        fe.details,
        fe.order_id,
        CONVERT(varchar(19), fe.created_at, 120) AS created_at,
        fe.created_by,
        e.first_name AS created_by_first_name,
        e.last_name AS created_by_last_name
      FROM dbo.[fault_events] fe
      INNER JOIN dbo.[employees] e ON e.id = fe.created_by
      WHERE fe.fault_id = @fault_id
      ORDER BY fe.created_at ASC, fe.id ASC;
    `;
    const r = await db.execute(q, { fault_id: faultId });
    return r?.recordset || [];
  }

  async updateFault(id, patch) {
    const allowed = [
      "support_level",
      "serial_number",
      "manufacturer_ticket_id",
      "fault_description",
    ];
    const setFields = allowed.filter((field) => Object.prototype.hasOwnProperty.call(patch, field));
    if (setFields.length === 0) return 0;

    const q = `
      UPDATE dbo.[faults]
      SET ${setFields.map((field) => `${field} = @${field}`).join(",\n          ")},
          updated_at = SYSDATETIME()
      WHERE id = @id;

      SELECT @@ROWCOUNT AS affected;
    `;

    const values = { id };
    for (const field of setFields) values[field] = patch[field];

    const r = await db.execute(q, values);
    return r?.recordset?.[0]?.affected ?? 0;
  }

  async updateFaultStatus(id, status, execute = db.execute) {
    const q = `
      UPDATE dbo.[faults]
      SET status = @status,
          updated_at = SYSDATETIME(),
          closed_at = CASE WHEN @status = 0 THEN SYSDATETIME() ELSE NULL END
      WHERE id = @id;

      SELECT @@ROWCOUNT AS affected;
    `;
    const r = await execute(q, { id, status });
    return r?.recordset?.[0]?.affected ?? 0;
  }

  /* =========================
     WORK ENTRIES
     ========================= */

  async listWorkEntriesForEmployee(employeeId, fromDate, toDateExclusive) {
    const q = `
      SELECT
        we.id,
        CONVERT(varchar(10), we.work_date, 23) AS work_date,
        CONVERT(varchar(8), we.start_time, 108) AS start_time,
        CONVERT(varchar(8), we.end_time, 108) AS end_time,
        we.notes,
        we.employee_id, we.project_id,
        p.name AS project_name
      FROM dbo.[work_entries] we
      INNER JOIN dbo.[projects] p ON p.id = we.project_id
      WHERE we.employee_id = @employee_id
        AND we.work_date >= @from
        AND we.work_date < @to
      ORDER BY we.work_date DESC, we.start_time DESC;
    `;
    const r = await db.execute(q, { employee_id: employeeId, from: fromDate, to: toDateExclusive });
    return r?.recordset || [];
  }

  async getWorkEntryById(id) {
    const q = `
      SELECT
        id,
        employee_id,
        project_id,
        CONVERT(varchar(10), work_date, 23) AS work_date,
        CONVERT(varchar(8), start_time, 108) AS start_time,
        CONVERT(varchar(8), end_time, 108) AS end_time,
        notes
      FROM dbo.[work_entries]
      WHERE id = @id;
    `;
    const r = await db.execute(q, { id });
    return r?.recordset?.[0] || null;
  }

  async createWorkEntry(entry) {
    const q = `
      INSERT INTO dbo.[work_entries]
        (employee_id, project_id, work_date, start_time, end_time, notes)
      OUTPUT inserted.id
      VALUES
        (@employee_id, @project_id, @work_date, @start_time, @end_time, @notes);
    `;
    const r = await db.execute(q, {
      employee_id: entry.employee_id,
      project_id: entry.project_id,
      work_date: entry.work_date,
      start_time: entry.start_time,
      end_time: entry.end_time,
      notes: entry.notes ?? "",
    });
    return r?.recordset?.[0]?.id ?? null;
  }

  async updateWorkEntry(id, patch) {
    const q = `
      UPDATE dbo.[work_entries]
      SET
        project_id = COALESCE(@project_id, project_id),
        work_date  = COALESCE(@work_date, work_date),
        start_time = COALESCE(@start_time, start_time),
        end_time   = COALESCE(@end_time, end_time),
        notes      = COALESCE(@notes, notes)
      WHERE id = @id;

      SELECT @@ROWCOUNT AS affected;
    `;
    const r = await db.execute(q, {
      id,
      project_id: patch.project_id ?? null,
      work_date: patch.work_date ?? null,
      start_time: patch.start_time ?? null,
      end_time: patch.end_time ?? null,
      notes: patch.notes ?? null,
    });
    return r?.recordset?.[0]?.affected ?? 0;
  }

  async deleteWorkEntry(id) {
    const q = `
      DELETE FROM dbo.[work_entries] WHERE id = @id;
      SELECT @@ROWCOUNT AS affected;
    `;
    const r = await db.execute(q, { id });
    return r?.recordset?.[0]?.affected ?? 0;
  }

  /* =========================
     CONTRACTOR ENTRIES
     ========================= */

  async createContractorEntry(entry) {
    const q = `
      INSERT INTO dbo.[contractor_entries]
        (manager_employee_id, project_id, start_time, end_time, contractor_name, service_description, service_cost)
      OUTPUT inserted.id
      VALUES
        (@manager_employee_id, @project_id, @start_time, @end_time, @contractor_name, @service_description, @service_cost);
    `;
    const r = await db.execute(q, {
      manager_employee_id: entry.manager_employee_id,
      project_id: entry.project_id,
      start_time: entry.start_time ?? null,
      end_time: entry.end_time ?? null,
      contractor_name: entry.contractor_name,
      service_description: entry.service_description,
      service_cost: entry.service_cost ?? null,
    });
    return r?.recordset?.[0]?.id ?? null;
  }

  async contractorMonthlyReport(fromDate, toDateExclusive) {
    const q = `
      SELECT
        ce.id,
        CONVERT(varchar(10), ce.service_date, 23) AS service_date,
        CONVERT(varchar(8), ce.start_time, 108) AS start_time,
        CONVERT(varchar(8), ce.end_time, 108) AS end_time,
        ce.contractor_name,
        ce.service_description,
        ce.service_cost,
        ce.project_id,
        p.name AS project_name,
        ce.manager_employee_id,
        e.first_name AS manager_first_name,
        e.last_name AS manager_last_name
      FROM dbo.[contractor_entries] ce
      INNER JOIN dbo.[projects] p ON p.id = ce.project_id
      INNER JOIN dbo.[employees] e ON e.id = ce.manager_employee_id
      WHERE ce.service_date >= @from
        AND ce.service_date < @to
      ORDER BY ce.service_date DESC, ce.id DESC;
    `;
    const r = await db.execute(q, { from: fromDate, to: toDateExclusive });
    return r?.recordset || [];
  }

  async updateContractorServiceCost(id, serviceCost) {
    const q = `
      UPDATE dbo.[contractor_entries]
      SET service_cost = @service_cost,
          updated_at = SYSDATETIME()
      WHERE id = @id;

      SELECT @@ROWCOUNT AS affected;
    `;
    const r = await db.execute(q, { id, service_cost: serviceCost ?? null });
    return r?.recordset?.[0]?.affected ?? 0;
  }

  /* =========================
     REPORTS
     ========================= */

  async employeeMonthlyReport(employeeId, fromDate, toDateExclusive) {
    // Returns per-entry rows + totals can be computed in service layer.
    const q = `
      SELECT
        CONVERT(varchar(10), we.work_date, 23) AS work_date,
        CONVERT(varchar(8), we.start_time, 108) AS start_time,
        CONVERT(varchar(8), we.end_time, 108) AS end_time,
        we.notes,
        p.name AS project_name
      FROM dbo.[work_entries] we
      INNER JOIN dbo.[projects] p ON p.id = we.project_id
      WHERE we.employee_id = @employee_id
        AND we.work_date >= @from
        AND we.work_date < @to
      ORDER BY we.work_date, we.start_time;
    `;
    const r = await db.execute(q, { employee_id: employeeId, from: fromDate, to: toDateExclusive });
    return r?.recordset || [];
  }

  async projectReport(projectId, fromDate, toDateExclusive) {
    const q = `
      SELECT
        e.id AS employee_id,
        e.first_name,
        e.last_name,
        e.daily_rate,
        CONVERT(varchar(10), we.work_date, 23) AS work_date,
        CONVERT(varchar(8), we.start_time, 108) AS start_time,
        CONVERT(varchar(8), we.end_time, 108) AS end_time,
        we.notes
      FROM dbo.[work_entries] we
      INNER JOIN dbo.[employees] e ON e.id = we.employee_id
      WHERE we.project_id = @project_id
        AND we.work_date >= @from
        AND we.work_date < @to
      ORDER BY e.last_name, e.first_name, we.work_date, we.start_time;
    `;
    const r = await db.execute(q, { project_id: projectId, from: fromDate, to: toDateExclusive });
    return r?.recordset || [];
  }
}

export default new SqlService();

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
             daily_rate, login, password_hash, role, is_active
      FROM dbo.[employees]
      WHERE login = @login;
    `;
    const r = await db.execute(q, { login });
    return r?.recordset?.[0] || null;
  }

  async listEmployees() {
    const q = `
      SELECT id, first_name, last_name, passport_id, car_id, card_id, phone, email,
             daily_rate, login, role, is_active
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
             daily_rate, login, password_hash, role, is_active
      FROM dbo.[employees]
      WHERE id = @id;
    `;
    const r = await db.execute(q, { id });
    return r?.recordset?.[0] || null;
  }

  async createEmployee(e) {
    const q = `
      INSERT INTO dbo.[employees]
        (first_name, last_name, passport_id, car_id, card_id, phone, email, daily_rate, login, password_hash, role, is_active)
      OUTPUT inserted.id
      VALUES
        (@first_name, @last_name, @passport_id, @car_id, @card_id, @phone, @email, @daily_rate, @login, @password_hash, @role, @is_active);
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

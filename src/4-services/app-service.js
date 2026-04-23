// src/4-services/app-service.js
// Business logic layer (validation, permissions, derived calculations)

import bcrypt from "bcryptjs";
import sqlService from "./sql-service.js";

function toInt(v) {
  const n = Number(v);
  return Number.isInteger(n) ? n : null;
}

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

function parseISODate(d) {
  // expect YYYY-MM-DD
  if (!isNonEmptyString(d)) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return null;
  return d;
}

function parseTime(t) {
  // accept HH:MM or HH:MM:SS
  if (!isNonEmptyString(t)) return null;
  if (!/^\d{2}:\d{2}(:\d{2})?$/.test(t)) return null;
  return t.length === 5 ? `${t}:00` : t;
}

function minutesBetween(startTime, endTime) {
  // both HH:MM:SS
  const [sh, sm] = startTime.split(":");
  const [eh, em] = endTime.split(":");
  const s = (Number(sh) * 60) + Number(sm);
  const e = (Number(eh) * 60) + Number(em);
  return e - s;
}

function round2(value) {
  return Math.round(Number(value) * 100) / 100;
}

function parseOptionalMoney(value) {
  if (value === undefined || value === null || String(value).trim() === "") return null;
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return NaN;
  return round2(amount);
}

function monthRange(month) {
  // month: YYYY-MM
  if (!isNonEmptyString(month) || !/^\d{4}-\d{2}$/.test(month)) return null;
  const [yStr, mStr] = month.split("-");
  const y = Number(yStr);
  const m = Number(mStr);
  if (!Number.isInteger(y) || !Number.isInteger(m) || m < 1 || m > 12) return null;
  const from = `${yStr}-${mStr}-01`;
  // naive next month (string)
  const nextY = m === 12 ? y + 1 : y;
  const nextM = m === 12 ? 1 : m + 1;
  const to = `${String(nextY).padStart(4, "0")}-${String(nextM).padStart(2, "0")}-01`;
  return { from, to };
}

const DEFAULT_SETTINGS = {
  admin_language: "en",
  workday_hours: "9",
};

function normalizeSettings(rows) {
  const raw = { ...DEFAULT_SETTINGS };
  for (const row of rows || []) {
    raw[row.setting_key] = String(row.setting_value ?? "");
  }

  const language = raw.admin_language === "he" ? "he" : "en";
  const workdayHours = Number(raw.workday_hours);

  return {
    admin_language: language,
    workday_hours: Number.isFinite(workdayHours) && workdayHours > 0 ? workdayHours : Number(DEFAULT_SETTINGS.workday_hours),
  };
}

class AppService {
  /* =========================
     SETTINGS (ADMIN)
     ========================= */

  async getSettings() {
    const rows = await sqlService.listSettings();
    return { ok: true, settings: normalizeSettings(rows) };
  }

  async updateSettings(payload) {
    const settings = {};

    if (payload?.admin_language !== undefined) {
      const language = String(payload.admin_language || "").trim();
      if (!["en", "he"].includes(language)) {
        return { ok: false, status: 400, message: "Invalid language" };
      }
      settings.admin_language = language;
    }

    if (payload?.workday_hours !== undefined) {
      const hours = Number(payload.workday_hours);
      if (!Number.isFinite(hours) || hours <= 0 || hours > 24) {
        return { ok: false, status: 400, message: "Invalid workday hours" };
      }
      settings.workday_hours = String(round2(hours));
    }

    for (const [key, value] of Object.entries(settings)) {
      await sqlService.setSetting(key, value);
    }

    return this.getSettings();
  }

  /* =========================
     EMPLOYEES (ADMIN)
     ========================= */

  async listEmployees() {
    const employees = await sqlService.listEmployees();
    return { ok: true, employees };
  }

  async createEmployee(payload) {
    const first_name = String(payload?.first_name || "").trim();
    const last_name = String(payload?.last_name || "").trim();
    const passport_id = String(payload?.passport_id || "").trim() || null;
    const car_id = String(payload?.car_id || "").trim() || null;
    const card_id = String(payload?.card_id || "").trim() || null;
    const phone = String(payload?.phone || "").trim() || null;
    const email = String(payload?.email || "").trim() || null;
    const login = String(payload?.login || "").trim();
    const password = String(payload?.password || "");
    // Admin is a system user and is not managed from the Employees tab.
    // All accounts created from the admin UI are employees.
    const role = "employee";
    const is_manager = payload?.is_manager ? 1 : 0;
    const is_active = payload?.is_active === 0 ? 0 : 1;

    const daily_rate = Number(payload?.daily_rate);
    if (!first_name || !last_name || !login || !password) {
      return { ok: false, status: 400, message: "Missing required fields" };
    }
    if (!Number.isFinite(daily_rate) || daily_rate <= 0) {
      return { ok: false, status: 400, message: "Invalid daily_rate" };
    }
    // role is always employee here

    const existing = await sqlService.getEmployeeByLogin(login);
    if (existing) return { ok: false, status: 409, message: "Login already exists" };

    const password_hash = await bcrypt.hash(password, 10);
    const id = await sqlService.createEmployee({
      first_name,
      last_name,
      passport_id,
      car_id,
      card_id,
      phone,
      email,
      daily_rate,
      login,
      password_hash,
      role,
      is_manager,
      is_active,
    });

    if (!id) return { ok: false, status: 500, message: "Failed to create employee" };
    return { ok: true, id, message: "Employee created" };
  }

  async updateEmployee(id, payload) {
    const employeeId = toInt(id);
    if (!employeeId) return { ok: false, status: 400, message: "Invalid employee id" };

    const current = await sqlService.getEmployeeById(employeeId);
    if (!current) return { ok: false, status: 404, message: "Employee not found" };
    if (String(current.role).toLowerCase() === "admin") {
      return { ok: false, status: 403, message: "Cannot modify admin account" };
    }

    const patch = {};
    if (payload?.first_name !== undefined) patch.first_name = String(payload.first_name || "").trim();
    if (payload?.last_name !== undefined) patch.last_name = String(payload.last_name || "").trim();
    if (payload?.passport_id !== undefined) patch.passport_id = String(payload.passport_id || "").trim() || null;
    if (payload?.car_id !== undefined) patch.car_id = String(payload.car_id || "").trim() || null;
    if (payload?.card_id !== undefined) patch.card_id = String(payload.card_id || "").trim() || null;
    if (payload?.phone !== undefined) patch.phone = String(payload.phone || "").trim() || null;
    if (payload?.email !== undefined) patch.email = String(payload.email || "").trim() || null;
    if (payload?.login !== undefined) patch.login = String(payload.login || "").trim();
    // role is not editable for employees in this system
    if (payload?.is_manager !== undefined) patch.is_manager = payload.is_manager ? 1 : 0;
    if (payload?.is_active !== undefined) patch.is_active = payload.is_active ? 1 : 0;
    if (payload?.daily_rate !== undefined) patch.daily_rate = Number(payload.daily_rate);
    if (payload?.password !== undefined && String(payload.password).length > 0) {
      patch.password_hash = await bcrypt.hash(String(payload.password), 10);
    }

    if (patch.daily_rate !== undefined && (!Number.isFinite(patch.daily_rate) || patch.daily_rate <= 0)) {
      return { ok: false, status: 400, message: "Invalid daily_rate" };
    }
    // role is not editable
    if (patch.login) {
      const existing = await sqlService.getEmployeeByLogin(patch.login);
      if (existing && existing.id !== employeeId) {
        return { ok: false, status: 409, message: "Login already exists" };
      }
    }

    const affected = await sqlService.updateEmployee(employeeId, patch);
    if (!affected) return { ok: false, status: 404, message: "Employee not found" };
    return { ok: true, message: "Employee updated" };
  }

  async deleteEmployee(id) {
    const employeeId = toInt(id);
    if (!employeeId) return { ok: false, status: 400, message: "Invalid employee id" };
    const current = await sqlService.getEmployeeById(employeeId);
    if (!current) return { ok: false, status: 404, message: "Employee not found" };
    if (String(current.role).toLowerCase() === "admin") {
      return { ok: false, status: 403, message: "Cannot delete admin account" };
    }
    const affected = await sqlService.deleteEmployee(employeeId);
    if (!affected) return { ok: false, status: 404, message: "Employee not found" };
    return { ok: true, message: "Employee deleted" };
  }

  async listManagerCarEmployees(user) {
    const current = await sqlService.getEmployeeById(user?.uid);
    if (!current || String(current.role).toLowerCase() !== "employee" || !current.is_active || !current.is_manager) {
      return { ok: false, status: 403, message: "Manager access required" };
    }

    const employees = await sqlService.listEmployeesForManagerCarList();
    return { ok: true, employees };
  }

  async createManagerContractorEntry(user, payload) {
    const current = await sqlService.getEmployeeById(user?.uid);
    if (!current || String(current.role).toLowerCase() !== "employee" || !current.is_active || !current.is_manager) {
      return { ok: false, status: 403, message: "Manager access required" };
    }

    const project_id = toInt(payload?.project_id);
    const start_time = String(payload?.start_time || "").trim() ? parseTime(payload.start_time) : null;
    const end_time = String(payload?.end_time || "").trim() ? parseTime(payload.end_time) : null;
    const contractor_name = String(payload?.contractor_name || "").trim();
    const service_description = String(payload?.service_description || "").trim();
    const service_cost = parseOptionalMoney(payload?.service_cost);

    if (!project_id || !contractor_name || !service_description) {
      return { ok: false, status: 400, message: "Missing contractor details" };
    }
    if (Number.isNaN(service_cost)) {
      return { ok: false, status: 400, message: "Invalid service cost" };
    }
    if ((payload?.start_time && !start_time) || (payload?.end_time && !end_time)) {
      return { ok: false, status: 400, message: "Invalid contractor time" };
    }
    if ((start_time && !end_time) || (!start_time && end_time)) {
      return { ok: false, status: 400, message: "Start and end time must be filled together" };
    }
    if (start_time && end_time && minutesBetween(start_time, end_time) <= 0) {
      return { ok: false, status: 400, message: "end_time must be after start_time" };
    }

    const project = await sqlService.getProjectById(project_id);
    if (!project) return { ok: false, status: 400, message: "Invalid project" };
    if (!project.is_active) return { ok: false, status: 400, message: "Project is disabled" };

    const id = await sqlService.createContractorEntry({
      manager_employee_id: current.id,
      project_id,
      start_time,
      end_time,
      contractor_name,
      service_description,
      service_cost,
    });

    if (!id) return { ok: false, status: 500, message: "Failed to create contractor entry" };
    return { ok: true, id, message: "Contractor entry created" };
  }

  /* =========================
     PROJECTS (ADMIN)
     ========================= */

  async listProjectsForUser(user) {
    const role = String(user?.role || "employee").toLowerCase();
    if (role === "admin") {
      return this.listProjects();
    }
    const projects = await sqlService.listActiveProjects();
    return { ok: true, projects };
  }

  async listProjects() {
    const projects = await sqlService.listProjects();
    return { ok: true, projects };
  }

  async createProject(name) {
    const n = String(name || "").trim();
    if (!n) return { ok: false, status: 400, message: "Missing project name" };
    const id = await sqlService.createProject(n);
    if (!id) return { ok: false, status: 500, message: "Failed to create project" };
    return { ok: true, id, message: "Project created" };
  }

  async updateProject(id, patch) {
    const projectId = toInt(id);
    if (!projectId) return { ok: false, status: 400, message: "Invalid project id" };
    const p = {};
    if (patch?.name !== undefined) p.name = String(patch.name || "").trim();
    if (patch?.is_active !== undefined) p.is_active = patch.is_active ? 1 : 0;
    const affected = await sqlService.updateProject(projectId, p);
    if (!affected) return { ok: false, status: 404, message: "Project not found" };
    return { ok: true, message: "Project updated" };
  }

  async deleteProject(id) {
    const projectId = toInt(id);
    if (!projectId) return { ok: false, status: 400, message: "Invalid project id" };
    const affected = await sqlService.deleteProject(projectId);
    if (!affected) return { ok: false, status: 404, message: "Project not found" };
    return { ok: true, message: "Project deleted" };
  }

  /* =========================
     WORK ENTRIES (EMPLOYEE)
     ========================= */

  async listMyEntries(user, month) {
    const range = monthRange(month);
    if (!range) return { ok: false, status: 400, message: "Invalid month (expected YYYY-MM)" };
    const rows = await sqlService.listWorkEntriesForEmployee(user.uid, range.from, range.to);
    return { ok: true, entries: rows };
  }

  async createMyEntry(user, payload) {
    const work_date = parseISODate(payload?.work_date);
    const start_time = parseTime(payload?.start_time);
    const end_time = parseTime(payload?.end_time);
    const project_id = toInt(payload?.project_id);
    const notes = String(payload?.notes || "");

    if (!work_date || !start_time || !end_time || !project_id) {
      return { ok: false, status: 400, message: "Missing/invalid fields" };
    }

    const mins = minutesBetween(start_time, end_time);
    if (mins <= 0) return { ok: false, status: 400, message: "end_time must be after start_time" };

    // Do not allow reporting against disabled projects
    const project = await sqlService.getProjectById(project_id);
    if (!project) return { ok: false, status: 400, message: "Invalid project" };
    if (!project.is_active) return { ok: false, status: 400, message: "Project is disabled" };

    const id = await sqlService.createWorkEntry({
      employee_id: user.uid,
      project_id,
      work_date,
      start_time,
      end_time,
      notes,
    });

    if (!id) return { ok: false, status: 500, message: "Failed to create work entry" };
    return { ok: true, id, message: "Work entry created" };
  }

  async updateMyEntry(user, entryId, payload) {
    const id = toInt(entryId);
    if (!id) return { ok: false, status: 400, message: "Invalid entry id" };
    const existing = await sqlService.getWorkEntryById(id);
    if (!existing) return { ok: false, status: 404, message: "Entry not found" };
    if (existing.employee_id !== user.uid) return { ok: false, status: 403, message: "Forbidden" };

    const patch = {};
    if (payload?.work_date !== undefined) patch.work_date = parseISODate(payload.work_date);
    if (payload?.start_time !== undefined) patch.start_time = parseTime(payload.start_time);
    if (payload?.end_time !== undefined) patch.end_time = parseTime(payload.end_time);
    if (payload?.project_id !== undefined) patch.project_id = toInt(payload.project_id);
    if (payload?.notes !== undefined) patch.notes = String(payload.notes || "");

    // Validate times if both present or if one present + existing
    const st = patch.start_time ?? existing.start_time;
    const et = patch.end_time ?? existing.end_time;

    // Validate project if changed (and always ensure final project is active)
    const finalProjectId = patch.project_id ?? existing.project_id;
    if (!finalProjectId) return { ok: false, status: 400, message: "Invalid project" };
    const project = await sqlService.getProjectById(finalProjectId);
    if (!project) return { ok: false, status: 400, message: "Invalid project" };
    if (!project.is_active) return { ok: false, status: 400, message: "Project is disabled" };
    const mins = minutesBetween(String(st), String(et));
    if (mins <= 0) return { ok: false, status: 400, message: "end_time must be after start_time" };

    const affected = await sqlService.updateWorkEntry(id, patch);
    if (!affected) return { ok: false, status: 404, message: "Entry not found" };
    return { ok: true, message: "Work entry updated" };
  }

  async deleteMyEntry(user, entryId) {
    const id = toInt(entryId);
    if (!id) return { ok: false, status: 400, message: "Invalid entry id" };
    const existing = await sqlService.getWorkEntryById(id);
    if (!existing) return { ok: false, status: 404, message: "Entry not found" };
    if (existing.employee_id !== user.uid) return { ok: false, status: 403, message: "Forbidden" };

    const affected = await sqlService.deleteWorkEntry(id);
    if (!affected) return { ok: false, status: 404, message: "Entry not found" };
    return { ok: true, message: "Work entry deleted" };
  }

  /* =========================
     REPORTS (ADMIN)
     ========================= */

  async getEmployeeMonthlyReport(employeeId, month) {
    const id = toInt(employeeId);
    if (!id) return { ok: false, status: 400, message: "Invalid employee id" };
    const range = monthRange(month);
    if (!range) return { ok: false, status: 400, message: "Invalid month" };

    const rows = await sqlService.employeeMonthlyReport(id, range.from, range.to);
    const settings = normalizeSettings(await sqlService.listSettings());
    const overtimeThresholdMinutes = Math.round(settings.workday_hours * 60);

    let totalMinutes = 0;
    const daySet = new Set();
    const dayMinutes = new Map();

    for (const r of rows) {
      const workDate = String(r.work_date).slice(0, 10);
      const minutes = minutesBetween(String(r.start_time), String(r.end_time));
      totalMinutes += minutes;
      if (workDate) daySet.add(workDate);
      dayMinutes.set(workDate, (dayMinutes.get(workDate) || 0) + minutes);
    }

    let totalExtraMinutes = 0;
    for (const minutes of dayMinutes.values()) {
      if (minutes > overtimeThresholdMinutes) totalExtraMinutes += (minutes - overtimeThresholdMinutes);
    }

    const decoratedRows = rows.map((r) => {
      const workDate = String(r.work_date).slice(0, 10);
      const dayTotalMinutes = dayMinutes.get(workDate) || 0;
      const extraMinutes = Math.max(dayTotalMinutes - overtimeThresholdMinutes, 0);
      return {
        ...r,
        row_minutes: minutesBetween(String(r.start_time), String(r.end_time)),
        day_total_minutes: dayTotalMinutes,
        day_total_hours: round2(dayTotalMinutes / 60),
        day_extra_minutes: extraMinutes,
        day_extra_hours: round2(extraMinutes / 60),
        is_extra_hours: extraMinutes > 0,
      };
    });

    return {
      ok: true,
      rows: decoratedRows,
      totals: {
        days: daySet.size,
        minutes: totalMinutes,
        hours: round2(totalMinutes / 60),
        extra_minutes: totalExtraMinutes,
        extra_hours: round2(totalExtraMinutes / 60),
        workday_hours: settings.workday_hours,
      },
    };
  }

  async getProjectReport(projectId, month) {
    const id = toInt(projectId);
    if (!id) return { ok: false, status: 400, message: "Invalid project id" };
    const range = monthRange(month);
    if (!range) return { ok: false, status: 400, message: "Invalid month" };

    const rows = await sqlService.projectReport(id, range.from, range.to);

    const byEmployee = new Map();
    const dayPairs = new Set(); // unique (employee_id, work_date)

    for (const r of rows) {
      const key = r.employee_id;
      const mins = minutesBetween(String(r.start_time), String(r.end_time));
      const workDate = String(r.work_date).slice(0, 10);

      const item = byEmployee.get(key) || {
        employee_id: r.employee_id,
        first_name: r.first_name,
        last_name: r.last_name,
        daily_rate: Number(r.daily_rate),
        minutes: 0,
        _days: new Set(),
      };

      item.minutes += mins;
      item._days.add(workDate);
      dayPairs.add(`${key}|${workDate}`);
      byEmployee.set(key, item);
    }

    const employees = Array.from(byEmployee.values())
      .map((e) => {
        const hours = e.minutes / 60;
        const days = e._days.size;
        const cost = days * e.daily_rate;
        return {
          employee_id: e.employee_id,
          first_name: e.first_name,
          last_name: e.last_name,
          daily_rate: e.daily_rate,
          days,
          minutes: e.minutes,
          hours: round2(hours),
          cost: round2(cost),
        };
      })
      .sort((a, b) => (a.last_name || "").localeCompare(b.last_name || ""));

    const totalMinutes = employees.reduce((sum, e) => sum + e.minutes, 0);
    const totalCost = employees.reduce((sum, e) => sum + e.cost, 0);
    const totalDays = dayPairs.size;

    return {
      ok: true,
      employees,
      totals: {
        employeeCount: employees.length,
        days: totalDays,
        minutes: totalMinutes,
        hours: round2(totalMinutes / 60),
        cost: round2(totalCost),
      },
    };
  }

  async getContractorMonthlyReport(month) {
    const range = monthRange(month);
    if (!range) return { ok: false, status: 400, message: "Invalid month" };

    const rows = await sqlService.contractorMonthlyReport(range.from, range.to);
    const totalCost = rows.reduce((sum, row) => sum + Number(row.service_cost || 0), 0);

    return {
      ok: true,
      rows,
      totals: {
        entries: rows.length,
        cost: round2(totalCost),
      },
    };
  }

  async updateContractorServiceCost(id, payload) {
    const contractorId = toInt(id);
    if (!contractorId) return { ok: false, status: 400, message: "Invalid contractor entry id" };

    const service_cost = parseOptionalMoney(payload?.service_cost);
    if (Number.isNaN(service_cost)) {
      return { ok: false, status: 400, message: "Invalid service cost" };
    }

    const affected = await sqlService.updateContractorServiceCost(contractorId, service_cost);
    if (!affected) return { ok: false, status: 404, message: "Contractor entry not found" };
    return { ok: true, message: "Contractor cost updated" };
  }
}

export default new AppService();

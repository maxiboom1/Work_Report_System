import bcrypt from "bcryptjs";
import sqlService from "./sql/employees-sql.js";
import { toInt } from "./shared/validators.js";

export async function listEmployees() {
    const employees = await sqlService.listEmployees();
    return { ok: true, employees };
}

export async function createEmployee(payload) {
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

export async function updateEmployee(id, payload) {
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

export async function deleteEmployee(id) {
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

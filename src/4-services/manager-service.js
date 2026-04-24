import sqlService from "./sql/manager-sql.js";
import { minutesBetween, parseOptionalMoney, parseTime, toInt } from "./shared/validators.js";

export async function listManagerCarEmployees(user) {
    const current = await sqlService.getEmployeeById(user?.uid);
    if (!current || String(current.role).toLowerCase() !== "employee" || !current.is_active || !current.is_manager) {
      return { ok: false, status: 403, message: "Manager access required" };
    }

    const employees = await sqlService.listEmployeesForManagerCarList();
    return { ok: true, employees };
}

export async function createManagerContractorEntry(user, payload) {
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

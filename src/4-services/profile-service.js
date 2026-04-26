import bcrypt from "bcryptjs";
import sqlService from "./sql/employees-sql.js";

function isEmployee(user) {
  return String(user?.role || "").toLowerCase() === "employee";
}

function toProfile(employee) {
  return {
    first_name: employee?.first_name ?? "",
    last_name: employee?.last_name ?? "",
    passport_id: employee?.passport_id ?? null,
    car_id: employee?.car_id ?? null,
    phone: employee?.phone ?? null,
    email: employee?.email ?? null,
  };
}

async function passwordMatches(password, storedHash) {
  const stored = String(storedHash || "");
  if (stored.startsWith("$2a$") || stored.startsWith("$2b$") || stored.startsWith("$2y$")) {
    return bcrypt.compare(password, stored);
  }
  return password === stored;
}

export async function getMyProfile(authUser) {
  if (!isEmployee(authUser)) return { ok: false, status: 403, message: "Forbidden" };

  const employee = await sqlService.getEmployeeById(authUser.uid);
  if (!employee || !isEmployee(employee)) return { ok: false, status: 404, message: "Profile not found" };

  return { ok: true, profile: toProfile(employee) };
}

export async function updateMyProfile(authUser, payload) {
  if (!isEmployee(authUser)) return { ok: false, status: 403, message: "Forbidden" };

  const employee = await sqlService.getEmployeeById(authUser.uid);
  if (!employee || !isEmployee(employee)) return { ok: false, status: 404, message: "Profile not found" };

  const patch = {};
  for (const field of ["passport_id", "car_id", "phone", "email"]) {
    if (Object.prototype.hasOwnProperty.call(payload || {}, field)) {
      patch[field] = String(payload[field] || "").trim() || null;
    }
  }

  const hasCurrentPassword = Object.prototype.hasOwnProperty.call(payload || {}, "current_password");
  const hasNewPassword = Object.prototype.hasOwnProperty.call(payload || {}, "new_password");
  if (hasCurrentPassword || hasNewPassword) {
    const currentPassword = String(payload?.current_password || "");
    const newPassword = String(payload?.new_password || "");
    if (!currentPassword || !newPassword) {
      return {
        ok: false,
        status: 400,
        code: "PROFILE_PASSWORD_FIELDS_REQUIRED",
        message: "Current password and new password are required",
      };
    }

    const validCurrentPassword = await passwordMatches(currentPassword, employee.password_hash);
    if (!validCurrentPassword) {
      return {
        ok: false,
        status: 403,
        code: "PROFILE_CURRENT_PASSWORD_INVALID",
        message: "Current password is incorrect",
      };
    }

    patch.password_hash = await bcrypt.hash(newPassword, 10);
  }

  if (Object.keys(patch).length > 0) {
    const affected = await sqlService.updateEmployee(employee.id, patch);
    if (!affected) return { ok: false, status: 404, message: "Profile not found" };
  }

  return { ok: true, profile: toProfile({ ...employee, ...patch }), message: "Profile updated" };
}

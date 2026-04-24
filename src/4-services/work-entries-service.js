import sqlService from "./sql/work-entries-sql.js";
import { minutesBetween, monthRange, parseISODate, parseTime, toInt } from "./shared/validators.js";

export async function listMyEntries(user, month) {
    const range = monthRange(month);
    if (!range) return { ok: false, status: 400, message: "Invalid month (expected YYYY-MM)" };
    const rows = await sqlService.listWorkEntriesForEmployee(user.uid, range.from, range.to);
    return { ok: true, entries: rows };
}

export async function createMyEntry(user, payload) {
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

export async function updateMyEntry(user, entryId, payload) {
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

export async function deleteMyEntry(user, entryId) {
    const id = toInt(entryId);
    if (!id) return { ok: false, status: 400, message: "Invalid entry id" };
    const existing = await sqlService.getWorkEntryById(id);
    if (!existing) return { ok: false, status: 404, message: "Entry not found" };
    if (existing.employee_id !== user.uid) return { ok: false, status: 403, message: "Forbidden" };

    const affected = await sqlService.deleteWorkEntry(id);
    if (!affected) return { ok: false, status: 404, message: "Entry not found" };
    return { ok: true, message: "Work entry deleted" };
}

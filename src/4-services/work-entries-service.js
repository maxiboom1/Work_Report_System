import sqlService from "./sql/work-entries-sql.js";
import {
    floorTimeToFiveMinutes,
    isDateTimeInFuture,
    isFiveMinuteTime,
    localDateISO,
    localTimeHHMMSS,
    minutesBetween,
    monthRange,
    parseISODate,
    parseTime,
    toInt,
} from "./shared/validators.js";

function serverClock(now = new Date()) {
    return {
      date: localDateISO(now),
      time: localTimeHHMMSS(now),
      rounded_time: floorTimeToFiveMinutes(localTimeHHMMSS(now)),
    };
}

function isStaleSession(session, now = new Date()) {
    return Boolean(session?.work_date && session.work_date < localDateISO(now));
}

function publicSession(session, now = new Date()) {
    if (!session) return null;
    return {
      id: session.id,
      project_id: session.project_id,
      project_name: session.project_name,
      work_date: session.work_date,
      start_time: String(session.start_time || "").slice(0, 5),
      is_stale: isStaleSession(session, now),
    };
}

function publicConflict(entry) {
    if (!entry) return null;
    return {
      id: entry.id,
      project_name: entry.project_name,
      work_date: entry.work_date,
      start_time: String(entry.start_time || "").slice(0, 5),
      end_time: String(entry.end_time || "").slice(0, 5),
    };
}

function overlapResult(conflict) {
    return {
      ok: false,
      status: 409,
      code: "WORK_ENTRY_OVERLAP",
      message: "Work entry overlaps an existing entry",
      conflict: publicConflict(conflict),
    };
}

function startUnavailableResult(conflict) {
    const publicEntry = publicConflict(conflict);
    return {
      ok: false,
      status: 409,
      code: "WORK_ENTRY_START_UNAVAILABLE",
      message: "Start time is before the next available time",
      minimum_start_time: publicEntry?.end_time || null,
      conflict: publicEntry,
    };
}

async function findOverlap(employeeId, workDate, startTime, endTime, excludeEntryId = null) {
    if (minutesBetween(String(startTime), String(endTime)) === 0) return null;
    return sqlService.findOverlappingWorkEntry(employeeId, workDate, startTime, endTime, excludeEntryId);
}

async function findStartOverlap(employeeId, workDate, startTime) {
    return sqlService.findWorkEntryContainingTime(employeeId, workDate, startTime);
}

async function findLatestCompletedEntry(employeeId, workDate) {
    return sqlService.findLatestNonZeroWorkEntryForDate(employeeId, workDate);
}

export async function listMyEntries(user, month) {
    const range = monthRange(month);
    if (!range) return { ok: false, status: 400, message: "Invalid month (expected YYYY-MM)" };
    const rows = await sqlService.listWorkEntriesForEmployee(user.uid, range.from, range.to);
    return { ok: true, entries: rows };
}

export async function getActiveSession(user) {
    const now = new Date();
    const session = await sqlService.getActiveWorkSessionForEmployee(user.uid);
    return { ok: true, session: publicSession(session, now), server_now: serverClock(now) };
}

export async function startSession(user, payload) {
    const now = new Date();
    const today = localDateISO(now);
    const work_date = parseISODate(payload?.work_date);
    const start_time = parseTime(payload?.start_time);
    const project_id = toInt(payload?.project_id);

    if (!work_date || !start_time || !project_id) {
      return { ok: false, status: 400, message: "Missing/invalid fields" };
    }
    if (work_date !== today) {
      return { ok: false, status: 400, message: "Start date must be today" };
    }
    if (!isFiveMinuteTime(start_time)) {
      return { ok: false, status: 400, message: "Time must use 5-minute steps" };
    }
    if (isDateTimeInFuture(work_date, start_time, now)) {
      return { ok: false, status: 400, message: "Start time cannot be in the future" };
    }

    const existing = await sqlService.getActiveWorkSessionForEmployee(user.uid);
    if (existing) return { ok: false, status: 409, message: "Work session already active" };

    const project = await sqlService.getProjectById(project_id);
    if (!project) return { ok: false, status: 400, message: "Invalid project" };
    if (!project.is_active) return { ok: false, status: 400, message: "Project is disabled" };

    const latestEntry = await findLatestCompletedEntry(user.uid, work_date);
    if (latestEntry && minutesBetween(String(start_time), String(latestEntry.end_time)) > 0) {
      return startUnavailableResult(latestEntry);
    }

    const overlap = await findStartOverlap(user.uid, work_date, start_time);
    if (overlap) return overlapResult(overlap);

    const id = await sqlService.createActiveWorkSession({
      employee_id: user.uid,
      project_id,
      work_date,
      start_time,
    });
    if (!id) return { ok: false, status: 500, message: "Failed to start work session" };

    const session = await sqlService.getActiveWorkSessionForEmployee(user.uid);
    return { ok: true, session: publicSession(session, now), server_now: serverClock(now), message: "Work session started" };
}

export async function stopSession(user, payload) {
    const now = new Date();
    const end_time = parseTime(payload?.end_time);
    const notes = String(payload?.notes || "");

    if (!end_time) return { ok: false, status: 400, message: "Missing/invalid end time" };
    if (!isFiveMinuteTime(end_time)) {
      return { ok: false, status: 400, message: "Time must use 5-minute steps" };
    }

    const active = await sqlService.getActiveWorkSessionForEmployee(user.uid);
    if (!active) return { ok: false, status: 404, message: "No active work session" };
    const today = localDateISO(now);
    if (active.work_date !== today) {
      return { ok: false, status: 400, message: "Active session must be stopped on the same day" };
    }
    if (isDateTimeInFuture(active.work_date, end_time, now)) {
      return { ok: false, status: 400, message: "End time cannot be in the future" };
    }

    const mins = minutesBetween(String(active.start_time), end_time);
    if (mins < 0) return { ok: false, status: 400, message: "End time cannot be before start time" };

    const result = await sqlService.completeActiveWorkSession(user.uid, end_time, notes);
    if (result?.overlap) return overlapResult(result.overlap);
    if (!result?.entryId) return { ok: false, status: 500, message: "Failed to stop work session" };
    return { ok: true, id: result.entryId, server_now: serverClock(now), message: "Work session stopped" };
}

export async function recoverCloseSession(user, payload) {
    const now = new Date();
    const end_time = parseTime(payload?.end_time);
    const notes = String(payload?.notes || "");

    if (!end_time) return { ok: false, status: 400, message: "Missing/invalid end time" };
    if (!isFiveMinuteTime(end_time)) {
      return { ok: false, status: 400, message: "Time must use 5-minute steps" };
    }

    const active = await sqlService.getActiveWorkSessionForEmployee(user.uid);
    if (!active) return { ok: false, status: 404, message: "No active work session" };
    if (!isStaleSession(active, now)) {
      return { ok: false, status: 400, message: "Active session is not stale" };
    }

    const mins = minutesBetween(String(active.start_time), end_time);
    if (mins < 0) return { ok: false, status: 400, message: "End time cannot be before start time" };

    const result = await sqlService.completeActiveWorkSession(user.uid, end_time, notes);
    if (result?.overlap) return overlapResult(result.overlap);
    if (!result?.entryId) return { ok: false, status: 500, message: "Failed to recover work session" };
    return { ok: true, id: result.entryId, server_now: serverClock(now), message: "Work session recovered" };
}

export async function discardSession(user) {
    const now = new Date();
    const active = await sqlService.getActiveWorkSessionForEmployee(user.uid);
    if (!active) return { ok: false, status: 404, message: "No active work session" };
    if (!isStaleSession(active, now)) {
      return { ok: false, status: 400, message: "Active session is not stale" };
    }

    const affected = await sqlService.deleteActiveWorkSessionForEmployee(user.uid);
    if (!affected) return { ok: false, status: 404, message: "No active work session" };
    return { ok: true, server_now: serverClock(now), message: "Work session discarded" };
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
    if (!isFiveMinuteTime(start_time) || !isFiveMinuteTime(end_time)) {
      return { ok: false, status: 400, message: "Time must use 5-minute steps" };
    }
    if (isDateTimeInFuture(work_date, start_time) || isDateTimeInFuture(work_date, end_time)) {
      return { ok: false, status: 400, message: "Work entry cannot use future date/time" };
    }

    const mins = minutesBetween(start_time, end_time);
    if (mins < 0) return { ok: false, status: 400, message: "end_time cannot be before start_time" };

    // Do not allow reporting against disabled projects
    const project = await sqlService.getProjectById(project_id);
    if (!project) return { ok: false, status: 400, message: "Invalid project" };
    if (!project.is_active) return { ok: false, status: 400, message: "Project is disabled" };

    const overlap = await findOverlap(user.uid, work_date, start_time, end_time);
    if (overlap) return overlapResult(overlap);

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

    if (payload?.work_date !== undefined && !patch.work_date) return { ok: false, status: 400, message: "Invalid work date" };
    if (payload?.start_time !== undefined && !patch.start_time) return { ok: false, status: 400, message: "Invalid start time" };
    if (payload?.end_time !== undefined && !patch.end_time) return { ok: false, status: 400, message: "Invalid end time" };
    if (payload?.project_id !== undefined && !patch.project_id) return { ok: false, status: 400, message: "Invalid project" };

    // Validate times if both present or if one present + existing
    const st = patch.start_time ?? existing.start_time;
    const et = patch.end_time ?? existing.end_time;
    const finalDate = patch.work_date ?? existing.work_date;

    if (!isFiveMinuteTime(st) || !isFiveMinuteTime(et)) {
      return { ok: false, status: 400, message: "Time must use 5-minute steps" };
    }
    if (isDateTimeInFuture(finalDate, st) || isDateTimeInFuture(finalDate, et)) {
      return { ok: false, status: 400, message: "Work entry cannot use future date/time" };
    }

    // Validate project if changed (and always ensure final project is active)
    const finalProjectId = patch.project_id ?? existing.project_id;
    if (!finalProjectId) return { ok: false, status: 400, message: "Invalid project" };
    const project = await sqlService.getProjectById(finalProjectId);
    if (!project) return { ok: false, status: 400, message: "Invalid project" };
    if (!project.is_active) return { ok: false, status: 400, message: "Project is disabled" };
    const mins = minutesBetween(String(st), String(et));
    if (mins < 0) return { ok: false, status: 400, message: "end_time cannot be before start_time" };

    const overlap = await findOverlap(user.uid, finalDate, String(st), String(et), id);
    if (overlap) return overlapResult(overlap);

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

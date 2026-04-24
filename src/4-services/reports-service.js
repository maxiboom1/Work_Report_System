import sqlService from "./sql/reports-sql.js";
import { getSettings } from "./settings-service.js";
import { minutesBetween, monthRange, parseOptionalMoney, round2, toInt } from "./shared/validators.js";

export async function getEmployeeMonthlyReport(employeeId, month) {
    const id = toInt(employeeId);
    if (!id) return { ok: false, status: 400, message: "Invalid employee id" };
    const range = monthRange(month);
    if (!range) return { ok: false, status: 400, message: "Invalid month" };

    const rows = await sqlService.employeeMonthlyReport(id, range.from, range.to);
    const settings = (await getSettings()).settings;
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

export async function getProjectReport(projectId, month) {
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

export async function getContractorMonthlyReport(month) {
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

export async function updateContractorServiceCost(id, payload) {
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

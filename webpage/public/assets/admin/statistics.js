import { api } from "../shared/api.js";
import { $id } from "../shared/dom.js";
import { currentLang, t } from "./i18n.js";
import { EMPLOYEES } from "./employees.js";
import { PROJECTS } from "./projects.js";
import { createSummaryMetrics, renderTable } from "./table.js";

export async function refreshStatsIfRendered() {
  if (!$id("stats-table")?.querySelector("table")) return;
  try {
    await runStats();
  } catch (e) {
    $id("stats-summary").textContent = e.message;
  }
}

export function fillStatsPickers() {
  const empSel = $id("stats-emp");
  const prjSel = $id("stats-prj");
  if (!empSel || !prjSel) return;
  const selectedEmp = empSel.value;
  const selectedPrj = prjSel.value;

  empSel.innerHTML = "";
  const empPrompt = document.createElement("option");
  empPrompt.value = "";
  empPrompt.textContent = t("selectPrompt");
  empSel.appendChild(empPrompt);
  for (const e of EMPLOYEES) {
    const opt = document.createElement("option");
    opt.value = e.id;
    opt.textContent = `${e.last_name}, ${e.first_name}`;
    empSel.appendChild(opt);
  }
  if (selectedEmp) empSel.value = selectedEmp;

  prjSel.innerHTML = "";
  const prjPrompt = document.createElement("option");
  prjPrompt.value = "";
  prjPrompt.textContent = t("selectPrompt");
  prjSel.appendChild(prjPrompt);
  for (const p of PROJECTS) {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = p.name;
    prjSel.appendChild(opt);
  }
  if (selectedPrj) prjSel.value = selectedPrj;
}

export function setStatsMode(mode) {
  const isEmp = mode === "employee";
  const isProject = mode === "project";
  $id("stats-emp-row").classList.toggle("is-hidden", !isEmp);
  $id("stats-prj-row").classList.toggle("is-hidden", !isProject);
  $id("stats-table").innerHTML = "";
  $id("stats-summary").textContent = "";
}

export function initMonthPickers() {
  document.querySelectorAll("[data-month-picker]").forEach((button) => {
    const input = $id(button.dataset.monthPicker);
    if (!input) return;

    button.addEventListener("click", () => {
      input.focus({ preventScroll: true });
      try {
        if (typeof input.showPicker === "function") {
          input.showPicker();
          return;
        }
      } catch {}
      input.click();
    });
  });
}

export function formatHours(value) {
  return Number(value || 0).toFixed(2).replace(/\.00$/, "");
}

export function formatMoney(value) {
  if (value === null || value === undefined || value === "") return "-";
  return Number(value || 0).toFixed(2).replace(/\.00$/, "");
}

export const DAY_NAMES = {
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  he: ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"],
};

export function dayNameFromDate(value) {
  const dateText = String(value || "").slice(0, 10);
  const date = new Date(`${dateText}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  if (document.documentElement.lang === "he") {
    return [
      "\u05e8\u05d0\u05e9\u05d5\u05df",
      "\u05e9\u05e0\u05d9",
      "\u05e9\u05dc\u05d9\u05e9\u05d9",
      "\u05e8\u05d1\u05d9\u05e2\u05d9",
      "\u05d7\u05de\u05d9\u05e9\u05d9",
      "\u05e9\u05d9\u05e9\u05d9",
      "\u05e9\u05d1\u05ea",
    ][date.getDay()];
  }
  return DAY_NAMES.en[date.getDay()];
}

export function createDateCell(dateText, options = {}) {
  const { isContinuation = false, isExtraHours = false } = options;
  const wrap = document.createElement("div");
  wrap.className = `date-stack${isContinuation ? " is-continuation" : ""}`;

  const date = document.createElement("span");
  date.className = "date-text";
  date.textContent = dateText;

  const day = document.createElement("span");
  day.className = "day-badge";
  day.textContent = dayNameFromDate(dateText);

  wrap.append(date, day);
  if (isExtraHours) {
    const extra = document.createElement("span");
    extra.className = "extra-badge";
    extra.textContent = "extra";
    wrap.appendChild(extra);
  }
  return wrap;
}


export function createContractorCostCell(row) {
  const wrap = document.createElement("div");
  wrap.className = "cost-cell";

  const value = document.createElement("span");
  value.className = "cost-value";
  value.textContent = formatMoney(row.service_cost);

  const btn = document.createElement("button");
  btn.className = "btn btn-small";
  btn.type = "button";
  btn.textContent = t("editCost");
  btn.addEventListener("click", async () => {
    const currentValue = row.service_cost === null || row.service_cost === undefined ? "" : String(row.service_cost);
    const nextValue = prompt(`${t("costUpdateConfirm")}\n${t("serviceCost")}:`, currentValue);
    if (nextValue === null) return;

    try {
      await api(`/admin/contractors/${row.id}/cost`, {
        method: "PUT",
        body: JSON.stringify({ service_cost: nextValue }),
      });
      $id("stats-summary").textContent = t("costUpdated");
      await runStats();
    } catch (e) {
      $id("stats-summary").textContent = e.message;
    }
  });

  wrap.append(value, btn);
  return wrap;
}

export async function runStats() {
  const mode = $id("stats-mode").value;
  const month = $id("stats-month").value;

  if (!month) throw new Error(t("missingMonth"));

  if (mode === "employee") {
    const empId = $id("stats-emp").value;
    if (!empId) throw new Error(t("missingEmployee"));

    const r = await api(`/admin/reports/employee/${empId}?month=${encodeURIComponent(month)}`);

    const sourceRows = r.rows || [];
    const rows = sourceRows.map((x, index) => {
      const dateText = String(x.work_date).slice(0, 10);
      const previousDate = index > 0 ? String(sourceRows[index - 1].work_date).slice(0, 10) : "";
      const isSameDayContinuation = dateText === previousDate;
      return {
        isExtraHours: Boolean(x.is_extra_hours),
        isSameDayContinuation,
        cells: [
        createDateCell(dateText, {
          isContinuation: isSameDayContinuation,
          isExtraHours: Boolean(x.is_extra_hours),
        }),
        String(x.start_time).slice(0, 5),
        String(x.end_time).slice(0, 5),
        x.project_name,
        x.notes || "",
      ],
      };
    });

    const totalDays = r.totals?.days ?? 0;
    const totalHours = r.totals?.hours ?? 0;
    const totalExtraHours = r.totals?.extra_hours ?? 0;

    const summaryRow = [
      { content: t("summary"), className: "summary-title" },
      {
        colSpan: 4,
        content: createSummaryMetrics([
          { label: t("totalDays"), value: String(totalDays) },
          { label: t("totalHours"), value: formatHours(totalHours) },
          { label: t("extraHours"), value: formatHours(totalExtraHours) },
        ]),
      },
    ];

    const table = renderTable([t("date"), t("start"), t("end"), t("project"), t("notes")], rows, {
      summaryRow,
      rowClassName: (row) => [
        row.isSameDayContinuation ? "same-day-continuation" : "",
      ].filter(Boolean).join(" "),
    });
    $id("stats-table").innerHTML = "";
    $id("stats-table").appendChild(table);
    $id("stats-summary").textContent = `${t("totalDays")}: ${totalDays} | ${t("totalHours")}: ${formatHours(totalHours)} | ${t("extraHours")}: ${formatHours(totalExtraHours)}`;
  } else if (mode === "project") {
    const prjId = $id("stats-prj").value;
    if (!prjId) throw new Error(t("missingProject"));

    const r = await api(`/admin/reports/project/${prjId}?month=${encodeURIComponent(month)}`);

    const rows = (r.employees || []).map((e) => ({
      cells: [
        `${e.last_name}, ${e.first_name}`,
        String(e.daily_rate),
        String(e.days),
        formatHours(e.hours),
        formatHours(e.cost),
      ],
    }));

    const totals = r.totals || {};
    const summaryRow = [
      { content: t("summary"), className: "summary-title" },
      "",
      String(totals.days ?? 0),
      formatHours(totals.hours),
      formatHours(totals.cost),
    ];

    const table = renderTable([t("employee"), t("dailyRateHeader"), t("days"), t("hours"), t("cost")], rows, { summaryRow });
    $id("stats-table").innerHTML = "";
    $id("stats-table").appendChild(table);

    // Required top line
    $id("stats-summary").textContent = `${t("employeeCount")}: ${totals.employeeCount ?? 0} | ${t("totalHours")}: ${formatHours(totals.hours)} | ${t("cost")}: ${formatHours(totals.cost)}`;
  } else {
    const r = await api(`/admin/reports/contractors?month=${encodeURIComponent(month)}`);
    const rows = (r.rows || []).map((entry) => ({
      cells: [
        createDateCell(String(entry.service_date).slice(0, 10)),
        String(entry.start_time || "").slice(0, 5) || "-",
        String(entry.end_time || "").slice(0, 5) || "-",
        entry.project_name || "",
        entry.contractor_name || "",
        entry.service_description || "",
        `${entry.manager_last_name || ""}, ${entry.manager_first_name || ""}`.replace(/^, /, "").trim() || "-",
        createContractorCostCell(entry),
      ],
    }));

    const totals = r.totals || {};
    const summaryRow = [
      { content: t("summary"), className: "summary-title" },
      {
        colSpan: 7,
        content: createSummaryMetrics([
          { label: t("entries"), value: String(totals.entries ?? 0) },
          { label: t("cost"), value: formatMoney(totals.cost) },
        ]),
      },
    ];

    const table = renderTable([
      t("date"),
      t("start"),
      t("end"),
      t("project"),
      t("contractorName"),
      t("serviceDescription"),
      t("managerAddedBy"),
      t("serviceCost"),
    ], rows, { summaryRow });

    $id("stats-table").innerHTML = "";
    $id("stats-table").appendChild(table);
    $id("stats-summary").textContent = `${t("entries")}: ${totals.entries ?? 0} | ${t("cost")}: ${formatMoney(totals.cost)}`;
  }
}

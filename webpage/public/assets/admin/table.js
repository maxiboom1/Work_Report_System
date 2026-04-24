function appendCellContent(td, content) {
  if (content instanceof Node) {
    td.appendChild(content);
    return;
  }
  td.textContent = content ?? "";
}

export function createMetric(label, value) {
  const metric = document.createElement("span");
  metric.className = "summary-metric";
  const labelEl = document.createElement("span");
  labelEl.className = "summary-metric-label";
  labelEl.textContent = label;
  const valueEl = document.createElement("span");
  valueEl.className = "summary-metric-value";
  valueEl.textContent = value;
  metric.append(labelEl, valueEl);
  return metric;
}

export function createSummaryMetrics(metrics) {
  const wrap = document.createElement("div");
  wrap.className = "summary-metrics";
  metrics.forEach(({ label, value }) => wrap.appendChild(createMetric(label, value)));
  return wrap;
}

export function renderTable(headers, rows, options = {}) {
  const { summaryRow = null, rowClassName = null } = options;
  const table = document.createElement("table");
  table.className = "table";
  const thead = document.createElement("thead");
  const trh = document.createElement("tr");
  headers.forEach((h) => {
    const th = document.createElement("th");
    th.textContent = h;
    trh.appendChild(th);
  });
  thead.appendChild(trh);
  const tbody = document.createElement("tbody");
  rows.forEach((r) => {
    const tr = document.createElement("tr");
    if (typeof rowClassName === "function") {
      const className = rowClassName(r);
      if (className) tr.className = className;
    }
    r.cells.forEach((c) => {
      const td = document.createElement("td");
      appendCellContent(td, c);
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  let tfoot = null;
  if (summaryRow) {
    tfoot = document.createElement("tfoot");
    const tr = document.createElement("tr");
    tr.className = "summary-row";
    summaryRow.forEach((c) => {
      const td = document.createElement("td");
      if (c && typeof c === "object" && !(c instanceof Node)) {
        if (c.colSpan) td.colSpan = c.colSpan;
        if (c.className) td.className = c.className;
        appendCellContent(td, c.content);
      } else {
        appendCellContent(td, c);
      }
      tr.appendChild(td);
    });
    tfoot.appendChild(tr);
  }
  table.appendChild(thead);
  table.appendChild(tbody);
  if (tfoot) table.appendChild(tfoot);
  return table;
}

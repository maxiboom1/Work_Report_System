import { $id } from "../shared/dom.js";
import { t, workerLanguage } from "./i18n.js";
import { currentCarList, managerEmployees, setCurrentCarList } from "./state.js";

export function showCarList() {
  const selectedIds = Array.from(document.querySelectorAll('#manager-workers input[type="checkbox"]:checked'))
    .map((input) => Number(input.value));
  const selected = managerEmployees.filter((worker) => selectedIds.includes(Number(worker.id)));
  setCurrentCarList(selected);
  const output = $id("car-list-output");
  output.innerHTML = "";

  if (!selected.length) {
    $id("car-list-screen").hidden = true;
    $id("manager-status").textContent = t("selectAtLeastOneWorker");
    return;
  }

  const generatedAt = new Date().toLocaleDateString(workerLanguage === "he" ? "he-IL" : "en-US");
  const title = document.createElement("div");
  title.className = "car-list-title";
  title.id = "car-list-title";
  title.textContent = t("carListTitle");

  const meta = document.createElement("div");
  meta.className = "car-list-meta";
  meta.textContent = `${selected.length} ${t("workers")} - ${generatedAt}`;

  const table = document.createElement("table");
  table.className = "car-list-table";
  const thead = document.createElement("thead");
  thead.innerHTML = `<tr><th>${t("name")}</th><th>${t("passport")}</th><th>${t("car")}</th></tr>`;
  const tbody = document.createElement("tbody");

  for (const worker of selected) {
    const tr = document.createElement("tr");
    const name = `${worker.first_name || ""} ${worker.last_name || ""}`.trim();
    [name || "-", worker.passport_id || "-", worker.car_id || "-"].forEach((value) => {
      const td = document.createElement("td");
      td.textContent = value;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  }

  table.append(thead, tbody);
  output.append(title, meta, table);
  $id("car-list-screen").hidden = false;
  $id("manager-status").textContent = `${selected.length} ${t("workersSelected")}`;
}

export function carListShareText() {
  const separator = "**********";
  const lines = [`${t("carListTitle")}:`];
  for (const worker of currentCarList) {
    const name = `${worker.first_name || ""} ${worker.last_name || ""}`.trim() || "-";
    lines.push(
      separator,
      `*${name}*`,
      `${t("idNumber")}: ${worker.passport_id || "-"}`,
      `${t("carNumber")}: ${worker.car_id || "-"}`
    );
  }
  lines.push(separator);
  return lines.join("\n");
}

export function showManualCopyPanel(text, wasCopied) {
  const panel = $id("car-list-copy-panel");
  const textarea = $id("car-list-copy-text");
  textarea.value = text;
  panel.hidden = false;
  textarea.focus();
  textarea.select();
  $id("manager-status").textContent = wasCopied ? t("listCopied") : t("manualShareHint");
}

export async function shareCarList() {
  if (!currentCarList.length) return;
  const text = carListShareText();

  if (navigator.share && (!navigator.canShare || navigator.canShare({ title: t("carListTitle"), text }))) {
    try {
      await navigator.share({ title: t("carListTitle"), text });
      return;
    } catch (err) {
      if (err?.name === "AbortError") return;
    }
  }

  if (navigator.clipboard?.writeText && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      showManualCopyPanel(text, true);
      return;
    } catch {
      // Fall through to WhatsApp/manual copy for browsers that expose clipboard but deny it.
    }
  }

  const isSmallTouchScreen = window.matchMedia("(max-width: 820px)").matches && navigator.maxTouchPoints > 0;
  if (isSmallTouchScreen) {
    window.location.href = `whatsapp://send?text=${encodeURIComponent(text)}`;
    window.setTimeout(() => showManualCopyPanel(text, false), 800);
    return;
  }

  let copied = false;
  try {
    showManualCopyPanel(text, false);
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }

  showManualCopyPanel(text, copied);
}

export function closeCarList() {
  $id("car-list-screen").hidden = true;
  $id("car-list-copy-panel").hidden = true;
}

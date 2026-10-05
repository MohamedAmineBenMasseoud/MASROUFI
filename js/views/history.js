// views/history.js: every week, newest first, each one openable to see exactly what was spent.
// Input: `computed` = computeWeeks(...) result.
// `openIds` (optional Set of week ids) keeps weeks open after a re-render; by default only the latest is open.
import { formatRange, num } from "../utils.js";
import { icon } from "../icons.js";
import { expenseRows } from "./parts.js";
import { monthName } from "../months.js";
import { t } from "../i18n.js";

function weekCard(w, isCurrent, open, months, language) {
  const month = months.find((item) => item.weekIds.includes(w.id));
  return `
    <details class="card history-week" data-week="${w.id}" ${open ? "open" : ""}>
      <summary>
        <div class="history-summary-head">
          <div>
            <span class="eyebrow-compact">Week ${w.number}${isCurrent ? " · Current" : ""}</span>
            <strong>${formatRange(w.startDate)}</strong>
            ${month ? `<span class="history-month-chip">${monthName(month.label, language)}</span>` : ""}
          </div>
          <span class="summary-balance">${num(w.remaining)}</span>
        </div>
      </summary>
      <div class="history-body">
        <div class="history-stats">
          <div class="mini"><span>Received</span><b>${num(w.received)}</b></div>
          <div class="mini"><span>Carry-over</span><b>${num(w.carry)}</b></div>
          <div class="mini"><span>Savings</span><b>−${num(w.saved)}</b></div>
          <div class="mini"><span>Expenses</span><b>${num(w.spent)}</b></div>
          <div class="mini"><span>Remaining</span><b>${num(w.remaining)}</b></div>
        </div>
        <div class="history-label">Week ${w.number} purchase history</div>
        ${expenseRows(w)}
        <button class="add-btn secondary" data-action="add-expense" data-week="${w.id}">${num(w.remaining) > 0 ? "" : ""}${""}${icon("plus", 16)} Add Expense</button>
        <div class="week-actions">
          <button class="btn secondary" data-action="edit-week" data-week="${w.id}">Edit week</button>
          <button class="btn danger" data-action="delete-week" data-week="${w.id}">Delete week</button>
        </div>
      </div>
    </details>`;
}

export function renderHistory(computed, openIds = null, months = [], language = "en") {
  if (!computed.length) {
    return `
      <section class="card empty-card">
        <h3>No weeks recorded yet</h3>
        <p>Start by adding your first week.</p>
        <button class="btn" data-action="add-week">+ Add Week</button>
      </section>`;
  }
  const latest = computed.length - 1;
  const weeks = computed
    .map((w, i) => weekCard(w, i === latest, openIds ? openIds.has(w.id) : i === latest, months, language))
    .reverse();
  return `<div class="screen-header"><h3>History</h3><button class="home-week-pill" type="button" data-action="add-week" aria-label="${t("home.add.week")}">${icon("plus", 16)}<span>${t("home.add.week.label")}</span></button></div>${weeks.join("")}`;
}

// views/savings.js: savings goal, progress, savings history, and data backup buttons.
// Input: `computed` = computeWeeks(...) result, `goal` = savings goal. Output: an HTML string.
import { savingsSummary } from "../calc.js";
import { icon } from "../icons.js";
import { formatDate, money } from "../utils.js";
import { THEMES } from "../theme.js";
import { goalCard } from "./parts.js";

function allocationCard(computed, goal) {
  const s = savingsSummary(computed, goal);
  const pace = computed.length ? computed[computed.length - 1].saved : null;
  const paceLabel = pace !== null && pace !== undefined ? `${money(pace)} / week` : "Chosen each week";
  return `
    <section class="card panel-card">
      <div class="section-head compact">
        <h3>Allocation</h3>
        <span class="tiny-badge">Automatic</span>
      </div>
      <div class="stat-list">
        <div class="stat-row"><span>${icon("coins", 16)} Savings</span><b>${paceLabel}</b></div>
        <div class="stat-row"><span>${icon("cal", 16)} Weeks recorded</span><b>${computed.length}</b></div>
        <div class="stat-row"><span>${icon("target", 16)} Total saved</span><b>${money(s.saved)}</b></div>
        <div class="stat-row"><span>${icon("target", 16)} Weeks to goal</span><b>${s.weeksLeft}</b></div>
      </div>
      <button class="add-btn" data-action="edit-goal">Change goal (${goal} TND)</button>
    </section>`;
}

function historyCard(computed) {
  const rows = computed.length
    ? [...computed]
        .reverse()
        .map(
          (w) => `
      <div class="stat-row compact-row">
        <span>Week ${w.number} · ${formatDate(w.startDate, true)}</span>
        <b>+${money(w.saved)}</b>
      </div>`
        )
        .join("")
    : `<div class="empty-state inline">Savings will appear here after you add your first week.</div>`;
  return `
    <section class="card panel-card">
      <div class="section-head compact"><h3>Savings history</h3></div>
      ${rows}
    </section>`;
}

/** Theme picker (it moves into the Profile screen in a later step). */
function themeCard(profile) {
  const current = profile?.theme || "dark";
  const buttons = THEMES.map(
    (t) => `
      <button class="theme-btn ${t.id === current ? "on" : ""}" data-action="set-theme" data-theme="${t.id}" aria-pressed="${t.id === current}">
        <span class="theme-dot" style="background:${t.dot}"></span>${t.label}
      </button>`
  ).join("");
  return `
    <section class="card panel-card">
      <div class="section-head compact"><h3>Theme</h3><span class="tiny-badge">Saved on this device</span></div>
      <div class="theme-grid">${buttons}</div>
    </section>`;
}

function dataCard() {
  return `
    <section class="card panel-card">
      <div class="section-head compact"><h3>${icon("export", 16)} My data</h3><span class="tiny-badge">Saved on this device</span></div>
      <div class="data-actions">
        <button class="btn" data-action="export">Export my budget</button>
        <button class="btn danger" data-action="reset">Reset all data</button>
      </div>
    </section>`;
}

export function renderSavings(computed, goal, profile) {
  return `
    <div class="screen-header"><h3>Savings overview</h3></div>
    ${goalCard(computed, goal)}
    ${allocationCard(computed, goal)}
    ${historyCard(computed)}
    ${themeCard(profile)}
    ${dataCard()}`;
}
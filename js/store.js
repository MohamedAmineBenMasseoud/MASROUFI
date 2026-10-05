// store.js: the only file that touches localStorage and backup files.
import { DEFAULT_GOAL, WEEKLY_SAVINGS, computeWeeks, isValid } from "./calc.js";
import { DEFAULT_THEME, THEME_IDS } from "./theme.js";

const KEY = "savings-budget-v1";
const LEGACY_KEY = "legacy-budget-v1";

export const LANGUAGES = ["en", "fr", "ar"];
export const INCOME_MODES = ["weekly", "monthly"];

/** Who the user is and how the app looks. Old backups without a profile get these defaults. */
export const DEFAULT_PROFILE = { name: "", language: "en", theme: DEFAULT_THEME, incomeMode: "weekly", onboarded: false };

/** Clean a profile object: unknown or missing values fall back to the defaults. Never throws. */
export function cleanProfile(raw) {
  const p = raw && typeof raw === "object" ? raw : {};
  return {
    name: String(p.name ?? "").trim().slice(0, 30),
    language: LANGUAGES.includes(p.language) ? p.language : DEFAULT_PROFILE.language,
    theme: THEME_IDS.includes(p.theme) ? p.theme : DEFAULT_PROFILE.theme,
    incomeMode: INCOME_MODES.includes(p.incomeMode) ? p.incomeMode : DEFAULT_PROFILE.incomeMode,
    onboarded: typeof p.onboarded === "boolean" ? p.onboarded : (Array.isArray(raw?.weeks) && raw.weeks.length > 0 ? true : false),
  };
}

export const createEmpty = () => ({ goal: DEFAULT_GOAL, weeks: [], months: [], profile: { ...DEFAULT_PROFILE } });

/** Check and clean a data object. Throws an Error with a readable message if invalid. */
export function normalize(raw) {
  if (!raw || !Array.isArray(raw.weeks)) throw new Error("Missing weeks list.");
  const weeks = raw.weeks.map((w, i) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(w.startDate || "")) throw new Error(`Week ${i + 1}: invalid date.`);
    const received = Number(w.received);
    if (!Number.isFinite(received) || received < 0) throw new Error(`Week ${i + 1}: invalid amount received.`);
    const saved = Number(w.saved ?? WEEKLY_SAVINGS);
    if (!Number.isFinite(saved) || saved < 0) throw new Error(`Week ${i + 1}: invalid savings amount.`);
    const expenses = (Array.isArray(w.expenses) ? w.expenses : []).map((e) => {
      const amount = Number(e.amount);
      if (!Number.isFinite(amount) || amount <= 0) throw new Error(`Week ${i + 1}: invalid expense amount.`);
      return { name: String(e.name ?? "").trim() || "Expense", amount, category: String(e.category || "Other") };
    });
    return { id: String(w.id || crypto.randomUUID()), startDate: w.startDate, received, saved, expenses };
  });
  const dates = weeks.map((w) => w.startDate);
  if (new Set(dates).size !== dates.length) throw new Error("Two weeks share the same Monday.");
  const goal = Number(raw.goal) > 0 ? Number(raw.goal) : DEFAULT_GOAL;
  if (!Array.isArray(raw.months ?? [])) throw new Error("Invalid months list.");
  const weekIds = new Set(weeks.map((week) => week.id));
  const months = (raw.months ?? []).map((month, i) => {
    if (!month || typeof month !== "object" || Array.isArray(month)) throw new Error(`Month ${i + 1}: invalid month.`);
    const label = String(month.label ?? "");
    const monthNumber = Number(label.slice(5, 7));
    if (!/^\d{4}-\d{2}$/.test(label) || monthNumber < 1 || monthNumber > 12) throw new Error(`Month ${i + 1}: invalid label.`);
    const income = Number(month.income);
    if (!Number.isFinite(income) || income <= 0) throw new Error(`Month ${i + 1}: invalid income.`);
    if (!Array.isArray(month.weekIds)) throw new Error(`Month ${i + 1}: invalid week list.`);
    return {
      id: String(month.id || crypto.randomUUID()),
      label,
      income,
      weekIds: [...new Set(month.weekIds.map(String).filter((id) => weekIds.has(id)))],
    };
  });
  const profile = cleanProfile(raw.profile);
  const data = { goal, weeks, months, profile };
  if (weeks.length > 0) data.profile.onboarded = true;
  if (!isValid(computeWeeks(weeks))) throw new Error("Some week would end with negative money.");
  return data;
}

/** Load saved data, or an empty budget if nothing valid is stored. */
export function load() {
  try {
    const raw = localStorage.getItem(KEY) ?? localStorage.getItem(LEGACY_KEY);
    return raw ? normalize(JSON.parse(raw)) : createEmpty();
  } catch (e) {
    return createEmpty();
  }
}

/** Save data. Returns true on success, false if the browser refused. */
export function save(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    return false;
  }
}

/** Remove all saved data. */
export function clear() {
  try { localStorage.removeItem(KEY); } catch (e) {}
}

/** Download the budget as a JSON backup file. */
export function exportData(data) {
  const day = new Date().toISOString().slice(0, 10);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
  a.download = `masrofi-budget-${day}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/** Parse backup text into valid data. Throws if the file is not a valid backup. */
export function parseBackup(text) {
  return normalize(JSON.parse(text));
}

/** Read a backup File chosen by the user. Resolves with valid data. */
export function importFile(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      try { resolve(parseBackup(r.result)); } catch (e) { reject(e); }
    };
    r.onerror = () => reject(new Error("Could not read the file."));
    r.readAsText(file);
  });
}

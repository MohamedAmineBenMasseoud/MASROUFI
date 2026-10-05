// theme.js: the list of themes and the function that switches between them.
// The colors themselves live in css/style.css (one block per theme, selected by <html data-theme="...">).
// No money logic and no storage here.

export const THEMES = [
  { id: "dark", label: "Dark", dot: "#14b8a6", bg: "#000000" },
  { id: "light", label: "Light", dot: "#0b8274", bg: "#f4f7f7" },
  { id: "rose", label: "Rose", dot: "#d01560", bg: "#fff1f4" },
  { id: "ocean", label: "Ocean", dot: "#22d3ee", bg: "#06121f" },
];
export const DEFAULT_THEME = "dark";
export const THEME_IDS = THEMES.map((t) => t.id);

/** Switch the whole app to a theme. Unknown ids fall back to the default theme. */
export function applyTheme(id) {
  const theme = THEMES.find((t) => t.id === id) || THEMES.find((t) => t.id === DEFAULT_THEME);
  document.documentElement.dataset.theme = theme.id;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme.bg); // colors the phone's status bar in the installed app
}

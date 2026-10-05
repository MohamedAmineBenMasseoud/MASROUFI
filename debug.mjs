
import fs from 'node:fs/promises';
import { JSDOM } from 'jsdom';
const html = await fs.readFile('index.html', 'utf8');
const dom = new JSDOM(html, { url: 'http://localhost/', pretendToBeVisual: true, runScripts: 'outside-only', beforeParse(window) { const store = new Map(); Object.defineProperty(window, 'localStorage', {value:{getItem(k){return store.has(k)?store.get(k):null;}, setItem(k,v){store.set(String(k), String(v));}, removeItem(k){store.delete(k);}, clear(){store.clear();}}, configurable:true}); window.alert = () => {}; window.confirm = async () => true; window.URL.createObjectURL = () => 'blob:test'; window.URL.revokeObjectURL = () => {}; window.navigator.serviceWorker = { register: async () => ({}) }; } });
const {window} = dom;
globalThis.window = window; globalThis.document = window.document; globalThis.localStorage = window.localStorage; globalThis.Node = window.Node; globalThis.HTMLElement = window.HTMLElement; globalThis.getComputedStyle = window.getComputedStyle.bind(window);
await import(new URL('./js/app.js?cacheBust=' + Date.now(), import.meta.url).href);
await new Promise(r => setTimeout(r, 1600));
console.log('initial body:', document.body.innerHTML.slice(0,500));
document.querySelector('[data-action="onboard-start"]').click();
console.log('after start:', document.body.innerHTML.slice(0,600));
for (let i = 1; i <= 6; i++) {
  const btn = document.querySelector('[data-action="onboard-next"]');
  console.log('next btn', i, !!btn, btn && btn.outerHTML.slice(0,200));
  if (!btn) break;
  btn.click();
  console.log('after next', i, 'sample:', document.body.innerHTML.slice(0,600));
}
console.log('monthly selector', !!document.querySelector('[data-action="set-income-mode"][data-mode="monthly"]'));

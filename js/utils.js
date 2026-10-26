/* Utilidades generales: DOM, texto seguro, almacenamiento, avisos */
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
};
export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const framed = (() => { try { return window.top !== window.self; } catch (e) { return true; } })();
export const mq = matchMedia('(prefers-color-scheme: dark)');
export const round2 = n => Math.round(n * 100) / 100;
export const haptic = (ms = 10) => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) { } };

/* Copiar al portapapeles (clave del WiFi) */
export function copyText(s) {
  const fallback = () => { try { const ta = document.createElement('textarea'); ta.value = s; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;top:-200px;opacity:0'; document.body.appendChild(ta); ta.select(); const ok = document.execCommand('copy'); ta.remove(); return ok; } catch (e) { return false; } };
  try { if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(s).then(() => true, fallback); } catch (e) { }
  return Promise.resolve(fallback());
}

/* Aviso breve abajo de la pantalla */
let toastTimer = 0;
export function toast(msg) {
  const el = $('#toast');
  $('#toastTxt').textContent = msg;
  el.classList.add('show'); clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}

/* Barra de secciones: botones, indicador, sección activa al hacer scroll, saltar a una sección */
import { $, $$, reduced } from './utils.js';

let secs = [], activeCat = null, lockUntil = 0;
const navEl = () => $('#nav');
const navTop = () => parseFloat(getComputedStyle(navEl()).top) || 0;
export const deskMQ = matchMedia('(min-width: 1100px)');
const navOffset = () => deskMQ.matches ? 24 : navTop() + navEl().offsetHeight;

/* Tras pintar la carta: recordar sus secciones */
export function refreshSections() { secs = $$('#menu .sec'); activeCat = null; }
export function measure() { document.documentElement.style.setProperty('--stick', (deskMQ.matches ? 0 : navEl().offsetHeight) + 'px'); }
export function moveInd(instant) {
  const p = $(`.pill[data-go="${activeCat}"]`), ind = $('.pill-ind'), sc = $('#pills');
  if (!p || !ind) return;
  if (deskMQ.matches) return;
  if (instant) ind.style.transition = 'none';
  ind.style.width = p.offsetWidth + 'px';
  ind.style.transform = `translateX(${p.offsetLeft}px)`;
  if (instant) { void ind.offsetWidth; ind.style.transition = ''; }
  const x = p.offsetLeft - (sc.clientWidth - p.offsetWidth) / 2;
  try { sc.scrollTo({ left: Math.max(0, x), behavior: reduced || instant ? 'auto' : 'smooth' }); } catch (e) { sc.scrollLeft = Math.max(0, x); }
}
function setActive(id, instant) {
  if (id === activeCat && !instant) return;
  activeCat = id;
  $$('.pill').forEach(p => { const on = p.dataset.go === id; p.classList.toggle('on', on); on ? p.setAttribute('aria-current', 'true') : p.removeAttribute('aria-current'); });
  moveInd(instant);
}
export function spy(force) {
  if (!secs.length || (!force && performance.now() < lockUntil)) return;
  const off = navOffset() + 40;
  let cur = secs[0];
  for (const s of secs) { if (s.getBoundingClientRect().top - off <= 0) cur = s; else break; }
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) cur = secs[secs.length - 1];
  setActive(cur.dataset.cat, force && activeCat === null);
}
export function stuck() { navEl().classList.toggle('stuck', !deskMQ.matches && navEl().getBoundingClientRect().top <= navTop() + .5); }
if (deskMQ.addEventListener) deskMQ.addEventListener('change', () => { measure(); moveInd(true); spy(true); });
export function goTo(id) {
  const s = $('#s-' + id); if (!s) return;
  setActive(id); lockUntil = performance.now() + (reduced ? 0 : 900);
  const y = s.getBoundingClientRect().top + window.scrollY - navOffset() + 1;
  window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
}
let ticking = false;
window.addEventListener('scroll', () => {
  if (ticking) return; ticking = true;
  requestAnimationFrame(() => { ticking = false; spy(); stuck(); });
}, { passive: true });

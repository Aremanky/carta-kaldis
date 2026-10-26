/* Hojas que suben desde abajo (ficha, alergias, buscador, «Elige por mí»): abrir, cerrar, arrastrar y botón atrás */
import { $, framed, reduced } from './utils.js';

export const stack = [];
const onClose = {};                       // acciones al cerrar una hoja concreta (p. ej. parar el giro del plato)
export const whenClosed = (id, fn) => { onClose[id] = fn; };
let ignorePop = 0;
const useHist = !framed && typeof history.pushState === 'function';
try { if (useHist && 'scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) { }

export function openSheet(id) {
  const el = document.getElementById(id); if (!el || stack.includes(id)) return;
  el._opener = document.activeElement;
  el.hidden = false; void el.offsetWidth; el.classList.add('open');
  stack.forEach(s => { document.getElementById(s).inert = true; });
  stack.push(id);
  $('#app').inert = true;
  document.documentElement.classList.add('locked');
  if (useHist) { try { history.pushState({ sheet: id }, ''); } catch (e) { } }
  const sb = $('.sbody', el); if (sb) sb.scrollTop = 0;
  setTimeout(() => { const f = el.querySelector('[data-autofocus]') || $('.panel', el); if (f) f.focus({ preventScroll: true }); }, 70);
}
export function closeTop(fromPop) {
  const id = stack.pop(); if (!id) return;
  const el = document.getElementById(id);
  el.classList.remove('open');
  setTimeout(() => { if (!el.classList.contains('open')) el.hidden = true; }, reduced ? 0 : 470);
  if (stack.length) document.getElementById(stack[stack.length - 1]).inert = false;
  else { $('#app').inert = false; document.documentElement.classList.remove('locked'); }
  if (onClose[id]) onClose[id]();
  const op = el._opener; if (op && document.contains(op) && !op.closest('[hidden]')) { try { op.focus({ preventScroll: true }); } catch (e) { } }
  if (!fromPop && useHist) { ignorePop++; history.back(); }
}
window.addEventListener('popstate', () => { if (ignorePop > 0) { ignorePop--; return; } if (stack.length) closeTop(true); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && stack.length) { e.preventDefault(); closeTop(); } });

/* Arrastrar la hoja hacia abajo para cerrarla */
export function enableDrag(sheet) {
  const panel = $('.panel', sheet), grab = $('.grab', sheet); if (!grab) return;
  let y0 = null, dy = 0, t0 = 0;
  grab.addEventListener('pointerdown', e => { y0 = e.clientY; dy = 0; t0 = performance.now(); panel.style.transition = 'none'; try { grab.setPointerCapture(e.pointerId); } catch (_) { } });
  grab.addEventListener('pointermove', e => { if (y0 == null) return; dy = Math.max(0, e.clientY - y0); panel.style.transform = `translateY(${dy}px)`; });
  const end = () => {
    if (y0 == null) return;
    const v = dy / Math.max(1, performance.now() - t0); y0 = null;
    panel.style.transition = ''; panel.style.transform = '';
    if (dy > 110 || (v > .6 && dy > 30)) closeTop();
  };
  grab.addEventListener('pointerup', end); grab.addEventListener('pointercancel', end);
}

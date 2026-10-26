/* Cabecera: banderas de idioma, los dos locales con su rótulo, granos de café y tema claro/oscuro */
import { $, $$, esc, reduced, mq } from './utils.js';
import { S, VENUES, L, t, listFmt, savePrefs } from './state.js';
import { LANGS } from './i18n/index.js';
import { ic } from './icons.js';

/* ---------- Banderas (una por idioma de js/i18n) ---------- */
export function renderFlags() {
  $('#langs').innerHTML = LANGS.map(l => `<button type="button" data-lang="${l.code}" lang="${l.code}" aria-label="${esc(l.name)}" title="${esc(l.name)}" aria-pressed="${l.code === S.lang}"><span class="flag">${l.flag}</span></button>`).join('');
}

/* ---------- Los dos locales a la vez ---------- */
export function renderShops() {
  $('#heroH').textContent = t('heroH', listFmt(VENUES.map(v => v.name)));
  $('#duo').innerHTML = VENUES.map(v => {
    const mark = v.mark.map(m => { const tr = m.track || .04; return `<span data-tr="${tr}" style="font-weight:${m.w || 400};letter-spacing:${tr}em;margin-right:-${tr}em">${esc(m.t)}</span>`; }).join('');
    const tag = L(v.tagline).split(' · ').map(x => `<span class="tg">${esc(x)}</span>`).join(' · ');
    return `<div class="shop" role="group" aria-label="${esc(v.name)}"><img class="logo" src="${esc(v.logo)}" alt="" width="60" height="60">` +
      `<p class="mark" aria-hidden="true">${mark}</p><p class="script">${tag}</p></div>`;
  }).join('');
  fitMarks();
  /* Si la letra del rótulo aún no había llegado, los tamaños se calcularon con la de reserva: se recalculan al llegar */
  if (document.fonts) {
    const fam = getComputedStyle($('#duo .mark')).fontFamily;
    Promise.all([...new Set(VENUES.flatMap(v => v.mark.map(m => `${m.w || 400} 100px ${fam}`)))].map(f => document.fonts.load(f))).then(() => fitMarks(), () => { });
  }
}
if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', () => fitMarks());
/* Los dos nombres a la misma altura: la línea principal de cada rótulo toma el tamaño que cabe en el más
   justo de los dos, y las líneas secundarias (COFFEE BEAN) se ajustan al ancho de la principal. */
export function fitMarks() {
  const marks = $$('#duo .mark'); if (!marks.length || !marks[0].clientWidth) return;
  const wide = innerWidth >= 1100, mid = innerWidth >= 700, cap = wide ? 112 : mid ? 80 : 46;
  const ink = sp => sp.getBoundingClientRect().width - (parseFloat(sp.dataset.tr) || 0) * parseFloat(sp.style.fontSize);   // sin el espaciado tras la última letra
  const heads = marks.map(m => m.firstElementChild);
  heads.forEach(sp => { sp.style.fontSize = '100px'; });
  const size = Math.max(16, Math.min(cap, ...marks.map((m, i) => 100 * m.clientWidth / (ink(heads[i]) || 1) * .98)));
  marks.forEach((m, i) => {
    heads[i].style.fontSize = size.toFixed(1) + 'px';
    const target = ink(heads[i]);
    [...m.children].slice(1).forEach(sp => { sp.style.fontSize = '100px'; sp.style.fontSize = Math.max(9, 100 * target / (ink(sp) || 1)).toFixed(1) + 'px'; });
  });
}

/* ---------- Tema ---------- */
const effTheme = () => document.documentElement.getAttribute('data-theme') || (mq.matches ? 'dark' : 'light');
export function updThemeBtn() { const dark = effTheme() === 'dark', b = $('#themeBtn'); b.innerHTML = ic(dark ? 'sun' : 'moon'); b.setAttribute('aria-label', t(dark ? 'toLight' : 'toDark')); }
export function toggleTheme() { S.theme = effTheme() === 'dark' ? 'light' : 'dark'; document.documentElement.setAttribute('data-theme', S.theme); savePrefs(); }
if (mq.addEventListener) mq.addEventListener('change', updThemeBtn);
new MutationObserver(updThemeBtn).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

/* ---------- Granos de café flotando en el rótulo ---------- */
export const beans = (() => {
  const cv = $('#beans'); if (!cv || !cv.getContext) return null;
  const ctx = cv.getContext('2d'); let W = 0, H = 0, parts = [], raf = 0, running = false;
  const spawn = init => ({ x: Math.random() * W, y: init ? Math.random() * H : H + 14, s: 3.2 + Math.random() * 3.4, vy: .12 + Math.random() * .3, vx: (Math.random() - .5) * .18, rot: Math.random() * 6.28, vr: (Math.random() - .5) * .012, a: .1 + Math.random() * .16, warm: Math.random() < .5 });
  function size() {
    const dpr = Math.min(2, window.devicePixelRatio || 1); W = cv.clientWidth; H = cv.clientHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(26, W * H / 11000)); while (parts.length < n) parts.push(spawn(true)); parts.length = n;
  }
  function bean(p) {
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = p.a;
    ctx.fillStyle = p.warm ? '#f28a3e' : '#f4e8dc';
    ctx.beginPath(); ctx.ellipse(0, 0, p.s * 1.35, p.s, 0, 0, 6.283); ctx.fill();
    ctx.strokeStyle = '#3b3d40'; ctx.lineWidth = Math.max(.8, p.s * .22); ctx.globalAlpha = p.a * 1.2;
    ctx.beginPath(); ctx.moveTo(-p.s * 1.1, 0); ctx.bezierCurveTo(-p.s * .4, -p.s * .5, p.s * .4, p.s * .5, p.s * 1.1, 0); ctx.stroke();
    ctx.restore();
  }
  function draw(step) {
    ctx.clearRect(0, 0, W, H);
    for (const p of parts) {
      if (step) { p.y -= p.vy; p.x += p.vx; p.rot += p.vr; }
      if (p.y < -16) Object.assign(p, spawn(false));
      bean(p);
    }
  }
  function frame() { draw(true); raf = requestAnimationFrame(frame); }
  function start() { if (running || reduced) return; running = true; raf = requestAnimationFrame(frame); }
  function stop() { running = false; cancelAnimationFrame(raf); }
  size(); draw();
  if ('ResizeObserver' in window) new ResizeObserver(() => { size(); if (!running) draw(); }).observe(cv);   // el rótulo cambia de alto al pintar los locales o cambiar de idioma
  if ('IntersectionObserver' in window) new IntersectionObserver(es => { (es[0].isIntersecting && !document.hidden) ? start() : stop(); }).observe(cv); else start();
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else if (cv.getBoundingClientRect().bottom > 0) start(); });
  return { size: () => { size(); if (!running) draw(); } };
})();

/* =====================================================================
   CARTA · Kaldi's Coffee Bean y +KFE
   Arranque: carga los datos (data/*.json), pinta la carta y atiende los clics.
   Cada parte está en su módulo:
     state.js      datos, idioma, textos, precios y filtro de alérgenos
     menu.js       secciones y productos          header.js   cabecera, banderas y tema
     dish.js       ficha del producto             allergies.js  filtro de alérgenos
     search.js     buscador                       surprise.js   «Elige por mí»
     sheets.js     hojas (ventanas desde abajo)   nav.js      barra de secciones
     art.js        dibujos de los productos       i18n/       textos de la interfaz por idioma
   ===================================================================== */
import { $, $$, esc, copyText, toast } from './utils.js';
import { S, INFO, L, t, savePrefs, loadData } from './state.js';
import { ic } from './icons.js';
import { renderMenu, renderNav, renderFoot, applyFilters } from './menu.js';
import { measure, moveInd, spy, stuck, goTo, refreshSections } from './nav.js';
import { stack, closeTop, enableDrag } from './sheets.js';
import { openDish } from './dish.js';
import { openAllergies } from './allergies.js';
import { openSearch } from './search.js';
import { openSurprise } from './surprise.js';
import { renderFlags, renderShops, fitMarks, updThemeBtn, toggleTheme, beans } from './header.js';

/* ---------- Pintar todo (al arrancar y al cambiar de idioma) ---------- */
function greet() { const h = new Date().getHours(); return t('greet')[h >= 6 && h < 13 ? 0 : h >= 13 && h < 20 ? 1 : 2]; }
/* Textos fijos de la página (botones, etiquetas), que no dependen de los datos */
function renderTexts() {
  document.documentElement.lang = S.lang;
  $$('[data-t]').forEach(el => { el.textContent = t(el.dataset.t); });
  $$('[data-t-aria]').forEach(el => el.setAttribute('aria-label', t(el.dataset.tAria)));
  $$('[data-lang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === S.lang)));
  updThemeBtn();
}
function renderAll() {
  renderTexts();
  $('#hoursLine').hidden = !INFO.hours;
  if (INFO.hours) $('#greetHours').textContent = `${greet()} · ${L(INFO.hours)}`;
  renderShops();
  renderNav(); renderMenu(); renderFoot();
  refreshSections();
  applyFilters(); updThemeBtn(); measure();
  requestAnimationFrame(() => { spy(true); stuck(); });
}
function setLang(l) { if (l === S.lang) return; S.lang = l; savePrefs(); renderAll(); }

/* ---------- Clics ---------- */
document.addEventListener('click', e => {
  const tg = e.target;
  const go = tg.closest('[data-go]'); if (go) { goTo(go.dataset.go); return; }
  const op = tg.closest('[data-open]'); if (op) { openDish(op.dataset.open); return; }
  if (tg.closest('[data-close]')) { if (stack.length) closeTop(); return; }
  const lg = tg.closest('[data-lang]'); if (lg) { setLang(lg.dataset.lang); return; }
  if (tg.closest('#themeBtn')) { toggleTheme(); return; }
  if (tg.closest('#searchBtn')) { openSearch(); return; }
  if (tg.closest('#filterBtn') || tg.closest('#allergyBtn')) { openAllergies(); return; }
  if (tg.closest('#surpriseBtn')) { openSurprise(); return; }
  if (tg.closest('#reload')) { location.reload(); return; }
  if (tg.closest('#wifiCopy') && INFO.wifi) { const p = INFO.wifi.pass; copyText(p).then(ok => toast(ok ? t('copied') : t('copyFail', p))); }
});

/* ---------- Arranque ---------- */
async function boot() {
  $$('[data-ic]').forEach(el => { el.outerHTML = ic(el.dataset.ic); });
  renderFlags(); renderTexts();
  try { await loadData(); }
  catch (err) {
    console.error(err);
    $('.cta').hidden = true; $('.nav-tools').hidden = true;
    $('#menu').innerHTML = `<p class="load-error">${esc(t('loadError'))}<button type="button" class="btn btn-primary" id="reload">${esc(t('retry'))}</button></p>`;
    return;
  }
  renderAll();
  $$('.sheet').forEach(enableDrag);
  let rz = 0;
  window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { fitMarks(); measure(); moveInd(true); if (beans) beans.size(); }, 120); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { fitMarks(); measure(); moveInd(true); });
}
boot();

/* Alergias: filtro por alérgenos (si hay datos) o aviso para preguntar al personal */
import { $, $$, esc, haptic } from './utils.js';
import { S, DISHES, ALG_ON, t, algName, savePrefs, fits, filtersOn } from './state.js';
import { ic } from './icons.js';
import { ALG_ORDER, icAlg } from './allergens.js';
import { openSheet } from './sheets.js';
import { applyFilters } from './menu.js';

export function openAllergies() { ALG_ON ? openFilters() : openAllergyInfo(); }
function openAllergyInfo() {
  $('#filterBody').innerHTML = `<h2 class="sh-title" id="filterTitle">${esc(t('algInfoT'))}</h2><p class="sh-sub">${esc(t('algInfo'))}</p>` +
    `<p class="note">${ic('info')}<span>${esc(t('algInfoExtra'))}</span></p>`;
  $('#filterFoot').innerHTML = `<button type="button" class="btn btn-primary grow" data-close>${esc(t('understood'))}</button>`;
  openSheet('sh-filter');
}
function openFilters() {
  $('#filterBody').innerHTML = `<h2 class="sh-title" id="filterTitle">${esc(t('filtersT'))}</h2><p class="sh-sub">${esc(t('filtersSub'))}</p>` +
    `<section class="fgroup"><h3 class="h3">${esc(t('allergyH'))}</h3><div class="fchips">${ALG_ORDER.map(a => `<button type="button" class="fchip" data-alg="${a}" aria-pressed="${S.alg.has(a)}">${icAlg(a)}${esc(algName(a))}</button>`).join('')}</div></section>` +
    `<p class="disclaimer">${ic('alert')}<span>${esc(t('disclaimer'))}</span></p>`;
  $('#filterFoot').innerHTML = `<button type="button" class="btn btn-ghost" id="fClear">${esc(t('clear'))}</button><button type="button" class="btn btn-primary grow" data-close id="fShow"></button>`;
  updFilterFoot();
  openSheet('sh-filter');
}
function updFilterFoot() {
  const n = DISHES.filter(d => fits(d)).length, s = $('#fShow'), c = $('#fClear');
  if (s) s.textContent = t('showN', n);
  if (c) c.disabled = !filtersOn();
}
function clearFilters() { S.alg.clear(); savePrefs(); applyFilters(); }
$('#sh-filter').addEventListener('click', e => {
  const a = e.target.closest('[data-alg]');
  if (a) { const k = a.dataset.alg; S.alg.has(k) ? S.alg.delete(k) : S.alg.add(k); a.setAttribute('aria-pressed', String(S.alg.has(k))); }
  else if (e.target.closest('#fClear')) { clearFilters(); $$('[data-alg]', e.currentTarget).forEach(b => b.setAttribute('aria-pressed', 'false')); updFilterFoot(); return; }
  else return;
  haptic(6); savePrefs(); applyFilters(); updFilterFoot();
});

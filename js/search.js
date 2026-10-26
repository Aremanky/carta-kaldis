/* Buscador: sin tildes ni mayúsculas, en el nombre (en cualquier idioma), descripción, sección y opciones */
import { $, esc } from './utils.js';
import { S, DISHES, CATS, CAT, L, t, priceCell, firstPrice, fits, filtersOn } from './state.js';
import { dishArt } from './art.js';
import { openSheet, closeTop } from './sheets.js';
import { goTo } from './nav.js';

const normC = ch => ch.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const norm = s => [...String(s)].map(normC).join('');
function hl(text, terms) {
  const chars = [...text]; if (!terms.length) return esc(text);
  const map = [], flat = chars.map((ch, i) => { const n = normC(ch); for (let k = 0; k < n.length; k++) map.push(i); return n; }).join('');
  const on = new Array(chars.length).fill(false);
  terms.forEach(term => { let from = 0, at; while (term && (at = flat.indexOf(term, from)) > -1) { for (let j = at; j < at + term.length; j++) on[map[j]] = true; from = at + term.length; } });
  let out = '', open = false;
  chars.forEach((ch, i) => { if (on[i] && !open) { out += '<mark>'; open = true; } if (!on[i] && open) { out += '</mark>'; open = false; } out += esc(ch); });
  return out + (open ? '</mark>' : '');
}
const HAY = {};
function hay(d) {
  const k = d.id + S.lang; if (HAY[k]) return HAY[k];
  const opts = (d.opts || []).flatMap(o => [...(o.list.es || []), ...(o.list[S.lang] || [])]);
  return (HAY[k] = norm([d.name.es, d.name.en, d.name.fr || '', L(d.desc), L(CAT[d.cat].name), d.g ? L(d.g) : '', ...d.prices.map(v => L(v.l)), ...opts].join(' ')));
}
function resHTML(d, terms) {
  const ok = fits(d), v = firstPrice(d) || d.prices[0];
  return `<li class="sres${d.soldOut ? ' out' : ''}"><button type="button" class="hit" data-open="${d.id}" aria-label="${esc(L(d.name))}"></button><div class="art">${dishArt(d)}</div>` +
    `<div><h4>${hl(L(d.name), terms)}</h4><p>${esc(d.g ? L(d.g) : L(CAT[d.cat].name))}${!ok ? ` · <span class="warn-txt">${esc(t('notForYou'))}</span>` : (filtersOn() && d.allergens == null ? ` · <span class="warn-txt">${esc(t('askAlg'))}</span>` : '')}${d.soldOut ? ` · ${esc(t('soldOut'))}` : ''}</p></div>` +
    `<span class="pv">${d.prices.length > 1 && v.l ? `<small>${esc(L(v.l))}</small>` : ''}${priceCell(v)}</span></li>`;
}
function renderSearch(q) {
  const terms = norm(q.trim()).split(/\s+/).filter(Boolean), body = $('#searchBody');
  if (!terms.length) {
    body.innerHTML = `<h3 class="h3 s-h">${esc(t('searchGo'))}</h3><div class="jumps">${CATS.map(c => `<button type="button" class="jump" data-jump="${c.id}">${esc(L(c.short || c.name))}</button>`).join('')}</div>`;
    return;
  }
  const res = DISHES.filter(d => { const h = hay(d); return terms.every(x => h.includes(x)); });
  body.innerHTML = res.length ? `<ul class="slist">${res.map(d => resHTML(d, terms)).join('')}</ul>` : `<p class="s-empty">${esc(t('noResults', q.trim()))}</p>`;
}
export function openSearch() {
  const q = $('#q'); q.value = ''; q.placeholder = t('searchPh'); renderSearch('');
  openSheet('sh-search'); setTimeout(() => { try { q.focus(); } catch (e) { } }, 90);
}
$('#q').addEventListener('input', e => renderSearch(e.target.value));
$('#sh-search').addEventListener('click', e => {
  const j = e.target.closest('[data-jump]'); if (!j) return;
  const id = j.dataset.jump; closeTop(); setTimeout(() => goTo(id), 30);
});

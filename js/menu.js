/* Pintar la carta: barra de secciones, secciones con sus productos, tipos de pan y pie */
import { $, $$, esc } from './utils.js';
import { DISHES, CATS, BY, INFO, ALG_ON, L, t, algName, priceCell, priceText, fits, filtersOn, filterCount } from './state.js';
import { ic, TAG_IC } from './icons.js';
import { ALG_ORDER, icAlg } from './allergens.js';
import { dishArt } from './art.js';
import { measure, spy } from './nav.js';

const tagIcons = d => d.tags.filter(x => x !== 'new' && TAG_IC[x]).map(x => `<span class="t-${x}" role="img" aria-label="${esc(t(x + 'T'))}" title="${esc(t(x + 'T'))}">${ic(TAG_IC[x])}</span>`).join('');
const pricesHTML = d => d.prices.map(v => `<span class="pv">${v.l ? `<small>${esc(L(v.l))}</small>` : ''}${priceCell(v)}</span>`).join('');

/* Un producto: fila (lista), tarjeta (pizarra de especiales) o baldosa (bowls) */
function itemHTML(d, kind) {
  const nm = esc(L(d.name)), desc = L(d.desc);
  const cls = kind === 'card' ? 'card' : kind === 'tile' ? 'tile' : 'dish';
  return `<li class="${cls}${d.soldOut ? ' out' : ''}" data-id="${d.id}">` +
    `<button type="button" class="hit" data-open="${d.id}" aria-label="${nm}"></button>` +
    `<div class="art">${dishArt(d, kind === 'card' || kind === 'tile')}${d.soldOut ? `<span class="stamp">${esc(t('soldOut'))}</span>` : ''}</div>` +
    `<div class="dbody">${d.tags.includes('new') ? `<span class="kick">${esc(t('newT'))}</span>` : ''}` +
    `<h3 class="dname">${nm}${d.tags.some(x => x !== 'new' && TAG_IC[x]) ? `<span class="dtags">${tagIcons(d)}</span>` : ''}</h3>` +
    (ALG_ON && d.allergens == null ? `<span class="ask">${ic('info')}${esc(t('askAlg'))}</span>` : '') +
    (desc ? `<p class="ddesc">${esc(desc)}</p>` : '') +
    `<div class="dfoot"><div class="prices">${pricesHTML(d)}</div></div></div></li>`;
}

/* Tipos de pan (cabecera de Desayunos): sin suplemento / con suplemento */
function breadsHTML(b) {
  const chips = arr => `<ul class="bchips">${arr.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`, note = L(b.note);
  return `<div class="breads">${ic('bread', 'bdeco')}<p class="breads-h">${ic('bread')}<span>${esc(t('breadH'))}</span></p>` +
    `<div class="bgrp"><p class="bgrp-h">${esc(t('breadFree'))}</p>${chips(L(b.free))}</div>` +
    `<div class="bgrp extra"><p class="bgrp-h"><span>${esc(t('breadExtra'))}</span><span class="bplus">${esc(t('breadPlus', priceText(b.plus[0]), priceText(b.plus[1])))}</span></p>${chips(L(b.extra))}</div>` +
    (note ? `<p class="bnote">${esc(note)}</p>` : '') + '</div>';
}

export function renderMenu() {
  $('#menu').innerHTML = CATS.map(c => {
    const items = DISHES.filter(d => d.cat === c.id), lay = c.layout || 'list';
    const kind = lay === 'carousel' ? 'card' : lay === 'grid' ? 'tile' : 'row';
    const ul = lay === 'carousel' ? 'carousel' : lay === 'grid' ? 'grid' : 'list' + (lay === 'compact' ? ' compact' : '');
    let g = null;
    const rows = items.map(d => {
      let head = '';
      const gk = d.g ? d.g.es : null;
      if (kind === 'row' && gk && gk !== g) head = `<li class="grp"><h3 class="grp-h">${esc(L(d.g))}</h3></li>`;
      g = gk;
      return head + itemHTML(d, kind);
    }).join('');
    const intro = L(c.intro);
    return `<section class="sec${lay === 'carousel' ? ' pizarra' : ''}" id="s-${c.id}" data-cat="${c.id}" aria-labelledby="h-${c.id}">` +
      `<header class="sec-head"><p class="sec-meta" data-count></p><h2 class="sec-title" id="h-${c.id}">${esc(L(c.name))}</h2>${intro ? `<p class="sec-intro">${esc(intro)}</p>` : ''}${c.breads ? breadsHTML(c.breads) : ''}</header>` +
      `<ul class="${ul}">${rows}</ul><p class="sec-empty">${esc(t('noneHere'))}</p></section>`;
  }).join('');
}

export function renderNav() {
  $('#pills').innerHTML = CATS.map(c => `<button type="button" class="pill" data-go="${c.id}">${esc(L(c.short || c.name))}</button>`).join('') + '<span class="pill-ind" aria-hidden="true"></span>';
}

export function renderFoot() {
  const r = INFO, info = [];
  if (r.hours) info.push(`<li>${ic('clock')}<span><small>${esc(t('hoursH'))}</small>${esc(L(r.hours))}</span></li>`);
  if (r.address) info.push(`<li>${ic('pin')}<span><small>${esc(t('addrH'))}</small>${esc(r.address)}</span></li>`);
  if (r.phone) info.push(`<li>${ic('phone')}<span><small>${esc(t('phoneH'))}</small><span class="sel">${esc(r.phone)}</span></span></li>`);
  const a = (info.length ? `<ul class="info">${info.join('')}</ul>` : '') +
    (r.wifi ? `<div class="wifi">${ic('wifi')}<div class="ssid"><small>${esc(t('wifi'))}</small><b>${esc(r.wifi.ssid)}</b><code class="sel">${esc(r.wifi.pass)}</code></div><button type="button" class="btn btn-ghost sm" id="wifiCopy">${ic('copy')}${esc(t('copyPass'))}</button></div>` : '');
  const b = (ALG_ON
      ? `<details class="legend"><summary>${esc(t('legend'))}${ic('chevDown')}</summary><div class="legend-grid">${ALG_ORDER.map(x => `<span>${icAlg(x)}${esc(algName(x))}</span>`).join('')}</div></details><p class="legal">${esc(t('legalAlg'))}</p>`
      : `<p class="foot-alg">${ic('info')}<span>${esc(t('algFoot'))}</span></p>`) +
    (r.note ? `<p class="legal">${esc(L(r.note))}</p>` : '');
  $('#foot').classList.toggle('one', !a);   // sin horario, dirección ni wifi: una sola columna
  $('#foot').innerHTML = (a ? `<div class="f-a">${a}</div>` : '') + `<div class="f-b">${b}</div>`;
}

/* Oculta lo que no encaja con las alergias marcadas y actualiza contadores e insignias */
export function applyFilters() {
  $$('#menu [data-id]').forEach(el => el.classList.toggle('filtered', !fits(BY[el.dataset.id])));
  $$('#menu .grp').forEach(gr => {
    let n = gr.nextElementSibling, any = false;
    while (n && !n.classList.contains('grp')) { if (!n.classList.contains('filtered')) { any = true; break; } n = n.nextElementSibling; }
    gr.classList.toggle('filtered', !any);
  });
  $$('#menu .sec').forEach(sec => {
    const items = $$('[data-id]', sec), vis = items.filter(x => !x.classList.contains('filtered')).length;
    sec.classList.toggle('empty', vis === 0);
    $('[data-count]', sec).textContent = vis !== items.length ? t('countOf', vis, items.length) : t('count', items.length);
    const pill = $(`.pill[data-go="${sec.dataset.cat}"]`); if (pill) pill.classList.toggle('dim', vis === 0);
  });
  const on = filtersOn(), n = filterCount();
  $('#filterBtn').hidden = !ALG_ON;
  $('#fbadge').hidden = !on; $('#fbadge').textContent = n;
  $('#fdot').hidden = !on; $('#fdot').textContent = n;
  document.body.classList.toggle('filtering', on);
  requestAnimationFrame(() => { measure(); spy(true); });
}

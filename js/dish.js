/* Ficha del producto: foto o dibujo (que se puede girar), precios, opciones y alérgenos */
import { $, esc, reduced } from './utils.js';
import { S, BY, ALG_ON, L, t, algName, listFmt, priceCell } from './state.js';
import { ic, TAG_IC } from './icons.js';
import { icAlg } from './allergens.js';
import { dishArt, steamSVG } from './art.js';
import { openSheet, whenClosed } from './sheets.js';

let spinStop = null;
whenClosed('sh-dish', () => { if (spinStop) spinStop(); });

export function openDish(id) {
  const d = BY[id]; if (!d) return;
  const hits = ALG_ON && d.allergens ? d.allergens.filter(a => S.alg.has(a)) : [];
  const tags = d.tags.filter(x => TAG_IC[x]);
  const desc = L(d.desc), single = d.prices.length === 1;
  const stamp = d.soldOut ? `<span class="stamp">${esc(t('soldOut'))}</span>` : '';
  $('#dishBody').innerHTML =
    `<div class="d-media">${d.img
      ? `<div class="d-art photo" id="dArt"><img src="${esc(d.img)}" alt="" decoding="async">${stamp}</div>`
      : `<div class="d-art" id="dArt"><div class="enter"><div class="spin" id="spin">${dishArt(d, true)}</div></div>${d.hot && !d.soldOut ? steamSVG() : ''}${stamp}</div>`}</div><div class="d-info">` +
    (tags.length ? `<div class="d-tags">${tags.map(x => `<span class="tag t-${x}">${ic(TAG_IC[x])}<span>${esc(t(x + 'T'))}</span></span>`).join('')}</div>` : '') +
    `<div class="d-head"><h2 class="d-name" id="dishName">${esc(L(d.name))}</h2>${single ? `<p class="d-price">${d.prices[0].l ? `<small>${esc(L(d.prices[0].l))}</small>` : ''}${priceCell(d.prices[0])}</p>` : ''}</div>` +
    (desc ? `<p class="d-desc">${esc(desc)}</p>` : '') +
    (hits.length ? `<div class="d-warn" role="note">${ic('alert')}<span>${esc(t('warnAlg', listFmt(hits.map(a => algName(a).toLowerCase())), hits.length))}</span></div>` : '') +
    (!single ? `<section class="d-sec"><h3 class="h3">${esc(t('pricesH'))}</h3><div class="prs">${d.prices.map(v => `<div class="pr"><small>${esc(L(v.l))}</small>${priceCell(v)}</div>`).join('')}</div></section>` : '') +
    (d.opts || []).map(o => `<section class="d-sec"><h3 class="h3">${esc(L(o.h))}</h3><div class="ochips">${L(o.list).map(x => `<span class="ochip">${esc(x)}</span>`).join('')}</div></section>`).join('') +
    (ALG_ON
      ? `<section class="d-sec"><h3 class="h3">${esc(t('allergensH'))}</h3>${d.allergens == null ? `<p class="d-alg">${ic('info')}<span>${esc(t('algUnknown'))}</span></p>` : d.allergens.length ? `<div class="achips">${d.allergens.map(a => `<span class="achip${S.alg.has(a) ? ' on' : ''}">${icAlg(a)}${esc(algName(a))}</span>`).join('')}</div>` : `<p class="muted">${esc(t('noAlg'))}</p>`}</section>`
      : `<p class="d-alg">${ic('info')}<span>${esc(t('algAsk'))}</span></p>`) +
    (d.pair ? `<section class="d-sec"><div class="pair">${ic('cup')}<div><small>${esc(t('pairH'))}</small><b>${esc(L(d.pair))}</b></div></div></section>` : '') + '</div>';
  openSheet('sh-dish');
  initSpin();
}

/* El plato dibujado se puede girar con el dedo y sigue girando un poco por inercia */
function initSpin() {
  const el = $('#dArt'), sp = $('#spin'); spinStop = null;
  if (!el || !sp || reduced) return;
  let ang = 0, vel = 0, drag = false, lx = 0, lt = 0, raf = 0;
  const apply = () => { sp.style.transform = `rotate(${ang}deg)`; };
  const tick = () => { if (drag) return; vel *= .95; ang += vel; apply(); if (Math.abs(vel) > .05) raf = requestAnimationFrame(tick); };
  el.onpointerdown = e => { if (e.pointerType === 'mouse' && e.button !== 0) return; drag = true; lx = e.clientX; lt = performance.now(); vel = 0; cancelAnimationFrame(raf); try { el.setPointerCapture(e.pointerId); } catch (_) { } };
  el.onpointermove = e => { if (!drag) return; const now = performance.now(), dx = e.clientX - lx; ang += dx * .6; vel = dx * .6 / Math.max(8, now - lt) * 16; lx = e.clientX; lt = now; apply(); };
  const up = () => { if (!drag) return; drag = false; raf = requestAnimationFrame(tick); };
  el.onpointerup = up; el.onpointercancel = up;
  spinStop = () => cancelAnimationFrame(raf);
}

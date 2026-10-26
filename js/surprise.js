/* «Elige por mí»: una bebida, algo de comer y un dulce al azar, según la hora y las alergias */
import { $, $$, esc, reduced, haptic } from './utils.js';
import { DISHES, L, t, priceHTML, firstPrice, safeFor, filtersOn } from './state.js';
import { ic } from './icons.js';
import { dishArt } from './art.js';
import { openSheet } from './sheets.js';
import { openDish } from './dish.js';

let COURSES = [], sur = [null, null, null];
function pickCourses() {
  const h = new Date().getHours(), morning = h >= 6 && h < 13;
  return [morning ? ['cafes', 'chocolate'] : ['cafes', 'chocolate', 'refrescos'],
    morning ? ['desayunos', 'especiales', 'bowls'] : ['picar', 'montaditos', 'bocadillos'],
    ['dulces', 'helados']];
}
const eligible = i => DISHES.filter(d => COURSES[i].includes(d.cat) && !d.soldOut && safeFor(d) && firstPrice(d) && !(i === 2 && d.savory));
function paintSlot(i) {
  const slot = $$('#surBody .slot')[i], d = sur[i]; if (!slot) return;
  const v = d && firstPrice(d);
  $('.art', slot).innerHTML = d ? dishArt(d) : '';
  $('h4', slot).textContent = d ? L(d.name) : t('noneFit');
  $('.pv', slot).innerHTML = v ? `${v.l ? `<small>${esc(L(v.l))}</small>` : ''}<b>${priceHTML(v.p)}</b>` : '';
  slot.dataset.dish = d ? d.id : '';
  const tot = $('#surTotal'); if (tot) tot.innerHTML = priceHTML(sur.reduce((s, x) => s + (x ? firstPrice(x).p : 0), 0));
}
function rollSlot(i) {
  const pool = eligible(i), slot = $$('#surBody .slot')[i]; if (!slot) return;
  if (!pool.length) { sur[i] = null; paintSlot(i); return; }
  let pick = pool[Math.floor(Math.random() * pool.length)];
  if (pool.length > 1 && sur[i] && pick.id === sur[i].id) pick = pool[(pool.indexOf(pick) + 1) % pool.length];
  if (reduced) { sur[i] = pick; paintSlot(i); return; }
  slot.classList.add('rolling'); slot.classList.remove('land');
  const h = $('h4', slot); let n = 0; const steps = 9 + i * 4;
  const step = () => {
    if (n++ < steps) { h.textContent = L(pool[Math.floor(Math.random() * pool.length)].name); setTimeout(step, 40 + n * 9); return; }
    slot.classList.remove('rolling'); sur[i] = pick; paintSlot(i); void slot.offsetWidth; slot.classList.add('land'); haptic(8);
  };
  step();
}
export function openSurprise() {
  COURSES = pickCourses();
  $('#surBody').innerHTML = `<h2 class="sh-title" id="surTitle">${esc(t('surpriseT'))}</h2><p class="sh-sub">${esc(filtersOn() ? t('surpriseSubF') : t('surpriseSub'))}</p>` +
    `<div class="slots">${t('courses').map((c, i) => `<div class="slot"><div class="art"></div><div class="slot-txt"><small>${esc(c)}</small><h4>…</h4></div><div class="slot-end"><span class="pv"></span><button type="button" class="reroll" data-roll="${i}" aria-label="${esc(t('rerollOne'))}">${ic('dice')}</button></div></div>`).join('')}</div>` +
    `<div class="s-total"><span>${esc(t('total'))}</span><b id="surTotal"></b></div>`;
  $('#surFoot').innerHTML = `<button type="button" class="btn btn-primary grow" id="surAgain">${ic('dice')}${esc(t('again'))}</button>`;
  sur = [null, null, null];
  openSheet('sh-surprise');
  [0, 1, 2].forEach(i => rollSlot(i));
}
$('#sh-surprise').addEventListener('click', e => {
  const r = e.target.closest('[data-roll]'); if (r) { rollSlot(+r.dataset.roll); return; }
  if (e.target.closest('#surAgain')) { [0, 1, 2].forEach(i => rollSlot(i)); return; }
  const s = e.target.closest('.slot'); if (s && s.dataset.dish && !s.classList.contains('rolling')) openDish(s.dataset.dish);
});

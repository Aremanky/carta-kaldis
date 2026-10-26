/* Estado de la carta: datos cargados, idioma, tema, alergias marcadas, textos y precios */
import { esc, store, round2 } from './utils.js';
import { LANGS, LANG } from './i18n/index.js';
import { ALG } from './allergens.js';

/* ---------- Preferencias guardadas en el móvil ---------- */
const KEY = 'kaldis.v1.';
const params = new URLSearchParams(location.search);
const prefs = store.get(KEY + 'prefs', {}) || {};
const CODES = LANGS.map(l => l.code);
function pickLang() {
  const q = (params.get('lang') || '').slice(0, 2).toLowerCase(); if (CODES.includes(q)) return q;
  if (CODES.includes(prefs.lang)) return prefs.lang;
  const n = (navigator.language || 'es').slice(0, 2).toLowerCase();
  return ['es', 'ca', 'gl', 'eu'].includes(n) ? 'es' : CODES.includes(n) ? n : 'en';
}
export const S = { lang: pickLang(), theme: prefs.theme || null, alg: new Set() };
export const savePrefs = () => store.set(KEY + 'prefs', { lang: S.lang, theme: S.theme, alg: [...S.alg] });

/* ---------- Datos (data/carta.json y data/locales.json) ---------- */
export let DISHES = [], CATS = [], VENUES = [], INFO = {}, ALG_ON = false;
export const BY = {}, CAT = {};

const FORMATO = { carrusel: 'carousel', cuadricula: 'grid', compacta: 'compact' };
const getJSON = url => fetch(url, { cache: 'no-cache' }).then(r => { if (!r.ok) throw new Error(url + ' ' + r.status); return r.json(); });

/* Los JSON van en castellano para que sean fáciles de editar; aquí se pasan a la forma que usa el código */
function fromJSON(carta, locales) {
  CATS = carta.secciones.map(s => ({
    id: s.id, name: s.nombre, short: s.corto, intro: s.intro, layout: FORMATO[s.formato],
    breads: s.panes && { free: s.panes.sinSuplemento, extra: s.panes.conSuplemento, plus: [s.panes.suplemento.media, s.panes.suplemento.entera], note: s.panes.nota }
  }));
  DISHES = carta.productos.map(p => ({
    id: p.id, cat: p.seccion, g: p.grupo, name: p.nombre, desc: p.descripcion || null,
    prices: p.precios.map(v => ({ p: v.precio ?? null, l: v.etiqueta })),
    allergens: p.alergenos === undefined ? null : p.alergenos,      // null = sin información (nunca «sin alérgenos»)
    img: p.foto ? `fotos/${p.foto}.webp` : undefined, thumb: p.foto ? `fotos/${p.foto}-t.webp` : undefined,
    hot: !!p.caliente, savory: !!p.salado, soldOut: !!p.agotado, tags: p.etiquetas || [],
    opts: p.opciones && p.opciones.map(o => ({ h: o.titulo, list: o.lista })), pair: p.maridaje, art: p.dibujo
  }));
  VENUES = locales.locales.map(v => ({ id: v.id, name: v.nombre, logo: v.logo, tagline: v.lema,
    mark: v.rotulo.map(r => ({ t: r.texto, w: r.grosor, track: r.espaciado })) }));
  const i = locales.info || {};
  INFO = { hours: i.horario, address: i.direccion, phone: i.telefono, note: i.nota, wifi: i.wifi && { ssid: i.wifi.red, pass: i.wifi.clave } };
  ALG_ON = !!carta.conAlergenos;
  DISHES.forEach(d => { BY[d.id] = d; });
  CATS.forEach(c => { CAT[c.id] = c; });
  S.alg = new Set(ALG_ON ? (prefs.alg || []).filter(a => ALG[a]) : []);
}
/* index.html ya pide los JSON mientras se descargan los módulos (window.__carta); si no, se piden aquí */
export async function loadData() {
  const pending = window.__carta; window.__carta = null;
  const [carta, locales] = await (pending || Promise.all([getJSON('data/carta.json'), getJSON('data/locales.json')]))
    .catch(() => Promise.all([getJSON('data/carta.json'), getJSON('data/locales.json')]));
  fromJSON(carta, locales);
}

/* ---------- Textos ---------- */
/* Texto de la carta en el idioma actual ({ es, en, fr } o lista), con la tipografía del idioma */
export const L = o => {
  if (o == null) return '';
  if (typeof o === 'string') return o;
  const v = o[S.lang] ?? o.es ?? '', ty = LANG[S.lang].typo;
  return ty ? (Array.isArray(v) ? v.map(ty) : ty(v)) : v;
};
/* Texto de la interfaz (js/i18n) */
export const t = (k, ...a) => { const v = LANG[S.lang].ui[k] ?? LANG.es.ui[k]; return typeof v === 'function' ? v(...a) : v; };
export const algName = (a, lang = S.lang) => ALG[a][lang] || ALG[a].es;
export const listFmt = (arr, lang = S.lang) => { try { return new Intl.ListFormat(lang, { style: 'long', type: 'conjunction' }).format(arr); } catch (e) { return arr.join(', '); } };

/* ---------- Precios ---------- */
const NF = {};
const nf = lang => NF[lang] || (NF[lang] = new Intl.NumberFormat(LANG[lang].locale, { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }));
export function priceHTML(n, lang = S.lang) {
  return nf(lang).formatToParts(round2(n)).map(p => p.type === 'currency' ? `<i class="cur">${p.value}</i>` : (p.type === 'literal' ? '' : esc(p.value))).join('');
}
export const priceText = (n, lang = S.lang) => nf(lang).format(round2(n));
export const priceCell = v => v.p == null ? `<b class="pm">${esc(t('market'))}</b>` : `<b>${priceHTML(v.p)}</b>`;
export const firstPrice = d => d.prices.find(v => v.p != null);

/* ---------- Filtro de alérgenos ---------- */
/* Se oculta solo lo que el local declara con el alérgeno marcado. Lo que no tiene información
   se queda en la carta con el aviso «Consultar alérgenos». */
export function fits(d) {
  if (!ALG_ON || !S.alg.size || d.allergens == null) return true;
  return !d.allergens.some(a => S.alg.has(a));
}
export const safeFor = d => !S.alg.size || (d.allergens != null && !d.allergens.some(a => S.alg.has(a)));   // para sugerencias al azar
export const filtersOn = () => ALG_ON && S.alg.size > 0;
export const filterCount = () => S.alg.size;

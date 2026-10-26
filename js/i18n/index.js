/* Idiomas de la carta. Para añadir uno: crea su archivo junto a estos (copia es.js),
   impórtalo aquí y añade su traducción ("xx": "...") a los textos de data/carta.json y data/locales.json. */
import es from './es.js';
import en from './en.js';
import fr from './fr.js';

export const LANGS = [es, en, fr];                                   // en este orden salen las banderas
export const LANG = Object.fromEntries(LANGS.map(l => [l.code, l]));

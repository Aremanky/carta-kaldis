/* Français */
/* Tipografía francesa: espacio irrompible antes de « : ; ! ? » y € y dentro de las comillas.
   Se aplica a los textos de la interfaz y a los de la carta (data/carta.json) al pintarlos. */
const typo = s => typeof s === 'string' ? s.replace(/ ([:;!?»€])/g, '\u00a0$1').replace(/« /g, '«\u00a0') : s;

const ui = {
  greet: ['Bonjour', 'Bonjour', 'Bonsoir'],
  lang: 'Langue', sections: 'Rubriques de la carte', searchShort: 'Rechercher',
  surprise: 'Choisir pour moi', allergiesBtn: 'Allergies',
  search: 'Rechercher dans la carte', searchPh: 'Produit ou ingrédient', searchGo: 'Aller à une rubrique',
  noResults: q => `Aucun résultat pour « ${q} ». Essayez un autre mot.`,
  notForYou: 'Ne correspond pas à vos filtres',
  filtersT: 'Allergies et intolérances',
  filtersSub: 'Cochez ce que vous ne pouvez pas consommer : nous masquerons les produits qui en contiennent.',
  allergyH: 'J’ai une allergie ou une intolérance à',
  clear: 'Effacer les filtres',
  showN: n => n === 1 ? 'Voir 1 produit' : `Voir ${n} produits`,
  askAlg: 'Allergènes : nous consulter',
  disclaimer: 'Informations sur les allergènes fournies par l’établissement. Les produits pour lesquels nous n’avons pas d’information ne sont pas masqués : ils portent la mention « Allergènes : nous consulter ». En cas d’allergie, prévenez toujours notre personnel.',
  algUnknown: 'Nous n’avons pas d’information sur les allergènes de ce produit. Renseignez-vous auprès de notre personnel.',
  algInfoT: 'Allergies et intolérances',
  algInfo: 'Si vous avez une allergie ou une intolérance, signalez-le à notre personnel avant de commander : nous vous indiquerons les allergènes de chaque produit.',
  algInfoExtra: 'Pour les tartines, nous avons du pain sans gluten et du pain sans lactose. Nous avons aussi de la Cruzcampo sans gluten.',
  algAsk: 'Renseignez-vous auprès de notre personnel sur les allergènes de ce produit.',
  algFoot: 'Informations sur les allergènes fournies par l’établissement. En cas de doute, adressez-vous à notre personnel.',
  understood: 'Compris',
  chefT: 'Coup de cœur de la maison', vegT: 'Végétarien', veganT: 'Végan', spicyT: 'Épicé', nospicyT: 'Non épicé', newT: 'Nouveau', hotT: 'Servi chaud',
  soldOut: 'Épuisé', market: 'Prix du marché',
  allergensH: 'Allergènes', noAlg: 'Aucun allergène déclaré.', pairH: 'À accompagner de', pricesH: 'Prix',
  warnAlg: (x, n) => `Contient : ${x}, ${n > 1 ? 'qui figurent' : 'qui figure'} parmi vos allergies.`,
  count: n => n === 1 ? '1 produit' : `${n} produits`, countOf: (v, n) => `${v} sur ${n}`,
  noneHere: 'Rien dans cette rubrique ne correspond à vos filtres.',
  breadH: 'Types de pain', breadFree: 'Sans supplément', breadExtra: 'Avec supplément', breadPlus: (h, w) => `+${h} la demi-tartine · +${w} la tartine entière`,
  total: 'Total',
  surpriseT: 'Choisir pour moi', surpriseSub: 'Une boisson, quelque chose à manger et une douceur, au hasard. Si l’un d’eux ne vous tente pas, changez-le.',
  surpriseSubF: 'Au hasard, uniquement parmi ce qui convient à vos allergies.',
  courses: ['À boire', 'À manger', 'La douceur'], again: 'Relancer', rerollOne: 'Changer celui-ci', noneFit: 'Rien ne convient',
  hoursH: 'Horaires', addrH: 'Où nous trouver', phoneH: 'Téléphone', wifi: 'Wi-Fi', copyPass: 'Copier le mot de passe', copied: 'Mot de passe copié', copyFail: x => `Mot de passe : ${x}`,
  legend: 'Légende des allergènes', legalAlg: 'Informations sur les allergènes conformément au règlement (UE) n° 1169/2011.',
  heroH: x => `Carte de ${x}`,
  close: 'Fermer', toLight: 'Passer au thème clair', toDark: 'Passer au thème sombre',
  loadError: 'Impossible de charger la carte. Vérifiez votre connexion et réessayez.', retry: 'Réessayer',
};
for (const k of Object.keys(ui)) {
  const v = ui[k];
  ui[k] = typeof v === 'function' ? (...a) => typo(v(...a)) : Array.isArray(v) ? v.map(typo) : typo(v);
}

export default {
  code: 'fr', name: 'Français', locale: 'fr-FR', typo,
  flag: '<svg viewBox="0 0 30 20" aria-hidden="true" focusable="false"><rect width="30" height="20" fill="#fff"/><rect width="10" height="20" fill="#0055a4"/><rect x="20" width="10" height="20" fill="#ef4135"/></svg>',
  ui
};

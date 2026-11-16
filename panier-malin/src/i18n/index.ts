/**
 * Internationalisation minimale. Le français suisse est la langue par défaut ;
 * l'allemand et l'italien s'ajouteront en complétant `messages` (même clés).
 * Les formats (CHF, dates) sont gérés dans lib/money.ts et lib/dates.ts.
 */
export type Locale = 'fr-CH' | 'de-CH' | 'it-CH';

const frCH = {
  'app.name': 'Panier Malin',
  'app.tagline': 'Les actions des magasins suisses, comparées honnêtement.',
  'nav.home': 'Accueil',
  'nav.promotions': 'Promotions',
  'nav.compare': 'Comparer',
  'nav.list': 'Ma liste',
  'nav.basket': 'Mon panier',
  'nav.sources': 'Sources',
  'nav.admin': 'Administration',
  'demo.banner': 'Mode démonstration : magasins et prix fictifs, uniquement pour tester le site.',
  'demo.badge': 'Démo',
  'demo.enable': 'Afficher les données de démonstration',
  'demo.disable': 'Quitter le mode démo',
  'data.noneTitle': 'Aucune promotion vérifiée pour le moment',
  'data.noneText':
    'Les sources de données des enseignes sont en cours de vérification. Nous ne publions que des offres dont l’origine et l’exactitude sont contrôlées.',
} as const;

export type MessageKey = keyof typeof frCH;

const messages: Record<Locale, Partial<Record<MessageKey, string>>> = {
  'fr-CH': frCH,
  'de-CH': {},
  'it-CH': {},
};

let locale: Locale = 'fr-CH';

export function setLocale(next: Locale) {
  locale = next;
  document.documentElement.lang = next;
}

export function t(key: MessageKey): string {
  return messages[locale][key] ?? frCH[key];
}

/**
 * DONNÉES DE DÉMONSTRATION — FICTIVES.
 *
 * Ces données servent uniquement à tester l'interface. Les enseignes sont inventées
 * (« Magasin Démo A/B/C ») pour qu'aucun prix fictif ne soit jamais attribué à une
 * vraie enseigne. Elles ne sont affichées que si le visiteur active le mode démo,
 * et chaque carte porte alors le badge « Démo ».
 *
 * Ne jamais importer ce fichier dans un chemin de production (phase 2 : Supabase).
 */
import { addDays, todayInZurich } from '../../lib/dates';
import type { DealMechanic, Packaging, PriceKind, Promotion, PromotionScope, Retailer } from '../types';

export const DEMO_RETAILERS: Retailer[] = [
  { id: 'demo-a', slug: 'demo-a', name: 'Magasin Démo A', website: null, status: 'active', isDemo: true },
  { id: 'demo-b', slug: 'demo-b', name: 'Magasin Démo B', website: null, status: 'active', isDemo: true },
  { id: 'demo-c', slug: 'demo-c', name: 'Magasin Démo C', website: null, status: 'active', isDemo: true },
];

interface Row {
  r: 'a' | 'b' | 'c';
  product: string;
  name: string;
  cat: string;
  pack: [count: number, amount: number, unit: Packaging['unit']];
  price: number;
  ref: number | null;
  /** Décalage en jours (début, fin) par rapport à aujourd'hui. */
  days: [number, number];
  kind?: PriceKind;
  deal?: DealMechanic;
  conditions?: string;
  scope?: PromotionScope;
}

const ROWS: Row[] = [
  { r: 'a', product: 'lait-uht-1l', name: 'Lait entier UHT', cat: 'laitiers-oeufs', pack: [1, 1000, 'ml'], price: 135, ref: 165, days: [-2, 4] },
  { r: 'b', product: 'lait-uht-1l', name: 'Lait entier UHT', cat: 'laitiers-oeufs', pack: [6, 1000, 'ml'], price: 750, ref: null, days: [-1, 5] },
  { r: 'c', product: 'lait-uht-1l', name: 'Lait entier UHT', cat: 'laitiers-oeufs', pack: [1, 1000, 'ml'], price: 129, ref: 155, days: [-3, 3], kind: 'loyalty_card', conditions: 'Avec la carte de fidélité du magasin' },
  { r: 'a', product: 'spaghetti-500g', name: 'Spaghetti n° 5', cat: 'epicerie', pack: [1, 500, 'g'], price: 120, ref: 180, days: [-2, 4] },
  { r: 'b', product: 'spaghetti-500g', name: 'Spaghetti n° 5', cat: 'epicerie', pack: [3, 500, 'g'], price: 390, ref: 540, days: [0, 6] },
  { r: 'c', product: 'spaghetti-500g', name: 'Spaghetti n° 5', cat: 'epicerie', pack: [1, 500, 'g'], price: 180, ref: null, days: [-1, 5], deal: { type: 'multi_buy', buy: 2, pay: 1 }, conditions: '2 pour 1' },
  { r: 'a', product: 'penne-1kg', name: 'Penne rigate', cat: 'epicerie', pack: [1, 1000, 'g'], price: 260, ref: 320, days: [-2, 4] },
  { r: 'a', product: 'pommes-gala-1kg', name: 'Pommes Gala', cat: 'fruits-legumes', pack: [1, 1000, 'g'], price: 295, ref: 395, days: [-2, 4], scope: { type: 'regional', cantons: ['VD', 'GE', 'FR'] } },
  { r: 'b', product: 'pommes-gala-1kg', name: 'Pommes Gala', cat: 'fruits-legumes', pack: [1, 1000, 'g'], price: 320, ref: 420, days: [-1, 5] },
  { r: 'c', product: 'bananes-1kg', name: 'Bananes', cat: 'fruits-legumes', pack: [1, 1000, 'g'], price: 199, ref: 260, days: [-1, 5] },
  { r: 'a', product: 'cafe-grains-500g', name: 'Café en grains', cat: 'boissons', pack: [1, 500, 'g'], price: 795, ref: 1190, days: [-3, 3] },
  { r: 'b', product: 'cafe-grains-500g', name: 'Café en grains', cat: 'boissons', pack: [1, 500, 'g'], price: 850, ref: 1150, days: [-1, 5] },
  { r: 'c', product: 'cafe-grains-1kg', name: 'Café en grains, grand format', cat: 'boissons', pack: [1, 1000, 'g'], price: 1490, ref: 1990, days: [0, 6] },
  { r: 'a', product: 'yaourt-nature-4x180', name: 'Yogourt nature', cat: 'laitiers-oeufs', pack: [4, 180, 'g'], price: 240, ref: 300, days: [-2, 4] },
  { r: 'c', product: 'yaourt-nature-4x180', name: 'Yogourt nature', cat: 'laitiers-oeufs', pack: [4, 180, 'g'], price: 225, ref: 290, days: [-1, 5] },
  { r: 'b', product: 'beurre-250g', name: 'Beurre de cuisine', cat: 'laitiers-oeufs', pack: [1, 250, 'g'], price: 295, ref: 360, days: [-1, 5], deal: { type: 'min_quantity', min: 2 }, conditions: 'Prix valable dès 2 pièces' },
  { r: 'a', product: 'oeufs-6', name: 'Œufs suisses élevage au sol', cat: 'laitiers-oeufs', pack: [1, 6, 'piece'], price: 360, ref: 420, days: [-2, 4] },
  { r: 'b', product: 'oeufs-6', name: 'Œufs suisses élevage au sol', cat: 'laitiers-oeufs', pack: [1, 6, 'piece'], price: 375, ref: null, days: [-1, 5] },
  { r: 'c', product: 'pain-toast-500g', name: 'Pain toast complet', cat: 'pain', pack: [1, 500, 'g'], price: 195, ref: 250, days: [-1, 5] },
  { r: 'a', product: 'tomates-pelees-3x400', name: 'Tomates pelées', cat: 'epicerie', pack: [3, 400, 'g'], price: 285, ref: 360, days: [-2, 4] },
  { r: 'b', product: 'tomates-pelees-3x400', name: 'Tomates pelées', cat: 'epicerie', pack: [3, 400, 'g'], price: 270, ref: 345, days: [-1, 5] },
  { r: 'b', product: 'huile-colza-1l', name: 'Huile de colza', cat: 'epicerie', pack: [1, 1000, 'ml'], price: 495, ref: 620, days: [-1, 5] },
  { r: 'c', product: 'papier-wc-10', name: 'Papier toilette 3 plis', cat: 'menage', pack: [1, 10, 'piece'], price: 595, ref: 850, days: [-1, 5] },
  { r: 'a', product: 'papier-wc-10', name: 'Papier toilette 3 plis', cat: 'menage', pack: [1, 10, 'piece'], price: 640, ref: 820, days: [-2, 4] },
  { r: 'b', product: 'lessive-liquide-2l', name: 'Lessive liquide couleurs', cat: 'menage', pack: [1, 2000, 'ml'], price: 990, ref: 1590, days: [-1, 5] },
  { r: 'c', product: 'eau-minerale-6x1500', name: 'Eau minérale non gazeuse', cat: 'boissons', pack: [6, 1500, 'ml'], price: 390, ref: 540, days: [-1, 5] },
  { r: 'a', product: 'emince-poulet-400g', name: 'Émincé de poulet', cat: 'viande-poisson', pack: [1, 400, 'g'], price: 790, ref: 1050, days: [-2, 4] },
  { r: 'c', product: 'epinards-surgeles-750g', name: 'Épinards hachés surgelés', cat: 'surgeles', pack: [1, 750, 'g'], price: 260, ref: 330, days: [-1, 5] },
  { r: 'b', product: 'gel-douche-3x250', name: 'Gel douche', cat: 'hygiene', pack: [3, 250, 'ml'], price: 590, ref: 870, days: [-1, 5] },
  // Offres à venir et expirée, pour tester les filtres de période.
  { r: 'a', product: 'chocolat-lait-5x100', name: 'Chocolat au lait', cat: 'epicerie', pack: [5, 100, 'g'], price: 795, ref: 1095, days: [3, 9] },
  { r: 'b', product: 'riz-basmati-1kg', name: 'Riz basmati', cat: 'epicerie', pack: [1, 1000, 'g'], price: 310, ref: 420, days: [2, 8] },
  { r: 'c', product: 'fromage-raclette-400g', name: 'Fromage à raclette en tranches', cat: 'laitiers-oeufs', pack: [1, 400, 'g'], price: 690, ref: 950, days: [-10, -3] },
];

export function buildDemoPromotions(now: Date = new Date()): Promotion[] {
  const today = todayInZurich(now);
  const stamp = now.toISOString();
  return ROWS.map((row, index) => ({
    id: `demo-${index + 1}`,
    retailerId: `demo-${row.r}`,
    productId: row.product,
    productName: row.name,
    brand: null,
    categoryId: row.cat,
    packaging: { packCount: row.pack[0], unitAmount: row.pack[1], unit: row.pack[2] },
    promoPriceRappen: row.price,
    referencePriceRappen: row.ref,
    validFrom: addDays(today, row.days[0]),
    validUntil: addDays(today, row.days[1]),
    priceKind: row.kind ?? 'public',
    deal: row.deal ?? { type: 'none' },
    conditions: row.conditions ?? null,
    scope: row.scope ?? { type: 'national' },
    sourceUrl: null,
    imageUrl: null,
    collectedAt: stamp,
    lastVerifiedAt: stamp,
    verification: 'verified',
    isDemo: true,
  }));
}

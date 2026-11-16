/**
 * Types du domaine. Ils reflètent le futur schéma Supabase (phase 2).
 *
 * Conventions :
 * - Les montants sont des entiers en centimes (rappen). Jamais de flottants pour l'argent.
 *   La base PostgreSQL utilisera numeric(10,2) ; la conversion se fait à la lecture.
 * - Les quantités sont des entiers dans la plus petite unité (g, ml, pièce).
 * - Les dates de validité sont des dates civiles « YYYY-MM-DD » au fuseau Europe/Zurich,
 *   bornes incluses.
 * - `null` signifie « valeur inconnue / non fournie par la source », jamais « zéro ».
 */

export type RetailerStatus = 'planned' | 'active' | 'paused';

export interface Retailer {
  id: string;
  slug: string;
  name: string;
  website: string | null;
  status: RetailerStatus;
  /** Enseigne fictive utilisée uniquement par les données de démonstration. */
  isDemo: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  parentId: string | null;
}

/** Unités de stockage (plus petite unité, entiers). */
export type BaseUnit = 'g' | 'ml' | 'piece';
/** Unités de comparaison affichées à l'utilisateur. */
export type CompareUnit = 'kg' | 'l' | 'piece';

export interface Packaging {
  /** Nombre d'éléments dans le lot (3 pour « 3 × 500 g »). */
  packCount: number;
  /** Quantité d'un élément, dans l'unité de base (500 pour 500 g). */
  unitAmount: number;
  unit: BaseUnit;
}

/** Type de prix : public, réservé à une carte de fidélité, ou soumis à condition. */
export type PriceKind = 'public' | 'loyalty_card' | 'conditional';

/** Mécanique de promotion. */
export type DealMechanic =
  | { type: 'none' }
  /** « 2 pour 1 » = buy 2, pay 1 ; « 3 pour 2 » = buy 3, pay 2. */
  | { type: 'multi_buy'; buy: number; pay: number }
  /** Prix promotionnel valable à partir de `min` conditionnements achetés. */
  | { type: 'min_quantity'; min: number };

export const CANTONS = [
  'AG', 'AI', 'AR', 'BE', 'BL', 'BS', 'FR', 'GE', 'GL', 'GR', 'JU', 'LU', 'NE',
  'NW', 'OW', 'SG', 'SH', 'SO', 'SZ', 'TG', 'TI', 'UR', 'VD', 'VS', 'ZG', 'ZH',
] as const;
export type Canton = (typeof CANTONS)[number];

export type PromotionScope =
  | { type: 'national' }
  | { type: 'regional'; cantons: Canton[] }
  | { type: 'online_only' };

export type VerificationStatus = 'verified' | 'pending' | 'rejected';

export interface Promotion {
  id: string;
  retailerId: string;
  /** Produit de référence : deux promotions avec le même productId sont strictement identiques. */
  productId: string;
  productName: string;
  brand: string | null;
  categoryId: string;
  packaging: Packaging;
  promoPriceRappen: number;
  /** Prix de référence (« au lieu de ») uniquement s'il est fourni par la source. */
  referencePriceRappen: number | null;
  validFrom: string;
  validUntil: string;
  priceKind: PriceKind;
  deal: DealMechanic;
  conditions: string | null;
  scope: PromotionScope;
  sourceUrl: string | null;
  /** Image uniquement si son utilisation est autorisée. */
  imageUrl: string | null;
  collectedAt: string;
  lastVerifiedAt: string;
  verification: VerificationStatus;
  isDemo: boolean;
}

export interface Product {
  id: string;
  name: string;
  brand: string | null;
  categoryId: string;
  unit: BaseUnit;
}

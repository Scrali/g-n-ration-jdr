import type { Canton, PriceKind, Promotion } from '../data/types';
import { appliesToCanton, isPubliclyVisible, statusOf } from './promotions';
import { costForCount } from './units';

/**
 * Moteur de panier — version simple et exacte.
 *
 * Pour chaque article, on cherche dans chaque enseigne l'offre active la moins chère
 * pour le même produit de référence (productId). Les combinaisons d'enseignes sont
 * énumérées exhaustivement (au plus 2^n − 1 avec n enseignes, n ≤ ~10) : le résultat
 * est donc optimal pour les articles couverts.
 *
 * Limites assumées (affichées à l'utilisateur) :
 * - le coût de déplacement est ignoré ;
 * - seuls les produits avec une promotion vérifiée sont chiffrés (pas de prix normaux en phase 1).
 */

export interface BasketItemInput {
  id: string;
  label: string;
  productId: string | null;
  /** Nombre de conditionnements souhaités. */
  quantity: number;
}

export interface BasketOptions {
  retailerIds: string[];
  canton: Canton | null;
  maxStores: number | null;
  priceKinds: PriceKind[];
}

export interface ItemOffer {
  promotion: Promotion;
  costRappen: number;
}

export interface RetailerTotal {
  retailerId: string;
  totalRappen: number;
  coveredItemIds: string[];
  missingItemIds: string[];
}

export interface Assignment {
  itemId: string;
  retailerId: string;
  offer: ItemOffer;
}

export interface BasketResult {
  perRetailer: RetailerTotal[];
  /** Articles sans aucune offre chiffrable dans les enseignes autorisées. */
  unpricedItemIds: string[];
  best: {
    retailerIds: string[];
    assignments: Assignment[];
    totalRappen: number;
    coveredCount: number;
  } | null;
  /** Économie par rapport aux prix de référence affichés par les enseignes. */
  savings: {
    rappen: number;
    /** Nombre d'articles du meilleur panier dont le prix de référence est connu. */
    itemsWithReference: number;
    itemsInBest: number;
  } | null;
}

/** Meilleure offre (coût le plus bas) d'une enseigne pour un article. */
export function bestOfferFor(
  item: BasketItemInput,
  retailerId: string,
  promotions: Promotion[],
): ItemOffer | null {
  if (item.productId === null) return null;
  let best: ItemOffer | null = null;
  for (const p of promotions) {
    if (p.retailerId !== retailerId || p.productId !== item.productId) continue;
    const cost = costForCount(item.quantity, p.promoPriceRappen, p.deal, p.referencePriceRappen);
    if (cost === null) continue;
    if (best === null || cost < best.costRappen) best = { promotion: p, costRappen: cost };
  }
  return best;
}

function subsets<T>(values: T[], maxSize: number): T[][] {
  const result: T[][] = [];
  const n = values.length;
  for (let mask = 1; mask < 1 << n; mask++) {
    const subset: T[] = [];
    for (let i = 0; i < n; i++) if (mask & (1 << i)) subset.push(values[i] as T);
    if (subset.length <= maxSize) result.push(subset);
  }
  return result;
}

export function computeBasket(
  items: BasketItemInput[],
  allPromotions: Promotion[],
  options: BasketOptions,
  today: string,
): BasketResult {
  const promotions = allPromotions.filter(
    (p) =>
      isPubliclyVisible(p, today) &&
      statusOf(p, today) === 'active' &&
      options.retailerIds.includes(p.retailerId) &&
      options.priceKinds.includes(p.priceKind) &&
      appliesToCanton(p, options.canton),
  );
  const wanted = items.filter((i) => i.quantity > 0);

  // Matrice article × enseigne.
  const offers = new Map<string, Map<string, ItemOffer>>();
  for (const item of wanted) {
    const row = new Map<string, ItemOffer>();
    for (const r of options.retailerIds) {
      const o = bestOfferFor(item, r, promotions);
      if (o) row.set(r, o);
    }
    offers.set(item.id, row);
  }

  const perRetailer: RetailerTotal[] = options.retailerIds.map((retailerId) => {
    const covered: string[] = [];
    const missing: string[] = [];
    let total = 0;
    for (const item of wanted) {
      const o = offers.get(item.id)?.get(retailerId);
      if (o) {
        covered.push(item.id);
        total += o.costRappen;
      } else missing.push(item.id);
    }
    return { retailerId, totalRappen: total, coveredItemIds: covered, missingItemIds: missing };
  });

  const unpricedItemIds = wanted.filter((i) => (offers.get(i.id)?.size ?? 0) === 0).map((i) => i.id);

  // Combinaisons : maximiser la couverture, puis minimiser le coût, puis le nombre de magasins.
  const usable = options.retailerIds.filter((r) => perRetailer.find((t) => t.retailerId === r)!.coveredItemIds.length > 0);
  const maxStores = Math.max(1, options.maxStores ?? usable.length);
  let best: BasketResult['best'] = null;
  for (const combo of subsets(usable, maxStores)) {
    const assignments: Assignment[] = [];
    let total = 0;
    for (const item of wanted) {
      let pick: Assignment | null = null;
      for (const r of combo) {
        const o = offers.get(item.id)?.get(r);
        if (o && (pick === null || o.costRappen < pick.offer.costRappen)) pick = { itemId: item.id, retailerId: r, offer: o };
      }
      if (pick) {
        assignments.push(pick);
        total += pick.offer.costRappen;
      }
    }
    const usedRetailers = [...new Set(assignments.map((a) => a.retailerId))];
    const candidate = { retailerIds: usedRetailers, assignments, totalRappen: total, coveredCount: assignments.length };
    if (
      best === null ||
      candidate.coveredCount > best.coveredCount ||
      (candidate.coveredCount === best.coveredCount && candidate.totalRappen < best.totalRappen) ||
      (candidate.coveredCount === best.coveredCount &&
        candidate.totalRappen === best.totalRappen &&
        candidate.retailerIds.length < best.retailerIds.length)
    ) {
      best = candidate;
    }
  }

  let savings: BasketResult['savings'] = null;
  if (best && best.assignments.length > 0) {
    let rappen = 0;
    let withRef = 0;
    for (const a of best.assignments) {
      const ref = a.offer.promotion.referencePriceRappen;
      const item = wanted.find((i) => i.id === a.itemId)!;
      if (ref !== null) {
        withRef++;
        rappen += item.quantity * ref - a.offer.costRappen;
      }
    }
    savings = { rappen, itemsWithReference: withRef, itemsInBest: best.assignments.length };
  }

  return { perRetailer, unpricedItemIds, best, savings };
}

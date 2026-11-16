import type { Canton, Promotion, PriceKind } from '../data/types';
import { isIsoDate, isStale, validityStatus, type ValidityStatus } from './dates';
import { discountPercent } from './money';
import { compareUnitPrices, effectiveUnitPrice, unitPrice, validatePackaging, type UnitPrice } from './units';

/** Contrôles de cohérence. Une promotion avec des erreurs ne doit jamais être publiée. */
export function validatePromotion(p: Promotion): string[] {
  const errors: string[] = [];
  if (!p.productName.trim()) errors.push('Nom du produit manquant');
  if (!Number.isSafeInteger(p.promoPriceRappen) || p.promoPriceRappen <= 0)
    errors.push('Prix promotionnel invalide (doit être positif)');
  if (p.referencePriceRappen !== null) {
    if (!Number.isSafeInteger(p.referencePriceRappen) || p.referencePriceRappen <= 0)
      errors.push('Prix de référence invalide');
    else if (p.referencePriceRappen < p.promoPriceRappen)
      errors.push('Prix de référence inférieur au prix promotionnel');
  }
  if (!isIsoDate(p.validFrom)) errors.push('Date de début invalide');
  if (!isIsoDate(p.validUntil)) errors.push('Date de fin invalide');
  if (isIsoDate(p.validFrom) && isIsoDate(p.validUntil) && p.validUntil < p.validFrom)
    errors.push('La date de fin précède la date de début');
  errors.push(...validatePackaging(p.packaging));
  if (p.deal.type === 'multi_buy' && !(p.deal.buy > p.deal.pay && p.deal.pay >= 1))
    errors.push('Offre « X pour Y » incohérente');
  if (p.deal.type === 'min_quantity' && !(p.deal.min >= 2)) errors.push('Quantité minimale incohérente');
  if (p.scope.type === 'regional' && p.scope.cantons.length === 0) errors.push('Portée régionale sans canton');
  if (p.sourceUrl !== null && !/^https:\/\//.test(p.sourceUrl)) errors.push('URL de source non sécurisée');
  return errors;
}

export function statusOf(p: Promotion, today: string): ValidityStatus {
  return validityStatus(p.validFrom, p.validUntil, today);
}

/** Seules les offres vérifiées, valides et non expirées sont visibles du public. */
export function isPubliclyVisible(p: Promotion, today: string): boolean {
  return p.verification === 'verified' && statusOf(p, today) !== 'expired' && validatePromotion(p).length === 0;
}

export function promoUnitPrice(p: Promotion): UnitPrice {
  return unitPrice(p.promoPriceRappen, p.packaging);
}

export function promoEffectiveUnitPrice(p: Promotion): UnitPrice | null {
  return effectiveUnitPrice(p.promoPriceRappen, p.packaging, p.deal, p.referencePriceRappen);
}

export function promoDiscount(p: Promotion): number | null {
  return discountPercent(p.promoPriceRappen, p.referencePriceRappen);
}

export function appliesToCanton(p: Promotion, canton: Canton | null): boolean {
  if (canton === null) return true;
  if (p.scope.type === 'regional') return p.scope.cantons.includes(canton);
  return true;
}

/** Normalisation pour la recherche : minuscules, sans accents, espaces simplifiés. */
export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/œ/g, 'oe')
    .replace(/[^\p{Letter}\p{Number}]+/gu, ' ')
    .trim();
}

export function matchesQuery(p: Promotion, query: string): boolean {
  const terms = normalizeText(query).split(' ').filter(Boolean);
  if (terms.length === 0) return true;
  const haystack = normalizeText(`${p.productName} ${p.brand ?? ''}`);
  return terms.every((t) => haystack.includes(t));
}

export type PeriodFilter = 'current' | 'upcoming' | 'all';
export type SortKey = 'ending' | 'discount' | 'price' | 'unitPrice';

export interface PromotionFilters {
  query: string;
  retailerIds: string[];
  categoryIds: string[];
  maxPriceRappen: number | null;
  minDiscount: number | null;
  canton: Canton | null;
  period: PeriodFilter;
  priceKinds: PriceKind[];
}

export const DEFAULT_FILTERS: PromotionFilters = {
  query: '',
  retailerIds: [],
  categoryIds: [],
  maxPriceRappen: null,
  minDiscount: null,
  canton: null,
  period: 'current',
  priceKinds: ['public', 'loyalty_card', 'conditional'],
};

export function filterPromotions(list: Promotion[], f: PromotionFilters, today: string): Promotion[] {
  return list.filter((p) => {
    if (!isPubliclyVisible(p, today)) return false;
    const status = statusOf(p, today);
    if (f.period === 'current' && status !== 'active') return false;
    if (f.period === 'upcoming' && status !== 'upcoming') return false;
    if (f.retailerIds.length && !f.retailerIds.includes(p.retailerId)) return false;
    if (f.categoryIds.length && !f.categoryIds.includes(p.categoryId)) return false;
    if (f.maxPriceRappen !== null && p.promoPriceRappen > f.maxPriceRappen) return false;
    if (f.minDiscount !== null) {
      const d = promoDiscount(p);
      // Sans prix de référence, la réduction est inconnue : l'offre est exclue de ce filtre.
      if (d === null || d < f.minDiscount) return false;
    }
    if (!f.priceKinds.includes(p.priceKind)) return false;
    if (!appliesToCanton(p, f.canton)) return false;
    return matchesQuery(p, f.query);
  });
}

export function sortPromotions(list: Promotion[], key: SortKey): Promotion[] {
  const sorted = [...list];
  sorted.sort((a, b) => {
    switch (key) {
      case 'ending':
        return a.validUntil.localeCompare(b.validUntil) || a.productName.localeCompare(b.productName, 'fr');
      case 'discount': {
        // Les réductions inconnues sont placées en dernier.
        const da = promoDiscount(a) ?? -1;
        const db = promoDiscount(b) ?? -1;
        return db - da;
      }
      case 'price':
        return a.promoPriceRappen - b.promoPriceRappen;
      case 'unitPrice': {
        const c = compareUnitPrices(promoUnitPrice(a), promoUnitPrice(b));
        // Unités différentes : on regroupe par unité.
        return c ?? promoUnitPrice(a).unit.localeCompare(promoUnitPrice(b).unit);
      }
    }
  });
  return sorted;
}

export function freshnessWarning(p: Promotion, now: Date): boolean {
  return isStale(p.lastVerifiedAt, now);
}

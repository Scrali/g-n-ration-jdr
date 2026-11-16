import type { BaseUnit, CompareUnit, DealMechanic, Packaging } from '../data/types';
import { divRound } from './money';

/** Facteur entre l'unité de comparaison et l'unité de base (1 kg = 1000 g). */
const COMPARE: Record<BaseUnit, { unit: CompareUnit; factor: number; label: string }> = {
  g: { unit: 'kg', factor: 1000, label: 'kg' },
  ml: { unit: 'l', factor: 1000, label: 'l' },
  piece: { unit: 'piece', factor: 1, label: 'pce' },
};

export function compareUnitOf(unit: BaseUnit): CompareUnit {
  return COMPARE[unit].unit;
}

export function compareUnitLabel(unit: CompareUnit): string {
  return unit === 'kg' ? 'kg' : unit === 'l' ? 'l' : 'pce';
}

export function validatePackaging(p: Packaging): string[] {
  const errors: string[] = [];
  if (!Number.isSafeInteger(p.packCount) || p.packCount < 1) errors.push('Nombre d’éléments du lot invalide');
  if (!Number.isSafeInteger(p.unitAmount) || p.unitAmount < 1)
    errors.push('Quantité invalide (entier attendu en g, ml ou pièces)');
  if (!(p.unit in COMPARE)) errors.push('Unité inconnue');
  return errors;
}

/** Quantité totale du conditionnement dans l'unité de base (3 × 500 g = 1500). */
export function totalAmount(p: Packaging): number {
  return p.packCount * p.unitAmount;
}

/**
 * Prix exact par unité de comparaison, sous forme de fraction d'entiers
 * (centimes × facteur / quantité). Permet des comparaisons sans erreur d'arrondi.
 */
export interface UnitPrice {
  numerator: number;
  denominator: number;
  unit: CompareUnit;
  /** Valeur arrondie au centime, pour l'affichage. */
  rappen: number;
}

export function unitPrice(priceRappen: number, p: Packaging): UnitPrice {
  const errors = validatePackaging(p);
  if (errors.length) throw new RangeError(errors.join(', '));
  if (!Number.isSafeInteger(priceRappen) || priceRappen < 0) throw new RangeError('Prix invalide');
  const { unit, factor } = COMPARE[p.unit];
  const numerator = priceRappen * factor;
  const denominator = totalAmount(p);
  return { numerator, denominator, unit, rappen: divRound(numerator, denominator) };
}

/** Compare deux prix unitaires. Retourne null si les unités sont incompatibles. */
export function compareUnitPrices(a: UnitPrice, b: UnitPrice): number | null {
  if (a.unit !== b.unit) return null;
  return a.numerator * b.denominator - b.numerator * a.denominator;
}

/** Libellé du conditionnement : « 500 g », « 3 × 500 g », « 1,5 l », « 6 pces ». */
export function formatPackaging(p: Packaging): string {
  const one = formatAmount(p.unitAmount, p.unit);
  return p.packCount > 1 ? `${p.packCount} × ${one}` : one;
}

function formatAmount(amount: number, unit: BaseUnit): string {
  if (unit === 'piece') return `${amount} ${amount > 1 ? 'pces' : 'pce'}`;
  const big = unit === 'g' ? 'kg' : 'l';
  if (amount >= 1000) {
    const value = (amount / 1000).toLocaleString('fr-CH', { maximumFractionDigits: 3 });
    return `${value} ${big}`;
  }
  return `${amount} ${unit}`;
}

/**
 * Coût de `count` conditionnements, en tenant compte de la mécanique de promotion.
 * Retourne null lorsque le coût ne peut pas être déterminé de manière fiable
 * (ex. quantité minimale non atteinte et prix normal inconnu).
 */
export function costForCount(
  count: number,
  promoPriceRappen: number,
  deal: DealMechanic,
  referencePriceRappen: number | null,
): number | null {
  if (!Number.isSafeInteger(count) || count < 0) throw new RangeError('Quantité invalide');
  switch (deal.type) {
    case 'none':
      return count * promoPriceRappen;
    case 'multi_buy': {
      const groups = Math.floor(count / deal.buy);
      const rest = count % deal.buy;
      // Les articles hors lot complet sont payés au prix affiché de la promotion.
      return groups * deal.pay * promoPriceRappen + rest * promoPriceRappen;
    }
    case 'min_quantity':
      if (count >= deal.min) return count * promoPriceRappen;
      return referencePriceRappen === null ? null : count * referencePriceRappen;
  }
}

/**
 * Nombre de conditionnements qu'il est « naturel » d'acheter pour profiter de l'offre.
 * Sert à calculer un prix unitaire effectif (« en achetant 2 »).
 */
export function dealQuantity(deal: DealMechanic): number {
  if (deal.type === 'multi_buy') return deal.buy;
  if (deal.type === 'min_quantity') return deal.min;
  return 1;
}

/** Prix unitaire effectif en achetant la quantité qui déclenche l'offre. */
export function effectiveUnitPrice(
  promoPriceRappen: number,
  p: Packaging,
  deal: DealMechanic,
  referencePriceRappen: number | null,
): UnitPrice | null {
  const qty = dealQuantity(deal);
  const cost = costForCount(qty, promoPriceRappen, deal, referencePriceRappen);
  if (cost === null) return null;
  return unitPrice(cost, { ...p, packCount: p.packCount * qty });
}

export function describeDeal(deal: DealMechanic): string | null {
  if (deal.type === 'multi_buy') return `${deal.buy} pour ${deal.pay}`;
  if (deal.type === 'min_quantity') return `Dès ${deal.min} achetés`;
  return null;
}

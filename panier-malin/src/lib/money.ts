/** Utilitaires monétaires. Tous les montants sont des entiers en centimes (rappen). */

export function assertRappen(value: number, label = 'montant'): void {
  if (!Number.isSafeInteger(value)) {
    throw new RangeError(`${label} doit être un entier en centimes (reçu : ${value})`);
  }
}

/** Formate un montant au format suisse : « CHF 4.50 », « CHF 1’234.05 ». */
export function formatCHF(rappen: number): string {
  assertRappen(rappen);
  const negative = rappen < 0;
  const abs = Math.abs(rappen);
  const francs = Math.floor(abs / 100);
  const cents = abs % 100;
  const grouped = String(francs).replace(/\B(?=(\d{3})+(?!\d))/g, '’');
  return `${negative ? '−' : ''}CHF ${grouped}.${String(cents).padStart(2, '0')}`;
}

/**
 * Convertit une saisie (« 4.50 », « 4,5 », « CHF 12.– ») en centimes.
 * Retourne null si la saisie n'est pas un montant valide. Aucun passage par un flottant.
 */
export function parseCHF(input: string): number | null {
  const cleaned = input
    .trim()
    .replace(/^CHF\s*/i, '')
    .replace(/[’'\s]/g, '')
    .replace(/[.,][–-]$/, '')
    .replace(',', '.');
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(cleaned);
  if (!match) return null;
  const francs = Number(match[1]);
  const cents = Number((match[2] ?? '').padEnd(2, '0'));
  const total = francs * 100 + cents;
  return Number.isSafeInteger(total) ? total : null;
}

/** Division entière arrondie au plus proche (demi vers le haut), pour des entiers positifs. */
export function divRound(numerator: number, denominator: number): number {
  if (denominator <= 0) throw new RangeError('dénominateur invalide');
  return Math.floor((2 * numerator + denominator) / (2 * denominator));
}

/**
 * Pourcentage de réduction, arrondi à l'entier inférieur (on n'exagère jamais).
 * Retourne null si le prix de référence est inconnu ou non supérieur au prix promo.
 */
export function discountPercent(promoRappen: number, referenceRappen: number | null): number | null {
  if (referenceRappen === null || referenceRappen <= 0 || referenceRappen <= promoRappen) return null;
  return Math.floor(((referenceRappen - promoRappen) * 100) / referenceRappen);
}

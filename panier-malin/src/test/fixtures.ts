import type { Promotion } from '../data/types';

/** Fabrique de promotions de test (données de test, jamais publiées). */
export function promo(overrides: Partial<Promotion> = {}): Promotion {
  return {
    id: 'p1',
    retailerId: 'r1',
    productId: 'lait-1l',
    productName: 'Lait entier UHT',
    brand: null,
    categoryId: 'laitiers-oeufs',
    packaging: { packCount: 1, unitAmount: 1000, unit: 'ml' },
    promoPriceRappen: 150,
    referencePriceRappen: 200,
    validFrom: '2026-11-10',
    validUntil: '2026-11-20',
    priceKind: 'public',
    deal: { type: 'none' },
    conditions: null,
    scope: { type: 'national' },
    sourceUrl: 'https://example.ch/offre',
    imageUrl: null,
    collectedAt: '2026-11-16T08:00:00Z',
    lastVerifiedAt: '2026-11-16T08:00:00Z',
    verification: 'verified',
    isDemo: false,
    ...overrides,
  };
}

export const TODAY = '2026-11-16';

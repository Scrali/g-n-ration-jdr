import { describe, expect, it } from 'vitest';
import { DEFAULT_FILTERS, filterPromotions, isPubliclyVisible, normalizeText, sortPromotions, validatePromotion } from './promotions';
import { compareProduct } from './compare';
import { promo, TODAY } from '../test/fixtures';
import { buildDemoPromotions } from '../data/demo/demoData';

describe('validation des promotions', () => {
  it('accepte une promotion cohérente', () => {
    expect(validatePromotion(promo())).toEqual([]);
  });

  it('rejette les prix nuls, négatifs ou incohérents', () => {
    expect(validatePromotion(promo({ promoPriceRappen: 0 }))).not.toEqual([]);
    expect(validatePromotion(promo({ promoPriceRappen: -100 }))).not.toEqual([]);
    expect(validatePromotion(promo({ referencePriceRappen: 100 }))).toContain(
      'Prix de référence inférieur au prix promotionnel',
    );
  });

  it('rejette les dates incohérentes', () => {
    expect(validatePromotion(promo({ validFrom: '2026-11-20', validUntil: '2026-11-10' }))).not.toEqual([]);
    expect(validatePromotion(promo({ validUntil: '2026-13-01' }))).not.toEqual([]);
  });

  it('rejette les offres X pour Y absurdes et les sources non https', () => {
    expect(validatePromotion(promo({ deal: { type: 'multi_buy', buy: 1, pay: 2 } }))).not.toEqual([]);
    expect(validatePromotion(promo({ sourceUrl: 'http://example.ch' }))).not.toEqual([]);
  });
});

describe('visibilité publique', () => {
  it('masque les offres expirées, non vérifiées ou invalides', () => {
    expect(isPubliclyVisible(promo(), TODAY)).toBe(true);
    expect(isPubliclyVisible(promo({ validUntil: '2026-11-15' }), TODAY)).toBe(false);
    expect(isPubliclyVisible(promo({ verification: 'pending' }), TODAY)).toBe(false);
    expect(isPubliclyVisible(promo({ promoPriceRappen: -1 }), TODAY)).toBe(false);
  });
});

describe('filtres et tri', () => {
  const list = [
    promo({ id: 'a', retailerId: 'r1', promoPriceRappen: 150, referencePriceRappen: 300 }),
    promo({ id: 'b', retailerId: 'r2', promoPriceRappen: 120, referencePriceRappen: null, validUntil: '2026-11-17' }),
    promo({ id: 'c', retailerId: 'r2', validFrom: '2026-11-18', validUntil: '2026-11-25' }),
    promo({ id: 'd', retailerId: 'r1', validUntil: '2026-11-01' }),
    promo({ id: 'e', productName: 'Café en grains', productId: 'cafe', scope: { type: 'regional', cantons: ['GE'] } }),
  ];

  it('par défaut : uniquement les offres en cours', () => {
    expect(filterPromotions(list, DEFAULT_FILTERS, TODAY).map((p) => p.id)).toEqual(['a', 'b', 'e']);
  });

  it('offres à venir', () => {
    expect(filterPromotions(list, { ...DEFAULT_FILTERS, period: 'upcoming' }, TODAY).map((p) => p.id)).toEqual(['c']);
  });

  it('jamais d’offre expirée, même avec « toutes »', () => {
    expect(filterPromotions(list, { ...DEFAULT_FILTERS, period: 'all' }, TODAY).map((p) => p.id)).not.toContain('d');
  });

  it('réduction minimale : exclut les offres sans prix de référence', () => {
    expect(filterPromotions(list, { ...DEFAULT_FILTERS, minDiscount: 10 }, TODAY).map((p) => p.id)).toEqual(['a', 'e']);
  });

  it('canton : masque les offres locales des autres cantons', () => {
    expect(filterPromotions(list, { ...DEFAULT_FILTERS, canton: 'VD' }, TODAY).map((p) => p.id)).toEqual(['a', 'b']);
    expect(filterPromotions(list, { ...DEFAULT_FILTERS, canton: 'GE' }, TODAY).map((p) => p.id)).toContain('e');
  });

  it('recherche insensible aux accents et à la casse', () => {
    expect(filterPromotions(list, { ...DEFAULT_FILTERS, query: 'CAFE' }, TODAY).map((p) => p.id)).toEqual(['e']);
    expect(normalizeText('Œufs  élevage')).toBe('oeufs elevage');
  });

  it('tri par réduction : inconnues en dernier', () => {
    const sorted = sortPromotions(filterPromotions(list, DEFAULT_FILTERS, TODAY), 'discount').map((p) => p.id);
    expect(sorted[sorted.length - 1]).toBe('b');
  });

  it('tri par fin de validité', () => {
    expect(sortPromotions(filterPromotions(list, DEFAULT_FILTERS, TODAY), 'ending')[0]?.id).toBe('b');
  });
});

describe('comparaison de produits', () => {
  it('sépare produits identiques et alternatives', () => {
    const list = [
      promo({ id: 'x1', retailerId: 'r1', promoPriceRappen: 150 }),
      promo({ id: 'x2', retailerId: 'r2', promoPriceRappen: 750, referencePriceRappen: null, packaging: { packCount: 6, unitAmount: 1000, unit: 'ml' } }),
      promo({ id: 'y', productId: 'lait-bio', productName: 'Lait bio', retailerId: 'r1' }),
      promo({ id: 'z', productId: 'beurre', productName: 'Beurre', packaging: { packCount: 1, unitAmount: 250, unit: 'g' } }),
    ];
    const c = compareProduct('lait-1l', list, TODAY)!;
    // 6 × 1 l à 7.50 = 1.25/l, moins cher que 1.50/l
    expect(c.identical.map((p) => p.id)).toEqual(['x2', 'x1']);
    expect(c.alternatives.map((p) => p.id)).toEqual(['y']); // le beurre (kg) n'est pas comparable
  });
});

describe('données de démonstration', () => {
  const demo = buildDemoPromotions(new Date('2026-11-16T10:00:00Z'));

  it('sont toutes valides et marquées comme démo', () => {
    for (const p of demo) {
      expect(validatePromotion(p), p.id).toEqual([]);
      expect(p.isDemo).toBe(true);
      expect(p.retailerId.startsWith('demo-')).toBe(true);
      expect(p.sourceUrl).toBeNull();
    }
  });
});

import { describe, expect, it } from 'vitest';
import { computeBasket, type BasketOptions } from './basket';
import { promo, TODAY } from '../test/fixtures';

const opts: BasketOptions = { retailerIds: ['r1', 'r2'], canton: null, maxStores: null, priceKinds: ['public'] };

const offers = [
  promo({ id: 'lait-r1', retailerId: 'r1', productId: 'lait', promoPriceRappen: 150, referencePriceRappen: 200 }),
  promo({ id: 'lait-r2', retailerId: 'r2', productId: 'lait', promoPriceRappen: 130, referencePriceRappen: null }),
  promo({ id: 'pates-r1', retailerId: 'r1', productId: 'pates', promoPriceRappen: 120, referencePriceRappen: 180 }),
  promo({
    id: 'pates-r2',
    retailerId: 'r2',
    productId: 'pates',
    promoPriceRappen: 180,
    referencePriceRappen: null,
    deal: { type: 'multi_buy', buy: 2, pay: 1 },
  }),
  promo({ id: 'cafe-r2', retailerId: 'r2', productId: 'cafe', promoPriceRappen: 800, referencePriceRappen: 1100 }),
];

const items = [
  { id: 'i1', label: 'Lait', productId: 'lait', quantity: 2 },
  { id: 'i2', label: 'Pâtes', productId: 'pates', quantity: 2 },
  { id: 'i3', label: 'Café', productId: 'cafe', quantity: 1 },
  { id: 'i4', label: 'Pain maison', productId: null, quantity: 1 },
];

describe('panier', () => {
  it('calcule le total connu et la couverture par magasin', () => {
    const r = computeBasket(items, offers, opts, TODAY);
    const r1 = r.perRetailer.find((x) => x.retailerId === 'r1')!;
    const r2 = r.perRetailer.find((x) => x.retailerId === 'r2')!;
    expect(r1.totalRappen).toBe(300 + 240);
    expect(r1.missingItemIds).toEqual(['i3', 'i4']);
    // r2 : lait 2×1.30, pâtes 2 pour 1 → 1.80, café 8.00
    expect(r2.totalRappen).toBe(260 + 180 + 800);
    expect(r2.coveredItemIds).toEqual(['i1', 'i2', 'i3']);
    expect(r.unpricedItemIds).toEqual(['i4']);
  });

  it('trouve la combinaison la moins chère et calcule l’économie sur une référence explicite', () => {
    const r = computeBasket(items, offers, opts, TODAY);
    expect(r.best?.coveredCount).toBe(3);
    expect(r.best?.totalRappen).toBe(260 + 180 + 800);
    expect(r.best?.retailerIds).toEqual(['r2']);
    // Seul le café a un prix de référence : 11.00 − 8.00
    expect(r.savings).toEqual({ rappen: 300, itemsWithReference: 1, itemsInBest: 3 });
  });

  it('respecte le nombre maximal de magasins et privilégie la couverture', () => {
    const r = computeBasket(items, offers, { ...opts, retailerIds: ['r1', 'r2'], maxStores: 1 }, TODAY);
    expect(r.best?.retailerIds).toEqual(['r2']);
  });

  it('combine plusieurs magasins si c’est moins cher', () => {
    const cheaperPasta = [...offers.filter((o) => o.id !== 'pates-r2')];
    const r = computeBasket(items, cheaperPasta, opts, TODAY);
    expect(r.best?.assignments.find((a) => a.itemId === 'i2')?.retailerId).toBe('r1');
    expect(r.best?.assignments.find((a) => a.itemId === 'i1')?.retailerId).toBe('r2');
    expect(r.best?.totalRappen).toBe(260 + 240 + 800);
  });

  it('ignore les offres expirées, d’autres cantons ou réservées à une carte', () => {
    const list = [
      promo({ id: 'exp', retailerId: 'r1', productId: 'lait', validUntil: '2026-11-15' }),
      promo({ id: 'ge', retailerId: 'r1', productId: 'lait', scope: { type: 'regional', cantons: ['GE'] } }),
      promo({ id: 'card', retailerId: 'r2', productId: 'lait', priceKind: 'loyalty_card' }),
    ];
    const r = computeBasket([items[0]!], list, { ...opts, canton: 'VD' }, TODAY);
    expect(r.unpricedItemIds).toEqual(['i1']);
    expect(r.best).toBeNull();
    const withCard = computeBasket([items[0]!], list, { ...opts, canton: 'VD', priceKinds: ['public', 'loyalty_card'] }, TODAY);
    expect(withCard.best?.retailerIds).toEqual(['r2']);
  });

  it('quantité minimale non atteinte sans prix normal : article non chiffré', () => {
    const list = [promo({ retailerId: 'r1', productId: 'beurre', deal: { type: 'min_quantity', min: 2 }, referencePriceRappen: null })];
    const r = computeBasket([{ id: 'b', label: 'Beurre', productId: 'beurre', quantity: 1 }], list, opts, TODAY);
    expect(r.unpricedItemIds).toEqual(['b']);
  });
});

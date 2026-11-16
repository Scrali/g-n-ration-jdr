import { describe, expect, it } from 'vitest';
import {
  compareUnitPrices,
  costForCount,
  effectiveUnitPrice,
  formatPackaging,
  unitPrice,
  validatePackaging,
} from './units';

describe('prix unitaire', () => {
  it('500 g à CHF 4.50 = CHF 9.00/kg', () => {
    const u = unitPrice(450, { packCount: 1, unitAmount: 500, unit: 'g' });
    expect(u).toMatchObject({ unit: 'kg', rappen: 900 });
  });

  it('3 × 500 g à CHF 9.00 = CHF 6.00/kg', () => {
    expect(unitPrice(900, { packCount: 3, unitAmount: 500, unit: 'g' }).rappen).toBe(600);
  });

  it('750 ml à CHF 3.00 = CHF 4.00/l', () => {
    expect(unitPrice(300, { packCount: 1, unitAmount: 750, unit: 'ml' })).toMatchObject({ unit: 'l', rappen: 400 });
  });

  it('prix à la pièce : 6 œufs à CHF 3.60 = CHF 0.60/pce', () => {
    expect(unitPrice(360, { packCount: 1, unitAmount: 6, unit: 'piece' })).toMatchObject({ unit: 'piece', rappen: 60 });
  });

  it('arrondit au centime le plus proche pour l’affichage', () => {
    // 1.00 / 3 × 100 g → 3.333… CHF/kg
    expect(unitPrice(100, { packCount: 3, unitAmount: 100, unit: 'g' }).rappen).toBe(333);
    // 2.00 / 300 g → 6.666… CHF/kg → 6.67
    expect(unitPrice(200, { packCount: 1, unitAmount: 300, unit: 'g' }).rappen).toBe(667);
  });

  it('compare exactement sans erreur d’arrondi', () => {
    const a = unitPrice(100, { packCount: 1, unitAmount: 300, unit: 'g' });
    const b = unitPrice(200, { packCount: 1, unitAmount: 600, unit: 'g' });
    expect(compareUnitPrices(a, b)).toBe(0);
  });

  it('refuse de comparer des unités incompatibles', () => {
    const kg = unitPrice(100, { packCount: 1, unitAmount: 1000, unit: 'g' });
    const l = unitPrice(100, { packCount: 1, unitAmount: 1000, unit: 'ml' });
    expect(compareUnitPrices(kg, l)).toBeNull();
  });

  it('rejette les conditionnements invalides', () => {
    expect(validatePackaging({ packCount: 0, unitAmount: 500, unit: 'g' })).not.toHaveLength(0);
    expect(validatePackaging({ packCount: 1, unitAmount: 0.5, unit: 'g' })).not.toHaveLength(0);
    expect(() => unitPrice(100, { packCount: 1, unitAmount: 0, unit: 'g' })).toThrow();
    expect(() => unitPrice(-1, { packCount: 1, unitAmount: 10, unit: 'g' })).toThrow();
  });

  it('formate les conditionnements', () => {
    expect(formatPackaging({ packCount: 3, unitAmount: 500, unit: 'g' })).toBe('3 × 500 g');
    expect(formatPackaging({ packCount: 1, unitAmount: 1500, unit: 'ml' })).toBe('1,5 l');
    expect(formatPackaging({ packCount: 1, unitAmount: 6, unit: 'piece' })).toBe('6 pces');
  });
});

describe('coût selon la mécanique de promotion', () => {
  it('prix simple', () => {
    expect(costForCount(3, 250, { type: 'none' }, null)).toBe(750);
  });

  it('« 2 pour 1 » : 2 achetés = 1 payé, 3 achetés = 2 payés', () => {
    const deal = { type: 'multi_buy', buy: 2, pay: 1 } as const;
    expect(costForCount(1, 300, deal, null)).toBe(300);
    expect(costForCount(2, 300, deal, null)).toBe(300);
    expect(costForCount(3, 300, deal, null)).toBe(600);
    expect(costForCount(4, 300, deal, null)).toBe(600);
  });

  it('« 3 pour 2 »', () => {
    expect(costForCount(3, 100, { type: 'multi_buy', buy: 3, pay: 2 }, null)).toBe(200);
    expect(costForCount(5, 100, { type: 'multi_buy', buy: 3, pay: 2 }, null)).toBe(400);
  });

  it('quantité minimale : prix normal en dessous si connu, sinon inconnu', () => {
    const deal = { type: 'min_quantity', min: 2 } as const;
    expect(costForCount(2, 295, deal, 360)).toBe(590);
    expect(costForCount(1, 295, deal, 360)).toBe(360);
    expect(costForCount(1, 295, deal, null)).toBeNull();
  });

  it('prix unitaire effectif d’un « 2 pour 1 »', () => {
    const e = effectiveUnitPrice(180, { packCount: 1, unitAmount: 500, unit: 'g' }, { type: 'multi_buy', buy: 2, pay: 1 }, null);
    expect(e?.rappen).toBe(180); // CHF 1.80 pour 1 kg
  });
});

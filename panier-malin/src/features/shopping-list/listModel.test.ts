import { describe, expect, it } from 'vitest';
import { EMPTY_LIST, groupByCategory, listReducer, sanitizeList, MAX_QUANTITY } from './listModel';

const base = { productId: null, categoryId: null, addedAt: '2026-11-16T00:00:00Z' };

describe('liste de courses', () => {
  it('ajoute, modifie, coche et supprime', () => {
    let s = listReducer(EMPTY_LIST, { type: 'add', item: { ...base, id: '1', label: 'Pommes' } });
    s = listReducer(s, { type: 'setQuantity', id: '1', quantity: 3 });
    s = listReducer(s, { type: 'toggle', id: '1' });
    expect(s.items[0]).toMatchObject({ label: 'Pommes', quantity: 3, checked: true });
    s = listReducer(s, { type: 'clearChecked' });
    expect(s.items).toHaveLength(0);
  });

  it('fusionne les doublons au lieu de créer deux lignes', () => {
    let s = listReducer(EMPTY_LIST, { type: 'add', item: { ...base, id: '1', label: 'Lait', productId: 'lait' } });
    s = listReducer(s, { type: 'add', item: { ...base, id: '2', label: 'Lait', productId: 'lait' } });
    s = listReducer(s, { type: 'add', item: { ...base, id: '3', label: 'pain' } });
    s = listReducer(s, { type: 'add', item: { ...base, id: '4', label: 'Pain' } });
    expect(s.items).toHaveLength(2);
    expect(s.items.map((i) => i.quantity)).toEqual([2, 2]);
  });

  it('borne les quantités et ignore les libellés vides', () => {
    let s = listReducer(EMPTY_LIST, { type: 'add', item: { ...base, id: '1', label: '   ' } });
    expect(s.items).toHaveLength(0);
    s = listReducer(s, { type: 'add', item: { ...base, id: '1', label: 'Riz' } });
    s = listReducer(s, { type: 'setQuantity', id: '1', quantity: 0 });
    expect(s.items[0]?.quantity).toBe(1);
    s = listReducer(s, { type: 'setQuantity', id: '1', quantity: 1000 });
    expect(s.items[0]?.quantity).toBe(MAX_QUANTITY);
  });

  it('nettoie une liste corrompue lue depuis le stockage', () => {
    expect(sanitizeList(null)).toEqual(EMPTY_LIST);
    expect(sanitizeList({ items: 'x' })).toEqual(EMPTY_LIST);
    const s = sanitizeList({ items: [{ id: 'a', label: 'Œufs', quantity: '4' }, { id: 1 }, null] });
    expect(s.items).toEqual([
      { id: 'a', label: 'Œufs', productId: null, categoryId: null, quantity: 4, checked: false, addedAt: new Date(0).toISOString() },
    ]);
  });

  it('regroupe par catégorie', () => {
    let s = listReducer(EMPTY_LIST, { type: 'add', item: { ...base, id: '1', label: 'Lait', categoryId: 'laitiers-oeufs' } });
    s = listReducer(s, { type: 'add', item: { ...base, id: '2', label: 'Divers' } });
    const g = groupByCategory(s.items);
    expect([...g.keys()]).toEqual(['laitiers-oeufs', null]);
  });
});

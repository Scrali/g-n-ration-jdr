import type { Product, Promotion } from '../data/types';
import { compareUnitOf, compareUnitPrices } from './units';
import { isPubliclyVisible, matchesQuery, promoUnitPrice, statusOf } from './promotions';

/** Catalogue de produits de référence déduit des promotions visibles. */
export function productsFromPromotions(list: Promotion[]): Product[] {
  const map = new Map<string, Product>();
  for (const p of list) {
    if (!map.has(p.productId)) {
      map.set(p.productId, {
        id: p.productId,
        name: p.productName,
        brand: p.brand,
        categoryId: p.categoryId,
        unit: p.packaging.unit,
      });
    }
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, 'fr'));
}

export interface ProductComparison {
  product: Product;
  /** Offres pour le même produit de référence, triées par prix unitaire. */
  identical: Promotion[];
  /** Produits de la même catégorie et de même unité, présentés séparément. */
  alternatives: Promotion[];
}

function byUnitPrice(a: Promotion, b: Promotion): number {
  return compareUnitPrices(promoUnitPrice(a), promoUnitPrice(b)) ?? 0;
}

export function compareProduct(productId: string, list: Promotion[], today: string): ProductComparison | null {
  const active = list.filter((p) => isPubliclyVisible(p, today) && statusOf(p, today) === 'active');
  const product = productsFromPromotions(list).find((p) => p.id === productId);
  if (!product) return null;
  const unit = compareUnitOf(product.unit);
  const identical = active.filter((p) => p.productId === productId).sort(byUnitPrice);
  const alternatives = active
    .filter(
      (p) =>
        p.productId !== productId &&
        p.categoryId === product.categoryId &&
        compareUnitOf(p.packaging.unit) === unit,
    )
    .sort(byUnitPrice);
  return { product, identical, alternatives };
}

export function searchProducts(list: Promotion[], query: string, today: string): Product[] {
  const visible = list.filter((p) => isPubliclyVisible(p, today) && matchesQuery(p, query));
  return productsFromPromotions(visible);
}

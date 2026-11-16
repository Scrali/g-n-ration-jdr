import type { Category } from './types';

export const CATEGORIES: Category[] = [
  { id: 'fruits-legumes', name: 'Fruits & légumes', icon: '🥕', parentId: null },
  { id: 'laitiers-oeufs', name: 'Produits laitiers & œufs', icon: '🥛', parentId: null },
  { id: 'viande-poisson', name: 'Viande & poisson', icon: '🐟', parentId: null },
  { id: 'pain', name: 'Pain & boulangerie', icon: '🥖', parentId: null },
  { id: 'epicerie', name: 'Épicerie', icon: '🥫', parentId: null },
  { id: 'boissons', name: 'Boissons', icon: '🧃', parentId: null },
  { id: 'surgeles', name: 'Surgelés', icon: '🧊', parentId: null },
  { id: 'hygiene', name: 'Hygiène & beauté', icon: '🧴', parentId: null },
  { id: 'menage', name: 'Ménage', icon: '🧽', parentId: null },
  { id: 'bebe', name: 'Bébé', icon: '🍼', parentId: null },
  { id: 'animaux', name: 'Animaux', icon: '🐾', parentId: null },
];

export function categoryById(id: string | null | undefined): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

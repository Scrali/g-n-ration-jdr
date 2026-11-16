/** Modèle pur de la liste de courses (testable sans React ni navigateur). */

export interface ShoppingListItem {
  id: string;
  label: string;
  /** Produit de référence s'il a été choisi dans le catalogue, sinon saisie libre. */
  productId: string | null;
  categoryId: string | null;
  quantity: number;
  checked: boolean;
  addedAt: string;
}

export interface ShoppingList {
  version: 1;
  items: ShoppingListItem[];
}

export const EMPTY_LIST: ShoppingList = { version: 1, items: [] };
export const MAX_QUANTITY = 99;

export type ListAction =
  | { type: 'add'; item: Omit<ShoppingListItem, 'checked' | 'quantity'> & { quantity?: number } }
  | { type: 'setQuantity'; id: string; quantity: number }
  | { type: 'toggle'; id: string }
  | { type: 'remove'; id: string }
  | { type: 'clearChecked' }
  | { type: 'clear' };

function clampQuantity(q: number): number {
  if (!Number.isFinite(q)) return 1;
  return Math.min(MAX_QUANTITY, Math.max(1, Math.round(q)));
}

export function listReducer(state: ShoppingList, action: ListAction): ShoppingList {
  switch (action.type) {
    case 'add': {
      const label = action.item.label.trim().slice(0, 120);
      if (!label) return state;
      const qty = clampQuantity(action.item.quantity ?? 1);
      // Même produit du catalogue déjà présent : on augmente la quantité.
      const existing = state.items.find(
        (i) =>
          (action.item.productId !== null && i.productId === action.item.productId) ||
          (action.item.productId === null && i.productId === null && i.label.toLowerCase() === label.toLowerCase()),
      );
      if (existing) {
        return listReducer(state, { type: 'setQuantity', id: existing.id, quantity: existing.quantity + qty });
      }
      return { ...state, items: [...state.items, { ...action.item, label, quantity: qty, checked: false }] };
    }
    case 'setQuantity':
      return {
        ...state,
        items: state.items.map((i) => (i.id === action.id ? { ...i, quantity: clampQuantity(action.quantity) } : i)),
      };
    case 'toggle':
      return { ...state, items: state.items.map((i) => (i.id === action.id ? { ...i, checked: !i.checked } : i)) };
    case 'remove':
      return { ...state, items: state.items.filter((i) => i.id !== action.id) };
    case 'clearChecked':
      return { ...state, items: state.items.filter((i) => !i.checked) };
    case 'clear':
      return EMPTY_LIST;
  }
}

/** Valide une liste lue depuis le stockage local (données potentiellement corrompues). */
export function sanitizeList(raw: unknown): ShoppingList {
  if (!raw || typeof raw !== 'object' || !Array.isArray((raw as ShoppingList).items)) return EMPTY_LIST;
  const items = (raw as ShoppingList).items
    .filter(
      (i): i is ShoppingListItem =>
        !!i && typeof i.id === 'string' && typeof i.label === 'string' && i.label.trim() !== '',
    )
    .map((i) => ({
      id: i.id,
      label: i.label.slice(0, 120),
      productId: typeof i.productId === 'string' ? i.productId : null,
      categoryId: typeof i.categoryId === 'string' ? i.categoryId : null,
      quantity: clampQuantity(Number(i.quantity)),
      checked: Boolean(i.checked),
      addedAt: typeof i.addedAt === 'string' ? i.addedAt : new Date(0).toISOString(),
    }));
  return { version: 1, items };
}

export function groupByCategory(items: ShoppingListItem[]): Map<string | null, ShoppingListItem[]> {
  const groups = new Map<string | null, ShoppingListItem[]>();
  for (const item of items) {
    const list = groups.get(item.categoryId) ?? [];
    list.push(item);
    groups.set(item.categoryId, list);
  }
  return groups;
}

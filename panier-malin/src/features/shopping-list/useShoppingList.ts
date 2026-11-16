import { useCallback, useSyncExternalStore } from 'react';
import { readJSON, writeJSON } from '../../lib/storage';
import { EMPTY_LIST, listReducer, sanitizeList, type ListAction, type ShoppingList } from './listModel';

/**
 * Liste de courses conservée localement (sans compte).
 * Phase 6 : synchronisation avec Supabase pour les utilisateurs connectés.
 */
const KEY = 'pms.shoppingList.v1';

let state: ShoppingList | null = null;
let persisted = true;
const listeners = new Set<() => void>();

function current(): ShoppingList {
  state ??= sanitizeList(readJSON<unknown>(KEY, EMPTY_LIST));
  return state;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      state = sanitizeList(readJSON<unknown>(KEY, EMPTY_LIST));
      listener();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

export function dispatchList(action: ListAction) {
  state = listReducer(current(), action);
  persisted = writeJSON(KEY, state);
  listeners.forEach((l) => l());
}

export function useShoppingList() {
  const list = useSyncExternalStore(subscribe, current, () => EMPTY_LIST);
  const dispatch = useCallback((a: ListAction) => dispatchList(a), []);
  return { list, dispatch, persisted };
}

export function newItemId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `item-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

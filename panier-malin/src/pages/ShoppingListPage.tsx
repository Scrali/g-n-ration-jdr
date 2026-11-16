import { useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../data/DataContext';
import { CATEGORIES, categoryById } from '../data/categories';
import { productsFromPromotions } from '../lib/compare';
import { isPubliclyVisible, normalizeText, statusOf } from '../lib/promotions';
import { formatCHF } from '../lib/money';
import { costForCount } from '../lib/units';
import { groupByCategory, MAX_QUANTITY, type ShoppingListItem } from '../features/shopping-list/listModel';
import { newItemId, useShoppingList } from '../features/shopping-list/useShoppingList';
import { EmptyState, Notice, PageHeader } from '../components/ui';
import type { Product } from '../data/types';

export function ShoppingListPage() {
  const { list, dispatch, persisted } = useShoppingList();
  const { snapshot, today } = useData();
  const [label, setLabel] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [selected, setSelected] = useState<Product | null>(null);

  const active = useMemo(
    () => snapshot.promotions.filter((p) => isPubliclyVisible(p, today) && statusOf(p, today) === 'active'),
    [snapshot.promotions, today],
  );
  const catalog = useMemo(() => productsFromPromotions(active), [active]);
  const suggestions = useMemo(() => {
    const q = normalizeText(label);
    if (!q || selected) return [];
    return catalog.filter((p) => normalizeText(p.name).includes(q)).slice(0, 6);
  }, [label, catalog, selected]);

  /** Prix le plus bas connu (offre en cours) pour un article, toutes enseignes confondues. */
  function lowestKnown(item: ShoppingListItem): number | null {
    if (!item.productId) return null;
    let best: number | null = null;
    for (const p of active) {
      if (p.productId !== item.productId) continue;
      const c = costForCount(item.quantity, p.promoPriceRappen, p.deal, p.referencePriceRappen);
      if (c !== null && (best === null || c < best)) best = c;
    }
    return best;
  }

  const toBuy = list.items.filter((i) => !i.checked);
  const priced = toBuy.map(lowestKnown);
  const knownTotal = priced.reduce<number>((s, v) => s + (v ?? 0), 0);
  const knownCount = priced.filter((v) => v !== null).length;

  function onAdd(e: FormEvent) {
    e.preventDefault();
    const name = selected?.name ?? label;
    if (!name.trim()) return;
    dispatch({
      type: 'add',
      item: {
        id: newItemId(),
        label: name,
        productId: selected?.id ?? null,
        categoryId: selected?.categoryId ?? (categoryId || null),
        addedAt: new Date().toISOString(),
      },
    });
    setLabel('');
    setSelected(null);
  }

  const groups = groupByCategory(list.items);
  const orderedGroups = [...CATEGORIES.map((c) => c.id), null].filter((id) => groups.has(id));

  return (
    <div>
      <PageHeader
        title="Ma liste de courses"
        lead="Conservée sur cet appareil, sans compte. Choisissez un produit du catalogue pour pouvoir le chiffrer."
      />

      {!persisted && (
        <div className="mb-4">
          <Notice tone="warn">
            Votre navigateur bloque l’enregistrement local : la liste sera perdue en fermant la page.
          </Notice>
        </div>
      )}

      <form onSubmit={onAdd} className="card mb-6 flex flex-col gap-3 p-4 md:flex-row md:items-end">
        <div className="relative flex-1">
          <label htmlFor="item-label" className="mb-1 block text-sm font-semibold">
            Article
          </label>
          <input
            id="item-label"
            className="field"
            placeholder="ex. lait, pommes, lessive…"
            value={selected?.name ?? label}
            onChange={(e) => {
              setSelected(null);
              setLabel(e.target.value);
            }}
            autoComplete="off"
            role="combobox"
            aria-expanded={suggestions.length > 0}
            aria-controls="item-suggestions"
            aria-autocomplete="list"
          />
          {suggestions.length > 0 && (
            <ul
              id="item-suggestions"
              role="listbox"
              className="card absolute inset-x-0 top-full z-20 mt-1 max-h-64 overflow-y-auto p-1"
            >
              {suggestions.map((p) => (
                <li key={p.id} role="option" aria-selected={false}>
                  <button
                    type="button"
                    className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-save-50"
                    onClick={() => setSelected(p)}
                  >
                    {p.name}
                    <span className="ml-2 text-xs text-muted">{categoryById(p.categoryId)?.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {selected && <p className="mt-1 text-xs text-save-700">✓ Produit du catalogue : il pourra être comparé.</p>}
        </div>
        {!selected && (
          <div className="md:w-56">
            <label htmlFor="item-cat" className="mb-1 block text-sm font-semibold">
              Catégorie
            </label>
            <select id="item-cat" className="field" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">Autre</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <button type="submit" className="btn-primary">
          Ajouter
        </button>
      </form>

      {list.items.length === 0 ? (
        <EmptyState title="Votre liste est vide" icon="📝">
          <p>
            Ajoutez des articles ci-dessus ou depuis la page <Link to="/promotions" className="text-save-700 underline">Promotions</Link>.
          </p>
        </EmptyState>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
          <div className="flex min-w-0 flex-col gap-5">
            {orderedGroups.map((gid) => {
              const cat = categoryById(gid);
              return (
                <section key={gid ?? 'autre'} aria-labelledby={`grp-${gid ?? 'autre'}`}>
                  <h2 id={`grp-${gid ?? 'autre'}`} className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
                    {cat ? `${cat.icon} ${cat.name}` : 'Autres'}
                  </h2>
                  <ul className="card divide-y divide-line">
                    {groups.get(gid)!.map((item) => {
                      const price = lowestKnown(item);
                      return (
                        <li key={item.id} className="flex items-center gap-3 px-3 py-2">
                          <input
                            id={`chk-${item.id}`}
                            type="checkbox"
                            className="size-5 accent-save-600"
                            checked={item.checked}
                            onChange={() => dispatch({ type: 'toggle', id: item.id })}
                          />
                          <label
                            htmlFor={`chk-${item.id}`}
                            className={`min-w-0 flex-1 ${item.checked ? 'text-muted line-through' : ''}`}
                          >
                            <span className="block truncate">{item.label}</span>
                            <span className="block text-xs text-muted">
                              {item.productId
                                ? price !== null
                                  ? `dès ${formatCHF(price)} en promotion`
                                  : 'aucune promotion en cours'
                                : 'saisie libre, non chiffrée'}
                            </span>
                          </label>
                          <div className="flex items-center" role="group" aria-label={`Quantité de ${item.label}`}>
                            <button
                              type="button"
                              className="grid size-9 place-items-center rounded-lg border border-line disabled:opacity-40"
                              onClick={() => dispatch({ type: 'setQuantity', id: item.id, quantity: item.quantity - 1 })}
                              disabled={item.quantity <= 1}
                              aria-label="Diminuer"
                            >
                              −
                            </button>
                            <span className="w-8 text-center tabular-nums" aria-live="polite">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              className="grid size-9 place-items-center rounded-lg border border-line disabled:opacity-40"
                              onClick={() => dispatch({ type: 'setQuantity', id: item.id, quantity: item.quantity + 1 })}
                              disabled={item.quantity >= MAX_QUANTITY}
                              aria-label="Augmenter"
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            className="grid size-9 place-items-center rounded-lg text-muted hover:bg-red-50 hover:text-red-700"
                            onClick={() => dispatch({ type: 'remove', id: item.id })}
                            aria-label={`Supprimer ${item.label}`}
                          >
                            ✕
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
          </div>

          <aside className="card h-fit p-4 lg:sticky lg:top-20">
            <h2 className="font-semibold">Coût estimé</h2>
            <p className="mt-2 text-3xl font-bold text-save-700">{formatCHF(knownTotal)}</p>
            <p className="mt-1 text-sm text-muted">
              Prix promotionnels les plus bas connus pour {knownCount} article{knownCount > 1 ? 's' : ''} sur {toBuy.length}{' '}
              à acheter. Les autres articles ne sont pas inclus.
            </p>
            <Link to="/panier" className="btn-primary mt-4 w-full">
              Comparer mon panier
            </Link>
            <div className="mt-3 flex gap-2">
              {list.items.some((i) => i.checked) && (
                <button type="button" className="btn-ghost flex-1" onClick={() => dispatch({ type: 'clearChecked' })}>
                  Retirer les cochés
                </button>
              )}
              <button
                type="button"
                className="btn-ghost flex-1"
                onClick={() => {
                  if (window.confirm('Vider toute la liste ?')) dispatch({ type: 'clear' });
                }}
              >
                Vider
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

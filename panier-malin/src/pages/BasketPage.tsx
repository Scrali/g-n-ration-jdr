import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../data/DataContext';
import { useShoppingList } from '../features/shopping-list/useShoppingList';
import { computeBasket, type BasketOptions } from '../lib/basket';
import { formatCHF } from '../lib/money';
import { CANTONS, type Canton, type PriceKind } from '../data/types';
import { EmptyState, Notice, PageHeader, RetailerTag } from '../components/ui';
import { formatPackaging } from '../lib/units';

export function BasketPage() {
  const { snapshot, today, retailerById } = useData();
  const { list } = useShoppingList();

  const candidates = snapshot.retailers.filter((r) => snapshot.promotions.some((p) => p.retailerId === r.id));
  const [excluded, setExcluded] = useState<string[]>([]);
  const [canton, setCanton] = useState<Canton | null>(null);
  const [maxStores, setMaxStores] = useState<number | null>(null);
  const [loyalty, setLoyalty] = useState(false);

  const items = list.items
    .filter((i) => !i.checked)
    .map((i) => ({ id: i.id, label: i.label, productId: i.productId, quantity: i.quantity }));
  const labelOf = (id: string) => items.find((i) => i.id === id)?.label ?? '';

  const options: BasketOptions = {
    retailerIds: candidates.map((r) => r.id).filter((id) => !excluded.includes(id)),
    canton,
    maxStores,
    priceKinds: (loyalty ? ['public', 'loyalty_card'] : ['public']) as PriceKind[],
  };
  const optionsKey = JSON.stringify(options);
  const itemsKey = JSON.stringify(items);
  const result = useMemo(
    () =>
      computeBasket(
        JSON.parse(itemsKey) as typeof items,
        snapshot.promotions,
        JSON.parse(optionsKey) as BasketOptions,
        today,
      ),
    [itemsKey, snapshot.promotions, optionsKey, today],
  );

  if (items.length === 0) {
    return (
      <div>
        <PageHeader title="Optimiser mon panier" />
        <EmptyState title="Aucun article à comparer" icon="🛒">
          <p>
            Commencez par remplir votre <Link to="/liste" className="text-save-700 underline">liste de courses</Link>.
          </p>
        </EmptyState>
      </div>
    );
  }

  const best = result.best;
  const fullStores = result.perRetailer.filter((r) => r.missingItemIds.length === 0);

  return (
    <div>
      <PageHeader
        title="Optimiser mon panier"
        lead="Calcul basé uniquement sur les promotions vérifiées en cours. Les articles sans offre connue ne sont pas chiffrés."
      />

      <div className="mb-6">
        <Notice tone="warn">
          Le coût et le temps de déplacement entre magasins ne sont pas encore pris en compte. Les prix normaux (hors
          promotion) ne sont pas encore connus : un magasin n’est jamais déclaré « moins cher » pour des articles qu’il
          ne propose pas en promotion.
        </Notice>
      </div>

      <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
        <aside className="card h-fit p-4" aria-label="Options du calcul">
          <fieldset>
            <legend className="mb-2 text-sm font-semibold">Magasins autorisés</legend>
            {candidates.length === 0 && <p className="text-sm text-muted">Aucun magasin avec des offres.</p>}
            <ul className="flex flex-col gap-1">
              {candidates.map((r) => (
                <li key={r.id}>
                  <label className="flex min-h-9 items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="size-4 accent-save-600"
                      checked={!excluded.includes(r.id)}
                      onChange={() =>
                        setExcluded((ex) => (ex.includes(r.id) ? ex.filter((x) => x !== r.id) : [...ex, r.id]))
                      }
                    />
                    {r.name}
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>
          <div className="mt-4">
            <label htmlFor="b-max" className="mb-1 block text-sm font-semibold">
              Nombre max. de magasins
            </label>
            <select
              id="b-max"
              className="field"
              value={maxStores ?? ''}
              onChange={(e) => setMaxStores(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">Sans limite</option>
              {[1, 2, 3].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-4">
            <label htmlFor="b-canton" className="mb-1 block text-sm font-semibold">
              Mon canton
            </label>
            <select
              id="b-canton"
              className="field"
              value={canton ?? ''}
              onChange={(e) => setCanton((e.target.value || null) as Canton | null)}
            >
              <option value="">Non précisé</option>
              {CANTONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <label className="mt-4 flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-0.5 size-4 accent-save-600"
              checked={loyalty}
              onChange={(e) => setLoyalty(e.target.checked)}
            />
            Inclure les prix réservés aux cartes de fidélité
          </label>
        </aside>

        <div className="flex min-w-0 flex-col gap-6">
          <section aria-labelledby="best" className="card p-4">
            <h2 id="best" className="text-lg font-semibold">
              Meilleure répartition
            </h2>
            {!best || best.coveredCount === 0 ? (
              <p className="mt-2 text-muted">Aucun article de votre liste n’a d’offre en cours dans les magasins choisis.</p>
            ) : (
              <>
                <p className="mt-2 text-3xl font-bold text-save-700">{formatCHF(best.totalRappen)}</p>
                <p className="text-sm text-muted">
                  pour {best.coveredCount} article{best.coveredCount > 1 ? 's' : ''} sur {items.length}, en{' '}
                  {best.retailerIds.length} magasin{best.retailerIds.length > 1 ? 's' : ''}
                </p>
                {result.savings && result.savings.itemsWithReference > 0 && (
                  <p className="mt-2 text-sm">
                    Économie estimée :{' '}
                    <strong className="text-save-700">{formatCHF(result.savings.rappen)}</strong>
                    <span className="block text-xs text-muted">
                      Par rapport aux prix de référence (« au lieu de ») affichés par les magasins, pour{' '}
                      {result.savings.itemsWithReference} article(s) sur {result.savings.itemsInBest} dont ce prix est connu.
                    </span>
                  </p>
                )}
                <div className="mt-4 flex flex-col gap-4">
                  {best.retailerIds.map((rid) => (
                    <div key={rid}>
                      <RetailerTag retailer={retailerById(rid)} />
                      <ul className="mt-2 divide-y divide-line rounded-xl border border-line">
                        {best.assignments
                          .filter((a) => a.retailerId === rid)
                          .map((a) => {
                            const qty = items.find((i) => i.id === a.itemId)?.quantity ?? 1;
                            return (
                              <li key={a.itemId} className="flex justify-between gap-3 px-3 py-2 text-sm">
                                <span>
                                  {qty} × {labelOf(a.itemId)}
                                  <span className="block text-xs text-muted">
                                    {formatPackaging(a.offer.promotion.packaging)}
                                  </span>
                                </span>
                                <span className="font-semibold tabular-nums">{formatCHF(a.offer.costRappen)}</span>
                              </li>
                            );
                          })}
                      </ul>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>

          {result.unpricedItemIds.length > 0 && (
            <section aria-labelledby="missing" className="card p-4">
              <h2 id="missing" className="font-semibold">
                Sans prix vérifié ({result.unpricedItemIds.length})
              </h2>
              <p className="text-sm text-muted">Aucune offre en cours connue, ou article saisi librement.</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {result.unpricedItemIds.map((id) => (
                  <li key={id} className="rounded-lg bg-ink/5 px-2 py-1 text-sm">
                    {labelOf(id)}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-labelledby="per-store">
            <h2 id="per-store" className="mb-2 font-semibold">
              Par magasin
            </h2>
            <div className="card overflow-x-auto">
              <table className="w-full min-w-[28rem] text-left text-sm">
                <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th scope="col" className="px-4 py-3">Magasin</th>
                    <th scope="col" className="px-4 py-3 text-right">Total connu</th>
                    <th scope="col" className="px-4 py-3 text-right">Couverture</th>
                  </tr>
                </thead>
                <tbody>
                  {result.perRetailer.map((r) => (
                    <tr key={r.retailerId} className="border-b border-line last:border-0">
                      <td className="px-4 py-3">
                        <RetailerTag retailer={retailerById(r.retailerId)} />
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {r.coveredItemIds.length ? formatCHF(r.totalRappen) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {r.coveredItemIds.length} / {items.length}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-muted">
              {fullStores.length === 0
                ? 'Aucun magasin ne couvre toute la liste : les totaux ne sont pas directement comparables.'
                : 'Les totaux ne sont comparables qu’entre magasins ayant la même couverture.'}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

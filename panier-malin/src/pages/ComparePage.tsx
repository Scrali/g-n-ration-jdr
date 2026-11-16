import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useData } from '../data/DataContext';
import { compareProduct, searchProducts } from '../lib/compare';
import { formatCHF } from '../lib/money';
import { formatDate } from '../lib/dates';
import { compareUnitLabel, describeDeal, formatPackaging } from '../lib/units';
import { promoUnitPrice } from '../lib/promotions';
import type { Promotion } from '../data/types';
import { DemoBadge, EmptyState, Notice, PageHeader, RetailerTag, Spinner } from '../components/ui';
import { categoryById } from '../data/categories';
import { t } from '../i18n';

function OfferTable({ offers, caption, highlightBest }: { offers: Promotion[]; caption: string; highlightBest: boolean }) {
  const { retailerById } = useData();
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[36rem] text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">Magasin</th>
            <th scope="col" className="px-4 py-3 font-semibold">Produit</th>
            <th scope="col" className="px-4 py-3 text-right font-semibold">Prix</th>
            <th scope="col" className="px-4 py-3 text-right font-semibold">Prix unitaire</th>
            <th scope="col" className="px-4 py-3 font-semibold">Conditions</th>
          </tr>
        </thead>
        <tbody>
          {offers.map((p, i) => {
            const u = promoUnitPrice(p);
            const best = highlightBest && i === 0 && offers.length > 1;
            const conditions = [
              describeDeal(p.deal),
              p.priceKind === 'loyalty_card' ? 'Carte de fidélité' : null,
              p.priceKind === 'conditional' ? 'Conditionnelle' : null,
              p.scope.type === 'regional' ? `Cantons : ${p.scope.cantons.join(', ')}` : null,
              `jusqu’au ${formatDate(p.validUntil)}`,
            ].filter(Boolean);
            return (
              <tr key={p.id} className={`border-b border-line last:border-0 ${best ? 'bg-save-50' : ''}`}>
                <td className="px-4 py-3">
                  <RetailerTag retailer={retailerById(p.retailerId)} />
                  {p.isDemo && (
                    <span className="ml-2">
                      <DemoBadge />
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {p.productName}
                  <span className="block text-xs text-muted">{formatPackaging(p.packaging)}</span>
                </td>
                <td className="px-4 py-3 text-right font-semibold">{formatCHF(p.promoPriceRappen)}</td>
                <td className="px-4 py-3 text-right">
                  <span className={best ? 'font-bold text-save-700' : ''}>
                    {formatCHF(u.rappen)} / {compareUnitLabel(u.unit)}
                  </span>
                  {best && <span className="block text-xs text-save-700">Le plus bas</span>}
                </td>
                <td className="px-4 py-3 text-xs text-muted">{conditions.join(' · ')}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function ComparePage() {
  const { snapshot, status, today, demo, setDemo } = useData();
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const productId = params.get('produit');

  const matches = useMemo(() => searchProducts(snapshot.promotions, query, today), [snapshot.promotions, query, today]);
  const comparison = useMemo(
    () => (productId ? compareProduct(productId, snapshot.promotions, today) : null),
    [productId, snapshot.promotions, today],
  );

  function set(key: string, value: string | null) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: key === 'q' });
  }

  return (
    <div>
      <PageHeader
        title="Comparer un produit"
        lead="Comparez le prix total et le prix au kilo, au litre ou à la pièce. Seuls les produits strictement identiques sont comparés directement."
      />

      <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
        <div>
          <label htmlFor="cmp-search" className="mb-1 block text-sm font-semibold">
            Produit
          </label>
          <input
            id="cmp-search"
            type="search"
            className="field"
            placeholder="ex. spaghetti"
            value={query}
            onChange={(e) => set('q', e.target.value)}
            autoComplete="off"
          />
          {status === 'loading' ? (
            <Spinner />
          ) : (
            <ul className="mt-3 flex max-h-[28rem] flex-col gap-1 overflow-y-auto" aria-label="Produits trouvés">
              {matches.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => set('produit', p.id)}
                    aria-current={p.id === productId ? 'true' : undefined}
                    className={`w-full rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                      p.id === productId ? 'bg-save-50 font-semibold text-save-700' : 'hover:bg-white'
                    }`}
                  >
                    {p.name}
                    <span className="block text-xs font-normal text-muted">{categoryById(p.categoryId)?.name}</span>
                  </button>
                </li>
              ))}
              {matches.length === 0 && snapshot.promotions.length > 0 && (
                <li className="px-3 py-2 text-sm text-muted">Aucun produit trouvé.</li>
              )}
            </ul>
          )}
        </div>

        <section aria-live="polite" className="min-w-0">
          {snapshot.promotions.length === 0 && status === 'ready' ? (
            <EmptyState title={t('data.noneTitle')} icon="⇄">
              <p>{t('data.noneText')}</p>
              {!demo && (
                <button type="button" className="btn-ghost mt-4" onClick={() => setDemo(true)}>
                  {t('demo.enable')}
                </button>
              )}
            </EmptyState>
          ) : !comparison ? (
            <EmptyState title="Choisissez un produit" icon="⇄">
              <p>Sélectionnez un produit dans la liste pour voir les offres en cours chez les différents magasins.</p>
            </EmptyState>
          ) : (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-bold">{comparison.product.name}</h2>
                <p className="text-sm text-muted">Offres en cours pour ce produit exact</p>
              </div>
              {comparison.identical.length === 0 ? (
                <Notice tone="warn">Aucune offre en cours pour ce produit aujourd’hui.</Notice>
              ) : (
                <>
                  <OfferTable offers={comparison.identical} caption="Offres pour le même produit" highlightBest />
                  {comparison.identical.length === 1 && (
                    <Notice>Une seule offre connue : pas de comparaison possible pour l’instant.</Notice>
                  )}
                </>
              )}

              <div>
                <h3 className="text-lg font-semibold">Alternatives similaires</h3>
                <p className="mb-3 text-sm text-muted">
                  Même catégorie et même unité de comparaison, mais produit différent (marque, qualité ou composition
                  peuvent varier). Ne sont pas considérées comme équivalentes.
                </p>
                {comparison.alternatives.length === 0 ? (
                  <p className="text-sm text-muted">Aucune alternative en promotion actuellement.</p>
                ) : (
                  <OfferTable
                    offers={comparison.alternatives}
                    caption="Alternatives similaires"
                    highlightBest={false}
                  />
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

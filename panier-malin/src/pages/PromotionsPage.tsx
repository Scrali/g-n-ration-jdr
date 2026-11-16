import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useData } from '../data/DataContext';
import { CATEGORIES } from '../data/categories';
import { CANTONS, type Canton, type PriceKind } from '../data/types';
import {
  DEFAULT_FILTERS,
  filterPromotions,
  sortPromotions,
  type PeriodFilter,
  type PromotionFilters,
  type SortKey,
} from '../lib/promotions';
import { parseCHF } from '../lib/money';
import { PromotionCard } from '../components/PromotionCard';
import { EmptyState, PageHeader, Spinner } from '../components/ui';
import { t } from '../i18n';

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'ending', label: 'Fin la plus proche' },
  { key: 'discount', label: 'Plus forte réduction' },
  { key: 'price', label: 'Prix le plus bas' },
  { key: 'unitPrice', label: 'Prix au kg / l le plus bas' },
];

const KINDS: { key: PriceKind; label: string }[] = [
  { key: 'public', label: 'Prix public' },
  { key: 'loyalty_card', label: 'Carte de fidélité' },
  { key: 'conditional', label: 'Conditionnelle' },
];

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function PromotionsPage() {
  const { snapshot, status, today, demo, setDemo } = useData();
  const [params, setParams] = useSearchParams();
  const [sort, setSort] = useState<SortKey>('ending');
  const [maxPrice, setMaxPrice] = useState('');
  const [minDiscount, setMinDiscount] = useState<number | null>(null);
  const [canton, setCanton] = useState<Canton | null>(null);
  const [period, setPeriod] = useState<PeriodFilter>('current');
  const [priceKinds, setPriceKinds] = useState<PriceKind[]>(DEFAULT_FILTERS.priceKinds);
  const [showFilters, setShowFilters] = useState(false);

  const query = params.get('q') ?? '';
  const retailerIds = params.getAll('enseigne');
  const categoryIds = params.getAll('cat');

  function updateParam(key: string, values: string[]) {
    const next = new URLSearchParams(params);
    next.delete(key);
    values.forEach((v) => next.append(key, v));
    setParams(next, { replace: true });
  }

  const filters: PromotionFilters = {
    query,
    retailerIds,
    categoryIds,
    maxPriceRappen: maxPrice.trim() ? parseCHF(maxPrice) : null,
    minDiscount,
    canton,
    period,
    priceKinds,
  };

  const filterKey = JSON.stringify(filters);
  const results = useMemo(
    () => sortPromotions(filterPromotions(snapshot.promotions, JSON.parse(filterKey) as PromotionFilters, today), sort),
    [snapshot.promotions, today, sort, filterKey],
  );

  const retailersWithOffers = snapshot.retailers.filter((r) => snapshot.promotions.some((p) => p.retailerId === r.id));
  const activeFilterCount =
    retailerIds.length + categoryIds.length + (maxPrice ? 1 : 0) + (minDiscount ? 1 : 0) + (canton ? 1 : 0) +
    (priceKinds.length !== KINDS.length ? 1 : 0);

  function resetFilters() {
    setParams(query ? { q: query } : {}, { replace: true });
    setMaxPrice('');
    setMinDiscount(null);
    setCanton(null);
    setPriceKinds(DEFAULT_FILTERS.priceKinds);
  }

  const filterPanel = (
    <div className="flex flex-col gap-5">
      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Période</legend>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ['current', 'En cours'],
              ['upcoming', 'À venir'],
              ['all', 'Toutes'],
            ] as const
          ).map(([key, label]) => (
            <button key={key} type="button" className="chip" aria-pressed={period === key} onClick={() => setPeriod(key)}>
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      {retailersWithOffers.length > 0 && (
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">Magasins</legend>
          <div className="flex flex-wrap gap-2">
            {retailersWithOffers.map((r) => (
              <button
                key={r.id}
                type="button"
                className="chip"
                aria-pressed={retailerIds.includes(r.id)}
                onClick={() => updateParam('enseigne', toggle(retailerIds, r.id))}
              >
                {r.name}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Catégories</legend>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              className="chip"
              aria-pressed={categoryIds.includes(c.id)}
              onClick={() => updateParam('cat', toggle(categoryIds, c.id))}
            >
              <span aria-hidden>{c.icon}</span> {c.name}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="max-price" className="mb-1 block text-sm font-semibold">
            Prix max. (CHF)
          </label>
          <input
            id="max-price"
            inputMode="decimal"
            className="field"
            placeholder="ex. 5.00"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            aria-invalid={maxPrice.trim() !== '' && parseCHF(maxPrice) === null}
          />
        </div>
        <div>
          <label htmlFor="min-discount" className="mb-1 block text-sm font-semibold">
            Réduction min.
          </label>
          <select
            id="min-discount"
            className="field"
            value={minDiscount ?? ''}
            onChange={(e) => setMinDiscount(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">Toutes</option>
            {[10, 20, 30, 40, 50].map((v) => (
              <option key={v} value={v}>
                {v} % et plus
              </option>
            ))}
          </select>
        </div>
      </div>
      {minDiscount !== null && (
        <p className="-mt-3 text-xs text-muted">
          Les offres sans prix de référence connu sont exclues de ce filtre, leur réduction ne pouvant pas être calculée.
        </p>
      )}

      <div>
        <label htmlFor="canton" className="mb-1 block text-sm font-semibold">
          Mon canton
        </label>
        <select
          id="canton"
          className="field"
          value={canton ?? ''}
          onChange={(e) => setCanton((e.target.value || null) as Canton | null)}
        >
          <option value="">Toute la Suisse</option>
          {CANTONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-muted">Masque les offres locales réservées à d’autres cantons.</p>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Type de prix</legend>
        <div className="flex flex-wrap gap-2">
          {KINDS.map((k) => (
            <button
              key={k.key}
              type="button"
              className="chip"
              aria-pressed={priceKinds.includes(k.key)}
              onClick={() => setPriceKinds(toggle(priceKinds, k.key))}
            >
              {k.label}
            </button>
          ))}
        </div>
      </fieldset>

      {activeFilterCount > 0 && (
        <button type="button" className="btn-ghost" onClick={resetFilters}>
          Réinitialiser les filtres
        </button>
      )}
    </div>
  );

  return (
    <div>
      <PageHeader title="Toutes les promotions" lead="Uniquement des offres vérifiées et non expirées." />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="promo-search" className="sr-only">
            Rechercher dans les promotions
          </label>
          <input
            id="promo-search"
            type="search"
            className="field"
            placeholder="Rechercher un produit…"
            value={query}
            onChange={(e) => {
              const next = new URLSearchParams(params);
              if (e.target.value) next.set('q', e.target.value);
              else next.delete('q');
              setParams(next, { replace: true });
            }}
          />
        </div>
        <div className="flex gap-2">
          <label htmlFor="sort" className="sr-only">
            Trier par
          </label>
          <select id="sort" className="field sm:w-60" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn-ghost lg:hidden"
            aria-expanded={showFilters}
            aria-controls="filters-mobile"
            onClick={() => setShowFilters((v) => !v)}
          >
            Filtres{activeFilterCount > 0 && ` (${activeFilterCount})`}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
        <aside aria-label="Filtres" className="hidden lg:block">
          <div className="card sticky top-20 p-4">{filterPanel}</div>
        </aside>
        {showFilters && (
          <div id="filters-mobile" className="card p-4 lg:hidden">
            {filterPanel}
          </div>
        )}

        <section aria-labelledby="results-count" className="min-w-0">
          <p id="results-count" aria-live="polite" className="mb-3 text-sm text-muted">
            {status === 'ready' && `${results.length} offre${results.length > 1 ? 's' : ''}`}
          </p>
          {status === 'loading' ? (
            <Spinner />
          ) : snapshot.promotions.length === 0 ? (
            <EmptyState title={t('data.noneTitle')} icon="🔎">
              <p>{t('data.noneText')}</p>
              {!demo && (
                <button type="button" className="btn-ghost mt-4" onClick={() => setDemo(true)}>
                  {t('demo.enable')}
                </button>
              )}
            </EmptyState>
          ) : results.length === 0 ? (
            <EmptyState title="Aucune offre ne correspond" icon="🧺">
              <p>Essayez un autre mot ou retirez des filtres.</p>
              {activeFilterCount > 0 && (
                <button type="button" className="btn-ghost mt-4" onClick={resetFilters}>
                  Réinitialiser les filtres
                </button>
              )}
            </EmptyState>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((p) => (
                <PromotionCard key={p.id} promo={p} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

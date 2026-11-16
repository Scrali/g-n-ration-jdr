import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../data/DataContext';
import { CATEGORIES } from '../data/categories';
import { filterPromotions, DEFAULT_FILTERS, sortPromotions } from '../lib/promotions';
import { formatDateTime } from '../lib/dates';
import { PromotionCard } from '../components/PromotionCard';
import { EmptyState, Spinner } from '../components/ui';
import { t } from '../i18n';

export function HomePage() {
  const { snapshot, status, today, demo, setDemo } = useData();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const current = useMemo(
    () => filterPromotions(snapshot.promotions, DEFAULT_FILTERS, today),
    [snapshot.promotions, today],
  );
  // Sélection factuelle : les offres qui se terminent le plus tôt (aucun « classement » inventé).
  const endingSoon = useMemo(() => sortPromotions(current, 'ending').slice(0, 6), [current]);
  const retailersWithData = new Set(current.map((p) => p.retailerId));
  const retailers = snapshot.retailers;

  function onSearch(e: FormEvent) {
    e.preventDefault();
    navigate(`/promotions${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`);
  }

  return (
    <div className="flex flex-col gap-10">
      <section className="pt-2 text-center md:pt-8">
        <h1 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight md:text-5xl">
          Faites vos courses <span className="text-save-600">au meilleur prix</span>.
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-muted">{t('app.tagline')}</p>
        <form role="search" onSubmit={onSearch} className="mx-auto mt-6 flex max-w-xl gap-2">
          <label htmlFor="home-search" className="sr-only">
            Rechercher un produit
          </label>
          <input
            id="home-search"
            type="search"
            className="field min-h-12 text-lg"
            placeholder="Lait, café, pâtes…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
          <button type="submit" className="btn-primary min-h-12 px-5">
            Rechercher
          </button>
        </form>
        <p className="mt-3 text-sm text-muted">
          Dernière mise à jour :{' '}
          {snapshot.lastUpdatedAt ? formatDateTime(snapshot.lastUpdatedAt) : 'aucune donnée publiée pour le moment'}
        </p>
      </section>

      <section aria-labelledby="quick">
        <h2 id="quick" className="sr-only">
          Accès rapides
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { to: '/promotions', title: 'Toutes les promotions', text: 'Filtrer par magasin, catégorie, prix.' },
            { to: '/comparer', title: 'Comparer un produit', text: 'Prix au kilo, au litre ou à la pièce.' },
            { to: '/liste', title: 'Ma liste de courses', text: 'Puis trouver le panier le moins cher.' },
          ].map((c) => (
            <Link key={c.to} to={c.to} className="card group p-4 transition-colors hover:border-save-600">
              <h3 className="font-semibold group-hover:text-save-700">{c.title} →</h3>
              <p className="mt-1 text-sm text-muted">{c.text}</p>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="ending">
        <div className="mb-4 flex items-end justify-between gap-2">
          <div>
            <h2 id="ending" className="text-xl font-bold">
              Se terminent bientôt
            </h2>
            <p className="text-sm text-muted">Promotions vérifiées en cours, triées par date de fin.</p>
          </div>
          {current.length > 0 && (
            <Link to="/promotions" className="text-sm font-semibold text-save-700 hover:underline">
              Voir les {current.length} offres
            </Link>
          )}
        </div>
        {status === 'loading' ? (
          <Spinner />
        ) : endingSoon.length === 0 ? (
          <EmptyState title={t('data.noneTitle')} icon="🔎">
            <p>{t('data.noneText')}</p>
            {!demo && (
              <button type="button" className="btn-ghost mt-4" onClick={() => setDemo(true)}>
                {t('demo.enable')}
              </button>
            )}
          </EmptyState>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {endingSoon.map((p) => (
              <PromotionCard key={p.id} promo={p} />
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="cats">
        <h2 id="cats" className="mb-4 text-xl font-bold">
          Catégories
        </h2>
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((c) => (
            <li key={c.id}>
              <Link
                to={`/promotions?cat=${c.id}`}
                className="card flex min-h-14 items-center gap-2 px-3 py-2 text-sm font-medium hover:border-save-600"
              >
                <span aria-hidden className="text-xl">
                  {c.icon}
                </span>
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="stores">
        <h2 id="stores" className="mb-1 text-xl font-bold">
          Magasins
        </h2>
        <p className="mb-4 text-sm text-muted">
          Une enseigne n’apparaît comme « disponible » que lorsque ses offres proviennent d’une source vérifiée.
        </p>
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {retailers.map((r) => {
            const has = retailersWithData.has(r.id);
            return (
              <li key={r.id}>
                {has ? (
                  <Link
                    to={`/promotions?enseigne=${r.id}`}
                    className="card flex flex-col px-3 py-2 hover:border-save-600"
                  >
                    <span className="font-medium">{r.name}</span>
                    <span className="text-xs text-save-700">Offres disponibles</span>
                  </Link>
                ) : (
                  <div className="card flex flex-col px-3 py-2 opacity-80">
                    <span className="font-medium">{r.name}</span>
                    <span className="text-xs text-muted">Source en cours de vérification</span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

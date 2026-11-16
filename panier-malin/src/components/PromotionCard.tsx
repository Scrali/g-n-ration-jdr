import type { Promotion } from '../data/types';
import { useData } from '../data/DataContext';
import { categoryById } from '../data/categories';
import { formatCHF } from '../lib/money';
import { formatDate, formatDateTime } from '../lib/dates';
import { compareUnitLabel, describeDeal, formatPackaging } from '../lib/units';
import { freshnessWarning, promoDiscount, promoEffectiveUnitPrice, promoUnitPrice, statusOf } from '../lib/promotions';
import { DemoBadge, RetailerTag } from './ui';
import { dispatchList, newItemId } from '../features/shopping-list/useShoppingList';
import { useState } from 'react';

const PRICE_KIND_LABEL = {
  public: null,
  loyalty_card: 'Avec carte de fidélité',
  conditional: 'Offre conditionnelle',
} as const;

export function PromotionCard({ promo }: { promo: Promotion }) {
  const { retailerById, today } = useData();
  const [added, setAdded] = useState(false);
  const retailer = retailerById(promo.retailerId);
  const discount = promoDiscount(promo);
  const unit = promoUnitPrice(promo);
  const deal = describeDeal(promo.deal);
  const effective = promo.deal.type === 'multi_buy' ? promoEffectiveUnitPrice(promo) : null;
  const status = statusOf(promo, today);
  const stale = freshnessWarning(promo, new Date());
  const kindLabel = PRICE_KIND_LABEL[promo.priceKind];
  const category = categoryById(promo.categoryId);

  function addToList() {
    dispatchList({
      type: 'add',
      item: {
        id: newItemId(),
        label: promo.productName,
        productId: promo.productId,
        categoryId: promo.categoryId,
        addedAt: new Date().toISOString(),
      },
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  return (
    <article className="card flex flex-col p-4" aria-labelledby={`promo-${promo.id}`}>
      <div className="flex items-start justify-between gap-2">
        <RetailerTag retailer={retailer} />
        <div className="flex flex-wrap justify-end gap-1">
          {promo.isDemo && <DemoBadge />}
          {status === 'upcoming' && (
            <span className="rounded-md bg-sky-50 px-1.5 py-0.5 text-[11px] font-semibold text-sky-800">À venir</span>
          )}
          {discount !== null && (
            <span className="rounded-md bg-save-600 px-1.5 py-0.5 text-xs font-bold text-white">−{discount} %</span>
          )}
        </div>
      </div>

      <div className="mt-3 flex-1">
        <h3 id={`promo-${promo.id}`} className="font-semibold leading-snug">
          {promo.productName}
        </h3>
        <p className="mt-0.5 text-sm text-muted">
          {[promo.brand, formatPackaging(promo.packaging), category?.name].filter(Boolean).join(' · ')}
        </p>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-save-700">{formatCHF(promo.promoPriceRappen)}</span>
          {promo.referencePriceRappen !== null && (
            <span className="text-sm text-muted line-through">
              <span className="sr-only">au lieu de </span>
              {formatCHF(promo.referencePriceRappen)}
            </span>
          )}
        </div>
        <p className="text-sm text-muted">
          {formatCHF(unit.rappen)} / {compareUnitLabel(unit.unit)}
          {effective && (
            <>
              {' '}
              · <span className="text-save-700">{formatCHF(effective.rappen)} / {compareUnitLabel(effective.unit)}</span> en
              profitant de l’offre
            </>
          )}
        </p>

        {(deal || kindLabel || promo.conditions || promo.scope.type !== 'national') && (
          <ul className="mt-3 flex flex-wrap gap-1.5 text-xs">
            {deal && <li className="rounded-md bg-save-50 px-2 py-1 font-semibold text-save-700">{deal}</li>}
            {kindLabel && <li className="rounded-md bg-violet-50 px-2 py-1 text-violet-800">{kindLabel}</li>}
            {promo.scope.type === 'regional' && (
              <li className="rounded-md bg-ink/5 px-2 py-1">Uniquement : {promo.scope.cantons.join(', ')}</li>
            )}
            {promo.scope.type === 'online_only' && <li className="rounded-md bg-ink/5 px-2 py-1">En ligne uniquement</li>}
          </ul>
        )}
        {promo.conditions && promo.conditions !== deal && <p className="mt-2 text-xs text-muted">{promo.conditions}</p>}
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-1 border-t border-line pt-3 text-xs text-muted">
        <dt>Validité</dt>
        <dd className="text-right text-ink">
          {formatDate(promo.validFrom)} – {formatDate(promo.validUntil)}
        </dd>
        <dt>Vérifiée le</dt>
        <dd className={`text-right ${stale ? 'text-warn-700' : 'text-ink'}`}>
          {formatDateTime(promo.lastVerifiedAt)}
          {stale && <span className="block">Fraîcheur non garantie</span>}
        </dd>
        <dt>Source</dt>
        <dd className="text-right">
          {promo.sourceUrl ? (
            <a href={promo.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-save-700 underline">
              Site officiel<span className="sr-only"> (nouvel onglet)</span>
            </a>
          ) : (
            <span>{promo.isDemo ? 'Fictive (démo)' : 'Non indiquée'}</span>
          )}
        </dd>
      </dl>

      <button type="button" onClick={addToList} className="btn-ghost mt-3 w-full" aria-live="polite">
        {added ? '✓ Ajouté à ma liste' : '+ Ajouter à ma liste'}
      </button>
    </article>
  );
}

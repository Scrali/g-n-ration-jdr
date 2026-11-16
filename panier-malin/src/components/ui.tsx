import type { ReactNode } from 'react';
import type { Retailer } from '../data/types';

export function PageHeader({ title, lead, children }: { title: string; lead?: ReactNode; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
        {lead && <p className="mt-1 max-w-2xl text-muted">{lead}</p>}
      </div>
      {children}
    </div>
  );
}

export function EmptyState({ title, children, icon = '🛒' }: { title: string; children?: ReactNode; icon?: string }) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-12 text-center">
      <span aria-hidden className="text-4xl">
        {icon}
      </span>
      <h2 className="text-lg font-semibold">{title}</h2>
      {children && <div className="max-w-md text-muted">{children}</div>}
    </div>
  );
}

export function Notice({ tone = 'info', children }: { tone?: 'info' | 'warn'; children: ReactNode }) {
  const cls =
    tone === 'warn' ? 'border-amber-200 bg-warn-50 text-warn-700' : 'border-save-100 bg-save-50 text-save-700';
  return <div className={`rounded-xl border px-4 py-3 text-sm ${cls}`}>{children}</div>;
}

/** Pastille neutre d'enseigne (aucun logo ni couleur de marque). */
export function RetailerTag({ retailer }: { retailer: Retailer | undefined }) {
  if (!retailer) return <span className="text-sm text-muted">Enseigne inconnue</span>;
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium">
      <span aria-hidden className="grid size-6 place-items-center rounded-md bg-ink/5 text-xs font-bold text-ink/70">
        {retailer.name.replace('Magasin Démo ', '').charAt(0)}
      </span>
      {retailer.name}
    </span>
  );
}

export function DemoBadge() {
  return (
    <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-warn-700">
      Démo
    </span>
  );
}

export function Spinner({ label = 'Chargement…' }: { label?: string }) {
  return (
    <div role="status" className="flex items-center gap-2 py-8 text-muted">
      <span aria-hidden className="size-4 animate-spin rounded-full border-2 border-save-600 border-t-transparent" />
      {label}
    </div>
  );
}

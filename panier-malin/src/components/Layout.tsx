import { useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useData } from '../data/DataContext';
import { t, type MessageKey } from '../i18n';
import { useShoppingList } from '../features/shopping-list/useShoppingList';

// Icônes au trait (24×24), dessinées pour ce site.
const ICONS = {
  home: 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z',
  promo: 'M20 12l-8 8-9-9V3h8zM7.5 7.5h.01',
  compare: 'M7 4v16M7 20l-3-3M7 20l3-3M17 20V4M17 4l-3 3M17 4l3 3',
  list: 'M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01',
  basket: 'M3 5h2l2.4 10.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 8H6M9 20h.01M17 20h.01',
} as const;

function Icon({ name }: { name: keyof typeof ICONS }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={ICONS[name]} />
    </svg>
  );
}

const NAV: { to: string; key: MessageKey; icon: keyof typeof ICONS }[] = [
  { to: '/', key: 'nav.home', icon: 'home' },
  { to: '/promotions', key: 'nav.promotions', icon: 'promo' },
  { to: '/comparer', key: 'nav.compare', icon: 'compare' },
  { to: '/liste', key: 'nav.list', icon: 'list' },
  { to: '/panier', key: 'nav.basket', icon: 'basket' },
];

function navClass({ isActive }: { isActive: boolean }) {
  return `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-save-50 text-save-700' : 'text-muted hover:text-ink'
  }`;
}

export function Layout() {
  const { demo, setDemo } = useData();
  const { pathname } = useLocation();
  // Nouvelle page : on revient en haut (le HashRouter ne le fait pas seul).
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  const { list } = useShoppingList();
  const remaining = list.items.filter((i) => !i.checked).length;

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#contenu" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 btn-primary">
        Aller au contenu
      </a>

      {demo && (
        <div role="status" className="bg-warn-50 text-warn-700 border-b border-amber-200">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2 text-sm">
            <p>
              <strong className="font-semibold">⚠ {t('demo.badge')}</strong> — {t('demo.banner')}
            </p>
            <button type="button" className="underline underline-offset-2 hover:no-underline" onClick={() => setDemo(false)}>
              {t('demo.disable')}
            </button>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <NavLink to="/" className="flex items-center gap-2 font-bold tracking-tight">
            <span aria-hidden className="grid size-8 place-items-center rounded-lg bg-save-600 text-white">
              ✓
            </span>
            <span>
              {t('app.name')} <span className="font-normal text-muted">Suisse</span>
            </span>
          </NavLink>
          <nav aria-label="Navigation principale" className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.to === '/'} className={navClass}>
                {t(n.key)}
                {n.to === '/liste' && remaining > 0 && (
                  <span className="ml-1 rounded-full bg-save-600 px-1.5 text-xs text-white">{remaining}</span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main id="contenu" className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 md:pb-12">
        <Outlet />
      </main>

      <footer className="border-t border-line pb-24 md:pb-0">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-muted md:flex-row md:items-center md:justify-between">
          <p className="max-w-xl">
            Site indépendant, sans lien avec les enseignes citées. Les prix proviennent des sources indiquées sur chaque
            offre ; vérifiez en magasin avant d’acheter.
          </p>
          <div className="flex flex-wrap gap-4">
            <NavLink to="/sources" className="hover:text-ink">
              {t('nav.sources')}
            </NavLink>
            <NavLink to="/admin" className="hover:text-ink">
              {t('nav.admin')}
            </NavLink>
            {!demo && (
              <button type="button" className="hover:text-ink" onClick={() => setDemo(true)}>
                {t('demo.enable')}
              </button>
            )}
          </div>
        </div>
      </footer>

      <nav
        aria-label="Navigation mobile"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        <ul className="grid grid-cols-5">
          {NAV.map((n) => (
            <li key={n.to}>
              <NavLink
                to={n.to}
                end={n.to === '/'}
                className={({ isActive }) =>
                  `relative flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${
                    isActive ? 'text-save-700' : 'text-muted'
                  }`
                }
              >
                <Icon name={n.icon} />
                {t(n.key)}
                {n.to === '/liste' && remaining > 0 && (
                  <span className="absolute right-[22%] top-1.5 rounded-full bg-save-600 px-1.5 text-[10px] text-white">
                    {remaining}
                    <span className="sr-only"> articles à acheter</span>
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

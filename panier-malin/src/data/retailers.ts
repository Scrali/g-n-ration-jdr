import type { Retailer } from './types';

/**
 * Enseignes prévues. Aucune n'est « active » tant que sa source de données
 * n'a pas été vérifiée (voir docs/SOURCES.md). Aucun logo n'est utilisé.
 */
export const RETAILERS: Retailer[] = [
  { id: 'migros', slug: 'migros', name: 'Migros', website: 'https://www.migros.ch', status: 'planned', isDemo: false },
  { id: 'coop', slug: 'coop', name: 'Coop', website: 'https://www.coop.ch', status: 'planned', isDemo: false },
  { id: 'denner', slug: 'denner', name: 'Denner', website: 'https://www.denner.ch', status: 'planned', isDemo: false },
  { id: 'lidl', slug: 'lidl', name: 'Lidl Suisse', website: 'https://www.lidl.ch', status: 'planned', isDemo: false },
  { id: 'aldi', slug: 'aldi', name: 'Aldi Suisse', website: 'https://www.aldi-suisse.ch', status: 'planned', isDemo: false },
  { id: 'landi', slug: 'landi', name: 'LANDI', website: 'https://www.landi.ch', status: 'planned', isDemo: false },
  { id: 'aligro', slug: 'aligro', name: 'Aligro', website: 'https://www.aligro.ch', status: 'planned', isDemo: false },
  { id: 'ottos', slug: 'ottos', name: 'Otto’s', website: 'https://www.ottos.ch', status: 'planned', isDemo: false },
];

import type { Promotion, Retailer } from './types';
import { RETAILERS } from './retailers';
import { isSupabaseConfigured } from '../lib/supabase';

/**
 * Point d'accès unique aux données. L'interface ne change pas quand la source change :
 * - « empty »    : aucune source réelle connectée (état initial honnête) ;
 * - « demo »     : données fictives, activées volontairement par le visiteur ;
 * - « supabase » : base réelle (implémentée en phase 2).
 */
export type DataMode = 'empty' | 'demo' | 'supabase';

export interface DataSnapshot {
  mode: DataMode;
  retailers: Retailer[];
  promotions: Promotion[];
  /** Horodatage de la dernière mise à jour connue des données, null si aucune. */
  lastUpdatedAt: string | null;
}

export interface PromotionRepository {
  load(): Promise<DataSnapshot>;
}

const emptyRepository: PromotionRepository = {
  async load() {
    return { mode: 'empty', retailers: RETAILERS, promotions: [], lastUpdatedAt: null };
  },
};

const demoRepository: PromotionRepository = {
  async load() {
    // Import dynamique : le code de démo n'est chargé que si le mode démo est activé.
    const { DEMO_RETAILERS, buildDemoPromotions } = await import('./demo/demoData');
    const now = new Date();
    return {
      mode: 'demo',
      retailers: [...DEMO_RETAILERS, ...RETAILERS],
      promotions: buildDemoPromotions(now),
      lastUpdatedAt: now.toISOString(),
    };
  },
};

export function getRepository(demo: boolean): PromotionRepository {
  if (demo) return demoRepository;
  if (isSupabaseConfigured()) {
    // Phase 2 : renvoyer ici le dépôt Supabase (lecture des offres vérifiées via RLS).
    return emptyRepository;
  }
  return emptyRepository;
}

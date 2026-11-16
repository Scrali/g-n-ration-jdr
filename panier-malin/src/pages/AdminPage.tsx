import { PageHeader, Notice } from '../components/ui';
import { isSupabaseConfigured } from '../lib/supabase';

/**
 * Espace d'administration — volontairement inactif en phase 1.
 * En phase 3, l'accès sera contrôlé par Supabase Auth + rôle administrateur vérifié
 * côté serveur (RLS / Edge Functions). Aucun contrôle d'accès n'est fait côté client seul.
 */
export function AdminPage() {
  return (
    <div className="max-w-2xl">
      <PageHeader title="Administration" lead="Espace réservé aux administrateurs du site." />
      <Notice tone="warn">
        <p className="font-semibold">Accès non disponible</p>
        <p className="mt-1">
          L’administration (import CSV, validation des offres, journal des imports) sera activée avec la base Supabase.
          Les droits seront appliqués côté serveur : aucune fonction d’administration n’est présente dans cette version.
        </p>
      </Notice>
      <p className="mt-4 text-sm text-muted">
        État de la connexion à la base : {isSupabaseConfigured() ? 'configurée' : 'non configurée'}.
      </p>
    </div>
  );
}

# Feuille de route

## ✅ Phase 0 — Audit et préparation
- Dépôt inspecté : il contenait un autre projet (site JDR « Les Petits Héros »). Le comparateur est isolé
  dans `panier-malin/` en attendant son propre dépôt (voir README, « Extraire vers un nouveau dépôt »).
- Choix techniques : `docs/ARCHITECTURE.md`. Règles permanentes : `CLAUDE.md`.
- Matrice des sources : `docs/SOURCES.md` (aucune source vérifiée à ce jour).

## ✅ Phase 1 — MVP frontend
- React/Vite/TypeScript/Tailwind, navigation bureau + barre mobile, accessibilité clavier.
- Accueil, Promotions (recherche, filtres, tri), Comparateur, Liste de courses locale, Optimisation du
  panier, Sources, Administration (désactivée).
- Moteur métier testé (prix unitaires, lots, dates, filtres, panier).
- Mode démo opt-in avec enseignes fictives.

## Phase 2 — Supabase (prochaine étape)
- [ ] Créer le projet Supabase (région UE/Suisse) et renseigner `.env.local`.
- [ ] `supabase/migrations/0001_schema.sql` : tables, contraintes, index.
- [ ] `0002_rls.sql` : lecture publique des offres `verified` non expirées ; données privées par propriétaire ;
      table `admin_users` gérée uniquement par `service_role`.
- [ ] Vue `public_promotions` (jointures + filtre de validité côté serveur, fuseau Europe/Zurich).
- [ ] `SupabaseRepository` dans `src/data/repository.ts` (mapping `numeric` → centimes).
- [ ] Tests d'intégration RLS (anon, utilisateur, admin).
- [ ] Workflow de déploiement avec secrets `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.

## Phase 3 — Administration et imports CSV
- [ ] Connexion admin (Supabase Auth), garde côté serveur.
- [ ] Import CSV (format dans `docs/SOURCES.md`) : aperçu, validation ligne par ligne, déduplication.
- [ ] Revue humaine, publication, désactivation, journal `import_runs` et `audit_logs`.

## Phase 4 — Comparateur
- [ ] Table `retailer_products` et rapprochement manuel/assisté des produits identiques (GTIN si disponible).
- [ ] Prix normaux (`price_observations`) pour comparer aussi hors promotion.

## Phase 5 — Automatisation
- [ ] Connecteurs uniquement pour les sources autorisées ; Edge Functions + Cron.
- [ ] Expiration automatique, alertes techniques, ne pas supprimer une offre si la source est indisponible.

## Phase 6 — Fonctions avancées
- [ ] Comptes, synchronisation des listes, alertes de prix, historique, géolocalisation, coût de
      déplacement, favoris, allemand et italien (`src/i18n`).

# Panier Malin Suisse — règles permanentes

Comparateur des promotions des magasins suisses. Objectif : réduire le coût des courses d'un ménage,
avec des données **vérifiées** uniquement.

## Règles absolues

1. **Jamais de données inventées en production** : aucun prix, aucune promotion, date, disponibilité ou
   réduction fictifs. Une valeur inconnue reste `null` et s'affiche comme « inconnue ».
2. Les données de démonstration vivent **uniquement** dans `src/data/demo/`, utilisent des enseignes
   fictives (« Magasin Démo A/B/C »), portent `isDemo: true` et ne s'affichent que si le visiteur
   active le mode démo. Ne jamais attribuer un prix fictif à une vraie enseigne.
3. Une promotion expirée n'est **jamais** présentée comme active. Dates = jours civils Europe/Zurich,
   bornes incluses (`src/lib/dates.ts`).
4. Argent = **entiers en centimes** (rappen) côté TypeScript, `numeric(10,2)` en base. Jamais de flottant.
5. Quantités = entiers dans la plus petite unité (g, ml, pièce). Pas de comparaison entre unités incompatibles.
6. Deux produits ne sont « identiques » que s'ils ont le même `productId`. Le reste = « alternatives similaires ».
7. Réduction affichée uniquement si la source fournit un prix de référence ; arrondie vers le bas.
8. Un magasin n'est jamais qualifié de « moins cher » sur des données insuffisantes (couverture affichée).
9. Aucune collecte automatique sans vérification préalable des conditions d'utilisation de la source
   (voir `docs/SOURCES.md`). Aucun logo ou visuel tiers sans droit.
10. Aucun secret côté frontend : seules `VITE_SUPABASE_URL` et la clé publique anon. La clé
    `service_role` n'existe que dans les Edge Functions. Les droits admin sont appliqués par PostgreSQL (RLS).
11. Ne pas affirmer qu'un test passe sans l'avoir exécuté.

## Organisation

- `src/lib/` : logique métier pure et testée (prix unitaires, dates, filtres, panier).
- `src/data/` : types du domaine, référentiels (enseignes, catégories), dépôt de données (`repository.ts`).
- `src/features/` : fonctionnalités avec état (liste de courses).
- `src/pages/`, `src/components/` : interface React.
- `docs/` : architecture, matrice des sources, feuille de route.

## Commandes

```bash
npm install          # .npmrc active legacy-peer-deps (contournement d'un bug npm avec vitest)
npm run dev          # serveur local
npm test             # tests Vitest
npm run build        # vérification TypeScript + build de production
```

Avant chaque commit : `npm run build && npm test`.

## Méthode de travail

Avancer par phases (voir `docs/ROADMAP.md`). Ne pas commencer une phase au détriment de la stabilité
de la précédente. Ne pas réécrire le projet à chaque évolution. Ajouter un test pour chaque règle métier.

# Architecture

## Vue d'ensemble

```
Navigateur (React, GitHub Pages)
  │  lecture publique des offres vérifiées (clé anon + RLS)
  ▼
Supabase PostgreSQL ◄── Edge Functions (imports, validation, service_role)
                    ◄── Supabase Cron (imports planifiés, expiration des offres)
                    ◄── Espace admin (import CSV, revue humaine)
```

## Choix techniques

| Sujet | Choix | Raison |
|---|---|---|
| Frontend | React 19 + TypeScript strict + Vite 8 | Typage fort du domaine, build rapide |
| Style | Tailwind CSS 4 (`@tailwindcss/vite`) | Pas de CSS mort, design system via `@theme` |
| Routage | `HashRouter` | GitHub Pages ne sait pas réécrire les URL : pas de 404 au rechargement |
| Argent | entiers en centimes | Aucune erreur d'arrondi binaire ; `numeric(10,2)` en base |
| Comparaisons de prix unitaires | fractions d'entiers | Comparaison exacte par produit croisé |
| Dates | chaînes `AAAA-MM-JJ` + `Intl` avec `Europe/Zurich` | Une offre « jusqu'au 16.11. » est valable toute la journée suisse, quel que soit le fuseau du visiteur |
| Données | interface `PromotionRepository` | Le frontend ne change pas entre démo, vide et Supabase |
| Liste de courses | `localStorage` + `useSyncExternalStore` | Utilisable sans compte ; synchronisation entre onglets ; synchro Supabase en phase 6 |
| Tests | Vitest + Testing Library (jsdom) | Logique métier testée sans navigateur |
| Supabase JS | chargé dynamiquement | N'alourdit pas la page tant que la base n'est pas branchée |

## Modules métier (`src/lib`)

| Fichier | Rôle |
|---|---|
| `money.ts` | Format CHF (« CHF 1’234.05 »), saisie sans flottant, % de réduction (arrondi vers le bas) |
| `units.ts` | Prix au kg / l / pièce, lots, « X pour Y », quantité minimale, coût de N conditionnements |
| `dates.ts` | Jour civil à Zurich, statut à venir / en cours / expirée, fraîcheur |
| `promotions.ts` | Validation, visibilité publique, filtres, tri, recherche sans accents |
| `compare.ts` | Produits identiques vs alternatives similaires |
| `basket.ts` | Coût par magasin, couverture, meilleure combinaison (énumération exacte), économies |

## Schéma de données (phase 2)

Les types de `src/data/types.ts` préfigurent les tables : `retailers`, `stores`, `categories`, `products`,
`retailer_products`, `promotions`, `promotion_scopes`, `price_observations`, `import_sources`,
`import_runs`, `profiles`, `shopping_lists`, `shopping_list_items`, `price_alerts`, `audit_logs`.

Principes retenus pour les migrations : UUID, clés étrangères, contraintes `CHECK` (prix > 0, dates
cohérentes, référence ≥ promo), `numeric(10,2)`, `date` pour les validités et `timestamptz` pour les
horodatages, index sur `(retailer_id, valid_until)`, `(product_id)`, recherche plein texte ; rôle admin
porté par une table séparée non modifiable par l'utilisateur (pas de colonne `is_admin` dans `profiles`).

## Algorithme de panier

Pour chaque article et chaque magasin autorisé : coût minimal parmi les offres actives du même produit,
en tenant compte de la mécanique (`costForCount`). Puis énumération de toutes les combinaisons de magasins
(≤ 2ⁿ − 1, n = magasins avec au moins une offre), limitée par « nombre max. de magasins ». Ordre de choix :
couverture maximale → coût minimal → moins de magasins. Exact pour les articles couverts. Si le nombre
d'enseignes dépasse ~15, passer à une programmation dynamique ou à un solveur.

Limites affichées : déplacement ignoré ; prix hors promotion inconnus ; économies calculées uniquement
par rapport aux prix de référence fournis par les enseignes.

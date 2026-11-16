# Matrice des sources de données

> **Statut au 16.11.2026 : aucune source n'est validée.** Les sites des enseignes n'étaient pas accessibles
> depuis l'environnement de développement (réseau restreint) : rien de ce qui suit n'a pu être vérifié en
> ligne. Cette matrice liste **ce qu'il faut vérifier** avant toute publication de données réelles ; elle
> ne contient aucune affirmation sur l'existence d'API ou sur les droits de réutilisation.

## Méthode de qualification (à appliquer pour chaque enseigne)

1. **Recenser les canaux officiels** : page « actions » du site, prospectus hebdomadaire (HTML/PDF),
   application mobile, newsletter, éventuel programme partenaires / API.
2. **Lire les conditions d'utilisation** du site (mentions légales / CGU) : clauses sur l'extraction
   automatisée, la reproduction de contenus, l'usage commercial. Noter la date de lecture et l'URL.
3. **Lire `robots.txt`** (indicatif, pas une autorisation juridique).
4. **Demander l'autorisation par écrit** au service communication / presse de l'enseigne lorsque la
   réutilisation n'est pas explicitement permise. Conserver la réponse.
5. **Choisir la méthode** dans cet ordre de préférence :
   1. API officielle ou flux partenaire ;
   2. accord écrit + extraction de la page/du prospectus officiel ;
   3. **saisie / import CSV administratif** à partir de la source officielle (toujours possible, MVP) ;
   4. ne pas couvrir l'enseigne.
6. **Documenter** ci-dessous : méthode retenue, fréquence, champs disponibles, limites, risques.

Points juridiques à faire valider (non exhaustif, ce document n'est pas un avis juridique) :
droit d'auteur sur les textes et images (LDA), concurrence déloyale (LCD, notamment la reprise du résultat
de travail d'autrui par des procédés techniques), conditions contractuelles des sites, droit des marques
pour les noms et logos, protection des données (nLPD) pour les comptes utilisateurs.

## Matrice

Légende statut : ⬜ non vérifié · 🟨 en cours · ✅ validé · ⛔ exclu

| Enseigne | Canaux officiels à examiner | CGU lues | Autorisation | Méthode envisagée | Statut | Risques / remarques |
|---|---|---|---|---|---|---|
| Migros | Page actions du site, application, prospectus (Migros-Magazin) | ⬜ | ⬜ | CSV admin, puis demande de partenariat | ⬜ | Prix et actions pouvant varier par coopérative régionale → portée géographique à gérer |
| Coop | Page promotions du site, application, Coopzeitung | ⬜ | ⬜ | CSV admin, puis demande de partenariat | ⬜ | Offres avec Supercard / conditionnelles à distinguer |
| Denner | Page « actions actuelles », prospectus hebdomadaire | ⬜ | ⬜ | CSV admin | ⬜ | Actions souvent hebdomadaires → fraîcheur à surveiller |
| Lidl Suisse | Page offres, prospectus, application Lidl Plus | ⬜ | ⬜ | CSV admin | ⬜ | Prix Lidl Plus = prix carte de fidélité |
| Aldi Suisse | Page « actions », prospectus | ⬜ | ⬜ | CSV admin | ⬜ | Offres « dès [date] » jusqu'à épuisement du stock → date de fin parfois inconnue |
| LANDI | Page « top offre », prospectus | ⬜ | ⬜ | CSV admin | ⬜ | Assortiment surtout non alimentaire ; catégories à adapter |
| Aligro | Site, prospectus | ⬜ | ⬜ | CSV admin | ⬜ | Clientèle pro/particuliers, prix HT/TTC à vérifier ; présence régionale (Romandie) |
| Otto's | Site, prospectus | ⬜ | ⬜ | CSV admin | ⬜ | Déstockage : offres très ponctuelles, quantités limitées |

Les agrégateurs tiers de prospectus ne sont **pas** des sources officielles : ne pas les utiliser sans leur
accord explicite, et toujours remonter à la source de l'enseigne pour la vérification.

## Format normalisé d'import (contrat commun à tous les connecteurs)

Chaque connecteur (CSV, API, extracteur autorisé) doit produire des lignes au format suivant. Le format
CSV d'import administratif (phase 3) reprend exactement ces colonnes.

| Champ | Type | Obligatoire | Remarque |
|---|---|---|---|
| `retailer_slug` | texte | oui | ex. `denner` |
| `source_item_id` | texte | non | identifiant de l'article chez la source (sert à la déduplication) |
| `product_name` | texte | oui | libellé exact de la source |
| `brand` | texte | non | vide = inconnue |
| `pack_count` | entier ≥ 1 | oui | 3 pour « 3 × 500 g » |
| `unit_amount` | entier ≥ 1 | oui | en g, ml ou pièces |
| `unit` | `g` \| `ml` \| `piece` | oui | kg et l convertis à l'import |
| `promo_price_chf` | décimal 2 | oui | ex. `4.50` |
| `reference_price_chf` | décimal 2 | non | uniquement s'il figure dans la source |
| `price_kind` | `public` \| `loyalty_card` \| `conditional` | oui | |
| `deal` | `none` \| `multi_buy:2:1` \| `min_quantity:2` | oui | |
| `conditions` | texte | non | texte des conditions tel que publié |
| `valid_from` | date AAAA-MM-JJ | oui | jamais inventée |
| `valid_until` | date AAAA-MM-JJ | non | vide = inconnue (« jusqu'à épuisement ») → revue humaine |
| `scope` | `national` \| `cantons:VD,GE` \| `online` | oui | |
| `source_url` | URL https | oui | page officielle consultée |
| `collected_at` | horodatage ISO | oui | |

Clé de déduplication proposée : `(retailer_slug, source_item_id ou product_name normalisé, pack, valid_from, price_kind)`.
Un import répété met à jour `last_verified_at` au lieu de créer une nouvelle offre.

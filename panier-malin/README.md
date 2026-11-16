# Panier Malin Suisse

Comparateur des promotions des magasins suisses : consulter les actions, comparer les prix au kilo / litre /
pièce, préparer une liste de courses et trouver la combinaison de magasins la moins chère.

**État : phases 0 et 1 terminées** (frontend complet, moteur de calcul testé). Aucune donnée réelle n'est
encore publiée : le site affiche un état vide honnête, et un **mode démo** (enseignes et prix fictifs,
clairement signalés) permet de tester toutes les fonctions.

## Démarrage

Prérequis : Node.js 20+ (testé avec Node 22).

```bash
npm install
cp .env.example .env.local   # facultatif tant que Supabase n'est pas branché
npm run dev                  # http://localhost:5173
```

| Commande | Effet |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm test` | Tests unitaires et d'interface (Vitest) |
| `npm run build` | Vérification TypeScript + build dans `dist/` |
| `npm run preview` | Sert le build de production |

Pour tester avec des données : pied de page → « Afficher les données de démonstration ».

## Déploiement sur GitHub Pages

1. Dépôt dédié (voir ci-dessous), branche `main`.
2. *Settings → Pages → Source : GitHub Actions*.
3. Le workflow `.github/workflows/deploy.yml` teste, construit avec `VITE_BASE_PATH=/<nom-du-dépôt>/`
   et publie. Les routes utilisent `#/…`, donc aucun réglage serveur n'est nécessaire.

## Extraire vers un nouveau dépôt

Le projet a été démarré dans le sous-dossier `panier-malin/` d'un dépôt existant, sans rien modifier
au projet qui s'y trouve. Pour lui donner son propre dépôt en gardant l'historique :

```bash
# depuis la racine du dépôt d'origine
git subtree split --prefix=panier-malin -b panier-malin-only
# créer un dépôt vide sur GitHub, puis :
git push git@github.com:<compte>/panier-malin-suisse.git panier-malin-only:main
```

## Documentation

- `CLAUDE.md` — règles permanentes du projet
- `docs/ARCHITECTURE.md` — choix techniques, modules, algorithme du panier
- `docs/SOURCES.md` — matrice enseigne / source / méthode / risques et format d'import
- `docs/ROADMAP.md` — phases et prochaines étapes

# 🛡️ Les Petits Héros – JDR en famille

Un petit site pour jouer au jeu de rôle en famille avec des enfants de 5 à 8 ans :

- **Règles ultra simples** : 3 talents (💪 Force, 🧠 Malin, ❤️ Cœur), un dé à 6 faces, « 4 ou plus = ça marche ». Un 6 est une **réussite critique** (bonus + étoile), un 1 une **catastrophe rigolote** (drôle, jamais grave, + étoile de courage).
- **Rôles adaptés à la famille** : un Conteur (le parent qui connaît le JDR), un Compagnon (le parent qui découvre) et les Héros (les enfants).
- **Création de héros** avec fiches imprimables (et une case pour dessiner son héros).
- **Générateur d'aventures** : 8 mondes (dont les bateaux pirates et la ferme), 3 durées, des textes à lire à voix haute. À chaque étape, les enfants **choisissent entre deux chemins**, chacun avec son défi et ses résultats (réussite / « oui, mais… »). La fin propose plusieurs solutions : force, ruse ou gentillesse.
- **Jouer en direct** : l'histoire se construit pendant la partie. Les enfants choisissent où aller, le Conteur clique le résultat de chaque défi, et la suite s'adapte : un « oui, mais… » ouvre un fil qui revient plus tard, les personnages aidés reviennent en amis, un personnage pas aidé redemande de l'aide, la gentillesse de l'équipe rend la fin plus facile avec le Cœur, et les défis mettent en avant le talent le moins utilisé. Un bouton permet d'annuler un mauvais clic.
- **Les héros des enfants dans l'histoire** (mode direct) : chacun son tour (« C'est au tour de Lina ! »), nommés dans les textes, avec leurs cœurs, étoiles, objet et pouvoir magique (un bouton pour l'utiliser), et un petit défi pour faire participer la table à chaque étape (bruitages, dessin, mime, inventer un nom…). Les idées des enfants se notent et reviennent plus tard.
- **Réputation** : être dur ou méchant rend la Force de moins en moins efficace, être gentil rend le Cœur de plus en plus efficace ; refaire toujours la même chose devient plus difficile, essayer un talent jamais utilisé plus facile. La réputation se garde d'un épisode à l'autre dans une saga.
- **Imprévus** : ils surgissent pendant la partie (ou avec le bouton « ⚡ Un imprévu ! ») et se résolvent avec le dé ; les cartes de la boîte à imprévus s'ajoutent à l'histoire en un clic.
- **Saga en plusieurs épisodes** : une grande histoire (4 sagas, 3 ou 5 épisodes, dans un seul monde ou en voyage à travers les mondes). Après chaque partie, un bilan de 2 minutes (chemins choisis, amis aidés, fin choisie, exploits des héros, idées inventées par les enfants) fait évoluer la suite : les amis reviennent aider, les méchants vaincus par la force reviennent en rivaux (et peuvent devenir amis), les objets restent dans le sac, et les inventions des enfants réapparaissent. Tout s'écrit dans **le Livre de la Saga**, à relire ou imprimer. Les sagas se sauvegardent dans un fichier.
- **Le dé du site** (onglet 🎲 Dé, et intégré au mode direct) : il roule, ralentit, un petit roulement de tambour… puis le résultat, avec un son (désactivable). En mode direct, le résultat s'applique tout seul à l'histoire.
- **Moments de suspense** : avant certains défis et avant la grande fin, l'histoire fait une pause (« des pas qui se rapprochent… ») avec un conseil pour le Conteur, puis on révèle.
- **Mode Playmobil** : un conseil de mise en scène à chaque étape (figurines à sortir, décor avec ce qu'on a à la maison), la figurine de chaque héros, et un bouton « 📸 Photo » pour ajouter les photos des scènes à l'histoire et au Livre de la Saga (les photos restent sur l'appareil).
- **Boîte à imprévus** (bouton 🎴 en bas à droite) pour improviser en pleine partie : oracle oui/non utilisable avec un vrai dé, imprévus, personnages (avec une idée de voix), choix à proposer, objets trouvés, conséquences « oui, mais… » et coups de pouce quand les enfants bloquent.

## Utilisation

Le site est en ligne : **https://scrali.github.io/g-n-ration-jdr/**

Aucun outil à installer : ouvrez `index.html` dans un navigateur.

Pour le mettre en ligne gratuitement : sur GitHub, *Settings → Pages → Deploy from a branch*, puis choisissez la branche et le dossier `/ (root)`.

## Ajouter du contenu

Le contenu des mondes est dans `js/data.js`, les sagas dans `js/saga-data.js`, les tables d'imprévus dans `js/aleas.js`. Pour ajouter un lieu, un défi, un méchant ou un monde entier, il suffit de compléter les listes en suivant les exemples existants.

Chaque aventure a un code (ex. `foret-normale-31605`) : la même adresse redonne toujours la même aventure.

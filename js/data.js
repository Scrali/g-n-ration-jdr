/* ==========================================================
   Données du jeu : héros, talents et mondes d'aventure.
   Pour ajouter du contenu, il suffit de compléter les listes.
   talent : "force" | "malin" | "coeur"
   ========================================================== */

const TALENTS = {
  force: { nom: "Force", emoji: "💪", desc: "courir, sauter, grimper, porter" },
  malin: { nom: "Malin", emoji: "🧠", desc: "réfléchir, chercher, ruser" },
  coeur: { nom: "Cœur", emoji: "❤️", desc: "parler, consoler, être courageux" },
};

const HERO_TYPES = [
  { id: "chevalier", nom: "Chevalier", emoji: "🛡️" },
  { id: "magicien", nom: "Magicien·ne", emoji: "🪄" },
  { id: "fee", nom: "Fée", emoji: "🧚" },
  { id: "pirate", nom: "Pirate", emoji: "🏴‍☠️" },
  { id: "explorateur", nom: "Explorateur·rice", emoji: "🧭" },
  { id: "animal", nom: "Animal qui parle", emoji: "🦊" },
  { id: "robot", nom: "Robot", emoji: "🤖" },
  { id: "princesse", nom: "Prince·sse", emoji: "👑" },
  { id: "dragon", nom: "Petit dragon", emoji: "🐉" },
];

const POWERS = [
  { id: "voler", nom: "Voler", emoji: "🪽" },
  { id: "animaux", nom: "Parler aux animaux", emoji: "🐾" },
  { id: "invisible", nom: "Devenir invisible", emoji: "👻" },
  { id: "geant", nom: "Devenir géant", emoji: "🦣" },
  { id: "lumiere", nom: "Faire de la lumière", emoji: "💡" },
  { id: "soigner", nom: "Soigner", emoji: "🩹" },
  { id: "rapide", nom: "Super vitesse", emoji: "⚡" },
  { id: "objets", nom: "Faire parler les objets", emoji: "🪑" },
];

const HERO_NAMES = [
  "Lina la Courageuse", "Tom Tonnerre", "Plume", "Capitaine Bisou", "Zigzag",
  "Noisette", "Max Éclair", "Rubis", "Sir Croquette", "Étoile Filante",
  "Pirouette", "Biscotte", "Grand Loup Gentil", "Mimosa", "Professeur Boulon",
];

const ITEMS = [
  "une corde qui s'allonge", "un doudou porte-bonheur", "une lampe de poche",
  "une loupe", "un sifflet", "un sac de biscuits", "une carte au trésor",
  "une épée en bois", "une baguette magique", "une boussole qui parle",
];

const LENGTHS = [
  { id: "courte", nom: "Courte", emoji: "⏱️", desc: "20–30 min", scenes: 2, rebondissement: false },
  { id: "normale", nom: "Normale", emoji: "⏰", desc: "≈ 45 min", scenes: 3, rebondissement: true },
  { id: "longue", nom: "Longue", emoji: "🌙", desc: "≈ 1 h", scenes: 4, rebondissement: true },
];

/* ----------------------------------------------------------
   Les mondes
   ---------------------------------------------------------- */
const THEMES = [
  /* ===================== FORÊT ===================== */
  {
    id: "foret",
    nom: "La Forêt Enchantée",
    emoji: "🌳",
    compagnon: "Pistache, un petit écureuil qui a toujours faim",
    creatures: ["un hérisson","une chouette","un blaireau","une grenouille","un lutin","un escargot","une fourmi","un renard"],
    imprevus: ["Une pluie de glands tombe des arbres : aïe, aïe, aïe !", "Un champignon géant se met à éternuer et projette des spores qui font rire tout le monde.", "Les arbres se mettent à marcher pour changer de place. Le chemin n'est plus au même endroit !", "Une abeille demande de l'aide : sa reine a perdu sa couronne dans une fleur."],
    ambiance: "Les arbres sont si hauts qu'on ne voit pas leur sommet. Des champignons brillent doucement, les fleurs chuchotent entre elles et ça sent la mousse et le miel.",
    donneurs: [
      "Mamie Chouette, la plus vieille chouette de la forêt",
      "Monsieur Hérisson, le facteur de la forêt",
      "Rosalie, une petite biche toute timide",
      "le Grand Chêne, un arbre qui parle très, très lentement",
    ],
    problemes: [
      { titre: "La Nuit sans Lucioles", texte: "toutes les lucioles ont disparu et, la nuit, la forêt est plongée dans le noir. Les petits animaux ont peur de sortir." },
      { titre: "Le Miel Volé", texte: "toutes les réserves de miel de la forêt ont disparu en une seule nuit. Sans miel, pas de grande fête du printemps !" },
      { titre: "La Rivière Silencieuse", texte: "la rivière qui chante s'est arrêtée de chanter, et son eau devient toute grise." },
      { titre: "Les Couleurs Perdues", texte: "les fleurs de la clairière perdent leurs couleurs les unes après les autres. Bientôt, tout sera gris !" },
    ],
    lieux: [
      { nom: "Le Sentier des Champignons", description: "Un petit chemin bordé de champignons rouges à pois blancs, certains aussi grands que des parapluies." },
      { nom: "Le Pont de Lianes", description: "Un pont fait de lianes tressées se balance au-dessus d'un ravin plein de brume." },
      { nom: "La Clairière aux Papillons", description: "Une grande clairière ensoleillée où des centaines de papillons dansent dans l'air." },
      { nom: "Le Marais qui Gargouille", description: "Un marais plein de bulles qui font « bloup ! » et de grenouilles qui chantent faux." },
      { nom: "L'Arbre Creux", description: "Un arbre énorme avec une porte ronde dans son tronc. Un escalier en colimaçon monte à l'intérieur." },
    ],
    obstacles: [
      { texte: "Un gros tronc d'arbre est tombé en travers du chemin.", talent: "force", reussite: "Hop ! Le tronc roule sur le côté et le chemin est libre.", rate: "Le tronc bouge un peu… et un écureuil grognon en sort en criant « Hé ! C'était ma maison ! ». Il faudra s'excuser ou l'aider à reconstruire avant de passer." },
      { texte: "Le chemin se sépare en trois, et les panneaux ont été mélangés par le vent.", talent: "malin", reussite: "En regardant la mousse sur les arbres et les traces au sol, les héros trouvent le bon chemin.", rate: "Les héros se perdent un petit moment et tournent en rond… jusqu'à ce qu'une coccinelle leur montre le chemin, en échange d'une chanson." },
      { texte: "Il faut traverser un ruisseau en sautant sur des pierres glissantes.", talent: "force", reussite: "Saut, saut, saut ! Les héros arrivent de l'autre côté les pieds secs.", rate: "Plouf ! Un héros tombe dans l'eau. Il est tout mouillé et fait « splotch » à chaque pas pour le reste de la scène." },
      { texte: "Des ronces magiques bloquent le passage. Elles se resserrent quand on crie, et s'ouvrent quand on chante doucement.", talent: "malin", reussite: "Les héros comprennent le secret et chantent une berceuse : les ronces s'écartent.", rate: "Les ronces attrapent un bout de vêtement. Le héros perd 1 ❤️ (ça pique !) avant de se libérer." },
      { texte: "Une famille de sangliers bloque le chemin et ne veut laisser passer personne.", talent: "coeur", reussite: "Les héros discutent gentiment avec maman sanglier, qui les laisse passer et leur indique même un raccourci.", rate: "Les sangliers se fâchent et chargent ! Il faut courir se cacher derrière un buisson (un lancer de 💪 ou 🧠 pour s'en sortir sans perdre de ❤️)." },
    ],
    rencontres: [
      { pnj: "le petit lapin perdu", texte: "Un petit lapin pleure assis sur une souche : il a perdu sa maman.", talent: "coeur", reussite: "Les héros le consolent et le ramènent chez lui. Sa maman, très reconnaissante, leur donne un indice : elle a vu quelque chose de bizarre passer vers le lieu suivant.", rate: "Le lapin a encore peur et se cache. Il faudra lui faire rire (une blague, une grimace) pour qu'il accepte de suivre les héros." },
      { pnj: "le vieux blaireau grincheux", texte: "Un vieux blaireau grincheux, assis devant sa porte, refuse de répondre aux questions.", talent: "coeur", reussite: "En étant polis et en lui faisant un compliment, les héros le font sourire. Il leur raconte ce qu'il a vu cette nuit.", rate: "Le blaireau claque sa porte. Mais il laisse tomber un papier par la fenêtre… un indice dessiné très mal !" },
      { pnj: "la fée minuscule", texte: "Une fée minuscule est coincée dans une toile d'araignée.", talent: "malin", reussite: "Les héros la libèrent délicatement. Pour les remercier, elle donne à chacun une ✨ étoile.", rate: "La toile colle aux doigts ! Tout le monde est un peu collant, mais la fée est libre et leur donne une ✨ étoile pour toute l'équipe." },
    ],
    mechants: [
      { nom: "Gribouille le Lutin", description: "un petit lutin avec un chapeau pointu et des poches pleines de bazar", raison: "il est triste parce que personne ne l'a jamais invité à la fête de la forêt", solutions: { coeur: "L'inviter à la fête et devenir son ami.", malin: "Lui proposer un jeu de devinettes : s'il perd, il rend tout.", force: "Le rattraper dans une course-poursuite entre les arbres." } },
      { nom: "Dame Brume", description: "une grande silhouette faite de brouillard qui murmure", raison: "elle a froid et elle cherche à se réchauffer avec tout ce qui brille", solutions: { coeur: "Lui offrir une couverture ou un câlin bien chaud.", malin: "Lui montrer le soleil du matin, qui réchauffe tout le monde.", force: "Souffler très fort tous ensemble pour la disperser doucement." } },
      { nom: "Gros-Glouton l'Ours", description: "un ours énorme avec un ventre qui gargouille", raison: "il s'est réveillé trop tôt de son hibernation et il a terriblement faim", solutions: { coeur: "Lui préparer un bon repas et lui chanter une berceuse pour qu'il se rendorme.", malin: "Le guider vers un buisson de framboises géantes, loin des réserves.", force: "Tenir bon tous ensemble devant la porte jusqu'à ce qu'il abandonne." } },
    ],
    rebondissements: [
      "Le Compagnon des héros se fait emporter par un coup de vent ! Il atterrit en haut d'un arbre et il faut l'aider à redescendre.",
      "Il se met à pleuvoir des gouttes… de sirop ! Tout devient collant et les abeilles arrivent en nombre.",
      "Les héros découvrent que le coupable n'a pas fait ça tout seul : un petit complice le regrette et veut les aider.",
    ],
    tresors: [
      "une graine magique qui fait pousser un arbre-cabane en une nuit",
      "un pot de miel qui ne se vide jamais",
      "une plume de chouette qui permet de voir dans le noir",
      "une médaille de Gardien de la Forêt pour chaque héros",
    ],
  },

  /* ===================== CHÂTEAU ===================== */
  {
    id: "chateau",
    nom: "Le Château des Nuages",
    emoji: "🏰",
    compagnon: "Biscuit, un petit dragon qui éternue des étincelles",
    creatures: ["un page","une cuisinière","un fantôme","une armure","un garde","un chat du château","une dame de compagnie","un bouffon"],
    imprevus: ["Les trompettes sonnent : le roi arrive ! Il faut vite se cacher ou faire la révérence.", "Toutes les bougies du couloir s'éteignent en même temps.", "Un tableau change d'expression quand les héros passent devant.", "La cuisinière court après une poule qui s'est échappée et fonce droit sur les héros."],
    ambiance: "Un château aux tours pointues flotte au-dessus des nuages. Des drapeaux claquent au vent, on entend des trompettes au loin, et les escaliers sont tellement nombreux qu'on pourrait s'y perdre.",
    donneurs: [
      "la Reine Mirabelle, qui porte une couronne un peu trop grande",
      "Sire Gaston, un vieux chevalier qui a perdu ses lunettes",
      "Pépin, le petit cuisinier du château",
      "Zéphyr, le magicien du roi, qui a la barbe pleine de paillettes",
    ],
    problemes: [
      { titre: "La Couronne Disparue", texte: "la couronne magique du royaume a disparu ! Sans elle, le château va doucement descendre des nuages." },
      { titre: "Le Grand Tournoi Annulé", texte: "toutes les épées et les boucliers ont été transformés en brocolis. Le grand tournoi de demain est en danger !" },
      { titre: "Le Dragon Enrhumé", texte: "le dragon qui garde le château a attrapé un rhume. À chaque éternuement, il met le feu aux rideaux !" },
      { titre: "Le Bal des Fantômes", texte: "des fantômes s'invitent chaque nuit dans la salle de bal et font tant de bruit que personne ne peut dormir." },
    ],
    lieux: [
      { nom: "La Grande Cuisine", description: "Des marmites énormes bouillonnent, ça sent la soupe et la tarte aux pommes. Des casseroles pendent partout." },
      { nom: "La Tour de l'Horloge", description: "Une tour pleine d'engrenages géants qui tournent en faisant tic-tac très fort." },
      { nom: "La Bibliothèque Volante", description: "Les livres volent comme des oiseaux entre les étagères. Certains sont de très mauvaise humeur." },
      { nom: "Les Oubliettes", description: "Un sous-sol sombre et frais. Des gouttes tombent du plafond, plic, ploc." },
      { nom: "Le Jardin Suspendu", description: "Un jardin accroché au bord du château, avec des fleurs géantes et une vue sur les nuages." },
    ],
    obstacles: [
      { texte: "Une armure vivante garde la porte et ne laisse passer que ceux qui connaissent le mot de passe.", talent: "malin", reussite: "Les héros devinent le mot de passe (un indice était écrit sur le mur) : « Saucisson ! ». L'armure s'écarte en saluant.", rate: "L'armure se met à poursuivre les héros en faisant « cling-clang ». Il faut la semer dans les couloirs !" },
      { texte: "Le pont-levis est remonté. La grosse manivelle est très, très lourde.", talent: "force", reussite: "Tous ensemble, les héros tournent la manivelle. Le pont descend avec un grand « BOUM ».", rate: "La manivelle tourne trop vite dans l'autre sens et un héros se retrouve accroché dessus comme un drapeau ! Ses amis doivent l'aider à descendre." },
      { texte: "Un escalier magique change de direction toutes les dix secondes.", talent: "malin", reussite: "En comptant les secondes, les héros trouvent le bon moment pour monter.", rate: "L'escalier les emmène… dans la salle de bain du roi, qui prend son bain avec un canard en plastique ! Très gênant. Il faut s'excuser poliment." },
      { texte: "Un rideau de toiles d'araignées géantes bloque le couloir. Une araignée très polie demande qu'on ne casse pas son travail.", talent: "coeur", reussite: "Les héros proposent de l'aider à retisser plus loin. Ravie, elle ouvre un passage.", rate: "L'araignée boude et refuse de bouger. Il va falloir trouver un autre chemin… par la fenêtre !" },
      { texte: "Il faut grimper au sommet d'une tour par l'extérieur, en s'accrochant au lierre.", talent: "force", reussite: "Les héros grimpent comme des chats et arrivent en haut sans problème.", rate: "Une branche craque ! Le héros perd 1 ❤️ en glissant, mais se rattrape juste à temps." },
    ],
    rencontres: [
      { pnj: "le jeune page", texte: "Un jeune page pleure : il a cassé un vase précieux et a peur de se faire gronder.", talent: "coeur", reussite: "Les héros le rassurent et l'aident à recoller le vase. Pour les remercier, il leur montre un passage secret.", rate: "Le page est trop paniqué pour parler. Il faudra d'abord lui donner un biscuit et le faire respirer calmement." },
      { pnj: "le portrait qui parle", texte: "Un portrait accroché au mur se met à parler et veut qu'on lui raconte une blague.", talent: "coeur", reussite: "La blague le fait tellement rire qu'il révèle un secret important du château.", rate: "Le portrait ne rit pas… il trouve la blague nulle. Mais il donne quand même un petit indice, en soupirant." },
      { pnj: "le fantôme timide", texte: "Un fantôme tout timide se cache derrière une tapisserie. Il ne sait pas faire « Bouh ».", talent: "malin", reussite: "Les héros lui apprennent à faire un super « Bouh ! ». Il devient leur ami et leur indique où se cache le problème.", rate: "Le fantôme fait « Bouh » au mauvais moment et tout le monde sursaute, même les héros ! Mais il devient quand même leur ami." },
    ],
    mechants: [
      { nom: "Baron Grognon", description: "un petit baron avec une grosse moustache et des chaussures qui grincent", raison: "il est jaloux parce qu'on ne l'invite jamais à s'asseoir à la grande table", solutions: { coeur: "L'inviter au prochain banquet et lui faire une place d'honneur.", malin: "Le piéger avec une fausse invitation qui l'amène tout droit devant la Reine.", force: "Le battre dans un duel… de bataille d'oreillers." } },
      { nom: "Mirabilis la Sorcière", description: "une sorcière au chapeau de travers dont le chat noir est plus malin qu'elle", raison: "elle s'est trompée de formule magique et elle a trop honte pour l'avouer", solutions: { coeur: "Lui dire que tout le monde se trompe et l'aider à réparer son erreur.", malin: "Retrouver la bonne formule dans son grimoire et la lire à l'envers.", force: "Attraper sa baguette pendant qu'elle cherche ses lunettes." } },
      { nom: "Le Géant Bobo", description: "un géant aussi haut que la tour, qui marche tout doucement pour ne rien écraser", raison: "il a une écharde dans le pied et il cherche quelqu'un pour la lui enlever", solutions: { coeur: "Le rassurer et lui enlever délicatement son écharde.", malin: "Lui fabriquer un pansement géant avec une nappe.", force: "Tirer tous ensemble sur l'écharde — attention, il va crier « AÏE » très fort !" } },
    ],
    rebondissements: [
      "Le château se met à pencher d'un côté ! Tout glisse et roule : les meubles, les plats… et les héros.",
      "Le Compagnon a mangé un gâteau magique et il est devenu minuscule. Il faut le retrouver avant qu'une souris ne le prenne pour un fromage.",
      "Les héros découvrent un mot laissé par le coupable : « Pardon. Je ne voulais pas que ça aille si loin. »",
    ],
    tresors: [
      "un titre de Chevalier du Royaume, avec une vraie (petite) épée en chocolat",
      "une clé qui ouvre toutes les portes du château",
      "un nuage apprivoisé qui sert de lit",
      "une cape qui change de couleur selon l'humeur",
    ],
  },

  /* ===================== PIRATES ===================== */
  {
    id: "pirates",
    nom: "L'Île aux Pirates",
    emoji: "🏴‍☠️",
    compagnon: "Coco, un perroquet bavard qui répète tout de travers",
    creatures: ["un perroquet","un crabe","une tortue","un mousse","une mouette","un vieux pirate","un singe","une sirène"],
    imprevus: ["Un bateau pirate apparaît à l'horizon, drapeau au vent !", "La marée monte très vite : il faut grimper plus haut.", "Une bouteille arrive sur la plage avec un message à l'intérieur.", "Un singe a volé la carte et se sauve en riant dans les palmiers."],
    ambiance: "Le soleil tape fort, le sable est chaud et les vagues font « shhh… shhh… ». Des palmiers se balancent, et au loin on aperçoit un bateau aux voiles rapiécées.",
    donneurs: [
      "Capitaine Barbe-Rose, une pirate à la barbe tressée de rubans",
      "Petit Moussaillon Tim, qui n'a encore jamais navigué",
      "Madame Tortue, qui a cent ans et se souvient de tout",
      "un crabe nommé Pince-Mi, qui parle très vite",
    ],
    problemes: [
      { titre: "La Carte Déchirée", texte: "la carte du trésor de l'île a été déchirée en morceaux et éparpillée partout. Si on ne la retrouve pas, le trésor sera perdu pour toujours." },
      { titre: "Le Bateau qui Ne Flotte Plus", texte: "quelqu'un a fait un trou dans la coque du bateau, et il ne reste plus qu'une journée avant la grande course des pirates." },
      { titre: "La Sirène Muette", texte: "la sirène qui guide les bateaux avec sa chanson a perdu sa voix. Sans elle, les bateaux vont se cogner aux rochers." },
      { titre: "Le Perroquet Kidnappé", texte: "le perroquet du capitaine a été enlevé, et c'est le seul à connaître le chemin du trésor." },
    ],
    lieux: [
      { nom: "La Plage aux Coquillages", description: "Une plage couverte de coquillages de toutes les couleurs. Certains chuchotent quand on les met à l'oreille." },
      { nom: "La Jungle des Singes", description: "Une jungle épaisse pleine de lianes, de fleurs géantes et de singes qui lancent des noix de coco." },
      { nom: "La Grotte du Crâne", description: "Une grotte dont l'entrée ressemble à un crâne géant. Dedans, l'écho répète tout trois fois." },
      { nom: "Le Ponton Branlant", description: "Un vieux ponton de bois qui craque à chaque pas, au-dessus d'une eau turquoise pleine de poissons." },
      { nom: "Le Volcan Endormi", description: "Un petit volcan qui ronfle. Parfois, il souffle de la fumée qui sent la crêpe brûlée." },
    ],
    obstacles: [
      { texte: "Une bande de singes farceurs lance des noix de coco sur les héros.", talent: "malin", reussite: "Les héros leur offrent des bananes en échange de la paix. Les singes applaudissent et les laissent passer.", rate: "BONK ! Une noix de coco tombe sur la tête d'un héros (−1 ❤️). Les singes rigolent… mais le laissent passer quand même." },
      { texte: "Il faut se balancer d'une liane à l'autre pour traverser une rivière pleine de crocodiles endormis.", talent: "force", reussite: "Comme de vrais aventuriers, les héros traversent en criant « Youhouuu ! ».", rate: "Un héros atterrit en plein sur le dos d'un crocodile… qui se réveille ! Heureusement, il est gentil et le dépose sur la rive, mais il veut qu'on lui gratte le ventre d'abord." },
      { texte: "Un coffre fermé par une serrure en forme d'énigme : « Je suis plein de trous mais je retiens l'eau. Qui suis-je ? » (une éponge)", talent: "malin", reussite: "Clic ! Le coffre s'ouvre et contient un objet utile pour la suite.", rate: "Le coffre crache un nuage de poudre qui fait éternuer tout le monde pendant une minute. Mais il s'ouvre quand même." },
      { texte: "Une grosse vague arrive droit sur la plage !", talent: "force", reussite: "Les héros courent et grimpent sur un rocher juste à temps.", rate: "Splaaash ! Les héros sont trempés et la vague emporte un objet appartenant à l'un d'eux. Un dauphin le rapportera plus tard." },
      { texte: "Un pirate fantôme garde le passage et ne laisse passer que ceux qui chantent une chanson de pirate.", talent: "coeur", reussite: "Les héros chantent si fort que le fantôme se met à danser et les laisse passer.", rate: "Le fantôme trouve la chanson trop douce. Il faut recommencer, cette fois avec de vrais « YO-HO-HO ! »" },
    ],
    rencontres: [
      { pnj: "le bébé tortue", texte: "Un bébé tortue n'arrive pas à rejoindre la mer : des mouettes lui tournent autour.", talent: "coeur", reussite: "Les héros protègent la tortue jusqu'à l'eau. Sa grand-mère, une tortue géante, les remercie avec un indice.", rate: "Une mouette chipe le chapeau d'un héros ! La tortue est sauvée, mais le héros devra récupérer son chapeau plus tard." },
      { pnj: "le vieux pirate à la jambe de bois", texte: "Un vieux pirate à la jambe de bois s'est endormi sur un morceau de la carte.", talent: "malin", reussite: "Tout doucement, les héros récupèrent ce dont ils ont besoin sans le réveiller.", rate: "Le pirate se réveille ! Mais il est gentil : il veut juste qu'on lui raconte une histoire avant de les aider." },
      { pnj: "la sirène qui s'ennuyait", texte: "Une sirène assise sur un rocher est triste : personne ne veut jouer avec elle.", talent: "coeur", reussite: "Les héros jouent avec elle à faire des ricochets. Elle leur offre une ✨ étoile chacun.", rate: "La sirène plonge, vexée. Mais elle revient avec un coquillage-indice : elle voulait juste un « s'il te plaît »." },
    ],
    mechants: [
      { nom: "Capitaine Crochet-de-Travers", description: "un pirate maladroit dont le crochet est en forme de fourchette", raison: "son équipage l'a quitté et il veut prouver qu'il est encore un grand pirate", solutions: { coeur: "Lui proposer de rejoindre l'équipe des héros.", malin: "Le convaincre que le vrai trésor est caché ailleurs.", force: "Gagner contre lui au bras de fer (ou au tir à la corde)." } },
      { nom: "La Pieuvre Chatouille", description: "une pieuvre violette qui chatouille tout ce qu'elle attrape", raison: "elle collectionne les objets brillants parce qu'elle trouve sa grotte trop sombre", solutions: { coeur: "Lui offrir une lanterne pour éclairer sa grotte.", malin: "Échanger le trésor contre des coquillages brillants.", force: "Résister aux chatouilles assez longtemps pour reprendre l'objet (sans rire !)." } },
      { nom: "Requin Molaire", description: "un requin aux dents toutes de travers qui parle en zozotant", raison: "il a mal aux dents et il est grognon à cause de ça", solutions: { coeur: "Lui apporter une brosse à dents géante et du dentifrice.", malin: "Le faire rire pour qu'il ouvre la bouche et récupérer l'objet coincé dedans.", force: "Pagayer très vite pour lui échapper jusqu'à la plage." } },
    ],
    rebondissements: [
      "Le volcan se réveille et se met à cracher… du pop-corn ! Il faut s'abriter (ou en manger).",
      "Le Compagnon a été capturé dans un filet de pêcheur. Il crie au secours depuis un bateau qui s'éloigne !",
      "Une tempête éclate. Le ciel devient tout noir et il faut trouver un abri en vitesse.",
    ],
    tresors: [
      "un coffre rempli de pièces en chocolat",
      "une longue-vue qui permet de voir à travers les murs",
      "un vrai chapeau de capitaine pour chaque héros",
      "une bouteille à la mer qui peut envoyer un message à n'importe qui",
    ],
  },

  /* ===================== ESPACE ===================== */
  {
    id: "espace",
    nom: "Le Voyage dans les Étoiles",
    emoji: "🚀",
    compagnon: "Bip-Bop, un petit robot qui clignote quand il est content",
    creatures: ["un extraterrestre","un robot","une astronaute","un martien","une étoile vivante","un satellite qui parle","un vendeur de comètes"],
    imprevus: ["Une alarme se met à sonner : « Alerte ! Alerte ! Biscuits presque finis ! »", "Une comète passe tout près et laisse une traînée d'étincelles.", "La gravité s'arrête pendant une minute : tout le monde flotte !", "Un message radio arrive en grésillant, dans une langue bizarre."],
    ambiance: "Par le hublot de la fusée, les étoiles brillent comme des paillettes. Des planètes de toutes les couleurs flottent dans le noir et, à l'intérieur, tout fait « bip » et « vrrrr ».",
    donneurs: [
      "la Commandante Zara, qui dirige la station spatiale",
      "Glouk, un petit extraterrestre vert à trois yeux",
      "le Professeur Comète, un savant aux cheveux en pétard",
      "Lumi, une étoile qui a perdu son éclat",
    ],
    problemes: [
      { titre: "La Lune a le Hoquet", texte: "la Lune a le hoquet ! À chaque « hic », elle saute dans le ciel et les marées font n'importe quoi." },
      { titre: "Les Étoiles Éteintes", texte: "les étoiles s'éteignent une par une. Bientôt, plus personne ne pourra retrouver son chemin dans l'espace." },
      { titre: "La Planète des Bonbons en Danger", texte: "la Planète des Bonbons est en train de fondre, et ses habitants appellent au secours." },
      { titre: "Le Message Mystérieux", texte: "un message étrange arrive d'une planète inconnue : « Bip… aide… bip… nous… » Il faut aller voir !" },
    ],
    lieux: [
      { nom: "La Ceinture d'Astéroïdes", description: "Des milliers de rochers flottent dans l'espace et se cognent doucement, toc, toc." },
      { nom: "La Planète Rebondissante", description: "Une planète toute molle comme un trampoline géant. Chaque pas fait faire un bond énorme." },
      { nom: "Le Marché des Extraterrestres", description: "Un marché plein de créatures bizarres qui vendent des fruits qui chantent et des chaussettes à six pieds." },
      { nom: "La Station Abandonnée", description: "Une vieille station spatiale où les lumières clignotent et où les portes s'ouvrent toutes seules en faisant « pschhh »." },
      { nom: "La Lune de Glace", description: "Une petite lune toute blanche et glissante, où l'on patine au lieu de marcher." },
    ],
    obstacles: [
      { texte: "La fusée doit traverser une pluie d'astéroïdes !", talent: "malin", reussite: "Les héros pilotent comme des champions et évitent tous les rochers.", rate: "BONG ! Un astéroïde touche la fusée. Une alarme sonne et il faut réparer un tuyau qui fuit de la fumée violette." },
      { texte: "Une porte de la station est bloquée. Il faut la forcer à la main.", talent: "force", reussite: "Hiiii-ha ! La porte s'ouvre en grinçant.", rate: "La porte s'ouvre d'un coup et un héros est aspiré dans un placard plein de chaussettes spatiales. Il en ressort avec une chaussette sur la tête." },
      { texte: "Un robot de garde ne comprend que les phrases qui riment.", talent: "malin", reussite: "Les héros inventent une super rime et le robot répond « Bip ! Accès autorisé ! ».", rate: "Le robot se met à danser pour de mauvaises raisons et bloque le passage. Il faut le faire rire pour qu'il se calme." },
      { texte: "Il n'y a plus de gravité ! Les héros flottent dans tous les sens et doivent atteindre l'autre bout de la salle.", talent: "force", reussite: "En se poussant contre les murs, les héros nagent dans l'air jusqu'à la sortie.", rate: "Les héros tournent sur eux-mêmes comme des toupies. Ils ont un peu mal au cœur (−1 ❤️ pour l'un d'eux) mais finissent par arriver." },
      { texte: "Un extraterrestre géant ne parle pas la même langue et pousse des cris bizarres.", talent: "coeur", reussite: "Avec des gestes et des sourires, les héros se font comprendre. L'extraterrestre leur montre le chemin.", rate: "Oups, un geste veut dire « tu sens le fromage » dans sa langue ! Il est vexé. Il faut s'excuser avec une danse." },
    ],
    rencontres: [
      { pnj: "le bébé extraterrestre", texte: "Un bébé extraterrestre s'est perdu au milieu du marché et pleure des larmes pétillantes.", talent: "coeur", reussite: "Les héros retrouvent ses parents. Pour les remercier, ils leur donnent un indice et un fruit qui donne une ✨ étoile.", rate: "Le bébé s'accroche à la jambe d'un héros et ne veut plus la lâcher ! Il faudra l'emmener avec vous pendant une scène." },
      { pnj: "la vieille astronaute", texte: "Une vieille astronaute a son vaisseau en panne au bord du chemin.", talent: "malin", reussite: "Les héros trouvent la panne : il manquait juste une pile ! Elle leur révèle où se cache le coupable.", rate: "Le vaisseau fait un gros nuage de fumée noire. Tout le monde tousse. Mais en dessous, les héros trouvent un indice." },
      { pnj: "le petit nuage d'étoiles", texte: "Un petit nuage d'étoiles timide se cache derrière une planète.", talent: "coeur", reussite: "Les héros l'apprivoisent en lui parlant doucement. Il devient leur ami et éclaire leur chemin.", rate: "Le nuage s'enfuit. Mais il laisse derrière lui une traînée d'étoiles qui montre la direction à suivre." },
    ],
    mechants: [
      { nom: "Zorglouf l'Aspirateur", description: "un robot aspirateur géant qui aspire tout sur son passage", raison: "son bouton « stop » est cassé et il ne sait plus comment s'arrêter", solutions: { coeur: "Lui parler gentiment pour le calmer pendant que quelqu'un répare son bouton.", malin: "Trouver le bouton caché pour l'éteindre (ou le faire aspirer une chaussette qui le bloque).", force: "Tirer sur sa prise tous ensemble." } },
      { nom: "Reine Nébula", description: "une reine extraterrestre avec une cape d'étoiles et un air très sérieux", raison: "elle voulait les plus belles étoiles pour décorer sa chambre, sans savoir que tout le monde en avait besoin", solutions: { coeur: "Lui expliquer pourquoi les étoiles sont importantes pour tout le monde.", malin: "Lui offrir une veilleuse magique qui fait encore plus joli.", force: "Récupérer les étoiles en sautant plus haut que ses gardes." } },
      { nom: "Le Trou Noir Glouton", description: "un tourbillon sombre avec deux petits yeux et une grande bouche", raison: "il est petit, il a faim et il ne sait pas ce qu'il a le droit de manger", solutions: { coeur: "Lui apprendre ce qu'il peut manger : la poussière d'étoiles, ça se mange !", malin: "Lui donner à manger un objet tellement gros qu'il a le hoquet et recrache tout.", force: "Allumer tous les moteurs de la fusée pour s'échapper." } },
    ],
    rebondissements: [
      "La fusée tombe en panne d'essence ! Il faut trouver du carburant… qui ici est du jus de banane.",
      "Le Compagnon a appuyé sur un bouton interdit : toute la station se met à jouer de la musique disco.",
      "On découvre que le coupable a un ami qui essaie de l'arrêter depuis le début.",
    ],
    tresors: [
      "une étoile de poche qui sert de veilleuse",
      "un badge d'Astronaute Officiel pour chaque héros",
      "une graine de planète à faire pousser dans un pot",
      "un petit robot ami qui suit les héros partout",
    ],
  },

  /* ===================== DINOSAURES ===================== */
  {
    id: "dinos",
    nom: "La Vallée des Dinosaures",
    emoji: "🦕",
    compagnon: "Pouic, un bébé tricératops qui fait des bruits de klaxon",
    creatures: ["un bébé tricératops","un ptérodactyle","une libellule géante","un stégosaure","un raptor","une tortue préhistorique","un diplodocus"],
    imprevus: ["Le sol tremble : boum… boum… BOUM ! Quelque chose de très gros approche.", "Un volcan au loin crache un nuage de fumée rose.", "Un œuf se met à bouger et à craquer tout près des héros.", "Un ptérodactyle attrape un objet d'un héros et s'envole avec."],
    ambiance: "Des fougères géantes, des volcans fumants au loin et le sol qui tremble à chaque pas de diplodocus. Ça sent la terre mouillée et on entend des « ROAAR » au loin.",
    donneurs: [
      "Grand-Mère Diplodocus, si grande qu'elle parle depuis le haut des arbres",
      "Tiki, un petit ptérodactyle qui volette partout",
      "Docteur Fossile, une scientifique avec une loupe géante",
      "Bob le Stégosaure, très gentil mais un peu lent",
    ],
    problemes: [
      { titre: "L'Œuf Égaré", texte: "un œuf de dinosaure a roulé hors de son nid pendant la nuit. Il va bientôt éclore et sa maman est très inquiète." },
      { titre: "Le Volcan Grognon", texte: "le grand volcan gronde de plus en plus fort, et les dinosaures ont peur qu'il se réveille." },
      { titre: "La Source Asséchée", texte: "le lac où tous les dinosaures viennent boire est presque vide, et personne ne sait pourquoi." },
      { titre: "Le Rugissement Perdu", texte: "le grand T-Rex a perdu son rugissement. Maintenant, quand il essaie, il ne fait que « pouêt »." },
    ],
    lieux: [
      { nom: "La Forêt de Fougères", description: "Des fougères plus hautes qu'une maison. On ne voit pas à deux pas et ça bouge partout." },
      { nom: "Le Lac aux Bulles", description: "Un lac chaud qui fait des bulles. De grands dinosaures au long cou y boivent tranquillement." },
      { nom: "Les Falaises des Ptérodactyles", description: "De hautes falaises avec des nids partout et des ptérodactyles qui planent en criant." },
      { nom: "Le Cimetière de Fossiles", description: "Un grand champ plein d'os géants. Certains ressemblent à des toboggans." },
      { nom: "La Grotte aux Cristaux", description: "Une grotte qui brille de mille couleurs grâce à des cristaux qui chantent quand on les touche." },
    ],
    obstacles: [
      { texte: "Un troupeau de tricératops passe au galop et bloque le chemin !", talent: "malin", reussite: "Les héros trouvent un rocher pour s'abriter et attendent que le troupeau soit passé.", rate: "Un héros est emporté par le troupeau, assis sur le dos d'un tricératops ! Il atterrit un peu plus loin, tout décoiffé (−1 ❤️)." },
      { texte: "Une rivière de boue bloque le passage. Il faut construire un pont avec des troncs.", talent: "force", reussite: "Les héros poussent des troncs et fabriquent un super pont.", rate: "Le pont s'écroule à moitié et tout le monde finit couvert de boue de la tête aux pieds. Mais on est de l'autre côté !" },
      { texte: "Des empreintes géantes partent dans toutes les directions. Lesquelles suivre ?", talent: "malin", reussite: "Les héros reconnaissent les bonnes empreintes et suivent la bonne piste.", rate: "Les héros suivent les mauvaises empreintes… et tombent sur un dinosaure qui fait la sieste. Il faut repartir sur la pointe des pieds." },
      { texte: "Il faut escalader une falaise pour atteindre un nid.", talent: "force", reussite: "Prise après prise, les héros grimpent jusqu'en haut.", rate: "Une maman ptérodactyle croit qu'on veut voler ses œufs ! Il faut lui expliquer (avec ❤️) qu'on vient en ami." },
      { texte: "Un raptor curieux suit les héros et leur pique leurs affaires.", talent: "coeur", reussite: "Les héros jouent à lancer un bâton avec lui. Il devient tout gentil, comme un chiot.", rate: "Le raptor part en courant avec le sac d'un héros. Course-poursuite !" },
    ],
    rencontres: [
      { pnj: "le bébé dinosaure", texte: "Un bébé dinosaure a la tête coincée dans un tronc creux.", talent: "force", reussite: "Les héros le libèrent. Ses parents, très reconnaissants, leur donnent un indice.", rate: "Le bébé sort d'un coup et tout le monde tombe à la renverse. Mais il est libre et fait un gros bisou baveux aux héros." },
      { pnj: "le vieil ankylosaure", texte: "Un vieux ankylosaure grognon refuse de bouger du chemin : il a mal au dos.", talent: "coeur", reussite: "Les héros lui font un massage. Ravi, il les laisse passer et leur raconte ce qu'il a vu.", rate: "Il grogne encore plus fort. Il faudra lui trouver une feuille de fougère douce pour s'allonger dessus." },
      { pnj: "la petite dinosaure peintre", texte: "Une petite dinosaure peintre dessine sur les rochers. Elle a dessiné quelque chose de très important… mais en tout petit.", talent: "malin", reussite: "Les héros comprennent le dessin : c'est un plan qui montre où aller !", rate: "Le dessin n'est pas clair… Il faut l'aider à finir sa peinture avant de comprendre." },
    ],
    mechants: [
      { nom: "Rex-le-Ronchon", description: "un T-Rex énorme aux tout petits bras", raison: "il est grognon parce qu'il ne peut pas se gratter le dos, ni faire des câlins avec ses petits bras", solutions: { coeur: "Lui faire un gros câlin de groupe.", malin: "Lui fabriquer une grande gratte-dos avec une branche.", force: "Le distraire en courant autour de lui jusqu'à ce qu'il ait le tournis." } },
      { nom: "Les Trois Compsognathes", description: "trois tout petits dinosaures très rapides et très farceurs", raison: "ils s'ennuient et ils font des bêtises pour qu'on fasse attention à eux", solutions: { coeur: "Leur proposer de jouer avec les héros.", malin: "Les attraper avec un piège plein de baies sucrées.", force: "Les battre à la course (ce sera difficile !)." } },
      { nom: "Mamie Mosasaure", description: "un grand reptile marin avec des lunettes", raison: "elle a bouché la source par erreur en construisant un nid pour ses petits-enfants", solutions: { coeur: "L'aider à construire son nid ailleurs.", malin: "Lui montrer un meilleur endroit, plus douillet.", force: "Déplacer les gros rochers ensemble pour libérer l'eau." } },
    ],
    rebondissements: [
      "Le sol se met à trembler : c'est une parade de diplodocus ! Il faut éviter les pattes géantes.",
      "L'œuf (ou un objet important) se met à rouler tout seul dans une pente. Il faut le rattraper !",
      "Le Compagnon s'est fait un nouvel ami… qui est un dinosaure beaucoup, beaucoup plus gros que lui.",
    ],
    tresors: [
      "une dent de T-Rex porte-bonheur",
      "un œuf de dinosaure en cristal qui brille la nuit",
      "le titre d'Ami des Dinosaures (et une balade à dos de diplodocus)",
      "une carte de la vallée avec tous les endroits secrets",
    ],
  },

  /* ===================== SOUS LA MER ===================== */
  {
    id: "mer",
    nom: "Le Royaume sous la Mer",
    emoji: "🐠",
    compagnon: "Bulle, une petite méduse qui s'allume quand elle rigole",
    creatures: ["un hippocampe","une étoile de mer","un poulpe","un poisson-clown","une tortue de mer","un crabe","une sirène","un dauphin"],
    imprevus: ["Un banc de milliers de petits poissons entoure les héros : on n'y voit plus rien !", "Un courant chaud fait faire des bulles partout. Ça chatouille !", "Une ombre gigantesque passe au-dessus : c'est une baleine.", "Un coquillage se met à parler et à appeler au secours."],
    ambiance: "Tout est bleu et calme. Des poissons de toutes les couleurs passent en bancs, les algues dansent doucement et des bulles remontent vers la surface. Grâce à une bulle magique, les héros respirent sous l'eau.",
    donneurs: [
      "le Roi Corail, avec sa couronne de coquillages",
      "Ondine, une petite sirène très curieuse",
      "Monsieur Poulpe, qui fait huit choses à la fois",
      "Mamie Baleine, qui chante des chansons qui durent des heures",
    ],
    problemes: [
      { titre: "La Perle de Lumière", texte: "la Perle de Lumière, qui éclaire tout le royaume, a disparu. Le fond de la mer devient tout sombre." },
      { titre: "Le Courant Fou", texte: "un courant bizarre emporte tout sur son passage : les maisons-coquillages, les poissons et même les jouets des bébés phoques." },
      { titre: "La Chanson Oubliée", texte: "les baleines ont oublié leur chanson, et sans elle, elles ne retrouvent plus leur chemin pour voyager." },
      { titre: "Les Déchets Mystérieux", texte: "des tas d'objets bizarres venus de la surface tombent dans le jardin de corail et l'étouffent." },
    ],
    lieux: [
      { nom: "La Forêt d'Algues", description: "De longues algues vertes qui ondulent comme des cheveux. On peut facilement s'y emmêler." },
      { nom: "L'Épave du Vieux Bateau", description: "Un vieux bateau couché sur le sable, plein de trous et de coffres rouillés." },
      { nom: "Le Jardin de Corail", description: "Un jardin aux mille couleurs, où vivent des poissons-clowns et des hippocampes." },
      { nom: "La Fosse Profonde", description: "Un grand trou très sombre où vivent des poissons qui brillent comme des lampes." },
      { nom: "Le Palais de Nacre", description: "Un palais tout blanc et brillant, fait de coquillages et de perles." },
    ],
    obstacles: [
      { texte: "Une forêt d'algues collantes emmêle les héros qui essaient de passer.", talent: "malin", reussite: "Les héros nagent doucement, sans gigoter, et les algues les laissent passer.", rate: "Un héros est emmêlé comme un paquet cadeau ! Ses amis doivent le démêler, ce qui prend du temps." },
      { texte: "Un gros coffre bloque l'entrée de l'épave. Il est très lourd.", talent: "force", reussite: "Les héros poussent le coffre et l'entrée se libère.", rate: "Le coffre s'ouvre en tombant et libère un nuage d'encre de poulpe ! On n'y voit plus rien pendant un moment." },
      { texte: "Un courant puissant essaie d'emporter les héros.", talent: "force", reussite: "En nageant très fort et en se tenant la main, les héros résistent au courant.", rate: "Le courant emporte un héros un peu plus loin (−1 ❤️). Il atterrit à côté d'un crabe qui lui pince le doigt." },
      { texte: "Un hippocampe garde une porte et demande une énigme : « Plus j'ai de pattes, moins je marche vite… non, attends, c'est faux ! » Il a oublié son énigme et il est tout perdu.", talent: "coeur", reussite: "Les héros l'aident à se souvenir et il les laisse passer, ravi.", rate: "L'hippocampe s'énerve contre lui-même. Il faut le calmer avant qu'il ne bouche la porte avec sa queue." },
      { texte: "Dans la fosse, il fait tout noir. Il faut trouver la sortie.", talent: "malin", reussite: "Les héros suivent les petits poissons lumineux, qui connaissent le chemin.", rate: "Les héros se cognent dans quelque chose de mou… C'est un énorme mérou qui dort. Il bâille et manque de les avaler !" },
    ],
    rencontres: [
      { pnj: "le bébé phoque", texte: "Un bébé phoque s'est emmêlé dans un vieux filet de pêche.", talent: "malin", reussite: "Les héros le libèrent délicatement. Sa maman leur révèle un secret sur le problème.", rate: "Le filet s'emmêle encore plus, autour d'un héros cette fois ! Mais à deux, ils arrivent à se libérer." },
      { pnj: "l'étoile de mer", texte: "Une étoile de mer est tombée sur le dos et n'arrive pas à se retourner.", talent: "force", reussite: "Les héros la retournent. Elle leur donne une ✨ étoile chacun (c'est normal, c'est une étoile !).", rate: "Elle se colle sur le visage d'un héros pour lui faire un bisou. C'est gluant, mais elle est contente." },
      { pnj: "le vieux poisson-lune", texte: "Un vieux poisson-lune ne veut parler qu'à quelqu'un qui lui raconte un rêve.", talent: "coeur", reussite: "Le héros raconte son plus beau rêve. Le poisson-lune, ému, lui donne un indice précieux.", rate: "Le poisson-lune s'endort au milieu du rêve. Il faudra le réveiller tout doucement." },
    ],
    mechants: [
      { nom: "Gargouillo le Crabe Géant", description: "un crabe gigantesque avec une pince plus grosse que l'autre", raison: "il collectionne les trésors parce qu'il a peur qu'on le trouve ennuyeux sans eux", solutions: { coeur: "Lui dire qu'il est intéressant tel qu'il est et devenir son ami.", malin: "Lui proposer un échange contre un trésor encore plus étonnant.", force: "Le chatouiller sous la carapace jusqu'à ce qu'il lâche tout." } },
      { nom: "Méduséa", description: "une grande méduse qui fait des éclairs quand elle se fâche", raison: "elle est fâchée parce que tout le monde s'enfuit quand elle arrive, alors qu'elle voudrait juste des amis", solutions: { coeur: "Rester près d'elle et lui parler, même si elle fait des petits éclairs.", malin: "Lui trouver un endroit où ses éclairs servent de lumière à tout le royaume.", force: "Nager plus vite qu'elle jusqu'au palais pour prévenir le roi." } },
      { nom: "Le Kraken Endormi", description: "une pieuvre géante qui bouge dans son sommeil", raison: "il fait un cauchemar et, en bougeant ses tentacules, il provoque tous les problèmes", solutions: { coeur: "Lui chanter une berceuse pour calmer son cauchemar.", malin: "Le réveiller tout doucement avec une plume d'oiseau marin.", force: "Retenir ses tentacules tous ensemble le temps qu'il se calme." } },
    ],
    rebondissements: [
      "Une baleine passe et avale tout le monde ! Heureusement, son ventre est grand et elle veut bien recracher les héros… s'ils la font rire.",
      "La bulle magique qui permet de respirer commence à rétrécir. Il faut trouver une huître magique pour la regonfler.",
      "Le Compagnon a été pris pour un bonbon par un poisson glouton. Il faut le récupérer !",
    ],
    tresors: [
      "une perle qui permet de respirer sous l'eau quand on veut",
      "un coquillage qui joue de la musique quand on l'écoute",
      "une couronne de corail pour chaque héros",
      "un hippocampe à chevaucher pour revenir dans le royaume",
    ],
  },
];

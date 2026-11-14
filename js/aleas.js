/* ==========================================================
   Boîte à imprévus : tables pour improviser pendant la partie.
   Les tables communes servent dans tous les mondes ; chaque
   monde ajoute ses propres imprévus et créatures (data.js).
   ========================================================== */

// Oracle : lancez un dé (le vôtre ou celui du site).
// +1 si c'est probable, -1 si c'est peu probable.
const ORACLE = {
  1: { titre: "Non, et en plus…", texte: "Ça ne marche pas et ça se complique un peu (sans danger) : tirez une « Conséquence » si besoin.", cls: "no" },
  2: { titre: "Non.", texte: "Tout simplement non. Proposez une autre piste aux enfants.", cls: "no" },
  3: { titre: "Non, mais…", texte: "Non, mais il y a un petit lot de consolation : un indice, un ami, un objet…", cls: "no" },
  4: { titre: "Oui, mais…", texte: "Oui, mais il y a un petit souci : ça prend du temps, ça fait du bruit, ça salit…", cls: "yes" },
  5: { titre: "Oui.", texte: "Tout simplement oui !", cls: "yes" },
  6: { titre: "Oui, et en plus…", texte: "Oui, et il y a un bonus : une étoile ✨, un indice, une surprise agréable.", cls: "yes" },
};

const IMPREVUS_COMMUNS = [
  "Il se met à pleuvoir très fort. Il faut vite trouver un abri.",
  "Un animal minuscule s'accroche à un héros et ne veut plus le lâcher.",
  "Le ventre d'un héros gargouille si fort que tout le monde l'entend… même ceux qui ne devraient pas.",
  "Un coup de vent emporte le chapeau (ou l'objet préféré) d'un héros.",
  "On entend une musique au loin. D'où vient-elle ?",
  "Le sol se met à trembler doucement…",
  "Un message tombe du ciel, accroché à un petit parachute.",
  "Le Compagnon a disparu ! On l'entend ronfler quelque part tout près.",
  "Quelqu'un suit les héros en se cachant. (C'est un petit curieux tout gentil.)",
  "Une odeur délicieuse de gâteau flotte dans l'air.",
  "Tout devient silencieux d'un coup… Plus un bruit.",
  "Un arc-en-ciel apparaît et semble montrer une direction.",
  "Un héros trouve une empreinte très bizarre par terre.",
  "Il commence à faire nuit : il faut de la lumière.",
  "Un héros attrape le hoquet. Chaque « hic » le fait sauter un peu en l'air.",
  "Une porte (ou un passage) qui n'était pas là tout à l'heure vient d'apparaître.",
];

const NPC_NOMS = [
  "Barnabé", "Pimprenelle", "Gaspard", "Zouzou", "Philibert", "Margot", "Tic-Tac",
  "Croquignol", "Ninon", "Octave", "Capucine", "Mistigri", "Léon", "Bertille",
  "Popotte", "Grignotin", "Rosalie", "Firmin",
];

const NPC_CARACTERES = [
  "très poli et un peu précieux", "grognon mais gentil au fond", "trouillard (a peur de tout)",
  "bavard comme une pie", "très fier", "toujours endormi", "farceur",
  "tête en l'air (oublie tout)", "très pressé", "curieux de tout", "très timide",
  "joyeux (trouve tout formidable)",
];

const NPC_VOIX = [
  "parle en chuchotant", "finit toutes ses phrases par « hein ? »", "essaie de parler en rimes",
  "éternue tout le temps", "parle trèèès lentement", "rigole après chaque phrase",
  "a une grosse voix grave", "parle très vite et très aigu", "répète les deux derniers mots… derniers mots",
  "fait « hmm hmm » avant de répondre",
];

const NPC_VEUT = [
  "retrouver son chapeau perdu", "qu'on lui raconte une histoire", "quelque chose à manger",
  "se faire des amis", "qu'on l'aide à porter un gros paquet", "qu'on goûte sa soupe (bizarre)",
  "un câlin", "traverser un passage qui lui fait peur", "qu'on lui fasse un compliment",
  "qu'on joue à cache-cache avec lui",
];

const NPC_SAIT = [
  "un raccourci", "où se cache le coupable", "un secret sur le méchant",
  "rien du tout… mais fait semblant de savoir", "une chanson qui ouvre une porte magique",
  "où trouver un objet utile", "pourquoi le méchant est triste", "un mot de passe",
];

const CHOIX_COMMUNS = [
  ["un chemin plein de fleurs, mais très long", "un chemin tout court, mais tout noir"],
  ["un vieux pont qui grince", "traverser la rivière en sautant sur les pierres"],
  ["une grande porte rouge avec une poignée en or", "une toute petite porte verte, si basse qu'il faut ramper"],
  ["monter tout en haut pour regarder au loin", "descendre dans le trou pour voir ce qu'il y a dedans"],
  ["suivre les empreintes", "suivre la musique"],
  ["demander de l'aide à quelqu'un qui passe", "se débrouiller seuls"],
  ["passer en douce sans faire de bruit", "frapper poliment et se présenter"],
  ["le tunnel sombre", "l'escalade de la falaise"],
  ["se séparer en deux équipes", "rester tous ensemble"],
  ["foncer tout de suite", "se reposer et manger un goûter d'abord (on récupère 1 ❤️)"],
];

const OBJETS_TROUVES = [
  "une clé rouillée… qui ouvrira quelque chose plus tard",
  "un caillou qui brille de plus en plus quand on s'approche du but",
  "une plume qui fait éternuer tout ce qu'elle touche",
  "une bouteille avec un message à moitié effacé",
  "un parapluie qui peut faire voler une personne pendant quelques secondes",
  "une petite cloche : quand on la fait sonner, un ami arrive",
  "un gros biscuit (le manger redonne 1 ❤️)",
  "une loupe qui montre les choses invisibles",
  "une flûte qui endort les créatures quand on en joue doucement",
  "une corde qui fait des nœuds toute seule",
  "un ballon qui peut soulever un héros",
  "une boîte à musique qui calme les gens fâchés",
];

const CONSEQUENCES = [
  "Ça marche… mais le héros fait un bruit énorme qui réveille quelque chose.",
  "Ça marche… mais un objet se casse ou se perd en route.",
  "Ça marche… mais ça prend très longtemps, et quelqu'un en profite pour prendre de l'avance.",
  "Ça marche… mais le héros est tout sale, tout mouillé ou tout collant.",
  "Ça marche… mais le héros a le hoquet jusqu'à la fin de la scène.",
  "Ça marche à moitié : il faut qu'un ami vienne aider pour finir.",
  "Ça marche… mais quelqu'un a tout vu, caché derrière un buisson.",
  "Raté ! Le héros se retrouve la tête en bas, accroché par un pied.",
  "Raté ! Un petit animal en profite pour chiper quelque chose.",
  "Raté… mais en tombant, le héros découvre quelque chose d'intéressant.",
  "Raté : petit bobo, le héros perd 1 ❤️.",
  "Raté, et c'est tellement drôle que tout le monde éclate de rire (même le méchant).",
];

const COUPS_DE_POUCE = [
  "Le Compagnon a une idée : il propose deux solutions aux enfants, ils choisissent.",
  "Quelque chose brille un peu plus loin : un indice attire l'attention des héros.",
  "Un personnage arrive et pose une question qui met sur la piste.",
  "Rappelez à chaque enfant son pouvoir magique et son objet préféré.",
  "Demandez : « Qu'est-ce que ton héros ferait s'il était super courageux ? »",
  "Faites arriver un événement qui oblige à bouger : une cloche sonne, le sol tremble…",
  "Demandez au plus petit : « Toi, tu pousses, tu cherches ou tu parles ? » (Force, Malin ou Cœur).",
  "Changez de héros : demandez à un autre enfant ce que son héros remarque.",
];

// 🌟 Un 6 au dé : réussite critique (le héros gagne aussi une étoile)
const CRITIQUES = [
  "C'est tellement réussi que tout le monde applaudit, même les oiseaux.",
  "En plus, le héros trouve un petit trésor caché juste à côté : un objet de plus dans le sac 🎒.",
  "C'est fait avec tellement de style que le héros gagne un surnom. Demandez aux enfants lequel !",
  "En plus, un indice important apparaît juste devant les héros.",
  "Ça marche si bien que toute l'équipe récupère 1 ❤️.",
  "Un petit animal a tout vu et décide de suivre les héros pour les aider.",
  "Le héros découvre un raccourci : on arrive plus vite au prochain endroit.",
  "C'est si impressionnant que le prochain défi sera facile (3 ou plus).",
  "Le Compagnon est tellement épaté qu'il reste bouche bée… puis fait une danse de la victoire.",
  "Une pluie de paillettes tombe du ciel. Personne ne sait d'où elle vient, mais c'est magnifique.",
];

// 🙈 Un 1 au dé : catastrophe rigolote (drôle, jamais grave ; le héros gagne une étoile de courage)
const GAFFES = [
  "Le héros glisse, fait trois roulades et atterrit la tête dans un buisson. Seules ses jambes dépassent !",
  "Le héros éternue si fort que son chapeau (ou ses chaussures) s'envole au loin.",
  "Le héros se prend les pieds dans sa cape et tombe sur le Compagnon, qui fait « Pouic ! »",
  "Au lieu de ça, le héros se met à chanter très faux, et tout le monde se bouche les oreilles.",
  "Le héros se trompe complètement de direction et part très fièrement… dans le mauvais sens.",
  "Le pantalon du héros reste accroché à une branche : il finit la scène en caleçon à pois !",
  "Le héros fait par accident un énorme bruit de prout. Plus personne n'arrive à rester sérieux.",
  "Le héros reste coincé dans un trou trop petit, les fesses en l'air. Il faut tirer tous ensemble !",
  "Un oiseau prend les cheveux du héros pour un nid et s'y installe confortablement.",
  "Le héros se cogne et voit des petites étoiles tourner autour de sa tête pendant un moment.",
  "Le héros est couvert de boue (ou de sable, ou de neige) de la tête aux pieds : on dirait un monstre !",
];

// ⏳ Moments de suspense : on fait durer avant de révéler (jamais effrayant pour de vrai)
const SUSPENSES = [
  "Tout à coup… silence. Plus un bruit. Même le vent s'est arrêté. Puis… CRAC ! Quelque chose craque juste derrière vous.",
  "Vous entendez des pas. Toc… toc… toc… Ils se rapprochent… de plus en plus près…",
  "Une ombre passe très vite devant vous. Elle était grande ? Petite ? Personne n'a eu le temps de voir.",
  "Là-bas, au fond, quelque chose brille. Ça clignote… une fois… deux fois… trois fois…",
  "Le sol se met à trembler tout doucement. Boum… boum… BOUM.",
  "Une petite voix chuchote vos prénoms. Oui, vos vrais prénoms…",
  "Le Compagnon se cache derrière vous en tremblant : « Vous… vous avez entendu ça ? »",
  "Une porte s'ouvre toute seule en grinçant… très… très… lentement.",
  "Deux petits yeux brillent dans le noir. Ils clignent. Ils vous regardent.",
  "Ça sent bizarre, tout à coup. Ça sent… la chaussette ? Non… la crêpe ?",
  "Les buissons bougent. Quelque chose est caché dedans… et ça bouge encore.",
  "Un drôle de bruit monte : « Hmmmmmmm… » C'est un ronflement ? Un chant ? Un ventre qui gargouille ?",
];

const SUSPENSES_FINALE = [
  "Les héros arrivent devant l'entrée. Tout est calme… trop calme. Le cœur de chacun bat très fort : boum-boum, boum-boum. Qui ose entrer en premier ?",
  "Plus vous approchez, plus il fait sombre. Vous entendez une respiration… lente… profonde… Qui va passer la tête pour regarder ?",
  "Une grande ombre se dessine au loin. Elle bouge. Elle se retourne… Avant de la voir, chacun dit à voix haute une chose qui le rend courageux.",
];

const CONSEILS_SUSPENSE = [
  "Baissez la voix jusqu'au chuchotement, puis faites une pause de 3 secondes.",
  "Demandez aux enfants : « À votre avis, qu'est-ce que c'est ? » Laissez-les deviner avant de révéler.",
  "Tapotez lentement sur la table avec les doigts pour faire les pas ou le cœur qui bat.",
  "Faites durer : « Ça s'approche… ça s'approche… ça s'approche… » puis révélez d'un coup !",
  "Si vous pouvez, baissez un peu la lumière pendant ce moment (et rallumez après !).",
  "Regardez chaque enfant dans les yeux, sans rien dire, deux secondes. Puis continuez tout bas.",
];

// Choix stable (toujours le même pour un même défi) pour les aventures préparées
function pickStable(list, key) {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return list[h % list.length];
}

/* ---------------- Tirages ---------------- */
function rnd(list) { return list[Math.floor(Math.random() * list.length)]; }

const ALEAS = {
  oracle(theme, mod = 0) {
    const de = 1 + Math.floor(Math.random() * 6);
    const total = Math.min(6, Math.max(1, de + mod));
    const r = ORACLE[total];
    const detail = mod ? ` (dé ${de} ${mod > 0 ? "+1" : "−1"})` : ` (dé ${de})`;
    return { titre: r.titre, texte: r.texte + detail, cls: r.cls };
  },
  imprevu(theme) {
    const pool = IMPREVUS_COMMUNS.concat(theme ? theme.imprevus : [], theme ? theme.imprevus : []);
    return { texte: rnd(pool) };
  },
  personnage(theme) {
    const creature = theme ? rnd(theme.creatures) : "une drôle de créature";
    return {
      titre: `${rnd(NPC_NOMS)}, ${creature}`,
      lignes: [
        ["Caractère", rnd(NPC_CARACTERES)],
        ["🗣️ Pour le jouer", rnd(NPC_VOIX)],
        ["Son souhait", rnd(NPC_VEUT)],
        ["En échange, peut révéler", rnd(NPC_SAIT)],
      ],
    };
  },
  choix(theme) {
    let paire;
    if (theme && Math.random() < 0.5) {
      const [a, b] = [...theme.lieux].sort(() => Math.random() - 0.5);
      paire = [`aller vers ${a.nom.replace(/^(Le|La|Les|L')\s?/, (m) => m.toLowerCase())}`,
               `aller vers ${b.nom.replace(/^(Le|La|Les|L')\s?/, (m) => m.toLowerCase())}`];
    } else {
      paire = rnd(CHOIX_COMMUNS);
    }
    return { titre: "Que choisissent les héros ?", lignes: [["Ou bien", paire[0]], ["Ou bien", paire[1]]] };
  },
  objet() { return { texte: `Les héros trouvent ${rnd(OBJETS_TROUVES)}.` }; },
  consequence() { return { texte: rnd(CONSEQUENCES) }; },
  coupDePouce() { return { texte: rnd(COUPS_DE_POUCE) }; },
  suspense(theme) {
    return { titre: "Moment de suspense", texte: `${rnd(SUSPENSES)} 🎭 Conseil : ${rnd(CONSEILS_SUSPENSE)}` };
  },
  critique() { return { titre: "Réussite critique !", texte: `${rnd(CRITIQUES)} Le héros gagne une ✨ étoile.`, cls: "yes" }; },
  gaffe() { return { titre: "Catastrophe rigolote !", texte: `${rnd(GAFFES)} Pour son courage, le héros gagne quand même une ✨ étoile.`, cls: "no" }; },
};

const ALEAS_BOUTONS = [
  { id: "oracle", nom: "Oracle oui/non", emoji: "🔮", aide: "Les enfants demandent « Est-ce qu'il y a… ? » et vous ne savez pas" },
  { id: "imprevu", nom: "Imprévu", emoji: "⚡", aide: "Quand l'histoire ralentit" },
  { id: "personnage", nom: "Personnage", emoji: "🧑", aide: "Quelqu'un que les héros rencontrent" },
  { id: "choix", nom: "Choix", emoji: "🔀", aide: "Proposer deux chemins aux enfants" },
  { id: "objet", nom: "Objet trouvé", emoji: "🎁", aide: "Une récompense ou un indice" },
  { id: "suspense", nom: "Suspense", emoji: "⏳", aide: "Faire monter la tension avant une révélation" },
  { id: "critique", nom: "Réussite critique", emoji: "🌟", aide: "Le dé fait 6" },
  { id: "gaffe", nom: "Catastrophe rigolote", emoji: "🙈", aide: "Le dé fait 1" },
  { id: "consequence", nom: "Oui, mais…", emoji: "🌀", aide: "Après un dé raté (2 ou 3)" },
  { id: "coupDePouce", nom: "Coup de pouce", emoji: "💡", aide: "Les enfants ne savent plus quoi faire" },
];

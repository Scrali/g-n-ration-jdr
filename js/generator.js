/* ==========================================================
   Générateur d'aventures.
   Le hasard est "graine" (seed) : un même code redonne
   toujours la même aventure, pour pouvoir la retrouver.
   ========================================================== */

// Générateur pseudo-aléatoire reproductible (mulberry32)
function makeRng(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(rng, list) {
  return list[Math.floor(rng() * list.length)];
}

// Tire n éléments différents d'une liste
function pickMany(rng, list, n) {
  const copy = list.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

const QUESTIONS_AUX_ENFANTS = [
  "Qu'est-ce que vos héros font ?",
  "Qui passe en premier ? Et comment ?",
  "Qu'est-ce que vous entendez, ici ?",
  "Qu'est-ce que ça sent ? C'est bon ou c'est beurk ?",
  "Est-ce que quelqu'un a une idée rigolote ?",
  "Comment vous sentez-vous ? Courageux ou un peu inquiets ?",
  "Qu'est-ce que votre Compagnon en pense ?",
  "Est-ce que quelqu'un veut utiliser son objet préféré ?",
];

const DIFFICULTES = {
  3: { nom: "Facile", texte: "3 ou plus" },
  4: { nom: "Normal", texte: "4 ou plus" },
  5: { nom: "Difficile", texte: "5 ou plus" },
};

// themeOverride permet à la saga d'ajouter des défis communs au monde
function generateAdventure(themeId, lengthId, seed, themeOverride) {
  const theme = themeOverride || THEMES.find((t) => t.id === themeId) || THEMES[0];
  const length = LENGTHS.find((l) => l.id === lengthId) || LENGTHS[0];
  const rng = makeRng(seed);

  const donneur = pick(rng, theme.donneurs);
  const probleme = pick(rng, theme.problemes);
  const mechant = pick(rng, theme.mechants);
  const tresor = pick(rng, theme.tresors);
  const rebondissement = pick(rng, theme.rebondissements);

  // Lieux : un par scène + un pour la finale
  const lieux = pickMany(rng, theme.lieux, length.scenes + 1);
  const lieuFinal = lieux.pop();

  // Défis : une rencontre au milieu, des obstacles ailleurs
  const nbRencontres = length.scenes >= 4 ? 2 : 1;
  const rencontres = pickMany(rng, theme.rencontres, nbRencontres);
  // Chaque scène d'obstacle propose 2 chemins : les enfants choisissent
  const obstacles = pickMany(rng, theme.obstacles, (length.scenes - nbRencontres) * 2);
  const positionsRencontre =
    nbRencontres === 2 ? [1, 3] : [Math.floor(length.scenes / 2)];

  const questions = pickMany(rng, QUESTIONS_AUX_ENFANTS, length.scenes);

  const scenes = lieux.map((lieu, i) => {
    const estRencontre = positionsRencontre.includes(i);
    const defis = estRencontre ? [rencontres.shift()] : [obstacles.shift(), obstacles.shift()];
    // La première scène est facile pour bien démarrer
    let difficulte = 4;
    if (i === 0) difficulte = 3;
    else if (rng() < 0.25) difficulte = 3;
    return {
      numero: i + 1,
      type: estRencontre ? "rencontre" : "obstacle",
      lieu,
      defis,
      difficulte,
      question: questions[i],
    };
  });

  return {
    code: `${theme.id}-${length.id}-${seed}`,
    seed,
    theme,
    length,
    titre: probleme.titre,
    intro: {
      ambiance: theme.ambiance,
      texte: `Voici qu'arrive ${donneur}, qui a besoin de vous. Il y a un gros problème : ${probleme.texte}`,
      appel: "Il faut des héros pour sauver la situation. Est-ce que vous acceptez la mission ?",
    },
    compagnon: theme.compagnon,
    scenes,
    rebondissement: length.rebondissement ? rebondissement : null,
    finale: {
      lieu: lieuFinal,
      mechant,
      difficulte: length.id === "longue" ? 5 : 4,
    },
    tresor,
  };
}

// « Le Géant Bobo » en milieu de phrase → « le Géant Bobo »
function nomMilieu(nom) {
  return nom.replace(/^(Le |La |Les |L')/, (m) => m.toLowerCase());
}

// « de » + nom : « du jeune page », « des Trois Compsognathes », « de Méduséa »
function deNom(nom) {
  const n = nomMilieu(nom);
  if (n.startsWith("le ")) return `du ${n.slice(3)}`;
  if (n.startsWith("les ")) return `des ${n.slice(4)}`;
  return `de ${n}`;
}

function randomSeed() {
  return Math.floor(Math.random() * 90000) + 10000;
}

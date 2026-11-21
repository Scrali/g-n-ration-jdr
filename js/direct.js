/* ==========================================================
   Mode « Jouer en direct » : l'histoire se construit pendant
   la partie. Les enfants choisissent où aller, le Conteur
   clique le résultat de chaque défi, et la suite est générée
   en fonction de ce qui vient de se passer :
   - les héros des enfants sont nommés dans l'histoire, chacun son tour ;
   - un « oui, mais… » ouvre un fil qui revient plus tard ;
   - les personnages aidés deviennent des amis qui reviennent ;
   - un personnage pas aidé redemande de l'aide plus loin ;
   - la RÉPUTATION change l'efficacité des talents : des héros durs
     ou méchants voient la Force marcher de moins en moins bien,
     des héros gentils voient le Cœur marcher de mieux en mieux ;
   - refaire toujours la même chose devient plus difficile,
     essayer un talent jamais utilisé devient plus facile ;
   - des imprévus surgissent et se résolvent avec le dé.
   ========================================================== */

const LIVE_KEY = "petits-heros:direct";

const LIEUX_COMMUNS = [
  { nom: "Le Petit Village", description: "Quelques maisons rondes avec des cheminées qui fument. Tout le monde a l'air de se connaître." },
  { nom: "La Cabane Abandonnée", description: "Une vieille cabane en bois, avec une porte qui grince et une fenêtre cassée." },
  { nom: "Le Jardin Secret", description: "Derrière une haie, un jardin plein de fleurs géantes et de statues qui ont l'air de sourire." },
  { nom: "La Colline du Vent", description: "Une colline où le vent souffle si fort qu'il faut se tenir la main pour ne pas s'envoler." },
  { nom: "La Grotte qui Scintille", description: "Une petite grotte dont les murs brillent comme s'ils étaient couverts de paillettes." },
];

const TRANSITIONS = [
  "Vous marchez un bon moment, et vous arrivez à : {lieu}.",
  "Après une longue marche en chantant, vous voici à : {lieu}.",
  "Le chemin tourne, monte, descend… et vous mène à : {lieu}.",
  "Le Compagnon est sûr de connaître le chemin. Il a raison (pour une fois) : vous arrivez à : {lieu}.",
];

// Un « oui, mais… » ouvre un fil ; il se referme plus tard dans l'histoire
const FILS = [
  { id: "objet", ouverture: "Oups : dans la précipitation, quelque chose tombe d'un sac… et personne ne le remarque.",
    resolution: "Tiens ! C'est {creature}, qui s'approche avec quelque chose : l'objet que vous aviez perdu tout à l'heure ! Pour le récupérer, il suffit de dire merci très poliment." },
  { id: "temoin", ouverture: "Personne ne le remarque, mais quelqu'un a tout vu, caché un peu plus loin…",
    resolution: "Ce qui vous suivait en cachette se montre enfin : c'est {creature}, qui a vu tous vos efforts et veut vous aider. On vous confie un secret : le coupable, c'est {mechant}, et en vrai, {raison}.", secret: true },
  { id: "bruit", ouverture: "Tout ce bruit a réveillé quelque chose… On entend des pas derrière vous.",
    resolution: "Les pas qui vous suivaient depuis tout à l'heure ? C'est {creature}, qui voulait juste vous dire bonjour ! En échange d'une caresse, voici un raccourci jusqu'au prochain endroit." },
  { id: "nuit", ouverture: "Tout ça a pris du temps : le soleil commence à se coucher.",
    resolution: "La nuit est tombée, et on n'y voit plus grand-chose… Heureusement, de petites lumières s'approchent : si les héros les appellent gentiment, elles éclairent le chemin." },
  { id: "bobo", ouverture: "Un héros s'est fait un petit bobo et boite un peu.",
    resolution: "Au bord du chemin coule une source d'eau fraîche : le héros blessé y boit, récupère 1 ❤️ et ne boite plus !" },
];

const INDICES_MODELES = [
  "Des traces mènent vers {lieuFinal}.",
  "Quelqu'un a vu passer {description}.",
  "On raconte que le coupable n'est pas vraiment méchant… juste malheureux.",
];

// Pour faire participer les enfants à chaque étape
const INTERACTIONS = [
  "🎤 Tout le monde fait le bruit de cet endroit : le vent, l'eau, les animaux…",
  "✏️ {hero}, dessine vite ce que tu imagines ici (30 secondes, top chrono) !",
  "🤔 {hero}, invente le nom d'un personnage qui vit ici. Notez-le avec « ✨ Noter une idée » !",
  "🙌 Tout le monde mime comment les héros avancent ici : sur la pointe des pieds ? en rampant ? en sautillant ?",
  "💬 {hero}, qu'est-ce que ton héros dit à voix haute en arrivant ?",
  "🎵 Inventez ensemble une petite chanson de route de deux lignes.",
  "😂 {hero}, fais la grimace de ton héros quand il découvre ça !",
  "🤝 Décidez ensemble : qui passe devant, et qui surveille derrière ?",
  "👃 {hero}, ferme les yeux : qu'est-ce que ça sent, ici ?",
  "🎒 {hero}, est-ce que ton objet préféré pourrait servir ici ?",
];

// Un imprévu réussi
const IMPREVUS_REUSSIS = [
  "Les héros réagissent comme des champions : tout se passe bien !",
  "Bien joué ! Les héros s'en sortent sans une égratignure.",
  "Ouf ! Grâce à cette bonne idée, l'aventure peut continuer.",
  "Bravo ! Et en plus, ça fera une belle histoire à raconter.",
];

/* ---------------- Stockage ---------------- */
function loadLive() {
  let st = null;
  try { st = JSON.parse(localStorage.getItem(LIVE_KEY)); } catch { return null; }
  if (!st || !st.current) return st;
  // Parties commencées avec une ancienne version du site
  st.heroes = st.heroes || [];
  st.lastTalents = st.lastTalents || [];
  st.reputation = st.reputation || 0;
  st.pile = st.pile || [];
  st.inventions = st.inventions || [];
  [st.current, st.current.suite].forEach((c) => {
    if (c && ["scene", "finale", "imprevu"].includes(c.kind) && !c.difficultes) {
      Object.assign(c, talentDifficulties(st, c.difficulte || 4, c.kind === "finale"));
      c.base = c.difficulte || 4;
      c.interaction = c.interaction || INTERACTIONS[0].replace("{hero}", "Quelqu'un");
    }
  });
  return st;
}
function saveLive(st) {
  try { localStorage.setItem(LIVE_KEY, JSON.stringify(st)); } catch { /* stockage indisponible */ }
}
function clearLive() {
  try { localStorage.removeItem(LIVE_KEY); } catch { /* rien */ }
}

function liveTheme(st) { return THEMES.find((t) => t.id === st.themeId) || THEMES[0]; }
function liveRng(st) { st.tick = (st.tick || 0) + 1; return makeRng(st.seed + st.tick * 7919); }
function fill(t, vars) { return t.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : "")); }
function capFirst(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

/* ---------------- Les héros dans l'histoire ---------------- */
function liveHeroFrom(h) {
  const type = HERO_TYPES.find((t) => t.id === h.type) || HERO_TYPES[0];
  const power = POWERS.find((p) => p.id === h.power) || POWERS[0];
  return {
    id: h.id, name: h.name, emoji: type.emoji, talent: h.talent || "force",
    power: power.nom, powerEmoji: power.emoji, item: h.item || "", figurine: h.figurine || "",
    coeurs: 3, etoiles: 0, pouvoir: false, tours: 0, exploits: [],
  };
}

function heroAt(st, idx) { return st.heroes && st.heroes[idx] ? st.heroes[idx] : null; }

// « Un héros tombe dans l'eau » → « Un héros (Lina) tombe dans l'eau »
function nommer(text, hero) {
  if (!hero || !text) return text;
  return text.replace(/\b(Un|un|Le|le) héros\b(?! \()/, (m) => `${m} (${hero.name})`);
}

// À qui le tour ? Celui qui a le moins joué, de préférence avec le bon super-talent
function pickHero(st, talentHint) {
  if (!st.heroes || !st.heroes.length) return null;
  const min = Math.min(...st.heroes.map((h) => h.tours));
  const libres = st.heroes.map((h, i) => i).filter((i) => st.heroes[i].tours === min);
  const bon = libres.find((i) => st.heroes[i].talent === talentHint);
  return bon !== undefined ? bon : libres[0];
}

/* ---------------- Réputation et talents ---------------- */
function changeRep(st, delta, lignes) {
  const avant = st.reputation;
  st.reputation = Math.max(-5, Math.min(5, st.reputation + delta));
  if (st.reputation === avant) return;
  if (delta < 0) {
    lignes.push(st.reputation <= -1
      ? "😠 On murmure dans le coin : « Ces héros ne sont pas très gentils… » Les gens se méfient : la Force marchera moins bien."
      : "😕 Les habitants froncent un peu les sourcils en vous voyant passer.");
  } else {
    lignes.push(st.reputation >= 2
      ? "😇 On parle de vous partout : « Des héros si gentils ! » Tout le monde vous écoute : le Cœur marchera mieux."
      : "🙂 Les habitants vous sourient en vous voyant passer.");
  }
}

function repLabel(rep) {
  if (rep >= 3) return "😇 Héros adorés";
  if (rep >= 1) return "🙂 Plutôt aimés";
  if (rep === 0) return "😐 Personne ne vous connaît encore";
  if (rep >= -2) return "😕 On se méfie un peu de vous";
  return "😠 Plus personne ne vous fait confiance";
}

// La difficulté de chaque talent dépend de ce qui s'est passé avant
function talentDifficulties(st, base, finale = false) {
  const d = { force: base, malin: base, coeur: base };
  const raisons = [];
  const rep = st.reputation;
  if (rep <= -1) { d.force += 1; raisons.push("💪 Vous avez été durs avec les gens, alors ils se méfient : la Force marche moins bien."); }
  if (rep <= -3) { d.force += 1; d.coeur += 1; raisons.push("😠 Après tant de méchancetés, la Force marche encore moins bien… et il faudra être très sincère pour convaincre avec le Cœur."); }
  if (rep >= 2) { d.coeur -= 1; raisons.push("❤️ Tout le monde vous trouve gentils : le Cœur marche mieux."); }
  const last = st.lastTalents.slice(-2);
  if (last.length === 2 && last[0] === last[1]) {
    d[last[0]] += 1;
    raisons.push(`🔁 Encore ${TALENTS[last[0]].nom} ? On commence à s'y attendre : c'est un peu plus difficile.`);
  }
  if (st.step >= 2) {
    Object.keys(d).forEach((t) => {
      if (!st.talents[t]) { d[t] -= 1; raisons.push(`🎁 Personne ne s'attend à ce que vous utilisiez ${TALENTS[t].nom} : plus facile !`); }
    });
  }
  if (finale && st.secretConnu) { d.coeur -= 1; d.malin -= 1; raisons.push("🔑 Vous connaissez son secret : le Cœur et la ruse marchent mieux."); }
  Object.keys(d).forEach((t) => { d[t] = Math.max(2, Math.min(5, d[t])); });
  return { difficultes: d, raisons };
}

/* ---------------- Démarrage ---------------- */
// ctx (optionnel, pour la saga) : { sagaId, numero, total, final, introAvant, recap, heroes,
//   mechant, finaleLieu, tresor, fin, allies, rival, sac, inventions, gmExtra, reputation }
function startLive(themeId, lengthId, seed, ctx = null, heroes = null) {
  const theme = THEMES.find((t) => t.id === themeId) || THEMES[0];
  const length = LENGTHS.find((l) => l.id === lengthId) || LENGTHS[0];
  const rng = makeRng(seed);
  const mechant = ctx && ctx.mechant ? ctx.mechant : pick(rng, theme.mechants);
  const finaleLieu = ctx && ctx.finaleLieu ? ctx.finaleLieu : pick(rng, theme.lieux);
  const donneur = pick(rng, theme.donneurs);
  const probleme = pick(rng, theme.problemes);
  const team = (heroes || (ctx && ctx.heroes) || []).map(liveHeroFrom);
  const st = {
    mode: ctx ? "saga" : "solo",
    ctx,
    themeId: theme.id,
    lengthId: length.id,
    seed,
    tick: 0,
    titre: ctx && ctx.final ? ctx.titre : probleme.titre,
    mechant,
    finaleLieu,
    tresor: ctx && ctx.tresor ? ctx.tresor : pick(rng, theme.tresors),
    compagnon: theme.compagnon,
    nbScenes: length.scenes,
    step: 0,
    rencontreStep: Math.floor(length.scenes / 2),
    lieuxDispo: theme.lieux.filter((l) => l.nom !== finaleLieu.nom),
    lieuxCommuns: LIEUX_COMMUNS.slice(),
    usedDefis: [],
    talents: { force: 0, malin: 0, coeur: 0 },
    lastTalents: [],
    reputation: ctx && ctx.reputation ? ctx.reputation : 0,
    heroes: team,
    inventions: [],
    pile: [],
    secretConnu: false,
    fils: [],
    allies: [],
    indices: pickMany(rng, INDICES_MODELES, INDICES_MODELES.length).map((t) =>
      fill(t, { lieuFinal: nomMilieu(finaleLieu.nom), description: mechant.description })),
    lastRes: null,
    record: { scenes: [], finale: null, rival: null },
    log: [],
    current: null,
    undo: [],
  };

  const intro = [theme.ambiance].concat(ctx && ctx.introAvant ? ctx.introAvant : []);
  let texte = `Voici qu'arrive ${donneur}, qui a besoin de vous. Il y a un gros problème : ${probleme.texte}`;
  if (ctx && ctx.ami) texte = `Vous souvenez-vous ${deNom(ctx.ami.nom)}, de l'épisode ${ctx.ami.episode} ? Cette fois, c'est à son tour de vous demander de l'aide. Il y a un gros problème : ${probleme.texte}`;
  if (ctx && ctx.introTexte) texte = ctx.introTexte;
  intro.push(texte);
  intro.push(team.length
    ? `Il faut des héros pour sauver la situation. ${joinList(team.map((h) => h.name))} : est-ce que vous acceptez la mission ?`
    : "Il faut des héros pour sauver la situation. Est-ce que vous acceptez la mission ?");
  if (ctx && ctx.recap) st.log.push({ titre: "📺 Précédemment…", lignes: ctx.recap, cls: "recap" });
  st.log.push({ titre: "🌅 Le début de l'histoire", lignes: intro,
    note: [team.length ? "Demandez à chaque enfant de présenter son héros en une phrase, avec une voix de héros !" : "",
      playmoOn() && theme.playmo ? `🧸 Sortez : ${theme.playmo.liste}. ${theme.playmo.conseil}` : "",
      playmoOn() && team.some((h) => h.figurine) ? `🧸 Figurines : ${team.filter((h) => h.figurine).map((h) => `${h.name} = ${h.figurine}`).join(" · ")}` : "",
    ].filter(Boolean).join("\n") });
  st.introLignes = intro;
  // Première carte : l'introduction, à lire avant de choisir le premier chemin
  st.current = {
    kind: "intro",
    recap: ctx && ctx.recap ? ctx.recap : null,
    lire: intro,
    aide: [
      team.length ? `Chaque enfant présente son héros en une phrase, avec une voix de héros : ${joinList(team.map((h) => h.name))}.` : "",
      `Le Compagnon (pour Maman) : ${theme.compagnon}.`,
    ],
    suite: makeChoice(st),
  };
  return st;
}

/* ---------------- Étapes ---------------- */
function makeChoice(st) {
  const rng = liveRng(st);
  let options = pickMany(rng, st.lieuxDispo, 2).map((lieu) => ({ lieu }));
  while (options.length < 2 && st.lieuxCommuns.length) {
    const l = pick(rng, st.lieuxCommuns);
    if (!options.some((o) => o.lieu.nom === l.nom)) options.push({ lieu: l });
  }
  const chance = st.fils.find((f) => f.type === "secondeChance");
  if (chance && rng() < 0.6) {
    options[options.length - 1] = { lieu: chance.lieu, special: "secondeChance" };
  }
  // Un enfant différent choisit à chaque fois (ou on vote)
  const chooser = st.heroes.length ? st.heroes[st.step % st.heroes.length] : null;
  return {
    kind: "choix",
    question: st.step === 0 ? "Par où commencez-vous ?" : "Où allez-vous maintenant ?",
    chooser: chooser ? chooser.name : null,
    options,
  };
}

function chooseDefi(st, rng, type) {
  const theme = liveTheme(st);
  if (type === "rencontre") {
    const pool = theme.rencontres.filter((d) => !st.usedDefis.includes(d.texte));
    if (pool.length) return pick(rng, pool);
  }
  const pool = theme.obstacles.concat(OBSTACLES_COMMUNS).filter((d) => !st.usedDefis.includes(d.texte));
  // Le talent le moins utilisé jusqu'ici, pour que chacun puisse briller
  const min = Math.min(...Object.values(st.talents));
  const faibles = Object.keys(st.talents).filter((t) => st.talents[t] === min);
  const cible = pool.filter((d) => faibles.includes(d.talent));
  return pick(rng, cible.length ? cible : pool);
}

function chooseOption(st, index) {
  const opt = st.current.options[index];
  const rng = liveRng(st);
  st.lieuxDispo = st.lieuxDispo.filter((l) => l.nom !== opt.lieu.nom);
  st.lieuxCommuns = st.lieuxCommuns.filter((l) => l.nom !== opt.lieu.nom);

  const lire = [fill(pick(rng, TRANSITIONS), { lieu: opt.lieu.nom }), opt.lieu.description];
  const notes = [];
  let type;
  let defi;

  if (opt.special === "secondeChance") {
    const fil = st.fils.find((f) => f.type === "secondeChance");
    st.fils = st.fils.filter((f) => f !== fil);
    type = "rencontre";
    defi = fil.defi;
    lire.push(`Vous retrouvez ${fil.pnj}… toujours en difficulté ! C'est peut-être l'occasion d'aider, cette fois.`);
  } else {
    type = st.step === st.rencontreStep ? "rencontre" : "obstacle";
    // Un fil ouvert plus tôt se referme ici
    const ouverts = st.fils.filter((f) => f.type !== "secondeChance");
    if (ouverts.length && (rng() < 0.6 || st.step === st.nbScenes - 1)) {
      const fil = ouverts[0];
      st.fils = st.fils.filter((f) => f !== fil);
      lire.push(fil.resolution);
      if (fil.indice) lire.push(`🔎 Indice : ${st.indices.length ? st.indices.shift() : `le coupable, c'est ${nomMilieu(st.mechant.nom)}, et en vrai, ${st.mechant.raison}.`}`);
      if (fil.objet) (st.objets = st.objets || []).push(fil.objet);
      if (fil.secret) { st.secretConnu = true; notes.push("🔑 Les héros connaissent maintenant le secret du méchant : la fin sera plus facile avec le Cœur et la ruse."); }
    }
    defi = chooseDefi(st, rng, type);
  }
  st.usedDefis.push(defi.texte);

  const heroIdx = pickHero(st, defi.talent);
  const hero = heroAt(st, heroIdx);
  if (opt.special !== "secondeChance") lire.push(nommer(defi.texte, hero));

  // Les amis reviennent
  const amis = st.allies.concat(st.ctx && st.ctx.allies ? st.ctx.allies : []);
  if (amis.length && rng() < 0.35) {
    const ami = pick(rng, amis);
    lire.push(`Bonne surprise : ${ami} arrive pour vous donner un coup de main !`);
    notes.push(`🤝 ${capFirst(ami)} aide : un héros lance 1 dé de plus ici.`);
  }
  if (hero && hero.item && rng() < 0.3) notes.push(`🎒 ${hero.name} a toujours ${hero.item} : est-ce que ça peut servir ici ?`);
  if (st.ctx && st.ctx.sac && st.ctx.sac.length && rng() < 0.4) {
    notes.push(`🎒 Rappelez ce qu'il y a dans le sac (${pickMany(rng, st.ctx.sac, 2).join(" ; ")}) : un objet bien utilisé = pas besoin de dé.`);
  }
  const idees = st.inventions.concat(st.ctx && st.ctx.inventions ? st.ctx.inventions : []);
  if (idees.length && rng() < 0.45) notes.push(`✨ Faites revenir une idée des enfants : ${pick(rng, idees)}.`);

  if (st.objets && st.objets.length && rng() < 0.4) notes.push(`🎒 Dans le sac : ${pick(rng, st.objets)}. Si ça sert ici, pas besoin de dé !`);

  let base = 4;
  if (st.step === 0) base = 3;
  else if (st.lastRes === "oops") {
    base = 3;
    notes.push("🙂 Après le dernier « oui, mais… », ce défi-ci est plus facile.");
  }
  if (opt.bonus || st.prochainFacile) {
    base = Math.max(2, base - 1);
    notes.push(opt.bonus ? "🌈 Ce chemin a été montré par l'imprévu : le défi est plus facile." : "🙂 Grâce à l'imprévu de tout à l'heure, ce défi est plus facile.");
  }
  if (st.prochainDifficile) {
    base = Math.min(5, base + 1);
    notes.push("😓 À cause de l'imprévu de tout à l'heure, ce défi est un peu plus difficile.");
  }
  st.prochainFacile = false;
  st.prochainDifficile = false;
  const { difficultes, raisons } = talentDifficulties(st, base);
  const interaction = fill(pick(rng, INTERACTIONS), { hero: hero ? hero.name : "Quelqu'un" });

  const scene = { kind: "scene", type, lieu: opt.lieu, defi, base, difficultes, raisons, lire, notes, heroIdx, interaction };
  // Une fois sur deux environ, un moment de suspense avant de révéler le défi
  if (rng() < 0.55) {
    const s = pick(rng, SUSPENSES);
    lire.splice(2, 0, `⏳ ${s}`);
    st.current = { kind: "suspense", lire: lire.slice(0, 3), conseil: pick(rng, CONSEILS_SUSPENSE), suite: scene };
  } else {
    st.current = scene;
  }
}

// Réussite, crit, gaffe, pouvoir : ce qui arrive au héros qui agit
function heroEffects(st, hero, crit, lieuNom, lignes, texteResultat) {
  if (!hero) return;
  hero.tours += 1;
  if (crit === "crit") { hero.etoiles += 1; hero.exploits.push(`réussite critique à ${lieuNom}`); }
  if (crit === "fumble") { hero.etoiles += 1; hero.exploits.push(`catastrophe rigolote à ${lieuNom}, avec beaucoup de courage`); }
  if (texteResultat && texteResultat.includes("−1 ❤️")) {
    hero.coeurs = Math.max(0, hero.coeurs - 1);
    lignes.push(hero.coeurs === 0
      ? `💔 Oh non, ${hero.name} n'a plus de cœur ! Pas de panique : un câlin d'un ami lui rend 1 ❤️.`
      : `❤️ ${hero.name} a maintenant ${hero.coeurs} cœur${hero.coeurs > 1 ? "s" : ""}.`);
  }
}

function resolveScene(st, res, talent, heroIdx) {
  const sc = st.current;
  const rng = liveRng(st);
  const theme = liveTheme(st);
  const d = sc.defi;
  const hero = heroAt(st, heroIdx !== undefined && heroIdx !== null ? heroIdx : sc.heroIdx);
  const lignes = sc.lire.slice();
  const effets = [];
  // 🌟 6 = réussite + bonus ; 🙈 1 = « oui, mais… » + gaffe rigolote ; ✨ pouvoir = réussite sans dé
  let crit = null;
  if (res === "crit") { crit = "crit"; res = "ok"; }
  else if (res === "fumble") { crit = "fumble"; res = "oops"; }
  else if (res === "pouvoir") {
    res = "ok";
    if (hero) {
      hero.pouvoir = true;
      hero.exploits.push(`a utilisé son pouvoir (${hero.power}) à ${sc.lieu.nom}`);
      lignes.push(`✨ ${hero.name} utilise son pouvoir magique : ${hero.powerEmoji} ${hero.power} ! Pas besoin de dé, ça marche.`);
    }
  }
  st.talents[talent] = (st.talents[talent] || 0) + 1;
  st.lastTalents.push(talent);

  let texteResultat = "";
  if (sc.type === "rencontre") {
    if (res === "non") {
      lignes.push("🚶 Les héros préfèrent continuer leur route.");
      st.fils.push({ type: "secondeChance", pnj: d.pnj || "ce personnage", defi: d, lieu: sc.lieu });
      changeRep(st, -1, effets);
    } else {
      texteResultat = nommer(res === "oops" ? d.rate : d.reussite, hero);
      lignes.push(`${res === "oops" ? "🌀" : "✅"} ${texteResultat}`);
      if (d.pnj && !st.allies.includes(d.pnj)) st.allies.push(d.pnj);
      if (hero && d.pnj) hero.exploits.push(`a aidé ${d.pnj}`);
      if (talent === "force") {
        effets.push(`💪 Les héros ont aidé… mais en bousculant un peu ${d.pnj || "tout le monde"}.`);
        changeRep(st, -1, effets);
      }
      changeRep(st, 1, effets);
    }
  } else {
    texteResultat = nommer(res === "oops" ? d.rate : d.reussite, hero);
    lignes.push(`${res === "oops" ? "🌀" : "✅"} ${texteResultat}`);
    if (talent === "coeur" && res === "ok") changeRep(st, 1, effets);
    if (res === "oops") {
      const dispo = FILS.filter((f) => !st.fils.some((x) => x.id === f.id) && !(st.filsUtilises || []).includes(f.id));
      if (dispo.length) {
        const f = pick(rng, dispo);
        st.filsUtilises = (st.filsUtilises || []).concat(f.id);
        effets.push(nommer(f.ouverture, hero));
        st.fils.push({
          type: "fil", id: f.id, secret: !!f.secret,
          resolution: fill(f.resolution, { creature: pick(rng, theme.creatures), mechant: nomMilieu(st.mechant.nom), raison: st.mechant.raison }),
        });
      }
    }
  }
  if (crit === "crit") lignes.push(`🌟 Réussite critique ! ${nommer(pick(rng, CRITIQUES), hero)} ${hero ? hero.name : "Le héros"} gagne une ✨ étoile.`);
  if (crit === "fumble") lignes.push(`🙈 Catastrophe rigolote ! ${nommer(pick(rng, GAFFES), hero)} Pour son courage, ${hero ? hero.name : "le héros"} gagne quand même une ✨ étoile.`);
  heroEffects(st, hero, crit, sc.lieu.nom, effets, texteResultat);

  const restantes = st.nbScenes - st.step;
  if (res === "ok" && st.indices.length && (crit === "crit" || rng() < 0.5 || restantes <= st.indices.length - 1)) {
    effets.push(`🔎 Indice : ${st.indices.shift()}`);
  }

  st.record.scenes.push({ lieu: sc.lieu, type: sc.type, defi: d, difficulte: sc.difficultes[talent], res: res === "non" ? "non" : res, talent });
  st.log.push({ titre: `📍 ${sc.lieu.nom}${hero ? ` · ${hero.emoji} ${hero.name}` : ""}`, lignes: lignes.concat(effets) });
  st.lastRes = res;
  st.step += 1;

  let next;
  if (st.step < st.nbScenes) next = makeChoice(st);
  const recent = st.lastImprevuStep !== undefined && st.step - st.lastImprevuStep < 2;
  if (next && !recent && rng() < 0.3) {
    st.pile.push(next);
    st.current = makeImprevu(st, rng);
  } else if (next) {
    st.current = next;
  } else if (st.ctx && st.ctx.rival && !st.record.rival) {
    st.current = rivalStep(st);
  } else {
    goFinale(st);
  }
}

/* ---------------- Imprévus ---------------- */
/*
  Chaque imprévu a sa question, ses propres résultats, et surtout une SUITE :
    pointe  : un des prochains chemins est désigné (plus facile)
    facile  : le prochain défi est plus facile
    retard  : le prochain défi est un peu plus difficile
    indice  : un indice sur le méchant
    objet   : un objet rejoint le sac (il pourra servir)
    ami     : une créature devient votre amie et reviendra aider
    soin    : tout le monde récupère 1 ❤️
    etoile  : le héros gagne une étoile
    coeur   : le héros perd 1 ❤️
    fil     : l'histoire reste ouverte et revient plus tard (texte dans « retour »)
  {creature} et {objet} sont choisis au moment de l'imprévu.
*/
const IMPREVUS_HISTOIRE = [
  { texte: "Il se met à pleuvoir très fort. Il faut vite trouver un abri.", question: "Où vous abritez-vous ?", talent: "malin",
    ok: "Les héros trouvent une petite grotte bien sèche… et dedans, quelqu'un s'abrite déjà : c'est {creature}, qui vous fait une petite place.", effetOk: "ami",
    rate: "Trop tard : tout le monde est trempé jusqu'aux chaussettes. Atchoum !", effetRate: "retard" },
  { texte: "Un animal minuscule s'accroche à un héros et ne veut plus le lâcher.", question: "Comment le rassurer ?", talent: "coeur",
    ok: "Rassuré, l'animal grimpe sur l'épaule du héros et lui montre du bout de la patte un raccourci.", effetOk: "pointe",
    rate: "L'animal ne lâche pas et chatouille le héros sans arrêt. Il finira bien par descendre… plus tard.", effetRate: "fil",
    retour: "Le petit animal qui s'accrochait tout à l'heure saute enfin par terre… et vous rapporte {objet} en remerciement !" },
  { texte: "Le ventre d'un héros gargouille si fort que tout le monde l'entend… même ceux qui ne devraient pas.", question: "Que faites-vous ?", talent: "malin",
    ok: "Les héros partagent vite un goûter en silence. Le ventre se calme, et ça fait du bien à tout le monde.", effetOk: "soin",
    rate: "GROOOOU ! Dans les buissons, quelque chose a tout entendu… et vous suit maintenant.", effetRate: "fil",
    retour: "Ce qui vous suivait depuis le gros gargouillis se montre enfin : c'est {creature}, qui a faim aussi ! Vous partagez votre goûter, et vous voilà amis." },
  { texte: "Un coup de vent emporte le chapeau (ou l'objet préféré) d'un héros.", question: "Comment le rattraper ?", talent: "force",
    ok: "D'un bond, le héros rattrape son objet en plein vol. Quel champion !", effetOk: "etoile",
    rate: "L'objet s'envole très loin, par-dessus les arbres…", effetRate: "fil",
    retour: "Regardez là-haut ! L'objet emporté par le vent est accroché juste au-dessus du chemin. Une petite escalade et il est récupéré !" },
  { texte: "On entend une musique au loin. D'où vient-elle ?", question: "Vous allez voir ?", talent: "coeur",
    ok: "C'est {creature} qui joue de la flûte, et qui vous offre {objet} pour vous remercier d'avoir écouté.", effetOk: "objet",
    rate: "La musique s'arrête net quand vous approchez. Quelqu'un vous a vus… et vous espionne.", effetRate: "fil",
    retour: "Le musicien timide qui vous espionnait se montre enfin : c'est {creature}, qui vous confie un secret sur le coupable !", retourIndice: true },
  { texte: "Le sol se met à trembler doucement…", question: "Que faites-vous ?", talent: "force",
    ok: "Les héros se tiennent tous par la main et ne tombent pas. Le tremblement s'arrête : c'était {creature} qui ronflait sous la terre ! Une fois bien réveillés, vous voilà amis.", effetOk: "ami",
    rate: "Tout le monde tombe sur les fesses, et un objet roule loin dans un trou.", effetRate: "fil",
    retour: "Tiens ! L'objet qui avait roulé dans le trou ressort tout seul, poussé par {creature} qui habite là-dessous." },
  { texte: "Un message tombe du ciel, accroché à un petit parachute.", question: "Arrivez-vous à le lire ?", talent: "malin",
    ok: "Les héros déchiffrent le message.", effetOk: "indice",
    rate: "Le message est écrit à l'envers… Impossible à lire pour l'instant. Gardez-le précieusement !", effetRate: "fil",
    retour: "En regardant le message dans une flaque d'eau, comme dans un miroir, vous arrivez enfin à le lire !", retourIndice: true },
  { texte: "Le Compagnon a disparu ! On l'entend ronfler quelque part tout près.", question: "Comment le retrouver ?", talent: "malin",
    ok: "On le retrouve endormi dans un buisson… couché sur {objet} !", effetOk: "objet",
    rate: "On le retrouve, mais il est encore tout endormi : il ne pourra pas vous aider au prochain défi.", effetRate: "retard" },
  { texte: "Quelqu'un suit les héros en se cachant. (C'est un petit curieux tout gentil.)", question: "Comment le faire sortir de sa cachette ?", talent: "coeur",
    ok: "C'est {creature}, qui voulait juste se faire des amis ! Vous voyagez ensemble désormais.", effetOk: "ami",
    rate: "Impossible de le voir… mais il est toujours là, quelque part.", effetRate: "fil",
    retour: "Le petit curieux qui vous suivait ose enfin se montrer : c'est {creature}, qui vous a vus être courageux et veut vous aider !" },
  { texte: "Une odeur délicieuse de gâteau flotte dans l'air.", question: "On va voir ?", talent: "coeur",
    ok: "C'est {creature} qui a fait un gâteau. Vous demandez poliment, et chacun a droit à une part : tout le monde récupère 1 ❤️.", effetOk: "soin",
    rate: "Les héros ont mangé trop vite… gros mal de ventre !", effetRate: "retard" },
  { texte: "Tout devient silencieux d'un coup… Plus un bruit.", question: "Qu'est-ce que vous faites ?", talent: "malin",
    ok: "En écoutant bien, les héros entendent un tout petit appel au secours : {creature} n'arrive plus à sortir de sous une feuille géante. Vous la soulevez tous ensemble, et vous voilà amis.", effetOk: "ami",
    rate: "Le silence dure, dure… puis un énorme ATCHOUM éclate ! Un héros sursaute si fort qu'il perd 1 ❤️.", effetRate: "coeur" },
  { texte: "Un arc-en-ciel apparaît et semble montrer une direction.", question: "Vous le suivez ?", talent: "malin",
    ok: "Les héros repèrent exactement où l'arc-en-ciel touche le sol : c'est sur un des prochains chemins !", effetOk: "pointe",
    rate: "L'arc-en-ciel disparaît avant que les héros aient bien regardé… Il reviendra peut-être.", effetRate: "fil",
    retour: "L'arc-en-ciel réapparaît ! Cette fois, il touche le sol juste devant vous : il y a là {objet}." },
  { texte: "Un héros trouve une empreinte très bizarre par terre.", question: "À qui est-elle ?", talent: "malin",
    ok: "En regardant bien l'empreinte, les héros comprennent quelque chose d'important.", effetOk: "indice",
    rate: "L'empreinte est trop effacée… Mais il y en aura sûrement d'autres plus loin.", effetRate: "fil",
    retour: "Voilà d'autres empreintes bizarres, bien nettes cette fois !", retourIndice: true },
  { texte: "Il commence à faire nuit : il faut de la lumière.", question: "Comment faire de la lumière ?", talent: "coeur",
    ok: "Les héros appellent gentiment les petites lumières de la nuit, qui viennent les accompagner : on y voit comme en plein jour.", effetOk: "facile",
    rate: "Il fait tout noir… On se tient la main et on avance à tâtons.", effetRate: "retard" },
  { texte: "Un héros attrape le hoquet. Chaque « hic » le fait sauter un peu en l'air.", question: "Comment arrêter le hoquet ?", talent: "coeur",
    ok: "BOUH ! Le hoquet s'arrête d'un coup, et tout le monde éclate de rire.", effetOk: "etoile",
    rate: "Hic ! Hic ! Le hoquet continue… et chaque saut fait du bruit.", effetRate: "retard" },
  { texte: "Une porte (ou un passage) qui n'était pas là tout à l'heure vient d'apparaître.", question: "Vous essayez de l'ouvrir ?", talent: "force",
    ok: "La porte s'ouvre sur un passage secret qui mène droit vers un des prochains chemins.", effetOk: "pointe",
    rate: "BLAM ! La porte se referme toute seule. On ne saura pas tout de suite ce qu'il y avait derrière…", effetRate: "fil",
    retour: "La porte mystérieuse réapparaît ! Cette fois, elle s'ouvre toute seule : derrière, il y a {objet} pour vous." },
];

const SUITE_LABEL = {
  pointe: "Ensuite : un des prochains chemins sera plus facile.",
  facile: "Ensuite : le prochain défi sera plus facile.",
  retard: "Ensuite : le prochain défi sera un peu plus difficile.",
  indice: "Ensuite : un indice sur le méchant.",
  objet: "Ensuite : un objet rejoint le sac.",
  ami: "Ensuite : un nouvel ami vous accompagne.",
  soin: "Ensuite : tout le monde récupère 1 ❤️.",
  etoile: "Ensuite : une étoile pour le héros.",
  coeur: "Ensuite : le héros perd 1 ❤️.",
  fil: "Ensuite : l'histoire reviendra plus tard.",
};

const SUITES = {
  pointe: "➡️ Ce signe montre un des prochains chemins : il sera plus facile.",
  facile: "➡️ Le prochain défi sera plus facile.",
  retard: "➡️ Le prochain défi sera un peu plus difficile.",
  fil: "➡️ Cette histoire n'est pas finie… elle reviendra plus tard.",
  soin: "➡️ Tout le monde récupère 1 ❤️.",
};

// Imprévu du monde (texte simple) : on lui donne une suite au hasard
function imprevuDepuisTexte(rng, texte) {
  const connu = IMPREVUS_HISTOIRE.find((i) => i.texte === texte);
  if (connu) return connu;
  return {
    texte, question: "Qu'est-ce que vous faites ?", talent: pick(rng, ["force", "malin", "coeur"]),
    ok: pick(rng, IMPREVUS_REUSSIS), effetOk: pick(rng, ["facile", "indice", "etoile", "objet"]),
    rate: "Ça ne se passe pas tout à fait comme prévu…", effetRate: pick(rng, ["retard", "fil"]),
    retour: "Vous repensez à ce qui s'est passé tout à l'heure… et cette fois, tout s'arrange : vous trouvez même {objet} !",
  };
}

function makeImprevu(st, rng, texte) {
  const theme = liveTheme(st);
  let base;
  if (texte) base = imprevuDepuisTexte(rng, texte);
  else if (rng() < 0.75) base = pick(rng, IMPREVUS_HISTOIRE);
  else base = imprevuDepuisTexte(rng, pick(rng, theme.imprevus));
  const vars = { creature: pick(rng, theme.creatures), objet: pick(rng, OBJETS_TROUVES) };
  const imp = {};
  Object.keys(base).forEach((k) => { imp[k] = typeof base[k] === "string" ? fill(base[k], vars) : base[k]; });
  imp.creature = vars.creature;
  imp.objet = vars.objet;
  const heroIdx = pickHero(st, imp.talent);
  const { difficultes, raisons } = talentDifficulties(st, 4);
  st.lastImprevuStep = st.step;
  return { kind: "imprevu", texte: nommer(imp.texte, heroAt(st, heroIdx)), imp, talent: imp.talent, heroIdx, difficultes, raisons };
}

function insertImprevu(st, texte) {
  if (!st.current || st.current.kind === "fin") return;
  st.pile.push(st.current);
  st.current = makeImprevu(st, liveRng(st), texte);
}

// La suite d'un imprévu : ce qui change pour la suite de l'histoire
function applySuite(st, effet, imp, hero, lignes) {
  const objetsSac = (st.objets = st.objets || []);
  switch (effet) {
    case "pointe": {
      const prochain = st.pile[st.pile.length - 1];
      if (prochain && prochain.kind === "choix" && prochain.options.length) {
        prochain.options[0].bonus = "Montré par l'imprévu : plus facile";
        lignes.push(`➡️ Ce signe montre le chemin vers ${nomMilieu(prochain.options[0].lieu.nom)} : il sera plus facile.`);
      } else {
        st.prochainFacile = true;
        lignes.push(SUITES.facile);
      }
      break;
    }
    case "facile": st.prochainFacile = true; lignes.push(SUITES.facile); break;
    case "retard": st.prochainDifficile = true; lignes.push(SUITES.retard); break;
    case "indice":
      lignes.push(`🔎 Indice : ${st.indices.length ? st.indices.shift() : `le coupable, c'est ${nomMilieu(st.mechant.nom)}, et en vrai, ${st.mechant.raison}.`}`);
      break;
    case "objet":
      objetsSac.push(imp.objet);
      lignes.push(`➡️ ${capFirst(imp.objet)} rejoint votre sac 🎒 : ça pourra servir plus tard !`);
      break;
    case "ami":
      if (!st.allies.includes(imp.creature)) st.allies.push(imp.creature);
      lignes.push(`➡️ ${capFirst(imp.creature)} vous accompagne maintenant, et pourra vous aider plus tard (1 dé de plus).`);
      break;
    case "soin":
      st.heroes.forEach((h) => { h.coeurs = Math.min(3, h.coeurs + 1); });
      lignes.push(SUITES.soin);
      break;
    case "etoile":
      if (hero) { hero.etoiles += 1; lignes.push(`➡️ ${hero.name} gagne une ✨ étoile.`); }
      break;
    case "coeur":
      if (hero) {
        hero.coeurs = Math.max(0, hero.coeurs - 1);
        lignes.push(hero.coeurs === 0 ? `💔 ${hero.name} n'a plus de cœur : un câlin d'un ami lui rend 1 ❤️.` : `❤️ ${hero.name} a maintenant ${hero.coeurs} cœur${hero.coeurs > 1 ? "s" : ""}.`);
      }
      break;
    case "fil":
      st.fils.push({ type: "fil", id: `imp-${st.tick}`, resolution: imp.retour || "Vous repensez à ce qui s'est passé tout à l'heure… et cette fois, tout s'arrange !", indice: !!imp.retourIndice, objet: imp.retour && imp.retour.includes(imp.objet) ? imp.objet : null });
      lignes.push(SUITES.fil);
      break;
    default:
  }
}

function resolveImprevu(st, res, talent, heroIdx) {
  const c = st.current;
  const rng = liveRng(st);
  const imp = c.imp || imprevuDepuisTexte(rng, c.texte);
  const hero = heroAt(st, heroIdx !== undefined && heroIdx !== null ? heroIdx : c.heroIdx);
  const lignes = [c.texte];
  let crit = null;
  if (res === "narr") {
    lignes.push(`💡 Les enfants ont trouvé quoi faire. ${nommer(imp.ok, hero)}`);
    applySuite(st, imp.effetOk, imp, hero, lignes);
  } else {
    if (res === "crit") { crit = "crit"; res = "ok"; }
    if (res === "fumble") { crit = "fumble"; res = "oops"; }
    if (res === "pouvoir") {
      res = "ok";
      if (hero) { hero.pouvoir = true; lignes.push(`✨ ${hero.name} utilise son pouvoir magique : ${hero.powerEmoji} ${hero.power} !`); }
    }
    st.talents[talent] = (st.talents[talent] || 0) + 1;
    st.lastTalents.push(talent);
    lignes.push(res === "ok" ? `✅ ${nommer(imp.ok, hero)}` : `🌀 ${nommer(imp.rate, hero)}`);
    if (crit === "crit") lignes.push(`🌟 Réussite critique ! ${nommer(pick(rng, CRITIQUES), hero)} Une ✨ étoile en plus.`);
    if (crit === "fumble") lignes.push(`🙈 Catastrophe rigolote ! ${nommer(pick(rng, GAFFES), hero)} Une ✨ étoile de courage.`);
    applySuite(st, res === "ok" ? imp.effetOk : imp.effetRate, imp, hero, lignes);
    if (talent === "coeur" && res === "ok") changeRep(st, 1, lignes);
    heroEffects(st, hero, crit, "l'imprévu", lignes, "");
  }
  st.log.push({ titre: `⚡ Imprévu !${hero ? ` · ${hero.emoji} ${hero.name}` : ""}`, lignes, cls: "event" });
  st.current = st.pile.pop() || makeChoice(st);
}

/* ---------------- Rival, finale ---------------- */
function rivalStep(st) {
  const r = st.ctx.rival;
  return {
    kind: "rival",
    lire: [`Revoilà ${nomMilieu(r)} ! Depuis la dernière fois, les héros n'ont pas été oubliés… et un mauvais tour se prépare.`],
    notes: ["C'est l'occasion d'en faire un ami (avec ❤️), ou de lui échapper encore une fois."],
  };
}

function resolveRival(st, res) {
  st.record.rival = res;
  const r = st.ctx.rival;
  const lignes = st.current.lire.concat(res === "ami"
    ? [`🤝 Cette fois, ${nomMilieu(r)} et les héros sont devenus amis !`]
    : ["💨 Les héros lui échappent encore une fois !"]);
  if (res === "ami") { st.allies.push(r); changeRep(st, 1, lignes); }
  st.log.push({ titre: "⚡ Un rival revient", lignes });
  goFinale(st);
}

function goFinale(st) {
  const fin = [];
  st.fils.forEach((f) => {
    if (f.type === "secondeChance") fin.push(`Au loin, vous apercevez ${f.pnj}, qui vous fait un signe : tout s'est arrangé, ouf !`);
    else { fin.push(f.resolution); if (f.secret) st.secretConnu = true; }
  });
  st.fils = [];
  if (fin.length) st.log.push({ titre: "🌙 Avant la fin…", lignes: fin, cls: "event" });

  const m = st.mechant;
  const nom = capFirst(nomMilieu(m.nom));
  const lire = [st.finaleLieu.description, `Et là, au milieu, se trouve ${nomMilieu(m.nom)}, ${m.description}. C'est de là que viennent tous les problèmes !`];
  if (st.secretConnu) lire.push(`Grâce à ce que vous avez appris en route, vous connaissez son secret : ${m.raison}.`);
  else if (st.reputation >= 2) lire.push(`${nom} a entendu parler de votre gentillesse… et semble plus triste qu'en colère.`);
  else if (st.reputation <= -1) lire.push(`${nom} a entendu dire que vous n'étiez pas très gentils. Très en colère, ça ne veut écouter personne… pour l'instant.`);
  else lire.push(`${nom} vous attend de pied ferme.`);

  const amis = st.allies.concat(st.ctx && st.ctx.allies ? st.ctx.allies.filter((a) => !st.allies.includes(a)) : []);
  if (amis.length) lire.push(`Mais vous n'êtes pas seuls : ${joinList(amis)} arrivent pour vous aider !`);

  const rngF = liveRng(st);
  const { difficultes, raisons } = talentDifficulties(st, 4, true);
  const finale = {
    kind: "finale",
    lire,
    difficultes,
    raisons,
    heroIdx: pickHero(st, "coeur"),
    notes: amis.length ? ["🤝 Chaque ami présent peut donner 1 dé de plus à un héros."] : [],
    essais: [],
  };
  const s = pick(rngF, SUSPENSES_FINALE);
  st.current = { kind: "suspense", final: true, lire: [s], conseil: pick(rngF, CONSEILS_SUSPENSE), suite: finale };
}

function revealSuspense(st) {
  const c = st.current;
  if (c.suite && c.suite.kind === "scene") c.suite.dejaLu = c.lire.length;
  if (c.final) st.log.push({ titre: "⏳ Juste avant la fin…", lignes: c.lire, cls: "event" });
  st.current = c.suite;
}

function joinList(list) {
  if (list.length <= 1) return list.join("");
  return `${list.slice(0, -1).join(", ")} et ${list[list.length - 1]}`;
}

function resolveFinale(st, talent, res, heroIdx) {
  const m = st.mechant;
  const sol = m.solutions[talent];
  const rng = liveRng(st);
  const hero = heroAt(st, heroIdx !== undefined && heroIdx !== null ? heroIdx : st.current.heroIdx);
  const qui = hero ? `${hero.name} et les héros essaient` : "Les héros essaient";
  if (res === "oops" || res === "fumble") {
    st.current.essais.push(talent);
    const lignes = [`${qui} : ${sol.charAt(0).toLowerCase() + sol.slice(1)}`];
    if (res === "fumble") {
      lignes.push(`🙈 Catastrophe rigolote ! ${nommer(pick(rng, GAFFES), hero)} Même ${nomMilieu(m.nom)} ne peut pas s'empêcher de rire. Une ✨ étoile de courage !`);
      heroEffects(st, hero, "fumble", st.finaleLieu.nom, lignes, "");
    } else if (hero) hero.tours += 1;
    lignes.push(`${capFirst(nomMilieu(m.nom))} hésite… Ça n'a pas encore marché. Essayez encore, peut-être autrement !`);
    st.log.push({ titre: res === "fumble" ? "🙈 Oups…" : "🌀 Pas encore…", lignes, cls: "event" });
    // Le héros suivant prend le relais
    st.current.heroIdx = pickHero(st, talent);
    return;
  }
  st.record.finale = talent;
  const lignes = st.current.lire.concat([`✅ ${qui} : ${sol.charAt(0).toLowerCase() + sol.slice(1)} Et ça marche !`]);
  if (res === "pouvoir" && hero) {
    hero.pouvoir = true;
    lignes.push(`✨ ${hero.name} utilise son pouvoir magique au moment parfait : ${hero.powerEmoji} ${hero.power} !`);
  }
  lignes.push(talent === "coeur"
    ? `${capFirst(nomMilieu(m.nom))} et les héros sont devenus amis.`
    : "Les héros l'ont emporté !");
  if (res === "crit") {
    lignes.push("🌟 Réussite critique ! C'est la plus belle victoire qu'on ait jamais vue : tout le monde applaudit, et une pluie d'étoiles tombe du ciel. Chaque héros gagne une ✨ étoile.");
    st.heroes.forEach((h) => { h.etoiles += 1; });
  }
  if (hero) hero.exploits.push(`a trouvé la solution face à ${nomMilieu(m.nom)}`);
  st.log.push({ titre: `🏁 ${st.finaleLieu.nom}`, lignes });
  const finLignes = [`Grâce à vous, tout est rentré dans l'ordre ! Pour vous remercier, vous recevez ${st.tresor}.`]
    .concat(st.ctx && st.ctx.fin ? st.ctx.fin : []);
  if (st.heroes.length) {
    finLignes.push(`Les étoiles gagnées : ${st.heroes.map((h) => `${h.emoji} ${h.name} ${"✨".repeat(h.etoiles) || "(aucune, mais quel courage !)"}`).join(" · ")}`);
  }
  st.log.push({ titre: "🎉 Victoire !", lignes: finLignes });
  st.current = { kind: "fin" };
}

/* ---------------- Actions (avec annulation) ---------------- */
function liveAction(fn) {
  const st = loadLive();
  if (!st) return;
  const snap = JSON.stringify({ ...st, undo: [] });
  fn(st);
  st.undo = (st.undo || []).concat(snap).slice(-15);
  saveLive(st);
  refreshLive(true);
}

function liveUndo() {
  const st = loadLive();
  if (!st || !st.undo || !st.undo.length) return;
  const prev = JSON.parse(st.undo[st.undo.length - 1]);
  prev.undo = st.undo.slice(0, -1);
  saveLive(prev);
  refreshLive(true);
}

/* ==========================================================
   ÉCRAN DE JEU DU CONTEUR
   Pendant une partie, le site laisse la place à un écran
   simple : une seule chose à la fois, en grand.
     Lire → Défi → Résultat (à lire) → Où aller ? → …
   Tout le reste (héros, réputation, secret, histoire,
   réglages) est rangé dans le menu ☰.
   ========================================================== */

// Le Conteur choisit une fois pour toutes : le dé du site, ou son propre dé
const DE_MODE_KEY = "petits-heros:demode";
function deMode() {
  try { return localStorage.getItem(DE_MODE_KEY) === "main" ? "main" : "site"; } catch { return "site"; }
}
function setDeMode(v) {
  try { localStorage.setItem(DE_MODE_KEY, v); } catch { /* rien */ }
}

let menuOuvert = false;

function toast(message) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = message;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add("out"), 1800);
  setTimeout(() => t.remove(), 2300);
}

/* ---------------- Petits morceaux ---------------- */
function aLire(lignes) {
  return `<div class="a-lire">${lignes.map((t) => {
    const sus = t.startsWith("⏳ ");
    return `<p class="${sus ? "sus" : ""}">${escapeHtml(sus ? t.slice(2) : t)}</p>`;
  }).join("")}</div>`;
}

function aide(lignes) {
  const l = lignes.filter(Boolean);
  return l.length ? `<ul class="carte-aide">${l.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul>` : "";
}

function carte({ etiquette, titre, corps, actions = "", cls = "" }) {
  return `<section class="carte live-current ${cls}">
    <div class="carte-etiquette">${escapeHtml(etiquette)}</div>
    <h2 class="carte-titre">${titre}</h2>
    ${corps}
    ${actions ? `<div class="carte-actions">${actions}</div>` : ""}
  </section>`;
}

function playmoAide(st, lieu, mechant, idx) {
  if (!playmoOn()) return "";
  const h = heroAt(st, idx);
  let t = `🧸 ${playmoLieu(lieu)}`;
  if (h && h.figurine) t += ` Avancez la figurine de ${h.name} (${h.figurine}).`;
  if (mechant) t += ` Gardez une figurine cachée pour ${nomMilieu(mechant.nom)} jusqu'au dernier moment !`;
  return t;
}

// Les choix du défi : qui, avec quel talent, puis le dé
function defiControles(st, c, action, talentDefaut, manuels, solutions) {
  const h = heroAt(st, c.heroIdx);
  const qui = st.heroes.length > 1 ? `<div class="ctrl"><div class="ctrl-label">Qui agit ?</div>
    <div class="mini-choices live-who">${st.heroes.map((x, i) => `
      <button type="button" class="choice${i === c.heroIdx ? " selected" : ""}" data-value="${i}">${x.emoji} ${escapeHtml(x.name)}</button>`).join("")}</div></div>` : "";
  const talents = `<div class="ctrl"><div class="ctrl-label">${solutions ? "Ce que tentent les enfants" : "Avec quoi ?"}</div>
    <div class="talent-grid live-talents">${Object.entries(TALENTS).map(([id, t]) => `
      <button type="button" class="choice talent-btn${id === talentDefaut ? " selected" : ""}" data-value="${id}">
        <span class="t-nom">${t.emoji} ${t.nom}</span>
        <span class="t-diff">${DIFFICULTES[c.difficultes[id]].texte}</span>
        ${solutions ? `<span class="t-sol">${escapeHtml(solutions[id])}${c.essais && c.essais.includes(id) ? " (déjà essayé)" : ""}</span>` : ""}
        ${!solutions && c.conseil === id ? `<span class="t-tag">conseillé</span>` : ""}
      </button>`).join("")}</div>
    ${(c.raisons || []).length ? `<ul class="raisons">${c.raisons.map((r) => `<li>${escapeHtml(r)}</li>`).join("")}</ul>` : ""}</div>`;
  const de = deMode() === "site"
    ? diceRollerHTML({ target: c.difficultes[talentDefaut], apply: action })
    : `<div class="ctrl"><div class="ctrl-label">Lancez votre dé, puis touchez le résultat</div>
       <div class="manuel">${manuels.map(([v, l]) => `<button class="btn" data-live="${action}" data-res="${v}">${l}</button>`).join("")}</div></div>`;
  const liens = [];
  if (h && !h.pouvoir) liens.push(`<button class="lien" data-live="${action}" data-res="pouvoir">✨ Utiliser le pouvoir de ${escapeHtml(h.name)} (${escapeHtml(h.power)}) : réussi sans dé</button>`);
  return `${qui}${talents}${de}${liens.length ? `<div class="liens">${liens.join("")}</div>` : ""}`;
}

const MANUELS = [["crit", "🌟 6"], ["ok", "✅ Réussi"], ["oops", "🌀 2 ou 3"], ["fumble", "🙈 1"]];

/* ---------------- Les cartes, une par étape ---------------- */
function renderLiveCurrent(st) {
  const c = st.current;
  const etape = `Étape ${Math.min(st.step + 1, st.nbScenes)} sur ${st.nbScenes}`;

  if (c.kind === "intro") {
    const pm = playmoOn() && liveTheme(st).playmo
      ? [`🧸 Sortez : ${liveTheme(st).playmo.liste}. ${liveTheme(st).playmo.conseil}`].concat(
        st.heroes.some((h) => h.figurine) ? [`🧸 Figurines : ${st.heroes.filter((h) => h.figurine).map((h) => `${h.name} = ${h.figurine}`).join(" · ")}`] : [])
      : [];
    return carte({
      etiquette: st.ctx ? `Épisode ${st.ctx.numero} sur ${st.ctx.total}` : "Le début de l'histoire",
      titre: escapeHtml(st.titre),
      corps: `${c.recap ? `<h3 class="sous-titre">📺 Précédemment…</h3>${aLire(c.recap)}<h3 class="sous-titre">🌅 L'aventure commence</h3>` : ""}
        ${aLire(c.lire)}${aide(c.aide.concat(pm))}`,
      actions: `<button class="btn btn-big" data-live="continuer">C'est parti ! →</button>`,
    });
  }

  if (c.kind === "choix") {
    return carte({
      etiquette: etape,
      titre: escapeHtml(c.question),
      corps: `${aide([c.chooser ? `C'est ${c.chooser} qui choisit (ou tout le monde vote).` : "Les enfants choisissent (ou votent)."])}
        <div class="options">${c.options.map((o, i) => `
          <button class="live-option option" data-live="choose" data-index="${i}">
            <strong>${escapeHtml(o.lieu.nom)}</strong>
            <span>${o.special === "secondeChance" ? "Retourner aider quelqu'un qui en avait besoin…" : escapeHtml(o.lieu.description)}</span>
            ${o.bonus ? `<em class="option-bonus">🌈 ${escapeHtml(o.bonus)}</em>` : ""}
          </button>`).join("")}</div>`,
    });
  }

  if (c.kind === "suspense") {
    return carte({
      etiquette: c.final ? "Juste avant la fin" : etape,
      titre: "Chut… moment de suspense",
      corps: `${aLire(c.lire)}${aide([`🎭 ${c.conseil}`])}`,
      actions: `<button class="btn btn-big btn-reveal" data-live="reveal">👀 Révéler</button>`,
      cls: "suspense",
    });
  }

  if (c.kind === "scene" && c.phase !== "defi") {
    const lignes = c.lire.slice(c.dejaLu || 0);
    return carte({
      etiquette: `${etape} · ${c.lieu.nom}`,
      titre: c.dejaLu ? "La suite…" : escapeHtml(c.lieu.nom),
      corps: `${aLire(lignes)}${aide([c.interaction, playmoAide(st, c.lieu, null, c.heroIdx)].concat(c.notes || []))}`,
      actions: `<button class="btn btn-big" data-live="phase" data-v="defi">Le défi →</button>`,
    });
  }

  if (c.kind === "scene") {
    const h = heroAt(st, c.heroIdx);
    const manuels = c.type === "rencontre" ? MANUELS.concat([["non", "🚶 Pas aidé"]]) : MANUELS;
    return carte({
      etiquette: c.type === "rencontre" ? "Rencontre" : "Le défi",
      titre: h ? `Au tour de ${h.emoji} ${escapeHtml(h.name)} !` : "Le défi",
      corps: `<blockquote class="rappel">${escapeHtml(nommer(c.defi.texte, h))}</blockquote>
        ${defiControles(st, { ...c, conseil: c.defi.talent }, "resolve", c.defi.talent, manuels)}
        <div class="liens">
          ${c.type === "rencontre" && deMode() === "site" ? `<button class="lien" data-live="resolve" data-res="non">🚶 Les héros décident de ne pas aider</button>` : ""}
          <button class="lien" data-live="phase" data-v="lire">← Relire le texte</button>
        </div>`,
    });
  }

  if (c.kind === "imprevu") {
    const h = heroAt(st, c.heroIdx);
    return carte({
      etiquette: "Imprévu !",
      titre: h ? `Imprévu pour ${h.emoji} ${escapeHtml(h.name)} !` : "Un imprévu !",
      corps: `${aLire([c.texte, c.imp ? c.imp.question : "Qu'est-ce que vous faites ?"])}
        <div class="liens"><button class="lien lien-fort" data-live="imprevu" data-res="narr">💡 Les enfants ont une bonne idée : ça marche sans dé</button></div>
        ${defiControles(st, { ...c, conseil: c.talent }, "imprevu", c.talent, MANUELS)}`,
      cls: "imprevu",
    });
  }

  if (c.kind === "resultat") {
    return carte({
      etiquette: "Résultat · à lire",
      titre: escapeHtml(c.entrees[0].titre.replace(/^\S+\s/, "")),
      corps: c.entrees.map((e, i) => `${i > 0 ? `<h3 class="sous-titre">${escapeHtml(e.titre)}</h3>` : ""}${aLire(e.lignes.filter((l, j) => !(c.sauter && i === 0 && j < c.sauter)))}`).join(""),
      actions: `<button class="btn btn-big" data-live="continuer">Continuer →</button>`,
      cls: "resultat",
    });
  }

  if (c.kind === "rival") {
    return carte({
      etiquette: "Juste avant la fin",
      titre: "Un rival revient !",
      corps: `${aLire(c.lire)}${aide(c.notes)}`,
      actions: `<button class="btn btn-big" data-live="rival" data-res="ami">🤝 Devenu ami</button>
        <button class="btn btn-big btn-ghost" data-live="rival" data-res="enfui">💨 Échappé</button>`,
    });
  }

  if (c.kind === "finale" && c.phase !== "defi") {
    return carte({
      etiquette: "La grande fin",
      titre: escapeHtml(st.finaleLieu.nom),
      corps: `${aLire(c.lire)}${aide([playmoAide(st, st.finaleLieu, st.mechant, c.heroIdx)].concat(c.notes || []))}`,
      actions: `<button class="btn btn-big" data-live="phase" data-v="defi">Que font les héros ? →</button>`,
      cls: "finale",
    });
  }

  if (c.kind === "finale") {
    const h = heroAt(st, c.heroIdx);
    const defaut = c.essais.includes("coeur") ? "malin" : "coeur";
    return carte({
      etiquette: "La grande fin",
      titre: h ? `Au tour de ${h.emoji} ${escapeHtml(h.name)} !` : "Que font les héros ?",
      corps: `${aide([`Le secret : ${st.mechant.raison}.`, "Toute bonne idée des enfants marche : choisissez la solution la plus proche."])}
        ${defiControles(st, c, "finale", defaut, [["crit", "🌟 6"], ["ok", "✅ Ça marche"], ["oops", "🌀 Pas encore"], ["fumble", "🙈 1"]], st.mechant.solutions)}
        <div class="liens"><button class="lien" data-live="phase" data-v="lire">← Relire le texte</button></div>`,
      cls: "finale",
    });
  }

  // Fin
  const heroes = st.ctx && st.ctx.heroes ? st.ctx.heroes : [];
  const exploitsDe = (name) => {
    const x = st.heroes.find((y) => y.name === name);
    return x ? x.exploits.slice(0, 2).join(" ; ") : "";
  };
  return carte({
    etiquette: "Fin de l'aventure",
    titre: "⭐ Le moment de fierté",
    corps: `${aLire(["Chacun à son tour, adultes compris, dit ce que son héros a fait de mieux, et ce qu'il a préféré dans l'histoire.", "Donnez une dernière étoile à chacun !"])}
      ${st.heroes.length ? aide([`Les étoiles : ${st.heroes.map((x) => `${x.name} ${x.etoiles} ✨`).join(" · ")}`]) : ""}
      ${st.mode === "saga" ? `
      <form class="live-save">
        ${heroes.map((x, i) => `<label class="small-label" for="lx-${i}">⭐ Exploit de ${escapeHtml(x.name)}</label>
          <input type="text" id="lx-${i}" class="exploit" data-hero="${escapeHtml(x.name)}" maxlength="160" value="${escapeHtml(exploitsDe(x.name))}">`).join("")}
        <label class="small-label" for="lx-inv">✨ Ce que les enfants ont inventé (un par ligne)</label>
        <textarea id="lx-inv" rows="2">${escapeHtml(st.inventions.join("\n"))}</textarea>
        <label class="small-label" for="lx-obj">🎒 Objets trouvés (un par ligne)</label>
        <textarea id="lx-obj" rows="2">${escapeHtml((st.objets || []).join("\n"))}</textarea>
        <label class="small-label" for="lx-notes">📝 Autre chose à retenir ?</label>
        <textarea id="lx-notes" rows="2"></textarea>
        <div class="form-actions"><button type="submit" class="btn btn-big">📚 Enregistrer dans la saga</button></div>
      </form>` : ""}
      <h3 class="sous-titre">📜 Toute votre histoire</h3>
      <div class="live-log histoire">${st.log.map(renderLogEntry).join("")}</div>`,
    actions: st.mode === "saga" ? "" : `<button class="btn btn-ghost print-btn" onclick="window.print()">🖨️ Imprimer l'histoire</button>
      <button class="btn btn-big" data-live="quit">Terminer</button>`,
    cls: "ending",
  });
}

function renderLogEntry(e) {
  if (e.photo) return `<section class="live-entry photo"><h4>${escapeHtml(e.titre)}</h4>${photoHTML(e.photo, "")}</section>`;
  return `<section class="live-entry ${e.cls || ""}">
    <h4>${escapeHtml(e.titre)}</h4>${e.lignes.map((t) => `<p>${escapeHtml(t)}</p>`).join("")}
    ${e.note ? e.note.split("\n").map((n) => `<p class="hint">${escapeHtml(n)}</p>`).join("") : ""}</section>`;
}

/* ---------------- Le menu ☰ ---------------- */
function renderMenu(st) {
  const m = st.mechant;
  const fini = st.current.kind === "fin";
  return `<div class="jeu-menu" role="dialog" aria-label="Menu de la partie">
    <div class="jeu-menu-head"><strong>Menu de la partie</strong><button class="btn btn-small" data-live="menu">Fermer ✕</button></div>

    ${st.heroes.length ? `<section class="menu-bloc"><h3>Les héros</h3>
      ${st.heroes.map((h, i) => `<div class="menu-hero">
        <div class="mh-nom">${h.emoji} ${escapeHtml(h.name)}<small>${h.pouvoir ? "pouvoir utilisé" : `pouvoir : ${h.powerEmoji} ${escapeHtml(h.power)}`}</small></div>
        <div class="mh-ligne"><span>${"❤️".repeat(h.coeurs)}${"🤍".repeat(Math.max(0, 3 - h.coeurs))}</span>
          <span class="mh-pm"><button data-live="hero" data-h="${i}" data-op="coeur-" aria-label="Enlever un cœur">−</button><button data-live="hero" data-h="${i}" data-op="coeur+" aria-label="Ajouter un cœur">+</button></span></div>
        <div class="mh-ligne"><span>✨ ${h.etoiles}</span>
          <span class="mh-pm"><button data-live="hero" data-h="${i}" data-op="etoile-" aria-label="Enlever une étoile">−</button><button data-live="hero" data-h="${i}" data-op="etoile+" aria-label="Ajouter une étoile">+</button></span></div>
      </div>`).join("")}</section>` : ""}

    <section class="menu-bloc"><h3>Réputation : ${repLabel(st.reputation)}</h3>
      <p class="hint">Gentils : le Cœur marche mieux. Durs ou méchants : la Force marche moins bien.</p>
      ${fini ? "" : `<div class="menu-row">
        <button class="btn btn-small btn-ghost" data-live="rep" data-d="-1">😠 Ils ont été méchants</button>
        <button class="btn btn-small btn-ghost" data-live="rep" data-d="1">😇 Ils ont été gentils</button></div>`}
    </section>

    ${fini ? "" : `<section class="menu-bloc"><h3>Noter une idée des enfants</h3>
      <form class="idea-form"><input type="text" id="idea-input" maxlength="100" placeholder="Ex. : Croquette, un chat volant" aria-label="Idée des enfants">
        <button class="btn btn-small" type="submit">Noter</button></form>
      <p class="hint">Elle reviendra plus tard dans l'histoire.</p></section>`}

    <details class="menu-bloc"><summary><h3>🤫 Le secret de l'histoire</h3></summary>
      <p>Le responsable : <strong>${escapeHtml(m.nom)}</strong>, ${escapeHtml(m.description)}. En vrai, ${escapeHtml(m.raison)}.</p>
      <p>Compagnon pour Maman : ${escapeHtml(st.compagnon)}.</p>
      <p>Amis : ${escapeHtml(st.allies.join(", ") || "aucun pour l'instant")}${st.secretConnu ? " · secret découvert" : ""}</p>
      ${(st.ctx && st.ctx.gmExtra ? st.ctx.gmExtra : []).map((t) => `<p>${escapeHtml(t)}</p>`).join("")}
    </details>

    <details class="menu-bloc"><summary><h3>📜 L'histoire jusqu'ici</h3></summary>
      <div class="live-log">${st.log.map(renderLogEntry).join("")}</div>
    </details>

    <section class="menu-bloc"><h3>Réglages</h3>
      <div class="menu-row"><span>Le dé :</span>
        <button class="pill${deMode() === "site" ? " on" : ""}" data-live="demode" data-v="site">🎲 Celui du site</button>
        <button class="pill${deMode() === "main" ? " on" : ""}" data-live="demode" data-v="main">✋ Notre dé</button></div>
      <div class="menu-row"><span>Playmobil :</span>
        <button class="pill${playmoOn() ? " on" : ""}" data-live="playmo" data-v="on">🧸 Oui</button>
        <button class="pill${playmoOn() ? "" : " on"}" data-live="playmo" data-v="off">Non</button></div>
    </section>

    <section class="menu-bloc menu-row">
      <button class="btn btn-ghost" data-live="pause">⏸ Pause (revenir au site)</button>
      <button class="btn btn-danger" data-live="quit">Arrêter la partie</button>
    </section>
  </div>`;
}

/* ---------------- L'écran complet ---------------- */
function renderLiveHTML(st) {
  const theme = liveTheme(st);
  if (st.pause) {
    return `<div class="live reprise">
      <p><strong>⏸ Une partie est en pause :</strong> ${escapeHtml(st.titre)} (${escapeHtml(theme.nom)}).</p>
      <div class="menu-row"><button class="btn btn-big" data-live="reprendre">▶️ Reprendre la partie</button>
      <button class="btn btn-ghost" data-live="quit">Arrêter</button></div></div>`;
  }
  const actif = st.current.kind !== "fin";
  const enCours = st.current.kind === "resultat" && st.current.suite ? st.current.suite : st.current;
  const tour = enCours && enCours.heroIdx !== undefined ? enCours.heroIdx : null;
  return `
    <div class="live jeu theme-${theme.id}">
      <header class="jeu-bar">
        <span class="jeu-emoji">${theme.emoji}</span>
        <div class="jeu-titre"><small>${escapeHtml(theme.nom)}${st.ctx ? ` · Épisode ${st.ctx.numero}/${st.ctx.total}` : ""}</small><strong>${escapeHtml(st.titre)}</strong></div>
        <button class="btn btn-small jeu-menu-btn" data-live="menu">☰ Menu</button>
      </header>
      ${st.heroes.length ? `<div class="jeu-equipe">${st.heroes.map((h, i) => `
        <span class="equipier${i === tour ? " actif" : ""}">${h.emoji} ${escapeHtml(h.name)} <small>${"❤️".repeat(h.coeurs) || "💔"} ✨${h.etoiles}</small></span>`).join("")}</div>` : ""}
      ${renderLiveCurrent(st)}
      ${actif ? `<nav class="jeu-actions no-print" aria-label="Actions rapides">
        <button data-live="undo"${st.undo && st.undo.length ? "" : " disabled"}><span>↩️</span>Annuler</button>
        <button data-live="add-imprevu"><span>⚡</span>Imprévu</button>
        <label class="photo-btn"><span>📸</span>Photo<input type="file" accept="image/*" capture="environment" data-live-photo hidden></label>
        <button data-live="boite"><span>🎴</span>Idées</button>
      </nav>` : ""}
      ${menuOuvert ? renderMenu(st) : ""}
    </div>`;
}

// Réaffiche la partie là où elle se trouve (onglet Aventure ou onglet Saga)
function refreshLive(scroll) {
  const st = loadLive();
  const enJeu = !!(st && !st.pause);
  document.body.classList.toggle("en-jeu", enJeu);
  if (!st) menuOuvert = false;
  if (st && st.mode === "saga") {
    if (enJeu && typeof showTab === "function") showTab("saga");
    if (typeof renderSaga === "function") renderSaga();
  } else {
    const out = document.getElementById("adventure-output");
    if (st) {
      if (enJeu && typeof showTab === "function") showTab("aventure");
      out.innerHTML = renderLiveHTML(st);
      $("#print-adventure").hidden = true;
      $("#copy-link").hidden = true;
      setAleasTheme(st.themeId);
    } else if (out.querySelector(".live")) {
      out.innerHTML = "";
    }
  }
  if (scroll && enJeu && !menuOuvert) window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ---------------- Choix des héros pour une partie simple ---------------- */
function renderLiveHeroChoice() {
  const box = document.getElementById("live-heroes");
  if (!box) return;
  const heroes = loadHeroes();
  box.innerHTML = heroes.length
    ? `<div class="hero-checks">${heroes.map((h) => {
        const type = HERO_TYPES.find((t) => t.id === h.type) || HERO_TYPES[0];
        return `<label class="hero-check"><input type="checkbox" name="live-hero" value="${h.id}" checked> ${type.emoji} ${escapeHtml(h.name)}</label>`;
      }).join("")}</div>
      <p class="hint">Les héros cochés sont appelés par leur nom, chacun son tour.</p>`
    : `<p class="hint">Aucun héros pour l'instant. <a href="#heros">Créez les héros des enfants</a> : ils seront appelés par leur nom dans l'histoire, chacun son tour.</p>`;
}

function selectedLiveHeroes() {
  const ids = [...document.querySelectorAll('input[name="live-hero"]:checked')].map((i) => i.value);
  return loadHeroes().filter((h) => ids.includes(h.id));
}

// Après une action qui donne un résultat, on l'affiche en grand avant de continuer
function avecResultat(fn) {
  return (st) => {
    const avant = st.log.length;
    const c = st.current || {};
    const deja = c.lire ? c.lire : (c.texte ? [c.texte] : []);
    fn(st);
    const nouvelles = st.log.slice(avant).filter((e) => !e.photo);
    if (nouvelles.length) {
      // Le texte déjà lu n'est pas répété : on ne garde que ce qui vient de se passer
      const sauter = deja.length && nouvelles[0].lignes[0] === deja[0] ? deja.length : 0;
      st.current = { kind: "resultat", entrees: nouvelles, sauter, suite: st.current };
    }
  };
}

function initLive() {
  const gen = document.getElementById("generate");
  const actions = gen.closest(".form-actions");
  actions.insertAdjacentHTML("beforebegin", `<div class="form-step"><span class="label">Les héros qui jouent</span><div id="live-heroes"></div></div>`);
  gen.insertAdjacentHTML("afterend", '<button class="btn btn-big btn-live" id="play-live">▶️ Jouer en direct</button>');
  renderLiveHeroChoice();
  window.addEventListener("hashchange", () => { if (location.hash.startsWith("#aventure")) renderLiveHeroChoice(); });

  document.getElementById("play-live").addEventListener("click", () => {
    const go = () => {
      const themeId = selectedValue($("#theme-choices"));
      const lengthId = selectedValue($("#length-choices"));
      history.replaceState(null, "", "#aventure");
      menuOuvert = false;
      saveLive(startLive(themeId, lengthId, randomSeed(), null, selectedLiveHeroes()));
      refreshLive(true);
    };
    if (loadLive()) askConfirm("Une partie est déjà en cours. La remplacer par une nouvelle ?", go, "Nouvelle partie");
    else go();
  });

  document.addEventListener("click", (e) => {
    const picker = e.target.closest(".live-talents .choice, .live-who .choice");
    if (picker) {
      picker.parentElement.querySelectorAll(".choice").forEach((b) => b.classList.remove("selected"));
      picker.classList.add("selected");
      return;
    }
    const btn = e.target.closest("[data-live]");
    if (!btn) return;
    const host = btn.closest(".live");
    const talentSel = host ? host.querySelector(".live-current .live-talents .choice.selected") : null;
    const talent = talentSel ? talentSel.dataset.value : "force";
    const whoSel = host ? host.querySelector(".live-current .live-who .choice.selected") : null;
    const who = whoSel ? parseInt(whoSel.dataset.value, 10) : null;
    const garderMenu = ["hero", "rep", "demode", "playmo"].includes(btn.dataset.live);
    if (!garderMenu && btn.dataset.live !== "menu") menuOuvert = false;
    switch (btn.dataset.live) {
      case "choose": liveAction((st) => chooseOption(st, parseInt(btn.dataset.index, 10))); break;
      case "resolve": liveAction(avecResultat((st) => resolveScene(st, btn.dataset.res, talent, who))); break;
      case "imprevu": liveAction(avecResultat((st) => resolveImprevu(st, btn.dataset.res, talent, who))); break;
      case "rival": liveAction(avecResultat((st) => resolveRival(st, btn.dataset.res))); break;
      case "finale": liveAction(avecResultat((st) => resolveFinale(st, talent, btn.dataset.res, who))); break;
      case "reveal": liveAction((st) => revealSuspense(st)); break;
      case "continuer": liveAction((st) => { st.current = st.current.suite; }); break;
      case "phase": liveAction((st) => { st.current.phase = btn.dataset.v; }); break;
      case "add-imprevu": liveAction((st) => insertImprevu(st)); break;
      case "boite": openAleas(true); break;
      case "menu": menuOuvert = !menuOuvert; refreshLive(false); break;
      case "pause": {
        const st = loadLive(); st.pause = true; saveLive(st); refreshLive(false);
        window.scrollTo({ top: 0 });
        break;
      }
      case "reprendre": {
        const st = loadLive(); st.pause = false; saveLive(st); refreshLive(true);
        break;
      }
      case "hero": liveAction((st) => {
        const h = st.heroes[parseInt(btn.dataset.h, 10)];
        if (!h) return;
        const op = btn.dataset.op;
        if (op === "coeur-") h.coeurs = Math.max(0, h.coeurs - 1);
        if (op === "coeur+") h.coeurs = Math.min(3, h.coeurs + 1);
        if (op === "etoile+") h.etoiles += 1;
        if (op === "etoile-") h.etoiles = Math.max(0, h.etoiles - 1);
      }); break;
      case "rep": liveAction((st) => {
        const lignes = [];
        changeRep(st, parseInt(btn.dataset.d, 10), lignes);
        if (lignes.length) st.log.push({ titre: parseInt(btn.dataset.d, 10) < 0 ? "😠 Pas très gentil…" : "😇 Quelle gentillesse !", lignes, cls: "event" });
        // Les difficultés de l'étape en cours tiennent compte de la nouvelle réputation
        [st.current, st.current && st.current.suite].forEach((c) => {
          if (c && c.difficultes) Object.assign(c, talentDifficulties(st, c.kind === "scene" ? c.base : 4, c.kind === "finale"));
        });
      }); toast("Réputation mise à jour"); break;
      case "demode": setDeMode(btn.dataset.v); refreshLive(false); break;
      case "playmo": {
        setPlaymo(btn.dataset.v === "on");
        const pm = $("#playmo-mode");
        if (pm) pm.checked = playmoOn();
        refreshLive(false);
        break;
      }
      case "undo": liveUndo(); break;
      case "quit": {
        const stop = () => { menuOuvert = false; clearLive(); refreshLive(false); window.scrollTo({ top: 0 }); };
        const st = loadLive();
        if (st && st.current.kind !== "fin") askConfirm("Arrêter la partie en cours ?", stop, "Arrêter");
        else stop();
        break;
      }
      default:
    }
  });

  // Photo d'une scène (Playmobil, dessin…) ajoutée à l'histoire
  document.addEventListener("change", async (e) => {
    if (!e.target.matches("[data-live-photo]") || !e.target.files[0]) return;
    try {
      const id = await addPhotoFromFile(e.target.files[0]);
      liveAction((st) => {
        let c = st.current;
        if (c && c.suite) c = c.suite;
        const lieu = c && c.lieu ? c.lieu.nom : (c && c.kind === "finale" ? st.finaleLieu.nom : "Notre scène");
        st.log.push({ titre: `📸 ${lieu}`, photo: id, lignes: [] });
      });
      toast("📸 Photo ajoutée à l'histoire");
    } catch {
      notify("Impossible de lire cette photo. Essayez avec une autre image.");
    }
    e.target.value = "";
  });

  document.addEventListener("submit", (e) => {
    if (e.target.classList.contains("idea-form")) {
      e.preventDefault();
      const value = e.target.querySelector("input").value.trim();
      if (!value) return;
      liveAction((st) => {
        st.inventions.push(value);
        st.log.push({ titre: "✨ Idée des enfants", lignes: [value], cls: "event" });
      });
      toast("✨ Idée notée : elle reviendra dans l'histoire");
      return;
    }
    if (!e.target.classList.contains("live-save")) return;
    e.preventDefault();
    const f = e.target;
    const lines = (sel) => f.querySelector(sel).value.split("\n").map((l) => l.trim()).filter(Boolean);
    const exploits = {};
    f.querySelectorAll(".exploit").forEach((el) => { exploits[el.dataset.hero] = el.value.trim(); });
    document.body.classList.remove("en-jeu");
    finishLiveSaga(loadLive(), { exploits, inventions: lines("#lx-inv"), objets: lines("#lx-obj"), notes: f.querySelector("#lx-notes").value.trim() });
  });

  const st = loadLive();
  if (st && st.mode === "solo") refreshLive(false);
  else if (st) document.body.classList.toggle("en-jeu", !st.pause);
}

initLive();

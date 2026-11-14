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
    power: power.nom, powerEmoji: power.emoji, item: h.item || "",
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
    note: team.length ? "Demandez à chaque enfant de présenter son héros en une phrase, avec une voix de héros !" : "" });
  st.introLignes = intro;
  st.current = makeChoice(st);
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

  let base = 4;
  if (st.step === 0) base = 3;
  else if (st.lastRes === "oops") {
    base = 3;
    notes.push("🙂 Après le dernier « oui, mais… », ce défi-ci est plus facile.");
  }
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
  if (next && rng() < 0.3) {
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
function makeImprevu(st, rng, texte) {
  const theme = liveTheme(st);
  const min = Math.min(...Object.values(st.talents));
  const hint = pick(rng, Object.keys(st.talents).filter((t) => st.talents[t] === min));
  const heroIdx = pickHero(st, hint);
  const { difficultes, raisons } = talentDifficulties(st, 4);
  return {
    kind: "imprevu",
    texte: nommer(texte || pick(rng, IMPREVUS_COMMUNS.concat(theme.imprevus)), heroAt(st, heroIdx)),
    talent: hint, heroIdx, difficultes, raisons,
  };
}

function insertImprevu(st, texte) {
  if (!st.current || st.current.kind === "fin") return;
  st.pile.push(st.current);
  st.current = makeImprevu(st, liveRng(st), texte);
}

function resolveImprevu(st, res, talent, heroIdx) {
  const c = st.current;
  const rng = liveRng(st);
  const hero = heroAt(st, heroIdx !== undefined && heroIdx !== null ? heroIdx : c.heroIdx);
  const lignes = [c.texte];
  let crit = null;
  if (res === "narr") {
    lignes.push("💡 Les enfants ont trouvé quoi faire, sans lancer le dé.");
  } else {
    if (res === "crit") { crit = "crit"; res = "ok"; }
    if (res === "fumble") { crit = "fumble"; res = "oops"; }
    if (res === "pouvoir") {
      res = "ok";
      if (hero) { hero.pouvoir = true; lignes.push(`✨ ${hero.name} utilise son pouvoir magique : ${hero.powerEmoji} ${hero.power} !`); }
    }
    st.talents[talent] = (st.talents[talent] || 0) + 1;
    st.lastTalents.push(talent);
    lignes.push(res === "ok" ? `✅ ${pick(rng, IMPREVUS_REUSSIS)}` : `🌀 ${nommer(pick(rng, CONSEQUENCES), hero)}`);
    if (crit === "crit") lignes.push(`🌟 Réussite critique ! ${nommer(pick(rng, CRITIQUES), hero)} Une ✨ étoile en plus.`);
    if (crit === "fumble") lignes.push(`🙈 Catastrophe rigolote ! ${nommer(pick(rng, GAFFES), hero)} Une ✨ étoile de courage.`);
    if (talent === "coeur" && res === "ok") changeRep(st, 1, lignes);
    heroEffects(st, hero, crit, "l'imprévu", lignes, lignes.join(" "));
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

/* ---------------- Affichage ---------------- */
function liveTalentPicker(selected, difficultes) {
  return `<div class="mini-choices live-talents">${Object.entries(TALENTS).map(([id, t]) => `
    <button type="button" class="choice${id === selected ? " selected" : ""}" data-value="${id}">${t.emoji} ${t.nom}${difficultes ? ` <small>${DIFFICULTES[difficultes[id]].texte}</small>` : ""}</button>`).join("")}</div>`;
}

function liveHeroPicker(st, selected) {
  if (!st.heroes.length) return "";
  return `<div class="mini-label">Qui agit ?</div>
    <div class="mini-choices live-who">${st.heroes.map((h, i) => `
      <button type="button" class="choice${i === selected ? " selected" : ""}" data-value="${i}">${h.emoji} ${escapeHtml(h.name)}${h.talent ? ` <small>${TALENTS[h.talent].emoji}⭐</small>` : ""}</button>`).join("")}</div>`;
}

function spotlight(st, idx) {
  const h = heroAt(st, idx);
  if (!h) return "";
  return `<div class="spotlight"><span class="spot-emoji">${h.emoji}</span>
    <div><strong>C'est au tour de ${escapeHtml(h.name)} !</strong><br>
    <small>Super-talent : ${TALENTS[h.talent].emoji} ${TALENTS[h.talent].nom} · Pouvoir : ${h.powerEmoji} ${escapeHtml(h.power)}${h.pouvoir ? " (déjà utilisé)" : ""}${h.item ? ` · Objet : ${escapeHtml(h.item)}` : ""}</small></div></div>`;
}

function powerButton(st, idx, action) {
  const h = heroAt(st, idx);
  if (!h || h.pouvoir) return "";
  return `<button class="btn btn-big btn-power" data-live="${action}" data-res="pouvoir">✨ ${escapeHtml(h.name)} utilise son pouvoir (${h.powerEmoji} ${escapeHtml(h.power)})</button>`;
}

function controls(st, c, action, talentDefaut, boutons) {
  return `<div class="live-controls">
      ${liveHeroPicker(st, c.heroIdx)}
      <div class="mini-label">Avec quel talent ? <small>(la difficulté change selon ce qui s'est passé avant)</small></div>
      ${liveTalentPicker(talentDefaut, c.difficultes)}
      ${(c.raisons || []).map((t) => `<p class="saga-note rep-note">${escapeHtml(t)}</p>`).join("")}
      ${diceRollerHTML({ target: c.difficultes[talentDefaut], apply: action })}
      <div class="live-results">${powerButton(st, c.heroIdx, action)}</div>
      <div class="mini-label">Ou avec votre propre dé, cliquez le résultat :</div>
      <div class="live-results">${boutons.map(([v, l, ghost]) => `<button class="btn btn-big${ghost ? " btn-ghost" : ""}" data-live="${action}" data-res="${v}">${l}</button>`).join("")}</div>
    </div>`;
}

function renderLiveCurrent(st) {
  const c = st.current;
  const notes = (list) => (list || []).map((t) => `<p class="saga-note">${escapeHtml(t)}</p>`).join("");
  const lire = (list) => list.map((t, i) => `<div class="read-aloud">${i === 0 ? '<span class="label-small">📖 À lire</span>' : ""}${escapeHtml(t)}</div>`).join("");

  if (c.kind === "choix") {
    return `<section class="live-current">
      <h3>🧭 ${escapeHtml(c.question)}</h3>
      <p class="hint">${c.chooser ? `C'est <strong>${escapeHtml(c.chooser)}</strong> qui choisit cette fois (ou tout le monde vote).` : "Lisez les deux lieux aux enfants et laissez-les choisir (ou voter)."}</p>
      <div class="live-options">${c.options.map((o, i) => `
        <button class="live-option" data-live="choose" data-index="${i}">
          <strong>${o.special === "secondeChance" ? "↩️ " : "📍 "}${escapeHtml(o.lieu.nom)}</strong>
          <span>${o.special === "secondeChance" ? "Retourner aider quelqu'un qui en avait besoin…" : escapeHtml(o.lieu.description)}</span>
        </button>`).join("")}</div>
    </section>`;
  }
  if (c.kind === "suspense") {
    return `<section class="live-current suspense">
      <h3>⏳ Moment de suspense…</h3>
      ${lire(c.lire)}
      <p class="saga-note">🎭 ${escapeHtml(c.conseil)}</p>
      <div class="live-results"><button class="btn btn-big btn-reveal" data-live="reveal">👀 Révéler !</button></div>
    </section>`;
  }
  if (c.kind === "scene") {
    const d = c.defi;
    const h = heroAt(st, c.heroIdx);
    const boutons = c.type === "rencontre"
      ? [["crit", "🌟 6 !"], ["ok", "✅ Aidé"], ["oops", "🌀 Aidé, mais…"], ["fumble", "🙈 1 !"], ["non", "🚶 Pas aidé", true]]
      : [["crit", "🌟 6 !"], ["ok", "✅ Réussi"], ["oops", "🌀 Oui, mais…"], ["fumble", "🙈 1 !"]];
    return `<section class="live-current">
      <h3>📍 ${escapeHtml(c.lieu.nom)} ${c.type === "rencontre" ? "· 🤝 Rencontre" : ""}</h3>
      ${spotlight(st, c.heroIdx)}
      ${lire(c.lire)}
      <div class="interaction"><strong>🧒 À vous de jouer :</strong> ${escapeHtml(c.interaction)}</div>
      <div class="challenge">
        <div class="challenge-head">Talent conseillé : ${talentBadge(d.talent)}</div>
        <div class="outcomes">
          <div class="outcome ok"><strong>✅ Ça marche</strong><p>${escapeHtml(nommer(d.reussite, h))}</p></div>
          <div class="outcome oops"><strong>🌀 Oui, mais…</strong><p>${escapeHtml(nommer(d.rate, h))}</p></div>
        </div>
        <p class="hint">🌟 Sur un 6 : réussite critique, avec un bonus et une étoile. 🙈 Sur un 1 : catastrophe rigolote, avec une étoile de courage.${c.type === "rencontre" ? " Si les héros aident avec la Force, ils bousculent un peu : la réputation baisse." : ""}</p>
      </div>
      ${notes(c.notes)}
      ${controls(st, c, "resolve", d.talent, boutons)}
    </section>`;
  }
  if (c.kind === "imprevu") {
    return `<section class="live-current imprevu">
      <h3>⚡ Imprévu !</h3>
      ${spotlight(st, c.heroIdx)}
      ${lire([c.texte])}
      <p class="hint">Demandez : « Qu'est-ce que vous faites ? » Si l'idée est évidente, pas besoin de dé.</p>
      <div class="live-results"><button class="btn btn-ghost" data-live="imprevu" data-res="narr">💡 Pas besoin de dé, on continue</button></div>
      ${controls(st, c, "imprevu", c.talent, [["crit", "🌟 6 !"], ["ok", "✅ Réussi"], ["oops", "🌀 Oui, mais…"], ["fumble", "🙈 1 !"]])}
    </section>`;
  }
  if (c.kind === "rival") {
    return `<section class="live-current">
      <h3>⚡ Un rival revient !</h3>
      ${lire(c.lire)}${notes(c.notes)}
      <div class="live-results">
        <button class="btn btn-big" data-live="rival" data-res="ami">🤝 Devenu ami</button>
        <button class="btn btn-big" data-live="rival" data-res="enfui">💨 Échappé</button>
      </div>
    </section>`;
  }
  if (c.kind === "finale") {
    const m = st.mechant;
    const defaut = c.essais.includes("coeur") ? "malin" : "coeur";
    return `<section class="live-current finale">
      <h3>🏁 La grande fin : ${escapeHtml(st.finaleLieu.nom)}</h3>
      ${spotlight(st, c.heroIdx)}
      ${lire(c.lire)}
      <div class="challenge">
        <p>Le secret : <strong>${escapeHtml(m.raison)}</strong>. Les solutions possibles :</p>
        <ul class="solutions">${Object.entries(m.solutions).map(([t, txt]) => `
          <li>${talentBadge(t)} ${diffBadge(c.difficultes[t])} ${escapeHtml(txt)}${c.essais.includes(t) ? " <em>(déjà essayé)</em>" : ""}</li>`).join("")}</ul>
      </div>
      ${notes(c.notes)}
      ${controls(st, c, "finale", defaut, [["crit", "🌟 6 !"], ["ok", "✅ Ça marche !"], ["oops", "🌀 Pas encore", true], ["fumble", "🙈 1 !", true]])}
    </section>`;
  }
  // Fin
  const heroes = st.ctx && st.ctx.heroes ? st.ctx.heroes : [];
  const exploitsDe = (name) => {
    const h = st.heroes.find((x) => x.name === name);
    return h ? h.exploits.slice(0, 2).join(" ; ") : "";
  };
  return `<section class="live-current ending">
    <h3>⭐ Le moment de fierté</h3>
    <p>Chacun à son tour (adultes compris) dit : <em>ce que son héros a fait de mieux</em> et <em>ce qu'il a préféré</em>. Donnez une dernière étoile à chacun.</p>
    ${st.mode === "saga" ? `
      <form class="live-save">
        ${heroes.map((h, i) => `<label class="small-label" for="lx-${i}">⭐ Exploit de ${escapeHtml(h.name)}</label>
          <input type="text" id="lx-${i}" class="exploit" data-hero="${escapeHtml(h.name)}" maxlength="160" value="${escapeHtml(exploitsDe(h.name))}">`).join("")}
        <label class="small-label" for="lx-inv">✨ Ce que les enfants ont inventé (un par ligne)</label>
        <textarea id="lx-inv" rows="2">${escapeHtml(st.inventions.join("\n"))}</textarea>
        <label class="small-label" for="lx-obj">🎒 Objets trouvés (un par ligne)</label>
        <textarea id="lx-obj" rows="2"></textarea>
        <label class="small-label" for="lx-notes">📝 Autre chose à retenir ?</label>
        <textarea id="lx-notes" rows="2"></textarea>
        <div class="form-actions"><button type="submit" class="btn btn-big">📚 Enregistrer dans la saga</button></div>
      </form>` : `
      <div class="form-actions">
        <button class="btn print-btn" onclick="window.print()">🖨️ Imprimer notre histoire</button>
        <button class="btn btn-big" data-live="quit">🔁 Nouvelle partie</button>
      </div>`}
  </section>`;
}

function renderHeroStrip(st) {
  const fini = st.current && st.current.kind === "fin";
  return `<div class="hero-strip no-print">
    ${st.heroes.map((h, i) => `
      <div class="hero-token${st.current && st.current.heroIdx === i ? " active" : ""}">
        <div class="ht-name">${h.emoji} ${escapeHtml(h.name)}</div>
        <div class="ht-stats"><span title="Cœurs">${"❤️".repeat(h.coeurs)}${"🤍".repeat(Math.max(0, 3 - h.coeurs))}</span>
          <span title="Étoiles">✨ ${h.etoiles}</span><span title="Pouvoir">${h.pouvoir ? "🔒" : h.powerEmoji}</span></div>
        ${fini ? "" : `<div class="ht-btns">
          <button data-live="hero" data-h="${i}" data-op="coeur-" title="Perdre un cœur">−❤️</button>
          <button data-live="hero" data-h="${i}" data-op="coeur+" title="Câlin : +1 cœur">+❤️</button>
          <button data-live="hero" data-h="${i}" data-op="etoile+" title="Gagner une étoile">+✨</button>
          <button data-live="hero" data-h="${i}" data-op="etoile-" title="Dépenser une étoile">−✨</button>
        </div>`}
      </div>`).join("")}
    <div class="hero-token rep-token">
      <div class="ht-name">Réputation</div>
      <div class="ht-stats"><span>${repLabel(st.reputation)}</span></div>
      ${fini ? "" : `<div class="ht-btns">
        <button data-live="rep" data-d="-1" title="Les héros ont été méchants ou brutaux">😠 Méchants</button>
        <button data-live="rep" data-d="1" title="Les héros ont été très gentils">😇 Gentils</button>
      </div>`}
    </div>
  </div>`;
}

function renderLiveHTML(st) {
  const theme = liveTheme(st);
  const m = st.mechant;
  const ouverts = st.fils.filter((f) => f.type !== "secondeChance").length;
  const actif = st.current && st.current.kind !== "fin";
  return `
    <article class="adventure live theme-${theme.id}">
      <header class="adv-header">
        <div class="adv-emoji">${theme.emoji}</div>
        <div>
          <p class="adv-world">▶️ En direct · ${escapeHtml(theme.nom)}${st.ctx ? ` · 📚 Épisode ${st.ctx.numero} sur ${st.ctx.total}` : ""}</p>
          <h2>${escapeHtml(st.titre)}</h2>
          <p class="adv-code">Étape ${Math.min(st.step + 1, st.nbScenes)} sur ${st.nbScenes}, puis la grande fin</p>
        </div>
      </header>
      ${renderHeroStrip(st)}
      <div class="live-tools no-print">
        ${actif ? `<button class="btn btn-small" data-live="add-imprevu">⚡ Un imprévu !</button>
        <form class="idea-form"><input type="text" id="idea-input" maxlength="100" placeholder="Une idée des enfants à retenir…" aria-label="Idée des enfants">
          <button class="btn btn-small btn-ghost" type="submit">✨ Noter une idée</button></form>` : ""}
        <button class="btn btn-small btn-ghost" data-live="undo"${st.undo && st.undo.length ? "" : " disabled"}>↩️ Annuler le dernier clic</button>
        <button class="btn btn-small btn-danger" data-live="quit">✕ Arrêter</button>
      </div>
      <details class="gm-box">
        <summary>🤫 Pour le Conteur (secret)</summary>
        <p>Le responsable : <strong>${escapeHtml(m.nom)}</strong>, ${escapeHtml(m.description)}. En vrai, <strong>${escapeHtml(m.raison)}</strong>.</p>
        <p>🦉 Compagnon pour Maman : ${escapeHtml(st.compagnon)}.</p>
        <p>Réputation : ${repLabel(st.reputation)} (${st.reputation > 0 ? "+" : ""}${st.reputation}) · Talents utilisés : 💪 ${st.talents.force} · 🧠 ${st.talents.malin} · ❤️ ${st.talents.coeur}</p>
        <p>🤝 Amis : ${escapeHtml(st.allies.join(", ") || "aucun pour l'instant")} · 🧵 Fils ouverts : ${ouverts}${st.secretConnu ? " · 🔑 secret découvert" : ""}</p>
        ${(st.ctx && st.ctx.gmExtra ? st.ctx.gmExtra : []).map((t) => `<p>${escapeHtml(t)}</p>`).join("")}
        <p class="hint" style="color:inherit">Comment l'histoire s'adapte : être dur ou méchant fait baisser la réputation, et la Force marche de moins en moins bien ; être gentil la fait monter, et le Cœur marche de mieux en mieux. Refaire toujours la même chose devient plus difficile, essayer un talent jamais utilisé devient plus facile. Si les enfants sont méchants dans ce qu'ils racontent, cliquez « 😠 Méchants » en haut.</p>
      </details>
      <div class="live-log">
        ${st.log.map((e) => `<section class="live-entry ${e.cls || ""}">
          <h4>${escapeHtml(e.titre)}</h4>${e.lignes.map((t) => `<p>${escapeHtml(t)}</p>`).join("")}
          ${e.note ? `<p class="hint">${escapeHtml(e.note)}</p>` : ""}</section>`).join("")}
      </div>
      ${renderLiveCurrent(st)}
    </article>`;
}

// Réaffiche la partie là où elle se trouve (onglet Aventure ou onglet Saga)
function refreshLive(scroll) {
  const st = loadLive();
  if (st && st.mode === "saga") {
    if (typeof renderSaga === "function") renderSaga();
  } else {
    const out = document.getElementById("adventure-output");
    if (st) {
      out.innerHTML = renderLiveHTML(st);
      $("#print-adventure").hidden = true;
      $("#copy-link").hidden = true;
      setAleasTheme(st.themeId);
    } else if (out.querySelector(".live")) {
      out.innerHTML = "";
    }
  }
  if (scroll) {
    const cur = document.querySelector(".live-current");
    if (cur) cur.scrollIntoView({ behavior: "smooth", block: "start" });
  }
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
      <p class="hint">En mode direct, les héros cochés sont appelés par leur nom, chacun son tour, avec leurs cœurs, étoiles et pouvoirs.</p>`
    : `<p class="hint">Aucun héros pour l'instant. <a href="#heros">Créez les héros des enfants</a> : ils seront appelés par leur nom dans l'histoire, chacun son tour.</p>`;
}

function selectedLiveHeroes() {
  const ids = [...document.querySelectorAll('input[name="live-hero"]:checked')].map((i) => i.value);
  return loadHeroes().filter((h) => ids.includes(h.id));
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
      saveLive(startLive(themeId, lengthId, randomSeed(), null, selectedLiveHeroes()));
      refreshLive(false);
      document.getElementById("adventure-output").scrollIntoView({ behavior: "smooth" });
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
    switch (btn.dataset.live) {
      case "choose": liveAction((st) => chooseOption(st, parseInt(btn.dataset.index, 10))); break;
      case "resolve": liveAction((st) => resolveScene(st, btn.dataset.res, talent, who)); break;
      case "imprevu": liveAction((st) => resolveImprevu(st, btn.dataset.res, talent, who)); break;
      case "rival": liveAction((st) => resolveRival(st, btn.dataset.res)); break;
      case "finale": liveAction((st) => resolveFinale(st, talent, btn.dataset.res, who)); break;
      case "reveal": liveAction((st) => revealSuspense(st)); break;
      case "add-imprevu": liveAction((st) => insertImprevu(st)); break;
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
      }); break;
      case "undo": liveUndo(); break;
      case "quit": {
        const stop = () => { clearLive(); refreshLive(false); };
        const st = loadLive();
        if (st && st.current.kind !== "fin") askConfirm("Arrêter la partie en cours ?", stop, "Arrêter");
        else stop();
        break;
      }
      default:
    }
  });

  document.addEventListener("submit", (e) => {
    if (e.target.classList.contains("idea-form")) {
      e.preventDefault();
      const value = e.target.querySelector("input").value.trim();
      if (!value) return;
      liveAction((st) => {
        st.inventions.push(value);
        st.log.push({ titre: "✨ Idée des enfants", lignes: [value], cls: "event", note: "Elle pourra revenir plus tard dans l'histoire." });
      });
      return;
    }
    if (!e.target.classList.contains("live-save")) return;
    e.preventDefault();
    const f = e.target;
    const lines = (sel) => f.querySelector(sel).value.split("\n").map((l) => l.trim()).filter(Boolean);
    const exploits = {};
    f.querySelectorAll(".exploit").forEach((el) => { exploits[el.dataset.hero] = el.value.trim(); });
    finishLiveSaga(loadLive(), { exploits, inventions: lines("#lx-inv"), objets: lines("#lx-obj"), notes: f.querySelector("#lx-notes").value.trim() });
  });

  const st = loadLive();
  if (st && st.mode === "solo") refreshLive(false);
}

initLive();

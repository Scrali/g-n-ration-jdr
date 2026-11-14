/* ==========================================================
   Mode « Jouer en direct » : l'histoire se construit pendant
   la partie. Les enfants choisissent où aller, le Conteur
   clique le résultat de chaque défi, et la suite est générée
   en fonction de ce qui vient de se passer :
   - un « oui, mais… » ouvre un fil qui revient plus tard ;
   - les personnages aidés deviennent des amis qui reviennent ;
   - un personnage pas aidé redemande de l'aide plus loin ;
   - la gentillesse rend le méchant plus facile à convaincre ;
   - les défis suivants mettent en avant le talent le moins utilisé ;
   - après un échec, le défi suivant est plus facile.
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

/* ---------------- Stockage ---------------- */
function loadLive() {
  try { return JSON.parse(localStorage.getItem(LIVE_KEY)); } catch { return null; }
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

/* ---------------- Démarrage ---------------- */
// ctx (optionnel, pour la saga) : { sagaId, numero, total, final, introAvant, recap,
//   mechant, finaleLieu, tresor, fin, allies, rival, sac, inventions, gmExtra }
function startLive(themeId, lengthId, seed, ctx = null) {
  const theme = THEMES.find((t) => t.id === themeId) || THEMES[0];
  const length = LENGTHS.find((l) => l.id === lengthId) || LENGTHS[0];
  const rng = makeRng(seed);
  const mechant = ctx && ctx.mechant ? ctx.mechant : pick(rng, theme.mechants);
  const finaleLieu = ctx && ctx.finaleLieu ? ctx.finaleLieu : pick(rng, theme.lieux);
  const donneur = pick(rng, theme.donneurs);
  const probleme = pick(rng, theme.problemes);
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
    gentillesse: 0,
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
  intro.push("Il faut des héros pour sauver la situation. Est-ce que vous acceptez la mission ?");
  if (ctx && ctx.recap) st.log.push({ titre: "📺 Précédemment…", lignes: ctx.recap, cls: "recap" });
  st.log.push({ titre: "🌅 Le début de l'histoire", lignes: intro });
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
  return {
    kind: "choix",
    question: st.step === 0 ? "Par où commencez-vous ?" : "Où allez-vous maintenant ?",
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
  const theme = liveTheme(st);
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
      if (fil.secret) { st.secretConnu = true; notes.push("🔑 Les héros connaissent maintenant le secret du méchant : la fin sera plus facile avec le Cœur."); }
    }
    defi = chooseDefi(st, rng, type);
    lire.push(defi.texte);
  }
  st.usedDefis.push(defi.texte);

  // Les amis reviennent
  const amis = st.allies.concat(st.ctx && st.ctx.allies ? st.ctx.allies : []);
  if (amis.length && rng() < 0.35) {
    const ami = pick(rng, amis);
    lire.push(`Bonne surprise : ${ami} arrive pour vous donner un coup de main !`);
    notes.push(`🤝 ${capFirst(ami)} aide : un héros lance 1 dé de plus ici.`);
  }
  if (st.ctx && st.ctx.sac && st.ctx.sac.length && rng() < 0.4) {
    notes.push(`🎒 Rappelez ce qu'il y a dans le sac (${pickMany(rng, st.ctx.sac, 2).join(" ; ")}) : un objet bien utilisé = pas besoin de dé.`);
  }
  if (st.ctx && st.ctx.inventions && st.ctx.inventions.length && rng() < 0.4) {
    notes.push(`✨ Faites revenir une idée des enfants : ${pick(rng, st.ctx.inventions)}.`);
  }

  let difficulte = 4;
  if (st.step === 0) difficulte = 3;
  else if (st.lastRes === "oops") {
    difficulte = 3;
    notes.push("🙂 Après le dernier « oui, mais… », ce défi-ci est plus facile.");
  }

  const scene = { kind: "scene", type, lieu: opt.lieu, defi, difficulte, lire, notes };
  // Une fois sur deux environ, un moment de suspense avant de révéler le défi
  if (rng() < 0.55) {
    const s = pick(rng, SUSPENSES);
    lire.splice(2, 0, `⏳ ${s}`);
    st.current = { kind: "suspense", lire: lire.slice(0, 3), conseil: pick(rng, CONSEILS_SUSPENSE), suite: scene };
  } else {
    st.current = scene;
  }
  void theme;
}

function resolveScene(st, res, talent) {
  const sc = st.current;
  const rng = liveRng(st);
  // 🌟 6 = réussite + bonus ; 🙈 1 = « oui, mais… » + gaffe rigolote. Une étoile dans les deux cas.
  let crit = null;
  if (res === "crit") { crit = "crit"; res = "ok"; }
  else if (res === "fumble") { crit = "fumble"; res = "oops"; }
  const theme = liveTheme(st);
  const d = sc.defi;
  const lignes = sc.lire.slice();
  const effets = [];
  st.talents[talent] = (st.talents[talent] || 0) + 1;
  if (talent === "coeur") st.gentillesse += 1;

  if (sc.type === "rencontre") {
    if (res === "non") {
      lignes.push("🚶 Les héros préfèrent continuer leur route.");
      st.fils.push({ type: "secondeChance", pnj: d.pnj || "ce personnage", defi: d, lieu: sc.lieu });
    } else {
      lignes.push(`${res === "oops" ? "🌀" : "✅"} ${res === "oops" ? d.rate : d.reussite}`);
      if (d.pnj && !st.allies.includes(d.pnj)) st.allies.push(d.pnj);
      st.gentillesse += 1;
    }
  } else {
    lignes.push(`${res === "oops" ? "🌀" : "✅"} ${res === "oops" ? d.rate : d.reussite}`);
    if (res === "oops") {
      const dispo = FILS.filter((f) => !st.fils.some((x) => x.id === f.id) && !(st.filsUtilises || []).includes(f.id));
      if (dispo.length) {
        const f = pick(rng, dispo);
        st.filsUtilises = (st.filsUtilises || []).concat(f.id);
        effets.push(f.ouverture);
        st.fils.push({
          type: "fil", id: f.id, secret: !!f.secret,
          resolution: fill(f.resolution, { creature: pick(rng, theme.creatures), mechant: nomMilieu(st.mechant.nom), raison: st.mechant.raison }),
        });
      }
    }
  }
  if (crit === "crit") lignes.push(`🌟 Réussite critique ! ${pick(rng, CRITIQUES)} Le héros gagne une ✨ étoile.`);
  if (crit === "fumble") lignes.push(`🙈 Catastrophe rigolote ! ${pick(rng, GAFFES)} Pour son courage, le héros gagne quand même une ✨ étoile.`);
  const restantes = st.nbScenes - st.step;
  if (res === "ok" && st.indices.length && (crit === "crit" || rng() < 0.5 || restantes <= st.indices.length - 1)) {
    effets.push(`🔎 Indice : ${st.indices.shift()}`);
  }

  st.record.scenes.push({ lieu: sc.lieu, type: sc.type, defi: d, difficulte: sc.difficulte, res: res === "non" ? "non" : res, talent });
  st.log.push({ titre: `📍 ${sc.lieu.nom}`, lignes: lignes.concat(effets) });
  st.lastRes = res;
  st.step += 1;

  if (st.step < st.nbScenes && rng() < 0.3) {
    st.log.push({ titre: "⚡ En chemin…", lignes: [pick(rng, IMPREVUS_COMMUNS.concat(theme.imprevus))], cls: "event",
      note: "Laissez les enfants réagir, lancez un dé si besoin." });
  }

  if (st.step < st.nbScenes) st.current = makeChoice(st);
  else if (st.ctx && st.ctx.rival && !st.record.rival) st.current = rivalStep(st);
  else goFinale(st);
}

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
  st.log.push({ titre: "⚡ Un rival revient", lignes: st.current.lire.concat(res === "ami"
    ? [`🤝 Cette fois, ${nomMilieu(r)} et les héros sont devenus amis !`]
    : ["💨 Les héros lui échappent encore une fois !"]) });
  if (res === "ami") { st.allies.push(r); st.gentillesse += 1; }
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
  else if (st.gentillesse >= 2) lire.push(`${nom} vous regarde arriver… et semble plus triste qu'en colère.`);
  else if (st.gentillesse === 0) lire.push(`${nom} est très en colère et ne veut écouter personne… pour l'instant.`);
  else lire.push(`${nom} vous attend de pied ferme.`);

  const amis = st.allies.concat(st.ctx && st.ctx.allies ? st.ctx.allies.filter((a) => !st.allies.includes(a)) : []);
  if (amis.length) lire.push(`Mais vous n'êtes pas seuls : ${joinList(amis)} arrivent pour vous aider !`);

  const facileCoeur = st.secretConnu || st.gentillesse >= 2;
  const rngF = liveRng(st);
  const finale = {
    kind: "finale",
    lire,
    difficultes: { coeur: facileCoeur ? 3 : 4, malin: 4, force: st.gentillesse === 0 ? 5 : 4 },
    notes: [
      amis.length ? `🤝 Chaque ami présent peut donner 1 dé de plus à un héros.` : "",
      facileCoeur ? "❤️ Les héros ont été gentils (ou connaissent le secret) : convaincre avec le Cœur est facile." : "",
      st.gentillesse === 0 ? "💪 Personne n'a encore utilisé le Cœur : la force sera difficile, la gentillesse peut tout changer." : "",
    ].filter(Boolean),
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

function resolveFinale(st, talent, res) {
  const m = st.mechant;
  const sol = m.solutions[talent];
  const rng = liveRng(st);
  if (res === "oops" || res === "fumble") {
    st.current.essais.push(talent);
    const lignes = [`Les héros essaient : ${sol.charAt(0).toLowerCase() + sol.slice(1)}`];
    if (res === "fumble") lignes.push(`🙈 Catastrophe rigolote ! ${pick(rng, GAFFES)} Même ${nomMilieu(m.nom)} ne peut pas s'empêcher de rire. Pour son courage, le héros gagne une ✨ étoile.`);
    lignes.push(`${capFirst(nomMilieu(m.nom))} hésite… Ça n'a pas encore marché. Essayez encore !`);
    st.log.push({ titre: res === "fumble" ? "🙈 Oups…" : "🌀 Pas encore…", lignes, cls: "event" });
    return;
  }
  st.record.finale = talent;
  const lignes = st.current.lire.concat([`✅ Les héros ont trouvé la solution : ${sol.charAt(0).toLowerCase() + sol.slice(1)}`]);
  lignes.push(talent === "coeur"
    ? `${capFirst(nomMilieu(m.nom))} et les héros sont devenus amis.`
    : "Les héros l'ont emporté !");
  if (res === "crit") lignes.push("🌟 Réussite critique ! C'est la plus belle victoire qu'on ait jamais vue : tout le monde applaudit, et une pluie d'étoiles tombe du ciel. Chaque héros gagne une ✨ étoile.");
  st.log.push({ titre: `🏁 ${st.finaleLieu.nom}`, lignes });
  const finLignes = [`Grâce à vous, tout est rentré dans l'ordre ! Pour vous remercier, vous recevez ${st.tresor}.`]
    .concat(st.ctx && st.ctx.fin ? st.ctx.fin : []);
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
function liveTalentPicker(name, selected, difficultes) {
  return `<div class="mini-choices live-talents" data-name="${name}">${Object.entries(TALENTS).map(([id, t]) => `
    <button type="button" class="choice${id === selected ? " selected" : ""}" data-value="${id}">${t.emoji} ${t.nom}${difficultes ? ` <small>${SEUILS[difficultes[id]].ok}</small>` : ""}</button>`).join("")}</div>`;
}

function renderLiveCurrent(st) {
  const c = st.current;
  const notes = (list) => (list || []).map((t) => `<p class="saga-note">${escapeHtml(t)}</p>`).join("");
  const lire = (list) => list.map((t, i) => `<div class="read-aloud">${i === 0 ? '<span class="label-small">📖 À lire</span>' : ""}${escapeHtml(t)}</div>`).join("");

  if (c.kind === "choix") {
    return `<section class="live-current">
      <h3>🧭 ${escapeHtml(c.question)}</h3>
      <p class="hint">Lisez les deux lieux aux enfants et laissez-les choisir (ou voter).</p>
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
    const boutons = c.type === "rencontre"
      ? [["crit", "🌟 6 !"], ["ok", "✅ Aidé"], ["oops", "🌀 Aidé, mais…"], ["fumble", "🙈 1 !"], ["non", "🚶 Pas aidé"]]
      : [["crit", "🌟 6 !"], ["ok", "✅ Réussi"], ["oops", "🌀 Oui, mais…"], ["fumble", "🙈 1 !"]];
    return `<section class="live-current">
      <h3>📍 ${escapeHtml(c.lieu.nom)} ${c.type === "rencontre" ? "· 🤝 Rencontre" : ""}</h3>
      ${lire(c.lire)}
      <div class="challenge">
        <div class="challenge-head">${talentBadge(d.talent)} ${diffBadge(c.difficulte)}</div>
        <div class="outcomes">
          <div class="outcome ok"><strong>✅ ${SEUILS[c.difficulte].ok} : ça marche</strong><p>${escapeHtml(d.reussite)}</p></div>
          <div class="outcome oops"><strong>🌀 ${SEUILS[c.difficulte].rate} : oui, mais…</strong><p>${escapeHtml(d.rate)}</p></div>
        </div>
        <p class="hint">🌟 Sur un 6 : réussite critique, avec un bonus et une étoile. 🙈 Sur un 1 : catastrophe rigolote, avec une étoile de courage. Le site invente la suite.</p>
      </div>
      ${notes(c.notes)}
      <div class="live-controls">
        <div class="mini-label">Talent utilisé par les enfants</div>
        ${liveTalentPicker("talent", d.talent)}
        ${diceRollerHTML({ target: c.difficulte, apply: "resolve" })}
        <div class="mini-label">Ou avec votre propre dé, cliquez le résultat :</div>
        <div class="live-results">${boutons.map(([v, l]) => `<button class="btn btn-big" data-live="resolve" data-res="${v}">${l}</button>`).join("")}</div>
      </div>
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
    return `<section class="live-current finale">
      <h3>🏁 La grande fin : ${escapeHtml(st.finaleLieu.nom)}</h3>
      ${lire(c.lire)}
      <div class="challenge">
        <p>Le secret : <strong>${escapeHtml(m.raison)}</strong>. Les solutions possibles :</p>
        <ul class="solutions">${Object.entries(m.solutions).map(([t, txt]) => `
          <li>${talentBadge(t)} ${diffBadge(c.difficultes[t])} ${escapeHtml(txt)}${c.essais.includes(t) ? " <em>(déjà essayé)</em>" : ""}</li>`).join("")}</ul>
      </div>
      ${notes(c.notes)}
      <div class="live-controls">
        <div class="mini-label">Ce que tentent les enfants</div>
        ${liveTalentPicker("talent", c.essais.includes("coeur") ? "malin" : "coeur", c.difficultes)}
        ${diceRollerHTML({ target: 4, apply: "finale" })}
        <div class="mini-label">Ou avec votre propre dé, cliquez le résultat :</div>
        <div class="live-results">
          <button class="btn btn-big" data-live="finale" data-res="crit">🌟 6 !</button>
          <button class="btn btn-big" data-live="finale" data-res="ok">✅ Ça marche !</button>
          <button class="btn btn-big btn-ghost" data-live="finale" data-res="oops">🌀 Pas encore</button>
          <button class="btn btn-big btn-ghost" data-live="finale" data-res="fumble">🙈 1 !</button>
        </div>
      </div>
    </section>`;
  }
  // Fin
  const heroes = st.ctx && st.ctx.heroes ? st.ctx.heroes : [];
  return `<section class="live-current ending">
    <h3>⭐ Le moment de fierté</h3>
    <p>Chacun à son tour (adultes compris) dit : <em>ce que son héros a fait de mieux</em> et <em>ce qu'il a préféré</em>. Donnez une dernière étoile à chacun.</p>
    ${st.mode === "saga" ? `
      <form class="live-save">
        ${heroes.map((h, i) => `<label class="small-label" for="lx-${i}">⭐ Exploit de ${escapeHtml(h.name)}</label>
          <input type="text" id="lx-${i}" class="exploit" data-hero="${escapeHtml(h.name)}" maxlength="120">`).join("")}
        <label class="small-label" for="lx-inv">✨ Ce que les enfants ont inventé (un par ligne)</label>
        <textarea id="lx-inv" rows="2"></textarea>
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

function renderLiveHTML(st) {
  const theme = liveTheme(st);
  const m = st.mechant;
  const ouverts = st.fils.filter((f) => f.type !== "secondeChance").length;
  const coeurs = "❤️".repeat(Math.min(st.gentillesse, 5)) || "—";
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
      <div class="live-tools no-print">
        <button class="btn btn-small btn-ghost" data-live="undo"${st.undo && st.undo.length ? "" : " disabled"}>↩️ Annuler le dernier clic</button>
        <button class="btn btn-small btn-danger" data-live="quit">✕ Arrêter la partie</button>
      </div>
      <details class="gm-box">
        <summary>🤫 Pour le Conteur (secret)</summary>
        <p>Le responsable : <strong>${escapeHtml(m.nom)}</strong>, ${escapeHtml(m.description)}. En vrai, <strong>${escapeHtml(m.raison)}</strong>.</p>
        <p>🦉 Compagnon pour Maman : ${escapeHtml(st.compagnon)}.</p>
        <p>❤️ Gentillesse de l'équipe : ${coeurs} · 💪 ${st.talents.force} · 🧠 ${st.talents.malin} · ❤️ ${st.talents.coeur}</p>
        <p>🤝 Amis : ${escapeHtml(st.allies.join(", ") || "aucun pour l'instant")} · 🧵 Fils ouverts : ${ouverts}${st.secretConnu ? " · 🔑 secret découvert" : ""}</p>
        ${(st.ctx && st.ctx.gmExtra ? st.ctx.gmExtra : []).map((t) => `<p>${escapeHtml(t)}</p>`).join("")}
        <p class="hint" style="color:inherit">L'histoire s'adapte : un « oui, mais… » ouvre un fil qui revient plus tard, les personnages aidés reviennent en amis, la gentillesse rend la fin plus facile avec le Cœur, et les défis suivants mettent en avant le talent le moins utilisé.</p>
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

function initLive() {
  const gen = document.getElementById("generate");
  gen.insertAdjacentHTML("afterend", '<button class="btn btn-big btn-live" id="play-live">▶️ Jouer en direct</button>');
  document.getElementById("play-live").addEventListener("click", () => {
    const go = () => {
      const themeId = selectedValue($("#theme-choices"));
      const lengthId = selectedValue($("#length-choices"));
      history.replaceState(null, "", "#aventure");
      saveLive(startLive(themeId, lengthId, randomSeed()));
      refreshLive(false);
      document.getElementById("adventure-output").scrollIntoView({ behavior: "smooth" });
    };
    if (loadLive()) askConfirm("Une partie est déjà en cours. La remplacer par une nouvelle ?", go, "Nouvelle partie");
    else go();
  });

  document.addEventListener("click", (e) => {
    const picker = e.target.closest(".live-talents .choice");
    if (picker) {
      picker.parentElement.querySelectorAll(".choice").forEach((b) => b.classList.remove("selected"));
      picker.classList.add("selected");
      return;
    }
    const btn = e.target.closest("[data-live]");
    if (!btn) return;
    const host = btn.closest(".live");
    const talentSel = host ? host.querySelector(".live-talents .choice.selected") : null;
    const talent = talentSel ? talentSel.dataset.value : "force";
    switch (btn.dataset.live) {
      case "choose": liveAction((st) => chooseOption(st, parseInt(btn.dataset.index, 10))); break;
      case "resolve": liveAction((st) => resolveScene(st, btn.dataset.res, talent)); break;
      case "rival": liveAction((st) => resolveRival(st, btn.dataset.res)); break;
      case "finale": liveAction((st) => resolveFinale(st, talent, btn.dataset.res)); break;
      case "reveal": liveAction((st) => revealSuspense(st)); break;
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

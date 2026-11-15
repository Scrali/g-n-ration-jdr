/* ==========================================================
   Mode Saga : une histoire en plusieurs épisodes qui évolue.
   Après chaque épisode, le Conteur remplit un petit bilan
   (chemins choisis, amis, exploits, idées des enfants…).
   L'épisode suivant est généré à partir de tout ça.
   ========================================================== */

const SAGA_KEY = "petits-heros:sagas";

/* ---------------- Stockage ---------------- */
function loadSagaStore() {
  try {
    const s = JSON.parse(localStorage.getItem(SAGA_KEY));
    if (s && Array.isArray(s.sagas)) return s;
  } catch { /* rien */ }
  return { currentId: null, sagas: [] };
}

function saveSagaStore(store) {
  try { localStorage.setItem(SAGA_KEY, JSON.stringify(store)); } catch { /* stockage indisponible */ }
}

function currentSaga(store) {
  return store.sagas.find((s) => s.id === store.currentId) || null;
}

function updateSaga(saga) {
  const store = loadSagaStore();
  const i = store.sagas.findIndex((s) => s.id === saga.id);
  if (i >= 0) store.sagas[i] = saga; else store.sagas.push(saga);
  store.currentId = saga.id;
  saveSagaStore(store);
}

/* ---------------- Petits outils ---------------- */
function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
function low(s) { return s ? s.charAt(0).toLowerCase() + s.slice(1) : s; }

function joinNames(list) {
  if (list.length <= 1) return list.join("");
  return `${list.slice(0, -1).join(", ")} et ${list[list.length - 1]}`;
}

function serializeAdventure(a) {
  return { ...a, theme: a.theme.id, length: a.length.id };
}

function hydrateAdventure(a) {
  return {
    ...a,
    theme: THEMES.find((t) => t.id === a.theme) || THEMES[0],
    length: LENGTHS.find((l) => l.id === a.length) || LENGTHS[0],
  };
}

function sagaDef(saga) { return SAGAS.find((d) => d.id === saga.sagaId) || SAGAS[0]; }

/* ---------------- Création ---------------- */
function createSaga({ sagaId, mode, themeId, nbEpisodes, lengthId, heroes }) {
  const seed = randomSeed();
  const rng = makeRng(seed);
  const def = SAGAS.find((d) => d.id === sagaId) || pick(rng, SAGAS);
  return {
    id: `saga-${Date.now().toString(36)}`,
    creeLe: new Date().toISOString(),
    titre: def.titre,
    sagaId: def.id,
    mode,
    route: mode === "voyage" ? pickMany(rng, THEMES, THEMES.length).map((t) => t.id) : [themeId],
    nbEpisodes,
    lengthId,
    seed,
    heroes,
    allies: [],
    rivaux: [],
    sac: [],
    inventions: [],
    exploits: [],
    fragments: 0,
    used: { textes: [], mechants: [], problemes: [], lieux: [] },
    episodes: [],
    terminee: false,
  };
}

/* ---------------- Génération d'un épisode ---------------- */
function prepareEpisode(saga) {
  const def = sagaDef(saga);
  const n = saga.episodes.length + 1;
  const total = saga.nbEpisodes;
  const final = n === total;
  const themeId = saga.route[(n - 1) % saga.route.length];
  const base = THEMES.find((t) => t.id === themeId);
  const themeAug = { ...base, obstacles: base.obstacles.concat(OBSTACLES_COMMUNS) };
  const rng = makeRng(saga.seed + n * 1013);

  // On essaie plusieurs tirages et on garde celui qui répète le moins les épisodes passés
  let best = null;
  let bestScore = Infinity;
  for (let k = 0; k < 30; k++) {
    const seed = (saga.seed * 7 + n * 1013 + k * 7919) >>> 0;
    const a = generateAdventure(themeId, saga.lengthId, seed, themeAug);
    const textes = a.scenes.flatMap((s) => s.defis.map((d) => d.texte));
    const score =
      textes.filter((t) => saga.used.textes.includes(t)).length * 3 +
      a.scenes.filter((s) => saga.used.lieux.includes(s.lieu.nom)).length +
      (saga.used.mechants.includes(a.finale.mechant.nom) ? 6 : 0) +
      (saga.used.problemes.includes(a.titre) ? 6 : 0);
    if (score < bestScore) { best = a; bestScore = score; }
    if (score === 0) break;
  }
  const a = best;
  a.theme = base;
  a.saga = { titre: saga.titre, numero: n, total };
  a.heroes = saga.heroes;
  a.gmExtra = [
    `📚 Le secret de la saga : le Grand Méchant est ${def.grandMechant.nom}. En vrai, ${def.grandMechant.raison}. Les héros le découvriront petit à petit, grâce aux indices.`,
  ];
  if (!final) {
    a.gmExtra.push(`🧩 À la fin de cet épisode, les héros trouvent ${def.fragment} (${n} sur ${total - 1}) et un indice sur le Grand Méchant.`);
  }

  // Le résumé de ce qui s'est passé avant
  if (n > 1) a.recap = buildRecap(saga);

  // Le début de l'histoire
  const monde = `« ${base.nom} »`;
  if (n === 1) {
    a.intro.avant = [def.intro];
    if (saga.mode === "voyage") a.intro.avant.push(`Votre voyage commence dans le monde de ${monde}.`);
  } else if (!final) {
    a.intro.avant = [saga.mode === "voyage"
      ? `Votre quête pour réparer ${def.artefact} vous mène cette fois dans le monde de ${monde} !`
      : `Votre quête continue : il faut encore trouver de quoi réparer ${def.artefact}.`];
  }

  const notes = [];
  const allies = saga.allies;

  // Un ami des épisodes précédents vient demander de l'aide
  if (n > 1 && !final && allies.length && rng() < 0.5) {
    const ami = pick(rng, allies);
    a.intro.texte = a.intro.texte.replace(/^Voici qu'arrive .*?, qui a besoin de vous\./,
      `Vous souvenez-vous ${deNom(ami.nom)}, de l'épisode ${ami.episode} ? Cette fois, c'est à son tour de vous demander de l'aide.`);
  }

  if (final) {
    a.titre = `${def.titre} : la grande fin`;
    a.intro.avant = [
      `Grâce à tous les indices, vous savez enfin qui est derrière tout ça ! Vous avez tous les morceaux : il ne reste qu'à rejoindre ${def.finaleLieu.nom.replace(/^L/, "l")}.`,
    ];
    a.intro.texte = `Mais pour y arriver, il faut d'abord traverser le monde de ${monde}. Ce sera votre plus grande aventure !`;
    a.finale.lieu = def.finaleLieu;
    a.finale.mechant = def.grandMechant;
    a.finale.difficulte = 4;
    const aide = allies.length
      ? `🤝 Tous vos amis arrivent pour la grande fin : ${joinNames(allies.map((x) => x.nom))}. Chaque ami peut donner 1 dé de plus à un héros.`
      : "Les héros n'ont pas d'amis avec eux… mais ensemble, ils sont très forts !";
    const rivaux = saga.rivaux.length
      ? ` 😈 Les anciens rivaux (${joinNames(saga.rivaux.map((x) => x.nom))}) regardent depuis un coin : si les héros leur demandent gentiment de l'aide, ils peuvent changer de camp !`
      : "";
    a.finale.note = aide + rivaux;
    a.tresor = "le titre de Héros Légendaires, et une fête immense en leur honneur";
    a.fin = [
      `Tous les morceaux se rassemblent dans un grand éclair de lumière : ${def.artefact} brille à nouveau !`,
      "C'est la fin de la saga. Vous êtes maintenant des héros légendaires, et on racontera votre histoire pendant très, très longtemps.",
    ];
  } else {
    a.fin = [
      `Et ce n'est pas tout : au milieu du trésor, vous trouvez ${def.fragment} ! (${n} sur ${total - 1})`,
      `Indice : ${def.indices[(n - 1) % def.indices.length]}`,
      n === total - 1
        ? "Vous avez tous les morceaux ! Avec les indices, vous comprenez enfin où aller… La suite au prochain épisode !"
        : "Mais qui a bien pu faire ça ? La suite au prochain épisode !",
    ];
  }

  // Un rival revient
  if (!final && saga.rivaux.length && rng() < 0.6) {
    const rival = pick(rng, saga.rivaux);
    a.rebondissement = `Revoilà ${nomMilieu(rival.nom)} ! Depuis l'épisode ${rival.episode}, les héros n'ont pas été oubliés… et un mauvais tour se prépare.`;
    a.rebondissementNote = "C'est l'occasion d'en faire un ami (avec ❤️ Cœur), ou de lui échapper encore une fois. Notez ce qui s'est passé dans le bilan.";
    a.rivalRetour = rival.nom;
  }

  // Des rappels pour faire revenir les amis, les objets et les idées des enfants
  if (allies.length) {
    notes.push(`🤝 Un ami peut surgir ici pour aider : ${pick(rng, allies).nom}. Cet ami donne 1 dé de plus à un héros.`);
  }
  if (saga.sac.length) {
    const objets = pickMany(rng, saga.sac, 2);
    notes.push(`🎒 Rappelez aux enfants ce qu'il y a dans leur sac (${objets.join(" ; ")}). Si un objet est vraiment utile ici, pas besoin de lancer le dé !`);
  }
  if (saga.inventions.length) {
    notes.push(`✨ Faites revenir une idée inventée par les enfants : ${pick(rng, saga.inventions).texte}.`);
  }
  const ordre = pickMany(rng, a.scenes.map((_, i) => i), a.scenes.length);
  notes.forEach((t, i) => {
    const s = a.scenes[ordre[i % ordre.length]];
    s.note = s.note ? `${s.note} ${t}` : t;
  });

  // On retient ce qui a été utilisé pour varier les prochains épisodes
  a.scenes.forEach((s) => {
    s.defis.forEach((d) => saga.used.textes.push(d.texte));
    saga.used.lieux.push(s.lieu.nom);
  });
  saga.used.mechants.push(a.finale.mechant.nom);
  saga.used.problemes.push(a.titre);

  saga.episodes.push({ numero: n, themeId, adventure: serializeAdventure(a), bilan: null });
  return saga;
}

/* ---------------- Résumé « Précédemment » ---------------- */
function finaleSentence(m, talent, final) {
  if (talent === "coeur") return `${cap(m.nom)} et les héros sont devenus amis.`;
  if (final) return "Les héros l'ont emporté, et tout est rentré dans l'ordre.";
  return `Les héros l'ont emporté… mais on n'a peut-être pas fini d'entendre parler ${deNom(m.nom)} !`;
}

function buildRecap(saga) {
  const def = sagaDef(saga);
  const prev = saga.episodes[saga.episodes.length - 1];
  const a = hydrateAdventure(prev.adventure);
  const names = saga.heroes.map((h) => h.name);
  const lines = [];
  lines.push(names.length
    ? `Nos héros, ${joinNames(names)}, sont en mission pour réparer ${def.artefact}.`
    : `Nos héros sont en mission pour réparer ${def.artefact}.`);
  lines.push(`Dans l'épisode précédent, « ${a.titre} », ils sont allés dans le monde de « ${a.theme.nom} ».`);
  if (prev.bilan) {
    lines.push(`À la fin, ils ont retrouvé ${nomMilieu(a.finale.mechant.nom)}. ${finaleSentence(a.finale.mechant, prev.bilan.finale, false)}`);
    saga.exploits.filter((e) => e.episode === prev.numero)
      .forEach((e) => lines.push(`⭐ ${e.hero} : ${e.texte}`));
  }
  const nbIndices = Math.min(saga.fragments, def.indices.length);
  lines.push(`Ils ont déjà trouvé ${saga.fragments} morceau${saga.fragments > 1 ? "x" : ""} sur ${saga.nbEpisodes - 1}.`);
  if (nbIndices) lines.push(`Les indices : ${def.indices.slice(0, nbIndices).join(" ")}`);
  return lines;
}

/* ---------------- Bilan d'un épisode ---------------- */
function applyBilan(saga, ep, bilan) {
  const a = hydrateAdventure(ep.adventure);
  const final = ep.numero === saga.nbEpisodes;
  ep.bilan = bilan;
  const addAlly = (nom) => {
    if (nom && !saga.allies.some((x) => x.nom === nom)) saga.allies.push({ nom, episode: ep.numero });
  };

  a.scenes.forEach((s, i) => {
    if (s.type === "rencontre" && bilan.scenes[i] && bilan.scenes[i].res !== "non") addAlly(s.defis[0].pnj);
  });

  if (a.rivalRetour && bilan.rival === "ami") {
    saga.rivaux = saga.rivaux.filter((r) => r.nom !== a.rivalRetour);
    addAlly(a.rivalRetour);
  }

  if (final) {
    saga.terminee = true;
  } else {
    saga.fragments += 1;
    const nom = a.finale.mechant.nom;
    if (bilan.finale === "coeur") {
      saga.rivaux = saga.rivaux.filter((r) => r.nom !== nom);
      addAlly(nom);
    } else if (!saga.rivaux.some((r) => r.nom === nom) && !saga.allies.some((r) => r.nom === nom)) {
      saga.rivaux.push({ nom, episode: ep.numero });
    }
    saga.sac.push(a.tresor);
  }

  bilan.objets.forEach((o) => saga.sac.push(o));
  bilan.inventions.forEach((t) => saga.inventions.push({ texte: t, episode: ep.numero }));
  Object.entries(bilan.exploits).forEach(([hero, texte]) => {
    if (texte) saga.exploits.push({ hero, texte, episode: ep.numero });
  });
  return saga;
}

/* ---------------- Le Livre de la Saga ---------------- */
function episodeStory(saga, ep) {
  const def = sagaDef(saga);
  const a = hydrateAdventure(ep.adventure);
  const b = ep.bilan;
  const final = ep.numero === saga.nbEpisodes;
  const p = [];
  if (a.recit) {
    p.push(...a.recit);
    storyExtras(saga, ep, b, p);
    return { titre: `Épisode ${ep.numero} : ${a.titre}`, monde: `${a.theme.emoji} ${a.theme.nom} · joué en direct`, paragraphes: p };
  }
  if (ep.numero === 1) p.push(def.intro);
  (a.intro.avant || []).forEach((t) => { if (t !== def.intro) p.push(t); });
  p.push(a.intro.texte);
  a.scenes.forEach((s, i) => {
    const r = b.scenes[i] || {};
    if (s.type === "rencontre") {
      const d = s.defis[0];
      p.push(r.res === "non"
        ? `📍 ${s.lieu.nom} : ${d.texte} Les héros ont préféré continuer leur route.`
        : `📍 ${s.lieu.nom} : ${d.texte} ${r.res === "oops" ? d.rate : d.reussite}`);
    } else {
      const d = s.defis[r.chemin === 2 ? 1 : 0];
      p.push(`📍 ${s.lieu.nom} : ${d.texte} ${r.res === "oops" ? d.rate : d.reussite}`);
    }
  });
  if (a.rebondissement) {
    let t = `⚡ ${a.rebondissement}`;
    if (a.rivalRetour) t += b.rival === "ami" ? ` Mais cette fois, ${nomMilieu(a.rivalRetour)} et les héros sont devenus amis !` : " Mais les héros lui ont encore échappé.";
    p.push(t);
  }
  const m = a.finale.mechant;
  p.push(`🏁 ${a.finale.lieu.nom} : les héros ont retrouvé ${nomMilieu(m.nom)}. Leur idée : ${low(m.solutions[b.finale] || "")} ${finaleSentence(m, b.finale, final)}`);
  p.push(`🎁 ${cap(a.tresor)}.`);
  if (!final) p.push(`🧩 ${cap(def.fragment)}, avec un indice : ${def.indices[(ep.numero - 1) % def.indices.length]}`);
  else p.push(`🌟 ${cap(def.artefact)} brille à nouveau. Fin de la saga !`);
  storyExtras(saga, ep, b, p);
  return { titre: `Épisode ${ep.numero} : ${a.titre}`, monde: `${a.theme.emoji} ${a.theme.nom}`, paragraphes: p };
}

function storyExtras(saga, ep, b, p) {
  saga.exploits.filter((e) => e.episode === ep.numero).forEach((e) => p.push(`⭐ ${e.hero} : ${e.texte}`));
  const inv = saga.inventions.filter((e) => e.episode === ep.numero).map((e) => e.texte);
  if (inv.length) p.push(`✨ Inventé par les enfants : ${inv.join(" ; ")}`);
  if (b.notes) p.push(`📝 ${b.notes}`);
}

/* ---------------- Épisode joué en direct ---------------- */
function sagaLiveContext(saga) {
  const def = sagaDef(saga);
  const n = saga.episodes.length + 1;
  const total = saga.nbEpisodes;
  const final = n === total;
  const themeId = saga.route[(n - 1) % saga.route.length];
  const theme = THEMES.find((t) => t.id === themeId);
  const rng = makeRng(saga.seed + n * 2027);
  const monde = `« ${theme.nom} »`;
  const ctx = {
    sagaId: saga.id, numero: n, total, final, themeId,
    heroes: saga.heroes,
    allies: saga.allies.map((x) => x.nom),
    sac: saga.sac.slice(),
    reputation: saga.reputation || 0,
    inventions: saga.inventions.map((x) => x.texte),
    recap: n > 1 ? buildRecap(saga) : null,
    gmExtra: [`📚 Le secret de la saga : le Grand Méchant est ${def.grandMechant.nom}. En vrai, ${def.grandMechant.raison}.`],
  };
  if (n === 1) {
    ctx.introAvant = [def.intro].concat(saga.mode === "voyage" ? [`Votre voyage commence dans le monde de ${monde}.`] : []);
  } else if (!final) {
    ctx.introAvant = [saga.mode === "voyage"
      ? `Votre quête pour réparer ${def.artefact} vous mène cette fois dans le monde de ${monde} !`
      : `Votre quête continue : il faut encore trouver de quoi réparer ${def.artefact}.`];
    if (saga.allies.length && rng() < 0.5) ctx.ami = pick(rng, saga.allies);
    if (saga.rivaux.length && rng() < 0.6) ctx.rival = pick(rng, saga.rivaux).nom;
  }
  if (final) {
    ctx.titre = `${def.titre} : la grande fin`;
    ctx.introAvant = [`Grâce à tous les indices, vous savez enfin qui est derrière tout ça ! Vous avez tous les morceaux : il ne reste qu'à rejoindre ${nomMilieu(def.finaleLieu.nom)}.`];
    ctx.introTexte = `Mais pour y arriver, il faut d'abord traverser le monde de ${monde}. Ce sera votre plus grande aventure !`;
    ctx.mechant = def.grandMechant;
    ctx.finaleLieu = def.finaleLieu;
    ctx.tresor = "le titre de Héros Légendaires, et une fête immense en leur honneur";
    ctx.fin = [`Tous les morceaux se rassemblent dans un grand éclair de lumière : ${def.artefact} brille à nouveau !`,
      "C'est la fin de la saga. Vous êtes maintenant des héros légendaires, et on racontera votre histoire pendant très, très longtemps."];
  } else {
    ctx.gmExtra.push(`🧩 À la fin, les héros trouvent ${def.fragment} (${n} sur ${total - 1}) et un indice sur le Grand Méchant.`);
    ctx.fin = [`Et ce n'est pas tout : au milieu du trésor, vous trouvez ${def.fragment} ! (${n} sur ${total - 1})`,
      `Indice : ${def.indices[(n - 1) % def.indices.length]}`,
      n === total - 1 ? "Vous avez tous les morceaux ! Avec les indices, vous comprenez enfin où aller… La suite au prochain épisode !"
        : "Mais qui a bien pu faire ça ? La suite au prochain épisode !"];
  }
  return ctx;
}

function finishLiveSaga(st, extras) {
  const store = loadSagaStore();
  const saga = store.sagas.find((x) => x.id === st.ctx.sagaId);
  if (!saga) { clearLive(); renderSaga(); return; }
  const theme = THEMES.find((t) => t.id === st.themeId);
  const a = {
    titre: st.titre,
    theme: st.themeId,
    length: st.lengthId,
    code: `direct-${st.seed}`,
    intro: { ambiance: theme.ambiance, avant: st.ctx.introAvant || [], texte: st.introLignes[st.introLignes.length - 2], appel: st.introLignes[st.introLignes.length - 1] },
    compagnon: st.compagnon,
    scenes: st.record.scenes.map((r, i) => ({ numero: i + 1, type: r.type, lieu: r.lieu, defis: [r.defi], difficulte: r.difficulte, question: "Qu'est-ce que vos héros font ?" })),
    rebondissement: st.record.rival ? `Revoilà ${nomMilieu(st.ctx.rival)} !` : null,
    rivalRetour: st.record.rival ? st.ctx.rival : undefined,
    finale: { lieu: st.finaleLieu, mechant: st.mechant, difficulte: 4 },
    tresor: st.tresor,
    saga: { titre: saga.titre, numero: st.ctx.numero, total: st.ctx.total },
    heroes: saga.heroes,
    fin: st.ctx.fin,
    recit: st.log.filter((e) => e.cls !== "recap").flatMap((e) => (e.photo ? [`[[photo:${e.photo}]]`] : [e.titre].concat(e.lignes))),
  };
  const bilan = {
    scenes: st.record.scenes.map((r) => ({ chemin: 1, res: r.res })),
    rival: st.record.rival,
    finale: st.record.finale || "coeur",
    exploits: extras.exploits,
    inventions: extras.inventions,
    objets: extras.objets,
    notes: extras.notes,
  };
  a.scenes.forEach((sc) => { saga.used.textes.push(sc.defis[0].texte); saga.used.lieux.push(sc.lieu.nom); });
  saga.used.mechants.push(st.mechant.nom);
  saga.used.problemes.push(st.titre);
  saga.reputation = st.reputation || 0;
  const ep = { numero: st.ctx.numero, themeId: st.themeId, adventure: a, bilan: null, live: true };
  saga.episodes.push(ep);
  applyBilan(saga, ep, bilan);
  updateSaga(saga);
  clearLive();
  sagaView = "episode";
  renderSaga();
  window.scrollTo({ top: sagaRoot().offsetTop - 80, behavior: "smooth" });
}

/* ==========================================================
   Interface
   ========================================================== */
let sagaView = "episode";

function sagaRoot() { return document.getElementById("saga-root"); }

function renderSaga() {
  const store = loadSagaStore();
  const saga = currentSaga(store);
  sagaRoot().innerHTML = saga ? renderSagaView(saga, store) : renderSagaCreate(store);
  if (saga) {
    const ep = saga.episodes[saga.episodes.length - 1];
    if (ep && !ep.bilan) setAleasTheme(ep.themeId);
  }
}

function choiceButtons(items, selected, sub) {
  return items.map((it) => `
    <button type="button" class="choice${it.id === selected ? " selected" : ""}" data-value="${it.id}">
      <span class="choice-emoji">${it.emoji}</span>${escapeHtml(it.nom)}
      ${sub ? `<small>${escapeHtml(sub(it))}</small>` : ""}
    </button>`).join("");
}

function renderSagaCreate(store) {
  const heroes = loadHeroes();
  const sagaItems = SAGAS.map((d, i) => ({ id: d.id, nom: d.titre, emoji: ["🧭", "📖", "👑", "💭"][i] || "📚" }))
    .concat([{ id: "surprise", nom: "Surprise !", emoji: "🎁" }]);
  const existing = store.sagas.length ? `
    <h2>Nos sagas</h2>
    <div class="saga-list">${store.sagas.map((s) => `
      <div class="saga-item">
        <div><strong>${escapeHtml(s.titre)}</strong><br>
          <small>${s.terminee ? "✅ Terminée" : `Épisode ${s.episodes.length} sur ${s.nbEpisodes}`} · ${escapeHtml(s.heroes.map((h) => h.name).join(", ") || "sans héros")}</small></div>
        <button class="btn btn-small" data-action="open" data-id="${s.id}">Ouvrir</button>
      </div>`).join("")}</div>` : "";

  return `
    ${existing}
    <h2>Commencer une nouvelle saga</h2>
    <form id="saga-create" class="saga-create">
      <div class="form-step">
        <span class="label">1. L'histoire</span>
        <div class="choice-grid" data-field="sagaId">${choiceButtons(sagaItems, "surprise")}</div>
        <p class="hint">Chaque saga cache un Grand Méchant (jamais vraiment méchant) que les héros découvrent petit à petit, grâce aux indices.</p>
      </div>
      <div class="form-step">
        <span class="label">2. Où se passe l'aventure ?</span>
        <div class="choice-grid choice-grid-3" data-field="mode">
          ${choiceButtons([
            { id: "voyage", nom: "Voyage à travers les mondes", emoji: "🌍" },
            { id: "monde", nom: "Un seul monde", emoji: "📍" },
          ], "voyage", (m) => (m.id === "voyage" ? "un monde différent à chaque épisode" : "tous les épisodes au même endroit"))}
        </div>
        <div class="saga-theme" hidden>
          <p class="hint">Quel monde ?</p>
          <div class="choice-grid" data-field="themeId">${choiceButtons(THEMES, THEMES[0].id)}</div>
        </div>
      </div>
      <div class="form-step">
        <span class="label">3. Combien d'épisodes ?</span>
        <div class="choice-grid choice-grid-3" data-field="nbEpisodes">
          ${choiceButtons([
            { id: "3", nom: "3 épisodes", emoji: "📗" },
            { id: "5", nom: "5 épisodes", emoji: "📚" },
          ], "3", (x) => (x.id === "3" ? "pour commencer" : "une grande aventure"))}
        </div>
      </div>
      <div class="form-step">
        <span class="label">4. Durée d'un épisode</span>
        <div class="choice-grid choice-grid-3" data-field="lengthId">${choiceButtons(LENGTHS, "courte", (l) => l.desc)}</div>
      </div>
      <div class="form-step">
        <span class="label">5. Les héros de la saga</span>
        ${heroes.length ? `<div class="hero-checks">${heroes.map((h) => {
          const type = HERO_TYPES.find((t) => t.id === h.type) || HERO_TYPES[0];
          return `<label class="hero-check"><input type="checkbox" name="hero" value="${h.id}" checked> ${type.emoji} ${escapeHtml(h.name)}</label>`;
        }).join("")}</div>` : `<p class="hint">Aucun héros pour l'instant. <a href="#heros">Créez d'abord les héros</a> pour pouvoir noter leurs exploits dans la saga.</p>`}
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-ghost" data-action="paste-import">📋 Coller une sauvegarde</button>
        <label class="btn btn-ghost import-label">📂 Charger un fichier<input type="file" accept=".json,application/json" data-action="import" hidden></label>
        <button type="submit" class="btn btn-big">🚀 Commencer la saga</button>
      </div>
    </form>`;
}

function renderCarnet(saga) {
  const list = (items, kind, fmt) => items.length
    ? `<ul class="carnet-list">${items.map((x, i) => `<li>${fmt(x)} <button class="x" title="Retirer" data-action="remove" data-kind="${kind}" data-index="${i}">✕</button></li>`).join("")}</ul>`
    : `<p class="hint">Rien pour l'instant.</p>`;
  const add = (kind, placeholder) => `
    <form class="carnet-add" data-kind="${kind}">
      <input type="text" maxlength="80" placeholder="${placeholder}">
      <button class="btn btn-small" type="submit">Ajouter</button>
    </form>`;
  const exploitsByHero = {};
  saga.exploits.forEach((e) => { (exploitsByHero[e.hero] = exploitsByHero[e.hero] || []).push(e); });

  return `
    <div class="carnet">
      <div class="carnet-box"><h3>🤝 Nos amis</h3>
        ${list(saga.allies, "allies", (x) => `${escapeHtml(cap(x.nom))} <small>(épisode ${x.episode})</small>`)}
        ${add("allies", "Ajouter un ami…")}</div>
      <div class="carnet-box"><h3>😈 Nos rivaux</h3>
        ${list(saga.rivaux, "rivaux", (x) => `${escapeHtml(cap(x.nom))} <small>(épisode ${x.episode})</small>`)}
        <p class="hint">Ils peuvent revenir… et devenir des amis !</p></div>
      <div class="carnet-box"><h3>🎒 Notre sac</h3>
        ${list(saga.sac, "sac", (x) => escapeHtml(cap(x)))}
        ${add("sac", "Ajouter un objet…")}</div>
      <div class="carnet-box"><h3>✨ Inventé par les enfants</h3>
        ${list(saga.inventions, "inventions", (x) => escapeHtml(x.texte))}
        ${add("inventions", "Un personnage, un lieu, une idée…")}
        <p class="hint">Ces idées reviendront dans les prochains épisodes.</p></div>
      <div class="carnet-box carnet-wide"><h3>⭐ Le livre des exploits</h3>
        ${Object.keys(exploitsByHero).length ? Object.entries(exploitsByHero).map(([hero, list]) => `
          <p><strong>${escapeHtml(hero)}</strong></p>
          <ul>${list.map((e) => `<li>${escapeHtml(e.texte)} <small>(épisode ${e.episode})</small></li>`).join("")}</ul>`).join("")
          : `<p class="hint">Les exploits notés dans les bilans apparaîtront ici.</p>`}
      </div>
    </div>`;
}

function renderLivre(saga) {
  const done = saga.episodes.filter((e) => e.bilan);
  if (!done.length) return `<p class="empty">Le livre se remplira après le premier épisode, quand vous aurez fait le bilan.</p>`;
  return `
    <div class="print-actions no-print"><button class="btn print-btn" onclick="window.print()">🖨️ Imprimer le livre</button></div>
    <article class="livre">
      <h2>📖 ${escapeHtml(saga.titre)}</h2>
      <p class="livre-heroes">Avec ${escapeHtml(joinNames(saga.heroes.map((h) => h.name)) || "nos héros")}</p>
      ${done.map((ep) => {
        const st = episodeStory(saga, ep);
        return `<section class="livre-ep"><h3>${escapeHtml(st.titre)}</h3><p class="livre-monde">${escapeHtml(st.monde)}</p>
          ${st.paragraphes.map((t) => (t.startsWith("[[photo:") ? photoHTML(t.slice(8, -2), "") : `<p>${escapeHtml(t)}</p>`)).join("")}</section>`;
      }).join("")}
      ${saga.terminee ? `<p class="livre-fin">~ Fin ~</p>` : `<p class="livre-fin">… à suivre !</p>`}
    </article>`;
}

function renderBilan(saga, ep) {
  const a = hydrateAdventure(ep.adventure);
  const final = ep.numero === saga.nbEpisodes;
  const radio = (name, opts, checked) => `<div class="radio-row">${opts.map(([v, label]) => `
    <label class="radio-pill"><input type="radio" name="${name}" value="${v}"${v === checked ? " checked" : ""}> ${label}</label>`).join("")}</div>`;

  const scenes = a.scenes.map((s, i) => s.type === "rencontre" ? `
    <div class="bilan-row"><strong>${s.numero}. ${escapeHtml(s.lieu.nom)}</strong> <small>(${escapeHtml(cap(s.defis[0].pnj || "rencontre"))})</small>
      ${radio(`s${i}-res`, [["ok", "✅ Aidé"], ["oops", "🌀 Aidé, mais…"], ["non", "🚶 Pas aidé"]], "ok")}</div>` : `
    <div class="bilan-row"><strong>${s.numero}. ${escapeHtml(s.lieu.nom)}</strong>
      ${s.defis.length > 1 ? radio(`s${i}-chemin`, [["1", "⬅️ Chemin 1"], ["2", "➡️ Chemin 2"]], "1") : ""}
      ${radio(`s${i}-res`, [["ok", "✅ Réussi"], ["oops", "🌀 Oui, mais…"]], "ok")}</div>`).join("");

  return `
    <form id="saga-bilan" class="bilan no-print">
      <h2>📝 Bilan de l'épisode ${ep.numero}</h2>
      <p class="hint">À remplir juste après la partie (2 minutes). C'est ce qui fait évoluer l'histoire : les amis reviendront, les rivaux aussi, et les idées des enfants seront réutilisées.</p>
      <div class="form-step">${scenes}
        ${a.rivalRetour ? `<div class="bilan-row"><strong>⚡ Le retour ${escapeHtml(deNom(a.rivalRetour))}</strong>
          ${radio("rival", [["ami", "🤝 Devenu ami"], ["enfui", "💨 Encore échappé"]], "enfui")}</div>` : ""}
        <div class="bilan-row"><strong>🏁 Comment les héros ont-ils réglé la fin avec ${escapeHtml(nomMilieu(a.finale.mechant.nom))} ?</strong>
          ${radio("finale", [["coeur", "❤️ Avec le cœur"], ["malin", "🧠 Avec une ruse"], ["force", "💪 Avec la force"]], "coeur")}
          <p class="hint">${final ? "C'est la grande fin !" : "Avec le cœur, il devient un ami. Sinon, il devient un rival… qui pourra revenir !"}</p></div>
      </div>
      ${saga.heroes.length ? `<div class="form-step"><span class="label">⭐ L'exploit de chaque héros</span>
        ${saga.heroes.map((h, i) => `<label class="small-label" for="ex-${i}">${escapeHtml(h.name)}</label>
          <input type="text" id="ex-${i}" data-hero="${escapeHtml(h.name)}" class="exploit" maxlength="120" placeholder="Ex. : a consolé le petit lapin, a sauté par-dessus le ravin…">`).join("")}</div>` : ""}
      <div class="form-step">
        <label for="bilan-inventions">✨ Ce que les enfants ont inventé (un par ligne)</label>
        <textarea id="bilan-inventions" rows="2" placeholder="Ex. : Croquette, un chat volant qui adore les crêpes"></textarea>
        <label for="bilan-objets" class="small-label">🎒 Objets trouvés en route (un par ligne)</label>
        <textarea id="bilan-objets" rows="2" placeholder="Ex. : une clé rouillée"></textarea>
        <label for="bilan-notes" class="small-label">📝 Autre chose à retenir ?</label>
        <textarea id="bilan-notes" rows="2" placeholder="Ex. : Léo a adoré le crocodile, à refaire !"></textarea>
      </div>
      <div class="form-actions"><button type="submit" class="btn btn-big">✅ Enregistrer le bilan</button></div>
    </form>`;
}

function renderEpisodePanel(saga) {
  const live = loadLive();
  if (live && live.mode === "saga" && live.ctx.sagaId === saga.id) return renderLiveHTML(live);
  const ep = saga.episodes[saga.episodes.length - 1];
  if (!ep) {
    return `<div class="saga-next"><p>Tout est prêt ! Préparez le premier épisode, lisez-le une fois, puis jouez.</p>
      ${nextButtons(1, saga)}</div>`;
  }
  if (!ep.bilan) {
    return `<div class="print-actions no-print"><button class="btn btn-ghost print-btn" onclick="window.print()">🖨️ Imprimer l'épisode</button></div>
      ${renderAdventure(hydrateAdventure(ep.adventure))}
      ${renderBilan(saga, ep)}`;
  }
  if (saga.terminee) {
    return `<div class="saga-next saga-done"><div class="big-emoji">🏆</div>
      <h2>La saga est terminée !</h2>
      <p>Bravo à ${escapeHtml(joinNames(saga.heroes.map((h) => h.name)) || "tous les héros")}. Relisez le <strong>Livre de la Saga</strong> ensemble, ou imprimez-le en souvenir.</p>
      <button class="btn btn-big" data-action="view" data-view="livre">📖 Lire le Livre de la Saga</button></div>`;
  }
  const n = saga.episodes.length + 1;
  return `<div class="saga-next">
    <p>L'épisode ${n - 1} est terminé et noté dans le Livre. 🎉</p>
    <p class="hint">Le prochain épisode tiendra compte de tout ce qui s'est passé : vos amis, vos rivaux, votre sac et les idées des enfants.</p>
    ${nextButtons(n, saga)}
    <p><button class="btn btn-small btn-ghost" data-action="redo-bilan">✏️ Corriger le bilan de l'épisode ${n - 1}</button></p></div>`;
}

function nextButtons(n, saga) {
  return `<div class="form-actions">
      <button class="btn btn-big btn-live" data-action="live">▶️ Jouer l'épisode ${n} en direct</button>
      <button class="btn btn-big btn-ghost" data-action="next">📄 Préparer l'épisode ${n} à lire</button>
    </div>
    <p class="hint"><strong>En direct</strong> : l'histoire se construit pendant la partie selon les choix et les dés, et le bilan se remplit tout seul.
      <strong>À lire</strong> : tout l'épisode est préparé à l'avance${n === saga.nbEpisodes ? "" : ""}, avec un bilan à remplir après.</p>
    ${n === saga.nbEpisodes ? "<p><strong>🏆 C'est la grande fin !</strong></p>" : ""}`;
}

function renderSagaView(saga, store) {
  const def = sagaDef(saga);
  const pieces = Array.from({ length: saga.nbEpisodes - 1 }, (_, i) =>
    `<span class="piece${i < saga.fragments ? " got" : ""}">🧩</span>`).join("");
  const others = store.sagas.length > 1 ? `
    <select data-action="switch" aria-label="Changer de saga">${store.sagas.map((s) =>
      `<option value="${s.id}"${s.id === saga.id ? " selected" : ""}>${escapeHtml(s.titre)}</option>`).join("")}</select>` : "";
  const views = [["episode", "🎬 Épisode"], ["livre", "📖 Le Livre"], ["carnet", "🎒 Carnet"]];
  let body = "";
  if (sagaView === "livre") body = renderLivre(saga);
  else if (sagaView === "carnet") body = renderCarnet(saga);
  else body = renderEpisodePanel(saga);

  return `
    <div class="saga-header">
      <div>
        <p class="adv-world">${saga.mode === "voyage" ? "🌍 Voyage à travers les mondes" : `📍 ${escapeHtml(THEMES.find((t) => t.id === saga.route[0]).nom)}`}</p>
        <h2>${escapeHtml(saga.titre)}</h2>
        <p class="saga-progress">${pieces} <small>${saga.fragments} sur ${saga.nbEpisodes - 1} morceaux · épisode ${Math.max(1, saga.episodes.length)} sur ${saga.nbEpisodes}</small></p>
        <p class="hint">Objectif : réparer ${escapeHtml(def.artefact)}. Héros : ${escapeHtml(saga.heroes.map((h) => h.name).join(", ") || "—")}</p>
      </div>
      <div class="saga-tools no-print">
        ${others}
        <button class="btn btn-small btn-ghost" data-action="export">💾 Sauvegarder</button>
        <button class="btn btn-small btn-ghost" data-action="new">➕ Nouvelle saga</button>
        <button class="btn btn-small btn-danger" data-action="delete">🗑️</button>
      </div>
    </div>
    <nav class="subtabs no-print">${views.map(([id, label]) =>
      `<button class="subtab${id === sagaView ? " active" : ""}" data-action="view" data-view="${id}">${label}</button>`).join("")}</nav>
    ${body}`;
}

/* ---------------- Événements ---------------- */
function readCreateForm(form) {
  const get = (f) => {
    const el = form.querySelector(`[data-field="${f}"] .choice.selected`);
    return el ? el.dataset.value : null;
  };
  const heroIds = [...form.querySelectorAll('input[name="hero"]:checked')].map((i) => i.value);
  const heroes = loadHeroes().filter((h) => heroIds.includes(h.id));
  const sagaId = get("sagaId");
  return {
    sagaId: sagaId === "surprise" ? null : sagaId,
    mode: get("mode"),
    themeId: get("themeId"),
    nbEpisodes: parseInt(get("nbEpisodes"), 10),
    lengthId: get("lengthId"),
    heroes,
  };
}

function readBilanForm(form, saga) {
  const ep = saga.episodes[saga.episodes.length - 1];
  const a = hydrateAdventure(ep.adventure);
  const val = (name) => { const el = form.querySelector(`input[name="${name}"]:checked`); return el ? el.value : null; };
  const lines = (id) => form.querySelector(id).value.split("\n").map((l) => l.trim()).filter(Boolean);
  const exploits = {};
  form.querySelectorAll(".exploit").forEach((el) => { exploits[el.dataset.hero] = el.value.trim(); });
  return {
    scenes: a.scenes.map((s, i) => ({ chemin: parseInt(val(`s${i}-chemin`), 10) || 1, res: val(`s${i}-res`) || "ok" })),
    rival: val("rival"),
    finale: val("finale") || "coeur",
    exploits,
    inventions: lines("#bilan-inventions"),
    objets: lines("#bilan-objets"),
    notes: form.querySelector("#bilan-notes").value.trim(),
  };
}

// Annule les effets d'un bilan en rejouant tous les bilans précédents
function rebuildSagaState(saga, skipLast) {
  const fresh = { ...saga, allies: [], rivaux: [], sac: [], inventions: [], exploits: [], fragments: 0, terminee: false };
  const manual = saga.manuel || { allies: [], sac: [], inventions: [] };
  fresh.episodes = saga.episodes.map((e) => ({ ...e }));
  fresh.episodes.forEach((ep, i) => {
    const isLast = i === fresh.episodes.length - 1;
    if (ep.bilan && !(skipLast && isLast)) applyBilan(fresh, ep, ep.bilan);
    else if (skipLast && isLast) ep.bilan = null;
  });
  fresh.allies.push(...manual.allies);
  fresh.sac.push(...manual.sac);
  fresh.inventions.push(...manual.inventions);
  return fresh;
}

function downloadSaga(saga) {
  const blob = new Blob([JSON.stringify(saga, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `saga-${saga.titre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-")}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function importSagaText(text) {
  try {
    const saga = JSON.parse(text);
    if (!saga || !Array.isArray(saga.episodes) || !saga.sagaId) throw new Error("format");
    const store = loadSagaStore();
    if (store.sagas.some((s) => s.id === saga.id)) saga.id = `saga-${Date.now().toString(36)}`;
    store.sagas.push(saga);
    store.currentId = saga.id;
    saveSagaStore(store);
    sagaView = "episode";
    renderSaga();
    return true;
  } catch {
    notify("Ce texte ne ressemble pas à une sauvegarde de saga des Petits Héros. Vérifiez qu'il a été copié en entier.");
    return false;
  }
}

// Sauvegarde : fichier quand c'est possible, sinon texte à copier
function exportSaga(saga) {
  const text = JSON.stringify(saga);
  const box = showModal(`<h3>💾 Sauvegarder la saga</h3>
    <p>Copiez ce texte et gardez-le (dans une note, un e-mail à vous-même…). Pour retrouver la saga sur un autre appareil : onglet Saga → « Nouvelle saga » → « Coller une sauvegarde ».</p>
    <textarea id="export-text" rows="6" readonly></textarea>
    <div class="form-actions">
      ${IS_FRAMED ? "" : '<button class="btn btn-ghost" data-m="file">📁 Télécharger un fichier</button>'}
      <button class="btn btn-ghost" data-m="close">Fermer</button>
      <button class="btn" data-m="copy">📋 Copier</button>
    </div>`);
  const ta = box.querySelector("#export-text");
  ta.value = text;
  box.querySelector("[data-m=copy]").addEventListener("click", async (e) => {
    try { await navigator.clipboard.writeText(text); e.target.textContent = "✅ Copié !"; }
    catch { ta.focus(); ta.select(); e.target.textContent = "Sélectionné : faites Copier"; }
  });
  const file = box.querySelector("[data-m=file]");
  if (file) file.addEventListener("click", () => downloadSaga(saga));
}

function pasteImportModal() {
  const box = showModal(`<h3>📋 Coller une sauvegarde</h3>
    <p>Collez ici le texte copié avec « Sauvegarder ».</p>
    <textarea id="import-text" rows="6"></textarea>
    <div class="form-actions"><button class="btn btn-ghost" data-m="close">Annuler</button>
    <button class="btn" data-m="load">Charger la saga</button></div>`);
  box.querySelector("#import-text").focus();
  box.querySelector("[data-m=load]").addEventListener("click", () => {
    if (importSagaText(box.querySelector("#import-text").value.trim())) box.remove();
  });
}

function initSaga() {
  const root = sagaRoot();

  root.addEventListener("click", (e) => {
    const choice = e.target.closest(".choice");
    if (choice && choice.parentElement.dataset.field) {
      choice.parentElement.querySelectorAll(".choice").forEach((b) => b.classList.remove("selected"));
      choice.classList.add("selected");
      if (choice.parentElement.dataset.field === "mode") {
        root.querySelector(".saga-theme").hidden = choice.dataset.value !== "monde";
      }
      return;
    }
    const btn = e.target.closest("[data-action]");
    if (!btn || btn.tagName === "SELECT" || btn.tagName === "INPUT") return;
    const store = loadSagaStore();
    const saga = currentSaga(store);
    const action = btn.dataset.action;

    if (action === "open") {
      store.currentId = btn.dataset.id;
      saveSagaStore(store);
      sagaView = "episode";
    } else if (action === "new") {
      store.currentId = null;
      saveSagaStore(store);
    } else if (action === "view") {
      sagaView = btn.dataset.view;
    } else if (action === "live" && saga) {
      const ctx = sagaLiveContext(saga);
      saveLive(startLive(ctx.themeId, saga.lengthId, randomSeed(), ctx));
      sagaView = "episode";
    } else if (action === "next" && saga) {
      updateSaga(prepareEpisode(saga));
      sagaView = "episode";
    } else if (action === "redo-bilan" && saga) {
      askConfirm("Corriger le bilan ? Il faudra le remplir à nouveau.", () => {
        updateSaga(rebuildSagaState(saga, true));
        renderSaga();
      }, "Corriger");
      return;
    } else if (action === "export" && saga) {
      exportSaga(saga);
      return;
    } else if (action === "paste-import") {
      pasteImportModal();
      return;
    } else if (action === "delete" && saga) {
      askConfirm(`Supprimer définitivement la saga « ${saga.titre} » ? Pensez à la sauvegarder avant.`, () => {
        const st = loadSagaStore();
        st.sagas = st.sagas.filter((s) => s.id !== saga.id);
        st.currentId = null;
        saveSagaStore(st);
        renderSaga();
      }, "Supprimer");
      return;
    } else if (action === "remove" && saga) {
      const kind = btn.dataset.kind;
      const item = saga[kind][parseInt(btn.dataset.index, 10)];
      saga[kind].splice(parseInt(btn.dataset.index, 10), 1);
      if (saga.manuel && saga.manuel[kind]) {
        saga.manuel[kind] = saga.manuel[kind].filter((x) => JSON.stringify(x) !== JSON.stringify(item));
      }
      updateSaga(saga);
    } else {
      return;
    }
    renderSaga();
    window.scrollTo({ top: root.offsetTop - 80, behavior: "smooth" });
  });

  root.addEventListener("change", (e) => {
    if (e.target.dataset.action === "switch") {
      const store = loadSagaStore();
      store.currentId = e.target.value;
      saveSagaStore(store);
      sagaView = "episode";
      renderSaga();
    }
    if (e.target.dataset.action === "import" && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => importSagaText(reader.result);
      reader.readAsText(e.target.files[0]);
    }
  });

  root.addEventListener("submit", (e) => {
    e.preventDefault();
    const form = e.target;
    if (form.id === "saga-create") {
      updateSaga(createSaga(readCreateForm(form)));
      sagaView = "episode";
    } else if (form.id === "saga-bilan") {
      const saga = currentSaga(loadSagaStore());
      const ep = saga.episodes[saga.episodes.length - 1];
      updateSaga(applyBilan(saga, ep, readBilanForm(form, saga)));
      sagaView = "episode";
    } else if (form.classList.contains("carnet-add")) {
      const value = form.querySelector("input").value.trim();
      if (!value) return;
      const saga = currentSaga(loadSagaStore());
      const kind = form.dataset.kind;
      const n = Math.max(1, saga.episodes.length);
      const item = kind === "sac" ? value : kind === "allies" ? { nom: value, episode: n } : { texte: value, episode: n };
      saga[kind].push(item);
      saga.manuel = saga.manuel || { allies: [], sac: [], inventions: [] };
      saga.manuel[kind].push(item);
      updateSaga(saga);
    } else {
      return;
    }
    renderSaga();
    window.scrollTo({ top: root.offsetTop - 80, behavior: "smooth" });
  });

  // Rafraîchir à l'ouverture de l'onglet (les héros ont pu changer)
  window.addEventListener("hashchange", () => {
    if (location.hash.startsWith("#saga")) renderSaga();
  });
  renderSaga();
}

initSaga();

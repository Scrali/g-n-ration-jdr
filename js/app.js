/* ==========================================================
   Interface du site : onglets, héros, aventures, dés.
   ========================================================== */

const STORAGE_KEY = "petits-heros:heros";

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

function $(sel) { return document.querySelector(sel); }

/* ---------------- Choix (boutons sélectionnables) ---------------- */
function renderChoices(container, items, { selected, sub } = {}) {
  container.innerHTML = items.map((it) => `
    <button type="button" class="choice${it.id === selected ? " selected" : ""}" data-value="${it.id}">
      <span class="choice-emoji">${it.emoji}</span>${escapeHtml(it.nom)}
      ${sub ? `<small>${escapeHtml(sub(it))}</small>` : ""}
    </button>`).join("");
}

function bindChoiceGroup(container, onChange) {
  container.addEventListener("click", (e) => {
    const btn = e.target.closest(".choice");
    if (!btn) return;
    container.querySelectorAll(".choice").forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
    if (onChange) onChange(btn.dataset.value);
  });
}

function selectedValue(container) {
  const btn = container.querySelector(".choice.selected");
  return btn ? btn.dataset.value : null;
}

function setSelected(container, value) {
  container.querySelectorAll(".choice").forEach((b) =>
    b.classList.toggle("selected", b.dataset.value === String(value)));
}

/* ---------------- Onglets ---------------- */
const TAB_IDS = ["accueil", "regles", "heros", "aventure"];

function showTab(id) {
  if (!TAB_IDS.includes(id)) id = "accueil";
  document.querySelectorAll(".panel").forEach((p) => p.classList.toggle("active", p.id === id));
  document.querySelectorAll(".tabs a").forEach((a) => a.classList.toggle("active", a.dataset.tab === id));
}

function handleHash() {
  const parts = location.hash.replace(/^#/, "").split("/");
  const tab = parts[0] || "accueil";
  showTab(tab);
  if (tab === "aventure" && parts.length === 4) {
    const [, themeId, lengthId, seed] = parts;
    const seedNum = parseInt(seed, 10);
    if (THEMES.some((t) => t.id === themeId) && LENGTHS.some((l) => l.id === lengthId) && seedNum) {
      setSelected($("#theme-choices"), themeId);
      setSelected($("#length-choices"), lengthId);
      showAdventure(generateAdventure(themeId, lengthId, seedNum));
    }
  }
  window.scrollTo(0, 0);
}

/* ---------------- Héros ---------------- */
function loadHeroes() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

function saveHeroes(list) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch { /* stockage indisponible */ }
}

function heroCard(h) {
  const type = HERO_TYPES.find((t) => t.id === h.type) || HERO_TYPES[0];
  const power = POWERS.find((p) => p.id === h.power) || POWERS[0];
  const talents = Object.entries(TALENTS).map(([id, t]) => `
    <li class="${id === h.talent ? "super" : ""}">
      <span class="t-icon">${t.emoji}</span>
      <span><strong>${t.nom}</strong>${id === h.talent ? " ⭐ <em>2 dés</em>" : " <em>1 dé</em>"}<br><small>${t.desc}</small></span>
    </li>`).join("");
  return `
    <article class="hero-card">
      <header>
        <div class="hero-type">${type.emoji}</div>
        <div>
          <h3>${escapeHtml(h.name)}</h3>
          <p class="hero-sub">${escapeHtml(type.nom)}${h.player ? ` · joué par ${escapeHtml(h.player)}` : ""}</p>
        </div>
      </header>
      <div class="hero-body">
        <div class="hero-drawing">Dessine ton héros ici !</div>
        <div class="hero-stats">
          <ul class="talents">${talents}</ul>
          <p><strong>${power.emoji} Pouvoir magique :</strong> ${escapeHtml(power.nom)} <small>(1 fois par aventure)</small></p>
          ${h.item ? `<p><strong>🎒 Objet :</strong> ${escapeHtml(h.item)}</p>` : ""}
          <div class="tokens">
            <div><strong>Cœurs</strong><div class="boxes">❤️ ❤️ ❤️</div></div>
            <div><strong>Étoiles</strong><div class="boxes">☆ ☆ ☆ ☆ ☆</div></div>
          </div>
        </div>
      </div>
      <button class="btn btn-small btn-danger no-print" data-delete="${h.id}">🗑️ Supprimer</button>
    </article>`;
}

function renderHeroes() {
  const list = loadHeroes();
  const el = $("#hero-list");
  el.innerHTML = list.length
    ? list.map(heroCard).join("")
    : `<p class="empty">Aucun héros pour l'instant. Créez-en un avec le formulaire ci-dessus !</p>`;
  $("#print-heroes").hidden = list.length === 0;
}

function initHeroes() {
  renderChoices($("#hero-types"), HERO_TYPES, { selected: HERO_TYPES[0].id });
  renderChoices($("#hero-talents"), Object.entries(TALENTS).map(([id, t]) => ({ id, ...t })),
    { selected: "force", sub: (t) => t.desc });
  renderChoices($("#hero-powers"), POWERS, { selected: POWERS[0].id });
  ["#hero-types", "#hero-talents", "#hero-powers"].forEach((s) => bindChoiceGroup($(s)));

  $("#hero-random").addEventListener("click", () => {
    const r = (list) => list[Math.floor(Math.random() * list.length)];
    $("#hero-name").value = r(HERO_NAMES);
    $("#hero-item").value = r(ITEMS);
    setSelected($("#hero-types"), r(HERO_TYPES).id);
    setSelected($("#hero-talents"), r(Object.keys(TALENTS)));
    setSelected($("#hero-powers"), r(POWERS).id);
  });

  $("#hero-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("#hero-name").value.trim();
    if (!name) return;
    const list = loadHeroes();
    list.push({
      id: Date.now().toString(36),
      name,
      player: $("#hero-player").value.trim(),
      type: selectedValue($("#hero-types")),
      talent: selectedValue($("#hero-talents")),
      power: selectedValue($("#hero-powers")),
      item: $("#hero-item").value.trim(),
    });
    saveHeroes(list);
    e.target.reset();
    renderHeroes();
    $("#hero-list").lastElementChild.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  $("#hero-list").addEventListener("click", (e) => {
    const id = e.target.dataset.delete;
    if (!id) return;
    const hero = loadHeroes().find((h) => h.id === id);
    if (hero && confirm(`Supprimer ${hero.name} ?`)) {
      saveHeroes(loadHeroes().filter((h) => h.id !== id));
      renderHeroes();
    }
  });

  $("#print-heroes").addEventListener("click", () => window.print());
  renderHeroes();
}

/* ---------------- Aventure ---------------- */
const SEUILS = {
  3: { ok: "3, 4, 5, 6", rate: "1, 2" },
  4: { ok: "4, 5, 6", rate: "1, 2, 3" },
  5: { ok: "5, 6", rate: "1, 2, 3, 4" },
};

function talentBadge(id) {
  const t = TALENTS[id];
  return `<span class="badge badge-${id}">${t.emoji} ${t.nom}</span>`;
}

function diffBadge(n) {
  const d = DIFFICULTES[n];
  return `<span class="badge badge-diff">🎲 ${d.nom} : ${d.texte}</span>`;
}

function renderAdventure(a) {
  const m = a.finale.mechant;
  const heroes = loadHeroes();

  const challenge = (defi, difficulte, titre) => `
    <div class="challenge">
      <div class="challenge-head">
        <strong>${titre}</strong> ${talentBadge(defi.talent)} ${diffBadge(difficulte)}
      </div>
      <div class="read-aloud compact">${escapeHtml(defi.texte)}</div>
      <div class="outcomes">
        <div class="outcome ok"><strong>✅ ${SEUILS[difficulte].ok} : ça marche</strong><p>${escapeHtml(defi.reussite)}</p></div>
        <div class="outcome oops"><strong>🌀 ${SEUILS[difficulte].rate} : oui, mais…</strong><p>${escapeHtml(defi.rate)}</p></div>
      </div>
    </div>`;

  const scenes = a.scenes.map((s) => {
    if (s.type === "rencontre") {
      return `
    <section class="scene">
      <h3><span class="scene-num">${s.numero}</span> ${escapeHtml(s.lieu.nom)}</h3>
      <div class="read-aloud"><span class="label-small">📖 À lire</span>${escapeHtml(s.lieu.description)}</div>
      <p class="question">💬 <em>Demandez aux enfants : « ${escapeHtml(s.question)} »</em></p>
      ${challenge(s.defis[0], s.difficulte, "🤝 Rencontre")}
      <p class="hint">Les enfants peuvent aussi choisir de ne pas aider… Dans ce cas, pas d'indice : ils devront le trouver plus tard (tirez un 💡 Coup de pouce).</p>
    </section>`;
    }
    const [g, d] = s.defis;
    return `
    <section class="scene">
      <h3><span class="scene-num">${s.numero}</span> ${escapeHtml(s.lieu.nom)}</h3>
      <div class="read-aloud"><span class="label-small">📖 À lire</span>${escapeHtml(s.lieu.description)}
        Pour continuer, il y a deux chemins possibles…</div>
      <p class="question">🔀 <em>Décrivez les deux chemins, puis demandez : « Quel chemin choisissez-vous ? » (On peut voter !)</em></p>
      <div class="paths">
        ${challenge(g, s.difficulte, "⬅️ Chemin 1")}
        ${challenge(d, s.difficulte, "➡️ Chemin 2")}
      </div>
      <p class="hint">Le talent indiqué est un conseil : si un enfant a une autre bonne idée, il lance avec son talent à lui.</p>
    </section>`;
  }).join("");

  const rebond = a.rebondissement ? `
    <section class="scene twist">
      <h3><span class="scene-num">!</span> Rebondissement</h3>
      <div class="read-aloud"><span class="label-small">📖 À lire</span>${escapeHtml(a.rebondissement)}</div>
      <p class="hint">À placer quand vous voulez (souvent juste avant la fin). Laissez les enfants trouver une solution, puis faites lancer un dé si besoin.</p>
    </section>` : "";

  const solutions = Object.entries(m.solutions).map(([t, txt]) => `
    <li>${talentBadge(t)} ${escapeHtml(txt)}</li>`).join("");

  const heroList = heroes.length ? `
    <p><strong>Héros de l'équipe :</strong> ${heroes.map((h) => {
      const type = HERO_TYPES.find((t) => t.id === h.type) || HERO_TYPES[0];
      return `${type.emoji} ${escapeHtml(h.name)} (${TALENTS[h.talent].emoji}⭐)`;
    }).join(" · ")}</p>` : "";

  return `
    <article class="adventure theme-${a.theme.id}">
      <header class="adv-header">
        <div class="adv-emoji">${a.theme.emoji}</div>
        <div>
          <p class="adv-world">${escapeHtml(a.theme.nom)} · ${a.length.emoji} ${escapeHtml(a.length.nom)} (${escapeHtml(a.length.desc)})</p>
          <h2>${escapeHtml(a.titre)}</h2>
          <p class="adv-code">Aventure n° <code>${escapeHtml(a.code)}</code></p>
        </div>
      </header>

      <section class="gm-box">
        <h3>🤫 Pour le Conteur seulement (à lire avant de jouer)</h3>
        <p>Le responsable de tout ça, c'est <strong>${escapeHtml(m.nom)}</strong>, ${escapeHtml(m.description)}.
          Mais en vrai, <strong>${escapeHtml(m.raison)}</strong>. Les héros pourront le découvrir pendant l'aventure.</p>
        <p>🦉 <strong>Compagnon suggéré pour Maman :</strong> ${escapeHtml(a.compagnon)}.</p>
        ${heroList}
        <p>🎒 Préparez : un dé, 3 jetons-cœurs et des jetons-étoiles par enfant, la carte « Pause ».</p>
      </section>

      <section class="scene intro">
        <h3><span class="scene-num">🌅</span> Le début de l'histoire</h3>
        <div class="read-aloud"><span class="label-small">📖 À lire</span>${escapeHtml(a.intro.ambiance)}</div>
        <div class="read-aloud">${escapeHtml(a.intro.texte)}</div>
        <div class="read-aloud">${escapeHtml(a.intro.appel)}</div>
        <p class="hint">Laissez chaque enfant présenter son héros en une phrase (« Je suis Lina, une fée, et je suis super forte ! »). Le Compagnon se présente aussi.</p>
      </section>

      ${scenes}
      ${rebond}

      <section class="scene finale">
        <h3><span class="scene-num">🏁</span> La grande fin : ${escapeHtml(a.finale.lieu.nom)}</h3>
        <div class="read-aloud"><span class="label-small">📖 À lire</span>${escapeHtml(a.finale.lieu.description)}
          Et là, au milieu, se trouve ${escapeHtml(m.nom)}, ${escapeHtml(m.description)}. C'est de là que viennent tous les problèmes !</div>
        <p class="question">💬 <em>Demandez aux enfants : « Qu'est-ce que vous faites ? »</em></p>
        <div class="challenge">
          <div class="challenge-head"><strong>🏆 Le défi final</strong> ${diffBadge(a.finale.difficulte)}</div>
          <p>Le secret : <strong>${escapeHtml(m.raison)}</strong>. Les enfants peuvent s'en sortir de plusieurs façons :</p>
          <ul class="solutions">${solutions}</ul>
          <p class="hint">Toute bonne idée des enfants marche ! Si leur solution utilise le Cœur (comprendre, consoler, se faire un ami), rendez-la <strong>facile (3 ou plus)</strong>. Chaque héros peut aider : c'est le bon moment pour utiliser les pouvoirs magiques. Si le dé rate, ce n'est pas perdu : le méchant hésite, et on peut réessayer autrement (tirez un 🌀 « Oui, mais… » dans la boîte à imprévus).</p>
        </div>
      </section>

      <section class="scene ending">
        <h3><span class="scene-num">🎉</span> Victoire !</h3>
        <div class="read-aloud"><span class="label-small">📖 À lire</span>Grâce à vous, tout est rentré dans l'ordre ! Pour vous remercier, vous recevez ${escapeHtml(a.tresor)}.</div>
        <div class="pride">
          <strong>⭐ Le moment de fierté</strong>
          <p>Chacun à son tour (adultes compris) dit : <em>ce que son héros a fait de mieux</em> et <em>ce qu'il a préféré dans l'histoire</em>. Donnez une dernière étoile à chacun.</p>
        </div>
      </section>
    </article>`;
}

let currentAdventure = null;

function showAdventure(a) {
  currentAdventure = a;
  setAleasTheme(a.theme.id);
  $("#adventure-output").innerHTML = renderAdventure(a);
  $("#print-adventure").hidden = false;
  $("#copy-link").hidden = false;
  document.title = `${a.titre} – Les Petits Héros`;
}

function initAdventure() {
  renderChoices($("#theme-choices"), THEMES, { selected: THEMES[0].id });
  renderChoices($("#length-choices"), LENGTHS, { selected: LENGTHS[0].id, sub: (l) => l.desc });
  bindChoiceGroup($("#theme-choices"));
  bindChoiceGroup($("#length-choices"));

  $("#generate").addEventListener("click", () => {
    const themeId = selectedValue($("#theme-choices"));
    const lengthId = selectedValue($("#length-choices"));
    const seed = randomSeed();
    history.replaceState(null, "", `#aventure/${themeId}/${lengthId}/${seed}`);
    showAdventure(generateAdventure(themeId, lengthId, seed));
    $("#adventure-output").scrollIntoView({ behavior: "smooth" });
  });

  $("#print-adventure").addEventListener("click", () => window.print());

  $("#copy-link").addEventListener("click", async () => {
    const btn = $("#copy-link");
    try {
      await navigator.clipboard.writeText(location.href);
      btn.textContent = "✅ Lien copié !";
    } catch {
      btn.textContent = `Code : ${currentAdventure.code}`;
    }
    setTimeout(() => { btn.textContent = "🔗 Copier le lien"; }, 2500);
  });
}

/* ---------------- Boîte à imprévus ---------------- */
let aleasThemeId = THEMES[0].id;

function setAleasTheme(id) {
  aleasThemeId = id;
  setSelected($("#aleas-theme"), id);
}

function renderAlea(btn, r) {
  const body = r.lignes
    ? `${r.titre ? `<strong>${escapeHtml(r.titre)}</strong>` : ""}<ul>${r.lignes.map(([k, v]) =>
        `<li><span class="k">${escapeHtml(k)} :</span> ${escapeHtml(v)}</li>`).join("")}</ul>`
    : `${r.titre ? `<strong>${escapeHtml(r.titre)}</strong> ` : ""}${escapeHtml(r.texte)}`;
  return `<div class="alea-card ${r.cls ? `alea-${r.cls}` : ""}">
    <div class="alea-type">${btn.emoji} ${escapeHtml(btn.nom)}</div>${body}</div>`;
}

function openAleas(open) {
  $("#aleas").hidden = !open;
  $("#aleas-open").hidden = open;
  document.body.classList.toggle("drawer-open", open);
}

function initAleas() {
  const el = $("#aleas-theme");
  el.innerHTML = THEMES.map((t) =>
    `<button type="button" class="choice" data-value="${t.id}" title="${escapeHtml(t.nom)}">${t.emoji}</button>`).join("");
  bindChoiceGroup(el, (id) => { aleasThemeId = id; });
  setAleasTheme(aleasThemeId);
  bindChoiceGroup($("#oracle-mod"));

  $("#aleas-buttons").innerHTML = ALEAS_BOUTONS.map((b) => `
    <button type="button" class="alea-btn" data-alea="${b.id}">
      <span class="choice-emoji">${b.emoji}</span><strong>${escapeHtml(b.nom)}</strong><small>${escapeHtml(b.aide)}</small>
    </button>`).join("");

  $("#aleas-buttons").addEventListener("click", (e) => {
    const target = e.target.closest(".alea-btn");
    if (!target) return;
    const btn = ALEAS_BOUTONS.find((b) => b.id === target.dataset.alea);
    const theme = THEMES.find((t) => t.id === aleasThemeId);
    const mod = parseInt(selectedValue($("#oracle-mod")), 10) || 0;
    const r = ALEAS[btn.id](theme, mod);
    const results = $("#aleas-results");
    results.insertAdjacentHTML("afterbegin", renderAlea(btn, r));
    while (results.children.length > 12) results.lastElementChild.remove();
    results.firstElementChild.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  $("#aleas-open").addEventListener("click", () => openAleas(true));
  $("#aleas-close").addEventListener("click", () => openAleas(false));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") openAleas(false); });
}

/* ---------------- Démarrage ---------------- */
initHeroes();
initAdventure();
initAleas();
window.addEventListener("hashchange", handleHash);
handleHash();

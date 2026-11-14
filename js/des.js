/* ==========================================================
   Le dé du site, avec du suspense : il roule, ralentit,
   un petit roulement de tambour… puis le résultat.
   Utilisé dans l'onglet Dé et dans le mode « Jouer en direct ».
   ========================================================== */

const SOUND_KEY = "petits-heros:son";
let audioCtx = null;

function soundOn() {
  try { return localStorage.getItem(SOUND_KEY) !== "off"; } catch { return true; }
}

function setSound(on) {
  try { localStorage.setItem(SOUND_KEY, on ? "on" : "off"); } catch { /* rien */ }
  document.querySelectorAll("[data-sound-toggle]").forEach((b) => { b.textContent = on ? "🔊 Son" : "🔇 Son coupé"; });
}

// Petits sons fabriqués (pas de fichier à charger)
function beep(freq, duration, type = "triangle", volume = 0.08, delay = 0) {
  if (!soundOn()) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const t = audioCtx.currentTime + delay;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + duration);
  } catch { /* son indisponible */ }
}

function soundResult(kind) {
  if (kind === "crit") [523, 659, 784, 1047].forEach((f, i) => beep(f, 0.35, "triangle", 0.1, i * 0.12));
  else if (kind === "ok") [523, 784].forEach((f, i) => beep(f, 0.3, "triangle", 0.09, i * 0.12));
  else if (kind === "fumble") [392, 370, 349, 262].forEach((f, i) => beep(f, 0.4, "sawtooth", 0.05, i * 0.25));
  else [330, 262].forEach((f, i) => beep(f, 0.3, "sine", 0.08, i * 0.18));
}

function dieFace(value, extra = "") {
  return `<div class="die${extra}" data-value="${value}">${'<span class="pip"></span>'.repeat(value)}</div>`;
}

const RESULTATS = {
  crit: { emoji: "🌟", titre: "6 ! Réussite critique !", sous: "Ça marche encore mieux que prévu, et une étoile en plus !" },
  ok: { emoji: "✅", titre: "Ça marche !", sous: "" },
  oops: { emoji: "🌀", titre: "Oups… oui, mais…", sous: "Il se passe quelque chose d'inattendu !" },
  fumble: { emoji: "🙈", titre: "1 ! Catastrophe rigolote !", sous: "C'est raté de façon très drôle… mais une étoile de courage !" },
};

function judge(values, target) {
  if (values.includes(6)) return "crit";
  if (values.every((v) => v === 1)) return "fumble";
  return Math.max(...values) >= target ? "ok" : "oops";
}

/*
  options :
    target : difficulté fixe (3, 4 ou 5) ; sinon choix affiché dans le lanceur
    apply  : "resolve" ou "finale" pour appliquer le résultat dans une partie en direct
    big    : grand format (onglet Dé)
*/
function diceRollerHTML({ target = null, apply = null, big = false } = {}) {
  const countChoices = [
    ["1", "🎲", "1 dé", "normal"],
    ["2", "🎲🎲", "2 dés", "super-talent ou aide"],
    ["3", "🎲🎲🎲", "3 dés", "super-talent + aide"],
  ];
  return `
    <div class="roller${big ? " roller-big" : ""}" data-roller${target ? ` data-target="${target}"` : ""}${apply ? ` data-apply="${apply}"` : ""}>
      <div class="roller-options">
        <div class="mini-choices roller-count">${countChoices.map(([v, e, n, s], i) =>
          `<button type="button" class="choice${i === 0 ? " selected" : ""}" data-value="${v}" title="${s}">${e} ${n}</button>`).join("")}</div>
        ${target ? "" : `<div class="mini-choices roller-diff">
          <button type="button" class="choice" data-value="3">🙂 Facile (3+)</button>
          <button type="button" class="choice selected" data-value="4">😮 Normal (4+)</button>
          <button type="button" class="choice" data-value="5">😱 Difficile (5+)</button></div>`}
        <button type="button" class="btn btn-ghost btn-small" data-sound-toggle>${soundOn() ? "🔊 Son" : "🔇 Son coupé"}</button>
      </div>
      <button type="button" class="btn ${big ? "btn-huge" : "btn-big"} roll-btn" data-roll>🎲 Lancer le dé !</button>
      <div class="dice-area" aria-live="polite">${dieFace(6, " idle")}</div>
      <div class="dice-suspense" aria-live="polite"></div>
      <div class="dice-result" aria-live="polite"></div>
    </div>`;
}

function rollDice(roller) {
  if (roller.dataset.rolling) return;
  roller.dataset.rolling = "1";
  const count = parseInt((roller.querySelector(".roller-count .selected") || {}).dataset?.value || "1", 10);
  let target = parseInt(roller.dataset.target || "0", 10);
  if (!target) {
    const diff = roller.querySelector(".roller-diff .selected");
    target = diff ? parseInt(diff.dataset.value, 10) : 4;
  }
  // Pendant la grande fin, la difficulté dépend du talent choisi par les enfants
  if (roller.dataset.apply === "finale" && typeof loadLive === "function") {
    const st = loadLive();
    const host = roller.closest(".live");
    const sel = host && host.querySelector(".live-talents .choice.selected");
    if (st && st.current && st.current.difficultes && sel) target = st.current.difficultes[sel.dataset.value];
  }

  const area = roller.querySelector(".dice-area");
  const suspense = roller.querySelector(".dice-suspense");
  const result = roller.querySelector(".dice-result");
  const btn = roller.querySelector("[data-roll]");
  btn.disabled = true;
  result.className = "dice-result";
  result.innerHTML = "";

  const values = Array.from({ length: count }, () => 1 + Math.floor(Math.random() * 6));
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Le dé ralentit petit à petit : c'est ça, le suspense
  const delays = reduce ? [120, 200, 300] : [60, 60, 70, 80, 90, 110, 130, 160, 190, 230, 280, 340, 430, 540];
  const phrases = ["Le dé roule…", "Il roule, il roule…", "Il ralentit…", "Encore un peu…", "Et c'est…"];
  let i = 0;

  const frame = () => {
    if (i < delays.length) {
      const fake = Array.from({ length: count }, () => 1 + Math.floor(Math.random() * 6));
      area.innerHTML = fake.map((v) => dieFace(v, " rolling")).join("");
      suspense.textContent = phrases[Math.min(phrases.length - 1, Math.floor((i / delays.length) * phrases.length))];
      beep(180 + Math.random() * 60, 0.05, "square", 0.03);
      setTimeout(frame, delays[i]);
      i += 1;
      return;
    }
    // Dernière pause, tout le monde retient son souffle
    suspense.textContent = "…";
    area.classList.add("holding");
    setTimeout(() => {
      area.classList.remove("holding");
      const kind = judge(values, target);
      const best = Math.max(...values);
      let marked = false;
      area.innerHTML = values.map((v) => {
        const mark = count > 1 && !marked && v === (kind === "crit" ? 6 : best);
        if (mark) marked = true;
        return dieFace(v, ` landed${mark ? " best" : ""}`);
      }).join("");
      suspense.textContent = count > 1 ? `On garde le meilleur : ${best} (il fallait ${target} ou plus)` : `Il fallait ${target} ou plus`;
      const r = RESULTATS[kind];
      result.classList.add(kind);
      result.innerHTML = `<span class="big">${r.emoji}</span> ${r.titre}${r.sous ? `<small>${r.sous}</small>` : ""}
        ${roller.dataset.apply ? `<div class="live-results roller-apply">
          <button class="btn btn-big" data-live="${roller.dataset.apply}" data-res="${kind}">➡️ Continuer l'histoire</button>
          <button class="btn btn-ghost btn-small" data-reroll>✨ Dépenser une étoile pour relancer</button></div>`
          : `<div class="roller-apply"><button class="btn btn-ghost btn-small" data-reroll>✨ Dépenser une étoile pour relancer</button></div>`}`;
      soundResult(kind);
      btn.disabled = false;
      delete roller.dataset.rolling;
    }, reduce ? 150 : 700);
  };
  frame();
}

function initDice() {
  document.addEventListener("click", (e) => {
    const toggle = e.target.closest("[data-sound-toggle]");
    if (toggle) { setSound(!soundOn()); return; }
    const choice = e.target.closest(".roller-count .choice, .roller-diff .choice");
    if (choice) {
      choice.parentElement.querySelectorAll(".choice").forEach((b) => b.classList.remove("selected"));
      choice.classList.add("selected");
      return;
    }
    const roll = e.target.closest("[data-roll], [data-reroll]");
    if (roll) {
      const roller = roll.closest("[data-roller]");
      if (roller) rollDice(roller);
    }
  });
  const host = document.getElementById("dice-page");
  if (host) host.innerHTML = diceRollerHTML({ big: true });
}

initDice();

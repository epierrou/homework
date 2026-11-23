"use strict";

/* ============================================================
 *  Glosträning – a small, dependency-free vocabulary trainer.
 *  Word lists live in data/words.js (the WEEKS array).
 * ============================================================ */

const app = document.getElementById("app");

/* ---------- small helpers ---------- */

const store = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem("glosor:" + key);
      return v === null ? fallback : JSON.parse(v);
    } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem("glosor:" + key, JSON.stringify(value)); } catch { /* ignore */ }
  },
};

/** Tiny element builder: h("div", {class: "x", onclick: fn}, "text", child) */
function h(tag, attrs, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === false || v === null || v === undefined) continue;
    if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else if (k === "class") el.className = v;
    else if (k === "style") el.style.cssText = v;
    else el.setAttribute(k, v === true ? "" : v);
  }
  for (const c of children.flat(Infinity)) {
    if (c === null || c === undefined || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const norm = (s) => s.toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, " ").trim();
const plain = (sentence) => sentence.replace(/[[\]]/g, "");
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* ---------- speech ---------- */

let enVoice = null;
function loadVoice() {
  if (!("speechSynthesis" in window)) return;
  const voices = speechSynthesis.getVoices();
  enVoice = voices.find((v) => v.lang === "en-GB") ||
            voices.find((v) => v.lang && v.lang.startsWith("en")) || null;
}
if ("speechSynthesis" in window) {
  loadVoice();
  speechSynthesis.onvoiceschanged = loadVoice;
}
function speak(text, slow) {
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(plain(text));
  u.lang = "en-GB";
  if (enVoice) u.voice = enVoice;
  u.rate = slow ? 0.6 : 0.9;
  speechSynthesis.speak(u);
}
function speakBtn(text, label) {
  return h("button", {
    class: "speak", type: "button", title: "Lyssna", "aria-label": "Lyssna: " + plain(text),
    onclick: (e) => { e.stopPropagation(); speak(text); },
  }, "🔊", label ? " " + label : null);
}

/* ---------- sounds (tiny beeps, no files) ---------- */

let audioCtx = null;
function beep(good) {
  if (store.get("mute", false)) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const notes = good ? [660, 880] : [220, 180];
    notes.forEach((f, i) => {
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = good ? "triangle" : "sawtooth";
      o.frequency.value = f;
      const t = audioCtx.currentTime + i * 0.11;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(good ? 0.18 : 0.08, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
      o.connect(g).connect(audioCtx.destination);
      o.start(t); o.stop(t + 0.2);
    });
  } catch { /* no audio – fine */ }
}

/* ---------- confetti ---------- */

function confetti(amount = 60) {
  const emojis = ["🎉", "⭐", "🍪", "🧁", "✨", "🍰", "🎊"];
  for (let i = 0; i < amount; i++) {
    const p = h("span", { class: "confetti" }, pick(emojis));
    p.style.left = Math.random() * 100 + "vw";
    p.style.animationDuration = 1.6 + Math.random() * 1.8 + "s";
    p.style.animationDelay = Math.random() * 0.5 + "s";
    p.style.fontSize = 16 + Math.random() * 22 + "px";
    document.body.append(p);
    setTimeout(() => p.remove(), 4200);
  }
}

/* ---------- sentence rendering ---------- */

/** Render "I like [cake]." with the bracketed part highlighted (or blanked). */
function sentenceEl(sentence, { blank = false, filled = null } = {}) {
  const parts = sentence.split(/(\[[^\]]+\])/);
  return h("span", { class: "sentence" }, parts.map((p) => {
    if (!p.startsWith("[")) return p;
    const word = p.slice(1, -1);
    if (blank) return h("span", { class: "blank" + (filled ? " filled" : "") }, filled ? word : " ".repeat(10));
    return h("mark", {}, word);
  }));
}
const blankWord = (sentence) => (sentence.match(/\[([^\]]+)\]/) || [])[1];

/* ---------- progress ---------- */

const starsFor = (score, total) => {
  const r = total ? score / total : 0;
  return r >= 0.9 ? 3 : r >= 0.7 ? 2 : r >= 0.4 ? 1 : 0;
};
const getProgress = (weekId) => store.get("progress:" + weekId, {});
function saveStars(weekId, mode, stars) {
  const p = getProgress(weekId);
  p[mode] = Math.max(p[mode] || 0, stars);
  store.set("progress:" + weekId, p);
}
const starRow = (n, max = 3) =>
  h("span", { class: "stars", "aria-label": `${n} av ${max} stjärnor` },
    Array.from({ length: max }, (_, i) => h("span", { class: i < n ? "on" : "off" }, "★")));

/* ---------- date helpers ---------- */

function dueText(due) {
  if (!due) return "";
  const d = new Date(due + "T12:00:00");
  const today = new Date(); today.setHours(12, 0, 0, 0);
  const days = Math.round((d - today) / 86400000);
  const date = d.toLocaleDateString("sv-SE", { weekday: "long", day: "numeric", month: "long" });
  if (days === 0) return `Förhör idag (${date}) – lycka till! 🍀`;
  if (days === 1) return `Förhör imorgon, ${date} 💪`;
  if (days > 1) return `Förhör ${date} – om ${days} dagar`;
  return `Förhöret var ${date}`;
}

/* ============================================================
 *  Exercises
 * ============================================================ */

const MODES = [
  { id: "cards",  icon: "🃏", name: "Glosor",          desc: "Vänd korten och lär dig orden", run: flashcards },
  { id: "quiz",   icon: "❓", name: "Flerval",         desc: "Välj rätt översättning",       run: quiz },
  { id: "match",  icon: "🧩", name: "Para ihop",       desc: "Hitta paren så snabbt du kan", run: match },
  { id: "spell",  icon: "⌨️", name: "Stava",           desc: "Skriv ordet på engelska",       run: spell },
  { id: "blank",  icon: "🕳️", name: "Lucktext",        desc: "Vilket ord saknas i meningen?", run: blanks, sentences: true },
  { id: "build",  icon: "🧱", name: "Bygg meningen",   desc: "Sätt orden i rätt ordning",     run: build, sentences: true },
  { id: "write",  icon: "✍️", name: "Skriv meningar",  desc: "Skriv egna meningar med orden", run: write },
];

/** Shared layout for every exercise: top bar, progress bar, body. */
function gameShell(week, mode) {
  const bar = h("div", { class: "bar-fill" });
  const count = h("span", { class: "count" });
  const body = h("section", { class: "game-body" });
  app.replaceChildren(
    h("header", { class: "topbar" },
      h("a", { class: "back", href: `#/w/${week.id}` }, "← Tillbaka"),
      h("h1", {}, mode.icon, " ", mode.name),
      count),
    h("div", { class: "bar" }, bar),
    body,
  );
  return {
    body,
    progress(done, total) {
      bar.style.width = (total ? (100 * done) / total : 0) + "%";
      count.textContent = `${done}/${total}`;
    },
  };
}

function finish(week, mode, score, total, extra) {
  const stars = starsFor(score, total);
  saveStars(week.id, mode.id, stars);
  if (stars >= 2) confetti(stars === 3 ? 80 : 40);
  beep(stars >= 2);
  const msg = ["Bra kämpat! Öva lite till så sitter det. 💪", "Bra jobbat! 👍", "Riktigt bra! 🌟", "Perfekt! Du är grym! 🏆"][stars];
  app.replaceChildren(
    h("section", { class: "result" },
      h("div", { class: "result-icon" }, mode.icon),
      h("h1", {}, msg),
      h("div", { class: "big-stars" }, starRow(stars)),
      h("p", { class: "score" }, `${score} av ${total} rätt`),
      extra || null,
      h("div", { class: "row" },
        h("button", { class: "btn primary", onclick: () => mode.run(week, mode) }, "🔁 Spela igen"),
        h("a", { class: "btn", href: `#/w/${week.id}` }, "📋 Välj övning")),
    ),
  );
}

/* ---------- 1. Flashcards ---------- */

function flashcards(week, mode) {
  const shell = gameShell(week, mode);
  const total = week.words.length;
  let queue = shuffle(week.words);
  let known = 0;
  let svFirst = store.get("cardsDir", true);

  function show() {
    shell.progress(known, total);
    if (!queue.length) return finish(week, mode, total, total);
    const w = queue[0];
    const front = svFirst ? w.sv : w.en;
    const sentence = w.sentences && w.sentences[0];

    const card = h("button", { class: "flashcard", type: "button", "aria-label": "Vänd kortet" },
      h("div", { class: "face front" },
        h("small", {}, svFirst ? "Svenska" : "English"),
        h("div", { class: "card-word" }, front),
        h("small", { class: "hint" }, "Tryck för att vända 👆")),
      h("div", { class: "face back" },
        h("small", {}, svFirst ? "English" : "Svenska"),
        h("div", { class: "card-word" }, svFirst ? w.en : w.sv),
        sentence ? h("p", { class: "card-sentence" }, sentenceEl(sentence)) : null),
    );
    const answerRow = h("div", { class: "row hidden" },
      h("button", { class: "btn warn", onclick: () => { queue.push(queue.shift()); show(); } }, "😅 Öva mer"),
      h("button", { class: "btn good", onclick: () => { queue.shift(); known++; show(); } }, "😎 Kunde den!"));

    card.addEventListener("click", () => {
      card.classList.toggle("flipped");
      answerRow.classList.remove("hidden");
      if (card.classList.contains("flipped") || !svFirst) speak(w.en);
    });
    if (!svFirst) speak(w.en);

    shell.body.replaceChildren(
      h("div", { class: "toolbar" },
        h("button", { class: "chip", onclick: () => { svFirst = !svFirst; store.set("cardsDir", svFirst); show(); } },
          svFirst ? "🇸🇪 → 🇬🇧  (byt håll)" : "🇬🇧 → 🇸🇪  (byt håll)"),
        speakBtn(w.en, "Lyssna")),
      card,
      answerRow,
      h("p", { class: "muted center" }, `${queue.length} kort kvar`),
    );
  }
  show();
}

/* ---------- 2. Multiple choice quiz ---------- */

function quiz(week, mode) {
  const shell = gameShell(week, mode);
  const qs = shuffle(week.words).map((w) => ({ w, toEn: Math.random() < 0.6 }));
  let i = 0, score = 0;

  function show() {
    shell.progress(i, qs.length);
    if (i >= qs.length) return finish(week, mode, score, qs.length);
    const { w, toEn } = qs[i];
    const others = shuffle(week.words.filter((x) => x !== w)).slice(0, 3);
    const options = shuffle([w, ...others]);
    let answered = false;

    const buttons = options.map((o) => h("button", {
      class: "option",
      onclick: (e) => {
        if (answered) return;
        answered = true;
        const right = o === w;
        if (right) score++;
        e.currentTarget.classList.add(right ? "right" : "wrong");
        buttons[options.indexOf(w)].classList.add("right");
        beep(right);
        speak(w.en);
        next.classList.remove("hidden");
        if (right) setTimeout(() => { if (i === idx) { i++; show(); } }, 1100);
      },
    }, toEn ? o.en : o.sv));
    const idx = i;
    const next = h("button", { class: "btn primary hidden", onclick: () => { i++; show(); } }, "Nästa →");

    shell.body.replaceChildren(
      h("p", { class: "muted center" }, toEn ? "Vad heter det på engelska?" : "Vad betyder det på svenska?"),
      h("div", { class: "prompt" }, toEn ? w.sv : w.en, toEn ? null : speakBtn(w.en)),
      h("div", { class: "options" }, buttons),
      h("div", { class: "row" }, next),
    );
    if (!toEn) speak(w.en);
  }
  show();
}

/* ---------- 3. Match pairs ---------- */

function match(week, mode) {
  const shell = gameShell(week, mode);
  const words = shuffle(week.words);
  const rounds = [];
  for (let k = 0; k < words.length; k += 5) rounds.push(words.slice(k, k + 5));
  // avoid a lonely last round of 1–2 words
  if (rounds.length > 1 && rounds[rounds.length - 1].length < 3) {
    rounds[rounds.length - 2].push(...rounds.pop());
  }
  let r = 0, done = 0, mistakes = 0;
  const start = Date.now();

  function show() {
    shell.progress(done, words.length);
    if (r >= rounds.length) {
      const secs = Math.round((Date.now() - start) / 1000);
      const best = store.get("matchBest:" + week.id, null);
      const isBest = mistakes === 0 && (best === null || secs < best);
      if (isBest) store.set("matchBest:" + week.id, secs);
      return finish(week, mode, Math.max(0, words.length - mistakes), words.length,
        h("p", { class: "muted" }, `Tid: ${secs} s · Fel: ${mistakes}`,
          isBest ? h("strong", {}, " · Nytt rekord! 🏅") : best ? ` · Rekord: ${best} s` : null));
    }
    const set = rounds[r];
    let selected = null; // {side, w, el}
    let left = set.length;

    const tile = (w, side) => {
      const el = h("button", {
        class: "tile " + side,
        onclick: () => {
          if (el.disabled) return;
          if (side === "en") speak(w.en);
          if (!selected || selected.side === side) {
            if (selected) selected.el.classList.remove("sel");
            selected = { side, w, el };
            el.classList.add("sel");
            return;
          }
          if (selected.w === w) {
            [el, selected.el].forEach((t) => { t.classList.remove("sel"); t.classList.add("done"); t.disabled = true; });
            beep(true);
            done++; left--;
            shell.progress(done, words.length);
            if (!left) setTimeout(() => { r++; show(); }, 500);
          } else {
            mistakes++;
            beep(false);
            [el, selected.el].forEach((t) => { t.classList.remove("sel"); t.classList.add("shake"); setTimeout(() => t.classList.remove("shake"), 400); });
          }
          selected = null;
        },
      }, side === "sv" ? w.sv : w.en);
      return el;
    };

    shell.body.replaceChildren(
      h("p", { class: "muted center" }, `Runda ${r + 1} av ${rounds.length} – tryck på ett svenskt och ett engelskt ord som hör ihop`),
      h("div", { class: "match-grid" },
        h("div", { class: "col" }, shuffle(set).map((w) => tile(w, "sv"))),
        h("div", { class: "col" }, shuffle(set).map((w) => tile(w, "en")))),
    );
  }
  show();
}

/* ---------- 4. Spelling ---------- */

function spell(week, mode) {
  const shell = gameShell(week, mode);
  const total = week.words.length;
  let queue = shuffle(week.words);
  const firstTry = new Map(); // word -> points (1, 0.5 or 0)
  let done = 0;

  function show() {
    shell.progress(done, total);
    if (!queue.length) {
      const score = [...firstTry.values()].reduce((a, b) => a + b, 0);
      return finish(week, mode, Math.round(score), total);
    }
    const w = queue[0];
    let hints = 0;
    let locked = false;
    const input = h("input", {
      class: "spell-input", type: "text", autocomplete: "off", autocapitalize: "off",
      autocorrect: "off", spellcheck: "false", placeholder: "Skriv på engelska…", "aria-label": "Ditt svar",
    });
    const feedback = h("div", { class: "feedback" });
    const next = h("button", { class: "btn primary hidden", onclick: () => show() }, "Nästa →");
    const checkBtn = h("button", { class: "btn primary", onclick: check }, "Kolla ✔");

    function check() {
      if (locked) return;
      const ans = norm(input.value);
      if (!ans) return input.focus();
      locked = true;
      checkBtn.classList.add("hidden");
      const right = ans === norm(w.en);
      if (!firstTry.has(w)) firstTry.set(w, right ? (hints ? 0.5 : 1) : 0);
      beep(right);
      speak(w.en);
      if (right) {
        input.classList.add("right");
        feedback.replaceChildren(h("p", { class: "good-text" }, pick(["Rätt! 🎉", "Snyggt! ⭐", "Perfekt! 🙌", "Yes! 💥"])));
        queue.shift(); done++;
        setTimeout(() => { if (queue[0] !== w) show(); }, 1000);
      } else {
        input.classList.add("wrong");
        feedback.replaceChildren(
          h("p", { class: "bad-text" }, "Nästan! Så här stavas det:"),
          diffEl(ans, norm(w.en)),
          h("p", { class: "muted" }, "Ordet kommer tillbaka senare så du får försöka igen."));
        queue.push(queue.shift());
        next.classList.remove("hidden");
      }
    }

    input.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      e.preventDefault();
      if (!locked) check();
      else if (!next.classList.contains("hidden")) show();
    });

    shell.body.replaceChildren(
      h("p", { class: "muted center" }, "Hur skriver man det här på engelska?"),
      h("div", { class: "prompt" }, w.sv),
      input,
      h("div", { class: "row" },
        h("button", { class: "chip", onclick: () => speak(w.en, true) }, "🔊 Lyssna (långsamt)"),
        h("button", { class: "chip", onclick: () => {
          if (locked) return;
          const target = w.en;
          const cur = input.value;
          let k = 0;
          while (k < cur.length && k < target.length && cur[k].toLowerCase() === target[k].toLowerCase()) k++;
          input.value = target.slice(0, k + 1);
          hints++;
          input.focus();
        } }, "💡 Ledtråd")),
      h("div", { class: "row" }, checkBtn, next),
      feedback,
    );
    input.focus();
  }
  show();
}

/** Show the correct word with letters coloured by whether the child got them right. */
function diffEl(typed, correct) {
  return h("div", { class: "diff" }, [...correct].map((ch, k) =>
    h("span", { class: typed[k] === ch ? "ok" : "miss" }, ch === " " ? " " : ch)));
}

/* ---------- 5. Fill in the blank ---------- */

function blanks(week, mode) {
  const shell = gameShell(week, mode);
  const items = shuffle(week.words.filter((w) => w.sentences && w.sentences.some((s) => s.includes("["))))
    .map((w) => ({ w, s: pick(w.sentences.filter((s) => s.includes("["))) }));
  let i = 0, score = 0;

  function show() {
    shell.progress(i, items.length);
    if (i >= items.length) return finish(week, mode, score, items.length);
    const { w, s } = items[i];
    const options = shuffle([w, ...shuffle(week.words.filter((x) => x !== w)).slice(0, 3)]);
    let answered = false;
    const sentenceBox = h("div", { class: "sentence-box" }, sentenceEl(s, { blank: true }));
    const next = h("button", { class: "btn primary hidden", onclick: () => { i++; show(); } }, "Nästa →");
    const idx = i;

    const buttons = options.map((o) => h("button", {
      class: "option",
      onclick: (e) => {
        if (answered) return;
        answered = true;
        const right = o === w;
        if (right) score++;
        e.currentTarget.classList.add(right ? "right" : "wrong");
        buttons[options.indexOf(w)].classList.add("right");
        sentenceBox.replaceChildren(sentenceEl(s, { blank: true, filled: true }), " ", speakBtn(s));
        beep(right);
        speak(s);
        next.classList.remove("hidden");
        if (right) setTimeout(() => { if (i === idx) { i++; show(); } }, 2200);
      },
    }, o.en));

    shell.body.replaceChildren(
      h("p", { class: "muted center" }, "Vilket ord passar i luckan?"),
      sentenceBox,
      h("p", { class: "muted center" }, "Ledtråd: ", h("strong", {}, w.sv)),
      h("div", { class: "options" }, buttons),
      h("div", { class: "row" }, next),
    );
  }
  show();
}

/* ---------- 6. Build the sentence ---------- */

function build(week, mode) {
  const shell = gameShell(week, mode);
  const items = shuffle(week.words.filter((w) => w.sentences && w.sentences.length))
    .slice(0, 10)
    .map((w) => ({ w, s: plain(pick(w.sentences)) }));
  let i = 0, score = 0;

  function show() {
    shell.progress(i, items.length);
    if (i >= items.length) return finish(week, mode, score, items.length);
    const { w, s } = items[i];
    const tokens = s.split(" ");
    let order = shuffle(tokens.map((t, k) => k));
    for (let tries = 0; tries < 10 && tokens.length > 1 && order.every((v, k) => tokens[v] === tokens[k]); tries++) {
      order = shuffle(order);
    }
    let attempts = 0;
    let placed = []; // indexes into tokens
    const answer = h("div", { class: "build-answer" });
    const pool = h("div", { class: "build-pool" });
    const feedback = h("div", { class: "feedback" });
    const next = h("button", { class: "btn primary hidden", onclick: () => { i++; show(); } }, "Nästa →");
    let solved = false;

    function draw() {
      answer.replaceChildren(...(placed.length ? placed.map((k, pos) => h("button", {
        class: "word-tile", onclick: () => { if (solved) return; placed.splice(pos, 1); feedback.replaceChildren(); draw(); },
      }, tokens[k])) : [h("span", { class: "muted" }, "Tryck på orden nedan i rätt ordning…")]));
      pool.replaceChildren(...order.map((k) => h("button", {
        class: "word-tile" + (placed.includes(k) ? " used" : ""),
        disabled: placed.includes(k) || solved,
        onclick: () => { placed.push(k); draw(); if (placed.length === tokens.length) check(); },
      }, tokens[k])));
    }

    function check() {
      const built = placed.map((k) => tokens[k]).join(" ");
      if (built === s) {
        solved = true;
        if (attempts === 0) score++;
        answer.classList.add("right");
        beep(true);
        speak(s);
        feedback.replaceChildren(h("p", { class: "good-text" }, pick(["Helt rätt! 🎉", "Snyggt byggt! 🧱", "Perfekt! ⭐"])));
        next.classList.remove("hidden");
        draw();
      } else {
        attempts++;
        beep(false);
        answer.classList.add("shake");
        setTimeout(() => answer.classList.remove("shake"), 400);
        if (attempts >= 2) {
          solved = true;
          feedback.replaceChildren(h("p", { class: "bad-text" }, "Rätt mening är:"), h("p", { class: "sentence-box small" }, s, " ", speakBtn(s)));
          speak(s);
          next.classList.remove("hidden");
          draw();
        } else {
          feedback.replaceChildren(h("p", { class: "bad-text" }, "Inte riktigt – tryck på ord för att flytta tillbaka dem och försök igen."));
        }
      }
    }

    shell.body.replaceChildren(
      h("p", { class: "muted center" }, "Bygg en mening med ", h("strong", {}, w.en), ` (${w.sv})`),
      answer,
      pool,
      h("div", { class: "row" },
        h("button", { class: "chip", onclick: () => speak(s) }, "🔊 Lyssna på meningen"),
        h("button", { class: "chip", onclick: () => { if (!solved) { placed = []; feedback.replaceChildren(); draw(); } } }, "↺ Börja om")),
      feedback,
      h("div", { class: "row" }, next),
    );
    draw();
  }
  show();
}

/* ---------- 7. Write your own sentences ---------- */

function sentenceChecks(text, word) {
  const t = text.trim();
  const re = new RegExp("(^|[^a-z])" + escapeRe(word.toLowerCase()), "i");
  return [
    { ok: re.test(t), text: `Använder ordet "${word}"` },
    { ok: t.split(/\s+/).filter(Boolean).length >= 4, text: "Minst 4 ord" },
    { ok: /^[A-Z0-9"']/.test(t), text: "Börjar med stor bokstav" },
    { ok: /[.!?]["']?$/.test(t), text: "Slutar med . ! eller ?" },
  ];
}

function write(week, mode) {
  const shell = gameShell(week, mode);
  const key = "sentences:" + week.id;
  const saved = store.get(key, {});
  const words = week.words;
  let i = 0;

  function show() {
    const count = words.filter((w) => saved[w.en]).length;
    shell.progress(count, words.length);
    if (i >= words.length) {
      return finish(week, mode, count, words.length, mySentencesEl(week, saved));
    }
    const w = words[i];
    const area = h("textarea", { class: "write-input", rows: "3", placeholder: `Skriv en mening på engelska med "${w.en}"…`, "aria-label": "Din mening" });
    area.value = saved[w.en] || "";
    const checklist = h("ul", { class: "checklist" });
    const feedback = h("div", { class: "feedback" });
    const examples = h("div", { class: "examples hidden" },
      h("p", { class: "muted" }, "Exempel (försök hitta på en egen!):"),
      (w.sentences || []).map((s) => h("p", { class: "sentence-box small" }, sentenceEl(s), " ", speakBtn(s))));

    function update() {
      checklist.replaceChildren(...sentenceChecks(area.value, w.en).map((c) =>
        h("li", { class: c.ok ? "ok" : "" }, c.ok ? "✅ " : "⬜ ", c.text)));
    }
    area.addEventListener("input", update);
    update();

    function submit() {
      const checks = sentenceChecks(area.value, w.en);
      if (checks.every((c) => c.ok)) {
        saved[w.en] = area.value.trim();
        store.set(key, saved);
        beep(true);
        confetti(15);
        speak(saved[w.en]);
        feedback.replaceChildren(h("p", { class: "good-text" }, pick(["Jättebra mening! ✍️", "Snyggt! 🌟", "Bra skrivet! 👏"])));
        setTimeout(() => { if (words[i] === w) { i++; show(); } }, 1600);
      } else {
        beep(false);
        feedback.replaceChildren(h("p", { class: "bad-text" }, "Kolla listan – något saknas fortfarande."));
      }
    }

    shell.body.replaceChildren(
      h("p", { class: "muted center" }, `Ord ${i + 1} av ${words.length}`),
      h("div", { class: "prompt" }, w.en, " ", speakBtn(w.en), h("div", { class: "prompt-sub" }, w.sv)),
      area,
      checklist,
      h("div", { class: "row" },
        h("button", { class: "chip", onclick: () => examples.classList.toggle("hidden") }, "💡 Visa exempel"),
        h("button", { class: "chip", onclick: () => area.value.trim() && speak(area.value) }, "🔊 Lyssna på min mening")),
      examples,
      h("div", { class: "row" },
        i > 0 ? h("button", { class: "btn", onclick: () => { i--; show(); } }, "←") : null,
        h("button", { class: "btn", onclick: () => { i++; show(); } }, "Hoppa över"),
        h("button", { class: "btn primary", onclick: submit }, "Spara ✔")),
      feedback,
    );
    area.focus();
  }
  show();
}

function mySentencesEl(week, saved) {
  const list = week.words.filter((w) => saved[w.en]);
  if (!list.length) return null;
  return h("div", { class: "my-sentences" },
    h("h2", {}, "📝 Mina meningar"),
    h("ol", {}, list.map((w) => h("li", {}, saved[w.en], " ", speakBtn(saved[w.en])))));
}

/* ============================================================
 *  Pages
 * ============================================================ */

function sortedWeeks() {
  return WEEKS.slice().sort((a, b) => (b.due || "").localeCompare(a.due || ""));
}

function weekStars(week) {
  const p = getProgress(week.id);
  const modes = MODES.filter((m) => !m.sentences || hasSentences(week));
  return { got: modes.reduce((s, m) => s + (p[m.id] || 0), 0), max: modes.length * 3 };
}
const hasSentences = (week) => week.words.some((w) => w.sentences && w.sentences.length);

function homePage() {
  const weeks = sortedWeeks();
  const muted = store.get("mute", false);
  app.replaceChildren(
    h("header", { class: "hero" },
      h("div", { class: "hero-emoji" }, "📚"),
      h("h1", {}, "Glosträning"),
      h("p", {}, "Öva veckans engelska glosor – lycka till!"),
      h("button", { class: "chip mute", onclick: () => { store.set("mute", !muted); homePage(); } }, muted ? "🔇 Ljud av" : "🔔 Ljud på")),
    h("section", { class: "weeks" },
      weeks.length ? weeks.map((w, k) => {
        const { got, max } = weekStars(w);
        return h("a", { class: "week-card" + (k === 0 ? " current" : ""), href: `#/w/${w.id}` },
          k === 0 ? h("span", { class: "badge" }, "Veckans glosor") : null,
          h("h2", {}, w.title),
          h("p", { class: "muted" }, dueText(w.due)),
          h("p", { class: "muted" }, `${w.words.length} ord · ⭐ ${got}/${max}`),
          h("div", { class: "bar small" }, h("div", { class: "bar-fill", style: `width:${max ? (100 * got) / max : 0}%` })));
      }) : h("p", {}, "Inga glosor ännu. Lägg till en vecka i data/words.js."),
    ),
    h("footer", { class: "foot" }, h("a", { href: "add.html" }, "➕ Lägg till nya glosor (för vuxna)")),
  );
}

function weekPage(week) {
  const p = getProgress(week.id);
  const { got, max } = weekStars(week);
  const sentencesOk = hasSentences(week);
  app.replaceChildren(
    h("header", { class: "topbar" },
      h("a", { class: "back", href: "#/" }, "← Alla veckor"),
      h("h1", {}, week.title),
      h("span", { class: "count" }, `⭐ ${got}/${max}`)),
    h("section", { class: "week-info" },
      h("p", { class: "due" }, dueText(week.due)),
      week.note ? h("p", { class: "note" }, "📌 ", week.note) : null),
    h("h2", { class: "section-title" }, "Välj en övning"),
    h("section", { class: "modes" },
      MODES.filter((m) => !m.sentences || sentencesOk).map((m) =>
        h("button", { class: "mode-card", onclick: () => { location.hash = `#/w/${week.id}/${m.id}`; } },
          h("span", { class: "mode-icon" }, m.icon),
          h("span", { class: "mode-name" }, m.name),
          h("span", { class: "mode-desc" }, m.desc),
          starRow(p[m.id] || 0)))),
    h("h2", { class: "section-title" }, "Alla ord"),
    h("section", { class: "word-list" },
      week.words.map((w) => h("div", { class: "word-row" },
        h("span", { class: "sv" }, w.sv),
        h("span", { class: "en" }, w.en),
        speakBtn(w.en)))),
  );
}

/* ---------- router ---------- */

function route() {
  document.querySelectorAll(".confetti").forEach((c) => c.remove());
  if ("speechSynthesis" in window) speechSynthesis.cancel();
  const [, page, weekId, modeId] = location.hash.split("/");
  window.scrollTo(0, 0);
  if (page === "w") {
    const week = WEEKS.find((w) => w.id === decodeURIComponent(weekId || ""));
    if (week) {
      const mode = MODES.find((m) => m.id === modeId);
      return mode ? mode.run(week, mode) : weekPage(week);
    }
  }
  homePage();
}
window.addEventListener("hashchange", route);
route();

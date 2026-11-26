/* ==========================================================================
   QUIZ  (js/quiz.js)
   ==========================================================================
   Quizdelen: spil alene og nå 100 % i hver quiz (inspireret af Seterra).

   En quiz er ét kortsæt. Kategorierne samler sættene:
     quizCategory: "Alinea"   i sætfilen lægger sættet i kategorien "Alinea".
                              Uden quizCategory er sættet sin egen kategori.
     quizIcon: "⚜"            tegnet i det runde segl. Uden quizIcon bruges
                              sættets første bogstav.
   Sæt med menu: false er ikke med.

   Skærmene: scr-quiz (kategorier) → scr-quizcat (quizzer i en kategori)
   → scr-quizset (quizsiden med Spil, Lær og højeste score).
   "Spil" starter den quiztilstand, der er valgt under Indstillinger:
   Mestring (tilstand A) eller Overlevelse (B). "Øv fejl" tilbydes kun på
   slutskærmen lige efter et spil med fejl.
   En kategori med kun én quiz springer direkte til quizsiden.

   Scorerne gemmes i browseren (localStorage) under "htl-quiz-<sæt-id>":
     { a: {right, exact, total, ms},   bedste resultat i Spil (tilstand A)
       b: {placed, total} }            bedste resultat i Overlevelse (B)
   Alle nøgler laves af scoreKey(), så profiler (flere elever på samme
   computer) senere kun kræver en ændring dét ene sted.
   ========================================================================== */
(function () {
  var Sets = window.TimelineSets;
  var $ = function (sel) { return document.querySelector(sel); };
  var esc = function (t) { return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };

  /* ---- Gemte scorer ---- */
  function scoreKey(setId) { return "htl-quiz-" + setId; }
  function getScore(setId) {
    try { return JSON.parse(localStorage.getItem(scoreKey(setId))) || {}; } catch (e) { return {}; }
  }
  function putScore(setId, score) {
    try { localStorage.setItem(scoreKey(setId), JSON.stringify(score)); } catch (e) {}
  }
  // Er resultat n bedre end det gamle o? Først flest rigtige, så flest præcise årstal, så hurtigst.
  function betterA(n, o) {
    if (!o) return true;
    var nr = n.right / n.total, or = o.right / o.total;
    if (nr !== or) return nr > or;
    var ne = n.exact / n.total, oe = o.exact / o.total;
    if (ne !== oe) return ne > oe;
    return n.ms < o.ms;
  }
  // Gemmer et resultat fra Spil (A), hvis det er en ny rekord. Svarer true ved ny rekord.
  function saveA(setId, result) {
    var s = getScore(setId);
    if (!betterA(result, s.a)) return false;
    s.a = { right: result.right, exact: result.exact, total: result.total, ms: result.ms };
    putScore(setId, s); return true;
  }
  // Gemmer et resultat fra Overlevelse (B), hvis det er en ny rekord.
  function saveB(setId, result) {
    var s = getScore(setId);
    if (!result.total || (s.b && s.b.placed / s.b.total >= result.placed / result.total)) return false;
    s.b = { placed: result.placed, total: result.total };
    putScore(setId, s); return true;
  }
  // Husker de kort, man fejlede i sidste spil, så "Øv fejl" kan bruges senere.
  // Efter en øvelse er listen de kort, man stadig fejlede.
  function setMisses(setId, ids) {
    var s = getScore(setId);
    if (ids.length) s.m = ids; else delete s.m;
    putScore(setId, s);
  }
  function misses(setId) {
    var ids = getScore(setId).m || [], deck = {};
    Sets.deckCards(setId).forEach(function (c) { deck[c.id] = 1; });
    return ids.filter(function (id) { return deck[id]; });   // kort, der er fjernet fra sættet, springes over
  }

  /* ---- Quiztilstand: "mestring" eller "overlevelse" ---- */
  // Valget gemmes i browseren; standarden står i indstillinger.js (quizTilstand).
  var MODES = {
    mestring: { name: "Mestring", desc: "3 forsøg pr. kort. Nå 100 % rigtige." },
    overlevelse: { name: "∞ Overlevelse", desc: "Én fejl, og det er slut. Hvor langt kan du nå?" }
  };
  function quizMode() {
    var m = null;
    try { m = localStorage.getItem("htl-quizTilstand"); } catch (e) {}
    if (!MODES[m]) m = (window.EPOKE_INDSTILLINGER || {}).quizTilstand;
    return MODES[m] ? m : "overlevelse";
  }
  function setQuizMode(m) { try { localStorage.setItem("htl-quizTilstand", m); } catch (e) {} }

  /* ---- Kort på hånden: "duel" eller "quiz" (Mestring og Overlevelse) ---- */
  // Valget gemmes i browseren som "htl-haand-duel" / "htl-haand-quiz";
  // standarden står i indstillinger.js (kortPaaHaanden / quizKortPaaHaanden).
  function handMax() { return (window.EPOKE_INDSTILLINGER || {}).maksKortPaaHaanden || 10; }
  function handSize(kind) {
    var I = window.EPOKE_INDSTILLINGER || {}, n = null;
    try { n = parseInt(localStorage.getItem("htl-haand-" + kind), 10); } catch (e) {}
    if (!(n >= 1)) n = kind === "duel" ? (I.kortPaaHaanden ?? 5) : (I.quizKortPaaHaanden ?? I.overlevelseKortPaaHaanden ?? 3);
    return Math.max(1, Math.min(handMax(), n));
  }
  function setHandSize(kind, n) {
    n = Math.max(1, Math.min(handMax(), n));
    try { localStorage.setItem("htl-haand-" + kind, String(n)); } catch (e) {}
    return n;
  }

  /* ---- Quizzer og kategorier ---- */
  // Sæt med menu: false og valgfrie sæt, der er slået fra (fx Jul), er ikke med.
  function quizSets() { return Sets.list().filter(Sets.shown); }
  // Antal kort, der skal lægges (kortene på bordet fra start tæller ikke med).
  function cardCount(setId) {
    var start = Sets.startCards(setId);
    return Sets.deckCards(setId).filter(function (c) { return start.indexOf(c.id) < 0; }).length;
  }
  function categories() {
    var cats = [], byName = {};
    quizSets().forEach(function (d) {
      var name = d.quizCategory || d.name;
      if (!byName[name]) { byName[name] = { name: name, sets: [] }; cats.push(byName[name]); }
      byName[name].sets.push(d);
    });
    return cats;
  }
  // Andel rigtige og præcise (0–1) for én quiz. Ikke spillet = 0.
  function progress(setId) {
    var a = getScore(setId).a;
    return a ? { right: a.right / a.total, exact: a.exact / a.total } : { right: 0, exact: 0 };
  }
  // Gennemsnit for en kategori.
  function catProgress(cat) {
    var r = 0, e = 0;
    cat.sets.forEach(function (d) { var p = progress(d.id); r += p.right; e += p.exact; });
    return { right: r / cat.sets.length, exact: e / cat.sets.length };
  }

  /* ---- Tegning ---- */
  function pct(x) { return Math.floor(x * 100 + 1e-9); }   // 99,6 % vises som 99 %: kun alt rigtigt er 100 %
  function time(ms) { var s = Math.round(ms / 1000); return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0"); }
  function seal(d) { return '<span class="qr-seal" aria-hidden="true">' + esc(d.quizIcon || (d.name || "?").charAt(0)) + '</span>'; }
  // Den stablede bjælke: hele den farvede del = rigtige, den lyse del inden i = præcise årstal.
  function bar(p) {
    return '<span class="qbar" aria-hidden="true"><span class="qbar-right" style="width:' + (p.right * 100) + '%"></span><span class="qbar-exact" style="width:' + (p.exact * 100) + '%"></span></span>';
  }
  // Sæt med menuColor (fx Alineas orange) får samme farve som i "Vælg kortsæt".
  // Andre sæt får det lyse pergament.
  function look(d) {
    if (!d) return "";
    if (d.menuColor) return { cls: " set-accent", style: ' style="--set-accent:' + esc(d.menuColor) + '"' };
    return "";
  }
  function row(attrs, icon, name, sub, p, d) {
    var done = p.right >= 1, l = look(d) || { cls: "", style: "" };
    return '<button class="quiz-row' + (done ? ' done' : '') + l.cls + '"' + l.style + ' ' + attrs + '>' + icon +
      '<span class="qr-main"><span class="qr-name">' + esc(name) + '</span>' + bar(p) +
      '<span class="qr-sub">' + sub + '</span></span>' +
      '<span class="qr-pct"><b>' + pct(p.right) + ' %</b>' + (p.exact > 0 ? '<small>★ ' + pct(p.exact) + ' %</small>' : '') + '</span>' +
      '<span class="qr-chev" aria-hidden="true">›</span></button>';
  }
  function renderCats() {
    $("#quiz-cats").innerHTML = categories().map(function (cat, i) {
      var n = cat.sets.length, sub = n === 1 ? cardCount(cat.sets[0].id) + " kort" : n + " quizzer";
      return row('data-cat="' + i + '"', seal(cat.sets[0]), cat.name, sub, catProgress(cat), cat.sets[0]);
    }).join("");
  }
  var curCat = null, curSet = null;
  function renderCat(i) {
    var cat = categories()[i]; curCat = i;
    $("#quizcat-title").textContent = cat.name;
    $("#quiz-sets").innerHTML = cat.sets.map(function (d) {
      return row('data-set="' + esc(d.id) + '"', seal(d), d.name, cardCount(d.id) + " kort" + (d.description ? " · " + esc(d.description) : ""), progress(d.id), d);
    }).join("");
  }
  function renderSet(setId) {
    var d = Sets.get(setId), s = getScore(setId), total = cardCount(setId); curSet = setId;
    $("#quizset-title").textContent = d.name;
    $("#quizset-meta").innerHTML = '<span class="quiz-count">' + total + ' kort</span>' + (d.description ? esc(d.description) : "");
    // Kun højeste score i den valgte quiztilstand
    var a = s.a, b = s.b, mode = quizMode();
    $("#quizset-best").innerHTML = mode === "mestring"
      ? '<div class="qb-row"><span class="qb-mode">Mestring</span>' +
        (a ? '<span class="qb-main">' + bar({ right: a.right / a.total, exact: a.exact / a.total }) +
             '<span class="qb-nums"><b>' + pct(a.right / a.total) + ' %</b> · ' + a.right + ' af ' + a.total + ' rigtige · ★ ' + a.exact + ' præcise · ' + time(a.ms) + '</span></span>'
           : '<span class="qb-none">Ikke spillet endnu</span>') + '</div>'
      : '<div class="qb-row"><span class="qb-mode">∞ Overlevelse</span>' +
        (b ? '<span class="qb-main"><span class="qb-frac"><b>' + b.placed + '</b>/' + b.total + '</span><span class="qb-nums">kort i træk uden fejl</span></span>'
           : '<span class="qb-none">Ikke spillet endnu</span>') + '</div>';
    $("#quiz-play-mode").textContent = MODES[mode].name;
    var single = categories()[curCat] && categories()[curCat].sets.length === 1;
    $("#quizset-back").dataset.screen = single || curCat == null ? "quiz" : "quizcat";
  }

  /* ---- Lær: hele tidslinjen i rigtig rækkefølge ---- */
  function renderLearn(setId) {
    var G = window.EpokeGame, d = Sets.get(setId);
    $("#learn-title").textContent = "Lær: " + d.name;
    var cards = Sets.deckCards(setId).slice().sort(function (a, b) { return a.year - b.year; });
    $("#learn-list").innerHTML = cards.map(function (c) {
      var yr = String(G ? G.year(c.year) : c.year);
      if (c.approx && yr.indexOf("ca.") < 0) yr = "ca. " + yr;   // omtrentligt årstal
      return '<li><button class="learn-row" data-learn="' + esc(c.id) + '">' +
        '<span class="learn-year">' + esc(yr) + '</span>' +
        '<span class="learn-dot" aria-hidden="true"></span>' +
        '<span class="learn-card">' + (G ? G.card(c, { face: "year", style: "--w:96px" }) : "") + '</span>' +
        '<span class="learn-text"><b>' + esc(c.title) + '</b><span>' + esc(c.desc) + '</span></span>' +
        '</button></li>';
    }).join("");
    $("#learn-list").querySelectorAll(".pc-q").forEach(function (b) { b.remove(); });
    if (G) requestAnimationFrame(function () { G.fit($("#learn-list")); });
  }

  /* ---- Indstillinger: kort på hånden, quiztilstand og valgfrie kortsæt (fx Jul) ---- */
  function renderHand(kind) {
    var n = handSize(kind);
    $("#settings-hand-" + kind).innerHTML =
      '<span class="sh-label"><strong>Kort på hånden</strong><small>' + (kind === "duel" ? "Hver spiller starter med så mange kort" : "Gælder både Mestring og Overlevelse") + '</small></span>' +
      '<button type="button" data-hand="' + kind + '" data-d="-1" aria-label="Færre kort"' + (n <= 1 ? " disabled" : "") + '>−</button>' +
      '<output aria-live="polite">' + n + '</output>' +
      '<button type="button" data-hand="' + kind + '" data-d="1" aria-label="Flere kort"' + (n >= handMax() ? " disabled" : "") + '>+</button>';
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-hand]");
    if (!b) return;
    setHandSize(b.dataset.hand, handSize(b.dataset.hand) + Number(b.dataset.d));
    renderHand(b.dataset.hand);
  });
  function renderSettings() {
    renderHand("duel"); renderHand("quiz");
    var cur = quizMode();
    $("#settings-quizmode").innerHTML = Object.keys(MODES).map(function (m) {
      return '<label class="settings-set"><input type="radio" name="quizmode" data-quizmode="' + m + '"' + (m === cur ? " checked" : "") + '>' +
        '<span><strong>' + esc(MODES[m].name) + '</strong><small>' + esc(MODES[m].desc) + '</small></span></label>';
    }).join("");
    var ids = Sets.optionalIds();
    $("#settings-sets").innerHTML = ids.length ? ids.map(function (id) {
      var d = Sets.get(id);
      return '<label class="settings-set"><input type="checkbox" data-set-toggle="' + esc(id) + '"' + (Sets.isOn(id) ? " checked" : "") + '>' +
        '<span><strong>' + esc(d.name) + '</strong><small>' + esc(d.description || "") + '</small></span></label>';
    }).join("") : '<p class="muted">Der er ingen ekstra kortsæt.</p>';
  }
  document.addEventListener("change", function (e) {
    var t = e.target.closest && e.target.closest("[data-set-toggle]");
    if (t) Sets.setOn(t.dataset.setToggle, t.checked);
    var q = e.target.closest && e.target.closest("[data-quizmode]");
    if (q && q.checked) setQuizMode(q.dataset.quizmode);
  });

  /* ---- Fremgang øverst i Quiz: gennemsnittet af alle quizzer ---- */
  function renderHome() {
    var el = $("#home-progress"); if (!el) return;
    var sets = quizSets(), played = sets.some(function (d) { return getScore(d.id).a; });
    var p = catProgress({ sets: sets });
    el.innerHTML = played
      ? '<span class="hp-label">Din fremgang</span>' + bar(p) + '<span class="hp-nums"><b>' + pct(p.right) + ' %</b>' + (p.exact > 0 ? ' · ★ ' + pct(p.exact) + ' %' : '') + '</span>'
      : '<span class="hp-label">Din fremgang</span>' + bar(p) + '<span class="hp-nums">Prøv din første quiz</span>';
    el.setAttribute("aria-label", played ? "Din fremgang: " + pct(p.right) + " procent rigtige" : "Prøv din første quiz");
  }

  /* ---- Skift skærm ---- */
  function show(name) {
    if (name === "quiz") renderCats();
    if (name === "quizcat" && curCat != null) renderCat(curCat);
    if (name === "quizset" && curSet) renderSet(curSet);
    if (name === "learn" && curSet) renderLearn(curSet);
    if (name === "quiz") renderHome();
    if (name === "settings") renderSettings();
    // EpokeGame.screen skifter skærm og husker den i browserens historik (tilbage-knappen)
    if (window.EpokeGame) window.EpokeGame.screen(name);
    else document.querySelectorAll(".screen").forEach(function (e) { e.classList.toggle("show", e.id === "scr-" + name); });
    var scr = $("#scr-" + name); if (scr) scr.scrollTop = 0;
  }
  function openSet(setId) { curSet = setId; show("quizset"); }


  // Starter den quiztilstand, der er valgt under Indstillinger
  function startGame() {
    if (!curSet || !window.EpokeGame) return;
    if (quizMode() === "overlevelse") window.EpokeGame.startSurvival(curSet);
    else window.EpokeGame.startQuiz(curSet);
  }
  $("#quiz-play").onclick = startGame;
  $("#quiz-learn").onclick = function () { show("learn"); };
  $("#learn-play").onclick = startGame;

  document.addEventListener("click", function (e) {
    var l = e.target.closest("#learn-list [data-learn]");
    if (l) { if (window.EpokeGame) window.EpokeGame.info(l.dataset.learn); return; }
    var go = e.target.closest("[data-screen]");
    if (go) { show(go.dataset.screen); return; }
    var c = e.target.closest("#quiz-cats [data-cat]");
    if (c) {
      var cat = categories()[+c.dataset.cat]; curCat = +c.dataset.cat;
      if (cat.sets.length === 1) openSet(cat.sets[0].id); else show("quizcat");
      return;
    }
    var s = e.target.closest("#quiz-sets [data-set]");
    if (s) openSet(s.dataset.set);
  });

  // Det, spillet (js/spil.js) og test kan bruge:
  window.EpokeQuiz = { quizMode: quizMode, setQuizMode: setQuizMode, handSize: handSize, setHandSize: setHandSize, scoreKey: scoreKey, getScore: getScore, saveA: saveA, saveB: saveB, setMisses: setMisses, misses: misses, bar: bar, cardCount: cardCount, categories: categories, show: show, openSet: openSet, get current() { return curSet; } };
})();

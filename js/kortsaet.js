/* ==========================================================================
   KORTSÆT-REGISTRET  (js/kortsaet.js)
   ==========================================================================
   Holder styr på alle kortsæt. Hver fil i sets/ kalder registerSet({...}),
   og spillet (js/spil.js) spørger herefter registret om kort, bunker,
   startkort, menu, musik og udseende via window.TimelineSets.

   Rækkefølgen af <script src="sets/...">-linjerne i index.html bestemmer
   rækkefølgen i menuen "Vælg kortsæt". Det første sæt er standard.

   Hvilke felter et sæt og et kort kan have, er beskrevet i LÆS-MIG.md.
   ========================================================================== */

// Kortbilleder: kort-id -> billedadresse. Spillet slår op her, når et kort tegnes.
window.EMBED = {};

window.TimelineSets = (function () {
  var sets = [];            // alle sæt i den rækkefølge, de er registreret
  var byId = {};            // sæt-id -> sæt
  var setOf = new Map();    // kort -> det sæt, kortet kommer fra
  var audio = {};           // sæt-id -> sættets musik (oprettes først, når den skal spilles)

  // Kaldes af hver sætfil. Udfylder manglende felter og husker sættet.
  function registerSet(def) {
    if (!def || !def.id) { console.error("registerSet: sættet mangler et id", def); return; }
    if (byId[def.id]) { console.error("registerSet: id findes allerede: " + def.id); return; }
    def.name = def.name || def.id;
    def.cards = def.cards || [];
    def.startCards = def.startCards || [];
    def.images = def.images || ("images/" + def.id + "/");
    def.cards.forEach(function (card) {
      if (!card.id || card.year == null || !card.title) { console.error("Kort i sættet " + def.id + " mangler id, year eller title", card); return; }
      card.set = card.label || def.name;          // teksten nederst på kortet
      if (card.era == null) card.era = def.name;  // bestemmer kortets farver
      if (card.desc == null) card.desc = "";
      if (card.tip == null) card.tip = "";
      // Billedet: en fuld adresse bruges som den er; ellers ligger filen i sættets billedmappe.
      if (card.image) window.EMBED["kort/" + card.id] = /^(https?:|data:|\/)/.test(card.image) ? card.image : def.images + card.image;
    });
    sets.push(def); byId[def.id] = def;
  }

  // Alle kort fra alle sæt (undtagen "combine"-sæt, der ikke har egne kort).
  // Et kort-id, der findes to gange, springes over og skrives i konsollen (F12).
  var all = null;
  function allCards() {
    if (all) return all;   // beregnes kun én gang
    var seen = {};
    all = [];
    sets.forEach(function (def) {
      if (def.combine) return;
      def.cards.forEach(function (card) {
        if (!card.id || card.year == null || !card.title) return;
        if (seen[card.id]) { console.error("Kort-id findes to gange: " + card.id + " (" + seen[card.id] + " og " + def.id + ")"); return; }
        seen[card.id] = def.id; setOf.set(card, def); all.push(card);
      });
    });
    return all;
  }

  // Find et sæt ud fra id. Ukendt id giver det første sæt, der vises i menuen.
  function get(id) { return byId[id] || sets.filter(shown)[0] || sets[0]; }

  // Valgfrie kortsæt (fx Jul) kan slås til og fra under "Indstillinger" på forsiden.
  // Standarden står i indstillinger.js (valgfrieKortsaet); spillerens eget valg
  // gemmes i browseren som "htl-saet-<id>" og går forud for standarden.
  function optionalIds() {
    var o = (window.EPOKE_INDSTILLINGER || {}).valgfrieKortsaet || {};
    return Object.keys(o).filter(function (id) { return byId[id]; });
  }
  function isOn(id) {
    var o = (window.EPOKE_INDSTILLINGER || {}).valgfrieKortsaet || {};
    if (!(id in o)) return true;
    try { var v = localStorage.getItem("htl-saet-" + id); if (v !== null) return v === "true"; } catch (e) {}
    return !!o[id];
  }
  function setOn(id, on) { try { localStorage.setItem("htl-saet-" + id, on ? "true" : "false"); } catch (e) {} }
  // Vises sættet i menuerne ("Vælg kortsæt" og Quiz)?
  function shown(d) { return d.menu !== false && isOn(d.id); }

  // Kortene i bunken for et sæt: sættets egne kort + kort fra "include"-sæt
  // + enkeltkort fra "reuse". Et "combine"-sæt får alle kort (undtagen sæt med inTotal: false).
  function deckCards(id) {
    var def = get(id);
    if (!def) return [];
    if (def.combine) return allCards().filter(function (c) { return setOf.get(c).inTotal !== false; });
    var inc = def.include || [], reuse = def.reuse || [];
    return allCards().filter(function (c) { var s = setOf.get(c); return s === def || inc.indexOf(s.id) >= 0 || reuse.indexOf(c.id) >= 0; });
  }

  // De kort, der ligger på tidslinjen fra start (startCards i sætfilen, ellers det første kort).
  function startCards(id) {
    var def = get(id);
    if (!def) return [];
    if (def.startCards.length) return def.startCards.slice();
    var deck = deckCards(id);
    return deck.length ? [deck[0].id] : [];
  }

  // Startkortene til ét spil. Der trækkes lige så mange kort, som sættets
  // startCards angiver, men tilfældigt, så det ikke er de samme hver gang.
  // De spredes i tid: bunken sorteres efter årstal og deles i lige store dele,
  // og der tages ét tilfældigt kort fra hver del.
  // Sæt i indstillingen fasteStartkort (fx Jul) bruger altid deres faste startCards.
  // avoid: kort-id'er, der ikke må blive startkort (fx kortene i "Øv fejl").
  function pickStartCards(id, avoid) {
    var def = get(id);
    if (!def) return [];
    var faste = (window.EPOKE_INDSTILLINGER || {}).fasteStartkort || [];
    if (faste.indexOf(def.id) >= 0) return startCards(id);
    var n = startCards(id).length;
    avoid = avoid || [];
    var deck = deckCards(id).filter(function (c) { return avoid.indexOf(c.id) < 0; });
    if (deck.length <= n) return startCards(id);   // for få kort: brug de faste
    deck.sort(function (a, b) { return a.year - b.year; });
    var valgt = [];
    for (var i = 0; i < n; i++) {
      var fra = Math.floor(i * deck.length / n), til = Math.floor((i + 1) * deck.length / n);
      valgt.push(deck[fra + Math.floor(Math.random() * (til - fra))].id);
    }
    return valgt;
  }

  // Gør tekst sikker at sætte ind i HTML (så fx "<" ikke tolkes som et tag).
  function esc(t) { return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  // Bygger knapperne i menuen "Vælg kortsæt". Sæt med menu: false vises ikke.
  function buildMenu(box) {
    var menu = sets.filter(shown);
    box.innerHTML = menu.map(function (d, i) {
      var accent = d.menuStyle === "home" ? ' class="set-home"' : d.menuColor ? ' class="set-accent" style="--set-accent:' + esc(d.menuColor) + '"' : "";
      return '<label' + accent + '><input type="radio" name="cards" value="' + esc(d.id) + '"' + (i === 0 ? " checked" : "") + '><span><strong>' + esc(d.name) + '</strong><small>' + esc(d.description || "") + '</small></span></label>';
    }).join("");
  }

  // Skifter udseende efter sættet: klasserne set-<id>, set-bg og set-snow på <body>
  // og CSS-variablen --set-bg med sættets baggrundsbillede.
  function applyLook(id) {
    var b = document.body, def = id ? get(id) : null;
    sets.forEach(function (d) { b.classList.remove("set-" + d.id); });
    if (def) b.classList.add("set-" + def.id);
    b.classList.toggle("set-bg", !!(def && def.background));
    b.classList.toggle("set-snow", !!(def && def.snow));
    // Stien gøres til en fuld adresse, så den peger rigtigt, selv om CSS-filen ligger i mappen css/.
    if (def && def.background) document.documentElement.style.setProperty("--set-bg", 'url("' + new URL(def.background, document.baseURI).href + '")');
  }

  // Sættets egen musik (music i sætfilen), eller null, hvis sættet ikke har nogen.
  function musicFor(id) {
    var def = id ? get(id) : null;
    if (!def || !def.music) return null;
    if (!audio[def.id]) { audio[def.id] = new Audio(def.music); audio[def.id].loop = true; }
    return audio[def.id];
  }
  function allMusic() { return Object.keys(audio).map(function (k) { return audio[k]; }); }
  function pauseAllMusic() { allMusic().forEach(function (a) { a.pause(); }); }

  // Opslag: kort-id -> emoji / Wikipedia-titel.
  function emojis() { var o = {}; allCards().forEach(function (c) { if (c.emoji) o[c.id] = c.emoji; }); return o; }
  function wikiTitles() { var o = {}; allCards().forEach(function (c) { if (c.wikiTitle) o[c.id] = c.wikiTitle; }); return o; }

  // Sætter sættenes credits (credits i sætfilen) ind i dialogen "Kilder", når siden er indlæst.
  function addCredits() {
    var ul = document.getElementById("credits-music"), box = document.getElementById("credits-sets");
    sets.slice().reverse().forEach(function (d) { if (d.credits && d.credits.music && ul) ul.insertAdjacentHTML("afterbegin", d.credits.music); });
    sets.forEach(function (d) { if (d.credits && d.credits.html && box) box.insertAdjacentHTML("beforeend", d.credits.html); });
  }
  document.addEventListener("DOMContentLoaded", addCredits);

  // Det, resten af spillet kan bruge:
  return {
    register: registerSet, list: function () { return sets.slice(); }, get: get,
    shown: shown, optionalIds: optionalIds, isOn: isOn, setOn: setOn, firstId: function () { var d = get(); return d ? d.id : "classic"; },
    allCards: allCards, deckCards: deckCards, startCards: startCards, pickStartCards: pickStartCards, buildMenu: buildMenu, applyLook: applyLook,
    musicFor: musicFor, allMusic: allMusic, pauseAllMusic: pauseAllMusic, emojis: emojis, wikiTitles: wikiTitles
  };
})();

// Sætfilerne kalder blot registerSet({...}).
window.registerSet = window.TimelineSets.register;

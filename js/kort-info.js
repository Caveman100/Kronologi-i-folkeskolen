/* ==========================================================================
   INFOBOKS VED KORTENE  (js/kort-info.js)
   ==========================================================================

   Når man holder musen over et kort (eller holder fingeren på det på en
   touchskærm), dukker en boks op til højre for kortet med kortets
   beskrivelse. Boksen har samme ramme og pergament som kortene.

   (?)-knappen på kortet viser derimod kun kilderne (se openInfo i js/spil.js).

   Tiderne står i indstillinger.js: kortInfoHoverMs og kortInfoLangtTrykMs.
   Udseendet står i css/spil.css under "DEL 24 · INFOBOKS VED KORTENE".
   ========================================================================== */

(function () {
  var INDST = window.EPOKE_INDSTILLINGER || {};
  var HOVER_MS = INDST.kortInfoHoverMs ?? 300;
  var TRYK_MS = INDST.kortInfoLangtTrykMs ?? 450;
  var FLYT_PX = 10;   // så meget må fingeren flytte sig, før det tæller som at trække

  /* ---- Kortene slås op på id (alle sæt er indlæst, før denne fil kører) ---- */
  var kort = null;
  function findKort(id) {
    if (!kort) {
      kort = {};
      window.TimelineSets.allCards().forEach(function (c) { kort[c.id] = c; });
    }
    return kort[id];
  }

  /* Teksten i boksen: beskrivelsen, og det der står i tip før "Kilder:"
     (fx "I historiekanonen: Jellingstenen"). Kilderne vises i (?). */
  function ekstraTekst(c) {
    var tip = c.tip || "", i = tip.indexOf("Kilder:");
    return i < 0 ? "" : tip.slice(0, i).trim();
  }

  /* ---- Selve boksen ---- */
  var boks = document.createElement("div");
  boks.id = "kort-info";
  boks.setAttribute("popover", "manual");   // popover: ligger øverst, også over et løftet kort
  boks.setAttribute("aria-hidden", "true");
  boks.innerHTML = '<div class="ki-in"><p class="ki-desc"></p><p class="ki-ekstra"></p></div>';
  document.body.appendChild(boks);

  var aktivt = null;     // kortet, boksen hører til lige nu
  var timer = null;      // venter på hover / langt tryk
  var tryk = null;       // igangværende touch-tryk: {id, x, y, kort}
  var slugKlik = false;  // efter et langt tryk må slip-klikket ikke vælge kortet

  // Det element, boksen hører til: et kort med forside, der kan slås op (ikke
  // kortet inde i (?)-dialogen), eller en hel række på Lær-siden, hvor rækken
  // er det, man peger på (kortet selv tager ikke imod musen der).
  function kortUnder(el) {
    if (!el || !el.closest) return null;
    var anker = el.closest("#learn-list .learn-row") || el.closest(".pc[data-zoom]");
    if (!anker || anker.closest("#info-dialog")) return null;
    var pc = kortI(anker);
    return pc && findKort(pc.dataset.zoom) ? anker : null;
  }
  function kortI(anker) { return anker.matches(".pc") ? anker : anker.querySelector(".pc[data-zoom]"); }

  function vis(anker) {
    var pc = kortI(anker), c = pc && findKort(pc.dataset.zoom);
    if (!c || !c.desc && !ekstraTekst(c)) return;
    aktivt = anker;
    boks.querySelector(".ki-desc").textContent = c.desc || "";
    boks.querySelector(".ki-ekstra").textContent = ekstraTekst(c);
    // Samme rammefarve som kortet (blå, grøn eller rød for Historiekanon)
    var css = getComputedStyle(pc);
    ["--fr", "--fr2"].forEach(function (v) { boks.style.setProperty(v, css.getPropertyValue(v)); });
    boks.classList.add("vis");
    try { if (!boks.matches(":popover-open")) boks.showPopover(); } catch (e) { /* ældre browser: .vis er nok */ }
    placer();
    requestAnimationFrame(foelg);
  }

  function skjul() {
    clearTimeout(timer); timer = null;
    if (!aktivt) return;
    aktivt = null;
    boks.classList.remove("vis");
    try { if (boks.matches(":popover-open")) boks.hidePopover(); } catch (e) {}
  }

  // Til højre for kortet (Lær: rækken); er der ikke plads, så til venstre; ellers over/under.
  function placer() {
    if (!aktivt) return;
    var r = aktivt.getBoundingClientRect(), w = boks.offsetWidth, h = boks.offsetHeight, luft = 10, kant = 8;
    var left = r.right + luft, top = r.top;
    if (left + w > innerWidth - kant) left = r.left - luft - w;
    if (left < kant) {
      left = Math.max(kant, Math.min(innerWidth - w - kant, r.left + r.width / 2 - w / 2));
      top = r.top - h - luft;
      if (top < kant) top = r.bottom + luft;
    }
    top = Math.max(kant, Math.min(innerHeight - h - kant, top));
    boks.style.left = left + "px";
    boks.style.top = top + "px";
  }

  // Mens boksen vises: følg kortet (det kan løfte sig eller flytte), og skjul
  // boksen, hvis kortet forsvinder (ny tur, ny skærm).
  function foelg() {
    if (!aktivt) return;
    if (!aktivt.isConnected || !aktivt.getClientRects().length || document.body.classList.contains("dragging")) { skjul(); return; }
    placer();
    requestAnimationFrame(foelg);
  }

  /* ---- Mus: hover ---- */
  document.addEventListener("pointerover", function (e) {
    if (e.pointerType === "touch" || e.buttons) return;
    var anker = kortUnder(e.target);
    if (!anker || anker === aktivt) return;
    skjul();
    timer = setTimeout(function () { if (anker.isConnected && anker.matches(":hover")) vis(anker); }, HOVER_MS);
  });
  document.addEventListener("pointerout", function (e) {
    if (e.pointerType === "touch") return;
    var anker = kortUnder(e.target);
    if (anker && !anker.contains(e.relatedTarget)) skjul();
  });

  /* ---- Touch: langt tryk ---- */
  document.addEventListener("pointerdown", function (e) {
    if (e.pointerType !== "touch") { skjul(); return; }   // museklik: væk med boksen
    skjul();
    var anker = kortUnder(e.target);
    // Ikke på knapperne og felterne på selve kortet: (?), byt, årstal
    if (!anker || e.target.closest(".pc-q,.pc-swap,.pc-tipbtn,.pc-guess,input")) return;
    tryk = { id: e.pointerId, x: e.clientX, y: e.clientY, kort: anker };
    timer = setTimeout(function () { if (tryk) { tryk.vist = true; vis(tryk.kort); } }, TRYK_MS);
  }, true);
  document.addEventListener("pointermove", function (e) {
    if (!tryk || e.pointerId !== tryk.id) return;
    if (Math.hypot(e.clientX - tryk.x, e.clientY - tryk.y) > FLYT_PX) { tryk = null; skjul(); }   // fingeren trækker kortet
  }, true);
  function slip(e) {
    if (!tryk || e.pointerId !== tryk.id) return;
    if (tryk.vist && e.type === "pointerup") { slugKlik = true; setTimeout(function () { slugKlik = false; }, 400); }
    tryk = null; skjul();
  }
  document.addEventListener("pointerup", slip, true);
  document.addEventListener("pointercancel", slip, true);
  // Klikket efter et langt tryk skal ikke vælge eller lægge kortet
  window.addEventListener("click", function (e) {
    if (!slugKlik) return;
    slugKlik = false; e.stopImmediatePropagation(); e.preventDefault();
  }, true);
  // Ingen kopier/gem billede-menu ved langt tryk på et kort
  document.addEventListener("contextmenu", function (e) { if (kortUnder(e.target) && (tryk || aktivt)) e.preventDefault(); });

  /* ---- Skjul ved rul, ændret vinduesstørrelse, Escape og skift af fane ---- */
  window.addEventListener("resize", skjul);
  window.addEventListener("blur", skjul);
  document.addEventListener("scroll", skjul, true);
  window.addEventListener("keydown", function (e) { if (e.key === "Escape") skjul(); });
})();

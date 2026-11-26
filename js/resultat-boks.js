/* ==========================================================================
   RESULTATBOKSENS PLADS  (js/resultat-boks.js)
   ==========================================================================

   Boksen med "Rigtigt!" / "Forkert plads", der vises efter hvert svar,
   står midt på skærmen lige over kortene på tidslinjen. Er der ikke plads
   nok over kortene, rykker den op til toppen af skærmen.

   Afstanden til kortene står i indstillinger.js: resultatAfstandPx.
   Udseendet står i css/spil.css under "DEL 10 · RESULTATBOKSEN" og "DEL 26".
   ========================================================================== */

(function () {
  var INDST = window.EPOKE_INDSTILLINGER || {};
  var boks = document.getElementById("controls");
  if (!boks) return;

  function placer() {
    if (!boks.querySelector(".verdict")) { boks.style.removeProperty("--res-top"); return; }
    // Kort, der er midt i en animation (det nye kort vendes), tæller ikke med
    var kort = document.querySelectorAll("#timeline .pc:not(.flipin)");
    if (!kort.length) kort = document.querySelectorAll("#timeline .pc");
    if (!kort.length) return;
    var kortTop = Infinity;
    kort.forEach(function (k) { kortTop = Math.min(kortTop, k.getBoundingClientRect().top); });
    var afstand = INDST.resultatAfstandPx ?? 10, kant = 8;
    var top = Math.max(kant, kortTop - afstand - boks.offsetHeight);
    boks.style.setProperty("--res-top", Math.round(top) + "px");
  }
  // Vent en skærmopdatering, så tidslinjen og boksen har fået deres størrelse,
  // og tjek igen lidt senere, når spillet har tilpasset kortstørrelserne og
  // animationen af det nye kort er færdig.
  function snart() { requestAnimationFrame(placer); setTimeout(placer, 450); }

  new MutationObserver(snart).observe(boks, { childList: true, subtree: true });
  var tl = document.getElementById("timeline");
  if (tl) new MutationObserver(snart).observe(tl, { childList: true });
  // Når kortene eller boksen skifter størrelse
  if (window.ResizeObserver) {
    var ro = new ResizeObserver(function () { requestAnimationFrame(placer); });
    ro.observe(boks);
    if (tl) ro.observe(tl);
  }
  window.addEventListener("resize", snart);
})();

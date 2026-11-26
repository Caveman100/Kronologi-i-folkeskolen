/* ==========================================================================
   "DET ER TUREN TIL ..."-BOKSEN  (js/tur-boks.js)
   ==========================================================================
   Når turen går videre til en anden spiller (kun med 2 eller flere spillere),
   vises en lille boks midt på skærmen i et par sekunder.
   Spillets kode (js/spil.js) kalder window.showTurnBox(spiller, erDetMig).
   Hvor længe boksen vises, står i indstillinger.js (turBoksMs).
   Udseendet står i css/spil.css under "DEL 23".
   ========================================================================== */

(function () {
  let box = null;   // selve boksen (laves første gang, den skal bruges)
  let timer = 0;    // nedtællingen, der skjuler boksen igen

  function hide() {
    if (box) box.classList.remove("show");
    clearTimeout(timer);
  }

  function createBox() {
    box = document.createElement("div");
    box.id = "turn-note";
    box.className = "turn-box";
    box.setAttribute("role", "status");        // skærmlæsere læser teksten op
    box.setAttribute("aria-live", "polite");
    box.innerHTML = '<div class="t1"></div><div class="t2"><span class="pdot"></span><span class="nm"></span></div>';
    box.addEventListener("click", hide);       // et tryk lukker boksen med det samme
    document.body.appendChild(box);
  }

  window.showTurnBox = function (player, isMe) {
    if (!box) createBox();

    // Online og det er min tur: "Det er din tur". Ellers: "Det er turen til <navn>".
    const online = window.__game && window.__game.mode !== "local";
    const myTurnOnline = online && isMe;
    box.querySelector(".t1").textContent = myTurnOnline ? "Det er" : "Det er turen til";
    box.querySelector(".nm").textContent = myTurnOnline ? "din tur" : player.name;
    box.querySelector(".pdot").style.display = myTurnOnline ? "none" : "";   // farveprik for spilleren
    box.style.setProperty("--c", player.color || "#c9a24a");

    // Start animationen forfra (fjern "show", tving browseren til at opdatere, tilføj igen).
    clearTimeout(timer);
    box.classList.remove("show");
    void box.offsetWidth;
    box.classList.add("show");

    const ms = (window.EPOKE_INDSTILLINGER || {}).turBoksMs ?? 2200;
    timer = setTimeout(hide, ms);
  };
})();

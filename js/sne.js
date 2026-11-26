/* ==========================================================================
   SNE  (js/sne.js)
   ==========================================================================
   Tegner faldende sne over spillebordet, når det valgte kortsæt har
   snow: true i sin sætfil (i dag kun julesættet).
   Sneen tegnes på et <canvas> (et tegnelærred), der lægges ind i bordet.
   Brugere, der har bedt om "reduceret bevægelse" i styresystemet, får stillestående sne.
   ========================================================================== */

(function () {
  const canvas = document.createElement("canvas");
  canvas.id = "set-snow";
  canvas.setAttribute("aria-hidden", "true");   // skærmlæsere skal ignorere den
  const ctx = canvas.getContext("2d");
  if (!ctx) return;                             // browseren kan ikke tegne: ingen sne
  const motion = matchMedia("(prefers-reduced-motion: reduce)");

  let flakes = [];      // liste af snefnug
  let width = 0, height = 0;
  let previous = 0;     // tidspunktet for sidste tegning (ms)

  // Sne vises kun, når sættet har sne, og spilskærmen er fremme.
  function active() {
    return document.body.classList.contains("set-snow") && document.querySelector("#scr-game.show .table");
  }

  // Tilpas lærredet til bordets størrelse og lav nye snefnug.
  function resize(w, h) {
    width = w;
    height = h;
    const scale = Math.min(devicePixelRatio || 1, 2);   // skarpt på skærme med høj opløsning
    canvas.width = Math.round(w * scale);
    canvas.height = Math.round(h * scale);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);

    const count = Math.max(28, Math.min(135, Math.round(w * h / 9500)));   // flere fnug på store skærme
    flakes = Array.from({ length: count }, () => {
      const d = Math.random();   // "dybde": tæt på = større, hurtigere og tydeligere
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        radius: 0.65 + d * 1.65,
        speed: 8 + d * 16,              // pixels pr. sekund
        phase: Math.random() * 2 * Math.PI,
        opacity: 0.35 + d * 0.45,
      };
    });
  }

  // Kaldes af browseren ca. 60 gange i sekundet.
  function draw(time) {
    requestAnimationFrame(draw);
    const table = active();
    if (!table) { previous = 0; return; }
    if (canvas.parentNode !== table) table.prepend(canvas);

    const w = table.clientWidth, h = table.clientHeight;
    if (Math.abs(w - width) > 2 || Math.abs(h - height) > 2) resize(w, h);

    // Sekunder siden sidste tegning (højst 0,05, så sneen ikke "hopper" efter en pause).
    const dt = previous && !motion.matches ? Math.min((time - previous) / 1000, 0.05) : 0;
    previous = time;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#fffaf1";
    for (const f of flakes) {
      f.y += dt * f.speed;
      f.x += dt * (2 + 6 * Math.sin(time / 3400 + f.phase));   // let svajen fra side til side
      // Fnug, der forlader bordet, kommer ind fra den modsatte side.
      if (f.y > height + 3) f.y = -3;
      if (f.x > width + 3) f.x = -3;
      if (f.x < -3) f.x = width + 3;
      ctx.globalAlpha = f.opacity;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.radius, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  requestAnimationFrame(draw);
})();

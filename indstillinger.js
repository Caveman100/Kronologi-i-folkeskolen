/* ==========================================================================
   INDSTILLINGER FOR SPILLET  (indstillinger.js)
   ==========================================================================

   Her kan du ændre, hvordan spillet opfører sig, uden at rode i selve koden.
   Det svarer til en ordbog (dict i Python, list i R): navn: værdi.

   Regler for at redigere:
   - Tider er i millisekunder: 1000 = 1 sekund.
   - Gem filen og genindlæs siden (Ctrl+F5).
   - Står noget galt, kan du se fejlen i browserens konsol (tryk F12).

   Farver, billeder og kortstørrelser står i css/indstillinger.css.
   ========================================================================== */

window.EPOKE_INDSTILLINGER = {

  /* ----- Tider ----- */

  // Hvor længe resultatet ("Rigtigt!" / "Forkert plads") og kortets
  // beskrivelse vises efter et svar, før turen automatisk går videre.
  visResultatMs: 4800,

  // Det samme, når man spiller alene (Quiz, Overlevelse, Øv fejl). Her går
  // spillet også videre, så snart spilleren trykker på en tast eller klikker.
  visResultatAleneMs: 10000,

  // Hvor længe boksen "Det er turen til ..." vises, når turen skifter
  // (kun når der er 2 eller flere spillere).
  turBoksMs: 2200,

  // Infoboksen ved siden af et kort (beskrivelsen af begivenheden).
  // Med mus: boksen vises, når musen har holdt stille over kortet så længe.
  kortInfoHoverMs: 300,
  // På touchskærm: boksen vises, når man holder fingeren på kortet så længe.
  // Den forsvinder igen, når man slipper.
  kortInfoLangtTrykMs: 450,

  // Hvor længe de små beskeder nederst på skærmen vises.
  beskedMs: 2600,

  // Hvor længe beskeden "... byttede ... for ..." vises, når nogen bytter kort.
  byttebeskedMs: 4200,

  // Når man trækker et kort ud til kanten af tidslinjen, ruller den.
  // Tallet er hvor mange pixels den ruller pr. skærmopdatering (ca. 60 pr. sekund),
  // altså 5 = ca. 300 pixels i sekundet. Før rullede den ca. 3. Højere tal = hurtigere.
  tidslinjeRulPx: 5,

  /* ----- Kortenes størrelse ----- */

  // Hvor store kortene er i spillet, i procent af standardstørrelsen
  // (100 = standard, 120 = 20 % bredere, 80 = 20 % smallere).
  // Er der ikke plads på skærmen, gør spillet selv kortene mindre, så de
  // passer; et højt tal virker derfor kun, hvis skærmen er stor nok.
  kortStoerrelse: {
    egne: 100,        // dine egne kort på hånden
    tidslinje: 100,   // kortene på tidslinjen
    modspiller: 100,  // modspillernes kort (100 = ca. 80 % af arealet af dine egne)
  },

  /* ----- Nyt spil ----- */

  // Antal kort, hver spiller starter med på hånden i Duel (standard; spilleren
  // kan selv ændre det under "Indstillinger" på forsiden, og browseren husker det).
  kortPaaHaanden: 5,

  // Antal byttekort pr. spiller (bruges kun med 2 eller flere spillere).
  byttekort: 1,

  // Må man svare med et årstal på kortet? (true = ja, false = nej)
  gaetAarstal: true,

  // Antal kort på hånden i Quiz, både Mestring og Overlevelse (standard;
  // spilleren kan selv ændre det under "Indstillinger" på forsiden).
  quizKortPaaHaanden: 3,

  // Hvor mange kort man højst kan vælge at have på hånden under "Indstillinger".
  maksKortPaaHaanden: 10,

  // Antal forsøg pr. kort i Quiz (tilstanden "Spil"). Efter sidste forkerte
  // forsøg lyser den rigtige plads grønt.
  quizForsoeg: 3,

  // Hvilken slags quiz "Spil" starter, indtil spilleren selv vælger under
  // "Indstillinger" på forsiden (browseren husker valget):
  //   "mestring"    = 3 forsøg pr. kort, nå 100 % (scoren tæller i "Din fremgang")
  //   "overlevelse" = én fejl, og det er slut
  quizTilstand: "overlevelse",

  /* ----- Kortsæt ----- */

  // Kortsæt, der kan slås til og fra under "Indstillinger" på forsiden.
  // true = vist fra start, false = skjult fra start. Når en spiller slår et
  // sæt til eller fra, husker browseren valget, og det går forud for tallet her.
  // Sættets fil skal også stå i index.html (jul.js gør).
  valgfrieKortsaet: { jul: true },

  // Kortene på tidslinjen fra start trækkes tilfældigt for hvert spil (lige så
  // mange som startCards i sætfilen, spredt over hele perioden). Sæt i denne
  // liste bruger i stedet altid de faste startCards fra sætfilen.
  fasteStartkort: ["jul"],

  /* ----- Lyd ----- */

  // Musikkens lydstyrke, fra 0 (slukket) til 1 (fuld styrke).
  musikStyrke: 0.3,

  // Første gang musikken starter, begynder den svagt og bliver gradvist
  // kraftigere. Her står hvor svagt (andel af musikStyrke) og hvor længe.
  musikStartStyrke: 0.3,
  musikIndfadningMs: 5000,

  // Forsidemusikken ("Fiddle De Dee") spiller én gang, når forsiden vises, og
  // fader ind. Når et spil starter, fader den ud, og spillets musik tager over.
  // Når den er færdig, spiller den almindelige musik videre i menuerne.
  forsideMusikStyrke: 0.23,        // lydstyrke 0 til 1 (før: 0.28)
  forsideMusikStartStyrke: 0.4,    // starter svagt: andel af forsideMusikStyrke
  forsideMusikIndfadningMs: 8000,  // hvor længe indfadningen varer (ms)
  forsideMusikUdfadningMs: 2500,   // hvor længe udfadningen varer, når spillet starter (ms)
  forsideMusikStartSek: 34.2,      // hvor i nummeret den starter (sekunder)

  // Lydeffekternes styrke (bruges kun, hvis der ligger lydfiler i mappen lyde/).
  lydeffektStyrke: 0.7,

  /* ----- Online-spil ----- */

  // Adressen på den server (relay), der forbinder spillerne i et online spil.
  // Den kører som en Cloudflare Worker; koden ligger i mappen relay/.
  relayAdresse: "wss://epoke-relay.hebsgaard-per.workers.dev/room",
};


/* Online-forbindelsen kan skiftes via adressen, når man tester:
     index.html?relay=ws://localhost:8787/room   bruger en lokal relay (wrangler dev)
     index.html?relay=off                        bruger den gamle PeerJS-forbindelse
   Online-spil går normalt via relayen på HTTPS-port 443, så det også virker på skolenet. */
(function () {
  var p = new URLSearchParams(location.search).get("relay");
  window.HIST_RELAY = p !== "off";
  window.EPOKE_RELAY_URL = p && p !== "off" ? p : window.EPOKE_INDSTILLINGER.relayAdresse;
})();


/* kortStoerrelse sendes videre til CSS'en (css/indstillinger.css) som
   --skala-egne, --skala-tidslinje og --skala-modspiller. */
(function () {
  var k = window.EPOKE_INDSTILLINGER.kortStoerrelse || {};
  ["egne", "tidslinje", "modspiller"].forEach(function (navn) {
    var pct = Number(k[navn]);
    if (!(pct > 0)) { if (k[navn] != null) console.error("kortStoerrelse." + navn + " skal være et tal over 0, fx 100"); return; }
    document.documentElement.style.setProperty("--skala-" + navn, String(pct / 100));
  });
})();

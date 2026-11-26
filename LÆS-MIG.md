# Epoke – før eller efter?

Et kortspil om kronologi til folkeskolen. Spillerne lægger begivenheder i rigtig rækkefølge på en fælles tidslinje.
Spillet er en almindelig hjemmeside uden server og uden byggetrin: filerne her er præcis dem, der ligger på GitHub Pages.

Denne fil giver et overblik til dig, der kan programmere (fx Python eller R), men ikke kender HTML, CSS og JavaScript så godt.

## De tre sprog på 30 sekunder

| Sprog | Hvad det gør | Svarer nogenlunde til |
|---|---|---|
| **HTML** (`index.html`) | Sidens indhold og opbygning: skærme, knapper, dialoger | Strukturen i et dokument |
| **CSS** (`css/`) | Udseendet: farver, størrelser, placering, skrifttyper | Et tema i ggplot2 eller matplotlib |
| **JavaScript** (`js/`, `sets/`, `indstillinger.js`) | Opførslen: regler, klik, online-spil, lyd | Python-/R-kode |

Browseren læser `index.html`, som henter CSS- og JavaScript-filerne i en bestemt rækkefølge.

## Hvor ligger hvad?

```
index.html              Sidens opbygning (HTML). Henter alle de andre filer.
indstillinger.js        ★ Tider, antal kort, lydstyrke, online-adresse
css/
  indstillinger.css     ★ Farver, skrifttyper, billeder, kortstørrelser
  spil.css              Resten af designet, delt op i 23 afsnit
  quiz.css              Udseendet af Quiz-skærmene og fremgangen på forsiden
  skrifttyper.css       Indlæser skrifttyperne fra fonts/
fonts/                  Skrifttyperne (Cinzel, EB Garamond, IM Fell English)
js/
  kortsaet.js           Registret, som kortsættene melder sig ind i
  spil.js               Selve spillet (det meste er "minificeret", se nedenfor)
  sne.js                Sne til kortsæt med snow: true
  tur-boks.js           Boksen "Det er turen til ..."
  kort-info.js          Boksen med kortets beskrivelse ved hover / langt tryk
  resultat-boks.js      Sætter boksen "Rigtigt!"/"Forkert plads" lige over tidslinjens kort
  quiz.js               Quiz-menuerne, quizsiden, Lær og de gemte scorer
sets/*.js               ★ Kortsættene: ét sæt pr. fil
images/<sæt>/           Billeder til kortene i hvert sæt
images/*.jpg            Baggrunde, bord og kortbagside
music/                  Musik (MP3)
relay/                  Serveren til online-spil (Cloudflare Worker; deployes for sig)
```

★ = de filer, man oftest retter i.

## Sådan prøver du spillet på din egen computer

Dobbeltklik på `index.html`, eller start en lille webserver i mappen (det svarer bedst til GitHub Pages):

```
python -m http.server
```

Åbn derefter <http://localhost:8000> i browseren. Efter en ændring: gem filen og tryk **Ctrl+F5** i browseren.

Går noget galt, så tryk **F12** og se fanen **Console**. Fejl står med rødt.

## Typiske ændringer

| Jeg vil ... | Ret i | Hvad |
|---|---|---|
| ændre hvor længe resultatet vises efter et svar | `indstillinger.js` | `visResultatMs` (millisekunder) |
| ændre hvor længe resultatet vises, når man spiller alene (Quiz, Overlevelse) | `indstillinger.js` | `visResultatAleneMs` (millisekunder) og `klikVidereAlene` (må et klik eller en tast gå videre før?) |
| ændre hvor længe "Det er turen til ..." vises | `indstillinger.js` | `turBoksMs` |
| give spillerne flere eller færre kort | `indstillinger.js` (standarden; spillerne kan selv vælge under Indstillinger) | `kortPaaHaanden` (Duel), `quizKortPaaHaanden` (Mestring og Overlevelse), `maksKortPaaHaanden` |
| ændre antallet af byttekort | `indstillinger.js` | `byttekort` |
| slå årstalsgæt fra | `indstillinger.js` | `gaetAarstal: false` |
| ændre antal forsøg pr. kort i Quiz | `indstillinger.js` | `quizForsoeg` |
| samle kortsæt i én Quiz-kategori | `sets/<sæt>.js` | `quizCategory: "Navn"` (og evt. `quizIcon`) |
| skrue op eller ned for musikken | `indstillinger.js` | `musikStyrke` (0 til 1) |
| bestemme om lyden er slået til, første gang man åbner spillet | `indstillinger.js` | `lydTilSomStandard` (true/false) |
| skrue op eller ned for forsidemusikken | `indstillinger.js` | `forsideMusikStyrke` (0 til 1) |
| ændre en farve | `css/indstillinger.css` | fx `--gold` |
| gøre kortene større eller mindre | `indstillinger.js` | `kortStoerrelse` (procent; de præcise grænser står i `css/indstillinger.css`: `--hw`, `--tw`, `--ow`) |
| skifte baggrund eller kortbagside | `css/indstillinger.css` | `--img-baggrund`, `--img-kortbagside` |
| rette et kort | `sets/<sæt>.js` | kortets linje |
| skjule eller vise et kortsæt | `index.html` | `<script src="sets/...">`-linjerne |

## Kortsættene (`sets/*.js`)

Hver fil kalder `registerSet({...})` med en "ordbog" (som en `dict` i Python eller en navngiven `list` i R):

```js
registerSet({
  id: "klasse7",                       // unikt navn uden mellemrum
  name: "7. klasse",                   // vises i menuen
  description: "...",                  // lille tekst under navnet i menuen
  startCards: ["kort-id"],             // antal kort på tidslinjen fra start (de trækkes tilfældigt hvert spil; se fasteStartkort i indstillinger.js)
  cards: [
    { id: "dampmaskinen", year: 1769, title: "Watts dampmaskine", desc: "...", tip: "Kilder:\n...", image: "dampmaskinen.jpg", era: "Videnskabernes tid" },
  ],
});
```

- **Påkrævet** på hvert kort: `id` (unikt på tværs af *alle* sæt), `year` (negativt tal = før Kristus) og `title`.
- `desc` er beskrivelsen. Den vises i boksen ved siden af kortet, når man holder musen over det (eller holder fingeren på det på en touchskærm). Den kan læses, før kortet er lagt, så **skriv aldrig årstallet i `desc`**.
- `tip` indeholder kun kilderne: `Kilder:` efterfulgt af én APA-reference pr. linje (`\n` = ny linje). (?) viser kun kilderne. Står der noget før `Kilder:` (fx "I historiekanonen: ..."), vises det i stedet i boksen ved siden af kortet.
- `image` er et filnavn i `images/<sæt-id>/`. Husk at tilføje billedets kreditering i dialogen "Kilder" nederst i `index.html`.
- `era` bestemmer kortets farver: Forhistorisk tid, Oldtidens Egypten, Antikken, Middelalderen, Renæssancen, Opdagelsernes tid, Videnskabernes tid, Oplysningstiden, 1800-tallet, 1900-tallet eller 2000-tallet.
- `sources`: 1–2 links, der vises som "Læs mere" under (?).

Nyt sæt: lav `sets/<id>.js` og mappen `images/<id>/`, og tilføj `<script src="sets/<id>.js"></script>` i `index.html` sammen med de andre. Rækkefølgen dér er rækkefølgen i menuen, og det første sæt er standard.

Alle felter og reglerne for kilder står i `CLAUDE.md`.

## Quiz (spil alene)

Forsiden har knapperne **Quiz**, **Indstillinger**, **Duel** (2 spillere på samme skærm), **Opret online spil** og **Deltag med kode**. Øverst i Quiz står spillerens samlede fremgang.

**Jul og andre ekstra kortsæt:** under **Indstillinger** på forsiden kan Jul slås til og fra. Standarden står i `indstillinger.js` under `valgfrieKortsaet: { jul: false }`. Skriv `true` for at vise Jul fra start. Browseren husker spillerens eget valg.

- En quiz er ét kortsæt. Kortsæt med samme `quizCategory` (fx `"Alinea"`) samles i én kategori; ellers er sættet sin egen kategori. `quizIcon` er tegnet i det runde segl.
- På quizsiden: **Spil** og **Lær** (alle kort i rækkefølge med hele teksten). **Spil** starter den quiztype, der er valgt under **Indstillinger** på forsiden: **Mestring** (3 forsøg pr. kort, kun første forsøg tæller) eller **Overlevelse** (én fejl og det er slut). Standarden er Overlevelse og står i `indstillinger.js` (`quizTilstand`).
- **Øv fejl** (kun de kort, man fejlede) tilbydes på slutskærmen lige efter et spil, hvor man har lavet fejl.
- Scorerne gemmes i browseren under `htl-quiz-<sæt-id>`. Slet dem i konsollen (F12) med `localStorage.clear()`.
- Selve reglerne står i `js/spil.js` under overskriften `QUIZ: SPIL (TILSTAND A) OG ØV FEJL`. Alle valgene og de fravalgte alternativer står i `docs/beslutninger-quiz.md`.

## Om `js/spil.js` (den "minificerede" kode)

Det meste af spillet er oprindeligt skrevet som flere filer og derefter presset sammen af et værktøj (esbuild). Derfor står det på få, meget lange linjer, og variablerne hedder ting som `k`, `B` og `I`. Den oprindelige kildekode findes ikke længere.

- Øverst i filen står en **indholdsfortegnelse** og en **ordliste**, der forklarer de vigtigste korte navne. For eksempel er `k` spillets tilstand, og `B({a:"place", slot:2})` lægger kortet på plads 2.
- Senere tilføjelser er skrevet i hånden og kan læses. De er markeret med overskrifter som `TURENS GANG (læsbar kode)`.
- De fleste tal, man vil ændre, er flyttet ud i `indstillinger.js`, så man ikke behøver at røre filen.
- Skal noget alligevel ændres i de minificerede linjer: lav små, præcise rettelser og test bagefter.

## Test efter en ændring

1. Åbn spillet, og spil et par ture i det kortsæt, du har ændret.
2. Hold musen over et par kort, og tjek beskrivelsen i boksen. Tryk på (?), og tjek kilderne.
3. Se i konsollen (F12), at der ikke står røde fejl. Linjer med `404` for `lyde/...`, `images/avatarer/...` og `images/segl...` er normale: spillet prøver at finde valgfrie filer, som ikke findes.
4. Har du ændret et sæt, så tjek konsollen for "Kort-id findes to gange" eller "mangler id, year eller title".

## Online-spil

Online-spil går via en lille server (en "relay") hos Cloudflare, som ligger i mappen `relay/` og deployes for sig selv (se `relay/README.md`). Adressen står i `indstillinger.js` (`relayAdresse`). Ændres beskederne mellem spil og relay, skal både `relay/src/index.js` og relay-delen af `js/spil.js` ændres, og relayen skal deployes, før den nye `index.html` lægges op.

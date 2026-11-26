# Quiz-delen: beslutninger og alternativer

Quizdelen er bygget efter en snak den 25.–26. november 2026. Den er inspireret af Seterra: man spiller alene og vil nå 100 % i hver quiz.

Dokumentet har to dele:

- **Del A** er det, du selv valgte undervejs.
- **Del B** er de valg, jeg traf uden at spørge, fordi du bad mig bygge resten færdigt. Ved hvert valg står det alternativ, jeg ville have givet dig at vælge imellem. Alle valg kan laves om.

## A. Det, du valgte

| # | Spørgsmål | Dit valg | Fravalgt |
|---|---|---|---|
| 1 | Hvad betyder 100 %? | **Begge tilstande**: A = Spil (3 forsøg, procent) og B = Overlevelse (brøk, fx 12/30) | Kun den ene af dem |
| 2 | Hvad er et kort værd i 2. eller 3. forsøg? | **A1**: kun rigtigt i første forsøg tæller | A2: delpoint (1, ⅔, ⅓) |
| 3 | Hvad er en quiz? | **C1**: ét eksisterende kortsæt; kategorier samler sættene | C2: udsnit af kortene (fx efter tidsalder) |
| 4 | Skal Jul med? | **J2**: Jul er sin egen kategori, og sættet ændres ikke | J1: Jul holdes ude |
| 5 | Hvad er Lær? | **L1**: hele tidslinjen i rækkefølge, tryk på et kort for at læse mere. Plus **Øv fejl** efter et spil | L2: guidet øvelse med gentagelser |
| 6 | Hvor gemmes scorerne? | **S1**: i browseren (`localStorage`) pr. kortsæt; der er ingen delte skole-pc'er | S2: profiler med navn i samme browser |
| 7 | Tæller Øv fejl med i procenten? | **P1**: nej | P2: ja, kort man har lært, tæller |
| 8 | Hvordan kommer man til A og B? | **N1**: to hovedknapper på forsiden; Overlevelse ligger inde på hver quizside | N2: tre knapper på forsiden |
| 9 | Hvilket tal står i menuerne? | **M1**: kun A's bedste %; en kategori viser gennemsnittet, og ikke spillet = 0 % | M2: både % og brøk i listen |
| 10 | Skal tiden måles? | **Ja**; højeste score viser %, tid og antal præcise årstal | Ingen tid |
| 11 | Hvad bygges først? | **F1**: først menuer, A og B; derefter Lær og Øv fejl | F2: alt på én gang |
| 12 | Årstalsgæt i quizzen? | **E1**: altid slået til. Rangering: % rigtige, så præcise årstal, så tid | E2: følger indstillingen og tæller ikke |
| 13 | Hvordan vises rigtige og præcise? | **Stablet bjælke**: vinrød = rigtige, guld inden i = præcise årstal | – |
| 14 | Hvordan vises den rigtige plads? | **Grønt felt** mellem de to kort, samme slags markering som den gule ved træk | – |
| 15 | Er forsiden for tom? | **H1**: "Din fremgang" med bjælke under Quiz-knappen | H2: dagens kort |

## B. Valg, jeg har truffet

### B1. Spil (tilstand A)

1. **Ét kort ad gangen** (hånd med 1 kort).
   - *Alternativ:* 3 kort på hånden, som i Overlevelse.
   - Jeg valgte ét kort, fordi det ligner Seterra mest. Det gør det også umuligt at gemme de svære kort til sidst.
2. **Efter 3. fejl lægger spilleren selv kortet i det grønne felt.** Andre pladser afvises med beskeden "Kortet hører til i det grønne felt".
   - *Alternativ:* spillet lægger selv kortet på plads.
   - Jeg valgte at lade spilleren gøre det, fordi man lærer mere, når man selv flytter kortet.
3. **Prøvede pladser får et rødt ✕.** Prøver man samme plads igen, bruger man ikke et forsøg, men får beskeden "Den plads har du allerede prøvet".
   - *Alternativ:* ingen markering, så man kan prøve samme plads igen og miste et forsøg.
4. **Årstallet vises ikke efter en fejl**, heller ikke i beskeden. Det vises først, når kortet ligger rigtigt. Det gælder også efter 3. fejl, hvor kortet så tæller som en fejl.
5. **Svar med årstal (Enter i feltet på kortet):** kortet lægges der, hvor det gættede år hører hjemme på tidslinjen.
   - Rammer gættet den rigtige plads, er kortet rigtigt. Er årstallet præcist og i første forsøg, får man også en ★.
   - Rammer gættet en forkert plads, bruger man et forsøg, og beskeden er "Forkert årstal".
   - *Alternativ:* årstalsfeltet gemmer kun gættet, og man skal altid trække kortet.
   - Jeg valgte det, fordi det følger reglen fra 2-spiller-spillet ("Enter = dit svar"). Samtidig straffer det ikke et gæt, der er lidt forkert, men stadig lander på den rigtige plads.
6. **Et præcist årstal tæller kun i første forsøg.** Det følger af beslutning A2.
7. **Procenten rundes ned** (99,6 % vises som 99 %), så 100 % kun står, når alle kort er rigtige.
   - *Alternativ:* almindelig afrunding.
8. **Antal kort i en quiz = de kort, man skal lægge.** Kortene, der ligger på bordet fra start, tæller ikke med. Derfor står der "26 kort" ved Historiekanon, selv om beskrivelsen siger 30 punkter.
   - *Alternativ:* vis alle 30 og lad startkortene tælle som rigtige.
9. **Antal forsøg kan ændres** i `indstillinger.js` (`quizForsoeg: 3`).
10. **Tiden** måles fra første kort til sidste kort og vises som mm:ss mens man spiller.
11. **Ny rekord** kræver, i den rækkefølge: højere %, flere præcise årstal eller kortere tid.
12. **Slutskærmen** viser bjælke, "X af Y rigtige i første forsøg · ★ præcise · tid", "Ny rekord!" eller den gamle rekord, og knapperne Øv fejl (n), Spil igen og Til quizsiden.
13. **Forlader man et spil fra en quiz**, kommer man tilbage til quizsiden, ikke til forsiden.

### B2. Overlevelse (tilstand B)

14. **Rekorden gemmes pr. kortsæt** som en brøk (placeret/i alt). Det gamle samlede tal (`htl-infiniteBest`) bruges ikke længere fra Quiz.
    - *Alternativ:* flyt den gamle rekord over til et sæt.
    - Jeg valgte at lade den ligge, fordi den ikke siger, hvilket sæt den kom fra.
15. **Reglerne er de samme som før** (3 kort på hånden, én fejl og det er slut, et præcist årstal giver mulighed for at bytte et kort). Kun rekorden og slutskærmen er nye.
16. **Overlevelse-knappen er fjernet fra forsiden** (beslutning N1). Den findes på hver quizside.

### B3. Øv fejl

17. **Fejlene huskes i browseren** (`m` i `htl-quiz-<sæt>`), så knappen "Øv fejl (n)" også er der næste gang, man åbner quizsiden.
    - *Alternativ:* fejlene huskes kun, indtil siden lukkes.
18. **Efter en øvelse** husker spillet de kort, man stadig fejlede, så man kan øve igen. Er alt rigtigt, forsvinder knappen.
19. **Øvelsen bruger samme regler** som Spil (3 forsøg og grønt felt). Kun startkortene ligger på bordet.
    - *Alternativ:* alle quizzens kort undtagen fejlene ligger på bordet som hjælp.

### B4. Lær

20. **En lodret tidslinje**: årstal til venstre, en prik på en linje, et lille billede af kortet og titlen med de første linjer af beskrivelsen. Tryk på en række åbner det normale (?)-vindue med beskrivelse og kilder.
    - *Alternativ:* kortene vandret, som på spillebordet. Det er sværere at læse på en telefon.
21. **Startkortene er med** i Lær, så hele tidslinjen ses.
22. **På telefon** skjules det lille kortbillede, så teksten får plads.
23. **Knappen "Spil quizzen"** står nederst i Lær.

### B5. Menuer og forside

24. **En kategori med kun én quiz** (fx Historiekanon) springer direkte til quizsiden.
    - *Alternativ:* vis altid kategorisiden, også med én quiz.
25. **Seglet** (det runde mærke) viser `quizIcon` fra sætfilen: K = Historiekanon, H = Historie, 7/8/9 = Alinea. Uden `quizIcon` vises det første bogstav i navnet.
26. **Ved 100 %** bliver bjælken og procenttallet grønne. ★ % står under procenten, når man har præcise årstal.
27. **"Din fremgang" på forsiden** er gennemsnittet af alle quizzer (ikke spillet = 0 %). Før første quiz står der "Prøv din første quiz". Tryk på boksen åbner Quiz.
28. **De to knapper på forsiden** er gjort lidt højere på pc, så de fylder mere.
29. ~~"Spil sammen" som egen skærm~~ – erstattet af den nye forside (se C).

### B6. Jul, Art og Total

30. **Jul, Art og Total er stadig slået fra** i `index.html` (skoleudgaven). Quiz-menuen bygges af de kortsæt, der er slået til, så Jul dukker op som sin egen kategori, så snart linjen slås til igen. Jeg har ikke rørt `sets/jul.js`.
    - *Alternativ:* slå Jul til nu.
    - Jeg ville have anbefalet at vente, fordi Jul ikke følger kildereglerne og er et sæsonsæt.

### B7. Teknik

31. **Quizreglerne ligger i `js/spil.js`** i en læsbar blok (`QUIZ: SPIL (TILSTAND A) OG ØV FEJL`), fordi de skal bruge spillets tidslinje og kort. Skærmene og scorerne ligger i `js/quiz.js`, og udseendet i `css/quiz.css`.
32. **Alle nøgler til de gemte scorer laves ét sted** (`scoreKey()` i `js/quiz.js`), så profiler (S2) senere kun kræver en ændring dér.
33. **Browserens tilbage-knap** fra en quizskærm fører til forsiden, som fra de andre skærme.
    - *Alternativ:* tilbage-knappen går ét skridt tilbage i quizmenuerne.
    - Det kræver mere arbejde i den eksisterende historik-kode.
34. **Tilbage-knapperne på de gamle skærme** (Vælg spillere, online, deltag) går til forsiden.

## C. Ny forside og Indstillinger (26. november 2026)

Du bad om en forside, der ligner den tidlige version. Det her har du bestemt:

- Overskriften er **"Før eller efter?"**.
- Knapperne er **Quiz** (Mester historien), **Indstillinger** (som tekstlink), **Duel** (2 spillere på samme skærm), **Opret online spil** og **Deltag med kode**.
- Jul kan slås til i en indstilling i `indstillinger.js` og under Indstillinger på forsiden.

Det har jeg valgt:

35. **Skærmen "Spil sammen" er fjernet.** Dens knapper er tilbage på forsiden.
36. **"Din fremgang" er flyttet** fra forsiden til toppen af Quiz-skærmen, så forsiden ligner den tidlige version.
    - *Alternativ:* behold den på forsiden under Quiz-knappen (H1). Det gør forsiden højere.
37. **Kun overskriften på forsiden er ændret.** "Epoke" står stadig i fanens titel (`<title>`) og i toppen af spillebordet.
    - *Alternativ:* skift navnet overalt.
    - Jeg ventede, fordi navnet er en arbejdstitel, og du kun nævnte forsiden.
38. **Indstillinger** er en ny skærm med to afsnit:
    - **Duel:** knappen "Vælg spillere" (antal og navne), som før lå under Start spillet.
    - **Ekstra kortsæt:** et flueben for hvert valgfrit sæt.
    - *Alternativ:* også lyd og årstalsgæt her. Lyden har allerede sin egen knap på forsiden.
39. **Jul indlæses altid,** men vises kun, når den er slået til. Indstillingen hedder `valgfrieKortsaet: { jul: false }` i `indstillinger.js`, og spillerens valg huskes i browseren (`htl-saet-jul`) og går forud for standarden.
    - *Alternativ:* kun en indstilling i filen, uden flueben på siden.
    - Du bad om begge dele.
40. **Når Jul er slået til,** står den i "Vælg kortsæt" (Duel og online) og som sin egen kategori i Quiz (251 kort). Selve sætfilen er ikke ændret.
41. **Teksten under Duel** følger antallet af spillere ("2 spillere på samme skærm", "3 spillere …", "Solo på samme skærm").
42. **Jul's musik-kreditering** står stadig i "Kilder", også når Jul er slået fra, fordi filen ligger i spillet.

## Åbne punkter, du måske vil se på

- Teksterne i knapper og beskeder (fx "Spil alene – nå 100 % i hver quiz", "Kortet hører til i det grønne felt").
- Om Historie (62 kort med Historiekanon indbygget) er for lang som én quiz. Den kunne deles op (C2) senere.
- Seglenes tegn (K, H, 7, 8, 9).

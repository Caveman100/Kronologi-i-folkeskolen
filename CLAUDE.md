# CLAUDE.md

**Epoke – før eller efter?** (short name: **Epoke**; this is a *working title* and may change, so keep the name easy to swap out) is a Danish card game about chronology for primary schools (folkeskolen). Players place event cards in order on a shared timeline. It was formerly called "Historiens Tidslinje" and was renamed to stay clear of the commercial game *Timeline*. Do not reintroduce "Timeline" or "Tidslinje" as the game's name. "tidslinjen" as an ordinary noun in the rules and UI is fine. The PeerJS room prefix `v3-historiens-tidslinje-dk-` in the bundle is internal; leave it alone, because changing it would stop old and new clients from finding each other.

**Ask when in doubt.** If a request is unclear, can be read in more than one way, or clashes with a rule in this file, ask the user before acting. When you ask, offer two concrete suggestions to choose between (and say which one you recommend). Don't guess on content (card texts, sources, images) or on anything that touches the Jul set.

Planned editions: this one for schools comes first. Later there will be a casual online-for-fun edition and possibly a museum or exhibition edition. Keep changes edition-friendly, for example by keeping branding and content separate from the game logic. It is a static site with no build step, hosted on GitHub Pages (`.nojekyll`, remote `Caveman100/Kronologi-i-folkeskolen`). All user-facing text, card content and commit messages are in Danish.

## Layout

- `index.html` (~600 KB, one file) holds the whole app:
  - Lines ~8–697: CSS in many `<style>` blocks. Line 8 alone is ~350 KB because it embeds the IM Fell English font as base64. Do not read it whole.
  - Lines ~698–835: the HTML screens (`scr-home`, `scr-local`, `scr-host`, `scr-join`, `scr-wait`, `scr-game`), overlays and dialogs (`ov-rules`, `deck-menu`, `year-dialog`, quit dialog).
  - Lines ~836–926: the **set registry** (`window.TimelineSets`, `registerSet`), written by hand and readable.
  - Lines ~927–930: `<script src="sets/*.js">` tags. Their order is the order of the "Vælg kortsæt" menu, and the first set is the default.
  - Lines ~931–1409: the game itself, as a **minified esbuild bundle** with PeerJS inlined. The source for this bundle is not in the repo.
  - Lines ~1410–1412: the `#wiki-credits` dialog ("Kilder"). Its music and per-card image credits are hard-coded HTML.
  - End of file: the canvas snow effect for sets with `snow: true`.
- `sets/*.js` hold the card sets. `sets/kanon.js` holds the 30 Historiekanon cards; they also appear in Classic through `include`. Each file calls `registerSet({...})`.
- `images/<setId>/` holds the card images. The table and UI textures (`bord*.jpg`, `egetrae.jpg`, `kortbagside.jpg`, `titel.jpg`, `baggrund.jpg`) sit directly in `images/`.
- `music/` holds the MP3s: home screen, Jul set, and others.

## Card sets (`sets/*.js`)

Set options: `id`, `name`, `description`, `startCards` (card ids on the table at the start), `images` (folder, default `images/<id>/`), `cards`. Optional: `combine: true` (no cards of its own; pulls in every set except those with `inTotal: false`), `inTotal: false`, `menu: false`, `include: ["<setId>", ...]` (the deck also gets those sets' cards; Classic uses `include: ["kanon"]`), `reuse: ["<cardId>", ...]` (the deck also gets these single cards from other sets, without duplicating them; used by the `sets/klasse*.js` sets), `menuColor: "r, g, b"` (gives the set's button in "Vælg kortsæt" a muted tint of that colour; the Alinea sets use Alinea's history portal colour `189, 91, 0`), `menuStyle: "home"` (gives the set's button the same leather look as the home-screen buttons; used by Historiekanon and Historie), `background`, `snow`, `music`, and `credits: {music, html}` (injected into the Kilder dialog).

Card fields: `id`, `year` and `title` are **required**. Card ids must be unique across *all* sets, and duplicates are logged to the console and skipped. Negative years mean BC. Other fields:
- `desc`, `tip`. The (?) dialog can be opened *before* the card is placed, so never put the event's year in `desc`. `tip` no longer holds hint text (removed from all sets except Jul); it holds only the card's sources: `Kilder:` followed by one APA reference per line (the (?) text keeps line breaks, `\n`). Jul cards keep their old `tip` and also have `more`, which is shown in place of `tip` after the card is revealed.
- `era`: picks the card colors from a hard-coded map in the bundle. The known eras are Forhistorisk tid, Oldtidens Egypten, Antikken, Middelalderen, Renæssancen, Opdagelsernes tid, Videnskabernes tid, Oplysningstiden, 1800-tallet, 1900-tallet and 2000-tallet. Any other era falls back to grey.
- `category`: `"Maleri"` gives the image the `art-original` styling (not cropped).
- `canon`, and `label` (for example `"Historiekanon"`, which is shown on the card instead of the set name).
- `approx: true` marks the year as approximate. The bundle also hard-codes some approximate ids: buddha, pyramiderne, solvognen, harald-blaatand, jesus, tutankhamon.
- `image`: a file name relative to the set's `images` folder, or an absolute or `data:` URL.
- `emoji`.
- `sources`: 1–2 links, `[{"title": "Historiekanon – emu.dk", "url": "https://…"}]`, shown as "Læs mere" links under the (?). Link the main source; add a second only when it carries something important, such as the year. Cards without `sources` show the Wikipedia link instead.
- `wikiTitle`, or `wiki` (a full URL), for the Danish Wikipedia link. Only used when the card has no `sources`.
- `prompt` is an image-generation prompt kept for reference. The game does not use it.

## Content rules for cards (the user's standing preferences)

**The Jul (Christmas) set is exempt.** None of the rules below apply to `sets/jul.js`, `images/jul/` or the Jul music and credits. Do not change anything in the Jul set (cards, images, music, credits or set options) unless the user explicitly asks for that specific change. This includes not "fixing" it to match these rules, and not touching it as part of changes to other sets.

- **Open source, always.** This is a rule, not a preference. Images, music and any copied text must have an open license (public domain, CC0, CC BY or CC BY-SA). Sources that are cited must be freely accessible online, with no paywall or login. That covers Danish educational publishers too: only cite their open material.
- **A source for everything.** Every fact, image and piece of music must have a source. Nothing goes in without one.
- **Sources on every card.** Each card's info text, shown behind the (?), must show its source(s). That text is `tip`, which holds only the sources. When a source is linked (in `sources` on the card, or as `<a>` in the Kilder dialog), leave the web address out of the reference text: the link is enough. Never show both.
- **APA everywhere.** Write the sources in APA style, both on the cards (?) and in the "Kilder" dialog (`#wiki-credits` and set `credits`).
- **Pick the best source available**, by tier:
  - **S-tier, top:** EMU's Historiekanon page: https://emu.dk/grundskole/historie/historiekanon/historiekanon. It is the first source for every canon card (`sets/kanon.js`). Its text is CC BY-NC-SA, so cite it and write in your own words; don't copy it.
  - **S-tier:** official Danish sources: Børne- og Undervisningsministeriet, EMU (emu.dk), Danmarks Statistik (DST) and CFU. Also the subject guides (faghæfter) on EMU, above all the history guide: https://emu.dk/sites/default/files/2023-06/gsk_historie_fagh%C3%A6fte_2023.pdf. Also Danish educational publishers, both books and online material.
  - **A-tier:** other recognised sources in language the pupils can easily read, such as museums, Lex.dk (Danmarks Nationalleksikon) or other countries' official authorities. Lex text is "begrænset genbrug": cite it, don't copy it.
  - **B-tier:** Wikipedia. Use it only when no S- or A-tier source covers the fact.
- **Stay close to the sources.** Keep the card text as close to what the source says as possible, but in simple language for folkeskole pupils.
- **General titles, concrete descriptions.** Players must be able to place a card without knowing the specific name. So when it is possible without bending the history, the `title` names the broader development and the `desc` or `tip` names the concrete event. Example: "Vikingerne angriber Lindisfarne" becomes "Vikingetiden begynder". The description still says that the attack on Lindisfarne in 793 was the first Viking raid on England and is counted as the start of the Viking Age. How general a title should be is weighed case by case: sometimes a well-known name (Gandhi, Magna Carta) is better than a vague title, and a general title must still fit the card's year (for example "Islam grundlægges" moved the card from 622 to about 610). Suggest title changes one card at a time and let the user decide.

To add a set: create `sets/<id>.js` and `images/<id>/`, then add a `<script src="sets/<id>.js">` line before `sets/jul.js` or wherever it belongs in the menu. The set files mention a `LÆS MIG.txt` guide, but that file is **not** in this repo.

## Game features (in the bundle)

- Local hot-seat play, "Uendelig" (endless, one mistake ends the run, best score saved), and an optional year-guess dialog.
- Online play via PeerJS (WebRTC) using a 4-letter room code that the host shares. If players lose the connection, they can rejoin with the same code.
- Settings and scores are saved in `localStorage` under keys prefixed `htl-`.
- Each set changes the look through body classes `set-<id>`, `set-bg` and `set-snow`, and the CSS variable `--set-bg`.

## Working here

- To run it, open `index.html` in a browser or serve the folder (for example `python -m http.server`). There is no linter or package manager.
- **Show a screenshot before any visual change is kept.** This covers anything graphical: CSS, layout, colours, shadows, images, card look. Make the change as a proposal, take before and after screenshots in headless Edge or Chrome, save them as PNG files and give the user their full paths. Then wait for the user's approval. If the user says no, revert the change.
- **Test after every change that isn't trivial.** Whenever you change code, set structure, card ids, images or anything beyond small text edits, write and run tests that show the game still works, and report the results. At minimum:
  - Load the set registry and every `sets/*.js` in Node, and check that each set builds a deck, the start cards are in the deck, there are no duplicate ids, every card has `id`, `year` and `title`, and every image file exists.
  - Run the game headless in a browser (Edge and Chrome are installed): start a game with the changed set, and open the (?) dialog on some cards. Check that no JavaScript errors occur and that the change shows up as intended.
  - If a test can't be run, say so and why. Small pure-text changes (a card's wording, a typo) don't need the browser test, but still need the Node check if a `sets/*.js` file was touched.
- Most content edits happen in `sets/*.js` (JSON-like card objects, one per line) plus images in `images/<set>/`. When adding or replacing images, also update the credits in the `#wiki-credits` dialog in `index.html`. Only use images with a free license; Jul images without one were replaced by the card back.
- Avoid editing the minified bundle unless necessary. If you must, make small, targeted string edits. Older full versions (`tidslinje-wiki_*.html`) live in the parent folder outside the repo.
- Use Grep with a narrow pattern, or Read with offset and limit, on `index.html`. Never read whole lines 8 or 931+.

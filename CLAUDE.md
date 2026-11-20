# CLAUDE.md

**Epoke – før eller efter?** (short name: **Epoke**; this is a *working title* and may change, so keep the name easy to swap out) is a Danish card game about chronology for primary schools (folkeskolen). Players place event cards in order on a shared timeline. It was formerly called "Historiens Tidslinje" and was renamed to stay clear of the commercial game *Timeline*. Do not reintroduce "Timeline" or "Tidslinje" as the game's name. "tidslinjen" as an ordinary noun in the rules and UI is fine. The PeerJS room prefix `v3-historiens-tidslinje-dk-` in the bundle is internal; leave it alone, because changing it would stop old and new clients from finding each other.

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
- `sets/*.js` hold the card sets. Each file calls `registerSet({...})`.
- `images/<setId>/` holds the card images. The table and UI textures (`bord*.jpg`, `egetrae.jpg`, `kortbagside.jpg`, `titel.jpg`, `baggrund.jpg`) sit directly in `images/`.
- `music/` holds the MP3s: home screen, Jul set, and others.

## Card sets (`sets/*.js`)

Set options: `id`, `name`, `description`, `startCards` (card ids on the table at the start), `images` (folder, default `images/<id>/`), `cards`. Optional: `combine: true` (no cards of its own; pulls in every set except those with `inTotal: false`), `inTotal: false`, `menu: false`, `background`, `snow`, `music`, and `credits: {music, html}` (injected into the Kilder dialog).

Card fields: `id`, `year` and `title` are **required**. Card ids must be unique across *all* sets, and duplicates are logged to the console and skipped. Negative years mean BC. Other fields:
- `desc`, `tip`. Jul cards also have `more`, which is shown in place of `tip`.
- `era`: picks the card colors from a hard-coded map in the bundle. The known eras are Forhistorisk tid, Oldtidens Egypten, Antikken, Middelalderen, Renæssancen, Opdagelsernes tid, Videnskabernes tid, Oplysningstiden, 1800-tallet, 1900-tallet and 2000-tallet. Any other era falls back to grey.
- `category`: `"Maleri"` gives the image the `art-original` styling (not cropped).
- `canon`, and `label` (for example `"Historiekanon"`, which is shown on the card instead of the set name).
- `approx: true` marks the year as approximate. The bundle also hard-codes some approximate ids: buddha, pyramiderne, solvognen, harald-blaatand, jesus, tutankhamon.
- `image`: a file name relative to the set's `images` folder, or an absolute or `data:` URL.
- `emoji`.
- `wikiTitle`, or `wiki` (a full URL), for the Danish Wikipedia link.
- `prompt` is an image-generation prompt kept for reference. The game does not use it.

To add a set: create `sets/<id>.js` and `images/<id>/`, then add a `<script src="sets/<id>.js">` line before `sets/jul.js` or wherever it belongs in the menu. The set files mention a `LÆS MIG.txt` guide, but that file is **not** in this repo.

## Game features (in the bundle)

- Local hot-seat play, "Uendelig" (endless, one mistake ends the run, best score saved), and an optional year-guess dialog.
- Online play via PeerJS (WebRTC) using a 4-letter room code that the host shares. If players lose the connection, they can rejoin with the same code.
- Settings and scores are saved in `localStorage` under keys prefixed `htl-`.
- Each set changes the look through body classes `set-<id>`, `set-bg` and `set-snow`, and the CSS variable `--set-bg`.

## Working here

- To run it, open `index.html` in a browser or serve the folder (for example `python -m http.server`). There are no tests, linter or package manager.
- Most content edits happen in `sets/*.js` (JSON-like card objects, one per line) plus images in `images/<set>/`. When adding or replacing images, also update the credits in the `#wiki-credits` dialog in `index.html`. Only use images with a free license; Jul images without one were replaced by the card back.
- Avoid editing the minified bundle unless necessary. If you must, make small, targeted string edits. Older full versions (`tidslinje-wiki_*.html`) live in the parent folder outside the repo.
- Use Grep with a narrow pattern, or Read with offset and limit, on `index.html`. Never read whole lines 8 or 931+.

# Epoke-relay (Cloudflare Worker)

Online-spil sender alle beskeder gennem denne lille server på almindelig HTTPS (port 443),
så spillet også virker på skolenet og bag firewalls, der blokerer WebRTC.

- Én Durable Object pr. rum (4-bogstavskode). Intet gemmes og intet logges; rummet forsvinder, når værten går.
- Kører på Cloudflares gratis plan.
- Kun sider i `ALLOWED_ORIGINS` (i `wrangler.toml`) samt localhost må bruge den.
- Spillet finder relayen via `window.EPOKE_RELAY_URL` i `index.html`.

## Læg den op (første gang)

1. Opret en gratis konto på https://dash.cloudflare.com/sign-up
2. Åbn en terminal i denne mappe (`relay/`) og log ind: `npx wrangler login`
3. Læg den op: `npx wrangler deploy`
   Første gang beder Cloudflare dig vælge et navn til dit `workers.dev`-underdomæne.
4. Wrangler skriver adressen, fx `https://epoke-relay.ditnavn.workers.dev`.
   Sæt `window.EPOKE_RELAY_URL` i `index.html` til `wss://epoke-relay.ditnavn.workers.dev/room` (nu: `epoke-relay.hebsgaard-per.workers.dev`).

Ændringer i `src/index.js` lægges op med `npx wrangler deploy` igen.

I Windows PowerShell skal man skrive `npx.cmd` i stedet for `npx` (ellers blokerer PowerShell kommandoen).

## Test lokalt

```
npx wrangler dev --port 8787
```

Åbn derefter spillet med `?relay=ws://localhost:8787/room` i adressen.
`?relay=off` bruger den gamle PeerJS-forbindelse.

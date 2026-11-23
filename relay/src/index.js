// Epoke relay: sender spilbeskeder mellem værten og gæsterne over WebSocket (HTTPS-port 443),
// så online-spil også virker på net, der blokerer WebRTC.
//
// Én Durable Object pr. rum (4-bogstavskode). Intet gemmes på disk; rummet forsvinder,
// når alle har forladt det. Protokollen passer til RelayHost/RelayGuest i index.html.

import { DurableObject } from "cloudflare:workers";

const LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const MAX_MESSAGE = 256 * 1024; // bytes
const MAX_GUESTS = 20; // spillet selv tillader færre; dette er kun et loft mod misbrug

function randomCode() {
  let s = "";
  for (let i = 0; i < 4; i++) s += LETTERS[Math.floor(Math.random() * LETTERS.length)];
  return s;
}

function originAllowed(request, env) {
  const origin = request.headers.get("Origin");
  if (!origin) return true; // ikke-browser (fx tests); browsere sender altid Origin
  const allowed = (env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (allowed.includes("*") || allowed.includes(origin)) return true;
  try {
    const host = new URL(origin).hostname;
    return host === "localhost" || host === "127.0.0.1";
  } catch {
    return false;
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== "/room") {
      return new Response("Epoke relay kører.", { headers: { "content-type": "text/plain; charset=utf-8" } });
    }
    if (request.headers.get("Upgrade") !== "websocket") return new Response("Forventede WebSocket", { status: 426 });
    if (!originAllowed(request, env)) return new Response("Forbudt", { status: 403 });

    if (url.searchParams.get("role") === "host") {
      for (let i = 0; i < 12; i++) {
        const code = randomCode();
        const res = await roomStub(env, code).fetch(withRoom(request, code, "host"));
        if (res.status !== 409) return res;
      }
      return new Response("Ingen ledige rumkoder", { status: 503 });
    }

    const code = (url.searchParams.get("code") || "").toUpperCase();
    if (!/^[A-Z]{4}$/.test(code)) return new Response("Ugyldig kode", { status: 400 });
    return roomStub(env, code).fetch(withRoom(request, code, "guest"));
  },
};

function roomStub(env, code) {
  return env.ROOMS.get(env.ROOMS.idFromName(code));
}

function withRoom(request, code, role) {
  const headers = new Headers(request.headers);
  headers.set("X-Room", code);
  headers.set("X-Role", role);
  return new Request(request.url, { headers });
}

export class Room extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    // Keepalive-ping fra klienterne besvares uden at vække rummet.
    ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair("ping", "pong"));
  }

  async fetch(request) {
    const code = request.headers.get("X-Room");
    const role = request.headers.get("X-Role");
    const host = this.host();

    if (role === "host" && host) return new Response("Optaget", { status: 409 });

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.ctx.acceptWebSocket(server, [role]);
    server.serializeAttachment({ role, code, id: null });

    if (role === "guest" && (!host || this.ctx.getWebSockets("guest").length > MAX_GUESTS)) {
      server.send(JSON.stringify({ type: "unavailable" }));
      server.close(1000, "unavailable");
    }
    return new Response(null, { status: 101, webSocket: client });
  }

  host() {
    return this.ctx.getWebSockets("host").find((ws) => ws.readyState === WebSocket.OPEN && !ws.deserializeAttachment()?.gone) || null;
  }

  guestById(id) {
    return this.ctx.getWebSockets("guest").find((ws) => ws.deserializeAttachment()?.id === id) || null;
  }

  async webSocketMessage(ws, data) {
    if (typeof data !== "string" || data.length > MAX_MESSAGE) return;
    let msg;
    try {
      msg = JSON.parse(data);
    } catch {
      return;
    }
    if (!msg || typeof msg !== "object") return;
    const att = ws.deserializeAttachment() || {};

    if (att.role === "host") {
      if (msg.role === "host") {
        ws.send(JSON.stringify({ type: "ready", code: att.code }));
        return;
      }
      if (typeof msg.id !== "string") return;
      const guest = this.guestById(msg.id);
      if (!guest) return;
      guest.send(JSON.stringify({ type: "message", value: msg.value }));
      if (msg.kick) {
        guest.serializeAttachment({ ...guest.deserializeAttachment(), kicked: true });
        guest.close(1000, "kicked");
      }
      return;
    }

    // Gæst
    const host = this.host();
    if (msg.role === "guest") {
      if (att.id) return; // allerede hilst
      if (!host) {
        ws.send(JSON.stringify({ type: "unavailable" }));
        ws.close(1000, "unavailable");
        return;
      }
      const id = cleanId(msg.pid) || cleanId(msg.key) || crypto.randomUUID();
      // Samme spiller på ny forbindelse (genindlæst side): luk den gamle stille.
      const old = this.guestById(id);
      if (old && old !== ws) {
        old.serializeAttachment({ ...old.deserializeAttachment(), id: null, replaced: true });
        try { old.close(1000, "replaced"); } catch {}
      }
      ws.serializeAttachment({ ...att, id });
      ws.send(JSON.stringify({ type: "ready", id }));
      host.send(JSON.stringify({
        type: "hello",
        id,
        name: String(msg.name || "Gæst").slice(0, 18),
        avatar: String(msg.avatar || "viking").slice(0, 40),
      }));
      return;
    }
    if (att.id && host && "act" in msg) {
      host.send(JSON.stringify({ type: "action", id: att.id, act: msg.act }));
    }
  }

  async webSocketClose(ws, code, reason) {
    this.gone(ws);
    try { ws.close(code, reason); } catch {}
  }

  async webSocketError(ws) {
    this.gone(ws);
  }

  gone(ws) {
    const att = ws.deserializeAttachment() || {};
    if (att.gone) return;
    ws.serializeAttachment({ ...att, gone: true });
    if (att.role === "host") {
      // Værten er væk: rummet lukker. Gæster prøver igen og får "unavailable".
      for (const g of this.ctx.getWebSockets("guest")) {
        try { g.close(1001, "host gone"); } catch {}
      }
      return;
    }
    if (att.id && !att.replaced) {
      const host = this.host();
      if (host) host.send(JSON.stringify({ type: "leave", id: att.id }));
    }
  }
}

function cleanId(v) {
  return typeof v === "string" && /^[A-Za-z0-9_-]{1,64}$/.test(v) ? v : null;
}

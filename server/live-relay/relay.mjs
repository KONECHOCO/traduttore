// OmniLingo Live — relay WebSocket per i sottotitoli condivisi.
// Il relatore ("host") invia le frasi riconosciute nella sua lingua; il server le inoltra in tempo reale
// a chi è entrato nella stanza ("listener"), che le traduce sul proprio telefono nella sua lingua.
// Nessun dato viene salvato su disco: le stanze vivono in memoria e spariscono poco dopo la fine.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { WebSocketServer } from 'ws';

const PORT = Number(process.env.PORT || 8099);
const MAX_ROOMS = 500;
const MAX_LISTENERS = 300;
const MAX_TEXT = 1200;
const HISTORY = 60;
const ROOM_TTL_MS = 30 * 60 * 1000; // la stanza resta 30 minuti dopo l'uscita del relatore
const HOST_RATE_PER_10S = 60;
const CODE_RE = /^[A-Z0-9]{6}$/;
const LANG_RE = /^[a-z]{2,3}(-[A-Za-z]{2,4})?$/;

/** @type {Map<string, {key: string, lang: string, title: string, host: any, listeners: Set<any>, history: any[], lastActive: number, sent: number[]}>} */
const rooms = new Map();

const viewerHtml = await readFile(new URL('./viewer.html', import.meta.url), 'utf8');

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname === '/health') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ ok: true, rooms: rooms.size }));
    return;
  }
  // Pagina web per chi non ha l'app: /r/CODICE
  if (/^\/r\/[A-Z0-9]{6}$/.test(url.pathname)) {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-cache' });
    res.end(viewerHtml);
    return;
  }
  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({ server, path: '/ws', maxPayload: 4096 });

const send = (ws, msg) => {
  if (ws && ws.readyState === 1) ws.send(JSON.stringify(msg));
};

function broadcast(room, msg) {
  const data = JSON.stringify(msg);
  for (const l of room.listeners) if (l.readyState === 1) l.send(data);
}

function audience(room) {
  send(room.host, { type: 'audience', count: room.listeners.size });
}

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, 'http://x');
  const role = url.searchParams.get('role');
  const code = (url.searchParams.get('room') || '').toUpperCase();
  if (!CODE_RE.test(code)) return ws.close(4000, 'bad room');

  if (role === 'host') {
    const key = url.searchParams.get('key') || '';
    const lang = url.searchParams.get('lang') || 'en';
    if (key.length < 16 || !LANG_RE.test(lang)) return ws.close(4000, 'bad params');
    let room = rooms.get(code);
    if (room && room.key !== key) return ws.close(4003, 'room taken');
    if (!room) {
      if (rooms.size >= MAX_ROOMS) return ws.close(4029, 'full');
      room = { key, lang, title: '', host: null, listeners: new Set(), history: [], lastActive: Date.now(), sent: [] };
      rooms.set(code, room);
    }
    room.lang = lang;
    room.title = (url.searchParams.get('title') || '').slice(0, 80);
    if (room.host && room.host !== ws) room.host.close(4001, 'replaced');
    room.host = ws;
    room.lastActive = Date.now();
    send(ws, { type: 'ready', count: room.listeners.size });
    broadcast(room, { type: 'status', live: true, lang: room.lang, title: room.title });

    ws.on('message', raw => {
      let msg;
      try {
        msg = JSON.parse(raw);
      } catch {
        return;
      }
      const now = Date.now();
      room.sent = room.sent.filter(t => now - t < 10000);
      if (room.sent.length >= HOST_RATE_PER_10S) return;
      room.sent.push(now);
      room.lastActive = now;
      if (msg.type === 'line' && typeof msg.text === 'string') {
        const line = {
          type: 'line',
          id: String(msg.id || now).slice(0, 40),
          text: msg.text.slice(0, MAX_TEXT),
          final: !!msg.final,
          lang: room.lang,
          t: now
        };
        if (line.final) {
          room.history.push(line);
          if (room.history.length > HISTORY) room.history.shift();
        }
        broadcast(room, line);
      } else if (msg.type === 'end') {
        broadcast(room, { type: 'status', live: false, ended: true });
      }
    });
    ws.on('close', () => {
      if (room.host === ws) {
        room.host = null;
        room.lastActive = Date.now();
        broadcast(room, { type: 'status', live: false });
      }
    });
    return;
  }

  if (role === 'listen') {
    const room = rooms.get(code);
    if (!room) return ws.close(4004, 'no room');
    if (room.listeners.size >= MAX_LISTENERS) return ws.close(4029, 'full');
    room.listeners.add(ws);
    send(ws, { type: 'hello', lang: room.lang, title: room.title, live: !!room.host, history: room.history });
    audience(room);
    ws.on('message', () => {}); // gli ascoltatori non inviano nulla
    ws.on('close', () => {
      room.listeners.delete(ws);
      audience(room);
    });
    return;
  }

  ws.close(4000, 'bad role');
});

// Pulizia stanze scadute e ping per tenere vive le connessioni dietro ai proxy
setInterval(() => {
  const now = Date.now();
  for (const [code, room] of rooms) {
    if (!room.host && now - room.lastActive > ROOM_TTL_MS) {
      for (const l of room.listeners) l.close(4004, 'room closed');
      rooms.delete(code);
    }
  }
  for (const ws of wss.clients) if (ws.readyState === 1) ws.ping();
}, 30000);

server.listen(PORT, '127.0.0.1', () => console.log(`omnilingo-live on 127.0.0.1:${PORT}`));

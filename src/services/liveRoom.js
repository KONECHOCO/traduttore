// Sottotitoli condivisi: il relatore crea una stanza, il pubblico entra con un codice o un QR.
// Il relay (server/live-relay) inoltra solo il testo riconosciuto nella lingua del relatore: ogni ascoltatore
// lo traduce sul proprio telefono, nella propria lingua. Niente viene salvato sul server.
import { LIVE_URL } from '../config';

const WS_URL = LIVE_URL.replace(/^http/, 'ws') + '/ws';
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // niente 0/O/1/I per evitare confusione

function randomString(len, alphabet) {
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  return [...bytes].map(b => alphabet[b % alphabet.length]).join('');
}

export function newRoomCode() {
  return randomString(6, ALPHABET);
}

export function roomViewerUrl(code) {
  return `${LIVE_URL}/r/${code}`;
}

/** Estrae un codice stanza da un testo: codice nudo, link web o link omnilingo://join/CODICE */
export function parseRoomCode(text) {
  const m = String(text || '').toUpperCase().match(/(?:\/R\/|JOIN\/)?([A-Z0-9]{6})\s*$/);
  return m ? m[1] : null;
}

/**
 * Stanza del relatore. Si riconnette da sola se cade la rete.
 * handlers: onAudience(count), onState('connecting'|'live'|'error', detail)
 */
export function hostRoom({ code, lang, title = '', handlers = {} }) {
  const key = randomString(24, ALPHABET);
  let ws = null;
  let closed = false;
  let retry = 1000;
  const queue = [];

  const connect = () => {
    handlers.onState?.('connecting');
    ws = new WebSocket(`${WS_URL}?role=host&room=${code}&lang=${encodeURIComponent(lang)}&key=${key}&title=${encodeURIComponent(title)}`);
    ws.onopen = () => {
      retry = 1000;
      while (queue.length) ws.send(queue.shift());
    };
    ws.onmessage = ev => {
      const msg = JSON.parse(ev.data);
      if (msg.type === 'ready') handlers.onState?.('live');
      if (msg.type === 'ready' || msg.type === 'audience') handlers.onAudience?.(msg.count);
    };
    ws.onclose = ev => {
      if (closed) return;
      if (ev.code === 4003) {
        handlers.onState?.('error', 'taken');
        return;
      }
      handlers.onState?.('connecting');
      setTimeout(() => !closed && connect(), retry);
      retry = Math.min(retry * 2, 15000);
    };
  };
  connect();

  const send = obj => {
    const data = JSON.stringify(obj);
    if (ws && ws.readyState === 1) ws.send(data);
    else if (obj.final) queue.push(data); // le frasi concluse non si perdono durante una riconnessione
  };

  return {
    code,
    sendLine(id, text, final) {
      send({ type: 'line', id, text, final });
    },
    end() {
      send({ type: 'end' });
      closed = true;
      setTimeout(() => ws?.close(), 300);
    }
  };
}

/**
 * Ingresso come ascoltatore.
 * handlers: onHello({lang,title,live,history}), onLine(line), onStatus({live,ended}), onState('connecting'|'connected'|'notfound')
 */
export function joinRoom(code, handlers = {}) {
  let ws = null;
  let closed = false;
  let retry = 1000;

  const connect = () => {
    handlers.onState?.('connecting');
    ws = new WebSocket(`${WS_URL}?role=listen&room=${code}`);
    ws.onmessage = ev => {
      const msg = JSON.parse(ev.data);
      if (msg.type === 'hello') {
        retry = 1000;
        handlers.onState?.('connected');
        handlers.onHello?.(msg);
      } else if (msg.type === 'line') handlers.onLine?.(msg);
      else if (msg.type === 'status') handlers.onStatus?.(msg);
    };
    ws.onclose = ev => {
      if (closed) return;
      if (ev.code === 4004) {
        handlers.onState?.('notfound');
        return;
      }
      handlers.onState?.('connecting');
      setTimeout(() => !closed && connect(), retry);
      retry = Math.min(retry * 2, 15000);
    };
  };
  connect();

  return {
    leave() {
      closed = true;
      ws?.close();
    }
  };
}

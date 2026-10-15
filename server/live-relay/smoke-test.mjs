// Prova end-to-end del relay: un relatore e un ascoltatore nella stessa stanza.
// Uso: node smoke-test.mjs [wss://transit.ikonetsolutions.com/lingo/ws]
import WebSocket from 'ws';

const base = process.argv[2] || 'wss://transit.ikonetsolutions.com/lingo/ws';
const room = 'T' + Math.random().toString(36).slice(2, 7).toUpperCase().padEnd(5, '0');
const got = [];
const host = new WebSocket(`${base}?role=host&room=${room}&lang=it&key=smoke-test-key-123456&title=Prova`);
host.on('message', m => got.push('host<' + m));
host.on('error', e => { console.error('host error', e.message); process.exit(1); });
host.on('open', () => {
  const listener = new WebSocket(`${base}?role=listen&room=${room}`);
  listener.on('message', m => got.push('listener<' + m));
  listener.on('open', () => {
    setTimeout(() => host.send(JSON.stringify({ type: 'line', id: '1', text: 'Buongiorno a tutti', final: true })), 300);
    setTimeout(() => host.send(JSON.stringify({ type: 'end' })), 700);
    setTimeout(() => {
      console.log(got.join('\n'));
      const ok = got.some(g => g.startsWith('listener<') && g.includes('Buongiorno a tutti'));
      console.log(ok ? 'OK' : 'FAIL');
      process.exit(ok ? 0 : 1);
    }, 1500);
  });
});
setTimeout(() => { console.log('TIMEOUT\n' + got.join('\n')); process.exit(1); }, 10000);

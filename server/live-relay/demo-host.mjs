// Relatore simulato per provare l'app come ascoltatore: invia frasi in italiano nella stanza indicata.
// Uso: node demo-host.mjs CODICE [secondi]
import WebSocket from 'ws';

const code = process.argv[2] || 'DEMO42';
const seconds = Number(process.argv[3] || 60);
const lines = [
  'Buongiorno a tutti e benvenuti alla conferenza.',
  'Oggi parleremo di intelligenza artificiale e traduzione.',
  'Le domande sono benvenute alla fine della presentazione.',
  'Grazie per la vostra attenzione.'
];
const ws = new WebSocket(`wss://transit.ikonetsolutions.com/lingo/ws?role=host&room=${code}&lang=it&key=demo-host-key-1234567&title=Conferenza%20di%20prova`);
let i = 0;
ws.on('open', () => {
  console.log('host online', code);
  const timer = setInterval(() => {
    const text = lines[i % lines.length];
    const id = `d${i}`;
    ws.send(JSON.stringify({ type: 'line', id, text: text.split(' ').slice(0, 3).join(' '), final: false }));
    setTimeout(() => ws.send(JSON.stringify({ type: 'line', id, text, final: true })), 800);
    i++;
  }, 4000);
  setTimeout(() => { clearInterval(timer); ws.send(JSON.stringify({ type: 'end' })); setTimeout(() => process.exit(0), 500); }, seconds * 1000);
});
ws.on('message', m => console.log('<', String(m)));

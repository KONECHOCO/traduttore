// Link pubblici dell'app (pagine del sito con privacy e supporto, servite da GitHub Pages)
export const SITE_URL = 'https://konechoco.github.io/omnilingo/';
export const PRIVACY_URL = `${SITE_URL}privacy-policy.html`;
export const SUPPORT_EMAIL = 'konechocoproduction@gmail.com';
export const APP_VERSION = '1.0.0';
// Relay dei sottotitoli condivisi (server/live-relay). Il vecchio indirizzo transit.ikonetsolutions.com/lingo resta attivo per la build 2.
export const LIVE_URL = import.meta.env.VITE_LIVE_URL || 'https://lingo.ikonetsolutions.com';

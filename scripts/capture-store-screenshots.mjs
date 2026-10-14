// Screenshot per gli store dall'app web reale (traduzioni vere), una lingua alla volta.
// Prerequisito: server di sviluppo avviato (`npm run dev -- --port 5180`): `?storeshot` mostra la schermata
// d'acquisto come nell'app nativa. iPhone e iPad si catturano nella stessa pagina (cambiando solo le
// dimensioni) così ogni traduzione viene richiesta una volta sola.
// Uso: node scripts/capture-store-screenshots.mjs [it|en|fr|es|de|ja] [url]
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const lang = process.argv[2] || 'it';
const BASE = process.argv[3] || 'http://localhost:5180/';
const DEVICES = {
  iphone: { width: 440, height: 956, deviceScaleFactor: 3, mobile: true, suffix: '1320x2868' },
  ipad: { width: 1032, height: 1376, deviceScaleFactor: 2, mobile: false, suffix: 'ipad-2064x2752' }
};
// Testo di partenza in un'altra lingua, tradotto nella lingua della scheda
const SCENES = {
  it: { source: 'en', text: 'Good morning! Where is the conference room? I have a meeting with the marketing team at ten.' },
  en: { source: 'es', text: '¡Buenos días! ¿Dónde está la sala de conferencias? Tengo una reunión con el equipo de marketing a las diez.' },
  fr: { source: 'en', text: 'Good morning! Where is the conference room? I have a meeting with the marketing team at ten.' },
  es: { source: 'en', text: 'Good morning! Where is the conference room? I have a meeting with the marketing team at ten.' },
  de: { source: 'en', text: 'Good morning! Where is the conference room? I have a meeting with the marketing team at ten.' },
  ja: { source: 'en', text: 'Good morning! Where is the conference room? I have a meeting with the marketing team at ten.' }
};
const LEARN = { it: 'en', en: 'es', fr: 'en', es: 'en', de: 'en', ja: 'en' };
const scene = SCENES[lang];
const OUT = `store-assets/screenshots/${lang}`;
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({ locale: lang, viewport: { width: 440, height: 956 } });
await context.addInitScript(([l, learn]) => {
  if (sessionStorage.getItem('storeshot-init')) return;
  sessionStorage.setItem('storeshot-init', '1');
  localStorage.clear();
  localStorage.setItem('omni_ui_lang', l);
  localStorage.setItem('omni_target_lang', l);
  localStorage.setItem('omni_learn_lang', learn);
  localStorage.setItem('omni_sound', 'false');
}, [lang, LEARN[lang]]);
const page = await context.newPage();
const cdp = await context.newCDPSession(page);

async function setDevice(d) {
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: d.width, height: d.height, deviceScaleFactor: d.deviceScaleFactor, mobile: d.mobile });
  await page.waitForTimeout(400);
}
async function shotAll(name) {
  for (const [key, d] of Object.entries(DEVICES)) {
    await setDevice(d);
    await page.evaluate(() => window.scrollTo(0, 0));
    // cattura via CDP: rispetta le dimensioni e la densità impostate con setDeviceMetricsOverride
    const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' });
    await writeFile(`${OUT}/${name}-${d.suffix}.png`, Buffer.from(data, 'base64'));
    console.log(`✓ ${lang} ${key} ${name}`);
  }
  await setDevice(DEVICES.iphone);
}

await page.goto(`${BASE}?storeshot`);
// Chromium su Windows non ha le bandiere emoji (mostra "GB"): si usa Noto Color Emoji come sui telefoni
await page.addStyleTag({ url: 'https://fonts.googleapis.com/css2?family=Noto+Color+Emoji&display=block' });
await page.addStyleTag({ content: `:root { --font-sans: 'Inter', sans-serif, 'Noto Color Emoji'; --font-heading: 'Outfit', sans-serif, 'Noto Color Emoji'; }` });
await page.evaluate(() => document.fonts.load('16px "Noto Color Emoji"', '🇬🇧🇮🇹'));
await setDevice(DEVICES.iphone);

// 1. Traduzione testo
await page.selectOption('#source-lang-select', scene.source);
await page.fill('#source-text-input', scene.text);
await page.waitForFunction(() => document.querySelectorAll('.translation-output .translated-word').length > 3, null, { timeout: 30000 });
await page.locator('#source-text-input').blur();
await page.waitForTimeout(800);
await shotAll('1-translate');

// 2. Conversazione faccia a faccia
await page.click('#tab-live-btn');
await shotAll('2-live');

// 3. Sottotitoli conferenza
await page.click('#btn-mode-conference');
await shotAll('3-conference');

// 4. Frasario tradotto nella lingua studiata
await page.click('#tab-learning-btn');
await page.click('#learn-tab-phrasebook');
await page.waitForFunction(() => document.querySelectorAll('.phrase-card strong').length >= 4, null, { timeout: 60000 });
await page.waitForTimeout(500);
await shotAll('4-learn');

// 5. Documenti e foto
await page.click('#tab-docs-btn');
await shotAll('5-docs');

// 6. OmniLingo Pro
await page.click('.pro-btn');
await page.waitForSelector('.pro-modal');
await shotAll('6-pro');

await browser.close();

// Motore di traduzione.
// - App iOS/Android: Google ML Kit on-device (gratuito, offline dopo il download del pacchetto lingua,
//   uso commerciale consentito). Riconoscimento lingua con ML Kit Language Identification.
// - Browser (solo sviluppo/anteprima): MyMemory, con i suoi limiti (500 byte per richiesta, quota giornaliera).
// Nessuna traduzione inventata: se il motore fallisce viene lanciato un errore e l'interfaccia lo mostra.

import { Capacitor } from '@capacitor/core';
import { Translation } from '@capacitor-mlkit/translation';
import { LanguageIdentification } from '@capacitor-mlkit/language-identification';
import { LANGUAGES } from '../data/languages';

export const isNative = Capacitor.isNativePlatform();

const SUPPORTED = new Set(LANGUAGES.map(l => l.code));
const cache = new Map();
const CACHE_LIMIT = 300;

export class TranslationError extends Error {
  constructor(code, message) {
    super(message || code);
    this.code = code;
  }
}

/** Riconosce la lingua di un testo. Restituisce il codice (es. 'it') o null se incerto/non supportato. */
export async function detectLanguage(text) {
  const sample = (text || '').trim().slice(0, 500);
  if (sample.length < 3) return null;
  if (isNative) {
    try {
      const { language } = await LanguageIdentification.identifyLanguage({ text: sample, confidenceThreshold: 0.4 });
      const code = normalizeCode(language);
      return SUPPORTED.has(code) ? code : null;
    } catch {
      return null;
    }
  }
  return null; // sul web il riconoscimento avviene insieme alla traduzione (MyMemory "Autodetect")
}

function normalizeCode(lang) {
  if (!lang || lang === 'und') return null;
  const base = lang.toLowerCase().split('-')[0];
  if (base === 'fil') return 'tl';
  if (base === 'nb' || base === 'nn') return 'no';
  if (base === 'iw') return 'he';
  return base;
}

// ---------- Pacchetti lingua (solo app) ----------
export async function getDownloadedModels() {
  if (!isNative) return [];
  const { languages } = await Translation.getDownloadedModels();
  return languages;
}

export async function downloadModel(lang) {
  if (!isNative) return;
  await Translation.downloadModel({ language: lang });
}

export async function deleteModel(lang) {
  if (!isNative || lang === 'en') return; // l'inglese è il modello base di ML Kit
  await Translation.deleteDownloadedModel({ language: lang });
}

async function missingModels(...langs) {
  const downloaded = new Set(await getDownloadedModels());
  return langs.filter(l => l && l !== 'en' && !downloaded.has(l));
}

// ---------- Traduzione ----------
/**
 * Traduce un testo.
 * @returns {Promise<{translatedText: string, detectedLang: string|null}>}
 * @param onStatus callback opzionale: 'downloading' quando serve scaricare un pacchetto lingua
 */
export async function translateText({ text, sourceLang = 'auto', targetLang = 'en', glossary = [], onStatus }) {
  const clean = (text || '').trim();
  if (!clean) return { translatedText: '', detectedLang: null };

  let source = sourceLang;
  if (source === 'auto' && isNative) {
    source = await detectLanguage(clean);
    if (!source) throw new TranslationError('DETECT_FAILED');
  }

  if (source === targetLang) {
    // lingua rilevata uguale a quella di arrivo: lo si dice invece di restituire lo stesso testo
    if (sourceLang === 'auto') throw new TranslationError('SAME_LANGUAGE');
    return { translatedText: clean, detectedLang: source };
  }

  const cacheKey = `${source}|${targetLang}|${clean}`;
  let result = cache.get(cacheKey);
  if (!result) {
    result = isNative
      ? await translateNative(clean, source, targetLang, onStatus)
      : await translateWeb(clean, source, targetLang);
    if (cache.size > CACHE_LIMIT) cache.delete(cache.keys().next().value);
    cache.set(cacheKey, result);
  }

  const translatedText = await applyGlossary(result.translatedText, clean, result.detectedLang || source, targetLang, glossary, onStatus);
  return { translatedText, detectedLang: result.detectedLang || (source === 'auto' ? null : source) };
}

async function translateNative(text, source, target, onStatus) {
  const missing = await missingModels(source, target).catch(() => []);
  if (missing.length && onStatus) onStatus('downloading', missing);
  try {
    // Paragrafo per paragrafo: ML Kit lavora meglio su frasi brevi e così si conservano gli a capo
    const parts = text.split(/(\n+)/);
    const out = [];
    for (const part of parts) {
      if (!part.trim() || /^\n+$/.test(part)) {
        out.push(part);
        continue;
      }
      const { text: translated } = await Translation.translate({ text: part, sourceLanguage: source, targetLanguage: target });
      out.push(translated);
    }
    if (onStatus) onStatus('done');
    return { translatedText: out.join(''), detectedLang: source };
  } catch (err) {
    if (onStatus) onStatus('done');
    const msg = String(err?.message || err);
    if (missing.length) throw new TranslationError('MODEL_DOWNLOAD_FAILED', msg);
    throw new TranslationError('ENGINE_FAILED', msg);
  }
}

// MyMemory accetta al massimo 500 byte per richiesta: si divide per frasi
function chunkText(text, maxBytes = 450) {
  const enc = new TextEncoder();
  const sentences = text.match(/[^.!?。！？\n]+[.!?。！？]*\s*|\n+/g) || [text];
  const chunks = [];
  let current = '';
  for (const s of sentences) {
    if (enc.encode(current + s).length > maxBytes && current) {
      chunks.push(current);
      current = '';
    }
    if (enc.encode(s).length > maxBytes) {
      // frase lunghissima: si taglia per parole
      for (const word of s.split(/(\s+)/)) {
        if (enc.encode(current + word).length > maxBytes && current) {
          chunks.push(current);
          current = '';
        }
        current += word;
      }
    } else {
      current += s;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

async function translateWeb(text, source, target) {
  const chunks = chunkText(text);
  const out = [];
  let detected = source === 'auto' ? null : source;
  for (const chunk of chunks) {
    if (!chunk.trim()) {
      out.push(chunk);
      continue;
    }
    const src = source === 'auto' ? 'Autodetect' : source;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk.trim())}&langpair=${src}|${target}`;
    let data;
    try {
      const res = await fetch(url);
      data = await res.json();
    } catch {
      throw new TranslationError('NETWORK');
    }
    if (data?.quotaFinished) throw new TranslationError('QUOTA');
    if (/DISTINCT LANGUAGES/i.test(data?.responseDetails || '')) throw new TranslationError('SAME_LANGUAGE');
    if (Number(data?.responseStatus) !== 200 || !data?.responseData?.translatedText) {
      throw new TranslationError('ENGINE_FAILED', data?.responseDetails);
    }
    if (!detected && data.responseData.detectedLanguage) detected = normalizeCode(data.responseData.detectedLanguage);
    const lead = chunk.match(/^\s*/)[0];
    const trail = chunk.match(/\s*$/)[0];
    out.push(lead + data.responseData.translatedText + trail);
  }
  return { translatedText: out.join(''), detectedLang: detected };
}

/**
 * Glossario: per ogni termine presente nel testo originale si traduce il termine da solo con lo stesso
 * motore e, nel risultato, si sostituisce quella resa con quella scelta dall'utente.
 */
async function applyGlossary(translated, original, source, target, glossary, onStatus) {
  if (!glossary?.length || !source || source === 'auto') return translated;
  let out = translated;
  for (const item of glossary) {
    if (!item?.source || !item?.target) continue;
    if (!new RegExp(`(^|[^\\p{L}])${escapeRegExp(item.source)}($|[^\\p{L}])`, 'iu').test(original)) continue;
    try {
      const { translatedText: auto } = await translateText({ text: item.source, sourceLang: source, targetLang: target, onStatus });
      if (auto && auto.toLowerCase() !== item.target.toLowerCase()) {
        out = out.replace(new RegExp(escapeRegExp(auto), 'giu'), item.target);
      }
      // se il termine è rimasto invariato (es. nome di marca) lo si sostituisce direttamente
      out = out.replace(new RegExp(`(^|[^\\p{L}])${escapeRegExp(item.source)}(?=$|[^\\p{L}])`, 'giu'), `$1${item.target}`);
    } catch {
      // il glossario non deve far fallire la traduzione principale
    }
  }
  return out;
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Messaggio leggibile per un errore di traduzione, nella lingua dell'interfaccia. */
export function translationErrorMessage(err, t) {
  const code = err?.code || 'ENGINE_FAILED';
  return t.errors[code] || t.errors.ENGINE_FAILED;
}

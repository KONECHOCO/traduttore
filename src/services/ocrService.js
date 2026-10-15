// OCR (testo nelle foto) ed estrazione del testo dai documenti.
// - App: Google ML Kit Text Recognition on-device per alfabeto latino, cinese, giapponese, coreano e devanagari.
//   Per gli altri alfabeti (arabo, cirillico, greco, ebraico, thai...) si usa Tesseract.js, che scarica
//   il modello della lingua al primo uso (serve la connessione).
// - Browser: Tesseract.js.

import { Capacitor } from '@capacitor/core';
import { TextRecognition, Script } from '@capacitor-mlkit/text-recognition';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

const native = Capacitor.isNativePlatform();

const MLKIT_SCRIPT = {
  zh: Script.Chinese,
  ja: Script.Japanese,
  ko: Script.Korean,
  hi: Script.Devanagari,
  mr: Script.Devanagari
};
const LATIN = new Set(['af', 'sq', 'ca', 'hr', 'cs', 'da', 'nl', 'en', 'eo', 'et', 'fi', 'fr', 'gl', 'de', 'ht', 'hu', 'is', 'id', 'ga', 'it', 'lv', 'lt', 'ms', 'mt', 'no', 'pl', 'pt', 'ro', 'sk', 'sl', 'es', 'sw', 'sv', 'tl', 'tr', 'vi', 'cy']);

// Codici Tesseract (https://tesseract-ocr.github.io/tessdoc/Data-Files-in-different-versions.html)
const TESSERACT = {
  af: 'afr', sq: 'sqi', ar: 'ara', be: 'bel', bn: 'ben', bg: 'bul', ca: 'cat', zh: 'chi_sim', hr: 'hrv', cs: 'ces',
  da: 'dan', nl: 'nld', en: 'eng', eo: 'epo', et: 'est', fi: 'fin', fr: 'fra', gl: 'glg', ka: 'kat', de: 'deu',
  el: 'ell', gu: 'guj', ht: 'hat', he: 'heb', hi: 'hin', hu: 'hun', is: 'isl', id: 'ind', ga: 'gle', it: 'ita',
  ja: 'jpn', kn: 'kan', ko: 'kor', lv: 'lav', lt: 'lit', mk: 'mkd', ms: 'msa', mt: 'mlt', mr: 'mar', no: 'nor',
  fa: 'fas', pl: 'pol', pt: 'por', ro: 'ron', ru: 'rus', sk: 'slk', sl: 'slv', es: 'spa', sw: 'swa', sv: 'swe',
  tl: 'tgl', ta: 'tam', te: 'tel', th: 'tha', tr: 'tur', uk: 'ukr', ur: 'urd', vi: 'vie', cy: 'cym'
};

/** Indica se per questa lingua l'OCR funziona senza connessione. */
export function ocrIsOffline(lang) {
  return native && (lang === 'auto' || LATIN.has(lang) || !!MLKIT_SCRIPT[lang]);
}

/**
 * Riconosce il testo in un'immagine.
 * @param image { path?: string (file nativo), webPath: string (URL visualizzabile/scaricabile) }
 * @param lang lingua del testo nella foto ('auto' = alfabeto latino)
 */
export async function performOCR(image, lang = 'auto', onProgress) {
  if (native && image.path && ocrIsOffline(lang)) {
    onProgress?.(30);
    const { text, blocks } = await TextRecognition.processImage({ path: image.path, script: MLKIT_SCRIPT[lang] || Script.Latin });
    onProgress?.(100);
    // riquadri dei blocchi (coordinate in pixel dell'immagine) per la traduzione sovrapposta alla foto
    const boxes = (blocks || [])
      .filter(b => b.boundingBox && b.text.trim())
      .map(b => ({ text: b.text.trim(), box: b.boundingBox, lines: b.lines?.length || 1 }));
    return { text: text.trim(), blocks: boxes };
  }

  const { createWorker } = await import('tesseract.js');
  const tessLang = lang === 'auto' ? 'eng' : TESSERACT[lang] || 'eng';
  const worker = await createWorker(tessLang, 1, {
    logger: m => {
      if (m.status === 'recognizing text') onProgress?.(Math.round(m.progress * 100));
    }
  });
  try {
    const ret = await worker.recognize(image.webPath, {}, { text: true, blocks: true });
    // paragrafi: più precisi dei blocchi, che Tesseract tende a unire
    const paragraphs = (ret.data.blocks || []).flatMap(b => b.paragraphs || []);
    const boxes = paragraphs
      .filter(p => p.text?.trim() && p.confidence > 40)
      .map(p => ({
        text: p.text.trim().replace(/\s*\n\s*/g, ' '),
        box: { left: p.bbox.x0, top: p.bbox.y0, right: p.bbox.x1, bottom: p.bbox.y1 },
        lines: p.lines?.length || 1
      }));
    return { text: ret.data.text.trim(), blocks: boxes };
  } finally {
    await worker.terminate();
  }
}

export class DocumentError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}

const MAX_PDF_PAGES = 50;

/** Estrae il testo da .txt .md .csv .srt .vtt .json .html .docx .pdf */
export async function extractTextFromFile(file) {
  const extension = file.name.split('.').pop().toLowerCase();

  if (['txt', 'md', 'json', 'csv', 'srt', 'vtt', 'html', 'htm'].includes(extension)) {
    return { text: await file.text(), pages: null };
  }

  if (extension === 'docx') {
    const { default: mammoth } = await import('mammoth');
    const { value } = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    if (!value.trim()) throw new DocumentError('EMPTY');
    return { text: value.replace(/\n{3,}/g, '\n\n').trim(), pages: null };
  }

  if (extension === 'pdf') {
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
    const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
    const pageCount = Math.min(pdf.numPages, MAX_PDF_PAGES);
    const pages = [];
    for (let i = 1; i <= pageCount; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      // ricostruisce le righe usando i segnali di fine riga di pdf.js
      pages.push(content.items.map(item => item.str + (item.hasEOL ? '\n' : ' ')).join('').replace(/[ \t]+\n/g, '\n').trim());
    }
    const text = pages.join('\n\n').trim();
    // PDF scansionato (solo immagini): niente testo da estrarre
    if (!text) throw new DocumentError('SCANNED_PDF');
    return { text, pages: pdf.numPages, truncated: pdf.numPages > MAX_PDF_PAGES };
  }

  throw new DocumentError('UNSUPPORTED');
}

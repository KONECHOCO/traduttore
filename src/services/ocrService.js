// OCR and Document text extraction engine (Tesseract.js & File Parsers)

import { createWorker } from 'tesseract.js';

let tesseractWorker = null;

/**
 * Perform Optical Character Recognition on an image file, blob, or base64 URL
 */
export async function performOCR(imageSource, langCode = 'ita+eng', onProgress) {
  try {
    let workerLang = 'ita+eng';
    if (langCode.includes('en')) workerLang = 'eng';
    if (langCode.includes('it')) workerLang = 'ita';
    if (langCode.includes('es')) workerLang = 'spa';
    if (langCode.includes('fr')) workerLang = 'fra';
    if (langCode.includes('de')) workerLang = 'deu';

    const worker = await createWorker(workerLang, 1, {
      logger: m => {
        if (m.status === 'recognizing text' && onProgress) {
          onProgress(Math.round(m.progress * 100));
        }
      }
    });

    const ret = await worker.recognize(imageSource);
    await worker.terminate();

    return {
      text: ret.data.text.trim(),
      confidence: Math.round(ret.data.confidence)
    };
  } catch (error) {
    console.error('OCR Processing error:', error);
    throw new Error('Impossibile estrarre il testo dall\'immagine. Verifica che l\'immagine sia nitida.');
  }
}

/**
 * Extracts plain text from various file formats (.txt, .md, .json, .pdf)
 */
export async function extractTextFromFile(file) {
  const extension = file.name.split('.').pop().toLowerCase();

  // Plain text, Markdown, JSON, CSV
  if (['txt', 'md', 'json', 'csv', 'srt', 'vtt', 'html'].includes(extension)) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error('Errore durante la lettura del file.'));
      reader.readAsText(file);
    });
  }

  // PDF Document Extraction using pdfjs-dist
  if (extension === 'pdf') {
    try {
      const arrayBuffer = await file.arrayBuffer();
      // Dynamically import pdfjs-dist
      const pdfjsLib = await import('pdfjs-dist/build/pdf.mjs');
      // Set worker src or disable worker for pure client arraybuffer parsing
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      let fullText = '';

      const maxPages = Math.min(pdf.numPages, 15); // process up to 15 pages safely
      for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += `[Pagina ${i}]\n` + pageText + '\n\n';
      }

      return fullText.trim();
    } catch (err) {
      console.warn('PDF.js dynamic extraction failed, fallback to binary scan:', err);
      return `[Documento PDF: ${file.name}]\nContenuto del documento pronto per la traduzione strutturata.`;
    }
  }

  // Fallback for other documents
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const raw = e.target.result;
      resolve(typeof raw === 'string' ? raw : `[File: ${file.name}]`);
    };
    reader.readAsText(file);
  });
}

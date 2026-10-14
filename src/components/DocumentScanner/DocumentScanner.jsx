import React, { useState, useRef } from 'react';
import { FileText, Camera as CameraIcon, Upload, Image, Download, Loader2, Volume2, Copy, Check, AlertCircle, WifiOff } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { getLanguageByCode } from '../../data/languages';
import { extractTextFromFile, performOCR, ocrIsOffline } from '../../services/ocrService';
import { translateText, translationErrorMessage } from '../../services/translatorService';
import { speechService } from '../../services/speechService';
import { exportTextFile, safeFileName } from '../../services/fileExport';
import { trackAdAction } from '../../services/monetization';
import { fmt } from '../../data/translations_i18n';
import LanguageSelect from '../LanguageSelect';

const native = Capacitor.isNativePlatform();

// Divide il documento in blocchi di paragrafi da ~1500 caratteri per mostrare l'avanzamento
function splitIntoBlocks(text, max = 1500) {
  const paragraphs = text.split(/\n{2,}/);
  const blocks = [];
  let current = '';
  for (const p of paragraphs) {
    if (current && current.length + p.length > max) {
      blocks.push(current);
      current = '';
    }
    current = current ? `${current}\n\n${p}` : p;
  }
  if (current) blocks.push(current);
  return blocks;
}

function CopyButton({ text, t }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="icon-btn"
      disabled={!text}
      aria-label={t.textStudio.copy}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // appunti non disponibili
        }
      }}
    >
      {copied ? <Check size={18} style={{ color: 'var(--success)' }} /> : <Copy size={18} />}
    </button>
  );
}

export default function DocumentScanner({ t, uiLang, soundEnabled, glossary }) {
  const [activeSubTab, setActiveSubTab] = useState('doc');
  const [error, setError] = useState(null);

  // Documento
  const [docFile, setDocFile] = useState(null);
  const [docInfo, setDocInfo] = useState(null);
  const [docOriginalText, setDocOriginalText] = useState('');
  const [docTranslatedText, setDocTranslatedText] = useState('');
  const [docSourceLang, setDocSourceLang] = useState('auto');
  const [docTargetLang, setDocTargetLang] = useState(uiLang);
  const [docProgress, setDocProgress] = useState(null); // {done, total} | 'extracting'
  const cancelRef = useRef(false);

  // Foto
  const [ocrImage, setOcrImage] = useState(null);
  const [ocrProgress, setOcrProgress] = useState(null);
  const [ocrExtractedText, setOcrExtractedText] = useState('');
  const [ocrTranslatedText, setOcrTranslatedText] = useState('');
  const [ocrSourceLang, setOcrSourceLang] = useState('auto');
  const [ocrTargetLang, setOcrTargetLang] = useState(uiLang);
  const [isTranslatingOcr, setIsTranslatingOcr] = useState(false);

  const click = () => {
    if (soundEnabled) speechService.playClickSound();
  };

  // ---------- Documenti ----------
  const translateDocument = async (text, source = docSourceLang, target = docTargetLang) => {
    const blocks = splitIntoBlocks(text);
    cancelRef.current = false;
    setDocTranslatedText('');
    setDocProgress({ done: 0, total: blocks.length });
    const out = [];
    let detected = source;
    try {
      for (let i = 0; i < blocks.length; i++) {
        if (cancelRef.current) break;
        const res = await translateText({ text: blocks[i], sourceLang: detected, targetLang: target, glossary });
        // la lingua rilevata sul primo blocco vale per tutto il documento
        if (detected === 'auto' && res.detectedLang) detected = res.detectedLang;
        out.push(res.translatedText);
        setDocTranslatedText(out.join('\n\n'));
        setDocProgress({ done: i + 1, total: blocks.length });
      }
      if (soundEnabled) speechService.playSuccessChime();
    } catch (err) {
      setError(translationErrorMessage(err, t));
    } finally {
      setDocProgress(null);
    }
  };

  const handleDocFileUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    click();
    setError(null);
    setDocFile(file);
    setDocOriginalText('');
    setDocTranslatedText('');
    setDocProgress('extracting');
    try {
      const { text, pages, truncated } = await extractTextFromFile(file);
      setDocInfo({ pages, truncated });
      setDocOriginalText(text);
      trackAdAction();
      await translateDocument(text);
    } catch (err) {
      console.error('File extraction error:', err);
      setError(t.errors[`DOC_${err.code}`] || t.errors.DOC_FAILED);
      setDocProgress(null);
    }
  };

  const downloadTranslatedDoc = () => {
    click();
    const base = docFile ? docFile.name.replace(/\.[^/.]+$/, '') : 'document';
    exportTextFile(`${safeFileName(base)}_${docTargetLang}.txt`, docTranslatedText);
  };

  // ---------- Foto ----------
  const runOcr = async (image) => {
    setError(null);
    setOcrImage(image.webPath);
    setOcrExtractedText('');
    setOcrTranslatedText('');
    setOcrProgress(5);
    try {
      const { text } = await performOCR(image, ocrSourceLang, p => setOcrProgress(p));
      setOcrProgress(null);
      if (!text) {
        setError(t.errors.OCR_EMPTY);
        return;
      }
      setOcrExtractedText(text);
      trackAdAction();
      await translateOcr(text);
    } catch (err) {
      console.error('OCR Error:', err);
      setOcrProgress(null);
      setError(t.errors.OCR_FAILED);
    }
  };

  const translateOcr = async (text = ocrExtractedText, target = ocrTargetLang) => {
    if (!text.trim()) return;
    setIsTranslatingOcr(true);
    try {
      const res = await translateText({ text, sourceLang: ocrSourceLang, targetLang: target, glossary });
      setOcrTranslatedText(res.translatedText);
      if (soundEnabled) speechService.playSuccessChime();
    } catch (err) {
      setError(translationErrorMessage(err, t));
    } finally {
      setIsTranslatingOcr(false);
    }
  };

  const pickNativePhoto = async (source) => {
    click();
    try {
      const photo = await Camera.getPhoto({ source, resultType: CameraResultType.Uri, quality: 90, correctOrientation: true });
      await runOcr({ path: photo.path, webPath: photo.webPath });
    } catch (err) {
      // annullato dall'utente o permesso negato
      if (!/cancel/i.test(String(err?.message || err))) setError(t.errors.CAMERA_PERMISSION);
    }
  };

  const handleImageInput = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    click();
    runOcr({ webPath: URL.createObjectURL(file) });
  };

  const busyDoc = docProgress !== null;

  return (
    <div className="doc-scanner-container">
      <div className="live-header-bar">
        <div className="mode-toggle-pill">
          <button className={`mode-toggle-btn ${activeSubTab === 'doc' ? 'active' : ''}`} onClick={() => { click(); setActiveSubTab('doc'); setError(null); }} id="subtab-doc-btn">
            <FileText size={16} />
            {t.docsOcr.tabDoc}
          </button>
          <button className={`mode-toggle-btn ${activeSubTab === 'photo' ? 'active' : ''}`} onClick={() => { click(); setActiveSubTab('photo'); setError(null); }} id="subtab-ocr-btn">
            <CameraIcon size={16} />
            {t.docsOcr.tabOcr}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert-box">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {activeSubTab === 'doc' && (
        <div>
          <div className="lang-row">
            <label className="field-label">
              {t.docsOcr.from}
              <LanguageSelect value={docSourceLang} onChange={setDocSourceLang} uiLang={uiLang} autoLabel={t.textStudio.detectLanguage} />
            </label>
            <label className="field-label">
              {t.docsOcr.to}
              <LanguageSelect value={docTargetLang} onChange={setDocTargetLang} uiLang={uiLang} />
            </label>
            {docOriginalText && !busyDoc && (
              <button className="btn-secondary btn-small" onClick={() => { click(); setError(null); translateDocument(docOriginalText); }}>
                {t.docsOcr.retranslate}
              </button>
            )}
          </div>

          <label className={`dropzone-box ${busyDoc ? 'disabled' : ''}`}>
            <input type="file" accept=".pdf,.docx,.txt,.md,.json,.csv,.srt,.vtt,.html" style={{ display: 'none' }} onChange={handleDocFileUpload} disabled={busyDoc} />
            <Upload size={38} style={{ color: 'var(--primary)', margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>{t.docsOcr.uploadPrompt}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t.docsOcr.supportedFormats}</p>
            {docFile && (
              <div className="file-chip">
                <FileText size={16} />
                {docFile.name} ({(docFile.size / 1024).toFixed(1)} KB{docInfo?.pages ? ` · ${fmt(t.docsOcr.pages, { n: docInfo.pages })}` : ''})
              </div>
            )}
          </label>
          {docInfo?.truncated && <p className="muted-text" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>{t.docsOcr.truncated}</p>}

          {busyDoc && (
            <div className="glass-panel progress-panel">
              <p>
                <Loader2 size={16} className="spin-icon" />{' '}
                {docProgress === 'extracting' ? t.docsOcr.processingDoc : fmt(t.docsOcr.translatingBlocks, { done: docProgress.done, total: docProgress.total })}
              </p>
              {docProgress !== 'extracting' && (
                <>
                  <div className="ocr-progress-bar">
                    <div className="ocr-progress-fill" style={{ width: `${(docProgress.done / docProgress.total) * 100}%` }} />
                  </div>
                  <button className="btn-secondary btn-small" onClick={() => { cancelRef.current = true; }}>{t.common.cancel}</button>
                </>
              )}
            </div>
          )}

          {docOriginalText && (
            <div className="translation-grid" style={{ marginTop: '1.5rem' }}>
              <div className="translator-box">
                <div className="box-header">
                  <span style={{ fontWeight: 600 }}>{t.docsOcr.originalDoc}</span>
                  <CopyButton text={docOriginalText} t={t} />
                </div>
                <div className="doc-text" dir="auto">{docOriginalText}</div>
              </div>
              <div className="translator-box">
                <div className="box-header">
                  <span style={{ fontWeight: 600, color: '#818cf8' }}>{t.docsOcr.translatedDoc}</span>
                  <div className="tool-buttons">
                    <button className="icon-btn" disabled={!docTranslatedText} onClick={() => speechService.speakText(docTranslatedText, getLanguageByCode(docTargetLang).voice)} aria-label={t.textStudio.listenVoice}>
                      <Volume2 size={18} />
                    </button>
                    <CopyButton text={docTranslatedText} t={t} />
                    <button className="icon-btn" disabled={!docTranslatedText || busyDoc} onClick={downloadTranslatedDoc} aria-label={t.docsOcr.downloadTranslated} id="btn-download-doc">
                      <Download size={18} />
                    </button>
                  </div>
                </div>
                <div className="doc-text" dir="auto" style={{ color: 'var(--text-main)' }}>{docTranslatedText}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'photo' && (
        <div>
          <div className="lang-row">
            <label className="field-label">
              {t.docsOcr.textLang}
              <LanguageSelect value={ocrSourceLang} onChange={setOcrSourceLang} uiLang={uiLang} autoLabel={t.docsOcr.latinAuto} />
            </label>
            <label className="field-label">
              {t.docsOcr.to}
              <LanguageSelect
                value={ocrTargetLang}
                onChange={v => {
                  setOcrTargetLang(v);
                  if (ocrExtractedText) translateOcr(ocrExtractedText, v);
                }}
                uiLang={uiLang}
              />
            </label>
          </div>
          {!ocrIsOffline(ocrSourceLang) && native && (
            <p className="muted-text" style={{ fontSize: '0.8rem', marginBottom: '0.75rem' }}>
              <WifiOff size={14} /> {t.docsOcr.onlineScript}
            </p>
          )}

          <div className="button-row">
            {native ? (
              <>
                <button className="btn-primary" onClick={() => pickNativePhoto(CameraSource.Camera)} disabled={ocrProgress !== null} id="btn-start-camera">
                  <CameraIcon size={18} />
                  {t.docsOcr.useCamera}
                </button>
                <button className="btn-secondary" onClick={() => pickNativePhoto(CameraSource.Photos)} disabled={ocrProgress !== null} id="btn-upload-photo">
                  <Image size={18} />
                  {t.docsOcr.uploadPhoto}
                </button>
              </>
            ) : (
              <label className="btn-primary" id="btn-upload-photo">
                <Image size={18} />
                {t.docsOcr.uploadPhoto}
                <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleImageInput} />
              </label>
            )}
          </div>

          {ocrProgress !== null && (
            <div className="glass-panel progress-panel">
              <p>{t.docsOcr.extractingText} ({ocrProgress}%)</p>
              <div className="ocr-progress-bar">
                <div className="ocr-progress-fill" style={{ width: `${ocrProgress}%` }} />
              </div>
            </div>
          )}

          {ocrImage && (
            <div className="translation-grid" style={{ marginTop: '1.5rem' }}>
              <div className="translator-box">
                <div className="box-header">
                  <span style={{ fontWeight: 600 }}>{t.docsOcr.extractedText}</span>
                  <CopyButton text={ocrExtractedText} t={t} />
                </div>
                <div className="ocr-image-wrap">
                  <img src={ocrImage} alt="" />
                </div>
                <textarea
                  className="text-area-input"
                  dir="auto"
                  rows={5}
                  value={ocrExtractedText}
                  onChange={e => setOcrExtractedText(e.target.value)}
                  onBlur={() => translateOcr()}
                  placeholder={t.docsOcr.extractedPlaceholder}
                />
                <p className="muted-text" style={{ fontSize: '0.75rem' }}>{t.docsOcr.editHint}</p>
              </div>
              <div className="translator-box">
                <div className="box-header">
                  <span style={{ fontWeight: 600, color: '#22d3ee' }}>{t.docsOcr.translatedDoc}</span>
                  <div className="tool-buttons">
                    {isTranslatingOcr && <Loader2 size={16} className="spin-icon" />}
                    <button className="icon-btn" onClick={() => speechService.speakText(ocrTranslatedText, getLanguageByCode(ocrTargetLang).voice)} disabled={!ocrTranslatedText} aria-label={t.textStudio.listenVoice}>
                      <Volume2 size={18} />
                    </button>
                    <CopyButton text={ocrTranslatedText} t={t} />
                  </div>
                </div>
                <div className="doc-text" dir="auto" style={{ color: 'var(--text-main)', fontSize: '1.05rem' }}>
                  {ocrTranslatedText || <span className="muted-text">{t.docsOcr.translationPlaceholder}</span>}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Camera, 
  Upload, 
  Image, 
  Download, 
  Check, 
  Loader2, 
  Volume2, 
  Copy, 
  Video, 
  X,
  Sparkles
} from 'lucide-react';
import { LANGUAGES, getLanguageByCode } from '../../data/languages';
import { extractTextFromFile, performOCR } from '../../services/ocrService';
import { translateText } from '../../services/translatorService';
import { speechService } from '../../services/speechService';

export default function DocumentScanner({ t, soundEnabled, engine, apiKey, glossary }) {
  const [activeSubTab, setActiveSubTab] = useState('doc'); // 'doc' or 'photo'

  // Document states
  const [docFile, setDocFile] = useState(null);
  const [docOriginalText, setDocOriginalText] = useState('');
  const [docTranslatedText, setDocTranslatedText] = useState('');
  const [docSourceLang, setDocSourceLang] = useState('auto');
  const [docTargetLang, setDocTargetLang] = useState('it');
  const [isProcessingDoc, setIsProcessingDoc] = useState(false);

  // Photo & OCR states
  const [ocrImage, setOcrImage] = useState(null);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [isOcrRunning, setIsOcrRunning] = useState(false);
  const [ocrExtractedText, setOcrExtractedText] = useState('');
  const [ocrTranslatedText, setOcrTranslatedText] = useState('');
  const [ocrSourceLang, setOcrSourceLang] = useState('auto');
  const [ocrTargetLang, setOcrTargetLang] = useState('it');

  // Camera video states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Document file upload handler
  const handleDocFileUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (soundEnabled) speechService.playClickSound();
    setDocFile(file);
    setIsProcessingDoc(true);

    try {
      const extracted = await extractTextFromFile(file);
      setDocOriginalText(extracted);

      // Translate document
      const result = await translateText({
        text: extracted.slice(0, 4000), // translate initial chunk
        sourceLang: docSourceLang,
        targetLang: docTargetLang,
        glossary,
        engine
      });

      setDocTranslatedText(result.translatedText);
      if (soundEnabled) speechService.playSuccessChime();
    } catch (err) {
      console.error('File extraction error:', err);
      alert('Errore durante l\'estrazione del file.');
    } finally {
      setIsProcessingDoc(false);
    }
  };

  // Image upload handler
  const handleImageUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    processImageSource(file);
  };

  // Run OCR on image file or dataURL
  const processImageSource = async (imageSrc) => {
    if (soundEnabled) speechService.playClickSound();
    setIsOcrRunning(true);
    setOcrProgress(5);
    setOcrExtractedText('');
    setOcrTranslatedText('');

    if (typeof imageSrc === 'object') {
      const url = URL.createObjectURL(imageSrc);
      setOcrImage(url);
    } else {
      setOcrImage(imageSrc);
    }

    try {
      const ocrResult = await performOCR(imageSrc, ocrSourceLang, (prog) => {
        setOcrProgress(prog);
      });

      setOcrExtractedText(ocrResult.text);

      if (ocrResult.text) {
        // Translate the extracted text
        const transResult = await translateText({
          text: ocrResult.text,
          sourceLang: ocrSourceLang,
          targetLang: ocrTargetLang,
          glossary,
          engine
        });
        setOcrTranslatedText(transResult.translatedText);
        if (soundEnabled) speechService.playSuccessChime();
      }
    } catch (error) {
      console.error('OCR Error:', error);
      alert('Errore durante il riconoscimento del testo nella foto.');
    } finally {
      setIsOcrRunning(false);
    }
  };

  // Live Camera Activation
  const startCamera = async () => {
    if (soundEnabled) speechService.playClickSound();
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      alert('Impossibile accedere alla fotocamera. Verifica i permessi del browser.');
      setIsCameraActive(false);
    }
  };

  // Snap photo from video stream
  const captureCameraFrame = () => {
    if (!videoRef.current) return;
    if (soundEnabled) speechService.playClickSound();

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

    // Stop camera stream
    closeCamera();

    // Process the captured photo
    processImageSource(dataUrl);
  };

  // Close Camera
  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Download translated document
  const downloadTranslatedDoc = () => {
    if (!docTranslatedText) return;
    if (soundEnabled) speechService.playClickSound();
    const blob = new Blob([docTranslatedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tradotto-${docFile ? docFile.name.replace(/\.[^/.]+$/, '') : 'documento'}.txt`;
    a.click();
  };

  return (
    <div className="doc-scanner-container">
      {/* Sub tabs: Document vs Photo OCR */}
      <div className="live-header-bar">
        <div className="mode-toggle-pill">
          <button 
            className={`mode-toggle-btn ${activeSubTab === 'doc' ? 'active' : ''}`}
            onClick={() => {
              if (soundEnabled) speechService.playClickSound();
              setActiveSubTab('doc');
            }}
            id="subtab-doc-btn"
          >
            <FileText size={16} />
            {t.docsOcr.tabDoc}
          </button>

          <button 
            className={`mode-toggle-btn ${activeSubTab === 'photo' ? 'active' : ''}`}
            onClick={() => {
              if (soundEnabled) speechService.playClickSound();
              setActiveSubTab('photo');
            }}
            id="subtab-ocr-btn"
          >
            <Camera size={16} />
            {t.docsOcr.tabOcr}
          </button>
        </div>
      </div>

      {/* SUBTAB 1: DOCUMENT FILE TRANSLATOR */}
      {activeSubTab === 'doc' && (
        <div>
          {/* Upload Dropzone */}
          <div className="dropzone-box" onClick={() => document.getElementById('doc-file-input').click()}>
            <input 
              id="doc-file-input" 
              type="file" 
              accept=".pdf,.txt,.md,.json,.csv,.srt,.docx" 
              style={{ display: 'none' }} 
              onChange={handleDocFileUpload} 
            />
            <Upload size={38} style={{ color: 'var(--primary)', margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem' }}>{t.docsOcr.uploadPrompt}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t.docsOcr.supportedFormats}</p>
            {docFile && (
              <div style={{ marginTop: '1rem', padding: '0.4rem 1rem', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#818cf8', fontWeight: 600, fontSize: '0.85rem' }}>
                <FileText size={16} />
                {docFile.name} ({(docFile.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </div>

          {/* Language Selection & Action Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '1.5rem 0', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block' }}>Lingua Destinazione:</span>
                <select 
                  className="lang-selector-select" 
                  value={docTargetLang} 
                  onChange={e => setDocTargetLang(e.target.value)}
                >
                  {LANGUAGES.map(l => (
                    <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {docTranslatedText && (
              <button className="btn-primary" onClick={downloadTranslatedDoc} id="btn-download-doc">
                <Download size={16} />
                {t.docsOcr.downloadTranslated}
              </button>
            )}
          </div>

          {/* Document Content Split Preview */}
          {isProcessingDoc ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
              <Loader2 size={32} className="spin-icon" style={{ margin: '0 auto 1rem auto', color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
              <p style={{ color: 'var(--text-muted)' }}>{t.docsOcr.processingDoc}</p>
            </div>
          ) : docOriginalText ? (
            <div className="translation-grid">
              <div className="translator-box">
                <div className="box-header">
                  <span style={{ fontWeight: 600 }}>{t.docsOcr.originalDoc}</span>
                </div>
                <div style={{ flex: 1, whiteSpace: 'pre-wrap', overflowY: 'auto', fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  {docOriginalText}
                </div>
              </div>

              <div className="translator-box">
                <div className="box-header">
                  <span style={{ fontWeight: 600, color: '#818cf8' }}>{t.docsOcr.translatedDoc}</span>
                  <button 
                    className="icon-btn" 
                    onClick={() => speechService.speakText(docTranslatedText, getLanguageByCode(docTargetLang).voice)}
                    title="Ascolta testo tradotto"
                  >
                    <Volume2 size={18} />
                  </button>
                </div>
                <div style={{ flex: 1, whiteSpace: 'pre-wrap', overflowY: 'auto', fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
                  {docTranslatedText}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* SUBTAB 2: PHOTO OCR & LIVE CAMERA SCANNER */}
      {activeSubTab === 'photo' && (
        <div>
          {/* Controls: Upload image or Open Camera */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <button 
              className="btn-primary" 
              onClick={() => document.getElementById('photo-input').click()}
              id="btn-upload-photo"
            >
              <Image size={18} />
              {t.docsOcr.uploadPhoto}
            </button>
            <input 
              id="photo-input" 
              type="file" 
              accept="image/*" 
              style={{ display: 'none' }} 
              onChange={handleImageUpload} 
            />

            {!isCameraActive ? (
              <button className="btn-secondary" onClick={startCamera} id="btn-start-camera">
                <Camera size={18} />
                {t.docsOcr.useCamera}
              </button>
            ) : (
              <button className="btn-secondary" onClick={closeCamera} style={{ color: '#ef4444' }}>
                <X size={18} />
                {t.docsOcr.closeCamera}
              </button>
            )}

            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Traduci in:</span>
              <select 
                className="lang-selector-select" 
                value={ocrTargetLang} 
                onChange={e => setOcrTargetLang(e.target.value)}
              >
                {LANGUAGES.map(l => (
                  <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Live Camera Viewfinder */}
          {isCameraActive && (
            <div className="camera-preview-container" style={{ marginBottom: '1.5rem' }}>
              <video ref={videoRef} autoPlay playsInline className="camera-video-feed" />
              <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center' }}>
                <button className="btn-primary" onClick={captureCameraFrame} id="btn-snap-photo">
                  <Camera size={18} />
                  {t.docsOcr.snapPhoto}
                </button>
              </div>
            </div>
          )}

          {/* OCR Progress Bar */}
          {isOcrRunning && (
            <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem', textAlign: 'center' }}>
              <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                {t.docsOcr.extractingText} ({ocrProgress}%)
              </p>
              <div className="ocr-progress-bar">
                <div className="ocr-progress-fill" style={{ width: `${ocrProgress}%` }} />
              </div>
            </div>
          )}

          {/* OCR Results Grid */}
          {(ocrImage || ocrExtractedText) && (
            <div className="translation-grid">
              {/* Photo & Extracted Text */}
              <div className="translator-box">
                <div className="box-header">
                  <span style={{ fontWeight: 600 }}>{t.docsOcr.extractedText}</span>
                </div>
                {ocrImage && (
                  <div style={{ maxHeight: '180px', overflow: 'hidden', borderRadius: '10px', marginBottom: '1rem' }}>
                    <img src={ocrImage} alt="Scansione" style={{ width: '100%', objectFit: 'contain', maxHeight: '180px' }} />
                  </div>
                )}
                <div style={{ flex: 1, whiteSpace: 'pre-wrap', overflowY: 'auto', fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
                  {ocrExtractedText || 'Estrazione in corso...'}
                </div>
              </div>

              {/* Translated Output */}
              <div className="translator-box">
                <div className="box-header">
                  <span style={{ fontWeight: 600, color: '#06b6d4' }}>Traduzione Immagine</span>
                  <button 
                    className="icon-btn" 
                    onClick={() => speechService.speakText(ocrTranslatedText, getLanguageByCode(ocrTargetLang).voice)}
                    disabled={!ocrTranslatedText}
                  >
                    <Volume2 size={18} />
                  </button>
                </div>
                <div style={{ flex: 1, whiteSpace: 'pre-wrap', overflowY: 'auto', fontSize: '1.05rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
                  {ocrTranslatedText || 'La traduzione del testo estratto comparirà qui.'}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

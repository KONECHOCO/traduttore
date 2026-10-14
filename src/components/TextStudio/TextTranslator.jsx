import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeftRight,
  Mic,
  Volume2,
  Copy,
  Check,
  Trash2,
  Star,
  BookOpen,
  Loader2,
  Share2,
  AlertCircle,
  Download
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { getLanguageByCode, languageName } from '../../data/languages';
import { translateText, translationErrorMessage, detectLanguage, isNative } from '../../services/translatorService';
import { speechService } from '../../services/speechService';
import { fmt } from '../../data/translations_i18n';
import LanguageSelect from '../LanguageSelect';
import WordInsight from './WordInsight';
import GlossaryModal from './GlossaryModal';

// Divide il testo in parole toccabili: Intl.Segmenter riconosce le parole anche in cinese,
// giapponese e thai (lingue senza spazi); in mancanza si divide sugli spazi.
function segmentWords(text, lang) {
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    try {
      return [...new Intl.Segmenter(lang, { granularity: 'word' }).segment(text)].map(s => ({ text: s.segment, isWord: !!s.isWordLike }));
    } catch {
      // lingua non supportata dal segmentatore
    }
  }
  return text.split(/(\s+)/).filter(Boolean).map(part => ({ text: part, isWord: !/^\s+$/.test(part) }));
}

export default function TextTranslator({
  sourceLang,
  setSourceLang,
  targetLang,
  setTargetLang,
  sourceText,
  setSourceText,
  translatedText,
  setTranslatedText,
  t,
  uiLang,
  soundEnabled,
  onSaveToFlashcards,
  onAddToHistory,
  glossary,
  setGlossary
}) {
  const [isTranslating, setIsTranslating] = useState(false);
  const [downloading, setDownloading] = useState(null);
  const [error, setError] = useState(null);
  const [detectedLang, setDetectedLang] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [interim, setInterim] = useState('');
  const [copied, setCopied] = useState(false);
  const [savedCard, setSavedCard] = useState(false);
  const [selectedWord, setSelectedWord] = useState('');
  const [speechRate, setSpeechRate] = useState(1.0);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);

  const requestRef = useRef(0);
  const effectiveSource = sourceLang === 'auto' ? detectedLang : sourceLang;

  // Traduzione automatica mentre si scrive (con attesa di 500 ms)
  useEffect(() => {
    if (!sourceText.trim()) {
      setTranslatedText('');
      setError(null);
      setDetectedLang(null);
      return undefined;
    }
    const request = ++requestRef.current;
    const timer = setTimeout(async () => {
      setIsTranslating(true);
      setError(null);
      try {
        const result = await translateText({
          text: sourceText,
          sourceLang,
          targetLang,
          glossary,
          onStatus: (status, langs) => {
            if (request === requestRef.current) setDownloading(status === 'downloading' ? langs : null);
          }
        });
        if (request !== requestRef.current) return;
        setTranslatedText(result.translatedText);
        setDetectedLang(result.detectedLang);
        setSelectedWord('');
      } catch (err) {
        if (request !== requestRef.current) return;
        console.warn('Translation error:', err);
        setError(translationErrorMessage(err, t));
        setTranslatedText('');
      } finally {
        if (request === requestRef.current) {
          setIsTranslating(false);
          setDownloading(null);
        }
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [sourceText, sourceLang, targetLang, glossary]); // eslint-disable-line react-hooks/exhaustive-deps

  // In cronologia solo quando l'utente ha smesso di scrivere da qualche secondo
  useEffect(() => {
    if (!translatedText || isTranslating || !effectiveSource) return undefined;
    const timer = setTimeout(() => {
      onAddToHistory({
        sourceText: sourceText.trim(),
        translatedText,
        sourceLang: effectiveSource,
        targetLang,
        timestamp: Date.now()
      });
    }, 2500);
    return () => clearTimeout(timer);
  }, [translatedText, isTranslating]); // eslint-disable-line react-hooks/exhaustive-deps

  const click = () => {
    if (soundEnabled) speechService.playClickSound();
  };

  const handleSwapLanguages = () => {
    click();
    const newTarget = effectiveSource || (targetLang === 'en' ? 'it' : 'en');
    setSourceLang(targetLang);
    setTargetLang(newTarget);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const toggleSpeechInput = async () => {
    if (isRecording) {
      await speechService.stopListening();
      return;
    }
    // In modalità "rileva lingua" si detta nella lingua dell'interfaccia
    const voice = getLanguageByCode(sourceLang === 'auto' ? detectedLang || uiLang : sourceLang).voice;
    const started = await speechService.startListening({
      lang: voice,
      onPartial: text => setInterim(text),
      onFinal: text => {
        setInterim('');
        setSourceText(prev => (prev.trim() ? `${prev.trim()} ${text}` : text));
      },
      onEnd: () => {
        setIsRecording(false);
        setInterim('');
      },
      onError: code => {
        setIsRecording(false);
        setError(t.errors[code === 'permission' ? 'MIC_PERMISSION' : code === 'unsupported' ? 'SPEECH_UNSUPPORTED' : 'SPEECH_FAILED']);
      }
    });
    if (started) setIsRecording(true);
  };

  const handlePlayVoice = async (text, langCode) => {
    click();
    let code = langCode;
    if (code === 'auto') code = detectedLang || (await detectLanguage(text)) || uiLang;
    speechService.speakText(text, getLanguageByCode(code).voice, speechRate);
  };

  const handleCopy = async () => {
    if (!translatedText) return;
    click();
    try {
      await navigator.clipboard.writeText(translatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // appunti non disponibili
    }
  };

  const handleShare = async () => {
    click();
    try {
      await Share.share({ text: translatedText });
    } catch {
      // condivisione annullata
    }
  };

  const handleSaveFlashcard = () => {
    if (!sourceText.trim() || !translatedText || !effectiveSource) return;
    click();
    onSaveToFlashcards({
      word: sourceText.trim().slice(0, 120),
      translation: translatedText.slice(0, 160),
      sourceLang: effectiveSource,
      targetLang
    });
    setSavedCard(true);
    setTimeout(() => setSavedCard(false), 2200);
  };

  const wordCount = sourceText.trim() ? sourceText.trim().split(/\s+/).length : 0;
  const words = translatedText ? segmentWords(translatedText, targetLang) : [];

  return (
    <div className="text-studio-wrapper">
      <div className="tone-selector-bar">
        {isNative && <span className="studio-hint">{t.textStudio.offlineHint}</span>}
        <button
          className="btn-secondary btn-small"
          style={{ marginInlineStart: 'auto' }}
          onClick={() => {
            click();
            setIsGlossaryOpen(true);
          }}
        >
          <BookOpen size={14} />
          {t.textStudio.glossaryBtn} ({glossary.length})
        </button>
      </div>

      <div className="translation-grid">
        <div className="translator-box">
          <div className="box-header">
            <LanguageSelect
              value={sourceLang}
              onChange={setSourceLang}
              uiLang={uiLang}
              autoLabel={t.textStudio.detectLanguage}
              id="source-lang-select"
              ariaLabel={t.textStudio.sourceLang}
              style={{ fontSize: '0.95rem', fontWeight: 600, maxWidth: '62%' }}
            />
            {sourceLang === 'auto' && detectedLang && (
              <span className="detected-chip">{fmt(t.textStudio.detected, { lang: languageName(detectedLang, uiLang) })}</span>
            )}
            <button className="icon-btn" onClick={() => setSourceText('')} title={t.textStudio.clear} aria-label={t.textStudio.clear} disabled={!sourceText}>
              <Trash2 size={16} />
            </button>
          </div>

          <textarea
            className="text-area-input"
            placeholder={t.textStudio.sourcePlaceholder}
            value={interim ? `${sourceText}${sourceText ? ' ' : ''}${interim}` : sourceText}
            onChange={e => setSourceText(e.target.value)}
            rows={7}
            id="source-text-input"
            dir="auto"
          />

          <div className="box-footer">
            <div className="tool-buttons">
              <button
                className={`icon-btn ${isRecording ? 'recording' : ''}`}
                onClick={toggleSpeechInput}
                title={t.textStudio.speechInput}
                aria-label={t.textStudio.speechInput}
                id="btn-voice-dictation"
              >
                <Mic size={18} />
              </button>
              <button
                className="icon-btn"
                onClick={() => handlePlayVoice(sourceText, sourceLang)}
                title={t.textStudio.listenVoice}
                aria-label={t.textStudio.listenVoice}
                disabled={!sourceText}
                id="btn-play-source-voice"
              >
                <Volume2 size={18} />
              </button>
            </div>
            <div className="text-stats">
              {sourceText.length} {t.textStudio.chars} • {wordCount} {t.textStudio.words}
            </div>
          </div>
        </div>

        <div className="translator-box">
          <div className="box-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
              <button className="swap-languages-btn" onClick={handleSwapLanguages} title={t.textStudio.swap} aria-label={t.textStudio.swap} id="btn-swap-languages">
                <ArrowLeftRight size={16} />
              </button>
              <LanguageSelect
                value={targetLang}
                onChange={setTargetLang}
                uiLang={uiLang}
                id="target-lang-select"
                ariaLabel={t.textStudio.targetLang}
                style={{ fontSize: '0.95rem', fontWeight: 600, minWidth: 0 }}
              />
            </div>
            {isTranslating && (
              <span className="status-inline">
                <Loader2 size={14} className="spin-icon" />
                {downloading ? t.textStudio.downloadingModel : t.textStudio.translating}
              </span>
            )}
          </div>

          <div className="text-area-input translation-output" dir="auto" aria-live="polite">
            {error ? (
              <span className="error-text">
                <AlertCircle size={16} /> {error}
              </span>
            ) : downloading ? (
              <span className="muted-text">
                <Download size={16} /> {fmt(t.textStudio.downloadingModelLong, { langs: downloading.map(l => languageName(l, uiLang, true)).join(', ') })}
              </span>
            ) : translatedText ? (
              words.map(({ text: word, isWord }, idx) =>
                !isWord ? (
                  word
                ) : (
                  <span
                    key={idx}
                    className={`translated-word ${selectedWord === word ? 'selected' : ''}`}
                    onClick={() => {
                      click();
                      setSelectedWord(word);
                    }}
                  >
                    {word}
                  </span>
                )
              )
            ) : (
              <span className="muted-text">{t.textStudio.targetPlaceholder}</span>
            )}
          </div>

          <div className="box-footer">
            <div className="tool-buttons">
              <button
                className="icon-btn"
                onClick={() => handlePlayVoice(translatedText, targetLang)}
                title={t.textStudio.listenVoice}
                aria-label={t.textStudio.listenVoice}
                disabled={!translatedText}
                id="btn-play-target-voice"
              >
                <Volume2 size={18} />
              </button>
              <button
                className="icon-btn"
                onClick={() => setSpeechRate(r => (r === 1.0 ? 0.75 : r === 0.75 ? 1.25 : 1.0))}
                title={t.textStudio.voiceSpeed}
                aria-label={t.textStudio.voiceSpeed}
                style={{ fontSize: '0.75rem', fontWeight: 700 }}
              >
                {speechRate}x
              </button>
              <button className="icon-btn" onClick={handleCopy} title={t.textStudio.copy} aria-label={t.textStudio.copy} disabled={!translatedText} id="btn-copy-target">
                {copied ? <Check size={18} style={{ color: 'var(--success)' }} /> : <Copy size={18} />}
              </button>
              {Capacitor.isNativePlatform() && (
                <button className="icon-btn" onClick={handleShare} title={t.common.share} aria-label={t.common.share} disabled={!translatedText}>
                  <Share2 size={18} />
                </button>
              )}
              <button
                className="icon-btn"
                onClick={handleSaveFlashcard}
                title={t.textStudio.saveFlashcard}
                aria-label={t.textStudio.saveFlashcard}
                disabled={!translatedText || !effectiveSource}
                id="btn-save-flashcard"
              >
                <Star size={18} style={{ color: savedCard ? '#facc15' : 'inherit', fill: savedCard ? '#facc15' : 'none' }} />
              </button>
            </div>
            {savedCard && <span className="saved-note">★ {t.textStudio.savedFlashcard}</span>}
          </div>
        </div>
      </div>

      <WordInsight
        selectedWord={selectedWord}
        sourceText={sourceText}
        translatedText={translatedText}
        sourceLang={effectiveSource}
        targetLang={targetLang}
        t={t}
        uiLang={uiLang}
        onSaveToFlashcards={onSaveToFlashcards}
      />

      <GlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
        glossary={glossary}
        setGlossary={setGlossary}
        t={t}
      />
    </div>
  );
}

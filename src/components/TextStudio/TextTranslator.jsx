import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeftRight, 
  Mic, 
  Volume2, 
  Copy, 
  Check, 
  Trash2, 
  Star, 
  Sparkles, 
  BookOpen, 
  Briefcase, 
  Smile, 
  GraduationCap, 
  Feather,
  Loader2
} from 'lucide-react';
import { LANGUAGES, TONES, getLanguageByCode } from '../../data/languages';
import { translateText } from '../../services/translatorService';
import { speechService } from '../../services/speechService';
import NuanceInspector from './NuanceInspector';
import GlossaryModal from './GlossaryModal';

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
  soundEnabled,
  onSaveToFlashcards,
  onAddToHistory,
  engine,
  apiKey,
  glossary,
  setGlossary
}) {
  const [tone, setTone] = useState('standard');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedCard, setSavedCard] = useState(false);
  const [selectedWord, setSelectedWord] = useState('');
  const [nuances, setNuances] = useState([]);
  const [falseFriends, setFalseFriends] = useState([]);
  const [alternatives, setAlternatives] = useState([]);
  const [phonetic, setPhonetic] = useState('');
  const [speechRate, setSpeechRate] = useState(1.0);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);

  const debounceTimerRef = useRef(null);

  // Trigger translation when text, language or tone changes
  useEffect(() => {
    if (!sourceText.trim()) {
      setTranslatedText('');
      setNuances([]);
      setFalseFriends([]);
      setAlternatives([]);
      setPhonetic('');
      return;
    }

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(async () => {
      setIsTranslating(true);
      try {
        const result = await translateText({
          text: sourceText,
          sourceLang,
          targetLang,
          tone,
          glossary,
          apiKey,
          engine
        });

        setTranslatedText(result.translatedText);
        setNuances(result.nuances || []);
        setFalseFriends(result.falseFriends || []);
        setAlternatives(result.alternatives || []);
        setPhonetic(result.phonetic || '');

        if (soundEnabled && result.translatedText) {
          speechService.playSuccessChime();
        }

        // Add to recent history
        if (onAddToHistory && result.translatedText) {
          onAddToHistory({
            sourceText,
            translatedText: result.translatedText,
            sourceLang,
            targetLang,
            tone,
            timestamp: new Date().toLocaleTimeString()
          });
        }
      } catch (err) {
        console.error('Translation error:', err);
      } finally {
        setIsTranslating(false);
      }
    }, 400);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [sourceText, sourceLang, targetLang, tone, glossary, engine]);

  // Swap source and target languages
  const handleSwapLanguages = () => {
    if (soundEnabled) speechService.playClickSound();
    const tempLang = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(tempLang);

    const tempText = sourceText;
    setSourceText(translatedText);
    setTranslatedText(tempText);
  };

  // Voice Dictation (Speech to Text)
  const toggleSpeechInput = () => {
    if (isRecording) {
      speechService.stopSpeechRecognition();
      setIsRecording(false);
    } else {
      const srcObj = getLanguageByCode(sourceLang);
      const recognition = speechService.startSpeechRecognition({
        lang: srcObj.speechCode || 'it-IT',
        continuous: false,
        onResult: ({ finalTranscript, interimTranscript }) => {
          const spoken = finalTranscript || interimTranscript;
          if (spoken) {
            setSourceText(prev => (prev ? prev + ' ' + spoken : spoken));
          }
        },
        onError: (err) => {
          console.warn('Speech error:', err);
          setIsRecording(false);
        },
        onEnd: () => {
          setIsRecording(false);
        }
      });
      if (recognition) setIsRecording(true);
    }
  };

  // Voice Output (Text to Speech)
  const handlePlayVoice = (textToSpeak, langCode) => {
    if (soundEnabled) speechService.playClickSound();
    const langObj = getLanguageByCode(langCode);
    speechService.speakText(textToSpeak, langObj.voice, speechRate);
  };

  // Copy to clipboard
  const handleCopy = () => {
    if (!translatedText) return;
    if (soundEnabled) speechService.playClickSound();
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Save to flashcard deck
  const handleSaveFlashcard = () => {
    if (!sourceText || !translatedText) return;
    if (soundEnabled) speechService.playClickSound();
    if (onSaveToFlashcards) {
      onSaveToFlashcards({
        word: sourceText.slice(0, 50),
        translation: translatedText.slice(0, 70),
        sourceLang,
        targetLang,
        ipa: phonetic || '',
        category: `Studio (${tone.toUpperCase()})`,
        notes: `Tradotto con tono ${tone}`
      });
      setSavedCard(true);
      setTimeout(() => setSavedCard(false), 2200);
    }
  };

  // Replace a word when clicking a synonym
  const handleReplaceWord = (oldWord, newWord) => {
    if (soundEnabled) speechService.playClickSound();
    const regex = new RegExp(`\\b${oldWord}\\b`, 'i');
    setTranslatedText(prev => prev.replace(regex, newWord));
  };

  // Text Stats
  const charCount = sourceText.length;
  const wordCount = sourceText.trim() ? sourceText.trim().split(/\s+/).length : 0;
  const readingTimeSec = Math.ceil(wordCount / 3.5); // ~200 wpm

  return (
    <div className="text-studio-wrapper">
      {/* Tone & Style Selector Bar */}
      <div className="tone-selector-bar">
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', marginRight: '0.5rem' }}>
          {t.textStudio.tone}:
        </span>
        {TONES.map(item => {
          const IconComp = item.id === 'formal' ? Briefcase : item.id === 'informal' ? Smile : item.id === 'academic' ? GraduationCap : item.id === 'creative' ? Feather : Sparkles;
          return (
            <button
              key={item.id}
              className={`tone-pill ${tone === item.id ? 'active' : ''}`}
              onClick={() => {
                if (soundEnabled) speechService.playClickSound();
                setTone(item.id);
              }}
              title={item.desc}
            >
              <IconComp size={14} />
              <span>{item.label}</span>
            </button>
          );
        })}

        <div style={{ marginLeft: 'auto' }}>
          <button 
            className="btn-secondary" 
            style={{ padding: '0.35rem 0.8rem', fontSize: '0.8rem' }}
            onClick={() => {
              if (soundEnabled) speechService.playClickSound();
              setIsGlossaryOpen(true);
            }}
          >
            <BookOpen size={14} />
            {t.textStudio.glossaryBtn} ({glossary.length})
          </button>
        </div>
      </div>

      {/* Main Dual Translation Grid */}
      <div className="translation-grid">
        {/* Source Text Box */}
        <div className="translator-box">
          <div className="box-header">
            <select 
              className="lang-selector-select" 
              value={sourceLang} 
              onChange={e => setSourceLang(e.target.value)}
              style={{ fontSize: '0.95rem', fontWeight: 600 }}
              id="source-lang-select"
            >
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.name} ({l.native})
                </option>
              ))}
            </select>

            <button 
              className="icon-btn" 
              onClick={() => setSourceText('')}
              title={t.textStudio.clear}
              disabled={!sourceText}
            >
              <Trash2 size={16} />
            </button>
          </div>

          <textarea
            className="text-area-input"
            placeholder={t.textStudio.sourcePlaceholder}
            value={sourceText}
            onChange={e => setSourceText(e.target.value)}
            rows={8}
            id="source-text-input"
          />

          <div className="box-footer">
            <div className="tool-buttons">
              <button 
                className={`icon-btn ${isRecording ? 'recording' : ''}`}
                onClick={toggleSpeechInput}
                title={t.textStudio.speechInput}
                id="btn-voice-dictation"
              >
                <Mic size={18} />
              </button>

              <button 
                className="icon-btn" 
                onClick={() => handlePlayVoice(sourceText, sourceLang)}
                title={t.textStudio.listenVoice}
                disabled={!sourceText}
                id="btn-play-source-voice"
              >
                <Volume2 size={18} />
              </button>
            </div>

            <div className="text-stats">
              {charCount} {t.textStudio.chars} • {wordCount} {t.textStudio.words} • ~{readingTimeSec}s {t.textStudio.readingTime}
            </div>
          </div>
        </div>

        {/* Target Translation Box */}
        <div className="translator-box">
          <div className="box-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <button 
                className="swap-languages-btn" 
                onClick={handleSwapLanguages} 
                title={t.textStudio.swap}
                id="btn-swap-languages"
              >
                <ArrowLeftRight size={16} />
              </button>

              <select 
                className="lang-selector-select" 
                value={targetLang} 
                onChange={e => setTargetLang(e.target.value)}
                style={{ fontSize: '0.95rem', fontWeight: 600 }}
                id="target-lang-select"
              >
                {LANGUAGES.map(l => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.name} ({l.native})
                  </option>
                ))}
              </select>
            </div>

            {isTranslating && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#818cf8', fontSize: '0.8rem' }}>
                <Loader2 size={14} className="spin-icon" style={{ animation: 'spin 1s linear infinite' }} />
                {t.textStudio.translating}
              </span>
            )}
          </div>

          <div className="text-area-input" style={{ overflowY: 'auto' }}>
            {translatedText ? (
              translatedText.split(' ').map((word, idx) => (
                <span 
                  key={idx} 
                  className="translated-word"
                  onClick={() => {
                    if (soundEnabled) speechService.playClickSound();
                    setSelectedWord(word.replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, ''));
                  }}
                >
                  {word}{' '}
                </span>
              ))
            ) : (
              <span style={{ color: 'var(--text-dim)' }}>
                {t.textStudio.targetPlaceholder}
              </span>
            )}
          </div>

          <div className="box-footer">
            <div className="tool-buttons">
              <button 
                className="icon-btn" 
                onClick={() => handlePlayVoice(translatedText, targetLang)}
                title={t.textStudio.listenVoice}
                disabled={!translatedText}
                id="btn-play-target-voice"
              >
                <Volume2 size={18} />
              </button>

              {/* Speech rate toggle */}
              <button
                className="icon-btn"
                onClick={() => setSpeechRate(r => r === 1.0 ? 0.8 : r === 0.8 ? 1.2 : 1.0)}
                title="Velocità voce (0.8x, 1.0x, 1.2x)"
                style={{ fontSize: '0.75rem', fontWeight: 700 }}
              >
                {speechRate}x
              </button>

              <button 
                className="icon-btn" 
                onClick={handleCopy}
                title={t.textStudio.copy}
                disabled={!translatedText}
                id="btn-copy-target"
              >
                {copied ? <Check size={18} style={{ color: '#10b981' }} /> : <Copy size={18} />}
              </button>

              <button 
                className="icon-btn" 
                onClick={handleSaveFlashcard}
                title={t.textStudio.saveFlashcard}
                disabled={!translatedText}
                id="btn-save-flashcard"
              >
                <Star size={18} style={{ color: savedCard ? '#facc15' : 'inherit', fill: savedCard ? '#facc15' : 'none' }} />
              </button>
            </div>

            {savedCard && (
              <span style={{ fontSize: '0.8rem', color: '#facc15', fontWeight: 600 }}>
                ★ {t.textStudio.savedFlashcard}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Deep Linguistic Nuance & Synonym Inspector */}
      <NuanceInspector 
        selectedWord={selectedWord}
        setSelectedWord={setSelectedWord}
        nuances={nuances}
        falseFriends={falseFriends}
        alternatives={alternatives}
        phonetic={phonetic}
        onReplaceWord={handleReplaceWord}
        t={t}
      />

      {/* Custom Glossary Terminology Modal */}
      <GlossaryModal 
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
        glossary={glossary}
        setGlossary={setGlossary}
        soundEnabled={soundEnabled}
      />
    </div>
  );
}

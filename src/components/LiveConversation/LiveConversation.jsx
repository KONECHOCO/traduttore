import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  RotateCw, 
  Volume2, 
  Download, 
  Trash2, 
  Radio, 
  Users, 
  Presentation,
  Play,
  Square,
  Sparkles
} from 'lucide-react';
import { LANGUAGES, getLanguageByCode } from '../../data/languages';
import { translateText } from '../../services/translatorService';
import { speechService } from '../../services/speechService';

export default function LiveConversation({ t, soundEnabled, engine, apiKey, glossary }) {
  const [liveMode, setLiveMode] = useState('split'); // 'split' (Face-to-face) or 'conference'
  
  // Person A & Person B settings
  const [langA, setLangA] = useState('it');
  const [langB, setLangB] = useState('en');
  const [speechA, setSpeechA] = useState('');
  const [transA, setTransA] = useState('');
  const [speechB, setSpeechB] = useState('');
  const [transB, setTransB] = useState('');
  
  const [isListeningA, setIsListeningA] = useState(false);
  const [isListeningB, setIsListeningB] = useState(false);
  const [flippedB, setFlippedB] = useState(true); // Flip 180 deg for table view

  // Conference Mode states
  const [isConferenceActive, setIsConferenceActive] = useState(false);
  const [confLangSource, setConfLangSource] = useState('it');
  const [confLangTarget, setConfLangTarget] = useState('en');
  const [currentConfSubtitle, setCurrentConfSubtitle] = useState('');
  const [currentConfOriginal, setCurrentConfOriginal] = useState('');
  const [conferenceTranscript, setConferenceTranscript] = useState([
    {
      id: 1,
      time: '10:00:15',
      speaker: 'Relatore / Speaker',
      original: 'Benvenuti alla conferenza internazionale sulle nuove tecnologie.',
      translated: 'Welcome to the international conference on emerging technologies.'
    }
  ]);

  const recognitionRef = useRef(null);

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      speechService.stopSpeechRecognition();
    };
  }, []);

  // Handle Speaker A Voice Dictation
  const toggleSpeakerA = () => {
    if (isListeningA) {
      speechService.stopSpeechRecognition();
      setIsListeningA(false);
    } else {
      if (isListeningB) speechService.stopSpeechRecognition();
      setIsListeningB(false);

      const srcObj = getLanguageByCode(langA);
      const rec = speechService.startSpeechRecognition({
        lang: srcObj.speechCode || 'it-IT',
        continuous: false,
        onResult: async ({ finalTranscript, interimTranscript }) => {
          const spoken = finalTranscript || interimTranscript;
          if (spoken) {
            setSpeechA(spoken);
            if (finalTranscript) {
              const res = await translateText({ text: spoken, sourceLang: langA, targetLang: langB, glossary, engine });
              setTransA(res.translatedText);
              // Auto-speak translation for Person B
              const tgtObj = getLanguageByCode(langB);
              speechService.speakText(res.translatedText, tgtObj.voice);
            }
          }
        },
        onError: () => setIsListeningA(false),
        onEnd: () => setIsListeningA(false)
      });
      if (rec) setIsListeningA(true);
    }
  };

  // Handle Speaker B Voice Dictation
  const toggleSpeakerB = () => {
    if (isListeningB) {
      speechService.stopSpeechRecognition();
      setIsListeningB(false);
    } else {
      if (isListeningA) speechService.stopSpeechRecognition();
      setIsListeningA(false);

      const srcObj = getLanguageByCode(langB);
      const rec = speechService.startSpeechRecognition({
        lang: srcObj.speechCode || 'en-US',
        continuous: false,
        onResult: async ({ finalTranscript, interimTranscript }) => {
          const spoken = finalTranscript || interimTranscript;
          if (spoken) {
            setSpeechB(spoken);
            if (finalTranscript) {
              const res = await translateText({ text: spoken, sourceLang: langB, targetLang: langA, glossary, engine });
              setTransB(res.translatedText);
              // Auto-speak translation for Person A
              const tgtObj = getLanguageByCode(langA);
              speechService.speakText(res.translatedText, tgtObj.voice);
            }
          }
        },
        onError: () => setIsListeningB(false),
        onEnd: () => setIsListeningB(false)
      });
      if (rec) setIsListeningB(true);
    }
  };

  // Continuous Conference Mode Handler
  const toggleConferenceMode = () => {
    if (isConferenceActive) {
      speechService.stopSpeechRecognition();
      setIsConferenceActive(false);
    } else {
      const srcObj = getLanguageByCode(confLangSource);
      const rec = speechService.startSpeechRecognition({
        lang: srcObj.speechCode || 'it-IT',
        continuous: true,
        onResult: async ({ finalTranscript, interimTranscript }) => {
          const text = finalTranscript || interimTranscript;
          if (text) {
            setCurrentConfOriginal(text);
            const res = await translateText({ text, sourceLang: confLangSource, targetLang: confLangTarget, glossary, engine });
            setCurrentConfSubtitle(res.translatedText);

            if (finalTranscript) {
              const newItem = {
                id: Date.now(),
                time: new Date().toLocaleTimeString(),
                speaker: 'Relatore / Presenter',
                original: finalTranscript,
                translated: res.translatedText
              };
              setConferenceTranscript(prev => [newItem, ...prev]);
            }
          }
        },
        onError: (err) => {
          console.warn('Conference recognition error:', err);
          setIsConferenceActive(false);
        },
        onEnd: () => {
          // If meant to be continuous and user didn't stop it, re-start
          if (isConferenceActive) {
            // small recovery
          }
        }
      });
      if (rec) setIsConferenceActive(true);
    }
  };

  // Export Transcript as .TXT
  const exportTranscriptTXT = () => {
    if (soundEnabled) speechService.playClickSound();
    const content = conferenceTranscript
      .map(item => `[${item.time}] ${item.speaker}:\nORIGINALE: ${item.original}\nTRADUZIONE: ${item.translated}\n`)
      .join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trascrizione-conferenza-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
  };

  // Export Subtitles as .SRT
  const exportSubtitlesSRT = () => {
    if (soundEnabled) speechService.playClickSound();
    let srt = '';
    conferenceTranscript.forEach((item, idx) => {
      srt += `${idx + 1}\n00:00:${idx * 3 < 10 ? '0' : ''}${idx * 3},000 --> 00:00:${idx * 3 + 3 < 10 ? '0' : ''}${idx * 3 + 3},000\n${item.translated}\n\n`;
    });

    const blob = new Blob([srt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sottotitoli-conferenza-${new Date().toISOString().slice(0, 10)}.srt`;
    a.click();
  };

  return (
    <div className="live-conversation-container">
      {/* Mode Selector & Action Header */}
      <div className="live-header-bar">
        <div className="mode-toggle-pill">
          <button 
            className={`mode-toggle-btn ${liveMode === 'split' ? 'active' : ''}`}
            onClick={() => {
              if (soundEnabled) speechService.playClickSound();
              setLiveMode('split');
            }}
            id="btn-mode-split"
          >
            <Users size={16} />
            {t.liveConv.modeSplit}
          </button>

          <button 
            className={`mode-toggle-btn ${liveMode === 'conference' ? 'active' : ''}`}
            onClick={() => {
              if (soundEnabled) speechService.playClickSound();
              setLiveMode('conference');
            }}
            id="btn-mode-conference"
          >
            <Presentation size={16} />
            {t.liveConv.modeConf}
          </button>
        </div>

        {liveMode === 'split' ? (
          <button 
            className="btn-secondary"
            onClick={() => {
              if (soundEnabled) speechService.playClickSound();
              setFlippedB(!flippedB);
            }}
            title={t.liveConv.flipScreen}
          >
            <RotateCw size={16} />
            {t.liveConv.flipScreen}
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button className="btn-secondary" onClick={exportSubtitlesSRT} title="Scarica sottotitoli SRT">
              <Download size={15} />
              {t.liveConv.exportSubtitles}
            </button>
            <button className="btn-secondary" onClick={exportTranscriptTXT} title="Scarica testo trascrizione">
              <Download size={15} />
              {t.liveConv.exportText}
            </button>
          </div>
        )}
      </div>

      {/* SUB-MODE 1: FACE TO FACE SPLIT SCREEN */}
      {liveMode === 'split' && (
        <div className="split-face-container">
          {/* SPEAKER B (Interlocutore, can be flipped 180° for table view) */}
          <div className={`speaker-card ${flippedB ? 'flipped' : ''}`}>
            <div className="speaker-header">
              <div className="speaker-badge">
                <span style={{ color: '#06b6d4' }}>● {t.liveConv.personB}</span>
                <select 
                  className="lang-selector-select" 
                  value={langB} 
                  onChange={e => setLangB(e.target.value)}
                >
                  {LANGUAGES.map(l => (
                    <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button 
                  className="icon-btn" 
                  onClick={() => speechService.speakText(transB || speechB, getLanguageByCode(langB).voice)}
                  disabled={!speechB && !transB}
                >
                  <Volume2 size={18} />
                </button>
              </div>
            </div>

            <div className="speaker-speech-bubble">
              {transA ? (
                <div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-dim)', marginBottom: '0.2rem' }}>
                    Tradotto da {getLanguageByCode(langA).name}:
                  </div>
                  <span style={{ color: '#38bdf8', fontWeight: 600 }}>{transA}</span>
                </div>
              ) : speechB ? (
                <span>"{speechB}"</span>
              ) : (
                <span style={{ color: 'var(--text-dim)', fontSize: '1rem' }}>
                  In attesa che l'interlocutore parli...
                </span>
              )}
            </div>

            <button 
              className={`mic-action-btn ${isListeningB ? 'active' : ''}`}
              onClick={toggleSpeakerB}
              title={isListeningB ? t.liveConv.stopListening : t.liveConv.pressToSpeak}
              id="mic-speaker-b"
            >
              <Mic size={26} />
            </button>
          </div>

          {/* SPEAKER A (Utente Principale) */}
          <div className="speaker-card">
            <div className="speaker-header">
              <div className="speaker-badge">
                <span style={{ color: '#6366f1' }}>● {t.liveConv.personA}</span>
                <select 
                  className="lang-selector-select" 
                  value={langA} 
                  onChange={e => setLangA(e.target.value)}
                >
                  {LANGUAGES.map(l => (
                    <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button 
                  className="icon-btn" 
                  onClick={() => speechService.speakText(transA || speechA, getLanguageByCode(langA).voice)}
                  disabled={!speechA && !transA}
                >
                  <Volume2 size={18} />
                </button>
              </div>
            </div>

            <div className="speaker-speech-bubble">
              {transB ? (
                <div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-dim)', marginBottom: '0.2rem' }}>
                    Tradotto da {getLanguageByCode(langB).name}:
                  </div>
                  <span style={{ color: '#818cf8', fontWeight: 600 }}>{transB}</span>
                </div>
              ) : speechA ? (
                <span>"{speechA}"</span>
              ) : (
                <span style={{ color: 'var(--text-dim)', fontSize: '1rem' }}>
                  Tocca il microfono e parla in {getLanguageByCode(langA).name}...
                </span>
              )}
            </div>

            <button 
              className={`mic-action-btn ${isListeningA ? 'active' : ''}`}
              onClick={toggleSpeakerA}
              title={isListeningA ? t.liveConv.stopListening : t.liveConv.pressToSpeak}
              id="mic-speaker-a"
            >
              <Mic size={26} />
            </button>
          </div>
        </div>
      )}

      {/* SUB-MODE 2: LIVE CONFERENCE & TELEPROMPTER SUBTITLES */}
      {liveMode === 'conference' && (
        <div>
          {/* Conference Controls Bar */}
          <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block' }}>Lingua Relatore:</span>
                <select 
                  className="lang-selector-select" 
                  value={confLangSource} 
                  onChange={e => setConfLangSource(e.target.value)}
                >
                  {LANGUAGES.map(l => (
                    <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block' }}>Lingua Sottotitoli:</span>
                <select 
                  className="lang-selector-select" 
                  value={confLangTarget} 
                  onChange={e => setConfLangTarget(e.target.value)}
                >
                  {LANGUAGES.map(l => (
                    <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button 
                className={`btn-primary ${isConferenceActive ? 'recording' : ''}`}
                style={{ background: isConferenceActive ? '#ef4444' : 'var(--accent-gradient)' }}
                onClick={toggleConferenceMode}
                id="btn-toggle-conference"
              >
                {isConferenceActive ? <Square size={18} /> : <Play size={18} />}
                {isConferenceActive ? t.liveConv.stopListening : t.liveConv.startListening}
              </button>

              <button 
                className="icon-btn" 
                onClick={() => setConferenceTranscript([])} 
                title={t.liveConv.clearHistory}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          {/* Big Teleprompter Screen */}
          <div className="conference-teleprompter">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: isConferenceActive ? '#10b981' : '#64748b', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
              <Radio size={16} className={isConferenceActive ? 'pulse' : ''} />
              <span>{isConferenceActive ? 'LIVE BROADCASTING SOTTOTITOLI ATTIVI' : 'IN PAUSA — PREMI AVVIA ASCOLTO'}</span>
            </div>

            <div className="teleprompter-text">
              {currentConfSubtitle || '« I sottotitoli tradotti in diretta appariranno qui a caratteri giganti »'}
            </div>

            {currentConfOriginal && (
              <div className="teleprompter-original">
                Originale: "{currentConfOriginal}"
              </div>
            )}
          </div>

          {/* Rolling Transcript Log */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Presentation size={18} style={{ color: 'var(--primary)' }} />
              Verbale Completo & Trascrizione Cronologica ({conferenceTranscript.length})
            </h4>

            <div className="rolling-transcript">
              {conferenceTranscript.map(item => (
                <div key={item.id} className="transcript-line">
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{item.time}</span>
                      <strong style={{ fontSize: '0.85rem', color: '#818cf8' }}>{item.speaker}</strong>
                    </div>
                    <div style={{ fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 500 }}>
                      {item.translated}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {item.original}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

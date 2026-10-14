import React, { useEffect, useState } from 'react';
import { Search, AlertTriangle, Volume2, Star, Loader2, Info } from 'lucide-react';
import { translateText, translationErrorMessage } from '../../services/translatorService';
import { speechService } from '../../services/speechService';
import { getLanguageByCode, languageName } from '../../data/languages';
import { FALSE_FRIENDS } from '../../data/learningData';
import { fmt } from '../../data/translations_i18n';

const stripPunctuation = w => (w || '').replace(/^[\p{P}\p{S}]+|[\p{P}\p{S}]+$/gu, '');

/** Falsi amici inglese ↔ italiano presenti (come parola intera) nel testo inglese della coppia. */
export function findFalseFriends(sourceText, translatedText, sourceLang, targetLang) {
  const pair = [sourceLang, targetLang].sort().join('-');
  if (pair !== 'en-it') return [];
  const englishText = sourceLang === 'en' ? sourceText : translatedText;
  return FALSE_FRIENDS.filter(ff => new RegExp(`\\b${ff.word}\\b`, 'i').test(englishText));
}

export default function WordInsight({ selectedWord, sourceText, translatedText, sourceLang, targetLang, t, uiLang, onSaveToFlashcards }) {
  const word = stripPunctuation(selectedWord);
  const [lookup, setLookup] = useState({ word: '', meaning: '', loading: false, error: null });
  const [saved, setSaved] = useState(false);

  // Significato della parola selezionata: la si traduce da sola verso la lingua di partenza
  useEffect(() => {
    if (!word || !sourceLang) return undefined;
    let cancelled = false;
    setSaved(false);
    setLookup({ word, meaning: '', loading: true, error: null });
    translateText({ text: word, sourceLang: targetLang, targetLang: sourceLang })
      .then(res => !cancelled && setLookup({ word, meaning: res.translatedText, loading: false, error: null }))
      .catch(err => !cancelled && setLookup({ word, meaning: '', loading: false, error: translationErrorMessage(err, t) }));
    return () => {
      cancelled = true;
    };
  }, [word, sourceLang, targetLang]); // eslint-disable-line react-hooks/exhaustive-deps

  const falseFriends = uiLang === 'it' ? findFalseFriends(sourceText, translatedText, sourceLang, targetLang) : [];

  if (!translatedText) return null;

  return (
    <div className="nuances-section">
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div className="panel-title">
          <Search size={18} style={{ color: 'var(--primary)' }} />
          <h3>{t.textStudio.wordLookupTitle}</h3>
        </div>

        {!word || !sourceLang ? (
          <p className="muted-text" style={{ fontSize: '0.85rem' }}>
            <Info size={16} /> {t.textStudio.clickWordHint}
          </p>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="lookup-word" dir="auto">{word}</span>
              <button className="icon-btn" onClick={() => speechService.speakText(word, getLanguageByCode(targetLang).voice)} aria-label={t.textStudio.listenVoice}>
                <Volume2 size={16} />
              </button>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: '0.5rem 0 0.25rem' }}>
              {fmt(t.textStudio.meaningIn, { lang: languageName(sourceLang, uiLang, true) })}
            </div>
            {lookup.loading ? (
              <Loader2 size={16} className="spin-icon" />
            ) : lookup.error ? (
              <p className="error-text" style={{ fontSize: '0.85rem' }}>{lookup.error}</p>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--secondary)' }} dir="auto">{lookup.meaning}</span>
                <button
                  className="btn-secondary btn-small"
                  disabled={saved}
                  onClick={() => {
                    onSaveToFlashcards({ word, translation: lookup.meaning, sourceLang: targetLang, targetLang: sourceLang });
                    setSaved(true);
                  }}
                >
                  <Star size={14} style={{ fill: saved ? '#facc15' : 'none', color: saved ? '#facc15' : 'inherit' }} />
                  {saved ? t.textStudio.savedFlashcard : t.textStudio.saveWord}
                </button>
              </div>
            )}
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.75rem' }}>{t.textStudio.lookupNote}</p>
          </div>
        )}
      </div>

      {falseFriends.length > 0 && (
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="panel-title" style={{ color: 'var(--warning)' }}>
            <AlertTriangle size={18} />
            <h3>{t.textStudio.falseFriendAlert}</h3>
          </div>
          {falseFriends.map(ff => (
            <div key={ff.word} className="false-friend-banner">
              <div>
                <strong style={{ color: 'var(--warning)', fontSize: '0.9rem' }}>"{ff.word}"</strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                  ≠ <em>{ff.apparent}</em> → <strong>{ff.correct}</strong>
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>{ff.actualTranslation}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

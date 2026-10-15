import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Layers, Mic, BookOpen, Award, Volume2, Trash2, Star, Loader2, RotateCw, CheckCircle2, AlertCircle, ChevronRight, Flame, Target } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PHRASEBOOK, PHRASEBOOK_CATEGORIES, scheduleCard, isDue, SRS_INTERVALS_DAYS } from '../../data/learningData';
import { speechService, textSimilarity } from '../../services/speechService';
import { translateText, translationErrorMessage } from '../../services/translatorService';
import { getLanguageByCode, languageName } from '../../data/languages';
import { fmt } from '../../data/translations_i18n';
import LanguageSelect from '../LanguageSelect';
import { recordActivity, useProgress } from '../../services/progress';

function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function LearningAcademy({ flashcards, setFlashcards, t, uiLang, soundEnabled }) {
  const [learningTab, setLearningTab] = useState('cards');
  const [learnLang, setLearnLang] = useState(() => localStorage.getItem('omni_learn_lang') || (uiLang === 'en' ? 'es' : 'en'));
  useEffect(() => {
    localStorage.setItem('omni_learn_lang', learnLang);
  }, [learnLang]);

  const click = () => {
    if (soundEnabled) speechService.playClickSound();
  };

  const tabs = [
    { id: 'cards', icon: Layers, label: `${t.learning.tabCards} (${flashcards.length})` },
    { id: 'phrasebook', icon: BookOpen, label: t.learning.tabPhrasebook },
    { id: 'pronounce', icon: Mic, label: t.learning.tabPronounce },
    { id: 'quiz', icon: Award, label: t.learning.tabQuiz }
  ];

  const [practicePhrase, setPracticePhrase] = useState(null);
  const progress = useProgress();
  const goalPct = Math.min(100, Math.round((progress.today / progress.goal) * 100));

  return (
    <div className="learning-academy-container">
      <div className="streak-bar">
        <div className="streak-item">
          <Flame size={20} style={{ color: progress.streak ? '#f97316' : 'var(--text-dim)' }} />
          <div>
            <strong>{fmt(t.learning.streakDays, { n: progress.streak })}</strong>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{fmt(t.learning.bestStreak, { n: progress.best || 0 })}</div>
          </div>
        </div>
        <div className="streak-item grow">
          <Target size={20} style={{ color: goalPct >= 100 ? 'var(--success)' : 'var(--primary)' }} />
          <div style={{ flex: 1 }}>
            <strong>{fmt(t.learning.dailyGoal, { done: progress.today, goal: progress.goal })}</strong>
            <div className="ocr-progress-bar" style={{ margin: '0.3rem 0 0' }}>
              <div className="ocr-progress-fill" style={{ width: `${goalPct}%` }} />
            </div>
          </div>
        </div>
      </div>
      <div className="live-header-bar">
        <div className="nav-tabs sub-tabs">
          {tabs.map(({ id, icon: Icon, label }) => (
            <button key={id} className={`tab-btn ${learningTab === id ? 'active' : ''}`} onClick={() => { click(); setLearningTab(id); }} id={`learn-tab-${id}`}>
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </div>
        {(learningTab === 'phrasebook' || learningTab === 'pronounce') && (
          <label className="field-label inline">
            {t.learning.studyLang}
            <LanguageSelect value={learnLang} onChange={setLearnLang} uiLang={uiLang} />
          </label>
        )}
      </div>

      {learningTab === 'cards' && <FlashcardDeck flashcards={flashcards} setFlashcards={setFlashcards} t={t} uiLang={uiLang} click={click} />}
      {learningTab === 'phrasebook' && (
        <Phrasebook
          learnLang={learnLang}
          t={t}
          uiLang={uiLang}
          click={click}
          onAddCard={card => setFlashcards(prev => (prev.some(c => c.word === card.word) ? prev : [{ id: `fc-${Date.now()}`, box: 0, due: Date.now(), ...card }, ...prev]))}
          onPractice={phrase => {
            setPracticePhrase(phrase);
            setLearningTab('pronounce');
          }}
        />
      )}
      {learningTab === 'pronounce' && <PronunciationCoach learnLang={learnLang} phrase={practicePhrase} t={t} uiLang={uiLang} soundEnabled={soundEnabled} />}
      {learningTab === 'quiz' && <Quiz flashcards={flashcards} t={t} click={click} soundEnabled={soundEnabled} />}
    </div>
  );
}

// ---------- Flashcard con ripasso a intervalli ----------
function FlashcardDeck({ flashcards, setFlashcards, t, uiLang, click }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const dueCards = useMemo(() => flashcards.filter(isDue).sort((a, b) => (a.due || 0) - (b.due || 0)), [flashcards]);
  const current = dueCards[0];

  const answer = (knew) => {
    recordActivity();
    click();
    setIsFlipped(false);
    setFlashcards(prev => prev.map(c => (c.id === current.id ? scheduleCard(c, knew) : c)));
  };

  if (flashcards.length === 0) {
    return (
      <div className="glass-panel empty-panel">
        <Layers size={36} style={{ color: 'var(--primary)' }} />
        <h3>{t.learning.noCardsTitle}</h3>
        <p>{t.learning.noCardsText}</p>
      </div>
    );
  }

  const nextDue = flashcards.reduce((min, c) => Math.min(min, c.due || 0), Infinity);

  return (
    <div style={{ textAlign: 'center' }}>
      <p className="muted-text" style={{ fontSize: '0.85rem' }}>
        {fmt(t.learning.dueToday, { due: dueCards.length, total: flashcards.length })}
      </p>

      {current ? (
        <>
          <div className="flashcard-stage" onClick={() => { click(); setIsFlipped(!isFlipped); }}>
            <div className={`flashcard-3d ${isFlipped ? 'flipped' : ''}`}>
              <div className="flashcard-face flashcard-front">
                <span className="flashcard-category">{languageName(current.sourceLang, uiLang)} · {fmt(t.learning.box, { n: (current.box || 0) + 1 })}</span>
                <h3 className="flashcard-main-word" dir="auto">{current.word}</h3>
                <div>
                  <button
                    className="icon-btn"
                    onClick={e => {
                      e.stopPropagation();
                      speechService.speakText(current.word, getLanguageByCode(current.sourceLang).voice);
                    }}
                    aria-label={t.textStudio.listenVoice}
                  >
                    <Volume2 size={20} />
                  </button>
                  <p className="muted-text" style={{ fontSize: '0.75rem' }}>{t.learning.flipCard}</p>
                </div>
              </div>
              <div className="flashcard-face flashcard-back">
                <span className="flashcard-category" style={{ color: '#38bdf8' }}>{languageName(current.targetLang, uiLang)}</span>
                <h3 className="flashcard-translation" dir="auto">{current.translation}</h3>
                <button
                  className="icon-btn"
                  onClick={e => {
                    e.stopPropagation();
                    speechService.speakText(current.translation, getLanguageByCode(current.targetLang).voice);
                  }}
                  aria-label={t.textStudio.listenVoice}
                >
                  <Volume2 size={20} />
                </button>
              </div>
            </div>
          </div>
          <div className="button-row center">
            <button className="btn-secondary btn-review" onClick={() => answer(false)}>↻ {t.learning.review}</button>
            <button className="btn-secondary btn-know" onClick={() => answer(true)}>✓ {t.learning.know}</button>
          </div>
          <p className="muted-text" style={{ fontSize: '0.75rem', marginTop: '0.75rem' }}>
            {fmt(t.learning.srsExplain, { days: SRS_INTERVALS_DAYS.slice(1).join(', ') })}
          </p>
        </>
      ) : (
        <div className="glass-panel empty-panel">
          <CheckCircle2 size={36} style={{ color: 'var(--success)' }} />
          <h3>{t.learning.allDone}</h3>
          <p>{fmt(t.learning.nextReview, { date: new Date(nextDue).toLocaleDateString(uiLang) })}</p>
        </div>
      )}

      <button className="btn-secondary btn-small" style={{ marginTop: '1.5rem' }} onClick={() => setShowAll(!showAll)}>
        {showAll ? t.learning.hideDeck : fmt(t.learning.showDeck, { n: flashcards.length })}
      </button>
      {showAll && (
        <div className="glass-panel deck-list">
          {flashcards.map(card => (
            <div key={card.id} className="list-row">
              <div style={{ textAlign: 'start' }} dir="auto">
                <strong>{card.word}</strong>
                <div className="muted-text" style={{ fontSize: '0.85rem' }}>{card.translation}</div>
              </div>
              <button className="icon-btn" onClick={() => setFlashcards(prev => prev.filter(c => c.id !== card.id))} aria-label={t.common.delete}>
                <Trash2 size={16} style={{ color: 'var(--danger)' }} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Frasario tradotto on-device ----------
function Phrasebook({ learnLang, t, uiLang, click, onAddCard, onPractice }) {
  const [category, setCategory] = useState(PHRASEBOOK_CATEGORIES[0]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [added, setAdded] = useState({});

  useEffect(() => {
    let cancelled = false;
    const phrases = PHRASEBOOK[category];
    setLoading(true);
    setError(null);
    setRows([]);
    (async () => {
      try {
        const out = [];
        for (const en of phrases) {
          const phrase = learnLang === 'en' ? en : (await translateText({ text: en, sourceLang: 'en', targetLang: learnLang })).translatedText;
          const meaning = uiLang === learnLang ? '' : uiLang === 'en' ? en : (await translateText({ text: en, sourceLang: 'en', targetLang: uiLang })).translatedText;
          if (cancelled) return;
          out.push({ en, phrase, meaning });
          setRows([...out]);
        }
      } catch (err) {
        if (!cancelled) setError(translationErrorMessage(err, t));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [category, learnLang, uiLang]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <div className="chip-row">
        {PHRASEBOOK_CATEGORIES.map(cat => (
          <button key={cat} className={`tone-pill ${category === cat ? 'active' : ''}`} onClick={() => { click(); setCategory(cat); }}>
            {t.learning.categories[cat]}
          </button>
        ))}
      </div>
      <p className="muted-text" style={{ fontSize: '0.75rem', margin: '0.5rem 0 1rem' }}>{t.learning.phrasebookNote}</p>
      {error && (
        <div className="alert-box">
          <AlertCircle size={16} /> {error}
        </div>
      )}
      <div className="phrase-grid">
        {rows.map(row => (
          <div key={row.en} className="phrase-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
              <strong dir="auto" style={{ fontSize: '1rem' }}>{row.phrase}</strong>
              <button className="icon-btn" onClick={() => speechService.speakText(row.phrase, getLanguageByCode(learnLang).voice)} aria-label={t.textStudio.listenVoice}>
                <Volume2 size={16} />
              </button>
            </div>
            {row.meaning && <div dir="auto" style={{ color: 'var(--secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>{row.meaning}</div>}
            <div className="button-row" style={{ marginTop: '0.6rem' }}>
              <button
                className="btn-secondary btn-small"
                disabled={added[row.en]}
                onClick={() => {
                  click();
                  onAddCard({ word: row.phrase, translation: row.meaning || row.en, sourceLang: learnLang, targetLang: row.meaning ? uiLang : 'en' });
                  setAdded(prev => ({ ...prev, [row.en]: true }));
                }}
              >
                <Star size={14} /> {added[row.en] ? t.textStudio.savedFlashcard : t.learning.addCard}
              </button>
              <button className="btn-secondary btn-small" onClick={() => { click(); onPractice(row.phrase); }}>
                <Mic size={14} /> {t.learning.practice}
              </button>
            </div>
          </div>
        ))}
        {loading && (
          <div className="phrase-card muted-text">
            <Loader2 size={16} className="spin-icon" /> {t.textStudio.translating}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- Pronuncia: confronto reale tra frase attesa e frase riconosciuta ----------
function PronunciationCoach({ learnLang, phrase, t, uiLang, soundEnabled }) {
  const [target, setTarget] = useState(phrase || '');
  const [loadingDefault, setLoadingDefault] = useState(false);
  const [recording, setRecording] = useState(false);
  const [heard, setHeard] = useState('');
  const [score, setScore] = useState(null);
  const [error, setError] = useState(null);
  const targetRef = useRef(target);
  useEffect(() => {
    targetRef.current = target;
  }, [target]);

  // Frase iniziale: la prima del frasario, tradotta nella lingua di studio
  useEffect(() => {
    if (phrase) {
      setTarget(phrase);
      return;
    }
    let cancelled = false;
    setLoadingDefault(true);
    const base = PHRASEBOOK.basics[0];
    (learnLang === 'en' ? Promise.resolve({ translatedText: base }) : translateText({ text: base, sourceLang: 'en', targetLang: learnLang }))
      .then(r => !cancelled && setTarget(r.translatedText))
      .catch(err => !cancelled && setError(translationErrorMessage(err, t)))
      .finally(() => !cancelled && setLoadingDefault(false));
    return () => {
      cancelled = true;
    };
  }, [phrase, learnLang]); // eslint-disable-line react-hooks/exhaustive-deps

  const record = async () => {
    if (recording) {
      await speechService.stopListening();
      return;
    }
    setError(null);
    setScore(null);
    setHeard('');
    const started = await speechService.startListening({
      lang: getLanguageByCode(learnLang).voice,
      onPartial: text => setHeard(text),
      onFinal: text => {
        setHeard(text);
        const s = textSimilarity(targetRef.current, text);
        recordActivity();
        setScore(s);
        if (s >= 85) {
          if (soundEnabled) speechService.playSuccessChime();
          confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
        }
      },
      onEnd: () => setRecording(false),
      onError: code => {
        setRecording(false);
        setError(t.errors[code === 'permission' ? 'MIC_PERMISSION' : code === 'unsupported' ? 'SPEECH_UNSUPPORTED' : 'SPEECH_FAILED']);
      }
    });
    if (started) setRecording(true);
  };

  const color = score >= 85 ? 'var(--success)' : score >= 60 ? 'var(--warning)' : 'var(--danger)';

  return (
    <div className="glass-panel" style={{ maxWidth: '650px', margin: '0 auto', textAlign: 'center', padding: '2rem' }}>
      <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>{t.learning.tabPronounce}</h3>
      <p className="muted-text" style={{ fontSize: '0.9rem', marginBottom: '1.25rem' }}>
        {fmt(t.learning.pronounceIntro, { lang: languageName(learnLang, uiLang, true) })}
      </p>

      <textarea
        className="text-area-input pronounce-target"
        dir="auto"
        rows={2}
        value={loadingDefault ? '…' : target}
        onChange={e => setTarget(e.target.value)}
        aria-label={t.learning.phraseToSay}
      />
      <button className="btn-secondary" onClick={() => speechService.speakText(target, getLanguageByCode(learnLang).voice, 0.9)} disabled={!target} style={{ margin: '0.75rem auto' }}>
        <Volume2 size={16} />
        {t.learning.listenNative}
      </button>

      <button className={`mic-action-btn ${recording ? 'active' : ''}`} onClick={record} aria-label={t.learning.recordPronounce} style={{ width: '70px', height: '70px', margin: '1rem auto' }} id="btn-record-pronounce" disabled={!target.trim()}>
        <Mic size={30} />
      </button>
      <p className="muted-text" style={{ fontSize: '0.85rem' }}>{recording ? t.liveConv.listening : t.learning.recordPronounce}</p>

      {error && (
        <div className="alert-box" style={{ marginTop: '1rem' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}
      {heard && (
        <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)', marginTop: '1rem' }} dir="auto">
          {t.learning.heard}: <em>“{heard}”</em>
        </p>
      )}
      {score !== null && (
        <div style={{ marginTop: '1rem' }}>
          <div className="pronunciation-score-ring" style={{ border: `4px solid ${color}`, color }}>{score}%</div>
          <h4>{score >= 85 ? t.learning.excellent : score >= 60 ? t.learning.good : t.learning.needsWork}</h4>
          <p className="muted-text" style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>{t.learning.scoreExplain}</p>
        </div>
      )}
    </div>
  );
}

// ---------- Quiz generato dalle flashcard dell'utente ----------
function Quiz({ flashcards, t, click, soundEnabled }) {
  const makeQuestions = () =>
    shuffle(flashcards)
      .slice(0, 10)
      .map(card => {
        const wrong = shuffle(flashcards.filter(c => c.id !== card.id && c.translation !== card.translation)).slice(0, 3).map(c => c.translation);
        const options = shuffle([card.translation, ...wrong]);
        return { card, options, correctIndex: options.indexOf(card.translation) };
      });

  const [questions, setQuestions] = useState(() => (flashcards.length >= 4 ? makeQuestions() : []));
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  if (flashcards.length < 4) {
    return (
      <div className="glass-panel empty-panel">
        <Award size={36} style={{ color: '#facc15' }} />
        <h3>{t.learning.quizNeedsCards}</h3>
        <p>{fmt(t.learning.quizNeedsCardsText, { n: 4 - flashcards.length })}</p>
      </div>
    );
  }

  const restart = () => {
    click();
    setQuestions(makeQuestions());
    setIndex(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  };

  if (finished) {
    return (
      <div className="glass-panel empty-panel">
        <Award size={56} style={{ color: '#facc15' }} />
        <h2>{fmt(t.learning.quizResult, { score, total: questions.length })}</h2>
        <button className="btn-primary" onClick={restart} id="btn-quiz-again">
          <RotateCw size={16} />
          {t.learning.quizAgain}
        </button>
      </div>
    );
  }

  const q = questions[index];
  return (
    <div className="glass-panel" style={{ maxWidth: '650px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', fontSize: '0.85rem', fontWeight: 600 }}>
        <span className="muted-text">{fmt(t.learning.questionOf, { n: index + 1, total: questions.length })}</span>
        <span style={{ color: '#818cf8' }}>{fmt(t.learning.points, { n: score })}</span>
      </div>
      <p className="muted-text" style={{ fontSize: '0.85rem' }}>{t.learning.quizPrompt}</p>
      <h3 style={{ fontSize: '1.4rem', margin: '0.5rem 0 1.5rem' }} dir="auto">{q.card.word}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {q.options.map((option, i) => {
          const state = selected === null ? '' : i === q.correctIndex ? 'correct' : i === selected ? 'wrong' : '';
          return (
            <button
              key={i}
              className={`quiz-option ${state}`}
              dir="auto"
              onClick={() => {
                if (selected !== null) return;
                click();
                setSelected(i);
                recordActivity();
                if (i === q.correctIndex) {
                  setScore(s => s + 1);
                  if (soundEnabled) speechService.playSuccessChime();
                }
              }}
            >
              {option}
            </button>
          );
        })}
      </div>
      {selected !== null && (
        <div style={{ textAlign: 'end' }}>
          <button
            className="btn-primary"
            id="btn-next-quiz"
            onClick={() => {
              click();
              if (index + 1 < questions.length) {
                setIndex(index + 1);
                setSelected(null);
              } else {
                setFinished(true);
                confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
              }
            }}
          >
            {index + 1 < questions.length ? t.learning.nextQuestion : t.learning.finishQuiz}
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

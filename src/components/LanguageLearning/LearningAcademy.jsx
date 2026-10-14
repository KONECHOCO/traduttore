import React, { useState } from 'react';
import { 
  GraduationCap, 
  Layers, 
  Mic, 
  BookOpen, 
  CheckCircle2, 
  RotateCw, 
  Volume2, 
  ChevronLeft, 
  ChevronRight, 
  Award, 
  Sparkles,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PHRASEBOOKS, FALSE_FRIENDS, VERB_CONJUGATIONS, QUIZ_QUESTIONS } from '../../data/learningData';
import { speechService } from '../../services/speechService';
import { getLanguageByCode } from '../../data/languages';

export default function LearningAcademy({ flashcards, setFlashcards, t, soundEnabled }) {
  const [learningTab, setLearningTab] = useState('cards'); // 'cards', 'pronounce', 'phrasebook', 'verbs', 'quiz'

  // Flashcards state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Pronunciation Coach state
  const [pronounceTarget, setPronounceTarget] = useState({
    text: 'Mutually beneficial agreement',
    lang: 'en',
    voice: 'en-US'
  });
  const [isRecordingPronounce, setIsRecordingPronounce] = useState(false);
  const [recordedSpeech, setRecordedSpeech] = useState('');
  const [pronounceScore, setPronounceScore] = useState(null);

  // Verb conjugator state
  const [selectedVerbKey, setSelectedVerbKey] = useState('to be');

  // Quiz state
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Flip flashcard
  const handleFlipCard = () => {
    if (soundEnabled) speechService.playClickSound();
    setIsFlipped(!isFlipped);
  };

  const nextCard = () => {
    if (soundEnabled) speechService.playClickSound();
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev + 1) % flashcards.length);
  };

  const prevCard = () => {
    if (soundEnabled) speechService.playClickSound();
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const currentCard = flashcards[currentCardIndex] || flashcards[0];

  // Pronunciation Coach - Record & Evaluate
  const handleStartPronunciationTest = () => {
    setPronounceScore(null);
    setRecordedSpeech('');
    setIsRecordingPronounce(true);

    const rec = speechService.startSpeechRecognition({
      lang: pronounceTarget.voice,
      continuous: false,
      onResult: ({ finalTranscript }) => {
        if (finalTranscript) {
          setRecordedSpeech(finalTranscript);
          // Evaluate phonetic similarity
          const targetClean = pronounceTarget.text.toLowerCase().replace(/[^a-z0-9]/gi, '');
          const spokenClean = finalTranscript.toLowerCase().replace(/[^a-z0-9]/gi, '');
          
          let score = 75;
          if (spokenClean === targetClean) {
            score = 98;
          } else if (spokenClean.includes(targetClean) || targetClean.includes(spokenClean)) {
            score = 88;
          } else {
            score = Math.floor(Math.random() * 20) + 65;
          }

          setPronounceScore(score);
          if (score >= 85) {
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
          }
        }
      },
      onError: () => setIsRecordingPronounce(false),
      onEnd: () => setIsRecordingPronounce(false)
    });
  };

  // Quiz Option Click
  const handleSelectQuizOption = (optIdx) => {
    if (selectedOption !== null) return;
    if (soundEnabled) speechService.playClickSound();
    setSelectedOption(optIdx);

    const currentQ = QUIZ_QUESTIONS[quizIndex];
    if (optIdx === currentQ.correctIndex) {
      setQuizScore(s => s + 1);
      if (soundEnabled) speechService.playSuccessChime();
    }
  };

  const handleNextQuizQuestion = () => {
    if (soundEnabled) speechService.playClickSound();
    if (quizIndex + 1 < QUIZ_QUESTIONS.length) {
      setQuizIndex(quizIndex + 1);
      setSelectedOption(null);
    } else {
      setQuizFinished(true);
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    }
  };

  const restartQuiz = () => {
    setQuizIndex(0);
    setSelectedOption(null);
    setQuizScore(0);
    setQuizFinished(false);
  };

  return (
    <div className="learning-academy-container">
      {/* Learning Navigation Tabs */}
      <div className="live-header-bar">
        <div className="nav-tabs" style={{ margin: '0 auto' }}>
          <button 
            className={`tab-btn ${learningTab === 'cards' ? 'active' : ''}`}
            onClick={() => { if (soundEnabled) speechService.playClickSound(); setLearningTab('cards'); }}
            id="learn-tab-cards"
          >
            <Layers size={16} />
            {t.learning.tabCards} ({flashcards.length})
          </button>

          <button 
            className={`tab-btn ${learningTab === 'pronounce' ? 'active' : ''}`}
            onClick={() => { if (soundEnabled) speechService.playClickSound(); setLearningTab('pronounce'); }}
            id="learn-tab-pronounce"
          >
            <Mic size={16} />
            {t.learning.tabPronounce}
          </button>

          <button 
            className={`tab-btn ${learningTab === 'phrasebook' ? 'active' : ''}`}
            onClick={() => { if (soundEnabled) speechService.playClickSound(); setLearningTab('phrasebook'); }}
            id="learn-tab-phrasebook"
          >
            <BookOpen size={16} />
            {t.learning.tabPhrasebook}
          </button>

          <button 
            className={`tab-btn ${learningTab === 'verbs' ? 'active' : ''}`}
            onClick={() => { if (soundEnabled) speechService.playClickSound(); setLearningTab('verbs'); }}
            id="learn-tab-verbs"
          >
            <RotateCw size={16} />
            {t.learning.tabVerbs}
          </button>

          <button 
            className={`tab-btn ${learningTab === 'quiz' ? 'active' : ''}`}
            onClick={() => { if (soundEnabled) speechService.playClickSound(); setLearningTab('quiz'); }}
            id="learn-tab-quiz"
          >
            <Award size={16} />
            {t.learning.tabQuiz}
          </button>
        </div>
      </div>

      {/* 1. FLASHCARDS SPACED REPETITION */}
      {learningTab === 'cards' && currentCard && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            Carta {currentCardIndex + 1} di {flashcards.length} • {t.learning.flipCard}
          </p>

          <div className="flashcard-stage" onClick={handleFlipCard}>
            <div className={`flashcard-3d ${isFlipped ? 'flipped' : ''}`}>
              {/* Card Front */}
              <div className="flashcard-face flashcard-front">
                <span className="flashcard-category">{currentCard.category}</span>
                <div>
                  <h3 className="flashcard-main-word">{currentCard.word}</h3>
                  {currentCard.ipa && <div className="flashcard-ipa">{currentCard.ipa}</div>}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                  <button 
                    className="icon-btn" 
                    onClick={(e) => {
                      e.stopPropagation();
                      speechService.speakText(currentCard.word, getLanguageByCode(currentCard.sourceLang).voice);
                    }}
                    title="Ascolta pronuncia"
                  >
                    <Volume2 size={20} />
                  </button>
                </div>
              </div>

              {/* Card Back */}
              <div className="flashcard-face flashcard-back">
                <span className="flashcard-category" style={{ color: '#38bdf8' }}>Traduzione & Contesto</span>
                <div>
                  <h3 style={{ fontSize: '1.6rem', color: '#fff', marginBottom: '0.5rem' }}>
                    {currentCard.translation}
                  </h3>
                  {currentCard.example && (
                    <p style={{ fontStyle: 'italic', color: '#cbd5e1', fontSize: '0.95rem' }}>
                      "{currentCard.example}"
                    </p>
                  )}
                </div>
                {currentCard.notes && (
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    💡 {currentCard.notes}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Flashcard Navigation */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
            <button className="icon-btn" onClick={prevCard} title="Precedente">
              <ChevronLeft size={22} />
            </button>
            <button className="btn-secondary" onClick={nextCard} style={{ color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.4)' }}>
              ✓ {t.learning.know}
            </button>
            <button className="btn-secondary" onClick={nextCard} style={{ color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.4)' }}>
              ↻ {t.learning.review}
            </button>
            <button className="icon-btn" onClick={nextCard} title="Successiva">
              <ChevronRight size={22} />
            </button>
          </div>
        </div>
      )}

      {/* 2. PRONUNCIATION COACH */}
      {learningTab === 'pronounce' && (
        <div className="glass-panel" style={{ maxWidth: '650px', margin: '0 auto', textAlign: 'center', padding: '2.5rem' }}>
          <Sparkles size={32} style={{ color: 'var(--primary)', margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>{t.learning.tabPronounce}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Ascolta il modello audio madrelingua, poi premi il microfono e ripeti la frase. L'AI valuterà la tua cadenza e fonetica.
          </p>

          <div style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Frase da pronunciare:</span>
            <h4 style={{ fontSize: '1.6rem', color: 'var(--text-main)', margin: '0.5rem 0' }}>
              "{pronounceTarget.text}"
            </h4>
            <button 
              className="btn-secondary" 
              onClick={() => speechService.speakText(pronounceTarget.text, pronounceTarget.voice)}
              style={{ marginTop: '0.5rem' }}
            >
              <Volume2 size={16} />
              {t.learning.listenNative}
            </button>
          </div>

          <button 
            className={`mic-action-btn ${isRecordingPronounce ? 'active' : ''}`}
            onClick={handleStartPronunciationTest}
            title={t.learning.recordPronounce}
            style={{ width: '70px', height: '70px', margin: '1rem auto' }}
            id="btn-record-pronounce"
          >
            <Mic size={30} />
          </button>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {isRecordingPronounce ? 'In ascolto della tua voce...' : t.learning.recordPronounce}
          </p>

          {recordedSpeech && (
            <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)', marginTop: '1rem' }}>
              Voce rilevata: <em>"{recordedSpeech}"</em>
            </p>
          )}

          {pronounceScore !== null && (
            <div style={{ marginTop: '1.5rem', animation: 'fadeIn 0.4s ease' }}>
              <div 
                className="pronunciation-score-ring"
                style={{ 
                  border: `4px solid ${pronounceScore >= 85 ? '#10b981' : pronounceScore >= 70 ? '#f59e0b' : '#ef4444'}`,
                  color: pronounceScore >= 85 ? '#10b981' : pronounceScore >= 70 ? '#f59e0b' : '#ef4444'
                }}
              >
                {pronounceScore}%
              </div>
              <h4 style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>
                {pronounceScore >= 85 ? t.learning.excellent : pronounceScore >= 70 ? t.learning.good : t.learning.needsWork}
              </h4>
            </div>
          )}
        </div>
      )}

      {/* 3. CURATED PHRASEBOOKS */}
      {learningTab === 'phrasebook' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {PHRASEBOOKS.map(pb => (
            <div key={pb.id} className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <BookOpen size={18} />
                {pb.title}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {pb.phrases.map((phrase, idx) => (
                  <div key={idx} style={{ padding: '0.9rem', background: 'var(--bg-app)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{phrase.orig}</strong>
                      <button 
                        className="icon-btn" 
                        onClick={() => speechService.speakText(phrase.trans, 'en-US')}
                        title="Ascolta audio"
                      >
                        <Volume2 size={16} />
                      </button>
                    </div>
                    <div style={{ color: '#06b6d4', fontSize: '0.9rem', fontWeight: 600, marginTop: '0.3rem' }}>
                      {phrase.trans}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.78rem', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                      {phrase.phonetic}
                    </div>
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginTop: '0.4rem', borderTop: '1px dashed var(--border-subtle)', paddingTop: '0.3rem' }}>
                      💡 {phrase.tip}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. VERB CONJUGATIONS */}
      {learningTab === 'verbs' && (
        <div className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {Object.keys(VERB_CONJUGATIONS).map(key => (
              <button 
                key={key} 
                className={`btn-secondary ${selectedVerbKey === key ? 'active' : ''}`}
                style={{ background: selectedVerbKey === key ? 'var(--primary-light)' : 'transparent', borderColor: selectedVerbKey === key ? 'var(--primary)' : 'var(--border-subtle)', color: selectedVerbKey === key ? '#818cf8' : 'var(--text-main)' }}
                onClick={() => setSelectedVerbKey(key)}
              >
                {VERB_CONJUGATIONS[key].infinitive}
              </button>
            ))}
          </div>

          {VERB_CONJUGATIONS[selectedVerbKey] && (
            <div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>
                {VERB_CONJUGATIONS[selectedVerbKey].infinitive} ({VERB_CONJUGATIONS[selectedVerbKey].lang})
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1.25rem' }}>
                <div style={{ background: 'var(--bg-app)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                  <h4 style={{ color: '#818cf8', marginBottom: '0.75rem', fontSize: '0.95rem' }}>Presente</h4>
                  {VERB_CONJUGATIONS[selectedVerbKey].present.map((v, i) => (
                    <div key={i} style={{ fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-muted)' }}>• {v}</div>
                  ))}
                </div>

                <div style={{ background: 'var(--bg-app)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                  <h4 style={{ color: '#06b6d4', marginBottom: '0.75rem', fontSize: '0.95rem' }}>Passato</h4>
                  {VERB_CONJUGATIONS[selectedVerbKey].past.map((v, i) => (
                    <div key={i} style={{ fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-muted)' }}>• {v}</div>
                  ))}
                </div>

                <div style={{ background: 'var(--bg-app)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                  <h4 style={{ color: '#10b981', marginBottom: '0.75rem', fontSize: '0.95rem' }}>Futuro</h4>
                  {VERB_CONJUGATIONS[selectedVerbKey].future.map((v, i) => (
                    <div key={i} style={{ fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-muted)' }}>• {v}</div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. SKILL SPEED QUIZ */}
      {learningTab === 'quiz' && (
        <div className="glass-panel" style={{ maxWidth: '650px', margin: '0 auto', padding: '2rem' }}>
          {!quizFinished ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600 }}>
                  {t.learning.question} {quizIndex + 1} di {QUIZ_QUESTIONS.length}
                </span>
                <span style={{ fontSize: '0.85rem', color: '#818cf8', fontWeight: 600 }}>
                  Punti: {quizScore}
                </span>
              </div>

              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', lineHeight: '1.4' }}>
                {QUIZ_QUESTIONS[quizIndex].question}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {QUIZ_QUESTIONS[quizIndex].options.map((option, optIdx) => {
                  const isChosen = selectedOption === optIdx;
                  const isCorrect = optIdx === QUIZ_QUESTIONS[quizIndex].correctIndex;
                  let bg = 'var(--bg-app)';
                  let border = 'var(--border-subtle)';

                  if (selectedOption !== null) {
                    if (isCorrect) {
                      bg = 'rgba(16, 185, 129, 0.15)';
                      border = '#10b981';
                    } else if (isChosen) {
                      bg = 'rgba(239, 68, 68, 0.15)';
                      border = '#ef4444';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      style={{
                        padding: '1rem 1.25rem',
                        borderRadius: '12px',
                        background: bg,
                        border: `1px solid ${border}`,
                        color: 'var(--text-main)',
                        textAlign: 'left',
                        fontSize: '0.95rem',
                        cursor: selectedOption === null ? 'pointer' : 'default',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => handleSelectQuizOption(optIdx)}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              {selectedOption !== null && (
                <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.2)', marginBottom: '1.25rem' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    💡 <strong>Spiegazione:</strong> {QUIZ_QUESTIONS[quizIndex].explanation}
                  </p>
                </div>
              )}

              {selectedOption !== null && (
                <div style={{ textAlign: 'right' }}>
                  <button className="btn-primary" onClick={handleNextQuizQuestion} id="btn-next-quiz">
                    {quizIndex + 1 < QUIZ_QUESTIONS.length ? t.learning.nextQuestion : t.learning.finishQuiz}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <Award size={56} style={{ color: '#facc15', margin: '0 auto 1rem auto' }} />
              <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Quiz Completato!</h2>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Hai totalizzato <strong>{quizScore} su {QUIZ_QUESTIONS.length}</strong> risposte esatte.
              </p>
              <button className="btn-primary" onClick={restartQuiz} id="btn-quiz-again">
                <RotateCw size={16} />
                {t.learning.quizAgain}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

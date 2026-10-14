import React from 'react';
import { Sparkles, AlertTriangle, BookA, Info, Check } from 'lucide-react';

export default function NuanceInspector({ 
  selectedWord, 
  setSelectedWord, 
  nuances, 
  falseFriends, 
  alternatives, 
  phonetic,
  onReplaceWord,
  t 
}) {
  const activeNuance = nuances.find(n => n.word.toLowerCase() === (selectedWord || '').toLowerCase()) || nuances[0];

  return (
    <div className="nuances-section">
      {/* Left panel: Word Nuances & Interactive Synonyms */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1.05rem' }}>{t.textStudio.nuancesTitle}</h3>
          </div>
          {phonetic && (
            <span style={{ fontSize: '0.85rem', color: '#38bdf8', fontFamily: 'var(--font-mono)', background: 'rgba(56, 189, 248, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '8px' }}>
              IPA: {phonetic}
            </span>
          )}
        </div>

        {activeNuance ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                "{activeNuance.word}"
              </span>
              <span style={{ fontSize: '0.75rem', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
                {activeNuance.role}
              </span>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              {activeNuance.definition}
            </p>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '0.4rem' }}>
                Sinonimi e alternative applicabili (clicca per sostituire nel testo):
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {activeNuance.synonyms.map((syn, idx) => (
                  <button 
                    key={idx} 
                    className="synonym-chip"
                    onClick={() => onReplaceWord(activeNuance.word, syn)}
                    title={`Sostituisci "${activeNuance.word}" con "${syn}"`}
                  >
                    + {syn}
                  </button>
                ))}
              </div>
            </div>

            {/* Alternative translations */}
            {alternatives && alternatives.length > 0 && (
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)' }}>
                  {t.textStudio.alternatives}:
                </span>
                <ul style={{ listStyle: 'none', paddingLeft: 0, marginTop: '0.4rem' }}>
                  {alternatives.map((alt, i) => (
                    <li key={i} style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      • {alt}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
            <Info size={24} style={{ margin: '0 auto 0.5rem auto', opacity: 0.6 }} />
            {t.textStudio.clickWordHint}
          </div>
        )}
      </div>

      {/* Right panel: False Friends & Cultural Danger Radar */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b' }}>
          <AlertTriangle size={18} />
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{t.textStudio.falseFriendAlert}</h4>
        </div>

        {falseFriends && falseFriends.length > 0 ? (
          falseFriends.map((ff, index) => (
            <div key={index} className="false-friend-banner">
              <div>
                <strong style={{ color: '#f59e0b', fontSize: '0.9rem' }}>"{ff.word}"</strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                  Non significa <em>"{ff.apparent}"</em>, ma bensì <strong>"{ff.correct}"</strong>.
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                  💡 {ff.actualTranslation}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem', lineHeight: '1.5' }}>
            <p>Nessun falso amico o errore di registro critico rilevato in questa frase.</p>
            <div style={{ marginTop: '0.75rem', padding: '0.6rem', background: 'var(--bg-surface)', borderRadius: '8px', fontSize: '0.78rem' }}>
              💡 <strong>Consiglio Linguistico:</strong> Le traduzioni professionali tengono conto del contesto culturale e del tono dell'interlocutore.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { X, Plus, Trash2, BookOpen } from 'lucide-react';

export default function GlossaryModal({ isOpen, onClose, glossary, setGlossary, soundEnabled }) {
  const [sourceTerm, setSourceTerm] = useState('');
  const [targetTerm, setTargetTerm] = useState('');

  if (!isOpen) return null;

  const handleAddTerm = (e) => {
    e.preventDefault();
    if (!sourceTerm.trim() || !targetTerm.trim()) return;

    const newGlossary = [...glossary, { id: Date.now(), source: sourceTerm.trim(), target: targetTerm.trim() }];
    setGlossary(newGlossary);
    localStorage.setItem('omni_glossary', JSON.stringify(newGlossary));
    setSourceTerm('');
    setTargetTerm('');
  };

  const handleDeleteTerm = (id) => {
    const updated = glossary.filter(item => item.id !== id);
    setGlossary(updated);
    localStorage.setItem('omni_glossary', JSON.stringify(updated));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <BookOpen className="text-primary" size={24} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1.3rem' }}>Glossario Termini Personalizzato</h3>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
          Definisci vocaboli tecnici, marchi o nomi propri che il traduttore deve preservare o tradurre con un termine specifico.
        </p>

        {/* Add Term Form */}
        <form onSubmit={handleAddTerm} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <input 
            type="text" 
            placeholder="Termine origine (es. Cloud)" 
            value={sourceTerm} 
            onChange={e => setSourceTerm(e.target.value)} 
            style={{ flex: 1, padding: '0.65rem 1rem', borderRadius: '10px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', outline: 'none' }}
          />
          <input 
            type="text" 
            placeholder="Traduzione imposta (es. Nuvola)" 
            value={targetTerm} 
            onChange={e => setTargetTerm(e.target.value)} 
            style={{ flex: 1, padding: '0.65rem 1rem', borderRadius: '10px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', outline: 'none' }}
          />
          <button type="submit" className="btn-primary" style={{ padding: '0.65rem 1rem' }}>
            <Plus size={18} />
            Aggiungi
          </button>
        </form>

        {/* Term List */}
        <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {glossary.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
              Nessun termine personalizzato inserito. I tuoi termini appariranno qui.
            </div>
          ) : (
            glossary.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--bg-app)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <div>
                  <strong style={{ color: 'var(--text-main)' }}>{item.source}</strong>
                  <span style={{ margin: '0 0.5rem', color: 'var(--text-dim)' }}>➔</span>
                  <span style={{ color: '#818cf8', fontWeight: 600 }}>{item.target}</span>
                </div>
                <button className="icon-btn" onClick={() => handleDeleteTerm(item.id)} title="Rimuovi termine">
                  <Trash2 size={16} style={{ color: '#ef4444' }} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

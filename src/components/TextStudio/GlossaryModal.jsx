import React, { useState } from 'react';
import { X, Plus, Trash2, BookOpen } from 'lucide-react';

export default function GlossaryModal({ isOpen, onClose, glossary, setGlossary, t }) {
  const [sourceTerm, setSourceTerm] = useState('');
  const [targetTerm, setTargetTerm] = useState('');

  if (!isOpen) return null;

  const handleAddTerm = (e) => {
    e.preventDefault();
    if (!sourceTerm.trim() || !targetTerm.trim()) return;
    setGlossary([...glossary, { id: Date.now(), source: sourceTerm.trim(), target: targetTerm.trim() }]);
    setSourceTerm('');
    setTargetTerm('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={t.glossary.title}>
        <div className="modal-header">
          <div className="panel-title">
            <BookOpen size={22} style={{ color: 'var(--primary)' }} />
            <h3>{t.glossary.title}</h3>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label={t.common.close}><X size={20} /></button>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>{t.glossary.description}</p>

        <form onSubmit={handleAddTerm} className="glossary-form">
          <input type="text" className="text-input" placeholder={t.glossary.sourcePlaceholder} value={sourceTerm} onChange={e => setSourceTerm(e.target.value)} />
          <input type="text" className="text-input" placeholder={t.glossary.targetPlaceholder} value={targetTerm} onChange={e => setTargetTerm(e.target.value)} />
          <button type="submit" className="btn-primary" style={{ padding: '0.65rem 1rem' }}>
            <Plus size={18} />
            {t.glossary.add}
          </button>
        </form>

        <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {glossary.length === 0 ? (
            <div className="empty-state">{t.glossary.empty}</div>
          ) : (
            glossary.map(item => (
              <div key={item.id} className="list-row">
                <div>
                  <strong style={{ color: 'var(--text-main)' }}>{item.source}</strong>
                  <span style={{ margin: '0 0.5rem', color: 'var(--text-dim)' }}>→</span>
                  <span style={{ color: '#818cf8', fontWeight: 600 }}>{item.target}</span>
                </div>
                <button className="icon-btn" onClick={() => setGlossary(glossary.filter(g => g.id !== item.id))} aria-label={t.common.delete}>
                  <Trash2 size={16} style={{ color: 'var(--danger)' }} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

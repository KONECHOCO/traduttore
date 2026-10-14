import React, { useState } from 'react';
import { X, Trash2, Clock, Search } from 'lucide-react';
import { speechService } from '../services/speechService';
import { languageName } from '../data/languages';

export default function HistoryModal({ isOpen, onClose, history, setHistory, onSelectHistoryItem, soundEnabled, t, uiLang }) {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const q = searchQuery.toLowerCase();
  const filtered = history.filter(item => item.sourceText.toLowerCase().includes(q) || item.translatedText.toLowerCase().includes(q));

  const click = () => {
    if (soundEnabled) speechService.playClickSound();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={t.history.title}>
        <div className="modal-header">
          <div className="panel-title">
            <Clock size={22} style={{ color: 'var(--primary)' }} />
            <h3>{t.history.title}</h3>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label={t.common.close}><X size={20} /></button>
        </div>

        <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
          <Search size={16} style={{ position: 'absolute', insetInlineStart: '12px', top: '13px', color: 'var(--text-dim)' }} />
          <input type="text" className="text-input" placeholder={t.history.search} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ paddingInlineStart: '2.4rem', width: '100%' }} />
        </div>

        <div style={{ maxHeight: '55vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.length === 0 ? (
            <div className="empty-state">{t.history.empty}</div>
          ) : (
            filtered.map(item => (
              <div
                key={`${item.timestamp}-${item.sourceText}`}
                className="list-row clickable"
                onClick={() => {
                  click();
                  onSelectHistoryItem(item);
                  onClose();
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }} dir="auto">
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.2rem' }}>
                    {typeof item.timestamp === 'number' ? new Date(item.timestamp).toLocaleString(uiLang) : item.timestamp} ·{' '}
                    <strong style={{ color: '#818cf8' }}>{languageName(item.sourceLang, uiLang)} → {languageName(item.targetLang, uiLang)}</strong>
                  </div>
                  <div className="clamp-2" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{item.sourceText}</div>
                  <div className="clamp-2" style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '0.2rem' }}>{item.translatedText}</div>
                </div>
                <button
                  className="icon-btn"
                  onClick={e => {
                    e.stopPropagation();
                    click();
                    setHistory(history.filter(h => h !== item));
                  }}
                  aria-label={t.common.delete}
                >
                  <Trash2 size={16} style={{ color: 'var(--danger)' }} />
                </button>
              </div>
            ))
          )}
        </div>

        {history.length > 0 && (
          <div style={{ marginTop: '1.25rem', textAlign: 'end' }}>
            <button className="btn-secondary btn-small danger" onClick={() => { click(); setHistory([]); }}>
              <Trash2 size={15} />
              {t.history.clearAll}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

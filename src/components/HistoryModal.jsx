import React, { useState } from 'react';
import { X, Trash2, Clock, Search, ArrowRight, CornerDownLeft } from 'lucide-react';
import { speechService } from '../services/speechService';

export default function HistoryModal({ 
  isOpen, 
  onClose, 
  history, 
  setHistory, 
  onSelectHistoryItem, 
  soundEnabled 
}) {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredHistory = history.filter(item => 
    item.sourceText.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.translatedText.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const clearAllHistory = () => {
    if (soundEnabled) speechService.playClickSound();
    setHistory([]);
    localStorage.removeItem('omni_history');
  };

  const deleteSingle = (indexToDelete) => {
    if (soundEnabled) speechService.playClickSound();
    const updated = history.filter((_, idx) => idx !== indexToDelete);
    setHistory(updated);
    localStorage.setItem('omni_history', JSON.stringify(updated));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Clock size={22} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1.25rem' }}>Cronologia Traduzioni</h3>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-dim)' }} />
          <input 
            type="text" 
            placeholder="Cerca nella cronologia..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.4rem', borderRadius: '10px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', outline: 'none' }}
          />
        </div>

        {/* History List */}
        <div style={{ maxHeight: '360px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
              Nessuna traduzione registrata in cronologia.
            </div>
          ) : (
            filteredHistory.map((item, idx) => (
              <div 
                key={idx} 
                style={{ padding: '0.9rem', background: 'var(--bg-app)', borderRadius: '12px', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'border-color 0.2s ease' }}
                onClick={() => {
                  if (soundEnabled) speechService.playClickSound();
                  onSelectHistoryItem(item);
                  onClose();
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.2rem' }}>
                    <span>{item.timestamp}</span>
                    <span>•</span>
                    <strong style={{ color: '#818cf8', textTransform: 'uppercase' }}>{item.sourceLang} ➔ {item.targetLang}</strong>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{item.sourceText}</div>
                  <div style={{ fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 600, marginTop: '0.2rem' }}>{item.translatedText}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <button 
                    className="icon-btn" 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSingle(idx);
                    }}
                    title="Rimuovi voce"
                  >
                    <Trash2 size={16} style={{ color: '#ef4444' }} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {history.length > 0 && (
          <div style={{ marginTop: '1.25rem', textAlign: 'right' }}>
            <button className="btn-secondary" onClick={clearAllHistory} style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
              <Trash2 size={15} />
              Cancella Tutta la Cronologia
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

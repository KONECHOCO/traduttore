import React, { useState } from 'react';
import { X, Crown, CheckCircle2, Loader2, RotateCcw } from 'lucide-react';
import { useMonetization, buyPro, restorePro } from '../services/monetization';
import { fmt } from '../data/translations_i18n';

export default function ProModal({ isOpen, onClose, t }) {
  const { native, isPro, proPrice } = useMonetization();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  if (!isOpen) return null;

  const run = async (fn, okMsg, failMsg) => {
    setBusy(true);
    setMessage(null);
    try {
      const ok = await fn();
      setMessage(ok ? okMsg : failMsg);
    } catch (err) {
      console.warn('Pro purchase error', err);
      setMessage(t.pro.error);
    } finally {
      setBusy(false);
    }
  };

  const benefits = [t.pro.noAds, t.pro.allFeatures, t.pro.support];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content pro-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={t.pro.title}>
        <div className="pro-modal-head">
          <div className="panel-title">
            <div className="pro-icon"><Crown size={24} /></div>
            <div>
              <h2>{t.pro.title}</h2>
              <p>{t.pro.subtitle}</p>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label={t.common.close}><X size={20} /></button>
        </div>

        <ul className="pro-benefits">
          {benefits.map(b => (
            <li key={b}><CheckCircle2 size={16} /> {b}</li>
          ))}
        </ul>

        {isPro ? (
          <p className="pro-owned">{t.pro.owned}</p>
        ) : !native ? (
          <p className="pro-web">{t.pro.webOnly}</p>
        ) : (
          <>
            <button className="pro-buy" disabled={busy} onClick={() => run(buyPro, t.pro.owned, t.pro.error)}>
              {busy ? <Loader2 size={16} className="spin-icon" /> : <Crown size={16} />}
              {/* Il prezzo reale (localizzato) arriva dallo store; questo è solo il ripiego */}
              {fmt(t.pro.buy, { price: proPrice || t.pro.fallbackPrice })}
            </button>
            <p className="pro-onetime">{t.pro.oneTime}</p>
            <button className="pro-restore" disabled={busy} onClick={() => run(restorePro, t.pro.restored, t.pro.notFound)}>
              <RotateCcw size={14} />
              {t.pro.restore}
            </button>
          </>
        )}

        {message && <p style={{ fontSize: '0.85rem', textAlign: 'center', marginTop: '0.75rem' }}>{message}</p>}
      </div>
    </div>
  );
}

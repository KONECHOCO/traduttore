import React, { useState } from 'react';
import { Sparkles, HardDriveDownload, Check, Loader2, WifiOff, Radio, Camera, GraduationCap } from 'lucide-react';
import { isNative, downloadModel } from '../services/translatorService';
import { languageName } from '../data/languages';
import { fmt } from '../data/translations_i18n';

const SUGGESTED = ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ar', 'ru', 'ko', 'tr'];

/** Primo avvio: cosa fa l'app e download dei pacchetti lingua per usarla subito offline. */
export default function Onboarding({ t, uiLang, onDone }) {
  const [selected, setSelected] = useState(() => new Set([uiLang, uiLang === 'en' ? 'es' : 'en']));
  const [progress, setProgress] = useState(null); // { done, total, failed }

  const toggle = code => {
    const next = new Set(selected);
    next.has(code) ? next.delete(code) : next.add(code);
    setSelected(next);
  };

  const start = async () => {
    if (!isNative) return onDone();
    const langs = [...selected].filter(l => l !== 'en'); // l'inglese è già incluso in ML Kit
    let failed = 0;
    setProgress({ done: 0, total: langs.length, failed });
    for (let i = 0; i < langs.length; i++) {
      try {
        await downloadModel(langs[i]);
      } catch {
        failed++;
      }
      setProgress({ done: i + 1, total: langs.length, failed });
    }
    onDone();
  };

  const features = [
    { icon: WifiOff, text: t.onboarding.f1 },
    { icon: Radio, text: t.onboarding.f2 },
    { icon: Camera, text: t.onboarding.f3 },
    { icon: GraduationCap, text: t.onboarding.f4 }
  ];

  return (
    <div className="modal-overlay onboarding">
      <div className="modal-content" role="dialog" aria-modal="true" aria-label={t.onboarding.title}>
        <div className="panel-title">
          <div className="pro-icon" style={{ background: 'var(--accent-gradient)', color: '#fff' }}><Sparkles size={22} /></div>
          <h2 style={{ fontSize: '1.3rem' }}>{t.onboarding.title}</h2>
        </div>
        <ul className="pro-benefits">
          {features.map(({ icon: Icon, text }) => (
            <li key={text}><Icon size={16} /> {text}</li>
          ))}
        </ul>

        <h3 style={{ fontSize: '0.98rem', margin: '0.5rem 0' }}><HardDriveDownload size={16} style={{ verticalAlign: '-3px' }} /> {t.onboarding.chooseLangs}</h3>
        <p className="muted-text" style={{ fontSize: '0.8rem', marginBottom: '0.6rem' }}>{t.onboarding.chooseHelp}</p>
        <div className="chip-row">
          {SUGGESTED.map(code => (
            <button key={code} className={`tone-pill ${selected.has(code) ? 'active' : ''}`} onClick={() => toggle(code)} disabled={!!progress}>
              {selected.has(code) && <Check size={13} />} {languageName(code, uiLang)}
            </button>
          ))}
        </div>

        {progress && (
          <div style={{ marginTop: '1rem' }}>
            <p style={{ fontSize: '0.85rem' }}><Loader2 size={14} className="spin-icon" /> {fmt(t.onboarding.downloading, { done: progress.done, total: progress.total })}</p>
            <div className="ocr-progress-bar"><div className="ocr-progress-fill" style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 100}%` }} /></div>
          </div>
        )}

        <div className="button-row" style={{ marginTop: '1.25rem', justifyContent: 'flex-end' }}>
          <button className="btn-secondary btn-small" onClick={onDone} disabled={!!progress}>{t.onboarding.skip}</button>
          <button className="btn-primary" onClick={start} disabled={!!progress || !selected.size}>
            {isNative ? t.onboarding.download : t.onboarding.start}
          </button>
        </div>
      </div>
    </div>
  );
}

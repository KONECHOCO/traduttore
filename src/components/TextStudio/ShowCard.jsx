import React, { useState } from 'react';
import { X, RotateCw, Volume2, Minus, Plus } from 'lucide-react';
import { speechService } from '../../services/speechService';
import { getLanguageByCode, languageName } from '../../data/languages';

/** La traduzione a tutto schermo e a caratteri grandi, da mostrare a chi si ha davanti (anche capovolta). */
export default function ShowCard({ text, original, lang, uiLang, t, onClose }) {
  const [flipped, setFlipped] = useState(false);
  const [scale, setScale] = useState(1);

  return (
    <div className="show-card" role="dialog" aria-modal="true" aria-label={t.textStudio.showFull}>
      <div className="show-card-tools">
        <button className="icon-btn" onClick={() => setScale(s => Math.max(0.6, s - 0.15))} aria-label="-"><Minus size={20} /></button>
        <button className="icon-btn" onClick={() => setScale(s => Math.min(2, s + 0.15))} aria-label="+"><Plus size={20} /></button>
        <button className="icon-btn" onClick={() => speechService.speakText(text, getLanguageByCode(lang).voice)} aria-label={t.textStudio.listenVoice}><Volume2 size={20} /></button>
        <button className="icon-btn" onClick={() => setFlipped(!flipped)} aria-label={t.liveConv.flipScreen}><RotateCw size={20} /></button>
        <button className="icon-btn" onClick={onClose} aria-label={t.common.close}><X size={22} /></button>
      </div>
      <div className={`show-card-body ${flipped ? 'flipped' : ''}`} onClick={onClose}>
        <div className="show-card-lang">{languageName(lang, uiLang)}</div>
        <div className="show-card-text" dir="auto" style={{ fontSize: `calc(${scale} * clamp(1.8rem, 7vw, 4.5rem))` }}>{text}</div>
        {original && <div className="show-card-original" dir="auto">{original}</div>}
      </div>
    </div>
  );
}

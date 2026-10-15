import React, { useEffect, useRef, useState } from 'react';
import { LogIn, LogOut, Radio, Volume2, VolumeX, Download, AlertCircle } from 'lucide-react';
import { joinRoom, parseRoomCode } from '../../services/liveRoom';
import { translateText, translationErrorMessage } from '../../services/translatorService';
import { speechService } from '../../services/speechService';
import { exportTextFile } from '../../services/fileExport';
import { getLanguageByCode, languageName } from '../../data/languages';
import { fmt } from '../../data/translations_i18n';
import LanguageSelect from '../LanguageSelect';

/** Pubblico di una conferenza: riceve le frasi del relatore e le traduce sul telefono nella propria lingua. */
export default function JoinRoom({ t, uiLang, glossary, initialCode, soundEnabled }) {
  const [codeInput, setCodeInput] = useState(initialCode || '');
  const [myLang, setMyLang] = useState(uiLang);
  const [room, setRoom] = useState(null); // { code, lang, title, live }
  const [state, setState] = useState('idle');
  const [lines, setLines] = useState([]);
  const [partial, setPartial] = useState('');
  const [speak, setSpeak] = useState(false);
  const [error, setError] = useState(null);
  const connRef = useRef(null);
  const settingsRef = useRef({ myLang, speak, glossary });
  useEffect(() => {
    settingsRef.current = { myLang, speak, glossary };
  }, [myLang, speak, glossary]);

  const translateLine = async (line, sourceLang) => {
    const { myLang: target, speak: doSpeak, glossary: g } = settingsRef.current;
    try {
      const { translatedText } = sourceLang === target
        ? { translatedText: line.text }
        : await translateText({ text: line.text, sourceLang, targetLang: target, glossary: g });
      setLines(prev => prev.map(l => (l.id === line.id ? { ...l, translated: translatedText } : l)));
      if (doSpeak) speechService.speakText(translatedText, getLanguageByCode(target).voice);
    } catch (err) {
      setError(translationErrorMessage(err, t));
    }
  };

  const join = (code) => {
    const clean = parseRoomCode(code);
    if (!clean) {
      setError(t.liveRoom.badCode);
      return;
    }
    if (soundEnabled) speechService.playClickSound();
    setError(null);
    setLines([]);
    setPartial('');
    connRef.current?.leave();
    let sourceLang = 'en';
    connRef.current = joinRoom(clean, {
      onState: s => setState(s),
      onHello: hello => {
        sourceLang = hello.lang.split('-')[0];
        setRoom({ code: clean, lang: sourceLang, title: hello.title, live: hello.live });
        const history = hello.history.map(l => ({ id: l.id, text: l.text, t: l.t, translated: '' }));
        setLines(history.slice().reverse());
        history.forEach(l => translateLine(l, sourceLang));
      },
      onLine: line => {
        if (!line.final) {
          setPartial(line.text);
          return;
        }
        setPartial('');
        const entry = { id: line.id, text: line.text, t: line.t, translated: '' };
        setLines(prev => [entry, ...prev.filter(l => l.id !== line.id)].slice(0, 300));
        translateLine(entry, sourceLang);
      },
      onStatus: s => setRoom(r => (r ? { ...r, live: s.live, ended: s.ended } : r))
    });
  };

  useEffect(() => {
    if (initialCode) join(initialCode);
    return () => connRef.current?.leave();
  }, [initialCode]); // eslint-disable-line react-hooks/exhaustive-deps

  const leave = () => {
    connRef.current?.leave();
    connRef.current = null;
    setRoom(null);
    setState('idle');
    speechService.stopSpeaking();
  };

  const exportTXT = () => {
    const content = lines
      .slice()
      .reverse()
      .map(l => `[${new Date(l.t).toLocaleTimeString(uiLang)}]\n${l.text}\n→ ${l.translated}\n`)
      .join('\n');
    exportTextFile(`omnilingo-live-${room?.code || 'room'}.txt`, content);
  };

  if (!room) {
    return (
      <div className="glass-panel join-panel">
        <h3><LogIn size={18} /> {t.liveRoom.joinTitle}</h3>
        <p className="muted-text" style={{ fontSize: '0.85rem' }}>{t.liveRoom.joinHelp}</p>
        <div className="lang-row" style={{ marginTop: '1rem' }}>
          <label className="field-label">
            {t.liveRoom.code}
            <input
              className="text-input code-input"
              value={codeInput}
              maxLength={60}
              placeholder="ABC234"
              onChange={e => setCodeInput(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && join(codeInput)}
              autoCapitalize="characters"
              autoCorrect="off"
            />
          </label>
          <label className="field-label">
            {t.liveRoom.myLanguage}
            <LanguageSelect value={myLang} onChange={setMyLang} uiLang={uiLang} />
          </label>
          <button className="btn-primary" onClick={() => join(codeInput)} disabled={state === 'connecting'}>
            <LogIn size={16} /> {t.liveRoom.join}
          </button>
        </div>
        {state === 'notfound' && <div className="alert-box"><AlertCircle size={16} /> {t.liveRoom.notFound}</div>}
        {error && <div className="alert-box"><AlertCircle size={16} /> {error}</div>}
      </div>
    );
  }

  return (
    <div>
      <div className="glass-panel conf-controls">
        <div style={{ flex: '1 1 220px', minWidth: 0 }}>
          <strong style={{ display: 'block' }}>{room.title || fmt(t.liveRoom.roomLabel, { code: room.code })}</strong>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            {fmt(t.liveRoom.speakerSpeaks, { lang: languageName(room.lang, uiLang, true) })}
          </div>
        </div>
        <div className="button-row">
          <label className="field-label inline">
            {t.liveRoom.myLanguage}
            <LanguageSelect value={myLang} onChange={setMyLang} uiLang={uiLang} />
          </label>
          <button className="btn-secondary btn-small" onClick={() => setSpeak(!speak)}>
            {speak ? <Volume2 size={15} /> : <VolumeX size={15} />} {speak ? t.liveConv.autoSpeakOn : t.liveConv.autoSpeakOff}
          </button>
          <button className="btn-secondary btn-small" onClick={exportTXT} disabled={!lines.length}>
            <Download size={15} /> {t.liveConv.exportText}
          </button>
          <button className="btn-secondary btn-small danger" onClick={leave}>
            <LogOut size={15} /> {t.liveRoom.leave}
          </button>
        </div>
      </div>

      {error && <div className="alert-box"><AlertCircle size={16} /> {error}</div>}

      <div className="conference-teleprompter">
        <div className={`live-indicator ${room.live && state === 'connected' ? 'on' : ''}`}>
          <Radio size={16} />
          <span>{state !== 'connected' ? t.liveRoom.reconnecting : room.ended ? t.liveRoom.ended : room.live ? t.liveConv.liveOn : t.liveRoom.waitingSpeaker}</span>
        </div>
        <div className="teleprompter-text" dir="auto">{lines[0]?.translated || lines[0]?.text || t.liveRoom.waitingFirst}</div>
        {partial && <div className="teleprompter-original" dir="auto">{partial}</div>}
      </div>

      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div className="rolling-transcript">
          {lines.map(l => (
            <div key={l.id} className="transcript-line" dir="auto">
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{new Date(l.t).toLocaleTimeString(uiLang)}</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 500 }}>{l.translated || '…'}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{l.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

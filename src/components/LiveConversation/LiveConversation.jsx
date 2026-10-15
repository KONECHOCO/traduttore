import React, { useState, useEffect, useRef } from 'react';
import { Mic, RotateCw, Volume2, VolumeX, Download, Trash2, Radio, Users, Presentation, Play, Square, AlertCircle, QrCode, Share2, LogIn, StopCircle } from 'lucide-react';
import QRCode from 'qrcode';
import { Share } from '@capacitor/share';
import { hostRoom, newRoomCode, roomViewerUrl } from '../../services/liveRoom';
import JoinRoom from './JoinRoom';
import { getLanguageByCode, languageName } from '../../data/languages';
import { translateText, translationErrorMessage } from '../../services/translatorService';
import { speechService } from '../../services/speechService';
import { exportTextFile } from '../../services/fileExport';
import { fmt } from '../../data/translations_i18n';
import LanguageSelect from '../LanguageSelect';

const speechErrorKey = code => (code === 'permission' ? 'MIC_PERMISSION' : code === 'unsupported' ? 'SPEECH_UNSUPPORTED' : 'SPEECH_FAILED');

function srtTime(ms) {
  const total = Math.max(0, Math.round(ms));
  const h = String(Math.floor(total / 3600000)).padStart(2, '0');
  const m = String(Math.floor((total % 3600000) / 60000)).padStart(2, '0');
  const s = String(Math.floor((total % 60000) / 1000)).padStart(2, '0');
  const msPart = String(total % 1000).padStart(3, '0');
  return `${h}:${m}:${s},${msPart}`;
}

export default function LiveConversation({ t, uiLang, soundEnabled, glossary, joinCode }) {
  const [liveMode, setLiveMode] = useState(joinCode ? 'join' : 'split');
  const [error, setError] = useState(null);

  // ---------- Faccia a faccia ----------
  const [langA, setLangA] = useState(uiLang === 'en' ? 'es' : uiLang);
  const [langB, setLangB] = useState(uiLang === 'en' ? 'fr' : 'en');
  const [listening, setListening] = useState(null); // 'A' | 'B' | null
  const [interim, setInterim] = useState('');
  const [turns, setTurns] = useState([]);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [flippedB, setFlippedB] = useState(true);

  // ---------- Conferenza ----------
  const [confActive, setConfActive] = useState(false);
  const [confSource, setConfSource] = useState(uiLang);
  const [confTarget, setConfTarget] = useState(uiLang === 'en' ? 'es' : 'en');
  const [liveOriginal, setLiveOriginal] = useState('');
  const [liveSubtitle, setLiveSubtitle] = useState('');
  const [transcript, setTranscript] = useState([]);
  const confRef = useRef({ active: false, sessionStart: 0, segmentStart: 0 });

  // ---------- Condivisione con il pubblico (stanza con QR) ----------
  const roomRef = useRef(null);
  const [share, setShare] = useState(null); // { code, url, qr, audience, state }

  useEffect(() => {
    if (joinCode) setLiveMode('join');
  }, [joinCode]);

  // le lingue si leggono dal ref: la sessione si riavvia da sola e non deve usare valori vecchi
  useEffect(() => {
    confRef.current.source = confSource;
    confRef.current.target = confTarget;
  }, [confSource, confTarget]);

  useEffect(() => () => {
    roomRef.current?.end();
    confRef.current.active = false;
    speechService.stopListening();
    speechService.stopSpeaking();
  }, []);

  const click = () => {
    if (soundEnabled) speechService.playClickSound();
  };

  const toggleSpeaker = async (who) => {
    setError(null);
    if (listening === who) {
      await speechService.stopListening();
      return;
    }
    speechService.stopSpeaking();
    const from = who === 'A' ? langA : langB;
    const to = who === 'A' ? langB : langA;
    const started = await speechService.startListening({
      lang: getLanguageByCode(from).voice,
      onPartial: text => setInterim(text),
      onFinal: async text => {
        setInterim('');
        const id = Date.now();
        setTurns(prev => [{ id, who, original: text, translated: '', from, to }, ...prev]);
        try {
          const { translatedText } = await translateText({ text, sourceLang: from, targetLang: to, glossary });
          setTurns(prev => prev.map(turn => (turn.id === id ? { ...turn, translated: translatedText } : turn)));
          if (autoSpeak) speechService.speakText(translatedText, getLanguageByCode(to).voice);
        } catch (err) {
          setTurns(prev => prev.map(turn => (turn.id === id ? { ...turn, translated: '', failed: true } : turn)));
          setError(translationErrorMessage(err, t));
        }
      },
      onEnd: () => {
        setListening(null);
        setInterim('');
      },
      onError: code => {
        setListening(null);
        setError(t.errors[speechErrorKey(code)]);
      }
    });
    if (started) setListening(who);
  };

  // Ultimo messaggio rivolto a ciascuna persona (tradotto nella sua lingua)
  const lastFor = who => turns.find(turn => turn.who !== who);

  // ---------- Conferenza: ascolto continuo con riavvio automatico ----------
  const listenConference = async () => {
    const conf = confRef.current;
    if (!conf.active) return;
    const started = await speechService.startListening({
      lang: getLanguageByCode(conf.source).voice,
      onPartial: text => {
        if (!conf.segmentStart) {
          conf.segmentStart = Date.now();
          conf.segmentId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        }
        setLiveOriginal(text);
        roomRef.current?.sendLine(conf.segmentId, text, false);
      },
      onFinal: async text => {
        const start = (conf.segmentStart || Date.now()) - conf.sessionStart;
        const end = Date.now() - conf.sessionStart;
        const id = conf.segmentId || `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        conf.segmentStart = 0;
        conf.segmentId = null;
        roomRef.current?.sendLine(id, text, true);
        setTranscript(prev => [...prev, { id, start, end, clock: new Date().toLocaleTimeString(uiLang), original: text, translated: '' }]);
        try {
          const { translatedText } = await translateText({ text, sourceLang: conf.source, targetLang: conf.target, glossary });
          setLiveSubtitle(translatedText);
          setTranscript(prev => prev.map(line => (line.id === id ? { ...line, translated: translatedText } : line)));
        } catch (err) {
          setError(translationErrorMessage(err, t));
        }
      },
      onEnd: () => {
        // il riconoscimento vocale si ferma dopo ogni frase o pausa: si riparte finché la sessione è attiva
        if (confRef.current.active) setTimeout(() => confRef.current.active && listenConference(), 250);
      },
      onError: code => {
        if (code === 'failed' && confRef.current.active) return; // errore temporaneo: riprova onEnd
        confRef.current.active = false;
        setConfActive(false);
        setError(t.errors[speechErrorKey(code)]);
      }
    });
    if (!started && !confRef.current.active) setConfActive(false);
  };

  const toggleConference = async () => {
    click();
    setError(null);
    if (confActive) {
      confRef.current.active = false;
      setConfActive(false);
      await speechService.stopListening();
      return;
    }
    confRef.current = {
      active: true,
      sessionStart: confRef.current.sessionStart && transcript.length ? confRef.current.sessionStart : Date.now(),
      segmentStart: 0,
      source: confSource,
      target: confTarget
    };
    setConfActive(true);
    listenConference();
  };

  const startSharing = async () => {
    click();
    const code = newRoomCode();
    const url = roomViewerUrl(code);
    const qr = await QRCode.toDataURL(url, { margin: 1, width: 360, color: { dark: '#0f172a', light: '#ffffff' } });
    setShare({ code, url, qr, audience: 0, state: 'connecting' });
    roomRef.current = hostRoom({
      code,
      lang: confSource,
      handlers: {
        onAudience: n => setShare(sh => (sh ? { ...sh, audience: n } : sh)),
        onState: st => setShare(sh => (sh ? { ...sh, state: st } : sh))
      }
    });
  };

  const stopSharing = () => {
    click();
    roomRef.current?.end();
    roomRef.current = null;
    setShare(null);
  };

  const shareLink = async () => {
    try {
      await Share.share({ title: 'OmniLingo Live', text: fmt(t.liveRoom.shareText, { code: share.code }), url: share.url });
    } catch {
      // condivisione annullata
    }
  };

  const exportTXT = () => {
    click();
    const content = transcript
      .map(line => `[${line.clock}]\n${line.original}\n→ ${line.translated}\n`)
      .join('\n');
    exportTextFile(`transcript-${new Date().toISOString().slice(0, 10)}.txt`, content);
  };

  const exportSRT = () => {
    click();
    const srt = transcript
      .filter(line => line.translated)
      .map((line, idx) => `${idx + 1}\n${srtTime(line.start)} --> ${srtTime(Math.max(line.end, line.start + 1500))}\n${line.translated}\n`)
      .join('\n');
    exportTextFile(`subtitles-${confTarget}-${new Date().toISOString().slice(0, 10)}.srt`, srt, 'application/x-subrip');
  };

  const renderSpeaker = (who) => {
    const lang = who === 'A' ? langA : langB;
    const setLang = who === 'A' ? setLangA : setLangB;
    const incoming = lastFor(who);
    const isListening = listening === who;
    const color = who === 'A' ? '#818cf8' : '#22d3ee';
    return (
      <div className={`speaker-card ${who === 'B' && flippedB ? 'flipped' : ''}`}>
        <div className="speaker-header">
          <div className="speaker-badge">
            <span style={{ color }}>● {who === 'A' ? t.liveConv.personA : t.liveConv.personB}</span>
            <LanguageSelect value={lang} onChange={setLang} uiLang={uiLang} ariaLabel={t.liveConv.language} />
          </div>
          <button
            className="icon-btn"
            onClick={() => incoming?.translated && speechService.speakText(incoming.translated, getLanguageByCode(lang).voice)}
            disabled={!incoming?.translated}
            aria-label={t.textStudio.listenVoice}
          >
            <Volume2 size={18} />
          </button>
        </div>

        <div className="speaker-speech-bubble" dir="auto">
          {isListening ? (
            <span style={{ color: 'var(--text-muted)' }}>{interim || t.liveConv.listening}</span>
          ) : incoming ? (
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.2rem' }}>
                {fmt(t.liveConv.translatedFrom, { lang: languageName(incoming.from, uiLang, true) })}
              </div>
              <span style={{ color, fontWeight: 600 }}>{incoming.translated || (incoming.failed ? '—' : '…')}</span>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.3rem' }}>“{incoming.original}”</div>
            </div>
          ) : (
            <span style={{ color: 'var(--text-dim)', fontSize: '1rem' }}>{fmt(t.liveConv.tapToSpeak, { lang: languageName(lang, uiLang, true) })}</span>
          )}
        </div>

        <button
          className={`mic-action-btn ${isListening ? 'active' : ''}`}
          onClick={() => toggleSpeaker(who)}
          aria-label={isListening ? t.liveConv.stopListening : t.liveConv.pressToSpeak}
          id={`mic-speaker-${who.toLowerCase()}`}
        >
          <Mic size={26} />
        </button>
      </div>
    );
  };

  return (
    <div className="live-conversation-container">
      <div className="live-header-bar">
        <div className="mode-toggle-pill">
          <button className={`mode-toggle-btn ${liveMode === 'split' ? 'active' : ''}`} onClick={() => { click(); setLiveMode('split'); }} id="btn-mode-split">
            <Users size={16} />
            {t.liveConv.modeSplit}
          </button>
          <button className={`mode-toggle-btn ${liveMode === 'conference' ? 'active' : ''}`} onClick={() => { click(); setLiveMode('conference'); }} id="btn-mode-conference">
            <Presentation size={16} />
            {t.liveConv.modeConf}
          </button>
          <button className={`mode-toggle-btn ${liveMode === 'join' ? 'active' : ''}`} onClick={() => { click(); setLiveMode('join'); }} id="btn-mode-join">
            <LogIn size={16} />
            {t.liveRoom.modeJoin}
          </button>
        </div>

        {liveMode === 'split' ? (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button className="btn-secondary btn-small" onClick={() => { click(); setAutoSpeak(!autoSpeak); }}>
              {autoSpeak ? <Volume2 size={15} /> : <VolumeX size={15} />}
              {autoSpeak ? t.liveConv.autoSpeakOn : t.liveConv.autoSpeakOff}
            </button>
            <button className="btn-secondary btn-small" onClick={() => { click(); setFlippedB(!flippedB); }}>
              <RotateCw size={15} />
              {t.liveConv.flipScreen}
            </button>
          </div>
        ) : liveMode === 'join' ? null : (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button className="btn-secondary btn-small" onClick={exportSRT} disabled={!transcript.length}>
              <Download size={15} />
              {t.liveConv.exportSubtitles}
            </button>
            <button className="btn-secondary btn-small" onClick={exportTXT} disabled={!transcript.length}>
              <Download size={15} />
              {t.liveConv.exportText}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="alert-box">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {liveMode === 'split' && (
        <>
          <div className="split-face-container">
            {renderSpeaker('B')}
            {renderSpeaker('A')}
          </div>
          {turns.length > 0 && (
            <div className="glass-panel" style={{ padding: '1.25rem', marginTop: '1.25rem' }}>
              <div className="panel-title" style={{ justifyContent: 'space-between' }}>
                <h4>{t.liveConv.conversationLog} ({turns.length})</h4>
                <button className="icon-btn" onClick={() => setTurns([])} aria-label={t.liveConv.clearHistory}>
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="rolling-transcript">
                {turns.map(turn => (
                  <div key={turn.id} className="transcript-line" dir="auto">
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontSize: '0.8rem', color: turn.who === 'A' ? '#818cf8' : '#22d3ee' }}>
                        {turn.who === 'A' ? t.liveConv.personA : t.liveConv.personB}
                      </strong>
                      <div style={{ fontSize: '0.95rem' }}>{turn.translated || '…'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{turn.original}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {liveMode === 'join' && <JoinRoom t={t} uiLang={uiLang} glossary={glossary} initialCode={joinCode} soundEnabled={soundEnabled} />}

      {liveMode === 'conference' && (
        <div>
          <div className="glass-panel conf-controls">
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', flexWrap: 'wrap' }}>
              <label className="field-label">
                {t.liveConv.speakerLang}
                <LanguageSelect value={confSource} onChange={setConfSource} uiLang={uiLang} />
              </label>
              <label className="field-label">
                {t.liveConv.subtitleLang}
                <LanguageSelect value={confTarget} onChange={setConfTarget} uiLang={uiLang} />
              </label>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                className="btn-primary"
                style={{ background: confActive ? 'var(--danger)' : 'var(--accent-gradient)' }}
                onClick={toggleConference}
                id="btn-toggle-conference"
              >
                {confActive ? <Square size={18} /> : <Play size={18} />}
                {confActive ? t.liveConv.stopListening : t.liveConv.startListening}
              </button>
              <button
                className="icon-btn"
                onClick={() => {
                  setTranscript([]);
                  setLiveSubtitle('');
                  setLiveOriginal('');
                  confRef.current.sessionStart = Date.now();
                }}
                aria-label={t.liveConv.clearHistory}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          <div className="glass-panel share-panel">
            {!share ? (
              <div className="share-intro">
                <div>
                  <strong><QrCode size={16} /> {t.liveRoom.shareTitle}</strong>
                  <p className="muted-text" style={{ fontSize: '0.82rem' }}>{t.liveRoom.shareHelp}</p>
                </div>
                <button className="btn-primary btn-small" onClick={startSharing} id="btn-share-room">
                  <QrCode size={15} /> {t.liveRoom.startShare}
                </button>
              </div>
            ) : (
              <div className="share-active">
                <img src={share.qr} alt={share.url} className="share-qr" />
                <div className="share-info">
                  <div className="muted-text" style={{ fontSize: '0.8rem' }}>{t.liveRoom.code}</div>
                  <div className="share-code">{share.code}</div>
                  <div className="muted-text" style={{ fontSize: '0.8rem', wordBreak: 'break-all' }}>{share.url}</div>
                  <div style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}>
                    <Users size={15} style={{ verticalAlign: '-2px' }} /> {fmt(t.liveRoom.audience, { n: share.audience })}
                    {share.state !== 'live' && <span className="muted-text"> · {share.state === 'error' ? t.liveRoom.shareError : t.liveRoom.reconnecting}</span>}
                  </div>
                  <p className="muted-text" style={{ fontSize: '0.78rem' }}>{t.liveRoom.shareHint}</p>
                  <div className="button-row">
                    <button className="btn-secondary btn-small" onClick={shareLink}><Share2 size={15} /> {t.common.share}</button>
                    <button className="btn-secondary btn-small danger" onClick={stopSharing}><StopCircle size={15} /> {t.liveRoom.stopShare}</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="conference-teleprompter">
            <div className={`live-indicator ${confActive ? 'on' : ''}`}>
              <Radio size={16} />
              <span>{confActive ? t.liveConv.liveOn : t.liveConv.liveOff}</span>
            </div>
            <div className="teleprompter-text" dir="auto">{liveSubtitle || t.liveConv.subtitlesPlaceholder}</div>
            {liveOriginal && <div className="teleprompter-original" dir="auto">{liveOriginal}</div>}
          </div>
          <p className="muted-text" style={{ fontSize: '0.8rem', marginBottom: '1rem' }}>{t.liveConv.conferenceHint}</p>

          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div className="panel-title">
              <Presentation size={18} style={{ color: 'var(--primary)' }} />
              <h4>{t.liveConv.transcriptTitle} ({transcript.length})</h4>
            </div>
            <div className="rolling-transcript">
              {transcript.length === 0 && <div className="empty-state">{t.liveConv.transcriptEmpty}</div>}
              {[...transcript].reverse().map(line => (
                <div key={line.id} className="transcript-line" dir="auto">
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{line.clock}</span>
                    <div style={{ fontSize: '0.95rem', fontWeight: 500 }}>{line.translated || '…'}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{line.original}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

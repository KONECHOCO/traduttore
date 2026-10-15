import React, { useEffect, useState, useCallback } from 'react';
import { Settings, Globe, Moon, Sun, Volume2, VolumeX, Download, Upload, RefreshCw, HardDriveDownload, Trash2, Loader2, Crown, ShieldCheck, Mail, CheckCircle2 } from 'lucide-react';
import { speechService } from '../../services/speechService';
import { isNative, getDownloadedModels, downloadModel, deleteModel } from '../../services/translatorService';
import { exportTextFile } from '../../services/fileExport';
import { useMonetization, showPrivacyOptions } from '../../services/monetization';
import { languageName } from '../../data/languages';
import { UI_LANGUAGES, fmt } from '../../data/translations_i18n';
import { PRIVACY_URL, SUPPORT_EMAIL, APP_VERSION } from '../../config';
import LanguageSelect from '../LanguageSelect';
import { useProgress, setGoal, setReminder } from '../../services/progress';
import { Bell, GraduationCap } from 'lucide-react';

function StudySettings({ t }) {
  const progress = useProgress();
  const [time, setTime] = useState(progress.reminder || '19:00');
  const [msg, setMsg] = useState(null);

  const apply = async (value) => {
    setMsg(null);
    try {
      await setReminder(value, { title: t.settings.reminderTitle, body: t.settings.reminderBody });
    } catch {
      setMsg(t.settings.reminderDenied);
    }
  };

  return (
    <section className="settings-section">
      <h3><GraduationCap size={18} style={{ color: '#f97316' }} /> {t.settings.study}</h3>
      <div className="button-row">
        <label className="field-label inline">
          {t.settings.goalLabel}
          <select className="lang-selector-select" value={progress.goal} onChange={e => setGoal(Number(e.target.value))}>
            {[5, 10, 20, 30, 50].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
      </div>
      <div className="button-row" style={{ marginTop: '0.75rem' }}>
        <Bell size={16} />
        <span style={{ fontSize: '0.9rem' }}>{t.settings.reminder}</span>
        <input type="time" className="text-input" value={time} onChange={e => setTime(e.target.value)} style={{ width: '7.5rem', padding: '0.4rem 0.6rem' }} />
        <button className={`btn-secondary btn-small ${progress.reminder ? 'selected' : ''}`} onClick={() => apply(progress.reminder === time ? null : time)}>
          {progress.reminder && progress.reminder === time ? t.common.on : t.common.off}
        </button>
      </div>
      {msg && <p className="error-text" style={{ fontSize: '0.8rem', marginTop: '0.4rem' }}>{msg}</p>}
    </section>
  );
}

function OfflinePacks({ t, uiLang }) {
  const [models, setModels] = useState(null);
  const [busy, setBusy] = useState(null);
  const [toAdd, setToAdd] = useState(uiLang === 'en' ? 'es' : uiLang);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      setModels(await getDownloadedModels());
    } catch {
      setModels([]);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const run = async (lang, fn) => {
    setBusy(lang);
    setError(null);
    try {
      await fn(lang);
      await refresh();
    } catch {
      setError(t.errors.MODEL_DOWNLOAD_FAILED);
    } finally {
      setBusy(null);
    }
  };

  if (!isNative) return <p className="muted-text" style={{ fontSize: '0.85rem' }}>{t.settings.packsWebOnly}</p>;

  return (
    <div>
      <p className="muted-text" style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>{t.settings.packsHelp}</p>
      <div className="button-row">
        <LanguageSelect value={toAdd} onChange={setToAdd} uiLang={uiLang} />
        <button className="btn-primary btn-small" disabled={!!busy || models?.includes(toAdd)} onClick={() => run(toAdd, downloadModel)}>
          {busy === toAdd ? <Loader2 size={15} className="spin-icon" /> : <HardDriveDownload size={15} />}
          {models?.includes(toAdd) ? t.settings.packInstalled : t.settings.downloadPack}
        </button>
      </div>
      {error && <p className="error-text" style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>{error}</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.75rem' }}>
        {models === null ? (
          <Loader2 size={16} className="spin-icon" />
        ) : (
          models.map(code => (
            <div key={code} className="list-row">
              <span>
                <CheckCircle2 size={14} style={{ color: 'var(--success)', verticalAlign: '-2px' }} /> {languageName(code, uiLang)}
              </span>
              {code !== 'en' && (
                <button className="icon-btn" disabled={!!busy} onClick={() => run(code, deleteModel)} aria-label={t.common.delete}>
                  {busy === code ? <Loader2 size={15} className="spin-icon" /> : <Trash2 size={15} style={{ color: 'var(--danger)' }} />}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function SettingsModal({
  uiLang,
  setUiLang,
  theme,
  setTheme,
  soundEnabled,
  setSoundEnabled,
  flashcards,
  setFlashcards,
  glossary,
  setGlossary,
  history,
  setHistory,
  onOpenPro,
  t
}) {
  const { isPro, privacyOptionsRequired } = useMonetization();
  const [notice, setNotice] = useState(null);

  const handleExportBackup = () => {
    if (soundEnabled) speechService.playClickSound();
    const data = { app: 'omnilingo', version: 1, exportDate: new Date().toISOString(), flashcards, glossary, history };
    exportTextFile(`omnilingo-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(data, null, 2), 'application/json');
  };

  const handleImportBackup = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (Array.isArray(parsed.flashcards)) setFlashcards(parsed.flashcards);
      if (Array.isArray(parsed.glossary)) setGlossary(parsed.glossary);
      if (Array.isArray(parsed.history)) setHistory(parsed.history);
      setNotice(t.settings.backupRestored);
    } catch {
      setNotice(t.settings.backupInvalid);
    }
  };

  const handleResetData = () => {
    if (window.confirm(t.settings.resetConfirm)) {
      ['omni_flashcards', 'omni_glossary', 'omni_history'].forEach(k => localStorage.removeItem(k));
      setFlashcards([]);
      setGlossary([]);
      setHistory([]);
      setNotice(t.settings.resetDone);
    }
  };

  return (
    <div className="glass-panel settings-panel">
      <div className="settings-head">
        <Settings size={26} style={{ color: 'var(--primary)' }} />
        <h2>{t.settings.title}</h2>
      </div>

      <section className="settings-section pro-section">
        <div>
          <strong><Crown size={16} style={{ color: '#f59e0b', verticalAlign: '-2px' }} /> {t.pro.title}</strong>
          <p className="muted-text" style={{ fontSize: '0.85rem' }}>{isPro ? t.pro.owned : t.pro.subtitle}</p>
        </div>
        {!isPro && (
          <button className="btn-primary btn-small pro-cta" onClick={onOpenPro}>
            <Crown size={15} /> {t.pro.removeAds}
          </button>
        )}
      </section>

      <section className="settings-section">
        <h3><HardDriveDownload size={18} style={{ color: '#818cf8' }} /> {t.settings.offlinePacks}</h3>
        <OfflinePacks t={t} uiLang={uiLang} />
      </section>

      <section className="settings-section">
        <h3><Globe size={18} style={{ color: '#22d3ee' }} /> {t.settings.interfaceLang}</h3>
        <select className="lang-selector-select" value={uiLang} onChange={e => setUiLang(e.target.value)} style={{ width: '100%', maxWidth: '320px', padding: '0.65rem 1rem' }}>
          {UI_LANGUAGES.map(l => (
            <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
          ))}
        </select>
      </section>

      <section className="settings-section settings-grid">
        <div>
          <h3>{t.settings.theme}</h3>
          <div className="button-row">
            <button className={`btn-secondary ${theme === 'dark' ? 'selected' : ''}`} onClick={() => setTheme('dark')}>
              <Moon size={16} /> {t.settings.themeDark}
            </button>
            <button className={`btn-secondary ${theme === 'light' ? 'selected' : ''}`} onClick={() => setTheme('light')}>
              <Sun size={16} /> {t.settings.themeLight}
            </button>
          </div>
        </div>
        <div>
          <h3>{t.settings.audioFeedback}</h3>
          <button
            className={`btn-secondary ${soundEnabled ? 'selected' : ''}`}
            onClick={() => {
              speechService.playClickSound();
              setSoundEnabled(!soundEnabled);
            }}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            {soundEnabled ? t.common.on : t.common.off}
          </button>
        </div>
      </section>

      <StudySettings t={t} />

      <section className="settings-section">
        <h3>{t.settings.data}</h3>
        <p className="muted-text" style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>
          {fmt(t.settings.dataSummary, { cards: flashcards.length, terms: glossary.length, history: history.length })}
        </p>
        <div className="button-row">
          <button className="btn-secondary btn-small" onClick={handleExportBackup}>
            <Download size={15} /> {t.settings.exportData}
          </button>
          <label className="btn-secondary btn-small">
            <Upload size={15} /> {t.settings.importData}
            <input type="file" accept=".json,application/json" style={{ display: 'none' }} onChange={handleImportBackup} />
          </label>
          <button className="btn-secondary btn-small danger" onClick={handleResetData}>
            <RefreshCw size={15} /> {t.settings.clearData}
          </button>
        </div>
        {notice && <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: 'var(--secondary)' }}>{notice}</p>}
      </section>

      <section className="settings-section">
        <h3><ShieldCheck size={18} style={{ color: 'var(--success)' }} /> {t.settings.privacyTitle}</h3>
        <p className="muted-text" style={{ fontSize: '0.85rem' }}>{t.settings.privacyText}</p>
        <p className="muted-text" style={{ fontSize: '0.85rem', marginTop: '0.4rem' }}>{t.settings.privacyShare}</p>
        <div className="button-row" style={{ marginTop: '0.75rem' }}>
          <a className="btn-secondary btn-small" href={PRIVACY_URL} target="_blank" rel="noreferrer">
            <ShieldCheck size={15} /> {t.settings.privacyPolicy}
          </a>
          {privacyOptionsRequired && !isPro && (
            <button className="btn-secondary btn-small" onClick={() => showPrivacyOptions().catch(() => {})}>
              <ShieldCheck size={15} /> {t.settings.adConsent}
            </button>
          )}
          <a className="btn-secondary btn-small" href={`mailto:${SUPPORT_EMAIL}`}>
            <Mail size={15} /> {t.settings.support}
          </a>
        </div>
      </section>

      <p className="settings-footer">
        OmniLingo {APP_VERSION} · {t.settings.credits}
      </p>
    </div>
  );
}

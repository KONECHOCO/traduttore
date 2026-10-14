import React from 'react';
import { 
  Settings, 
  Cpu, 
  Key, 
  Globe, 
  Moon, 
  Sun, 
  Volume2, 
  Download, 
  Upload, 
  RefreshCw, 
  ShieldCheck 
} from 'lucide-react';
import { speechService } from '../../services/speechService';

export default function SettingsModal({
  engine,
  setEngine,
  apiKey,
  setApiKey,
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
  t
}) {
  // Export all user data as JSON backup
  const handleExportBackup = () => {
    if (soundEnabled) speechService.playClickSound();
    const data = {
      version: '2.5',
      exportDate: new Date().toISOString(),
      flashcards,
      glossary,
      uiLang,
      engine
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omnilingo-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  // Import backup file
  const handleImportBackup = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.flashcards) {
          setFlashcards(parsed.flashcards);
          localStorage.setItem('omni_flashcards', JSON.stringify(parsed.flashcards));
        }
        if (parsed.glossary) {
          setGlossary(parsed.glossary);
          localStorage.setItem('omni_glossary', JSON.stringify(parsed.glossary));
        }
        if (parsed.uiLang) {
          setUiLang(parsed.uiLang);
        }
        alert('Backup ripristinato con successo!');
      } catch (err) {
        alert('File di backup non valido.');
      }
    };
    reader.readAsText(file);
  };

  // Reset all data
  const handleResetData = () => {
    if (window.confirm('Sei sicuro di voler ripristinare tutti i dati e le preferenze ai valori iniziali?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
        <Settings size={26} style={{ color: 'var(--primary)' }} />
        <div>
          <h2 style={{ fontSize: '1.4rem' }}>{t.settings.title}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Personalizza l'architettura di traduzione, privacy e aspetto visivo.</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Translation Engine Section */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.75rem', color: 'var(--text-main)' }}>
            <Cpu size={18} style={{ color: '#818cf8' }} />
            {t.settings.engine}
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
            <button
              className={`btn-secondary ${engine === 'neural' ? 'active' : ''}`}
              style={{ padding: '0.9rem', textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: engine === 'neural' ? 'var(--primary-light)' : 'transparent', borderColor: engine === 'neural' ? 'var(--primary)' : 'var(--border-subtle)' }}
              onClick={() => { if (soundEnabled) speechService.playClickSound(); setEngine('neural'); }}
            >
              <strong style={{ color: engine === 'neural' ? '#818cf8' : 'var(--text-main)', fontSize: '0.9rem' }}>Rete Neurale Cloud</strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>Libera, rapida e accurata per uso quotidiano.</span>
            </button>

            <button
              className={`btn-secondary ${engine === 'offline' ? 'active' : ''}`}
              style={{ padding: '0.9rem', textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: engine === 'offline' ? 'var(--primary-light)' : 'transparent', borderColor: engine === 'offline' ? 'var(--primary)' : 'var(--border-subtle)' }}
              onClick={() => { if (soundEnabled) speechService.playClickSound(); setEngine('offline'); }}
            >
              <strong style={{ color: engine === 'offline' ? '#818cf8' : 'var(--text-main)', fontSize: '0.9rem' }}>Smart Engine Locale</strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>Funziona istantaneamente anche senza connessione internet.</span>
            </button>

            <button
              className={`btn-secondary ${engine === 'custom' ? 'active' : ''}`}
              style={{ padding: '0.9rem', textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: engine === 'custom' ? 'var(--primary-light)' : 'transparent', borderColor: engine === 'custom' ? 'var(--primary)' : 'var(--border-subtle)' }}
              onClick={() => { if (soundEnabled) speechService.playClickSound(); setEngine('custom'); }}
            >
              <strong style={{ color: engine === 'custom' ? '#818cf8' : 'var(--text-main)', fontSize: '0.9rem' }}>Chiave API Enterprise</strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>Collega la tua chiave OpenAI, DeepL o Gemini.</span>
            </button>
          </div>
        </div>

        {/* API Key Input (if custom) */}
        {engine === 'custom' && (
          <div style={{ background: 'var(--bg-app)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
              <Key size={15} />
              {t.settings.apiKeyPlaceholder}
            </label>
            <input 
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={e => {
                setApiKey(e.target.value);
                localStorage.setItem('omni_api_key', e.target.value);
              }}
              style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '8px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', outline: 'none' }}
            />
          </div>
        )}

        {/* Interface Language */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.75rem', color: 'var(--text-main)' }}>
            <Globe size={18} style={{ color: '#06b6d4' }} />
            {t.settings.interfaceLang}
          </label>
          <select 
            className="lang-selector-select"
            value={uiLang}
            onChange={e => {
              if (soundEnabled) speechService.playClickSound();
              setUiLang(e.target.value);
            }}
            style={{ width: '100%', maxWidth: '320px', padding: '0.65rem 1rem' }}
          >
            <option value="it">🇮🇹 Italiano (Italian)</option>
            <option value="en">🇬🇧 English (Inglese)</option>
            <option value="es">🇪🇸 Español (Spagnolo)</option>
            <option value="fr">🇫🇷 Français (Francese)</option>
            <option value="de">🇩🇪 Deutsch (Tedesco)</option>
            <option value="zh">🇨🇳 中文 (Cinese)</option>
            <option value="ja">🇯🇵 日本語 (Giapponese)</option>
            <option value="ar">🇸🇦 العربية (Arabo - RTL)</option>
          </select>
        </div>

        {/* Appearance & Sound */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          <div style={{ background: 'var(--bg-app)', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.5rem' }}>{t.settings.theme}</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                className={`btn-secondary ${theme === 'dark' ? 'active' : ''}`}
                style={{ flex: 1, background: theme === 'dark' ? 'var(--primary-light)' : 'transparent', borderColor: theme === 'dark' ? 'var(--primary)' : 'var(--border-subtle)' }}
                onClick={() => {
                  setTheme('dark');
                  document.documentElement.setAttribute('data-theme', 'dark');
                }}
              >
                <Moon size={16} />
                {t.settings.themeDark}
              </button>
              <button 
                className={`btn-secondary ${theme === 'light' ? 'active' : ''}`}
                style={{ flex: 1, background: theme === 'light' ? 'var(--primary-light)' : 'transparent', borderColor: theme === 'light' ? 'var(--primary)' : 'var(--border-subtle)' }}
                onClick={() => {
                  setTheme('light');
                  document.documentElement.setAttribute('data-theme', 'light');
                }}
              >
                <Sun size={16} />
                {t.settings.themeLight}
              </button>
            </div>
          </div>

          <div style={{ background: 'var(--bg-app)', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600, display: 'block' }}>{t.settings.audioFeedback}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Suoni tattili al tocco e notifiche audio</span>
            </div>
            <button 
              className="action-icon-btn" 
              onClick={() => {
                speechService.playClickSound();
                setSoundEnabled(!soundEnabled);
              }}
            >
              {soundEnabled ? <Volume2 size={18} style={{ color: '#10b981' }} /> : <Volume2 size={18} style={{ color: '#64748b' }} />}
            </button>
          </div>
        </div>

        {/* Backup & Data Management */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn-secondary" onClick={handleExportBackup}>
              <Download size={16} />
              {t.settings.exportData}
            </button>
            <button className="btn-secondary" onClick={() => document.getElementById('backup-import-input').click()}>
              <Upload size={16} />
              Importa Backup
            </button>
            <input 
              id="backup-import-input" 
              type="file" 
              accept=".json" 
              style={{ display: 'none' }} 
              onChange={handleImportBackup} 
            />
          </div>

          <button className="btn-secondary" onClick={handleResetData} style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
            <RefreshCw size={15} />
            {t.settings.clearData}
          </button>
        </div>

        <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.78rem', marginTop: '0.5rem' }}>
          OmniLingo AI Pro Enterprise Suite • Powered by Deep Neural Translation & Web Speech API
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { 
  Languages, 
  Mic2, 
  FileText, 
  GraduationCap, 
  Settings, 
  Moon, 
  Sun, 
  Volume2, 
  VolumeX, 
  History,
  Sparkles
} from 'lucide-react';
import { speechService } from '../services/speechService';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  uiLang, 
  setUiLang, 
  t, 
  theme, 
  setTheme, 
  soundEnabled, 
  setSoundEnabled,
  onOpenHistory,
  onOpenGlossary
}) {
  const handleTabClick = (tabId) => {
    if (soundEnabled) speechService.playClickSound();
    setActiveTab(tabId);
  };

  const toggleTheme = () => {
    if (soundEnabled) speechService.playClickSound();
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const toggleSound = () => {
    if (!soundEnabled) speechService.playClickSound();
    setSoundEnabled(!soundEnabled);
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="brand-wrapper" onClick={() => handleTabClick('text')}>
          <div className="brand-logo-badge">
            <Sparkles size={22} />
          </div>
          <div className="brand-info">
            <h1>
              {t.appName}
              <span className="brand-badge">PRO v2.5</span>
            </h1>
            <p>{t.appTagline}</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-tabs">
          <button 
            className={`tab-btn ${activeTab === 'text' ? 'active' : ''}`}
            onClick={() => handleTabClick('text')}
            id="tab-text-btn"
          >
            <Languages size={17} />
            <span>{t.tabs.text}</span>
          </button>

          <button 
            className={`tab-btn ${activeTab === 'live' ? 'active' : ''}`}
            onClick={() => handleTabClick('live')}
            id="tab-live-btn"
          >
            <Mic2 size={17} />
            <span>{t.tabs.live}</span>
          </button>

          <button 
            className={`tab-btn ${activeTab === 'docs' ? 'active' : ''}`}
            onClick={() => handleTabClick('docs')}
            id="tab-docs-btn"
          >
            <FileText size={17} />
            <span>{t.tabs.docs}</span>
          </button>

          <button 
            className={`tab-btn ${activeTab === 'learning' ? 'active' : ''}`}
            onClick={() => handleTabClick('learning')}
            id="tab-learning-btn"
          >
            <GraduationCap size={17} />
            <span>{t.tabs.learning}</span>
          </button>

          <button 
            className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => handleTabClick('settings')}
            id="tab-settings-btn"
          >
            <Settings size={17} />
            <span>{t.tabs.settings}</span>
          </button>
        </nav>

        {/* Global Action Tools */}
        <div className="header-actions">
          {/* UI Language Switcher */}
          <select 
            className="lang-selector-select" 
            value={uiLang} 
            onChange={(e) => {
              if (soundEnabled) speechService.playClickSound();
              setUiLang(e.target.value);
            }}
            title={t.settings.interfaceLang}
            id="ui-lang-selector"
          >
            <option value="it">🇮🇹 Italiano</option>
            <option value="en">🇬🇧 English</option>
            <option value="es">🇪🇸 Español</option>
            <option value="fr">🇫🇷 Français</option>
            <option value="de">🇩🇪 Deutsch</option>
            <option value="zh">🇨🇳 中文</option>
            <option value="ja">🇯🇵 日本語</option>
            <option value="ar">🇸🇦 العربية</option>
          </select>

          {/* Sound FX Toggle */}
          <button 
            className="action-icon-btn" 
            onClick={toggleSound}
            title={soundEnabled ? "Mute sounds" : "Enable tactile sounds"}
            id="btn-sound-toggle"
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          {/* Theme Toggle */}
          <button 
            className="action-icon-btn" 
            onClick={toggleTheme}
            title="Toggle Dark / Light Theme"
            id="btn-theme-toggle"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* History Modal Trigger */}
          <button 
            className="action-icon-btn" 
            onClick={() => {
              if (soundEnabled) speechService.playClickSound();
              onOpenHistory();
            }}
            title="Cronologia Traduzioni"
            id="btn-history-toggle"
          >
            <History size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}

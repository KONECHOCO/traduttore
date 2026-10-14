import React, { useRef } from 'react';
import {
  Languages,
  Mic2,
  FileText,
  GraduationCap,
  Settings,
  Moon,
  Sun,
  History,
  Sparkles,
  Crown
} from 'lucide-react';
import { speechService } from '../services/speechService';
import { useMonetization, toggleTestAds } from '../services/monetization';
import { UI_LANGUAGES } from '../data/translations_i18n';

export default function Navbar({
  activeTab,
  setActiveTab,
  uiLang,
  setUiLang,
  t,
  theme,
  setTheme,
  soundEnabled,
  onOpenHistory,
  onOpenPro
}) {
  const { isPro } = useMonetization();
  const taps = useRef({ count: 0, at: 0 });

  const click = () => {
    if (soundEnabled) speechService.playClickSound();
  };

  // 7 tocchi rapidi sul logo: annunci di test on/off (per le build di prova), poi riaprire l'app
  const handleLogoTap = () => {
    const now = Date.now();
    taps.current = now - taps.current.at < 600 ? { count: taps.current.count + 1, at: now } : { count: 1, at: now };
    if (taps.current.count >= 7) {
      taps.current = { count: 0, at: 0 };
      const on = toggleTestAds();
      alert(on ? 'Test ads ON — restart the app' : 'Test ads OFF — restart the app');
      return;
    }
    click();
    setActiveTab('text');
  };

  const tabs = [
    { id: 'text', icon: Languages, label: t.tabs.text },
    { id: 'live', icon: Mic2, label: t.tabs.live },
    { id: 'docs', icon: FileText, label: t.tabs.docs },
    { id: 'learning', icon: GraduationCap, label: t.tabs.learning },
    { id: 'settings', icon: Settings, label: t.tabs.settings }
  ];

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="brand-wrapper" onClick={handleLogoTap}>
          <div className="brand-logo-badge">
            <Sparkles size={22} />
          </div>
          <div className="brand-info">
            <h1>
              {t.appName}
              {isPro && <span className="brand-badge">PRO</span>}
            </h1>
            <p>{t.appTagline}</p>
          </div>
        </div>

        <nav className="nav-tabs" aria-label={t.appName}>
          {tabs.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              className={`tab-btn ${activeTab === id ? 'active' : ''}`}
              onClick={() => {
                click();
                setActiveTab(id);
              }}
              id={`tab-${id}-btn`}
            >
              <Icon size={17} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="header-actions">
          <select
            className="lang-selector-select hide-mobile"
            value={uiLang}
            onChange={(e) => {
              click();
              setUiLang(e.target.value);
            }}
            title={t.settings.interfaceLang}
            aria-label={t.settings.interfaceLang}
            id="ui-lang-selector"
          >
            {UI_LANGUAGES.map(l => (
              <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
            ))}
          </select>

          {!isPro && (
            <button className="action-icon-btn pro-btn" onClick={() => { click(); onOpenPro(); }} title={t.pro.title} aria-label={t.pro.title}>
              <Crown size={18} />
            </button>
          )}

          <button
            className="action-icon-btn"
            onClick={() => {
              click();
              setTheme(theme === 'dark' ? 'light' : 'dark');
            }}
            title={t.settings.theme}
            aria-label={t.settings.theme}
            id="btn-theme-toggle"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            className="action-icon-btn"
            onClick={() => {
              click();
              onOpenHistory();
            }}
            title={t.history.title}
            aria-label={t.history.title}
            id="btn-history-toggle"
          >
            <History size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}

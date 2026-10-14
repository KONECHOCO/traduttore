import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import TextTranslator from './components/TextStudio/TextTranslator';
import LiveConversation from './components/LiveConversation/LiveConversation';
import DocumentScanner from './components/DocumentScanner/DocumentScanner';
import LearningAcademy from './components/LanguageLearning/LearningAcademy';
import SettingsModal from './components/Settings/SettingsModal';
import HistoryModal from './components/HistoryModal';
import ProModal from './components/ProModal';
import AdBanner from './components/AdBanner';
import AdDiagnostics from './components/AdDiagnostics';
import { getTranslation, detectUiLang } from './data/translations_i18n';
import { initMonetization, trackAdAction, useMonetization } from './services/monetization';
import { readJSON, writeJSON } from './services/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState('text');
  const [uiLang, setUiLang] = useState(() => localStorage.getItem('omni_ui_lang') || detectUiLang());
  const [theme, setTheme] = useState(() => localStorage.getItem('omni_theme') || 'dark');
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('omni_sound') !== 'false');

  const [flashcards, setFlashcards] = useState(() => readJSON('omni_flashcards', []));
  const [glossary, setGlossary] = useState(() => readJSON('omni_glossary', []));
  const [history, setHistory] = useState(() => readJSON('omni_history', []));

  // Stato dello Studio Testo (condiviso con la cronologia)
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState(() => localStorage.getItem('omni_target_lang') || (uiLang === 'en' ? 'es' : 'en'));
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isProOpen, setIsProOpen] = useState(false);
  const { bannerHeight } = useMonetization();

  useEffect(() => {
    initMonetization();
  }, []);

  useEffect(() => {
    localStorage.setItem('omni_ui_lang', uiLang);
    document.documentElement.lang = uiLang;
    document.documentElement.dir = uiLang === 'ar' ? 'rtl' : 'ltr';
  }, [uiLang]);

  useEffect(() => {
    localStorage.setItem('omni_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('omni_sound', soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('omni_target_lang', targetLang);
  }, [targetLang]);

  useEffect(() => writeJSON('omni_flashcards', flashcards), [flashcards]);
  useEffect(() => writeJSON('omni_glossary', glossary), [glossary]);
  useEffect(() => writeJSON('omni_history', history), [history]);

  // Il banner nativo AdMob è disegnato sopra la WebView: la barra di navigazione mobile sta sopra di lui
  useEffect(() => {
    document.documentElement.style.setProperty('--banner-h', `${bannerHeight || 0}px`);
  }, [bannerHeight]);

  const t = getTranslation(uiLang);

  const changeTab = (tab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    window.scrollTo(0, 0);
    trackAdAction();
  };

  const handleAddToHistory = (item) => {
    setHistory(prev => [item, ...prev.filter(h => !(h.sourceText === item.sourceText && h.targetLang === item.targetLang))].slice(0, 100));
  };

  const handleSaveToFlashcards = (card) => {
    setFlashcards(prev => {
      if (prev.some(c => c.word === card.word && c.translation === card.translation)) return prev;
      return [{ id: 'fc-' + Date.now(), box: 0, due: Date.now(), ...card }, ...prev];
    });
  };

  const handleSelectHistoryItem = (item) => {
    setSourceLang(item.sourceLang);
    setTargetLang(item.targetLang);
    setSourceText(item.sourceText);
    setTranslatedText(item.translatedText);
    setActiveTab('text');
  };

  const common = { t, uiLang, soundEnabled, glossary };

  return (
    <div className="app-container">
      <Navbar
        activeTab={activeTab}
        setActiveTab={changeTab}
        uiLang={uiLang}
        setUiLang={setUiLang}
        t={t}
        theme={theme}
        setTheme={setTheme}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenPro={() => setIsProOpen(true)}
      />

      <main className="main-viewport">
        {activeTab === 'text' && (
          <TextTranslator
            {...common}
            sourceLang={sourceLang}
            setSourceLang={setSourceLang}
            targetLang={targetLang}
            setTargetLang={setTargetLang}
            sourceText={sourceText}
            setSourceText={setSourceText}
            translatedText={translatedText}
            setTranslatedText={setTranslatedText}
            onSaveToFlashcards={handleSaveToFlashcards}
            onAddToHistory={handleAddToHistory}
            setGlossary={setGlossary}
          />
        )}

        {activeTab === 'live' && <LiveConversation {...common} />}

        {activeTab === 'docs' && <DocumentScanner {...common} />}

        {activeTab === 'learning' && (
          <LearningAcademy
            {...common}
            flashcards={flashcards}
            setFlashcards={setFlashcards}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsModal
            {...common}
            setUiLang={setUiLang}
            theme={theme}
            setTheme={setTheme}
            setSoundEnabled={setSoundEnabled}
            flashcards={flashcards}
            setFlashcards={setFlashcards}
            setGlossary={setGlossary}
            history={history}
            setHistory={setHistory}
            onOpenPro={() => setIsProOpen(true)}
          />
        )}
      </main>

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        setHistory={setHistory}
        onSelectHistoryItem={handleSelectHistoryItem}
        soundEnabled={soundEnabled}
        t={t}
        uiLang={uiLang}
      />

      <ProModal isOpen={isProOpen} onClose={() => setIsProOpen(false)} t={t} />
      <AdBanner t={t} onUpgrade={() => setIsProOpen(true)} />
      <AdDiagnostics />
    </div>
  );
}

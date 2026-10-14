import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import TextTranslator from './components/TextStudio/TextTranslator';
import LiveConversation from './components/LiveConversation/LiveConversation';
import DocumentScanner from './components/DocumentScanner/DocumentScanner';
import LearningAcademy from './components/LanguageLearning/LearningAcademy';
import SettingsModal from './components/Settings/SettingsModal';
import HistoryModal from './components/HistoryModal';
import { getTranslation } from './data/translations_i18n';
import { INITIAL_FLASHCARDS } from './data/learningData';

export default function App() {
  const [activeTab, setActiveTab] = useState('text'); // 'text', 'live', 'docs', 'learning', 'settings'
  const [uiLang, setUiLang] = useState(() => localStorage.getItem('omni_ui_lang') || 'it');
  const [theme, setTheme] = useState(() => localStorage.getItem('omni_theme') || 'dark');
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('omni_sound') !== 'false');

  // Translation Engine & Keys
  const [engine, setEngine] = useState(() => localStorage.getItem('omni_engine') || 'neural');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('omni_api_key') || '');

  // Persistent Flashcards
  const [flashcards, setFlashcards] = useState(() => {
    try {
      const saved = localStorage.getItem('omni_flashcards');
      return saved ? JSON.parse(saved) : INITIAL_FLASHCARDS;
    } catch {
      return INITIAL_FLASHCARDS;
    }
  });

  // Persistent Glossary
  const [glossary, setGlossary] = useState(() => {
    try {
      const saved = localStorage.getItem('omni_glossary');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persistent Translation History
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('omni_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Text Studio active text states
  const [sourceLang, setSourceLang] = useState('it');
  const [targetLang, setTargetLang] = useState('en');
  const [sourceText, setSourceText] = useState('Questo traduttore professionale supporta sfumature di tono, conversazioni live a 180 gradi, conferenze internazionali e guida allo studio.');
  const [translatedText, setTranslatedText] = useState('');

  // Modals
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Sync settings to localStorage and HTML tag
  useEffect(() => {
    localStorage.setItem('omni_ui_lang', uiLang);
    document.documentElement.lang = uiLang;
    // Handle RTL for Arabic
    if (uiLang === 'ar') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }, [uiLang]);

  useEffect(() => {
    localStorage.setItem('omni_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('omni_sound', soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('omni_engine', engine);
  }, [engine]);

  // Current translation dictionary
  const t = getTranslation(uiLang);

  // Add new item to history
  const handleAddToHistory = (item) => {
    setHistory((prev) => {
      const filtered = prev.filter(h => h.sourceText !== item.sourceText);
      const updated = [item, ...filtered].slice(0, 50); // keep last 50
      localStorage.setItem('omni_history', JSON.stringify(updated));
      return updated;
    });
  };

  // Add new item to flashcards
  const handleSaveToFlashcards = (newCard) => {
    setFlashcards((prev) => {
      const updated = [{ id: 'fc-' + Date.now(), ...newCard }, ...prev];
      localStorage.setItem('omni_flashcards', JSON.stringify(updated));
      return updated;
    });
  };

  // Select history item
  const handleSelectHistoryItem = (item) => {
    setSourceText(item.sourceText);
    setTranslatedText(item.translatedText);
    setSourceLang(item.sourceLang);
    setTargetLang(item.targetLang);
    setActiveTab('text');
  };

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        uiLang={uiLang}
        setUiLang={setUiLang}
        t={t}
        theme={theme}
        setTheme={setTheme}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      {/* Main Viewport */}
      <main className="main-viewport">
        {activeTab === 'text' && (
          <TextTranslator 
            sourceLang={sourceLang}
            setSourceLang={setSourceLang}
            targetLang={targetLang}
            setTargetLang={setTargetLang}
            sourceText={sourceText}
            setSourceText={setSourceText}
            translatedText={translatedText}
            setTranslatedText={setTranslatedText}
            t={t}
            soundEnabled={soundEnabled}
            onSaveToFlashcards={handleSaveToFlashcards}
            onAddToHistory={handleAddToHistory}
            engine={engine}
            apiKey={apiKey}
            glossary={glossary}
            setGlossary={setGlossary}
          />
        )}

        {activeTab === 'live' && (
          <LiveConversation 
            t={t}
            soundEnabled={soundEnabled}
            engine={engine}
            apiKey={apiKey}
            glossary={glossary}
          />
        )}

        {activeTab === 'docs' && (
          <DocumentScanner 
            t={t}
            soundEnabled={soundEnabled}
            engine={engine}
            apiKey={apiKey}
            glossary={glossary}
          />
        )}

        {activeTab === 'learning' && (
          <LearningAcademy 
            flashcards={flashcards}
            setFlashcards={setFlashcards}
            t={t}
            soundEnabled={soundEnabled}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsModal 
            engine={engine}
            setEngine={setEngine}
            apiKey={apiKey}
            setApiKey={setApiKey}
            uiLang={uiLang}
            setUiLang={setUiLang}
            theme={theme}
            setTheme={setTheme}
            soundEnabled={soundEnabled}
            setSoundEnabled={setSoundEnabled}
            flashcards={flashcards}
            setFlashcards={setFlashcards}
            glossary={glossary}
            setGlossary={setGlossary}
            t={t}
          />
        )}
      </main>

      {/* History Modal */}
      <HistoryModal 
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        setHistory={setHistory}
        onSelectHistoryItem={handleSelectHistoryItem}
        soundEnabled={soundEnabled}
      />
    </div>
  );
}

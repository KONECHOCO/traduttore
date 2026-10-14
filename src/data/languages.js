// Lingue supportate dal motore on-device (Google ML Kit Translation: 59 lingue).
// Il nome visualizzato è localizzato nella lingua dell'interfaccia con Intl.DisplayNames,
// `native` è il nome nella lingua stessa. `voice` serve per sintesi e riconoscimento vocale.
export const LANGUAGES = [
  { code: 'af', native: 'Afrikaans', flag: '🇿🇦', voice: 'af-ZA' },
  { code: 'sq', native: 'Shqip', flag: '🇦🇱', voice: 'sq-AL' },
  { code: 'ar', native: 'العربية', flag: '🇸🇦', voice: 'ar-SA', rtl: true },
  { code: 'be', native: 'Беларуская', flag: '🇧🇾', voice: 'be-BY' },
  { code: 'bn', native: 'বাংলা', flag: '🇧🇩', voice: 'bn-BD' },
  { code: 'bg', native: 'Български', flag: '🇧🇬', voice: 'bg-BG' },
  { code: 'ca', native: 'Català', flag: '🏳️', voice: 'ca-ES' },
  { code: 'zh', native: '中文', flag: '🇨🇳', voice: 'zh-CN' },
  { code: 'hr', native: 'Hrvatski', flag: '🇭🇷', voice: 'hr-HR' },
  { code: 'cs', native: 'Čeština', flag: '🇨🇿', voice: 'cs-CZ' },
  { code: 'da', native: 'Dansk', flag: '🇩🇰', voice: 'da-DK' },
  { code: 'nl', native: 'Nederlands', flag: '🇳🇱', voice: 'nl-NL' },
  { code: 'en', native: 'English', flag: '🇬🇧', voice: 'en-US' },
  { code: 'eo', native: 'Esperanto', flag: '🌍', voice: 'eo' },
  { code: 'et', native: 'Eesti', flag: '🇪🇪', voice: 'et-EE' },
  { code: 'fi', native: 'Suomi', flag: '🇫🇮', voice: 'fi-FI' },
  { code: 'fr', native: 'Français', flag: '🇫🇷', voice: 'fr-FR' },
  { code: 'gl', native: 'Galego', flag: '🏳️', voice: 'gl-ES' },
  { code: 'ka', native: 'ქართული', flag: '🇬🇪', voice: 'ka-GE' },
  { code: 'de', native: 'Deutsch', flag: '🇩🇪', voice: 'de-DE' },
  { code: 'el', native: 'Ελληνικά', flag: '🇬🇷', voice: 'el-GR' },
  { code: 'gu', native: 'ગુજરાતી', flag: '🇮🇳', voice: 'gu-IN' },
  { code: 'ht', native: 'Kreyòl ayisyen', flag: '🇭🇹', voice: 'ht-HT' },
  { code: 'he', native: 'עברית', flag: '🇮🇱', voice: 'he-IL', rtl: true },
  { code: 'hi', native: 'हिन्दी', flag: '🇮🇳', voice: 'hi-IN' },
  { code: 'hu', native: 'Magyar', flag: '🇭🇺', voice: 'hu-HU' },
  { code: 'is', native: 'Íslenska', flag: '🇮🇸', voice: 'is-IS' },
  { code: 'id', native: 'Bahasa Indonesia', flag: '🇮🇩', voice: 'id-ID' },
  { code: 'ga', native: 'Gaeilge', flag: '🇮🇪', voice: 'ga-IE' },
  { code: 'it', native: 'Italiano', flag: '🇮🇹', voice: 'it-IT' },
  { code: 'ja', native: '日本語', flag: '🇯🇵', voice: 'ja-JP' },
  { code: 'kn', native: 'ಕನ್ನಡ', flag: '🇮🇳', voice: 'kn-IN' },
  { code: 'ko', native: '한국어', flag: '🇰🇷', voice: 'ko-KR' },
  { code: 'lv', native: 'Latviešu', flag: '🇱🇻', voice: 'lv-LV' },
  { code: 'lt', native: 'Lietuvių', flag: '🇱🇹', voice: 'lt-LT' },
  { code: 'mk', native: 'Македонски', flag: '🇲🇰', voice: 'mk-MK' },
  { code: 'ms', native: 'Bahasa Melayu', flag: '🇲🇾', voice: 'ms-MY' },
  { code: 'mt', native: 'Malti', flag: '🇲🇹', voice: 'mt-MT' },
  { code: 'mr', native: 'मराठी', flag: '🇮🇳', voice: 'mr-IN' },
  { code: 'no', native: 'Norsk', flag: '🇳🇴', voice: 'nb-NO' },
  { code: 'fa', native: 'فارسی', flag: '🇮🇷', voice: 'fa-IR', rtl: true },
  { code: 'pl', native: 'Polski', flag: '🇵🇱', voice: 'pl-PL' },
  { code: 'pt', native: 'Português', flag: '🇵🇹', voice: 'pt-PT' },
  { code: 'ro', native: 'Română', flag: '🇷🇴', voice: 'ro-RO' },
  { code: 'ru', native: 'Русский', flag: '🇷🇺', voice: 'ru-RU' },
  { code: 'sk', native: 'Slovenčina', flag: '🇸🇰', voice: 'sk-SK' },
  { code: 'sl', native: 'Slovenščina', flag: '🇸🇮', voice: 'sl-SI' },
  { code: 'es', native: 'Español', flag: '🇪🇸', voice: 'es-ES' },
  { code: 'sw', native: 'Kiswahili', flag: '🇰🇪', voice: 'sw-KE' },
  { code: 'sv', native: 'Svenska', flag: '🇸🇪', voice: 'sv-SE' },
  { code: 'tl', native: 'Tagalog', flag: '🇵🇭', voice: 'fil-PH' },
  { code: 'ta', native: 'தமிழ்', flag: '🇮🇳', voice: 'ta-IN' },
  { code: 'te', native: 'తెలుగు', flag: '🇮🇳', voice: 'te-IN' },
  { code: 'th', native: 'ไทย', flag: '🇹🇭', voice: 'th-TH' },
  { code: 'tr', native: 'Türkçe', flag: '🇹🇷', voice: 'tr-TR' },
  { code: 'uk', native: 'Українська', flag: '🇺🇦', voice: 'uk-UA' },
  { code: 'ur', native: 'اردو', flag: '🇵🇰', voice: 'ur-PK', rtl: true },
  { code: 'vi', native: 'Tiếng Việt', flag: '🇻🇳', voice: 'vi-VN' },
  { code: 'cy', native: 'Cymraeg', flag: '🏴', voice: 'cy-GB' }
];

export const getLanguageByCode = (code) => {
  return LANGUAGES.find(l => l.code === code) || LANGUAGES.find(l => l.code === 'en');
};

const displayNamesCache = new Map();

/**
 * Nome della lingua nella lingua dell'interfaccia (es. 'de' con interfaccia 'it' → "Tedesco").
 * Con inSentence=true resta la forma minuscola dove la lingua la usa ("parla in tedesco").
 */
export function languageName(code, uiLang = 'en', inSentence = false) {
  try {
    if (!displayNamesCache.has(uiLang)) {
      displayNamesCache.set(uiLang, new Intl.DisplayNames([uiLang], { type: 'language' }));
    }
    const name = displayNamesCache.get(uiLang).of(code);
    if (name && name !== code) return inSentence ? name : name.charAt(0).toUpperCase() + name.slice(1);
  } catch {
    // Intl.DisplayNames non disponibile: si ripiega sul nome nativo
  }
  return getLanguageByCode(code).native;
}

/** Lingue ordinate alfabeticamente secondo la lingua dell'interfaccia. */
export function sortedLanguages(uiLang) {
  return [...LANGUAGES].sort((a, b) => languageName(a.code, uiLang).localeCompare(languageName(b.code, uiLang), uiLang));
}

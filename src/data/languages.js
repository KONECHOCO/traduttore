// Supported languages database with metadata, ISO codes, flags, TTS & STT codes
export const LANGUAGES = [
  { code: 'it', name: 'Italiano', native: 'Italiano', flag: '🇮🇹', voice: 'it-IT', speechCode: 'it-IT' },
  { code: 'en', name: 'Inglese', native: 'English', flag: '🇬🇧', voice: 'en-US', speechCode: 'en-US' },
  { code: 'es', name: 'Spagnolo', native: 'Español', flag: '🇪🇸', voice: 'es-ES', speechCode: 'es-ES' },
  { code: 'fr', name: 'Francese', native: 'Français', flag: '🇫🇷', voice: 'fr-FR', speechCode: 'fr-FR' },
  { code: 'de', name: 'Tedesco', native: 'Deutsch', flag: '🇩🇪', voice: 'de-DE', speechCode: 'de-DE' },
  { code: 'pt', name: 'Portoghese', native: 'Português', flag: '🇵🇹', voice: 'pt-PT', speechCode: 'pt-PT' },
  { code: 'zh', name: 'Cinese (Semplificato)', native: '中文 (简体)', flag: '🇨🇳', voice: 'zh-CN', speechCode: 'zh-CN' },
  { code: 'ja', name: 'Giapponese', native: '日本語', flag: '🇯🇵', voice: 'ja-JP', speechCode: 'ja-JP' },
  { code: 'ru', name: 'Russo', native: 'Русский', flag: '🇷🇺', voice: 'ru-RU', speechCode: 'ru-RU' },
  { code: 'ar', name: 'Arabo', native: 'العربية', flag: '🇸🇦', voice: 'ar-SA', speechCode: 'ar-SA', rtl: true },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳', voice: 'hi-IN', speechCode: 'hi-IN' },
  { code: 'ko', name: 'Coreano', native: '한국어', flag: '🇰🇷', voice: 'ko-KR', speechCode: 'ko-KR' },
  { code: 'nl', name: 'Olandese', native: 'Nederlands', flag: '🇳🇱', voice: 'nl-NL', speechCode: 'nl-NL' },
  { code: 'pl', name: 'Polacco', native: 'Polski', flag: '🇵🇱', voice: 'pl-PL', speechCode: 'pl-PL' },
  { code: 'uk', name: 'Ucraino', native: 'Українська', flag: '🇺🇦', voice: 'uk-UA', speechCode: 'uk-UA' },
  { code: 'tr', name: 'Turco', native: 'Türkçe', flag: '🇹🇷', voice: 'tr-TR', speechCode: 'tr-TR' },
  { code: 'el', name: 'Greco', native: 'Ελληνικά', flag: '🇬🇷', voice: 'el-GR', speechCode: 'el-GR' },
  { code: 'sv', name: 'Svedese', native: 'Svenska', flag: '🇸🇪', voice: 'sv-SE', speechCode: 'sv-SE' },
  { code: 'no', name: 'Norvegese', native: 'Norsk', flag: '🇳🇴', voice: 'nb-NO', speechCode: 'nb-NO' },
  { code: 'da', name: 'Danese', native: 'Dansk', flag: '🇩🇰', voice: 'da-DK', speechCode: 'da-DK' },
  { code: 'fi', name: 'Finlandese', native: 'Suomi', flag: '🇫🇮', voice: 'fi-FI', speechCode: 'fi-FI' },
  { code: 'cs', name: 'Ceco', native: 'Čeština', flag: '🇨🇿', voice: 'cs-CZ', speechCode: 'cs-CZ' },
  { code: 'ro', name: 'Rumeno', native: 'Română', flag: '🇷🇴', voice: 'ro-RO', speechCode: 'ro-RO' },
  { code: 'hu', name: 'Ungherese', native: 'Magyar', flag: '🇭🇺', voice: 'hu-HU', speechCode: 'hu-HU' },
  { code: 'id', name: 'Indonesiano', native: 'Bahasa Indonesia', flag: '🇮🇩', voice: 'id-ID', speechCode: 'id-ID' },
  { code: 'vi', name: 'Vietnamita', native: 'Tiếng Việt', flag: '🇻🇳', voice: 'vi-VN', speechCode: 'vi-VN' },
  { code: 'th', name: 'Tailandese', native: 'ไทย', flag: '🇹🇭', voice: 'th-TH', speechCode: 'th-TH' },
  { code: 'he', name: 'Ebraico', native: 'עברית', flag: '🇮🇱', voice: 'he-IL', speechCode: 'he-IL', rtl: true },
  { code: 'fa', name: 'Persiano', native: 'فارسی', flag: '🇮🇷', voice: 'fa-IR', speechCode: 'fa-IR', rtl: true },
  { code: 'ca', name: 'Catalano', native: 'Català', flag: '🇪🇸', voice: 'ca-ES', speechCode: 'ca-ES' },
  { code: 'hr', name: 'Croato', native: 'Hrvatski', flag: '🇭🇷', voice: 'hr-HR', speechCode: 'hr-HR' },
  { code: 'bg', name: 'Bulgaro', native: 'Български', flag: '🇧🇬', voice: 'bg-BG', speechCode: 'bg-BG' },
  { code: 'sk', name: 'Slovacco', native: 'Slovenčina', flag: '🇸🇰', voice: 'sk-SK', speechCode: 'sk-SK' },
  { code: 'sl', name: 'Sloveno', native: 'Slovenščina', flag: '🇸🇮', voice: 'sl-SI', speechCode: 'sl-SI' },
  { code: 'lt', name: 'Lituano', native: 'Lietuvių', flag: '🇱🇹', voice: 'lt-LT', speechCode: 'lt-LT' },
  { code: 'lv', name: 'Lettone', native: 'Latviešu', flag: '🇱🇻', voice: 'lv-LV', speechCode: 'lv-LV' },
  { code: 'et', name: 'Estone', native: 'Eesti', flag: '🇪🇪', voice: 'et-EE', speechCode: 'et-EE' },
  { code: 'sr', name: 'Serbo', native: 'Српски', flag: '🇷🇸', voice: 'sr-RS', speechCode: 'sr-RS' },
  { code: 'ms', name: 'Malese', native: 'Bahasa Melayu', flag: '🇲🇾', voice: 'ms-MY', speechCode: 'ms-MY' },
  { code: 'fil', name: 'Filippino', native: 'Filipino', flag: '🇵🇭', voice: 'fil-PH', speechCode: 'fil-PH' }
];

export const POPULAR_LANGUAGE_CODES = ['it', 'en', 'es', 'fr', 'de', 'pt', 'zh', 'ja', 'ru', 'ar'];

export const TONES = [
  { id: 'standard', label: 'Neutro', desc: 'Traduzione naturale e bilanciata', icon: 'Sparkles' },
  { id: 'formal', label: 'Formale', desc: 'Business, documenti ufficiali e cortesia', icon: 'Briefcase' },
  { id: 'informal', label: 'Informale', desc: 'Colloquiale per chat, amici e viaggi', icon: 'Smile' },
  { id: 'academic', label: 'Accademico', desc: 'Articoli scientifici e saggi', icon: 'GraduationCap' },
  { id: 'creative', label: 'Creativo', desc: 'Storytelling, marketing e prosa', icon: 'Feather' }
];

export const getLanguageByCode = (code) => {
  return LANGUAGES.find(l => l.code === code) || LANGUAGES[1]; // default English
};

import React, { useMemo } from 'react';
import { sortedLanguages, languageName } from '../data/languages';

/** Menu lingue con i nomi nella lingua dell'interfaccia; `autoLabel` aggiunge la voce "Rileva lingua". */
export default function LanguageSelect({ value, onChange, uiLang, autoLabel, id, ariaLabel, style }) {
  const langs = useMemo(() => sortedLanguages(uiLang), [uiLang]);
  return (
    <select
      className="lang-selector-select"
      value={value}
      onChange={e => onChange(e.target.value)}
      id={id}
      aria-label={ariaLabel}
      style={style}
    >
      {autoLabel && <option value="auto">✨ {autoLabel}</option>}
      {langs.map(l => (
        <option key={l.code} value={l.code}>
          {l.flag} {languageName(l.code, uiLang)}
        </option>
      ))}
    </select>
  );
}

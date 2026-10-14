// Lettura/scrittura sicura di localStorage (può mancare o lanciare eccezioni in modalità privata)
export function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // spazio esaurito o storage non disponibile
  }
}

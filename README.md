# OmniLingo — Traduttore offline, conversazione live e studio delle lingue

App React + Vite pubblicata su iOS e Android con Capacitor (`com.ikonet.omnilingo`).

## Cosa fa davvero

| Funzione | Come funziona |
|---|---|
| Traduzione testi (59 lingue) | Google ML Kit Translation **sul dispositivo**; pacchetti lingua (~30 MB) scaricati al primo uso, poi offline |
| Rilevamento lingua | ML Kit Language Identification (sul dispositivo) |
| Significato di una parola | La parola toccata viene tradotta da sola verso la lingua di partenza (fuori contesto, dichiarato in app) |
| Glossario | Dopo la traduzione, la resa automatica del termine viene sostituita con quella scelta dall'utente |
| Falsi amici | Elenco curato inglese ↔ italiano, mostrato solo con interfaccia italiana |
| Dettatura / conversazione / sottotitoli | Riconoscimento vocale di sistema (`@capacitor-community/speech-recognition`), sintesi con `text-to-speech` |
| Sottotitoli conferenza | Ascolto continuo con riavvio automatico; export `.TXT` e `.SRT` con tempi reali |
| OCR foto | ML Kit Text Recognition per latino, cinese, giapponese, coreano, devanagari; Tesseract.js (modello scaricato) per gli altri alfabeti |
| Documenti | PDF con testo (pdf.js, fino a 50 pagine), DOCX (mammoth), TXT/MD/CSV/SRT/HTML; traduzione a blocchi con avanzamento |
| Flashcard | Ripasso a intervalli (Leitner: 1, 3, 7, 16, 35 giorni) |
| Frasario | Frasi in inglese tradotte on-device nella lingua studiata |
| Pronuncia | Somiglianza (Levenshtein) tra frase attesa e frase riconosciuta |
| Quiz | Generato dalle flashcard dell'utente |
| Monetizzazione | AdMob (app open, banner, interstitial) + **OmniLingo Pro** non consumabile (`omnilingo_pro`, 2,99 €) che rimuove la pubblicità |

Nel browser (`npm run dev`) la traduzione usa MyMemory solo come anteprima di sviluppo: limiti di 500 byte per richiesta e quota giornaliera.

Interfaccia: it, en, es, fr, de, zh, ja, ar (RTL).

## Sviluppo

```bash
npm install
npm run dev
npm run build && npx -y node@22 node_modules/@capacitor/cli/bin/capacitor sync
```

iOS usa **CocoaPods** (ML Kit non supporta Swift Package Manager): si compila `ios/App/App.xcworkspace`. Build su Codemagic con `codemagic.yaml`.

## Da completare prima della pubblicazione

- App AdMob iOS/Android + unità reali → `.env.production` (`VITE_ADMOB_*`), `GADApplicationIdentifier` in `ios/App/App/Info.plist`, `ADMOB_ANDROID_APP_ID`.
- Profilo App Store in `ios/profiles/omnilingo_appstore.mobileprovision` e `PROFILE_UUID` in `codemagic.yaml`.
- Keystore Android `omnilingo_android` su Codemagic.

Privacy e supporto: https://konechoco.github.io/omnilingo/

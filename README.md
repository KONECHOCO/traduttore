# OmniLingo AI Pro — Suite Professionale di Traduzione, Live Audio & Guida allo Studio

**OmniLingo AI Pro** è un'applicazione web all'avanguardia pensata per professionisti, interpreti, conferenzieri e studenti di lingue. Unisce le migliori caratteristiche di **DeepL**, **Google Translate**, **Apple Translate**, **Reverso Context**, **Otter.ai** e **Duolingo** in un unico ecosistema integrato ad alte prestazioni.

---

## ✨ Funzionalità Chiave

### 1. 📝 Studio Testo & Sfumature di Registro (Stile DeepL Pro & Reverso)
- **Traduzione su oltre 100 lingue** con rilevamento automatico e scambio rapido.
- **Selettore del Tono & Registro**: *Neutro*, *Formale (Business & Legale)*, *Informale (Colloquiale)*, *Accademico (Scientifico)*, *Creativo (Letterario)*.
- **Sinonimi & Alternative Interattive**: cliccando su qualunque parola nella traduzione, compaiono istantaneamente definizioni grammaticali, collocazioni e sinonimi applicabili con un clic.
- **Radar Falsi Amici**: rilevamento intelligente delle parole insidiose (es. *Actually* ≠ *Attualmente*, *Preservative* ≠ *Preservativo*).
- **Dettatura vocale (STT)** e **Sintesi vocale ad alta fedeltà (TTS)** con regolazione della velocità (0.8x, 1.0x, 1.2x).
- **Glossario Personalizzato**: possibilità di forzare traduzioni specifiche per marchi aziendali, acronimi e terminologia tecnica.

---

### 2. 🎙️ Conversazione dal Vivo & Conferenze in Diretta (Stile Apple Translate & Otter.ai)
- **Modalità Conversazione Faccia a Faccia (Tavolo / Split Screen)**:
  - Schermo diviso a due metà per Interlocutore A e Interlocutore B.
  - **Pulsante "Capovolgi schermo a 180°"**: orienta la schermata dell'interlocutore a testa in giù, permettendo a due persone sedute allo stesso tavolo di dialogare guardandosi negli occhi con il tablet appoggiato tra loro.
  - Lettura vocale automatica immediata (Auto-TTS) della traduzione.
- **Modalità Conferenza & Sottotitoli Continui in Tempo Reale**:
  - Teleprompter a caratteri giganti ad alto contrasto per proiettori, monitor congressuali o webinar.
  - Trascrizione continua a scorrimento con timestamp e marcatura del relatore.
  - **Esportazione con 1 clic**: download della trascrizione completa in formato `.TXT` o file di sottotitoli sincronizzati `.SRT`.

---

### 3. 📄 Scanner OCR Foto, Documenti & Fotocamera Live
- **Traduzione Documenti**: drag & drop di file `.pdf`, `.txt`, `.docx`, `.md`, `.json`, `.csv`. Estrazione automatica dei paragrafi e download immediato del file tradotto.
- **OCR Immagini & Foto (Client-Side con Tesseract.js)**: caricamento di immagini, screenshot o volantini con barra di avanzamento e riconoscimento ottico istantaneo.
- **Fotocamera Live / Webcam Scanner**: inquadra cartelli, menu o documenti direttamente con la fotocamera del tuo dispositivo e scatta per tradurre all'istante.

---

### 4. 🎓 Accademia Linguistica & Guida allo Studio (Stile Duolingo & Elsa Speak)
- **Flashcards 3D con Metodo SRS (Spaced Repetition System)**: memorizza le parole chiave con rotazione tridimensionale della carta. Qualsiasi traduzione effettuata nello Studio Testo può essere salvata come Flashcard con un solo tocco!
- **Coach di Pronuncia Vocale**: ascolta la voce madrelingua, registra la tua pronuncia al microfono e ricevi un punteggio di precisione fonetica (0-100%).
- **Frasari Tematici Curati**: formule professionali per *Business Meeting*, *Viaggi & Dogana*, *Conferenze*, *Emergenze Mediche*.
- **Coniugatore Verbi & Grammatica**: schemi verbali per tempi presente, passato e futuro.
- **Quiz di Verifica Rapido**: domande interattive con spiegazione contestuale e animazione coriandoli al completamento!

---

### 5. ⚙️ Architettura Multi-Motore & Internazionalizzazione Globale (i18n)
- **Interfaccia Multi-Lingue**: interfaccia completamente localizzata in Italiano, Inglese, Spagnolo, Francese, Tedesco, Cinese, Giapponese e Arabo (con gestione automatica del layout **RTL**).
- **Motori di Traduzione Flessibili**:
  1. *Rete Neurale Cloud Gratuita* (alta velocità, nessun costo).
  2. *Smart Engine Locale Offline* (funziona anche in assenza di connessione internet).
  3. *Chiave API Enterprise* (supporto diretto per chiavi personali OpenAI, DeepL o Gemini).
- **Design System Vanilla CSS**: supporto fluido per tema Dark Cyber-Glass e tema Light Minimal, suoni tattili con Web Audio API e layout ultra-responsivo.
- **Salvataggio & Backup**: esportazione ed importazione di tutti i vocaboli e glossari in formato JSON.

---

## 🚀 Come Eseguire l'Applicazione

1. Apri il terminale nella cartella del progetto:
   ```powershell
   npm install
   npm run dev
   ```
2. Apri il browser all'indirizzo indicato (di default: `http://localhost:5173/`).
3. Per creare la build di produzione ottimizzata:
   ```powershell
   npm run build
   ```

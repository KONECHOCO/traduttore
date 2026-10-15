# Risposta ad App Review — Guideline 4.3 / 4.2.6 (bozza)

> Bozza da rileggere prima dell'invio. Le risposte sono vere: non aggiungere beta test o utenti che non esistono.
> I punti tra [parentesi quadre] vanno completati o tolti da te.

---

Hello App Review team,

thank you for the review. Below are complete answers to your questions.

**1. What the app does and the problem it solves**

OmniLingo translates text, speech, photos and documents entirely on the device, so it keeps working without a data connection (abroad, on planes, in conference halls with poor Wi-Fi) and without sending the user's texts or photos to any server. Translation, language identification and text recognition run on-device with Google ML Kit; the user downloads only the language packs they need.

Its main focus is live, spoken situations: a split-screen face-to-face mode where the other person's half of the screen is rotated 180° so two people can talk across a table, and a continuous "conference subtitles" mode that keeps listening across pauses, shows the translation in large type for a projector, and exports the transcript (.txt) and timed subtitles (.srt). It also translates PDF and Word documents and text in photos, and turns any translation into study material (spaced-repetition flashcards, a phrasebook translated into the language being learned, a pronunciation check and quizzes generated from the user's own cards).

**2. Intended users**

People who need translation where connectivity or privacy is a concern: travellers abroad without roaming, attendees and organisers of small events and meetings who need live subtitles in another language, professionals who cannot upload confidential documents to cloud translators, and learners who want to keep and review the words they look up.

**3. Gap addressed**

Most translators that offer conversation and document features require a connection or send content to a server. OmniLingo combines in one offline, on-device app: conversation, continuous conference subtitles with .srt export, document and photo translation with a user glossary, and a study workflow built from the user's own translations. [Aggiungi qui la funzione nuova, se la realizziamo: es. sottotitoli condivisi su più telefoni tramite QR.]

**4. Beta testing**

There was no public beta. The app was tested internally by the developer on an Android device/emulator and on a test build installed on the developer's own phone. Changes made from that testing before submission:
- Japanese and Chinese translations could only be selected as a whole sentence; word-level selection was added so a single word can be looked up.
- When the detected language matched the target language the app showed a generic error; it now explains that the text is already in the target language.
- Offline translation was verified with the network disabled.
- Testing the build on the developer's phone showed that the EU consent form for ads was missing; the consent message was configured and a "Ad privacy choices" entry was added in Settings so users can change their choice.
[Se fai un beta su TestFlight con persone reali, sostituisci questa risposta con i loro commenti veri.]

**5. Standalone product or suite**

OmniLingo is a standalone product. It is not part of a suite. The other apps on the account address unrelated needs (public transport, fuel prices, fitness, weather, school diaries, IT reference guides, word games). The closest one is DocuMaster (document scanner and PDF editor), which scans and edits documents but does not translate them; OmniLingo does not scan or edit PDFs.

**6. Could it be an in-app purchase of another app?**

No. None of the other apps is a translator or deals with spoken conversation; adding translation, live subtitles and language learning to a transit, fuel or scanner app would not make sense for their users.

**7. Code shared with other apps on the account**

Only an in-house monetization module (AdMob ads, consent flow and the "Pro" one-time purchase that removes ads) and the same build pipeline (React + Capacitor) are reused across the developer's apps. All translation, speech, document, OCR and learning features, the interface and the content are specific to OmniLingo.

**8. Code shared with third-party apps**

No shared codebase or content library beyond standard frameworks and SDKs: Capacitor, Google ML Kit (translation, language identification, text recognition), Tesseract.js, pdf.js, Mammoth, Google Mobile Ads and the system speech recognition/text-to-speech plugins.

**9. Created for a client or from a template/app generation service?**

No. The app was conceived and developed by the account holder, INZA KONE (Ikonet Solutions), who owns the concept, branding and content. It was not built from a commercial template or by an app generation service on behalf of someone else; AI-assisted coding tools were used during development by the developer.

Thank you,
INZA KONE

# Risposta ad App Review — Guideline 4.3 / 4.2.6

> Da incollare nel Resolution Center insieme al nuovo invio (build 2). Le risposte sono vere.

---

Hello App Review team,

thank you for the feedback. Following your message we made substantial changes before resubmitting (build 2), and we answer your questions below.

**What changed in this build**
- Shared live subtitles: during a talk the speaker shows a QR code or a 6-character room code; each attendee follows the talk on their own phone and reads it in their own language. The speaker's phone sends only the recognised text through our relay server, and every listener translates it on their device, so one speaker can reach an audience that speaks many different languages at the same time. Attendees without the app can follow the original captions from a web page.
- Photo translation drawn directly on top of the recognised text in the image.
- Export of translated documents to Word, including a bilingual version (original and translation side by side).
- A full-screen "Show" mode to hand the phone to the other person, even upside down.
- Glossary import/export as CSV for interpreters and companies.
- Study streak, daily goal and local reminders; a first-launch screen to download the offline language packs.

**1. What the app does and the problem it solves**

OmniLingo is built for live, multilingual situations: meetings, small conferences, classes and guided tours where one person speaks and the listeners speak different languages. With shared rooms the speaker talks once and each listener reads the speech in their own language on their own phone; for one-to-one talks, a split-screen face-to-face mode rotates the other person's half of the screen. Translation, language identification and text recognition run on the device (Google ML Kit), so the app also works without a connection and texts, photos and documents are not uploaded. It also translates photos (with the translation drawn on the image) and PDF/Word documents (exportable as bilingual Word files), and turns translations into study material (spaced-repetition flashcards, phrasebook, pronunciation check, quizzes).

**2. Intended users**

Speakers and organisers of meetings, small events, lessons and tours with an international audience; attendees who want to follow a talk in their own language; travellers without roaming; professionals who cannot upload confidential documents to cloud translators; learners who want to keep and review what they translate.

**3. Gap addressed**

Live translation for an audience usually requires human interpreters, dedicated hardware or paid captioning services that work in one target language at a time. In OmniLingo one speaker's phone is enough: listeners join with a QR code and each one reads the talk in their own language, with translation done on their own device. It is combined, in a single offline-capable app, with face-to-face conversation, document and photo translation with a user glossary, and a study workflow built from the user's own translations.

**4. Beta testing**

There was no public beta. The app was tested internally by the developer on an Android device/emulator and on a test build installed on the developer's own phone. Examples of changes made from that testing:
- the EU consent form for ads was missing on the developer's test build: the consent message was configured and an "Ad privacy choices" entry was added in Settings;
- Japanese and Chinese translations could only be selected as a whole sentence: word-level selection was added;
- a clear message was added when the detected language equals the target language;
- photo text recognition merged separate signs into one block: recognition by paragraph and a font that fits each box were added for the photo overlay;
- the shared subtitles were tested end to end between two devices through the relay server, including the web page for attendees without the app.

**5. Standalone product or suite**

OmniLingo is a standalone product, not part of a suite. The other apps on the account address unrelated needs (public transport, fuel prices, fitness, weather, school diaries, IT reference guides, word games). The closest one is DocuMaster (document scanner and PDF editor), which scans and edits documents but does not translate them; OmniLingo does not scan or edit PDFs.

**6. Could it be an in-app purchase of another app?**

No. None of the other apps is a translator or deals with spoken conversation or live events; adding live multilingual subtitles, translation and language learning to a transit, fuel or scanner app would not make sense for their users.

**7. Code shared with other apps on the account**

Only an in-house monetization module (AdMob ads, consent flow and the "Pro" one-time purchase that removes ads) and the same build pipeline (React + Capacitor). The translation, speech, live rooms and relay server, document, OCR and learning features, the interface and the content are specific to OmniLingo.

**8. Code shared with third-party apps**

No shared codebase or content library beyond standard frameworks and SDKs: Capacitor, Google ML Kit (translation, language identification, text recognition), Tesseract.js, pdf.js, Mammoth, docx, Google Mobile Ads and the system speech recognition/text-to-speech plugins.

**9. Created for a client or from a template/app generation service?**

No. The app was conceived and developed by the account holder, INZA KONE (Ikonet Solutions), who owns the concept, branding and content. It was not built from a commercial template or by an app generation service on behalf of someone else; AI-assisted coding tools were used during development by the developer.

Thank you,
INZA KONE

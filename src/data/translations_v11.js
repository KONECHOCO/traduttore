// Testi delle funzioni della versione 1.1 (conferenza condivisa, foto sovrapposta, Word, serie di studio,
// benvenuto). Uniti ai testi principali da getTranslation.

const en = {
  liveRoom: {
    modeJoin: 'Join a room',
    shareTitle: 'Share subtitles with the audience',
    shareHelp: 'Attendees scan the QR code or enter the code: each person reads the speaker in their own language on their own phone.',
    startShare: 'Share with QR',
    stopShare: 'Stop sharing',
    code: 'Room code',
    audience: '{n} connected',
    reconnecting: 'Reconnecting…',
    shareError: 'Code already in use: stop and share again',
    shareHint: 'Without the app the link opens a web page with the live captions; with OmniLingo each person gets them translated on the device into 59 languages.',
    shareText: 'Follow my talk live in your language with OmniLingo. Room code: {code}',
    joinTitle: 'Join a live talk',
    joinHelp: 'Enter the code shown by the speaker (or open the link from the QR code). The speaker\'s words arrive live and are translated on your phone into your language.',
    myLanguage: 'My language',
    join: 'Join',
    badCode: 'The code has 6 letters or numbers, for example ABC234.',
    notFound: 'Room not found: check the code or ask the speaker to start sharing.',
    roomLabel: 'Room {code}',
    speakerSpeaks: 'The speaker is speaking {lang}',
    leave: 'Leave',
    ended: 'TALK ENDED',
    waitingSpeaker: 'WAITING FOR THE SPEAKER',
    waitingFirst: 'The translated subtitles will appear here as soon as the speaker talks'
  },
  textStudio: { showFull: 'Show full screen' },
  docsOcr: {
    exportWord: 'Save translation as Word (.docx)',
    exportBilingual: 'Save bilingual Word (original | translation)',
    showOriginalPhoto: 'Show original photo',
    showOverlay: 'Show translation on photo'
  },
  glossary: { importCsv: 'Import CSV', exportCsv: 'Export CSV', imported: '{n} terms imported' },
  learning: { streakDays: '{n}-day streak', bestStreak: 'Best: {n} days', dailyGoal: 'Today: {done}/{goal} exercises' },
  settings: {
    study: 'Study',
    goalLabel: 'Daily goal (exercises)',
    reminder: 'Daily reminder',
    reminderTitle: 'Time to practice 🔥',
    reminderBody: 'A few minutes with OmniLingo keep your streak alive.',
    reminderDenied: 'Notifications are disabled: enable them in the device settings.',
    privacyShare: 'Shared live subtitles are the exception: when you share a room, the recognised text passes through our relay server in real time to the people in the room and is not saved.'
  },
  onboarding: {
    title: 'Welcome to OmniLingo',
    f1: 'Translate 59 languages even offline, on your device',
    f2: 'Face-to-face conversation and live subtitles you can share with QR',
    f3: 'Translate photos, PDFs and Word documents',
    f4: 'Learn with flashcards, phrasebook and pronunciation',
    chooseLangs: 'Which languages do you use?',
    chooseHelp: 'We download them now (about 30 MB each, better on Wi-Fi) so they work without internet. You can change them later in Settings.',
    downloading: 'Downloading language {done} of {total}…',
    skip: 'Later',
    download: 'Download and start',
    start: 'Start'
  }
};

const it = {
  liveRoom: {
    modeJoin: 'Entra in una stanza',
    shareTitle: 'Condividi i sottotitoli con il pubblico',
    shareHelp: 'Chi ascolta inquadra il QR o inserisce il codice: ognuno legge il relatore nella propria lingua sul proprio telefono.',
    startShare: 'Condividi con QR',
    stopShare: 'Termina condivisione',
    code: 'Codice stanza',
    audience: '{n} collegati',
    reconnecting: 'Riconnessione…',
    shareError: 'Codice già in uso: termina e condividi di nuovo',
    shareHint: 'Senza l\'app il link apre una pagina web con i sottotitoli in diretta; con OmniLingo ognuno li riceve tradotti sul dispositivo in 59 lingue.',
    shareText: 'Segui il mio intervento in diretta nella tua lingua con OmniLingo. Codice stanza: {code}',
    joinTitle: 'Segui un intervento in diretta',
    joinHelp: 'Inserisci il codice mostrato dal relatore (o apri il link del QR). Le sue parole arrivano in diretta e vengono tradotte sul tuo telefono nella tua lingua.',
    myLanguage: 'La mia lingua',
    join: 'Entra',
    badCode: 'Il codice ha 6 lettere o numeri, per esempio ABC234.',
    notFound: 'Stanza non trovata: controlla il codice o chiedi al relatore di avviare la condivisione.',
    roomLabel: 'Stanza {code}',
    speakerSpeaks: 'Il relatore parla in {lang}',
    leave: 'Esci',
    ended: 'INTERVENTO TERMINATO',
    waitingSpeaker: 'IN ATTESA DEL RELATORE',
    waitingFirst: 'Qui compariranno i sottotitoli tradotti appena il relatore parla'
  },
  textStudio: { showFull: 'Mostra a schermo intero' },
  docsOcr: {
    exportWord: 'Salva la traduzione in Word (.docx)',
    exportBilingual: 'Salva Word bilingue (originale | traduzione)',
    showOriginalPhoto: 'Mostra la foto originale',
    showOverlay: 'Mostra la traduzione sulla foto'
  },
  glossary: { importCsv: 'Importa CSV', exportCsv: 'Esporta CSV', imported: '{n} termini importati' },
  learning: { streakDays: '{n} giorni di fila', bestStreak: 'Record: {n} giorni', dailyGoal: 'Oggi: {done}/{goal} esercizi' },
  settings: {
    study: 'Studio',
    goalLabel: 'Obiettivo giornaliero (esercizi)',
    reminder: 'Promemoria giornaliero',
    reminderTitle: 'È ora di esercitarti 🔥',
    reminderBody: 'Bastano pochi minuti con OmniLingo per non perdere la serie.',
    reminderDenied: 'Le notifiche sono disattivate: attivale nelle impostazioni del dispositivo.',
    privacyShare: 'Fanno eccezione i sottotitoli condivisi: quando condividi una stanza il testo riconosciuto passa in tempo reale dal nostro server di inoltro verso chi è nella stanza e non viene salvato.'
  },
  onboarding: {
    title: 'Benvenuto in OmniLingo',
    f1: 'Traduci 59 lingue anche offline, sul dispositivo',
    f2: 'Conversazione faccia a faccia e sottotitoli live condivisibili con QR',
    f3: 'Traduci foto, PDF e documenti Word',
    f4: 'Impara con flashcard, frasario e pronuncia',
    chooseLangs: 'Quali lingue usi?',
    chooseHelp: 'Le scarichiamo adesso (circa 30 MB ciascuna, meglio con Wi-Fi) così funzionano senza internet. Puoi cambiarle dopo nelle Impostazioni.',
    downloading: 'Download lingua {done} di {total}…',
    skip: 'Più tardi',
    download: 'Scarica e inizia',
    start: 'Inizia'
  }
};

const es = {
  liveRoom: {
    modeJoin: 'Entrar en una sala',
    shareTitle: 'Comparte los subtítulos con el público',
    shareHelp: 'El público escanea el QR o introduce el código: cada persona lee al ponente en su idioma en su propio teléfono.',
    startShare: 'Compartir con QR',
    stopShare: 'Dejar de compartir',
    code: 'Código de sala',
    audience: '{n} conectados',
    reconnecting: 'Reconectando…',
    shareError: 'Código ya en uso: detén y vuelve a compartir',
    shareHint: 'Sin la app, el enlace abre una página web con los subtítulos en directo; con OmniLingo cada persona los recibe traducidos en el dispositivo a 59 idiomas.',
    shareText: 'Sigue mi charla en directo en tu idioma con OmniLingo. Código de sala: {code}',
    joinTitle: 'Sigue una charla en directo',
    joinHelp: 'Introduce el código que muestra el ponente (o abre el enlace del QR). Sus palabras llegan en directo y se traducen en tu teléfono a tu idioma.',
    myLanguage: 'Mi idioma',
    join: 'Entrar',
    badCode: 'El código tiene 6 letras o números, por ejemplo ABC234.',
    notFound: 'Sala no encontrada: revisa el código o pide al ponente que empiece a compartir.',
    roomLabel: 'Sala {code}',
    speakerSpeaks: 'El ponente habla en {lang}',
    leave: 'Salir',
    ended: 'CHARLA TERMINADA',
    waitingSpeaker: 'ESPERANDO AL PONENTE',
    waitingFirst: 'Aquí aparecerán los subtítulos traducidos en cuanto hable el ponente'
  },
  textStudio: { showFull: 'Mostrar a pantalla completa' },
  docsOcr: {
    exportWord: 'Guardar la traducción en Word (.docx)',
    exportBilingual: 'Guardar Word bilingüe (original | traducción)',
    showOriginalPhoto: 'Ver la foto original',
    showOverlay: 'Ver la traducción sobre la foto'
  },
  glossary: { importCsv: 'Importar CSV', exportCsv: 'Exportar CSV', imported: '{n} términos importados' },
  learning: { streakDays: '{n} días seguidos', bestStreak: 'Récord: {n} días', dailyGoal: 'Hoy: {done}/{goal} ejercicios' },
  settings: {
    study: 'Estudio',
    goalLabel: 'Objetivo diario (ejercicios)',
    reminder: 'Recordatorio diario',
    reminderTitle: 'Hora de practicar 🔥',
    reminderBody: 'Unos minutos con OmniLingo mantienen tu racha.',
    reminderDenied: 'Las notificaciones están desactivadas: actívalas en los ajustes del dispositivo.',
    privacyShare: 'La excepción son los subtítulos compartidos: al compartir una sala, el texto reconocido pasa en tiempo real por nuestro servidor de reenvío hacia las personas de la sala y no se guarda.'
  },
  onboarding: {
    title: 'Bienvenido a OmniLingo',
    f1: 'Traduce 59 idiomas incluso sin conexión, en el dispositivo',
    f2: 'Conversación cara a cara y subtítulos en directo que se comparten con QR',
    f3: 'Traduce fotos, PDF y documentos Word',
    f4: 'Aprende con tarjetas, frases útiles y pronunciación',
    chooseLangs: '¿Qué idiomas usas?',
    chooseHelp: 'Los descargamos ahora (unos 30 MB cada uno, mejor con wifi) para que funcionen sin internet. Puedes cambiarlos después en Ajustes.',
    downloading: 'Descargando idioma {done} de {total}…',
    skip: 'Más tarde',
    download: 'Descargar y empezar',
    start: 'Empezar'
  }
};

const fr = {
  liveRoom: {
    modeJoin: 'Rejoindre une salle',
    shareTitle: 'Partager les sous-titres avec le public',
    shareHelp: 'Le public scanne le QR code ou saisit le code : chacun lit l\'orateur dans sa langue sur son propre téléphone.',
    startShare: 'Partager avec QR',
    stopShare: 'Arrêter le partage',
    code: 'Code de la salle',
    audience: '{n} connectés',
    reconnecting: 'Reconnexion…',
    shareError: 'Code déjà utilisé : arrêtez puis partagez à nouveau',
    shareHint: 'Sans l\'app, le lien ouvre une page web avec les sous-titres en direct ; avec OmniLingo, chacun les reçoit traduits sur l\'appareil dans 59 langues.',
    shareText: 'Suivez mon intervention en direct dans votre langue avec OmniLingo. Code de la salle : {code}',
    joinTitle: 'Suivre une intervention en direct',
    joinHelp: 'Saisissez le code affiché par l\'orateur (ou ouvrez le lien du QR code). Ses paroles arrivent en direct et sont traduites sur votre téléphone dans votre langue.',
    myLanguage: 'Ma langue',
    join: 'Rejoindre',
    badCode: 'Le code comporte 6 lettres ou chiffres, par exemple ABC234.',
    notFound: 'Salle introuvable : vérifiez le code ou demandez à l\'orateur de lancer le partage.',
    roomLabel: 'Salle {code}',
    speakerSpeaks: 'L\'orateur parle {lang}',
    leave: 'Quitter',
    ended: 'INTERVENTION TERMINÉE',
    waitingSpeaker: 'EN ATTENTE DE L\'ORATEUR',
    waitingFirst: 'Les sous-titres traduits s\'afficheront ici dès que l\'orateur parlera'
  },
  textStudio: { showFull: 'Afficher en plein écran' },
  docsOcr: {
    exportWord: 'Enregistrer la traduction en Word (.docx)',
    exportBilingual: 'Enregistrer un Word bilingue (original | traduction)',
    showOriginalPhoto: 'Voir la photo originale',
    showOverlay: 'Voir la traduction sur la photo'
  },
  glossary: { importCsv: 'Importer un CSV', exportCsv: 'Exporter en CSV', imported: '{n} termes importés' },
  learning: { streakDays: '{n} jours d\'affilée', bestStreak: 'Record : {n} jours', dailyGoal: 'Aujourd\'hui : {done}/{goal} exercices' },
  settings: {
    study: 'Étude',
    goalLabel: 'Objectif quotidien (exercices)',
    reminder: 'Rappel quotidien',
    reminderTitle: 'C\'est l\'heure de s\'entraîner 🔥',
    reminderBody: 'Quelques minutes avec OmniLingo suffisent pour garder votre série.',
    reminderDenied: 'Les notifications sont désactivées : activez-les dans les réglages de l\'appareil.',
    privacyShare: 'Exception : les sous-titres partagés. Quand vous partagez une salle, le texte reconnu passe en temps réel par notre serveur relais vers les personnes de la salle et n\'est pas enregistré.'
  },
  onboarding: {
    title: 'Bienvenue dans OmniLingo',
    f1: 'Traduisez 59 langues même hors ligne, sur l\'appareil',
    f2: 'Conversation en face à face et sous-titres en direct à partager par QR code',
    f3: 'Traduisez photos, PDF et documents Word',
    f4: 'Apprenez avec des cartes, un guide de conversation et la prononciation',
    chooseLangs: 'Quelles langues utilisez-vous ?',
    chooseHelp: 'Nous les téléchargeons maintenant (environ 30 Mo chacune, de préférence en Wi-Fi) pour qu\'elles fonctionnent sans internet. Vous pourrez les modifier dans les Réglages.',
    downloading: 'Téléchargement de la langue {done} sur {total}…',
    skip: 'Plus tard',
    download: 'Télécharger et commencer',
    start: 'Commencer'
  }
};

const de = {
  liveRoom: {
    modeJoin: 'Raum beitreten',
    shareTitle: 'Untertitel mit dem Publikum teilen',
    shareHelp: 'Das Publikum scannt den QR-Code oder gibt den Code ein: Jede Person liest den Redner in ihrer Sprache auf dem eigenen Telefon.',
    startShare: 'Mit QR teilen',
    stopShare: 'Teilen beenden',
    code: 'Raumcode',
    audience: '{n} verbunden',
    reconnecting: 'Verbindung wird wiederhergestellt…',
    shareError: 'Code bereits belegt: beenden und erneut teilen',
    shareHint: 'Ohne App öffnet der Link eine Webseite mit Live-Untertiteln; mit OmniLingo erhält jede Person sie auf dem Gerät übersetzt in 59 Sprachen.',
    shareText: 'Verfolge meinen Vortrag live in deiner Sprache mit OmniLingo. Raumcode: {code}',
    joinTitle: 'Einen Vortrag live verfolgen',
    joinHelp: 'Gib den Code des Redners ein (oder öffne den Link aus dem QR-Code). Seine Worte kommen live an und werden auf deinem Telefon in deine Sprache übersetzt.',
    myLanguage: 'Meine Sprache',
    join: 'Beitreten',
    badCode: 'Der Code hat 6 Buchstaben oder Ziffern, zum Beispiel ABC234.',
    notFound: 'Raum nicht gefunden: Prüfe den Code oder bitte den Redner, das Teilen zu starten.',
    roomLabel: 'Raum {code}',
    speakerSpeaks: 'Der Redner spricht {lang}',
    leave: 'Verlassen',
    ended: 'VORTRAG BEENDET',
    waitingSpeaker: 'WARTEN AUF DEN REDNER',
    waitingFirst: 'Hier erscheinen die übersetzten Untertitel, sobald der Redner spricht'
  },
  textStudio: { showFull: 'Im Vollbild zeigen' },
  docsOcr: {
    exportWord: 'Übersetzung als Word speichern (.docx)',
    exportBilingual: 'Zweisprachiges Word speichern (Original | Übersetzung)',
    showOriginalPhoto: 'Originalfoto zeigen',
    showOverlay: 'Übersetzung auf dem Foto zeigen'
  },
  glossary: { importCsv: 'CSV importieren', exportCsv: 'CSV exportieren', imported: '{n} Begriffe importiert' },
  learning: { streakDays: '{n} Tage in Folge', bestStreak: 'Rekord: {n} Tage', dailyGoal: 'Heute: {done}/{goal} Übungen' },
  settings: {
    study: 'Lernen',
    goalLabel: 'Tagesziel (Übungen)',
    reminder: 'Tägliche Erinnerung',
    reminderTitle: 'Zeit zum Üben 🔥',
    reminderBody: 'Ein paar Minuten mit OmniLingo halten deine Serie am Leben.',
    reminderDenied: 'Mitteilungen sind deaktiviert: Aktiviere sie in den Geräteeinstellungen.',
    privacyShare: 'Ausnahme sind geteilte Live-Untertitel: Wenn du einen Raum teilst, läuft der erkannte Text in Echtzeit über unseren Relay-Server zu den Personen im Raum und wird nicht gespeichert.'
  },
  onboarding: {
    title: 'Willkommen bei OmniLingo',
    f1: 'Übersetze 59 Sprachen auch offline, auf dem Gerät',
    f2: 'Gespräche von Angesicht zu Angesicht und Live-Untertitel, die du per QR teilst',
    f3: 'Übersetze Fotos, PDFs und Word-Dokumente',
    f4: 'Lerne mit Karteikarten, Sprachführer und Aussprache',
    chooseLangs: 'Welche Sprachen nutzt du?',
    chooseHelp: 'Wir laden sie jetzt herunter (je ca. 30 MB, am besten im WLAN), damit sie ohne Internet funktionieren. Du kannst sie später in den Einstellungen ändern.',
    downloading: 'Sprache {done} von {total} wird geladen…',
    skip: 'Später',
    download: 'Laden und starten',
    start: 'Starten'
  }
};

const zh = {
  liveRoom: {
    modeJoin: '加入房间',
    shareTitle: '与听众共享字幕',
    shareHelp: '听众扫描二维码或输入代码：每个人都能在自己的手机上用自己的语言阅读演讲内容。',
    startShare: '用二维码共享',
    stopShare: '停止共享',
    code: '房间代码',
    audience: '{n} 人已连接',
    reconnecting: '正在重新连接…',
    shareError: '代码已被占用：请停止后重新共享',
    shareHint: '没有安装应用时，链接会打开显示实时字幕的网页；使用 OmniLingo，每个人都能在设备上收到 59 种语言的翻译。',
    shareText: '用 OmniLingo 以你的语言实时收听我的演讲。房间代码：{code}',
    joinTitle: '实时收听演讲',
    joinHelp: '输入演讲者显示的代码（或打开二维码中的链接）。演讲内容会实时传来，并在你的手机上翻译成你的语言。',
    myLanguage: '我的语言',
    join: '加入',
    badCode: '代码由 6 个字母或数字组成，例如 ABC234。',
    notFound: '找不到房间：请检查代码，或请演讲者开始共享。',
    roomLabel: '房间 {code}',
    speakerSpeaks: '演讲者使用{lang}',
    leave: '离开',
    ended: '演讲已结束',
    waitingSpeaker: '等待演讲者',
    waitingFirst: '演讲者一开口，翻译后的字幕就会显示在这里'
  },
  textStudio: { showFull: '全屏显示' },
  docsOcr: {
    exportWord: '将译文保存为 Word (.docx)',
    exportBilingual: '保存双语 Word（原文 | 译文）',
    showOriginalPhoto: '显示原始照片',
    showOverlay: '在照片上显示译文'
  },
  glossary: { importCsv: '导入 CSV', exportCsv: '导出 CSV', imported: '已导入 {n} 个术语' },
  learning: { streakDays: '连续 {n} 天', bestStreak: '最佳：{n} 天', dailyGoal: '今天：{done}/{goal} 个练习' },
  settings: {
    study: '学习',
    goalLabel: '每日目标（练习数）',
    reminder: '每日提醒',
    reminderTitle: '该练习啦 🔥',
    reminderBody: '每天用 OmniLingo 几分钟，保持连续记录。',
    reminderDenied: '通知已关闭：请在设备设置中开启。',
    privacyShare: '共享字幕除外：共享房间时，识别出的文字会实时经过我们的中继服务器发送给房间内的人，不会被保存。'
  },
  onboarding: {
    title: '欢迎使用 OmniLingo',
    f1: '在设备上离线翻译 59 种语言',
    f2: '面对面对话和可通过二维码共享的实时字幕',
    f3: '翻译照片、PDF 和 Word 文档',
    f4: '用闪卡、常用语和发音练习学习',
    chooseLangs: '你使用哪些语言？',
    chooseHelp: '我们现在下载它们（每个约 30 MB，建议使用 Wi-Fi），这样无网络也能使用。以后可以在设置中更改。',
    downloading: '正在下载第 {done}/{total} 种语言…',
    skip: '稍后',
    download: '下载并开始',
    start: '开始'
  }
};

const ja = {
  liveRoom: {
    modeJoin: 'ルームに参加',
    shareTitle: '字幕を聴衆と共有',
    shareHelp: '聴衆はQRコードを読み取るかコードを入力します。各自が自分のスマホで、自分の言語で話者の言葉を読めます。',
    startShare: 'QRで共有',
    stopShare: '共有を終了',
    code: 'ルームコード',
    audience: '{n}人が接続中',
    reconnecting: '再接続中…',
    shareError: 'コードは使用中です。終了してからもう一度共有してください',
    shareHint: 'アプリがなくてもリンクからライブ字幕のウェブページを開けます。OmniLingoなら各自の端末で59言語に翻訳されます。',
    shareText: 'OmniLingoで私の発表をあなたの言語でライブ視聴できます。ルームコード：{code}',
    joinTitle: 'ライブ発表を視聴',
    joinHelp: '話者が表示するコードを入力するか、QRコードのリンクを開いてください。話した言葉がリアルタイムで届き、あなたのスマホであなたの言語に翻訳されます。',
    myLanguage: '自分の言語',
    join: '参加',
    badCode: 'コードは6文字の英数字です（例：ABC234）。',
    notFound: 'ルームが見つかりません。コードを確認するか、話者に共有の開始を依頼してください。',
    roomLabel: 'ルーム {code}',
    speakerSpeaks: '話者の言語：{lang}',
    leave: '退出',
    ended: '発表は終了しました',
    waitingSpeaker: '話者を待っています',
    waitingFirst: '話者が話し始めると、翻訳された字幕がここに表示されます'
  },
  textStudio: { showFull: '全画面で表示' },
  docsOcr: {
    exportWord: '翻訳をWord（.docx）で保存',
    exportBilingual: '対訳Wordで保存（原文 | 翻訳）',
    showOriginalPhoto: '元の写真を表示',
    showOverlay: '写真の上に翻訳を表示'
  },
  glossary: { importCsv: 'CSVを読み込む', exportCsv: 'CSVを書き出す', imported: '{n}件の用語を読み込みました' },
  learning: { streakDays: '{n}日連続', bestStreak: '最高記録：{n}日', dailyGoal: '今日：{done}/{goal}回の練習' },
  settings: {
    study: '学習',
    goalLabel: '1日の目標（練習数）',
    reminder: '毎日のリマインダー',
    reminderTitle: '練習の時間です 🔥',
    reminderBody: 'OmniLingoで数分練習して、連続記録をキープしましょう。',
    reminderDenied: '通知がオフになっています。端末の設定で許可してください。',
    privacyShare: '例外は共有字幕です。ルームを共有すると、認識されたテキストは当社の中継サーバーを経由してリアルタイムでルームの参加者に届き、保存されません。'
  },
  onboarding: {
    title: 'OmniLingoへようこそ',
    f1: '端末上で59言語をオフラインでも翻訳',
    f2: '対面会話と、QRで共有できるライブ字幕',
    f3: '写真・PDF・Word文書を翻訳',
    f4: '単語カード、フレーズ集、発音練習で学習',
    chooseLangs: 'どの言語を使いますか？',
    chooseHelp: '今ダウンロードしておけば（各約30MB、Wi-Fi推奨）インターネットなしで使えます。あとで設定から変更できます。',
    downloading: '{total}言語中{done}言語目をダウンロード中…',
    skip: 'あとで',
    download: 'ダウンロードして開始',
    start: '開始'
  }
};

const ar = {
  liveRoom: {
    modeJoin: 'الانضمام إلى غرفة',
    shareTitle: 'مشاركة الترجمة النصية مع الجمهور',
    shareHelp: 'يمسح الجمهور رمز QR أو يُدخل الرمز: يقرأ كل شخص كلام المتحدّث بلغته على هاتفه.',
    startShare: 'مشاركة عبر QR',
    stopShare: 'إيقاف المشاركة',
    code: 'رمز الغرفة',
    audience: '{n} متصل',
    reconnecting: 'جارٍ إعادة الاتصال…',
    shareError: 'الرمز مستخدم بالفعل: أوقف المشاركة ثم شارك من جديد',
    shareHint: 'من دون التطبيق يفتح الرابط صفحة ويب بالترجمة النصية المباشرة؛ ومع OmniLingo يتلقّاها كل شخص مترجمة على جهازه إلى 59 لغة.',
    shareText: 'تابع كلمتي مباشرةً بلغتك عبر OmniLingo. رمز الغرفة: {code}',
    joinTitle: 'متابعة كلمة مباشرة',
    joinHelp: 'أدخل الرمز الذي يعرضه المتحدّث (أو افتح رابط رمز QR). تصل كلماته مباشرةً وتُترجَم على هاتفك إلى لغتك.',
    myLanguage: 'لغتي',
    join: 'انضمام',
    badCode: 'يتكوّن الرمز من 6 أحرف أو أرقام، مثل ABC234.',
    notFound: 'لم يُعثر على الغرفة: تحقّق من الرمز أو اطلب من المتحدّث بدء المشاركة.',
    roomLabel: 'الغرفة {code}',
    speakerSpeaks: 'يتحدّث المتحدّث بـ {lang}',
    leave: 'مغادرة',
    ended: 'انتهت الكلمة',
    waitingSpeaker: 'في انتظار المتحدّث',
    waitingFirst: 'ستظهر هنا الترجمة النصية فور أن يبدأ المتحدّث الكلام'
  },
  textStudio: { showFull: 'عرض بملء الشاشة' },
  docsOcr: {
    exportWord: 'حفظ الترجمة كملف Word (.docx)',
    exportBilingual: 'حفظ ملف Word ثنائي اللغة (الأصل | الترجمة)',
    showOriginalPhoto: 'عرض الصورة الأصلية',
    showOverlay: 'عرض الترجمة على الصورة'
  },
  glossary: { importCsv: 'استيراد CSV', exportCsv: 'تصدير CSV', imported: 'تم استيراد {n} مصطلح' },
  learning: { streakDays: '{n} أيام متتالية', bestStreak: 'الأفضل: {n} أيام', dailyGoal: 'اليوم: {done}/{goal} تمارين' },
  settings: {
    study: 'الدراسة',
    goalLabel: 'الهدف اليومي (تمارين)',
    reminder: 'تذكير يومي',
    reminderTitle: 'حان وقت التمرّن 🔥',
    reminderBody: 'بضع دقائق مع OmniLingo تحافظ على سلسلتك.',
    reminderDenied: 'الإشعارات معطّلة: فعّلها من إعدادات الجهاز.',
    privacyShare: 'يُستثنى من ذلك الترجمة النصية المشتركة: عند مشاركة غرفة يمرّ النص المتعرَّف عليه في الوقت الفعلي عبر خادم التمرير لدينا إلى الموجودين في الغرفة ولا يُحفظ.'
  },
  onboarding: {
    title: 'مرحبًا بك في OmniLingo',
    f1: 'ترجم 59 لغة حتى دون اتصال، على جهازك',
    f2: 'محادثة وجهًا لوجه وترجمة نصية مباشرة تُشارك عبر QR',
    f3: 'ترجم الصور وملفات PDF ومستندات Word',
    f4: 'تعلّم بالبطاقات والعبارات والنطق',
    chooseLangs: 'ما اللغات التي تستخدمها؟',
    chooseHelp: 'ننزّلها الآن (نحو 30 ميغابايت لكل لغة، يُفضَّل عبر Wi-Fi) لتعمل دون إنترنت. يمكنك تغييرها لاحقًا من الإعدادات.',
    downloading: 'جارٍ تنزيل اللغة {done} من {total}…',
    skip: 'لاحقًا',
    download: 'تنزيل والبدء',
    start: 'ابدأ'
  }
};

export const UI_TRANSLATIONS_V11 = { it, en, es, fr, de, zh, ja, ar };

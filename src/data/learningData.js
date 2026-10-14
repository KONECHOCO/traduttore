// Curated Language Learning Academy content: Flashcards, Phrasebooks, False Friends, Verbs, and Quizzes

export const INITIAL_FLASHCARDS = [
  {
    id: 'fc-1',
    word: 'Serendipity',
    translation: 'Serendipità / Scoperta inattesa e fortunata',
    sourceLang: 'en',
    targetLang: 'it',
    ipa: '/ˌser.ənˈdɪp.ə.ti/',
    category: 'Advanced Vocabulary',
    example: 'Finding this solution was pure serendipity.',
    notes: 'Descrive l\'attitudine o la capacità di fare per caso scoperte felici e impreviste.'
  },
  {
    id: 'fc-2',
    word: 'Empowerment',
    translation: 'Emancipazione / Potenziamento',
    sourceLang: 'en',
    targetLang: 'it',
    ipa: '/ɪmˈpaʊ.ɚ.mənt/',
    category: 'Business & Leadership',
    example: 'Employee empowerment drives real innovation.',
    notes: 'Molto usato nel business per indicare la delega di responsabilità e fiducia.'
  },
  {
    id: 'fc-3',
    word: 'Sfumatura',
    translation: 'Nuance / Subtle distinction',
    sourceLang: 'it',
    targetLang: 'en',
    ipa: '/sfu.maˈtu.ra/',
    category: 'Linguistics & Art',
    example: 'Ogni lingua possiede sfumature intraducibili.',
    notes: 'Gradazione impercettibile di significato o colore.'
  },
  {
    id: 'fc-4',
    word: 'Desafío',
    translation: 'Sfida / Challenge',
    sourceLang: 'es',
    targetLang: 'it',
    ipa: '/de.saˈfi.o/',
    category: 'Essential Spanish',
    example: 'Este proyecto es un gran desafío para nosotros.',
    notes: 'Attenzione: in spagnolo "reto" e "desafío" sono sinonimi frequenti di sfida.'
  },
  {
    id: 'fc-5',
    word: 'Schadenfreude',
    translation: 'Piacere per le disgrazie altrui',
    sourceLang: 'de',
    targetLang: 'it',
    ipa: '/ˈʃaːdn̩ˌfʁɔɪ̯də/',
    category: 'German Culture',
    example: 'Er verspürte Schadenfreude, als sein Rivale scheiterte.',
    notes: 'Parola celebre senza traduzione diretta in molte lingue.'
  },
  {
    id: 'fc-6',
    word: 'Dépaysement',
    translation: 'Senso di spaesamento esotico',
    sourceLang: 'fr',
    targetLang: 'it',
    ipa: '/de.pɛ.iz.mɑ̃/',
    category: 'French Nuances',
    example: 'Ce voyage m\'a procuré un profond dépaysement.',
    notes: 'Sensazione gradevole di sentirsi lontani dalla propria routine.'
  }
];

export const PHRASEBOOKS = [
  {
    id: 'business',
    title: 'Business & Negoziazione',
    icon: 'Briefcase',
    phrases: [
      {
        orig: 'Possiamo programmare una riunione per discutere i dettagli della partnership?',
        trans: 'Can we schedule a meeting to discuss the partnership details?',
        phonetic: '/kæn wiː ˈskɛdʒuːl ə ˈmiːtɪŋ tuː dɪˈskʌs ðə ˈpɑːtnəʃɪp ˈdiːteɪlz/',
        tip: 'Usare "schedule" invece di "make a meeting" suona molto più professionale.'
      },
      {
        orig: 'Vorremmo raggiungere un accordo reciprocamente vantaggioso.',
        trans: 'We would like to reach a mutually beneficial agreement (win-win).',
        phonetic: '/wiː wʊd laɪk tuː riːtʃ ə ˈmjuːtʃuəli ˌbɛnɪˈfɪʃəl əˈɡriːmənt/',
        tip: '"Mutually beneficial" è il termine standard nei contratti internazionali.'
      },
      {
        orig: 'Invierò il verbale e i punti d\'azione entro la fine della giornata.',
        trans: 'I will circulate the minutes and action items by end of day (EOD).',
        phonetic: '/aɪ wɪl ˈsɜːkjʊleɪt ðə ˈmɪnɪts ænd ˈækʃən ˈaɪtəmz baɪ ɛnd ɒv deɪ/',
        tip: 'EOD (End of Day) è l\'acronimo universale nelle multinazionali.'
      }
    ]
  },
  {
    id: 'travel',
    title: 'Viaggi, Dogana & Aeroporto',
    icon: 'Plane',
    phrases: [
      {
        orig: 'A che gate è previsto l\'imbarco per il volo in coincidenza?',
        trans: 'Which gate is scheduled for the connecting flight?',
        phonetic: '/wɪtʃ ɡeɪt ɪz ˈskɛdʒuːld fɔː ðə kəˈnɛktɪŋ flaɪt/',
        tip: '"Connecting flight" è il termine esatto per il volo di coincidenza.'
      },
      {
        orig: 'Ho perso la coincidenza a causa del ritardo, potete riprenotarmi?',
        trans: 'I missed my connection due to the delay, could you rebook me?',
        phonetic: '/aɪ mɪst maɪ kəˈnɛkʃən djuː tuː ðə dɪˈleɪ, kʊd juː ˌriːˈbʊk miː/',
        tip: 'Mantenere un tono gentile con "Could you..." garantisce assistenza prioritaria.'
      },
      {
        orig: 'Non trovo il mio bagaglio registrato sul nastro di riconsegna.',
        trans: 'My checked baggage did not appear on the carousel.',
        phonetic: '/maɪ tʃɛkt ˈbæɡɪdʒ dɪd nɒt əˈpɪər ɒn ðə ˌkærəˈsɛl/',
        tip: 'Il nastro bagagli in aeroporto si chiama "carousel" o "baggage claim belt".'
      }
    ]
  },
  {
    id: 'conference',
    title: 'Conferenze & Presentazioni Pubbliche',
    icon: 'Mic',
    phrases: [
      {
        orig: 'Grazie a tutti per essere qui oggi. Vorrei passare la parola al relatore.',
        trans: 'Thank you all for joining today. I would like to hand over to the speaker.',
        phonetic: '/θæŋk juː ɔːl fɔː ˈdʒɔɪnɪŋ təˈdeɪ. aɪ wʊd laɪk tuː hænd ˈoʊvər tuː ðə ˈspiːkər/',
        tip: '"Hand over to" è l\'espressione regina per cedere la parola in conferenza.'
      },
      {
        orig: 'Se avete domande, vi preghiamo di utilizzare il microfono o scrivere in chat.',
        trans: 'If you have any questions, please step up to the mic or post them in the chat.',
        phonetic: '/ɪf juː hæv ˈɛni ˈkwɛstʃənz, pliːz stɛp ʌp tuː ðə maɪk ɔːr poʊst ðɛm ɪn ðə tʃæt/',
        tip: 'Frase indispensabile per chi modera eventi ibridi o webinar.'
      }
    ]
  },
  {
    id: 'medical',
    title: 'Emergenza & Sanità',
    icon: 'Activity',
    phrases: [
      {
        orig: 'Ho un\'allergia grave alla penicillina e ai frutti di mare.',
        trans: 'I have a severe allergy to penicillin and shellfish.',
        phonetic: '/aɪ hæv ə sɪˈvɪər ˈælədʒi tuː ˌpɛnɪˈsɪlɪn ænd ˈʃɛlˌfɪʃ/',
        tip: 'Mostrare questa frase in farmacia o al pronto soccorso può salvare la vita.'
      },
      {
        orig: 'Ho bisogno di consultare un medico che parli la mia lingua.',
        trans: 'I urgently need to consult a doctor who speaks my language.',
        phonetic: '/aɪ ˈɜːdʒəntli niːd tuː kənˈsʌlt ə ˈdɒktər huː spiːks maɪ ˈlæŋɡwɪdʒ/',
        tip: 'Negli ospedali internazionali è sempre disponibile un servizio di interprete.'
      }
    ]
  }
];

export const FALSE_FRIENDS = [
  {
    word: 'Actually',
    apparent: 'Attualmente',
    correct: 'In realtà, a dire il vero',
    actualTranslation: 'Per dire "attualmente" in inglese si usa "Currently" o "At present".',
    languages: 'EN - IT'
  },
  {
    word: 'Preservative',
    apparent: 'Preservativo',
    correct: 'Conservante alimentare',
    actualTranslation: 'Per "preservativo" si usa "Condom". Evita gaffe imbarazzanti al supermercato!',
    languages: 'EN - IT'
  },
  {
    word: 'Sensible',
    apparent: 'Sensibile',
    correct: 'Ragionevole, assennato',
    actualTranslation: 'Per "sensibile" si usa "Sensitive".',
    languages: 'EN - IT'
  },
  {
    word: 'Eventually',
    apparent: 'Eventualmente',
    correct: 'Alla fine, col tempo',
    actualTranslation: 'Per "eventualmente" si usa "If necessary" o "Possibly".',
    languages: 'EN - IT'
  },
  {
    word: 'Constipado (Spagnolo)',
    apparent: 'Stitico',
    correct: 'Raffreddato (avere il raffreddore)',
    actualTranslation: 'In Spagna "estoy constipado" significa "ho il raffreddore"!',
    languages: 'ES - IT'
  },
  {
    word: 'Attend',
    apparent: 'Attendere (aspettare)',
    correct: 'Partecipare, presenziare (es. a una conferenza)',
    actualTranslation: 'Per "aspettare" si usa "Wait". To attend a meeting = partecipare a una riunione.',
    languages: 'EN - IT'
  }
];

export const VERB_CONJUGATIONS = {
  'to be': {
    infinitive: 'To be (Essere)',
    lang: 'English',
    present: ['I am', 'You are', 'He/She/It is', 'We are', 'You are', 'They are'],
    past: ['I was', 'You were', 'He/She was', 'We were', 'You were', 'They were'],
    future: ['I will be', 'You will be', 'He will be', 'We will be', 'You will be', 'They will be']
  },
  'to have': {
    infinitive: 'To have (Avere)',
    lang: 'English',
    present: ['I have', 'You have', 'He/She has', 'We have', 'You have', 'They have'],
    past: ['I had', 'You had', 'He/She had', 'We had', 'You had', 'They had'],
    future: ['I will have', 'You will have', 'He will have', 'We will have', 'They will have']
  },
  'ir': {
    infinitive: 'Ir (Andare - Spagnolo)',
    lang: 'Español',
    present: ['Yo voy', 'Tú vas', 'Él/Ella va', 'Nosotros vamos', 'Vosotros vais', 'Ellos van'],
    past: ['Yo fui', 'Tú fuiste', 'Él fue', 'Nosotros fuimos', 'Vosotros fuisteis', 'Ellos fueron'],
    future: ['Yo iré', 'Tú irás', 'Él irá', 'Nosotros iremos', 'Vosotros iréis', 'Ellos irán']
  },
  'être': {
    infinitive: 'Être (Essere - Francese)',
    lang: 'Français',
    present: ['Je suis', 'Tu es', 'Il/Elle est', 'Nous sommes', 'Vous êtes', 'Ils sont'],
    past: ['J\'ai été', 'Tu as été', 'Il a été', 'Nous avons été', 'Vous avez été', 'Ils ont été'],
    future: ['Je serai', 'Tu seras', 'Il sera', 'Nous serons', 'Vous serez', 'Ils seront']
  }
};

export const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'Qual è il significato corretto del falso amico inglese "ACTUALLY"?',
    options: [
      'In realtà / A dire il vero',
      'Attualmente / In questo momento',
      'Certamente / Senza dubbio',
      'Reciprocamente'
    ],
    correctIndex: 0,
    explanation: '"Actually" significa "in realtà". Per dire attualmente si usa "Currently".'
  },
  {
    id: 'q2',
    question: 'In una email formale in inglese, come si conclude professionalmente al posto di "Ciao"?',
    options: [
      'Sincerely yours / Kind regards',
      'See you later',
      'Cheers mate',
      'Kisses'
    ],
    correctIndex: 0,
    explanation: '"Kind regards" o "Sincerely yours" sono le formule di chiusura business più prestigiose.'
  },
  {
    id: 'q3',
    question: 'In spagnolo, che cosa significa l\'espressione "Estoy constipado"?',
    options: [
      'Ho il raffreddore',
      'Ho problemi intestinali',
      'Sono molto stanco',
      'Ho molta fretta'
    ],
    correctIndex: 0,
    explanation: 'In spagnolo "constipado" significa raffreddato. È uno dei falsi amici più famosi!'
  },
  {
    id: 'q4',
    question: 'Cosa si intende in una conferenza internazionale quando il moderatore dice "I hand over to the speaker"?',
    options: [
      'Cede la parola al relatore',
      'Chiede al relatore di andarsene',
      'Consegna un premio al relatore',
      'Interrompe la presentazione'
    ],
    correctIndex: 0,
    explanation: '"Hand over to" significa passare il testimone o dare la parola al relatore successivo.'
  },
  {
    id: 'q5',
    question: 'Qual è la forma corretta del passato di "To Be" per "They"?',
    options: [
      'They were',
      'They was',
      'They been',
      'They did'
    ],
    correctIndex: 0,
    explanation: 'La forma corretta per il plurale al passato del verbo to be è "were".'
  }
];

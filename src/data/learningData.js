// Contenuti dell'Accademia.
// Il frasario è scritto in inglese (lingua pivot di ML Kit) e viene tradotto on-device nella lingua
// che l'utente studia e nella lingua dell'interfaccia: così vale per ogni coppia di lingue.

export const PHRASEBOOK = {
  basics: [
    'Hello, how are you?',
    'Thank you very much.',
    'Excuse me, do you speak English?',
    'I do not understand.',
    'Could you speak more slowly, please?',
    'What is your name?',
    'Nice to meet you.',
    'See you tomorrow.'
  ],
  travel: [
    'Where is the train station?',
    'How much does a ticket cost?',
    'I would like to check in, I have a reservation.',
    'Which gate does the flight leave from?',
    'Can you call a taxi for me?',
    'My luggage has not arrived.',
    'How do I get to the city center?',
    'Is there free Wi-Fi here?'
  ],
  restaurant: [
    'A table for two, please.',
    'Can I see the menu?',
    'I am allergic to nuts.',
    'What do you recommend?',
    'Could we have the bill, please?',
    'Is service included?',
    'Water without gas, please.'
  ],
  business: [
    'Can we schedule a meeting for next week?',
    'I will send you the documents by email.',
    'We would like to reach an agreement.',
    'Could you clarify this point?',
    'Let us summarize the next steps.',
    'Thank you for your time.',
    'What is the deadline for this project?'
  ],
  conference: [
    'Thank you all for being here today.',
    'I would now like to hand over to our next speaker.',
    'If you have questions, please raise your hand.',
    'The slides will be shared after the session.',
    'We will take a short break of fifteen minutes.',
    'Could you repeat the question, please?'
  ],
  health: [
    'I need a doctor.',
    'Where is the nearest pharmacy?',
    'Call an ambulance!',
    'I have a pain here.',
    'I am taking this medication.',
    'I have a severe allergy to penicillin.'
  ],
  shopping: [
    'How much is this?',
    'Can I pay by card?',
    'Do you have a smaller size?',
    'I am just looking, thank you.',
    'Can I get a receipt?',
    'Where is the fitting room?'
  ]
};

export const PHRASEBOOK_CATEGORIES = Object.keys(PHRASEBOOK);

// Intervalli del ripasso a intervalli (sistema Leitner): scatola 0 = subito, poi 1, 3, 7, 16, 35 giorni
export const SRS_INTERVALS_DAYS = [0, 1, 3, 7, 16, 35];

export function scheduleCard(card, knew) {
  const box = knew ? Math.min((card.box || 0) + 1, SRS_INTERVALS_DAYS.length - 1) : 0;
  const due = Date.now() + SRS_INTERVALS_DAYS[box] * 24 * 60 * 60 * 1000;
  return { ...card, box, due, reviews: (card.reviews || 0) + 1 };
}

export function isDue(card) {
  return (card.due || 0) <= Date.now();
}

// Falsi amici inglese ↔ italiano (spiegazioni in italiano: il radar compare solo con interfaccia italiana)
export const FALSE_FRIENDS = [
  { word: 'Actually', apparent: 'Attualmente', correct: 'In realtà, a dire il vero', actualTranslation: 'Per "attualmente" si usa "currently" o "at present".' },
  { word: 'Preservative', apparent: 'Preservativo', correct: 'Conservante', actualTranslation: 'Per "preservativo" si usa "condom".' },
  { word: 'Sensible', apparent: 'Sensibile', correct: 'Ragionevole, assennato', actualTranslation: 'Per "sensibile" si usa "sensitive".' },
  { word: 'Eventually', apparent: 'Eventualmente', correct: 'Alla fine, col tempo', actualTranslation: 'Per "eventualmente" si usa "possibly" o "if necessary".' },
  { word: 'Attend', apparent: 'Attendere', correct: 'Partecipare, frequentare', actualTranslation: 'Per "attendere" si usa "wait". To attend a meeting = partecipare a una riunione.' },
  { word: 'Library', apparent: 'Libreria', correct: 'Biblioteca', actualTranslation: 'Per "libreria" (negozio) si usa "bookshop" o "bookstore".' },
  { word: 'Factory', apparent: 'Fattoria', correct: 'Fabbrica', actualTranslation: 'Per "fattoria" si usa "farm".' },
  { word: 'Argument', apparent: 'Argomento', correct: 'Litigio, discussione', actualTranslation: 'Per "argomento" si usa "topic" o "subject".' },
  { word: 'Morbid', apparent: 'Morbido', correct: 'Morboso, macabro', actualTranslation: 'Per "morbido" si usa "soft".' },
  { word: 'Educated', apparent: 'Educato', correct: 'Istruito, colto', actualTranslation: 'Per "educato" si usa "polite" o "well-mannered".' },
  { word: 'Annoyed', apparent: 'Annoiato', correct: 'Infastidito, seccato', actualTranslation: 'Per "annoiato" si usa "bored".' },
  { word: 'Camera', apparent: 'Camera (stanza)', correct: 'Macchina fotografica', actualTranslation: 'Per "camera" si usa "room" o "bedroom".' }
];

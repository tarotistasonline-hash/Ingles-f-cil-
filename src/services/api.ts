import { SpeakTweakResult, SessionConfidenceFeedback } from '../types';

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 7000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export async function fetchSpeakTweak(
  userPhrase: string,
  context?: string
): Promise<SpeakTweakResult> {
  try {
    const res = await fetchWithTimeout('/api/speak-tweak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userPhrase, context }),
    }, 7000);

    if (res.ok) {
      const data = await res.json();
      if (data && data.nativeReal) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Network issue fetching tweak, falling back to local transformer:', err);
  }

  // Graceful client fallback to guarantee instant disassembly
  const lower = (userPhrase || '').toLowerCase();
  
  if (lower.includes('descuento') || lower.includes('rebaja') || lower.includes('discount') || lower.includes('tacaño')) {
    return {
      literalSchool: 'I want to ask for a reduction of money without appearing cheap.',
      nativeReal: 'Is there any wiggle room on the price?',
      casualSlang: 'Could you cut me a deal on this?',
      connectedSpeech: 'ɪz ðɛr ˈɛni ˈwɪɡəl rʊm ɑn ðə praɪs',
      whyItSoundsNatural:
        "Preguntar 'Is there any wiggle room on the price?' es la forma más educada y natural de pedir rebaja sin sonar tacaño ni agresivo.",
      powerChunk: 'Is there any wiggle room on...?',
    };
  }

  if (lower.includes('dejalo') || lower.includes('déjalo') || lower.includes('encargo yo') || lower.includes('después me')) {
    return {
      literalSchool: 'Leave it in that position and I will make the responsibility later.',
      nativeReal: 'Just leave it there, I got this!',
      casualSlang: "Leave it be, I'll take care of it.",
      connectedSpeech: 'dʒʌst liːv ɪt ðɛr, aɪ ɡɑt ðɪs',
      whyItSoundsNatural:
        "'I got this' es el bloque universal de resolución. No traduzcas 'I will take charge', simplemente di 'I got this'.",
      powerChunk: 'Just leave it there, I got this...',
    };
  }

  if (lower.includes('juntada') || lower.includes('fiesta') || lower.includes('party') || lower.includes('no puedo')) {
    return {
      literalSchool: 'I will not be able to attend the celebration due to reasons.',
      nativeReal: "I'm so sorry, I won't be able to make it tonight!",
      casualSlang: 'Gotta pass tonight, have fun though!',
      connectedSpeech: "aɪ woʊnt bi ˈeɪbəl tə meɪk ɪt",
      whyItSoundsNatural:
        "'Make it' es el bloque universal de los nativos para asistir a un evento. 'I won't be able to make it' es educado, fluido y 100% natural.",
      powerChunk: "I won't be able to make it...",
    };
  }

  if (lower.includes('coffee') || lower.includes('cafe') || lower.includes('café')) {
    return {
      literalSchool: 'I desire to buy a coffee with milk, please.',
      nativeReal: 'Can I grab an iced latte to go?',
      casualSlang: 'Gonna get a quick brew.',
      connectedSpeech: 'kə-naɪ ɡræb ən aɪst ˈlɑ-teɪ tə ɡoʊ',
      whyItSoundsNatural:
        "Los nativos usan 'Can I grab...' como un bloque automático en el 90% de sus pedidos sin pensar en conjugaciones.",
      powerChunk: 'Can I grab...',
    };
  }

  if (lower.includes('hambre') || lower.includes('hunger') || lower.includes('eat') || lower.includes('comer')) {
    return {
      literalSchool: 'I have very much hunger and I need food immediately.',
      nativeReal: "I'm starving, let's grab a bite!",
      casualSlang: 'Famished! Down for some tacos?',
      connectedSpeech: "aɪm ˈstɑrvɪŋ, lɛts ɡræb ə baɪt",
      whyItSoundsNatural:
        "En inglés nunca se dice 'I have hunger'. Se usa el adjetivo 'I'm starving' o el bloque 'grab a bite'.",
      powerChunk: "Let's grab a bite...",
    };
  }

  if (lower.includes('rain') || lower.includes('lluvia')) {
    return {
      literalSchool: 'I think that tomorrow it is going to rain a lot.',
      nativeReal: "Looks like it's gonna pour tomorrow.",
      casualSlang: 'Total washout tomorrow!',
      connectedSpeech: "lʊks laɪk ɪts ˈɡənə pɔr təˈmɔroʊ",
      whyItSoundsNatural:
        "'Looks like...' es el conector natural para charlar sobre el clima de manera espontánea y relajada.",
      powerChunk: "Looks like it's gonna...",
    };
  }

  return {
    literalSchool: `I think that ${userPhrase.trim()}.`,
    nativeReal: `I was wondering if we could ${userPhrase.replace(/^(i|yo|quiero)\s+/i, '').trim() || 'handle this'}.`,
    casualSlang: 'You might as well go for it!',
    connectedSpeech: 'aɪ wəz ˈwʌndərɪŋ ɪf wi kʊd...',
    whyItSoundsNatural:
      "Los nativos prefieren suavizar sus pensamientos usando bloques como 'I was wondering if...' o 'It feels like...', lo que elimina la rigidez de traducir palabra por palabra.",
    powerChunk: 'I was wondering if...',
  };
}

export async function sendRoleplayTurn(payload: {
  scenarioId: string;
  scenarioTitle: string;
  scenarioPersona: string;
  history: { role: string; text: string }[];
  userSpeech: string;
}) {
  try {
    const res = await fetch('/api/roleplay-turn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.characterReply) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Network issue in roleplay turn:', err);
  }

  return {
    characterReply: "Totally get you! Sounds good, let's keep things rolling.",
    userFeedback: {
      naturalness: 'natural',
      nativeAlternative: "Yeah, sounds like a plan!",
      soundTip: "Une las palabras sin pausar: 'sounds-like-a-plan'.",
      whyExplanation: "Usar expresiones directas como 'sounds like a plan' te hace sonar seguro y espontáneo.",
    },
  };
}

export async function evaluateRoleplaySession(payload: {
  scenarioTitle: string;
  scenarioPersona: string;
  messages: { role: string; text: string }[];
}): Promise<SessionConfidenceFeedback> {
  try {
    const res = await fetch('/api/roleplay-evaluate-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.overallConfidenceScore === 'number') {
        return data;
      }
    }
  } catch (err) {
    console.warn('Network issue evaluating session:', err);
  }

  const userMessages = payload.messages.filter((m) => m.role === 'user');
  const userTurnsCount = userMessages.length;
  const baseScore = Math.min(94, Math.max(76, 75 + userTurnsCount * 4));

  return {
    overallConfidenceScore: baseScore,
    spontaneityScore: Math.min(96, baseScore + 2),
    chunksScore: Math.min(95, baseScore - 2),
    comfortScore: Math.min(98, baseScore + 4),
    badgeTitle: userTurnsCount >= 3 ? 'Conversador Espontáneo' : 'Primer Paso Seguro',
    keyStrength:
      'Respondiste con decisión sin quedarte atrapado en la traducción mental.',
    topNativeTweak: {
      whatUserSaid: userMessages[userMessages.length - 1]?.text || 'I want to ask something',
      nativeUpgrade: "Sounds awesome, I'm all set!",
      whyItFlows: "Usar expresiones directas transmite confianza inmediata.",
    },
    summaryFeedback:
      '¡Tu flujo natural es notable! Demostraste gran disposición a interactuar sin obsesionarte con reglas gramaticales.',
    recommendedNextStep:
      'Sigue incorporando bloques de arranque como "I was wondering if..." para que cada intercambio empiece en piloto automático.',
  };
}

export async function askTeacher(query: string) {
  try {
    const res = await fetchWithTimeout('/api/coach-ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    }, 7000);

    if (res.ok) {
      const data = await res.json();
      if (data && data.answer) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Network issue asking teacher, falling back to local answer:', err);
  }

  const lower = (query || '').toLowerCase();

  if (lower.includes('descuento') || lower.includes('rebaja') || lower.includes('discount') || lower.includes('tacaño') || lower.includes('barato')) {
    return {
      answer:
        "¡Excelente pregunta! Para pedir un descuento sin sonar tacaño, los nativos suavizan la pregunta con amabilidad usando el bloque **'Is there any wiggle room on the price?'** (¿Hay algún margen de descuento?) o simplemente **'Could you do [monto]?'**. Suena educado y muy natural.",
      powerChunk: "Is there any wiggle room on...?",
      naturalExamples: [
        { en: "Is there any wiggle room on the price?", es: "¿Habría alguna posibilidad de rebaja en el precio?", chunkNote: "Educado y coloquial" },
        { en: "Could you do $20 for both?", es: "¿Me lo podrías dejar en $20 los dos?", chunkNote: "En mercados o ferias" },
      ],
      soundTip: "Une 'wiggle room' /wɪɡəl rʊm/ con ritmo relajado y una sonrisa en la voz.",
    };
  }

  if (lower.includes('cancelo') || lower.includes('cancelar') || lower.includes('cita') || lower.includes('grosero') || lower.includes('plata') || lower.includes('reunión')) {
    return {
      answer:
        "Para cancelar un plan sin quedar mal, nunca digas 'I cancel the appointment'. En inglés se usa el bloque de oro: **'Something came up, can we take a rain check?'** (Surgió un imprevisto, ¿lo podemos dejar para después?). Es cálido, comprensivo y nadie se ofende.",
      powerChunk: "Something came up, could we...?",
      naturalExamples: [
        { en: "Something came up, could we take a rain check?", es: "Me surgió un imprevisto, ¿podemos dejarlo para otro día?", chunkNote: "Súper educado" },
        { en: "I'm so sorry, I won't be able to make it today.", es: "Mil disculpas, no voy a poder llegar hoy.", chunkNote: "Uso diario" },
      ],
      soundTip: "El bloque 'Something came up' se pronuncia de un solo tiro: /sʌmθɪŋ keɪm ʌp/.",
    };
  }

  if (lower.includes('pereza') || lower.includes('lazy') || lower.includes('ganas')) {
    return {
      answer:
        "¡Olvídate de decir 'I have laziness'! En inglés los nativos dicen **'I can't be bothered'** o **'I don't feel like it'**. Son bloques automáticos que expresan esa falta de ganas sin inventar traducciones raras.",
      powerChunk: "I can't be bothered to...",
      naturalExamples: [
        { en: "I can't be bothered to cook tonight.", es: "Me da una pereza tremenda cocinar hoy.", chunkNote: "Uso diario" },
        { en: "I really don't feel like going out.", es: "No tengo nada de ganas de salir.", chunkNote: "Muy natural" },
      ],
      soundTip: "Pronuncia 'can't be bothered' de corrido: /kænt bi ˈbɑðərd/",
    };
  }

  const cleanQ = (query || '').replace(/[¿?]/g, '').trim();
  return {
    answer:
      `¡Hola! Me alegra que me preguntes sobre "${cleanQ || 'esta duda'}". En inglés real, la regla de oro de la profe es no traducir palabra por palabra. Los nativos usan bloques automáticos que se dicen con ritmo y confianza, como **'I was wondering if...'** o **'How does that sound?'**.`,
    powerChunk: "I was wondering if...",
    naturalExamples: [
      { en: "I was wondering if that works for you.", es: "Me preguntaba si eso te queda bien / te sirve.", chunkNote: "Cálido y seguro" },
      { en: "No worries at all, you're good!", es: "¡Cero problema, no te preocupes!", chunkNote: "Alivio instantáneo" },
    ],
    soundTip: "Recuerda pronunciar las frases en bloques continuos sin frenar entre cada palabra.",
  };
}

export const askCoachLeo = askTeacher;

export async function evaluateGymReflex(payload: {
  challengePrompt: string;
  expectedChunk: string;
  userSpeech: string;
}) {
  try {
    const res = await fetch('/api/gym-evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.score === 'number') {
        return data;
      }
    }
  } catch (err) {
    console.warn('Network issue evaluating gym:', err);
  }

  const hasSpeech = Boolean(payload.userSpeech && payload.userSpeech.trim());
  return {
    score: hasSpeech ? 92 : 75,
    isNatural: true,
    feedback: hasSpeech
      ? "¡Gran reflejo! Lo dijiste con soltura y sin dudar."
      : "Buen intento, la clave es disparar el bloque en menos de 3 segundos.",
    nativeVersion: payload.expectedChunk || "No worries at all!",
    rhythmHint: "Acentúa la primera palabra con fuerza y deja caer el final con suavidad.",
  };
}

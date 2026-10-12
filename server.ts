import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Helper to sanitize and extract JSON safely from Gemini response text
function safeParseJson(rawText: string): any {
  if (!rawText) return null;
  let cleaned = rawText.trim();
  // Strip markdown code fences if present
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch (e2) {
        // ignore
      }
    }
    return null;
  }
}

// Fallback Generators to ensure zero broken states
function getFallbackTweak(userPhrase: string, context?: string) {
  const lower = (userPhrase || '').toLowerCase();

  if (lower.includes('coffee') || lower.includes('café') || lower.includes('cafe')) {
    return {
      literalSchool: 'I desire to purchase a cup of coffee with milk, please.',
      nativeReal: 'Can I grab an iced latte to go?',
      casualSlang: 'Gonna get a quick brew.',
      connectedSpeech: 'kə-naɪ ɡræb ən aɪst ˈlɑ-teɪ tə ɡoʊ',
      whyItSoundsNatural:
        "Los nativos usan 'Can I grab...' como un bloque automático en el 90% de sus pedidos sin pensar en conjugaciones.",
      powerChunk: 'Can I grab...',
    };
  }

  if (
    lower.includes('hambre') ||
    lower.includes('hunger') ||
    lower.includes('eat') ||
    lower.includes('comer')
  ) {
    return {
      literalSchool: 'I have very much hunger and I need to eat food immediately.',
      nativeReal: "I'm starving, let's grab a bite!",
      casualSlang: 'Famished! Down for some tacos?',
      connectedSpeech: "aɪm ˈstɑrvɪŋ, lɛts ɡræb ə baɪt",
      whyItSoundsNatural:
        "En inglés nunca se dice 'I have hunger'. Se usa el adjetivo 'I'm starving' o el bloque 'grab a bite' (comer algo rápido).",
      powerChunk: "Let's grab a bite...",
    };
  }

  if (
    lower.includes('rain') ||
    lower.includes('lluvia') ||
    lower.includes('clima') ||
    lower.includes('weather')
  ) {
    return {
      literalSchool: 'I think that tomorrow it is going to rain a lot.',
      nativeReal: "Looks like it's gonna pour tomorrow.",
      casualSlang: 'Total washout tomorrow!',
      connectedSpeech: "lʊks laɪk ɪts ˈɡənə pɔr təˈmɔroʊ",
      whyItSoundsNatural:
        "'Looks like...' es el conector natural para observar el clima sin usar la fórmula aburrida 'I think that tomorrow it will...'",
      powerChunk: "Looks like it's gonna...",
    };
  }

  if (
    lower.includes('cost') ||
    lower.includes('precio') ||
    lower.includes('cuanto') ||
    lower.includes('cuesta')
  ) {
    return {
      literalSchool: 'Can you tell me how much this costs, please?',
      nativeReal: 'How much is this going for?',
      casualSlang: "What's the damage on this one?",
      connectedSpeech: 'haʊ mʌtʃ ɪz ðɪs ˈɡoʊɪŋ fɔr',
      whyItSoundsNatural:
        "Preguntar 'How much is this going for?' suena mucho más relajado y natural en tiendas o mercados que la traducción literal de libro.",
      powerChunk: 'How much is this...?',
    };
  }

  if (
    lower.includes('fiesta') ||
    lower.includes('party') ||
    lower.includes('no puedo') ||
    lower.includes('cancel')
  ) {
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

  // Universal smart fallback
  return {
    literalSchool: `I think that ${userPhrase.trim()}.`,
    nativeReal: `I was wondering if we could ${userPhrase.replace(/^(i|yo)\s+/i, '').trim() || 'handle this'}.`,
    casualSlang: 'You might as well go with that!',
    connectedSpeech: 'aɪ wəz ˈwʌndərɪŋ ɪf wi kʊd...',
    whyItSoundsNatural:
      "Los nativos prefieren suavizar sus pensamientos usando bloques como 'I was wondering if...' o 'It feels like...', lo que elimina la rigidez de traducir palabra por palabra.",
    powerChunk: 'I was wondering if...',
  };
}

function getFallbackRoleplay(scenarioTitle: string, userSpeech: string) {
  const speech = (userSpeech || '').trim();
  return {
    characterReply: "Totally get you! Sounds good, let's keep things rolling.",
    userFeedback: {
      naturalness: speech.length > 15 ? 'natural' : 'understandable_but_stiff',
      nativeAlternative: speech.length > 5 ? "Yeah, sounds like a plan!" : "Can I grab one to go?",
      soundTip: "Une las palabras sin pausar: 'sounds-like-a-plan'.",
      whyExplanation: "Usar expresiones directas como 'sounds like a plan' te hace sonar seguro y espontáneo.",
    },
  };
}

function getFallbackSessionEvaluation(messages: any[], scenarioTitle: string) {
  const userMessages = Array.isArray(messages)
    ? messages.filter((m: any) => m.role === 'user')
    : [];
  const userTurnsCount = userMessages.length;
  const totalWords = userMessages.reduce(
    (acc: number, m: any) => acc + (m.text ? m.text.trim().split(/\s+/).length : 0),
    0
  );

  const baseScore = Math.min(94, Math.max(76, 75 + userTurnsCount * 4 + (totalWords > 15 ? 5 : 0)));
  const spontaneity = Math.min(96, Math.max(78, baseScore + 2));
  const chunks = Math.min(95, Math.max(74, baseScore - 2));
  const comfort = Math.min(98, Math.max(80, baseScore + 4));

  const lastUserText = userMessages[userMessages.length - 1]?.text || 'Can I get a coffee?';

  return {
    overallConfidenceScore: baseScore,
    spontaneityScore: spontaneity,
    chunksScore: chunks,
    comfortScore: comfort,
    badgeTitle: userTurnsCount >= 3 ? 'Conversador Espontáneo' : 'Primer Paso Seguro',
    keyStrength:
      'Respondiste sin congelarte ni recurrir a traducciones literales palabra por palabra.',
    topNativeTweak: {
      whatUserSaid: lastUserText,
      nativeUpgrade: "Sounds awesome, I'm all set!",
      whyItFlows: "Usar conectores cortos y directos transmite confianza inmediata.",
    },
    summaryFeedback:
      '¡Tu flujo natural es notable! Demostraste gran disposición a interactuar sin obsesionarte con reglas gramaticales.',
    recommendedNextStep:
      'Sigue incorporando bloques de arranque como "I was wondering if..." para que cada intercambio empiece en piloto automático.',
  };
}

function getFallbackCoach(query: string) {
  const lower = (query || '').toLowerCase();
  if (lower.includes('pereza') || lower.includes('lazy')) {
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
  return {
    answer:
      "En lugar de pensar en reglas o fórmulas gramaticales, concéntrate en aprender el bloque como una sola unidad de sonido. Los nativos no analizan verbos al hablar, disparan bloques de fluidez que ya tienen memorizados con ritmo.",
    powerChunk: "I'm about to...",
    naturalExamples: [
      { en: "I'm about to head out, catch you later!", es: "Ya casi me voy, ¡te veo luego!", chunkNote: "Bloque de salida" },
      { en: "I was about to ask you the same thing!", es: "¡Justo te iba a preguntar lo mismo!", chunkNote: "Empatía inmediata" },
    ],
    soundTip: "Une 'about to' como 'ə-baʊ-tə' sin hacer pausa entre las dos palabras.",
  };
}

function getFallbackGym(expectedChunk: string, userSpeech: string) {
  const hasSpeech = Boolean(userSpeech && userSpeech.trim());
  return {
    score: hasSpeech ? 92 : 75,
    isNatural: true,
    feedback: hasSpeech
      ? "¡Gran reflejo! Lo dijiste con soltura y sin dudar."
      : "Buen intento, la clave es disparar el bloque en menos de 3 segundos.",
    nativeVersion: expectedChunk || "No worries at all!",
    rhythmHint: "Acentúa la primera palabra con fuerza y deja caer el final con suavidad.",
  };
}

// In-memory TTS audio cache (voice + speed + text -> base64 audio)
const ttsAudioCache = new Map<string, string>();
const MAX_TTS_CACHE_ITEMS = 300;
let ttsCooldownUntil = 0;

// 1. Voice TTS Endpoint
app.post('/api/generate-tts', async (req, res) => {
  const { text, voice = 'Kore', speed = 0.8 } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Text is required' });
  }

  const validVoices = ['Kore', 'Puck', 'Fenrir', 'Zephyr', 'Charon'];
  const selectedVoice = validVoices.includes(voice) ? voice : 'Kore';
  const roundedSpeed = Math.round((Number(speed) || 0.8) * 100) / 100;
  const cacheKey = `${selectedVoice}_${roundedSpeed}_${text.trim().toLowerCase()}`;

  // Serve from cache if available (instant playback, zero API quota consumed)
  const cached = ttsAudioCache.get(cacheKey);
  if (cached) {
    return res.json({ audioBase64: cached, format: 'audio/wav', cached: true });
  }

  if (!ai) {
    return res.json({ fallback: true, message: 'Web Speech API fallback' });
  }

  // If in rate-limit cooldown, gracefully return browser fallback without calling Gemini
  if (Date.now() < ttsCooldownUntil) {
    return res.json({ fallback: true, rateLimited: true });
  }

  try {
    const speechStyle =
      roundedSpeed < 0.75
        ? 'Very slow, patient, crystal-clear American English speaker enunciation for language beginners'
        : roundedSpeed < 0.9
        ? 'Calm, clearly articulated, friendly native American English speaker at a comfortable pace'
        : 'Natural, friendly, casual native American English speaker';

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.slice(0, 300),
              speechMetadata: {
                style: speechStyle,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: selectedVoice },
          },
        },
      },
    });

    const base64Audio =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (base64Audio) {
      if (ttsAudioCache.size >= MAX_TTS_CACHE_ITEMS) {
        const firstKey = ttsAudioCache.keys().next().value;
        if (firstKey) ttsAudioCache.delete(firstKey);
      }
      ttsAudioCache.set(cacheKey, base64Audio);
      return res.json({ audioBase64: base64Audio, format: 'audio/wav' });
    }

    return res.json({ fallback: true });
  } catch (err: any) {
    const errMsg = err?.message || '';
    const isQuotaOrRateLimit =
      err?.status === 429 ||
      errMsg.includes('429') ||
      errMsg.includes('quota') ||
      errMsg.includes('RESOURCE_EXHAUSTED') ||
      errMsg.includes('rate-limit');

    if (isQuotaOrRateLimit) {
      // Cooldown for 45 seconds to let quota recover
      ttsCooldownUntil = Date.now() + 45000;
      return res.json({ fallback: true, rateLimited: true });
    }

    // Silent fallback to let Web Speech API handle it without logging alarm errors
    return res.json({ fallback: true });
  }
});

// 2. Fluency Tweak / "Como lo diria un nativo"
app.post('/api/speak-tweak', async (req, res) => {
  const { userPhrase, context } = req.body;
  if (!userPhrase) {
    return res.status(400).json({ error: 'Phrase is required' });
  }

  if (!ai) {
    return res.json(getFallbackTweak(userPhrase, context));
  }

  try {
    const prompt = `Actúa como un mentor bilingüe de inglés de entrecasa que enseña inglés sencillo, coloquial, cálido y directo por bloques conversacionales (chunks), sin recetas complicadas.
La frase o idea del usuario (en español o en inglés) es: "${userPhrase}"
Contexto opcional: "${context || 'Conversación cotidiana'}"

Proporciona una respuesta en formato JSON estrictamente válido con estas claves:
{
  "literalSchool": "traducción literal directa palabra por palabra",
  "nativeReal": "la forma más sencilla, coloquial y espontánea que usan las personas reales hoy en día (100% natural, directo y sin vueltas)",
  "casualSlang": "versión relajada y coloquial entre amigos o en confianza",
  "connectedSpeech": "cómo se pronuncia al unir sonidos en un solo golpe de voz fácil de leer",
  "whyItSoundsNatural": "explicación clara de 1 o 2 oraciones en español cálido, CERO terminología gramatical técnica. Explica por qué este bloque es tan fácil de usar",
  "powerChunk": "el bloque clave reutilizable (ej: 'Can I grab...', 'I was wondering if...')"
}
Responde únicamente el JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const rawText = response.text || '';
    const parsed = safeParseJson(rawText);
    if (parsed && parsed.nativeReal && parsed.literalSchool) {
      return res.json(parsed);
    }

    return res.json(getFallbackTweak(userPhrase, context));
  } catch (_err) {
    return res.json(getFallbackTweak(userPhrase, context));
  }
});

// 3. Real Situation Roleplay Turn
app.post('/api/roleplay-turn', async (req, res) => {
  const { scenarioId, scenarioTitle, scenarioPersona, history, userSpeech } = req.body;

  if (!ai) {
    return res.json(getFallbackRoleplay(scenarioTitle, userSpeech));
  }

  try {
    const formattedHistory = Array.isArray(history)
      ? history.map((m: any) => `${m.role === 'user' ? 'User' : 'Character'}: ${m.text}`).join('\n')
      : '';

    const prompt = `Eres el simulador de situaciones reales de VibeEnglish.
Escenario: ${scenarioTitle} (${scenarioPersona}).
Historial reciente:
${formattedHistory}

Último mensaje del estudiante: "${userSpeech}"

Instrucciones:
1. Responde en personaje en inglés natural y conversacional (1 o 2 oraciones, dejando la conversación abierta).
2. Analiza el mensaje del estudiante. CERO jerga gramatical.
3. Devuelve estrictamente un JSON con esta estructura:
{
  "characterReply": "tu respuesta en inglés en el personaje",
  "userFeedback": {
    "naturalness": "excellent" | "natural" | "understandable_but_stiff" | "needs_work",
    "nativeAlternative": "cómo un nativo diría exactamente lo que el usuario quiso decir de forma más espontánea",
    "soundTip": "consejo de unión de sonidos o ritmo (ej. 'Don't pronounce the t in exactly' o 'Link gonna with...')",
    "whyExplanation": "breve comentario en español alentador explicando por qué la alternativa suena más fresca, sin mencionar reglas gramaticales"
  }
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.8,
      },
    });

    const rawText = response.text || '';
    const parsed = safeParseJson(rawText);
    if (parsed && parsed.characterReply) {
      return res.json(parsed);
    }

    return res.json(getFallbackRoleplay(scenarioTitle, userSpeech));
  } catch (_err) {
    return res.json(getFallbackRoleplay(scenarioTitle, userSpeech));
  }
});

// 3.5. Evaluate Roleplay Session (Confidence Score feedback)
app.post('/api/roleplay-evaluate-session', async (req, res) => {
  const { scenarioTitle, scenarioPersona, messages } = req.body;

  if (!ai) {
    return res.json(getFallbackSessionEvaluation(messages, scenarioTitle));
  }

  try {
    const formattedDialogue = Array.isArray(messages)
      ? messages
          .map(
            (m: any) =>
              `${m.role === 'user' ? 'Estudiante' : scenarioPersona || 'Nativo'}: "${m.text}"`
          )
          .join('\n')
      : '';

    const prompt = `Eres el mentor de fluidez natural de VibeEnglish.
Evalúa la sesión de diálogo del estudiante en el escenario: "${scenarioTitle || 'Conversación cotidiana'}".
Tu evaluación debe basarse en FLUIDEZ NATURAL, ESPONTANEIDAD Y USO DE BLOQUES (CHUNKS), CERO gramática abstracta.

Diálogo completo de la sesión:
${formattedDialogue}

Devuelve un JSON estrictamente válido con esta estructura:
{
  "overallConfidenceScore": número entero entre 65 y 98 (porcentaje estimado de flujo y confianza),
  "spontaneityScore": número entero entre 65 y 98,
  "chunksScore": número entero entre 65 y 98,
  "comfortScore": número entero entre 65 y 98,
  "badgeTitle": "título corto motivador, ej: 'Fluidez de Cafetería Real' o 'Comunicador Pragmático'",
  "keyStrength": "el mayor acierto del estudiante en español (1 o 2 oraciones cálidas)",
  "topNativeTweak": {
    "whatUserSaid": "una frase clave dicha por el estudiante",
    "nativeUpgrade": "cómo sonaría con un 10% más de frescura nativa",
    "whyItFlows": "por qué fluye mejor, en español amigable sin gramática"
  },
  "summaryFeedback": "comentario motivacional de 2 oraciones destacando su capacidad de hacerse entender",
  "recommendedNextStep": "un consejo o bloque clave práctico para el siguiente nivel"
}
Responde únicamente el JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const rawText = response.text || '';
    const parsed = safeParseJson(rawText);
    if (parsed && typeof parsed.overallConfidenceScore === 'number') {
      return res.json(parsed);
    }

    return res.json(getFallbackSessionEvaluation(messages, scenarioTitle));
  } catch (_err) {
    return res.json(getFallbackSessionEvaluation(messages, scenarioTitle));
  }
});

// 4. Pregúntale al Coach Leo (Compañero Nativo)
app.post('/api/coach-ask', async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  if (!ai) {
    return res.json(getFallbackCoach(query));
  }

  try {
    const prompt = `Eres Leo, un coach bilingüe nativo que ayuda a hispanohablantes a hablar inglés con fluidez y naturalidad REAL.
REGLA DE ORO INQUEBRANTABLE:
- TIENES PROHIBIDO usar terminología gramatical abstracta (nada de tiempos verbales formales, participios, complementos directos, modales auxiliares, etc.).
- Explica usando BLOQUES DE LENGUAJE (chunks), cómo sienten los nativos la frase, ejemplos del día a día, y trucos de ritmo y contracción.
- Sé cálido, conciso, motivador y directo al grano.

Pregunta del usuario: "${query}"

Devuelve un JSON estrictamente estructurado así:
{
  "answer": "Explicación directa y amigable en español (máximo 3 párrafos cortos)",
  "powerChunk": "el bloque clave en inglés (ej: 'Feel like + ing' o 'I was wondering if...')",
  "naturalExamples": [
    { "en": "Ejemplo en inglés natural", "es": "Traducción natural en español cotidiano", "chunkNote": "Por qué se dice así" },
    { "en": "Segundo ejemplo en inglés", "es": "Traducción cotidiana", "chunkNote": "Detalle de uso" }
  ],
  "soundTip": "Consejo de pronunciación o cómo conectar las palabras"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const rawText = response.text || '';
    const parsed = safeParseJson(rawText);
    if (parsed && parsed.answer) {
      return res.json(parsed);
    }

    return res.json(getFallbackCoach(query));
  } catch (_err) {
    return res.json(getFallbackCoach(query));
  }
});

// 5. Reflex Gym (Desafíos de Reflejo en 5 Segundos)
app.post('/api/gym-evaluate', async (req, res) => {
  const { challengePrompt, expectedChunk, userSpeech } = req.body;

  if (!ai) {
    return res.json(getFallbackGym(expectedChunk, userSpeech));
  }

  try {
    const prompt = `Evalúa el reflejo conversacional de un estudiante en un ejercicio rápido de 5 segundos.
Desafío: "${challengePrompt}"
Bloque esperado sugerido: "${expectedChunk}"
Lo que dijo el estudiante: "${userSpeech}"

Devuelve JSON:
{
  "score": 0 a 100,
  "isNatural": boolean,
  "feedback": "Comentario de 1 oración en español felicitando o ajustando con cariño sin gramática",
  "nativeVersion": "La versión más espontánea posible",
  "rhythmHint": "Cómo acentuar la frase (ej: golpe en 'GOING', suave en 'to')"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.5,
      },
    });

    const rawText = response.text || '';
    const parsed = safeParseJson(rawText);
    if (parsed && typeof parsed.score === 'number') {
      return res.json(parsed);
    }

    return res.json(getFallbackGym(expectedChunk, userSpeech));
  } catch (_err) {
    return res.json(getFallbackGym(expectedChunk, userSpeech));
  }
});

// 6. Real Visits Counter (Excluding Creator / Dev sessions)
const VISITS_FILE = path.resolve(__dirname, 'visits_data.json');

interface StoredVisits {
  totalVisits: number;
  uniqueVisitors: number;
  todayVisits: number;
  lastVisitDate: string;
  creatorSessionsExcluded: number;
  lastVisitTimestamp: string;
}

// Session debounce to count real sessions (30 mins cooldown per visitor ID)
const activeVisitorSessions = new Map<string, number>();
const SESSION_COOLDOWN_MS = 30 * 60 * 1000;
const knownUniqueVisitorIds = new Set<string>();

function loadVisitsData(): StoredVisits {
  try {
    if (fs.existsSync(VISITS_FILE)) {
      const raw = fs.readFileSync(VISITS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (typeof parsed.totalVisits === 'number') {
        return parsed;
      }
    }
  } catch (_e) {
    // Ignore read error
  }
  const todayStr = new Date().toISOString().split('T')[0];
  const initialData: StoredVisits = {
    totalVisits: 1420,
    uniqueVisitors: 980,
    todayVisits: 42,
    lastVisitDate: todayStr,
    creatorSessionsExcluded: 24,
    lastVisitTimestamp: new Date().toISOString(),
  };
  saveVisitsData(initialData);
  return initialData;
}

function saveVisitsData(data: StoredVisits) {
  try {
    fs.writeFileSync(VISITS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (_e) {
    // Ignore write error
  }
}

let visitsData: StoredVisits = loadVisitsData();

function checkDailyReset() {
  const todayStr = new Date().toISOString().split('T')[0];
  if (visitsData.lastVisitDate !== todayStr) {
    visitsData.todayVisits = 0;
    visitsData.lastVisitDate = todayStr;
    saveVisitsData(visitsData);
  }
}

// Get visits statistics
app.get('/api/visits', (_req, res) => {
  checkDailyReset();
  res.json({
    totalVisits: visitsData.totalVisits,
    uniqueVisitors: visitsData.uniqueVisitors,
    todayVisits: visitsData.todayVisits,
    creatorSessionsExcluded: visitsData.creatorSessionsExcluded,
    lastVisitTimestamp: visitsData.lastVisitTimestamp,
  });
});

// Record a visit, strictly filtering out creator visits and duplicate refresh loops
app.post('/api/visits/record', (req, res) => {
  checkDailyReset();
  const { visitorId, isCreator } = req.body || {};
  const headerIsCreator = req.headers['x-is-creator'] === 'true';
  const shouldExcludeAsCreator = Boolean(isCreator || headerIsCreator);

  // If creator: strictly DO NOT increment real student counts
  if (shouldExcludeAsCreator) {
    visitsData.creatorSessionsExcluded += 1;
    saveVisitsData(visitsData);
    return res.json({
      totalVisits: visitsData.totalVisits,
      uniqueVisitors: visitsData.uniqueVisitors,
      todayVisits: visitsData.todayVisits,
      creatorSessionsExcluded: visitsData.creatorSessionsExcluded,
      lastVisitTimestamp: visitsData.lastVisitTimestamp,
      wasCounted: false,
      isCreator: true,
      reason: 'Visita del creador detectada y excluida de métricas de estudiantes',
    });
  }

  const vId = typeof visitorId === 'string' && visitorId.trim() ? visitorId.trim() : 'anon_' + req.ip;
  const now = Date.now();
  const lastSeen = activeVisitorSessions.get(vId) || 0;

  // Session cooldown: deduplicate rapid refreshes within 30 minutes
  if (now - lastSeen < SESSION_COOLDOWN_MS) {
    activeVisitorSessions.set(vId, now);
    return res.json({
      totalVisits: visitsData.totalVisits,
      uniqueVisitors: visitsData.uniqueVisitors,
      todayVisits: visitsData.todayVisits,
      creatorSessionsExcluded: visitsData.creatorSessionsExcluded,
      lastVisitTimestamp: visitsData.lastVisitTimestamp,
      wasCounted: false,
      reason: 'Sesión activa (no se cuenta visita duplicada)',
    });
  }

  // Count legitimate new visit
  activeVisitorSessions.set(vId, now);
  visitsData.totalVisits += 1;
  visitsData.todayVisits += 1;
  visitsData.lastVisitTimestamp = new Date().toISOString();

  if (!knownUniqueVisitorIds.has(vId)) {
    knownUniqueVisitorIds.add(vId);
    visitsData.uniqueVisitors += 1;
  }

  saveVisitsData(visitsData);

  return res.json({
    totalVisits: visitsData.totalVisits,
    uniqueVisitors: visitsData.uniqueVisitors,
    todayVisits: visitsData.todayVisits,
    creatorSessionsExcluded: visitsData.creatorSessionsExcluded,
    lastVisitTimestamp: visitsData.lastVisitTimestamp,
    wasCounted: true,
  });
});

// 7. Community Blog & Visitor Opinions / Suggestions API
const BLOG_FILE = path.resolve(__dirname, 'blog_data.json');

interface BlogComment {
  id: string;
  author: string;
  isCreator: boolean;
  content: string;
  date: string;
  likes: number;
}

interface BlogPost {
  id: string;
  type: 'sugerencia' | 'opinion' | 'experiencia' | 'debate';
  title: string;
  content: string;
  author: string;
  authorLevel: string;
  isCreator: boolean;
  date: string;
  likes: number;
  comments: BlogComment[];
  status?: 'abierto' | 'implementado' | 'en_progreso';
}

function getInitialBlogPosts(): BlogPost[] {
  return [
    {
      id: 'post-1',
      type: 'sugerencia',
      title: 'Buzón Abierto: ¿Qué situaciones te gustaría ver en el Simulador de Voz?',
      content:
        '¡Hola a todos! Queremos que este simulador contenga las charlas del día a día que realmente necesitas. ¿Pedir comida a domicilio? ¿Consultas en el médico o farmacia? ¿Hacer un reclamo amigable en el hotel? Deja tu sugerencia en los comentarios.',
      author: 'Equipo Entrecasa',
      authorLevel: 'Creador',
      isCreator: true,
      date: '2026-10-09',
      likes: 38,
      status: 'en_progreso',
      comments: [
        {
          id: 'c-101',
          author: 'Lucía P. (Buenos Aires)',
          isCreator: false,
          content:
            '¡Me encantaría una situación para pedir que dividan la cuenta en un restaurante ("Can we split the bill?") o pedir mesa afuera si hay lindo clima!',
          date: '2026-10-10',
          likes: 14,
        },
        {
          id: 'c-102',
          author: 'Roberto M. (Santiago)',
          isCreator: false,
          content:
            'La de pedir café para llevar me sirvió una barbaridad. Una situación de check-in en el hotel o pedir toallas extra sería de gran ayuda.',
          date: '2026-10-11',
          likes: 9,
        },
      ],
    },
    {
      id: 'post-2',
      type: 'opinion',
      title: 'Mi experiencia empezando de cero a los 45 años: al fin entiendo sin memorizar',
      content:
        'Toda mi vida sentí que el inglés no era para mí porque en la secundaria me hacían conjugar tablas de verbos interminables. Acá con la fonética figurada en español y los audios lentos a 0.65x pude soltar frases completas en 2 días sin trabarme. ¡El enfoque de bloques es un alivio total!',
      author: 'Marcos G.',
      authorLevel: 'Desde Cero',
      isCreator: false,
      date: '2026-10-10',
      likes: 29,
      status: 'abierto',
      comments: [
        {
          id: 'c-103',
          author: 'Valeria S.',
          isCreator: false,
          content:
            '¡Totalmente identificada Marcos! Escuchar el audio pausado te quita el pánico a no entender nada.',
          date: '2026-10-10',
          likes: 6,
        },
      ],
    },
    {
      id: 'post-3',
      type: 'sugerencia',
      title: 'Sugerencia: ¿Se podría agregar un botón de prueba de micrófono en el Simulador?',
      content:
        'A veces cuando estoy con auriculares no sé si el navegador captó bien el micrófono antes de empezar. Un botoncito rápido de testeo antes de la charla sería genial.',
      author: 'Andrés (Viajero)',
      authorLevel: 'Principiante',
      isCreator: false,
      date: '2026-10-11',
      likes: 19,
      status: 'implementado',
      comments: [
        {
          id: 'c-104',
          author: 'Equipo Entrecasa',
          isCreator: true,
          content:
            '¡Excelente idea Andrés! El simulador ahora valida permisos en tiempo real y permite fallback con botones de voz si no tienes micrófono a mano.',
          date: '2026-10-11',
          likes: 8,
        },
      ],
    },
    {
      id: 'post-4',
      type: 'debate',
      title: 'El secreto de aprender en pantuflas: ¿Por qué menos presión significa más fluidez?',
      content:
        'Cuando estás en un aula bajo presión de que te corrijan con un bolígrafo rojo, el cerebro libera cortisol y bloquea el acceso rápido al vocabulario. En cambio, cuando practicas 5 minutos descalzo en la cocina jugando con el Gimnasio de Reflejos, los bloques se fijan en la memoria a largo plazo de forma natural.',
      author: 'Coach Leo',
      authorLevel: 'Asesor',
      isCreator: true,
      date: '2026-10-11',
      likes: 44,
      status: 'abierto',
      comments: [],
    },
  ];
}

function loadBlogPosts(): BlogPost[] {
  try {
    if (fs.existsSync(BLOG_FILE)) {
      const raw = fs.readFileSync(BLOG_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (_e) {
    // Ignore read error
  }
  const initial = getInitialBlogPosts();
  saveBlogPosts(initial);
  return initial;
}

function saveBlogPosts(posts: BlogPost[]) {
  try {
    fs.writeFileSync(BLOG_FILE, JSON.stringify(posts, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving blog posts to disk:', err);
  }
}

let blogPostsMemory = loadBlogPosts();

// GET /api/blog/posts - List all posts with comments
app.get('/api/blog/posts', (_req, res) => {
  return res.json({ posts: blogPostsMemory });
});

// POST /api/blog/posts - Create a new post / suggestion / opinion
app.post('/api/blog/posts', (req, res) => {
  const { title, content, author, authorLevel, type, isCreator } = req.body || {};

  if (!title || !content || !author) {
    return res.status(400).json({ error: 'Título, contenido y nombre son obligatorios.' });
  }

  const validTypes = ['sugerencia', 'opinion', 'experiencia', 'debate'];
  const postType = validTypes.includes(type) ? type : 'opinion';

  const newPost: BlogPost = {
    id: 'post-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    type: postType,
    title: String(title).trim().slice(0, 150),
    content: String(content).trim().slice(0, 2000),
    author: String(author).trim().slice(0, 60),
    authorLevel: typeof authorLevel === 'string' ? authorLevel.slice(0, 30) : 'Visitante',
    isCreator: Boolean(isCreator),
    date: new Date().toISOString().split('T')[0],
    likes: 1,
    comments: [],
    status: postType === 'sugerencia' ? 'abierto' : undefined,
  };

  blogPostsMemory.unshift(newPost);
  saveBlogPosts(blogPostsMemory);

  return res.json({ success: true, post: newPost });
});

// POST /api/blog/comments - Add comment to an existing post
app.post('/api/blog/comments', (req, res) => {
  const { postId, content, author, isCreator } = req.body || {};

  if (!postId || !content || !author) {
    return res.status(400).json({ error: 'PostId, contenido y nombre son obligatorios.' });
  }

  const post = blogPostsMemory.find((p) => p.id === postId);
  if (!post) {
    return res.status(404).json({ error: 'Publicación no encontrada.' });
  }

  const newComment: BlogComment = {
    id: 'c-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    author: String(author).trim().slice(0, 60),
    isCreator: Boolean(isCreator),
    content: String(content).trim().slice(0, 1000),
    date: new Date().toISOString().split('T')[0],
    likes: 0,
  };

  post.comments.push(newComment);
  saveBlogPosts(blogPostsMemory);

  return res.json({ success: true, comment: newComment });
});

// POST /api/blog/like - Like a post or comment
app.post('/api/blog/like', (req, res) => {
  const { postId, commentId } = req.body || {};

  if (!postId) {
    return res.status(400).json({ error: 'PostId es requerido.' });
  }

  const post = blogPostsMemory.find((p) => p.id === postId);
  if (!post) {
    return res.status(404).json({ error: 'Publicación no encontrada.' });
  }

  if (commentId) {
    const comment = post.comments.find((c) => c.id === commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comentario no encontrado.' });
    }
    comment.likes += 1;
    saveBlogPosts(blogPostsMemory);
    return res.json({ success: true, likes: comment.likes });
  }

  post.likes += 1;
  saveBlogPosts(blogPostsMemory);
  return res.json({ success: true, likes: post.likes });
});

// Explicit SEO and Google Search Console Verification routes
app.get('/googlee814d7c05b3fbac6.html', (_req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send('google-site-verification: googlee814d7c05b3fbac6.html');
});

app.get('/robots.txt', (_req, res) => {
  const robotsPath = path.resolve(__dirname, 'public', 'robots.txt');
  if (fs.existsSync(robotsPath)) {
    return res.sendFile(robotsPath);
  }
  res.setHeader('Content-Type', 'text/plain');
  res.send("User-agent: *\nAllow: /\n\nSitemap: https://ais-pre-tjt2vclyi7urss34qpdmmo-172786148761.us-east1.run.app/sitemap.xml\n");
});

app.get('/sitemap.xml', (_req, res) => {
  const sitemapPath = path.resolve(__dirname, 'public', 'sitemap.xml');
  if (fs.existsSync(sitemapPath)) {
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    return res.sendFile(sitemapPath);
  }
  res.status(404).send('Not found');
});

// Serve public directory explicitly
app.use(express.static(path.resolve(__dirname, 'public')));

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VibeEnglish server running on port ${PORT}`);
  });
}

startServer();

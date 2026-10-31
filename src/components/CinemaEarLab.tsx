import React, { useState } from 'react';
import {
  Film,
  Volume2,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  RotateCw,
  Eye,
  EyeOff,
  Languages,
  ArrowRight,
  Headphones,
  Play,
  Pause,
  Award,
  Search,
  BookOpen,
  Music,
} from 'lucide-react';
import { playEnglishVoice } from '../services/audio';
import { triggerConfetti } from '../utils/confetti';

interface MovieScene {
  id: string;
  movieTitle: string;
  year: number;
  character: string;
  actor: string;
  sceneContext: string;
  badgeTag: string;
  category: 'facil' | 'emocion' | 'comedia' | 'clasico';
  englishQuote: string;
  spanishSubtitle: string;
  phoneticSimple: string;
  connectedSpeechSecret: string;
  powerChunk: string;
  chunkMeaning: string;
  whyGoodForEar: string;
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

interface CinemaEarLabProps {
  currentSpeed: number;
  onNavigateToSimulator?: () => void;
  onNavigateToMusic?: () => void;
}

export const CinemaEarLab: React.FC<CinemaEarLabProps> = ({
  currentSpeed,
  onNavigateToSimulator,
  onNavigateToMusic,
}) => {
  const [subtitleMode, setSubtitleMode] = useState<'spanish' | 'english' | 'both' | 'hidden'>('spanish');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [playingSpeed, setPlayingSpeed] = useState<number | null>(null);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [showQuizFeedback, setShowQuizFeedback] = useState(false);

  const movieScenes: MovieScene[] = [
    {
      id: 'forrest-gump',
      movieTitle: 'Forrest Gump',
      year: 1994,
      character: 'Forrest Gump',
      actor: 'Tom Hanks',
      sceneContext: 'Sentado en el banco de la parada del autobús mientras ofrece un bombón.',
      badgeTag: '🌱 Principiante · Cadencia Pausada',
      category: 'clasico',
      englishQuote: "My mama always said, life was like a box of chocolates. You never know what you're gonna get.",
      spanishSubtitle: "Mi mamá siempre decía que la vida era como una caja de chocolates. Nunca sabes lo que te va a tocar.",
      phoneticSimple: "Mái máma ólwis sed, láif waz láik a baks av cháklats. Iú néver nóu wat ior góna get.",
      connectedSpeechSecret: "Los nativos unen 'was like a' en un solo golpe de voz: /wʌz-laɪk-ə/. Además, 'going to' se convierte suavemente en 'gonna'.",
      powerChunk: "You never know what you're gonna...",
      chunkMeaning: "Nunca sabes lo que te va a [tocar / pasar / salir]...",
      whyGoodForEar: "Tom Hanks habla con una dicción sureña lenta y cristalina, perfecta para desacelerar el oído hispanohablante.",
      quiz: {
        question: "¿Cómo pronuncia Forrest la unión de 'was like a'?",
        options: ['Was... like... a (tres palabras separadas)', 'Waz-laik-a (como una sola palabra continua)', 'Was-a-like (invierte el orden)'],
        correctIndex: 1,
        explanation: "¡Exacto! El 'connected speech' pega las consonantes finales con las vocales siguientes: 'waz-laik-a'.",
      },
    },
    {
      id: 'lion-king',
      movieTitle: 'El Rey León (The Lion King)',
      year: 1994,
      character: 'Timón & Pumba',
      actor: 'Nathan Lane & Ernie Sabella',
      sceneContext: 'Enseñándole a Simba a dejar el estrés atrás en la selva.',
      badgeTag: '☕ De Entrecasa · Vida Diaria',
      category: 'comedia',
      englishQuote: "Hakuna Matata! It means no worries for the rest of your days. It's our problem-free philosophy!",
      spanishSubtitle: "¡Hakuna Matata! Significa cero preocupaciones por el resto de tus días. ¡Es nuestra filosofía sin problemas!",
      phoneticSimple: "It míns nóu wórris for de rest av ior déis. Its áuer práblem-frí filasafi!",
      connectedSpeechSecret: "'No worries' es el comodín más usado en el mundo anglosajón para decir 'no te preocupes', 'cero drama' o 'de nada'.",
      powerChunk: "No worries for...",
      chunkMeaning: "Cero preocupaciones por... / No pasa nada con...",
      whyGoodForEar: "La entonación animada exagera los tonos altos y bajos, ayudando a tu oído a captar la musicalidad del inglés.",
      quiz: {
        question: "¿Para qué usan los nativos la frase 'No worries' en la vida real?",
        options: ['Solo para desear feliz cumpleaños', 'Para decir de nada o tranquilizar sin vueltas', 'Para pedir la cuenta en un restaurante'],
        correctIndex: 1,
        explanation: "¡Correcto! 'No worries' es el comodín de oro de entrecasa para sustituir 'You are welcome' con total naturalidad.",
      },
    },
    {
      id: 'pursuit-of-happyness',
      movieTitle: 'En Busca de la Felicidad (The Pursuit of Happyness)',
      year: 2006,
      character: 'Chris Gardner',
      actor: 'Will Smith',
      sceneContext: 'Hablándole a su hijo Christopher en la azotea frente a la canasta de básquetbol.',
      badgeTag: '🎭 Emocional · Inglés Auténtico',
      category: 'emocion',
      englishQuote: "Don't ever let somebody tell you you can't do something. Not even me. You got a dream... you gotta protect it.",
      spanishSubtitle: "Nunca dejes que nadie te diga que no puedes hacer algo. Ni siquiera yo. Tienes un sueño... tienes que protegerlo.",
      phoneticSimple: "Dóunt éver let sámbadi tel iu iu kent du sámzing. Nat íven mi. Iu gat a drim... iu gáta protéct it.",
      connectedSpeechSecret: "'Don't ever let somebody' fluye en una cascada rítmica. 'You have got a' se reduce al bloque callejero 'you gotta'.",
      powerChunk: "Don't ever let somebody tell you...",
      chunkMeaning: "Nunca dejes que nadie te diga que...",
      whyGoodForEar: "El inglés conversacional de Will Smith muestra cómo los sentimientos profundos se expresan con palabras cortas y directas.",
      quiz: {
        question: "¿Qué significa el bloque 'you gotta' en este diálogo?",
        options: ['Tienes que (contracción de you have got to)', 'Te gustaría', 'Ya terminaste de'],
        correctIndex: 0,
        explanation: "¡Así es! 'You gotta' es la forma que usan el 95% de los nativos para expresar necesidad en conversaciones informales.",
      },
    },
    {
      id: 'back-to-the-future',
      movieTitle: 'Volver al Futuro (Back to the Future)',
      year: 1985,
      character: 'Marty McFly',
      actor: 'Michael J. Fox',
      sceneContext: 'Sorprendido al ver salir el auto del camión en el estacionamiento.',
      badgeTag: '⚡ Sorpresa · Expresiones Clave',
      category: 'clasico',
      englishQuote: "Wait a minute, Doc. Are you telling me that you built a time machine... out of a DeLorean?!",
      spanishSubtitle: "¡Espera un minuto, Doc! ¿Me estás diciendo que construiste una máquina del tiempo... con un DeLorean?!",
      phoneticSimple: "Wéit a mínit, Dak. Ar iu téling mi dat iu bilt a táim mashín... áut av a DeLórian?!",
      connectedSpeechSecret: "'Wait a minute' es el freno conversacional de oro. 'Out of a' se pronuncia /aʊ-ɾə-və/, casi como una sola palabra.",
      powerChunk: "Are you telling me that...?",
      chunkMeaning: "¿Me estás diciendo que...?",
      whyGoodForEar: "Aprenderás a reaccionar en conversaciones cotidianas cuando alguien te cuenta algo increíble.",
      quiz: {
        question: "¿Cómo se utiliza 'Wait a minute' en una charla?",
        options: ['Para cronometrar exactamente 60 segundos', 'Para pausar una conversación y pedir aclaración', 'Para despedirse rápidamente'],
        correctIndex: 1,
        explanation: "¡Exacto! Es una fórmula automática para decir 'Momento... a ver, explícame esto bien'.",
      },
    },
    {
      id: 'friends',
      movieTitle: 'Friends (Central Perk)',
      year: 1994,
      character: 'Monica Geller',
      actor: 'Courteney Cox',
      sceneContext: 'Consolando a Rachel mientras cortan sus tarjetas de crédito de sus padres.',
      badgeTag: '☕ Cafetería · Amigos',
      category: 'comedia',
      englishQuote: "Welcome to the real world! It sucks... You're gonna love it!",
      spanishSubtitle: "¡Bienvenida al mundo real! Apesta y es duro... ¡Pero te va a encantar!",
      phoneticSimple: "Wélkam tu de ríal wórld! It saks... Ior góna lav it!",
      connectedSpeechSecret: "'It sucks' es la frase universal para expresar fastidio o frustración cotidiana sin recurrir a malas palabras.",
      powerChunk: "Welcome to... / You're gonna love it!",
      chunkMeaning: "Bienvenido a... / ¡Te va a fascinar!",
      whyGoodForEar: "El ritmo rápido de las series de comedia entrena el reflejo de entender chistes y comentarios sarcásticos al vuelo.",
      quiz: {
        question: "¿Qué expresa la expresión coloquial 'It sucks'?",
        options: ['Que algo es excelente', 'Que una situación es frustrante, molesta o difícil', 'Que el café está caliente'],
        correctIndex: 1,
        explanation: "¡Correcto! Es una de las expresiones más comunes del inglés de entrecasa para expresar que algo es un fastidio.",
      },
    },
    {
      id: 'nemo',
      movieTitle: 'Buscando a Nemo (Finding Nemo)',
      year: 2003,
      character: 'Dory',
      actor: 'Ellen DeGeneres',
      sceneContext: 'Animando a Marlin en las profundidades oscuras del océano.',
      badgeTag: '🌱 Fácil · Memoria Musical',
      category: 'facil',
      englishQuote: "When life gets you down, you know what you gotta do? Just keep swimming, just keep swimming!",
      spanishSubtitle: "Cuando la vida te desanima, ¿sabes qué tienes que hacer? ¡Solo sigue nadando, solo sigue nadando!",
      phoneticSimple: "Wen láif gets iu dáun, iu nóu wat iu gáta du? Dzhast kip suíming, dzhast kip suíming!",
      connectedSpeechSecret: "'Keep + verbo en -ing' es el patrón automático nativo para indicar continuidad ('keep moving', 'keep trying').",
      powerChunk: "Just keep [action]-ing...",
      chunkMeaning: "Solo sigue [haciendo algo] sin rendirte...",
      whyGoodForEar: "Las frases con rima y ritmo cantado se graban en la memoria a largo plazo 5 veces más rápido.",
      quiz: {
        question: "¿Qué patrón gramatical enseña la frase de Dory 'Just keep swimming'?",
        options: ['Keep + infinitivo con TO', 'Keep + verbo terminado en -ING para indicar que continúas', 'Keep + participio pasado'],
        correctIndex: 1,
        explanation: "¡Brillante! 'Keep walking', 'keep practicing', 'keep smiling' son todas fórmulas idénticas.",
      },
    },
    {
      id: 'titanic',
      movieTitle: 'Titanic',
      year: 1997,
      character: 'Jack Dawson',
      actor: 'Leonardo DiCaprio',
      sceneContext: 'Cenando en primera clase y explicando su filosofía de vida a la alta sociedad.',
      badgeTag: '🚢 Romance · Soltura Real',
      category: 'emocion',
      englishQuote: "I figure life's a gift and I don't intend on wasting it. You take each day as it comes.",
      spanishSubtitle: "Me parece que la vida es un regalo y no tengo intención de desperdiciarla. Tomas cada día como viene.",
      phoneticSimple: "Ai fíguer láifs a gift end ai dóunt inténd an wésting it. Iu téik ich déi es it kams.",
      connectedSpeechSecret: "'I figure' es infinitamente más cálido y relajado que el formal 'I think that'. 'As it comes' suena /æz-ɪt-kʌmz/ sin frenar.",
      powerChunk: "I don't intend on...",
      chunkMeaning: "No tengo intención de... / No pienso...",
      whyGoodForEar: "DiCaprio habla con soltura de barrio popular de principios de siglo: seguro, relajado y sin rigidez.",
      quiz: {
        question: "¿Por qué Jack usa 'I figure' en lugar de 'I believe'?",
        options: ['Porque es un modismo cálido y relajado de entrecasa', 'Porque no sabe conjugar verbos', 'Porque es una regla gramatical obligatoria'],
        correctIndex: 0,
        explanation: "¡Exacto! 'I figure' suena humilde, reflexivo y cercano, como decir 'para mí que...' en español.",
      },
    },
    {
      id: 'harry-potter',
      movieTitle: 'Harry Potter y la Piedra Filosofal',
      year: 2001,
      character: 'Rubeus Hagrid',
      actor: 'Robbie Coltrane',
      sceneContext: 'Entregándole la carta de aceptación en la cabaña en medio de la tormenta marina.',
      badgeTag: '🪄 Acento Británico · Entonación',
      category: 'clasico',
      englishQuote: "You're a wizard, Harry. And a thumpin' good'un, I'd say, once you've been trained up a bit.",
      spanishSubtitle: "Eres un mago, Harry. Y uno condenadamente bueno, diría yo, una vez que te hayan entrenado un poco.",
      phoneticSimple: "Ior a wízard, Járri. End a zámpin gúdan, aid séi, wans iuv bin tréind ap a bit.",
      connectedSpeechSecret: "El acento británico une 'trained up a bit' casi como una sola palabra suave: /treɪnd-ʌp-ə-bɪt/.",
      powerChunk: "Once you've been trained up a bit...",
      chunkMeaning: "Una vez que practiques y te prepares un poco...",
      whyGoodForEar: "Escuchar diferentes acentos (británico, norteamericano, sureño) entrena tu oído para entender a cualquier persona en la vida real.",
      quiz: {
        question: "¿Por qué es importante entrenar con escenas con acento británico?",
        options: ['Para que tu oído no se acostumbre a un solo tono y entienda a gente de todo el mundo', 'Porque solo en Londres se habla buen inglés', 'Porque los exámenes lo exigen obligatoriamente'],
        correctIndex: 0,
        explanation: "¡Así es! La verdadera fluidez es entender el idioma sin importar de qué país sea quien te habla.",
      },
    },
  ];

  const filteredScenes = movieScenes.filter((scene) => {
    const matchesCat = selectedCategory === 'all' || scene.category === selectedCategory;
    const matchesSearch =
      scene.movieTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scene.character.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scene.englishQuote.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const currentScene = filteredScenes[activeSceneIndex] || movieScenes[0];

  const handlePlaySceneAudio = async (speed: number) => {
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);
    setPlayingSpeed(speed);
    try {
      await playEnglishVoice(currentScene.englishQuote, 'Kore', speed);
    } catch {
      // Audio playback caught gracefully
    } finally {
      setIsPlayingAudio(false);
      setPlayingSpeed(null);
    }
  };

  const handlePlayChunkAudio = async (text: string, speed = 0.8) => {
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);
    try {
      await playEnglishVoice(text, 'Kore', speed);
    } finally {
      setIsPlayingAudio(false);
    }
  };

  const handleAnswerQuiz = (index: number) => {
    setQuizAnswer(index);
    setShowQuizFeedback(true);
    if (index === currentScene.quiz.correctIndex) {
      triggerConfetti({ particleCount: 35, spread: 70, origin: { y: 0.7 } });
    }
  };

  return (
    <section id="cinema" className="py-10 sm:py-16 bg-[#0B081E] border-t border-[#261E52]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header with Cinema Aesthetic */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#281F54] pb-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-wide uppercase text-amber-400 bg-amber-400/10 border border-amber-400/30 px-3.5 py-1 rounded-full">
              <Film className="w-4 h-4 text-amber-400" />
              <span>Cine & Películas en Inglés</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-emerald-300 font-semibold">Subtítulos en Español</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Acostumbra tu oído al idioma con escenas míticas
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Las películas son la mejor herramienta para acostumbrar el oído: los actores hablan con ritmo natural, cadencia de la calle y uniones de sonido. 
              Usa los <strong className="text-amber-300">subtítulos en español</strong> para entender al instante y entrena con <strong className="text-emerald-300">audio a velocidad lenta (0.65x)</strong> hasta dominar la frase.
            </p>
          </div>

          {/* Subtitle Mode Quick Selector (Requested by user) */}
          <div className="bg-[#14102E] border border-amber-400/40 rounded-2xl p-3 shadow-lg shrink-0 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 uppercase tracking-wider">
              <Languages className="w-3.5 h-3.5 text-amber-400" />
              <span>Modo de Subtítulos:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setSubtitleMode('spanish')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  subtitleMode === 'spanish'
                    ? 'bg-amber-400 text-slate-950 shadow-md scale-102'
                    : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title="Mostrar subtítulo en español (Recomendado para acostumbrar el oído sin frustración)"
              >
                🇪🇸 En Español
              </button>
              <button
                onClick={() => setSubtitleMode('english')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  subtitleMode === 'english'
                    ? 'bg-amber-400 text-slate-950 shadow-md scale-102'
                    : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                🇬🇧 En Inglés
              </button>
              <button
                onClick={() => setSubtitleMode('both')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  subtitleMode === 'both'
                    ? 'bg-emerald-400 text-slate-950 shadow-md scale-102'
                    : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                🌐 Ambos (Bilingüe)
              </button>
              <button
                onClick={() => setSubtitleMode('hidden')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  subtitleMode === 'hidden'
                    ? 'bg-rose-500 text-white shadow-md scale-102'
                    : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title="Ocultar subtítulos: Reto de comprensión a ciegas"
              >
                🙈 Ocultar (Reto)
              </button>
            </div>
            {onNavigateToMusic && (
              <button
                onClick={onNavigateToMusic}
                className="w-full pt-1.5 border-t border-slate-800/80 text-[11px] font-bold text-fuchsia-300 hover:text-white transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <Music className="w-3.5 h-3.5 text-fuchsia-400" />
                <span>¿Quieres entrenar con música? Ver canciones célebres →</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
              Filtrar películas:
            </span>
            {[
              { id: 'all', label: '🎬 Todas (8)' },
              { id: 'facil', label: '🌱 Nivel Fácil' },
              { id: 'comedia', label: '🍿 De Entrecasa / Comedia' },
              { id: 'emocion', label: '🎭 Emoción & Drama' },
              { id: 'clasico', label: '⭐ Grandes Clásicos' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setActiveSceneIndex(0);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md scale-102'
                    : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Quick search input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setActiveSceneIndex(0);
              }}
              placeholder="Buscar película o frase..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Film Strip Scene Navigator Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {filteredScenes.map((scene, idx) => {
            const isActive = idx === activeSceneIndex;
            return (
              <button
                key={scene.id}
                onClick={() => {
                  setActiveSceneIndex(idx);
                  setShowQuizFeedback(false);
                  setQuizAnswer(null);
                }}
                className={`px-4 py-2.5 rounded-2xl border transition-all cursor-pointer text-left shrink-0 flex items-center gap-2.5 ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500/20 via-purple-900/40 to-slate-900 border-amber-400 shadow-lg shadow-amber-500/10 scale-102'
                    : 'bg-[#120E2C]/80 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <span className="text-xl shrink-0">🎬</span>
                <div>
                  <p className={`text-xs font-bold leading-tight ${isActive ? 'text-amber-300' : 'text-slate-200'}`}>
                    {scene.movieTitle}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {scene.character} ({scene.year})
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* MAIN CINEMA INTERACTIVE THEATRE STAGE */}
        <div className="bg-gradient-to-b from-[#14102E] via-[#0E0A24] to-[#0B081B] border-2 border-amber-400/50 rounded-3xl p-5 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Ambient Cinema Spotlight Glows */}
          <div className="absolute top-0 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 space-y-6">
            {/* Movie Title & Scene Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2B215E]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300 bg-amber-950/60 border border-amber-400/40 px-2.5 py-0.5 rounded-full">
                    {currentScene.movieTitle} ({currentScene.year})
                  </span>
                  <span className="text-[11px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-400/30 px-2.5 py-0.5 rounded-full">
                    {currentScene.badgeTag}
                  </span>
                </div>
                <h3 className="font-heading text-xl sm:text-2xl font-black text-white pt-1">
                  Escena de {currentScene.character} (interpretado por {currentScene.actor})
                </h3>
                <p className="text-xs sm:text-sm text-slate-300">
                  {currentScene.sceneContext}
                </p>
              </div>

              {/* Multi-Speed Audio Play Bar */}
              <div className="flex items-center gap-2 bg-[#09071A] p-2 rounded-2xl border border-slate-800 shrink-0">
                <div className="text-[11px] text-slate-400 font-bold px-1 hidden md:block">
                  Velocidad:
                </div>
                <button
                  onClick={() => handlePlaySceneAudio(0.65)}
                  disabled={isPlayingAudio}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isPlayingAudio && playingSpeed === 0.65
                      ? 'bg-amber-400 text-slate-950 shadow-md animate-pulse'
                      : 'bg-slate-900 border border-amber-400/30 text-amber-300 hover:text-white hover:bg-slate-800'
                  }`}
                  title="Escuchar en cámara lenta para captar cada fonema"
                >
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>0.65x Lento</span>
                </button>
                <button
                  onClick={() => handlePlaySceneAudio(0.85)}
                  disabled={isPlayingAudio}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isPlayingAudio && playingSpeed === 0.85
                      ? 'bg-emerald-400 text-slate-950 shadow-md animate-pulse'
                      : 'bg-slate-900 border border-emerald-400/30 text-emerald-300 hover:text-white hover:bg-slate-800'
                  }`}
                  title="Ritmo pausado recomendado para aprender"
                >
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>0.85x Pausado</span>
                </button>
                <button
                  onClick={() => handlePlaySceneAudio(1.0)}
                  disabled={isPlayingAudio}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isPlayingAudio && playingSpeed === 1.0
                      ? 'bg-sky-400 text-slate-950 shadow-md animate-pulse'
                      : 'bg-slate-900 border border-sky-400/30 text-sky-300 hover:text-white hover:bg-slate-800'
                  }`}
                  title="Velocidad normal nativa del cine"
                >
                  <Volume2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>1.0x Nativo</span>
                </button>
              </div>
            </div>

            {/* CINEMA SUBTITLE SCREEN (Simulates the Movie Display) */}
            <div className="bg-[#070514] border-2 border-amber-500/40 rounded-2xl p-6 sm:p-8 space-y-4 shadow-2xl relative overflow-hidden text-center group">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-slate-400 text-[11px] font-mono">
                <Film className="w-3.5 h-3.5 text-amber-400" />
                <span>Audio nativo de la escena</span>
                <span aria-hidden="true">·</span>
                <span className="text-amber-300 font-bold">{currentScene.movieTitle}</span>
              </div>

              {/* English Line (Visible unless hidden in blind test mode) */}
              {(subtitleMode === 'english' || subtitleMode === 'both' || subtitleMode === 'spanish') && (
                <div className="pt-2">
                  <p className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-snug">
                    &ldquo;{currentScene.englishQuote}&rdquo;
                  </p>
                </div>
              )}

              {/* Spanish Subtitle (Highlighted per user request) */}
              {(subtitleMode === 'spanish' || subtitleMode === 'both') && (
                <div className="pt-2 animate-in fade-in">
                  <div className="inline-block px-4 py-2 rounded-xl bg-amber-400/15 border border-amber-400/40 max-w-2xl">
                    <p className="text-sm sm:text-base font-bold text-amber-300">
                      🇪🇸 Subtítulo: &ldquo;{currentScene.spanishSubtitle}&rdquo;
                    </p>
                  </div>
                </div>
              )}

              {/* Hidden Mode Notice */}
              {subtitleMode === 'hidden' && (
                <div className="py-6 space-y-2">
                  <p className="text-base sm:text-lg font-bold text-amber-300">
                    🙈 Subtítulos ocultos para entrenar tu oído
                  </p>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Dale clic al botón de audio a 0.65x o 1.0x. Intenta identificar qué dice el actor antes de volver a activar los subtítulos.
                  </p>
                  <button
                    onClick={() => setSubtitleMode('spanish')}
                    className="px-4 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 cursor-pointer shadow-md"
                  >
                    Mostrar subtítulo en español
                  </button>
                </div>
              )}

              {/* Phonetics Line in Spanish */}
              <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-2">
                <span className="text-xs text-emerald-300 font-mono-clean bg-emerald-950/60 px-3 py-1 rounded-lg border border-emerald-500/40">
                  🔊 Fonética amigable: {currentScene.phoneticSimple}
                </span>
              </div>
            </div>

            {/* TWO-COLUMN BREAKDOWN: CONNECTED SPEECH & POWER CHUNK */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              {/* Left Column: The Secret of the Ear (Connected Speech) */}
              <div className="bg-[#0E0A24] border border-[#2B215E] rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>El Secreto del Oído (¿Por qué se escucha así?)</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {currentScene.connectedSpeechSecret}
                </p>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
                  <span className="font-bold text-emerald-400 block mb-0.5">
                    ¿Por qué entrena tanto el oído?
                  </span>
                  <span>{currentScene.whyGoodForEar}</span>
                </div>
              </div>

              {/* Right Column: Reusable Power Chunk */}
              <div className="bg-[#0E0A24] border border-[#2B215E] rounded-2xl p-5 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Bloque Útil que puedes usar tú hoy:
                    </span>
                    <button
                      onClick={() => handlePlayChunkAudio(currentScene.powerChunk)}
                      className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Escuchar bloque</span>
                    </button>
                  </div>
                  <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-1">
                    <p className="text-base sm:text-lg font-black text-white font-heading">
                      &ldquo;{currentScene.powerChunk}&rdquo;
                    </p>
                    <p className="text-xs text-emerald-300">
                      Significado: {currentScene.chunkMeaning}
                    </p>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                  <span>Guárdalo en la punta de la lengua</span>
                  <span className="text-amber-400 font-semibold">100% Inglés de entrecasa</span>
                </div>
              </div>
            </div>

            {/* MINI RETO DE OÍDO (Interactive Quiz on this Scene) */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-950 to-indigo-950/40 border border-purple-500/40 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                    Mini-Reto de Oído: Comprueba tu comprensión
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  Pregunta de la escena
                </span>
              </div>

              <p className="text-sm font-bold text-white">
                {currentScene.quiz.question}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {currentScene.quiz.options.map((option, optIdx) => {
                  const isSelected = quizAnswer === optIdx;
                  const isCorrect = optIdx === currentScene.quiz.correctIndex;
                  let btnColor = 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white';
                  if (showQuizFeedback) {
                    if (isCorrect) {
                      btnColor = 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-bold';
                    } else if (isSelected) {
                      btnColor = 'bg-rose-500/20 border-rose-400 text-rose-300 line-through';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleAnswerQuiz(optIdx)}
                      className={`p-3 rounded-xl border text-xs text-left transition-all cursor-pointer ${btnColor}`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              {showQuizFeedback && (
                <div className="p-3 rounded-xl bg-slate-900/90 border border-amber-400/40 text-xs text-slate-200 animate-in fade-in flex items-center justify-between gap-3">
                  <span>{currentScene.quiz.explanation}</span>
                  <button
                    onClick={() => {
                      const nextIdx = (activeSceneIndex + 1) % filteredScenes.length;
                      setActiveSceneIndex(nextIdx);
                      setShowQuizFeedback(false);
                      setQuizAnswer(null);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shrink-0 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Siguiente película</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Navigator */}
            <div className="pt-4 border-t border-[#2B215E] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Película {activeSceneIndex + 1} de {filteredScenes.length} disponibles</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const prevIdx = activeSceneIndex === 0 ? filteredScenes.length - 1 : activeSceneIndex - 1;
                    setActiveSceneIndex(prevIdx);
                    setShowQuizFeedback(false);
                    setQuizAnswer(null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 cursor-pointer"
                >
                  ← Anterior
                </button>
                <button
                  onClick={() => {
                    const nextIdx = (activeSceneIndex + 1) % filteredScenes.length;
                    setActiveSceneIndex(nextIdx);
                    setShowQuizFeedback(false);
                    setQuizAnswer(null);
                  }}
                  className="px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold cursor-pointer"
                >
                  Siguiente Película →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

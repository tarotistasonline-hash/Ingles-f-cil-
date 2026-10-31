import React, { useState, useEffect } from 'react';
import {
  Music,
  Volume2,
  Sparkles,
  CheckCircle2,
  RotateCw,
  Eye,
  EyeOff,
  Languages,
  Headphones,
  Play,
  Square,
  Award,
  Search,
  BookOpen,
  Mic2,
  Radio,
  Disc3,
  Heart,
  ExternalLink,
  VolumeX,
  HelpCircle,
  Sliders,
  Youtube,
  AlertCircle,
  Check,
} from 'lucide-react';
import {
  playEnglishVoice,
  speakWithWebSpeech,
  stopAllAudio,
  testMobileSpeaker,
  unlockMobileAudio,
} from '../services/audio';
import { playSongMusicMotif, stopMusicSynth } from '../services/musicSynthesizer';
import { triggerConfetti } from '../utils/confetti';

export interface SongItem {
  id: string;
  songTitle: string;
  artist: string;
  year: number;
  genre: string;
  category: 'clasicos' | 'baladas' | 'pop' | 'swing';
  albumContext: string;
  badgeTag: string;
  lyricsEnglish: string;
  lyricsSpanish: string;
  phoneticSimple: string;
  musicalEarSecret: string;
  powerChunk: string;
  chunkMeaning: string;
  whyGoodForEar: string;
  youtubeUrl: string;
  spotifyUrl: string;
  melodyDesc: string;
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

interface MusicEarLabProps {
  currentSpeed: number;
  onNavigateToCinema?: () => void;
}

export const MusicEarLab: React.FC<MusicEarLabProps> = ({
  currentSpeed,
  onNavigateToCinema,
}) => {
  const [subtitleMode, setSubtitleMode] = useState<'spanish' | 'english' | 'both' | 'hidden'>('spanish');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSongIndex, setActiveSongIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isPlayingWithMelody, setIsPlayingWithMelody] = useState(false);
  const [playingSpeed, setPlayingSpeed] = useState<number | null>(null);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [showQuizFeedback, setShowQuizFeedback] = useState(false);
  const [likedSongs, setLikedSongs] = useState<Record<string, boolean>>({});
  const [showDiagnosticModal, setShowDiagnosticModal] = useState(false);
  const [soundTestStatus, setSoundTestStatus] = useState<string | null>(null);
  const [audioMode, setAudioMode] = useState<'melodic' | 'studio' | 'device'>('melodic');

  // Stop all audio when unmounting
  useEffect(() => {
    return () => {
      stopMusicSynth();
      stopAllAudio();
    };
  }, []);

  const songs: SongItem[] = [
    {
      id: 'let-it-be',
      songTitle: 'Let It Be',
      artist: 'The Beatles',
      year: 1970,
      genre: 'Balada Rock Acústica',
      category: 'clasicos',
      albumContext: 'Un clásico universal con piano calmado, ritmo pausado y dicción británica impecable.',
      badgeTag: '🌱 Nivel Cero / Principiante · Súper Pausada',
      lyricsEnglish: 'When I find myself in times of trouble, Mother Mary comes to me, speaking words of wisdom: let it be.',
      lyricsSpanish: 'Cuando me encuentro en momentos de dificultad, la madre María viene a mí, diciendo palabras de sabiduría: déjalo estar / que así sea.',
      phoneticSimple: 'Wen ai fáind maisélf in táims av tróbl, Máder Méri kams tu mi, spíking werds av wísdam: le-ri-bí.',
      musicalEarSecret: "En 'let it be', la 't' entre dos sonidos vocálicos se suaviza como una 'r' suave de 'pera' (/lɛ-rɪ-bi/). Cantarlo así entrena a tu lengua y a tu oído a no frenar entre palabras.",
      powerChunk: 'In times of trouble...',
      chunkMeaning: 'En momentos de dificultad / cuando las cosas se ponen difíciles...',
      whyGoodForEar: 'El tempo es lento (72 BPM) y cada sílaba cae exactamente sobre el pulso del piano, ideal para principiantes absolutos.',
      youtubeUrl: 'https://www.youtube.com/results?search_query=The+Beatles+Let+It+Be+lyrics',
      spotifyUrl: 'https://open.spotify.com/search/The%20Beatles%20Let%20It%20Be',
      melodyDesc: '🎹 Piano acústico en C - G - Am - F',
      quiz: {
        question: "¿Cómo suena naturalmente la unión de 'Let it be' cantada en inglés?",
        options: [
          'Let... it... be (haciendo pausa entre cada palabra)',
          'Le-ri-bí (la "t" suena suave y fluida como en "pera")',
          'Lét-it-bii (acentuando fuerte la letra T)',
        ],
        correctIndex: 1,
        explanation: '¡Exacto! El fenómeno del "flap T" une "let it" como "le-ri", creando la famosa fluidez musical del inglés.',
      },
    },
    {
      id: 'someone-like-you',
      songTitle: 'Someone Like You',
      artist: 'Adele',
      year: 2011,
      genre: 'Pop / Balada Emotiva',
      category: 'baladas',
      albumContext: 'Balada de piano con frases sentidas de la vida cotidiana y conectores conversacionales de oro.',
      badgeTag: '☕ Inglés de Todos los Días · Expresivo',
      lyricsEnglish: "Never mind, I'll find someone like you. I wish nothing but the best for you, too. Don't forget me, I beg.",
      lyricsSpanish: 'No pasa nada / olvídalo, encontraré a alguien como tú. No te deseo más que lo mejor a ti también. No me olvides, te lo ruego.',
      phoneticSimple: 'Néver máind, ail fáind samwan láik iú. Ai wish nózing bat de best for iú, tu. Dóunt forgét mi, ai beg.',
      musicalEarSecret: "'Never mind' es la frase comodín más elegante para decir 'no te preocupes / no pasa nada'. Adele une 'someone like you' en una sola caricia vocal (/sʌmwʌn-laɪk-ju/).",
      powerChunk: 'Never mind, I will...',
      chunkMeaning: 'No pasa nada / olvídalo, yo me encargo de...',
      whyGoodForEar: 'La voz de Adele acentúa las palabras clave con vibrato lento, permitiendo que tu oído registre cada vocal larga en inglés.',
      youtubeUrl: 'https://www.youtube.com/results?search_query=Adele+Someone+Like+You+lyrics',
      spotifyUrl: 'https://open.spotify.com/search/Adele%20Someone%20Like%20You',
      melodyDesc: '🎹 Arpegio de piano en A - E/G# - F#m - D',
      quiz: {
        question: "¿Qué significa el comodín 'Never mind' en una conversación real?",
        options: [
          'Nunca recuerdes esto',
          'Olvídalo / No pasa nada / No te preocupes',
          'Tengo la mente ocupada',
        ],
        correctIndex: 1,
        explanation: "¡Correcto! 'Never mind' es el bloque perfecto para restar dramatismo o decir 'no te preocupes, ya está'.",
      },
    },
    {
      id: 'what-a-wonderful-world',
      songTitle: 'What a Wonderful World',
      artist: 'Louis Armstrong',
      year: 1967,
      genre: 'Jazz Tradicional / Balada',
      category: 'swing',
      albumContext: 'La melodía optimista más famosa del mundo. Dicción lenta, descriptiva y cargada de imágenes sencillas.',
      badgeTag: '🎷 Cadencia Suave · Dicción Magistral',
      lyricsEnglish: 'I see trees of green, red roses too. I see them bloom for me and you. And I think to myself: what a wonderful world.',
      lyricsSpanish: 'Veo árboles verdes, y rosas rojas también. Las veo florecer para ti y para mí. Y pienso para mis adentros: qué mundo tan maravilloso.',
      phoneticSimple: 'Ai si tris av grin, red róusis tu. Ai si dem blum for mi end iú. End ai zink tu maisélf: wat a wánderful werld.',
      musicalEarSecret: "'Trees of green' se liga /triːz-əv-ɡriːn/. La 'f' de 'of' suena casi como una 'v' suave. Además, 'think to myself' es la forma nativa de decir 'pienso en silencio para mí'.",
      powerChunk: 'And I think to myself...',
      chunkMeaning: 'Y pienso para mis adentros / reflexiono...',
      whyGoodForEar: 'La voz profunda y rasgada de Armstrong alarga las vocales, permitiendo identificar los colores fonéticos sin apuros.',
      youtubeUrl: 'https://www.youtube.com/results?search_query=Louis+Armstrong+What+A+Wonderful+World+lyrics',
      spotifyUrl: 'https://open.spotify.com/search/Louis%20Armstrong%20What%20A%20Wonderful%20World',
      melodyDesc: '🎷 Acordes jazzísticos en F - Am - Bb - C',
      quiz: {
        question: "¿Cómo se une la frase 'trees of green' al cantar?",
        options: [
          'Trees... of... green (tres golpes separados)',
          'Triiz-əv-griin (la S final se enlaza con la O de "of")',
          'Tree of green (elimina la S plural)',
        ],
        correctIndex: 1,
        explanation: '¡Excelente! En inglés, las consonantes finales siempre se montan sobre la vocal de la palabra siguiente.',
      },
    },
    {
      id: 'we-will-rock-you',
      songTitle: 'We Will Rock You',
      artist: 'Queen',
      year: 1977,
      genre: 'Himno Rock Rítmico',
      category: 'clasicos',
      albumContext: 'El ritmo de palmas y pisadas más reconocible de la historia. Perfecto para asimilar el acento rítmico del inglés.',
      badgeTag: '⚡ Ritmo Puro · Acento Rítmico',
      lyricsEnglish: "Buddy, you're a boy, make a big noise, playin' in the street, gonna be a big man someday!",
      lyricsSpanish: '¡Compañero, eres un chico, haciendo mucho ruido, jugando en la calle, algún día serás un gran hombre!',
      phoneticSimple: 'Bádi, ior a bói, méik a big nóis, pléin in de strit, góna bi a big men sámdei!',
      musicalEarSecret: "En el ritmo fuerte, Freddie Mercury omite la 'g' final de 'playing' ('playin') y contrae 'going to' como 'gonna'. Así es exactamente como habla la gente en la calle.",
      powerChunk: 'Gonna be a big... someday!',
      chunkMeaning: 'Algún día voy a ser un gran [profesional / músico]...',
      whyGoodForEar: 'El pulso de dos golpes y una palma marca los tiempos acentuados donde caen las palabras más importantes de la frase.',
      youtubeUrl: 'https://www.youtube.com/results?search_query=Queen+We+Will+Rock+You+official',
      spotifyUrl: 'https://open.spotify.com/search/Queen%20We%20Will%20Rock%20You',
      melodyDesc: '🥁 Percusión rítmica: Stomp, Stomp, CLAP!',
      quiz: {
        question: "¿Por qué en la canción dicen 'playin' en vez de 'playing'?",
        options: [
          'Porque era un error de grabación',
          'Porque en inglés coloquial la terminación -ing suele sonar relajada como -in',
          'Porque es una regla gramatical obligatoria en preguntas',
        ],
        correctIndex: 1,
        explanation: '¡Exacto! La contracción informal de -ing a -in es habitual en canciones y charlas cotidianas informales.',
      },
    },
    {
      id: 'fly-me-to-the-moon',
      songTitle: 'Fly Me to the Moon',
      artist: 'Frank Sinatra',
      year: 1964,
      genre: 'Jazz / Big Band Swing',
      category: 'swing',
      albumContext: 'La cúspide de la elegancia y la dicción. Sinatra era elogiado por no perder jamás la claridad de una sola sílaba.',
      badgeTag: '🎩 Dicción Perfecta · Conectores de Oro',
      lyricsEnglish: 'Fly me to the moon, let me play among the stars. In other words, hold my hand. In other words, baby, kiss me.',
      lyricsSpanish: 'Llévame volando a la luna, déjame jugar entre las estrellas. En otras palabras, toma mi mano. En otras palabras, cariño, bésame.',
      phoneticSimple: 'Flái mi tu de mun, let mi pléi amáng de stars. In áder werds, hóuld mái jend. In áder werds, béibi, kis mi.',
      musicalEarSecret: "'In other words' es uno de los mejores conectores que existen para aclarar lo que quieres decir sin quedarte trabado si olvidas una palabra difícil.",
      powerChunk: 'In other words...',
      chunkMeaning: 'En otras palabras... / dicho de forma sencilla...',
      whyGoodForEar: 'Sinatra respiraba como un cantante de ópera: su fraseo respeta la acentuación natural de la gramática inglesa al 100%.',
      youtubeUrl: 'https://www.youtube.com/results?search_query=Frank+Sinatra+Fly+Me+To+The+Moon+official',
      spotifyUrl: 'https://open.spotify.com/search/Frank%20Sinatra%20Fly%20Me%20To%20The%20Moon',
      melodyDesc: '🎩 Swing jazz en walking bass & piano',
      quiz: {
        question: "¿Para qué te sirve en la vida real el bloque 'In other words'?",
        options: [
          'Para pedir perdón en una reunión formal',
          'Para reformular o explicar una idea con palabras más sencillas',
          'Para decir que vas a guardar silencio',
        ],
        correctIndex: 1,
        explanation: "¡Muy bien! 'In other words' te salva cuando quieres simplificar tu mensaje de forma natural.",
      },
    },
    {
      id: 'viva-la-vida',
      songTitle: 'Viva la Vida',
      artist: 'Coldplay',
      year: 2008,
      genre: 'Pop Épico / Cuerdas',
      category: 'pop',
      albumContext: 'Narración épica con el ritmo contagioso de campanas y violines, ideal para aprender a contar historias pasadas.',
      badgeTag: '🎻 Estructura de Oro · Pasado Hablado',
      lyricsEnglish: 'I used to rule the world, seas would rise when I gave the word. Now in the morning I sleep alone, sweep the streets I used to own.',
      lyricsSpanish: 'Solía gobernar el mundo, los mares se elevaban cuando daba la orden. Ahora por la mañana duermo solo, barro las calles que solían ser mías.',
      phoneticSimple: 'Ai iúst-tu rul de werld, sis wud ráis wen ai géiv de werd. Náu in de mórning ai slip alóun, suíp de strits ai iúst-tu óun.',
      musicalEarSecret: "'I used to' se pronuncia /aɪ juːst-tə/ ('ai-iústa'), jamás se pronuncia una 'd' separada. Es la estructura reina para contar qué hacías antes en tu vida.",
      powerChunk: 'I used to...',
      chunkMeaning: 'Yo antes solía [hacer algo / vivir en / trabajar en]...',
      whyGoodForEar: 'Chris Martin canta con cadencia constante de 138 BPM, entrenando a tu cerebro a anticipar el compás métrico del inglés.',
      youtubeUrl: 'https://www.youtube.com/results?search_query=Coldplay+Viva+La+Vida+official+lyrics',
      spotifyUrl: 'https://open.spotify.com/search/Coldplay%20Viva%20La%20Vida',
      melodyDesc: '🎻 Ostinato de cuerdas en Db - Eb - Ab - Fm',
      quiz: {
        question: "¿Cómo pronuncian los nativos el bloque 'I used to'?",
        options: [
          'Ai iú-sed tu (tres sílabas marcadas)',
          'Ai iús-ta (un solo bloque continuo sin pausa)',
          'Ai iusing tu (en gerundio)',
        ],
        correctIndex: 1,
        explanation: "¡Exacto! La combinación 'used to' se compacta en el habla real como 'iús-ta' de forma casi automática.",
      },
    },
    {
      id: 'three-little-birds',
      songTitle: 'Three Little Birds',
      artist: 'Bob Marley & The Wailers',
      year: 1977,
      genre: 'Reggae / Acústico',
      category: 'clasicos',
      albumContext: 'El himno de tranquilidad más coreado de la tierra. Mensaje simple, positivo y lleno de ritmo cálido.',
      badgeTag: '☀️ Cero Estrés · Frase de Ánimo',
      lyricsEnglish: "Don't worry about a thing, 'cause every little thing is gonna be alright!",
      lyricsSpanish: '¡No te preocupes por nada, porque cada pequeña cosita va a estar bien!',
      phoneticSimple: "Dóunt wórri abáut a zing, koz évri lí-rl zing is góna bi olráit!",
      musicalEarSecret: "'Don't worry about' se encadena en un flujo suave /doʊnt-wɜːri-ə-baʊt/. La 'tt' de 'little' se pronuncia con flap T ('lí-rl'), y 'because' se reduce coloquialmente a ''cause' ('koz').",
      powerChunk: "Don't worry about...",
      chunkMeaning: 'No te preocupes por [el dinero / la hora / los errores]...',
      whyGoodForEar: 'El ritmo síncopado del reggae te enseña a relajarte y no apresurar las palabras, hablando con calma.',
      youtubeUrl: 'https://www.youtube.com/results?search_query=Bob+Marley+Three+Little+Birds+lyrics',
      spotifyUrl: 'https://open.spotify.com/search/Bob%20Marley%20Three%20Little%20Birds',
      melodyDesc: '☀️ Ritmo reggae con guitarras en contratiempo',
      quiz: {
        question: "¿Qué significa la palabra corta ''cause' en la canción?",
        options: [
          'Significa "causa de un problema"',
          'Es la abreviatura cotidiana de "because" (porque)',
          'Significa "con cuidado"',
        ],
        correctIndex: 1,
        explanation: "¡Correcto! En el 90% de las canciones y charlas reales, los angloparlantes dicen ''cause' en lugar de 'because'.",
      },
    },
    {
      id: 'perfect',
      songTitle: 'Perfect',
      artist: 'Ed Sheeran',
      year: 2017,
      genre: 'Balada Romántica Contemporánea',
      category: 'baladas',
      albumContext: 'Una de las canciones más dedicadas del siglo XXI. Vocabulario moderno, natural y de alta frecuencia cotidiana.',
      badgeTag: '❤️ Conversacional · Expresiones Actuales',
      lyricsEnglish: 'I found a love for me. Darling, just dive right in and follow my lead. Well, I found a girl, beautiful and sweet.',
      lyricsSpanish: 'Encontré un amor para mí. Cariño, simplemente lánzate de lleno y sigue mi paso. Bueno, encontré a una chica, hermosa y dulce.',
      phoneticSimple: 'Ai fáund a lav for mi. Dárling, dyast dáiv ráit in end fálou mái lid. Wel, ai fáund a gerl, biútiful end suit.',
      musicalEarSecret: "'Dive right in' es una expresión genial para lanzarse a algo nuevo sin dudar. 'Follow my lead' es la forma nativa de decir 'sigue mi guía / déjame guiarte'.",
      powerChunk: 'Follow my lead...',
      chunkMeaning: 'Sigue mi paso / déjame guiarte / haz lo que yo haga...',
      whyGoodForEar: 'Ed Sheeran combina ritmo de vals suave con una pronunciación inglesa contemporánea super limpia.',
      youtubeUrl: 'https://www.youtube.com/results?search_query=Ed+Sheeran+Perfect+official+audio',
      spotifyUrl: 'https://open.spotify.com/search/Ed%20Sheeran%20Perfect',
      melodyDesc: '❤️ Arpegio acústico en vals 12/8',
      quiz: {
        question: "¿Qué transmite la frase 'Dive right in' en inglés?",
        options: [
          'Nadar obligatoriamente en aguas profundas',
          'Lanzarse de lleno a una experiencia con entusiasmo y sin dudas',
          'Tener cuidado y esperar afuera',
        ],
        correctIndex: 1,
        explanation: "¡Así es! 'Dive right in' es una metáfora muy común para zambullirse de lleno en algo nuevo.",
      },
    },
    {
      id: 'billie-jean',
      songTitle: 'Billie Jean',
      artist: 'Michael Jackson',
      year: 1982,
      genre: 'Pop / Funk Groove',
      category: 'pop',
      albumContext: 'La línea de bajo más famosa del pop. MJ utiliza inflexiones rítmicas rápidas y advertencias conversacionales.',
      badgeTag: '🕺 Agilidad Auditiva · Pop Legendario',
      lyricsEnglish: "People always told me: be careful of what you do. Don't go around breaking young girls' hearts.",
      lyricsSpanish: 'La gente siempre me decía: ten cuidado con lo que haces. No te la pases por ahí rompiendo los corazones de las jóvenes.',
      phoneticSimple: 'Pípl ólwis tóuld mi: bi kérful av wat iú du. Dóunt gou aráund bréiking iang gerls harts.',
      musicalEarSecret: "'Be careful of' se une /biː-kɛːrfəl-əv/. Y 'don't go around doing something' es la manera coloquial de reprochar 'no andes por ahí haciendo eso'.",
      powerChunk: 'Be careful of what you...',
      chunkMeaning: 'Ten cuidado con lo que [haces / dices / compras]...',
      whyGoodForEar: 'Michael canta con respiraciones rítmicas cortas que ayudan a notar cómo se agrupan las palabras en paquetes de 3 o 4 sílabas.',
      youtubeUrl: 'https://www.youtube.com/results?search_query=Michael+Jackson+Billie+Jean+remastered',
      spotifyUrl: 'https://open.spotify.com/search/Michael%20Jackson%20Billie%20Jean',
      melodyDesc: '🕺 Línea de bajo funk icónica en F#m',
      quiz: {
        question: "¿Para qué sirve el patrón 'Be careful of what you...'?",
        options: [
          'Para advertir a alguien amistosamente sobre sus acciones',
          'Para invitar a alguien a bailar',
          'Para preguntar la dirección de una calle',
        ],
        correctIndex: 0,
        explanation: "¡Exacto! 'Be careful of what you do / say' es la advertencia coloquial por excelencia.",
      },
    },
    {
      id: 'every-breath-you-take',
      songTitle: 'Every Breath You Take',
      artist: 'The Police / Sting',
      year: 1983,
      genre: 'Rock Ochentoso / Guitarra Arpegiada',
      category: 'clasicos',
      albumContext: 'Riff de guitarra hipnótico con rimas constantes en terminación de consonante seca (-k).',
      badgeTag: '🎸 Precisión de Consonantes · Rima Limpia',
      lyricsEnglish: "Every breath you take, and every move you make, every bond you break, every step you take: I'll be watching you.",
      lyricsSpanish: 'Cada respiración que tomes, y cada movimiento que hagas, cada lazo que rompas, cada paso que des: te estaré observando.',
      phoneticSimple: 'Évri brez iú téik, end évri muv iú méik, évri band iú bréik, évri step iú téik: ail bi wáching iú.',
      musicalEarSecret: "En español solemos añadir una 'e' fantasma al final de palabras como 'take' o 'make'. Sting canta la 'k' seca y limpia, entrenando a tu oído a cerrar la consonante.",
      powerChunk: 'Every step you take...',
      chunkMeaning: 'Cada paso que des / en cada momento...',
      whyGoodForEar: 'El ritmo es metronómico (como un reloj constante), lo que permite que tu cerebro sincronice cada palabra sin esfuerzo.',
      youtubeUrl: 'https://www.youtube.com/results?search_query=The+Police+Every+Breath+You+Take+lyrics',
      spotifyUrl: 'https://open.spotify.com/search/The%20Police%20Every%20Breath%20You%20Take',
      melodyDesc: '🎸 Riff de guitarra arpegiada en A - F#m - D - E',
      quiz: {
        question: "¿Cómo termina la palabra 'take' o 'make' en la boca de un nativo?",
        options: [
          'Con una vocal suave al final como "téi-ke"',
          'Con un chasquido de consonante seca y limpia en la K (/teɪk/)',
          'Muda por completo sin pronunciar la K',
        ],
        correctIndex: 1,
        explanation: '¡Excelente! En inglés las consonantes finales son secas y precisas, nunca se les agrega una vocal española extra.',
      },
    },
  ];

  // Filtering
  const filteredSongs = songs.filter((s) => {
    const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      s.songTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.lyricsEnglish.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.lyricsSpanish.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const currentSong = filteredSongs[activeSongIndex] || songs[0];

  // 1. Play with Web Audio synthesized musical accompaniment + lyrics in synchrony (100% reliable, zero lag)
  const handlePlayWithMelody = () => {
    unlockMobileAudio();
    stopAllAudio();
    stopMusicSynth();

    setIsPlayingWithMelody(true);
    setIsPlayingAudio(true);
    setPlayingSpeed(0.85);

    // Play the authentic chord progression & melody via Web Audio API
    playSongMusicMotif(currentSong.id, 10);

    // Concurrently speak the lyrics in rhythm with Web Speech API for guaranteed instant playback
    speakWithWebSpeech(
      currentSong.lyricsEnglish,
      0.85,
      () => {
        setIsPlayingAudio(true);
      },
      () => {
        setIsPlayingAudio(false);
        setIsPlayingWithMelody(false);
        setPlayingSpeed(null);
        stopMusicSynth();
      }
    );
  };

  // 2. Play speech audio at custom speed
  const handlePlaySongAudio = (speedMultiplier: number = 0.85) => {
    unlockMobileAudio();
    stopMusicSynth();
    setIsPlayingWithMelody(false);
    setIsPlayingAudio(true);
    setPlayingSpeed(speedMultiplier);

    if (audioMode === 'device') {
      // Direct Web Speech API with 0ms network latency
      speakWithWebSpeech(
        currentSong.lyricsEnglish,
        speedMultiplier,
        () => setIsPlayingAudio(true),
        () => {
          setIsPlayingAudio(false);
          setPlayingSpeed(null);
        }
      );
    } else {
      // Natural Studio voice (Gemini TTS) with automatic fallback
      playEnglishVoice(currentSong.lyricsEnglish, 'Kore', speedMultiplier, {
        onStart: () => setIsPlayingAudio(true),
        onEnd: () => {
          setIsPlayingAudio(false);
          setPlayingSpeed(null);
        },
        onError: () => {
          // Fallback to device speech immediately
          speakWithWebSpeech(
            currentSong.lyricsEnglish,
            speedMultiplier,
            () => setIsPlayingAudio(true),
            () => {
              setIsPlayingAudio(false);
              setPlayingSpeed(null);
            }
          );
        },
      });
    }
  };

  const handleStopAll = () => {
    stopMusicSynth();
    stopAllAudio();
    setIsPlayingAudio(false);
    setIsPlayingWithMelody(false);
    setPlayingSpeed(null);
  };

  const handlePlayChunkAudio = (chunkText: string) => {
    unlockMobileAudio();
    stopMusicSynth();
    playEnglishVoice(chunkText, 'Kore', 0.85);
  };

  const handleTestSpeaker = async () => {
    setSoundTestStatus('Probando altavoz de tu celular...');
    const result = await testMobileSpeaker();
    setSoundTestStatus(result.message);
  };

  const handleSelectQuizOption = (index: number) => {
    setQuizAnswer(index);
    setShowQuizFeedback(true);
    if (index === currentSong.quiz.correctIndex) {
      triggerConfetti();
    }
  };

  const handleNextSong = () => {
    handleStopAll();
    if (activeSongIndex < filteredSongs.length - 1) {
      setActiveSongIndex((prev) => prev + 1);
      setQuizAnswer(null);
      setShowQuizFeedback(false);
    } else {
      setActiveSongIndex(0);
      setQuizAnswer(null);
      setShowQuizFeedback(false);
    }
  };

  const handlePrevSong = () => {
    handleStopAll();
    if (activeSongIndex > 0) {
      setActiveSongIndex((prev) => prev - 1);
      setQuizAnswer(null);
      setShowQuizFeedback(false);
    } else {
      setActiveSongIndex(filteredSongs.length - 1);
      setQuizAnswer(null);
      setShowQuizFeedback(false);
    }
  };

  const toggleLikeSong = (songId: string) => {
    setLikedSongs((prev) => ({
      ...prev,
      [songId]: !prev[songId],
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-fade-in">
      {/* Hero Banner for Music Ear Training */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1A0B2E] via-[#2D124D] to-[#0D061F] border border-fuchsia-500/30 p-6 sm:p-10 shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-fuchsia-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/20 border border-fuchsia-400/40 text-fuchsia-300 text-xs font-bold uppercase tracking-wider">
              <Disc3 className="w-4 h-4 animate-spin text-fuchsia-400" />
              <span>Gimnasio Auditivo Musical</span>
              <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-pulse" />
              <span className="text-amber-300">10 Canciones Célebres</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Música en Inglés para Acostumbrar el Oído</span>
              <span className="text-3xl sm:text-4xl">🎵</span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              La música es el truco definitivo para tu cerebro: el ritmo exagera las palabras importantes y une los sonidos exactamente como hablan los nativos en la calle. Escucha canciones con <strong className="text-amber-300">subtítulos en español</strong>, fonética figurada, melodía sintetizada y acceso directo a las versiones originales.
            </p>

            {/* Subtitles Mode Selector Badges */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
                <Languages className="w-3.5 h-3.5 text-amber-400" />
                Modo de Letra:
              </span>
              <button
                onClick={() => setSubtitleMode('spanish')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  subtitleMode === 'spanish'
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20 scale-105'
                    : 'bg-[#180E38] text-slate-300 hover:text-white border border-[#372366]'
                }`}
              >
                <span>🇪🇸</span>
                <span>En Español (Recomendado)</span>
              </button>
              <button
                onClick={() => setSubtitleMode('both')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  subtitleMode === 'both'
                    ? 'bg-fuchsia-400 text-slate-950 shadow-md shadow-fuchsia-400/20 scale-105'
                    : 'bg-[#180E38] text-slate-300 hover:text-white border border-[#372366]'
                }`}
              >
                <span>🌐</span>
                <span>Bilingüe (Karaoke)</span>
              </button>
              <button
                onClick={() => setSubtitleMode('english')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  subtitleMode === 'english'
                    ? 'bg-emerald-400 text-slate-950 shadow-md shadow-emerald-400/20 scale-105'
                    : 'bg-[#180E38] text-slate-300 hover:text-white border border-[#372366]'
                }`}
              >
                <span>🇬🇧</span>
                <span>Solo Inglés</span>
              </button>
              <button
                onClick={() => setSubtitleMode('hidden')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  subtitleMode === 'hidden'
                    ? 'bg-slate-200 text-slate-950 shadow-md scale-105'
                    : 'bg-[#180E38] text-slate-300 hover:text-white border border-[#372366]'
                }`}
              >
                <EyeOff className="w-3.5 h-3.5" />
                <span>A Ciegas (Reto Auditivo)</span>
              </button>
            </div>
          </div>

          {/* Quick Sound Troubleshooter & Cinema Navigation */}
          <div className="flex flex-row lg:flex-col items-center sm:items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 lg:border-l border-fuchsia-500/20 lg:pl-6">
            <button
              onClick={() => {
                setShowDiagnosticModal(true);
                handleTestSpeaker();
              }}
              className="px-4 py-2.5 rounded-xl bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/40 text-amber-300 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm hover:scale-102"
              title="¿No escuchas el audio? Haz clic para verificar el sonido de tu celular o computadora"
            >
              <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>¿No escuchas sonido? Toca aquí</span>
            </button>

            {onNavigateToCinema && (
              <button
                onClick={onNavigateToCinema}
                className="px-4 py-2 rounded-xl bg-[#241245] hover:bg-[#341B61] text-xs font-bold text-amber-300 border border-amber-400/30 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span>🎬</span>
                <span>Ver Películas en Inglés</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sound Diagnostic Alert Banner if user opened it */}
      {showDiagnosticModal && (
        <div className="bg-[#1C123D] border-2 border-amber-400/70 rounded-2xl p-5 shadow-2xl relative animate-fade-in">
          <button
            onClick={() => setShowDiagnosticModal(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-white text-xs font-bold px-2 py-1 bg-slate-800 rounded-lg cursor-pointer"
          >
            ✕ Cerrar
          </button>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <HelpCircle className="w-5 h-5 text-amber-400" />
              <span>Diagnóstico de Sonido y Altavoz</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              Si no escuchas nada al presionar reproducir, el 99% de las veces se debe a dos motivos habituales:
            </p>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-5">
              <li>
                <strong className="text-amber-300">En iPhone / iPad:</strong> La palanquita física lateral de silencio (o el interruptor del Centro de Control) suele estar en naranja/silencio. Desactívala y sube el volumen multimedia.
              </li>
              <li>
                <strong className="text-amber-300">En Android / Computadora:</strong> Verifica que el volumen multimedia no esté en cero o en modo 'No Molestar'.
              </li>
              <li>
                <strong className="text-amber-300">Permiso del navegador:</strong> Algunos navegadores requieren un primer toque en la pantalla para activar el audio.
              </li>
            </ul>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleTestSpeaker}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Volume2 className="w-4 h-4" />
                <span>Tocar timbre de prueba ahora</span>
              </button>
              {soundTestStatus && (
                <span className="text-xs text-emerald-300 font-medium bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                  {soundTestStatus}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Category Pills & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Genre / Mood Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'Todas las Canciones (10)', icon: '🎵' },
            { id: 'clasicos', label: 'Clásicos Inmortales', icon: '🎸' },
            { id: 'baladas', label: 'Baladas Acústicas', icon: '☕' },
            { id: 'pop', label: 'Pop & Ritmo', icon: '🕺' },
            { id: 'swing', label: 'Swing & Jazz', icon: '🎷' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                handleStopAll();
                setSelectedCategory(cat.id);
                setActiveSongIndex(0);
                setQuizAnswer(null);
                setShowQuizFeedback(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-fuchsia-500 text-white shadow-md shadow-fuchsia-500/25'
                  : 'bg-[#150F2E] text-slate-300 hover:text-white border border-[#2B2056] hover:bg-[#1E1642]'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setActiveSongIndex(0);
            }}
            placeholder="Buscar por artista, tema o letra..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#130E2A] border border-[#2B2056] text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-fuchsia-400 transition-all"
          />
        </div>
      </div>

      {/* Main Song Showcase Player */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Song Disc & Player Box (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-[#140D2E] border border-fuchsia-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            {/* Top Bar inside card: Artist, Title & Navigation Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2C1C5A] pb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-fuchsia-600 to-amber-400 p-0.5 shadow-lg flex items-center justify-center">
                  <div className="w-full h-full bg-[#140D2E] rounded-[14px] flex items-center justify-center">
                    <Disc3 className={`w-6 h-6 text-fuchsia-400 ${isPlayingAudio ? 'animate-spin' : ''}`} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-400">{currentSong.artist}</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-xs text-slate-400">{currentSong.year}</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-[10px] uppercase font-bold text-fuchsia-300 bg-fuchsia-500/20 px-2 py-0.5 rounded-full border border-fuchsia-500/30">
                      {currentSong.genre}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    {currentSong.songTitle}
                  </h2>
                </div>
              </div>

              {/* Like Button & Song Counter */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleLikeSong(currentSong.id)}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    likedSongs[currentSong.id]
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                      : 'bg-[#1C133E] text-slate-400 hover:text-white border-[#342468]'
                  }`}
                  title="Guardar en mis favoritas"
                >
                  <Heart className={`w-4 h-4 ${likedSongs[currentSong.id] ? 'fill-rose-400' : ''}`} />
                </button>
                <span className="text-xs font-bold text-slate-400 bg-[#1C133E] px-3 py-1.5 rounded-xl border border-[#342468]">
                  {activeSongIndex + 1} de {filteredSongs.length}
                </span>
              </div>
            </div>

            {/* Context Note & Melody info */}
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-l-2 border-fuchsia-400 pl-3">
              <p className="text-xs sm:text-sm text-slate-300 italic">
                "{currentSong.albumContext}"
              </p>
              <span className="text-[11px] font-semibold text-fuchsia-300 bg-fuchsia-950/60 border border-fuchsia-500/30 px-2.5 py-1 rounded-lg shrink-0">
                {currentSong.melodyDesc}
              </span>
            </div>

            {/* Lyrics Card with Interactive Karaoke Subtitles */}
            <div className="mt-6 rounded-2xl bg-[#0C081E] border border-fuchsia-500/20 p-6 sm:p-8 space-y-4 shadow-inner relative">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 border-b border-slate-800/80 pb-2">
                <span className="flex items-center gap-1.5 text-fuchsia-300">
                  <Mic2 className="w-3.5 h-3.5" />
                  Estrofa & Letra Clave
                </span>
                <span className="text-[11px] text-amber-300 font-normal">
                  {subtitleMode === 'spanish' && '🇪🇸 Subtítulos en español visibles'}
                  {subtitleMode === 'both' && '🌐 Modo bilingüe activo'}
                  {subtitleMode === 'english' && '🇬🇧 Solo letra en inglés'}
                  {subtitleMode === 'hidden' && '🙈 Letra oculta (Reto auditivo)'}
                </span>
              </div>

              {/* Subtitle Display */}
              {subtitleMode === 'hidden' ? (
                <div className="py-8 text-center space-y-2">
                  <div className="inline-flex p-3 rounded-2xl bg-fuchsia-950/40 border border-fuchsia-500/30 text-fuchsia-300">
                    <Headphones className="w-7 h-7 animate-pulse" />
                  </div>
                  <h4 className="text-base font-bold text-white">Letra Oculta para Entrenar el Oído</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Dale reproducir abajo con melodía o a distintas velocidades e intenta captar las palabras sin leer. Cuando quieras comprobar tu oído, cambia el modo de subtítulo arriba.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* English Lyrics */}
                  {(subtitleMode === 'english' || subtitleMode === 'both' || subtitleMode === 'spanish') && (
                    <div className="space-y-1">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-fuchsia-300/80">
                        Inglés Original (Lyrics):
                      </div>
                      <blockquote className="text-lg sm:text-2xl font-bold text-white tracking-normal leading-snug">
                        "{currentSong.lyricsEnglish}"
                      </blockquote>
                    </div>
                  )}

                  {/* Spanish Subtitle / Translation */}
                  {(subtitleMode === 'spanish' || subtitleMode === 'both') && (
                    <div className="space-y-1 pt-2 border-t border-slate-800/70">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-amber-300/90 flex items-center gap-1">
                        <span>🇪🇸</span>
                        <span>Significado en Español (Sin rodeos):</span>
                      </div>
                      <p className="text-sm sm:text-base text-amber-200/90 font-medium leading-relaxed">
                        "{currentSong.lyricsSpanish}"
                      </p>
                    </div>
                  )}

                  {/* Phonetics for Spanish Speakers (Cómo cantarla de corrido) */}
                  <div className="space-y-1 pt-2 border-t border-slate-800/70 bg-[#160D33]/60 -mx-6 -mb-6 p-4 rounded-b-2xl">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Fonética Figurada (Léelo tal cual en español para cantarla):</span>
                    </div>
                    <p className="text-xs sm:text-sm font-mono text-emerald-200 tracking-wide">
                      {currentSong.phoneticSimple}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* DUAL HIGH-POWER AUDIO CONTROL BAR */}
            <div className="mt-6 space-y-4">
              {/* PRIMARY PLAYER: Authentic Web Audio Melodic Synth + Voice In Sync */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#24134B] via-[#1E113F] to-[#120B29] border-2 border-fuchsia-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 text-[11px] font-bold">
                    <Music className="w-3.5 h-3.5 animate-bounce" />
                    <span>Reproductor Musical con Acompañamiento</span>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-white">
                    Escucha la Melodía & el Ritmo de la Canción
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    Sintetizado al instante en tu celular: acordes reales de piano, cuerdas o bajo con voz sincronizada.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isPlayingAudio || isPlayingWithMelody ? (
                    <button
                      onClick={handleStopAll}
                      className="px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs transition-all cursor-pointer shadow-lg shadow-rose-900/40 flex items-center gap-2 scale-102"
                    >
                      <Square className="w-4 h-4 fill-white" />
                      <span>Detener Sonido</span>
                    </button>
                  ) : (
                    <button
                      onClick={handlePlayWithMelody}
                      className="px-5 py-3 rounded-xl bg-gradient-to-r from-fuchsia-500 to-amber-400 hover:from-fuchsia-400 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm transition-all cursor-pointer shadow-xl shadow-fuchsia-500/30 flex items-center gap-2 hover:scale-103"
                      title="Reproducir acordes y melodía musical con voz sincronizada"
                    >
                      <Play className="w-4 h-4 fill-slate-950" />
                      <span>▶️ Escuchar con Melodía</span>
                    </button>
                  )}
                </div>
              </div>

              {/* SECONDARY PLAYER: Speech Pronunciation in 3 Speeds */}
              <div className="p-3.5 rounded-2xl bg-[#1A113B] border border-[#3A2770] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                    <Volume2 className="w-4 h-4 text-fuchsia-400" />
                    <span>Pronunciación Hablada (Solo Voz):</span>
                  </span>
                  {isPlayingAudio && !isPlayingWithMelody && (
                    <span className="text-xs text-amber-300 font-bold animate-pulse flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      Sonando a {playingSpeed}x...
                    </span>
                  )}
                </div>

                {/* Multi-speed Audio Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePlaySongAudio(0.65)}
                    className="px-3 py-1.5 rounded-xl bg-[#281854] hover:bg-[#392275] text-xs font-bold text-amber-300 border border-amber-400/40 transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                    title="Audio muy lento para no perderte ni una consonante"
                  >
                    <Play className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>0.65x Lento</span>
                  </button>
                  <button
                    onClick={() => handlePlaySongAudio(0.85)}
                    className="px-3 py-1.5 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-xs font-bold text-white transition-all cursor-pointer flex items-center gap-1 shadow-md shadow-fuchsia-600/25"
                    title="Audio pausado y cantable (Recomendado)"
                  >
                    <Play className="w-3 h-3 text-white fill-white" />
                    <span>0.85x Pausado</span>
                  </button>
                  <button
                    onClick={() => handlePlaySongAudio(1.0)}
                    className="px-3 py-1.5 rounded-xl bg-[#281854] hover:bg-[#392275] text-xs font-bold text-slate-200 border border-slate-600 transition-all cursor-pointer flex items-center gap-1"
                    title="Velocidad normal nativa"
                  >
                    <Play className="w-3 h-3 text-slate-300 fill-slate-300" />
                    <span>1.0x Nativo</span>
                  </button>
                </div>
              </div>

              {/* EXTERNAL ORIGINAL ARTIST RECORDINGS: YouTube & Spotify */}
              <div className="p-3.5 rounded-2xl bg-[#0F0A24] border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-300 font-medium">
                    ¿Quieres escuchar la voz original de <strong>{currentSong.artist}</strong>?
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={currentSong.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Youtube className="w-3.5 h-3.5 text-red-400" />
                    <span>Ver en YouTube Oficial</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href={currentSong.spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Disc3 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Abrir en Spotify</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom Navigation: Next / Prev Song */}
            <div className="mt-6 flex items-center justify-between pt-4 border-t border-[#2A1B57]">
              <button
                onClick={handlePrevSong}
                className="px-4 py-2 rounded-xl bg-[#1A123C] hover:bg-[#281C5C] text-xs font-bold text-slate-200 border border-[#382672] transition-colors cursor-pointer flex items-center gap-2"
              >
                <span>← Canción Anterior</span>
              </button>
              <button
                onClick={handleNextSong}
                className="px-5 py-2 rounded-xl bg-fuchsia-500 hover:bg-fuchsia-400 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-fuchsia-500/20 flex items-center gap-2"
              >
                <span>Siguiente Canción →</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Educational Side Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* El Secreto Musical del Oído */}
          <div className="bg-[#140D2E] border border-fuchsia-500/30 rounded-3xl p-6 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Headphones className="w-4 h-4 text-amber-400" />
              <span>El Secreto Musical del Oído</span>
            </div>
            <h3 className="text-base font-black text-white">¿Por qué suena así al cantar?</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {currentSong.musicalEarSecret}
            </p>
            <div className="pt-2 text-[11px] text-fuchsia-300 bg-fuchsia-950/40 border border-fuchsia-500/20 p-3 rounded-xl">
              <strong>💡 Beneficio para tu oído:</strong> {currentSong.whyGoodForEar}
            </div>
          </div>

          {/* Bloque de Poder de la Canción (Frase Reutilizable) */}
          <div className="bg-[#140D2E] border border-emerald-500/30 rounded-3xl p-6 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Bloque de Poder de Esta Canción</span>
            </div>
            <h3 className="text-sm font-bold text-slate-300">
              Frase que puedes usar hoy mismo en una charla:
            </h3>

            <div className="bg-[#0C081E] border border-emerald-500/20 p-4 rounded-2xl flex items-center justify-between gap-3">
              <div>
                <div className="text-base font-black text-white">{currentSong.powerChunk}</div>
                <div className="text-xs text-amber-300">{currentSong.chunkMeaning}</div>
              </div>
              <button
                onClick={() => handlePlayChunkAudio(currentSong.powerChunk)}
                className="p-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition-all cursor-pointer shadow-xs"
                title="Escuchar este bloque de poder"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mini-Quiz Interactivo de Reconocimiento Auditivo */}
          <div className="bg-[#140D2E] border border-amber-400/30 rounded-3xl p-6 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Mini-Reto Auditivo</span>
            </div>
            <h4 className="text-sm font-bold text-white">
              {currentSong.quiz.question}
            </h4>

            <div className="space-y-2 pt-1">
              {currentSong.quiz.options.map((opt, idx) => {
                const isSelected = quizAnswer === idx;
                const isCorrect = idx === currentSong.quiz.correctIndex;
                let btnStyle = 'bg-[#1A123C] text-slate-300 hover:text-white border-[#382672] hover:bg-[#251A52]';
                if (showQuizFeedback) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold';
                  } else if (isSelected) {
                    btnStyle = 'bg-red-500/20 text-red-300 border-red-500/50';
                  }
                }
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectQuizOption(idx)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer flex items-center justify-between gap-2 ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {showQuizFeedback && isCorrect && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {showQuizFeedback && (
              <div className="p-3 rounded-xl bg-[#1A113B] border border-amber-400/30 text-xs text-amber-200 space-y-1 animate-fade-in">
                <span className="font-bold text-white">
                  {quizAnswer === currentSong.quiz.correctIndex ? '¡Excelente oído! 🎉' : '¡Casi! Repasa el secreto auditivo:'}
                </span>
                <p>{currentSong.quiz.explanation}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid of All Available Songs (Quick Picker) */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Disc3 className="w-5 h-5 text-fuchsia-400" />
              <span>Explora el Catálogo Musical Completo</span>
            </h3>
            <p className="text-xs text-slate-400">
              Haz clic en cualquier canción para abrir su reproductor de oído, melodía y subtítulos en español.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {filteredSongs.map((s, index) => {
            const isSelected = index === activeSongIndex;
            return (
              <button
                key={s.id}
                onClick={() => {
                  handleStopAll();
                  setActiveSongIndex(index);
                  setQuizAnswer(null);
                  setShowQuizFeedback(false);
                  window.scrollTo({ top: 350, behavior: 'smooth' });
                }}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-full ${
                  isSelected
                    ? 'bg-fuchsia-950/40 border-fuchsia-400 shadow-lg shadow-fuchsia-500/20 ring-1 ring-fuchsia-400/50'
                    : 'bg-[#130E2A] hover:bg-[#1C143D] border-[#2A1D54] hover:border-fuchsia-500/40'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-amber-300">
                      {s.genre}
                    </span>
                    <span className="text-[11px] text-slate-500">{s.year}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white truncate">{s.songTitle}</h4>
                  <p className="text-xs text-fuchsia-300 font-medium truncate">{s.artist}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="truncate max-w-[120px]">{s.powerChunk}</span>
                  <span className="text-amber-400 font-bold">Escuchar →</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

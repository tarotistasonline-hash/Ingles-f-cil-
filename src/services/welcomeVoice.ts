/**
 * Dedicated Automatic Spoken Welcome Service
 * Plays the neutral Latin American male greeting automatically on site entrance.
 * Coordinates with the preloaded native HTML audio player in index.html for instant 0ms playback.
 * Automatically unlocks on any user gesture across the document if browser restricts initial autoplay.
 */

let welcomeAudio: HTMLAudioElement | null = null;
let hasSuccessfullyStarted = false;
let isInitialized = false;

const AUDIO_SRC_MP3 = '/audio/welcome_latino_neutro.mp3';
const AUDIO_SRC_WAV = '/audio/welcome_latino_neutro.wav';
const WELCOME_TEXT =
  '¡Hola! Estás en el lugar correcto si querés aprender inglés rápido y fácil. ¡Bienvenido!';

function getOrCreateWelcomeAudio(): HTMLAudioElement {
  if (typeof document !== 'undefined') {
    const existing = document.getElementById('site-welcome-audio') as HTMLAudioElement | null;
    if (existing) {
      welcomeAudio = existing;
      return existing;
    }
  }

  if (!welcomeAudio) {
    welcomeAudio = new Audio(AUDIO_SRC_MP3);
    welcomeAudio.preload = 'auto';
    welcomeAudio.volume = 1.0;
    (welcomeAudio as any).playsInline = true;

    // Fallback to WAV if MP3 fails to decode on uncommon webviews
    welcomeAudio.onerror = () => {
      if (welcomeAudio && welcomeAudio.src.endsWith('.mp3')) {
        welcomeAudio.src = AUDIO_SRC_WAV;
        welcomeAudio.load();
        welcomeAudio.play().catch(() => {
          fallbackWebSpeechMale();
        });
      }
    };
  }
  return welcomeAudio;
}

/**
 * Fallback synthesizer: Male Latin American voice (es-MX) with warm masculine pitch.
 * Strictly excludes Peninsular/Castizo (es-ES / Spain) and female voices.
 */
function fallbackWebSpeechMale() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();

    const utterance = new SpeechSynthesisUtterance(WELCOME_TEXT);
    utterance.lang = 'es-MX';
    utterance.pitch = 0.85;
    utterance.rate = 1.0;

    const allVoices = window.speechSynthesis.getVoices();
    const isCastizo = (v: SpeechSynthesisVoice) => {
      const l = (v.lang || '').toLowerCase();
      const n = (v.name || '').toLowerCase();
      return (
        l === 'es-es' ||
        l.startsWith('es-es') ||
        n.includes('spain') ||
        n.includes('españa') ||
        n.includes('castilian') ||
        n.includes('castellano') ||
        n.includes('peninsular')
      );
    };

    const isFemale = (v: SpeechSynthesisVoice) => {
      const n = (v.name || '').toLowerCase();
      const femaleKeys = [
        'female',
        'mujer',
        'sabina',
        'elena',
        'monica',
        'mónica',
        'paulina',
        'luciana',
        'rosa',
        'soledad',
        'laura',
        'sofia',
        'marisol',
        'francisca',
        'conchita',
        'carmen',
        'mia',
        'andrea',
        'victoria',
        'paloma',
        'ximena',
        'valentina',
        'camila',
      ];
      return femaleKeys.some((k) => n.includes(k));
    };

    const latinVoices = allVoices.filter(
      (v) => v.lang.toLowerCase().startsWith('es') && !isCastizo(v)
    );

    const maleNames = ['jorge', 'diego', 'carlos', 'gonzalo', 'miguel', 'alonso', 'mateo', 'raul', 'male', 'hombre'];
    let chosen = latinVoices.find((v) => !isFemale(v) && maleNames.some((m) => v.name.toLowerCase().includes(m)));
    if (!chosen) chosen = latinVoices.find((v) => !isFemale(v));
    if (!chosen && latinVoices.length > 0) chosen = latinVoices[0];

    if (chosen) {
      utterance.voice = chosen;
      utterance.lang = chosen.lang;
    }

    window.speechSynthesis.speak(utterance);
    hasSuccessfullyStarted = true;
  } catch {
    // ignore
  }
}

/**
 * Initializes automatic welcome voice playback.
 * 1. Coordinates with native HTML player for instant 0ms playback.
 * 2. Attempts immediate audio play on mount without requiring any user click.
 * 3. Catches any interaction in capture phase across window & document as instant fallback.
 */
export function initWelcomeVoice(): void {
  if (typeof window === 'undefined') return;

  // Check if early HTML script already started the audio successfully
  if ((window as any).__welcomeAudioStarted) {
    hasSuccessfullyStarted = true;
    return;
  }

  if (isInitialized) return;
  isInitialized = true;

  const audio = getOrCreateWelcomeAudio();

  const activationEvents = [
    'pointerdown',
    'touchstart',
    'touchend',
    'mousedown',
    'click',
    'keydown',
    'scroll',
    'wheel',
  ];

  const removeListeners = () => {
    activationEvents.forEach((ev) => {
      window.removeEventListener(ev, onUserActivation, true);
      document.removeEventListener(ev, onUserActivation, true);
    });
  };

  const tryPlay = () => {
    if (hasSuccessfullyStarted) return;

    // Check if early HTML audio started
    if ((window as any).__welcomeAudioStarted) {
      hasSuccessfullyStarted = true;
      removeListeners();
      return;
    }

    // Pre-warm audio context
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
      }
    } catch {
      // ignore
    }

    try {
      const p = audio.play();
      if (p !== undefined) {
        p.then(() => {
          hasSuccessfullyStarted = true;
          (window as any).__welcomeAudioStarted = true;
          removeListeners();
        }).catch(() => {
          // Autoplay policy prevented immediate playback; listeners remain active in capture phase
        });
      }
    } catch {
      // ignore
    }
  };

  const onUserActivation = () => {
    if (!hasSuccessfullyStarted) {
      tryPlay();
    }
  };

  audio.onplay = () => {
    hasSuccessfullyStarted = true;
    (window as any).__welcomeAudioStarted = true;
    removeListeners();
  };

  // Immediate attempt
  tryPlay();

  // Retry attempts as DOM hydrates and browser window gains focus
  setTimeout(tryPlay, 100);
  setTimeout(tryPlay, 300);
  setTimeout(tryPlay, 700);
  setTimeout(tryPlay, 1200);

  // Attach global capture-phase listeners on both window and document
  activationEvents.forEach((ev) => {
    window.addEventListener(ev, onUserActivation, { capture: true, passive: true });
    document.addEventListener(ev, onUserActivation, { capture: true, passive: true });
  });
}

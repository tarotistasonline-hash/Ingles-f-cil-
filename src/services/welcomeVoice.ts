/**
 * Dedicated Automatic Spoken Welcome Service
 * Plays the neutral Latin American male greeting automatically on site entrance.
 * Handles browser autoplay policies with zero-friction activation on user entry.
 */

let welcomeAudio: HTMLAudioElement | null = null;
let hasSuccessfullyStarted = false;
let isInitialized = false;

const AUDIO_SRC_MP3 = '/audio/welcome_latino_neutro.mp3';
const AUDIO_SRC_WAV = '/audio/welcome_latino_neutro.wav';
const WELCOME_TEXT =
  '¡Hola! Estás en el lugar correcto si querés aprender inglés rápido y fácil. ¡Bienvenido!';

function getOrCreateWelcomeAudio(): HTMLAudioElement {
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
        welcomeAudio.play().catch(() => {});
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
  } catch {
    // ignore
  }
}

/**
 * Initializes automatic welcome voice playback.
 * 1. Tries immediate playback as soon as the app component mounts.
 * 2. If browser policy holds audio, automatically activates on the user's first tap/touch/click.
 */
export function initWelcomeVoice(): void {
  if (typeof window === 'undefined') return;
  if (isInitialized) return;
  isInitialized = true;

  const audio = getOrCreateWelcomeAudio();

  const activationEvents = ['click', 'touchstart', 'touchend', 'pointerdown', 'mousedown', 'keydown'];

  const removeListeners = () => {
    activationEvents.forEach((ev) => window.removeEventListener(ev, onUserActivation));
  };

  const tryPlay = () => {
    if (hasSuccessfullyStarted) return;

    // Unmute / pre-warm audio context
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

    const p = audio.play();
    if (p !== undefined) {
      p.then(() => {
        hasSuccessfullyStarted = true;
        removeListeners();
      }).catch(() => {
        // Autoplay policy prevented immediate playback; listeners remain active
      });
    }
  };

  const onUserActivation = () => {
    if (!hasSuccessfullyStarted) {
      tryPlay();
    }
  };

  audio.onplay = () => {
    hasSuccessfullyStarted = true;
    removeListeners();
  };

  // Immediate attempt
  tryPlay();

  // Retry after small delays as document gains focus
  setTimeout(tryPlay, 200);
  setTimeout(tryPlay, 800);

  // Attach single global activation listeners
  activationEvents.forEach((ev) => {
    window.addEventListener(ev, onUserActivation, { passive: true });
  });
}

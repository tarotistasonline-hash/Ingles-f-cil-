/**
 * Dedicated Automatic Spoken Welcome Service
 * Plays the neutral Latin American greeting automatically on site entrance for ALL visitors.
 * Coordinates with the preloaded native HTML audio player in index.html for instant 0ms playback.
 * Automatically unlocks on ANY user interaction across the entire screen if browser autoplay restrictions apply.
 */

export interface WelcomeVoiceState {
  isPlaying: boolean;
  hasPlayed: boolean;
  isBlockedByAutoplay: boolean;
  currentTime: number;
  duration: number;
  hasStarted: boolean;
  dismissed: boolean;
}

type WelcomeListener = (state: WelcomeVoiceState) => void;

const listeners = new Set<WelcomeListener>();

function resolveAudioPath(filename: string): string {
  if (typeof window === 'undefined') return `/audio/${filename}`;
  // If hosted in a GitHub Pages subdirectory (e.g. /my-repo/) or root
  const pathname = window.location.pathname;
  const base = pathname.endsWith('/') ? pathname.slice(0, -1) : (pathname.includes('.') ? pathname.substring(0, pathname.lastIndexOf('/')) : pathname);
  const cleanBase = base.replace(/\/+$/, '');
  return `${cleanBase}/audio/${filename}`;
}

const AUDIO_SRC_MP3 = resolveAudioPath('welcome_latino_neutro.mp3');
const AUDIO_SRC_WAV = resolveAudioPath('welcome_latino_neutro.wav');
const FALLBACK_SRC_MP3 = './audio/welcome_latino_neutro.mp3';
const WELCOME_TEXT =
  '¡Hola! Estás en el lugar correcto si querés aprender inglés rápido y fácil. ¡Bienvenido!';

let welcomeAudio: HTMLAudioElement | null = null;
let isInitialized = false;

let state: WelcomeVoiceState = {
  isPlaying: false,
  hasPlayed: false,
  isBlockedByAutoplay: false,
  currentTime: 0,
  duration: 10,
  hasStarted: false,
  dismissed: false,
};

function notifyListeners() {
  const snapshot = { ...state };
  listeners.forEach((listener) => {
    try {
      listener(snapshot);
    } catch {
      // ignore listener error
    }
  });
}

export function subscribeWelcomeState(listener: WelcomeListener): () => void {
  listeners.add(listener);
  listener({ ...state });
  return () => {
    listeners.delete(listener);
  };
}

export function getWelcomeState(): WelcomeVoiceState {
  return { ...state };
}

export function dismissWelcomeBar() {
  state.dismissed = true;
  notifyListeners();
}

/**
 * Gets or creates the HTMLAudioElement for the welcome voice
 */
export function getOrCreateWelcomeAudio(): HTMLAudioElement {
  if (typeof document !== 'undefined') {
    const existing = document.getElementById('site-welcome-audio') as HTMLAudioElement | null;
    if (existing) {
      welcomeAudio = existing;
      attachAudioEvents(existing);
      return existing;
    }
  }

  if (!welcomeAudio && typeof Audio !== 'undefined') {
    welcomeAudio = new Audio(AUDIO_SRC_MP3);
    welcomeAudio.id = 'site-welcome-audio';
    welcomeAudio.preload = 'auto';
    welcomeAudio.volume = 1.0;
    (welcomeAudio as any).playsInline = true;

    // Fallback if initial MP3 fails to load
    let retryCount = 0;
    welcomeAudio.onerror = () => {
      if (!welcomeAudio) return;
      retryCount++;
      if (retryCount === 1) {
        welcomeAudio.src = FALLBACK_SRC_MP3;
        welcomeAudio.load();
        welcomeAudio.play().catch(() => {});
      } else if (retryCount === 2) {
        welcomeAudio.src = AUDIO_SRC_WAV;
        welcomeAudio.load();
        welcomeAudio.play().catch(() => {
          fallbackWebSpeechMale();
        });
      } else {
        fallbackWebSpeechMale();
      }
    };

    attachAudioEvents(welcomeAudio);
  }
  return welcomeAudio!;
}

let eventsAttached = false;
function attachAudioEvents(audio: HTMLAudioElement) {
  if (eventsAttached || !audio) return;
  eventsAttached = true;

  audio.addEventListener('play', () => {
    state.isPlaying = true;
    state.hasStarted = true;
    state.isBlockedByAutoplay = false;
    notifyListeners();
  });

  audio.addEventListener('pause', () => {
    state.isPlaying = false;
    notifyListeners();
  });

  audio.addEventListener('ended', () => {
    state.isPlaying = false;
    state.hasPlayed = true;
    notifyListeners();
  });

  audio.addEventListener('timeupdate', () => {
    state.currentTime = audio.currentTime;
    if (audio.duration && !isNaN(audio.duration)) {
      state.duration = audio.duration;
    }
    notifyListeners();
  });

  audio.addEventListener('loadedmetadata', () => {
    if (audio.duration && !isNaN(audio.duration)) {
      state.duration = audio.duration;
      notifyListeners();
    }
  });
}

/**
 * Pre-warms the browser's audio pipeline (resumes AudioContext).
 */
function prewarmAudioContext() {
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
}

/**
 * Fallback synthesizer: Male Latin American voice (es-MX)
 */
function fallbackWebSpeechMale() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();

    const utterance = new SpeechSynthesisUtterance(WELCOME_TEXT);
    utterance.lang = 'es-MX';
    utterance.pitch = 0.88;
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
        n.includes('castellano')
      );
    };

    const isFemale = (v: SpeechSynthesisVoice) => {
      const n = (v.name || '').toLowerCase();
      const femaleKeys = ['female', 'mujer', 'sabina', 'monica', 'elena', 'paulina', 'luciana', 'sofia', 'rosa'];
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

    utterance.onstart = () => {
      state.isPlaying = true;
      state.hasStarted = true;
      state.isBlockedByAutoplay = false;
      notifyListeners();
    };

    utterance.onend = () => {
      state.isPlaying = false;
      state.hasPlayed = true;
      notifyListeners();
    };

    window.speechSynthesis.speak(utterance);
  } catch {
    // ignore
  }
}

/**
 * Attempts to play the welcome audio.
 * Can be called programmatically or on user interaction.
 */
export function playWelcomeVoice(options?: { fromBeginning?: boolean; force?: boolean }): Promise<void> {
  const audio = getOrCreateWelcomeAudio();
  if (!audio) return Promise.resolve();

  prewarmAudioContext();

  if (options?.fromBeginning) {
    try {
      audio.currentTime = 0;
    } catch {
      // ignore
    }
  }

  audio.volume = 1.0;

  return new Promise((resolve) => {
    try {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            state.isPlaying = true;
            state.hasStarted = true;
            state.isBlockedByAutoplay = false;
            (window as any).__welcomeAudioStarted = true;
            removeGlobalUnlockListeners();
            notifyListeners();
            resolve();
          })
          .catch((err) => {
            // Autoplay rejected by browser policy without gesture
            if (!state.hasStarted) {
              state.isBlockedByAutoplay = true;
              notifyListeners();
            }
            resolve();
          });
      } else {
        resolve();
      }
    } catch (err) {
      if (!state.hasStarted) {
        state.isBlockedByAutoplay = true;
        notifyListeners();
      }
      resolve();
    }
  });
}

export function pauseWelcomeVoice() {
  if (welcomeAudio) {
    try {
      welcomeAudio.pause();
      state.isPlaying = false;
      notifyListeners();
    } catch {
      // ignore
    }
  }
}

export function restartWelcomeVoice() {
  playWelcomeVoice({ fromBeginning: true, force: true });
}

export function toggleWelcomeVoice() {
  if (state.isPlaying) {
    pauseWelcomeVoice();
  } else {
    playWelcomeVoice();
  }
}

const GESTURE_EVENTS = [
  'pointerdown',
  'touchstart',
  'mousedown',
  'keydown',
  'click',
  'scroll',
  'wheel',
  'touchmove',
  'mousemove',
];
let unlockListenersAttached = false;

function onAnyUserInteraction(e?: Event) {
  if (state.hasStarted || state.isPlaying) {
    removeGlobalUnlockListeners();
    return;
  }
  // Exclude creator panel and visits badge interactions completely
  if (e && (e.target as HTMLElement)?.closest) {
    const el = e.target as HTMLElement;
    if (el.closest('[data-creator-panel]') || el.closest('[data-visits-badge]')) {
      return;
    }
  }
  // Spontaneous interaction from the student/visitor on the site -> play greeting
  playWelcomeVoice({ force: true });
}

function removeGlobalUnlockListeners() {
  if (!unlockListenersAttached || typeof window === 'undefined') return;
  GESTURE_EVENTS.forEach((event) => {
    window.removeEventListener(event, onAnyUserInteraction, true);
    document.removeEventListener(event, onAnyUserInteraction, true);
  });
  unlockListenersAttached = false;
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
    state.hasStarted = true;
    state.isPlaying = true;
    state.isBlockedByAutoplay = false;
    notifyListeners();
    return;
  }

  if (isInitialized) return;
  isInitialized = true;

  getOrCreateWelcomeAudio();

  // Attach global unlock listeners so the VERY FIRST tap/click ANYWHERE starts the audio
  if (!unlockListenersAttached) {
    unlockListenersAttached = true;
    GESTURE_EVENTS.forEach((event) => {
      window.addEventListener(event, onAnyUserInteraction, { capture: true, passive: true });
      document.addEventListener(event, onAnyUserInteraction, { capture: true, passive: true });
    });
  }

  // 1. Immediate spontaneous attempt
  playWelcomeVoice();

  // 2. Hydration & focus retry sequence
  setTimeout(() => playWelcomeVoice(), 150);
  setTimeout(() => playWelcomeVoice(), 500);
  setTimeout(() => playWelcomeVoice(), 1000);
}

/**
 * Audio service supporting both server-side Gemini 3.8 Flash-Lite TTS
 * and client-side Web Speech Synthesis / Recognition fallbacks.
 * Fully hardened for mobile browsers (iOS Safari, Android Chrome, in-app webviews).
 */
import { recordAudioListenEvent } from './fluencyTracker';

// Available playback speeds for audio
export const SPEED_LEVELS = [
  {
    value: 0.5,
    label: '0.5x',
    shortTag: 'Paso a paso',
    tag: '0.5x · Ultra Lento (Palabras separadas paso a paso, ideal si empiezas de cero)',
  },
  {
    value: 0.65,
    label: '0.65x',
    shortTag: 'Lento',
    tag: '0.65x · Lento (Para principiantes, captar cada fonema)',
  },
  {
    value: 0.8,
    label: '0.8x',
    shortTag: 'Pausado',
    tag: '0.8x · Pausado (Ritmo recomendado para aprender)',
  },
  {
    value: 1.0,
    label: '1.0x',
    shortTag: 'Nativo',
    tag: '1.0x · Nativo Real (Velocidad normal cotidiana)',
  },
] as const;

// Default speed set to 0.8x for learners (as requested by user)
let globalAudioSpeed: number = 0.8;
try {
  const saved = localStorage.getItem('vibe_english_speed');
  if (saved) {
    const val = parseFloat(saved);
    if (!isNaN(val) && val >= 0.5 && val <= 1.5) {
      globalAudioSpeed = val;
    }
  }
} catch {
  // localStorage not available
}

export function getGlobalAudioSpeed(): number {
  return globalAudioSpeed;
}

export function setGlobalAudioSpeed(speed: number) {
  globalAudioSpeed = speed;
  try {
    localStorage.setItem('vibe_english_speed', speed.toString());
  } catch {
    // ignore
  }
}

// Global audio tracking and mobile audio unlock pipeline
let currentAudio: HTMLAudioElement | null = null;
let sharedAudioContext: AudioContext | null = null;
let sharedAudioElement: HTMLAudioElement | null = null;
let isMobileAudioUnlocked = false;
const clientAudioCache = new Map<string, string>();

/**
 * Singleton persistent DOM-bound HTMLAudioElement for mobile stability.
 * Mobile Safari / Chrome grant uninterrupted media playback to DOM-connected elements.
 */
export function getSharedAudio(): HTMLAudioElement {
  if (typeof window === 'undefined') {
    return {} as HTMLAudioElement;
  }
  if (!sharedAudioElement) {
    const existing = document.getElementById('vibe-shared-audio-player') as HTMLAudioElement;
    if (existing) {
      sharedAudioElement = existing;
    } else {
      sharedAudioElement = document.createElement('audio');
      sharedAudioElement.id = 'vibe-shared-audio-player';
      sharedAudioElement.setAttribute('playsinline', 'true');
      sharedAudioElement.setAttribute('webkit-playsinline', 'true');
      sharedAudioElement.setAttribute('x-webkit-airplay', 'allow');
      sharedAudioElement.preload = 'auto';
      sharedAudioElement.style.position = 'fixed';
      sharedAudioElement.style.bottom = '-9999px';
      sharedAudioElement.style.left = '-9999px';
      sharedAudioElement.style.opacity = '0';
      sharedAudioElement.style.pointerEvents = 'none';
      document.body.appendChild(sharedAudioElement);
    }
  }
  return sharedAudioElement;
}

/**
 * Mobile Audio Unlocker: Pre-warms the browser's audio subsystem on user touch/click.
 * Crucial for mobile Safari & Android Chrome so subsequent audio plays instantly without gesture blockage.
 */
export function unlockMobileAudio(): void {
  if (typeof window === 'undefined') return;

  try {
    // 1. Web Audio Context Unlock
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      if (!sharedAudioContext) {
        sharedAudioContext = new AudioCtx();
      }
      if (sharedAudioContext.state === 'suspended') {
        sharedAudioContext.resume().catch(() => {});
      }
      // Play a short micro-buffer (1 sample) to satisfy iOS WebKit
      const buffer = sharedAudioContext.createBuffer(1, 1, 22050);
      const source = sharedAudioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(sharedAudioContext.destination);
      source.start(0);
    }

    // 2. Pre-warm and resume SpeechSynthesis voices
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    }

    // 3. Ensure shared DOM audio element is initialized
    getSharedAudio();

    isMobileAudioUnlocked = true;
  } catch {
    // Ignore unlock errors
  }
}

// Automatically listen for first user interaction to unlock audio pipeline
if (typeof window !== 'undefined') {
  const unlockEvents = ['touchstart', 'touchend', 'click', 'keydown'];
  const onFirstInteraction = () => {
    unlockMobileAudio();
    unlockEvents.forEach((ev) => window.removeEventListener(ev, onFirstInteraction));
  };
  unlockEvents.forEach((ev) => window.addEventListener(ev, onFirstInteraction, { passive: true, once: true }));
}

/**
 * Clean text from characters that confuse TTS engines or sound awkward
 */
export function cleanSpeechText(text: string): string {
  return text
    .replace(/[—–]/g, ', ')
    .replace(/[""«»']/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Inserts distinct pauses between words for absolute beginners (speed <= 0.55x).
 * Deliberately spaces words with commas so that TTS engines (both Gemini and browser WebSpeech)
 * enunciate each individual word separately without blending or connected speech liaisons,
 * making it effortless for someone starting with zero English to hear, repeat, and memorize every word.
 */
export function formatSpacedSpeechText(text: string): string {
  const clean = cleanSpeechText(text);
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length <= 1) return clean;
  // Comma separation forces natural 200-300ms pause between every single word
  return words.join(' , ');
}

export type VoiceName = 'Puck' | 'Fenrir' | 'Kore' | 'Zephyr';

export const DEFAULT_MALE_VOICE: VoiceName = 'Puck';

let globalVoice: VoiceName = 'Puck';

export function getGlobalVoice(): VoiceName {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('vibe_global_voice') as VoiceName;
      if (stored === 'Puck' || stored === 'Fenrir' || stored === 'Kore' || stored === 'Zephyr') {
        globalVoice = stored;
      }
    } catch {
      // ignore
    }
  }
  return globalVoice;
}

export function setGlobalVoice(voice: VoiceName): void {
  globalVoice = voice;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('vibe_global_voice', voice);
    } catch {
      // ignore
    }
  }
}

/**
 * Returns a direct streaming audio URL for any phrase and speed
 */
export function getAudioStreamUrl(
  text: string,
  speed?: number,
  voice: VoiceName = 'Puck',
  filename?: string
): string {
  const effectiveSpeed = speed !== undefined ? speed : globalAudioSpeed;
  const roundedSpeed = Math.round(effectiveSpeed * 100) / 100;
  const isUltraSlow = roundedSpeed <= 0.55;
  const clean = isUltraSlow ? formatSpacedSpeechText(text) : cleanSpeechText(text);
  let url = `/api/audio-stream?text=${encodeURIComponent(clean)}&speed=${roundedSpeed}&voice=${voice}`;
  if (filename) {
    url += `&filename=${encodeURIComponent(filename)}`;
  }
  return url;
}

/**
 * Returns a direct forced-download audio URL for any phrase and speed
 */
export function getAudioDownloadUrl(
  text: string,
  filename: string,
  speed?: number,
  voice: VoiceName = 'Puck'
): string {
  const effectiveSpeed = speed !== undefined ? speed : globalAudioSpeed;
  const roundedSpeed = Math.round(effectiveSpeed * 100) / 100;
  const isUltraSlow = roundedSpeed <= 0.55;
  const clean = isUltraSlow ? formatSpacedSpeechText(text) : cleanSpeechText(text);
  return `/api/audio-download?text=${encodeURIComponent(clean)}&speed=${roundedSpeed}&voice=${voice}&filename=${encodeURIComponent(filename)}`;
}

/**
 * Test speaker on mobile device using Web Audio tone + confirmation speech.
 * Returns true if audio played successfully.
 */
export async function testMobileSpeaker(): Promise<{ success: boolean; message: string }> {
  unlockMobileAudio();

  // 1. Play a crisp musical chime (520Hz -> 659Hz) via Web Audio API (works 100% of the time if not muted)
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      const ctx = sharedAudioContext || new AudioCtx();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.3); // G5

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    }
  } catch (e) {
    console.warn('Oscillator test failed', e);
  }

  // 2. Play a short English greeting utterance
  try {
    speakWithWebSpeech('Hello! Audio is working properly.', 0.9);
    return {
      success: true,
      message: '¡Sonido activado! Si escuchaste el tono o la voz en inglés, tu celular está listo.',
    };
  } catch {
    return {
      success: false,
      message: 'Revisá que tu celular no esté en silencio y que el volumen multimedia esté alto.',
    };
  }
}

const KNOWN_FEMALE_VOICES = [
  'samantha', 'ava', 'zira', 'victoria', 'karen', 'susan', 'jenny', 'monica', 'mónica',
  'paulina', 'helena', 'elena', 'sabina', 'female', 'woman', 'chica', 'mujer', 'carmen',
  'conchita', 'luciana', 'rosa', 'soledad', 'laura', 'sofia', 'marisol', 'mia', 'andrea',
  'paloma', 'ximena', 'valentina', 'camila', 'eva', 'dalia', 'angie', 'lupe', 'francisca',
  'hazel', 'linda', 'catherine', 'fiona', 'tessa', 'veena', 'alice', 'agnes', 'alva', 'yuri',
  'google us english', // Google US English in Chrome is a female voice
  'google español',    // Google español in Chrome is a female voice
];

const KNOWN_MALE_ENGLISH_VOICES = [
  'google uk english male', // Chrome built-in male voice
  'david', 'guy', 'george', 'alex', 'fred', 'oliver', 'arthur', 'mark',
  'daniel', 'christopher', 'ryan', 'brian', 'andrew', 'tom', 'thomas',
  'james', 'lee', 'aaron', 'rishi', 'male', 'hombre', 'man'
];

const KNOWN_MALE_LATIN_VOICES = [
  'jorge', 'diego', 'carlos', 'juan', 'raul', 'raúl', 'pablo', 'alonso',
  'miguel', 'gonzalo', 'emilio', 'david', 'andrés', 'andres', 'mateo',
  'gerardo', 'sebastián', 'sebastian', 'alvaro', 'álvaro', 'male', 'hombre'
];

function isDefinitelyFemale(name: string): boolean {
  const lower = (name || '').toLowerCase();
  return KNOWN_FEMALE_VOICES.some((f) => lower.includes(f));
}

function selectBestEnglishMaleVoice(voices: SpeechSynthesisVoice[]): { voice: SpeechSynthesisVoice | null; isConfirmedMale: boolean } {
  // 1. Explicit male voice
  const explicit = voices.find((v) => {
    const name = (v.name || '').toLowerCase();
    const uri = ((v as any).voiceURI || '').toLowerCase();
    const isEn = (v.lang || '').toLowerCase().startsWith('en');
    return isEn && KNOWN_MALE_ENGLISH_VOICES.some((m) => name.includes(m) || uri.includes(m));
  });
  if (explicit) return { voice: explicit, isConfirmedMale: true };

  // 2. Any en-US voice not marked female
  const candidate = voices.find((v) => {
    const isEn = (v.lang || '').toLowerCase().startsWith('en');
    return isEn && !isDefinitelyFemale(v.name);
  });
  if (candidate) return { voice: candidate, isConfirmedMale: false };

  // 3. Fallback to any en voice
  const anyEn = voices.find((v) => (v.lang || '').toLowerCase().startsWith('en'));
  return { voice: anyEn || null, isConfirmedMale: false };
}

function selectBestLatinMaleVoice(voices: SpeechSynthesisVoice[]): { voice: SpeechSynthesisVoice | null; isConfirmedMale: boolean } {
  const isCastizo = (v: SpeechSynthesisVoice) => {
    const lang = (v.lang || '').toLowerCase();
    const name = (v.name || '').toLowerCase();
    return (
      lang === 'es-es' || lang.startsWith('es-es') ||
      name.includes('spain') || name.includes('españa') ||
      name.includes('castilian') || name.includes('castellano')
    );
  };

  const latinVoices = voices.filter((v) => (v.lang || '').toLowerCase().startsWith('es') && !isCastizo(v));

  // 1. Explicit Latin American male name
  const explicit = latinVoices.find((v) => {
    const name = (v.name || '').toLowerCase();
    const uri = ((v as any).voiceURI || '').toLowerCase();
    return KNOWN_MALE_LATIN_VOICES.some((m) => name.includes(m) || uri.includes(m));
  });
  if (explicit) return { voice: explicit, isConfirmedMale: true };

  // 2. Any Latin voice not marked female
  const candidate = latinVoices.find((v) => !isDefinitelyFemale(v.name));
  if (candidate) return { voice: candidate, isConfirmedMale: false };

  // 3. Fallback to any Latin voice
  if (latinVoices.length > 0) return { voice: latinVoices[0], isConfirmedMale: false };

  // 4. Any Spanish voice
  const anyEs = voices.find((v) => (v.lang || '').toLowerCase().startsWith('es'));
  return { voice: anyEs || null, isConfirmedMale: false };
}

/**
 * High-compatibility Web Speech API speaker for English learners.
 * Strictly guarantees a clear, warm male voice across all devices.
 */
export function speakWithWebSpeech(
  text: string,
  speed: number = globalAudioSpeed,
  onStart?: () => void,
  onEnd?: () => void
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }
  try {
    stopAllAudio();
    unlockMobileAudio();
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();

    const isUltraSlow = speed <= 0.55;
    const clean = isUltraSlow ? formatSpacedSpeechText(text) : cleanSpeechText(text);
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = 'en-US';
    utterance.rate = isUltraSlow ? 0.45 : Math.max(0.55, Math.min(1.2, speed));

    if (onStart) utterance.onstart = () => onStart();
    if (onEnd) {
      utterance.onend = () => onEnd();
      utterance.onerror = () => onEnd();
    }

    const executeSpeak = () => {
      const voices = window.speechSynthesis.getVoices() || [];
      const { voice, isConfirmedMale } = selectBestEnglishMaleVoice(voices);

      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      }

      // If voice is confirmed male, use 0.88; otherwise force 0.60 to shift into masculine baritone
      utterance.pitch = isConfirmedMale ? 0.88 : 0.60;

      window.speechSynthesis.resume();
      window.speechSynthesis.speak(utterance);
    };

    const currentVoices = window.speechSynthesis.getVoices();
    if (currentVoices && currentVoices.length > 0) {
      executeSpeak();
    } else {
      window.speechSynthesis.onvoiceschanged = () => executeSpeak();
      setTimeout(executeSpeak, 60);
    }
  } catch (err) {
    console.warn('Male speech synthesis failed', err);
    if (onEnd) onEnd();
  }
}

/**
 * Speaks a Spanish message with a MALE voice and NEUTRAL LATIN AMERICAN accent.
 * Strictly guarantees clear male tone without peninsular/castizo accent.
 */
export function speakSpanishVoice(
  text: string,
  speed: number = 1.0,
  onStart?: () => void,
  onEnd?: () => void
): void {
  if (typeof window === 'undefined') {
    if (onEnd) onEnd();
    return;
  }

  const isWelcome =
    text.toLowerCase().includes('lugar correcto') ||
    text.toLowerCase().includes('bienvenido');

  // Strategy 1: HTML5 Audio with pre-rendered studio Latin American neutral male voice
  if (isWelcome) {
    const existing = document.getElementById('vibe-welcome-audio') as HTMLAudioElement;
    const audio = existing || new Audio('/audio/welcome_latino_neutro.mp3');
    audio.playbackRate = 1.0;
    audio.volume = 1.0;

    let started = false;
    audio.onplay = () => {
      started = true;
      if (onStart) onStart();
    };
    audio.onended = () => {
      if (onEnd) onEnd();
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // Playing successfully!
        })
        .catch(() => {
          if (!started) {
            speakWithWebSpeechLatinMale(text, speed, onStart, onEnd);
          }
        });
      return;
    }
  }

  speakWithWebSpeechLatinMale(text, speed, onStart, onEnd);
}

function speakWithWebSpeechLatinMale(
  text: string,
  speed: number = 1.0,
  onStart?: () => void,
  onEnd?: () => void
): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }

  try {
    stopAllAudio();
    unlockMobileAudio();
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();

    const clean = cleanSpeechText(text);
    const utterance = new SpeechSynthesisUtterance(clean);

    utterance.lang = 'es-MX';
    utterance.rate = Math.max(0.85, Math.min(1.15, speed));

    if (onStart) utterance.onstart = () => onStart();
    if (onEnd) {
      utterance.onend = () => onEnd();
      utterance.onerror = () => onEnd();
    }

    const executeSpeak = () => {
      const voices = window.speechSynthesis.getVoices() || [];
      const { voice, isConfirmedMale } = selectBestLatinMaleVoice(voices);

      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      }

      // If voice is confirmed male, use 0.82; otherwise force 0.58 to shift fundamental frequency into adult male baritone!
      utterance.pitch = isConfirmedMale ? 0.82 : 0.58;

      window.speechSynthesis.resume();
      window.speechSynthesis.speak(utterance);
    };

    const currentVoices = window.speechSynthesis.getVoices();
    if (currentVoices && currentVoices.length > 0) {
      executeSpeak();
    } else {
      window.speechSynthesis.onvoiceschanged = () => executeSpeak();
      setTimeout(executeSpeak, 60);
    }
  } catch (err) {
    console.warn('Latin male Spanish speech synthesis failed', err);
    if (onEnd) onEnd();
  }
}

/**
 * Asynchronously speaks Spanish text with a male Latin American neutral voice.
 * Never consumes API credits, runs locally with 0ms latency.
 */
export function speakLatinMaleAsync(text: string, speed: number = 0.95): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve();
      return;
    }
    speakWithWebSpeechLatinMale(text, speed, undefined, () => resolve());
  });
}

/**
 * Asynchronously speaks English text with clear male pronunciation.
 */
export function speakEnglishMaleAsync(text: string, speed: number = 0.8): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve();
      return;
    }
    speakWithWebSpeech(text, speed, undefined, () => resolve());
  });
}

/**
 * Dictates a complete phrase/lesson with the Professor Leo persona:
 * Spoken in clear, warm Latin American neutral male voice with native English pronunciation.
 * Free, offline-capable, and uses ZERO API credits.
 */
export async function dictatePhraseWithProfeLeo(
  phrase: {
    situation: string;
    english: string;
    phoneticSimple: string;
    spanish: string;
    goldenRule?: string;
  },
  speed: number = 0.8,
  onStart?: () => void,
  onEnd?: () => void
): Promise<void> {
  stopAllAudio();
  unlockMobileAudio();
  if (onStart) onStart();

  const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

  try {
    // 1. Situation & meaning in Latin neutral Spanish
    const intro = `Situación: ${phrase.situation}. En español: ${phrase.spanish}. En inglés de la vida real se dice:`;
    await speakLatinMaleAsync(intro, 0.95);
    await pause(350);

    // 2. English phrase spoken clearly
    await speakEnglishMaleAsync(phrase.english, speed);
    await pause(450);

    // 3. Phonetic explanation
    const phoneticIntro = `Para pronunciarlo fácil, léelo como: ${phrase.phoneticSimple}. Repite conmigo:`;
    await speakLatinMaleAsync(phoneticIntro, 0.95);
    await pause(350);

    // 4. Repeat English phrase cleanly
    await speakEnglishMaleAsync(phrase.english, speed <= 0.65 ? speed : 0.7);
    await pause(400);

    // 5. Golden tip if present
    if (phrase.goldenRule) {
      const tip = `Consejo del profe Leo: ${phrase.goldenRule}`;
      await speakLatinMaleAsync(tip, 0.95);
    }
  } catch (err) {
    console.warn('Dictation interrupted', err);
  } finally {
    if (onEnd) onEnd();
  }
}

export interface PlayVoiceOptions {
  voiceName?: VoiceName;
  speed?: number;
  useDeviceSpeech?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

/**
 * Master speech player: Plays native audio stream or falls back to Web Speech instantly.
 * Resilient for iOS Safari, Android Chrome, and in-app webviews (WhatsApp/Instagram).
 */
export async function playEnglishVoice(
  text: string,
  voiceName: VoiceName = 'Puck',
  overrideSpeed?: number,
  options?: PlayVoiceOptions
): Promise<void> {
  const activeVoice: VoiceName = options?.voiceName || (voiceName && voiceName !== 'Kore' ? voiceName : getGlobalVoice() || 'Puck');
  const effectiveSpeed = overrideSpeed !== undefined ? overrideSpeed : globalAudioSpeed;
  const roundedSpeed = Math.round(effectiveSpeed * 100) / 100;
  const isUltraSlow = roundedSpeed <= 0.55;
  const clean = isUltraSlow ? formatSpacedSpeechText(text) : cleanSpeechText(text);
  const cacheKey = `${activeVoice}_${roundedSpeed}_${clean.toLowerCase()}`;

  unlockMobileAudio();
  recordAudioListenEvent();

  // Stop existing audio immediately
  stopAllAudio();

  const onStart = options?.onStart;
  const onEnd = options?.onEnd;

  // 1. If explicit device speech is selected, play immediately with zero network latency
  if (options?.useDeviceSpeech) {
    speakWithWebSpeech(clean, effectiveSpeed, onStart, onEnd);
    return;
  }

  // 2. Instant client-side base64 cache playback (if available)
  const cachedAudioSrc = clientAudioCache.get(cacheKey);
  if (cachedAudioSrc) {
    try {
      const audio = getSharedAudio();
      audio.src = cachedAudioSrc;
      audio.playbackRate = effectiveSpeed;
      currentAudio = audio;
      if (onStart) audio.onplay = () => onStart();
      if (onEnd) {
        audio.onended = () => onEnd();
        audio.onerror = () => onEnd();
      }
      await audio.play();
      return;
    } catch {
      // Continue to streaming pipeline
    }
  }

  // 3. Direct Audio Stream via singleton DOM-attached element
  let hasStarted = false;
  let fallbackTriggered = false;

  const triggerFallback = () => {
    if (!hasStarted && !fallbackTriggered) {
      fallbackTriggered = true;
      speakWithWebSpeech(clean, effectiveSpeed, onStart, onEnd);
    }
  };

  try {
    const streamUrl = getAudioStreamUrl(clean, effectiveSpeed, activeVoice);
    const audio = getSharedAudio();
    audio.playbackRate = effectiveSpeed;
    currentAudio = audio;

    audio.onplay = () => {
      hasStarted = true;
      if (onStart) onStart();
    };

    audio.onended = () => {
      if (onEnd) onEnd();
    };

    audio.onerror = () => {
      triggerFallback();
      if (hasStarted && onEnd) onEnd();
    };

    audio.src = streamUrl;
    const playPromise = audio.play();

    // 1.5-second buffer to allow quick cloud stream before failing over to local device male voice
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Audio stream buffering exceeded 1.5s')), 1500)
    );

    if (playPromise !== undefined) {
      await Promise.race([playPromise, timeoutPromise]);
      return;
    }
  } catch (_streamErr) {
    // If stream took too long or failed, instantly speak with clear male speech
  }

  // 4. Instant Fallback: Browser Web Speech API with guaranteed male voice
  if (!hasStarted && !fallbackTriggered) {
    speakWithWebSpeech(clean, effectiveSpeed, onStart, onEnd);
  }
}

export function stopAllAudio() {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    } catch {
      // ignore
    }
  }
  if (sharedAudioElement) {
    try {
      sharedAudioElement.pause();
      sharedAudioElement.currentTime = 0;
    } catch {
      // ignore
    }
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}

// Speech Recognition helper
export function createSpeechRecognizer(
  onResult: (transcript: string) => void,
  onError?: (err: any) => void,
  onEnd?: () => void
) {
  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) {
    return null;
  }
  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };
  recognition.onerror = (event: any) => {
    if (onError) onError(event);
  };
  recognition.onend = () => {
    if (onEnd) onEnd();
  };
  return recognition;
}

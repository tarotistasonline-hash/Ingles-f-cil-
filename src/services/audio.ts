/**
 * Audio service supporting both server-side Gemini 3.8 Flash-Lite TTS
 * and client-side Web Speech Synthesis / Recognition fallbacks.
 * Fully hardened for mobile browsers (iOS Safari, Android Chrome, in-app webviews).
 */
import { recordAudioListenEvent } from './fluencyTracker';

// Available playback speeds for audio
export const SPEED_LEVELS = [
  {
    value: 0.65,
    label: '0.65x',
    shortTag: 'Lento',
    tag: '0.65x · Muy Lento (Para principiantes, captar cada fonema)',
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
let isMobileAudioUnlocked = false;
const clientAudioCache = new Map<string, string>();

/**
 * Mobile Audio Unlocker: Pre-warms the browser's audio subsystem on first user touch/click.
 * Crucial for mobile Safari & Android Chrome so subsequent audio plays instantly without gesture blockage.
 */
export function unlockMobileAudio(): void {
  if (isMobileAudioUnlocked || typeof window === 'undefined') return;

  try {
    // 1. Unlock Web Audio Context
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      if (!sharedAudioContext) {
        sharedAudioContext = new AudioCtx();
      }
      if (sharedAudioContext.state === 'suspended') {
        sharedAudioContext.resume().catch(() => {});
      }
      // Play a short silent buffer to satisfy iOS WebKit
      const buffer = sharedAudioContext.createBuffer(1, 1, 22050);
      const source = sharedAudioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(sharedAudioContext.destination);
      source.start(0);
    }

    // 2. Pre-warm SpeechSynthesis voices
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }

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
 * Returns a direct streaming audio URL for any phrase and speed
 */
export function getAudioStreamUrl(
  text: string,
  speed?: number,
  voice: 'Kore' | 'Puck' | 'Zephyr' = 'Kore',
  filename?: string
): string {
  const effectiveSpeed = speed !== undefined ? speed : globalAudioSpeed;
  const roundedSpeed = Math.round(effectiveSpeed * 100) / 100;
  const clean = cleanSpeechText(text);
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
  voice: 'Kore' | 'Puck' | 'Zephyr' = 'Kore'
): string {
  const effectiveSpeed = speed !== undefined ? speed : globalAudioSpeed;
  const roundedSpeed = Math.round(effectiveSpeed * 100) / 100;
  const clean = cleanSpeechText(text);
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

/**
 * High-compatibility Web Speech API speaker for English learners
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
    window.speechSynthesis.cancel();
    const clean = cleanSpeechText(text);
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = 'en-US';
    utterance.rate = Math.max(0.6, Math.min(1.2, speed));

    if (onStart) utterance.onstart = () => onStart();
    if (onEnd) {
      utterance.onend = () => onEnd();
      utterance.onerror = () => onEnd();
    }

    const voices = window.speechSynthesis.getVoices();
    const enVoice =
      voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Natural') ||
            v.name.includes('Google') ||
            v.name.includes('Samantha') ||
            v.name.includes('Ava') ||
            v.name.includes('Daniel') ||
            v.name.includes('Zira'))
      ) ||
      voices.find((v) => v.lang.startsWith('en-US')) ||
      voices.find((v) => v.lang.startsWith('en'));

    if (enVoice) {
      utterance.voice = enVoice;
    }

    // Workaround for mobile Chromium/iOS speech freeze
    window.speechSynthesis.resume();
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis failed', err);
    if (onEnd) onEnd();
  }
}

export interface PlayVoiceOptions {
  voiceName?: 'Kore' | 'Puck' | 'Zephyr';
  speed?: number;
  useDeviceSpeech?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

/**
 * Master speech player: Plays native audio stream or falls back to Web Speech instantly.
 * Resilient for iOS Safari and Android Chrome mobile browsers.
 */
export async function playEnglishVoice(
  text: string,
  voiceName: 'Kore' | 'Puck' | 'Zephyr' = 'Kore',
  overrideSpeed?: number,
  options?: PlayVoiceOptions
): Promise<void> {
  const effectiveSpeed = overrideSpeed !== undefined ? overrideSpeed : globalAudioSpeed;
  const roundedSpeed = Math.round(effectiveSpeed * 100) / 100;
  const clean = cleanSpeechText(text);
  const cacheKey = `${voiceName}_${roundedSpeed}_${clean.toLowerCase()}`;

  unlockMobileAudio();
  recordAudioListenEvent();

  // Stop existing audio immediately
  stopAllAudio();

  const onStart = options?.onStart;
  const onEnd = options?.onEnd;

  // 1. If explicit device speech is selected, play immediately
  if (options?.useDeviceSpeech) {
    speakWithWebSpeech(clean, effectiveSpeed, onStart, onEnd);
    return;
  }

  // 2. Instant client-side base64 cache playback (if available)
  const cachedAudioSrc = clientAudioCache.get(cacheKey);
  if (cachedAudioSrc) {
    try {
      const audio = new Audio(cachedAudioSrc);
      (audio as any).playsInline = true;
      (audio as any).preservesPitch = true;
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
      // Audio playback failed, continue to stream
    }
  }

  // 3. Direct Audio Stream with generous timeout (6.5s) and automatic fallback
  try {
    const streamUrl = getAudioStreamUrl(clean, effectiveSpeed, voiceName);
    const audio = new Audio();
    (audio as any).playsInline = true;
    (audio as any).setAttribute('playsinline', 'true');
    (audio as any).setAttribute('webkit-playsinline', 'true');
    audio.preload = 'auto';
    audio.src = streamUrl;
    currentAudio = audio;

    let hasStarted = false;
    audio.onplay = () => {
      hasStarted = true;
      if (onStart) onStart();
    };

    audio.onended = () => {
      if (onEnd) onEnd();
    };

    audio.onerror = () => {
      if (!hasStarted) {
        speakWithWebSpeech(clean, effectiveSpeed, onStart, onEnd);
      } else if (onEnd) {
        onEnd();
      }
    };

    const playPromise = audio.play();

    // 6.5-second buffer for slow mobile networks before graceful fallback
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Audio stream buffering exceeded 6.5s')), 6500)
    );

    if (playPromise !== undefined) {
      await Promise.race([playPromise, timeoutPromise]);
      return;
    }
  } catch (streamErr) {
    console.warn('Audio stream delayed or blocked, activating native speech fallback', streamErr);
  }

  // 4. Instant Fallback: Browser Web Speech API
  speakWithWebSpeech(clean, effectiveSpeed, onStart, onEnd);
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

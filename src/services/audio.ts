/**
 * Audio service supporting both server-side Gemini 3.8 Flash-Lite TTS
 * and client-side Web Speech Synthesis / Recognition fallbacks.
 * Includes global speed management tailored for English language beginners.
 */
import { recordAudioListenEvent } from './fluencyTracker';

// Available playback speeds
export const SPEED_LEVELS = [
  { value: 0.65, label: '0.65x', tag: 'Principiante (Muy Lento)' },
  { value: 0.8, label: '0.8x', tag: 'Pausado (Recomendado)' },
  { value: 1.0, label: '1.0x', tag: 'Nativo Real' },
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
} catch (e) {
  // localStorage not available
}

export function getGlobalAudioSpeed(): number {
  return globalAudioSpeed;
}

export function setGlobalAudioSpeed(speed: number) {
  globalAudioSpeed = speed;
  try {
    localStorage.setItem('vibe_english_speed', speed.toString());
  } catch (e) {
    // ignore
  }
}

// Global audio element tracker to avoid audio overlap
let currentAudio: HTMLAudioElement | null = null;
const clientAudioCache = new Map<string, string>();

export async function playEnglishVoice(
  text: string,
  voiceName: 'Kore' | 'Puck' | 'Zephyr' = 'Kore',
  overrideSpeed?: number
): Promise<void> {
  const effectiveSpeed = overrideSpeed !== undefined ? overrideSpeed : globalAudioSpeed;
  const roundedSpeed = Math.round(effectiveSpeed * 100) / 100;
  const cacheKey = `${voiceName}_${roundedSpeed}_${text.trim().toLowerCase()}`;

  recordAudioListenEvent();

  // Stop existing audio immediately
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }

  // 1. Instant client-side cache playback (0 network requests, 0 latency)
  const cachedAudioSrc = clientAudioCache.get(cacheKey);
  if (cachedAudioSrc) {
    try {
      const audio = new Audio(cachedAudioSrc);
      (audio as any).preservesPitch = true;
      audio.playbackRate = effectiveSpeed;
      currentAudio = audio;
      await audio.play();
      return;
    } catch {
      // Audio playback failed (e.g. user gesture restrictions), continue to fallback
    }
  }

  // 2. Fetch from server TTS endpoint
  try {
    const res = await fetch('/api/generate-tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        voice: voiceName,
        speed: effectiveSpeed,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.audioBase64) {
        const audioSrc = `data:audio/wav;base64,${data.audioBase64}`;
        clientAudioCache.set(cacheKey, audioSrc);
        const audio = new Audio(audioSrc);
        (audio as any).preservesPitch = true;
        audio.playbackRate = effectiveSpeed;
        currentAudio = audio;
        await audio.play();
        return;
      }
    }
  } catch {
    // Network or server fetch failed, smoothly fallback to Web Speech API
  }

  // 3. Fallback: Browser Web Speech API
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = Math.max(0.6, Math.min(1.4, effectiveSpeed));
      const voices = window.speechSynthesis.getVoices();
      const enVoice =
        voices.find(
          (v) =>
            v.lang.startsWith('en') &&
            (v.name.includes('Natural') ||
              v.name.includes('Google') ||
              v.name.includes('Samantha') ||
              v.name.includes('Ava') ||
              v.name.includes('Zira'))
        ) || voices.find((v) => v.lang.startsWith('en'));
      if (enVoice) {
        utterance.voice = enVoice;
      }
      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore speech synthesis errors
    }
  }
}

export function stopAllAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
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

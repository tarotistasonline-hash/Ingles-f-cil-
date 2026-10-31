/**
 * Web Audio API Music Synthesizer
 * Generates iconic musical backing tracks, chords, and rhythmic motifs for famous songs.
 * Works 100% offline and in-browser with zero network latency, zero API limits,
 * and guaranteed compatibility across iOS, Android, and Desktop browsers.
 */

// Shared audio context singleton
let synthAudioContext: AudioContext | null = null;
let activeMelodyInterval: any = null;
let activeMelodyTimeouts: any[] = [];

export function getSynthAudioContext(): AudioContext {
  if (!synthAudioContext || synthAudioContext.state === 'closed') {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    synthAudioContext = new AudioCtx();
  }
  if (synthAudioContext.state === 'suspended') {
    synthAudioContext.resume().catch(() => {});
  }
  return synthAudioContext;
}

export function stopMusicSynth(): void {
  if (activeMelodyInterval) {
    clearInterval(activeMelodyInterval);
    activeMelodyInterval = null;
  }
  activeMelodyTimeouts.forEach((t) => clearTimeout(t));
  activeMelodyTimeouts = [];
}

/**
 * Play a synthesized tone with envelope and optional harmonic richness
 */
export function playSynthNote(
  frequency: number,
  durationSeconds: number,
  startTimeOffset: number = 0,
  type: OscillatorType = 'triangle',
  volume: number = 0.25
) {
  try {
    const ctx = getSynthAudioContext();
    const now = ctx.currentTime + startTimeOffset;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, now);

    // Warm envelope: gentle attack, sustain, smooth release
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.05);
    gain.gain.setValueAtTime(volume * 0.8, now + durationSeconds * 0.7);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSeconds);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + durationSeconds + 0.05);
  } catch (e) {
    console.warn('Synth note error', e);
  }
}

/**
 * Play a percussion hit (stomp or clap)
 */
export function playDrumHit(isClap: boolean, startTimeOffset: number = 0) {
  try {
    const ctx = getSynthAudioContext();
    const now = ctx.currentTime + startTimeOffset;

    if (!isClap) {
      // Deep bass kick / stomp
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(38, now + 0.15);

      gain.gain.setValueAtTime(0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.26);
    } else {
      // Snare / Clap noise burst
      const bufferSize = ctx.sampleRate * 0.12;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1200;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.16);
    }
  } catch (e) {
    console.warn('Drum hit error', e);
  }
}

// Frequency notes map
const N: Record<string, number> = {
  C2: 65.41,
  F2: 87.31,
  G2: 98.0,
  A2: 110.0,
  B2: 123.47,
  C3: 130.81,
  D3: 146.83,
  E3: 164.81,
  F3: 174.61,
  Fs3: 185.0,
  G3: 196.0,
  Ab3: 207.65,
  A3: 220.0,
  Bb3: 233.08,
  B3: 246.94,
  C4: 261.63,
  Db4: 277.18,
  D4: 293.66,
  Eb4: 311.13,
  E4: 329.63,
  F4: 349.23,
  Fs4: 369.99,
  G4: 392.0,
  Ab4: 415.3,
  A4: 440.0,
  Bb4: 466.16,
  B4: 493.88,
  C5: 523.25,
  Db5: 554.37,
  D5: 587.33,
  Eb5: 622.25,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
  A5: 880.0,
};

/**
 * Plays the signature musical motif for a given song ID
 */
export function playSongMusicMotif(songId: string, durationTotal = 8): void {
  stopMusicSynth();
  const ctx = getSynthAudioContext();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  switch (songId) {
    case 'let-it-be': {
      // The Beatles - Piano chords: C -> G -> Am -> F
      const chords = [
        { notes: [N.C3, N.G3, N.C4, N.E4], time: 0 },
        { notes: [N.G2, N.G3, N.B3, N.D4], time: 1.8 },
        { notes: [N.A2, N.A3, N.C4, N.E4], time: 3.6 },
        { notes: [N.F2, N.A3, N.C4, N.F4], time: 5.4 },
      ];
      chords.forEach((c) => {
        c.notes.forEach((f) => playSynthNote(f, 1.7, c.time, 'sine', 0.22));
        // Soft melody top note
        playSynthNote(c.notes[3] * 1.5, 0.6, c.time + 0.4, 'triangle', 0.12);
      });
      break;
    }

    case 'someone-like-you': {
      // Adele - Famous arpeggiated piano: A -> E/G# -> F#m -> D
      const arpeggio = [
        // A chord
        N.A2, N.E3, N.A3, N.Cs4, N.A2, N.E3, N.A3, N.Cs4,
        // E/G# chord
        N.Ab3, N.E3, N.Ab3, N.B3, N.Ab3, N.E3, N.Ab3, N.B3,
        // F#m chord
        N.Fs3, N.Cs4, N.Fs4, N.A4, N.Fs3, N.Cs4, N.Fs4, N.A4,
        // D chord
        N.D3, N.A3, N.D4, N.Fs4, N.D3, N.A3, N.D4, N.Fs4,
      ];
      arpeggio.forEach((note, idx) => {
        playSynthNote(note, 0.4, idx * 0.24, 'sine', 0.18);
      });
      break;
    }

    case 'what-a-wonderful-world': {
      // Louis Armstrong - Jazz chords F -> Am -> Bb -> C
      const chords = [
        { notes: [N.F3, N.A3, N.C4, N.F4], time: 0 },
        { notes: [N.A3, N.C4, N.E4, N.G4], time: 2.0 },
        { notes: [N.Bb3, N.D4, N.F4, N.Bb4], time: 4.0 },
        { notes: [N.C3, N.G3, N.C4, N.E4], time: 6.0 },
      ];
      chords.forEach((c) => {
        c.notes.forEach((f) => playSynthNote(f, 1.9, c.time, 'triangle', 0.2));
      });
      break;
    }

    case 'we-will-rock-you': {
      // Queen - Stomp Stomp Clap! (Boom Boom CLAP!)
      const pattern = [
        { clap: false, time: 0 },
        { clap: false, time: 0.35 },
        { clap: true, time: 0.75 },

        { clap: false, time: 1.5 },
        { clap: false, time: 1.85 },
        { clap: true, time: 2.25 },

        { clap: false, time: 3.0 },
        { clap: false, time: 3.35 },
        { clap: true, time: 3.75 },

        { clap: false, time: 4.5 },
        { clap: false, time: 4.85 },
        { clap: true, time: 5.25 },

        { clap: false, time: 6.0 },
        { clap: false, time: 6.35 },
        { clap: true, time: 6.75 },
      ];
      pattern.forEach((p) => {
        playDrumHit(p.clap, p.time);
      });
      break;
    }

    case 'fly-me-to-the-moon': {
      // Frank Sinatra - Swing Walking Bass & Jazz Chords
      const bassline = [
        N.A2, N.B2, N.C3, N.D3, N.G2, N.A2, N.B2, N.C3,
        N.F2, N.G2, N.A2, N.Bb2, N.E2, N.Fs2, N.G2, N.Ab2,
      ];
      bassline.forEach((b, i) => {
        playSynthNote(b, 0.4, i * 0.45, 'triangle', 0.3);
        if (i % 2 === 1) {
          playSynthNote(b * 2, 0.25, i * 0.45 + 0.1, 'sine', 0.1);
        }
      });
      break;
    }

    case 'viva-la-vida': {
      // Coldplay - Rhythmic String Ostinato: Db -> Eb -> Ab -> Fm
      const ostinato = [
        N.Db4, N.Db4, N.Db4, N.Db4, N.Eb4, N.Eb4, N.Eb4, N.Eb4,
        N.Ab3, N.Ab3, N.Ab3, N.Ab3, N.F3, N.F3, N.F3, N.F3,
        N.Db4, N.Db4, N.Db4, N.Db4, N.Eb4, N.Eb4, N.Eb4, N.Eb4,
        N.Ab3, N.Ab3, N.Ab3, N.Ab3, N.C4, N.C4, N.C4, N.C4,
      ];
      ostinato.forEach((note, i) => {
        playSynthNote(note, 0.2, i * 0.22, 'sawtooth', 0.12);
        if (i % 4 === 0) {
          playSynthNote(note / 2, 0.4, i * 0.22, 'sine', 0.25);
        }
      });
      break;
    }

    case 'three-little-birds': {
      // Bob Marley - Reggae upstroke groove (A -> D -> A)
      const groove = [
        { bass: N.A2, time: 0 },
        { chop: [N.Cs4, N.E4, N.A4], time: 0.4 },
        { bass: N.A2, time: 0.8 },
        { chop: [N.Cs4, N.E4, N.A4], time: 1.2 },

        { bass: N.D3, time: 1.8 },
        { chop: [N.D4, N.Fs4, N.A4], time: 2.2 },
        { bass: N.D3, time: 2.6 },
        { chop: [N.D4, N.Fs4, N.A4], time: 3.0 },

        { bass: N.A2, time: 3.8 },
        { chop: [N.Cs4, N.E4, N.A4], time: 4.2 },
        { bass: N.A2, time: 4.6 },
        { chop: [N.Cs4, N.E4, N.A4], time: 5.0 },
      ];
      groove.forEach((g) => {
        if (g.bass) playSynthNote(g.bass, 0.35, g.time, 'triangle', 0.3);
        if (g.chop) {
          g.chop.forEach((note) => playSynthNote(note, 0.15, g.time, 'triangle', 0.18));
        }
      });
      break;
    }

    case 'perfect': {
      // Ed Sheeran - 12/8 Acoustic arpeggio (Ab -> Fm -> Db -> Eb)
      const arpeggios = [
        N.Ab2, N.Eb3, N.Ab3, N.C4, N.Ab3, N.Eb3,
        N.F2, N.C3, N.F3, N.Ab3, N.F3, N.C3,
        N.Db3, N.Ab3, N.Db4, N.F4, N.Db4, N.Ab3,
        N.Eb3, N.Bb3, N.Eb4, N.G4, N.Eb4, N.Bb3,
      ];
      arpeggios.forEach((note, idx) => {
        playSynthNote(note, 0.35, idx * 0.28, 'triangle', 0.2);
      });
      break;
    }

    case 'billie-jean': {
      // Michael Jackson - Iconic driving funky bassline
      const bassRiff = [
        N.Fs2, N.Cs3, N.E3, N.Fs3, N.E3, N.Cs3, N.B2, N.Cs3,
        N.Fs2, N.Cs3, N.E3, N.Fs3, N.E3, N.Cs3, N.B2, N.Cs3,
      ];
      bassRiff.forEach((note, idx) => {
        playSynthNote(note, 0.22, idx * 0.32, 'sawtooth', 0.22);
        playDrumHit(idx % 2 === 1, idx * 0.32);
      });
      break;
    }

    case 'every-breath-you-take': {
      // The Police / Sting - Chorus-drenched electric guitar palm-muted arpeggio
      const riff = [
        N.A2, N.E3, N.B3, N.Cs4, N.B3, N.E3,
        N.Fs2, N.Cs3, N.Ab3, N.A3, N.Ab3, N.Cs3,
        N.D3, N.A3, N.E4, N.Fs4, N.E4, N.A3,
        N.E3, N.B3, N.Fs4, N.Ab4, N.Fs4, N.B3,
      ];
      riff.forEach((note, idx) => {
        playSynthNote(note, 0.28, idx * 0.26, 'triangle', 0.22);
      });
      break;
    }

    default: {
      // General pleasant musical chime
      [N.C4, N.E4, N.G4, N.C5].forEach((note, idx) => {
        playSynthNote(note, 0.8, idx * 0.3, 'sine', 0.25);
      });
      break;
    }
  }
}

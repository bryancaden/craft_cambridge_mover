/**
 * Relaxing Background Music (BGM) Engine for Cambridge Movers 3D.
 * Features:
 * 1. Procedural ambient relaxation tune inspired by C418 / Minecraft's "Sweden" and "Subwoofer Lullaby",
 *    using gentle piano, marimba, and soft ambient pad synthesis.
 * 2. Ability to play AI-generated tracks (e.g. from Google Lyria).
 * 3. Master volume control, mute, and track switching.
 */

type Listener = () => void;

class RelaxingBgmEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private masterGain: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private timerId: any = null;
  private volume: number = 0.45; // 0 to 1
  private currentTrackName: string = 'Peaceful Voxel Melody';
  private listeners: Set<Listener> = new Set();

  // AI Audio element for Lyria playback
  private aiAudio: HTMLAudioElement | null = null;
  private isUsingAiTrack: boolean = false;

  constructor() {
    // Initialized on user gesture
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  private initAudio() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Low pass filter to create soft, warm ambient tone
      this.filterNode = this.ctx.createBiquadFilter();
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.setValueAtTime(1200, this.ctx.currentTime);

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

      this.filterNode.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Play a single soft relaxing note
  private playPianoNote(freq: number, duration: number = 2.5, velocity: number = 0.2) {
    if (!this.ctx || !this.filterNode) return;
    const now = this.ctx.currentTime;

    // Fundamental oscillator (warm sine)
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);

    // Warm harmonic overtone (triangle)
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, now);

    const noteGain = this.ctx.createGain();
    noteGain.gain.setValueAtTime(0, now);
    noteGain.gain.linearRampToValueAtTime(velocity, now + 0.08); // soft gentle attack
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc1.connect(noteGain);
    osc2.connect(noteGain);
    noteGain.connect(this.filterNode);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration);
    osc2.stop(now + duration);
  }

  // Relaxing chord progressions in C major / F maj7 / Am / G
  private chords = [
    // F maj7 (calm, expansive)
    [174.61, 261.63, 329.63, 392.0], // F3, C4, E4, G4
    // C maj7 (warm, homey)
    [130.81, 196.0, 246.94, 329.63], // C3, G3, B3, E4
    // A min9 (gentle reflection)
    [110.0, 164.81, 220.0, 293.66], // A2, E3, A3, D4
    // G sus4 / G (bright hope)
    [98.0, 146.83, 196.0, 293.66], // G2, D3, G3, D4
  ];

  // Relaxing melody pentatonic pool
  private melodyNotes = [
    261.63, // C4
    293.66, // D4
    329.63, // E4
    392.0,  // G4
    440.0,  // A4
    523.25, // C5
    587.33, // D5
    659.25, // E5
  ];

  private currentChordIdx = 0;

  private scheduleNextMeasure = () => {
    if (!this.isPlaying || this.isUsingAiTrack) return;

    // Play current chord notes gently arpeggiated
    const chord = this.chords[this.currentChordIdx % this.chords.length];
    chord.forEach((freq, idx) => {
      setTimeout(() => {
        if (this.isPlaying && !this.isUsingAiTrack) {
          this.playPianoNote(freq, 4.0, 0.14);
        }
      }, idx * 240);
    });

    // Play 1 or 2 sweet melody notes
    setTimeout(() => {
      if (this.isPlaying && !this.isUsingAiTrack) {
        const randNote = this.melodyNotes[Math.floor(Math.random() * this.melodyNotes.length)];
        this.playPianoNote(randNote, 3.0, 0.16);
      }
    }, 1200);

    if (Math.random() > 0.4) {
      setTimeout(() => {
        if (this.isPlaying && !this.isUsingAiTrack) {
          const randNote2 = this.melodyNotes[Math.floor(Math.random() * this.melodyNotes.length)];
          this.playPianoNote(randNote2, 3.2, 0.14);
        }
      }, 2400);
    }

    this.currentChordIdx++;

    // Loop interval: 4 seconds per measure for tranquil, unhurried pacing
    this.timerId = setTimeout(this.scheduleNextMeasure, 4200);
  };

  public start() {
    this.initAudio();
    if (this.isPlaying) return;
    this.isPlaying = true;

    if (this.isUsingAiTrack && this.aiAudio) {
      this.aiAudio.play().catch(() => {});
    } else {
      this.scheduleNextMeasure();
    }
    this.notify();
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    if (this.aiAudio) {
      this.aiAudio.pause();
    }
    this.notify();
  }

  public toggle() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
    if (this.aiAudio) {
      this.aiAudio.volume = this.volume;
    }
    this.notify();
  }

  public getVolume(): number {
    return this.volume;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentTrackName(): string {
    return this.currentTrackName;
  }

  public playAiTrack(audioUrl: string, trackTitle: string = 'Lyria AI: Cozy Island Lullaby') {
    this.initAudio();
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    if (this.aiAudio) {
      this.aiAudio.pause();
      this.aiAudio.src = '';
    }

    this.isUsingAiTrack = true;
    this.currentTrackName = trackTitle;

    const audio = new Audio(audioUrl);
    audio.loop = true;
    audio.volume = this.volume;
    this.aiAudio = audio;
    this.isPlaying = true;
    audio.play().catch(() => {});
    this.notify();
  }

  public playProceduralTune() {
    if (this.aiAudio) {
      this.aiAudio.pause();
    }
    this.isUsingAiTrack = false;
    this.currentTrackName = 'Peaceful Voxel Melody';
    if (this.isPlaying) {
      this.scheduleNextMeasure();
    }
    this.notify();
  }
}

export const relaxingBgm = new RelaxingBgmEngine();

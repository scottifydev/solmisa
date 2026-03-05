import * as Tone from "tone";

export interface MetronomeOptions {
  bpm: number;
  beatsPerMeasure?: number;
  volume?: number;
  accentFirst?: boolean;
}

export class MetronomeService {
  private loop: Tone.Loop | null = null;
  private synth: Tone.MembraneSynth;
  private filter: Tone.Filter;
  private gainNode: Tone.Gain;
  private _bpm: number = 120;
  private _beatsPerMeasure: number = 4;
  private _accentFirst: boolean = true;
  private _isPlaying: boolean = false;
  private beatCount: number = 0;

  constructor(destination: Tone.ToneAudioNode = Tone.getDestination()) {
    this.gainNode = new Tone.Gain(0.5).connect(destination);
    // Low-pass filter to soften the click's high-frequency transient
    this.filter = new Tone.Filter({
      type: "lowpass",
      frequency: 3000,
      rolloff: -12,
    }).connect(this.gainNode);
    // MembraneSynth gives a softer, more percussive click than raw oscillators
    this.synth = new Tone.MembraneSynth({
      pitchDecay: 0.008,
      octaves: 2,
      envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.05 },
      volume: -6,
    }).connect(this.filter);
  }

  get isPlaying(): boolean {
    return this._isPlaying;
  }

  get bpm(): number {
    return this._bpm;
  }

  start(options: MetronomeOptions): void {
    this.stop();

    this._bpm = options.bpm;
    this._beatsPerMeasure = options.beatsPerMeasure ?? 4;
    this._accentFirst = options.accentFirst ?? true;
    this.beatCount = 0;

    Tone.getTransport().bpm.value = this._bpm;

    this.loop = new Tone.Loop((time) => {
      const isAccent =
        this._accentFirst && this.beatCount % this._beatsPerMeasure === 0;
      // Higher pitch for accent beat, lower for regular
      const note = isAccent ? "C5" : "C4";
      const velocity = isAccent ? 0.8 : 0.5;
      this.synth.triggerAttackRelease(note, "32n", time, velocity);
      this.beatCount++;
    }, "4n");

    this.loop.start(0);
    Tone.getTransport().start();
    this._isPlaying = true;
  }

  stop(): void {
    if (this.loop) {
      this.loop.stop();
      this.loop.dispose();
      this.loop = null;
    }
    Tone.getTransport().stop();
    this._isPlaying = false;
    this.beatCount = 0;
  }

  setBpm(bpm: number): void {
    this._bpm = bpm;
    Tone.getTransport().bpm.value = bpm;
  }

  setVolume(volume: number): void {
    this.gainNode.gain.linearRampToValueAtTime(volume, Tone.now() + 0.05);
  }

  dispose(): void {
    this.stop();
    this.synth.dispose();
    this.filter.dispose();
    this.gainNode.dispose();
  }
}

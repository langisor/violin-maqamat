import { TuningSystem } from '../types/maqam';

// Base frequency reference: A4 = 440.0 Hz
const A4_FREQ = 440.0;

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private bodyFilterAir: BiquadFilterNode | null = null;
  private bodyFilterWood: BiquadFilterNode | null = null;
  
  // Drone subsystem
  private droneOsc: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;
  private isDroneActive = false;

  // Synthesis parameters
  private vibratoRate = 5.2; // Hz
  private vibratoDepth = 0.0035; // fractional frequency variation

  public init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);

      // Acoustic violin body formants
      // 1. Air Cavity Resonance (f0 resonance around 280 Hz)
      this.bodyFilterAir = this.ctx.createBiquadFilter();
      this.bodyFilterAir.type = 'peaking';
      this.bodyFilterAir.frequency.setValueAtTime(285, this.ctx.currentTime);
      this.bodyFilterAir.Q.setValueAtTime(2.2, this.ctx.currentTime);
      this.bodyFilterAir.gain.setValueAtTime(3.5, this.ctx.currentTime);

      // 2. Wood Plate Main Resonance (around 460 - 500 Hz)
      this.bodyFilterWood = this.ctx.createBiquadFilter();
      this.bodyFilterWood.type = 'peaking';
      this.bodyFilterWood.frequency.setValueAtTime(475, this.ctx.currentTime);
      this.bodyFilterWood.Q.setValueAtTime(1.8, this.ctx.currentTime);
      this.bodyFilterWood.gain.setValueAtTime(4.0, this.ctx.currentTime);

      // High shelf / lowpass to recreate warm bowed violin dampening
      const highDamp = this.ctx.createBiquadFilter();
      highDamp.type = 'lowpass';
      highDamp.frequency.setValueAtTime(4200, this.ctx.currentTime);
      highDamp.Q.setValueAtTime(0.7, this.ctx.currentTime);

      this.masterGain.connect(this.bodyFilterAir);
      this.bodyFilterAir.connect(this.bodyFilterWood);
      this.bodyFilterWood.connect(highDamp);
      highDamp.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Calculates the exact frequency in Hertz based on tuning system and microtone offset.
   * - 24-EDO: divides octave into 24 quarter tones of 50 cents each.
   * - 53-EDO: Ottoman-Arab comma tuning (53 equal divisions of ~22.6415 cents/comma).
   * - 12-TET: standard Western equal temperament.
   */
  public calculateFrequency(
    baseMidi: number, 
    quarterToneOffset = 0, 
    tuning: TuningSystem = '24-EDO', 
    commaOffset = 0
  ): number {
    // baseMidi is standard 12-TET MIDI number (e.g. C4 = 60, A4 = 69)
    if (tuning === '24-EDO') {
      // Each quarter-tone is 0.5 semitone
      const totalSemitonesFromA4 = (baseMidi - 69) + (quarterToneOffset * 0.5);
      return A4_FREQ * Math.pow(2, totalSemitonesFromA4 / 12);
    } else if (tuning === '53-EDO') {
      // Offtonic 53-EDO comma system
      // Standard A4 is matched to index 0, each comma is 2^(1/53)
      const semitoneDifference = baseMidi - 69;
      // Convert standard 12-TET distance to approximate commas + precise comma delta
      const commasFromA4 = Math.round(semitoneDifference * (53 / 12)) + commaOffset;
      return A4_FREQ * Math.pow(2, commasFromA4 / 53);
    } else {
      // 12-TET: rounds quarter tone offsets to nearest semitone
      const totalSemitones = (baseMidi - 69) + Math.round(quarterToneOffset * 0.5);
      return A4_FREQ * Math.pow(2, totalSemitones / 12);
    }
  }

  /**
   * Plays a bowed violin sound with realistic attack/release envelope,
   * subtle bow friction noise, and vibrato LFO.
   */
  public playNote(
    freq: number, 
    durationSec = 1.2, 
    _voiceId = Date.now(), 
    enableVibrato = true
  ): () => void {
    this.init();
    if (!this.ctx || !this.masterGain) return () => {};

    const now = this.ctx.currentTime;

    // Dual oscillator for rich harmonic violin string texture (sawtooth + slightly detuned triangle)
    const oscSaw = this.ctx.createOscillator();
    oscSaw.type = 'sawtooth';
    oscSaw.frequency.setValueAtTime(freq, now);

    const oscSub = this.ctx.createOscillator();
    oscSub.type = 'triangle';
    oscSub.frequency.setValueAtTime(freq * 2, now); // 2nd harmonic richness

    // Vibrato LFO
    let lfoGain: GainNode | null = null;
    let lfo: OscillatorNode | null = null;
    if (enableVibrato) {
      lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(this.vibratoRate, now);

      lfoGain = this.ctx.createGain();
      // Delayed vibrato onset typical of Arabic violin ornaments
      lfoGain.gain.setValueAtTime(0, now);
      lfoGain.gain.linearRampToValueAtTime(freq * this.vibratoDepth, now + 0.35);

      lfo.connect(lfoGain);
      lfoGain.connect(oscSaw.frequency);
      lfo.start(now);
      lfo.stop(now + durationSec + 0.3);
    }

    // Voice gain envelope with bow attack
    const voiceGain = this.ctx.createGain();
    voiceGain.gain.setValueAtTime(0.0001, now);
    
    // Bowing attack: quick swell to emulate bow hair gripping the string
    const attackTime = 0.08;
    const decayTime = Math.max(attackTime + 0.1, durationSec - 0.25);
    voiceGain.gain.exponentialRampToValueAtTime(0.45, now + attackTime);
    voiceGain.gain.setValueAtTime(0.42, now + decayTime);
    voiceGain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

    // Subtle bow scrape noise burst
    const noiseBuffer = this.createBowNoiseBuffer();
    if (noiseBuffer) {
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.04, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(2200, now);
      noiseFilter.Q.setValueAtTime(3.0, now);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.masterGain);
      noiseSource.start(now);
      noiseSource.stop(now + 0.15);
    }

    // Mix oscillators
    oscSaw.connect(voiceGain);
    oscSub.connect(voiceGain);
    voiceGain.connect(this.masterGain);

    oscSaw.start(now);
    oscSub.start(now);
    oscSaw.stop(now + durationSec);
    oscSub.stop(now + durationSec);

    // Stop early handler (for mouseup or touch release)
    const stopEarly = () => {
      if (!this.ctx) return;
      const stopTime = this.ctx.currentTime;
      try {
        voiceGain.gain.cancelScheduledValues(stopTime);
        voiceGain.gain.setValueAtTime(Math.max(0.0001, voiceGain.gain.value), stopTime);
        voiceGain.gain.exponentialRampToValueAtTime(0.0001, stopTime + 0.1);
        oscSaw.stop(stopTime + 0.12);
        oscSub.stop(stopTime + 0.12);
        if (lfo) {
          lfo.stop(stopTime + 0.12);
        }
      } catch {
        // already stopped
      }
    };

    return stopEarly;
  }

  /**
   * Plays a plucked (pizzicato) string sound with immediate attack and exponential decay.
   */
  public playPizzicato(freq: number, durationSec = 1.0): () => void {
    this.init();
    if (!this.ctx || !this.masterGain) return () => {};

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    // Subtle initial tension release typical of finger plucking
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq * 0.996), now + 0.08);

    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(freq, now);

    const osc2Gain = this.ctx.createGain();
    osc2Gain.gain.setValueAtTime(0.35, now);
    osc2Gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    const voiceGain = this.ctx.createGain();
    voiceGain.gain.setValueAtTime(0.65, now);
    voiceGain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

    osc2.connect(osc2Gain);
    osc2Gain.connect(voiceGain);
    osc.connect(voiceGain);
    voiceGain.connect(this.masterGain);

    osc.start(now);
    osc2.start(now);
    osc.stop(now + durationSec);
    osc2.stop(now + durationSec);

    return () => {
      if (!this.ctx) return;
      const stopTime = this.ctx.currentTime;
      try {
        voiceGain.gain.cancelScheduledValues(stopTime);
        voiceGain.gain.setValueAtTime(Math.max(0.0001, voiceGain.gain.value), stopTime);
        voiceGain.gain.exponentialRampToValueAtTime(0.0001, stopTime + 0.05);
        osc.stop(stopTime + 0.06);
        osc2.stop(stopTime + 0.06);
      } catch {
        // already stopped
      }
    };
  }

  /**
   * Generates continuous Qarar / Tonic Drone pedal note (classic Arabic maqam foundation).
   */
  public toggleDrone(freq: number, state?: boolean): boolean {
    this.init();
    if (!this.ctx || !this.masterGain) return false;

    const targetState = state !== undefined ? state : !this.isDroneActive;

    if (targetState) {
      if (this.droneOsc) {
        this.stopDrone();
      }
      const now = this.ctx.currentTime;
      this.droneOsc = this.ctx.createOscillator();
      this.droneOsc.type = 'sawtooth';
      this.droneOsc.frequency.setValueAtTime(freq, now);

      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.setValueAtTime(0.001, now);
      this.droneGain.gain.linearRampToValueAtTime(0.18, now + 0.6);

      // Low pass to keep drone warm and non-distracting
      const droneFilter = this.ctx.createBiquadFilter();
      droneFilter.type = 'lowpass';
      droneFilter.frequency.setValueAtTime(800, now);

      this.droneOsc.connect(droneFilter);
      droneFilter.connect(this.droneGain);
      this.droneGain.connect(this.masterGain);

      this.droneOsc.start();
      this.isDroneActive = true;
    } else {
      this.stopDrone();
    }

    return this.isDroneActive;
  }

  public updateDroneFreq(freq: number) {
    if (this.ctx && this.droneOsc && this.isDroneActive) {
      this.droneOsc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    }
  }

  public stopDrone() {
    if (this.ctx && this.droneGain && this.droneOsc) {
      const now = this.ctx.currentTime;
      this.droneGain.gain.cancelScheduledValues(now);
      this.droneGain.gain.setValueAtTime(this.droneGain.gain.value, now);
      this.droneGain.gain.linearRampToValueAtTime(0.0001, now + 0.4);
      const oldOsc = this.droneOsc;
      setTimeout(() => {
        try {
          oldOsc.stop();
          oldOsc.disconnect();
        } catch {
          // ignore
        }
      }, 450);
      this.droneOsc = null;
      this.droneGain = null;
      this.isDroneActive = false;
    }
  }

  public setMasterVolume(vol: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime);
    }
  }

  public setVibratoParams(rate: number, depth: number) {
    this.vibratoRate = rate;
    this.vibratoDepth = depth;
  }

  private createBowNoiseBuffer(): AudioBuffer | null {
    if (!this.ctx) return null;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.15);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.2;
    }
    return buffer;
  }
}

export const audioEngine = new AudioEngine();

/**
 * ThreatSphere 3D - Web Audio API Tactical Sound Synthesizer
 * Zero external audio assets. Real-time procedural synthesis for cyber alerts,
 * projectile launches, impact shockwaves, and tactical UI feedback.
 */

export class SoundFX {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.droneOsc = null;
    this.droneGain = null;

    // Default muted until user interacts or un-mutes
    this.isMuted = localStorage.getItem('threatsphere_muted') === 'true';
    this.isInitialized = false;

    // Volume configuration
    this.masterVolume = 0.28;
    this.droneVolume = 0.035;
  }

  /**
   * Initializes the AudioContext upon user gesture
   */
  initContext() {
    if (this.isInitialized && this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.isInitialized = true;
      this._startAmbientDrone();
    } catch (err) {
      console.warn('ThreatSphere Web Audio init failed:', err);
    }
  }

  _startAmbientDrone() {
    if (!this.ctx || this.droneOsc) return;

    try {
      // Sub-bass 50Hz drone
      this.droneOsc = this.ctx.createOscillator();
      this.droneOsc.type = 'sine';
      this.droneOsc.frequency.setValueAtTime(48, this.ctx.currentTime);

      // Low-pass filter to make it a soft, non-intrusive command room hum
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(90, this.ctx.currentTime);

      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.setValueAtTime(this.isMuted ? 0 : this.droneVolume, this.ctx.currentTime);

      this.droneOsc.connect(filter);
      filter.connect(this.droneGain);
      this.droneGain.connect(this.masterGain);

      this.droneOsc.start();
    } catch (e) {
      // Ignore background audio exceptions
    }
  }

  /**
   * Toggles mute state
   * @param {boolean} [forceState]
   * @returns {boolean} True if muted
   */
  toggleMute(forceState) {
    this.initContext();
    this.isMuted = forceState !== undefined ? forceState : !this.isMuted;
    localStorage.setItem('threatsphere_muted', this.isMuted);

    if (this.masterGain && this.ctx) {
      const targetGain = this.isMuted ? 0 : this.masterVolume;
      this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
    }

    if (this.droneGain && this.ctx) {
      const targetDrone = this.isMuted ? 0 : this.droneVolume;
      this.droneGain.gain.setTargetAtTime(targetDrone, this.ctx.currentTime, 0.05);
    }

    return this.isMuted;
  }

  /**
   * Synthesizes trajectory launch laser / energy burst
   */
  playLaunch() {
    if (this.isMuted || !this.ctx) return;
    this.initContext();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    // Frequency sweep down
    osc.frequency.setValueAtTime(1100, t);
    osc.frequency.exponentialRampToValueAtTime(320, t + 0.12);

    // Filter to soften the sawtooth
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1800, t);
    filter.frequency.exponentialRampToValueAtTime(400, t + 0.12);

    // Amplitude envelope
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.13);
  }

  /**
   * Synthesizes impact thud and shockwave acoustics
   * @param {string} severity
   */
  playImpact(severity = 'MEDIUM') {
    if (this.isMuted || !this.ctx) return;
    this.initContext();

    const t = this.ctx.currentTime;

    // Sub-bass thud oscillator
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    let startFreq = 160;
    let endFreq = 45;
    let vol = 0.16;
    let duration = 0.35;

    if (severity === 'CRITICAL') {
      startFreq = 95;
      endFreq = 28;
      vol = 0.28;
      duration = 0.55;
      this.playAlert();
    } else if (severity === 'HIGH') {
      startFreq = 130;
      endFreq = 38;
      vol = 0.20;
      duration = 0.4;
    } else if (severity === 'LOW') {
      startFreq = 220;
      endFreq = 70;
      vol = 0.08;
      duration = 0.2;
    }

    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(endFreq, t + duration);

    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + duration + 0.02);

    // Add a quick snappy noise click for attack transient
    this._playNoiseTransient(t, 0.04, vol * 0.5);
  }

  _playNoiseTransient(t, duration, volume) {
    try {
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2400, t);
      filter.Q.setValueAtTime(3.0, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(volume, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start(t);
      noise.stop(t + duration);
    } catch (e) {
      // Noise buffer failure fallback
    }
  }

  /**
   * Dual-tone critical military alarm chirp
   */
  playAlert() {
    if (this.isMuted || !this.ctx) return;
    this.initContext();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.setValueAtTime(1760, t + 0.08);
    osc.frequency.setValueAtTime(880, t + 0.16);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.25);
  }

  /**
   * Crisp UI click / digital pip
   */
  playClick() {
    if (this.isMuted || !this.ctx) return;
    this.initContext();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(2200, t);
    osc.frequency.exponentialRampToValueAtTime(1400, t + 0.025);

    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.03);
  }
}

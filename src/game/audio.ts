// Realistic Web Audio procedural sound synthesizer & acoustic soundscape for Lost World 2D

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private ambienceGain: GainNode | null = null;
  private convolver: ConvolverNode | null = null;
  private reverbGain: GainNode | null = null;

  public sfxVolume: number = (() => {
    try {
      const v = localStorage.getItem('lostworld_sfx_volume');
      return v !== null ? parseFloat(v) : 1.0;
    } catch {
      return 1.0;
    }
  })();
  public musicVolume: number = (() => {
    try {
      const v = localStorage.getItem('lostworld_music_volume');
      return v !== null ? parseFloat(v) : 0.5;
    } catch {
      return 0.5;
    }
  })();
  private isMuted: boolean = false;

  // Ambient soundscape loops & state
  private isMusicPlaying: boolean = false;
  private musicTimer: number | null = null;
  private isNightMode: boolean = false;
  private birdTimer: number | null = null;
  private cricketTimer: number | null = null;

  // Weather & environment sources
  private windNode: AudioBufferSourceNode | null = null;
  private windGain: GainNode | null = null;
  private rainNode: AudioBufferSourceNode | null = null;
  private rainGain: GainNode | null = null;

  // Cached noise buffers for realistic physical synthesis
  private pinkNoiseBuffer: AudioBuffer | null = null;
  private whiteNoiseBuffer: AudioBuffer | null = null;
  private brownNoiseBuffer: AudioBuffer | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master output
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // SFX Bus
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      // Music Bus
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      // Ambience Bus (wind, birds, rain, crickets)
      this.ambienceGain = this.ctx.createGain();
      this.ambienceGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.ambienceGain.connect(this.masterGain);

      // Realistic Outdoor Natural Convolver Reverb (2.4s decay with forest acoustic absorption)
      this.convolver = this.ctx.createConvolver();
      this.convolver.buffer = this.createReverbBuffer(this.ctx);

      this.reverbGain = this.ctx.createGain();
      this.reverbGain.gain.setValueAtTime(0.28, this.ctx.currentTime);
      this.convolver.connect(this.reverbGain);
      this.reverbGain.connect(this.masterGain);

      // Pre-generate noise buffers for organic sound modeling
      this.whiteNoiseBuffer = this.createWhiteNoiseBuffer(this.ctx, 2.0);
      this.pinkNoiseBuffer = this.createPinkNoiseBuffer(this.ctx, 3.0);
      this.brownNoiseBuffer = this.createBrownNoiseBuffer(this.ctx, 3.0);

      // Start continuous gentle background wind
      this.startWindAmbience();
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // --- Algorithmic Outdoor Impulse Response for Spatial Reverb ---
  private createReverbBuffer(ctx: AudioContext): AudioBuffer {
    const rate = ctx.sampleRate;
    const length = Math.floor(rate * 2.2); // 2.2s natural woodland space
    const buffer = ctx.createBuffer(2, length, rate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);
    const decay = 3.0;

    for (let i = 0; i < length; i++) {
      const t = i / rate;
      const env = Math.exp(-decay * t);
      // Soft high-frequency damping over distance
      const damp = 1 - t / 2.2 * 0.4;
      left[i] = (Math.random() * 2 - 1) * env * damp;
      right[i] = (Math.random() * 2 - 1) * env * damp;
    }
    return buffer;
  }

  // --- Noise Generators for Physical Audio Synthesis ---
  private createWhiteNoiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  private createPinkNoiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  private createBrownNoiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; // Gain compensation
    }
    return buffer;
  }

  // --- Volume Controls ---
  public setVolumes(master: number, sfx: number, music: number) {
    this.sfxVolume = sfx;
    this.musicVolume = music;
    try {
      localStorage.setItem('lostworld_sfx_volume', sfx.toString());
      localStorage.setItem('lostworld_music_volume', music.toString());
    } catch {}
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(sfx, this.ctx.currentTime);
    }
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(music, this.ctx.currentTime);
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : master, this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // --- Continuous Realistic Environmental Wind ---
  private startWindAmbience() {
    if (!this.ctx || !this.ambienceGain || !this.pinkNoiseBuffer) return;

    this.windNode = this.ctx.createBufferSource();
    this.windNode.buffer = this.pinkNoiseBuffer;
    this.windNode.loop = true;

    // Filter wind through a slow breathing lowpass filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(260, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    // LFO for gentle wind gusts
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // 8 second cycle

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(120, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    this.windGain = this.ctx.createGain();
    this.windGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    this.windNode.connect(filter);
    filter.connect(this.windGain);
    this.windGain.connect(this.ambienceGain);

    this.windNode.start();
    lfo.start();
  }

  // --- Rain Weather Audio ---
  public setRainIntensity(intensity: number) {
    this.initContext();
    if (!this.ctx || !this.ambienceGain || !this.whiteNoiseBuffer) return;

    if (intensity > 0) {
      if (!this.rainNode) {
        this.rainNode = this.ctx.createBufferSource();
        this.rainNode.buffer = this.whiteNoiseBuffer;
        this.rainNode.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, this.ctx.currentTime);

        this.rainGain = this.ctx.createGain();
        this.rainGain.gain.setValueAtTime(Math.min(0.25, intensity * 0.22), this.ctx.currentTime);

        this.rainNode.connect(filter);
        filter.connect(this.rainGain);
        this.rainGain.connect(this.ambienceGain);

        this.rainNode.start();
      } else if (this.rainGain) {
        this.rainGain.gain.setTargetAtTime(Math.min(0.25, intensity * 0.22), this.ctx.currentTime, 0.5);
      }
    } else {
      if (this.rainNode && this.rainGain) {
        this.rainGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.3);
        setTimeout(() => {
          if (this.rainNode) {
            try { this.rainNode.stop(); } catch {}
            this.rainNode.disconnect();
            this.rainNode = null;
          }
        }, 400);
      }
    }
  }

  // =========================================================================
  // REALISTIC SOUND EFFECTS (Physical & Acoustic Modeling)
  // =========================================================================

  // 1. Realistic Footsteps (Grass, Dirt, Stone, Water, Wood)
  public playFootstep(surface: 'grass' | 'stone' | 'water' | 'wood' = 'grass') {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;

    if (surface === 'water') {
      // Liquid splash: water displacement + airy droplets
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(280 + Math.random() * 40, t);
      osc.frequency.exponentialRampToValueAtTime(90, t + 0.1);
      oscGain.gain.setValueAtTime(0.12, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

      osc.connect(oscGain);
      oscGain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.11);

      // Splash droplet spray
      if (this.whiteNoiseBuffer) {
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.whiteNoiseBuffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1800, t);
        filter.Q.setValueAtTime(2, t);

        const nGain = this.ctx.createGain();
        nGain.gain.setValueAtTime(0.06, t);
        nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

        noise.connect(filter);
        filter.connect(nGain);
        nGain.connect(this.sfxGain);
        noise.start(t);
        noise.stop(t + 0.09);
      }
    } else if (surface === 'stone') {
      // Hard sole tap + stone friction click
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240 + Math.random() * 30, t);
      osc.frequency.exponentialRampToValueAtTime(70, t + 0.06);
      oscGain.gain.setValueAtTime(0.08, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

      osc.connect(oscGain);
      oscGain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.07);

      // Sharp sole click
      if (this.whiteNoiseBuffer) {
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.whiteNoiseBuffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(2800, t);

        const nGain = this.ctx.createGain();
        nGain.gain.setValueAtTime(0.05, t);
        nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

        noise.connect(filter);
        filter.connect(nGain);
        nGain.connect(this.sfxGain);
        noise.start(t);
        noise.stop(t + 0.05);
      }
    } else {
      // Grass / Dirt: dry blade crunch + soft soil thud
      const thud = this.ctx.createOscillator();
      const thudGain = this.ctx.createGain();
      thud.type = 'sine';
      thud.frequency.setValueAtTime(80 + Math.random() * 15, t);
      thud.frequency.exponentialRampToValueAtTime(45, t + 0.07);
      thudGain.gain.setValueAtTime(0.08, t);
      thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

      thud.connect(thudGain);
      thudGain.connect(this.sfxGain);
      thud.start(t);
      thud.stop(t + 0.08);

      // Grass rustle noise
      if (this.pinkNoiseBuffer) {
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.pinkNoiseBuffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1400 + Math.random() * 300, t);
        filter.Q.setValueAtTime(1.8, t);

        const nGain = this.ctx.createGain();
        nGain.gain.setValueAtTime(0.07, t);
        nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

        noise.connect(filter);
        filter.connect(nGain);
        nGain.connect(this.sfxGain);
        noise.start(t);
        noise.stop(t + 0.07);
      }
    }
  }

  // 2. Realistic Tree Chopping (Axe Blade Impact + Wood Wedge + Splinter Crackle)
  public playChop() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;

    // Component A: Sharp blade impact transient (12ms)
    if (this.whiteNoiseBuffer) {
      const snap = this.ctx.createBufferSource();
      snap.buffer = this.whiteNoiseBuffer;
      const snapFilter = this.ctx.createBiquadFilter();
      snapFilter.type = 'highpass';
      snapFilter.frequency.setValueAtTime(3200, t);

      const snapGain = this.ctx.createGain();
      snapGain.gain.setValueAtTime(0.28, t);
      snapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);

      snap.connect(snapFilter);
      snapFilter.connect(snapGain);
      snapGain.connect(this.sfxGain);
      snap.start(t);
      snap.stop(t + 0.03);
    }

    // Component B: Deep timber body wedge thud (wood resonance)
    const thud = this.ctx.createOscillator();
    const thudGain = this.ctx.createGain();
    thud.type = 'triangle';
    const startFreq = 160 + Math.random() * 20;
    thud.frequency.setValueAtTime(startFreq, t);
    thud.frequency.exponentialRampToValueAtTime(55, t + 0.1);

    thudGain.gain.setValueAtTime(0.32, t);
    thudGain.gain.exponentialRampToValueAtTime(0.005, t + 0.1);

    thud.connect(thudGain);
    thudGain.connect(this.sfxGain);
    if (this.convolver) thudGain.connect(this.convolver); // Forest reverberation
    thud.start(t);
    thud.stop(t + 0.12);

    // Component C: Splinter fracture crackle (bandpass filtered noise)
    if (this.pinkNoiseBuffer) {
      const splinter = this.ctx.createBufferSource();
      splinter.buffer = this.pinkNoiseBuffer;
      const splinterFilter = this.ctx.createBiquadFilter();
      splinterFilter.type = 'bandpass';
      splinterFilter.frequency.setValueAtTime(1150 + Math.random() * 200, t);
      splinterFilter.Q.setValueAtTime(2.5, t);

      const splinterGain = this.ctx.createGain();
      splinterGain.gain.setValueAtTime(0.2, t + 0.01);
      splinterGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

      splinter.connect(splinterFilter);
      splinterFilter.connect(splinterGain);
      splinterGain.connect(this.sfxGain);
      splinter.start(t + 0.005);
      splinter.stop(t + 0.1);
    }
  }

  // 3. Realistic Mining (Pickaxe Steel Strike + Rock Fracture + Debris Crumble)
  public playMine() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;

    // Component A: Steel pickaxe ringing harmonics (metallic clink)
    const ring1 = this.ctx.createOscillator();
    const ring2 = this.ctx.createOscillator();
    const ringGain = this.ctx.createGain();

    ring1.type = 'sine';
    ring2.type = 'sine';
    const fundamental = 1680 + Math.random() * 120;
    ring1.frequency.setValueAtTime(fundamental, t);
    ring2.frequency.setValueAtTime(fundamental * 1.62, t); // Metallic non-harmonic overtone

    ringGain.gain.setValueAtTime(0.24, t);
    ringGain.gain.exponentialRampToValueAtTime(0.002, t + 0.12);

    ring1.connect(ringGain);
    ring2.connect(ringGain);
    ringGain.connect(this.sfxGain);
    if (this.convolver) ringGain.connect(this.convolver);

    ring1.start(t);
    ring2.start(t);
    ring1.stop(t + 0.14);
    ring2.stop(t + 0.14);

    // Component B: Stone fracture crunch (noise burst)
    if (this.pinkNoiseBuffer) {
      const rock = this.ctx.createBufferSource();
      rock.buffer = this.pinkNoiseBuffer;
      const rockFilter = this.ctx.createBiquadFilter();
      rockFilter.type = 'bandpass';
      rockFilter.frequency.setValueAtTime(850, t);
      rockFilter.Q.setValueAtTime(2.0, t);

      const rockGain = this.ctx.createGain();
      rockGain.gain.setValueAtTime(0.22, t);
      rockGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      rock.connect(rockFilter);
      rockFilter.connect(rockGain);
      rockGain.connect(this.sfxGain);
      rock.start(t);
      rock.stop(t + 0.09);
    }

    // Component C: Sub-surface impact thud
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'triangle';
    sub.frequency.setValueAtTime(95, t);
    sub.frequency.exponentialRampToValueAtTime(40, t + 0.08);
    subGain.gain.setValueAtTime(0.18, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    sub.connect(subGain);
    subGain.connect(this.sfxGain);
    sub.start(t);
    sub.stop(t + 0.09);
  }

  // 4. Realistic Weapon Swing (Smooth Air Displacement Whoosh)
  public playSwing() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted || !this.pinkNoiseBuffer) return;

    const t = this.ctx.currentTime;
    const dur = 0.14;

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.pinkNoiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.setValueAtTime(2.5, t);

    // Swept frequency: rising fast then descending
    filter.frequency.setValueAtTime(380, t);
    filter.frequency.exponentialRampToValueAtTime(1450, t + dur * 0.45);
    filter.frequency.exponentialRampToValueAtTime(420, t + dur);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.18, t + dur * 0.4);
    gain.gain.exponentialRampToValueAtTime(0.002, t + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(t);
    noise.stop(t + dur + 0.02);
  }

  // 5. Realistic Bow Shot (String Release Twang + Arrow Whoosh)
  public playBowShot() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;

    // Bowstring release snap
    const str = this.ctx.createOscillator();
    const strGain = this.ctx.createGain();
    str.type = 'triangle';
    str.frequency.setValueAtTime(280, t);
    str.frequency.exponentialRampToValueAtTime(110, t + 0.07);
    strGain.gain.setValueAtTime(0.24, t);
    strGain.gain.exponentialRampToValueAtTime(0.005, t + 0.08);

    str.connect(strGain);
    strGain.connect(this.sfxGain);
    str.start(t);
    str.stop(t + 0.09);

    // Arrow flight zip whoosh
    if (this.whiteNoiseBuffer) {
      const whoosh = this.ctx.createBufferSource();
      whoosh.buffer = this.whiteNoiseBuffer;
      const f = this.ctx.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.setValueAtTime(2200, t + 0.02);
      f.frequency.exponentialRampToValueAtTime(800, t + 0.16);
      f.Q.setValueAtTime(3.5, t);

      const wGain = this.ctx.createGain();
      wGain.gain.setValueAtTime(0.001, t);
      wGain.gain.linearRampToValueAtTime(0.16, t + 0.04);
      wGain.gain.exponentialRampToValueAtTime(0.002, t + 0.18);

      whoosh.connect(f);
      f.connect(wGain);
      wGain.connect(this.sfxGain);
      whoosh.start(t + 0.01);
      whoosh.stop(t + 0.19);
    }
  }

  // 6. Realistic Flesh Impact (Blunt Force Body Hit + Wet Squelch)
  public playHit() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;

    // Low visceral punch thump
    const thud = this.ctx.createOscillator();
    const thudGain = this.ctx.createGain();
    thud.type = 'sine';
    thud.frequency.setValueAtTime(90, t);
    thud.frequency.exponentialRampToValueAtTime(35, t + 0.12);
    thudGain.gain.setValueAtTime(0.3, t);
    thudGain.gain.exponentialRampToValueAtTime(0.005, t + 0.12);

    thud.connect(thudGain);
    thudGain.connect(this.sfxGain);
    thud.start(t);
    thud.stop(t + 0.14);

    // Wet organic flesh slap
    if (this.pinkNoiseBuffer) {
      const slap = this.ctx.createBufferSource();
      slap.buffer = this.pinkNoiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1350, t);
      filter.Q.setValueAtTime(2.2, t);

      const slapGain = this.ctx.createGain();
      slapGain.gain.setValueAtTime(0.24, t);
      slapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

      slap.connect(filter);
      filter.connect(slapGain);
      slapGain.connect(this.sfxGain);
      slap.start(t);
      slap.stop(t + 0.1);
    }
  }

  // 7. Realistic Monster Hurt (Deep Guttural Creature Snarl)
  public playMonsterHurt() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const dur = 0.22;

    // FM Beast Growl: Modulated Sawtooth with vowel filter sweep
    const carrier = this.ctx.createOscillator();
    const mod = this.ctx.createOscillator();
    const modGain = this.ctx.createGain();

    carrier.type = 'sawtooth';
    carrier.frequency.setValueAtTime(115, t);
    carrier.frequency.exponentialRampToValueAtTime(45, t + dur);

    mod.type = 'sine';
    mod.frequency.setValueAtTime(32, t); // Growl flutter rate
    modGain.gain.setValueAtTime(45, t);

    mod.connect(modGain);
    modGain.connect(carrier.frequency);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(750, t);
    filter.frequency.exponentialRampToValueAtTime(180, t + dur);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.26, t);
    gain.gain.exponentialRampToValueAtTime(0.005, t + dur);

    carrier.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    if (this.convolver) gain.connect(this.convolver);

    carrier.start(t);
    mod.start(t);
    carrier.stop(t + dur + 0.02);
    mod.stop(t + dur + 0.02);
  }

  // 8. Realistic Player Hurt (Visceral Impact + Human Breath Gasp)
  public playPlayerHurt() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const thud = this.ctx.createOscillator();
    const thudGain = this.ctx.createGain();
    thud.type = 'triangle';
    thud.frequency.setValueAtTime(120, t);
    thud.frequency.exponentialRampToValueAtTime(40, t + 0.18);
    thudGain.gain.setValueAtTime(0.35, t);
    thudGain.gain.exponentialRampToValueAtTime(0.005, t + 0.18);

    thud.connect(thudGain);
    thudGain.connect(this.sfxGain);
    thud.start(t);
    thud.stop(t + 0.2);

    // Gasp noise
    if (this.pinkNoiseBuffer) {
      const gasp = this.ctx.createBufferSource();
      gasp.buffer = this.pinkNoiseBuffer;
      const f = this.ctx.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.setValueAtTime(900, t);
      f.Q.setValueAtTime(1.5, t);

      const gGain = this.ctx.createGain();
      gGain.gain.setValueAtTime(0.14, t);
      gGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      gasp.connect(f);
      f.connect(gGain);
      gGain.connect(this.sfxGain);
      gasp.start(t);
      gasp.stop(t + 0.13);
    }
  }

  // 9. Realistic Item Pickup / Collect (Warm Wooden Kalimba Pop + Organic Rustle)
  public playPickup() {
    this.playCollect();
  }

  public playCollect() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;

    // Warm wooden kalimba pop (pleasant harmonic resonance)
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    const note = 523.25; // C5
    osc.frequency.setValueAtTime(note, t);
    osc.frequency.exponentialRampToValueAtTime(note * 1.5, t + 0.06);

    oscGain.gain.setValueAtTime(0.14, t);
    oscGain.gain.exponentialRampToValueAtTime(0.002, t + 0.08);

    osc.connect(oscGain);
    oscGain.connect(this.sfxGain);
    if (this.convolver) oscGain.connect(this.convolver);
    osc.start(t);
    osc.stop(t + 0.09);

    // Subtle leaf / cloth rustle
    if (this.pinkNoiseBuffer) {
      const rustle = this.ctx.createBufferSource();
      rustle.buffer = this.pinkNoiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2400, t);

      const rGain = this.ctx.createGain();
      rGain.gain.setValueAtTime(0.04, t);
      rGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

      rustle.connect(filter);
      filter.connect(rGain);
      rGain.connect(this.sfxGain);
      rustle.start(t);
      rustle.stop(t + 0.06);
    }
  }

  // 10. Realistic Eating (Crisp Organic Food Chews)
  public playEat() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted || !this.pinkNoiseBuffer) return;

    // 2-3 rapid crisp crunches
    const crunches = [0, 0.07, 0.14];
    crunches.forEach((offset) => {
      const t = this.ctx!.currentTime + offset;
      const noise = this.ctx!.createBufferSource();
      noise.buffer = this.pinkNoiseBuffer!;
      const filter = this.ctx!.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400 + Math.random() * 300, t);
      filter.Q.setValueAtTime(2.2, t);

      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0.16, t);
      gain.gain.exponentialRampToValueAtTime(0.005, t + 0.05);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain!);

      noise.start(t);
      noise.stop(t + 0.06);
    });
  }

  // 11. Realistic Crafting (Artisan Wood Taps & Tool Scrape)
  public playCraft() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const taps = [0, 0.08, 0.16];
    taps.forEach((offset, idx) => {
      const t = this.ctx!.currentTime + offset;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320 + idx * 45, t);
      osc.frequency.exponentialRampToValueAtTime(120, t + 0.06);

      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.005, t + 0.06);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      if (this.convolver) gain.connect(this.convolver);
      osc.start(t);
      osc.stop(t + 0.07);
    });
  }

  // 12. Realistic Building Placement (Heavy Timber Mallet Thud & Beam Lock)
  public playBuild() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;

    // Heavy wooden mallet strike
    const thud = this.ctx.createOscillator();
    const thudGain = this.ctx.createGain();
    thud.type = 'triangle';
    thud.frequency.setValueAtTime(130, t);
    thud.frequency.exponentialRampToValueAtTime(50, t + 0.11);
    thudGain.gain.setValueAtTime(0.28, t);
    thudGain.gain.exponentialRampToValueAtTime(0.005, t + 0.11);

    thud.connect(thudGain);
    thudGain.connect(this.sfxGain);
    if (this.convolver) thudGain.connect(this.convolver);
    thud.start(t);
    thud.stop(t + 0.13);

    // Wood settling creak
    if (this.pinkNoiseBuffer) {
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.pinkNoiseBuffer;
      const f = this.ctx.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.setValueAtTime(650, t);
      f.Q.setValueAtTime(3.0, t);

      const nGain = this.ctx.createGain();
      nGain.gain.setValueAtTime(0.12, t + 0.02);
      nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

      noise.connect(f);
      f.connect(nGain);
      nGain.connect(this.sfxGain);
      noise.start(t + 0.01);
      noise.stop(t + 0.11);
    }
  }

  // 13. Realistic Level Up (Majestic Orchestral Harp & Crystalline Chimes)
  public playLevelUp() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    // Pentatonic harp arpeggio: E4, G#4, B4, E5, G#5
    const notes = [329.63, 415.30, 493.88, 659.25, 830.61];
    notes.forEach((freq, idx) => {
      const t = this.ctx!.currentTime + idx * 0.08;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      // Acoustic envelope: soft attack + long reverberant decay
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      if (this.convolver) gain.connect(this.convolver);

      osc.start(t);
      osc.stop(t + 0.7);
    });
  }

  // 14. Realistic Rolling Thunder (Lightning Crack + Distant Rolling Valley Rumblings)
  public playThunder() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted || !this.brownNoiseBuffer) return;

    const t = this.ctx.currentTime;
    const dur = 3.2;

    // Initial sharp lightning crack
    if (this.whiteNoiseBuffer) {
      const crack = this.ctx.createBufferSource();
      crack.buffer = this.whiteNoiseBuffer;
      const crackFilter = this.ctx.createBiquadFilter();
      crackFilter.type = 'highpass';
      crackFilter.frequency.setValueAtTime(1200, t);

      const crackGain = this.ctx.createGain();
      crackGain.gain.setValueAtTime(0.35, t);
      crackGain.gain.exponentialRampToValueAtTime(0.005, t + 0.06);

      crack.connect(crackFilter);
      crackFilter.connect(crackGain);
      crackGain.connect(this.sfxGain);
      crack.start(t);
      crack.stop(t + 0.07);
    }

    // Long multi-stage rolling bass rumble
    const rumble = this.ctx.createBufferSource();
    rumble.buffer = this.brownNoiseBuffer;

    const rFilter = this.ctx.createBiquadFilter();
    rFilter.type = 'lowpass';
    rFilter.frequency.setValueAtTime(95, t);
    rFilter.frequency.linearRampToValueAtTime(60, t + dur);

    const rGain = this.ctx.createGain();
    rGain.gain.setValueAtTime(0.001, t);
    rGain.gain.linearRampToValueAtTime(0.42, t + 0.08);
    // Secondary distant roll swell
    rGain.gain.linearRampToValueAtTime(0.32, t + 0.8);
    rGain.gain.linearRampToValueAtTime(0.25, t + 1.6);
    rGain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    rumble.connect(rFilter);
    rFilter.connect(rGain);
    rGain.connect(this.sfxGain);
    if (this.convolver) rGain.connect(this.convolver);

    rumble.start(t);
    rumble.stop(t + dur + 0.1);
  }

  // 15. Tactile UI Click (Subtle Wooden Switch Click)
  public playUiClick() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(250, t + 0.025);

    gain.gain.setValueAtTime(0.07, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.03);
  }

  // =========================================================================
  // REALISTIC ATMOSPHERIC SOUNDTRACK & PROCEDURAL SOUNDSCAPES
  // =========================================================================

  // Warm Felt Acoustic Piano Synthesizer with Natural Overtones
  private playPianoNote(freq: number, duration: number, gainLevel: number = 0.12) {
    if (!this.ctx || !this.musicGain || this.isMuted) return;

    const t = this.ctx.currentTime;

    // Harmonic partials (1st fundamental, 2nd octave, 3rd fifth)
    const partials = [
      { f: freq, gain: 1.0 },
      { f: freq * 2, gain: 0.35 },
      { f: freq * 3, gain: 0.12 },
    ];

    partials.forEach((p) => {
      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(p.f, t);

      // Warm felt hammer envelope
      const noteGain = gainLevel * p.gain;
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(noteGain, t + 0.035); // Soft hammer felt attack
      g.gain.exponentialRampToValueAtTime(0.001, t + duration);

      osc.connect(g);
      g.connect(this.musicGain!);
      if (this.convolver) g.connect(this.convolver); // Lush acoustic reverb

      osc.start(t);
      osc.stop(t + duration + 0.1);
    });
  }

  // Warm Ambient String / Analog Pad Swell
  private playWarmPad(chordFreqs: number[], duration: number) {
    if (!this.ctx || !this.musicGain || this.isMuted) return;

    const t = this.ctx.currentTime;

    chordFreqs.forEach((freq) => {
      const osc = this.ctx!.createOscillator();
      const filter = this.ctx!.createBiquadFilter();
      const gain = this.ctx!.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);

      // Lowpass filter for warm analog feel
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, t);
      filter.frequency.linearRampToValueAtTime(450, t + duration * 0.5);
      filter.frequency.linearRampToValueAtTime(260, t + duration);

      // Gentle pad swell
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.03, t + 1.2);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain!);
      if (this.convolver) gain.connect(this.convolver);

      osc.start(t);
      osc.stop(t + duration + 0.2);
    });
  }

  // Realistic Procedural Forest Bird Chirp (Whistled frequency-modulated glide)
  private playBirdChirp() {
    if (!this.ctx || !this.ambienceGain || this.isMuted || this.isNightMode) return;

    const t = this.ctx.currentTime;
    const baseFreq = 2600 + Math.random() * 800;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';

    // Fast melodious bird flutter
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.linearRampToValueAtTime(baseFreq + 600, t + 0.05);
    osc.frequency.linearRampToValueAtTime(baseFreq - 200, t + 0.11);
    osc.frequency.linearRampToValueAtTime(baseFreq + 400, t + 0.18);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.045, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.ambienceGain);
    if (this.convolver) gain.connect(this.convolver);

    osc.start(t);
    osc.stop(t + 0.24);
  }

  // Realistic Night Cricket Trill
  private playCricketTrill() {
    if (!this.ctx || !this.ambienceGain || this.isMuted || !this.isNightMode) return;

    const t = this.ctx.currentTime;
    const pulses = 4;
    for (let i = 0; i < pulses; i++) {
      const pt = t + i * 0.04;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(4600 + Math.random() * 200, pt);

      gain.gain.setValueAtTime(0.001, pt);
      gain.gain.linearRampToValueAtTime(0.025, pt + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, pt + 0.035);

      osc.connect(gain);
      gain.connect(this.ambienceGain);

      osc.start(pt);
      osc.stop(pt + 0.04);
    }
  }

  // Set Day/Night state for music and soundscapes
  public setNightMode(isNight: boolean) {
    this.isNightMode = isNight;
  }

  // Start the realistic atmospheric survival music & nature soundscape
  public startAmbientMusic(isNight: boolean = false) {
    if (this.isMusicPlaying) return;
    this.initContext();
    this.isMusicPlaying = true;
    this.isNightMode = isNight;

    // Beautiful, contemplative progressions inspired by C418 (Minecraft) & Stardew Valley:
    // Daytime: Cmaj9, Fmaj7, Am9, Gsus4 (peaceful, warm, sunny wilderness)
    const dayChords = [
      [130.81, 261.63, 329.63, 392.00, 493.88], // Cmaj9
      [174.61, 261.63, 329.63, 440.00, 523.25], // Fmaj7
      [110.00, 220.00, 261.63, 329.63, 392.00], // Am7
      [196.00, 293.66, 392.00, 440.00, 523.25], // Gsus4
    ];

    // Nighttime: Dm9, Am7, Bbmaj7, Fmaj7 (deep, starry, contemplative night sky)
    const nightChords = [
      [146.83, 220.00, 293.66, 349.23, 440.00], // Dm9
      [110.00, 220.00, 261.63, 329.63, 392.00], // Am7
      [116.54, 233.08, 293.66, 349.23, 440.00], // Bbmaj7
      [130.81, 261.63, 329.63, 392.00, 523.25], // C/E
    ];

    let chordIdx = 0;

    const playAmbientStep = () => {
      if (!this.isMusicPlaying || !this.ctx || !this.musicGain || this.isMuted) {
        this.musicTimer = window.setTimeout(playAmbientStep, 2000);
        return;
      }

      const chords = this.isNightMode ? nightChords : dayChords;
      const currentChord = chords[chordIdx % chords.length];
      chordIdx++;

      // Play soft warm string pad underneath
      this.playWarmPad(currentChord.slice(0, 3), 6.5);

      // Play delicate felt piano notes over the chord
      const root = currentChord[0] * 2;
      this.playPianoNote(root, 3.8, 0.11);

      // Arpeggiated gentle high melody note
      const melodyFreq = currentChord[Math.floor(Math.random() * (currentChord.length - 1)) + 1];
      setTimeout(() => {
        if (this.isMusicPlaying) {
          this.playPianoNote(melodyFreq, 3.2, 0.09);
        }
      }, 700 + Math.random() * 400);

      // Subtle occasional 2nd melody note
      if (Math.random() > 0.4) {
        const highFreq = currentChord[Math.floor(Math.random() * currentChord.length)] * (Math.random() > 0.5 ? 2 : 1);
        setTimeout(() => {
          if (this.isMusicPlaying) {
            this.playPianoNote(highFreq, 2.8, 0.07);
          }
        }, 1800 + Math.random() * 600);
      }

      // Next chord cycle (spacious, relaxing timing: every 6 to 9 seconds)
      const nextDelay = 6000 + Math.random() * 3000;
      this.musicTimer = window.setTimeout(playAmbientStep, nextDelay);
    };

    playAmbientStep();

    // Start procedural environmental bird calls in daytime
    const scheduleBird = () => {
      if (!this.isMusicPlaying) return;
      if (!this.isNightMode && Math.random() < 0.85) {
        this.playBirdChirp();
      }
      this.birdTimer = window.setTimeout(scheduleBird, 7000 + Math.random() * 9000);
    };
    scheduleBird();

    // Start procedural night crickets
    const scheduleCrickets = () => {
      if (!this.isMusicPlaying) return;
      if (this.isNightMode && Math.random() < 0.9) {
        this.playCricketTrill();
      }
      this.cricketTimer = window.setTimeout(scheduleCrickets, 2400 + Math.random() * 3200);
    };
    scheduleCrickets();
  }

  public stopAmbientMusic() {
    this.isMusicPlaying = false;
    if (this.musicTimer !== null) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
    if (this.birdTimer !== null) {
      clearTimeout(this.birdTimer);
      this.birdTimer = null;
    }
    if (this.cricketTimer !== null) {
      clearTimeout(this.cricketTimer);
      this.cricketTimer = null;
    }
  }
}

export const soundEngine = new SoundEngine();

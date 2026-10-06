/* ==========================================================================
   AURA 10D SPATIAL AUDIO & SENSORY SYNTHESIZER
   Web Audio API Procedural Spatial Audio Engine (Zero External Audio Assets Required)
   ========================================================================== */

class SpatialAudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.currentTrack = null;
    this.masterGain = null;
    this.analyser = null;
    this.panner = null;
    this.activeNodes = [];
    this.panAngle = 0;
    this.visualizerCanvas = null;
    this.visualizerCtx = null;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();

    // Master Gain & Analyser
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime);

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 64;

    // 10D Binaural Stereo Panner
    this.panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;

    if (this.panner) {
      this.masterGain.connect(this.panner);
      this.panner.connect(this.analyser);
    } else {
      this.masterGain.connect(this.analyser);
    }

    this.analyser.connect(this.ctx.destination);

    // Start 10D circular spatial panning rotation
    this.startSpatialRotation();
    this.setupVisualizer();
  }

  startSpatialRotation() {
    setInterval(() => {
      if (!this.isPlaying || !this.panner) return;
      this.panAngle += 0.03;
      // Oscillate between left (-0.85) and right (+0.85) for 10D spatial depth
      const panValue = Math.sin(this.panAngle) * 0.85;
      this.panner.pan.setValueAtTime(panValue, this.ctx.currentTime);
    }, 50);
  }

  stopCurrent() {
    this.activeNodes.forEach(node => {
      try {
        if (node.stop) node.stop();
        node.disconnect();
      } catch (e) {}
    });
    this.activeNodes = [];
    this.isPlaying = false;
  }

  playPreset(type) {
    this.init();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.stopCurrent();
    this.currentTrack = type;
    this.isPlaying = true;

    switch (type) {
      case 'rain':
        this.createRainSound();
        break;
      case 'fireplace':
        this.createFireplaceSound();
        break;
      case 'drone':
        this.createPenthouseDrone();
        break;
      case 'breeze':
        this.createSkyBreeze();
        break;
      default:
        this.createPenthouseDrone();
    }

    this.updateUI();
  }

  createRainSound() {
    // Generate pink noise buffer
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
      b6 = white * 0.115926;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    // Filter to sound like rain on heavy architectural panoramic glass
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(this.masterGain);
    noise.start();

    this.activeNodes.push(noise, filter);
  }

  createFireplaceSound() {
    // Warm low-frequency rumble
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(55, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();

    this.activeNodes.push(osc, gain);
  }

  createPenthouseDrone() {
    // Deep harmonic architectural chords (E-flat major luxury resonance)
    const freqs = [77.78, 116.54, 155.56, 233.08];

    freqs.forEach(f => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();

      this.activeNodes.push(osc, gain);
    });
  }

  createSkyBreeze() {
    // Air sweep filter
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.05;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);
    filter.Q.setValueAtTime(3.0, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(this.masterGain);
    noise.start();

    this.activeNodes.push(noise, filter);
  }

  togglePlay() {
    if (this.isPlaying) {
      this.stopCurrent();
    } else {
      this.playPreset(this.currentTrack || 'drone');
    }
    this.updateUI();
  }

  setupVisualizer() {
    this.visualizerCanvas = document.getElementById('audio-visualizer');
    if (!this.visualizerCanvas) return;
    this.visualizerCtx = this.visualizerCanvas.getContext('2d');

    const render = () => {
      requestAnimationFrame(render);
      if (!this.visualizerCtx || !this.analyser) return;

      const width = this.visualizerCanvas.width;
      const height = this.visualizerCanvas.height;
      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      this.analyser.getByteFrequencyData(dataArray);

      this.visualizerCtx.clearRect(0, 0, width, height);

      const barWidth = (width / bufferLength) * 2.2;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height;

        // Gradient gold to cyan
        const gradient = this.visualizerCtx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, '#e5b96f');
        gradient.addColorStop(1, '#00f2fe');

        this.visualizerCtx.fillStyle = gradient;
        this.visualizerCtx.fillRect(x, height - barHeight, barWidth - 3, barHeight);

        x += barWidth;
      }
    };
    render();
  }

  updateUI() {
    const navAudioBtn = document.getElementById('nav-audio-toggle');
    if (navAudioBtn) {
      navAudioBtn.classList.toggle('active', this.isPlaying);
      navAudioBtn.innerHTML = this.isPlaying
        ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg> 10D: ON`
        : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg> 10D AUDIO`;
    }

    document.querySelectorAll('.soundscape-btn').forEach(btn => {
      btn.classList.toggle('active', this.isPlaying && btn.dataset.sound === this.currentTrack);
    });
  }
}

window.spatialAudio = new SpatialAudioEngine();

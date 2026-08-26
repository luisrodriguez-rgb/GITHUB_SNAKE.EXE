/**
 * Web Audio API - Sintetizador de Efectos de Sonido Cyberpunk
 * Genera sonido procedural nativo sin dependencias ni archivos externos.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = true; // Silenciado por defecto para no ser intrusivo
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.init();
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  /**
   * Sonido sintético al devorar un commit
   * @param {number} level - Nivel de contribución (1 a 4)
   */
  playEat(level = 1) {
    if (this.isMuted || !this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Frecuencia según la intensidad del commit
      const baseFreq = 440 + (level * 120);
      osc.type = level >= 3 ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.08);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {
      // AudioContext ignorado si la ventana no ha recibido interacción
    }
  }

  /**
   * Pulso de choque en commits de alto nivel
   */
  playShockwave() {
    if (this.isMuted || !this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.25);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.26);
    } catch (e) {}
  }

  /**
   * Sonido de clic en interfaz
   */
  playClick() {
    if (this.isMuted || !this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.03);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {}
  }
}

window.SoundEngine = SoundEngine;

/**
 * SoundManager.js - Gerenciamento de efeitos sonoros via Web Audio API
 * Gera sons sintetizados programaticamente (sem arquivos de áudio externos)
 * Comentários em português do Brasil
 */

export class SoundManager {
  static ctx = null;

  static getContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this.ctx;
  }

  static ensureResumed() {
    const ctx = this.getContext();
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    return ctx;
  }

  static playSnap() {
    try {
      const ctx = this.ensureResumed();
      const t = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(1200, t);
      osc.frequency.exponentialRampToValueAtTime(400, t + 0.06);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.08);
    } catch (e) {
      // Falha silenciosa — não afeta a jogabilidade
    }
  }

  static playMove() {
    try {
      const ctx = this.ensureResumed();
      const t = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(200, t);
      osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.linearRampToValueAtTime(0.08, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.12);
    } catch (e) {
      // Falha silenciosa
    }
  }

  static playWallCollision() {
    try {
      const ctx = this.ensureResumed();
      const t = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "square";
      osc.frequency.setValueAtTime(80, t);
      osc.frequency.linearRampToValueAtTime(40, t + 0.15);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.2);
    } catch (e) {
      // Falha silenciosa
    }
  }

  static playTrophy() {
    try {
      const ctx = this.ensureResumed();
      const t = ctx.currentTime;

      const notes = [523, 659, 784, 1047];

      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = t + i * 0.1;

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.2, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.35);
      });
    } catch (e) {
      // Falha silenciosa
    }
  }

  static playFireTrap() {
    try {
      const ctx = this.ensureResumed();
      const t = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sawtooth";
      osc1.frequency.setValueAtTime(300, t);
      osc1.frequency.linearRampToValueAtTime(600, t + 0.3);

      osc2.type = "sine";
      osc2.frequency.setValueAtTime(150, t);
      osc2.frequency.linearRampToValueAtTime(300, t + 0.3);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.08);
      gain.gain.linearRampToValueAtTime(0.06, t + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(t);
      osc1.stop(t + 0.4);
      osc2.start(t);
      osc2.stop(t + 0.4);
    } catch (e) {
      // Falha silenciosa
    }
  }

  static playSpikeTrap() {
    try {
      const ctx = this.ensureResumed();
      const t = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(2000, t);
      osc.frequency.exponentialRampToValueAtTime(100, t + 0.2);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.linearRampToValueAtTime(0.3, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.25);
    } catch (e) {
      // Falha silenciosa
    }
  }

  static playJump() {
    try {
      const ctx = this.ensureResumed();
      const t = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(300, t);
      osc.frequency.exponentialRampToValueAtTime(600, t + 0.15);

      gain.gain.setValueAtTime(0.15, t);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.2);
    } catch (e) {
      // Falha silenciosa
    }
  }

  static playKeyCollect() {
    try {
      const ctx = this.ensureResumed();
      const t = ctx.currentTime;

      [880, 1320].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = t + i * 0.06;

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, start);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.2, start + 0.1);

        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.15, start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.25);
      });
    } catch (e) {
      // Falha silenciosa
    }
  }

  static playDoorOpen() {
    try {
      const ctx = this.ensureResumed();
      const t = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(200, t);
      osc.frequency.linearRampToValueAtTime(100, t + 0.1);
      osc.frequency.linearRampToValueAtTime(250, t + 0.2);
      osc.frequency.linearRampToValueAtTime(120, t + 0.35);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.4);
    } catch (e) {
      // Falha silenciosa
    }
  }

  static playActorClick() {
    try {
      const ctx = this.ensureResumed();
      const t = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.exponentialRampToValueAtTime(1200, t + 0.08);
      osc.frequency.exponentialRampToValueAtTime(800, t + 0.15);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();

      osc2.type = "sine";
      osc2.frequency.setValueAtTime(400, t);
      osc2.frequency.exponentialRampToValueAtTime(600, t + 0.1);

      gain2.gain.setValueAtTime(0.06, t);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

      osc.connect(gain);
      osc2.connect(gain2);
      gain.connect(ctx.destination);
      gain2.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.18);
      osc2.start(t);
      osc2.stop(t + 0.15);
    } catch (e) {
      // Falha silenciosa
    }
  }
}

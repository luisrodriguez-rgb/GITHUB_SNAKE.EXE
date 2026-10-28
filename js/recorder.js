/**
 * HD Video & Screen Recorder Engine Pro
 * Permite grabar tanto la pantalla/pestaña completa (interfaz, perfil, controles y juego)
 * como el canvas aislado, con soporte para MP4/WebM a 60 FPS.
 */

class VideoRecorderEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.isRecording = false;
    this.activeStream = null;
    this.timerInterval = null;
    this.onCompleteCallback = null;
    this.onProgressCallback = null;
  }

  /**
   * Obtiene el formato de video óptimo soportado por el navegador
   */
  getOptimalMimeType() {
    const preferredTypes = [
      'video/mp4;codecs=avc1',
      'video/mp4',
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm'
    ];

    for (const type of preferredTypes) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return 'video/webm';
  }

  /**
   * Inicia la grabación de pantalla completa o pestaña (getDisplayMedia)
   */
  async startScreenRecording(options = {}, onProgress, onComplete) {
    if (this.isRecording) return;
    this.onProgressCallback = onProgress;
    this.onCompleteCallback = onComplete;

    try {
      const displayMediaOptions = {
        video: {
          displaySurface: 'browser',
          frameRate: { ideal: 60, max: 60 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
      this.activeStream = stream;

      // Si el usuario presiona el botón nativo "Dejar de compartir" del navegador
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          this.stopRecording();
        };
      }

      this.setupRecorder(stream, options);
    } catch (err) {
      console.warn('[VideoRecorder] Permiso de captura cancelado:', err);
      this.cleanup();
      if (onComplete) onComplete(err);
    }
  }

  /**
   * Clip de 8s del tablero con el usuario quemado en la imagen.
   */
  startBrandedClip(options = {}, onProgress, onComplete) {
    if (this.isRecording) return;
    const username = options.username || 'developer';
    const duration = options.duration || 8;
    const composite = document.createElement('canvas');
    composite.width = this.canvas.width;
    composite.height = this.canvas.height;
    const ctx = composite.getContext('2d');
    const paint = () => {
      ctx.drawImage(this.canvas, 0, 0);
      const label = `@${username}`;
      const brand = 'GITHUB_SNAKE.EXE';
      const fontSize = Math.max(22, Math.round(composite.width / 36));
      ctx.font = `700 ${fontSize}px ui-monospace, monospace`;
      const pad = Math.round(fontSize * 0.45);
      const textW = Math.max(ctx.measureText(label).width, ctx.measureText(brand).width);
      const boxW = textW + pad * 2;
      const boxH = Math.round(fontSize * 2.35);
      const x = composite.width - boxW - pad;
      const y = composite.height - boxH - pad;
      ctx.fillStyle = 'rgba(4, 8, 6, 0.88)';
      ctx.fillRect(x, y, boxW, boxH);
      ctx.fillStyle = '#00ff66';
      ctx.fillText(label, x + pad, y + fontSize);
      ctx.font = `600 ${Math.round(fontSize * 0.62)}px ui-monospace, monospace`;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(brand, x + pad, y + Math.round(fontSize * 1.75));
      if (this.isRecording) this._clipFrame = requestAnimationFrame(paint);
    };

    try {
      const stream = composite.captureStream(30);
      this.activeStream = stream;
      this._stopClipPaint = () => {
        if (this._clipFrame) cancelAnimationFrame(this._clipFrame);
        this._clipFrame = null;
      };
      this.onProgressCallback = onProgress;
      this.onCompleteCallback = onComplete;
      this.setupRecorder(stream, {
        duration,
        filenamePrefix: options.filenamePrefix || `github-snake-${username}-clip`
      });
      paint();
    } catch (err) {
      this.cleanup();
      if (onComplete) onComplete(err);
    }
  }

  /**
   * Inicia la grabación exclusiva del Canvas
   */
  startCanvasRecording(options = {}, onProgress, onComplete) {
    if (this.isRecording) return;
    this.onProgressCallback = onProgress;
    this.onCompleteCallback = onComplete;

    try {
      const stream = this.canvas.captureStream(60);
      this.activeStream = stream;
      this.setupRecorder(stream, options);
    } catch (err) {
      console.error('[VideoRecorder] Error al capturar canvas:', err);
      this.cleanup();
      if (onComplete) onComplete(err);
    }
  }

  /**
   * Configura e inicia MediaRecorder sobre el stream obtenido
   */
  setupRecorder(stream, options = {}) {
    const mimeType = this.getOptimalMimeType();
    const isMp4 = mimeType.includes('mp4');
    const extension = isMp4 ? 'mp4' : 'webm';
    const duration = options.duration || 10; // segundos (0 para manual)
    const filenamePrefix = options.filenamePrefix || 'github-snake-screen';

    this.mediaRecorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 8000000 // 8 Mbps para nitidez cristalina
    });

    this.recordedChunks = [];
    this.isRecording = true;

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        this.recordedChunks.push(e.data);
      }
    };

    this.mediaRecorder.onstop = () => {
      const blob = new Blob(this.recordedChunks, { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filenamePrefix}-${Date.now()}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      const savedChunks = this.recordedChunks.length;
      this.cleanup();
      if (this.onCompleteCallback) this.onCompleteCallback(null, { extension, count: savedChunks });
    };

    this.mediaRecorder.start(250); // Emitir chunks cada 250ms

    if (duration > 0) {
      let remaining = duration;
      if (this.onProgressCallback) this.onProgressCallback(remaining);

      this.timerInterval = setInterval(() => {
        remaining--;
        if (this.onProgressCallback) this.onProgressCallback(remaining);

        if (remaining <= 0) {
          this.stopRecording();
        }
      }, 1000);
    } else {
      if (this.onProgressCallback) this.onProgressCallback('REC');
    }
  }

  /**
   * Detiene la grabación activa
   */
  stopRecording() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch (e) {}
    }

    if (this.activeStream) {
      this.activeStream.getTracks().forEach(track => track.stop());
      this.activeStream = null;
    }
  }

  cleanup() {
    this.isRecording = false;
    if (this._stopClipPaint) this._stopClipPaint();
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.activeStream) {
      this.activeStream.getTracks().forEach(track => track.stop());
      this.activeStream = null;
    }
  }
}

window.VideoRecorderEngine = VideoRecorderEngine;

/**
 * HD Video Recorder Engine
 * Graba clips en alta definición directamente desde el canvas usando MediaRecorder API.
 */

class VideoRecorderEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.isRecording = false;
  }

  /**
   * Inicia la grabación de un clip de duración especificada
   * @param {number} durationSeconds - Duración en segundos (por defecto 8s)
   * @param {Function} onProgressCallback - Notificación de tiempo restante
   * @param {Function} onCompleteCallback - Callback al finalizar la descarga
   */
  startRecording(durationSeconds = 8, onProgressCallback, onCompleteCallback) {
    if (this.isRecording) return;

    try {
      const stream = this.canvas.captureStream(60); // 60 FPS stream
      const options = { mimeType: 'video/webm;codecs=vp9' };

      // Fallback de codecs si vp9 no está soportado en el navegador
      let mimeType = 'video/webm;codecs=vp9';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : 'video/mp4';
      }

      this.mediaRecorder = new MediaRecorder(stream, { mimeType });
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
        a.download = `github-snake-capture-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.isRecording = false;
        if (onCompleteCallback) onCompleteCallback();
      };

      this.mediaRecorder.start();

      let remaining = durationSeconds;
      if (onProgressCallback) onProgressCallback(remaining);

      const interval = setInterval(() => {
        remaining--;
        if (onProgressCallback) onProgressCallback(remaining);

        if (remaining <= 0) {
          clearInterval(interval);
          if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
          }
        }
      }, 1000);

    } catch (err) {
      console.error('[VideoRecorder] Error al grabar:', err);
      this.isRecording = false;
      if (onCompleteCallback) onCompleteCallback(err);
    }
  }
}

window.VideoRecorderEngine = VideoRecorderEngine;

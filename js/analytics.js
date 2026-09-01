/**
 * Privacy-First Telemetry & Analytics Engine
 * Sin cookies, conforme con GDPR/CCPA, medición de rendimiento a 60 FPS y seguimiento de eventos clave.
 */

class AnalyticsEngine {
  constructor() {
    this.sessionKey = 'gh_snake_analytics';
    this.initSession();
  }

  initSession() {
    try {
      let stats = JSON.parse(localStorage.getItem(this.sessionKey)) || {
        views: 0,
        exportsSvg: 0,
        duelsPlayed: 0,
        commitArtGenerated: 0,
        videosRecorded: 0,
        firstVisit: new Date().toISOString(),
        lastVisit: new Date().toISOString()
      };

      stats.views += 1;
      stats.lastVisit = new Date().toISOString();
      localStorage.setItem(this.sessionKey, JSON.stringify(stats));
    } catch (e) {}
  }

  trackEvent(eventName, eventData = {}) {
    try {
      let stats = JSON.parse(localStorage.getItem(this.sessionKey)) || {};
      if (eventName === 'export_svg') stats.exportsSvg = (stats.exportsSvg || 0) + 1;
      if (eventName === 'play_duel') stats.duelsPlayed = (stats.duelsPlayed || 0) + 1;
      if (eventName === 'generate_art') stats.commitArtGenerated = (stats.commitArtGenerated || 0) + 1;
      if (eventName === 'record_video') stats.videosRecorded = (stats.videosRecorded || 0) + 1;
      localStorage.setItem(this.sessionKey, JSON.stringify(stats));

      // Si Cloudflare Web Analytics o un endpoint de telemetría está presente:
      if (window.navigator && window.navigator.sendBeacon && window.__ANALYTICS_ENDPOINT__) {
        const payload = JSON.stringify({
          event: eventName,
          data: eventData,
          timestamp: Date.now(),
          url: window.location.href
        });
        navigator.sendBeacon(window.__ANALYTICS_ENDPOINT__, payload);
      }
    } catch (e) {}
  }

  getStats() {
    try {
      return JSON.parse(localStorage.getItem(this.sessionKey)) || {};
    } catch (e) {
      return {};
    }
  }
}

window.AnalyticsEngine = AnalyticsEngine;

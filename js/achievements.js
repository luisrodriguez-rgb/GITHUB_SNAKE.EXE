/**
 * Achievements & Medals System
 * Gestiona el desbloqueo de logros y notificaciones Toast en pantalla.
 */

class AchievementsEngine {
  constructor() {
    this.achievements = {
      first_bite: { id: 'first_bite', title: 'Primer Bocado', desc: 'Devora tu primer commit de la matriz.', unlocked: false },
      hunter_50: { id: 'hunter_50', title: 'Cazador de Commits', desc: 'Devora 50 commits en una sola sesion.', unlocked: false },
      manual_pilot: { id: 'manual_pilot', title: 'Piloto Manual', desc: 'Toma el control directo con las teclas WASD o flechas.', unlocked: false },
      profile_hacker: { id: 'profile_hacker', title: 'Explorador de Perfiles', desc: 'Carga y analiza 3 perfiles de desarrolladores.', unlocked: false },
      clean_sweep: { id: 'clean_sweep', title: 'Matriz Purificada', desc: 'Devora el 100% de los commits de un perfil.', unlocked: false },
      cinematographer: { id: 'cinematographer', title: 'Director de Cine', desc: 'Graba y descarga un clip de video HD en WebM.', unlocked: false },
      artist: { id: 'artist', title: 'Artista de Contribuciones', desc: 'Usa el modo pintar o carga una plantilla de Commit Art.', unlocked: false }
    };

    this.profilesLoaded = new Set();
    this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const saved = localStorage.getItem('gh_snake_achievements');
      if (saved) {
        const parsed = JSON.parse(saved);
        Object.keys(parsed).forEach(k => {
          if (this.achievements[k]) this.achievements[k].unlocked = parsed[k];
        });
      }
    } catch (e) {}
  }

  saveToStorage() {
    try {
      const state = {};
      Object.keys(this.achievements).forEach(k => {
        state[k] = this.achievements[k].unlocked;
      });
      localStorage.setItem('gh_snake_achievements', JSON.stringify(state));
    } catch (e) {}
  }

  unlock(id, onNotification) {
    const ach = this.achievements[id];
    if (ach && !ach.unlocked) {
      ach.unlocked = true;
      this.saveToStorage();
      if (onNotification) {
        onNotification(ach);
      }
    }
  }

  getUnlockedCount() {
    return Object.values(this.achievements).filter(a => a.unlocked).length;
  }

  getTotalCount() {
    return Object.keys(this.achievements).length;
  }
}

window.AchievementsEngine = AchievementsEngine;

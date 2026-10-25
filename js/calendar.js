/**
 * Contribution Calendar Geometry
 * Replica la cuadrícula de GitHub: 53 columnas (semanas que empiezan en domingo) x 7 filas,
 * con la semana actual en la última columna. Todas las fechas se calculan en hora local.
 */

const ContributionCalendar = {
  cols: 53,
  rows: 7,

  /** Fecha local del domingo de la primera columna */
  firstDay(now = new Date()) {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() - (this.cols - 1) * 7);
  },

  /** Date local de la celda (col, row) */
  dateForCell(col, row, now = new Date()) {
    const first = this.firstDay(now);
    return new Date(first.getFullYear(), first.getMonth(), first.getDate() + col * 7 + row);
  },

  /** 'YYYY-MM-DD' de la celda (col, row) */
  isoForCell(col, row, now = new Date()) {
    return this.formatIso(this.dateForCell(col, row, now));
  },

  /** true si la celda cae después de hoy (GitHub no la muestra) */
  isFuture(col, row, now = new Date()) {
    return col === this.cols - 1 && row > now.getDay();
  },

  formatIso(date) {
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${m}-${d}`;
  }
};

window.ContributionCalendar = ContributionCalendar;

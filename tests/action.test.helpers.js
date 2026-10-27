// Calendario GraphQL denso (todas las celdas con actividad): el peor caso para el espacio de los videos y SVG
const LEVEL_NAMES = ['NONE', 'FIRST_QUARTILE', 'SECOND_QUARTILE', 'THIRD_QUARTILE', 'FOURTH_QUARTILE'];

function denseWeeks() {
  const weeks = [];
  for (let w = 0; w < 53; w++) {
    weeks.push({
      contributionDays: Array.from({ length: 7 }, (_, d) => ({
        date: new Date(Date.UTC(2025, 9, 26 + w * 7 + d)).toISOString().slice(0, 10),
        weekday: d,
        contributionCount: 1 + ((w + d) % 9),
        contributionLevel: LEVEL_NAMES[1 + ((w * 7 + d) % 4)]
      }))
    });
  }
  return weeks;
}

module.exports = { denseWeeks };

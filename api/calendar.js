// Función serverless de Vercel: /api/calendar/<usuario>.json (ver vercel.json y server/calendar.js)
module.exports = require('../server/calendar').handler;

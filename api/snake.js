// Función serverless de Vercel: /api/<usuario>.svg (ver vercel.json y server/snake-svg.js)
module.exports = require('../server/snake-svg').handler;

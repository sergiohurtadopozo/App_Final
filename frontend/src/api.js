// src/api.js
const API_URL = process.env.NODE_ENV === 'production'
  ? ''            // en producción sacamos el host para que sea relativo
  : 'http://localhost:3000';
export default API_URL;

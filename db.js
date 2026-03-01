const { Pool } = require('pg');

// Forzamos a que use la variable de Render si existe
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ ERROR: No se encontró la variable DATABASE_URL en Render.");
}

const pool = new Pool({
  connectionString: connectionString,
  // En Render (siempre que haya connectionString), el SSL es OBLIGATORIO
  ssl: connectionString ? { rejectUnauthorized: false } : false
});

pool.on('connect', () => {
  console.log('✅ Conexión exitosa a la base de datos de Render');
});

pool.on('error', (err) => {
  // Aquí es donde salía tu error antes
  console.error('❌ ERROR DE CONEXIÓN CRÍTICO:', err.message);
});

module.exports = pool;
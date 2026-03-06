const { Pool } = require('pg');

const pool = new Pool({
    user: 'farmacell',
    host: 'postgresql-farmacell.alwaysdata.net',
    database: 'farmacell_db',
    password: 'Casita.21!', // <--- LA CLAVE QUE PUSISTE AL INSTALAR
    port: 5432,
});

// Prueba de conexión inmediata
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ ERROR DE CONEXIÓN: Revisa si la clave "farmacell" es correcta.');
    } else {
        console.log('✅ CONEXIÓN EXITOSA: Base de Datos Farmacell vinculada.');
    }
});

module.exports = pool;
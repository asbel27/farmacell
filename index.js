const express = require('express');
const cors = require('cors');
const pool = require('./db'); // Importamos la conexión que haremos abajo
const app = express();

app.use(cors());
app.use(express.json());

// Health Check para Render
app.get('/status', (req, res) => res.send('Servidor Farmacell Operativo ✅'));

// --- TUS RUTAS (Ejemplo) ---
app.get('/inventario', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM inventario');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CONFIGURACIÓN DE PUERTO PARA RENDER
const PORT = process.env.PORT || 9000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
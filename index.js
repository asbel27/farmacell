const express = require('express');

const app = express();
const cors = require('cors');
app.use(cors({
    origin: 'http://farmacell.alwaysdata.net',
    credentials: true
}));
// --- MIDDLEWARES ---

app.use(express.json());

// --- IMPORTACIÓN DE RUTAS MODULARES ---
// Asegúrate de que las rutas apunten bien a la carpeta ./routes
const usuariosRoutes = require('./routes/usuarios');
const inventarioRoutes = require('./routes/inventario');
const analiticaRoutes = require('./routes/analitica');
const reparacionesRoutes = require('./routes/reparaciones');

// --- CONFIGURACIÓN DE RUTAS ---
app.use('/auth', usuariosRoutes);      
app.use('/usuarios', usuariosRoutes);  
app.use('/inventario', inventarioRoutes);
app.use('/reparaciones', reparacionesRoutes);
app.use('/analitica', analiticaRoutes); 

// --- RUTA DE SALUD DEL SERVIDOR ---
app.get('/', (req, res) => {
    res.send("Servidor Farmacell Operativo ✅");
});

// --- LANZAMIENTO (CORREGIDO PARA ALWAYSDATA) ---
// 1. Usamos process.env.PORT para que Alwaysdata asigne su puerto interno
// 2. Usamos el Host 0.0.0.0 para que sea visible desde el exterior
const PORT = process.env.PORT || 9000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
    console.log(`==========================================`);
    console.log(`🚀 FARMACELL SERVER RUNNING ON PORT ${PORT}`);
    console.log(`🏠 HOST: ${HOST}`);
    console.log(`==========================================`);
});
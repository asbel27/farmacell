const express = require('express');
const cors = require('cors');
const app = express();

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());

// --- IMPORTACIÓN DE RUTAS MODULARES ---
const usuariosRoutes = require('./routes/usuarios');
const inventarioRoutes = require('./routes/inventario');
const analiticaRoutes = require('./routes/analitica');

// ... donde están tus otros require
const reparacionesRoutes = require('./routes/reparaciones');

// ... debajo de app.use('/inventario'...)
app.use('/reparaciones', reparacionesRoutes);

// --- CONFIGURACIÓN DE RUTAS ---
// Nota: 'usuariosRoutes' maneja tanto /auth como /usuarios
app.use('/auth', usuariosRoutes);      
app.use('/usuarios', usuariosRoutes);  
app.use('/inventario', inventarioRoutes);
app.use('/analitica', analiticaRoutes); // <--- Esta es la que activa el Big Data y Resumen

// --- RUTA DE SALUD DEL SERVIDOR ---
app.get('/', (req, res) => {
    res.send("Servidor Farmacell Operativo ✅");
});

// --- LANZAMIENTO ---
const PORT = 9000;
app.listen(PORT, () => {
    console.log(`==========================================`);
    console.log(`🚀 FARMACELL SERVER RUNNING ON PORT ${PORT}`);
    console.log(`==========================================`);
});
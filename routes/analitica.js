const express = require('express');
const router = express.Router();
const pool = require('../db');

// --- DASHBOARD DE INTELIGENCIA (BIG DATA) ---
// Ruta: GET http://localhost:9000/analitica/dashboard
router.get('/dashboard', async (req, res) => {
    try {
        // Consulta 1: Términos que los talleres buscan y NO hay en stock
        // Agrupamos por término y contamos cuántas veces se ha buscado
        const busquedasResult = await pool.query(`
            SELECT termino_buscado, COUNT(*) as cantidad 
            FROM busquedas_insatisfechas 
            GROUP BY termino_buscado 
            ORDER BY cantidad DESC 
            LIMIT 10
        `);

        // Consulta 2: Estadísticas de inventario bajo (opcional pero útil)
        const stockBajoResult = await pool.query(`
            SELECT marca, modelo, stock 
            FROM inventario 
            WHERE stock < 5 
            ORDER BY stock ASC
        `);

        // Enviamos todo en un solo objeto JSON
        res.json({
            compras_sugeridas: busquedasResult.rows,
            alertas_stock: stockBajoResult.rows
        });

    } catch (err) {
        console.error("Error en el módulo de analítica:", err.message);
        res.status(500).json({ error: "Error al procesar Big Data" });
    }
});

// --- REGISTRAR BÚSQUEDA FALLIDA ---
// Esta ruta se dispara automáticamente desde el Catálogo cuando no hay resultados
// Ruta: POST http://localhost:9000/analitica/registrar-busqueda
router.post('/registrar-busqueda', async (req, res) => {
    const { termino } = req.body;

    // Evitamos registrar términos vacíos o muy cortos
    if (!termino || termino.trim().length < 3) {
        return res.status(400).json({ m: "Término muy corto para análisis" });
    }

    try {
        await pool.query(
            "INSERT INTO busquedas_insatisfechas (termino_buscado) VALUES ($1)", 
            [termino.toLowerCase().trim()]
        );
        res.json({ m: "Búsqueda capturada con éxito" });
    } catch (err) {
        console.error("Error al registrar búsqueda:", err.message);
        res.status(500).json({ error: "Error en base de datos" });
    }
});

// --- LIMPIAR DATOS DE DEMANDA (Opcional, para el administrador) ---
router.delete('/limpiar-demanda', async (req, res) => {
    try {
        await pool.query("DELETE FROM busquedas_insatisfechas");
        res.json({ m: "Historial de demanda reiniciado" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ELIMINAR UN TÉRMINO ESPECÍFICO DE DEMANDA
router.delete('/demanda/:termino', async (req, res) => {
    try {
        const { termino } = req.params;
        await pool.query("DELETE FROM busquedas_insatisfechas WHERE termino_buscado = $1", [termino]);
        res.json({ m: "Demanda eliminada" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;
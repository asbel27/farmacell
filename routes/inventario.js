const express = require('express');
const router = express.Router();
const pool = require('../db');

// --- 1. RUTA DE NOTIFICACIONES UNIFICADAS (EFECTO FACEBOOK) ---
// Esta ruta alimenta la campanita del Administrador
router.get('/alertas/todas', async (req, res) => {
    try {
        // Consulta A: Stock Bajo (Insumos/Equipos que se agotan)
        const stockRes = await pool.query(
            "SELECT id, modelo as item, 'Stock Bajo' as tipo, stock FROM inventario WHERE stock <= 3"
        );
        
        // Consulta B: Equipos Listos (Para entregar al cliente)
        const reparacionesRes = await pool.query(
            "SELECT id, cliente as item, 'Equipo Listo' as tipo FROM reparaciones WHERE estado = 'Listo'"
        );
        
        // Combinamos ambos resultados en un solo flujo de notificaciones
        const todas = [
            ...stockRes.rows.map(s => ({ ...s, mensaje: `Quedan solo ${s.stock} unidades` })),
            ...reparacionesRes.rows.map(r => ({ ...r, mensaje: 'Pendiente por entregar' }))
        ];
        
        res.json(todas);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener notificaciones" });
    }
});

// --- 2. VALOR TOTAL DEL INVENTARIO (PARA EL DASHBOARD) ---
router.get('/valor-total', async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT SUM(stock * precio) as valor_total FROM inventario"
        );
        res.json({ valor_total: result.rows[0].valor_total || 0 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 3. CRUD DE INVENTARIO ---

// Obtener todos los productos
router.get('/', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM inventario ORDER BY id DESC");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Crear nuevo equipo/repuesto
router.post('/', async (req, res) => {
    try {
        const { marca, modelo, imei, stock, precio } = req.body;
        const result = await pool.query(
            "INSERT INTO inventario (marca, modelo, imei, stock, precio) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [marca, modelo, imei, stock, precio]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Actualizar stock o detalles
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { marca, modelo, imei, stock, precio } = req.body;
        await pool.query(
            "UPDATE inventario SET marca=$1, modelo=$2, imei=$3, stock=$4, precio=$5 WHERE id=$6",
            [marca, modelo, imei, stock, precio, id]
        );
        res.json({ m: "Actualizado correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Eliminar del inventario
router.delete('/:id', async (req, res) => {
    try {
        await pool.query("DELETE FROM inventario WHERE id = $1", [req.params.id]);
        res.json({ m: "Eliminado" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
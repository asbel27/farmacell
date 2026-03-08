const express = require('express');
const router = express.Router();
const pool = require('../db');

// 1. LISTAR (Agregamos comillas a la tabla por si acaso)
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM "reparaciones" ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        console.error("ERROR EN GET REPARACIONES:", err.message); // Esto saldrá en los logs de Render
        res.status(500).json({ error: err.message });
    }
});

// 2. GUARDAR (POST)
router.post('/', async (req, res) => {
    try {
        const { cliente, marca, modelo, falla, presupuesto, abono } = req.body;
        // IMPORTANTE: Verifica que 'tecnico_id' y 'estado' existan en tu tabla
        const result = await pool.query(
            'INSERT INTO "reparaciones" (cliente, marca, modelo, falla, presupuesto, abono, tecnico_id, estado) VALUES ($1, $2, $3, $4, $5, $6, 15, \'Pendiente\') RETURNING *',
            [cliente, marca, modelo, falla, presupuesto, abono]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("ERROR EN POST REPARACIONES:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// 3. ACTUALIZAR (PUT)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { cliente, marca, modelo, falla, presupuesto, abono } = req.body;
        const result = await pool.query(
            'UPDATE "reparaciones" SET cliente=$1, marca=$2, modelo=$3, falla=$4, presupuesto=$5, abono=$6 WHERE id=$7 RETURNING *',
            [cliente, marca, modelo, falla, presupuesto, abono, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error("ERROR EN PUT REPARACIONES:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// 4. ELIMINAR (DELETE)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM "reparaciones" WHERE id = $1', [id]);
        res.json({ message: "Registro eliminado correctamente" });
    } catch (err) {
        console.error("ERROR EN DELETE REPARACIONES:", err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
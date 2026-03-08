const express = require('express');
const router = express.Router();
const pool = require('../db');

// 1. LISTAR (GET)
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM "reparaciones" ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. GUARDAR NUEVA ORDEN (POST) - TOTALMENTE CORREGIDO
router.post('/', async (req, res) => {
    try {
        // Extraemos los datos del cuerpo de la petición
        const { cliente, telefono, marca, modelo, falla, presupuesto, abono } = req.body;

        console.log("Intentando guardar nueva orden:", req.body);

        // IMPORTANTE: Eliminamos 'tecnico_id' de la consulta si no estamos seguros de que existe el ID 15
        // Dejamos que la base de datos use los valores por defecto para tecnico_id o lo ponemos como NULL
        const query = `
            INSERT INTO "reparaciones" 
            (cliente, telefono, marca, modelo, falla, presupuesto, abono, estado) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
            RETURNING *`;
        
        const values = [
            cliente, 
            telefono || 'Sin teléfono', 
            marca, 
            modelo, 
            falla, 
            presupuesto || 0, 
            abono || 0, 
            'Pendiente' // Estado inicial por defecto
        ];

        const result = await pool.query(query, values);
        console.log("✅ Orden creada con éxito:", result.rows[0]);
        res.status(201).json(result.rows[0]);

    } catch (err) {
        console.error("❌ ERROR AL CREAR ORDEN:", err.message);
        // Si el error dice "violates foreign key constraint", el problema es una columna vinculada (como tecnico_id)
        res.status(500).json({ error: "Error en el servidor: " + err.message });
    }
});

// 3. ACTUALIZAR (PUT)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { cliente, telefono, marca, modelo, falla, presupuesto, abono, estado } = req.body;
        const result = await pool.query(
            `UPDATE "reparaciones" 
             SET cliente=$1, telefono=$2, marca=$3, modelo=$4, falla=$5, presupuesto=$6, abono=$7, estado=$8 
             WHERE id=$9 RETURNING *`,
            [cliente, telefono, marca, modelo, falla, presupuesto, abono, estado, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. ELIMINAR (DELETE)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM "reparaciones" WHERE id = $1', [id]);
        res.json({ message: "Eliminado" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
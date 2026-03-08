const express = require('express');
const router = express.Router();
const pool = require('../db');

// 1. LISTAR (GET)
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM "reparaciones" ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        console.error("❌ ERROR EN GET REPARACIONES:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// 2. GUARDAR (POST) - AGREGADO CAMPO TELEFONO
router.post('/', async (req, res) => {
    try {
        const { cliente, telefono, marca, modelo, falla, presupuesto, abono, tecnico_id, estado } = req.body;
        
        const query = `
            INSERT INTO "reparaciones" 
            (cliente, telefono, marca, modelo, falla, presupuesto, abono, tecnico_id, estado) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
            RETURNING *`;
        
        const values = [
            cliente, 
            telefono, // <--- Nuevo campo
            marca, 
            modelo, 
            falla, 
            presupuesto || 0, 
            abono || 0, 
            tecnico_id || 1, 
            estado || 'Pendiente'
        ];

        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("❌ ERROR EN POST REPARACIONES:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// 3. ACTUALIZAR (PUT) - AGREGADO CAMPO TELEFONO
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { cliente, telefono, marca, modelo, falla, presupuesto, abono, estado, tecnico_id } = req.body;

        console.log(`Actualizando ID: ${id} con teléfono: ${telefono}`);

        const query = `
            UPDATE "reparaciones" 
            SET cliente = $1, 
                telefono = $2,  -- <--- Actualizamos el teléfono
                marca = $3, 
                modelo = $4, 
                falla = $5, 
                presupuesto = $6, 
                abono = $7, 
                estado = $8,
                tecnico_id = $9
            WHERE id = $10 
            RETURNING *`;

        const values = [
            cliente, 
            telefono, 
            marca, 
            modelo, 
            falla, 
            presupuesto, 
            abono, 
            estado, 
            tecnico_id || 1,
            id
        ];

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "No se encontró el registro" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error("❌ ERROR EN EL PUT (TELEFONO):", err.message);
        res.status(500).json({ error: err.message });
    }
});

// 4. ELIMINAR (DELETE)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM "reparaciones" WHERE id = $1', [id]);
        res.json({ message: "Registro eliminado" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
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
        res.status(500).json({ error: "Error al obtener los datos: " + err.message });
    }
});

// 2. GUARDAR (POST)
router.post('/', async (req, res) => {
    try {
        const { cliente, marca, modelo, falla, presupuesto, abono, tecnico_id, estado } = req.body;
        
        // Usamos valores por defecto si vienen vacíos
        const query = `
            INSERT INTO "reparaciones" 
            (cliente, marca, modelo, falla, presupuesto, abono, tecnico_id, estado) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
            RETURNING *`;
        
        const values = [
            cliente, 
            marca, 
            modelo, 
            falla, 
            presupuesto || 0, 
            abono || 0, 
            tecnico_id || 1, // ID de técnico por defecto
            estado || 'Pendiente'
        ];

        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("❌ ERROR EN POST REPARACIONES:", err.message);
        res.status(500).json({ error: "No se pudo guardar: " + err.message });
    }
});

// 3. ACTUALIZAR (PUT) - TOTALMENTE ARREGLADO
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { cliente, marca, modelo, falla, presupuesto, abono, estado, tecnico_id } = req.body;

        // Log para ver en Render qué ID y qué datos están llegando
        console.log(`Updating record ID: ${id}`, req.body);

        const query = `
            UPDATE "reparaciones" 
            SET cliente = $1, 
                marca = $2, 
                modelo = $3, 
                falla = $4, 
                presupuesto = $5, 
                abono = $6, 
                estado = $7,
                tecnico_id = $8
            WHERE id = $9 
            RETURNING *`;

        const values = [
            cliente, 
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
            return res.status(404).json({ error: "No se encontró el registro con ID " + id });
        }

        console.log("✅ Registro actualizado con éxito");
        res.json(result.rows[0]);
    } catch (err) {
        console.error("❌ ERROR EN EL PUT (ACTUALIZAR):", err.message);
        res.status(500).json({ error: "Error en el servidor: " + err.message });
    }
});

// 4. ELIMINAR (DELETE)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM "reparaciones" WHERE id = $1', [id]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "El registro no existe" });
        }
        
        res.json({ message: "Registro eliminado correctamente" });
    } catch (err) {
        console.error("❌ ERROR EN DELETE REPARACIONES:", err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
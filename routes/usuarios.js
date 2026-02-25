const express = require('express');
const router = express.Router();
const pool = require('../db');

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await pool.query("SELECT * FROM usuarios WHERE email = $1 AND password = $2", [email, password]);
        if (result.rows.length > 0) {
            res.json({ autenticado: true, usuario: result.rows[0] });
        } else {
            res.status(401).json({ autenticado: false });
        }
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// OBTENER TODOS LOS USUARIOS
router.get('/', async (req, res) => {
    try {
        const resu = await pool.query("SELECT * FROM usuarios ORDER BY id ASC");
        res.json(resu.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// CREAR NUEVO USUARIO
router.post('/', async (req, res) => {
    try {
        const { nombre, email, password, rol } = req.body;
        await pool.query(
            "INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4)",
            [nombre, email, password, rol || 'taller']
        );
        res.json({ m: "ok" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// EDITAR USUARIO (SOLUCIÓN AL ERROR DE EDICIÓN)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params; // Capturamos el ID de la URL
        const { nombre, email, password, rol } = req.body;
        
        const resultado = await pool.query(
            "UPDATE usuarios SET nombre=$1, email=$2, password=$3, rol=$4 WHERE id=$5",
            [nombre, email, password, rol, id]
        );

        if (resultado.rowCount > 0) {
            res.json({ m: "Usuario actualizado" });
        } else {
            res.status(404).json({ error: "No se encontró el usuario" });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Error interno al editar" });
    }
});

// ELIMINAR USUARIO
router.delete('/:id', async (req, res) => {
    try {
        await pool.query("DELETE FROM usuarios WHERE id = $1", [req.params.id]);
        res.json({ m: "ok" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
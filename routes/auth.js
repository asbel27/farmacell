const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await pool.query("SELECT * FROM usuarios WHERE LOWER(TRIM(email)) = $1", [email.trim().toLowerCase()]);
        if (result.rows.length > 0) {
            const user = result.rows[0];
            if (user.password.trim() === password.trim()) {
                return res.json({ 
                    autenticado: true, 
                    usuario: { id: user.id, nombre: user.nombre.trim(), rol: user.rol.trim() } 
                });
            }
        }
        res.status(401).json({ autenticado: false });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
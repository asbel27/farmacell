import React, { useState, useEffect } from 'react';
import { Box, TextField, Grid, Card, CardContent, Typography, Chip, InputAdornment } from '@mui/material';
import { Search as SearchIcon, SentimentDissatisfied, InfoOutlined } from '@mui/icons-material';
import axios from 'axios';

const CatalogoTienda = ({ productos, user }) => { // <--- Recibe el usuario actual
    const [busqueda, setBusqueda] = useState('');
    const [filtrados, setFiltrados] = useState(productos);

    useEffect(() => {
        const results = productos.filter(p =>
            p.marca.toLowerCase().includes(busqueda.toLowerCase()) ||
            p.modelo.toLowerCase().includes(busqueda.toLowerCase())
        );
        setFiltrados(results);

        // --- LÓGICA DE BIG DATA (Solo para Taller) ---
        // Si el usuario es ADMIN, NO registramos la búsqueda fallida
        if (user?.rol === 'taller' && busqueda.length > 3 && results.length === 0) {
            const registrarFallo = async () => {
                try {
                    await axios.post('http://localhost:9000/analitica/registrar-busqueda', { 
                        termino: busqueda 
                    });
                } catch (err) { console.error("Error al registrar demanda"); }
            };
            
            const timer = setTimeout(registrarFallo, 1000);
            return () => clearTimeout(timer);
        }
    }, [busqueda, productos, user]);

    return (
        <Box>
            <TextField
                fullWidth
                placeholder="Busca marca o modelo de equipo..."
                variant="outlined"
                sx={{ mb: 4, bgcolor: 'white', borderRadius: 2 }}
                onChange={(e) => setBusqueda(e.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon color="primary" />
                        </InputAdornment>
                    ),
                }}
            />

            {filtrados.length > 0 ? (
                <Grid container spacing={3}>
                    {filtrados.map((p) => (
                        <Grid item xs={12} sm={6} md={4} key={p.id}>
                            <Card sx={{ borderRadius: 3, boxShadow: 3, borderTop: '4px solid #1a237e' }}>
                                <CardContent>
                                    <Typography variant="h6" fontWeight="bold">{p.marca}</Typography>
                                    <Typography color="textSecondary">{p.modelo}</Typography>
                                    <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
                                        <Chip 
                                            label={p.stock > 0 ? `Stock: ${p.stock}` : "Agotado"} 
                                            color={p.stock > 0 ? "success" : "error"} 
                                        />
                                        <Typography variant="h6" color="primary">${p.precio}</Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Box textAlign="center" mt={5} p={4} sx={{ bgcolor: '#fff', borderRadius: 4 }}>
                    <SentimentDissatisfied sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
                    <Typography variant="h6" color="textSecondary">
                        No se encontraron resultados para "{busqueda}"
                    </Typography>
                    
                    {/* MENSAJE CONDICIONAL: Solo el taller ve el aviso de "avisaremos al admin" */}
                    {user?.rol === 'taller' ? (
                        <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                            Hemos registrado esta falta de stock para reponer lo antes posible.
                        </Typography>
                    ) : (
                        <Typography variant="body2" color="secondary" sx={{ mt: 1, fontWeight: 'bold' }}>
                            <InfoOutlined fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                            Modo Administrador: Esta búsqueda no genera reportes de demanda.
                        </Typography>
                    )}
                </Box>
            )}
        </Box>
    );
};

export default CatalogoTienda;
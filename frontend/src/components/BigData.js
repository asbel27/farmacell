import React, { useEffect, useState } from 'react';
import { 
    Box, Typography, Grid, Card, CardContent, List, ListItem, 
    ListItemText, Chip, Divider, IconButton, Paper, ListItemIcon // <--- ¡Añadido ListItemIcon aquí!
} from '@mui/material';
import { 
    ShoppingCart, Assessment, Delete as DeleteIcon, 
    WarningAmber as WarningIcon, Inventory as InventoryIcon 
} from '@mui/icons-material';
import axios from 'axios';
import Swal from 'sweetalert2';

const BigData = () => {
    const [stats, setStats] = useState({ compras_sugeridas: [], alertas_stock: [] });

    const fetchStats = async () => {
        try {
            const [resDash, resAlertas] = await Promise.all([
                axios.get('http://localhost:9000/analitica/dashboard'),
                axios.get('http://localhost:9000/inventario/alertas/stock-bajo')
            ]);

            setStats({
                compras_sugeridas: resDash.data.compras_sugeridas || [],
                alertas_stock: resAlertas.data || []
            });
        } catch (err) {
            console.error("Error en Analítica:", err);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const eliminarDemanda = async (termino) => {
        const result = await Swal.fire({
            title: `¿Eliminar "${termino}"?`,
            text: "Se borrará el registro de demanda para este producto.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`http://localhost:9000/analitica/demanda/${termino}`);
                Swal.fire('Eliminado', 'Registro de demanda limpiado.', 'success');
                fetchStats();
            } catch (err) {
                Swal.fire('Error', 'No se pudo eliminar.', 'error');
            }
        }
    };

    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom color="primary" sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Assessment fontSize="large" /> Inteligencia Farmacell
            </Typography>

            <Grid container spacing={3}>
                
                {/* COLUMNA 1: DEMANDA (BÚSQUEDAS) */}
                <Grid item xs={12} md={7}>
                    <Card elevation={4} sx={{ borderRadius: 4, borderTop: '6px solid #d32f2f' }}>
                        <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="h6" color="error" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <ShoppingCart /> Demanda Insatisfecha
                                </Typography>
                                <Chip label="Top Buscados" color="error" size="small" variant="outlined" />
                            </Box>
                            <Divider />
                            <List>
                                {stats.compras_sugeridas?.length > 0 ? (
                                    stats.compras_sugeridas.map((item, i) => (
                                        <ListItem 
                                            key={i} 
                                            divider={i !== stats.compras_sugeridas.length - 1}
                                            secondaryAction={
                                                <IconButton edge="end" color="error" onClick={() => eliminarDemanda(item.termino_buscado)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            }
                                        >
                                            <ListItemText 
                                                primary={<Typography variant="subtitle1" fontWeight="bold">{item.termino_buscado.toUpperCase()}</Typography>} 
                                                secondary={`Solicitado ${item.cantidad} veces por técnicos/clientes`} 
                                            />
                                        </ListItem>
                                    ))
                                ) : (
                                    <Box p={4} textAlign="center">
                                        <Typography color="textSecondary">No hay registros de demanda nueva</Typography>
                                    </Box>
                                )}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                {/* COLUMNA 2: STOCK CRÍTICO */}
                <Grid item xs={12} md={5}>
                    <Card elevation={4} sx={{ borderRadius: 4, borderTop: '6px solid #ff9800' }}>
                        <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="h6" sx={{ color: '#ef6c00', display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <WarningIcon /> Stock Crítico
                                </Typography>
                                <Chip label="≤ 3 unidades" sx={{ bgcolor: '#fff3e0', color: '#e65100', fontWeight: 'bold' }} size="small" />
                            </Box>
                            <Divider />
                            <List>
                                {stats.alertas_stock?.length > 0 ? (
                                    stats.alertas_stock.map((item, i) => (
                                        <ListItem key={i} divider={i !== stats.alertas_stock.length - 1}>
                                            <ListItemIcon>
                                                <InventoryIcon color="warning" />
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary={`${item.marca} ${item.modelo}`} 
                                                secondary={
                                                    <Typography variant="body2" color="error" fontWeight="bold">
                                                        Quedan solo: {item.stock}
                                                    </Typography>
                                                } 
                                            />
                                        </ListItem>
                                    ))
                                ) : (
                                    <Box p={4} textAlign="center">
                                        <Typography color="textSecondary">Todo el stock está por encima del límite</Typography>
                                    </Box>
                                )}
                            </List>
                        </CardContent>
                    </Card>

                    <Paper sx={{ mt: 3, p: 2, bgcolor: '#e3f2fd', borderRadius: 3, borderLeft: '5px solid #2196f3' }}>
                        <Typography variant="caption" color="primary" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            💡 TIP DE GESTIÓN
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Utiliza la "Demanda Insatisfecha" para decidir tus próximas compras de repuestos y evitar perder ventas en el taller.
                        </Typography>
                    </Paper>
                </Grid>

            </Grid>
        </Box>
    );
};

export default BigData;
import React, { useState, useEffect, useMemo } from 'react';
import { useReparaciones } from '../hooks/useReparaciones';
import { 
    Box, Typography, Paper, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Button, Dialog, 
    DialogTitle, DialogContent, TextField, Grid, IconButton, MenuItem, Tooltip 
} from '@mui/material';
import { 
    Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, 
    Search as SearchIcon, WhatsApp as WhatsAppIcon 
} from '@mui/icons-material';
import Swal from 'sweetalert2';

const Reparaciones = ({ user }) => {
    const { reparaciones, listarReparaciones, crearReparacion, actualizarReparacion, eliminarReparacion } = useReparaciones();
    const [open, setOpen] = useState(false);
    const [busqueda, setBusqueda] = useState('');
    const [form, setForm] = useState({ 
        id: null, cliente: '', telefono: '', marca: '', modelo: '', 
        falla: '', presupuesto: '', abono: '', estado: 'Pendiente' 
    });

    useEffect(() => { listarReparaciones(); }, [listarReparaciones]);

    const reparacionesFiltradas = useMemo(() => {
        return reparaciones.filter(r => 
            r.cliente?.toLowerCase().includes(busqueda.toLowerCase()) ||
            r.modelo?.toLowerCase().includes(busqueda.toLowerCase()) ||
            r.telefono?.includes(busqueda)
        );
    }, [reparaciones, busqueda]);

    // --- FUNCIÓN PARA ENVIAR WHATSAPP ---
    const enviarWhatsApp = (r) => {
        const saldo = (Number(r.presupuesto) || 0) - (Number(r.abono) || 0);
        const numero = r.telefono.replace(/\D/g, ''); // Limpia el número de símbolos
        
        const mensaje = `Hola *${r.cliente}*, te escribimos de *Farmacell* 📱. %0A%0ATu equipo *${r.marca} ${r.modelo}* se encuentra en estado: *${r.estado?.toUpperCase()}*. %0A%0A` + 
        (saldo > 0 ? `El saldo pendiente es de *$${saldo.toFixed(2)}*.` : `Tu equipo ya está pago y listo para retirar.`) + 
        `%0A%0A¡Te esperamos!`;

        window.open(`https://api.whatsapp.com/send?phone=${numero}&text=${mensaje}`, '_blank');
    };

    const handleGuardar = async () => {
        if (!form.cliente || !form.modelo || !form.telefono) return Swal.fire('Error', 'Campos obligatorios', 'error');
        const datos = { ...form, presupuesto: Number(form.presupuesto), abono: Number(form.abono) };
        const exito = form.id ? await actualizarReparacion(form.id, datos) : await crearReparacion(datos);
        if (exito) {
            setOpen(false);
            setForm({ id: null, cliente: '', telefono: '', marca: '', modelo: '', falla: '', presupuesto: '', abono: '', estado: 'Pendiente' });
        }
    };

    const getEstadoColor = (estado) => {
        switch(estado) {
            case 'Listo': return { color: '#166534', bgcolor: '#dcfce7', label: 'LISTO' };
            case 'En Reparación': return { color: '#854d0e', bgcolor: '#fef9c3', label: 'EN MESA' };
            case 'Entregado': return { color: '#1e40af', bgcolor: '#dbeafe', label: 'ENTREGADO' };
            default: return { color: '#991b1b', bgcolor: '#fef2f2', label: 'PENDIENTE' };
        }
    };

    return (
        <Box sx={{ p: 4 }}>
            <Paper sx={{ p: 3, borderRadius: '20px', boxShadow: '0px 10px 30px rgba(0,0,0,0.05)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" sx={{ fontWeight: '900', color: '#1e3a8a' }}>Taller Farmacell</Typography>
                    
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField 
                            size="small"
                            placeholder="Buscar cliente o equipo..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: '#94a3b8' }} /> }}
                            sx={{ width: 300 }}
                        />
                        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setForm({ id: null, cliente: '', telefono: '', marca: '', modelo: '', falla: '', presupuesto: '', abono: '', estado: 'Pendiente' }); setOpen(true); }} sx={{ bgcolor: '#0d226b' }}>
                            NUEVA ORDEN
                        </Button>
                    </Box>
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#f8fafc' }}>
                                <TableCell><b>Cliente / Tel</b></TableCell>
                                <TableCell><b>Equipo</b></TableCell>
                                <TableCell align="center"><b>Estado</b></TableCell>
                                <TableCell align="center"><b>Caja</b></TableCell>
                                <TableCell align="center"><b>Acciones</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reparacionesFiltradas.map((r) => {
                                const saldo = (Number(r.presupuesto) || 0) - (Number(r.abono) || 0);
                                const badge = getEstadoColor(r.estado);
                                return (
                                    <TableRow key={r.id} hover>
                                        <TableCell>
                                            <Typography sx={{ fontWeight: 'bold' }}>{r.cliente}</Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>{r.telefono}</Typography>
                                                {/* BOTÓN WHATSAPP */}
                                                <Tooltip title="Enviar mensaje">
                                                    <IconButton size="small" sx={{ color: '#25D366' }} onClick={() => enviarWhatsApp(r)}>
                                                        <WhatsAppIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography sx={{ fontWeight: '500' }}>{r.marca} {r.modelo}</Typography>
                                            <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>{r.falla}</Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ bgcolor: badge.bgcolor, color: badge.color, px: 1.5, py: 0.5, borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold', display: 'inline-block' }}>
                                                {badge.label}
                                            </Box>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ fontSize: '0.8rem' }}>
                                                <div style={{ color: '#64748b' }}>Costo: ${Number(r.presupuesto).toFixed(2)}</div>
                                                <div style={{ color: '#2e7d32' }}>Abono: ${Number(r.abono).toFixed(2)}</div>
                                                <div style={{ color: saldo > 0 ? '#d32f2f' : '#1e40af', fontWeight: 'bold' }}>
                                                    Saldo: ${saldo.toFixed(2)}
                                                </div>
                                            </Box>
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton color="primary" onClick={() => { setForm(r); setOpen(true); }}><EditIcon /></IconButton>
                                            <IconButton color="error" onClick={() => eliminarReparacion(r.id)}><DeleteIcon /></IconButton>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* MODAL (Igual que el anterior) */}
            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>Gestionar Orden</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={7}><TextField fullWidth label="Cliente" value={form.cliente} onChange={(e) => setForm({...form, cliente: e.target.value})} /></Grid>
                        <Grid item xs={5}><TextField fullWidth label="Teléfono" value={form.telefono} onChange={(e) => setForm({...form, telefono: e.target.value})} /></Grid>
                        <Grid item xs={6}><TextField fullWidth label="Marca" value={form.marca} onChange={(e) => setForm({...form, marca: e.target.value})} /></Grid>
                        <Grid item xs={6}><TextField fullWidth label="Modelo" value={form.modelo} onChange={(e) => setForm({...form, modelo: e.target.value})} /></Grid>
                        <Grid item xs={12}>
                            <TextField select fullWidth label="Estado" value={form.estado || 'Pendiente'} onChange={(e) => setForm({...form, estado: e.target.value})}>
                                <MenuItem value="Pendiente">🔴 Pendiente</MenuItem>
                                <MenuItem value="En Reparación">🟡 En Reparación</MenuItem>
                                <MenuItem value="Listo">🟢 Listo para Entregar</MenuItem>
                                <MenuItem value="Entregado">🔵 Entregado</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12}><TextField fullWidth label="Falla" multiline rows={2} value={form.falla} onChange={(e) => setForm({...form, falla: e.target.value})} /></Grid>
                        <Grid item xs={6}><TextField fullWidth label="Costo" type="number" value={form.presupuesto} onChange={(e) => setForm({...form, presupuesto: e.target.value})} /></Grid>
                        <Grid item xs={6}><TextField fullWidth label="Abono" type="number" value={form.abono} onChange={(e) => setForm({...form, abono: e.target.value})} /></Grid>
                    </Grid>
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button onClick={() => setOpen(false)}>Cancelar</Button>
                        <Button variant="contained" onClick={handleGuardar} sx={{ bgcolor: '#1e3a8a' }}>{form.id ? 'ACTUALIZAR' : 'GUARDAR'}</Button>
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default Reparaciones;
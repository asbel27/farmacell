import React from 'react';
import { 
  Paper, Box, Typography, Button, TableContainer, Table, TableHead, 
  TableRow, TableCell, TableBody, IconButton, Chip 
} from '@mui/material';
import { AddCircle as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';
import Swal from 'sweetalert2';

const InventarioReal = ({ productos, setModoEdicion, setFormI, setOpenInvModal, cargarTodo }) => {

  const prepararEdicion = (p) => {
    setModoEdicion(true);
    setFormI(p);
    setOpenInvModal(true);
  };

  const eliminarProducto = async (id) => {
    const result = await Swal.fire({
      title: '¿Eliminar equipo?',
      text: "Esta acción no se puede deshacer",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sí, borrar'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:9000/inventario/${id}`);
        cargarTodo();
        Swal.fire('¡Borrado!', 'El equipo salió del sistema.', 'success');
      } catch (err) { alert("Error al eliminar"); }
    }
  };

  return (
    <Paper sx={{ p: 4, borderRadius: 3 }}>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h4" color="primary" fontWeight="bold">Inventario de Equipos</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          sx={{ bgcolor: '#1a237e' }}
          onClick={() => { setModoEdicion(false); setFormI({id:'', marca:'', modelo:'', imei:'', stock:0, precio:0}); setOpenInvModal(true); }}
        >
          Nuevo Equipo
        </Button>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Marca</TableCell>
              <TableCell>Modelo</TableCell>
              <TableCell>IMEI / Serial</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Precio</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {productos.map((p) => (
              <TableRow key={p.id}>
                <TableCell><b>{p.marca}</b></TableCell>
                <TableCell>{p.modelo}</TableCell>
                <TableCell>{p.imei}</TableCell>
                <TableCell>
                  <Chip 
                    label={p.stock} 
                    color={p.stock > 5 ? "success" : "error"} 
                    variant="outlined" 
                    size="small" 
                  />
                </TableCell>
                <TableCell>${p.precio}</TableCell>
                <TableCell align="center">
                  <IconButton color="primary" onClick={() => prepararEdicion(p)}><EditIcon /></IconButton>
                  <IconButton color="error" onClick={() => eliminarProducto(p.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default InventarioReal;
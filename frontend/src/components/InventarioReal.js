import React from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { 
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, IconButton, Chip 
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, AddBox as AddIcon } from '@mui/icons-material';

const styles = {
  cardHeader: {
    background: 'linear-gradient(60deg, #66bb6a, #43a047)',
    boxShadow: '0 4px 20px 0 rgba(0,0,0,.14), 0 7px 10px -5px rgba(76, 175, 80, 0.4)',
    borderRadius: '3px',
    padding: '15px',
    marginTop: '-30px',
    color: 'white',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
};

const InventarioReal = ({ productos, cargarTodo, setModoEdicion, setFormI, setOpenInvModal }) => {

  // --- FUNCIÓN ABRIR MODAL NUEVO ---
  const handleNuevo = () => {
    setModoEdicion(false);
    setFormI({ id: '', marca: '', modelo: '', imei: '', stock: 0, precio: 0 });
    setOpenInvModal(true);
  };

  // --- FUNCIÓN ABRIR MODAL EDITAR ---
  const handleEditar = (p) => {
    setModoEdicion(true);
    setFormI(p);
    setOpenInvModal(true);
  };

  // --- FUNCIÓN ELIMINAR EQUIPO ---
  const handleEliminar = (id, modelo) => {
    Swal.fire({
      title: `¿Eliminar ${modelo}?`,
      text: "El equipo se borrará permanentemente del inventario.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:9000/inventario/${id}`);
          Swal.fire('Eliminado', 'Equipo borrado correctamente.', 'success');
          cargarTodo(); // Refresca la tabla
        } catch (error) {
          Swal.fire('Error', 'No se pudo eliminar el equipo.', 'error');
        }
      }
    });
  };

  return (
    <Paper sx={{ mt: 5, p: 2, borderRadius: '6px', overflow: 'visible' }}>
      <Box sx={styles.cardHeader}>
        <Box>
          <Typography variant="h6" fontWeight="bold">Inventario de Equipos</Typography>
          <Typography variant="caption">Control de stock de Farmacell</Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': {bgcolor: 'rgba(255,255,255,0.3)'} }}
          onClick={handleNuevo} // CONECTADO
        >
          Agregar Equipo
        </Button>
      </Box>

      <TableContainer sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: '#43a047', fontWeight: 'bold' }}>Marca/Modelo</TableCell>
              <TableCell sx={{ color: '#43a047', fontWeight: 'bold' }}>IMEI</TableCell>
              <TableCell sx={{ color: '#43a047', fontWeight: 'bold' }}>Stock</TableCell>
              <TableCell sx={{ color: '#43a047', fontWeight: 'bold' }}>Precio</TableCell>
              <TableCell sx={{ color: '#43a047', fontWeight: 'bold' }} align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {productos.map((p) => (
              <TableRow key={p.id} hover>
                <TableCell>
                  <Typography fontWeight="bold">{p.marca}</Typography>
                  <Typography variant="caption" color="textSecondary">{p.modelo}</Typography>
                </TableCell>
                <TableCell>{p.imei}</TableCell>
                <TableCell>
                  <Chip 
                    label={p.stock} 
                    color={parseInt(p.stock) <= 2 ? "error" : "success"} 
                    variant="outlined" 
                    size="small" 
                  />
                </TableCell>
                <TableCell fontWeight="bold">${p.precio}</TableCell>
                <TableCell align="right">
                  <IconButton color="success" onClick={() => handleEditar(p)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleEliminar(p.id, p.modelo)}>
                    <DeleteIcon />
                  </IconButton>
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
import React from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { 
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, IconButton, Chip 
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, PersonAdd as PersonAddIcon } from '@mui/icons-material';

const styles = {
  cardHeader: {
    background: 'linear-gradient(60deg, #26c6da, #00acc1)',
    boxShadow: '0 4px 20px 0 rgba(0,0,0,.14), 0 7px 10px -5px rgba(0, 172, 193, 0.4)',
    borderRadius: '3px',
    padding: '15px',
    marginTop: '-30px',
    color: 'white',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
};

const GestionUsuarios = ({ usuarios, cargarTodo, setModoEdicion, setFormU, setOpenUserModal }) => {
  
  const handleNuevo = () => {
    setModoEdicion(false);
    setFormU({ id: '', nombre: '', email: '', password: '', rol: 'taller' });
    setOpenUserModal(true);
  };

  const handleEditar = (u) => {
    setModoEdicion(true);
    setFormU(u);
    setOpenUserModal(true);
  };

  // --- FUNCIÓN ELIMINAR CONECTADA ---
  const handleEliminar = (id, nombre) => {
    Swal.fire({
      title: `¿Eliminar a ${nombre}?`,
      text: "Esta acción no se puede deshacer",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:9000/usuarios/${id}`);
          Swal.fire('Eliminado', 'El usuario ha sido borrado.', 'success');
          cargarTodo(); // Recarga la tabla para ver los cambios
        } catch (error) {
          Swal.fire('Error', 'No se pudo eliminar el usuario', 'error');
        }
      }
    });
  };

  return (
    <Paper sx={{ mt: 5, p: 2, borderRadius: '6px', overflow: 'visible' }}>
      <Box sx={styles.cardHeader}>
        <Box>
          <Typography variant="h6" fontWeight="bold">Personal de Farmacell</Typography>
          <Typography variant="caption">Gestión de accesos y roles</Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<PersonAddIcon />}
          sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': {bgcolor: 'rgba(255,255,255,0.3)'} }}
          onClick={handleNuevo}
        >
          Nuevo Usuario
        </Button>
      </Box>

      <TableContainer sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: '#00acc1', fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ color: '#00acc1', fontWeight: 'bold' }}>Nombre</TableCell>
              <TableCell sx={{ color: '#00acc1', fontWeight: 'bold' }}>Email</TableCell>
              <TableCell sx={{ color: '#00acc1', fontWeight: 'bold' }}>Rol</TableCell>
              <TableCell sx={{ color: '#00acc1', fontWeight: 'bold' }} align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usuarios.map((u) => (
              <TableRow key={u.id} hover>
                <TableCell>{u.id}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{u.nombre || u.nombre_dueno}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <Chip 
                    label={u.rol} 
                    size="small" 
                    sx={{ bgcolor: u.rol === 'admin' ? '#fb8c00' : '#9c27b0', color: 'white' }} 
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton color="info" onClick={() => handleEditar(u)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleEliminar(u.id, u.nombre || u.nombre_dueno)}>
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

export default GestionUsuarios;
import React from 'react';
import { 
  Paper, Box, Typography, Button, TableContainer, Table, TableHead, 
  TableRow, TableCell, TableBody, IconButton, Tooltip 
} from '@mui/material';
import { 
  AddCircle as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon 
} from '@mui/icons-material';
import axios from 'axios';

const GestionUsuarios = ({ usuarios, setModoEdicion, setFormU, setOpenUserModal, cargarTodo }) => {
  
  // Función para preparar el modal de edición
  const prepararEdicion = (u) => {
    setModoEdicion(true);
    setFormU({
      id: u.id,
      nombre: u.nombre,
      email: u.email,
      password: u.password, // Ahora cargamos la clave para editarla
      rol: u.rol
    });
    setOpenUserModal(true);
  };

  // Función para preparar el modal de nuevo usuario
  const prepararNuevo = () => {
    setModoEdicion(false);
    setFormU({ id: '', nombre: '', email: '', password: '', rol: 'taller' });
    setOpenUserModal(true);
  };

  // Función para eliminar
  const eliminarUsuario = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este usuario?")) {
      try {
        await axios.delete(`http://localhost:9000/usuarios/${id}`);
        cargarTodo();
      } catch (err) {
        alert("Error al eliminar");
      }
    }
  };

  return (
    <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0px 4px 20px rgba(0,0,0,0.1)' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" color="primary" fontWeight="bold">
          Gestión de Usuarios
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          sx={{ bgcolor: '#254f63', '&:hover': { bgcolor: '#1a3a4a' } }} 
          onClick={prepararNuevo}
        >
          Nuevo Usuario
        </Button>
      </Box>

      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Contraseña</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Rol</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usuarios.length > 0 ? (
              usuarios.map((u) => (
                <TableRow key={u.id} hover>
                  <TableCell>{u.nombre}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                    {u.password}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ 
                      textTransform: 'uppercase', 
                      fontWeight: 'bold',
                      color: u.rol === 'admin' ? 'secondary.main' : 'primary.main' 
                    }}>
                      {u.rol}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Editar">
                      <IconButton color="primary" onClick={() => prepararEdicion(u)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton color="error" onClick={() => eliminarUsuario(u.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">No hay usuarios registrados</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default GestionUsuarios;
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2'; 
import { 
  Box, CssBaseline, AppBar, Toolbar, Typography, Drawer, List, ListItemButton, 
  ListItemIcon, ListItemText, Container, Avatar, TextField, Alert, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, Paper, Grid, Badge, 
  IconButton, Menu, MenuItem, Divider, Chip 
} from '@mui/material';
import { 
  People as PeopleIcon, Inventory as InventoryIcon, Logout as LogoutIcon, 
  Notifications as NotificationsIcon, Assessment as AssessmentIcon, Search as SearchIcon,
  Build as BuildIcon, ErrorOutline as ErrorIcon
} from '@mui/icons-material';

// --- COMPONENTES ---
import GestionUsuarios from './components/GestionUsuarios';
import InventarioReal from './components/InventarioReal';
import CatalogoTienda from './components/CatalogoTienda';
import BigDataView from './components/BigData';
import Reparaciones from './components/Reparaciones';

// --- CONFIGURACIÓN DE API PARA RENDER ---
// Si despliegas en Render, React usará la URL de la variable de entorno.
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:9000';

const drawerWidth = 260;

const styles = {
  cardHeader: (color1, color2, shadow) => ({
    background: `linear-gradient(60deg, ${color1}, ${color2})`,
    boxShadow: `0 4px 20px 0 rgba(0,0,0,.14), 0 7px 10px -5px ${shadow}`,
    borderRadius: '3px',
    padding: '15px',
    marginTop: '-30px',
    marginLeft: '15px',
    marginRight: '15px',
    color: 'white',
    position: 'relative'
  }),
  sidebar: {
    width: drawerWidth,
    [`& .MuiDrawer-paper`]: { 
      width: drawerWidth, 
      boxSizing: 'border-box', 
      borderRight: 'none', 
      bgcolor: '#1f1f1f',
      color: 'white',
      backgroundImage: 'url(https://demos.creative-tim.com/vue-material-dashboard/img/sidebar-2.32103624.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }
  },
  mainPanel: {
    flexGrow: 1, 
    p: 4, 
    bgcolor: '#eeeeee', 
    minHeight: '100vh'
  }
};

const menuItemStyle = (color) => ({
  borderRadius: '3px', 
  mb: 1,
  color: 'white',
  '&.Mui-selected': {
    bgcolor: color,
    boxShadow: `0 4px 20px 0 rgba(0,0,0,.14), 0 7px 10px -5px ${color}`,
  },
  '&:hover': {
    bgcolor: 'rgba(255,255,255,0.1)',
  }
});

function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [vista, setVista] = useState('');
  const [error, setError] = useState('');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });

  const [usuarios, setUsuarios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [bigData, setBigData] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [resumenFinanciero, setResumenFinanciero] = useState(0);

  const [anchorEl, setAnchorEl] = useState(null); 
  const [openUserModal, setOpenUserModal] = useState(false);
  const [openInvModal, setOpenInvModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  
  const [formU, setFormU] = useState({ id: '', nombre: '', email: '', password: '', rol: 'taller' });
  const [formI, setFormI] = useState({ id: '', marca: '', modelo: '', imei: '', stock: 0, precio: 0 });

  const cargarTodo = useCallback(async () => {
    if (!user) return;
    try {
      const [resInv, resU, resValor, resAlertas] = await Promise.all([
        axios.get(`${API_URL}/inventario`),
        axios.get(`${API_URL}/usuarios`),
        axios.get(`${API_URL}/inventario/valor-total`),
        axios.get(`${API_URL}/inventario/alertas/todas`)
      ]);
      
      setProductos(resInv.data);
      setUsuarios(resU.data);
      setResumenFinanciero(resValor.data.valor_total || 0);
      setAlertas(resAlertas.data);

      if (user.rol === 'admin') {
        const resBD = await axios.get(`${API_URL}/analitica/dashboard`);
        setBigData(resBD.data.compras_sugeridas || []);
      }
    } catch (err) { console.error("Error en sincronización:", err); }
  }, [user]);

  useEffect(() => { 
    const timer = setTimeout(() => setLoading(false), 2000); 
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => { 
    if (user) { 
      cargarTodo(); 
      setVista(user.rol === 'admin' ? 'usuarios' : 'reparaciones'); 
    } 
  }, [user, cargarTodo]);

  const manejarLogin = async () => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, loginForm);
      if (res.data.autenticado) setUser(res.data.usuario);
    } catch { setError("Acceso Denegado, Credenciales incorrectas!"); }
  };

  const guardarUsuario = async () => {
    try {
      const url = `${API_URL}/usuarios`;
      if (modoEdicion) await axios.put(`${url}/${formU.id}`, formU);
      else await axios.post(url, formU);
      Swal.fire({ icon: 'success', title: 'Éxito', timer: 1000, showConfirmButton: false });
      setOpenUserModal(false); cargarTodo();
    } catch { Swal.fire({ icon: 'error', title: 'Error' }); }
  };

  const guardarInventario = async () => {
    try {
      const url = `${API_URL}/inventario`;
      if (modoEdicion) await axios.put(`${url}/${formI.id}`, formI);
      else await axios.post(url, formI);
      Swal.fire({ icon: 'success', title: 'Actualizado', timer: 1000, showConfirmButton: false });
      setOpenInvModal(false); cargarTodo();
    } catch { Swal.fire({ icon: 'error', title: 'Error' }); }
  };

  if (loading) return (
    <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#1f1f1f' }}>
      <Typography variant="h2" sx={{ color: '#4caf50', fontWeight: 900, animation: 'pulse 2s infinite' }}>FARMACELL</Typography>
    </Box>
  );

  if (!user) return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#eee' }}>
      <Container maxWidth="xs">
        <Paper elevation={10} sx={{ p: 0, borderRadius: '6px' }}>
          <Box sx={styles.cardHeader('#66bb6a', '#43a047', 'rgba(76, 175, 80, 0.4)')}>
             <Typography variant="h5" align="center" fontWeight="bold">LOGIN</Typography>
          </Box>
          <Box sx={{ p: 4, pt: 2 }}>
            <TextField fullWidth label="Email" variant="standard" margin="normal" onChange={(e)=>setLoginForm({...loginForm, email:e.target.value})} />
            <TextField fullWidth label="Password" variant="standard" type="password" margin="normal" onChange={(e)=>setLoginForm({...loginForm, password:e.target.value})} />
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            <Button fullWidth variant="contained" sx={{ mt: 4, bgcolor: '#4caf50' }} onClick={manejarLogin}>ENTRAR</Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      <Drawer variant="permanent" sx={styles.sidebar}>
        <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'rgba(0,0,0,0.8)' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>FARMACELL {user.rol.toUpperCase()}</Typography>
        </Box>
        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Box sx={{ bgcolor: 'rgba(0,0,0,0.8)', height: '100%' }}>
          <List sx={{ px: 2 }}>
            {user.rol === 'admin' && (
              <>
                <ListItemButton onClick={() => setVista('usuarios')} selected={vista === 'usuarios'} sx={menuItemStyle('#00acc1')}><ListItemIcon><PeopleIcon sx={{color:'white'}}/></ListItemIcon><ListItemText primary="Personal"/></ListItemButton>
                <ListItemButton onClick={() => setVista('inventario')} selected={vista === 'inventario'} sx={menuItemStyle('#4caf50')}><ListItemIcon><InventoryIcon sx={{color:'white'}}/></ListItemIcon><ListItemText primary="Inventario"/></ListItemButton>
                <ListItemButton onClick={() => setVista('bigdata')} selected={vista === 'bigdata'} sx={menuItemStyle('#f44336')}><ListItemIcon><AssessmentIcon sx={{color:'white'}}/></ListItemIcon><ListItemText primary="Demanda"/></ListItemButton>
              </>
            )}
            <ListItemButton onClick={() => setVista('reparaciones')} selected={vista === 'reparaciones'} sx={menuItemStyle('#ff9800')}><ListItemIcon><BuildIcon sx={{color:'white'}}/></ListItemIcon><ListItemText primary="Mis Reparaciones"/></ListItemButton>
            <ListItemButton onClick={() => setVista('tienda')} selected={vista === 'tienda'} sx={menuItemStyle('#e91e63')}><ListItemIcon><SearchIcon sx={{color:'white'}}/></ListItemIcon><ListItemText primary="Catálogo"/></ListItemButton>
          </List>
          <ListItemButton sx={{ mt: 'auto', px: 2 }} onClick={() => setUser(null)}>
            <ListItemIcon sx={{ color: 'white' }}><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Cerrar Sesión" sx={{ color: 'white' }} />
          </ListItemButton>
        </Box>
      </Drawer>

      <Box component="main" sx={styles.mainPanel}>
        <AppBar position="static" sx={{ bgcolor: 'transparent', boxShadow: 'none', mb: 4 }}>
          <Toolbar>
            <Typography variant="h5" sx={{ color: '#3c4858', fontWeight: 300, flexGrow: 1 }}>{vista.toUpperCase()}</Typography>
            
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Badge badgeContent={alertas.length} color="error"><NotificationsIcon /></Badge>
            </IconButton>

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)} PaperProps={{ sx: { mt: '45px', width: '300px' } }}>
              <Box sx={{ p: 2, bgcolor: '#f5f5f5' }}><Typography variant="subtitle2">Notificaciones ({alertas.length})</Typography></Box>
              <Divider />
              {alertas.length > 0 ? (
                alertas.map((a, i) => (
                  <MenuItem key={i} onClick={() => setAnchorEl(null)}>
                    <ListItemIcon><ErrorIcon color="error" fontSize="small" /></ListItemIcon>
                    <ListItemText primary={a.item || "Stock Bajo"} secondary={a.mensaje} primaryTypographyProps={{ variant: 'body2', fontWeight: 'bold' }} />
                  </MenuItem>
                ))
              ) : (
                <MenuItem><Typography variant="body2">No hay alertas</Typography></MenuItem>
              )}
            </Menu>

            <Avatar sx={{ bgcolor: '#4caf50', ml: 2, mr: 1 }}>{user.nombre[0]}</Avatar>
            <Typography sx={{ color: '#3c4858', fontWeight: 'bold' }}>{user.nombre}</Typography>
          </Toolbar>
        </AppBar>

        {user.rol === 'admin' && (vista === 'usuarios' || vista === 'inventario') && (
          <Grid container spacing={3} sx={{ mb: 6 }}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: 'right' }}>
                <Box sx={styles.cardHeader('#ffa726', '#fb8c00', 'rgba(255,152,0,0.4)')}><InventoryIcon /></Box>
                <Typography variant="body2" color="textSecondary">Capital</Typography>
                <Typography variant="h4">${resumenFinanciero}</Typography>
              </Paper>
            </Grid>
          </Grid>
        )}

        <Container maxWidth="xl">
            {vista === 'usuarios' && <GestionUsuarios usuarios={usuarios} cargarTodo={cargarTodo} setModoEdicion={setModoEdicion} setFormU={setFormU} setOpenUserModal={setOpenUserModal} />}
            {vista === 'inventario' && <InventarioReal productos={productos} cargarTodo={cargarTodo} setModoEdicion={setModoEdicion} setFormI={setFormI} setOpenInvModal={setOpenInvModal} />}
            {vista === 'reparaciones' && <Reparaciones user={user} cargarTodo={cargarTodo} />}
            {vista === 'bigdata' && <BigDataView bigData={bigData} />}
            {vista === 'tienda' && <CatalogoTienda productos={productos} user={user} />}
        </Container>
      </Box>

      {/* MODALES CORREGIDOS */}
      <Dialog open={openUserModal} onClose={() => setOpenUserModal(false)}>
        <DialogTitle>{modoEdicion ? 'Editar' : 'Nuevo'} Usuario</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Nombre" variant="standard" value={formU.nombre} onChange={(e)=>setFormU({...formU, nombre:e.target.value})} />
          <TextField fullWidth label="Email" variant="standard" value={formU.email} onChange={(e)=>setFormU({...formU, email:e.target.value})} />
          {!modoEdicion && <TextField fullWidth label="Password" variant="standard" type="password" onChange={(e)=>setFormU({...formU, password:e.target.value})} />}
          <TextField fullWidth label="Rol" variant="standard" value={formU.rol} onChange={(e)=>setFormU({...formU, rol:e.target.value})} />
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setOpenUserModal(false)}>Cancelar</Button>
          <Button variant="contained" onClick={guardarUsuario}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default App;
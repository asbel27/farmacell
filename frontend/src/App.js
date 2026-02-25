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
  Build as BuildIcon, CheckCircle as CheckIcon, ErrorOutline as ErrorIcon
} from '@mui/icons-material';

// --- COMPONENTES ---
import GestionUsuarios from './components/GestionUsuarios';
import InventarioReal from './components/InventarioReal';
import CatalogoTienda from './components/CatalogoTienda';
import BigDataView from './components/BigData';
import Reparaciones from './components/Reparaciones';

const drawerWidth = 260;

function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [vista, setVista] = useState('');
  const [error, setError] = useState('');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });

  // --- ESTADOS DE DATOS ---
  const [usuarios, setUsuarios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [bigData, setBigData] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [resumenFinanciero, setResumenFinanciero] = useState(0);

  // --- ESTADOS DE UI Y MODALES (CORREGIDO) ---
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
        axios.get('http://localhost:9000/inventario'),
        axios.get('http://localhost:9000/usuarios'),
        axios.get('http://localhost:9000/inventario/valor-total'),
        axios.get('http://localhost:9000/inventario/alertas/todas')
      ]);
      
      setProductos(resInv.data);
      setUsuarios(resU.data);
      setResumenFinanciero(resValor.data.valor_total || 0);
      setAlertas(resAlertas.data);

      if (user.rol === 'admin') {
        const resBD = await axios.get('http://localhost:9000/analitica/dashboard');
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
      setVista(user.rol === 'admin' ? 'usuarios' : 'tienda'); 
    } 
  }, [user, cargarTodo]);

  const manejarLogin = async () => {
    try {
      const res = await axios.post('http://localhost:9000/auth/login', loginForm);
      if (res.data.autenticado) setUser(res.data.usuario);
    } catch { setError("Acceso Denegado, Credenciales incorrectas!"); }
  };

  const guardarUsuario = async () => {
    try {
      const url = 'http://localhost:9000/usuarios';
      if (modoEdicion) await axios.put(`${url}/${formU.id}`, formU);
      else await axios.post(url, formU);
      Swal.fire({ icon: 'success', title: 'Operación Exitosa', timer: 1000, showConfirmButton: false });
      setOpenUserModal(false); cargarTodo();
    } catch { Swal.fire({ icon: 'error', title: 'Error' }); }
  };

  const guardarInventario = async () => {
    try {
      const url = 'http://localhost:9000/inventario';
      if (modoEdicion) await axios.put(`${url}/${formI.id}`, formI);
      else await axios.post(url, formI);
      Swal.fire({ icon: 'success', title: 'Inventario Actualizado', timer: 1000, showConfirmButton: false });
      setOpenInvModal(false); cargarTodo();
    } catch { Swal.fire({ icon: 'error', title: 'Error' }); }
  };

  if (loading) return (
    <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#0f172a' }}>
      <Typography variant="h2" sx={{ color: 'white', fontWeight: 900, letterSpacing: '-2px', animation: 'pulse 2s infinite' }}>
        FARMACELL
      </Typography>
    </Box>
  );

  if (!user) return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f1f5f9', p: 3 }}>
      <Container maxWidth="xs">
        <Paper elevation={20} sx={{ p: 5, textAlign: 'center', borderRadius: '24px' }}>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#1e3a8a', mb: 4 }}>LOGIN</Typography>
          <TextField fullWidth label="Email" margin="normal" onChange={(e)=>setLoginForm({...loginForm, email:e.target.value})} />
          <TextField fullWidth label="Password" type="password" margin="normal" onChange={(e)=>setLoginForm({...loginForm, password:e.target.value})} />
          {error && <Alert severity="error" sx={{ mt: 2, borderRadius: '12px' }}>{error}</Alert>}
          <Button fullWidth variant="contained" sx={{ mt: 4, py: 2, bgcolor: '#2563eb', borderRadius: '16px', fontWeight: 'bold' }} onClick={manejarLogin}>
            ENTRAR
          </Button>
        </Paper>
      </Container>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: 1201, bgcolor: '#1e3a8a', boxShadow: 'none' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 900 }}>FARMACELL PRO</Typography>
          
          {user.rol === 'admin' && (
            <>
              <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ mr: 2 }}>
                <Badge badgeContent={alertas.length} color="error"><NotificationsIcon /></Badge>
              </IconButton>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)} PaperProps={{ sx: { borderRadius: '16px', width: 320 } }}>
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontWeight: 'bold' }}>Alertas</Typography>
                  <Chip label={alertas.length} size="small" sx={{ bgcolor: '#2563eb', color: 'white' }} />
                </Box>
                <Divider />
                {alertas.map((a, i) => (
                  <MenuItem key={i} sx={{ py: 1.5 }}>
                    <ListItemIcon>{a.tipo === 'Stock Bajo' ? <ErrorIcon color="error" /> : <CheckIcon color="success" />}</ListItemIcon>
                    <ListItemText primary={a.item} secondary={a.mensaje} />
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}
          <Avatar sx={{ bgcolor: '#fff', color: '#1e3a8a', fontWeight: 'bold', mr: 2 }}>{user.nombre[0]}</Avatar>
          <IconButton color="inherit" onClick={() => setUser(null)}><LogoutIcon /></IconButton>
        </Toolbar>
      </AppBar>

      <Drawer variant="permanent" sx={{ width: drawerWidth, [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', borderRight: 'none', bgcolor: '#f8fafc' } }}>
        <Toolbar />
        <Box sx={{ p: 2 }}>
          <List>
            <ListItemButton onClick={() => setVista('usuarios')} selected={vista === 'usuarios'} sx={{ borderRadius: '12px', mb: 1 }}><ListItemIcon><PeopleIcon color="primary"/></ListItemIcon><ListItemText primary="Personal"/></ListItemButton>
            <ListItemButton onClick={() => setVista('inventario')} selected={vista === 'inventario'} sx={{ borderRadius: '12px', mb: 1 }}><ListItemIcon><InventoryIcon color="primary"/></ListItemIcon><ListItemText primary="Inventario"/></ListItemButton>
            <ListItemButton onClick={() => setVista('reparaciones')} selected={vista === 'reparaciones'} sx={{ borderRadius: '12px', mb: 1 }}><ListItemIcon><BuildIcon color="primary"/></ListItemIcon><ListItemText primary="Taller"/></ListItemButton>
            <ListItemButton onClick={() => setVista('bigdata')} selected={vista === 'bigdata'} sx={{ borderRadius: '12px', mb: 1 }}><ListItemIcon><AssessmentIcon color="primary"/></ListItemIcon><ListItemText primary="Demanda"/></ListItemButton>
            <ListItemButton onClick={() => setVista('tienda')} selected={vista === 'tienda'} sx={{ borderRadius: '12px', mt: 4, border: '1px dashed #cbd5e1' }}><ListItemIcon><SearchIcon color="secondary"/></ListItemIcon><ListItemText primary="Vista Cliente" /></ListItemButton>
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 4 }}>
        <Toolbar />
        {user.rol === 'admin' && (vista === 'usuarios' || vista === 'inventario') && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, bgcolor: '#1e3a8a', color: 'white', borderRadius: '24px', borderBottom: '8px solid #3b82f6' }}>
                <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 'bold' }}>Capital Inventario</Typography>
                <Typography variant="h3" sx={{ fontWeight: 900 }}>${resumenFinanciero}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, bgcolor: '#fff', borderRadius: '24px', borderBottom: '8px solid #10b981' }}>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Stock Total</Typography>
                <Typography variant="h3" sx={{ fontWeight: 900, color: '#10b981' }}>{productos.reduce((acc, p) => acc + (parseInt(p.stock) || 0), 0)}</Typography>
              </Paper>
            </Grid>
          </Grid>
        )}
        <Container maxWidth="xl">
          {vista === 'usuarios' && (
            <GestionUsuarios 
              usuarios={usuarios} 
              cargarTodo={cargarTodo} 
              setModoEdicion={setModoEdicion} 
              setFormU={setFormU} 
              setOpenUserModal={setOpenUserModal} 
            />
          )}
          {vista === 'inventario' && (
            <InventarioReal 
              productos={productos} 
              cargarTodo={cargarTodo} 
              setModoEdicion={setModoEdicion} 
              setFormI={setFormI} 
              setOpenInvModal={setOpenInvModal} 
            />
          )}
          {vista === 'reparaciones' && <Reparaciones user={user} cargarTodo={cargarTodo} />}
          {vista === 'bigdata' && <BigDataView bigData={bigData} />}
          {vista === 'tienda' && <CatalogoTienda productos={productos} user={user} />}
        </Container>
      </Box>

      {/* MODAL USUARIOS */}
      <Dialog open={openUserModal} onClose={() => setOpenUserModal(false)}>
        <DialogTitle sx={{bgcolor:'#1e3a8a', color:'white'}}>{modoEdicion ? 'Editar' : 'Nuevo'} Usuario</DialogTitle>
        <DialogContent sx={{pt:2}}>
          <TextField fullWidth label="Nombre" margin="dense" value={formU.nombre} onChange={(e)=>setFormU({...formU, nombre:e.target.value})} />
          <TextField fullWidth label="Email" margin="dense" value={formU.email} onChange={(e)=>setFormU({...formU, email:e.target.value})} />
          <TextField fullWidth label="Password" type="password" margin="dense" value={formU.password} onChange={(e)=>setFormU({...formU, password:e.target.value})} />
          <TextField fullWidth label="Rol" margin="dense" value={formU.rol} onChange={(e)=>setFormU({...formU, rol:e.target.value})} />
        </DialogContent>
        <DialogActions><Button onClick={()=>setOpenUserModal(false)}>Cancelar</Button><Button variant="contained" onClick={guardarUsuario}>Guardar</Button></DialogActions>
      </Dialog>

      {/* MODAL INVENTARIO */}
      <Dialog open={openInvModal} onClose={() => setOpenInvModal(false)}>
        <DialogTitle sx={{bgcolor:'#1e3a8a', color:'white'}}>{modoEdicion ? 'Editar' : 'Nuevo'} Equipo</DialogTitle>
        <DialogContent sx={{pt:2}}>
          <TextField fullWidth label="Marca" margin="dense" value={formI.marca} onChange={(e)=>setFormI({...formI, marca:e.target.value})} />
          <TextField fullWidth label="Modelo" margin="dense" value={formI.modelo} onChange={(e)=>setFormI({...formI, modelo:e.target.value})} />
          <TextField fullWidth label="IMEI" margin="dense" value={formI.imei} onChange={(e)=>setFormI({...formI, imei:e.target.value})} />
          <Box sx={{display:'flex', gap:2}}>
            <TextField fullWidth label="Stock" type="number" margin="dense" value={formI.stock} onChange={(e)=>setFormI({...formI, stock:e.target.value})} />
            <TextField fullWidth label="Precio" type="number" margin="dense" value={formI.precio} onChange={(e)=>setFormI({...formI, precio:e.target.value})} />
          </Box>
        </DialogContent>
        <DialogActions><Button onClick={()=>setOpenInvModal(false)}>Cancelar</Button><Button variant="contained" onClick={guardarInventario}>Guardar</Button></DialogActions>
      </Dialog>
    </Box>
  );
}

export default App;
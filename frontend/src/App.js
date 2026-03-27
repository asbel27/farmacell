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

// ==========================================================
// 🚀 CONFIGURACIÓN DE URL DE LA API (LOCAL)
// ==========================================================
const API_BASE_URL = 'http://localhost:9000';

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
        axios.get(`${API_BASE_URL}/inventario`),
        axios.get(`${API_BASE_URL}/usuarios`),
        axios.get(`${API_BASE_URL}/inventario/valor-total`),
        axios.get(`${API_BASE_URL}/inventario/alertas/todas`)
      ]);
      
      setProductos(resInv.data);
      setUsuarios(resU.data);
      setResumenFinanciero(resValor.data.valor_total || 0);
      setAlertas(resAlertas.data);

      if (user.rol === 'admin') {
        const resBD = await axios.get(`${API_BASE_URL}/analitica/dashboard`);
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
      const res = await axios.post(`${API_BASE_URL}/auth/login`, loginForm);
      if (res.data.autenticado) setUser(res.data.usuario);
    } catch { setError("Acceso Denegado, Credenciales incorrectas!"); }
  };

  const guardarUsuario = async () => {
    try {
      const url = `${API_BASE_URL}/usuarios`;
      if (modoEdicion) await axios.put(`${url}/${formU.id}`, formU);
      else await axios.post(url, formU);
      Swal.fire({ icon: 'success', title: 'Operación Exitosa', timer: 1000, showConfirmButton: false });
      setOpenUserModal(false); cargarTodo();
    } catch { Swal.fire({ icon: 'error', title: 'Error' }); }
  };

  const guardarInventario = async () => {
    try {
      const url = `${API_BASE_URL}/inventario`;
      if (modoEdicion) await axios.put(`${url}/${formI.id}`, formI);
      else await axios.post(url, formI);
      Swal.fire({ icon: 'success', title: 'Inventario Actualizado', timer: 1000, showConfirmButton: false });
      setOpenInvModal(false); cargarTodo();
    } catch { Swal.fire({ icon: 'error', title: 'Error' }); }
  };

  // ... (El resto del código de renderizado se mantiene igual)
  if (loading) return (
    <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#1f1f1f' }}>
      <Typography variant="h2" sx={{ color: '#4caf50', fontWeight: 900, letterSpacing: '-2px', animation: 'pulse 2s infinite' }}>
        FARMACELL
      </Typography>
    </Box>
  );

  if (!user) return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#eee', p: 3 }}>
      <Container maxWidth="xs">
        <Paper elevation={10} sx={{ p: 0, borderRadius: '6px', overflow: 'visible' }}>
          <Box sx={styles.cardHeader('#66bb6a', '#43a047', 'rgba(76, 175, 80, 0.4)')}>
             <Typography variant="h5" align="center" fontWeight="bold">LOGIN</Typography>
          </Box>
          <Box sx={{ p: 4, pt: 2 }}>
            <TextField fullWidth label="Email" variant="standard" margin="normal" onChange={(e)=>setLoginForm({...loginForm, email:e.target.value})} />
            <TextField fullWidth label="Password" variant="standard" type="password" margin="normal" onChange={(e)=>setLoginForm({...loginForm, password:e.target.value})} />
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            <Button fullWidth variant="contained" sx={{ mt: 4, py: 1.5, bgcolor: '#4caf50', '&:hover': {bgcolor: '#388e3c'} }} onClick={manejarLogin}>
              ENTRAR
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* SIDEBAR DINÁMICO */}
      <Drawer variant="permanent" sx={styles.sidebar}>
        <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'rgba(0,0,0,0.8)' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
            FARMACELL {user.rol === 'admin' ? 'PRO' : 'TALLER'}
          </Typography>
        </Box>
        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Box sx={{ bgcolor: 'rgba(0,0,0,0.8)', height: '100%' }}>
          <List sx={{ px: 2 }}>
            {user.rol === 'admin' && (
              <>
                <ListItemButton onClick={() => setVista('usuarios')} selected={vista === 'usuarios'} sx={menuItemStyle('#00acc1')}>
                  <ListItemIcon><PeopleIcon sx={{color:'white'}}/></ListItemIcon>
                  <ListItemText primary="Personal"/>
                </ListItemButton>
                <ListItemButton onClick={() => setVista('inventario')} selected={vista === 'inventario'} sx={menuItemStyle('#4caf50')}>
                  <ListItemIcon><InventoryIcon sx={{color:'white'}}/></ListItemIcon>
                  <ListItemText primary="Inventario"/>
                </ListItemButton>
                <ListItemButton onClick={() => setVista('bigdata')} selected={vista === 'bigdata'} sx={menuItemStyle('#f44336')}>
                  <ListItemIcon><AssessmentIcon sx={{color:'white'}}/></ListItemIcon>
                  <ListItemText primary="Demanda"/>
                </ListItemButton>
              </>
            )}
            <ListItemButton onClick={() => setVista('reparaciones')} selected={vista === 'reparaciones'} sx={menuItemStyle('#ff9800')}>
              <ListItemIcon><BuildIcon sx={{color:'white'}}/></ListItemIcon>
              <ListItemText primary="Mis Reparaciones"/>
            </ListItemButton>
            <ListItemButton onClick={() => setVista('tienda')} selected={vista === 'tienda'} sx={menuItemStyle('#e91e63')}>
              <ListItemIcon><SearchIcon sx={{color:'white'}}/></ListItemIcon>
              <ListItemText primary="Catálogo"/>
            </ListItemButton>
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
            <Typography variant="h5" sx={{ color: '#3c4858', fontWeight: 300, flexGrow: 1 }}>
              {vista.toUpperCase()}
            </Typography>
            
            <IconButton color="default" onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Badge badgeContent={alertas.length} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              PaperProps={{
                sx: {
                  mt: '45px',
                  borderRadius: '8px',
                  width: '300px',
                  boxShadow: '0 10px 30px -12px rgba(0,0,0,0.42), 0 4px 25px 0px rgba(0,0,0,0.12)'
                }
              }}
            >
              <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#333' }}>
                  Notificaciones ({alertas.length})
                </Typography>
              </Box>
              {alertas.length > 0 ? (
                alertas.map((alerta, index) => (
                  <MenuItem key={index} onClick={() => setAnchorEl(null)} sx={{ py: 1.5, borderBottom: '1px solid #eee' }}>
                    <ListItemIcon><ErrorIcon color="error" fontSize="small" /></ListItemIcon>
                    <ListItemText 
                      primary={alerta.item || "Stock Bajo"} 
                      secondary={alerta.mensaje || "Quedan pocas unidades"} 
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 'bold' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </MenuItem>
                ))
              ) : (
                <MenuItem sx={{ py: 3, justifyContent: 'center' }}>
                  <Typography variant="body2" color="textSecondary">No tienes alertas pendientes</Typography>
                </MenuItem>
              )}
            </Menu>

            <Avatar sx={{ bgcolor: '#4caf50', ml: 2, mr: 1 }}>{user.nombre ? user.nombre[0] : 'U'}</Avatar>
            <Typography sx={{ color: '#3c4858', mr: 2, fontWeight: 'bold' }}>{user.nombre}</Typography>
          </Toolbar>
        </AppBar>

        {user.rol === 'admin' && (vista === 'usuarios' || vista === 'inventario') && (
          <Grid container spacing={3} sx={{ mb: 6, mt: 1 }}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 0, borderRadius: '6px', position: 'relative' }}>
                <Box sx={styles.cardHeader('#ffa726', '#fb8c00', 'rgba(255, 152, 0, 0.4)')}>
                   <InventoryIcon fontSize="large" />
                </Box>
                <Box sx={{ p: 2, textAlign: 'right' }}>
                  <Typography variant="body2" color="textSecondary">Capital Inventario</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 300 }}>${resumenFinanciero}</Typography>
                </Box>
                <Divider />
                <Box sx={{ p: 1, pl: 2 }}><Typography variant="caption" color="textSecondary">Actualizado ahora</Typography></Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 0, borderRadius: '6px' }}>
                <Box sx={styles.cardHeader('#66bb6a', '#43a047', 'rgba(76, 175, 80, 0.4)')}>
                   <SearchIcon fontSize="large" />
                </Box>
                <Box sx={{ p: 2, textAlign: 'right' }}>
                  <Typography variant="body2" color="textSecondary">Stock Total</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 300 }}>
                    {productos.reduce((acc, p) => acc + (parseInt(p.stock) || 0), 0)}
                  </Typography>
                </Box>
                <Divider />
                <Box sx={{ p: 1, pl: 2 }}><Typography variant="caption" color="textSecondary">Equipos en tienda</Typography></Box>
              </Paper>
            </Grid>
          </Grid>
        )}

        <Container maxWidth="xl" sx={{ mt: 2 }}>
            {vista === 'usuarios' && (
              <GestionUsuarios 
                usuarios={usuarios} cargarTodo={cargarTodo} 
                setModoEdicion={setModoEdicion} setFormU={setFormU} setOpenUserModal={setOpenUserModal} 
              />
            )}
            {vista === 'inventario' && (
              <InventarioReal 
                productos={productos} cargarTodo={cargarTodo} 
                setModoEdicion={setModoEdicion} setFormI={setFormI} setOpenInvModal={setOpenInvModal} 
              />
            )}
            {vista === 'reparaciones' && <Reparaciones user={user} cargarTodo={cargarTodo} API_BASE_URL={API_BASE_URL} />}
            {vista === 'bigdata' && <BigDataView bigData={bigData} />}
            {vista === 'tienda' && <CatalogoTienda productos={productos} user={user} />}
        </Container>
      </Box>

      {/* --- MODALES --- */}
      <Dialog open={openUserModal} onClose={() => setOpenUserModal(false)} PaperProps={{ sx: { borderRadius: '6px' } }}>
        <Box sx={styles.cardHeader('#26c6da', '#00acc1', 'rgba(0, 172, 193, 0.4)')}>
          <Typography variant="h6">{modoEdicion ? 'Editar' : 'Nuevo'} Usuario</Typography>
        </Box>
        <DialogContent sx={{ pt: 4 }}>
          <TextField fullWidth label="Nombre" variant="standard" margin="dense" value={formU.nombre} onChange={(e)=>setFormU({...formU, nombre:e.target.value})} />
          <TextField fullWidth label="Email" variant="standard" margin="dense" value={formU.email} onChange={(e)=>setFormU({...formU, email:e.target.value})} />
          <TextField fullWidth label="Password" variant="standard" type="password" margin="dense" value={formU.password} onChange={(e)=>setFormU({...formU, password:e.target.value})} />
          <TextField fullWidth label="Rol" variant="standard" margin="dense" value={formU.rol} onChange={(e)=>setFormU({...formU, rol:e.target.value})} />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={()=>setOpenUserModal(false)} sx={{ color: '#999' }}>Cancelar</Button>
          <Button variant="contained" sx={{ bgcolor: '#00acc1' }} onClick={guardarUsuario}>Guardar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openInvModal} onClose={() => setOpenInvModal(false)} PaperProps={{ sx: { borderRadius: '6px' } }}>
        <Box sx={styles.cardHeader('#66bb6a', '#43a047', 'rgba(76, 175, 80, 0.4)')}>
          <Typography variant="h6">{modoEdicion ? 'Editar' : 'Nuevo'} Equipo</Typography>
        </Box>
        <DialogContent sx={{ pt: 4 }}>
          <TextField fullWidth label="Marca" variant="standard" margin="dense" value={formI.marca} onChange={(e)=>setFormI({...formI, marca: e.target.value})} />
          <TextField fullWidth label="Modelo" variant="standard" margin="dense" value={formI.modelo} onChange={(e)=>setFormI({...formI, modelo: e.target.value})} />
          <TextField fullWidth label="IMEI" variant="standard" margin="dense" value={formI.imei} onChange={(e)=>setFormI({...formI, imei: e.target.value})} />
          <Grid container spacing={2}>
            <Grid item xs={6}><TextField fullWidth label="Stock" type="number" variant="standard" margin="dense" value={formI.stock} onChange={(e)=>setFormI({...formI, stock: e.target.value})} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Precio" type="number" variant="standard" margin="dense" value={formI.precio} onChange={(e)=>setFormI({...formI, precio: e.target.value})} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={()=>setOpenInvModal(false)} sx={{ color: '#999' }}>Cancelar</Button>
          <Button variant="contained" sx={{ bgcolor: '#43a047' }} onClick={guardarInventario}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default App;
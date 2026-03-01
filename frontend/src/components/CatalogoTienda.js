import React from 'react';
import { 
  Box, Grid, Paper, Typography, Button, Chip, Divider 
} from '@mui/material';
import { 
  ShoppingCart as CartIcon, 
  CheckCircle as InStockIcon, 
  ErrorOutline as NoStockIcon,
  PhoneAndroid as PhoneIcon 
} from '@mui/icons-material';

const styles = {
  // Efecto de elevación para la imagen del producto
  productHeader: (color1, color2) => ({
    background: `linear-gradient(60deg, ${color1}, ${color2})`,
    boxShadow: '0 4px 20px 0 rgba(0,0,0,.14), 0 7px 10px -5px rgba(0,0,0,.4)',
    borderRadius: '6px',
    padding: '30px',
    marginTop: '-40px',
    color: 'white',
    textAlign: 'center',
    position: 'relative'
  }),
  card: {
    mt: 6, 
    mb: 2, 
    p: 2, 
    borderRadius: '6px', 
    overflow: 'visible', 
    position: 'relative',
    transition: '0.3s',
    '&:hover': {
      transform: 'translateY(-10px)',
      boxShadow: '0 12px 20px -10px rgba(0,0,0,0.28), 0 4px 20px 0px rgba(0,0,0,0.12)'
    }
  }
};

const CatalogoTienda = ({ productos }) => {
  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
      <Grid container spacing={5}>
        {productos.map((p) => (
          <Grid item xs={12} sm={6} md={4} key={p.id}>
            <Paper elevation={0} sx={styles.card}>
              {/* Cabecera de la Tarjeta (Imagen o Icono) */}
              <Box sx={styles.productHeader('#ec407a', '#d81b60')}>
                <PhoneIcon sx={{ fontSize: 60 }} />
              </Box>

              {/* Contenido del Producto */}
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="caption" color="textSecondary" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>
                  {p.marca}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 300, mt: 1, mb: 1, color: '#3c4858' }}>
                  {p.modelo}
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <Chip 
                    label={p.stock > 0 ? `${p.stock} Disponibles` : 'Agotado'} 
                    size="small" 
                    icon={p.stock > 0 ? <InStockIcon /> : <NoStockIcon />}
                    color={p.stock > 0 ? "success" : "error"}
                    variant="outlined"
                  />
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h4" sx={{ color: '#4caf50', fontWeight: 300 }}>
                    ${p.precio}
                  </Typography>
                  <Button 
                    variant="contained" 
                    size="small"
                    startIcon={<CartIcon />}
                    sx={{ 
                      bgcolor: '#e91e63', 
                      borderRadius: '30px',
                      '&:hover': { bgcolor: '#ad1457' }
                    }}
                  >
                    Ver
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CatalogoTienda;
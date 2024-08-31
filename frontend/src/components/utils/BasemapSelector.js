import React, { useState } from 'react';
import { Dialog, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import IconButton from '@mui/material/IconButton';

const BasemapSelector = ({ setSelectedTileLayer, tileLayersData, sideNavExpanded }) => {
  const [isMapStyleDrawerOpen, setIsMapStyleDrawerOpen] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState(tileLayersData[0].url); // OpenStreetMap é o padrão

  const toggleMapStyleDrawer = (open) => () => {
    setIsMapStyleDrawerOpen(open);
  };

  const changeMapStyle = (newTileLayerUrl) => {
    setSelectedTileLayer(newTileLayerUrl);
    setSelectedLayer(newTileLayerUrl); // Atualiza o basemap selecionado
  };

  return (
    <>
      <Dialog
        open={isMapStyleDrawerOpen}
        onClose={toggleMapStyleDrawer(false)}
        aria-labelledby="map-style-dialog-title"
        BackdropProps={{ style: { backgroundColor: 'transparent' } }}
        PaperProps={{
          style: {
            position: 'absolute',
            bottom: '50px', // Ajusta a posição vertical, logo acima do botão
            left: sideNavExpanded ? '430px' : '130px', // Ajusta a posição horizontal com base na SideNav
            margin: 0,
          }
        }}
      > 
        <div style={{ width: '250px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: 10, fontWeight: 'bold', fontSize: "1.2rem" }}>Basemap</h3>
          </div>
          <List>
            {tileLayersData.map((layer) => (
              <ListItem 
                key={layer.key} 
                onClick={() => changeMapStyle(layer.url)}
                style={{
                  backgroundColor: selectedLayer === layer.url ? '#f0f0f0' : 'transparent',
                  borderRadius: '8px',
                  marginBottom: '8px',
                }}
              >
                <ListItemIcon>
                  <img 
                    src={layer.thumbnail} 
                    alt={layer.name} 
                    style={{ 
                      width: '40px', 
                      height: '40px',
                      border: selectedLayer === layer.url ? '2px solid blue' : '2px solid transparent',
                      filter: selectedLayer === layer.url ? 'grayscale(50%)' : 'none', 
                      borderRadius: '8px',
                    }} 
                  />
                </ListItemIcon>
                <ListItemText primary={layer.name} />
              </ListItem>
            ))}
          </List>
        </div>
      </Dialog>

      <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000 }}>
        <IconButton
          style={{
            backgroundColor: '#fff',
            boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.3)',
            color: '#000',
            borderRadius: '8px', // Borda levemente arredondada
            width: '40px', // Largura do botão
            height: '40px', // Altura do botão
          }}
          onClick={toggleMapStyleDrawer(true)}
        >
          <MapIcon />
        </IconButton>
      </div>
    </>
  );
};

export default BasemapSelector;

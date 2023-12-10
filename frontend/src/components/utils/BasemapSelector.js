import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

const BasemapSelector = (
    { 
      setSelectedTileLayer,
      tileLayersData,
    }) => {
    const [isMapStyleDrawerOpen, setIsMapStyleDrawerOpen] = useState(false);
  
    const toggleMapStyleDrawer = (open) => () => {
    setIsMapStyleDrawerOpen(open);
  };

    const changeMapStyle = (newTileLayerUrl) => {
    setSelectedTileLayer(newTileLayerUrl);
  };


  return (
    <>
      <Dialog
        open={isMapStyleDrawerOpen}
        onClose={toggleMapStyleDrawer(false)}
        aria-labelledby="map-style-dialog-title"
      >
        <div className="dialog-titlebar">
          <h3>Basemap Gallery</h3>
          <IconButton className="close-button" onClick={toggleMapStyleDrawer(false)}>
            <CloseIcon />
          </IconButton>
        </div>
        <div className="map-styles-container">
          <div className="map-styles">
            {tileLayersData.map((layer) => (
              <div key={layer.key} className="map-style-item" onClick={() => {
                changeMapStyle(layer.url);
              }}>
                <img src={layer.thumbnail} alt={layer.name} />
                <p>{layer.name}</p>
              </div>
            ))}
          </div>
        </div>
      </Dialog>
      <div className='map-style-selector'>
        <a
          className="btn-floating waves-effect waves-light btn-color"
          onClick={toggleMapStyleDrawer(true)}>
          <i className="material-icons">public</i>
        </a>
      </div>
    </>
  );
};

export default BasemapSelector;
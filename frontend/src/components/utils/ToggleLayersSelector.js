// import React, { useState } from 'react';
import React, { useState, useRef } from 'react';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import { ListItemWithStyleControls } from './MapUtils';

const ToggleLayersSelector = (
  {
    geojsons,
    polygonStyles,
    setPolygonStyles,
    visibleGeoJSONs,
    setVisibleGeoJSONs,
    mapInstance,
  }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const geojsonLayerRefs = useRef({});


  const updateStyle = (polygonId, styleKey, value) => {
    setPolygonStyles(prevStyles => ({
      ...prevStyles,
      [polygonId]: {
        ...prevStyles[polygonId],
        [styleKey]: value
      }
    }));
  };

  const toggleDrawer = (open) => () => {
    setIsDrawerOpen(open);
  };

  const zoomToLayer = (geojsonId) => {  
    console.log(Object.keys(geojsonLayerRefs.current));
    const layer = geojsonLayerRefs.current[geojsonId];
    console.log('Referência da Camada:', geojsonLayerRefs.current[geojsonId]);
    console.log('ZOOM TO LAYER', layer, geojsonId, mapInstance)
    if (layer && mapInstance) {
      const bounds = layer.getBounds();
      mapInstance.flyToBounds(bounds);
    }
  };

  return (
    <>
      <Drawer
        anchor={'left'}
        open={isDrawerOpen}
        onClose={toggleDrawer(false)}
        PaperProps={{ className: "drawer-side-bar" }}
      >
        <div className="sidebar-title">Select your vector dataset:</div>
        <List>
          {geojsons.map((geojson) => (
            <ListItemWithStyleControls
              key={geojson.properties.id}
              geojson={geojson}
              updateStyle={updateStyle}
              polygonStyles={polygonStyles}
              visibleGeoJSONs={visibleGeoJSONs}
              setVisibleGeoJSONs={setVisibleGeoJSONs}
              zoomToLayer={zoomToLayer}
            />
          ))}
        </List>
      </Drawer>
      <div className='btn-menu'>
        <a
          className="btn-floating waves-effect waves-light btn-color"
          onClick={toggleDrawer(true)}>
          <i className="material-icons">menu</i>
        </a>
      </div>
    </>
  );
};

export default ToggleLayersSelector;
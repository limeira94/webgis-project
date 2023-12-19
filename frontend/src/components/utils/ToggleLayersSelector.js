// import React, { useState } from 'react';
import React, { useState, useRef } from 'react';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import { ListItemWithStyleControls, ListItemWithStyleControlsRaster } from './MapUtils';

const ToggleLayersSelector = (
  {
    rasters,
    geojsons,
    polygonStyles,
    setPolygonStyles,
    visibleGeoJSONs,
    setVisibleGeoJSONs,
    geojsonLayerRefs,
    mapInstance,
  }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
    const layer = geojsonLayerRefs.current[geojsonId];
    if (layer && mapInstance) {
      const bounds = layer.getBounds();
      mapInstance.flyToBounds(bounds);
    }
  };

  const zoomToLayerRaster = (id) => {
    const raster = rasters[id]


  }

  return (
    <>
      <Drawer
        anchor={'left'}
        open={isDrawerOpen}
        onClose={toggleDrawer(false)}
        PaperProps={{ className: "drawer-side-bar" }}
      >
        {/* <div className="sidebar-title">Select your vector dataset:</div> */}
        <div className="sidebar-title">Your dataset:</div>
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
        <List>
          {rasters.map((raster) => (
            <ListItemWithStyleControlsRaster
            key={raster.id}
            raster={raster}
            // visibleRasters={visibleRasters}
            // setVisibleRasters={setVisibleRasters}
            // zoomToLayerRaster={zoomToLayerRaster}
            />
          ))}
        </List>
      </Drawer>
      <div className='btn-menu'>
        <a
          className="btn-floating waves-effect waves-light black"
          // data-position="left" data-tooltip="enable sidebar"
          onClick={toggleDrawer(true)}>
          <i className="material-icons">menu</i>
        </a>
      </div>
    </>
  );
};

export default ToggleLayersSelector;
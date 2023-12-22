// import React, { useState } from 'react';
import React, { useState, useRef } from 'react';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import L from 'leaflet';
import { ListItemWithStyleControls, ListItemWithStyleControlsRaster } from './MapUtils';

const ToggleLayersSelector = (
  {
    rasters,
    setRasters,
    geojsons,
    polygonStyles,
    setPolygonStyles,
    visibleGeoJSONs,
    rasterStyles,
    setRasterStyles, //Criar meio para atualizar opacidade do raster
    setVisibleGeoJSONs,
    visibleRasters,
    setVisibleRasters,
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

  // const updateRasterStyle = (rasterId, styleKey, value) => {
  //   setRasterStyles(prevStyles => ({
  //     ...prevStyles,
  //     [polygonId]: {
  //       ...prevStyles[polygonId],
  //       [styleKey]: value
  //     }
  //   }));
  // };

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
    const raster = rasters.find(rasterItem => rasterItem.id === id);
    const boundingBox = raster.tiles
    const [minLongitude, minLatitude, maxLongitude, maxLatitude] = boundingBox.split(',').map(Number);
    const centroidLongitude = (minLongitude + maxLongitude) / 2;
    const centroidLatitude = (minLatitude + maxLatitude) / 2;

    var newCenter = L.latLng(centroidLatitude, centroidLongitude);
    if (mapInstance) {
      mapInstance.flyTo(newCenter, 15);
    }


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
            setRasters={setRasters}
            rasters={rasters}
            key={raster.id}
            raster={raster}
            visibleRasters={visibleRasters}
            setVisibleRasters={setVisibleRasters}
            zoomToLayerRaster={zoomToLayerRaster}
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
// import React, { useState } from 'react';
import React, { useState, useEffect, useRef } from 'react';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import {
    parseGeoJSON,
    ListItemWithStyleControls,
    getCenterOfGeoJSON
  } from '../utils/MapUtils';

const BasemapSelector = (
    { 
      geojsons, 
      polygonStyles,
      setPolygonStyles,
      visibleGeoJSONs, 
      setVisibleGeoJSONs, 
      mapInstance,
    }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
//   const [visibleGeoJSONs, setVisibleGeoJSONs] = useState({});
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
    const layer = geojsonLayerRefs.current[geojsonId];
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
      <div className='map-style-selector'>
        <a
          className="btn-floating btn-large waves-effect waves-light green"
          onClick={toggleDrawer(true)}>
          <i className="material-icons">public</i>
        </a>
      </div>
    </>
  );
};

export default BasemapSelector;
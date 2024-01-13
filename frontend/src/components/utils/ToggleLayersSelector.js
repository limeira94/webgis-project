// import React, { useState } from 'react';
import React, { useState, useRef } from 'react';
import L from 'leaflet';
import M from 'materialize-css';
import { useEffect } from 'react';
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

  useEffect(()=>{
    var options = {}
    var elems = document.querySelectorAll('.sidenav');
    M.Sidenav.init(elems, options);
},[])
  

  const toggleDrawer = (open) => () => {
    var elems = document.querySelectorAll('.sidenav');
    var instance = M.Sidenav.getInstance(elems[0]);

    if (open){
      instance.close();
    }
    else{
      instance.open();
    }
    setIsDrawerOpen(!open);
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
      <ul id="slide-out" className="sidenav">
        <div className="sidebar-title">Your dataset:</div>
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
      </ul>
      <div className='btn-menu'>
        <a 
          href="#" 
          data-target="slide-out"
          //TODO: Create way to avoid the problem when clicking outside the sidenav, without this button.
          // className="sidenav-trigger btn-floating waves-effect waves-light black"
          className="btn-floating waves-effect waves-light black"
          onClick={toggleDrawer(isDrawerOpen)}
          >
            <i className="material-icons">menu</i>
        </a>
      </div> 
    </>
  );
};

export default ToggleLayersSelector;
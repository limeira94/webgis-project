import React, { useState, useRef } from 'react';
import L from 'leaflet';
import M from 'materialize-css';
import { useEffect } from 'react';
import { ListItemWithStyleAll } from './MapUtils';

const ToggleLayersSelector = (
  {
    rasters,
    setRasters,
    geojsons,
    setGeojsons,
    geojsonLayerRefs,
    mapInstance,
    selectedFeatureAttributes,
    inmemory=false
  }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const updateStyle = (polygonId, styleKey, value) => {
    setGeojsons(prevGeojsons => {
      return prevGeojsons.map(geojson => {
        if (geojson.data.properties.id === polygonId) {
          const updatedStyle = {
            ...geojson.style,
            [styleKey]: value
          };
          return {
            ...geojson,
            style: updatedStyle
          };
        }
        return geojson;
      });
    });
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
    const raster = rasters.find(rasterItem => rasterItem.data.id === id);
    console.log(raster)
    const boundingBox = raster.data.tiles
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
        {geojsons.map((geojson) => {
          return (
          <ListItemWithStyleAll
          key={`$geojson-item-${geojson.data.properties.id}`}
          datasets={geojsons}
          setDatasets={setGeojsons}
          polygonStyles={geojson.style}
          // polygonStyles={polygonStyles}
          dataset={geojson}
          datatype={"geojson"}
          zoomToLayer={zoomToLayer}
          updateStyle={updateStyle}
          selectedFeatureAttributes={selectedFeatureAttributes}
          inmemory={inmemory}
          />
          )

          })}
        
        {rasters.map((raster) => (
              <ListItemWithStyleAll
              // key={raster.id}
              key={`$raster-item-${raster.data.id}`}
              datasets={rasters}
              setDatasets={setRasters}
              dataset={raster}
              datatype={"raster"}
              zoomToLayer={zoomToLayerRaster}
              inmemory={inmemory}
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
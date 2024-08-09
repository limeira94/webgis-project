import React, { useState, useRef } from 'react';
import { zoomToLayerRaster } from './RasterFunctions';
import { zoomToLayer } from './VectorFunctions';
import { ListItem } from './ListItem';
// import L from 'leaflet';
import M from 'materialize-css';
import { useEffect } from 'react';

const ToggleLayersSelector = (
  {
    rasters,
    setRasters,
    vectors,
    setVectors,
    geojsonLayerRefs,
    mapInstance,
    selectedFeatureAttributes,
    inmemory=false
  }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const updateStyle = (polygonId, styleKey, value) => {
    setVectors(prevGeojsons => {
        return prevGeojsons.map(geojson => {
            if (geojson.data.properties.id === polygonId) {
                const updatedProperties = {
                    ...geojson.data.properties,
                    style: {
                        ...geojson.data.properties.style,
                        [styleKey]: value
                    }
                };
                return {
                    ...geojson,
                    data: {
                        ...geojson.data,
                        properties: updatedProperties
                    }
                };
            }
            return geojson;
        });
    });
};

  useEffect(()=>{
    var options = {}
    var elems = document.querySelectorAll('.sidenav');
    M.Sidenav.init(elems, options);
},[])
  

  return (
    <>
    <div className={`sidenav-toolbar ${isDrawerOpen ? 'active' : ''}`}>
        <ul>
        <div className="sidebar-title">Your dataset:</div>

        {vectors.map((geojson) =>  (

            <ListItem
              key={`$geojson-item-${geojson.data.properties.id}`}
              datasets={vectors}
              setDatasets={setVectors}
              polygonStyles={geojson.style}
              dataset={geojson}
              datatype={"geojson"}
              zoomToLayer={()=>zoomToLayer(geojson.data.properties.id,geojsonLayerRefs,mapInstance)}
              updateStyle={updateStyle}
              selectedFeatureAttributes={selectedFeatureAttributes}
              inmemory={inmemory}
          />
        ))}
        
        {rasters.map((raster) => (
              <ListItem
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
    </div>

    <div className={`btn-menu ${isDrawerOpen ? 'active' : ''}`}>
      <a 
        href="#" 
        className="btn-floating waves-effect waves-light black"
        onClick={()=>setIsDrawerOpen(!isDrawerOpen)}
        >
          <i className="material-icons">
            {isDrawerOpen ? 'keyboard_arrow_left' : 'keyboard_arrow_right'}
          </i>
      </a>
    </div>  

    </>
  );
};

export default ToggleLayersSelector;
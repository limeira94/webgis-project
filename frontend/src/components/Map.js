import React, { useState, useEffect } from 'react';
import { MapComponent } from './utils/MapComponent';

function Map() {
  const [rasters, setRasters] = useState([]);
  const [geojsons, setGeoJSONs] = useState([]);
  
  return (
    <>
      <MapComponent rasters={rasters} geojsons={geojsons} setRasters={setRasters} setGeoJSONs={setGeoJSONs} />
    </>
  )

}

export default Map;
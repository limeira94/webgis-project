import React, { useState, useEffect } from 'react';
import { MapComponent } from './utils/MapComponent';
import M from 'materialize-css';

function Map() {
  const [rasters, setRasters] = useState([]);
  const [geojsons, setGeoJSONs] = useState([]);

  useEffect(() => {
    M.AutoInit();
  }, []);

  return (
    <>
      <MapComponent rasters={rasters} geojsons={geojsons} setRasters={setRasters} setGeoJSONs={setGeoJSONs} />
    </>
  )

}

export default Map;
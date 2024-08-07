import React, { useState, useEffect } from 'react';
import { MapMemory } from './utils/MapMemory';

function Map() {
  const [rasters, setRasters] = useState([]);
  const [geojsons, setGeoJSONs] = useState([]);
  const [vectors, setVectors] = useState([]);
  
  return (
    <>
      <MapMemory rasters={rasters} geojsons={geojsons} setRasters={setRasters} setGeoJSONs={setGeoJSONs} vectors={vectors} setVectors={setVectors}/>
    </>
  )

}

export default Map;
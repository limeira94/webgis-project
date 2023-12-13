import React, { useState, useEffect } from 'react';
import { MapComponent } from './utils/MapComponent';
import { useDispatch,useSelector } from 'react-redux';
import M from 'materialize-css';

import { parseGeoJSON } from './utils/MapUtils';
import {geojson,raster} from '../features/data'

function Map() {
  const [rasters, setRasters] = useState([]);
  const [geojsons, setGeoJSONs] = useState([]);

  // useEffect(() => {
  //   M.AutoInit();
  // }, []);

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(geojson());
    dispatch(raster());
  }, [dispatch]);

  const geojsons_data = useSelector(state => state.data.geojson);
  const rasters_data = useSelector(state => state.data.raster);
  
  useEffect(()=>{
    if (geojsons_data) {
      setGeoJSONs(parseGeoJSON(geojsons_data))
    }
    if (rasters_data){
      console.log(rasters_data)
      setRasters(rasters_data)
    }
  },[geojsons_data])
  
  return (
    <>
      <MapComponent rasters={rasters} geojsons={geojsons} setRasters={setRasters} setGeoJSONs={setGeoJSONs} />
    </>
  )

}

export default Map;
import React, { useState, useEffect } from 'react';
import { MapComponent } from './utils/MapComponent';
import { useDispatch,useSelector } from 'react-redux';
import M from 'materialize-css';

import axios from 'axios'
import { parseGeoJSON } from './utils/MapUtils';

import {geojson,raster} from '../features/data'

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/'

function Map() {
  const [rasters, setRasters] = useState([]);
  const [geojsons, setGeoJSONs] = useState([]);

  useEffect(() => {
    M.AutoInit();
  }, []);

  const dispatch = useDispatch();
    useEffect(() => {
        dispatch(geojson);
      }, [dispatch]); 

  useEffect(() => {
    const getAllGeojsons = async () => {
      try {
        const response = await axios.get(`${API_URL}api/main/geojson/`);
        const parsedGeoJSON = parseGeoJSON(response.data);
        setGeoJSONs(parsedGeoJSON)
      } catch (error) {
        console.error('Error fetching GeoJSON data:', error);
      }
    }

    const getAllRasters = async () => {
      try {
        const response = await axios.get(`${API_URL}api/main/rasters/`);
        setRasters(response.data)
      } catch (error) {
        console.error('Error fetching Raster data:', error);
      }
    }
    // getAllGeojsons();
    // getAllRasters();
  }, []);

  // const dispatch = useDispatch();

  useEffect(() => {
    dispatch(geojson()); // Call geojson as a function
  }, [dispatch]);

  const geojsons_data = useSelector(state => state.data.geojson);
  console.log("geojsonsdata", geojsons_data);
  return (
    <>
      <MapComponent rasters={rasters} geojsons={geojsons} setRasters={setRasters} setGeoJSONs={setGeoJSONs} />
    </>
  )

}

export default Map;
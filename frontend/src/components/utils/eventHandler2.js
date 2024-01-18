import axios from 'axios';
import { getCenterOfGeoJSON } from './MapUtils';
import { upload_geojson,upload_raster } from '../../features/data';
import L from 'leaflet';
import bbox from '@turf/bbox';
import { featureCollection } from '@turf/helpers';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/'

export const handleRaster = async (event,setRasters,mapInstance,dispatch,projectid) => {
    // const formData = new FormData();
    // const file = event.target.files[0];
    // formData.append('raster', file);
    // formData.append('name', file.name);
    // formData.append('user', "1");
    event.preventDefault();
    const file = event.target.files[0];
    event.target.value = null;
  
    try {
      const response = await dispatch(upload_raster({file,projectid}));

      console.log(response)
      if (response.type === 'rasters/upload/fulfilled') {
        const { payload } = response;

        const { bounds, message, raster,lat,lon } = payload;
        
        // const newRaster = raster
        // console.log(newRaster)
        // const newCenter = getCenterOfGeoJSON({
        //   type: 'FeatureCollection',
        //   features: newRaster,
        // });
        var newCenter = L.latLng(lat, lon);

        // setRasters(prevRasters => [...prevRasters, ...newRaster]);

        setRasters(prevRasters => [...prevRasters, raster]);
  
        if (mapInstance) {
          mapInstance.flyTo(newCenter, 15);
        }
      
      }
    } catch (error) {
      console.log(error)
      console.error(error);
    }
};

export const handleGeojson = async (event, setGeoJSONs, setVisibleGeoJSONs, mapInstance, dispatch, projectid) => {
  event.preventDefault();
  const file = event.target.files[0];
  event.target.value = null;

  try {
    const response = await dispatch(upload_geojson({file, projectid}));

    if (response.type === 'geojson/upload/fulfilled') {
      const { payload } = response;
      const { savedGeoJson } = payload;

      // Certifique-se de que savedGeoJson é um array
      const features = Array.isArray(savedGeoJson) ? savedGeoJson : [savedGeoJson];

      // Criar uma FeatureCollection com todas as features
      const featuresCollection = featureCollection(features.map(feature => ({
        type: "Feature",
        geometry: feature.geojson,
        properties: {
          id: feature.id,
          name: feature.name,
          attributes: feature.attributes,
        },
      })));

      const calculatedBounds = bbox(featuresCollection);

      features.forEach(feature => {
        const newGeoJSONId = feature.id;

        setVisibleGeoJSONs(prevVisible => ({
          ...prevVisible,
          [newGeoJSONId]: true
        }));
      });

      if (mapInstance && calculatedBounds) {
        const boundsLatLng = L.latLngBounds(
          [calculatedBounds[1], calculatedBounds[0]],
          [calculatedBounds[3], calculatedBounds[2]]
        );
        mapInstance.flyToBounds(boundsLatLng, { maxZoom: 16 });
      }

      setGeoJSONs(prevGeoJSONs => [...prevGeoJSONs, ...featuresCollection.features]);

    } else {
      console.error('File upload failed with status:', response.type);
      alert('There was an error uploading the file. Please try again.');
    }
  } catch (error) {
    console.error('Error during upload:', error);
    alert('There was an error uploading the file. Please try again.');
  }
};


export const handleDeleteClick = (setGeoJSONs) => {
  axios
    .delete(
      // `http://127.0.0.1:8000/api/main/geojson/`
      `${API_URL}api/main/geojson/`
    )
    .then((response) => {
      console.log('GeoJSON deleted successfully');
      setGeoJSONs([])
      // setGeoJSONs((prevGeojsons) => prevGeojsons.filter((geojson) => geojson.id !== id));
    })
    .catch((error) => {
      console.error('Error deleting GeoJSON:', error);
    });
};


export const handleDeleteRasterClick = (setRasters) => {
  axios
      .delete(
          // `${API_URL}api/main/rasters/delete_all/`
          // `${API_URL}api/main/delete_all_rasters/`
          `${API_URL}api/main/rasters/`
      )
      .then((response) => {
          console.log('All rasters deleted successfully');
          setRasters([])
      })
      .catch((error) => {
          console.error('Error deleting rasters:', error);
      });
};


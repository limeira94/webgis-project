import axios from 'axios';
import { getCenterOfGeoJSON } from './MapUtils';
import { upload_geojson, upload_raster, uploadDraw } from '../../features/data';
import L from 'leaflet';
import bbox from '@turf/bbox';
import { featureCollection } from '@turf/helpers';
import M from 'materialize-css';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/'

export const handleRaster = async (event, setRasters, mapInstance, dispatch, projectid, setUploading) => {

  event.preventDefault();
  const file = event.target.files[0];
  event.target.value = null;

  const maxSize = 100 * 1024 * 1024; // 100MB
  if (file.size > maxSize) {
    M.toast({
      html: "File size exceeds 100MB limit.",
      classes: 'red rounded',
      displayLength: 5000
    });
    return;
  }

  try {
    setUploading(true)
    const response = await dispatch(upload_raster({ file, projectid }));

    if (response.type === 'rasters/upload/fulfilled') {
      const { payload } = response;

      const { bounds, message, raster, lat, lon } = payload;

      // const newRaster = raster
      // console.log(newRaster)
      // const newCenter = getCenterOfGeoJSON({
      //   type: 'FeatureCollection',
      //   features: newRaster,
      // });
      var newCenter = L.latLng(lat, lon);

      // setRasters(prevRasters => [...prevRasters, ...newRaster]);

      setRasters(prevRasters => [...prevRasters, raster]);

      M.toast(
        {
          html: "File uploaded sucessfully.",
          classes: 'green rounded',
          displayLength: 5000
        });

      if (mapInstance) {
        mapInstance.flyTo(newCenter, 15);
      }
    }
    else {
      console.log("Response", response)
      var errorMessage = `${response.error.message}: ${response.payload.message}`
      // console.log("VISH")
      M.toast({
        html: errorMessage,
        classes: 'red rounded',
        displayLength: 10000
      });
    }
    setUploading(false)
  } catch (error) {
    setUploading(false)
    console.log(error)
    M.toast({
      html: error,
      classes: 'red rounded',
      displayLength: 10000
    });
    // console.error(error);
  }
};

export const handleGeojson = async (event, setGeoJSONs, setVisibleGeoJSONs, mapInstance, dispatch, projectid, setUploading) => {
  event.preventDefault();
  const file = event.target.files[0];
  event.target.value = null;

  try {
    setUploading(true)
    const response = await dispatch(upload_geojson({ file, projectid }));

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
      setUploading(false)
    } else {
      setUploading(false)
      console.error('File upload failed with status:', response.type);
      alert('There was an error uploading the file. Please try again.');
    }
  } catch (error) {
    console.error('Error during upload:', error);
    alert('There was an error uploading the file. Please try again.');
  }
};


export const handleDrawUpload = async (geometryJson, setGeoJSONs, setVisibleGeoJSONs, mapInstance, dispatch, projectid, setUploading) => {
  
  try {
    setUploading(true);

    const geometryType = geometryJson.geometry.type;

    const name = prompt("Please enter a name for your geometry:", "New Geometry");
    if (name === null || name === "") {
      alert("You must provide a name to proceed with the upload.");
      setUploading(false);
      return; // Interrompe a execução se nenhum nome for fornecido
    }

    const response = await dispatch(uploadDraw({
      geometry: geometryJson,
      projectid: projectid,
      name: name,
    }));
    if (response.type === 'draw/upload/fulfilled') {

      const { payload } = response;
      const savedGeometry = payload.savedGeometry;

      const feature = {
        type: "Feature",
        geometry: savedGeometry.geojson,
        properties: {
          id: savedGeometry.id,
          name: name,
          attributes: savedGeometry.attributes,
        },
      };

      setGeoJSONs(prevGeoJSONs => [...prevGeoJSONs, feature]);

      setVisibleGeoJSONs(prevVisible => ({
        ...prevVisible,
        [savedGeometry.id]: true
      }));

      if (mapInstance) {
        const bounds = L.geoJSON(feature).getBounds();
        mapInstance.fitBounds(bounds, { maxZoom: 16 });
      }
      setUploading(false);

    } else {
      setUploading(false);
      console.error('Draw upload failed with status:', response.type);
      alert('There was an error uploading the drawing. Please try again.');
    }
  } catch (error) {
    setUploading(false);
    console.error('Error during draw upload:', error);
    alert('There was an error uploading the drawing. Please try again.');
  }
};

function geometryTypeToName(type) {
  const names = {
    'Point': 'Ponto',
    'LineString': 'Linha',
    'Polygon': 'Polígono',
    'MultiPoint': 'Multi Pontos',
    'MultiLineString': 'Multi Linhas',
    'MultiPolygon': 'Multi Polígonos',
  };

  return names[type] || 'Desconhecido';
}


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


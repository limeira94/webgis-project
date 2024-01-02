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

export const handleGeojson = async (event, setGeoJSONs, setVisibleGeoJSONs, mapInstance,dispatch,projectid) => {
  event.preventDefault();
  const file = event.target.files[0];
  event.target.value = null;
  
  try {
    // const formData = new FormData();
    // formData.append('geojson', file);
    // console.log(formData)

    // const response = await dispatch(upload_geojson(formData));

    const response = await dispatch(upload_geojson({file,projectid}));

    // if (response.status === 201) {
    if (response.type === 'geojson/upload/fulfilled') {
      const { payload } = response;
      // Now you can access the properties from the payload
      const { bounds, message, savedGeoJsons } = payload;
      
      // Use the properties as needed
      console.log(bounds);
      console.log(message);
      console.log(savedGeoJsons);

      const newGeoJSON = savedGeoJsons.map(item => ({
        type: "Feature",
        geometry: item.geojson,
        properties: {
          id: item.id,
          name: item.name
        },
      }));
      console.log('A2')
      const featuresCollection = featureCollection(newGeoJSON);
      const calculatedBounds = bbox(featuresCollection);

      console.log(calculatedBounds);

      const newCenter = getCenterOfGeoJSON({
        type: 'FeatureCollection',
        features: newGeoJSON,
      });
      console.log('A3')

      if (mapInstance && calculatedBounds) {
        const boundsLatLng = L.latLngBounds(
          [calculatedBounds[1], calculatedBounds[0]],
          [calculatedBounds[3], calculatedBounds[2]]
        );
        mapInstance.flyToBounds(boundsLatLng, { maxZoom: 16 });
      }
      console.log('A4')

      setGeoJSONs(prevGeoJSONs => [...prevGeoJSONs, ...newGeoJSON]);
      console.log('A5')

    } else {
      // console.log()
      console.error('File upload failed with status:', response.type);
      // console.log('A6',response.status)
      console.error('File upload failed with status:', response.status);
      alert('There was an error uploading the file. Please try again.');
    }

  } catch (error) {
    console.log("A7",error)
    console.error('Error during upload:', error);
    alert('There was an error uploading the file. Please try again.');
  }
} 

export const handleFileChange = async (event,getCenterOfGeoJSON,setGeoJSONs,mapInstance,isAuthenticated) => {
    const file = event.target.files[0];
    event.target.value = null;
    if (file) {
      if (isAuthenticated) {
        try {
          const formData = new FormData();
          formData.append('geojson', file);
          formData.append('user', "1");

          const response = await axios.post(
            `${API_URL}api/main/upload/`
            , formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          if (response.status === 201) {
            const newGeoJSON = response.data.savedGeoJsons.map(item => ({
              type: "Feature",
              geometry: item.geojson,
              properties: {
                id: item.id,
                name: item.name
              },
            }));

            const newCenter = getCenterOfGeoJSON({
              type: 'FeatureCollection',
              features: newGeoJSON,
            });

            if (mapInstance) {
              mapInstance.flyTo(newCenter, 15);
            }

            setGeoJSONs(prevGeoJSONs => [...prevGeoJSONs, ...newGeoJSON]);

          } else {
            console.error('File upload failed with status:', response.status);
            alert('There was an error uploading the file. Please try again.');
          }

        } catch (error) {
          console.error('Error during upload:', error);
          alert('There was an error uploading the file. Please try again.');
        }
      } else {

        const fileName = file.name.split('.')[0];

        const reader = new FileReader();
        reader.onload = (e) => {
          const geojsonData = JSON.parse(e.target.result);

          const featuresWithId = geojsonData.features.map(feature => {
            return {
              type: "Feature",
              geometry: feature.geometry,
              properties: {
                ...feature.properties,
                id: feature.properties?.id || Math.floor(Math.random() * 1000000000),
                name: feature.properties?.name || fileName
              }
            };
          });

          const featureCollection = getCenterOfGeoJSON({
            type: 'FeatureCollection',
            features: featuresWithId,
          });

          if (mapInstance) {
            mapInstance.flyTo(featureCollection, 15);
          }

          setGeoJSONs(prevGeoJSONs => [...prevGeoJSONs, ...featuresWithId]);
        };
        reader.readAsText(file);
      }
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


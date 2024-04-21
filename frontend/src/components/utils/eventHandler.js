import { upload_geojson, upload_raster, uploadDraw } from '../../features/data';
import { createGeojsons } from './ProjectFunctions';
import L from 'leaflet';
import bbox from '@turf/bbox';
import { featureCollection } from '@turf/helpers';
import M from 'materialize-css';
import parse from 'wellknown';

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

      const {
        raster,
        lat,
        lon
      } = payload;

      var newCenter = L.latLng(lat, lon);

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
  }
};

export const handleGeojson = async (event, setGeoJSONs,mapInstance, dispatch, projectid, setUploading) => {
  event.preventDefault();
  const file = event.target.files[0];
  event.target.value = null;

  try {
    setUploading(true)
    const response = await dispatch(upload_geojson({ file, projectid }));
    
    //TODO?: Aqui vai ser preciso verificar essa questão, porque ta usando redux do jeito errado.
    if (response.type === 'geojson/upload/fulfilled') {
      const { payload } = response;
      const { savedGeoJson } = payload;
      console.log("Saved GeoJson", savedGeoJson)
      const features = Array.isArray(savedGeoJson) ? savedGeoJson : [savedGeoJson];

      //TODO: Need to double check if it works in all scenarios
      // Criar uma FeatureCollection com todas as features
      const featuresCollection = featureCollection(features.map(feature => {
        const parts = feature.geojson.split(';');
        const geojson = parts.length > 1 ? parse(parts[1]) : null;
        return ({
          type: "Feature",
          geometry: geojson,
          properties: {
            id: feature.id,
            name: feature.name,
            attributes: feature.attributes,
          },
        })
      }));

      const calculatedBounds = bbox(featuresCollection);

      if (mapInstance && calculatedBounds) {
        const boundsLatLng = L.latLngBounds(
          [calculatedBounds[1], calculatedBounds[0]],
          [calculatedBounds[3], calculatedBounds[2]]
        );
        mapInstance.flyToBounds(boundsLatLng, { maxZoom: 16 });
      }

      const geojsons = createGeojsons(featuresCollection.features)

      setGeoJSONs(prevGeoJSONs => [...prevGeoJSONs, ...geojsons])
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


export const handleDrawUpload = async (
  geometryJson,
  setGeoJSONs,
  mapInstance,
  dispatch,
  projectid,
  setUploading
) => {

  try {
    setUploading(true);

    const name = prompt("Please enter a name for your geometry:", "New Geometry");
    if (name === null || name === "") {
      alert("You must provide a name to proceed with the upload.");
      setUploading(false);
      return;
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

      const geojson = createGeojsons([feature])

      setGeoJSONs(prevGeoJSONs => [...prevGeoJSONs, ...geojson]);

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
  finally {
    setUploading(false);
  }
};

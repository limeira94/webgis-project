import bbox from '@turf/bbox';
// import { createGeojsons } from './ProjectFunctions';
import { createGeojsons } from '../ProjectFunctions';
import L from 'leaflet';


export const UploadToMemory = (event,setGeoJSONs,mapInstance) => {
    const file = event.target.files[0];
    event.target.value = null;

    const fileName = file.name.split('.')[0];

    const reader = new FileReader();
    reader.onload = (e) => {
      const geojsonData = JSON.parse(e.target.result);

      const combinedFeature = createCombinedFeature(geojsonData, fileName);
      const featuresCollection = {
        type: "FeatureCollection",
        features: [combinedFeature]
      };

      const calculatedBounds = bbox(featuresCollection);
      updateMapAndView(calculatedBounds, mapInstance);

      //TODO: verificar se isso aqui não pode dar bug. 

      var geojson = createGeojsons([combinedFeature])  
      setGeoJSONs(prevGeoJSONs => [...prevGeoJSONs, geojson[0]]);
    };
    reader.readAsText(file);
  };

const createCombinedFeature = (geojsonData, fileName) => {
    const geometryTypes = ['Polygon', 'Point', 'Line', 'MultiPolygon', 'MultiPoint', 'MultiLine'];
    for (const type of geometryTypes) {
      const features = geojsonData.features.filter(feature => feature.geometry.type === type);
      if (features.length > 0) {
        return createFeature(type, features, fileName);
      }
    }
    return handleFallbackFeature(geojsonData, fileName);
  };


const createFeature = (type, features, fileName) => {
    const coordinates = features.map(feature => feature.geometry.coordinates);
    const isMultiType = type.startsWith('Multi');
    return {
      type: "Feature",
      geometry: {
        type: isMultiType ? type : `Multi${type}`,
        coordinates: isMultiType ? coordinates.flat(1) : coordinates
      },
      properties: {
        id: Math.floor(Math.random() * 1000000000),
        name: fileName
      }
    };
  };


const handleFallbackFeature = (geojsonData, fileName) => {
    const fallbackFeature = geojsonData.features[0];
    fallbackFeature.properties.name = fileName;
    return fallbackFeature;
  };

const updateMapAndView = (calculatedBounds, mapInstance) => {

    if (mapInstance && calculatedBounds) {
      const boundsLatLng = L.latLngBounds(
        [calculatedBounds[1], calculatedBounds[0]],
        [calculatedBounds[3], calculatedBounds[2]]
      );
      mapInstance.flyToBounds(boundsLatLng, { maxZoom: 16 });
    }
  };
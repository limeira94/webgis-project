import React, { useState, useEffect, useRef } from 'react';
import tileLayersData from './tileLayers.json';
import './Map.css'
import axios from 'axios'

import 'leaflet/dist/leaflet.css';
import {
  MapContainer,
  TileLayer,
  ZoomControl,
  LayersControl,
  GeoJSON
} from 'react-leaflet';
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
var parse = require('wellknown');

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

function parseGeoJSON(data) {
  return data.map(item => ({
    type: 'Feature',
    geometry: parse(item.geojson.split(';')[1]),
    properties: {
      id: item.id,
      name: item.name
    },
  }));
};

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/'

const extractCoordsFromPoint = (coords, lats, longs) => {
  let [long, lat] = coords;
  lats.push(lat);
  longs.push(long);
};

const extractCoordsFromLineOrMultiPoint = (coordinates, lats, longs) => {
  for (let i = 0; i < coordinates.length; i++) {
    extractCoordsFromPoint(coordinates[i], lats, longs);
  }
};

const extractCoordsFromPolygonOrMultiLine = (coordinates, lats, longs) => {
  for (let i = 0; i < coordinates.length; i++) {
    extractCoordsFromLineOrMultiPoint(coordinates[i], lats, longs);
  }
};

const getCenterOfGeoJSON = (geojson) => {
  let lats = [], longs = [];

  geojson.features.forEach((feature) => {
    switch (feature.geometry.type) {
      case 'Point':
        extractCoordsFromPoint(feature.geometry.coordinates, lats, longs);
        break;
      case 'LineString':
      case 'MultiPoint':
        extractCoordsFromLineOrMultiPoint(feature.geometry.coordinates, lats, longs);
        break;
      case 'Polygon':
      case 'MultiLineString':
        extractCoordsFromPolygonOrMultiLine(feature.geometry.coordinates, lats, longs);
        break;
      case 'MultiPolygon':
        feature.geometry.coordinates.forEach(polygon => extractCoordsFromPolygonOrMultiLine(polygon, lats, longs));
        break;
      default:
        break;
    }
  });

  let minLat = Math.min(...lats);
  let maxLat = Math.max(...lats);
  let minLong = Math.min(...longs);
  let maxLong = Math.max(...longs);

  return [(minLat + maxLat) / 2, (minLong + maxLong) / 2];
};

const Homepage = () => {

  const [geojsons, setGeoJSONs] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);

  useEffect(() => {
    console.log("API_URL", API_URL);
    const getAllGeojsons = async () => {
      try {
        const response = await axios.get(
          // 'http://127.0.0.1:8000/api/main/geojson/'
          `${API_URL}api/main/geojson/`
        );

        const parsedGeoJSON = parseGeoJSON(response.data);
        setGeoJSONs(parsedGeoJSON)
      } catch (error) {
        console.error('Error fetching GeoJSON data:', error);
      }
    }

    getAllGeojsons();
  }, []);

  var style = {
    "color": "#ff7800",
    "weight": 5,
    "opacity": 0.65
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    event.target.value = null;
    if (file) {
      try {
        const formData = new FormData();
        formData.append('geojson', file);

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
          console.log('All GeoJSONs:', geojsons);
          console.log('Newly added GeoJSON:', newGeoJSON);
          console.log('Calculated new center:', newCenter);

          if (mapInstance) {
            console.log('Trying to move to:', newCenter)
            mapInstance.flyTo(newCenter, 12);
          }

          console.log('New GeoJSON:', newGeoJSON);

          setGeoJSONs(prevGeoJSONs => [...prevGeoJSONs, ...newGeoJSON]);

        } else {
          console.error('File upload failed with status:', response.status);
          alert('There was an error uploading the file. Please try again.');
        }

      } catch (error) {
        console.error('Error during upload:', error);
        alert('There was an error uploading the file. Please try again.');
      }
    }
  };

  const fileInputRef = useRef(null);

  const handleFileClick = () => {
    fileInputRef.current.click();
  };

  const handleDeleteClick = (id) => {
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

  const tileLayers = tileLayersData.map((layer) => ({
    key: layer.key,
    name: layer.name,
    url: layer.url,
  }));

  return (
    <>
      <div className="file-upload-container">
        <div className="custom-file-input">
          <input
            type="file"
            onChange={handleFileChange}
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept=".geojson, application/geo+json"
          />
          <a className="btn-floating btn-large waves-effect waves-light blue" onClick={handleFileClick}>
            <i className="material-icons">file_upload</i>
          </a>
        </div>
      </div>

      <div className='delete-button'>
        <a className="btn-floating btn-large waves-effect waves-light red " onClick={handleDeleteClick}>
          <i className="material-icons">delete</i>
        </a>
      </div>
      <MapContainer className='map-container'
        ref={(map) => {
          if (map) {
            console.log("Setting map instance");
            setMapInstance(map);
          }
        }}
        center={[51.505, -0.09]}
        zoom={5}
        zoomControl={false}
        maxZoom={20}
        minZoom={2}>
        <LayersControl position="bottomright">
          {tileLayers.map((layer, index) => (
            <LayersControl.BaseLayer checked name={layer.name} key={index}>
              <TileLayer url={layer.url} key={index} />
            </LayersControl.BaseLayer>
          ))}
        </LayersControl>

        {geojsons.map((geojson, index) => (
          <GeoJSON
            key={index}
            data={{
              type: 'FeatureCollection',
              features: [geojson],
            }}
            style={style}
            onEachFeature={(feature, layer) => {

              layer.bindPopup(String(feature.properties.id));
            }}
          />
        ))}
        <ZoomControl position="bottomright" />
      </MapContainer>
    </>
  );
};

export default Homepage;

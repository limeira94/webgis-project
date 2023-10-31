import React, { useState, useEffect, useRef } from 'react';
import tileLayersData from './tileLayers.json';
import './Map.css'
import axios from 'axios'
import { TextField, Slider } from '@mui/material';
import 'leaflet/dist/leaflet.css';
import {
  MapContainer,
  TileLayer,
  ZoomControl,
  LayersControl,
  GeoJSON
} from 'react-leaflet';
import L, { polygon } from 'leaflet';
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

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/'

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
  const [rasters, setRasters] = useState([]);
  const [geojsons, setGeoJSONs] = useState([]);
  const [mapInstance, setMapInstance] = useState(null);
  const [fillColor, setFillColor] = useState("#ff7800");
  const [borderColor, setBorderColor] = useState("#ff7800");
  const [opacity, setOpacity] = useState(0.65);
  const [borderWidth, setBorderWidth] = useState(3);
  const [selectedPolygon, setSelectedPolygon] = useState(null);
  const [polygonStyles, setPolygonStyles] = useState({});
  

  console.log(rasters)

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

    getAllGeojsons();
    getAllRasters();
  }, []);
  
  useEffect(() => {
    if (selectedPolygon) {
      const currentId = selectedPolygon.feature.properties.id;
      setPolygonStyles(prevStyles => ({
        ...prevStyles,
        [currentId]: {
          color: borderColor,
          weight: borderWidth,
          fillOpacity: opacity,
          fillColor: fillColor,
        }
      }));
    }
  }, [borderColor, borderWidth, opacity, fillColor, selectedPolygon]);  

  var style = {
    "color": "#ff7800",
    "weight": 5,
    "opacity": 0.65
  };

  const handleRaster = async (event) => {
    const formData = new FormData();
    formData.append('raster', event.target.files[0]);
    formData.append('name', 'Nothing');
  
    try {
      const response = await axios.post(
        `${API_URL}api/main/rasters/`,
        formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  }

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

  const rasterInputRef = useRef(null);
  const handleFileClickRaster = () => {
    rasterInputRef.current.click();
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
  
  var lyr = L.tileLayer('./{z}/{x}/{y}.png', {
    tms: 1, 
    opacity: 0.7, 
    attribution: "", 
    minZoom: 1, 
    maxZoom: 18
  });


  const tileLayers = tileLayersData.map((layer) => ({
    key: layer.key,
    name: layer.name,
    url: layer.url,
  }));

  return (
    <>
      <div className="style-form-container">
        <div style={{ marginTop: 10, marginBottom: 10 }}>
          <label>Fill Color</label>
          <TextField
            type="color"
            value={fillColor}
            onChange={e => setFillColor(e.target.value)}
            InputProps={{
              style: { height: '30px', width: '100px' }
            }}
          />
        </div>
        <div style={{ marginTop: 10, marginBottom: 10 }}>
          <label>Border Color</label>
          <TextField
            type="color"
            value={borderColor}
            onChange={e => setBorderColor(e.target.value)}
            InputProps={{
              style: { height: '30px', width: '100px' }
            }}
          />
        </div>
        <div style={{ marginTop: 20, marginBottom: 20 }}>
          <label>Opacity</label>
          <Slider
            value={opacity}
            min={0}
            max={1}
            step={0.1}
            onChange={(e, newValue) => setOpacity(newValue)}
            valueLabelDisplay="auto"
          />
        </div>
        <div style={{ marginTop: 20, marginBottom: 20 }}>
          <label>Border Width</label>
          <Slider
            value={borderWidth}
            min={0}
            max={10}
            step={1}
            onChange={(e, newValue) => setBorderWidth(newValue)}
            valueLabelDisplay="auto"
          />
        </div>
      </div>
      <div className="file-upload-container">
        <div className="custom-file-input">
          <input
            type="file"
            onChange={handleFileChange}
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept=".geojson, application/geo+json"
          />
          <a 
            className="btn-floating btn-large waves-effect waves-light blue" 
            onClick={handleFileClick}>
            <i className="material-icons">file_upload</i>
          </a>
        </div>
      </div>

      <div className="raster-upload-container">
        <div className="custom-raster-input">
          <input
            type="file"
            onChange={handleRaster}
            ref={rasterInputRef}
            style={{ display: 'none' }}
            // accept=".tif, application/geo+json"
          />
          <a 
            className="btn-floating btn-large waves-effect waves-light green" 
            onClick={handleFileClickRaster}>
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
            // console.log("Setting map instance");
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
          {rasters.map((raster, index) => (
          <LayersControl.Overlay checked name={raster.name} key={index}>
            <TileLayer url={`${API_URL}${raster.tiles}/{z}/{x}/{y}.png`} tms={1} opacity={1} attribution="" minZoom={1} maxZoom={18} key={index}/>
            {/* <TileLayer url={`${API_URL}${raster.tiles}/{z}/{x}/{y}.png`} key={index} /> */}
          </LayersControl.Overlay>
        ))}
        </LayersControl>

        {geojsons.map((geojson, index) => (
          <GeoJSON
            key={index}
            data={{
              type: 'FeatureCollection',
              features: [geojson],
            }}
            style={(feature) => {
              return polygonStyles[feature.properties.id] || {
                // Estilo padrão para polígonos que ainda não foram selecionados e editados
                color: "#ff7800",
                weight: 3,
                fillOpacity: 0.65,
                fillColor: "#ff7800"
              };
            }}
            
            onEachFeature={(feature, layer) => {
              layer.on('click', () => {
                setSelectedPolygon(layer);
              });
              
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

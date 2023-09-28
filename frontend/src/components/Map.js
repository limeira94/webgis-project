import React, { useState, useEffect, useRef } from 'react';
import tileLayersData from './tileLayers.json';
import M from 'materialize-css';
import './Map.css'
import axios from 'axios'

import 'leaflet/dist/leaflet.css';
import { 
  MapContainer, 
  TileLayer, 
  ZoomControl,
  LayersControl,
  Marker,
  Popup,
  useMap,
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
      id:item.id,
      name: item.name 
    },
  }));
};

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/'

const Homepage = () => {

    const [geojsons, setGeoJSONs] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    
  useEffect(() => {
      console.log("API_URL",API_URL);
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
      
      if (file) {
        try {
          const formData = new FormData();
          formData.append('geojson', file);
  
          const response = await axios.post(
            // 'http://127.0.0.1:8000/api/main/upload/'
            `${API_URL}api/main/upload/`
          , formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
  
          if (response.status === 200) {
            console.log('File uploaded successfully');
          } else {

            // console.error('File upload failed');
          }
        } catch (error) {
          console.log(error)
          // console.error('Error:', error);
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
                      center={[51.505,-0.09]}
                      zoom={5}
                      zoomControl={false}
                      maxZoom={20}
                      minZoom={2}>
        <LayersControl position="bottomright">
          {tileLayers.map((layer, index) => (
            <LayersControl.BaseLayer checked name={layer.name} key={index}>
              <TileLayer url={layer.url} key={index}/>
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
        <ZoomControl position="bottomright"/>
    </MapContainer>
    </>
);
};

export default Homepage;

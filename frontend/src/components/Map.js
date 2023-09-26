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
} from 'react-leaflet';
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

const Homepage = () => {

    const [geojsons, setGeoJSONs] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await fetch('/api/geojson/');
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          setGeoJSONs(data);
        } catch (error) {
          console.error('Error fetching GeoJSON data:', error);
        }
      };
    
      fetchData();
    }, []);

    useEffect(() => {
      const map = useMap();

      const geojsonLayer = L.geoJSON(geojsons, {
      });
      geojsonLayer.addTo(map); 
    
      if (geojsons.length > 0) {
        map.fitBounds(geojsonLayer.getBounds());
      }
    }, [geojsons, map]);
   
    
    // const handleFileChange = (event) => {
    //   const file = event.target.files[0];
    //   setSelectedFile(file);
    //   console.log(file)
    // };
    const handleFileChange = async (event) => {
      const file = event.target.files[0];
      
      if (file) {
        try {
          const formData = new FormData();
          formData.append('geojson', file);
          console.log(file)
  
          const response = await axios.post('http://127.0.0.1:8000/upload-api/', formData, {
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
        <ZoomControl position="bottomright"/>
    </MapContainer>
    </>
);
};

export default Homepage;

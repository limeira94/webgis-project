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
  GeoJSON,
  WMSTileLayer,
  ImageOverlay
} from 'react-leaflet';
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
var parse = require('wellknown');

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});


const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/'

const Map = () => {
  const [rasters, setRasters] = useState([]);
  const [geojsons, setGeoJSONs] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);

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

  var style = {
    "color": "#ff7800",
    "weight": 5,
    "opacity": 0.65
  };

  const fileInputRef = useRef(null);
  const handleFileClick = () => {
    fileInputRef.current.click();
  };

  const rasterInputRef = useRef(null);
  const handleFileClickRaster = () => {
    rasterInputRef.current.click();
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

            {rasters.map((raster, index) => {
              const tileCoordinates = raster.tiles.split(',').map(Number); 
              const [xmin, ymin, xmax, ymax] = tileCoordinates;
              const bounds = [[ymin, xmin], [ymax, xmax]];

              return (
                <LayersControl.Overlay checked name={raster.name} key={index}>
                  <ImageOverlay
                    url={raster.raster}
                    bounds={bounds}
                    opacity={1}
                    zIndex={10}
                  />
                </LayersControl.Overlay>
              );
            })}

          {/* TODO */}
          {/* Código para usar com o geoserver */}
          {/* <LayersControl.Overlay name={"AAAAA"} key={141}>
            <WMSTileLayer
                url="http://localhost:8080/geoserver/webgis/wms"
                params={
                  {
                  srs:"EPSG:4326",
                  format:"image/png",
                  layers:"webgis:coverage_test",
                  transparent: true,
                  opacity:1
                  }
                }
              />
          </LayersControl.Overlay> */}


          {/* TODO */}
          {/* Aqui o código funciona com TILES gerados por gdal2tiles */}
          {/* <TileLayer url={`${API_URL}${raster.tiles}/{z}/{x}/{y}.png`} tms={1} opacity={1} attribution="" minZoom={1} maxZoom={18} key={index}/>  */}
          {/* {rasters.map((raster, index) => (
          <LayersControl.Overlay checked name={raster.name} key={index}>
            
            <WMSTileLayer
                url="http://localhost:8080/geoserver/webgis/wms"
                params={
                  {
                  srs:"EPSG:4326",
                  format:"image/png",
                  layers:"webgis:coverage_test",
                  transparent: true,
                  }
                }
              />
          </LayersControl.Overlay>
        ))} */}
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

export default Map;

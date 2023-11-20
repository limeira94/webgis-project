import React, { useState, useEffect, useRef } from 'react';
import tileLayersData from './tileLayers.json';
import './Map.css'
import axios from 'axios'
import 'leaflet/dist/leaflet.css';

import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
// import ListItem from '@mui/material/ListItem';
// import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
// import Checkbox from '@mui/material/Checkbox';
// import PalleteIcon from '@mui/icons-material/Palette';
// import BorderColorIcon from '@mui/icons-material/BorderColor';

import {
  MapContainer,
  TileLayer,
  ZoomControl,
  LayersControl,
  GeoJSON,
  // WMSTileLayer,
  ImageOverlay
} from 'react-leaflet';

import {
  parseGeoJSON,
  // StyleControls,
  ListItemWithStyleControls,
  // API_URL,
  // extractCoordsFromPoint,
  // extractCoordsFromLineOrMultiPoint,
  // extractCoordsFromPolygonOrMultiLine,
  getCenterOfGeoJSON
} from './utils/MapUtils';

import {
  handleRaster,
  handleFileChange,
  // handleFileClick,
  // handleFileClickRaster,
  handleDeleteClick,
  handleDeleteRasterClick
} from './utils/eventHandler';

import L from 'leaflet';
import M from 'materialize-css';

import 'leaflet-control-geocoder/dist/Control.Geocoder.js';

import "react-leaflet-fullscreen/styles.css";
import { FullscreenControl } from 'react-leaflet-fullscreen';

import 'leaflet.browser.print/dist/leaflet.browser.print.min.js';

delete L.Icon.Default.prototype._getIconUrl;


L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});












const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/'



const Map = () => {
  const [rasters, setRasters] = useState([]);
  const [geojsons, setGeoJSONs] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedPolygon, setSelectedPolygon] = useState(null);
  const [polygonStyles, setPolygonStyles] = useState({});
  const [visibleGeoJSONs, setVisibleGeoJSONs] = useState({});
  // const [selectedFile, setSelectedFile] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const geojsonLayerRefs = useRef({});

  useEffect(() => {
    if (mapInstance) {
      L.Control.geocoder().addTo(mapInstance);

      L.control.browserPrint({ position: 'topright' }).addTo(mapInstance);

    }
  }, [mapInstance]);
  // console.log(rasters)

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

  useEffect(()=>{
    var options = {
      direction: 'left'
    }
    document.addEventListener('DOMContentLoaded', function() {
      var elems = document.querySelectorAll('.fixed-action-btn');
      M.FloatingActionButton.init(elems, options);
    });
  },[]);

  useEffect(() => {
    var options = {
      direction: 'left'
    }
    // let parallaxElems = document.querySelectorAll('.parallax');
    let elems = document.querySelectorAll('.fixed-action-btn');
    // M.Parallax.init(parallaxElems);
    M.FloatingActionButton.init(elems, options);

    var elems2 = document.querySelectorAll('.tooltipped');
    M.Tooltip.init(elems2, {});

  }, [
    // products
  ]);

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setIsDrawerOpen(open);
  };

  const zoomToLayer = (geojsonId) => {
    const layer = geojsonLayerRefs.current[geojsonId];
    // console.log("Layer ref:", layer);
    if (layer && mapInstance) {
      const bounds = layer.getBounds();
      mapInstance.flyToBounds(bounds);
    }
  };

  const updateStyle = (polygonId, styleKey, value) => {
    setPolygonStyles(prevStyles => ({
      ...prevStyles,
      [polygonId]: {
        ...prevStyles[polygonId],
        [styleKey]: value
      }
    }));
  };


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
    <Drawer
        anchor={'left'}
        open={isDrawerOpen}
        onClose={toggleDrawer(false)}
        PaperProps={{ className: "drawer-side-bar" }}
      > 
        <div className="sidebar-title">Select your vector dataset:</div>
        <List>
          {geojsons.map((geojson) => (
            <ListItemWithStyleControls
              key={geojson.properties.id}
              geojson={geojson}
              updateStyle={updateStyle}
              polygonStyles={polygonStyles}
              visibleGeoJSONs={visibleGeoJSONs}
              setVisibleGeoJSONs={setVisibleGeoJSONs}
              zoomToLayer={zoomToLayer}
            />
          ))}
        </List>
      </Drawer>
      <div className='top-bar'>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={toggleDrawer(true)}
        >
          <MenuIcon />
        </IconButton>
      </div>
     
      <div className="fixed-action-btn file-upload-container custom-file-input">
        <a className="btn-floating btn-large red">
          <i className="large material-icons">attach_file</i>
        </a>
        <ul>
          <li><a className="btn-floating waves-effect waves-light green tooltipped" data-position="bottom" data-tooltip="Delete all rasters" onClick={()=>handleDeleteClick(setGeoJSONs)}><i className="material-icons">delete</i></a></li>
          <li><a className="btn-floating waves-effect waves-light blue tooltipped" data-position="bottom" data-tooltip="Delete all vectors" onClick={()=>handleDeleteRasterClick(setRasters)}><i className="material-icons">delete</i></a></li>
          <li>
            <div className="raster-upload-container">
        <div>
          <input
            type="file"
            onChange={handleRaster}
            ref={rasterInputRef}
            style={{ display: 'none' }}
            // accept=".tif, application/geo+json"
          />
          <a
            className="btn-floating waves-effect waves-light green tooltipped" data-position="bottom" data-tooltip="Upload raster"
            onClick={handleFileClickRaster}>
            <i className="material-icons">file_upload</i>
          </a>
        </div>
      </div></li>
          <li><div>
        <div>
          <input
            type="file"
            // onChange={handleFileChange}
            onChange={(event) => handleFileChange(event, getCenterOfGeoJSON,geojsons,setGeoJSONs,mapInstance)}
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept=".geojson, application/geo+json"
          />
          <a
            className="btn-floating waves-effect waves-light blue tooltipped" data-position="bottom" data-tooltip="Upload geojson"
            onClick={handleFileClick}>
            <i className="material-icons">file_upload</i>
          </a>
        </div>
      </div></li>
        </ul> 
      </div>
      <div className='delete-button'>
        <a href="/" className="btn-floating btn-large waves-effect waves-light black " onClick={handleDeleteClick}>
          <i className="material-icons">home</i>
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
        <FullscreenControl position="bottomright" />
        <ZoomControl position="bottomright" />
      </MapContainer>
    </>
  );
};

export default Map;

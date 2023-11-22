import React, { useState, useEffect, useRef} from 'react';
import tileLayersData from './tileLayers.json';
import './Map.css'
import axios from 'axios'
import 'leaflet/dist/leaflet.css';

import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Checkbox from '@mui/material/Checkbox';
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

import L from 'leaflet';
import M from 'materialize-css';

import 'leaflet-control-geocoder/dist/Control.Geocoder.js';

import "react-leaflet-fullscreen/styles.css";
import { FullscreenControl } from 'react-leaflet-fullscreen';

import 'leaflet.browser.print/dist/leaflet.browser.print.min.js';

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

const StyleControls = ({ geojson, updateStyle, polygonStyles }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', paddingLeft: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <span style={{ textAlign: 'left', flexGrow: 1 }}>Fill Color</span>
        <input
          type="color"
          value={polygonStyles[geojson.properties.id]?.fillColor || "#ff0000"}
          onChange={e => updateStyle(geojson.properties.id, "fillColor", e.target.value)}
          style={{ width: '30px', height: '30px', border: '1px solid #ddd', borderRadius: '4px' }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{ textAlign: 'left', flexGrow: 1 }}>Line Color</span>
        <input
          type="color"
          value={polygonStyles[geojson.properties.id]?.color || "#ff0000"}
          onChange={e => updateStyle(geojson.properties.id, "color", e.target.value)}
          style={{ width: '30px', height: '30px', border: '1px solid #ddd', borderRadius: '4px' }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ textAlign: 'left', flexGrow: 1, marginRight: '15px' }}>Fill Opacity</span>
        <input
          type="range"
          min="0" max="1" step="0.1"
          value={polygonStyles[geojson.properties.id]?.fillOpacity || 0.65}
          onChange={e => updateStyle(geojson.properties.id, "fillOpacity", e.target.value)}
          style={{ width: '80px', height: '30px'}}
        />
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ textAlign: 'left', flexGrow: 1 }}>Line Size</span>
        <input
          type="range"
          min="0" max="10" step="1"
          value={polygonStyles[geojson.properties.id]?.weight || 3}
          onChange={e => updateStyle(geojson.properties.id, "weight", e.target.value)}
          style={{ width: '80px', height: '30px'}}
        />
      </div>
    </div>
  );
};

const ListItemWithStyleControls = ({ geojson, updateStyle, polygonStyles, visibleGeoJSONs, setVisibleGeoJSONs, zoomToLayer }) => {
  const [showStyleControls, setShowStyleControls] = useState(false);

  const handleVisibilityChange = (id, isVisible) => {
    setVisibleGeoJSONs(prev => ({ ...prev, [id]: isVisible }));
  };

  const handleToggleClick = () => {
    setShowStyleControls(!showStyleControls);
  };

  return (
    <ListItem key={geojson.properties.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button className="dropdown-button" onClick={handleToggleClick}>
          <span className="material-icons">arrow_drop_down</span>
        </button>
        <button className='zoom-button' onClick={() => zoomToLayer(geojson.properties.id)}>
          <span className="material-icons">zoom_in_map</span>
        </button>
        <Checkbox
          checked={visibleGeoJSONs[geojson.properties.id] ?? false}
          onClick={() => handleVisibilityChange(geojson.properties.id, !(visibleGeoJSONs[geojson.properties.id] ?? false))}
        />
        <ListItemText primary={` Dado ${geojson.properties.id} `} />
      </div>
      {showStyleControls && (
        <div style={{ marginTop: '10px' }}>
          <StyleControls
            geojson={geojson}
            updateStyle={updateStyle}
            polygonStyles={polygonStyles}
          />
        </div>
      )}
    </ListItem>
  );
};

const Map = () => {
  const [rasters, setRasters] = useState([]);
  const [geojsons, setGeoJSONs] = useState([]);
  // const [selectedFile, setSelectedFile] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [selectedPolygon, setSelectedPolygon] = useState(null);
  const [polygonStyles, setPolygonStyles] = useState({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [visibleGeoJSONs, setVisibleGeoJSONs] = useState({});
  const geojsonLayerRefs = useRef({});

  // console.log(rasters)
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
        setGeoJSONs(parsedGeoJSON);

        const initialVisibility = {};
        parsedGeoJSON.forEach(geojson => {
          initialVisibility[geojson.properties.id] = true; // ou true, se quiser que estejam visíveis por padrão
        });
        setVisibleGeoJSONs(initialVisibility);
      } catch (error) {
        console.error('Error fetching GeoJSON data:', error);
      }
    };

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

  const handleRaster = async (event) => {
    const formData = new FormData();
    const file = event.target.files[0];
    formData.append('raster', file);
    formData.append('name', file.name);
  
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

      // mapInstance.flyTo(newCenter, 12);
      // mapInstance.flyTo([40.730610, -73.935242], 15)
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

  const tileLayers = tileLayersData.map((layer) => ({
    key: layer.key,
    name: layer.name,
    url: layer.url,
  }));

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

  const defaultStyle = {
    color: "#ff7800",
    weight: 3,
    fillOpacity: 0.65,
    fillColor: "#ff7800"
  };

  return (
    <>
      <Drawer
        anchor={'left'}
        open={isDrawerOpen}
        onClose={toggleDrawer(false)}
        PaperProps={{ classname: "drawer-side-bar" }}
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
      <div className="file-upload-container">
        <div className="custom-file-input">
          <input
            type="file"
            onChange={handleFileChange}
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept=".geojson, application/geo+json"
          />
          <a href="/#" 
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
          <a href="/#"
            className="btn-floating btn-large waves-effect waves-light green" 
            onClick={handleFileClickRaster}>
            <i className="material-icons">file_upload</i>
          </a>
        </div>
      </div>

      <div className='delete-button'>
        <a href="/#" className="btn-floating btn-large waves-effect waves-light red " onClick={handleDeleteClick}>
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

        {geojsons.map((geojson, index) => {
          const isVisible = visibleGeoJSONs[geojson.properties.id];
          return isVisible && (
            <GeoJSON
              key={index}
              ref={(el) => {
                if (el) {
                  geojsonLayerRefs.current[geojson.properties.id] = el;
                }
              }}
              data={{
                type: 'FeatureCollection',
                features: [geojson],
              }}
              style={(feature) => polygonStyles[feature.properties.id] || defaultStyle}

              onEachFeature={(feature, layer) => {
                layer.on('click', () => {
                  setSelectedPolygon(layer);
                });

                layer.bindPopup(String(feature.properties.id));
              }}
            />
          )
        })}
        <FullscreenControl position="bottomright" />
        <ZoomControl position="bottomright" />

      </MapContainer>
    </>
  );
};

export default Map;

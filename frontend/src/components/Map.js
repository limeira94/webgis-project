import React, { useState, useEffect, useRef } from 'react';
import tileLayersData from './tileLayers.json';
import './Map.css'
import axios from 'axios'
import 'leaflet/dist/leaflet.css';

import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';

import {
  MapContainer,
  TileLayer,
  ZoomControl,
  LayersControl,
  GeoJSON,
  ImageOverlay
} from 'react-leaflet';

import {
  parseGeoJSON,
  ListItemWithStyleControls,
  getCenterOfGeoJSON
} from './utils/MapUtils';

import {
  handleRaster,
  handleFileChange,
  handleDeleteClick,
  handleDeleteRasterClick
} from './utils/eventHandler';

import L from 'leaflet';
import M from 'materialize-css';

import 'leaflet-control-geocoder/dist/Control.Geocoder.js';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';

import "react-leaflet-fullscreen/styles.css";
import { FullscreenControl } from 'react-leaflet-fullscreen';

import 'leaflet.browser.print/dist/leaflet.browser.print.min.js';

import 'leaflet-measure/dist/leaflet-measure.css';
import 'leaflet-measure/dist/leaflet-measure.js';

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
  const [mapInstance, setMapInstance] = useState(null);
  const geojsonLayerRefs = useRef({});

  // TODO
  // Add again

  useEffect(() => {
    if (mapInstance) {
      L.Control.geocoder().addTo(mapInstance);
      L.control.browserPrint({position:"topright"}).addTo(mapInstance);
      L.Control.Measure.include({
        // set icon on the capture marker
        _setCaptureMarkerIcon: function () {
          // disable autopan
          this._captureMarker.options.autoPanOnFocus = false;
      
          // default function
          this._captureMarker.setIcon(
            L.divIcon({
              iconSize: this._map.getSize().multiplyBy(2)
            })
          );
        },
      });
      L.control.measure({
        position:"topright", 
        primaryLengthUnit: 'meters', 
        secondaryLengthUnit: undefined,
        primaryAreaUnit: 'sqmeters', 
        secondaryAreaUnit: undefined
       }).addTo(mapInstance);
      // {left: 10, top: 40}
    }
  }, [mapInstance]);

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


  const defaultStyle = {
    color: "#ff7800",
    weight: 3,
    fillOpacity: 0.65,
    fillColor: "#ff7800"
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

      <div className='btn-menu'>
        <a 
          className="btn-floating btn-large waves-effect waves-light blue" 
          onClick={toggleDrawer(true)}>
          <i className="material-icons">menu</i>
        </a>
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
        <a href="/" className="btn-floating btn-large waves-effect waves-light black ">
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
                if (feature.geometry.type !== 'Point') {  
                  layer.on('click', () => {
                    setSelectedPolygon(layer);
                  });

                layer.bindPopup(String(feature.properties.id));
                  
                }
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

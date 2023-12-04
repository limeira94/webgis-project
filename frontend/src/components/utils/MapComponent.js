import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import tileLayersData from '../tileLayers.json';
import defaultStyle from "./defaultStyle.json";

import './MapComponent.css'
import 'leaflet/dist/leaflet.css';

import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Dialog from '@mui/material/Dialog';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

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
} from '../utils/MapUtils';

// TODO:
// IMPLEMENTAR ISSO
import BasemapSelector from './BasemapSelector';

import L from 'leaflet';

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

export const MapComponent = ({
    rasters,
    geojsons
}) => {
    const [mapInstance, setMapInstance] = useState(null);

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isMapStyleDrawerOpen, setIsMapStyleDrawerOpen] = useState(false);

    const [selectedTileLayer, setSelectedTileLayer] = useState(tileLayersData[0].url);
    const [visibleGeoJSONs, setVisibleGeoJSONs] = useState({});
    const [polygonStyles, setPolygonStyles] = useState({});
    const [selectedPolygon, setSelectedPolygon] = useState(null);

    const geojsonLayerRefs = useRef({});


    // #####################################################################################33
    // TODO:
    // Quero remover todas essas funções aqui e inserir dentro do "Basemapselector.js" e outros códigos se der
    const toggleDrawer = (open) => () => {
      setIsDrawerOpen(open);
    };
    const toggleMapStyleDrawer = (open) => () => {
      setIsMapStyleDrawerOpen(open);
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

    const zoomToLayer = (geojsonId) => {
      const layer = geojsonLayerRefs.current[geojsonId];
      if (layer && mapInstance) {
        const bounds = layer.getBounds();
        mapInstance.flyToBounds(bounds);
      }
    };

    const changeMapStyle = (newTileLayerUrl) => {
      setSelectedTileLayer(newTileLayerUrl);
    };

    // Até aqui
    // #####################################################################################33







    // TODO:
    // Isso aqui vai virar o BasemapSelector
    const choose_basemaps = <>
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
      <div className='map-style-selector'>
        <a
          className="btn-floating btn-large waves-effect waves-light green"
          onClick={toggleMapStyleDrawer(true)}>
          <i className="material-icons">public</i>
        </a>
      </div>
    </>








    // TODO:
    // Esse vai virar outro componente separado
    const toggle_layers = <>
    <Dialog
        open={isMapStyleDrawerOpen}
        onClose={toggleMapStyleDrawer(false)}
        aria-labelledby="map-style-dialog-title"
      >
        <div className="dialog-titlebar">
          <h3>Basemap Gallery</h3>
          <IconButton className="close-button" onClick={toggleMapStyleDrawer(false)}>
            <CloseIcon />
          </IconButton>
        </div>
        <div className="map-styles-container">
          <div className="map-styles">
            {tileLayersData.map((layer) => (
              <div key={layer.key} className="map-style-item" onClick={() => {
                changeMapStyle(layer.url);
                // toggleMapStyleDrawer(false)(); // Close drawer after selection
              }}>
                <img src={layer.thumbnail} alt={layer.name} />
                <p>{layer.name}</p>
              </div>
            ))}
          </div>
        </div>
      </Dialog>

      <div className='btn-menu'>
        <a
          className="btn-floating btn-large waves-effect waves-light blue"
          onClick={toggleDrawer(true)}>
          <i className="material-icons">menu</i>
        </a>
      </div>
    </>



      // TODO:
      // Mais um componente a ser desenvolvido separadamente

  //   const upload_delete_layers = <>
  //   <div className="fixed-action-btn file-upload-container custom-file-input">
  //       <a className="btn-floating btn-large red">
  //         <i className="large material-icons">attach_file</i>
  //       </a>
  //       <ul>
  //         <li><a className="btn-floating waves-effect waves-light green tooltipped" data-position="bottom" data-tooltip="Delete all rasters" onClick={() => handleDeleteClick(setGeoJSONs)}><i className="material-icons">delete</i></a></li>
  //         <li><a className="btn-floating waves-effect waves-light blue tooltipped" data-position="bottom" data-tooltip="Delete all vectors" onClick={() => handleDeleteRasterClick(setRasters)}><i className="material-icons">delete</i></a></li>
  //         <li>
  //           <div className="raster-upload-container">
  //             <div>
  //               <input
  //                 type="file"
  //                 onChange={handleRaster}
  //                 ref={rasterInputRef}
  //                 style={{ display: 'none' }}
  //               // accept=".tif, application/geo+json"
  //               />
  //               <a
  //                 className="btn-floating waves-effect waves-light green tooltipped" data-position="bottom" data-tooltip="Upload raster"
  //                 onClick={handleFileClickRaster}>
  //                 <i className="material-icons">file_upload</i>
  //               </a>
  //             </div>
  //           </div></li>
  //         <li><div>
  //           <div>
  //             <input
  //               type="file"
  //               onChange={(event) => handleFileChange(event, getCenterOfGeoJSON, setGeoJSONs, mapInstance, isAuthenticated)}
  //               ref={fileInputRef}
  //               style={{ display: 'none' }}
  //               accept=".geojson, application/geo+json"
  //             />
  //             <a
  //               className="btn-floating waves-effect waves-light blue tooltipped" data-position="bottom" data-tooltip="Upload geojson"
  //               onClick={handleFileClick}>
  //               <i className="material-icons">file_upload</i>
  //             </a>
  //           </div>
  //         </div></li>
  //       </ul>
  //     </div>
  //     <div className='delete-button'>
  //       <a href="/" className="btn-floating btn-large waves-effect waves-light black ">
  //         <i className="material-icons">home</i>
  //       </a>
  //     </div>
  // </>




  // TODO:
  // Assim fica bem mais organizado se conseguirmos fazer, dai a gente pode até inserir ou não dependendo
  // De alguma variavel, por exemplo, casos emque não queremos inserir o "upload_delete_layers", basta
  // colocar uma variavel de input lá em cima e quando for gerar o MapComponent, incluir isso ou não

    return (
    <>


      {/* <BasemapSelector
        geojsons={geojsons}
        updateStyle={updateStyle}
        polygonStyles={polygonStyles}
        visibleGeoJSONs={visibleGeoJSONs}
        setVisibleGeoJSONs={setVisibleGeoJSONs}
        zoomToLayer={zoomToLayer}
      /> */}
      {choose_basemaps}



      {toggle_layers}



      {/* {upload_delete_layers} */}



      <MapContainer className='map-container'
        ref={(map) => {
          if (map) {
            setMapInstance(map);
          }
        }}
        center={[51.505, -0.09]}
        zoom={5}
        zoomControl={false}
        maxZoom={20}
        minZoom={2}>

        <TileLayer url={selectedTileLayer} />

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


          {/* TODO? */}
          {/* NÃO deletar código comentado aqui, vai ser util mais pra frente. */}




          

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

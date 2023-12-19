import React, { useState, useEffect, useRef } from 'react';
import tileLayersData from './tileLayers.json';
import defaultStyle from "./defaultStyle.json";
import './MapComponent.css'
import 'leaflet/dist/leaflet.css';
import {
  MapContainer,
  TileLayer,
  ZoomControl,
  LayersControl,
  GeoJSON,
  ImageOverlay,
  ScaleControl,
} from 'react-leaflet';
import BasemapSelector from './BasemapSelector';
import ToggleLayersSelector from './ToggleLayersSelector'
// import UpDelButttons from './UploadAndDeleteButtons2';
import UpDelButttons from './UploadAndDeleteButtons2';
import { leafletDefaultButtons } from './LeafletButtons';
import L from 'leaflet';
import M from 'materialize-css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.js';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import "react-leaflet-fullscreen/styles.css";
import { FullscreenControl } from 'react-leaflet-fullscreen';
import 'leaflet.browser.print/dist/leaflet.browser.print.min.js';
import 'leaflet-measure/dist/leaflet-measure.css';
import 'leaflet-measure/dist/leaflet-measure.js';

import { getCenterOfGeoJSON } from './MapUtils';

delete L.Icon.Default.prototype._getIconUrl;


L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

export const MapComponent = ({
  rasters,
  geojsons,
  setRasters,
  setGeoJSONs,
  projectid=null,
  savetomemory=true
}) => {
  const [selectedTileLayer, setSelectedTileLayer] = useState(tileLayersData[0].url);
  const [visibleGeoJSONs, setVisibleGeoJSONs] = useState({});
  const [polygonStyles, setPolygonStyles] = useState({});
  const [selectedPolygon, setSelectedPolygon] = useState(null);
  const [buttonsCreated, setButtonsCreated] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const geojsonLayerRefs = useRef({});
  const rasterLayerRefs = useRef({});
  const [mapInstance, setMapInstance] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
      M.AutoInit();
    }, []);

  useEffect(() => {
    leafletDefaultButtons({
      mapInstance: mapInstance,
      buttonsCreated: buttonsCreated,
      setButtonsCreated: setButtonsCreated
    });
  }, [mapInstance, buttonsCreated, setButtonsCreated]);


  // ############################################################################################################################################################
  // TODO:
  // Coloquei um esboço da ideia da função para fazer upload só para a memória, precisa finalizar
  // Depois temos que mandar essa função para outro lugar e importar ela apenas

  const uploadToMemory = (event) => {

    const file = event.target.files[0];
    event.target.value = null;

    const reader = new FileReader();
        reader.onload = (e) => {
          const geojsonData = JSON.parse(e.target.result);

          const featuresWithId = geojsonData.features.map(feature => {
            return {
              type: "Feature",
              geometry: feature.geometry,
              properties: {
                ...feature.properties,
                id: feature.properties?.id || Math.floor(Math.random() * 1000000000),
                name: feature.properties?.name || 'Untitled'
              }
            };
          });

          const newGeoJSONIds = featuresWithId.map(feature => feature.properties.id);
          setVisibleGeoJSONs(prevVisible => {
            const updatedVisibility = { ...prevVisible };
            newGeoJSONIds.forEach(id => {
              updatedVisibility[id] = true;
            });
            return updatedVisibility;
          });

          const featureCollection = getCenterOfGeoJSON({
            type: 'FeatureCollection',
            features: featuresWithId,
          });

          if (mapInstance) {
            mapInstance.flyTo(featureCollection, 15);
          }

          setGeoJSONs(prevGeoJSONs => [...prevGeoJSONs, ...featuresWithId]);
        };
        reader.readAsText(file);

  }

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const memoryButton = <>
    <a onClick={handleButtonClick} className='btn-floating waves-effect waves-light  upload-geo-button'>
      <i className="small material-icons">file_upload</i>
      <input
        type="file"
        onChange={uploadToMemory}
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".geojson, application/geo+json"
        />
    </a>
  </>
  var url = process.env.REACT_APP_API_URL
  console.log("URL",url)

  // ############################################################################################################################################################


  const MapItem = <>
    <MapContainer className='map-container'
      ref={(map) => {
        if (map) {
          setMapInstance(map);
        }
      }}
      center={[51.505, -0.09]}
      zoom={5}
      zoomControl={false}
      maxZoom={18}
      minZoom={2}>

      <TileLayer url={selectedTileLayer} />

      {rasters.map((raster, index) => {
        const tileCoordinates = raster.tiles.split(',').map(Number);
        // console.log(raster.raster)
        
        const [xmin, ymin, xmax, ymax] = tileCoordinates;
        const bounds = [[ymin, xmin], [ymax, xmax]];
        return (
        // <LayersControl.Overlay checked name={raster.name} key={index}>
            <ImageOverlay
              url={url + raster.raster} 
              bounds={bounds}
              opacity={1}
              zIndex={1000}
              key={index}
            />
        // </LayersControl.Overlay>
        );
      })}
      
      {/* in memory raster */}
      {/* <ImageOverlay
              url={'file:///media/felipe/3dbf30eb-9bce-46d8-a833-ec990ba72625/Documentos/projetos_pessoais/webgis-project/backend/tests/data/rasters/SAR/ICEYE_X12_QUICKLOOK_SLH_2155354_20230513T171831_modified5.tif'}
              bounds={bounds}
              opacity={1}
              zIndex={10}
            /> */}

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
      <ScaleControl position="bottomleft" />
      <FullscreenControl className="custom-fullscreen-control" position="bottomright" />
      <ZoomControl position="bottomright" />
    </MapContainer>

  </>

  return (
    <>
      <ToggleLayersSelector
        rasters={rasters}
        geojsons={geojsons}
        polygonStyles={polygonStyles}
        setPolygonStyles={setPolygonStyles}
        visibleGeoJSONs={visibleGeoJSONs}
        setVisibleGeoJSONs={setVisibleGeoJSONs}
        geojsonLayerRefs={geojsonLayerRefs}
        mapInstance={mapInstance}
      />

      <BasemapSelector
        setSelectedTileLayer={setSelectedTileLayer}
        tileLayersData={tileLayersData}
      />

      {savetomemory ? memoryButton:(
        <UpDelButttons
        setGeoJSONs={setGeoJSONs}
        setRasters={setRasters}
        mapInstance={mapInstance}
        setVisibleGeoJSONs={setVisibleGeoJSONs}
        projectid={projectid}
      />
      )}
      

      <div className='home-button-map'>
        <a href="/" className="btn-floating waves-effect waves-light black">
          <i className="material-icons tiny">home</i>
        </a>
      </div>

      {MapItem}

    </>
  );
};

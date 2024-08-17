import React, { useState, useEffect, useRef } from 'react';
import tileLayersData from '../../configs/tileLayers.json';
import '../../styles/MapComponent.css'
import 'leaflet/dist/leaflet.css';
import {
  MapContainer,
  TileLayer,
  ZoomControl,
  GeoJSON,
  ImageOverlay,
  ScaleControl,
} from 'react-leaflet';
import BasemapSelector from './BasemapSelector';
import ToggleLayersSelector from '../sidenav/ToggleLayersSelector';
import UpDelButttons from './UploadAndDeleteButtons';
import MemoryButton from './Memory/component';
import { leafletDefaultButtons } from './LeafletButtons';
import L from 'leaflet';
// import 'leaflet-draw';
// import 'leaflet-draw/dist/leaflet.draw.css';
import M from 'materialize-css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.js';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import "react-leaflet-fullscreen/styles.css";
import { FullscreenControl } from 'react-leaflet-fullscreen';
import 'leaflet.browser.print/dist/leaflet.browser.print.min.js';
import 'leaflet-measure/dist/leaflet-measure.css';
import 'leaflet-measure/dist/leaflet-measure.js';
import { handleDropGeojson, handleGeojson } from './eventHandler';
import { useDispatch } from 'react-redux';
import { UploadToMemoryDrop } from './Memory/eventHandlers';
import MouseCoordinates from './MouseCoordinates';

delete L.Icon.Default.prototype._getIconUrl;


L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

export const MapComponent = ({
  rasters,
  setRasters,
  vectors,
  setVectors,
  projectid = null,
  project = null,
  savetomemory = true
}) => {
  const [selectedTileLayer, setSelectedTileLayer] = useState(tileLayersData[0].url);
  const [buttonsCreated, setButtonsCreated] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  const [selectedFeatureAttributes, setSelectedFeatureAttributes] = useState(null);
  const [modalData, setModalData] = useState([]);
  const [uploading, setUploading] = useState(false)

  const [changeStyleData,setChangeStyleData] = useState(null)

  const geojsonLayerRefs = useRef({});
  const fileInputRef = useRef(null);

  const defaultCenter = [50.640, 10.553]; 
  const defaultZoom = 5;

  useEffect(() => {
    M.AutoInit();
    const elems = document.querySelectorAll('.modal');
    M.Modal.init(elems);
  }, []);

  useEffect(() => {
    leafletDefaultButtons({
      mapInstance: mapInstance,
      buttonsCreated: buttonsCreated,
      setButtonsCreated: setButtonsCreated
    });
  }, [mapInstance, buttonsCreated, setButtonsCreated]);

  useEffect(() => {

    //TODO: Fix zoom to layer when open project

    if (project && mapInstance) {
      let center = defaultCenter;
      let zoom = defaultZoom;

      if (project.centerCoordinate && !(project.bounds.minLat === Infinity || project.bounds.maxLat === -Infinity)) {
        const { minLat, maxLat, minLng, maxLng } = project.bounds;
        center = [(minLat + maxLat) / 2, (minLng + maxLng) / 2];
        mapInstance.fitBounds([[minLat, minLng], [maxLat, maxLng]]);
        zoom = mapInstance.getBoundsZoom([[minLat, minLng], [maxLat, maxLng]]);
      }

      mapInstance.setView(center, zoom);  
    }
  }, [project, mapInstance]);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const flattenedData = modalData.flat();
  const uniqueKeys = Array.from(new Set(flattenedData.flatMap(Object.keys)));

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const dispatch = useDispatch()

  const handleDrop = (e) => {
    if (!savetomemory) {
      handleDropGeojson(e, setVectors, setRasters, mapInstance, dispatch, projectid, setUploading)
    } else {
      UploadToMemoryDrop(e, setVectors, mapInstance)
    }
  }

  const onEachFeatureVector = (vector) => (feature, layer) => {
    if (feature){

      // TODO: use this function to be able to highlight selected features
      // layer.setStyle(feature.style);

      layer.on('click', () => {
        const attributes = feature.properties.attributes;
        if (attributes) {
          setSelectedFeatureAttributes(attributes);
          setModalData([attributes]);
          const modalInstance = M.Modal.getInstance(document.getElementById('attributesModal'));
          modalInstance.open();
          }
        }
      )
    }
  }

  const vectorStyle = (feature,vector) => {

    // const selected = vector.features.filter(
    //   (v)=>{v.id===feature.id}
    // )
    const selected = vector.data.features.find(
      (v) => v.id === feature.id
    );
    
    return(selected.style)

  }

  const MapItem = <div
    onDrop={handleDrop}
    onDragOver={handleDragOver}
    style={{ width: '100%', height: '500px' }}
  >
    <MapContainer
      className='map-container shrink'
      ref={(map) => {
        if (map && !mapInstance) {
          setMapInstance(map);
        }
      }}
      center={defaultCenter}
      zoom={defaultZoom}
      zoomControl={false}
      maxZoom={22}
      minZoom={2}
    >

      <TileLayer url={selectedTileLayer} />

      {rasters.map((rasterdata, index) => {
        const raster = rasterdata.data
        return rasterdata.visible && (
          <ImageOverlay
            url={raster.png}
            bounds={rasterdata.bounds}
            opacity={rasterdata.style.opacity}
            zIndex={1000}
            key={index}
          />
        );
      })}

      {vectors.map((vector,index)=>{
        return vector.visible && 
        (<GeoJSON
          key={`vector-${index}`}
          ref={(el) => {
            if (el) {
              geojsonLayerRefs.current[vector.data.properties.id] = el;
            }
          }}
          data={vector.data}
          // style={(feature) => feature.style}
          style={(feature) => vectorStyle(feature,vector)}
          // style={vector.data.properties.style}
          onEachFeature={onEachFeatureVector(vector.data)}
        >
        </GeoJSON>)
      })}

      <ScaleControl position="bottomleft" />
      <FullscreenControl className="custom-fullscreen-control" position="bottomright" />
      <ZoomControl position="bottomright" />
      <MouseCoordinates />
    </MapContainer>
  </div>

  const loadingIcon = (
    <div className="loading-container">
      <div className="loading-icon"></div>
    </div>
  );

  return (
    <>
      {
        uploading
          ? loadingIcon : null}

      <ToggleLayersSelector
        rasters={rasters}
        setRasters={setRasters}
        vectors={vectors}
        setVectors={setVectors}
        geojsonLayerRefs={geojsonLayerRefs}
        mapInstance={mapInstance}
        selectedFeatureAttributes={selectedFeatureAttributes}
        inmemory={savetomemory}
        changeStyleData={changeStyleData}
        setChangeStyleData={setChangeStyleData}
      />

      <BasemapSelector
        setSelectedTileLayer={setSelectedTileLayer}
        tileLayersData={tileLayersData}
      />

      {savetomemory ?
        <MemoryButton
          handleButtonClick={handleButtonClick}
          fileInputRef={fileInputRef}
          setVectors={setVectors}
          mapInstance={mapInstance}
        />
        : (
          <UpDelButttons
            setRasters={setRasters}
            mapInstance={mapInstance}
            projectid={projectid}
            setUploading={setUploading}
            setVectors={setVectors}
          />
        )}

      <div className='home-button-map'>
        <a href="/" className="btn-floating waves-effect waves-light black">
          <i className="material-icons tiny">home</i>
        </a>
      </div>

      <div id="attributesModal" className="modal">
        <div className="modal-content">
          <h4>Tabela de Atributos</h4>
          <table className="striped">
            {flattenedData.map((item, index) => (
              <tbody key={index}>
                {uniqueKeys.map(key => (
                  <tr key={key}>
                    <th>{key}</th>
                    <td>{item[key] || '—'}</td>
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>
        <div className="modal-footer">
          <a href="#!" className="modal-close waves-effect waves-green btn-flat">Fechar</a>
        </div>
      </div>



    <div id="change-style-modal" className="modal">
        <div className="modal-content">
            {changeStyleData}
        </div>
        <div className="modal-footer">
          <a href="#!" className="modal-close waves-effect waves-green btn-flat">Fechar</a>
        </div>
    </div>




      {MapItem}




    </>
  );
};

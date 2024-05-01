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
import ToggleLayersSelector from './ToggleLayersSelector'
// import UpDelButttons from './UploadAndDeleteButtons2';
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
    projectid = null,
    savetomemory = true
  }) => {
  const [selectedTileLayer, setSelectedTileLayer] = useState(tileLayersData[0].url);
  const [buttonsCreated, setButtonsCreated] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  const [selectedFeatureAttributes, setSelectedFeatureAttributes] = useState(null);
  const [modalData, setModalData] = useState([]);
  // const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false)

  const geojsonLayerRefs = useRef({});
  const fileInputRef = useRef(null);

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


  const handleButtonClick = () => {
    fileInputRef.current.click();
  };
  
  // Identificar todas as chaves únicas
  const flattenedData = modalData.flat();
  const uniqueKeys = Array.from(new Set(flattenedData.flatMap(Object.keys)));


  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const dispatch = useDispatch()

  const handleDrop = (e) => {
    if (!savetomemory){
      handleDropGeojson(e,setGeoJSONs,mapInstance, dispatch, projectid, setUploading)
    } else {
      UploadToMemoryDrop(e,setGeoJSONs,mapInstance)
    }
  }

  const MapItem = <div
      onDrop={handleDrop}//handleDropGeojson}//handleGeojson}
      onDragOver={handleDragOver}
      style={{ width: '100%', height: '500px' }}
  >
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

      {geojsons.map((geojsondata, index) => {
        const geojson = geojsondata.data
        return geojsondata.visible && (
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
            style={
              geojsondata.style
            }

            onEachFeature={(feature, layer) => {
              if (feature.geometry.type !== 'Point') {
                layer.on('click', () => {
                  const attributes = feature.properties.attributes;
                  if (attributes) {
                    setSelectedFeatureAttributes(attributes);
                    setModalData([attributes]);
                    // setIsModalOpen(true);
                    const modalInstance = M.Modal.getInstance(document.getElementById('attributesModal'));
                    modalInstance.open();
                  }
                });
              }
            }}
          />
        )
      })}
      <ScaleControl position="bottomleft" />
      <FullscreenControl className="custom-fullscreen-control" position="bottomright" />
      <ZoomControl position="bottomright" />
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
        geojsons={geojsons}
        setGeojsons={setGeoJSONs}
        geojsonLayerRefs={geojsonLayerRefs}
        mapInstance={mapInstance}
        selectedFeatureAttributes={selectedFeatureAttributes}
        inmemory={savetomemory}
      />

      <BasemapSelector
        setSelectedTileLayer={setSelectedTileLayer}
        tileLayersData={tileLayersData}
      />

      {savetomemory ? 
        <MemoryButton
          handleButtonClick={handleButtonClick}
          fileInputRef={fileInputRef}
          setGeojsons={setGeoJSONs}
          mapInstance={mapInstance}
        />
      : (
        <UpDelButttons
          setGeoJSONs={setGeoJSONs}
          setRasters={setRasters}
          mapInstance={mapInstance}
          projectid={projectid}
          setUploading={setUploading}
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
      
      {MapItem}

    </>
  );
};

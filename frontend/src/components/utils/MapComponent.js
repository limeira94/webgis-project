import React, { useState, useEffect, useRef } from 'react';
import tileLayersData from './tileLayers.json';
import defaultStyle from "./defaultStyle.json";
import './MapComponent.css'
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
import UpDelButttons from './UploadAndDeleteButtons2';
import { leafletDefaultButtons } from './LeafletButtons';
import L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import M from 'materialize-css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.js';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import "react-leaflet-fullscreen/styles.css";
import { FullscreenControl } from 'react-leaflet-fullscreen';
import 'leaflet.browser.print/dist/leaflet.browser.print.min.js';
import 'leaflet-measure/dist/leaflet-measure.css';
import 'leaflet-measure/dist/leaflet-measure.js';
import bbox from '@turf/bbox';

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
  const [visibleGeoJSONs, setVisibleGeoJSONs] = useState({});
  const [visibleRasters, setVisibleRasters] = useState({});
  const [polygonStyles, setPolygonStyles] = useState({});
  const [rasterStyles, setRasterStyles] = useState({});
  const [buttonsCreated, setButtonsCreated] = useState(false);
  const geojsonLayerRefs = useRef({});
  const [mapInstance, setMapInstance] = useState(null);
  const [selectedFeatureAttributes, setSelectedFeatureAttributes] = useState(null);
  const [modalData, setModalData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false)

  const fileInputRef = useRef(null);
  const fileInputRasterRef = useRef(null);
  const defaultOpacity = 1


  useEffect(() => {
    console.log(geojsons)
    M.AutoInit();
  }, []);

  useEffect(() => {
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

  

  const uploadToMemory = (event) => {
    const file = event.target.files[0];
    event.target.value = null;

    const fileName = file.name.split('.')[0];

    const reader = new FileReader();
    reader.onload = (e) => {
      const geojsonData = JSON.parse(e.target.result);

      const combinedFeature = createCombinedFeature(geojsonData, fileName);
      const featuresCollection = {
        type: "FeatureCollection",
        features: [combinedFeature]
      };

      const calculatedBounds = bbox(featuresCollection);
      updateMapAndView(calculatedBounds, combinedFeature);

      setGeoJSONs(prevGeoJSONs => [...prevGeoJSONs, combinedFeature]);
    };
    reader.readAsText(file);
  };

  const createCombinedFeature = (geojsonData, fileName) => {
    const geometryTypes = ['Polygon', 'Point', 'Line', 'MultiPolygon', 'MultiPoint', 'MultiLine'];
    for (const type of geometryTypes) {
      const features = geojsonData.features.filter(feature => feature.geometry.type === type);
      if (features.length > 0) {
        return createFeature(type, features, fileName);
      }
    }
    return handleFallbackFeature(geojsonData, fileName);
  };

  const createFeature = (type, features, fileName) => {
    const coordinates = features.map(feature => feature.geometry.coordinates);
    const isMultiType = type.startsWith('Multi');
    return {
      type: "Feature",
      geometry: {
        type: isMultiType ? type : `Multi${type}`,
        coordinates: isMultiType ? coordinates.flat(1) : coordinates
      },
      properties: {
        id: Math.floor(Math.random() * 1000000000),
        name: fileName
      }
    };
  };

  const handleFallbackFeature = (geojsonData, fileName) => {
    // Tratamento do caso de fallback
    const fallbackFeature = geojsonData.features[0];
    fallbackFeature.properties.name = fileName;
    return fallbackFeature;
  };

  const updateMapAndView = (calculatedBounds, combinedFeature) => {
    setVisibleGeoJSONs(prevVisible => ({
      ...prevVisible,
      [combinedFeature.properties.id]: true
    }));

    if (mapInstance && calculatedBounds) {
      const boundsLatLng = L.latLngBounds(
        [calculatedBounds[1], calculatedBounds[0]],
        [calculatedBounds[3], calculatedBounds[2]]
      );
      mapInstance.flyToBounds(boundsLatLng, { maxZoom: 16 });
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleButtonRasterClick = () => {
    fileInputRasterRef.current.click();
  };

  const memoryButton = <>
    <a
      onClick={handleButtonClick}
      className='btn-floating waves-effect waves-light  upload-geo-button'
      title='Upload GeoJSON'
    >

      <i className="small material-icons">file_upload</i>
      <input
        type="file"
        onChange={uploadToMemory}
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".geojson, application/geo+json"
      />
    </a>
    {/* <a onClick={handleButtonRasterClick} className='btn-floating waves-effect waves-light upload-geo-button-raster'>
      <i className="small material-icons">file_upload</i>
      <input
        type="file"
        onChange={uploadToMemoryRaster}
        ref={fileInputRasterRef}
        style={{ display: 'none' }}
        accept=".tif"
      />
    </a> */}
  </>

  const flattenedData = modalData.flat();

  // Identificar todas as chaves únicas
  const uniqueKeys = Array.from(new Set(flattenedData.flatMap(Object.keys)));

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

      {/* in memory raster */}
      {/* <ImageOverlay
              url={'file:///media/felipe/3dbf30eb-9bce-46d8-a833-ec990ba72625/Documentos/projetos_pessoais/webgis-project/backend/tests/data/rasters/SAR/ICEYE_X12_QUICKLOOK_SLH_2155354_20230513T171831_modified5.tif'}
              bounds={bounds}
              opacity={1}
              zIndex={10}
            /> */}

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
              // (feature) => polygonStyles[feature.properties.id] || defaultStyle
              // (feature) => polygonStyles[feature.properties.id] || defaultStyle
              geojsondata.style
            }

            onEachFeature={(feature, layer) => {
              if (feature.geometry.type !== 'Point') {
                layer.on('click', () => {
                  const attributes = feature.properties.attributes;
                  if (attributes) {
                    setSelectedFeatureAttributes(attributes);
                    setModalData([attributes]);
                    setIsModalOpen(true);
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

  </>


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

      {savetomemory ? memoryButton : (
        <UpDelButttons
          setGeoJSONs={setGeoJSONs}
          setRasters={setRasters}
          mapInstance={mapInstance}
          setVisibleGeoJSONs={setVisibleGeoJSONs}
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
          <h4>Tabela de Atributos2</h4>
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

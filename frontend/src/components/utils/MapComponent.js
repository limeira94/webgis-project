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
import bbox from '@turf/bbox';
import GeoTIFF from 'geotiff';
import { fromArrayBuffer } from 'geotiff';
import { featureCollection } from '@turf/helpers';

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
  const [selectedPolygon, setSelectedPolygon] = useState(null);
  const [buttonsCreated, setButtonsCreated] = useState(false);
  const geojsonLayerRefs = useRef({});
  const [mapInstance, setMapInstance] = useState(null);
  const fileInputRef = useRef(null);

  const defaultOpacity = 1

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

  const combineFeaturesByType = (features) => {
    const combinedFeatures = {};

    features.forEach(feature => {
      const geometryType = feature.geometry.type;
      if (geometryType === 'Point' || geometryType === 'LineString' || geometryType === 'Polygon') {
        const multiType = `Multi${geometryType}`;
        if (!combinedFeatures[multiType]) {
          combinedFeatures[multiType] = {
            type: 'Feature',
            geometry: { type: multiType, coordinates: [] },
            properties: {}
          };
        }
        combinedFeatures[multiType].geometry.coordinates.push(feature.geometry.coordinates);
      } else {
        // Para MultiPoint, MultiLineString, MultiPolygon, mantenha como estão
        combinedFeatures[geometryType] = feature;
      }
    });

    return Object.values(combinedFeatures);
  };

  const uploadToMemoryRaster = async (event) => {
    const file = event.target.files[0];
    event.target.value = null;

    console.log(file);

    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      const tiff = await fromArrayBuffer(arrayBuffer);
      const image = await tiff.getImage();
      // const tileCoordinates = image.getTileCoordinates();
      const tileCoordinates = image.getBoundingBox();
      const [xmin, ymin, xmax, ymax] = tileCoordinates;
      const bounds = [[ymin, xmin], [ymax, xmax]];
      console.log(bounds)

      // setRasters((prevRasters) => [
      //   ...prevRasters,
      //   {
      //     id: prevRasters.length, // Adjust as needed
      //     raster: URL.createObjectURL(file),
      //     bounds,
      //   },
      // ]);

      // console.log(rasters);
    }
  };

  const uploadToMemory = (event) => {
    const file = event.target.files[0];
    event.target.value = null;

    const fileName = file.name.split('.')[0];

    const reader = new FileReader();
    reader.onload = (e) => {
      const geojsonData = JSON.parse(e.target.result);

      let combinedFeature;
      const polygonFeatures = geojsonData.features.filter(feature => feature.geometry.type === 'Polygon');
      const pointFeatures = geojsonData.features.filter(feature => feature.geometry.type === 'Point');
      const lineFeatures = geojsonData.features.filter(feature => feature.geometry.type === 'Line');

      if (polygonFeatures.length > 0) {
        // Extrai todas as coordenadas dos polígonos e cria um MultiPolygon
        const allPolygons = polygonFeatures.map(feature => feature.geometry.coordinates);
        combinedFeature = {
          type: "Feature",
          geometry: {
            type: "MultiPolygon",
            coordinates: allPolygons
          },
          properties: {
            id: Math.floor(Math.random() * 1000000000),
            name: fileName
          }
        };

      } else if (pointFeatures.length > 0) {
        const allPoints = pointFeatures.map(feature => feature.geometry.coordinates);
        combinedFeature = {
          type: "Feature",
          geometry: {
            type: "MultiPoint",
            coordinates: allPoints
          },
          properties: {
            id: Math.floor(Math.random() * 1000000000),
            name: fileName
          }
        };
      } else if (lineFeatures.length > 0) {
        const allLines = lineFeatures.map(feature => feature.geometry.coordinates);
        combinedFeature = {
          type: "Feature",
          geometry: {
            type: "MultiLine",
            coordinates: allLines
          },
          properties: {
            id: Math.floor(Math.random() * 1000000000),
            name: fileName
          }
        };
      } else {
        // Se não houver Polígonos, mantenha a primeira feature da coleção original
        combinedFeature = geojsonData.features[0];
      }

      const featuresCollection = {
        type: "FeatureCollection",
        features: [combinedFeature]
      };

      const calculatedBounds = bbox(featuresCollection);

      // Atualiza a visibilidade para o novo GeoJSON
      setVisibleGeoJSONs(prevVisible => ({
        ...prevVisible,
        [combinedFeature.properties.id]: true
      }));

      // Ajusta a visualização do mapa para os limites da nova FeatureCollection
      if (mapInstance && calculatedBounds) {
        const boundsLatLng = L.latLngBounds(
          [calculatedBounds[1], calculatedBounds[0]],
          [calculatedBounds[3], calculatedBounds[2]]
        );
        mapInstance.flyToBounds(boundsLatLng, { maxZoom: 16 });
      }

      // Adiciona a nova FeatureCollection combinada ao estado
      setGeoJSONs(prevGeoJSONs => [...prevGeoJSONs, combinedFeature]);
    };
    reader.readAsText(file);
  };

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
    <a onClick={handleButtonClick} className='btn-floating waves-effect waves-light upload-geo-button-raster'>
      <i className="small material-icons">file_upload</i>
      <input
        type="file"
        onChange={uploadToMemoryRaster}
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".tif"
      />
    </a>
  </>
  // ############################################################################################################################################################

  var url = process.env.REACT_APP_API_URL
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
        const isVisible = visibleRasters[raster.id];
        const tileCoordinates = raster.tiles.split(',').map(Number);

        const [xmin, ymin, xmax, ymax] = tileCoordinates;
        const bounds = [[ymin, xmin], [ymax, xmax]];
        // console.log(raster.raster)
        return isVisible && (
          <ImageOverlay
            // url={url + raster.raster}
            url={raster.raster}
            bounds={bounds}
            opacity={(feature) => rasterStyles[feature.id] || defaultOpacity}
            // opacity={1}
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

      {geojsons.map((geojson, index) => {
        console.log('geojsons', geojson)
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
              console.log(feature);
              if (feature.geometry.type !== 'Point') {
                layer.on('click', () => {
                  setSelectedPolygon(layer);
                });

                if (feature.properties.attributes) {
                  const attributesContent = Object.entries(feature.properties.attributes)
                    .map(([key, value]) => `<strong>${key}</strong>: ${value}`)
                    .join('<br>');

                  layer.bindPopup(attributesContent);
                } else {
                  layer.bindPopup('No attributes available');
                }

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
        setRasters={setRasters}
        geojsons={geojsons}
        polygonStyles={polygonStyles}
        setPolygonStyles={setPolygonStyles}
        rasterStyles={rasterStyles}
        setRasterStyles={setRasterStyles}
        visibleGeoJSONs={visibleGeoJSONs}
        setVisibleGeoJSONs={setVisibleGeoJSONs}
        visibleRasters={visibleRasters}
        setVisibleRasters={setVisibleRasters}
        geojsonLayerRefs={geojsonLayerRefs}
        mapInstance={mapInstance}
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

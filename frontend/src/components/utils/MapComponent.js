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
  FeatureGroup
} from 'react-leaflet';
import BasemapSelector from './BasemapSelector';
import UpDelButttons from './UploadAndDeleteButtons';
import MemoryButton from './Memory/component';
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
import { handleDropGeojson } from './eventHandler';
import { useDispatch } from 'react-redux';
import { UploadToMemoryDrop } from './Memory/eventHandlers';
import MouseCoordinates from './MouseCoordinates';
import SideNav from './Sidebar';
import Cookies from 'js-cookie'
import axios from 'axios';
import html2canvas from 'html2canvas';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/'

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

  const [selectedFeatures, setSelectedFeatures] = useState([])

  const [changeStyleData, setChangeStyleData] = useState(null)

  const [sideNavExpanded, setSideNavExpanded] = useState(false);

  const geojsonLayerRefs = useRef({});
  const fileInputRef = useRef(null);

  const defaultCenter = [50.640, 10.553];
  const defaultZoom = 5;

  const [ticking, setTicking] = useState(true),
    [count, setCount] = useState(0)

  const featureGroupRef = useRef(new L.FeatureGroup());


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

  const handleClickFeature = (feature, layer, e) => {

    const attributes = feature.properties.attributes;
    const isCtrlPressed = e.originalEvent.ctrlKey;
    const featureId = feature.id;

    if (isCtrlPressed) {
      setSelectedFeatures((prevSelectedFeatures) => {
        const isSelected = prevSelectedFeatures.includes(featureId);

        if (isSelected) {
          layer.setStyle({ color: feature.style.color });
          return prevSelectedFeatures.filter(id => id !== featureId);
        } else {
          layer.setStyle({ color: 'yellow' });
          return [...prevSelectedFeatures, featureId];
        }
      })
    }

    if (!isCtrlPressed && attributes) {
      setSelectedFeatureAttributes(attributes);
      setModalData([attributes]);
      const modalInstance = M.Modal.getInstance(document.getElementById('attributesModal'));
      modalInstance.open();
    }
  };



  const handleDownload = async (geojson) => {
    const id = geojson.data.properties.id
    const token = Cookies.get('access_token');
    try {
      const response = await axios.get(
        `${API_URL}api/main/download/${id}/`,
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
          responseType: 'blob',
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `vector_${id}.geojson`);
      document.body.appendChild(link);
      link.click();

      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error downloading the file', error);
    }
  };

  const takeScreenshot = () => {
    setCount(count + 1)
    if (mapInstance) {
      html2canvas(
        document.body, {
        scale: 2,
        useCORS: true,
      }

      ).then(canvas => {
        const imgData = canvas.toDataURL('image/png');

        const token = Cookies.get('access_token');
        const response = axios.post(
          `${API_URL}api/main/update-project-thumbnail/${projectid}/`,
          { thumbnail: imgData },
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
            }
          }
        )
          .then(response => {
            console.log('Thumbnail updated successfully');
          })
          .catch(error => {
            console.error('Error updating thumbnail', error);
          });

      });
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => ticking && takeScreenshot(), 60000)
    return () => clearTimeout(timer)
  }, [count, ticking])


  const handleDownloadSelected = async (geojson) => {
    const id = geojson.data.properties.id;
    const token = Cookies.get('access_token');

    const filteredFeatures = selectedFeatures.filter((featureId) => {
      const layer = geojsonLayerRefs.current[id];
      if (layer) {
        const feature = layer.toGeoJSON().features.find(f => f.id === featureId || f.properties.id === featureId);
        return !!feature;
      }
      return false;
    });

    if (filteredFeatures.length === 0) {
      console.warn('No selected features to download for this layer.');
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}api/main/download-selected/${id}/`,
        { selectedFeatures: filteredFeatures },
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
          responseType: 'blob',
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `selected_features_${id}.geojson`);
      document.body.appendChild(link);
      link.click();

      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error downloading the selected features', error);
    }
  };

  const onEachFeatureVector = (vector) => (feature, layer) => {
    if (feature) {

      layer.on('click', (e) => {
        handleClickFeature(feature, layer, e)
      });
    }
  }

  const vectorStyle = (feature, vector) => {
    const selected = vector.data.features.find(
      (v) => v.id === feature.id
    );

    if (!selected) {
      return
    }

    const featureId = feature.id || feature.properties.id;
    const isSelected = selectedFeatures.includes(featureId);

    return isSelected
      ? { color: 'yellow', fillColor: "yellow" }
      : selected.style//feature.style
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

      {vectors.map((vector, index) => {
        return vector.visible &&
          (<GeoJSON
            key={`vector-${index}`}
            ref={(el) => {
              if (el) {
                geojsonLayerRefs.current[vector.data.properties.id] = el;
              }
            }}
            data={vector.data}
            style={(feature) => vectorStyle(feature, vector)}
            onEachFeature={onEachFeatureVector(vector.data)}
            pointToLayer={(feature, latlng) => {
              if (feature.geometry.type === 'Point' || feature.geometry.type === 'MultiPoint') {
                return L.circleMarker(latlng, vectorStyle(feature, vector));
              }
              return L.marker(latlng);
            }}
          >
          </GeoJSON>)
      })}

      <FeatureGroup ref={featureGroupRef} />

      {/* <ScaleControl position="bottomleft" /> */}
      {/* <FullscreenControl className="custom-fullscreen-control" position="bottomright" /> */}
      <ZoomControl position="bottomright" />
      {/* <MouseCoordinates /> */}
      {/* <BasemapSelector setSelectedTileLayer={setSelectedTileLayer} tileLayersData={tileLayersData} /> */}
    </MapContainer>
  </div>

  const loadingIcon = (
    <div className="loading-container">
      <div className="loading-icon"></div>
    </div>
  );

  return (
    <>
      {uploading ? loadingIcon : null}

      <SideNav
        rasters={rasters}
        setRasters={setRasters}
        vectors={vectors}
        setVectors={setVectors}
        geojsonLayerRefs={geojsonLayerRefs}
        mapInstance={mapInstance}
        projectid={projectid}
        setUploading={setUploading}
        selectedFeatureAttributes={selectedFeatureAttributes}
        inmemory={savetomemory}
        changeStyleData={changeStyleData}
        setChangeStyleData={setChangeStyleData}
        handleDownload={handleDownload}
        handleDownloadSelected={handleDownloadSelected}
        featureGroupRef={featureGroupRef}
        open={sideNavExpanded}
        setOpen={setSideNavExpanded}
      />

      <div
        style={{
          position: 'absolute',
          bottom: '100px',
          left: sideNavExpanded ? '420px' : '120px', // Adjust based on the expanded state
          transition: 'left 0.3s ease-in-out', // Smooth transition
          zIndex: 1000,
        }}
      >
        <BasemapSelector
          setSelectedTileLayer={setSelectedTileLayer}
          tileLayersData={tileLayersData}
          sideNavExpanded={sideNavExpanded}
        />
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

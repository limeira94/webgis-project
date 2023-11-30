import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import tileLayersData from './tileLayers.json';
import { 
  useNavigate 
} from 'react-router-dom';
import { useDispatch } from 'react-redux';
import M from 'materialize-css';
import {
    MapContainer,
    TileLayer,
    ZoomControl,
    LayersControl,
    GeoJSON,
    ImageOverlay
  } from 'react-leaflet';

import "react-leaflet-fullscreen/styles.css";
import { FullscreenControl } from 'react-leaflet-fullscreen';

const Map = ({project_id}) => {
    const [rasters, setRasters] = useState([]);
    const [geojsons, setGeoJSONs] = useState([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedPolygon, setSelectedPolygon] = useState(null);
    const [polygonStyles, setPolygonStyles] = useState({});
    const [visibleGeoJSONs, setVisibleGeoJSONs] = useState({});
    const [mapInstance, setMapInstance] = useState(null);
    const geojsonLayerRefs = useRef({});

    const tileLayers = tileLayersData.map((layer) => ({
        key: layer.key,
        name: layer.name,
        url: layer.url,
      }));

    const defaultStyle = {
        color: "#ff7800",
        weight: 3,
        fillOpacity: 0.65,
        fillColor: "#ff7800"
      };
    


    return (
        <>
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
    )
}

function Project() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [confirmDelete, setConfirmDelete] = useState(false);
    const { isAuthenticated, user, loading } = useSelector(state => state.user);

    
  
    
    useEffect(() => {
      M.AutoInit();
    }, []);


    return (
        <>
          
        </>
      );
    }

export default Project;


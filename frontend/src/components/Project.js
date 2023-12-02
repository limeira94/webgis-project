import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import Navbar from './include/Navbar';
import { getProjects } from './utils/get_infos';
import tileLayersData from './tileLayers.json';
import { 
  useNavigate 
} from 'react-router-dom';
import { useDispatch } from 'react-redux';
import M from 'materialize-css';
import axios from 'axios'
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

import "./Project.css"

const Map = ({project}) => {
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
    const [project,setProject] = useState(null)
    const [projects, setProjects] = useState([]);
    

    const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/'
    useEffect(() => {
        M.AutoInit();
        const getProjects = async () => {
            try {
              const response = await axios.get(`${API_URL}api/main/projects/`);

              setProjects(response.data)
            } catch (error) {
              console.error('Error fetching GeoJSON data:', error);
            }
          }
        getProjects();
    }, []);

    var url = process.env.PUBLIC_URL


    if (!isAuthenticated && !loading && user === null)
      return <Navigate to='/login'/>;

    return (
        <>

            
        {/* TODO: create a function to handle 'choose' and 'change' */}
        
        { !project ? 
            <a className="waves-effect waves-light btn modal-trigger choose-button" href="#modal1">Choose your project</a> : 
            <a className="waves-effect waves-light btn modal-trigger change-button">Change your project</a>
        }
        
        
        
        <div id="modal1" className="modal modal-fixed-footer">
            <div className="modal-content">
                <h4 className='center'>Choose your project</h4>
                <div>
                    <div className="row">
                        {projects.map((project, index) => (
                            <div key={index} className="col s12 m3">
                                <div className="card">
                                    <div className="card-image">
                                    {project.thumbnail ? (
                                        <img src={`${project.thumbnail}`} alt={`Project ${index + 1}`} />
                                        ) : (
                                        <img src={url + "/thumbnail_map.png"}  alt={`Project ${index + 1}`} />
                                        )}
                                        <span className="card-title">{project.name}</span>
                                        <a className="btn-floating halfway-fab waves-effect waves-light red"><i className="material-icons">open_in_browser</i></a>
                                    </div>
                                    <div className="card-content">
                                        <p><b>Last time updated:</b></p>
                                        <p>{project.updated_at}</p>
                                    </div>
                                </div>
                            </div>
                        ))} 
                    </div>
                </div>








            </div>
            <div className="modal-footer">
                <a href="#!" className="modal-close waves-effect waves-green btn-flat">Close</a>
            </div>
        </div>

        <Map project_id={project} />

        {project ? <Map project_id={project.id} /> : null}

          
        </>
      );
    }

export default Project;


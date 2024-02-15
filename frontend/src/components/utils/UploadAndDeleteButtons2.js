import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { handleRaster, handleGeojson, handleDrawUpload } from './eventHandler2';
import L from 'leaflet';
import * as turf from '@turf/turf';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';


const UpDelButttons = ({
    setGeoJSONs,
    setRasters,
    mapInstance,
    setVisibleGeoJSONs,
    projectid,  //TODO: Change the way to do this, maybe running two different routes
    setUploading
}) => {
    const rasterInputRef = useRef(null);
    const fileInputRef = useRef(null);
    const [isDrawControlVisible, setIsDrawControlVisible] = useState(false);
    const drawControlRef = useRef(null);

    const dispatch = useDispatch()

    // const { isAuthenticated } = useSelector(state => state.user);

    const handleFileClick = () => {
        fileInputRef.current.click();
    };
    const handleFileClickRaster = () => {
        rasterInputRef.current.click();
    };

    const toggleDrawControl = () => {
        if (isDrawControlVisible) {
            mapInstance.removeControl(drawControlRef.current);
        } else {
            mapInstance.addControl(drawControlRef.current);
        }
        setIsDrawControlVisible(!isDrawControlVisible);
    };

    useEffect(() => {
        if (!mapInstance) return;

        const drawControl = new L.Control.Draw({
            position: 'bottomleft',
            draw: {
                polygon: true,
                polyline: true,
                rectangle: true,
                circle: true,
                marker: true,
            },
            edit: {
                featureGroup: new L.FeatureGroup().addTo(mapInstance),
            },
        });

        drawControlRef.current = drawControl;
        mapInstance.addControl(drawControl);

        mapInstance.on(L.Draw.Event.CREATED, async (e) => {
            console.log('Draw event:', e);
            let layer = e.layer;

            if (layer instanceof L.Circle) {
                const center = layer.getLatLng();
                const radius = layer.getRadius();

                const centerPoint = turf.point([center.lng, center.lat]);
                const options = { steps: 60, units: 'kilometers' };

                const buffer = turf.buffer(centerPoint, radius / 1000, options);

                const feature = {
                    type: 'Feature',
                    geometry: buffer.geometry,
                    properties: {},
                };

                const geometryJson = feature;

                await handleDrawUpload(
                    geometryJson,
                    setGeoJSONs,
                    setVisibleGeoJSONs,
                    mapInstance,
                    dispatch,
                    projectid,
                    setUploading
                );
            } else {

                const geometryJson = layer.toGeoJSON();
                console.log('Geometry JSON:', geometryJson)

                await handleDrawUpload(
                    geometryJson,
                    setGeoJSONs,
                    setVisibleGeoJSONs,
                    mapInstance,
                    dispatch,
                    projectid,
                    setUploading
                );
            }
        });

        return () => {
            if (mapInstance) {
                mapInstance.removeControl(drawControl);
                mapInstance.off(L.Draw.Event.CREATED);
            }
        };
    }, [mapInstance]);


    return (

        <>
            <div className='custom-draw-button'>
                <a onClick={toggleDrawControl} className='btn-floating waves-effect waves-light edit-geo-button' title='Draw'>
                    <i className="small material-icons">edit</i>
                </a>
            </div>

            <div className="fixed-action-btn">

                <a className="btn-floating btn-color">
                    <i className="large material-icons">attach_file</i>
                </a>
                <ul>
                    <li>
                        <input
                            type="file"
                            // onChange={handleRaster}
                            onChange={(event) => handleRaster(
                                event,
                                setRasters,
                                mapInstance,
                                dispatch,
                                projectid,
                                setUploading
                            )}
                            ref={rasterInputRef}
                            style={{ display: 'none' }}
                            accept=".tif"
                        />
                        <a
                            className="btn-floating waves-effect waves-light green"
                            data-tooltip="Upload raster"
                            onClick={handleFileClickRaster}
                            title="Upload Raster"
                        >
                            <i className="material-icons">file_upload</i>
                        </a>
                    </li>
                    <li>
                        <input
                            type="file"
                            onChange={(event) => handleGeojson(
                                event,
                                //    getCenterOfGeoJSON, 
                                setGeoJSONs,
                                setVisibleGeoJSONs,
                                mapInstance,
                                dispatch,
                                projectid,
                                setUploading
                            )}

                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            accept=".geojson, application/geo+json"
                        />
                        <a
                            className="btn-floating waves-effect waves-light blue"
                            data-tooltip="Upload geojson"
                            onClick={handleFileClick}
                            title='Upload GeoJSON'
                        >
                            <i className="material-icons">file_upload</i>
                        </a>
                    </li>
                </ul>
            </div>

        </>
    )
}

export default UpDelButttons;
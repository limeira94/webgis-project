import React, { useRef } from 'react';
import { useDispatch } from 'react-redux';
import { handleRaster, handleGeojson } from './eventHandler';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';

const UpDelButttons = ({
    // setGeoJSONs,
    setRasters,
    mapInstance,
    projectid,  //TODO: Change the way to do this, maybe running two different routes
    setUploading,
    setVectors,
}) => {
    const rasterInputRef = useRef(null);
    const fileInputRef = useRef(null);
    const dispatch = useDispatch()

    const handleFileClick = () => {
        fileInputRef.current.click();
    };
    const handleFileClickRaster = () => {
        rasterInputRef.current.click();
    };

    return (
        <>
            <div className="attach-file-button">
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
                                    // setGeoJSONs,
                                    setVectors,
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
            </div>

        </>
    )
}

export default UpDelButttons;
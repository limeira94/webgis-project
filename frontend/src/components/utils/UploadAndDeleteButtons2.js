import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
// import {
//     parseGeoJSON,
//     ListItemWithStyleControls,
//     getCenterOfGeoJSON
//   } from './MapUtils';
// import M from 'materialize-css';
import {
    handleRaster,
    handleGeojson
    // handleFileChange,
    // handleDeleteClick,
    // handleDeleteRasterClick
} from './eventHandler2';

import M from 'materialize-css';


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

    
    const dispatch = useDispatch()

    // const { isAuthenticated } = useSelector(state => state.user);

    const handleFileClick = () => {
        fileInputRef.current.click();
    };
    const handleFileClickRaster = () => {
        rasterInputRef.current.click();
    };


    return (

        <>

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
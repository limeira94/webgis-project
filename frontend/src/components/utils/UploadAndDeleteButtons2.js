import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    parseGeoJSON,
    ListItemWithStyleControls,
    getCenterOfGeoJSON
  } from './MapUtils';
import M from 'materialize-css';
import {
    handleRaster,
    handleGeojson
    // handleFileChange,
    // handleDeleteClick,
    // handleDeleteRasterClick
  } from './eventHandler2';



const UpDelButttons = ({
    setGeoJSONs,
    setRasters,
    mapInstance,
    setVisibleGeoJSONs,

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
            {/* <li><a className="btn-floating waves-effect waves-light green tooltipped" data-position="bottom" data-tooltip="Delete all rasters" onClick={() => handleDeleteClick(setGeoJSONs)}><i className="material-icons">delete</i></a></li>
            <li><a className="btn-floating waves-effect waves-light blue tooltipped" data-position="bottom" data-tooltip="Delete all vectors" onClick={() => handleDeleteRasterClick(setRasters)}><i className="material-icons">delete</i></a></li> */}
            <li>
                {/* <div className="raster-upload-container"> */}
                        <input
                            type="file"
                            onChange={handleRaster}
                            ref={rasterInputRef}
                            style={{ display: 'none' }}
                        // accept=".tif, application/geo+json"
                        />
                        <a
                            className="btn-floating waves-effect waves-light green tooltipped" data-position="left" data-tooltip="Upload raster"
                            onClick={handleFileClickRaster}>
                            <i className="material-icons">file_upload</i>
                        </a>
                {/* </div> */}
            </li>
            <li>
                <input
                type="file"
                onChange={(event) => handleGeojson(event, getCenterOfGeoJSON, setGeoJSONs, setVisibleGeoJSONs, mapInstance,dispatch)}
                
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".geojson, application/geo+json"
                />
                <a
                className="btn-floating waves-effect waves-light blue tooltipped" data-position="left" data-tooltip="Upload geojson"
                onClick={handleFileClick}>
                <i className="material-icons">file_upload</i>
                </a>

            </li>
        </ul>
    </div>
        
</>
)
}

export default UpDelButttons;
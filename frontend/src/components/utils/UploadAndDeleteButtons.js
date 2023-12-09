import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    parseGeoJSON,
    ListItemWithStyleControls,
    getCenterOfGeoJSON
  } from '../utils/MapUtils';
  
import {
    handleRaster,
    handleFileChange,
    handleDeleteClick,
    handleDeleteRasterClick
  } from '../utils/eventHandler';

const UpDelButttons = ({
    setGeoJSONs,
    setRasters,
    mapInstance,

}) => {
    const rasterInputRef = useRef(null);
    const fileInputRef = useRef(null);

    const { isAuthenticated } = useSelector(state => state.user);

    const handleFileClick = () => {
        fileInputRef.current.click();
      };
    const handleFileClickRaster = () => {
        rasterInputRef.current.click();
    };


return (

<>
    <div className="fixed-action-btn file-upload-container custom-file-input">
        <div className="bottom-position-button">
            <a className="btn-floating btn-color">
                <i className="large material-icons">attach_file</i>
            </a>
        </div>
        <ul>
            <li><a className="btn-floating waves-effect waves-light green tooltipped" data-position="bottom" data-tooltip="Delete all rasters" onClick={() => handleDeleteClick(setGeoJSONs)}><i className="material-icons">delete</i></a></li>
            <li><a className="btn-floating waves-effect waves-light blue tooltipped" data-position="bottom" data-tooltip="Delete all vectors" onClick={() => handleDeleteRasterClick(setRasters)}><i className="material-icons">delete</i></a></li>
            <li>
            <div className="raster-upload-container">
                <div>
                <input
                    type="file"
                    onChange={handleRaster}
                    ref={rasterInputRef}
                    style={{ display: 'none' }}
                // accept=".tif, application/geo+json"
                />
                <a
                    className="btn-floating waves-effect waves-light green tooltipped" data-position="bottom" data-tooltip="Upload raster"
                    onClick={handleFileClickRaster}>
                    <i className="material-icons">file_upload</i>
                </a>
                </div>
            </div></li>
            <li><div>
            <div>
                <input
                type="file"
                onChange={(event) => handleFileChange(event, getCenterOfGeoJSON, setGeoJSONs, mapInstance, isAuthenticated)}
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".geojson, application/geo+json"
                />
                <a
                className="btn-floating waves-effect waves-light blue tooltipped" data-position="bottom" data-tooltip="Upload geojson"
                onClick={handleFileClick}>
                <i className="material-icons">file_upload</i>
                </a>
            </div>
            </div></li>
        </ul>
    </div>
        
</>
)
}



export default UpDelButttons;
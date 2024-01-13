
import parse from 'wellknown';
import React, { useState, useEffect, useRef } from 'react';
import Checkbox from '@mui/material/Checkbox';
import { useDispatch,useSelector } from 'react-redux';
import { delete_geojson,delete_raster } from '../../features/data';
import './MapUtils.css'

const handleDeleteRaster = (rasterId,dispatch,rasters,setRasters)=> {
  dispatch(delete_raster(rasterId))
          .then((action) => {
            
            if (action.meta.requestStatus === 'fulfilled') {
              const newRasters = rasters.filter(rasterItem => rasterItem.id !== rasterId);
              setRasters(newRasters);
            } else {
              console.error('Failed to delete raser');
            }
          })
          .catch((error) => {
            console.error('Error occurred while deleting request:', error);
          });
}

const handleDeleteGeojson = (geojsonId,dispatch)=> {
  dispatch(delete_geojson(geojsonId))
          .then((action) => {
            
            if (action.meta.requestStatus === 'fulfilled') {
              window.location.reload();
            } else {
              console.error('Failed to delete geojson');
            }
          })
          .catch((error) => {
            console.error('Error occurred while deleting request:', error);
          });
}

export const parseGeoJSON = (data) => {
        return data.map(item => ({
          type: 'Feature',
          geometry: parse(item.geojson.split(';')[1]),
          properties: {
            id: item.id,
            name: item.name
          },
        }));       
};

export const extractCoordsFromPoint = (coords, lats, longs) => {
    let [long, lat] = coords;
    lats.push(lat);
    longs.push(long);
};


const extractCoordsFromLineOrMultiPoint = (coordinates, lats, longs) => {
    for (let i = 0; i < coordinates.length; i++) {
      extractCoordsFromPoint(coordinates[i], lats, longs);
    }
  };
  

const extractCoordsFromPolygonOrMultiLine = (coordinates, lats, longs) => {
    for (let i = 0; i < coordinates.length; i++) {
      extractCoordsFromLineOrMultiPoint(coordinates[i], lats, longs);
    }
  };

export const getCenterOfGeoJSON = (geojson) => {
    let lats = [], longs = [];

    geojson.features.forEach((feature) => {
      switch (feature.geometry.type) {
        case 'Point':
          extractCoordsFromPoint(feature.geometry.coordinates, lats, longs);
          break;
        case 'LineString':
        case 'MultiPoint':
          extractCoordsFromLineOrMultiPoint(feature.geometry.coordinates, lats, longs);
          break;
        case 'Polygon':
        case 'MultiLineString':
          extractCoordsFromPolygonOrMultiLine(feature.geometry.coordinates, lats, longs);
          break;
        case 'MultiPolygon':
          feature.geometry.coordinates.forEach(polygon => extractCoordsFromPolygonOrMultiLine(polygon, lats, longs));
          break;
        default:
          break;
      }
    });
  
    let minLat = Math.min(...lats);
    let maxLat = Math.max(...lats);
    let minLong = Math.min(...longs);
    let maxLong = Math.max(...longs);
  
    return [(minLat + maxLat) / 2, (minLong + maxLong) / 2];
};

export const styleRasterControls = ({
  rasters,
  setRasters,
  dispatch,
  raster,
  zoomToLayerRaster,
  // updateStyle,
  // rasterStyles
}) => {
  return (
  <div className='style-raster-class'>
    <div className='style-raster-item'>
      <button className='zoom-button' onClick={() => zoomToLayerRaster(raster.id)}>
        <span className="material-icons">zoom_in_map</span>
      </button>
      <a href="#" onClick={() => handleDeleteRaster(raster.id,dispatch,rasters,setRasters)}><i className='material-icons'>delete</i></a>
        {/* <span className='style-span'>Opacity</span>
        <input
          type="color"
          value={rasterStyles[raster.id]?.fillColor || "#ff0000"}
          onChange={e => updateStyle(raster.id, "fillColor", e.target.value)}
          style={{ width: '30px', height: '30px', border: '1px solid #ddd', borderRadius: '4px' }}
        /> */}
      </div>
  </div>
  )
}

const get_item_table = (title, inputType, value,name, geojson,updateStyle) => {

  const onChange = e => updateStyle(geojson.properties.id, name, e.target.value)
  const isRange = inputType === 'range';

  let min, max, step;
  let classname

  if (name === 'weight') {
    min = 0;max = 10;step = 1;
  } else if (name === 'fillOpacity') {
    min = 0;max = 1;step = 0.1;
  }
  else{
    min=undefined;max=undefined;step=undefined;
  }


  if (isRange) {
    classname=`sidenav-range-style`
  }
  else{
    classname=`input-color-style`
  }
  

  return(
  <tr>
    <td><span>{title}</span></td>
    <td className='alnright'>
        <input
          className={classname}
          type={inputType}
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          step={step}
        />
    </td>
  </tr>
  )
}

export const StyleControls = ({ geojson, updateStyle, polygonStyles,zoomanddelete }) => {
  const isPoint = geojson.geometry.type === "Point" || geojson.geometry.type === "MultiPoint";
  const isLine = geojson.geometry.type === "LineString" || geojson.geometry.type === "MultiLineString";

  
  const colorValue = polygonStyles[geojson.properties.id]?.fillColor || "#ff0000"
  const colorRow = get_item_table("Color", "color", colorValue, "fillColor" ,geojson,updateStyle);
  
  const lineColorValue = polygonStyles[geojson.properties.id]?.color || "#ff0000"
  const lineColorRow = get_item_table("Line Color", "color", lineColorValue,"color",geojson,updateStyle);

  const widthValue = polygonStyles[geojson.properties.id]?.weight || 3
  const widthRow = get_item_table("Line Size", "range", widthValue,"weight", geojson,updateStyle);

  const opacityValue = polygonStyles[geojson.properties.id]?.fillOpacity || 0.65
  const opacityRow = get_item_table("Opacity", "range", opacityValue, "fillOpacity",geojson,updateStyle);

  return (
    <div className='side-nav-item-dropdown-style z-depth-5'>
      <table>
        <tbody>
          {zoomanddelete}
          {!isPoint && !isLine && colorRow}
          {!isPoint && lineColorRow}
          {!isPoint && !isLine && opacityRow}
          {!isPoint && widthRow}
        </tbody>
      </table>
    </div>
  );
};

export const ListItemWithStyleControlsRaster = ({
  rasters,
  setRasters,
  raster,
  visibleRasters,
  setVisibleRasters,
  zoomToLayerRaster
}) => {

  const [showStyleControls, setShowStyleControls] = useState(false);

  const handleToggleClick = () => {
    setShowStyleControls(!showStyleControls);
  };

  const dispatch = useDispatch();

  const handleVisibilityChange = (id, isVisible) => {
    setVisibleRasters(prev => ({ ...prev, [id]: isVisible }));
  };
  var url = process.env.PUBLIC_URL
  return (
    <li key={raster.id} >
      
      <div 
        style={{ display: 'flex', alignItems: 'center' }}
      >
         <button 
          className="dropdown-button" 
          onClick={handleToggleClick}
          style={{ visibility: 'visible' }}
          >
          { showStyleControls ? (
            <span className="material-icons">keyboard_arrow_down</span>
          ) :(
            <span className="material-icons">keyboard_arrow_right</span>
          )
          }
        </button>
        <Checkbox
          className='checkbox-button'
          checked={visibleRasters[raster.id] ?? false}
          onClick={() => handleVisibilityChange(raster.id, !(visibleRasters[raster.id] ?? false))}
        />
        <img className="icon-data" src={url + "/raster.png"} alt="raster-item" />
        <p>{raster.name}</p>
        <button className='zoom-button' onClick={() => zoomToLayerRaster(raster.id)}>
          <span className="material-icons">zoom_in_map</span>
        </button>
        <a href="#" onClick={() => handleDeleteRaster(raster.id,dispatch,rasters,setRasters)}><i className='material-icons'>delete</i></a>
        {showStyleControls && (
        <div style={{ marginTop: '10px' }}>
          <styleRasterControls
          rasters={rasters}
          setRasters={setRasters}
          raster={raster}
          dispatch={dispatch}
          zoomToLayerRaster={zoomToLayerRaster}
          />
        </div>
        )}
      </div>
    </li>
  );
}

export const ListItemWithStyleControls = (
  { 
    geojson, 
    updateStyle, 
    polygonStyles, 
    visibleGeoJSONs, 
    setVisibleGeoJSONs, 
    zoomToLayer 
  }
  ) => {
  const [showStyleControls, setShowStyleControls] = useState(false);

  const dispatch = useDispatch();

  const handleVisibilityChange = (id, isVisible) => {
    setVisibleGeoJSONs(prev => ({ ...prev, [id]: isVisible }));
  };

  const handleToggleClick = () => {
    setShowStyleControls(!showStyleControls);
  };

  const isPoint = geojson.geometry.type === "Point" || geojson.geometry.type === "MultiPoint";
  var url = process.env.PUBLIC_URL
  const zoomanddelete = <>
        <tr>
          <td>Zoom to</td>
          <td className='alnright'>
            <button className='zoom-button' onClick={() => zoomToLayer(geojson.properties.id)}>
              <span className="material-icons">zoom_in_map</span>
            </button>
          </td>
        </tr>
        <tr>
          <td>Delete</td>
          <td className='alnright'>
            <a href="#" onClick={() => handleDeleteGeojson(geojson.properties.id,dispatch)}><i className='material-icons'>delete</i></a>
          </td>
        </tr>
        
  </>
  return (
    <li key={geojson.properties.id} >
      
      <div 
      style={{ display: 'flex', alignItems: 'center' }}
      >
        <button 
          className="dropdown-button" 
          onClick={handleToggleClick}
          style={{ visibility: isPoint ? 'hidden' : 'visible' }}>
          { showStyleControls ? (
            <span className="material-icons">keyboard_arrow_down</span>
          ) :(
            <span className="material-icons">keyboard_arrow_right</span>
          )
          }
        </button>
        <Checkbox
          className='checkbox-button'
          checked={visibleGeoJSONs[geojson.properties.id] ?? false}
          onClick={() => handleVisibilityChange(geojson.properties.id, !(visibleGeoJSONs[geojson.properties.id] ?? false))}
        />
        <img className="icon-data" src={url + "/vector.png"} alt="geojson-item" />
        <p>{geojson.properties.name}</p>
      </div>
      {showStyleControls &&(
        <div>
          <StyleControls
            geojson={geojson}
            updateStyle={updateStyle}
            polygonStyles={polygonStyles}
            zoomanddelete={zoomanddelete}
          />
        </div>
      )}
    </li>
  );
};
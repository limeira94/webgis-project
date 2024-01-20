
import parse from 'wellknown';
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch,useSelector } from 'react-redux';
import data, { delete_geojson,delete_raster } from '../../features/data';
import './MapUtils.css'
import M from 'materialize-css';

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
            name: item.name,
            attributes: item.attributes,
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

export const StyleRasterControls = ({
  // rasters,
  // setRasters,
  // dispatch,
  // raster,
  // zoomToLayerRaster,
  zoomanddelete
  // updateStyle,
  // rasterStyles
}) => {
  return (
    <div className='side-nav-item-dropdown-style z-depth-5'>
      <table>
        <tbody>
          {zoomanddelete}
        </tbody>
      </table>
    </div>
  // <div className='style-raster-class'>
  //   <div className='style-raster-item'>
  //     <button className='zoom-button' onClick={() => zoomToLayerRaster(raster.id)}>
  //       <span className="material-icons">zoom_in_map</span>
  //     </button>
  //     <a href="#" onClick={() => handleDeleteRaster(raster.id,dispatch,rasters,setRasters)}><i className='material-icons'>delete</i></a>
  //       {/* <span className='style-span'>Opacity</span>
  //       <input
  //         type="color"
  //         value={rasterStyles[raster.id]?.fillColor || "#ff0000"}
  //         onChange={e => updateStyle(raster.id, "fillColor", e.target.value)}
  //         style={{ width: '30px', height: '30px', border: '1px solid #ddd', borderRadius: '4px' }}
  //       /> */}
  //     </div>
  // </div>
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
var maxCharacters = 15
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
  const dispatch = useDispatch();
  const [showStyleControls, setShowStyleControls] = useState(false);

  const handleToggleClick = () => {
    setShowStyleControls(!showStyleControls);
  };

  const handleVisibilityChange = (id, isVisible) => {
    setVisibleRasters(prev => ({ ...prev, [id]: isVisible }));
  };
  var url = process.env.PUBLIC_URL
  
  return (
    <li 
      key={`raster-${raster.id}`}
      className='list-dataset'
      >
      
      <div 
      className='list-div-dataset'
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
        <p>
          <label >
            <input 
              type="checkbox" 
              className="filled-in" 
              checked={visibleRasters[raster.id] ?? false}
              onClick={() => handleVisibilityChange(raster.id, !(visibleRasters[raster.id] ?? false))}
            />
            <span className='tooltipped' data-position="bottom" data-tooltip={raster.name}>
              <img className="icon-data" src={url + "/raster.png"} alt="raster-item" />
              {raster.name.length > maxCharacters ? raster.name.slice(0, maxCharacters) + '...' : raster.name}
            </span>
          </label>
        </p>

        <button className='zoom-button' onClick={() => zoomToLayerRaster(raster.id)}>
          <span className="material-icons">zoom_in_map</span>
        </button>
        <a href="#" onClick={() => handleDeleteRaster(raster.id,dispatch,rasters,setRasters)}><i className='material-icons'>delete</i></a>
        {showStyleControls && (
        <div style={{ marginTop: '10px' }}>
          <StyleRasterControls
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

//TODO:
// Aqui to gerando dessa forma para unificar os "ListItem" de vetor e de raster. Simplificando código.

export const ListItemWithStyleAll = ({
  datasets,
  polygonStyles,
  setDatasets,
  dataset,
  visibleDatasets,
  setVisibleDatasets,
  datatype,
  zoomToLayer,
  updateStyle,
  selectedFeatureAttributes
}) => {

  const dispatch = useDispatch();
  const [showStyleControls, setShowStyleControls] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const modalRef = useRef(null);


  useEffect(() => {
    if (modalRef.current) {
      M.Modal.init(modalRef.current);
    }
  }, []);

  const handleVisibilityChange = (id, isVisible) => {
    setVisibleDatasets(prev => ({ ...prev, [id]: isVisible }));
  };

  const handleToggleClick = () => {
    setShowStyleControls(!showStyleControls);
  };

  const handleOpenModal = () => {
    setSelectedAttributes(selectedFeatureAttributes);
    console.log(selectedFeatureAttributes);
    const instance = M.Modal.getInstance(modalRef.current);
    instance.open();
  };

  const handleCloseModal = () => {
    const instance = M.Modal.getInstance(modalRef.current);
    instance.close();
  };

  var url = process.env.PUBLIC_URL

  let handleDelete,dataset_id,isPoint,dataset_name,img_icon,styleControlItem
  if (datatype==="raster"){
    handleDelete = () => handleDeleteRaster(dataset.id,dispatch,datasets,setDatasets)
  }
  else{
      handleDelete = () => handleDeleteGeojson(dataset.properties.id,dispatch)
  }
  const zoomanddelete = <>
        <tr>
          <td>Zoom to</td>
          <td className='alnright'>
            <button className='zoom-button' onClick={() => zoomToLayer(dataset_id)}>
              <span className="material-icons">zoom_in_map</span>
            </button>
          </td>
        </tr>
        <tr>
          <td>Delete</td>
          <td className='alnright'>
            <a 
              href="#" 
              onClick={handleDelete}
              >
              <i className='material-icons'>delete</i>
            </a>
          </td>
        </tr>
        
  </>

  if (datatype==="raster"){
    // handleDelete = () => handleDeleteRaster(dataset.id,dispatch,datasets,setDatasets)
    dataset_id = dataset.id
    isPoint=false
    dataset_name = dataset.name
    img_icon = "/raster.png"
    styleControlItem = <StyleRasterControls
    // rasters={datasets}
    // setRasters={setDatasets}
    // raster={dataset}
    // dispatch={dispatch}
    // zoomToLayerRaster={zoomToLayer}
    zoomanddelete={zoomanddelete}
    />
  }
  else{
    // handleDelete = () => handleDeleteGeojson(dataset.id,dispatch)
    dataset_id = dataset.properties.id
    isPoint = dataset.geometry.type === "Point" || dataset.geometry.type === "MultiPoint";
    dataset_name = dataset.properties.name
    img_icon = "/vector.png"
    styleControlItem = <StyleControls
    geojson={dataset}
    updateStyle={updateStyle}
    polygonStyles={polygonStyles}
    zoomanddelete={zoomanddelete}
  />
  }

  return (
    <li
      key={`${datatype}-${dataset_id}`}
      className='list-dataset'
    >
      <div 
      className='list-div-dataset'
      >
        <button 
          className="dropdown-button" 
          onClick={handleToggleClick}
          style={{ visibility: isPoint ? 'hidden' : 'visible' }}
          >
          { showStyleControls ? (
            <span className="material-icons">keyboard_arrow_down</span>
          ) :(
            <span className="material-icons">keyboard_arrow_right</span>
          )
          }
        </button>
        

        <p>
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              className="filled-in" 
              checked={visibleDatasets[dataset_id] ?? false}
              onClick={() => handleVisibilityChange(dataset_id, !(visibleDatasets[dataset_id] ?? false))}
            />
            <span className='tooltipped flex-container' data-position="bottom" data-tooltip={dataset_name}>
              <img className="icon-data" src={url + img_icon} alt={`${datatype}-item`} />
              <span className='text-container'>
              {dataset_name.length > maxCharacters ? dataset_name.slice(0, maxCharacters) + '...' : dataset_name}
              </span>
            </span>
          </label>
        </p>

      </div>
      {showStyleControls &&(
        <div>
          {styleControlItem}
          <button onClick={handleOpenModal}>
            Ver Atributos
          </button>
        </div>
      )}
      {/* Estrutura do Modal */}
      {isModalOpen && (
        <div ref={modalRef} className="modal bottom-sheet">
          <div className="modal-content">
            <h4>Atributos do Dataset</h4>
            {Object.entries(selectedAttributes).map(([key, value]) => (
              <p key={key}><strong>{key}</strong>: {value}</p>
            ))}
          </div>
          <div className="modal-footer">
            <button className="modal-close btn-flat" onClick={() => setIsModalOpen(false)}>Fechar</button>
          </div>
        </div>
      )}

    </li>
    
  )
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
  const dispatch = useDispatch();
  const [showStyleControls, setShowStyleControls] = useState(false);

  const handleVisibilityChange = (id, isVisible) => {
    setVisibleGeoJSONs(prev => ({ ...prev, [id]: isVisible }));
  };

  const handleToggleClick = () => {
    setShowStyleControls(!showStyleControls);
  };

  var url = process.env.PUBLIC_URL

  const isPoint = geojson.geometry.type === "Point" || geojson.geometry.type === "MultiPoint";
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
    <li 
    key={`geojson-${geojson.properties.id}`}
    className='list-dataset'
    >
      
      <div 
      className='list-div-dataset'
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
        
        <p>
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              className="filled-in" 
              checked={visibleGeoJSONs[geojson.properties.id] ?? false}
              onClick={() => handleVisibilityChange(geojson.properties.id, !(visibleGeoJSONs[geojson.properties.id] ?? false))}
            />
            <span className='tooltipped flex-container' data-position="bottom" data-tooltip={geojson.properties.name}>
              <img className="icon-data" src={url + "/vector.png"} alt="geojson-item" />
              <span className='text-container'>
              {geojson.properties.name.length > maxCharacters ? geojson.properties.name.slice(0, maxCharacters) + '...' : geojson.properties.name}
              </span>
            </span>
          </label>
        </p>

        
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
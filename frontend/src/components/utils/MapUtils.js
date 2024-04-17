
import parse from 'wellknown';
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import data, { delete_geojson, delete_raster } from '../../features/data';
import './MapUtils.css'
import M from 'materialize-css';
import Cookies from 'js-cookie'
import axios from 'axios';
import { fromArrayBuffer } from 'geotiff';

const uploadToMemoryRaster = async (event) => {
  const file = event.target.files[0];
  event.target.value = null;

  console.log(file);

  if (file) {
    const arrayBuffer = await file.arrayBuffer();
    const tiff = await fromArrayBuffer(arrayBuffer);
    const image = await tiff.getImage();
    // const tileCoordinates = image.getTileCoordinates();
    const tileCoordinates = image.getBoundingBox();
    const [xmin, ymin, xmax, ymax] = tileCoordinates;
    const bounds = [[ymin, xmin], [ymax, xmax]];
    console.log(bounds)

    // setRasters((prevRasters) => [
    //   ...prevRasters,
    //   {
    //     id: prevRasters.length, // Adjust as needed
    //     raster: URL.createObjectURL(file),
    //     bounds,
    //   },
    // ]);

    // console.log(rasters);
  }
};

const removeItemFromList = (datasets, setDatasets, fileId, datatype) => {
  if (datatype == "raster") {
    const newDatasets = datasets.filter(datasetItem => datasetItem.data.id !== fileId);
    setDatasets(newDatasets);
  } else {
    const newDatasets = datasets.filter(datasetItem => datasetItem.data.properties.id !== fileId);
    setDatasets(newDatasets);
  }
}

const handleDeleteFiles = (fileId, dispatch, datasets, setDatasets, functionDelete, inmemory = false, datatype = "raster") => {
  if (inmemory) {
    // const newDatasets = datasets.filter(datasetItem => datasetItem.id !== fileId);
    // setDatasets(newDatasets);
    removeItemFromList(datasets, setDatasets, fileId, datatype)
  }
  else {
    dispatch(functionDelete(fileId))
      .then((action) => {
        console.log("fileid", fileId)
        if (action.meta.requestStatus === 'fulfilled') {
          // const newRasters = rasters.filter(rasterItem => rasterItem.id !== rasterId);
          // setRasters(newRasters);
          removeItemFromList(datasets, setDatasets, fileId, datatype)
        } else {
          console.error(`Failed to delete ${datatype}`);
        }
      })
      .catch((error) => {
        console.error('Error occurred while deleting request:', error);
      });
  }
}

export const parseGeoJSON = (data) => {
  const grouped = data.reduce((acc, item) => {
    const parts = item.geojson.split(';');

    const geojson = parts.length > 1 ? parse(parts[1]) : null;
    if (!geojson) {
      console.error("Invalid geojson data", item.geojson);
      return acc;
    }
    const groupId = item.group_id;
    if (!acc[groupId]) {
      acc[groupId] = {
        type: 'FeatureCollection',
        features: [],
        properties: {
          id: groupId,
          group_id: groupId,
          name: item.name,
          attributes: item.attributes,
        },
      };
    }
    acc[groupId].features.push({
      type: 'Feature',
      geometry: geojson,
      properties: {
        id: item.id,
        group_id: groupId,
        name: item.name,
        attributes: item.attributes,
      },
    });
    return acc;
  }, {});

  return Object.values(grouped);
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

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/'

const changeVisual = async (rasters, setRasters, raster_id, visual_type, params) => {
  try {
    const response = await axios.post(
      `${API_URL}api/main/raster/change-visual/${raster_id}`,
      {
        params: params,
        visual_type: visual_type
      },
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${Cookies.get('access_token')}`
        }
      }
    );

    const updatedRasters = rasters.map(raster => {
      if (raster.id === raster_id) {
        return { ...raster, png: response.data.png };
      }
      return raster;
    });
    setRasters(updatedRasters)
    console.log(response)

    if (response.status === 201) {
      M.toast(
        {
          html: "Raster updated sucessfully.",
          classes: 'green rounded',
          displayLength: 5000
        });
    } else {
      M.toast(
        {
          html: "Error while trying to update raster",
          classes: 'red rounded',
          displayLength: 5000
        })
    }


    return response

  } catch (error) {
    console.log(error)
    // console.error('Error fetching GeoJSON data:', error);
  }
}

export const StyleRasterControls = ({
  rasters,
  setRasters,
  // dispatch,
  // raster,
  // zoomToLayerRaster,
  zoomanddelete,
  bands,
  raster_id,
  // updateStyle,
  // rasterStyles
}) => {

  const [selectedValues, setSelectedValues] = useState({ R: '', G: '', B: '', Gray: '' });

  useEffect(() => {
    var options = {}
    var elems = document.querySelectorAll('.collapsible');
    M.Collapsible.init(elems, options);

    var elems = document.querySelectorAll('select');
    M.FormSelect.init(elems);

  }, [])

  const handleSubmitComposition = () => {

    const visual_type = "composition"

    const params = {
      R: selectedValues['R'],
      G: selectedValues['G'],
      B: selectedValues['B']
    };

    if (!selectedValues['R'] || !selectedValues['G'] || !selectedValues['B']) {
      alert('Please select values for R, G, and B.');
      return;
    }

    changeVisual(rasters, setRasters, raster_id, visual_type, params)

  };

  const handleSubmitGrayscale = () => {
    const visual_type = "grayscale"
    const params = {
      Gray: selectedValues['Gray'],
    };

    if (!selectedValues['Gray']) {
      alert('Please select the band.')
      return;
    }

    changeVisual(rasters, setRasters, raster_id, visual_type, params)

  };

  const selectItems = (key) => {
    return (
      <select
        // ref={key} 
        // value={} 
        onChange={(e) => setSelectedValues({ ...selectedValues, [key]: e.target.value })}
        defaultValue={selectedValues[key]}
      >
        <option value="" disabled>
          Choose your option
        </option>
        {Array.from({ length: bands }, (_, index) => (
          <option key={index} value={index}>
            {`Band ${index + 1}`}
          </option>
        ))}
      </select>
    );
  }

  const tableComposition = (
    <table className='centered'>
      <thead>
        <tr>
          <th>Band</th>
          <th>Options</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Red</td>
          <td>
            {selectItems("R")}
          </td>
        </tr>
        <tr>
          <td>Green</td>
          <td>
            {selectItems("G")}
          </td>
        </tr>
        <tr>
          <td>Blue</td>
          <td>
            {selectItems("B")}
          </td>
        </tr>
      </tbody>
    </table>
  );

  const tableGray = (
    <table className='centered'>
      <thead>
        <tr>
          <th>Band</th>
          <th>Options</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Choose your option:</td>
          <td>
            {selectItems("Gray")}
          </td>
        </tr>
      </tbody>
    </table>
  )

  const bandsItem =
    <div className='collapsible-raster'>
      <h5 className='center'>Display:</h5>
      <ul className="collapsible">
        <li>
          <div className="collapsible-header">Composition</div>
          <div className="collapsible-body">
            {tableComposition}
            <button onClick={handleSubmitComposition} type='submit' className="btn submit-display-button center">
              Submit
            </button>
          </div>
        </li>
        <li>
          <div className="collapsible-header">
            Grayscale
          </div>
          <div className="collapsible-body">
            {tableGray}
            <button onClick={handleSubmitGrayscale} type='submit' className="btn submit-display-button center">
              Submit
            </button>
          </div>
        </li>
        {/* <li>
            <div className="collapsible-header"><i className="material-icons">whatshot</i>Paletted</div>
            <div className="collapsible-body"><span>Lorem ipsum dolor sit amet.</span></div>
          </li> */}
      </ul>
    </div>

  return (
    <div className='side-nav-item-dropdown-style z-depth-5'>
      <table>
        <tbody>
          {zoomanddelete}
        </tbody>
      </table>
      {bands > 0 && bandsItem}
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

const get_item_table = (title, inputType, value, name, geojson, updateStyle) => {

  const onChange = e => updateStyle(geojson.properties.id, name, e.target.value)
  const isRange = inputType === 'range';

  let min, max, step;
  let classname

  if (name === 'weight') {
    min = 0; max = 10; step = 1;
  } else if (name === 'fillOpacity') {
    min = 0; max = 1; step = 0.1;
  }
  else {
    min = undefined; max = undefined; step = undefined;
  }


  if (isRange) {
    classname = `sidenav-range-style`
  }
  else {
    classname = `input-color-style`
  }


  return (
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

export const StyleControls = ({ geojsondata, updateStyle, polygonStyles, zoomanddelete }) => {

  let isPoint = false;
  let isLine = false;

  const geojson = geojsondata.data.features[0]

  if (geojson.type === 'FeatuteCollection') {
    isPoint = geojson.features.some(feature => feature.geometry && (feature.geometry.type === "Point" || feature.geometry.type === "MultiPoint"));
    isLine = geojson.features.some(feature => feature.geometry && (feature.geometry.type === "LineString" || feature.geometry.type === "MultiLineString"));
  } else {
    isPoint = geojson.geometry.type === "Point" || geojson.geometry.type === "MultiPoint";
    isLine = geojson.geometry.type === "LineString" || geojson.geometry.type === "MultiLineString";
  }

  // const isPoint = geojson.geometry.type === "Point" || geojson.geometry.type === "MultiPoint";
  // const isLine = geojson.geometry.type === "LineString" || geojson.geometry.type === "MultiLineString";

  
  const colorValue = polygonStyles[geojson.properties.id]?.fillColor || "#ff0000"
  const colorRow = get_item_table("Color", "color", colorValue, "fillColor", geojson, updateStyle);

  const lineColorValue = polygonStyles[geojson.properties.id]?.color || "#ff0000"
  const lineColorRow = get_item_table("Line Color", "color", lineColorValue, "color", geojson, updateStyle);

  const widthValue = polygonStyles[geojson.properties.id]?.weight || 3
  const widthRow = get_item_table("Line Size", "range", widthValue, "weight", geojson, updateStyle);

  const opacityValue = polygonStyles[geojson.properties.id]?.fillOpacity || 0.65
  const opacityRow = get_item_table("Opacity", "range", opacityValue, "fillOpacity", geojson, updateStyle);

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

export const ListItemWithStyleAll = ({
  datasets,
  polygonStyles,
  setDatasets,
  dataset,
  datatype,
  zoomToLayer,
  updateStyle,
  selectedFeatureAttributes,
  inmemory = false
}) => {


  const dispatch = useDispatch();
  const [showStyleControls, setShowStyleControls] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const modalRef = useRef(null);

  useEffect(() => {
    const options = {};
    M.Modal.init(document.querySelector('.modal'), options);
  }, []);


  // const handleVisibilityChange = (id, isVisible) => {
  const handleVisibilityChange = (dataset) => {
    const updatedDataset = { ...dataset, visible: !dataset.visible };
    setDatasets(prevDatasets => prevDatasets.map(item => (item.id === dataset.id ? updatedDataset : item)));
  };

  const handleToggleClick = () => {
    setShowStyleControls(!showStyleControls);
  };

  var url = process.env.PUBLIC_URL

  let handleDelete, img_icon, styleControlItem,dataset_name

  const deleteFunction = datatype === "raster" ? delete_raster : delete_geojson;
  const dataset_id = datatype === "raster" ? dataset.data.id : dataset.data.properties.id ;

  handleDelete = () => handleDeleteFiles(dataset_id, dispatch, datasets, setDatasets, deleteFunction, inmemory = inmemory, datatype = datatype)

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

  if (datatype === "raster") {
    dataset_name = dataset.data.name
    img_icon = "/raster.png"
    styleControlItem = <StyleRasterControls
      rasters={datasets}
      setRasters={setDatasets}
      // raster={dataset}
      // dispatch={dispatch}
      // zoomToLayerRaster={zoomToLayer}
      raster_id={dataset_id}
      bands={dataset.bands}
      zoomanddelete={zoomanddelete}
    />
  }
  else {
    // isPoint = dataset.geometry.type === "Point" || dataset.geometry.type === "MultiPoint";
    dataset_name = dataset.data.properties.name
    img_icon = "/vector.png"
    styleControlItem = <StyleControls
      geojsondata={dataset}//dataset.data.features[0]}
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
          style={{ visibility: 'visible' }}
        >
          {showStyleControls ? (
            <span className="material-icons">keyboard_arrow_down</span>
          ) : (
            <span className="material-icons">keyboard_arrow_right</span>
          )
          }
        </button>


        <p>
          <label className="checkbox-label">
            <input
              type="checkbox"
              className="filled-in"
              checked={
                dataset.visible
                // visibleDatasets[dataset_id] ?? false
              }
              // onClick={() => handleVisibilityChange(dataset_id, !(visibleDatasets[dataset_id] ?? false))}
              onClick={() => handleVisibilityChange(dataset)}
              // onChange={() => { }}
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
      {showStyleControls && (
        <div>
          {styleControlItem}
          {/* <button onClick={handleOpenModal}>
            Ver Atributos
          </button> */}
        </div>
      )}

      {isModalOpen && (
        <div ref={modalRef} className="modal">
          <div className="modal-content">
            <h4>Tabela de Atributos</h4>
            <table className="striped">
              {selectedAttributes.features.map((feature, featureIndex) => (
                <tbody key={featureIndex}>
                  {Object.entries(feature.properties).map(([key, value], index) => (
                    <tr key={index}>
                      <th>{key}</th>
                      <td>{value}</td>
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
          <div className="modal-footer">
            <button className="modal-close btn-flat">Fechar</button>
          </div>
        </div>
      )}

    </li>

  )
}


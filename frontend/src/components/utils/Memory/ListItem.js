import { useDispatch } from "react-redux";
import M from 'materialize-css';
import { useState,useRef,useEffect } from "react";
import { handleDeleteFiles } from "../../sidenav/ListItem";
import { StyleRasterControls } from "../../sidenav/StyleControls";
import { StyleControlsMemory } from "./StyleControlsMemory";
import { delete_raster,delete_geojson } from "../../../features/data";

var maxCharacters = 15

export const ListItemWithStyleMemory = ({
    datasets,
    setDatasets,
    dataset,
    datatype,
    zoomToLayer,
    updateStyle,
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
  
  
    const handleVisibilityChange = (dataset) => {
      const updatedDataset = { ...dataset, visible: !dataset.visible };
      setDatasets(prevDatasets => {
        return prevDatasets.map(item => {
  
          const comp = dataset.data.properties == undefined ? item.data.id === dataset.data.id : item.data.properties.id === dataset.data.properties.id
  
          if (comp) {
            return updatedDataset;
          }
          return item;
        });
      });
    };
  
    const handleToggleClick = () => {
      setShowStyleControls(!showStyleControls);
    };
  
    var url = process.env.PUBLIC_URL
  
    let handleDelete, img_icon, styleControlItem, dataset_name
  
    const deleteFunction = datatype === "raster" ? delete_raster : delete_geojson;
    const dataset_id = datatype === "raster" ? dataset.data.id : dataset.data.properties.id;
  
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
        // bands={dataset.bands}
        bands={dataset.data.bands}
        zoomanddelete={zoomanddelete}
      />
    }
    else {
      // isPoint = dataset.geometry.type === "Point" || dataset.geometry.type === "MultiPoint";
      dataset_name = dataset.data.properties.name
      img_icon = "/vector.png"
      styleControlItem = <StyleControlsMemory
        geojsondata={dataset}//dataset.data.features[0]}
        updateStyle={updateStyle}
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
                onChange={() => { }}
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
  
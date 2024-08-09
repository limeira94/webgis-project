import Cookies from 'js-cookie'
import axios from 'axios';
import M from 'materialize-css';
import { useState,useEffect } from 'react';

import "./StyleControls.css"

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/'



export const get_item_table = (title, inputType, value, name, geojson, updateStyle) => {

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


export const StyleControls = ({ geojsondata, updateStyle, zoomanddelete }) => {

    const [isModalOpen,setIsModalOpen] = useState(false)

    let isPoint = false;
    let isLine = false;

    const geojson = geojsondata.data.features === undefined ?
        geojsondata.data :
        geojsondata.data//.features[0]

    if (geojson.type === 'FeatureCollection') {
        isPoint = geojson.features.some(feature => feature.geometry && (feature.geometry.type === "Point" || feature.geometry.type === "MultiPoint"));
        isLine = geojson.features.some(feature => feature.geometry && (feature.geometry.type === "LineString" || feature.geometry.type === "MultiLineString"));
    } else {
        isPoint = geojson.geometry.type === "Point" || geojson.geometry.type === "MultiPoint";
        isLine = geojson.geometry.type === "LineString" || geojson.geometry.type === "MultiLineString";
    }

    const handleSaveStyle = async (geojson) => {
        try {
            const style = geojson.properties.style;
            const vectorId = geojson.properties.id;
            const token = Cookies.get('access_token');

            const response = await axios.post(
                `${API_URL}api/main/vectors/${vectorId}/save-style/`, {
                style: style
            }, {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                console.log('Style saved successfully!');
            } else {
                console.error('Unexpected response:', response);
            }
        } catch (error) {
            console.error('Error saving style:', error);
        }
    };

    const saveStyle = <>
        <tr>
            <td><span>Save style</span></td>
            <td className='alnright'>
                <a onClick={() => handleSaveStyle(geojson)} className='btn blue'><i className='material-icons'>save</i></a>
            </td>
        </tr>
    </>

    // const openStyleModal = () => { }
    const openStyleModal = () => {
        setIsModalOpen(true);
    };

    const closeStyleModal = () => {
        setIsModalOpen(false);
    };


    // const changeStyleButton = <>
    //     <tr>
    //         <td><span>Change style</span></td>
    //         <td className='alnright'>
    //             <a onClick={() => openStyleModal(geojson)} className='btn blue'>
    //                 <i className='material-icons'>save</i>
    //             </a>
    //         </td>
    //     </tr>
    // </>
    const changeStyleButton = <>
        <tr>
            <td><span>Change style</span></td>
            <td className='alnright'>
                <a onClick={openStyleModal} className='btn blue'>
                    <i className='material-icons'>edit</i>
                </a>
            </td>
        </tr>
    </>

    // const isPoint = geojson.geometry.type === "Point" || geojson.geometry.type === "MultiPoint";
    // const isLine = geojson.geometry.type === "LineString" || geojson.geometry.type === "MultiLineString";

    // const colorValue = geojsondata.style.fillColor
    const colorValue = geojsondata.data.properties.style.fillColor
    const colorRow = get_item_table("Color", "color", colorValue, "fillColor", geojson, updateStyle);

    const lineColorValue = geojsondata.data.properties.style.color
    const lineColorRow = get_item_table("Line Color", "color", lineColorValue, "color", geojson, updateStyle);

    const widthValue = geojsondata.data.properties.style.weight
    const widthRow = get_item_table("Line Size", "range", widthValue, "weight", geojson, updateStyle);

    const opacityValue = geojsondata.data.properties.style.fillOpacity
    const opacityRow = get_item_table("Opacity", "range", opacityValue, "fillOpacity", geojson, updateStyle);



    return (
        <>
            <div className='side-nav-item-dropdown-style z-depth-5'>
                <table>
                    <tbody>
                        {zoomanddelete}
                        {changeStyleButton}
                        {/* {!isPoint && !isLine && colorRow}
                        {!isPoint && lineColorRow}
                        {!isPoint && !isLine && opacityRow}
                        {!isPoint && widthRow}
                        {saveStyle} */}
                    </tbody>
                </table>
            </div>



            {isModalOpen && (
                <div className='modal modal-change-style' 
                style={{ display: 'block' }}
                >
                    <div className='modal-content'>
                        <h4>Change Style</h4>
                        <p>Use the controls below to change the style of the layers.</p>
                        {/* Add the style controls here */}
                        {!isPoint && !isLine && colorRow}
                        {!isPoint && lineColorRow}
                        {!isPoint && !isLine && opacityRow}
                        {!isPoint && widthRow}
                    </div>
                    <div className='modal-footer'>
                        <a onClick={closeStyleModal} className='modal-close btn red'>Close</a>
                        <a onClick={() => handleSaveStyle(geojson)} className='modal-close btn blue'>Save</a>
                    </div>
                </div>
            )}

        </>


    );
};








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

    // const updatedRasters = rasters.map(raster => {
    //   if (raster.id === raster_id) {
    //     return { ...raster, png: response.data.png };
    //   }
    //   return raster;
    // });
    // setRasters(updatedRasters)
    const updatedRasters = rasters.map(raster => {
      if (raster.data.id === raster_id) {
        return { ...raster, data: { ...raster.data, png: response.data.png } }
      }
      return raster;
    });
    setRasters(updatedRasters)
    // // console.log(response)

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
    )
  }





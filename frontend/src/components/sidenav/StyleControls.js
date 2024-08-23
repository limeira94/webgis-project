import Cookies from 'js-cookie'
import axios from 'axios';
import M from 'materialize-css';
import { useState,useEffect } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material"

import "./StyleControls.css"

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/'


const GlobalStyle = ({ geojson,updateStyle }) => {
  const [color, setColor] = useState(geojson.data.properties.style?.fillColor);
  const [lineColor, setLineColor] = useState(geojson.data.properties.style?.color);
  const [width, setWidth] = useState(geojson.data.properties.style?.weight);
  const [opacity, setOpacity] = useState(geojson.data.properties.style?.opacity);

  const handleColorChange = (e) => setColor(e.target.value);
  const handleLineColorChange = (e) => setLineColor(e.target.value);
  const handleWidthChange = (e) => setWidth(e.target.value);
  const handleOpacityChange = (e) => setOpacity(e.target.value);

  let isPoint = false;
  let isLine = false;

  if (geojson.data.type === 'FeatureCollection') {
      isPoint = geojson.data.features.some(feature => feature.geometry && (feature.geometry.type === "Point" || feature.geometry.type === "MultiPoint"));
      isLine = geojson.data.features.some(feature => feature.geometry && (feature.geometry.type === "LineString" || feature.geometry.type === "MultiLineString"));
  } else {
      isPoint = geojson.data.geometry.type === "Point" || geojson.geometry.type === "MultiPoint";
      isLine = geojson.data.geometry.type === "LineString" || geojson.geometry.type === "MultiLineString";
  }

  const data = [
    { name: "Color", class: "input-color-style", type: "color", value: color, onchange: handleColorChange, show:!isPoint && !isLine  },
    { name: "Line Color", class: "input-color-style", type: "color", value: lineColor, onchange: handleLineColorChange, show:!isPoint  },
    { name: "Line Size", class: "sidenav-range-style", type: "range", min: 0, max: 10, step: 1, value: width, onchange: handleWidthChange, show:!isPoint }, 
    { name: "Opacity", class: "sidenav-range-style", type: "range", min: 0, max: 1, step: 0.1, value: opacity, onchange: handleOpacityChange, show:!isPoint && !isLine }
  ];

  const handleSaveStyle = async (geojson) => {
    try {
        const style = geojson.data.properties.style;
        const vectorId = geojson.data.properties.id;
        const token = Cookies.get('access_token');

        const updatedStyle = {
          color: lineColor,
          weight: width,
          fillColor: color,
          fillOpacity: opacity
        }

        console.log(style)
        console.log(updatedStyle)
        console.log("style",style===updatedStyle)

        const response = await axios.post(
            `${API_URL}api/main/vectors/${vectorId}/save-style/`, {
            style: updatedStyle
        }, {
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${token}`
            }
        });

        if (response.status === 200) {
          
          updateStyle(geojson.data.properties.id, "fillColor", color)
          updateStyle(geojson.data.properties.id, "color", lineColor)
          updateStyle(geojson.data.properties.id, "weight", width)
          updateStyle(geojson.data.properties.id, "fillOpacity", opacity)
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
              <a onClick={
                () => handleSaveStyle(geojson)
                // ()=>handleSaveStyle(geojson)
                } className='btn blue'><i className='material-icons'>save</i></a>
          </td>
      </tr>
    </>



  return (
    <table>
      <tbody>
        {data.map((d, index) =>
          d.show ? (
            <tr key={index}>
              <td><span>{d.name}</span></td>
              <td className='alnright'>
                <input
                  className={d.class}
                  type={d.type}
                  min={d.min}
                  max={d.max}
                  step={d.step}
                  value={d.value}
                  onChange={d.onchange}
                />
              </td>
            </tr>
          ) : null
        )}
        {saveStyle}
      </tbody>
    </table>
  );
};

const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};


const CategorizedStyle = ({ geojson, updateStyle }) => {
  const [column, setColumn] = useState(null);
  const [uniqueValues, setUniqueValues] = useState([]);
  const [colors, setColors] = useState({});
  const [weight, setWeight] = useState(5); // Default weight
  const [fillOpacity, setFillOpacity] = useState(0.5); // Default fillOpacity

  const handleSaveCategorizedStyle = async () => {
    try {
      const vectorId = geojson.data.properties.id;
      const token = Cookies.get('access_token');

      const categorizedStyles = geojson.data.features.reduce((acc, feature) => {
        const attributeValue = feature.properties.attributes[column];
        acc[feature.id] = {
          ...feature.style,
          fillColor: colors[attributeValue],
          color: "black", 
          weight, 
          fillOpacity, 
        };
        return acc;
      }, {});

      const response = await axios.post(
        `${API_URL}api/main/vectors/${vectorId}/save-style-cat/`,
        { categorized_styles: categorizedStyles },
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          }
        }
      );

      if (response.status === 200) {
        // Atualize o estilo no mapa
        console.log("CAT",categorizedStyles)
        Object.keys(categorizedStyles).forEach(featureId => {
          const style = categorizedStyles[featureId];
          updateStyle(geojson.data.properties.id, "fillColor", style.fillColor,featureId);
          updateStyle(geojson.data.properties.id, "color", style.color,featureId);
          updateStyle(geojson.data.properties.id, "weight", style.weight,featureId);
          updateStyle(geojson.data.properties.id, "fillOpacity", style.fillOpacity,featureId);
        });
      } else {
        console.error('Unexpected response:', response);
      }
    } catch (error) {
      console.error('Error saving categorized style:', error);
    }
  };

  const columns = geojson?.data?.features?.[0]?.properties?.attributes
    ? Object.keys(geojson.data.features[0].properties.attributes)
    : [];

    const handleChange = (event) => {
      const selectedColumn = event.target.value;
      setColumn(selectedColumn);

      // Get all values for the selected column
      const values = geojson.data.features.map(
        (feature) => feature.properties.attributes[selectedColumn]
      );
      console.log("VALUES", values);

      // Extract unique values
      const unique = [...new Set(values)];
      setUniqueValues(unique);

      const initialColors = unique.reduce((acc, value) => {
        acc[value] = getRandomColor();
        return acc;
      }, {});
      setColors(initialColors);
    };

    const handleColorChange = (value, color) => {
      setColors((prevColors) => ({
        ...prevColors,
        [value]: color
      }));
    };

    const handleWeightChange = (event) => {
      setWeight(Number(event.target.value));
    };

    const handleFillOpacityChange = (event) => {
      setFillOpacity(Number(event.target.value));
    };

  return (
    <>
      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">Column</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={column}
          label="Column"
          onChange={handleChange}
        >
          {columns.map((col) => (
            <MenuItem key={col} value={col}>
              {col}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {column && uniqueValues.length > 0 && (
        <>
          <ul style={{ marginTop: '16px', listStyle: 'none', padding: 0 }}>
            {uniqueValues.map((value) => (
              <li key={value} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <input
                  type="color"
                  value={colors[value]}
                  onChange={(e) => handleColorChange(value, e.target.value)}
                  style={{ marginRight: '8px' }}
                />
                <span>{value}</span>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: '16px' }}>
            <label>
              Line size:
              <input
                type="range"
                value={weight}
                onChange={handleWeightChange}
                min="0"
                max="10"
                step="1"
                style={{ marginLeft: '8px' }}
              />
            </label>
          </div>
          <div style={{ marginTop: '16px' }}>
            <label>
              Opacity:
              <input
                type="range"
                value={fillOpacity}
                onChange={handleFillOpacityChange}
                min="0"
                max="1"
                step="0.1"
                style={{ marginLeft: '8px' }}
              />
            </label>
          </div>
          <button onClick={handleSaveCategorizedStyle}>
            Save Categorized Style
          </button>
        </>
      )}
    </>
  );
};

export default CategorizedStyle;

// const CategorizedStyle = ({ geojson,updateStyle }) => {
//   const [column, setColumn] = useState(null);
//   const [uniqueValues, setUniqueValues] = useState([]);
//   const [colors, setColors] = useState({});

//   const handleSaveCategorizedStyle = async () => {
//     try {
//       const vectorId = geojson.data.properties.id;
//       const token = Cookies.get('access_token');

//       const categorizedStyles = geojson.data.features.reduce((acc, feature) => {
//         const attributeValue = feature.properties.attributes[column];
//         acc[feature.id] = {
//           ...feature.style,
//           fillColor: colors[attributeValue],
//         };
//         return acc;
//       }, {});

//       const response = await axios.post(
//         `${API_URL}api/main/vectors/${vectorId}/save-style-cat/`,
//         { categorized_styles: categorizedStyles },
//         {
//           headers: {
//             Accept: 'application/json',
//             Authorization: `Bearer ${token}`,
//           }
//         }
//       );

//       if (response.status === 200) {
//         // Atualize o estilo no mapa
//         Object.keys(categorizedStyles).forEach(featureId => {
//           const style = categorizedStyles[featureId];
//           updateStyle(geojson.data.properties.id, "fillColor", style.fillColor);
//         });
//       } else {
//         console.error('Unexpected response:', response);
//       }
//     } catch (error) {
//       console.error('Error saving categorized style:', error);
//     }
//   };

//   const columns = geojson?.data?.features?.[0]?.properties?.attributes
//     ? Object.keys(geojson.data.features[0].properties.attributes)
//     : [];

//     const handleChange = (event) => {
//       const selectedColumn = event.target.value;
//       setColumn(selectedColumn);
  
//       // Get all values for the selected column
//       const values = geojson.data.features.map(
//         (feature) => feature.properties.attributes[selectedColumn]
//       );
//       console.log("VALUES",values)
  
//       // Extract unique values
//       const unique = [...new Set(values)];
//       setUniqueValues(unique);

//       const initialColors = unique.reduce((acc, value) => {
//         acc[value] = getRandomColor();
//         return acc;
//       }, {});
//       setColors(initialColors);
//     };

//     const handleColorChange = (value, color) => {
//       setColors((prevColors) => ({
//         ...prevColors,
//         [value]: color
//       }));
//     };

//     console.log(colors)

//   return (
//     <>
//       <FormControl fullWidth>
//         <InputLabel id="demo-simple-select-label">Column</InputLabel>
//         <Select
//           labelId="demo-simple-select-label"
//           id="demo-simple-select"
//           value={column}
//           label="Column"
//           onChange={handleChange}
//         >
//           {columns.map((col) => (
//             <MenuItem key={col} value={col}>
//               {col}
//             </MenuItem>
//           ))}
//         </Select>
//       </FormControl>

//       {/* {column && uniqueValues.length > 0 && (
//         <ul style={{ marginTop: '16px' }}>
//           {uniqueValues.map((value) => (
//             <li key={value}>{value}</li>
//           ))}
//         </ul>
//       )} */}
//       {column && uniqueValues.length > 0 && (
//         <>
//         <ul style={{ marginTop: '16px', listStyle: 'none', padding: 0 }}>
//           {uniqueValues.map((value) => (
//             <li key={value} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
//               <input
//                 type="color"
//                 value={colors[value]}
//                 onChange={(e) => handleColorChange(value, e.target.value)}
//                 style={{ marginRight: '8px' }}
//               />
//               <span>{value}</span>
//             </li>
//           ))}
//         </ul>
//         <button onClick={handleSaveCategorizedStyle}>Save Categorized Style</button>
//         </>
//       )}
//     </>
//   );
// };

// export default CategorizedStyle;

const ModalChangeData = ({ geojson,updateStyle,updateStyleCat }) => {
  const [selectedOption, setSelectedOption] = useState('global');

  const handleOptionChange = (e) => setSelectedOption(e.target.value);

  return (
    <>
      <div className='center'>
      
        <label>
          <input
            className="with-gap"
            name="styleOption"
            type="radio"
            value="global"
            checked={selectedOption === 'global'}
            onChange={handleOptionChange}
          />
          <span>Global</span>
        </label>
      
        <label>
          <input
            className="with-gap"
            name="styleOption"
            type="radio"
            value="category"
            checked={selectedOption === 'category'}
            onChange={handleOptionChange}
          />
          <span>Categorized</span>
        </label>
      
      </div>

      {selectedOption === 'global' ? (
        <GlobalStyle geojson={geojson} updateStyle={updateStyle}/>
      ) : (
        <CategorizedStyle geojson={geojson} updateStyle={updateStyleCat}/>
      )}
    </>
  );
};

export const get_item_table = (title, inputType, value, name, geojson, updateStyle) => {

    const onChange = e => updateStyle(
      geojson.properties.id, name, e.target.value
    )
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


export const StyleControls = ({ 
  geojsondata, 
  updateStyle, 
  updateStyleCat,
  zoomanddelete,
  changeStyleData,
  setChangeStyleData
 }) => {

    const openStyleModal = () => {
      setChangeStyleData(<ModalChangeData 
                            geojson={geojsondata} 
                            updateStyle={updateStyle}
                            updateStyleCat={updateStyleCat}
                            />)
  };

    const changeStyleButton = <>
        <tr>
            <td><span>Change style</span></td>
            <td className='alnright'>
                {/* <a class="waves-effect waves-light btn modal-trigger" href="#modal1">Modal</a> */}
                <a onClick={openStyleModal} className='btn blue modal-trigger' href="#change-style-modal">
                    <i className='material-icons'>edit</i>
                </a>
            </td>
        </tr>
    </>


    return (
        <>
            <div className='side-nav-item-dropdown-style z-depth-5'>
                <table>
                    <tbody>
                        {zoomanddelete}
                        {changeStyleButton}
                    </tbody>
                </table>
            </div>
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





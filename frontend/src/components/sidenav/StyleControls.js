import Cookies from 'js-cookie'
import axios from 'axios';
import M from 'materialize-css';
import { useState, useEffect } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from "@mui/material"
import EditIcon from '@mui/icons-material/Edit';
import "./StyleControls.css"

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/'

const GlobalStyle = ({ geojson, updateStyle }) => {
  const [color, setColor] = useState(geojson.data.properties.style?.fillColor || '#000000');
  const [lineColor, setLineColor] = useState(geojson.data.properties.style?.color || '#000000');
  const [width, setWidth] = useState(geojson.data.properties.style?.weight || 2);
  const [opacity, setOpacity] = useState(geojson.data.properties.style?.fillOpacity || 1.0);
  const [radius, setRadius] = useState(geojson.data.properties.style?.radius || 8);

  const handleColorChange = (e) => setColor(e.target.value);
  const handleLineColorChange = (e) => setLineColor(e.target.value);
  const handleWidthChange = (e) => setWidth(e.target.value);
  const handleOpacityChange = (e) => setOpacity(e.target.value);
  const handleRadiusChange = (e) => setRadius(e.target.value);

  let isPoint = false;
  let isLine = false;
  let isPolygon = false;

  if (geojson.data.type === 'FeatureCollection') {
    isPoint = geojson.data.features.some(feature => feature.geometry && (feature.geometry.type === "Point" || feature.geometry.type === "MultiPoint"));
    isLine = geojson.data.features.some(feature => feature.geometry && (feature.geometry.type === "LineString" || feature.geometry.type === "MultiLineString"));
    isPolygon = geojson.data.features.some(feature => feature.geometry && (feature.geometry.type === "Polygon" || feature.geometry.type === "MultiPolygon"));
  } else {
    isPoint = geojson.data.geometry.type === "Point" || geojson.data.geometry.type === "MultiPoint";
    isLine = geojson.data.geometry.type === "LineString" || geojson.data.geometry.type === "MultiLineString";
    isPolygon = geojson.data.geometry.type === "Polygon" || geojson.data.geometry.type === "MultiPolygon";
  }

  const data = [
    { name: "Fill Color", class: "input-color-style", type: "color", value: color, onchange: handleColorChange, show: isPoint || isPolygon },
    { name: "Line Color", class: "input-color-style", type: "color", value: lineColor, onchange: handleLineColorChange, show: isLine || isPolygon },
    { name: "Line Size", class: "sidenav-range-style", type: "range", min: 0, max: 10, step: 1, value: width, onchange: handleWidthChange, show: isLine },
    { name: "Opacity", class: "sidenav-range-style", type: "range", min: 0, max: 1, step: 0.1, value: opacity, onchange: handleOpacityChange, show: isPoint || isPolygon },
    { name: "Radius", class: "sidenav-range-style", type: "range", min: 0, max: 20, step: 1, value: radius, onchange: handleRadiusChange, show: isPoint }
  ];

  const handleSaveStyle = async (geojson) => {
    try {
      const style = geojson.data.properties.style || {};
      const vectorId = geojson.data.properties.id;
      const token = Cookies.get('access_token');

      const updatedStyle = {
        color: lineColor,
        weight: width,
        fillColor: color,
        fillOpacity: opacity,
        radius: radius
      };

      const response = await axios.post(
        `${API_URL}api/main/vectors/${vectorId}/save-style/`,
        { style: updatedStyle },
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        geojson.data.features.forEach(feature => {
          const featureId = feature.id;
          updateStyle(geojson.data.properties.id, "fillColor", color, featureId);
          updateStyle(geojson.data.properties.id, "color", lineColor, featureId);
          updateStyle(geojson.data.properties.id, "weight", width, featureId);
          updateStyle(geojson.data.properties.id, "fillOpacity", opacity, featureId);
          updateStyle(geojson.data.properties.id, "radius", radius, featureId);
        });
      } else {
        console.error('Unexpected response:', response);
      }
    } catch (error) {
      console.error('Error saving style:', error);
    }
  };

  const saveStyle = (
    <tr>
      <td><span>Save style</span></td>
      <td className='alnright'>
        <a onClick={() => handleSaveStyle(geojson)} className='btn blue'>
          <i className='material-icons'>save</i>
        </a>
      </td>
    </tr>
  );

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
  const [weight, setWeight] = useState(2);
  const [fillOpacity, setFillOpacity] = useState(1.0);

  const handleSaveCategorizedStyle = async () => {
    try {
      const vectorId = geojson.data.properties.id;
      const token = Cookies.get('access_token');

      const categorizedStyles = geojson.data.features.reduce((acc, feature) => {
        const attributeValue = feature.properties.attributes[column];
        const style = { ...feature.style };

        switch (feature.geometry.type) {
          case 'Point':
          case 'MultiPoint':
            acc[feature.id] = {
              ...style,
              radius: weight,
              fillColor: colors[attributeValue],
              color: 'black',
              weight: 2,
              opacity: 1,
              fillOpacity,
            };
            break;
          case 'LineString':
          case 'MultiLineString':
            acc[feature.id] = {
              ...style,
              color: colors[attributeValue],
              weight,
            };
            break;
          case 'Polygon':
          case 'MultiPolygon':
            acc[feature.id] = {
              ...style,
              fillColor: colors[attributeValue],
              color: 'black',
              weight,
              fillOpacity,
            };
            break;
          default:
            console.warn(`Unsupported geometry type: ${feature.geometry.type}`);
        }
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
        Object.keys(categorizedStyles).forEach(featureId => {
          const style = categorizedStyles[featureId];
          if (style.fillColor) updateStyle(geojson.data.properties.id, "fillColor", style.fillColor, featureId);
          if (style.color) updateStyle(geojson.data.properties.id, "color", style.color, featureId);
          if (style.weight) updateStyle(geojson.data.properties.id, "weight", style.weight, featureId);
          if (style.fillOpacity) updateStyle(geojson.data.properties.id, "fillOpacity", style.fillOpacity, featureId);
          if (style.radius) updateStyle(geojson.data.properties.id, "radius", style.radius, featureId);
          if (style.opacity) updateStyle(geojson.data.properties.id, "opacity", style.opacity, featureId);
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

          {['Point', 'MultiPoint', 'Polygon', 'MultiPolygon'].includes(geojson.data.features[0].geometry.type) && (
            <>
              <div style={{ marginTop: '16px' }}>
                <label>
                  Radius:
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
            </>
          )}

          {['LineString', 'MultiLineString'].includes(geojson.data.features[0].geometry.type) && (
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
          )}

          <button onClick={handleSaveCategorizedStyle}>
            Save Categorized Style
          </button>
        </>
      )}
    </>
  );
}
export default CategorizedStyle;


const ModalChangeData = ({ geojson, updateStyle, updateStyleCat }) => {
  const [selectedOption, setSelectedOption] = useState('global');

  const handleOptionChange = (event, newOption) => {
    if (newOption !== null) {
      setSelectedOption(newOption);
    }
  };

  return (
    <Box sx={{ textAlign: 'center', p: 2 }}>
      <Box sx={{ mb: 2 }}>Choose Style</Box>
      <ToggleButtonGroup
        value={selectedOption}
        exclusive
        onChange={handleOptionChange}
        aria-label="style selection"
        sx={{ justifyContent: 'center' }}
      >
        <ToggleButton value="global" aria-label="global">
          Global
        </ToggleButton>
        <ToggleButton value="category" aria-label="category">
          Categorized
        </ToggleButton>
      </ToggleButtonGroup>

      <Box mt={3}>
        {selectedOption === 'global' ? (
          <GlobalStyle geojson={geojson} updateStyle={updateStyle} />
        ) : (
          <CategorizedStyle geojson={geojson} updateStyle={updateStyleCat} />
        )}
      </Box>
    </Box>
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
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openStyleModal = () => {
    setIsModalOpen(true);
  };

  const closeStyleModal = () => {
    setIsModalOpen(false);
  };

  const changeStyleButton = (
    <Box display="flex" justifyContent="space-between" alignItems="center">
    <Typography variant="string" sx={{}}>
      Change style
    </Typography>
    <IconButton
      color="primary"
      onClick={openStyleModal}
      aria-label="change style"
      sx={{ p: 0, color: 'black' }}
    >
      <EditIcon />
    </IconButton>
  </Box>
  );

  return (
    <>
      <Box sx={{  p: 2, borderRadius: 1 }}>
        <Table>
          <TableBody>
            {changeStyleButton}
          </TableBody>
        </Table>
      </Box>

      <Dialog open={isModalOpen} onClose={closeStyleModal}>
        <DialogTitle >Change Style</DialogTitle>
        <DialogContent>
          <ModalChangeData
            geojson={geojsondata}
            updateStyle={updateStyle}
            updateStyleCat={updateStyleCat}
          />
        </DialogContent>
      </Dialog>
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
        </tbody>
      </table>
      {bands > 0 && bandsItem}
    </div>
  )
}





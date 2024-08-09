import { get_item_table } from "../../sidenav/StyleControls";
import Cookies from 'js-cookie'
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/'

export const StyleControlsMemory = ({ geojsondata, updateStyle, zoomanddelete }) => {

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
  
    // const changeStyleButton = <>
    //   <tr>
    //     <td><span>Change style</span></td>
    //     <td className='alnright'>
    //       <a onClick={()=>openStyleModal(geojson)} className='btn blue'>
    //         <i className='material-icons'>save</i>
    //       </a>
    //     </td>
    //   </tr>
    // </>
  
    // const isPoint = geojson.geometry.type === "Point" || geojson.geometry.type === "MultiPoint";
    // const isLine = geojson.geometry.type === "LineString" || geojson.geometry.type === "MultiLineString";
  
    const styleDefaults = {
      fillColor: "#000000", // default color
      color: "#000000", // default line color
      weight: 1, // default line weight
      fillOpacity: 1 // default opacity
    };
  
    const style = styleDefaults;
  
    const colorValue = style.fillColor
    const colorRow = get_item_table("Color", "color", colorValue, "fillColor", geojson, updateStyle);
  
    const lineColorValue = style.color
    const lineColorRow = get_item_table("Line Color", "color", lineColorValue, "color", geojson, updateStyle);
  
    const widthValue = style.weight
    const widthRow = get_item_table("Line Size", "range", widthValue, "weight", geojson, updateStyle);
  
    const opacityValue = style.fillOpacity
    const opacityRow = get_item_table("Opacity", "range", opacityValue, "fillOpacity", geojson, updateStyle);
  
    return (
      <div className='side-nav-item-dropdown-style z-depth-5'>
        <table>
          <tbody>
            {zoomanddelete}
            {/* <p className='center'>
              <a className='btn btn-large'>Change style</a>
            </p> */}
            {!isPoint && !isLine && colorRow}
            {!isPoint && lineColorRow}
            {!isPoint && !isLine && opacityRow}
            {!isPoint && widthRow}
            {saveStyle}
          </tbody>
        </table>
      </div>
    );
  };




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


export const StyleControls = ({ geojsondata, updateStyle, zoomanddelete }) => {

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


    const changeStyleButton = <>
        <tr>
            <td><span>Change style</span></td>
            <td className='alnright'>
                <a onClick={() => openStyleModal(geojson)} className='btn blue'>
                    <i className='material-icons'>save</i>
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
                <div className='modal' style={{ display: 'block' }}>
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
// import React, { useState, useEffect } from 'react';
// import L from 'leaflet';
// import 'leaflet-draw';
// import { Button, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
// import { handleDrawUpload, handleDrawUpload2 } from '../utils/eventHandler';
// import { useDispatch } from 'react-redux';

// const Draw = ({ map,setVectors,projectid,setUploading }) => {
//     const [isFormOpen, setIsFormOpen] = useState(false);
//     const [geometryName, setGeometryName] = useState('');
//     const [geometryType, setGeometryType] = useState('');
//     const [isDrawing, setIsDrawing] = useState(false);
//     const [drawControl, setDrawControl] = useState(null);
//     const [drawnItems, setDrawnItems] = useState(null);

//     const dispatch = useDispatch()

//     useEffect(() => {
//         if (map && !drawnItems) {
//             const items = new L.FeatureGroup();
//             map.addLayer(items);
//             setDrawnItems(items);
//         }
//     }, [map, drawnItems]);

//     const handleOpenForm = () => {
//         setIsFormOpen(true);
//     };

//     const handleStartDrawing = () => {
//         setIsFormOpen(false);
//         setIsDrawing(true);
//         startLeafletDrawing(geometryType);
//     };

//     const handleAddNewGeometry = () => {
//         startLeafletDrawing(geometryType);
//     };

//     const handleSaveGeometry = () => {
//         setIsDrawing(false);
//         saveGeometry();
//     };

//     const startLeafletDrawing = (type) => {
//         if (drawControl) {
//             map.removeControl(drawControl);
//         }

//         const options = {
//             marker: type === 'Point',
//             polyline: type === 'LineString',
//             polygon: type === 'Polygon',
//             circle: false,
//             rectangle: false,
//         };

//         const control = new L.Control.Draw({
//             draw: options,
//             edit: {
//                 featureGroup: drawnItems,
//             },
//         });

//         map.addControl(control);
//         setDrawControl(control);

//         enableDrawingMode(type, control);
//     };

//     const enableDrawingMode = (type, control) => {
//         if (control && control._toolbars && control._toolbars.draw && control._toolbars.draw._modes) {
//             if (type === 'Point' && control._toolbars.draw._modes.marker) {
//                 control._toolbars.draw._modes.marker.handler.enable();
//             } else if (type === 'LineString' && control._toolbars.draw._modes.polyline) {
//                 control._toolbars.draw._modes.polyline.handler.enable();
//             } else if (type === 'Polygon' && control._toolbars.draw._modes.polygon) {
//                 control._toolbars.draw._modes.polygon.handler.enable();
//             }
//         }
//     };

//     const handleNewLayer = (layer) => {
//         const geojson = layer.toGeoJSON();
//         console.log('New Geometry:', geojson);
//         drawnItems.addLayer(layer); 
//     };

//     useEffect(() => {
//         if (map && drawControl) {
//             map.on(L.Draw.Event.CREATED, (e) => {
//                 const { layer } = e;
//                 handleNewLayer(layer);
//             });
//         }
//     }, [map, drawControl]);

//     const saveGeometry = async () => {
//         if (!drawnItems) {
//             console.error('No drawn items found.');
//             return;
//         }
    
//         // Convert all drawn layers to GeoJSON
//         const geometryJsons = [];
//         drawnItems.eachLayer((layer) => {
//             const geojson = layer.toGeoJSON();
            
//             if (!geojson.geometry.type===geometryType){
//                 window.alert("All geometries should match the geometry choice.")
//             }
//             geometryJsons.push(geojson);
//         });
    
//         if (geometryJsons.length === 0) {
//             console.warn('No geometries to save.');
//             return;
//         }

//         if (geometryName===""){
//             window.alert("You need to provide a name!")
//             return
//         }

//         console.log('Saving geometries...', geometryJsons);
    
//         handleDrawUpload2(
//             geometryJsons,
//             geometryName,
//             setVectors,
//             map,
//             dispatch,
//             projectid,
//             setUploading
//         );

//         if (drawnItems) {
//             drawnItems.clearLayers();
//         }
//     };
    

//     return (
//         <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
//             {!isDrawing && (
//                 <Button variant="contained" onClick={handleOpenForm}>
//                     +
//                 </Button>
//             )}

//             {isFormOpen && (
//                 <div style={{ marginTop: '10px', width: '100%' }}>
//                     <TextField
//                         label="Name"
//                         variant="outlined"
//                         fullWidth
//                         value={geometryName}
//                         onChange={(e) => setGeometryName(e.target.value)}
//                     />
//                     <FormControl fullWidth sx={{ marginTop: '10px' }}>
//                         <InputLabel>Geometry Type</InputLabel>
//                         <Select value={geometryType} onChange={(e) => setGeometryType(e.target.value)}>
//                             <MenuItem value="Point">Point</MenuItem>
//                             <MenuItem value="LineString">Line</MenuItem>
//                             <MenuItem value="Polygon">Polygon</MenuItem>
//                         </Select>
//                     </FormControl>
//                     <Button variant="contained" sx={{ marginTop: '10px' }} onClick={handleStartDrawing}>
//                         Start Drawing
//                     </Button>
//                 </div>
//             )}

//             {isDrawing && (
//                 <>
//                     <Button
//                         variant="contained"
//                         color="primary"
//                         sx={{ marginTop: '10px' }}
//                         onClick={handleAddNewGeometry}
//                     >
//                         +
//                     </Button>
//                     <Button
//                         variant="contained"
//                         color="success"
//                         sx={{ marginTop: '10px' }}
//                         onClick={handleSaveGeometry}
//                     >
//                         Save
//                     </Button>
//                 </>
//             )}
//         </div>
//     );
// };

// export default Draw;
import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet-draw';
import { Button, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { handleDrawUpload2 } from '../utils/eventHandler';
import { useDispatch } from 'react-redux';

const Draw = ({ map, setVectors, projectid, setUploading }) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [geometryName, setGeometryName] = useState('');
    const [geometryType, setGeometryType] = useState('');
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawControl, setDrawControl] = useState(null);
    const [drawnItems, setDrawnItems] = useState(null);
    const [attributes, setAttributes] = useState([]);
    const [attributeValues, setAttributeValues] = useState({});
    const [geojsons,setGeojsons] = useState({});

    const dispatch = useDispatch();
    const attributesRef = useRef([]);

    useEffect(() => {
        if (map && !drawnItems) {
            const items = new L.FeatureGroup();
            map.addLayer(items);
            setDrawnItems(items);
        }
    }, [map, drawnItems]);

    const handleOpenForm = () => {
        setIsFormOpen(true);
    };

    const handleStartDrawing = () => {
        setIsFormOpen(false);
        setIsDrawing(true);
        startLeafletDrawing(geometryType);
    };

    const handleAddNewGeometry = () => {
        startLeafletDrawing(geometryType);
    };

    const handleSaveGeometry = () => {
        setIsDrawing(false);
        saveGeometry();
    };

    const startLeafletDrawing = (type) => {
        if (drawControl) {
            map.removeControl(drawControl);
        }

        const options = {
            marker: type === 'Point',
            polyline: type === 'LineString',
            polygon: type === 'Polygon',
            circle: false,
            rectangle: false,
        };

        const control = new L.Control.Draw({
            draw: options,
            edit: {
                featureGroup: drawnItems,
            },
        });

        map.addControl(control);
        setDrawControl(control);

        enableDrawingMode(type, control);
    };

    const enableDrawingMode = (type, control) => {
        if (control && control._toolbars && control._toolbars.draw && control._toolbars.draw._modes) {
            if (type === 'Point' && control._toolbars.draw._modes.marker) {
                control._toolbars.draw._modes.marker.handler.enable();
            } else if (type === 'LineString' && control._toolbars.draw._modes.polyline) {
                control._toolbars.draw._modes.polyline.handler.enable();
            } else if (type === 'Polygon' && control._toolbars.draw._modes.polygon) {
                control._toolbars.draw._modes.polygon.handler.enable();
            }
        }
    };

    const handleNewLayer = (layer) => {
        const geojson = layer.toGeoJSON();
        console.log('New Geometry:', geojson);

        const attributesWithValues = attributes.reduce((obj, attr, index) => {
            obj[attr] = attributeValues[index] || '';
            return obj;
        }, {});
        geojson.properties = attributesWithValues;

        setGeojsons(...geojsons,geojson)

        drawnItems.addLayer(layer); 
    };

    useEffect(() => {
        if (map && drawControl) {
            // Clear any existing event listeners before adding a new one
            map.off(L.Draw.Event.CREATED);

            map.on(L.Draw.Event.CREATED, (e) => {
                const { layer } = e;
                handleNewLayer(layer);
                promptForAttributeValues(layer)
            });
        }
    }, [map, drawControl]);

    const promptForAttributeValues = (layer) => {
        const values = attributesRef.current.map(attr => {
            return window.prompt(`Enter value for ${attr}:`, '');
        });

        setAttributeValues(values);
    };

    useEffect(() => {
        attributesRef.current = attributes; 
    }, [attributes]);

    if (drawnItems) {
        console.log(
            drawnItems.eachLayer((layer) => {
                console.log("LAYER", layer);
            })
        );
    }

    const saveGeometry = async () => {
        if (!drawnItems) {
            console.error('No drawn items found.');
            return;
        }
    
        const geometryJsons = [];
        drawnItems.eachLayer((layer) => {
            const geojson = layer.toGeoJSON();
            const attributesWithValues = attributes.reduce((obj, attr, index) => {
                obj[attr] = attributeValues[index] || '';
                return obj;
            }, {});
            geojson.properties = attributesWithValues;
            geometryJsons.push(geojson);
        });
    
        if (geometryJsons.length === 0) {
            console.warn('No geometries to save.');
            return;
        }
    
        if (geometryName === "") {
            window.alert("You need to provide a name!");
            return;
        }
    
        console.log('Saving geometries...', geometryJsons);
    
        // handleDrawUpload2(
        //     geometryJsons,
        //     geometryName,
        //     setVectors,
        //     map,
        //     dispatch,
        //     projectid,
        //     setUploading
        // );
    
        if (drawnItems) {
            drawnItems.clearLayers();
        }
    };
    


    const handleAddAttribute = () => {
        if (attributes.length < 10) {
            setAttributes([...attributes, `Attribute ${attributes.length + 1}`]);
        } else {
            window.alert("You can only add up to 10 attributes.");
        }
    };

    return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {!isDrawing && (
                <Button variant="contained" onClick={handleOpenForm}>
                    +
                </Button>
            )}

            {isFormOpen && (
                <div style={{ marginTop: '10px', width: '100%' }}>
                    <TextField
                        label="Name"
                        variant="outlined"
                        fullWidth
                        value={geometryName}
                        onChange={(e) => setGeometryName(e.target.value)}
                    />
                    <FormControl fullWidth sx={{ marginTop: '10px' }}>
                        <InputLabel>Geometry Type</InputLabel>
                        <Select value={geometryType} onChange={(e) => setGeometryType(e.target.value)}>
                            <MenuItem value="Point">Point</MenuItem>
                            <MenuItem value="LineString">Line</MenuItem>
                            <MenuItem value="Polygon">Polygon</MenuItem>
                        </Select>
                    </FormControl>
                    {attributes.map((attr, index) => (
                        <TextField
                            key={index}
                            label={attr}
                            variant="outlined"
                            fullWidth
                            value={attributes[index]}
                            onChange={(e) => {
                                const newAttributes = [...attributes];
                                newAttributes[index] = e.target.value;
                                setAttributes(newAttributes);
                            }}
                            sx={{ marginTop: '10px' }}
                        />
                    ))}
                    <Button variant="contained" sx={{ marginTop: '10px' }} onClick={handleStartDrawing}>
                        Start Drawing
                    </Button>
                    <Button variant="contained" sx={{ marginTop: '10px' }} onClick={handleAddAttribute}>
                        Add Attribute
                    </Button>
                </div>
            )}

            {isDrawing && (
                <>
                    <Button
                        variant="contained"
                        color="primary"
                        sx={{ marginTop: '10px' }}
                        onClick={handleAddNewGeometry}
                    >
                        +
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        sx={{ marginTop: '10px' }}
                        onClick={handleSaveGeometry}
                    >
                        Save
                    </Button>
                </>
            )}
        </div>
    );
};

export default Draw;

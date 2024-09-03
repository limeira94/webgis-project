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
    const [geojsonItems, setGeojsonItems] = useState([]);

    const dispatch = useDispatch();

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

    const handleSaveGeometry = async () => {
        setIsDrawing(false);
        if (!drawnItems) {
            console.error('No drawn items found.');
            return;
        }

        if (!geometryName) {
            window.alert("You need to provide a name!");
            return;
        }

        if (geojsonItems.length === 0) {
            console.warn('No geometries to save.');
            return;
        }

        handleDrawUpload2(
            // geometryJsons,
            geojsonItems,
            geometryName,
            setVectors,
            map,
            dispatch,
            projectid,
            setUploading
        );

        drawnItems.clearLayers(); 
        setGeojsonItems([]); 
        setAttributeValues({}); 
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
            const mode = control._toolbars.draw._modes;
            if (type === 'Point' && mode.marker) {
                mode.marker.handler.enable();
            } else if (type === 'LineString' && mode.polyline) {
                mode.polyline.handler.enable();
            } else if (type === 'Polygon' && mode.polygon) {
                mode.polygon.handler.enable();
            }
        }
    };

    const handleNewLayer = (layer) => {
        const geojson = layer.toGeoJSON();
        
        let attributeTable = {}; 

        attributes.forEach((att) => {
            const value = window.prompt(`Enter value for ${attributeValues[att]}:`, '');
            attributeTable[attributeValues[att]] = value; 
        });

        geojson.properties = attributeTable

        setGeojsonItems((prevGeojsonItems) => [...prevGeojsonItems, geojson]);
        drawnItems.addLayer(layer);
    };

    useEffect(() => {
        if (map && drawControl) {
            map.off(L.Draw.Event.CREATED);

            map.on(L.Draw.Event.CREATED, (e) => {
                const { layer } = e;
                handleNewLayer(layer);
            });
        }
    }, [map, drawControl, attributeValues]);


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
                            value={attributeValues[attr] || ''}
                            onChange={(e) => setAttributeValues({ ...attributeValues, [attr]: e.target.value })}
                            sx={{ marginTop: '10px' }}
                        />
                    ))}
                    <Button variant="contained" sx={{ marginTop: '10px' }} onClick={handleAddAttribute}>
                        Add Attribute
                    </Button>
                    <Button variant="contained" sx={{ marginTop: '10px' }} onClick={handleStartDrawing}>
                        Start Drawing
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

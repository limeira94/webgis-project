import React, { useState, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet-draw';
import { Button, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const Draw = ({ map }) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [geometryName, setGeometryName] = useState('');
    const [geometryType, setGeometryType] = useState('');
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawControl, setDrawControl] = useState(null);
    const [drawnItems, setDrawnItems] = useState(null);

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
        disableDrawingMode();  // Disable any active drawing mode before re-enabling it
        startLeafletDrawing(geometryType);
    };

    const handleSaveGeometry = () => {
        setIsDrawing(false);
        disableDrawingMode();  // Turn off the event listener and remove the control
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

    const disableDrawingMode = () => {
        if (drawControl && drawControl._toolbars && drawControl._toolbars.draw && drawControl._toolbars.draw._modes) {
            if (drawControl._toolbars.draw._modes.marker && drawControl._toolbars.draw._modes.marker.handler.enabled()) {
                drawControl._toolbars.draw._modes.marker.handler.disable();
            }
            if (drawControl._toolbars.draw._modes.polyline && drawControl._toolbars.draw._modes.polyline.handler.enabled()) {
                drawControl._toolbars.draw._modes.polyline.handler.disable();
            }
            if (drawControl._toolbars.draw._modes.polygon && drawControl._toolbars.draw._modes.polygon.handler.enabled()) {
                drawControl._toolbars.draw._modes.polygon.handler.disable();
            }
        }
    };

    const handleNewLayer = (layer) => {
        const geojson = layer.toGeoJSON();
        console.log('New Geometry:', geojson); // You can store it or handle it as needed
    };

    const saveGeometry = async () => {
        // Collect and send geometries to the backend
        console.log('Saving geometries...');
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

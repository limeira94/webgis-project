import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useDispatch } from 'react-redux';
import { updateGeometry } from '../../features/data';
import { handleDrawUpload } from './eventHandler';
import * as turf from '@turf/turf';

const DrawVector = ({ mapInstance, setVectors, projectid, setUploading, active }) => {
    const drawControlRef = useRef(null);
    const dispatch = useDispatch();
    const toolbarMovedRef = useRef(false); // Ref para controlar se o toolbar já foi movido

    useEffect(() => {
        if (!mapInstance || !active) return;

        if (!drawControlRef.current) {
            // Cria o controle de desenho
            const drawControl = new L.Control.Draw({
                draw: {
                    polygon: true,
                    polyline: true,
                    rectangle: true,
                    circle: true,
                    circlemarker: false,
                    marker: true,
                },
                edit: false // Desative o editor padrão
            });

            drawControlRef.current = drawControl;
            drawControl.addTo(mapInstance);
        }

        // Move o toolbar para o Sidebar se ainda não tiver sido movido
        if (!toolbarMovedRef.current && active) {
            const drawToolbar = document.querySelector('.leaflet-draw-toolbar');
            const toolbarContainer = document.getElementById('draw-toolbar-container');

            if (drawToolbar && toolbarContainer) {
                toolbarContainer.appendChild(drawToolbar);
                toolbarMovedRef.current = true; // Marca como movido
            }
        }

        // Configuração de eventos de desenho
        const onCreated = async (e) => {
            let layer = e.layer;
            if (layer instanceof L.Circle) {
                const center = layer.getLatLng();
                const radius = layer.getRadius();
                const centerPoint = turf.point([center.lng, center.lat]);
                const options = { steps: 60, units: 'kilometers' };
                const buffer = turf.buffer(centerPoint, radius / 1000, options);

                const feature = {
                    type: 'Feature',
                    geometry: buffer.geometry,
                    properties: {},
                };

                const geometryJson = feature;

                await handleDrawUpload(
                    geometryJson,
                    setVectors,
                    mapInstance,
                    dispatch,
                    projectid,
                    setUploading
                );
            } else {
                const geometryJson = layer.toGeoJSON();

                await handleDrawUpload(
                    geometryJson,
                    setVectors,
                    mapInstance,
                    dispatch,
                    projectid,
                    setUploading
                );
            }
        };

        const onEdited = (e) => {
            const layers = e.layers;
            layers.eachLayer((layer) => {
                const updateGeometryAsync = async () => {
                    const geometryJson = layer.toGeoJSON();
                    const geometryId = layer.feature?.properties?.id;
                    if (geometryId) {
                        try {
                            await updateGeometry(geometryJson, geometryId);
                            console.log('Geometry updated successfully');
                        } catch (error) {
                            console.error('Error updating geometry:', error);
                        }
                    }
                };
                updateGeometryAsync();
            });
        };

        mapInstance.on(L.Draw.Event.CREATED, onCreated);
        mapInstance.on(L.Draw.Event.EDITED, onEdited);

        return () => {
            mapInstance.off(L.Draw.Event.CREATED, onCreated);
            mapInstance.off(L.Draw.Event.EDITED, onEdited);
            if (drawControlRef.current) {
                mapInstance.removeControl(drawControlRef.current);
                drawControlRef.current = null;
                toolbarMovedRef.current = false; // Reset para permitir que o toolbar seja movido novamente
            }
        };
    }, [mapInstance, active]);

    return null;
};

export default DrawVector;
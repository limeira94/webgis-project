



export const zoomToLayer = (geojsonId,geojsonLayerRefs,mapInstance) => {  
    const layer = geojsonLayerRefs.current[geojsonId];
    if (layer && mapInstance) {
        const bounds = layer.getBounds();
        mapInstance.flyToBounds(bounds);
    }
};





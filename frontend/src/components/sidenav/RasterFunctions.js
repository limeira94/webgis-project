import L from 'leaflet';


export const zoomToLayerRaster = (id,rasters,mapInstance) => {
    const raster = rasters.find(rasterItem => rasterItem.data.id === id);
    const boundingBox = raster.data.tiles
    const [minLongitude, minLatitude, maxLongitude, maxLatitude] = boundingBox.split(',').map(Number);
    const centroidLongitude = (minLongitude + maxLongitude) / 2;
    const centroidLatitude = (minLatitude + maxLatitude) / 2;

    var newCenter = L.latLng(centroidLatitude, centroidLongitude);
    if (mapInstance) {
        mapInstance.flyTo(newCenter, 15);
    }
}

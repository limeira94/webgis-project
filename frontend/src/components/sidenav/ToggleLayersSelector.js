import React from 'react';
import { zoomToLayerRaster } from './RasterFunctions';
import { zoomToLayer } from './VectorFunctions';
import { ListItem } from './ListItem';
import { List, ListItem as ListItemUI, Box, IconButton, Collapse } from '@mui/material';


const ToggleLayersSelector = (
  {
    rasters,
    setRasters,
    vectors,
    setVectors,
    geojsonLayerRefs,
    mapInstance,
    selectedFeatureAttributes,
    changeStyleData,
    setChangeStyleData,
    handleDownload,
    inmemory = false
  }) => {

  const updateStyle = (polygonId, styleKey, value) => {
    setVectors(prevGeojsons => {
      return prevGeojsons.map(geojson => {
        if (geojson.data.properties.id === polygonId) {
          const updatedGeoms = geojson.data.features.map(geom => {
            return {
              ...geom,
              style: {
                ...geom.style,
                [styleKey]: value
              }
            }
          });
          return {
            ...geojson,
            data: {
              ...geojson.data,
              features: updatedGeoms
            }
          };
        }
        return geojson;
      });
    });
  };

  const updateStyleCat = (polygonId, styleKey, value, featureId = null) => {
    setVectors(prevGeojsons => {
      return prevGeojsons.map(geojson => {
        if (geojson.data.properties.id === polygonId) {
          const updatedGeoms = geojson.data.features.map(geom => {
            if (featureId && geom.id !== Number(featureId)) return geom;
            return {
              ...geom,
              style: {
                ...geom.style,
                [styleKey]: value
              }
            }
          });
          return {
            ...geojson,
            data: {
              ...geojson.data,
              features: updatedGeoms
            }
          };
        }
        return geojson;
      });
    });
  };


  return (
    <>
      
        <Box sx={{ padding: 2 }}>
          <List>
            {vectors.map((geojson) => (
              <ListItemUI
                key={`$geojson-item-${geojson.data.properties.id}`}
              >

                <ListItem
                  key={`$geojson-item-${geojson.data.properties.id}`}
                  datasets={vectors}
                  setDatasets={setVectors}
                  polygonStyles={geojson.style}
                  dataset={geojson}
                  datatype={"geojson"}
                  zoomToLayer={() => zoomToLayer(geojson.data.properties.id, geojsonLayerRefs, mapInstance)}
                  updateStyle={updateStyle}
                  updateStyleCat={updateStyleCat}
                  selectedFeatureAttributes={selectedFeatureAttributes}
                  inmemory={inmemory}
                  changeStyleData={changeStyleData}
                  setChangeStyleData={setChangeStyleData}
                  handleDownload={handleDownload}
                />
              </ListItemUI>
            ))
            }

            {rasters.map((raster) => (
              <ListItemUI
                key={`$raster-item-${raster.data.id}`}
              >
                <ListItem
                  key={`$raster-item-${raster.data.id}`}
                  datasets={rasters}
                  setDatasets={setRasters}
                  dataset={raster}
                  datatype={"raster"}
                  zoomToLayer={zoomToLayerRaster}
                  inmemory={inmemory}
                />
              </ListItemUI>
            ))}
          </List>
        </Box>

    </>
  );
};

export default ToggleLayersSelector;

import parse from 'wellknown';


export const parseVector = (vector) => {
    console.log("VECTOR", vector);
    const parsed = vector.map((data) => {
      console.log("DATA", data);
      const dataInfo = {
        type: 'FeatureCollection',
        features: [],
        properties: {
          id: data.id,
          visible: false,
          name: data.name,
          format: data.format_name,
          style: data.style,
          // attributes: item.attributes,
        },
      };
  
      data.geoms.map((geojson) => {
        const parts = geojson.geometry.split(';');
        const geom = parts.length > 1 ? parse(parts[1]) : null;
  
        const feature = {
          type: 'Feature',
          id: geojson.id,
          geometry: geom,
          properties: {
            attributes: geojson.attributes,
          },
          style: geojson.style,
        }
        dataInfo.features.push(feature)
  
      })
      return dataInfo
    })
  
    return parsed
  }
  
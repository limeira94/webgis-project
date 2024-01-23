import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/'

export const handleRaster = async (event) => {
    const formData = new FormData();
    const file = event.target.files[0];
    formData.append('raster', file);
    formData.append('name', file.name);
    formData.append('user', "1");
  
    try {
      const response = await axios.post(
        `${API_URL}api/main/rasters/`,
        formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      console.log(response.data);

      // mapInstance.flyTo(newCenter, 12);
      // mapInstance.flyTo([40.730610, -73.935242], 15)
    } catch (error) {
      console.error(error);
    }
};

export const handleFileChange = async (event,getCenterOfGeoJSON,setGeoJSONs,setVisibleGeoJSONs,mapInstance,isAuthenticated) => {
    const file = event.target.files[0];
    event.target.value = null;
    
    if (file) {
      if (isAuthenticated) {
        try {
          const formData = new FormData();
          // formData.append('geojson', file);
          // formData.append('user', "1");

          const response = await axios.post(
            `${API_URL}api/main/upload/`
            , formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          if (response.status === 201) {
            const newGeoJSON = response.data.savedGeoJsons.map(item => ({
              type: "Feature",
              geometry: item.geojson,
              properties: {
                id: item.id,
                name: item.name
              },
            }));

            const newCenter = getCenterOfGeoJSON({
              type: 'FeatureCollection',
              features: newGeoJSON,
            });

            const newGeoJSONIds = newGeoJSON.map(feature => feature.properties.id);
            setVisibleGeoJSONs(prevVisible => {
              const updatedVisibility = { ...prevVisible };
              newGeoJSONIds.forEach(id => {
                updatedVisibility[id] = true;
              });
              return updatedVisibility;
            });

            if (mapInstance) {
              mapInstance.flyTo(newCenter, 15);
            }

            setGeoJSONs(prevGeoJSONs => [...prevGeoJSONs, ...newGeoJSON]);

          } else {
            console.error('File upload failed with status:', response.status);
            alert('There was an error uploading the file. Please try again.');
          }

        } catch (error) {
          console.error('Error during upload:', error);
          alert('There was an error uploading the file. Please try again.');
        }
      } else {

        const fileName = file.name.split('.')[0];

        const reader = new FileReader();
        reader.onload = (e) => {
          const geojsonData = JSON.parse(e.target.result);

          const featuresWithId = geojsonData.features.map(feature => {
            return {
              type: "Feature",
              geometry: feature.geometry,
              properties: {
                ...feature.properties,
                id: feature.properties?.id || Math.floor(Math.random() * 1000000000),
                name: feature.properties?.name || fileName
              }
            };
          });

          const newGeoJSONIds = featuresWithId.map(feature => feature.properties.id);
          setVisibleGeoJSONs(prevVisible => {
            const updatedVisibility = { ...prevVisible };
            newGeoJSONIds.forEach(id => {
              updatedVisibility[id] = true;
            });
            return updatedVisibility;
          });

          const featureCollection = getCenterOfGeoJSON({
            type: 'FeatureCollection',
            features: featuresWithId,
          });

          if (mapInstance) {
            mapInstance.flyTo(featureCollection, 15);
          }

          setGeoJSONs(prevGeoJSONs => [...prevGeoJSONs, ...featuresWithId]);
        };
        reader.readAsText(file);
      }
    }
  };


export const handleDeleteClick = (setGeoJSONs) => {
  axios
    .delete(
      // `http://127.0.0.1:8000/api/main/geojson/`
      `${API_URL}api/main/geojson/`
    )
    .then((response) => {
      console.log('GeoJSON deleted successfully');
      setGeoJSONs([])
      // setGeoJSONs((prevGeojsons) => prevGeojsons.filter((geojson) => geojson.id !== id));
    })
    .catch((error) => {
      console.error('Error deleting GeoJSON:', error);
    });
};


export const handleDeleteRasterClick = (setRasters) => {
  axios
      .delete(
          // `${API_URL}api/main/rasters/delete_all/`
          // `${API_URL}api/main/delete_all_rasters/`
          `${API_URL}api/main/rasters/`
      )
      .then((response) => {
          console.log('All rasters deleted successfully');
          setRasters([])
      })
      .catch((error) => {
          console.error('Error deleting rasters:', error);
      });
};


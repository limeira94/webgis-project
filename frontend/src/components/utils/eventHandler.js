import axios from 'axios';

export const handleRaster = async (event) => {
    const formData = new FormData();
    const file = event.target.files[0];
    formData.append('raster', file);
    formData.append('name', file.name);
  
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

export const handleFileChange = async (event) => {
    const file = event.target.files[0];
    event.target.value = null;
    if (file) {
      try {
        const formData = new FormData();
        formData.append('geojson', file);

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
          console.log('All GeoJSONs:', geojsons);
          console.log('Newly added GeoJSON:', newGeoJSON);
          console.log('Calculated new center:', newCenter);

          if (mapInstance) {
            console.log('Trying to move to:', newCenter)
            mapInstance.flyTo(newCenter, 12);
          }

          console.log('New GeoJSON:', newGeoJSON);

          setGeoJSONs(prevGeoJSONs => [...prevGeoJSONs, ...newGeoJSON]);

        } else {
          console.error('File upload failed with status:', response.status);
          alert('There was an error uploading the file. Please try again.');
        }

      } catch (error) {
        console.error('Error during upload:', error);
        alert('There was an error uploading the file. Please try again.');
      }
    }
  };


 export const handleDeleteClick = (id) => {
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



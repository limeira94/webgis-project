import { upload_geojson, upload_raster, uploadDraw } from '../../features/data';
import { createGeojsons } from './ProjectFunctions';
import L from 'leaflet';
import bbox from '@turf/bbox';
import { featureCollection } from '@turf/helpers';
import { parseVector } from './MapUtils';
import M from 'materialize-css';
import parse from 'wellknown';
import JSZip from "jszip";
import * as shapefile from "shapefile";
import { toGeoJSON } from "togeojson"; // problema de importacao, estou usando um outro formato na função convertKMLToGeoJSON

export const handleRaster = async (event, setRasters, mapInstance, dispatch, projectid, setUploading) => {

  event.preventDefault();
  const file = event.target.files[0];
  event.target.value = null;

  const maxSize = 100 * 1024 * 1024; // 100MB
  if (file.size > maxSize) {
    M.toast({
      html: "File size exceeds 100MB limit.",
      classes: 'red rounded',
      displayLength: 5000
    });
    return;
  }

  try {
    setUploading(true)
    const response = await dispatch(upload_raster({ file, projectid }));

    if (response.type === 'rasters/upload/fulfilled') {
      const { payload } = response;

      const {
        raster,
        lat,
        lon
      } = payload;

      var newCenter = L.latLng(lat, lon);


      const tileCoordinates = raster.tiles.split(',').map(Number);
      const [xmin, ymin, xmax, ymax] = tileCoordinates;
      const bounds = [[ymin, xmin], [ymax, xmax]];


      let rasterDict = {
        "data": raster,
        "visible": true,
        "bounds": bounds,
        "style": {
          "opacity": 1
        }
      };

      setRasters(prevRasters => [...prevRasters, rasterDict]);
      // setRasters(prevRasters => [...prevRasters, raster]);

      M.toast(
        {
          html: "File uploaded sucessfully.",
          classes: 'green rounded',
          displayLength: 5000
        });

      if (mapInstance) {
        mapInstance.flyTo(newCenter, 15);
      }
    }
    else {
      console.log("Response", response)
      var errorMessage = `${response.error.message}: ${response.payload.message}`
      M.toast({
        html: errorMessage,
        classes: 'red rounded',
        displayLength: 10000
      });
    }
    setUploading(false)
  } catch (error) {
    setUploading(false)
    console.log(error)
    M.toast({
      html: error,
      classes: 'red rounded',
      displayLength: 10000
    });
  }
};

export const handleDropGeojson = async (
  event,
  // setGeoJSONs,
  setVectors,
  setRasters,
  mapInstance,
  dispatch,
  projectid,
  setUploading
) => {

  event.preventDefault();
  const file = event.dataTransfer.files[0];
  console.log(file.name)

  if (file && file.name.toLowerCase().endsWith('.geojson')) {
    try {
      setUploading(true)
      const response = await dispatch(upload_geojson({ file, projectid }));

      if (response.type === 'geojson/upload/fulfilled') {
        const { payload } = response;
        const { savedGeoJson } = payload;
        const features = Array.isArray(savedGeoJson) ? savedGeoJson : [savedGeoJson];

        // const geojsons = createGeojsons(parseGeoJSON(features))
        const geojsons = createGeojsons(parseVector(features))
        const calculatedBounds = bbox(geojsons[0].data);

        if (mapInstance && calculatedBounds) {
          const boundsLatLng = L.latLngBounds(
            [calculatedBounds[1], calculatedBounds[0]],
            [calculatedBounds[3], calculatedBounds[2]]
          );
          mapInstance.flyToBounds(boundsLatLng, { maxZoom: 16 });
        }

        // setGeoJSONs(prevGeoJSONs => [...prevGeoJSONs, ...geojsons])
        setVectors(prevGeoJSONs => [...prevGeoJSONs, ...geojsons])

        setUploading(false)
      } else {
        setUploading(false)
        console.error('File upload failed with status:', response.type);
        alert('There was an error uploading the file. Please try again.');
      }
    } catch (error) {
      setUploading(false)
      console.error('Error during upload:', error);
      alert('There was an error uploading the file. Please try again.');
    }
  } else if (file && file.name.toLowerCase().endsWith('.tif')) {
    try {
      setUploading(true)
      const response = await dispatch(upload_raster({ file, projectid }));

      if (response.type === 'rasters/upload/fulfilled') {
        const { payload } = response;
        const { raster } = payload;

        const tileCoordinates = raster.tiles.split(',').map(Number);
        const [xmin, ymin, xmax, ymax] = tileCoordinates;
        const bounds = [[ymin, xmin], [ymax, xmax]];

        let rasterDict = {
          "data": raster,
          "visible": true,
          "bounds": bounds,
          "style": {
            "opacity": 1
          }
        };

        setRasters(prevRasters => [...prevRasters, rasterDict])
        mapInstance.flyToBounds(bounds, { maxZoom: 16 });

        setUploading(false)
      } else {
        setUploading(false)
        console.error('File upload failed with status:', response.type);
        alert('There was an error uploading the file. Please try again.');
      }
    } catch (error) {
      setUploading(false)
      console.error('Error during upload:', error);
      alert('There was an error uploading the file. Please try again.');
    }
  } else {
    alert("File needs to be in '.geojson' format for vector and '.tif' for rasters.")
  }
}

const convertSHPToGeoJSON = async (file) => {
  const zip = new JSZip();

  // Carregar e descompactar o arquivo ZIP
  const zipContent = await zip.loadAsync(file);

  // Encontrar o arquivo .shp dentro do ZIP
  const shpFile = Object.keys(zipContent.files).find(name => name.endsWith(".shp"));
  const dbfFile = Object.keys(zipContent.files).find(name => name.endsWith(".dbf")); // opcional, para suporte a atributos

  if (!shpFile || !dbfFile) {
    throw new Error("Shapefile incompleto. Certifique-se de que o arquivo ZIP contém um .shp e .dbf.");
  }

  // Ler os arquivos .shp e .dbf como ArrayBuffer
  const shpArrayBuffer = await zipContent.files[shpFile].async("arraybuffer");
  const dbfArrayBuffer = await zipContent.files[dbfFile].async("arraybuffer");

  // Converter o shapefile descompactado para GeoJSON
  const geojson = await shapefile.read(shpArrayBuffer, dbfArrayBuffer);
  return geojson;
};

const convertKMLToGeoJSON = async (file) => {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = (event) => {
      try {
        const kmlText = event.target.result;
        const parser = new DOMParser();

        // Corrige o problema de namespaces, removendo o namespace específico ou ajustando conforme necessário
        const kml = parser.parseFromString(kmlText, "application/xml");

        if (!kml || kml.documentElement.nodeName === "parsererror") {
          reject("Erro ao analisar o arquivo KML. O arquivo pode estar corrompido ou mal formatado.");
          return;
        }

        // Tenta converter o KML para GeoJSON
        const toGeoJSON = require('togeojson');
        const geojson = toGeoJSON.kml(kml);

        if (!geojson) {
          reject("Erro ao converter o KML para GeoJSON.");
          return;
        }
        console.log("GeoJSON convertido a partir do KML:", geojson); // Adicionado log para o resultado GeoJSON
        resolve(geojson);
      } catch (error) {
        console.error("Erro durante a conversão do KML:", error); // Log do erro específico
        reject("Erro ao converter KML para GeoJSON.");
      }
    };
    reader.readAsText(file);
  });
};

// Função para converter GeoPackage para GeoJSON
const convertGeoPackageToGeoJSON = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const API_URL = process.env.REACT_APP_API_URL;
  try {
    // Envia o arquivo GeoPackage para o backend via POST
    const response = await fetch(`${API_URL}api/main/convert-geopackage/`, {
      method: 'POST',
      body: formData,
    });

    // Verifica se a resposta do backend foi bem-sucedida
    if (!response.ok) {
      throw new Error('Erro ao converter GeoPackage para GeoJSON no backend.');
    }

    // Recebe o GeoJSON como resposta
    const geojson = await response.json();
    console.log('GeoJSON recebido do backend:', geojson);

    return geojson;
  } catch (error) {
    console.error('Erro durante o envio do arquivo GeoPackage:', error);
    throw new Error('Falha ao enviar o GeoPackage para o backend.');
  }
};
const removeFileExtension = (filename) => {
  return filename.split('.').slice(0, -1).join('.');
};

export const handleGeojson = async (
  event,
  setVectors,
  mapInstance,
  dispatch,
  projectid,
  setUploading
) => {

  event.preventDefault();
  console.log("DROP?");
  const file = event.target.files[0];
  event.target.value = null;

  try {
    setUploading(true);
    let processedFile = file;

    const fileNameWithoutExtension = removeFileExtension(file.name);

    // Verificar se o arquivo é um ZIP contendo Shapefile, GeoJSON ou KML
    if (file.name.endsWith('.zip')) {
      console.log("Arquivo ZIP detectado");
      // Converter ZIP contendo Shapefile para GeoJSON
      const geojson = await convertSHPToGeoJSON(file);

      // Criar um blob do GeoJSON para simular o envio do arquivo convertido
      const blob = new Blob([JSON.stringify(geojson)], { type: 'application/json' });
      processedFile = new File([blob], `${fileNameWithoutExtension}.geojson`, { type: "application/json" });
    } else if (file.name.endsWith('.geojson') || file.name.endsWith('.json')) {
      // Arquivo GeoJSON já no formato correto, sem necessidade de conversão
      console.log("Arquivo GeoJSON detectado");
    } else if (file.name.endsWith('.kml')) {
      console.log("Arquivo KML detectado");
      // Converter KML para GeoJSON
      const geojson = await convertKMLToGeoJSON(file);

      // Criar um blob do GeoJSON para simular o envio do arquivo convertido
      const blob = new Blob([JSON.stringify(geojson)], { type: 'application/json' });
      processedFile = new File([blob], `${fileNameWithoutExtension}.geojson`, { type: "application/json" });
    } else if (file.name.endsWith('.gpkg')) {
      console.log("Arquivo GeoPackage detectado");
      // Converter GeoPackage para GeoJSON
      const geojson = await convertGeoPackageToGeoJSON(file);

      // Criar um blob do GeoJSON para simular o envio do arquivo convertido
      const blob = new Blob([JSON.stringify(geojson)], { type: 'application/json' });
      processedFile = new File([blob], `${fileNameWithoutExtension}.geojson`, { type: "application/json" });
    } else {
      throw new Error("Apenas arquivos GeoJSON, KML ou ZIP contendo Shapefile são permitidos.");
    }

    // Fazer upload do arquivo (GeoJSON ou arquivo KML/ZIP convertido para GeoJSON)
    const response = await dispatch(upload_geojson({ file: processedFile, projectid }));

    if (response.type === 'geojson/upload/fulfilled') {
      const { payload } = response;
      const { savedGeoJson } = payload;
      const features = Array.isArray(savedGeoJson) ? savedGeoJson : [savedGeoJson];

      const geojsons = createGeojsons(
        parseVector(features)
      );
      const calculatedBounds = bbox(geojsons[0].data);

      if (mapInstance && calculatedBounds) {
        const boundsLatLng = L.latLngBounds(
          [calculatedBounds[1], calculatedBounds[0]],
          [calculatedBounds[3], calculatedBounds[2]]
        );
        mapInstance.flyToBounds(boundsLatLng, { maxZoom: 16 });
      }
      setVectors(prevGeoJSONs => [...prevGeoJSONs, ...geojsons]);
      setUploading(false);
    } else {
      setUploading(false);
      console.error('File upload failed with status:', response.type);
      alert('There was an error uploading the file. Please try again.');
    }
  } catch (error) {
    setUploading(false);
    console.error('Error during upload:', error);
    alert(error.message || 'There was an error uploading the file. Please try again.');
  }
};


export const handleDrawUpload = async (
  geometryJson,
  // setGeoJSONs,
  setVectors,
  mapInstance,
  dispatch,
  projectid,
  setUploading
) => {

  try {
    setUploading(true);

    const name = prompt("Please enter a name for your geometry:", "New Geometry");
    if (name === null || name === "") {
      alert("You must provide a name to proceed with the upload.");
      setUploading(false);
      return;
    }

    const response = await dispatch(uploadDraw({
      geometry: geometryJson,
      projectid: projectid,
      name: name,
    }));
    if (response.type === 'draw/upload/fulfilled') {
      const { payload } = response;
      const savedGeometry = payload.savedGeometry;
      const savedDraw = savedGeometry.geojson
      // const feature = {
      //   type: "Feature",
      //   geometry: savedGeometry.geojson,
      //   properties: {
      //     id: savedGeometry.id,
      //     name: name,
      //     attributes: savedGeometry.attributes,
      //   },
      // };

      // const geojson = createGeojsons([feature])
      // setGeoJSONs(prevGeoJSONs => [...prevGeoJSONs, ...geojson]);
      const parsed = parseVector([savedDraw])
      const geojson = createGeojsons(parsed)
      setVectors(prevGeoJSONs => [...prevGeoJSONs, ...geojson]);

      // if (mapInstance) {
      //   const bounds = L.geoJSON(feature).getBounds();
      //   mapInstance.fitBounds(bounds, { maxZoom: 16 });
      // }
      setUploading(false);

    } else {
      setUploading(false);
      console.error('Draw upload failed with status:', response.type);
      alert('There was an error uploading the drawing. Please try again.');
    }
  } catch (error) {
    setUploading(false);
    console.error('Error during draw upload:', error);
    alert('There was an error uploading the drawing. Please try again.');
  }
  finally {
    setUploading(false);
  }
};


export const handleDrawUpload2 = async (
  geometryJsons,
  name,
  setVectors,
  mapInstance,
  dispatch,
  projectid,
  setUploading
) => {
  try {
    setUploading(true);
    const response = await dispatch(uploadDraw({
      geometries: geometryJsons,
      projectid: projectid,
      name: name,
    }));

    if (response.type === 'draw/upload/fulfilled') {
      const { payload } = response;
      const savedGeometry = payload.savedGeometries;
      const savedDraw = savedGeometry
      const parsed = parseVector([savedDraw]);
      const geojson = createGeojsons(parsed);
      setVectors(prevGeoJSONs => [...prevGeoJSONs, ...geojson]);

      if (mapInstance) {
        console.log(savedDraw)
        const bounds = L.geoJSON(parsed).getBounds();
        console.log(bounds)
        mapInstance.fitBounds(bounds, { maxZoom: 16 });
      }
    } else {
      console.error('Draw upload failed with status:', response.type);
      alert('There was an error uploading the drawing. Please try again.');
    }

  } catch (error) {
    console.error('Error during draw upload:', error);
    alert('There was an error uploading the drawing. Please try again.');
  } finally {
    setUploading(false);
  }
};

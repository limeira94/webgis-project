import React, { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, ZoomControl, LayersControl, Marker, Popup, GeoJSON } from 'react-leaflet';
import tileLayersData from './tileLayers.json';
import './Map.css'
import { useCallback } from 'react';

function Map({ lat, lon, tileLayers }) {
  return (
    <MapContainer className='map-container'
      center={[lat, lon]}
      zoom={10}
      zoomControl={false}
      maxZoom={20}
      minZoom={2}>
      <LayersControl position="bottomright">
        {tileLayers.map((layer, index) => (
          <LayersControl.BaseLayer checked name={layer.name} key={index}>
            <TileLayer url={layer.url} key={index} />
          </LayersControl.BaseLayer>
        ))}
      </LayersControl>
      <ZoomControl position="bottomright" />
      <Marker position={[lat, lon]}>
        <Popup>
          A pretty CSS3 popup. <br /> Easily customizable.
        </Popup>
      </Marker>
    </MapContainer>
  )
}

// const Homepage = () => {

//   const [userLocation, setUserLocation] = useState({ lat: 51.505, lon: -0.09 });

//   const tileLayers = tileLayersData.map((layer) => ({
//     key: layer.key,
//     name: layer.name,
//     url: layer.url,
//   }));

//   const successCallback = useCallback((position) => {
//     const { latitude, longitude } = position.coords;
//     setUserLocation({ lat: latitude, lon: longitude });
//   }, []);

//   const errorCallback = (error) => {
//     console.log(error);
//   };

//   useEffect(() => {
//     navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
//   }, [successCallback]);
//   return (
//     <>
//       <Map tileLayers={tileLayers} lat={userLocation.lat} lon={userLocation.lon} />
//     </>
//   );
// };

// export default Homepage;


const MapComponent = () => {
  const [geojsonData, setGeojsonData] = useState(null);

  useEffect(() => {
    // Busque o arquivo GeoJSON do seu backend
    fetch('http://127.0.0.1:8000/main/geojson/')
      .then(response => response.json())
      .then(data => {
        setGeojsonData(data);
      });
  }, []);

  return (
    <MapContainer center={[-23.550520, -46.633308]} zoom={5} style={{ width: '100%', height: '400px' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {geojsonData && <GeoJSON data={geojsonData} />}
    </MapContainer>
  );
};

export default MapComponent;
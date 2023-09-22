import React, { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, ZoomControl,LayersControl,Marker,Popup} from 'react-leaflet';
import tileLayersData from './tileLayers.json';
import './Map.css'

function Map ({lat,lon,tileLayers}) {
    return (
    <MapContainer className='map-container'
                      center={[lat,lon]}
                      zoom={5}
                      zoomControl={false}
                      maxZoom={20}
                      minZoom={2}>
        <LayersControl position="bottomright">
          {tileLayers.map((layer, index) => (
            <LayersControl.BaseLayer checked name={layer.name} key={index}>
              <TileLayer url={layer.url} key={index}/>
            </LayersControl.BaseLayer>
          ))}
        </LayersControl>
        <ZoomControl position="bottomright"/>
        <Marker position={[lat,lon]}>
            <Popup>
                A pretty CSS3 popup. <br /> Easily customizable.
            </Popup>
        </Marker>
    </MapContainer>
    )
}

const Homepage = () => {

    const [userLocation, setUserLocation] = useState({ lat: 51.505, lon: -0.09 });

    const tileLayers = tileLayersData.map((layer) => ({
        key: layer.key,
        name: layer.name,
        url: layer.url,
      }));

    const successCallback = (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lon: longitude });
        console.log(userLocation.lat,userLocation.lon)
      };

    const errorCallback = (error) => {
        console.log(error);
      };

    useEffect(() => {
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
    }, []); 
return (
    <>
        <Map tileLayers={tileLayers} lat={userLocation.lat} lon={userLocation.lon}/>
    </>
);
};

export default Homepage;

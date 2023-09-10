import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MapComponent = ({ lat, lon }) => {
    return (
        <MapContainer center={[lat, lon]}
            zoom={5}
            style={{ width: '100%', height: '1000px' }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={[lat, lon]}>
                <Popup>
                    Informações do Ponto Aqui
                </Popup>
            </Marker>
        </MapContainer>
    );
}

export default MapComponent;

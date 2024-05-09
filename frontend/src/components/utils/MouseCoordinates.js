import React, { useState } from 'react';
import { useMapEvents } from 'react-leaflet';


const MouseCoordinates = () => {
    const [coordinates, setCoordinates] = useState({ lat: 0, lng: 0 });

    useMapEvents({
        mousemove: (e) => {
            setCoordinates(e.latlng);
        }
    });

    const toDegreesMinutesAndSeconds = (coordinate) => {
        const absolute = Math.abs(coordinate);
        const degrees = Math.floor(absolute);
        const minutesNotTruncated = (absolute - degrees) * 60;
        const minutes = Math.floor(minutesNotTruncated);
        const seconds = Math.floor((minutesNotTruncated - minutes) * 60);

        return `${degrees}° ${minutes}' ${seconds}''`;
    };

    const formatCoordinates = (lat, lng) => {
        return `${toDegreesMinutesAndSeconds(lat)} ${lat >= 0 ? 'N' : 'S'}, ${toDegreesMinutesAndSeconds(lng)} ${lng >= 0 ? 'E' : 'W'}`;
    };

    return (
        <div style={{
            position: 'absolute',
            bottom: '30px',
            right: '80px',
            background: 'rgba(255,255,255,0.8)',
            padding: '5px',
            borderRadius: '5px',
            zIndex: 1000,
        }}>
            {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)} <br />
            {formatCoordinates(coordinates.lat, coordinates.lng)}
        </div>
    );
};

export default MouseCoordinates;
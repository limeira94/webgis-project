import L from 'leaflet';

export const leafletDefaultButtons = ({
    mapInstance,buttonsCreated,setButtonsCreated
}) => {
    if (mapInstance && !buttonsCreated) {

        L.Control.geocoder().addTo(mapInstance);
        
        L.control.browserPrint({ position: "topright" }).addTo(mapInstance);
        
        L.control.measure({
          position: "topright",
          primaryLengthUnit: 'meters',
          secondaryLengthUnit: undefined,
          primaryAreaUnit: 'sqmeters',
          secondaryAreaUnit: undefined
        }).addTo(mapInstance);
        // // {left: 10, top: 40}
        setButtonsCreated(true)
      }
}
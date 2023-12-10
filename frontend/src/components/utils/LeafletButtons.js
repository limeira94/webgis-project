import L from 'leaflet';

export const leafletDefaultButtons = ({
    mapInstance,buttonsCreated,setButtonsCreated
}) => {
    if (mapInstance && !buttonsCreated) {

        L.Control.geocoder({position:'bottomright'}).addTo(mapInstance);
        
        L.control.browserPrint({position:'bottomright'}).addTo(mapInstance);
        
        L.Control.Measure.include({
          _setCaptureMarkerIcon: function () {
            this._captureMarker.options.autoPanOnFocus = false;
            this._captureMarker.setIcon(
              L.divIcon({
                iconSize: this._map.getSize().multiplyBy(2)
              })
            );
          },
        });

        L.control.measure({
          position: 'bottomright',
          primaryLengthUnit: 'meters',
          secondaryLengthUnit: undefined,
          primaryAreaUnit: 'sqmeters',
          secondaryAreaUnit: undefined
        }).addTo(mapInstance);
        setButtonsCreated(true)
      }
}
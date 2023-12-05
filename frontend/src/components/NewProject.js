import React, { useState,useEffect } from 'react';
// import NavbarComponent from './include/Navbar';
// import { useSelector } from 'react-redux';
// import { 
//   useNavigate 
// } from 'react-router-dom';
// import { useDispatch } from 'react-redux';
import { MapComponent } from './utils/MapComponent';
import M from 'materialize-css';

function NewProject() {
    // const navigate = useNavigate();
    // const dispatch = useDispatch();
    // const { isAuthenticated, user, loading } = useSelector(state => state.user);

    const [rasters, setRasters] = useState([]);
    const [geojsons, setGeoJSONs] = useState([]); 
    
    useEffect(() => {
      M.AutoInit();
    }, []);


    return (
        <>
          {/* <NavbarComponent /> */}
          <MapComponent rasters={rasters} geojsons={geojsons}/>
        </>
      );
    }

export default NewProject;

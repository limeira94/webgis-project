import React from 'react';
import { useEffect } from 'react';
import 'materialize-css';
import Navbar from './include/Navbar';
import M from 'materialize-css';
import './Homepage.css'

const Homepage = () => {

    useEffect(()=>{
        var options = {}
        var elems = document.querySelectorAll('.sidenav');
        M.Sidenav.init(elems, options);
    },[])

    var url = process.env.PUBLIC_URL
    // var url = 'http://127.0.0.1:3000/'
    

    return (
    <>
        <Navbar/>
        <div className='section container center'>
            <img className="img-logo" src={url + "/logo.png"} alt="Web GIS Logo" />
        </div>
        
    </>
);
};

export default Homepage;

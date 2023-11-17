import React from 'react';
import { useEffect } from 'react';
import 'materialize-css';
import M from 'materialize-css';
import './Navbar.css'



const Navbar = () => {

    useEffect(()=>{
        var options = {}
        var elems = document.querySelectorAll('.sidenav');
        M.Sidenav.init(elems, options);
    },[])

    var url = process.env.PUBLIC_URL
    // var url = 'http://127.0.0.1:3000/'

    var link_itens = 
    <>
        <li><a href="/map">Go to Map</a></li>
    </>

    var auth_links = 
    <>
        <li><a href="/login">Login</a></li>  
    </>
    

    return (
    <>
        <nav className='nav-wg'>
            <div className="nav-wrapper">
            <a href="/#" className="brand-logo">
                <img className="img-logo" src={url + "/logo2.png"} alt="Web GIS Logo" height={60} />
            </a>
            <a href="#" data-target="mobile-demo" className="sidenav-trigger"><i className="material-icons">menu</i></a>
            <ul className="right hide-on-med-and-down">
                {link_itens}
                {auth_links}
            </ul>
            </div>
        </nav>

        <ul className="sidenav" id="mobile-demo">
            {link_itens}
            {auth_links}
        </ul>
    </>
);
};

export default Navbar;
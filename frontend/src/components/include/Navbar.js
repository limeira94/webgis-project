import React, { useState } from 'react';
import { useEffect } from 'react';
import 'materialize-css';
import M from 'materialize-css';
import './Navbar.css'
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/user';

var url = process.env.PUBLIC_URL

const languages = {
    "en":<img className='icon-nav-lan' src={url + "/united-states-of-america-flag-png-large.png"}/>,
    "pt-br":<img className='icon-nav-lan' src={url + "/brazil-flag-png-large.png"}/>,
}

const Navbar = () => {
    const dispatch = useDispatch();

    useEffect(()=>{
        var options = {}
        var elems = document.querySelectorAll('.sidenav');
        M.Sidenav.init(elems, options);

        var options = {
            coverTrigger: false,
            alignment:"bottom",
            constrainWidth:false
        }
        var elems = document.querySelectorAll('.dropdown-trigger');
        M.Dropdown.init(elems, options);

    },[])

	const { isAuthenticated } = useSelector(state => state.user);

    var link_itens =
    <>
        <li><a className='black-text' href="/about">About</a></li>
    </>

    var guest_links =
    <>  
        <li><a className='black-text' href="/map">Take a tour</a></li>
        <li><a className='black-text' href="/login">Login</a></li>
        <li><a className='black-text' href="/register">Register</a></li>
        {link_itens}
    </>


    var auth_links = 
    <>  
        <li><a className='black-text' href="/project">Projects</a></li>
        <li><a className='black-text' href="/dashboard">Profile</a></li>
        <li><a className='black-text' href='#!' onClick={() => dispatch(logout())}>Logout</a></li>
        {link_itens}
    </> 
    
    

    return (
    <>
        <nav className='nav-wg'>
            <div className="nav-wrapper">
            <a href="/#" className="brand-logo">
                <div className='logo-container black-text'>
                    <img className="img-logo" src={url + "/logo2.png"} alt="Web GIS Logo" height={60} />
                    <span className='logo-text'>WebGIS</span>
                </div>
            </a>
            <a href="#" data-target="mobile-demo" className="sidenav-trigger black-text">
                <i className="material-icons">menu</i>
            </a>
            <ul className="hide-on-med-and-down right">
                {isAuthenticated ? auth_links : guest_links}
            </ul>
            </div>
        </nav>

        <ul className="sidenav" id="mobile-demo">
            {isAuthenticated ? auth_links : guest_links}
        </ul>
    </>
);
};
export default Navbar;
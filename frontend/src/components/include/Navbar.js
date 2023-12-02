import React from 'react';
import { useEffect } from 'react';
import 'materialize-css';
import M from 'materialize-css';
import './Navbar.css'
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/user';


const Navbar = () => {

    const dispatch = useDispatch();

    useEffect(()=>{
        var options = {}
        var elems = document.querySelectorAll('.sidenav');
        M.Sidenav.init(elems, options);
    },[])
    const user = useSelector((state) => state.user);
	const { isAuthenticated } = useSelector(state => state.user);

    console.log(isAuthenticated)

    var url = process.env.PUBLIC_URL
    // var url = 'http://127.0.0.1:3000/'

    var link_itens = 
    <>
        <li><a href="/map">Go to Map</a></li>
        
        {/* <li><a href="/new-project">New Project</a></li> */}
    </>

    var guest_links = 
    <>
        <li><a href="/login">Login</a></li>
        <li><a href="/register">Register</a></li>
    </>

    var auth_links = 
    <>  
        <li><a href="/project">Projects</a></li>
        <li><a href="/dashboard">Dashboard</a></li>
        <li><a href='#!' onClick={() => dispatch(logout())}>Logout</a></li>
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
                {/* {auth_links} */}
                {isAuthenticated ? auth_links : guest_links}
            </ul>
            </div>
        </nav>

        <ul className="sidenav" id="mobile-demo">
            {link_itens}
            {/* {auth_links} */}
            {isAuthenticated ? auth_links : guest_links}
        </ul>
    </>
);
};

export default Navbar;
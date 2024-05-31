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
    const [ln,setLn] = useState("")
    const [language,setLanguage] = useState("")

    const handleChooseLanguage = (l) => {
        setLanguage(languages[l])
        setLn(l)
    }

    const languageSelector = <>
    <a className='dropdown-trigger black-text' href='#' data-target='dropdown2'>{language}</a>
    <ul id='dropdown2' className='dropdown-content language-selector'>
        <li><a href="#!" onClick={()=>handleChooseLanguage("en")}><img className='icon-drop' src={url + "/united-states-of-america-flag-png-large.png"}/></a></li>
        <li><a href="#!" onClick={()=>handleChooseLanguage("pt-br")}><img className='icon-drop' src={url + "/brazil-flag-png-large.png"}/></a></li>
    </ul>
    </>

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

        //TODO: 
        // Necessário buscar informação diretamente nos cookies e depois
        // adicionar as mudanças nos cookies também 
        if (language===""){
            setLanguage(languages["en"])
        }
        


    },[])
    // const user = useSelector((state) => state.user);
	const { isAuthenticated } = useSelector(state => state.user);

    

    var link_itens = 
    <>
        <li><a className='black-text' href="/aboutweb">About</a></li>
        <li><a className='black-text' href="/map">Go to Map</a></li>
    </>

    var guest_links = ()=>{
        // const loginText = (ln==="en") ? "Login" : "Acessar"
        // const registerText = (ln==="en") ? "Register" : "Cadastrar"
        const loginText = "Login" 
        const registerText = "Register"

        return (
    <>
        <li><a className='black-text' href="/login">{loginText}</a></li>
        <li><a className='black-text' href="/register">{registerText}</a></li>
    </>
        )
    }

    var auth_links = 
    <>  
        <li><a className='black-text' href="/project">Projects</a></li>
        <li><a className='black-text' href="/dashboard">Dashboard</a></li>
        <li><a className='black-text' href='#!' onClick={() => dispatch(logout())}>Logout</a></li>
    </>
    

    return (
    <>
        <nav className='nav-wg'>
            <div className="nav-wrapper">
            <a href="/#" className="brand-logo">
                <img className="img-logo" src={url + "/logo2.png"} alt="Web GIS Logo" height={60} />
                {/* <img className="img-logo" src={url + "/websig.png"} alt="Web GIS Logo" height={60} /> */}
                {/* <img className="img-logo" src={url + "/logomk.png"} alt="Web GIS Logo" height={65} /> */}
            </a>
            <a href="#" data-target="mobile-demo" className="sidenav-trigger black-text">
                <i className="material-icons">menu</i>
            </a>
            <ul className="hide-on-med-and-down right">
                {link_itens}
                {isAuthenticated ? auth_links : guest_links()}
            </ul>
            {/* {languageSelector} */}
            </div>
        </nav>

        <ul className="sidenav" id="mobile-demo">
            {link_itens}
            {isAuthenticated ? auth_links : guest_links()}
        </ul>
    </>
);
};
export default Navbar;
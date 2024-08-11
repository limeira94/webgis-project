import React, { useState } from 'react';
import { useEffect } from 'react';
import 'materialize-css';
import M from 'materialize-css';
import './Navbar.css'
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/user';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n/i18n';

var url = process.env.PUBLIC_URL

const languages = {
    "en-US": <img className='icon-nav-lan' src={url + "/estados-unidos.png"} />,
    "pt-BR": <img className='icon-nav-lan' src={url + "/brasil.png"} />,
}


const Navbar = () => {
    const dispatch = useDispatch();

    const { t } = useTranslation()

    useEffect(() => {
        var options = {}
        var elems = document.querySelectorAll('.sidenav');
        M.Sidenav.init(elems, options);

        var options = {
            coverTrigger: false,
            alignment: "bottom",
            constrainWidth: false
        }
        var elems = document.querySelectorAll('.dropdown-trigger');
        M.Dropdown.init(elems, options);

    }, [])

    const { isAuthenticated } = useSelector(state => state.user);

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    var Language =
        <>
            <div className="center-content">
                <li><a className='black-text' onClick={() => changeLanguage('en-US')}>{languages["en-US"]}</a></li>
                <li><a className='black-text' onClick={() => changeLanguage('pt-BR')}>{languages["pt-BR"]}</a></li>
            </div>

        </>


    var link_itens =
        <>
            <li><a className='black-text' href="/about">{t('about')}</a></li>
        </>

    var guest_links =
        <>
            <li><a className='black-text' href="/map">{t('take_tour')}</a></li>
            <li><a className='black-text' href="/login">{t('login')}</a></li>
            <li><a className='black-text' href="/register">{t('register')}</a></li>
            {link_itens}
            {Language}
        </>


    var auth_links =
        <>
            <li><a className='black-text' href="/project">{t('projects')}</a></li>
            <li><a className='black-text' href="/dashboard">{t('profile')}</a></li>
            <li><a className='black-text' href='#!' onClick={() => dispatch(logout())}>{t('sign_out')}</a></li>
            {link_itens}
            {Language}
        </>



    return (
        <>
            <nav className='nav-wg'>
                <div className="nav-wrapper">
                    <a href="/#" className="brand-logo">
                        <div className='logo-container black-text'>
                            <img className="img-logo" src={url + "/logo-world.svg"} alt="Web GIS Logo" style={{ height: '50px', marginLeft: '20px' }} />
                            <span className='logo-text' style={{ fontSize: '25px' }}>WebGIS Project</span>
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
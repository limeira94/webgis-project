import React, { useState } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Menu, MenuItem, Drawer, List, ListItem, ListItemText, Hidden } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/user';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n/i18n';
import './Navbar.css';

const url = process.env.PUBLIC_URL;

const languages = {
    "en-US": <img className='icon-nav-lan' src={url + "/estados-unidos.png"} alt="US Flag" />,
    "pt-BR": <img className='icon-nav-lan' src={url + "/brasil.png"} alt="Brazil Flag" />,
};

const Navbar = () => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const { isAuthenticated } = useSelector(state => state.user);

    const [anchorEl, setAnchorEl] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const toggleDrawer = (open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        setDrawerOpen(open);
    };

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    const LanguageMenu = (
        <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
        >
            <MenuItem onClick={() => { changeLanguage('en-US'); handleClose(); }}>{languages["en-US"]}</MenuItem>
            <MenuItem onClick={() => { changeLanguage('pt-BR'); handleClose(); }}>{languages["pt-BR"]}</MenuItem>
        </Menu>
    );

    const authLinks = (
        <>
            <MenuItem style={{ color: 'black' }} onClick={() => { window.location.href = '/project'; }}>{t('projects')}</MenuItem>
            <MenuItem style={{ color: 'black' }} onClick={() => { window.location.href = '/dashboard'; }}>{t('profile')}</MenuItem>
            <MenuItem style={{ color: 'black' }} onClick={() => { dispatch(logout()); }}>{t('sign_out')}</MenuItem>
        </>
    );

    const guestLinks = (
        <>
            <MenuItem style={{ color: 'black' }} onClick={() => { window.location.href = '/map'; }}>{t('take_tour')}</MenuItem>
            <MenuItem style={{ color: 'black' }} onClick={() => { window.location.href = '/login'; }}>{t('login')}</MenuItem>
            <MenuItem style={{ color: 'black' }} onClick={() => { window.location.href = '/register'; }}>{t('register')}</MenuItem>
        </>
    );

    const drawerList = (
        <List>
            {isAuthenticated ? authLinks : guestLinks}
            <ListItem onClick={handleMenu}>
                <ListItemText primary={t('language')} />
            </ListItem>
            {LanguageMenu}
        </List>
    );

    return (
        <>
            <AppBar position="static" className='nav-wg'>
                <Toolbar style={{ backgroundColor: 'white' }}>
                    <a href="/#" className="brand-logo" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                        <img className="img-logo" src={url + "/logo-world.svg"} alt="Web GIS Logo" style={{ height: '50px', marginLeft: '20px' }} />
                        <Typography variant="h6" className='logo-text' style={{ marginLeft: '10px', fontSize: '25px', color: 'black' }}>
                            WebGIS Project
                        </Typography>
                    </a>
                    <Hidden smDown>
                        <div style={{ marginLeft: 'auto', display: 'flex' }}>
                            {isAuthenticated ? authLinks : guestLinks}
                            <IconButton
                                edge="end"
                                color="inherit"
                                aria-label="language"
                                onClick={handleMenu}
                                style={{ marginLeft: 'auto' }}
                            >
                                {languages[i18n.language]}
                            </IconButton>
                        </div>
                    </Hidden>
                    <Hidden smUp>
                        <IconButton
                            edge="end"
                            color="inherit"
                            aria-label="menu"
                            onClick={toggleDrawer(true)}
                            style={{ marginLeft: 'auto' }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
                            {drawerList}
                        </Drawer>
                    </Hidden>
                </Toolbar>
            </AppBar>
            {LanguageMenu}
        </>
    );
};

export default Navbar;

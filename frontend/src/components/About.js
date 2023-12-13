

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import 'materialize-css';
import Navbar from './include/Navbar';
import Footer from './include/Footer';
import M from 'materialize-css';
import axios from 'axios'
import Project from './Project';
import './Homepage.css'

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/'

const About = () => {

    return (
    <>
        <Navbar/>
        <div className='container'>
            <h1>Developers</h1>
            <p> Felipe 1</p>
            <p> Felipe 2</p>

        </div>
        <Footer/>
    </>
);
};

export default About;

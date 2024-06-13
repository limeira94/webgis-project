import React, { useState, useEffect, useRef, Text } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import 'materialize-css';
import Navbar from './include/Navbar';
import Footer from './include/Footer';
import M from 'materialize-css';
import axios from 'axios'
import { getProjects } from './utils/ProjectFunctions';
import { Navigate } from 'react-router-dom';
// import Project from './Project';
import '../styles/Homepage.css';
import iconFull from '../assets/icone-acesso-completo.svg';
import iconSimple from '../assets/icone-acesso-simplificado.svg';


const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/'

const Homepage = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const { isAuthenticated, user, loading } = useSelector(state => state.user);

    useEffect(() => {
        getProjects(setProjects);
    }, []);

    useEffect(() => {
        var options = {}
        var elems = document.querySelectorAll('.sidenav');
        M.Sidenav.init(elems, options);
    }, [])

    var url = process.env.PUBLIC_URL

    const handleAddProject = (projectId) => {
        navigate(`/project/${projectId}`);
    };

    const topText = `
This project is a open-source platform to visualize and analyse geographic data.
Below you can find information about how to use this website.
    `
    const listItens = [
        { "type": "simple", "text": "Add vector layers (GeoJSON)" },
        { "type": "simple", "text": "Edit layer styles" },
        { "type": "simple", "text": "Access multiple basemaps" },
        { "type": "simple", "text": "Area Measurement" },
        { "type": "simple", "text": "Print maps" },
        { "type": "complex", "text": "Add raster layers" },
        { "type": "complex", "text": "Edit layers" },
        { "type": "complex", "text": "Create and edit Projects" },
    ]

    const simplifiedText = () => {
        return (
            <>
                {listItens.map((item) => (
                    <p>
                        <i className={`material-icons ${item["type"] === "simple" ? "red" : "grey"}-text`}>check_circle</i> {item["text"]}
                    </p>
                ))}
            </>
        );
    };

    const fullText = () => {
        return (
            <>
                {listItens.map((item) => (
                    <p>
                        <i className={"material-icons red-text"}>check_circle</i> {item["text"]}
                    </p>
                ))}
            </>
        );
    };
    const textStyle = {
        whiteSpace: 'pre-line'
    }
    console.log(projects)
    return (
        <>
            <Navbar />
            <div className='homepage-style'>
                <div className='section container'>
                    <div>
                        <h4 className='center'>Welcome to WebGIS</h4>
                        <p className='center' style={textStyle}>{topText}</p>
                    </div>
                    <div class="row">
                        <div class="col s12 m6">
                            <div class="card-panel white card-style">
                                <div className="header-container center">
                                    <img src={iconSimple} alt="custom icon" style={{ marginRight: '10px' }} />
                                    <h5>Simplified</h5>
                                </div>
                                <div className='container'>
                                    <span class="black-text">
                                        {simplifiedText()}
                                    </span>
                                </div>
                                <p className='center'><a href="/map" className='btn btn-small red center'>Take a tour</a></p>
                                <p className='note-style center'>Note: The data is temporary here, it will be deleted after reloading the page. All data will be lost.</p>
                            </div>
                        </div>
                        <div class="col s12 m6">
                            <div class="card-panel white card-style">
                                <div className="header-container center">
                                    <img src={iconFull} alt="custom icon" style={{ marginRight: '10px' }} />
                                    <h5>Full</h5>
                                </div>
                                <div className='container'>
                                    <span class="black-text">
                                        {fullText()}
                                    </span>
                                </div>
                                <p className='center'><a href="/register" className='btn btn-small red'>Register</a></p>
                                <p className='note-style center'>Note: After registering, you will be able to create projects and save your data in the database.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="custom-shape-divider-top-1701366195 card-section">
                    <div className='container section'>
                        <div className="row">
                            <h4 className='center'>My projects</h4>
                            {projects.map((project, index) => (
                                <div key={index} className="col s12 m3">
                                    <div className="card">
                                        <div className="card-image">
                                            {project.thumbnail ? (
                                                <img src={`${project.thumbnail}`} alt={`Project ${index + 1}`} />
                                            ) : (
                                                <img src={url + "/thumbnail_map.png"} alt={`Project ${index + 1}`} />
                                            )}
                                            <span className="card-title">{project.name}</span>
                                            <a onClick={() => handleAddProject(project.id)} className="btn-floating halfway-fab waves-effect waves-light red"><i className="material-icons">add</i></a>
                                        </div>
                                        <div className="card-content">
                                            <p>{project.updated_at}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Homepage;

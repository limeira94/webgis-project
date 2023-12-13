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

const Homepage = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);

    useEffect(()=>{
        
        // TODO
        // remove this function and use this one instead:
        // import { getProjects } from './utils/get_infos';

        const getProjects = async () => {
            try {
              const response = await axios.get(`${API_URL}api/main/projects/`);
              setProjects(response.data)
            } catch (error) {
              console.error('Error fetching GeoJSON data:', error);
            }
          }
        getProjects();
    }, []);

    useEffect(()=>{
        var options = {}
        var elems = document.querySelectorAll('.sidenav');
        M.Sidenav.init(elems, options);
    },[])

    var url = process.env.PUBLIC_URL
    // var url = 'http://127.0.0.1:3000/'
    console.log(projects)

    const handleAddProject = (projectId) => {
        navigate(`/project/${projectId}`);
      };
    

    return (
    <>
        <Navbar/>
        <div className='section container center'>
            <img className="img-logo" src={url + "/logo.png"} alt="Web GIS Logo" />
        </div>
        <div className='container'>
        <h1>Description</h1>    
            <p>Backend --> python Django, Flask, FastAPI</p>
            <p>Frontend --> React </p>
            <p>Deploy -> pythonanywhere, Ec2, Heroku</p>
            <p>Geospatial database -> Postgis</p>
            <p>Maintenance</p>
        </div> 
        <div className="custom-shape-divider-top-1701366195 card-section">
            <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" className="shape-fill"></path>
                <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" className="shape-fill"></path>
                <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" className="shape-fill"></path>
            </svg>
            
            <div className='container section'>
                <div className="row">
                    {projects.map((project, index) => (
                        <div key={index} className="col s12 m3">
                            <div className="card">
                                <div className="card-image">
                                {project.thumbnail ? (
                                    <img src={`${project.thumbnail}`} alt={`Project ${index + 1}`} />
                                    ) : (
                                    <img src={url + "/thumbnail_map.png"}  alt={`Project ${index + 1}`} />
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
        <Footer/>
    </>
);
};

export default Homepage;

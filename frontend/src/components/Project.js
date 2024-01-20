import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
// import { getProjects } from './utils/get_infos';
import { useParams } from 'react-router-dom';
import {
    useNavigate
} from 'react-router-dom';
import { useDispatch } from 'react-redux';
import M from 'materialize-css';
import axios from 'axios'
import Cookies from 'js-cookie';

import { MapComponent } from './utils/MapComponent';

import { parseGeoJSON } from './utils/MapUtils';


import "./Project.css"

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/'

const Map = ({ project }) => {
    const [rasters, setRasters] = useState([]);
    const [geojsons, setGeoJSONs] = useState([]);

    useEffect(() => {
        M.AutoInit();
    }, []);

    useEffect(() => {
        if (project) {
            setGeoJSONs(parseGeoJSON(project.geojson))
            setRasters(project.raster)
        }
    }, [])
    useEffect(() => {
        var elems = document.querySelectorAll('.fixed-action-btn');
        var instances = M.FloatingActionButton.init(elems, {
            hoverEnabled: false
        });
    }, []);

    return (
        <>
            <MapComponent
                rasters={rasters}
                geojsons={geojsons}
                setRasters={setRasters}
                setGeoJSONs={setGeoJSONs}
                projectid={project.id}
                savetomemory={false}
            />
        </>
    )
}

function Project() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { isAuthenticated, user, loading } = useSelector(state => state.user);
    const [project, setProject] = useState(null)
    const [projects, setProjects] = useState([]);
    const [projectTextInput, setProjectTextInput] = useState(false);
    const [inputValue, setInputValue] = useState("");

    const { project_id } = useParams();

    useEffect(() => {
        M.AutoInit();
        getProjects();
    }, []);


    useEffect(() => {
        console.log(projects)
        if (project_id && projects && project === null) {
            const selectedProject = projects.find(project => project.id === parseInt(project_id, 10));
            if (selectedProject) {
                setProject(selectedProject);
            }
            else {
                navigate(`/project`);
            }
        }
    }, [project_id, project]);

    const handleNewProject = async () => {
        try {
            const accessToken = Cookies.get('access_token');
            const response = await axios.post(`${API_URL}api/main/projects/`,
                {
                    name: inputValue,
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });

            const modalInstance = M.Modal.getInstance(document.getElementById('modal1'));
            modalInstance.close();

            //   setProjects(null);
            await getProjects();

            const selectedProjectId = parseInt(response.data.id, 10);
            navigate(`/project/${selectedProjectId}`);
        } catch (error) {
            console.error('Error fetching GeoJSON data:', error);
        }

    }

    const getProjects = async () => {
        try {
            const accessToken = Cookies.get('access_token');
            const response = await axios.get(`${API_URL}api/main/projects/`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            setProjects(response.data)
            console.log("DADOS GETPROJECT", response.data)
        } catch (error) {
            console.error('Error fetching GeoJSON data:', error);
        }
    }

    var url = process.env.PUBLIC_URL


    const handleChooseOption = (id) => {
        const selectedProjectId = parseInt(id, 10);
        navigate(`/project/${selectedProjectId}`);
        const modalInstance = M.Modal.getInstance(document.getElementById('modal1'));
        modalInstance.close();
    }

    if (!isAuthenticated && !loading && user === null)
        return <Navigate to='/login' />;

    return (
        <>

            {!project ?
                <a className="waves-effect waves-light btn modal-trigger choose-button" href="#modal1">Choose your project</a> :
                <a className="waves-effect waves-light btn modal-trigger change-button" href="/project">Close project</a>
            }



            <div id="modal1" className="modal modal-fixed-footer">
                <div className="modal-content">
                    <h4 className='center'>Choose your project</h4>
                    <div>
                        <div className="row">
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
                                            <a
                                                // onClick={() => handleChooseOption(index)}
                                                onClick={() => handleChooseOption(project.id)}
                                                className="btn-floating halfway-fab waves-effect waves-light red"><i className="material-icons">open_in_browser</i></a>
                                        </div>
                                        <div className="card-content">
                                            <p><b>Last time updated:</b></p>
                                            <p>{project.updated_at}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>



                </div>
                <div className="modal-footer">
                    {projectTextInput ? (
                        <div className="input-group">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Enter project text"
                            />
                            <button onClick={handleNewProject} className="waves-effect waves-green btn-flat">
                                Submit
                            </button>
                        </div>
                    ) : (
                        <a
                            // href="#!"
                            onClick={() => setProjectTextInput((prevValue) => !prevValue)}
                            className="waves-effect waves-green btn-flat left"
                        >
                            New Project
                        </a>
                    )}


                    <a href="/" className="modal-close waves-effect waves-green btn-flat">Homepage</a>
                    <a className="modal-close waves-effect waves-green btn-flat">Close</a>
                </div>

            </div>

            {project ? <Map project={project} /> : null}


        </>
    );
}

export default Project;


import React, { 
    useState, 
    useEffect, 
} from 'react';
import { 
    getProjects,
    handleNewProject,
    handleDeleteOption,
    handleChooseOption,
    setData
} from './utils/ProjectFunctions';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import {
    useNavigate
} from 'react-router-dom';
import M from 'materialize-css';
import { MapComponent } from './utils/MapComponent';

import "../styles/Project.css"
import Navbar from './include/Navbar';
import { loadingPage } from './utils/Loading'; 

const Map = ({ project, rasters, setRasters,vectors,setVectors}) => {

    
    return ( //ERROR HERE:Uncaught (in promise) Error: A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received
        <>
            <MapComponent
                rasters={rasters}
                setRasters={setRasters}
                vectors={vectors}
                setVectors={setVectors}
                projectid={project.id}
                project={project}
                savetomemory={false}
            />
        </>
    )
}

function Project() {
    const navigate = useNavigate();

    const { isAuthenticated, user, loading } = useSelector(state => state.user);
    const [project, setProject] = useState(null)
    const [projects, setProjects] = useState([]);
    const [projectTextInput, setProjectTextInput] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [rasters, setRasters] = useState([]);
    const [vectors, setVectors] = useState([]);
    const [isLoading,setIsLoading] = useState(false)

    const { project_id } = useParams();

    useEffect(() => {
        M.AutoInit();
        const fetchData = async () => {
            if (project_id && projects && project === null) {
                setData(setProject, setRasters, project_id, projects, navigate,setVectors);
            } else {
                await getProjects(setProjects);
            }
        };
        setIsLoading(true);
        fetchData();
        setIsLoading(false);
    }, [project_id, project]);

    var url = process.env.PUBLIC_URL

    if (!isAuthenticated && !loading && user === null)
        return <Navigate to='/login' />;

    
    const chooseProject = <>
    <Navbar/>
    <h3 className='center'>Choose your project</h3>
    <div id="chooseProject">
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
                                onClick={() => handleChooseOption(project.id,navigate)}
                                className="btn-floating halfway-fab waves-effect waves-light red"><i className="material-icons">open_in_browser</i></a>
                            <a
                                onClick={() => handleDeleteOption(project.id,setProjects)}
                                className="btn-floating halfway-fab waves-effect waves-light red left"><i className="material-icons">delete</i></a>
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
    <div className='center'>
        {projectTextInput ? (
            <div className="input-group text-input-adjust">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Enter project text"
                />
                <button onClick={
                    ()=>{handleNewProject(setProjects,inputValue,navigate)}
                    } className="waves-effect waves-green btn-flat">
                    Create
                </button>
                <button 
                    onClick={() => setProjectTextInput((prevValue) => !prevValue)}
                    className="waves-effect waves-green btn-flat"
                    >
                    Cancel
                </button>
            </div>
        ) : (
            <a onClick={() => setProjectTextInput((prevValue) => !prevValue)} className="waves-effect waves-green btn-flat center"><i className="material-icons">create_new_folder</i> New Project</a>
        )}
    </div>
</>
    
    
    return (
    <>
        {isLoading ? loadingPage() : project ? (
                <Map 
                    project={project}
                    rasters={rasters}
                    setRasters={setRasters}
                    vectors={vectors}
                    setVectors={setVectors}
                />
            ) : chooseProject}
    </>
);
}

export default Project;
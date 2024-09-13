import React, {
    useState,
    useEffect,
} from 'react';
import {
    getProjects,
    handleNewProject,
    handleDeleteOption,
    handleChooseOption,
    setData,
    setSharedData
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
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const Map = ({ project, rasters, setRasters, vectors, setVectors, isSharedView }) => {
    return (
        <>
            <MapComponent
                rasters={rasters}
                setRasters={setRasters}
                vectors={vectors}
                setVectors={setVectors}
                projectid={project.id}
                project={project}
                savetomemory={false}
                isSharedView={isSharedView}
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
    const [isLoading, setIsLoading] = useState(false)

    const { project_id, token } = useParams();

    useEffect(() => {
        const fetchData = async () => {
          setIsLoading(true);
      
          try {
            if (token) {
              // Se houver token na URL, busca o projeto compartilhado
              const response = await axios.get(`${API_URL}/api/main/share/${token}/`);
              console.log('Dados do projeto compartilhado:', response.data);
              
              // Verifique se o projeto já foi carregado para evitar loop infinito
              if (!project) {
                console.log('Carregando projeto compartilhado...1111111');
                console.log('response.data:', response.data);
      
                // Use a nova função setSharedData para manipular os dados
                await setSharedData(
                  response.data, 
                  setProject, 
                  setRasters, 
                  setVectors
                );
              }
            } else if (project_id && project === null) {
                console.log('Carregando projeto compartilhado...2222222');
              // Se não houver token, usa o project_id normal
              setData(setProject, setRasters, project_id, projects, navigate, setVectors);
            } else if (projects.length === 0) {
                console.log('Carregando projeto compartilhado...33333333');
              await getProjects(setProjects);
            }
          } catch (error) {
            console.error('Erro ao carregar o projeto compartilhado:', error);
          }
      
          setIsLoading(false);  // Garanta que o loading seja encerrado
        };
      
        // Chama a função de fetch apenas se o projeto não estiver carregado
        if (!project) {
          fetchData();
        }
      }, [project_id, token, project]);  // Assegure-se de que as dependências estão corretas
      

    var url = process.env.PUBLIC_URL

    if (!isAuthenticated && !loading && user === null && !token) {
        return <Navigate to='/login' />;
    }


    const chooseProject = <>
        <Navbar />
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
                                    onClick={() => handleChooseOption(project.id, navigate)}
                                    className="btn-floating halfway-fab waves-effect waves-light red"><i className="material-icons">open_in_browser</i></a>
                                <a
                                    onClick={() => handleDeleteOption(project.id, setProjects)}
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
                        () => { handleNewProject(setProjects, inputValue, navigate) }
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
                    isSharedView={!!token}
                />
            ) : chooseProject}
        </>
    );
}

export default Project;
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import 'materialize-css';
import Navbar from './include/Navbar';
import Footer from './include/Footer';
import M from 'materialize-css';
import axios from 'axios'
import { Navigate } from 'react-router-dom';
import Project from './Project';
import '../styles/Homepage.css'

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/'

const Homepage = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const { isAuthenticated, user, loading } = useSelector(state => state.user);

    useEffect(() => {

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

    useEffect(() => {
        var options = {}
        var elems = document.querySelectorAll('.sidenav');
        M.Sidenav.init(elems, options);
    }, [])

    var url = process.env.PUBLIC_URL
    // var url = 'http://127.0.0.1:3000/'

    const handleAddProject = (projectId) => {
        navigate(`/project/${projectId}`);
    };

    if (!isAuthenticated && !loading && user === null){
        return <Navigate to='/login' />;
    }

    if (isAuthenticated) {
        return <Navigate to='/project' />
    }


    return (
        <>
            <Navbar />
            <div className='section container center'>
                {/* <img className="img-logo" src={url + "/logo.png"} alt="Web GIS Logo" /> */}
                <img className="img-logo" src={url + "/websig.png"} alt="Web GIS Logo" />
            </div>

            <div className="container">
                <div className="row">
                    <div className="col s12">
                        <div className="card">
                            <div className="card-content">
                                <span className="card-title">Bem-vindo ao WebGIS versão 1.0.0</span>
                                <p>WebGIS é uma plataforma de código aberto para visualização e análise de dados geográficos.</p>
                                <h2>Acesso simplificado:</h2>
                                <p>Acesse a plataforma sem a necessidade de registro.</p>
                                <ul>
                                    <strong>Funcionalidades para Visitantes:</strong>
                                    <li>• Adicione dados vetoriais (GeoJSON).</li>
                                    <li>• Explore uma variedade de mapas base (Basemap Gallery).</li>
                                    <li>• Personalize a visualização de dados geográficos: altere cores, opacidade e contornos; use o recurso 'zoom to Layer' para focar em dados específicos.</li>
                                    <li>• Aproveite ferramentas como tela cheia, medição de área, impressão de mapas e controle de zoom.</li>
                                </ul>
                                <p className="note">Nota: Os dados são temporários e serão perdidos após atualizar a página.</p>
                                <h2>Acesso completo:</h2>
                                <p>Desbloqueie recursos avançados a partir de um usuário registrado.</p>
                                <ul>
                                    <strong>Funcionalidades Avançadas:</strong>
                                    <li>• Adicione dados raster.</li>
                                    <li>• Gerencie seus dados: exclua tanto dados raster quanto vetoriais.</li>
                                    <li>• Crie e gerencie projetos: Organize seu trabalho/pesquisa através de projetos.</li>
                                </ul>
                                <p className="note">Nota: Seus dados são salvos no nosso banco de dados, evite adicionar informações sensíveis.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <section className='section'>
                <div className='container'>
                    <div className='row'>
                        <div className='col s12 m6'>
                            <div className='card'>
                                <div className='card-content'>
                                    <div className='card-image'>
                                    <span className="material-icons">memory</span>
                                    </div>
                                    <span className='card-title'>Backend</span>
                                    <p>Para desenvolvimento do backend é possível utilizar a linguagem python com os frameworks Django, Flask e FastAPI.</p>
                                </div>
                            </div>
                        </div>
                        <div className='col s12 m6'>
                            <div className='card'>
                                <div className='card-content'>
                                    <div className='card-image'>
                                    <span className="material-icons">desktop_windows</span>
                                    </div>
                                    <span className='card-title'>Frontend</span>
                                    <p>Para construção do frontend é possível utilizar a linguagem javascript com o React e bibliotecas como o OpenLayer e o Leaflet</p>
                                </div>
                            </div>
                        </div>
                        <div className='col s12 m6'>
                            <div className='card'>
                                <div className='card-content'>
                                    <div className='card-image'>
                                    <span className='material-icons'>cloud_upload</span>
                                    </div>
                                    <span className='card-title'>Deploy</span>
                                    <p>O deploy da aplicação pode ser feito nas plataformas Heroku, AWS (EC2), PythonAnywhere entre outras.</p>
                                </div>
                            </div>
                        </div>
                        <div className='col s12 m6'>
                            <div className='card'>
                                <div className='card-content'>
                                    <div className='card-image'>
                                    <span className='material-icons'>build</span>
                                    </div>
                                    <span className='card-title'>Manutenção</span>
                                    <p>Realizamos a manutenção da aplicação, desde correção de problemas no sistema até criação de novas funcionalidades</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="custom-shape-divider-top-1701366195 card-section">

                <div className='container section'>
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
            <Footer />
        </>
    );
};

export default Homepage;
